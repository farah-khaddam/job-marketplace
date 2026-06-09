from django.urls import path

from ..views.company_job_views import company_jobs_list_create, company_job_detail

urlpatterns = [
    path('', company_jobs_list_create, name='company_jobs_list_create'),
    path('<int:pk>/', company_job_detail, name='company_job_detail'),
]
