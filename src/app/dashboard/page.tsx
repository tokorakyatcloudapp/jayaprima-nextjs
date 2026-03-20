"use client";

import DashboardStats from "@/components/dashboard-stats";
import DashboardPanels from "./dashboard-panels";

export default function DashboardPage() {
  return (
    <div id="panelContainer">
      <div className="page-title">
        <div className="x_title">
          <h3 style={{ paddingBottom: "unset", marginBottom: "unset" }}>
            <b>Total</b>
          </h3>
        </div>

        <DashboardStats />

        <div className="row x_title" />
      </div>
      <div className="clearfix" />

      <DashboardPanels />
    </div>
  );
}
