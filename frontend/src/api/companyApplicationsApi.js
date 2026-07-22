// api/companyApplicationsApi.js
import { API_BASE } from "../config"

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token")
  return {
    Authorization: `CompanyToken ${token}`,
    ...extra,
  }
}

async function parseErrorText(res) {
  try {
    const data = await res.json()
    return data.error || data.detail || JSON.stringify(data)
  } catch {
    return res.statusText || `Request failed (${res.status})`
  }
}

// بنجيب كل طلبات الشركة مرة وحدة، والفلترة حسب الوظيفة (لصفحة وظيفة وحدة)
// بتصير بالفرونت إند بواسطة filterApplicationsByJob — هيك ما في اعتماد على
// وجود query param ?job= بالباك إند.
export async function fetchCompanyApplications() {
  const res = await fetch(`${API_BASE}/applications/company/applications/`, {
    headers: authHeaders(),
  })

  if (!res.ok) {
    throw new Error(await parseErrorText(res))
  }

  const data = await res.json()
  return Array.isArray(data) ? data : data.results || []
}

export async function updateApplicationStatus(applicationId, status) {
  const res = await fetch(`${API_BASE}/applications/company/applications/${applicationId}/`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    throw new Error(await parseErrorText(res))
  }

  return res.json()
}