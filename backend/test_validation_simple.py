#!/usr/bin/env python
"""
Simple validation test to demonstrate email duplicate checking with localization.
Run with: python test_validation_simple.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobportal.settings')
django.setup()

from django.utils.translation import activate, get_language
from rest_framework import serializers
from users.serializers import JobSeekerOTPRegisterSerializer
from users.models import JobSeeker, Company


def test_email_validation():
    """Test email validation with localization."""
    
    print("=" * 70)
    print("EMAIL VALIDATION TEST - LOCALIZATION SUPPORT")
    print("=" * 70)
    
    # Create test data
    print("\n[SETUP] Creating test job seeker and company...")
    existing_seeker = JobSeeker.objects.create(
        full_name="John Doe",
        email="jobseeker@example.com",
        phone_number="+1234567890",
        password="hashedpassword"
    )
    print(f"✓ Created job seeker: {existing_seeker.email}")
    
    existing_company = Company.objects.create(
        company_name="Test Corp",
        email="company@example.com",
        phone_number="+9876543210",
        password="hashedpassword",
        governorate="damascus",
        company_type="programming",
        description="Test company"
    )
    print(f"✓ Created company: {existing_company.email}")
    
    # Test 1: Duplicate job seeker email - English
    print("\n" + "-" * 70)
    print("TEST 1: Duplicate Job Seeker Email - English")
    print("-" * 70)
    activate('en')
    print(f"Current language: {get_language()}")
    
    data = {
        'full_name': 'Jane Doe',
        'email': 'jobseeker@example.com',
        'phone_number': '1234567890',
        'password': 'password123456',
        'password_confirm': 'password123456'
    }
    
    serializer = JobSeekerOTPRegisterSerializer(data=data)
    is_valid = serializer.is_valid()
    
    if not is_valid:
        print(f"✓ Validation failed as expected")
        print(f"✓ Error field: email")
        error_msg = str(serializer.errors['email'][0])
        print(f"✓ Error message: {error_msg}")
        assert "already registered" in error_msg.lower(), "Expected English message"
        print("✓ PASS - English error message is correct")
    else:
        print("✗ FAIL - Validation should have failed")
        return False
    
    # Test 2: Duplicate company email - English
    print("\n" + "-" * 70)
    print("TEST 2: Duplicate Company Email - English")
    print("-" * 70)
    activate('en')
    
    data = {
        'full_name': 'Jane Doe',
        'email': 'company@example.com',
        'phone_number': '1234567890',
        'password': 'password123456',
        'password_confirm': 'password123456'
    }
    
    serializer = JobSeekerOTPRegisterSerializer(data=data)
    is_valid = serializer.is_valid()
    
    if not is_valid:
        print(f"✓ Validation failed as expected")
        print(f"✓ Error field: email")
        error_msg = str(serializer.errors['email'][0])
        print(f"✓ Error message: {error_msg}")
        assert "already registered" in error_msg.lower(), "Expected English message"
        print("✓ PASS - English error message is correct")
    else:
        print("✗ FAIL - Validation should have failed")
        return False
    
    # Test 3: Duplicate job seeker email - Arabic
    print("\n" + "-" * 70)
    print("TEST 3: Duplicate Job Seeker Email - Arabic")
    print("-" * 70)
    activate('ar')
    print(f"Current language: {get_language()}")
    
    data = {
        'full_name': 'Jane Doe',
        'email': 'jobseeker@example.com',
        'phone_number': '1234567890',
        'password': 'password123456',
        'password_confirm': 'password123456'
    }
    
    serializer = JobSeekerOTPRegisterSerializer(data=data)
    is_valid = serializer.is_valid()
    
    if not is_valid:
        print(f"✓ Validation failed as expected")
        print(f"✓ Error field: email")
        error_msg = str(serializer.errors['email'][0])
        print(f"✓ Error message: {error_msg}")
        assert "مسجل" in error_msg, "Expected Arabic message containing 'مسجل'"
        print("✓ PASS - Arabic error message is correct")
    else:
        print("✗ FAIL - Validation should have failed")
        return False
    
    # Test 4: Duplicate company email - Arabic
    print("\n" + "-" * 70)
    print("TEST 4: Duplicate Company Email - Arabic")
    print("-" * 70)
    activate('ar')
    
    data = {
        'full_name': 'Jane Doe',
        'email': 'company@example.com',
        'phone_number': '1234567890',
        'password': 'password123456',
        'password_confirm': 'password123456'
    }
    
    serializer = JobSeekerOTPRegisterSerializer(data=data)
    is_valid = serializer.is_valid()
    
    if not is_valid:
        print(f"✓ Validation failed as expected")
        print(f"✓ Error field: email")
        error_msg = str(serializer.errors['email'][0])
        print(f"✓ Error message: {error_msg}")
        assert "مسجل" in error_msg, "Expected Arabic message containing 'مسجل'"
        print("✓ PASS - Arabic error message is correct")
    else:
        print("✗ FAIL - Validation should have failed")
        return False
    
    # Test 5: Case-insensitive check
    print("\n" + "-" * 70)
    print("TEST 5: Case-Insensitive Email Check")
    print("-" * 70)
    activate('en')
    
    data = {
        'full_name': 'Jane Doe',
        'email': 'JOBSEEKER@EXAMPLE.COM',  # Different case
        'phone_number': '1234567890',
        'password': 'password123456',
        'password_confirm': 'password123456'
    }
    
    serializer = JobSeekerOTPRegisterSerializer(data=data)
    is_valid = serializer.is_valid()
    
    if not is_valid:
        print(f"✓ Validation failed as expected")
        print(f"✓ Error field: email")
        error_msg = str(serializer.errors['email'][0])
        print(f"✓ Error message: {error_msg}")
        print("✓ PASS - Case-insensitive check works")
    else:
        print("✗ FAIL - Validation should have failed for case variation")
        return False
    
    # Test 6: Unique email passes validation
    print("\n" + "-" * 70)
    print("TEST 6: Unique Email Passes Validation")
    print("-" * 70)
    activate('en')
    
    data = {
        'full_name': 'New User',
        'email': 'newuser@example.com',
        'phone_number': '1234567890',
        'password': 'password123456',
        'password_confirm': 'password123456'
    }
    
    serializer = JobSeekerOTPRegisterSerializer(data=data)
    is_valid = serializer.is_valid()
    
    if is_valid:
        print(f"✓ Validation passed as expected")
        print(f"✓ Validated email: {serializer.validated_data['email']}")
        print("✓ PASS - Unique email passes validation")
    else:
        print("✗ FAIL - Validation should have passed")
        print(f"Errors: {serializer.errors}")
        return False
    
    # Cleanup
    print("\n" + "-" * 70)
    print("CLEANUP")
    print("-" * 70)
    existing_seeker.delete()
    existing_company.delete()
    print("✓ Test data cleaned up")
    
    print("\n" + "=" * 70)
    print("ALL TESTS PASSED! ✓")
    print("=" * 70)
    print("\nSummary:")
    print("- Duplicate email detection works for JobSeeker")
    print("- Duplicate email detection works for Company")
    print("- English localization works correctly")
    print("- Arabic localization works correctly")
    print("- Case-insensitive email matching works")
    print("- Unique emails pass validation")
    
    return True


if __name__ == '__main__':
    try:
        success = test_email_validation()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
