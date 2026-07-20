from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response

from jobs.models import JobPosting
from seeker_profiles.authentication import JobSeekerTokenAuthentication
from seeker_profiles.permissions import IsJobSeekerAuthenticated
from .services import EmbeddingService


@api_view(['GET'])
@authentication_classes([JobSeekerTokenAuthentication])
@permission_classes([IsJobSeekerAuthenticated])
def recommended_jobs_for_seeker(request):
    seeker = request.auth
    seeker_profile = getattr(seeker, 'seeker_profile', None)

    if seeker_profile is None:
        return Response({'detail': 'Seeker profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    embedding_service = EmbeddingService()
    seeker_text = ' '.join(filter(None, [
        seeker.full_name,
        seeker_profile.bio,
        seeker_profile.governorate,
        ' '.join(skill.name for skill in seeker_profile.skills.all()),
        ' '.join(f"{experience.title} {experience.company}" for experience in seeker_profile.experiences.all()),
        ' '.join(f"{education.degree} {education.institution}" for education in seeker_profile.education_entries.all()),
    ]))

    jobs = (
        JobPosting.objects.filter(status='open', is_active=True)
        .select_related('company', 'specialization')
        .prefetch_related('job_applications')
    )
    jobs = list(jobs)

    if not jobs:
        return Response([], status=status.HTTP_200_OK)

   
    job_texts = []
    for job in jobs:
        job_text = ' '.join(filter(None, [
            job.title,
            job.description,
            job.specialization.name_en if getattr(job.specialization, 'name_en', None) else '',
            job.specialization.name_ar if getattr(job.specialization, 'name_ar', None) else '',
            job.city,
            job.employment_type,
            job.work_mode,
        ]))
        job_texts.append(job_text)

   
    all_texts = [seeker_text] + job_texts
    all_vectors = embedding_service.encode_batch(all_texts)
    seeker_vector, job_vectors = all_vectors[0], all_vectors[1:]

  
    ranked = []
    for job, job_vector in zip(jobs, job_vectors):
        similarity = embedding_service.cosine_similarity(seeker_vector, job_vector)
        ranked.append({
            'id': job.id,
            'title': job.title,
            'company_name': job.company.company_name,
            'similarity_score': round(float(similarity), 4),
            'city': job.city,
            'employment_type': job.employment_type,
            'work_mode': job.work_mode,
            'status': job.status,
        })

    ranked.sort(key=lambda item: item['similarity_score'], reverse=True)
    return Response(ranked, status=status.HTTP_200_OK)