import { useState, useEffect, useCallback } from "react";
import * as api from "../../../VerificationService";
import * as localApi from "../../../LocalProjectService";

export default function useRunData(id, navigate) {
  const [run, setRun] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [frames, setFrames] = useState([]);
  const [frameAnnotations, setFrameAnnotations] = useState({});
  const [screenshots, setScreenshots] = useState([]);
  const [isLocal, setIsLocal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAnnotations = useCallback(async (runId, frameList) => {
    if (frameList.length === 0) return;
    const anns = {};
    await Promise.all(frameList.map(async (name) => {
      try {
        const a = await localApi.getFrameAnnotation(runId, name);
        if (a && a.description) anns[name] = a.description;
      } catch {}
    }));
    setFrameAnnotations(anns);
  }, []);

  const loadRun = useCallback(async () => {
    try {
      let runData;
      try {
        runData = await localApi.getRun(id);
        setIsLocal(true);
      } catch {
        runData = await api.getRun(id);
        setIsLocal(false);
      }
      setRun(runData);
      if (runData.test_results) setTestResults(runData.test_results);

      if (runData.output_dir) {
        const f = await localApi.getRunFrames(id).catch(() => []);
        setFrames(f);
        const s = await localApi.getRunScreenshots(id).catch(() => []);
        setScreenshots(s);
        if (f.length > 0) loadAnnotations(id, f);
      }

      if (runData.status === "queued" || runData.status === "running")
        setTimeout(loadRun, 2000);
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, loadAnnotations]);

  useEffect(() => { loadRun(); }, [loadRun]);

  const refreshArtifacts = useCallback(async () => {
    if (!run || !run.output_dir) return;
    const f = await localApi.getRunFrames(id).catch(() => []);
    setFrames(f);
    const s = await localApi.getRunScreenshots(id).catch(() => []);
    setScreenshots(s);
    if (f.length > 0) loadAnnotations(id, f);
  }, [id, run, loadAnnotations]);

  return { run, testResults, frames, frameAnnotations, screenshots, isLocal, loading, refreshArtifacts };
}
