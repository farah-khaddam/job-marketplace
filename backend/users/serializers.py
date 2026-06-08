
from rest_framework import serializers
from .models import JobSeeker, Company, EmailVerification, GOVERNORATE_CHOICES, COMPANY_TYPE_CHOICES
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from .utils import send_otp_email
from dj_rest_auth.serializers import PasswordResetSerializer
import re
import dns.resolver
import dns.exception

CustomUser = get_user_model()


# =========================
# VALIDATORS
# =========================

def validate_password(value):
    if not value or not str(value).strip():
        raise serializers.ValidationError("password_required")
    if len(value) < 8:
        raise serializers.ValidationError("password_too_short")
    return value

def validate_email_format(value):
    if not value or not value.strip():
        raise serializers.ValidationError("email_required")

    value = value.strip().lower()

    email_regex = r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$'
    if not re.match(email_regex, value):
        raise serializers.ValidationError("email_invalid_format")

    domain = value.split('@')[1]
    parts = domain.split('.')

    if len(parts) < 2:
        raise serializers.ValidationError("email_invalid_domain")

    tld = parts[-1]
    if len(tld) < 2:
        raise serializers.ValidationError("email_invalid_tld")

    try:
        dns.resolver.resolve(domain, 'MX')
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        raise serializers.ValidationError("email_domain_not_found")
    except dns.exception.Timeout:
        raise serializers.ValidationError("email_domain_check_timeout")
    except Exception:
        raise serializers.ValidationError("email_domain_unreachable")

    return value

def validate_phone_number_value(value):
    if not value or not value.strip():
        raise serializers.ValidationError("phone_number_required")

    value = str(value).strip()

    if not value.startswith('+'):
        raise serializers.ValidationError("phone_number_missing_country_code (e.g. +201234567890)")

    digits_only = value[1:]  

    if not digits_only.isdigit():
        raise serializers.ValidationError("phone_number_digits_only")

    if len(digits_only) < 10:
        raise serializers.ValidationError("phone_number_too_short")

    if len(digits_only) > 12:
        raise serializers.ValidationError("phone_number_too_long")

    return value



def validate_email_not_registered(value, user_type='job_seeker'):
    """
    Validate email is not registered in any user type.
    Enforces email uniqueness across JobSeeker, Company, and active EmailVerification records.
    """
    value = value.lower().strip()

    # Check if email exists in CustomUser
    if CustomUser.objects.filter(email__iexact=value).exists():
        raise serializers.ValidationError("email_already_registered")



    if JobSeeker.objects.filter(email__iexact=value).exists():
        raise serializers.ValidationError("email_already_registered")

    if user_type == 'company':
        if Company.objects.filter(email__iexact=value).exclude(approval_status='rejected').exists():
            raise serializers.ValidationError("email_already_registered")
    else:
        if Company.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("email_already_registered")

    existing_verification = EmailVerification.objects.filter(email__iexact=value, expires_at__gt=timezone.now()).first()
    if existing_verification:
        payload = existing_verification.payload or {}
        user_type = getattr(existing_verification, 'user_type', None) or 'job_seeker'
        if user_type == 'company' and payload.get('approval_status') == 'pending_admin_approval':
            raise serializers.ValidationError("company_pending_approval")
        raise serializers.ValidationError("email_pending_verification")

    return value


# =========================
# PASSWORD RESET (required by settings.py)
# =========================

class CustomPasswordResetSerializer(PasswordResetSerializer):
    pass


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return validate_email_format(value)


class PasswordResetTokenSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        return validate_password(value)

    def validate(self, data):
        if data.get('new_password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                'confirm_password': 'passwords_not_match'
            })
        return data


# =========================
# EMAIL CHECK API
# =========================

class CheckEmailSerializer(serializers.Serializer):
    email = serializers.CharField()

    def validate_email(self, value):
        value = validate_email_format(value)
        return value.lower().strip()

    def validate(self, data):
     email = data['email']
     return {
        "email": email,
        "exists": CustomUser.objects.filter(email=email).exists()
    }

# =========================
# JOB SEEKER OTP REGISTER
# (validation only — view handles saving)
# =========================

class JobSeekerOTPRegisterSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField()

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("email_required")
        value = validate_email_format(value)
        return validate_email_not_registered(value)

    def validate_password(self, value):
       return validate_password(value)
    

    def validate_phone_number(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("phone_number_required")
        return validate_phone_number_value(value)

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("full_name_required")
        if not re.fullmatch(r'[A-Za-z\u0600-\u06FF\s]+', value):
            raise serializers.ValidationError("full_name_letters_only")
        if value.replace(" ", "") == "":
            raise serializers.ValidationError("full_name_required")
        return value

    def validate(self, data):
        if not data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'password_confirm_required'
            })
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'passwords_not_match'
            })
        return data
# =========================
# VERIFY OTP
# =========================

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate_email(self, value):
        return value.lower().strip()

    def validate_otp(self, value):
     if not value.isdigit():
        raise serializers.ValidationError("otp_must_be_numeric")
     return value


# =========================
# JOB SEEKER REGISTER (full — saves via create())
# =========================

class JobSeekerRegisterSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField()

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("email_required")
        value = validate_email_format(value)
        value = value.lower().strip()
        return validate_email_not_registered(value)

    def validate_password(self, value):
        return validate_password(value)

    def validate_phone_number(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("phone_number_required")
        return validate_phone_number_value(value)

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("full_name_required")
        if not re.fullmatch(r'[A-Za-z\u0600-\u06FF\s]+', value):
            raise serializers.ValidationError("full_name_letters_only")
        if value.replace(" ", "") == "":
            raise serializers.ValidationError("full_name_required")
        return value

    def validate(self, data):
        if not data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'password_confirm_required'
            })
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'passwords_not_match'
            })
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')

        payload = {
            'role': 'job_seeker',
            'password_hash': make_password(validated_data['password']),
            'full_name': validated_data['full_name'],
            'phone_number': validated_data['phone_number'],
        }

        ev, _ = EmailVerification.objects.update_or_create(
            email=validated_data['email'].lower().strip(),
            defaults={
                'otp_hash': '',
                'payload': payload,
                'expires_at': timezone.now() + timedelta(minutes=10),
            }
        )

        email_sent = send_otp_email(
            pending_registration=ev,
            request=self.context.get('request')
        )

        if not email_sent:
            ev.delete()
            raise serializers.ValidationError({'email': 'email_send_failed'})

        return ev


# =========================
# JOB SEEKER LOGIN
# =========================

class JobSeekerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


# =========================
# JOB SEEKER DETAIL
# =========================

class JobSeekerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSeeker
        fields = ['id', 'full_name', 'email', 'phone_number']


# =========================
# COMPANY REGISTER
# =========================

class CompanyRegisterSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    company_name = serializers.CharField(max_length=200)
    phone_number = serializers.CharField()
    governorate = serializers.ChoiceField(choices=GOVERNORATE_CHOICES)
    company_type = serializers.ChoiceField(choices=COMPANY_TYPE_CHOICES)
    website_url = serializers.URLField(required=False, allow_blank=True)
    description = serializers.CharField()

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("email_required")
        value = validate_email_format(value)
        value = value.lower().strip()
        value = validate_email_not_registered(value, user_type='company')
        return value

    def validate_password(self, value):
       return validate_password(value)
    
    
    def validate_phone_number(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("phone_number_required")
        return validate_phone_number_value(value)

    def validate_company_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("company_name_required")
        if not re.fullmatch(r'[A-Za-z\u0600-\u06FF\s]+', value):
            raise serializers.ValidationError("company_name_letters_only")
        return value

    def validate_description(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("company_description_required")
        if len(value) < 20:
            raise serializers.ValidationError("company_description_too_short")
        return value

    def validate_governorate(self, value):
        if not value:
            raise serializers.ValidationError("governorate_required")
        valid_values = [v for v, _ in GOVERNORATE_CHOICES]
        if value not in valid_values:
            raise serializers.ValidationError("governorate_invalid")
        return value

    def validate_company_type(self, value):
        if not value:
            raise serializers.ValidationError("company_type_required")
        valid_values = [v for v, _ in COMPANY_TYPE_CHOICES]
        if value not in valid_values:
            raise serializers.ValidationError("company_type_invalid")
        return value

    def validate_website_url(self, value):
        if not value or not value.strip():
            return ""
        value = value.strip()
        url_regex = r'^(https?://)[\w\-]+(\.[\w\-]+)+(/[\w\-./?%&=]*)?$'
        if not re.match(url_regex, value):
            raise serializers.ValidationError("website_url_invalid")
        return value

    def validate(self, data):
        password = data.get('password', '')
        password_confirm = data.get('password_confirm', '')

        if not password_confirm:
            raise serializers.ValidationError({
                'password_confirm': 'password_confirm_required'
            })
        if password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': 'passwords_not_match'
            })
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')

        return Company.objects.create(
            company_name=validated_data['company_name'],
            email=validated_data['email'].lower().strip(),
            phone_number=validated_data['phone_number'],
            password=make_password(validated_data['password']),
            governorate=validated_data['governorate'],
            company_type=validated_data['company_type'],
            website_url=validated_data.get('website_url') or "",
            description=validated_data['description'],
        )

# =========================
# COMPANY LOGIN
# =========================

class CompanyLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField(write_only=True)

    def validate_id_token(self, value):
        if not value or not isinstance(value, str):
            raise serializers.ValidationError("Google ID token is required.")
        return value.strip()


# =========================
# COMPANY DETAIL
# =========================

class CompanyDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id', 'company_name', 'email', 'phone_number',
            'governorate', 'company_type', 'website_url', 'description'
        ]


# =========================
# CHOICES
# =========================

class ChoicesSerializer(serializers.Serializer):
    governorates = serializers.SerializerMethodField()
    company_types = serializers.SerializerMethodField()

    def get_governorates(self, obj):
        return [{"value": v, "label": l} for v, l in GOVERNORATE_CHOICES]

    def get_company_types(self, obj):
        return [{"value": v, "label": l} for v, l in COMPANY_TYPE_CHOICES]


# =========================
# EMAIL VERIFICATION
# =========================

class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(required=False, allow_blank=True)
    token = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, data):
        if not data.get('otp') and not data.get('token'):
            raise serializers.ValidationError("otp_or_token_required")
        return data


# =========================
# RESEND OTP
# =========================

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


# =========================
# GOOGLE LOGIN RESPONSE
# =========================

class GoogleLoginResponseSerializer(serializers.Serializer):
    is_new_user = serializers.BooleanField()
    is_profile_completed = serializers.BooleanField()
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        user = obj['user']
        return {
            'email': user.email,
            'full_name': getattr(user, 'full_name', ''),
        }