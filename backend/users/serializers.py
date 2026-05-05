from rest_framework import serializers
from .models import JobSeeker, Company, GOVERNORATE_CHOICES, COMPANY_TYPE_CHOICES
from django.contrib.auth import get_user_model

CustomUser = get_user_model()


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
        if CustomUser.objects.filter(email=value).exists():
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
        """Create CustomUser first, then JobSeeker"""
        validated_data.pop('password_confirm')

        # 1. Create the CustomUser
        user = CustomUser.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='job_seeker'
        )

        # 2. Create the JobSeeker linked to that user
        job_seeker = JobSeeker.objects.create(
            user=user,
            full_name=validated_data['full_name'],
            phone_number=validated_data['phone_number'],
        )

        return job_seeker


class JobSeekerLoginSerializer(serializers.Serializer):
    """Serializer for Job Seeker login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class JobSeekerDetailSerializer(serializers.ModelSerializer):
    """Serializer for displaying job seeker details"""
    email = serializers.EmailField(source='user.email', read_only=True)

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
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data

    def create(self, validated_data):
        """Create CustomUser first, then Company"""
        validated_data.pop('password_confirm')

        # 1. Create the CustomUser
        user = CustomUser.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='company'
        )

        # 2. Create the Company linked to that user
        company = Company.objects.create(
            user=user,
            company_name=validated_data['company_name'],
            phone_number=validated_data['phone_number'],
            governorate=validated_data['governorate'],
            company_type=validated_data['company_type'],
            website_url=validated_data.get('website_url', ''),
            description=validated_data['description'],
        )

        return company


class CompanyLoginSerializer(serializers.Serializer):
    """Serializer for Company login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class CompanyDetailSerializer(serializers.ModelSerializer):
    """Serializer for displaying company details"""
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'company_name', 'email', 'phone_number', 'governorate',
            'company_type', 'website_url', 'description', 'created_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at']


class ChoicesSerializer(serializers.Serializer):
    """Serializer for returning all available choices"""
    governorates = serializers.SerializerMethodField()
    company_types = serializers.SerializerMethodField()

    def get_governorates(self, obj):
        return [{'value': code, 'label': label} for code, label in GOVERNORATE_CHOICES]

    def get_company_types(self, obj):
        return [{'value': code, 'label': label} for code, label in COMPANY_TYPE_CHOICES]