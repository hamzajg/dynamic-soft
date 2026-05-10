const API_BASE = "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  if (path.endsWith("/log") || path.endsWith("/report")) {
    return res.text();
  }
  return res.json();
}

export function listSuites() {
  return request("/api/v1/spec-suites");
}

export function listLocalProjects() {
  return request("/api/v1/local-projects");
}

export function getSuite(name) {
  return request(`/api/v1/spec-suites/${name}`);
}

export function listRuns(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/v1/verifications${qs ? "?" + qs : ""}`);
}

export function getRun(runId) {
  return request(`/api/v1/verifications/${runId}`);
}

export function triggerRun(payload) {
  return request("/api/v1/verifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteRun(runId) {
  return request(`/api/v1/verifications/${runId}`, { method: "DELETE" });
}

export function getLog(runId, suite, scenario) {
  return request(`/api/v1/verifications/${runId}/log?suite=${suite}&scenario=${scenario}`);
}

export function getReport(runId, suite, scenario) {
  return request(`/api/v1/verifications/${runId}/report?suite=${suite}&scenario=${scenario}`);
}

export function listScreenshots(runId, suite, scenario) {
  return request(`/api/v1/verifications/${runId}/screenshots?suite=${suite}&scenario=${scenario}`);
}

export function listFrames(runId, suite, scenario) {
  return request(`/api/v1/verifications/${runId}/frames?suite=${suite}&scenario=${scenario}`);
}

export function screenshotUrl(runId, suite, scenario, filename) {
  return `/api/v1/verifications/${runId}/screenshots/${filename}?suite=${suite}&scenario=${scenario}`;
}

export function frameUrl(runId, suite, scenario, filename) {
  return `/api/v1/verifications/${runId}/frames/${filename}?suite=${suite}&scenario=${scenario}`;
}

export function videoUrl(runId, suite, scenario) {
  return `/api/v1/verifications/${runId}/video?suite=${suite}&scenario=${scenario}`;
}
