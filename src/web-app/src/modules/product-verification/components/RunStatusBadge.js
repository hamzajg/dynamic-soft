import React from "react";
import { StatusBadge } from "../../../ui/Shared";

const statusColors = {
  passed: "success",
  failed: "danger",
  running: "warning",
  queued: "accent",
  error: "danger",
};

export default function RunStatusBadge({ status }) {
  return (
    <StatusBadge color={statusColors[status] || "accent"}>
      {status}
    </StatusBadge>
  );
}
