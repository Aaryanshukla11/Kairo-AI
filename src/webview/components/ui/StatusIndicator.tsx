import React from "react";

export interface StatusIndicatorProps {
  label: string;
  type?: "success" | "warning" | "error" | "default";
}

/**
 * Reusable StatusIndicator component displaying active states with color indicators.
 */
export function StatusIndicator({ label, type = "default" }: StatusIndicatorProps): React.JSX.Element {
  return (
    <div className={`status-indicator status-${type}`}>
      <span className="status-dot"></span>
      <span className="status-label">{label}</span>
    </div>
  );
}
export default StatusIndicator;
