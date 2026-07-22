// utils/applicationsHelpers.js
//
// ملاحظة: هاي الدوال بتتعامل بمرونة مع شوي احتمالات لأسماء حقول الوظيفة
// (job / job_id / job_posting) لأنو ما لازم نلمس الباك إند — إذا الحقل
// المتوقع مش موجود بالـ response، منرجع لأقرب بديل موجود بدون ما نطيح الصفحة.

function getJobId(app) {
  return app.job ?? app.job_id ?? app.job_posting ?? app.job_posting_id ?? null
}

// TODO(Farah): الـ endpoint الحالي (/api/applications/company/applications/) عم يرجّع
// شكل متداخل (applicant_profile: {full_name, email, skills...}) وما فيه ولا حقل
// يدل على الوظيفة (لا job_title ولا job id). لهيك منقرا full_name/email/skills من
// جوا applicant_profile كـ fallback، بس عنوان الوظيفة والمطابقة (match score) ما
// فيهن حل من الفرونت إند لحاله - لازم الباك إند يضيف job_title/job id لل response.
function getApplicantProfile(app) {
  return app.applicant_profile || null
}

export function getJobTitle(app) {
  return app.job_title || app.job?.title || app.job_posting?.title || null
}

export function getAppliedAt(app) {
  return app.applied_at || app.created_at || null
}

export function getSeekerName(app) {
  return app.seeker_name || getApplicantProfile(app)?.full_name || null
}

export function getSeekerEmail(app) {
  return app.seeker_email || getApplicantProfile(app)?.email || null
}

export function getRequiredSkills(app) {
  const skills = app.job_required_skills
  return Array.isArray(skills) ? skills : []
}

export function getSeekerSkills(app) {
  if (Array.isArray(app.seeker_skills)) return app.seeker_skills

  const profile = getApplicantProfile(app)
  if (profile && Array.isArray(profile.skills)) {
    // شكل الحقل من ApplicantProfileSerializer.get_skills هو [{name: "..."}], مش نصوص مباشرة
    return profile.skills.map(s => (typeof s === "string" ? s : s?.name)).filter(Boolean)
  }
  return []
}

// نسبة تطابق مهارات الباحث مع متطلبات الوظيفة (0-100)، أو null إذا ما في
// بيانات كافية للمقارنة (يخلي الـ UI يعرض "—" بدل رقم مضلل)
export function getMatchScore(app) {
  const required = getRequiredSkills(app).map(s => s.toLowerCase().trim())
  const seeker = new Set(getSeekerSkills(app).map(s => s.toLowerCase().trim()))

  if (required.length === 0) return null

  const matched = required.filter(skill => seeker.has(skill)).length
  return Math.round((matched / required.length) * 100)
}

export function formatAppliedDate(dateStr, isAr) {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return "-"

  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000)

  if (diffDays <= 0) return isAr ? "اليوم" : "Today"
  if (diffDays === 1) return isAr ? "أمس" : "Yesterday"
  if (diffDays < 7) return isAr ? `قبل ${diffDays} أيام` : `${diffDays}d ago`

  return date.toLocaleDateString(isAr ? "ar" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// يجمع الطلبات حسب الوظيفة. بيفضّل التجميع حسب job id إذا موجود،
// وإذا لأ (الباك إند القديم ما بيرجعو) بيرجع للتجميع حسب العنوان كحل بديل.
export function groupApplicationsByJob(applications) {
  const groups = new Map()

  for (const app of applications) {
    const jobId = getJobId(app)
    const key = jobId != null ? `id:${jobId}` : `title:${getJobTitle(app)}`

    if (!groups.has(key)) {
      groups.set(key, {
        jobId: jobId != null ? jobId : key,
        jobTitle: getJobTitle(app),
        applications: [],
      })
    }
    groups.get(key).applications.push(app)
  }

  return Array.from(groups.values())
}

// طلبات وظيفة واحدة بس (لصفحة /company/jobs/:jobId/applications)
export function filterApplicationsByJob(applications, jobId) {
  if (jobId == null) return applications
  const target = String(jobId)
  return applications.filter(app => String(getJobId(app)) === target)
}

export function sortApplications(applications, sortBy) {
  const list = [...applications]

  if (sortBy === "oldest") {
    return list.sort(
      (a, b) => new Date(getAppliedAt(a) || 0) - new Date(getAppliedAt(b) || 0)
    )
  }

  if (sortBy === "match") {
    return list.sort((a, b) => (getMatchScore(b) ?? -1) - (getMatchScore(a) ?? -1))
  }

  // newest (default)
  return list.sort(
    (a, b) => new Date(getAppliedAt(b) || 0) - new Date(getAppliedAt(a) || 0)
  )
}