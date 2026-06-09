from django.urls import path

from ..views.public_job_views import public_job_list, public_job_detail

urlpatterns = [
    path('', public_job_list, name='public_job_list'),
    path('<int:pk>/', public_job_detail, name='public_job_detail'),
]
