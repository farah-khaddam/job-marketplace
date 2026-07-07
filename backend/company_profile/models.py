from django.db import models
from django.conf import settings


class CompanyProfile(models.Model):
	"""ملف إضافي لشركة — معلومات قابلة للرفع لا تُخزن في نموذج users.Company مباشرة."""

	company = models.OneToOneField(
		'users.Company', on_delete=models.CASCADE, related_name='profile'
	)

	logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
	external_logo_url = models.URLField(max_length=500, blank=True, null=True)
	linkedin_url = models.URLField(max_length=500, blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Company Profile'
		verbose_name_plural = 'Company Profiles'

	def __str__(self):
		return f'Profile for {self.company.company_name}'
