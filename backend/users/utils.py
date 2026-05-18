import logging
import hashlib
import random
import string

from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.http import Http404

logger = logging.getLogger(__name__)


# =========================
# OTP HELPERS
# =========================

def generate_otp(length=6):
    """Generate a random numeric OTP."""
    return ''.join(random.choices(string.digits, k=length))


def hash_otp(otp: str) -> str:
    """Return a SHA-256 hash of the OTP."""
    return hashlib.sha256(otp.encode()).hexdigest()


# =========================
# SEND OTP EMAIL
# =========================

def send_otp_email(pending_registration, request=None):
    """
    Generates an OTP, stores its hash on the EmailVerification record,
    and emails it to the user. Returns True on success, False on failure.
    """
    otp = generate_otp()
    otp_hash = hash_otp(otp)
    expires_at = timezone.now() + timedelta(minutes=10)

    # Update the existing EmailVerification record
    pending_registration.otp_hash = otp_hash
    pending_registration.expires_at = expires_at
    pending_registration.save(update_fields=['otp_hash', 'expires_at'])

    try:
        send_mail(
            subject='Your verification code',
            message=(
                f'Your OTP verification code is: {otp}\n\n'
                f'This code expires in 10 minutes.\n\n'
                f'If you did not request this, please ignore this email.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[pending_registration.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"[send_otp_email] Failed to send email to {pending_registration.email}: {e}")
        return False


# =========================
# CUSTOM EXCEPTION HANDLER
# =========================

def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler referenced in settings.py under
    REST_FRAMEWORK['EXCEPTION_HANDLER'].
    """
    response = exception_handler(exc, context)

    if response is not None:
        if isinstance(exc, ValidationError):
            logger.debug('DRF validation error: %s', response.data)
        return response

    if isinstance(exc, Http404):
        return Response(
            {
                'error': 'Route not found',
                'message': 'The requested endpoint does not exist.',
                'status_code': 404,
            },
            status=status.HTTP_404_NOT_FOUND
        )

    logger.exception('Unhandled exception: %s', exc)
    return Response(
        {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred. Please try again later.',
            'status_code': 500,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
