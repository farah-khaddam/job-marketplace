import axios from "axios";

// صيغة الـ Authorization مؤكدة من رد الباك إند (WWW-Authenticate: JobSeekerToken)
const AUTH_PREFIX = "JobSeekerToken";

// baseURL نسبي (مش http://127.0.0.1:8000) عشان يمر عبر Vite proxy المضبوط بـ vite.config.js
const api = axios.create({
  baseURL: "/api/seeker/",
});

const authHeaders = (token) => ({
  Authorization: `${AUTH_PREFIX} ${token}`,
});

// ─── Profile ───────────────────────────────────────────────
export const getProfile = (token) =>
  api.get("profile/", { headers: authHeaders(token) });

export const updateProfile = (profileData, token) =>
  api.put("profile/", profileData, { headers: authHeaders(token) });

// ─── CV ────────────────────────────────────────────────────
export const uploadCV = (file, token) => {
  const formData = new FormData();
  formData.append("cv", file);
  return api.post("profile/cv/", formData, {
    headers: {
      ...authHeaders(token),
      "Content-Type": "multipart/form-data",
    },
  });
};

// ─── Skills ────────────────────────────────────────────────
// افترضت اسم الحقل "name" - تأكدي من serializers.py عند الزميل أو من الـ DRF Browsable API
export const createSkill = (name, token) =>
  api.post("skills/", { name }, { headers: authHeaders(token) });

export const deleteSkill = (id, token) =>
  api.delete(`skills/${id}/`, { headers: authHeaders(token) });

// ─── Experience ────────────────────────────────────────────
// افترضت نفس أسماء الحقول المستخدمة بالفرونت (title, company, from, to, current)
export const createExperience = (data, token) =>
  api.post("experience/", data, { headers: authHeaders(token) });

export const updateExperience = (id, data, token) =>
  api.patch(`experience/${id}/`, data, { headers: authHeaders(token) });

export const deleteExperience = (id, token) =>
  api.delete(`experience/${id}/`, { headers: authHeaders(token) });

// ─── Education ─────────────────────────────────────────────
// نفس الملاحظة: تأكدي من أسماء الحقول (degree, institution, year)
export const createEducation = (data, token) =>
  api.post("education/", data, { headers: authHeaders(token) });

export const updateEducation = (id, data, token) =>
  api.patch(`education/${id}/`, data, { headers: authHeaders(token) });

export const deleteEducation = (id, token) =>
  api.delete(`education/${id}/`, { headers: authHeaders(token) });