from django.urls import path
from .views import (
    home,
    get_choices,
    job_seeker_register,
    verify_otp,
    company_verify_otp,
    job_seeker_login,
    company_register,
    company_login,
)

urlpatterns = [
    path("", home, name="home"),
    path("choices/", get_choices, name="get_choices"),

    path("auth/job-seeker/register/", job_seeker_register, name="job_seeker_register"),
    path("auth/job-seeker/verify-otp/", verify_otp, name="verify_otp"),
    path("auth/job-seeker/login/", job_seeker_login, name="job_seeker_login"),

    path("auth/company/register/", company_register, name="company_register"),
    path("auth/company/verify-otp/", company_verify_otp, name="company_verify_otp"),
    path("auth/company/login/", company_login, name="company_login"),
]
