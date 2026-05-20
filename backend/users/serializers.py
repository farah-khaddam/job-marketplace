
from rest_framework import serializers
from .models import JobSeeker, Company, EmailVerification, GOVERNORATE_CHOICES, COMPANY_TYPE_CHOICES
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from .utils import send_otp_email
from dj_rest_auth.serializers import PasswordResetSerializer
import re

CustomUser = get_user_model()


# =========================
# VALIDATORS
# =========================

def validate_email_format(value):
    if not value:
        raise serializers.ValidationError("email_required")

    value = value.strip().lower()

    email_regex = r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'

    if not re.match(email_regex, value):
        raise serializers.ValidationError("invalid_email")

    if len(value) > 254:
        raise serializers.ValidationError("email_too_long")

    if '..' in value or value.startswith('.') or value.endswith('.'):
        raise serializers.ValidationError("invalid_email")

    return value


def validate_phone_number_value(value):
    if not value:
        raise serializers.ValidationError("phone_required")

    value = str(value).strip()
    value = re.sub(r"[^\d+]", "", value)

    if not value.startswith("+"):
        value = "+" + value

    digits = value.replace("+", "")

    if len(digits) < 9 or len(digits) > 15:
        raise serializers.ValidationError("phone_invalid_length")

    return value


def validate_email_not_registered(value):
    value = value.lower().strip()

    if CustomUser.objects.filter(email=value).exists():
        raise serializers.ValidationError("email_already_registered")

    if EmailVerification.objects.filter(email=value).exists():
        raise serializers.ValidationError("email_pending_verification")

    return value


def validate_password(value):
    if not value:
        raise serializers.ValidationError("password_required")

    if len(value) < 8:
        raise serializers.ValidationError("password_too_short")

    return value


# =========================
# PASSWORD RESET (required by settings.py)
# =========================

class CustomPasswordResetSerializer(PasswordResetSerializer):
    pass


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
        value = validate_email_format(value)
        value = value.lower().strip()

        if (JobSeeker.objects.filter(email__iexact=value).exists() or
                Company.objects.filter(email__iexact=value).exists()):
            language = get_language() or ''
            if language.startswith('ar'):
                message = 'هذا البريد الإلكتروني مسجل مسبقاً'
            else:
                message = 'This email is already registered.'
            raise serializers.ValidationError(message)
        return value

    def validate_password(self, value):
        return validate_password(value)

    def validate_phone_number(self, value):
        return validate_phone_number_value(value)

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("full_name_required")
        return value.strip()

    def validate(self, data):
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
        value = validate_email_format(value)
        return validate_email_not_registered(value)

    def validate_password(self, value):
        return validate_password(value)

    def validate_phone_number(self, value):
        return validate_phone_number_value(value)

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("full_name_required")
        return value.strip()

    def validate(self, data):
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
        value = validate_email_format(value)
        return validate_email_not_registered(value)

    def validate_password(self, value):
        return validate_password(value)

    def validate_phone_number(self, value):
        return validate_phone_number_value(value)

    def validate_company_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("company_name_required")
        return value.strip()

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("company_description_required")
        return value.strip()

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
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
            website_url=validated_data.get('website_url') or None,
            description=validated_data['description'],
        )


# =========================
# COMPANY LOGIN
# =========================

class CompanyLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


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