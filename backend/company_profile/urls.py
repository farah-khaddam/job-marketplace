from django.urls import path
from .views import CompanyProfileView, CompanyLogoUploadView

urlpatterns = [
    path('company/profile/', CompanyProfileView.as_view(), name='company-profile'),
    path('company/profile/logo/', CompanyLogoUploadView.as_view(), name='company-logo'),
]
