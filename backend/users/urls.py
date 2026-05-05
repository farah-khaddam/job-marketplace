from django.urls import path, re_path
from .views import (
    home,
    get_choices,

    job_seeker_register,
    job_seeker_login,
    
    company_register,
    company_login,
    
    api_404_handler,
)


urlpatterns = [
   
    path("", home, name="home"),
    path("choices/", get_choices, name="get_choices"),

 
    path("auth/job-seeker/register/", job_seeker_register, name="job_seeker_register"),
    path("auth/job-seeker/login/", job_seeker_login, name="job_seeker_login"),

 
    path("auth/company/register/", company_register, name="company_register"),
    path("auth/company/login/", company_login, name="company_login"),


    re_path(r'^.*$', api_404_handler),
]
