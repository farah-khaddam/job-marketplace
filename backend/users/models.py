from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser
from django.db import models


ROLE_CHOICES = (
    ('job_seeker', 'Job Seeker'),
    ('company', 'Company'),
)

class CustomUser(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )



GOVERNORATE_CHOICES = [
    ('damascus', 'Damascus'),
    ('idlib', 'Idlib'),
]

COMPANY_TYPE_CHOICES = [
    ('programming', 'Programming'),
    ('civil', 'Civil'),
]




class JobSeeker(models.Model):
    """
    Model for job seekers who want to search for jobs.
    Stores personal information specific to job seekers.
    """
    
    # Basic Information
    full_name = models.CharField(
        max_length=150,
        help_text="Full name of the job seeker"
    )
    email = models.EmailField(
        unique=True,
        help_text="Email address for login and contact"
    )
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Phone number must be entered in the format: +999999999. Up to 15 digits allowed.'
    )
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        help_text="Phone number for contact"
    )
    password = models.CharField(
        max_length=255,
        help_text="Password (will be hashed)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Job Seeker"
        verbose_name_plural = "Job Seekers"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"



class Company(models.Model):
    """
    Model for companies that post job opportunities.
    Stores company-specific information including location and business type.
    """
    
    # Basic Information
    company_name = models.CharField(
        max_length=200,
        help_text="Official company name"
    )
    email = models.EmailField(
        unique=True,
        help_text="Company email for login and contact"
    )
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Phone number must be entered in the format: +999999999. Up to 15 digits allowed.'
    )
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        help_text="Company phone number"
    )
    password = models.CharField(
        max_length=255,
        help_text="Password (will be hashed)"
    )
    
    # Location and Business Details
    governorate = models.CharField(
        max_length=50,
        choices=GOVERNORATE_CHOICES,
        help_text="Company location (governorate)"
    )
    company_type = models.CharField(
        max_length=50,
        choices=COMPANY_TYPE_CHOICES,
        help_text="Type of company industry"
    )
    
    # Company Description
    website_url = models.URLField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Company website link"
    )
    description = models.TextField(
        help_text="Description about the company"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.company_name} ({self.governorate})"
