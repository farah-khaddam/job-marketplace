from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.hashers import check_password
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import JobSeeker, Company, GOVERNORATE_CHOICES, COMPANY_TYPE_CHOICES
from .serializers import (
    JobSeekerRegisterSerializer, JobSeekerLoginSerializer, JobSeekerDetailSerializer,
    CompanyRegisterSerializer, CompanyLoginSerializer, CompanyDetailSerializer,
    ChoicesSerializer
)


def home(request):
    """Welcome endpoint to verify API is running"""
    return JsonResponse({"message": "Job Portal API is working 🚀"})


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
        - Success (201): Created job seeker details
        - Error (400): Validation errors
    """
    serializer = JobSeekerRegisterSerializer(data=request.data)
    if serializer.is_valid():
        job_seeker = serializer.save()
        detail_serializer = JobSeekerDetailSerializer(job_seeker)
        return Response(
            {
                'message': 'Job Seeker account created successfully',
                'data': detail_serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    if serializer.is_valid():
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
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



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
    if serializer.is_valid():
        company = serializer.save()
        detail_serializer = CompanyDetailSerializer(company)
        return Response(
            {
                'message': 'Company account created successfully',
                'data': detail_serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    if serializer.is_valid():
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
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
