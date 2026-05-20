"""
Test script to validate email registration with duplicate email handling and localization.
This tests the serializer validation without requiring full Django server setup.
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobportal.settings')
django.setup()

from django.test import TestCase, override_settings, RequestFactory
from django.utils import timezone
from django.utils.translation import activate, get_language
from rest_framework import serializers
from unittest.mock import patch
from users.serializers import JobSeekerOTPRegisterSerializer
from users.models import JobSeeker, Company, EmailVerification
import json


class EmailValidationTest(TestCase):
    """Test email validation for duplicate emails with localization support."""
    
    def setUp(self):
        """Create test data."""
        self.factory = RequestFactory()
        # Create a test job seeker
        self.existing_seeker = JobSeeker.objects.create(
            full_name="John Doe",
            email="existing@example.com",
            phone_number="+1234567890",
            password="hashedpassword123"
        )
        # Create a test company
        self.existing_company = Company.objects.create(
            company_name="Test Company",
            email="company@example.com",
            phone_number="+9876543210",
            password="hashedpassword456",
            governorate="damascus",
            company_type="programming",
            description="Test company"
        )
    
    def test_duplicate_jobseeker_email_english(self):
        """Test duplicate job seeker email returns English error message."""
        activate('en')
        
        data = {
            'full_name': 'Jane Doe',
            'email': 'existing@example.com',
            'phone_number': '1234567890',
            'password': 'password123',
            'password_confirm': 'password123'
        }
        
        serializer = JobSeekerOTPRegisterSerializer(data=data)
        is_valid = serializer.is_valid()
        
        self.assertFalse(is_valid)
        self.assertIn('email', serializer.errors)
        error_message = str(serializer.errors['email'][0])
        print(f"English error for duplicate job seeker: {error_message}")
        self.assertIn("already registered", error_message.lower())
    
    def test_duplicate_company_email_english(self):
        """Test duplicate company email returns English error message."""
        activate('en')
        
        data = {
            'full_name': 'Jane Doe',
            'email': 'company@example.com',
            'phone_number': '1234567890',
            'password': 'password123',
            'password_confirm': 'password123'
        }
        
        serializer = JobSeekerOTPRegisterSerializer(data=data)
        is_valid = serializer.is_valid()
        
        self.assertFalse(is_valid)
        self.assertIn('email', serializer.errors)
        error_message = str(serializer.errors['email'][0])
        print(f"English error for duplicate company: {error_message}")
        self.assertIn("already registered", error_message.lower())
    
    def test_duplicate_jobseeker_email_arabic(self):
        """Test duplicate job seeker email returns Arabic error message."""
        activate('ar')
        
        data = {
            'full_name': 'Jane Doe',
            'email': 'existing@example.com',
            'phone_number': '1234567890',
            'password': 'password123',
            'password_confirm': 'password123'
        }
        
        serializer = JobSeekerOTPRegisterSerializer(data=data)
        is_valid = serializer.is_valid()
        
        self.assertFalse(is_valid)
        self.assertIn('email', serializer.errors)
        error_message = str(serializer.errors['email'][0])
        print(f"Arabic error for duplicate job seeker: {error_message}")
        # Check for Arabic text containing "مسجل" (registered)
        self.assertIn("مسجل", error_message)
    
    def test_duplicate_company_email_arabic(self):
        """Test duplicate company email returns Arabic error message."""
        activate('ar')
        
        data = {
            'full_name': 'Jane Doe',
            'email': 'company@example.com',
            'phone_number': '1234567890',
            'password': 'password123',
            'password_confirm': 'password123'
        }
        
        serializer = JobSeekerOTPRegisterSerializer(data=data)
        is_valid = serializer.is_valid()
        
        self.assertFalse(is_valid)
        self.assertIn('email', serializer.errors)
        error_message = str(serializer.errors['email'][0])
        print(f"Arabic error for duplicate company: {error_message}")
        # Check for Arabic text containing "مسجل" (registered)
        self.assertIn("مسجل", error_message)
    
    def test_unique_email_validation_passes(self):
        """Test that unique emails pass validation."""
        activate('en')
        
        data = {
            'full_name': 'New User',
            'email': 'newuser@example.com',
            'phone_number': '1234567890',
            'password': 'password123',
            'password_confirm': 'password123'
        }
        
        serializer = JobSeekerOTPRegisterSerializer(data=data)
        is_valid = serializer.is_valid()
        
        self.assertTrue(is_valid, f"Serializer errors: {serializer.errors}")
        self.assertEqual(serializer.validated_data['email'], 'newuser@example.com')

    @patch('users.views.send_verification_email', return_value=True)
    def test_resend_otp_cooldown(self, mock_send):
        """Test OTP resend cooldown returns field-specific error."""
        activate('en')

        data = {
            'full_name': 'New User',
            'email': 'resendcooldown@example.com',
            'phone_number': '1234567890',
            'password': 'password123',
            'password_confirm': 'password123'
        }

        response = self.client.post(
            '/api/auth/job-seeker/register/',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)

        response = self.client.post(
            '/api/auth/job-seeker/register/',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('otp', response.json())
        self.assertIn('Please wait', response.json()['otp'][0])

    @patch('users.views.send_verification_email', return_value=True)
    def test_resend_otp_limit_exceeded(self, mock_send):
        """Test OTP resend limit returns a localized field-specific error."""
        activate('en')

        data = {
            'full_name': 'New User',
            'email': 'resendlimit@example.com',
            'phone_number': '1234567890',
            'password': 'password123',
            'password_confirm': 'password123'
        }

        response = self.client.post(
            '/api/auth/job-seeker/register/',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)

        verification = EmailVerification.objects.get(email='resendlimit@example.com')
        payload = verification.payload or {}
        payload['_otp_metadata'] = {
            'request_count': 5,
            'first_request_at': timezone.now().timestamp() - 100,
            'last_request_at': timezone.now().timestamp() - 61,
        }
        verification.payload = payload
        verification.save()

        response = self.client.post(
            '/api/auth/job-seeker/register/',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('otp', response.json())
        self.assertIn('Too many OTP requests', response.json()['otp'][0])

    @patch('users.views.send_verification_email', return_value=True)
    def test_resend_otp_cooldown_arabic(self, mock_send):
        """Test Arabic cooldown error on OTP resend."""
        data = {
            'full_name': 'New User',
            'email': 'resendarabic@example.com',
            'phone_number': '1234567890',
            'password': 'password123',
            'password_confirm': 'password123'
        }

        response = self.client.post(
            '/api/auth/job-seeker/register/',
            data=json.dumps(data),
            content_type='application/json',
            HTTP_ACCEPT_LANGUAGE='ar'
        )
        self.assertEqual(response.status_code, 200)

        response = self.client.post(
            '/api/auth/job-seeker/register/',
            data=json.dumps(data),
            content_type='application/json',
            HTTP_ACCEPT_LANGUAGE='ar'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('otp', response.json())
        self.assertIn('يرجى الانتظار', response.json()['otp'][0])

    def test_case_insensitive_duplicate_check(self):
        """Test that email duplicate check is case-insensitive."""
        activate('en')
        
        data = {
            'full_name': 'Jane Doe',
            'email': 'EXISTING@EXAMPLE.COM',  # Different case
            'phone_number': '1234567890',
            'password': 'password123',
            'password_confirm': 'password123'
        }
        
        serializer = JobSeekerOTPRegisterSerializer(data=data)
        is_valid = serializer.is_valid()
        
        self.assertFalse(is_valid)
        self.assertIn('email', serializer.errors)


if __name__ == '__main__':
    import sys
    from django.test import runner
    
    test_runner = runner.DiscoverRunner(verbosity=2)
    failures = test_runner.run_tests(['test_email_validation'])
    sys.exit(bool(failures))
