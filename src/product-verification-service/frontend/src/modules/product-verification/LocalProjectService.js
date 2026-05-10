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
  return res.json();
}

async function requestText(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.text();
}

async function requestBlob(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.blob();
}

// Project management
export async function scanLocalProject(projectPath) {
  return request("/api/v1/local-projects/scan", {
    method: "POST",
    body: JSON.stringify({ path: projectPath }),
  });
}

export async function importLocalProject(projectPath) {
  return request("/api/v1/local-projects", {
    method: "POST",
    body: JSON.stringify({ path: projectPath }),
  });
}

export async function listLocalProjects() {
  return request("/api/v1/local-projects");
}

export async function syncLocalProject(projectId) {
  return request(`/api/v1/local-projects/${projectId}/sync`, {
    method: "POST",
  });
}

export async function deleteLocalProject(projectId) {
  return request(`/api/v1/local-projects/${projectId}`, {
    method: "DELETE",
  });
}

// Run operations
export async function runLocalProject(projectId, { testFiles, mode, envVars } = {}) {
  return request(`/api/v1/local-projects/${projectId}/run`, {
    method: "POST",
    body: JSON.stringify({
      test_files: testFiles || [],
      mode: mode || "default",
      env_vars: envVars || {},
    }),
  });
}

export async function listAllRuns() {
  return request("/api/v1/local-projects/runs");
}

export async function getRun(runId) {
  return request(`/api/v1/local-projects/runs/${runId}`);
}

export async function getRunTests(runId) {
  return request(`/api/v1/local-projects/runs/${runId}/tests`);
}

// Artifacts
export function getRunLogUrl(runId, testFile, logType) {
  let url = `/api/v1/local-projects/runs/${runId}/log`;
  const params = [];
  if (testFile) params.push(`test_file=${encodeURIComponent(testFile)}`);
  if (logType) params.push(`log_type=${logType}`);
  if (params.length) url += "?" + params.join("&");
  return url;
}

export async function getRunLog(runId, testFile, logType) {
  return requestText(getRunLogUrl(runId, testFile, logType));
}

export function getRunVideoUrl(runId) {
  return `/api/v1/local-projects/runs/${runId}/video`;
}

export async function getRunFrames(runId) {
  return request(`/api/v1/local-projects/runs/${runId}/frames`);
}

export function getRunFrameUrl(runId, frameName) {
  return `/api/v1/local-projects/runs/${runId}/frames/${encodeURIComponent(frameName)}`;
}

export async function getRunScreenshots(runId) {
  return request(`/api/v1/local-projects/runs/${runId}/screenshots`);
}

export function getRunScreenshotUrl(runId, screenshotName) {
  return `/api/v1/local-projects/runs/${runId}/screenshots/${encodeURIComponent(screenshotName)}`;
}

export function getRunReportUrl(runId) {
  return `/api/v1/local-projects/runs/${runId}/report`;
}

export async function getRunReport(runId) {
  return requestText(getRunReportUrl(runId));
}

// Rich test results
export async function getRunResults(runId) {
  return request(`/api/v1/local-projects/runs/${runId}/results`);
}

// Frame annotations
export async function getFrameAnnotation(runId, frameName) {
  return request(`/api/v1/local-projects/runs/${runId}/frames/${encodeURIComponent(frameName)}/annotations`);
}

export async function saveFrameAnnotation(runId, frameName, shapes, description) {
  return request(`/api/v1/local-projects/runs/${runId}/frames/${encodeURIComponent(frameName)}/annotations`, {
    method: "POST",
    body: JSON.stringify({ shapes, description }),
  });
}

export async function uploadFrame(runId, blob, name) {
  const formData = new FormData();
  formData.append("frame", blob, name);
  const res = await fetch(`/api/v1/local-projects/runs/${runId}/frames/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function deleteFrame(runId, frameName) {
  return request(`/api/v1/local-projects/runs/${runId}/frames/${encodeURIComponent(frameName)}`, {
    method: "DELETE",
  });
}

export async function analyzeFrame(runId, frameName, opts = {}) {
  return request(`/api/v1/local-projects/runs/${runId}/frames/${encodeURIComponent(frameName)}/analyze`, {
    method: "POST",
    body: JSON.stringify({ backend: opts.backend || null, model: opts.model || null }),
  });
}
