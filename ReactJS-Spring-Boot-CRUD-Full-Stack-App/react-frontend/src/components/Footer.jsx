import React from "react";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div>NexHR HR Operations</div>

      <div>© {new Date().getFullYear()} Employee Management System</div>
    </footer>
  );
}
