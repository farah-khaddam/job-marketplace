from rest_framework import serializers
from .models import JobSeeker, Company, GOVERNORATE_CHOICES, COMPANY_TYPE_CHOICES, EmailOTP
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random

CustomUser = get_user_model()

def generate_otp():
    return ''.join(random.choices('0123456789', k=6))


def send_job_seeker_otp(job_seeker):
    otp = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=10)
    EmailOTP.objects.filter(job_seeker=job_seeker).delete()
    EmailOTP.objects.create(
        job_seeker=job_seeker,
        otp=otp,
        expires_at=expires_at,
    )

    subject = 'Your verification code'
    message = f'Your verification code is {otp}. It will expire in 10 minutes.'
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
    send_mail(subject, message, from_email, [job_seeker.email], fail_silently=False)


class JobSeekerRegisterSerializer(serializers.Serializer):
    """
    Serializer for Job Seeker registration.
    Creates both CustomUser and JobSeeker in one step.
    """
    # Fields for CustomUser
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    # Fields for JobSeeker
    full_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(max_length=17)

    def validate_email(self, value):
        """Check email is not already used"""
        if CustomUser.objects.filter(email=value).exists() or JobSeeker.objects.filter(email=value).exists() or Company.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, data):
        """Validate that passwords match"""
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data

    def create(self, validated_data):
        """Create the JobSeeker record and send OTP"""
        validated_data.pop('password_confirm')

        job_seeker = JobSeeker.objects.create(
            full_name=validated_data['full_name'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            password=make_password(validated_data['password']),
            is_verified=False,
        )

        try:
            send_job_seeker_otp(job_seeker)
        except Exception:
            job_seeker.delete()
            raise serializers.ValidationError({'email': 'Failed to send OTP email. Please try again later.'})

        return job_seeker


class JobSeekerLoginSerializer(serializers.Serializer):
    """Serializer for Job Seeker login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class JobSeekerDetailSerializer(serializers.ModelSerializer):
    """Serializer for displaying job seeker details"""
    email = serializers.EmailField(read_only=True)

    class Meta:
        model = JobSeeker
        fields = ['id', 'full_name', 'email', 'phone_number', 'created_at', 'is_active']
        read_only_fields = ['id', 'created_at']


class CompanyRegisterSerializer(serializers.Serializer):
    """
    Serializer for Company registration.
    Creates both CustomUser and Company in one step.
    """
    # Fields for CustomUser
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    # Fields for Company
    company_name = serializers.CharField(max_length=200)
    phone_number = serializers.CharField(max_length=17)
    governorate = serializers.ChoiceField(choices=GOVERNORATE_CHOICES)
    company_type = serializers.ChoiceField(choices=COMPANY_TYPE_CHOICES)
    website_url = serializers.URLField(required=False, allow_blank=True)
    description = serializers.CharField()

    def validate_email(self, value):
        """Check email is not already used"""
        if CustomUser.objects.filter(email=value).exists() or JobSeeker.objects.filter(email=value).exists() or Company.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data

    def create(self, validated_data):
        """Create the Company record"""
        validated_data.pop('password_confirm')

        company = Company.objects.create(
            company_name=validated_data['company_name'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            governorate=validated_data['governorate'],
            company_type=validated_data['company_type'],
            website_url=validated_data.get('website_url', ''),
            description=validated_data['description'],
            password=make_password(validated_data['password']),
        )

        return company


class CompanyLoginSerializer(serializers.Serializer):
    """Serializer for Company login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class CompanyDetailSerializer(serializers.ModelSerializer):
    """Serializer for displaying company details"""
    email = serializers.EmailField(read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'company_name', 'email', 'phone_number', 'governorate',
            'company_type', 'website_url', 'description', 'created_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at']


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for verifying email OTP"""
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, max_length=6)


class ChoicesSerializer(serializers.Serializer):
    """Serializer for returning all available choices"""
    governorates = serializers.SerializerMethodField()
    company_types = serializers.SerializerMethodField()

    def get_governorates(self, obj):
        return [{'value': code, 'label': label} for code, label in GOVERNORATE_CHOICES]

    def get_company_types(self, obj):
        return [{'value': code, 'label': label} for code, label in COMPANY_TYPE_CHOICES]