import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "./VerificationService";

const VerificationContext = createContext(null);

export function VerificationProvider({ children }) {
  const [runs, setRuns] = useState([]);
  const [suites, setSuites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listSuites();
      setSuites(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRuns = useCallback(async (params) => {
    try {
      setLoading(true);
      const data = await api.listRuns(params);
      setRuns(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerRun = useCallback(async (payload) => {
    const result = await api.triggerRun(payload);
    await fetchRuns();
    return result;
  }, [fetchRuns]);

  return (
    <VerificationContext.Provider value={{
      runs, suites, loading, error,
      fetchSuites, fetchRuns, triggerRun,
    }}>
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error("useVerification must be used within VerificationProvider");
  return ctx;
}
