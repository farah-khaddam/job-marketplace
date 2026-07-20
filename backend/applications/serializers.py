from rest_framework import serializers

from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job_posting.title', read_only=True)
    company_name = serializers.CharField(source='job_posting.company.company_name', read_only=True)
    seeker_name = serializers.CharField(source='job_seeker.full_name', read_only=True)
    seeker_email = serializers.CharField(source='job_seeker.email', read_only=True)
    job_required_skills = serializers.ListField(
        source='job_posting.required_skills',
        child=serializers.CharField(),
        read_only=True
    )
    seeker_skills = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job_title',
            'company_name',
            'seeker_name',
            'seeker_email',
            'status',
            'cover_letter',
            'applied_at',
            'updated_at',
            'job_required_skills',
            'seeker_skills',
        ]

    def get_seeker_skills(self, obj):
        """استخراج مهارات الباحث من SeekerProfile"""
        try:
            seeker_profile = obj.job_seeker.seeker_profile
            skills = seeker_profile.skills.values_list('name', flat=True)
            return list(skills)
        except:
            return []


class JobApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['status']
