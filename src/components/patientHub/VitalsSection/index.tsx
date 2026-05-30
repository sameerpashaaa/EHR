"use client";

import React from "react";
import { BloodPressureChart } from "./BloodPressureChart";
import { PulseRateCard } from "./PulseRateCard";
import { BloodOxygenCard } from "./BloodOxygenCard";

export function VitalsSection() {
  return (
    <div className="flex gap-4" style={{ alignItems: "stretch" }}>
      {/* Blood Pressure — takes up the majority of width */}
      <div style={{ flex: "3 1 0", minWidth: 0 }}>
        <BloodPressureChart />
      </div>
      {/* Pulse Rate */}
      <div style={{ flex: "1 1 0", minWidth: "140px" }}>
        <PulseRateCard />
      </div>
      {/* Blood Oxygen */}
      <div style={{ flex: "1 1 0", minWidth: "140px" }}>
        <BloodOxygenCard />
      </div>
    </div>
  );
}
