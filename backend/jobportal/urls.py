from django.contrib import admin
from django.urls import path, include
from dj_rest_auth.views import PasswordResetConfirmView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/password/reset/confirm/<str:uidb64>/<str:token>/', 
         PasswordResetConfirmView.as_view(), 
         name='password_reset_confirm'),
    path('accounts/', include('allauth.urls')),
]