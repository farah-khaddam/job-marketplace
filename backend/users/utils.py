from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404


def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    Returns JSON responses instead of HTML for all errors.
    """

    response = exception_handler(exc, context)

    if response is not None:
        return response


    if isinstance(exc, Http404):
        return Response(
            {
                'error': 'Route not found',
                'message': 'The requested endpoint does not exist. Please check the URL and try again.',
                'status_code': 404,
                'available_endpoints': {
                    'utility': [
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

    
    return Response(
        {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred. Please try again later.',
            'status_code': 500
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )