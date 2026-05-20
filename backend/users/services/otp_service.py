
import logging
import secrets
import hashlib
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.utils.translation import get_language
from rest_framework.response import Response
from rest_framework import status

from ..models import EmailVerification, JobSeeker, Company

logger = logging.getLogger(__name__)


def generate_otp():
    return '{:06d}'.format(secrets.randbelow(1000000))


def hash_otp(otp: str) -> str:
    """Hash OTP using SHA-256."""
    return hashlib.sha256(otp.encode()).hexdigest()


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


def send_job_seeker_otp(email, validated_data):
    now = timezone.now()
    rate_limit_meta = {
        'request_count': 1,
        'first_request_at': now.timestamp(),
        'last_request_at': now.timestamp()
    }

    existing_verification = EmailVerification.objects.filter(email=email).first()

    # Delete expired OTP records before processing
    if existing_verification and existing_verification.is_expired:
        existing_verification.delete()
        existing_verification = None

    if existing_verification:
        payload = existing_verification.payload or {}

        # Ensure metadata always exists
        payload.setdefault('_otp_metadata', {})

        meta = payload.get('_otp_metadata', {})
        first_request_at = meta.get('first_request_at')
        last_request_at = meta.get('last_request_at')
        request_count = meta.get('request_count', 0)

        elapsed_since_last = now.timestamp() - (last_request_at or 0)
        elapsed_since_first = now.timestamp() - (first_request_at or 0)

        if last_request_at and elapsed_since_last < 60:
            message = (
                'يرجى الانتظار قبل طلب رمز جديد'
                if get_language().startswith('ar')
                else 'Please wait before requesting another code'
            )

            return Response({"otp_error": "otp_error_wait"})

        if first_request_at and elapsed_since_first <= 600 and request_count >= 5:
            message = (
                'تم تجاوز عدد المحاولات المسموح بها، حاول لاحقاً'
                if get_language().startswith('ar')
                else 'Too many OTP requests. Please try again later'
            )

            return Response({"otp_error": "otp_error_limit"})

        if not first_request_at or elapsed_since_first > 600:
            rate_limit_meta['request_count'] = 1
            rate_limit_meta['first_request_at'] = now.timestamp()
        else:
            rate_limit_meta['request_count'] = request_count + 1
            rate_limit_meta['first_request_at'] = first_request_at

        # Update last_request_at to track cooldown between OTP requests
        rate_limit_meta['last_request_at'] = now.timestamp()
        payload['_otp_metadata'] = rate_limit_meta

    else:
        payload = {
            'full_name': validated_data['full_name'],
            'phone_number': validated_data['phone_number'],
            'password': validated_data['password'],
            '_otp_metadata': rate_limit_meta,
        }

    otp = generate_otp()
    otp_hash = hash_otp(otp)
    expires_at = timezone.now() + timedelta(minutes=10)

    EmailVerification.objects.update_or_create(
        email=email,
        defaults={
            'otp_hash': otp_hash,
            'payload': payload,
            'expires_at': expires_at,
        }
    )

    send_verification_email(email, otp)

    return Response(
        {'message': 'Verification code sent to your email'},
        status=status.HTTP_200_OK
    )
    


def verify_job_seeker_otp(email, otp):
    try:
        verification = EmailVerification.objects.get(email=email)

    except EmailVerification.DoesNotExist:
        return Response({"error": "otp_invalid"})

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

    if (
        JobSeeker.objects.filter(email__iexact=email).exists()
        or Company.objects.filter(email__iexact=email).exists()
    ):
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

