import React from "react";
import { StatusIndicator } from "../ui/StatusIndicator";

/**
 * Header component displaying the application title and workspace status indicator.
 */
export function Header(): React.JSX.Element {
  return (
    <header className="app-header">
      <div className="header-title-container">
        <span className="header-title">Sasta-Antigravity</span>
        <span className="header-subtitle">Offline AI Software Engineer</span>
      </div>
      <StatusIndicator label="Status: Ready" type="success" />
    </header>
  );
}
export default Header;
