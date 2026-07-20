import secrets

from django.contrib.auth.hashers import check_password, make_password
from django.db import models


def generate_admin_token():
    return secrets.token_hex(32)


class AdminUser(models.Model):
 
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, help_text="ّ(hashed)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Admin User"
        verbose_name_plural = "Admin Users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)


class AdminAuthToken(models.Model):

    admin = models.ForeignKey(
        AdminUser,
        on_delete=models.CASCADE,
        related_name="auth_tokens",
    )
    key = models.CharField(max_length=64, unique=True, default=generate_admin_token)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Admin Auth Token"
        verbose_name_plural = "Admin Auth Tokens"

    def __str__(self):
        return f"Token for {self.admin.email}"
