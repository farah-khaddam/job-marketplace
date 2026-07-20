from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q, ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import JobSeeker, Company
from seeker_profiles.models import SeekerProfile
from jobs.models import JobPosting, Specialization  

from .authentication import AdminTokenAuthentication
from .pagination import AdminPagination
from .permissions import IsAdminUser
from .serializers import (
    AdminSeekerSerializer,
    AdminSeekerUpdateSerializer,
    AdminCompanySerializer,
    AdminCompanyRejectSerializer,
    AdminJobListSerializer,
    AdminJobDetailSerializer,
    AdminCVSerializer,
    AdminCategorySerializer,
)


class AdminBaseView:
    authentication_classes = [AdminTokenAuthentication]
    permission_classes = [IsAdminUser]


# ---------------------------------------------------------------------------
# 1) Job Seekers
# ---------------------------------------------------------------------------
class AdminSeekerListView(AdminBaseView, generics.ListAPIView):
    serializer_class = AdminSeekerSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = JobSeeker.objects.all().order_by("-created_at")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(full_name__icontains=search) | Q(email__icontains=search))
        return qs


class AdminSeekerDetailView(AdminBaseView, generics.RetrieveUpdateDestroyAPIView):
    queryset = JobSeeker.objects.all()

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return AdminSeekerUpdateSerializer
        return AdminSeekerSerializer


# ---------------------------------------------------------------------------
# 2) Companies
# ---------------------------------------------------------------------------
class AdminCompanyListView(AdminBaseView, generics.ListAPIView):
    serializer_class = AdminCompanySerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = Company.objects.all().order_by("-created_at")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(company_name__icontains=search) | Q(email__icontains=search))
        return qs


class AdminCompanyDetailView(AdminBaseView, generics.RetrieveDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = AdminCompanySerializer


class AdminCompanyApproveView(AdminBaseView, APIView):
    def post(self, request, pk):
        company = get_object_or_404(Company, pk=pk)
        company.approve()

        if not company.approval_email_sent:
            try:
                send_mail(
                    subject="تمت الموافقة على حساب شركتكم",
                    message=f"مرحباً {company.company_name}،\nتمت الموافقة على حسابكم على المنصة.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[company.email],
                    fail_silently=True,
                )
                company.approval_email_sent = True
                company.save(update_fields=["approval_email_sent"])
            except Exception:
                pass  

        return Response(AdminCompanySerializer(company).data)


class AdminCompanyRejectView(AdminBaseView, APIView):
    def post(self, request, pk):
        company = get_object_or_404(Company, pk=pk)
        serializer = AdminCompanyRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        company.rejection_reason = serializer.validated_data.get("reason", "")
        company.reject()
        company.save(update_fields=["rejection_reason"])

        if not company.rejection_email_sent:
            try:
                send_mail(
                    subject="بخصوص طلب تسجيل شركتكم",
                    message=(
                        f"مرحباً {company.company_name}،\n"
                        f"للأسف تم رفض طلب تسجيل حسابكم.\n"
                        f"السبب: {company.rejection_reason or 'غير محدد'}"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[company.email],
                    fail_silently=True,
                )
                company.rejection_email_sent = True
                company.save(update_fields=["rejection_email_sent"])
            except Exception:
                pass  

        return Response(AdminCompanySerializer(company).data)


# ---------------------------------------------------------------------------
# 3) Jobs
# ---------------------------------------------------------------------------
class AdminJobListView(AdminBaseView, generics.ListAPIView):
    serializer_class = AdminJobListSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = JobPosting.objects.select_related("company").order_by("-created_at")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(company__company_name__icontains=search)
            )
        return qs


class AdminJobDetailView(AdminBaseView, generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPosting.objects.all()
    serializer_class = AdminJobDetailSerializer


class AdminJobSuspendView(AdminBaseView, APIView):
    def post(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk)
        job.is_active = False
        job.save(update_fields=["is_active"])
        return Response(AdminJobListSerializer(job).data)


class AdminJobActivateView(AdminBaseView, APIView):
    def post(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk)
        job.is_active = True
        job.save(update_fields=["is_active"])
        return Response(AdminJobListSerializer(job).data)



class AdminCVListView(AdminBaseView, generics.ListAPIView):
    serializer_class = AdminCVSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = (
            SeekerProfile.objects.select_related("user")
            .exclude(cv_file="")
            .filter(cv_file__isnull=False)
            .order_by("-updated_at")
        )
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(user__full_name__icontains=search)
        return qs

    def get_serializer_context(self):
        return {"request": self.request}


class AdminCVDetailView(AdminBaseView, APIView):
    def delete(self, request, pk):
        profile = get_object_or_404(SeekerProfile, pk=pk)
        if profile.cv_file:
            profile.cv_file.delete(save=False)  
        profile.cv_file = None
        profile.save(update_fields=["cv_file"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# 5) Categories (= Specialization)
# ---------------------------------------------------------------------------
class AdminCategoryListCreateView(AdminBaseView, generics.ListCreateAPIView):
    serializer_class = AdminCategorySerializer
    pagination_class = None  

    def get_queryset(self):
        return AdminCategorySerializer.annotate_queryset(Specialization.objects.all())


class AdminCategoryDetailView(AdminBaseView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminCategorySerializer

    def get_queryset(self):
        return AdminCategorySerializer.annotate_queryset(Specialization.objects.all())

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {"detail": "لا يمكنك  حذف هذا التصنيف — يوجد وظائف مرتبطة فيه."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
