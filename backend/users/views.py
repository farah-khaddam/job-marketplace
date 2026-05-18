import logging
import secrets
import hashlib
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils import timezone
from django.contrib.auth.hashers import check_password, make_password
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import EmailVerification, JobSeeker, Company, GOVERNORATE_CHOICES, COMPANY_TYPE_CHOICES
from .serializers import (
    JobSeekerOTPRegisterSerializer, VerifyOTPSerializer,
    JobSeekerLoginSerializer, JobSeekerDetailSerializer,
    CompanyRegisterSerializer, CompanyLoginSerializer, CompanyDetailSerializer,
    ChoicesSerializer
)

logger = logging.getLogger(__name__)


def home(request):
    """Welcome endpoint to verify API is running"""
    return JsonResponse({"message": "Job Portal API is working 🚀"})


def generate_otp():
    return '{:06d}'.format(secrets.randbelow(1000000))


def hash_otp(otp: str) -> str:
    """Hash OTP using SHA-256."""
    return hashlib.sha256(otp.encode()).hexdigest()


from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def send_verification_email(email, otp):
    subject = 'Verify your email address'

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@jobportal.local')

    text_content = f"""
Your verification code is: {otp}
This code expires in 10 minutes.
"""

    html_content = f"""
    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
        <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:10px;">
            
            <h2 style="color:#333;">Email Verification</h2>
            <p>Use the code below to verify your account:</p>

            <div style="
                font-size:24px;
                letter-spacing:5px;
                font-weight:bold;
                background:#f0f0f0;
                padding:10px;
                text-align:center;
                border-radius:8px;
                margin:20px 0;
            ">
                {otp}
            </div>

            <p style="color:#777;">
                This code will expire in <b>10 minutes</b>.
            </p>

            <p style="color:#999; font-size:12px;">
                If you didn’t request this code, you can ignore this email.
            </p>

        </div>
    </div>
    """

    msg = EmailMultiAlternatives(subject, text_content, from_email, [email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()


@api_view(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def api_404_handler(request):
    """
    Custom 404 handler for API routes.
    Returns JSON response instead of HTML.
    """
    return Response(
        {
            'error': 'API endpoint not found',
            'message': 'The requested API endpoint does not exist. Please check the URL and try again.',
            'status_code': 404,
            'available_endpoints': {
                'utility': [
                    'GET /api/ - API home',
                    'GET /api/choices/ - Get dropdown choices'
                ],
                'job_seeker_auth': [
                    'POST /api/auth/job-seeker/register/ - Register job seeker',
                    'POST /api/auth/job-seeker/verify-otp/ - Verify OTP and complete registration',
                    'POST /api/auth/job-seeker/login/ - Login job seeker'
                ],
                'company_auth': [
                    'POST /api/auth/company/register/ - Register company',
                    'POST /api/auth/company/login/ - Login company'
                ]
            }
        },
        status=status.HTTP_404_NOT_FOUND
    )



@api_view(['GET'])
def get_choices(request):
    """
    Endpoint to get all dropdown choices.
    Used by frontend to populate dropdown selects.
    
    Returns:
        - governorates: List of available governorates
        - company_types: List of available company types
    """
    serializer = ChoicesSerializer({})
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['POST'])
def job_seeker_register(request):
    """
    Endpoint for Job Seeker Registration.
    
    Required fields:
        - full_name: str (150 chars max)
        - email: str (unique)
        - phone_number: str (phone format)
        - password: str (min 6 chars)
        - password_confirm: str (must match password)
    
    Returns:
        - Success (200): Verification code sent to email
        - Error (400): Validation errors
    """
    serializer = JobSeekerOTPRegisterSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except serializers.ValidationError as exc:
        logger.debug('Job seeker registration validation errors: %s', exc.detail)
        print('Job seeker registration validation errors:', exc.detail)
        if isinstance(exc.detail, dict) and 'email' in exc.detail:
            email_errors = exc.detail.get('email', [])
            if any('registered' in str(error).lower() for error in email_errors):
                return Response(
                    {'message': 'Email already registered'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        raise

    validated_data = serializer.validated_data
    email = validated_data['email'].lower()
    otp = generate_otp()
    otp_hash = hash_otp(otp)
    expires_at = timezone.now() + timedelta(minutes=10)

    EmailVerification.objects.update_or_create(
        email=email,
        defaults={
            'otp_hash': otp_hash,
            'payload': {
                'full_name': validated_data['full_name'],
                'phone_number': validated_data['phone_number'],
                'password': validated_data['password'],
            },
            'expires_at': expires_at,
        }
    )

    send_verification_email(email, otp)

    return Response(
        {'message': 'Verification code sent to your email'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def verify_otp(request):
    """Endpoint to verify email OTP and create the account."""
    serializer = VerifyOTPSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except serializers.ValidationError as exc:
        logger.debug('OTP verification validation errors: %s', exc.detail)
        print('OTP verification validation errors:', exc.detail)
        raise

    email = serializer.validated_data['email'].lower()
    otp = serializer.validated_data['otp']

    try:
        verification = EmailVerification.objects.get(email=email)
    except EmailVerification.DoesNotExist:
        return Response(
            {'error': 'Invalid verification code'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if verification.is_expired:
        verification.delete()
        return Response(
            {'error': 'Verification code expired'},
            status=status.HTTP_400_BAD_REQUEST
        )

    otp_hash = hash_otp(otp)
    if verification.otp_hash != otp_hash:
        return Response(
            {'error': 'Invalid verification code'},
            status=status.HTTP_400_BAD_REQUEST
        )

    payload = verification.payload
    if JobSeeker.objects.filter(email__iexact=email).exists() or Company.objects.filter(email__iexact=email).exists():
        verification.delete()
        return Response(
            {'error': 'Email already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )

    job_seeker = JobSeeker.objects.create(
        full_name=payload['full_name'],
        email=email,
        phone_number=payload['phone_number'],
        password=make_password(payload['password']),
    )
    verification.delete()

    return Response(
        {'message': 'Email verified and account created successfully'},
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
def job_seeker_login(request):
    """
    Endpoint for Job Seeker Login.
    
    Required fields:
        - email: str
        - password: str
    
    Returns:
        - Success (200): Job seeker details and session info
        - Error (400): Invalid credentials
        - Error (404): User not found
    """
    serializer = JobSeekerLoginSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except serializers.ValidationError as exc:
        logger.debug('Job seeker login validation errors: %s', exc.detail)
        print('Job seeker login validation errors:', exc.detail)
        raise
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    
    try:
        job_seeker = JobSeeker.objects.get(email=email)
        
        # Verify password
        if check_password(password, job_seeker.password):
            detail_serializer = JobSeekerDetailSerializer(job_seeker)
            return Response(
                {
                    'message': 'Login successful',
                    'user_type': 'job_seeker',
                    'data': detail_serializer.data
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except JobSeeker.DoesNotExist:
        return Response(
            {'error': 'Job seeker account not found'},
            status=status.HTTP_404_NOT_FOUND
        )



@api_view(['POST'])
def company_register(request):
    """
    Endpoint for Company Registration.
    
    Required fields:
        - company_name: str (200 chars max)
        - email: str (unique)
        - phone_number: str (phone format)
        - governorate: str (choices: damascus, idlib)
        - company_type: str (choices: programming, civil)
        - website_url: str (optional)
        - description: str
        - password: str (min 6 chars)
        - password_confirm: str (must match password)
    
    Returns:
        - Success (201): Created company details
        - Error (400): Validation errors
    """
    serializer = CompanyRegisterSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except serializers.ValidationError as exc:
        logger.debug('Company registration validation errors: %s', exc.detail)
        print('Company registration validation errors:', exc.detail)
        raise
    company = serializer.save()
    detail_serializer = CompanyDetailSerializer(company)
    return Response(
        {
            'message': 'Company account created successfully',
            'data': detail_serializer.data
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
def company_login(request):
    """
    Endpoint for Company Login.
    
    Required fields:
        - email: str
        - password: str
    
    Returns:
        - Success (200): Company details and session info
        - Error (400): Invalid credentials
        - Error (404): Company not found
    """
    serializer = CompanyLoginSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except serializers.ValidationError as exc:
        logger.debug('Company login validation errors: %s', exc.detail)
        print('Company login validation errors:', exc.detail)
        raise
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    
    try:
        company = Company.objects.get(email=email)
        
        # Verify password
        if check_password(password, company.password):
            detail_serializer = CompanyDetailSerializer(company)
            return Response(
                {
                    'message': 'Login successful',
                    'user_type': 'company',
                    'data': detail_serializer.data
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Company.DoesNotExist:
        return Response(
            {'error': 'Company account not found'},
            status=status.HTTP_404_NOT_FOUND
        )
