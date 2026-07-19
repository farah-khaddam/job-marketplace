from rest_framework import serializers

from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job_posting.title', read_only=True)
    company_name = serializers.CharField(source='job_posting.company.company_name', read_only=True)
    seeker_name = serializers.CharField(source='job_seeker.full_name', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job_title',
            'company_name',
            'seeker_name',
            'status',
            'cover_letter',
            'applied_at',
            'updated_at',
        ]


class JobApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['status']
