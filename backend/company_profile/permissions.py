from rest_framework.permissions import BasePermission

from users.models import Company


class IsCompanyAuthenticated(BasePermission):
    message = 'Authentication as a company is required.'

    def has_permission(self, request, view):
        return isinstance(request.auth, Company)
