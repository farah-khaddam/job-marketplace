import logging
from datetime import datetime, timedelta

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.utils.translation import get_language
from django.contrib.auth.hashers import check_password
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import EmailVerification, JobSeeker, Company, GOVERNORATE_CHOICES, COMPANY_TYPE_CHOICES
from .serializers import (
    JobSeekerOTPRegisterSerializer, VerifyOTPSerializer,
    JobSeekerLoginSerializer, JobSeekerDetailSerializer,
    CompanyRegisterSerializer, CompanyLoginSerializer, CompanyDetailSerializer,
    GoogleLoginSerializer, GoogleLoginResponseSerializer,
    ChoicesSerializer
)
from .services.otp_service import (
    send_job_seeker_otp,
    verify_job_seeker_otp,
    verify_company_otp,
    send_company_otp,
)
import jwt
import requests

logger = logging.getLogger(__name__)


def home(request):
    """Welcome endpoint to verify API is running"""
    return JsonResponse({"message": "Job Portal API is working 🚀"})


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
                    'POST /api/auth/company/verify-otp/ - Verify company OTP and complete registration',
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
    if not serializer.is_valid():
        errors = serializer.errors
        if "email" in errors:
            code = errors["email"][0]
            return Response({"error_code": code}, status=status.HTTP_400_BAD_REQUEST)
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    validated_data = serializer.validated_data
    email = validated_data['email'].lower()

    return send_job_seeker_otp(email, validated_data)


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

    return verify_job_seeker_otp(email, otp)


@api_view(['POST'])
def company_verify_otp(request):
    """Endpoint to verify company registration OTP only."""
    serializer = VerifyOTPSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except serializers.ValidationError as exc:
        logger.debug('Company OTP verification validation errors: %s', exc.detail)
        raise

    email = serializer.validated_data['email'].lower()
    otp = serializer.validated_data['otp']

    return verify_company_otp(email, otp)





@api_view(['POST'])
def login_user(request):
    email = request.data.get('email', '').lower().strip()
    password = request.data.get('password', '')

    # البحث أولاً في JobSeeker
    job_seeker = JobSeeker.objects.filter(email__iexact=email).first()

    if job_seeker:
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

        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # البحث في Company
    company = Company.objects.filter(email__iexact=email).first()

    if company:

        if not check_password(password, company.password):
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if company.approval_status == 'pending':
            return Response(
                {'error': 'Your company account is under review'},
                status=status.HTTP_403_FORBIDDEN
            )

        if company.approval_status == 'rejected':
            return Response(
                {'error': 'Your company account has been rejected'},
                status=status.HTTP_403_FORBIDDEN
            )

        detail_serializer = CompanyDetailSerializer(company)

        return Response(
            {
                'message': 'Login successful',
                'user_type': 'company',
                'data': detail_serializer.data
            },
            status=status.HTTP_200_OK
        )

    return Response(
        {'error': 'Account not found'},
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
        - Success (200): Verification code sent to company email
        - Error (400): Validation errors
    """
    serializer = CompanyRegisterSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except serializers.ValidationError as exc:
        logger.debug('Company registration validation errors: %s', exc.detail)
        print('Company registration validation errors:', exc.detail)
        raise

    validated_data = serializer.validated_data
    email = validated_data['email'].lower().strip()

    return send_company_otp(email, validated_data)



def get_google_client_id():
    return getattr(settings, 'GOOGLE_CLIENT_ID', None) or settings.SOCIALACCOUNT_PROVIDERS.get('google', {}).get('CLIENT_ID')


def verify_google_id_token(id_token):
    if not id_token or not isinstance(id_token, str):
        raise ValueError('Invalid Google ID token.')

    try:
        response = requests.get(
            'https://oauth2.googleapis.com/tokeninfo',
            params={'id_token': id_token},
            timeout=5,
        )
        response.raise_for_status()
        token_info = response.json()
    except requests.RequestException as exc:
        logger.warning('Google token verification failed: %s', exc)
        raise ValueError('Invalid Google token.')

    if not token_info.get('email'):
        raise ValueError('Google token did not contain an email address.')

    if token_info.get('email_verified') not in ('true', True):
        raise ValueError('Google account email is not verified.')

    client_id = get_google_client_id()
    if client_id and token_info.get('aud') != client_id:
        raise ValueError('Google token audience does not match the configured client ID.')

    return token_info


def generate_jwt_tokens(email, user_type, user_id):
    now = datetime.utcnow()
    access_payload = {
        'email': email,
        'user_type': user_type,
        'user_id': user_id,
        'token_type': 'access',
        'iat': int(now.timestamp()),
        'exp': int((now + timedelta(minutes=15)).timestamp()),
    }
    refresh_payload = {
        'email': email,
        'user_type': user_type,
        'user_id': user_id,
        'token_type': 'refresh',
        'iat': int(now.timestamp()),
        'exp': int((now + timedelta(days=7)).timestamp()),
    }

    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')

    if isinstance(access_token, bytes):
        access_token = access_token.decode('utf-8')
    if isinstance(refresh_token, bytes):
        refresh_token = refresh_token.decode('utf-8')

    return access_token, refresh_token


@api_view(['POST'])
def google_login(request):
    """Endpoint for Google login using an ID token without creating new user accounts."""
    serializer = GoogleLoginSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except serializers.ValidationError as exc:
        logger.debug('Google login validation errors: %s', exc.detail)
        raise

    try:
        token_info = verify_google_id_token(serializer.validated_data['id_token'])
    except ValueError as exc:
        return Response(
            {'error': str(exc)},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = token_info['email'].lower().strip()
    job_seeker = JobSeeker.objects.filter(email__iexact=email).first()
    company = None if job_seeker else Company.objects.filter(email__iexact=email).first()
    user = job_seeker or company

    if not user:
        return Response(
            {
                'error': 'This Google account is not registered on this platform. Please create an account first.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    user_type = 'job_seeker' if job_seeker else 'company'
    access_token, refresh_token = generate_jwt_tokens(
        email=user.email,
        user_type=user_type,
        user_id=user.id
    )

    response_data = {
        'is_new_user': False,
        'is_profile_completed': True,
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user,
    }

    response_serializer = GoogleLoginResponseSerializer(response_data)
    return Response(response_serializer.data, status=status.HTTP_200_OK)
