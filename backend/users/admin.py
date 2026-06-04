from django.contrib import admin
from .models import JobSeeker, Company, EmailVerification
from django.utils.html import format_html
from django.contrib.auth.hashers import make_password
from django.conf import settings
from django.core.mail import send_mail
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)



@admin.action(description="Approve selected companies")
def approve_companies(modeladmin, request, queryset):
    companies = list(queryset)
    queryset.update(approval_status='approved')
    for company in companies:
        try:
            send_mail(
                subject='Your company account has been approved',
                message=(
                    f'Hello {company.company_name},\n\n'
                    'Your company account has been approved. You can now log in using your registered email address.\n\n'
                    'If you need assistance, please contact support.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[company.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"[approve_companies] Failed to send approval email to {company.email}: {e}")


@admin.action(description="Reject selected companies")
def reject_companies(modeladmin, request, queryset):
    companies = list(queryset)
    queryset.update(approval_status='rejected')
    for company in companies:
        try:
            subject = 'Your company registration request was rejected'
            if company.rejection_reason:
                message = (
                    f'Hello {company.company_name},\n\n'
                    'We are sorry to inform you that your company registration request has been rejected.\n\n'
                    f'Reason: {company.rejection_reason}\n\n'
                    'If you have questions, please contact support for more information.'
                )
            else:
                message = (
                    f'Hello {company.company_name},\n\n'
                    'We are sorry to inform you that your company registration request has been rejected.\n\n'
                    'If you have questions, please contact support for more information.'
                )
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[company.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"[reject_companies] Failed to send rejection email to {company.email}: {e}")


@admin.action(description="Approve and create company account")
def approve_pending_company(modeladmin, request, queryset):
    """Create Company objects from approved EmailVerification records with pending company data"""
    created_count = 0
    for verification in queryset:
        payload = verification.payload or {}
        
        # Only process if this has pending company approval data
        if payload.get('approval_status') == 'pending_admin_approval':
            try:
                # Create the company from stored payload
                Company.objects.create(
                    company_name=payload.get('company_name'),
                    email=verification.email,
                    phone_number=payload.get('phone_number'),
                    password=payload.get('password_hash') or make_password(payload.get('password', '')),
                    governorate=payload.get('governorate'),
                    company_type=payload.get('company_type'),
                    website_url=payload.get('website_url', '') or '',
                    description=payload.get('description'),
                    approval_status='approved',
                )
                # Delete the verification record after company is created
                verification.delete()
                created_count += 1
            except Exception as e:
                logger.error(f"Failed to create company from EmailVerification {verification.email}: {str(e)}")
    
    modeladmin.message_user(request, f"Successfully created {created_count} company account(s).")


@admin.action(description="Reject pending company registration")
def reject_pending_company(modeladmin, request, queryset):
    """Reject pending company registrations by deleting EmailVerification records"""
    deleted_count = queryset.count()
    queryset.delete()
    modeladmin.message_user(request, f"Successfully rejected {deleted_count} pending company registration(s).")


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    """Admin interface for Email Verification (Pending Registrations)"""
    
    list_display = ['email', 'user_type', 'approval_status_display', 'created_at', 'expires_at', 'is_expired']
    list_filter = ['user_type', 'created_at', 'expires_at']
    search_fields = ['email']
    readonly_fields = ['email', 'otp_hash', 'payload', 'created_at', 'expires_at', 'user_type']
    actions = [approve_pending_company, reject_pending_company]
    
    fieldsets = (
        ('Email Information', {
            'fields': ('email', 'user_type')
        }),
        ('OTP Details', {
            'fields': ('otp_hash',)
        }),
        ('Payload', {
            'fields': ('payload',)
        }),
        ('Timing', {
            'fields': ('created_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    def approval_status_display(self, obj):
        """Display approval status for pending company registrations"""
        payload = obj.payload or {}
        status = payload.get('approval_status')
        if status == 'pending_admin_approval':
            return format_html("<span style='color:orange'>⏳ Pending Admin Approval</span>")
        return "N/A"
    
    approval_status_display.short_description = "Company Status"
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return True


@admin.register(JobSeeker)
class JobSeekerAdmin(admin.ModelAdmin):
    """Admin interface for Job Seeker model"""
    
    list_display = ['full_name', 'email', 'phone_number', 'created_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['full_name', 'email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('full_name', 'email', 'phone_number')
        }),
        ('Security', {
            'fields': ('password',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin interface for Company model"""
    
    list_display = ['company_name', 'email','status_badge', 'governorate', 'approval_status','company_type', 'created_at', 'is_active']
    list_filter = ['is_active', 'governorate', 'company_type','approval_status', 'created_at']
    search_fields = ['company_name', 'email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    actions = [approve_companies, reject_companies]
    def status_badge(self, obj):
      if obj.approval_status == "approved":
        return format_html("<span style='color:green'>Approved</span>")
      elif obj.approval_status == "rejected":
        return format_html("<span style='color:red'>Rejected</span>")
      return format_html("<span style='color:orange'>Pending</span>")

    status_badge.short_description = "Status"
    fieldsets = (
        ('Company Information', {
            'fields': ('company_name', 'email', 'phone_number')
        }),
        ('Location & Business Type', {
            'fields': ('governorate', 'company_type')
        }),
        ('Company Details', {
            'fields': ('website_url', 'description')
        }),
        ('Security', {
            'fields': ('password',)
        }),
        ('Status', {
            'fields': ('is_active', 'approval_status', 'rejection_reason')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    
    )
