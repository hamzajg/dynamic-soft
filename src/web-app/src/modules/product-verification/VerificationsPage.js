import React, { useEffect, useState } from "react";
import { PageHeader, ContentCard } from "../../ui/Shared";
import { VerificationProvider, useVerification } from "./VerificationProvider";
import RunTable from "./components/RunTable";
import NewRunDialog from "./components/NewRunDialog";

function Dashboard() {
  const { runs, loading, fetchRuns, triggerRun } = useVerification();
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  return (
    <div>
      <PageHeader
        title="Verification"
        subtitle="Specification end-to-end verification runs"
        actionLabel="New Run"
        onAction={() => setShowNew(true)}
      />

      <ContentCard noPadding>
        {loading ? (
          <div className="p-6 text-text-secondary">Loading...</div>
        ) : (
          <RunTable runs={runs} />
        )}
      </ContentCard>

      {showNew && (
        <NewRunDialog
          onClose={() => setShowNew(false)}
          onRun={(payload) => triggerRun(payload)}
        />
      )}
    </div>
  );
}

export default function VerificationsPage() {
  return (
    <VerificationProvider>
      <Dashboard />
    </VerificationProvider>
  );
}
