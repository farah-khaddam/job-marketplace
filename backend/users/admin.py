from django.contrib import admin
from .models import JobSeeker, Company

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
    
    list_display = ['company_name', 'email', 'governorate', 'company_type', 'created_at', 'is_active']
    list_filter = ['is_active', 'governorate', 'company_type', 'created_at']
    search_fields = ['company_name', 'email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    
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
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
