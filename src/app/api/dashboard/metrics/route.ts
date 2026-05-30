import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/index";
import { db } from "@/lib/db";

// GET /api/dashboard/metrics - Real-time dashboard metrics from database
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }
    if (!["PHYSICIAN", "ADMIN", "NURSE", "MEDICAL_ASSISTANT"].includes((session?.user as any)?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const metrics = await calculateMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch metrics" } },
      { status: 500 }
    );
  }
}

async function calculateMetrics() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86_400_000);

  // ── Core counts from database ────────────────────────────────────────────
  const [
    totalPatients,
    activePatients,
    inactivePatients,
    totalPractitioners,
    activePractitioners,
    totalEncounters,
    todayEncounters,
    finishedEncounters,
    cancelledEncounters,
    inProgressEncounters,
    activeMedications,
    totalConditions,
    activeConditions,
    recentEncounterRows,
    encountersByTypeRows,
    encountersByDateRows,
  ] = await Promise.all([
    db.patient.count(),
    db.patient.count({ where: { status: "ACTIVE" } }),
    db.patient.count({ where: { status: "INACTIVE" } }),
    db.practitioner.count(),
    db.practitioner.count({ where: { active: true } }),
    db.encounter.count(),
    db.encounter.count({
      where: { periodStart: { gte: todayStart, lt: todayEnd } },
    }),
    db.encounter.count({ where: { status: "FINISHED" } }),
    db.encounter.count({ where: { status: "CANCELLED" } }),
    db.encounter.count({ where: { status: "IN_PROGRESS" } }),
    db.medicationRequest.count({ where: { status: "ACTIVE" } }),
    db.condition.count(),
    db.condition.count({ where: { clinicalStatus: "ACTIVE" } }),

    // Last 4 encounters for the appointment overview widget
    db.encounter.findMany({
      take: 4,
      orderBy: { periodStart: "desc" },
      include: {
        patient: {
          select: { firstName: true, lastName: true, id: true },
        },
      },
    }),

    // Encounter counts grouped by class (for bar chart)
    db.encounter.groupBy({
      by: ["class"],
      _count: { _all: true },
    }),

    // Encounters in the last 35 days grouped by date (for calendar dots)
    db.encounter.findMany({
      where: {
        periodStart: {
          gte: new Date(todayStart.getTime() - 34 * 86_400_000),
          lt: todayEnd,
        },
      },
      select: { periodStart: true },
    }),
  ]);

  // ── Encounter type distribution → bar chart percentages ─────────────────
  const classCountMap: Record<string, number> = {};
  for (const row of encountersByTypeRows) {
    classCountMap[row.class] = row._count._all;
  }
  const totalForChart = totalEncounters || 1;
  const ENCOUNTER_CLASSES = [
    { label: "Emergency",       class: "EMERGENCY",  from: "#dc2626", to: "#f87171" },
    { label: "Routine check-up",class: "AMBULATORY", from: "#4338ca", to: "#818cf8" },
    { label: "Appointment",     class: "OUTPATIENT", from: "#059669", to: "#34d399" },
    { label: "Physical therapy",class: "HOME",       from: "#b45309", to: "#fbbf24" },
    { label: "Telehealth",      class: "VIRTUAL",    from: "#1e40af", to: "#60a5fa" },
  ];
  const encounterStats = ENCOUNTER_CLASSES.map(ec => ({
    label: ec.label,
    value: Math.round(((classCountMap[ec.class] || 0) / totalForChart) * 100),
    from:  ec.from,
    to:    ec.to,
  }));

  // ── Calendar dot map: date string → count ────────────────────────────────
  const calendarDotMap: Record<string, number> = {};
  for (const enc of encountersByDateRows) {
    const key = enc.periodStart.toISOString().split("T")[0]; // "2025-02-04"
    calendarDotMap[key] = (calendarDotMap[key] || 0) + 1;
  }

  // ── Recent encounters for appointment overview ───────────────────────────
  const STATUS_MAP: Record<string, "success" | "danger" | "info"> = {
    FINISHED:    "success",
    CANCELLED:   "danger",
    IN_PROGRESS: "info",
    ARRIVED:     "info",
    PLANNED:     "info",
  };
  const recentAppointments = recentEncounterRows.map(enc => ({
    time:    formatTime(enc.periodStart),
    name:    `${enc.patient.firstName} ${enc.patient.lastName}`,
    type:    enc.reasonDisplay || enc.type || "General visit",
    status:  STATUS_MAP[enc.status] ?? "info",
    patientId: enc.patient.id,
    initial: enc.patient.firstName[0].toUpperCase(),
  }));

  // ── Risk tier approximation from active conditions ───────────────────────
  // Since no RiskScore model exists, we derive tiers from condition count per patient.
  // High risk  = patients with 3+ active conditions
  // Moderate   = patients with 1-2 active conditions
  // Low risk   = patients with 0 active conditions
  // We use condition aggregate to avoid N+1.
  const conditionCountRows = await db.condition.groupBy({
    by: ["patientId"],
    where: { clinicalStatus: "ACTIVE" },
    _count: { _all: true },
  });
  let highRisk = 0, moderateRisk = 0;
  for (const r of conditionCountRows) {
    if (r._count._all >= 3) highRisk++;
    else moderateRisk++;
  }
  const lowRisk = activePatients - highRisk - moderateRisk;
  const riskTotal = highRisk + moderateRisk + Math.max(lowRisk, 0);

  // ── KPI sub-labels ────────────────────────────────────────────────────────
  const inLeave   = totalPractitioners - activePractitioners;

  return {
    // ── KPI Cards ──────────────────────────────────────────────────────────
    kpi: {
      appointments: {
        value: todayEncounters,
        sub: `${inProgressEncounters} in progress · ${todayEncounters} today`,
        trend: todayEncounters > 0 ? "up" : "flat",
      },
      totalPatients: {
        value: activePatients,
        sub: `${activePatients} active · ${inactivePatients} inactive`,
        trend: "up",
      },
      overallRooms: {
        // No Room model in schema — return null so UI shows placeholder
        value: null as number | null,
        sub: "Room data unavailable",
        trend: "flat",
      },
      doctorsOnDuty: {
        value: activePractitioners,
        sub: `${activePractitioners} available · ${inLeave} inactive`,
        trend: activePractitioners > 0 ? "up" : "flat",
      },
      treatments: {
        value: activeMedications,
        sub: `${activeMedications} active · ${activeConditions} conditions`,
        trend: "up",
      },
    },

    // ── Patient risk analytics ─────────────────────────────────────────────
    riskAnalytics: {
      high:     highRisk,
      moderate: moderateRisk,
      low:      Math.max(lowRisk, 0),
      total:    riskTotal,
    },

    // ── Patients statistics (bar chart) ────────────────────────────────────
    encounterStats,

    // ── Summary counts ────────────────────────────────────────────────────
    summary: {
      totalScheduled: totalEncounters,
      completed:      finishedEncounters,
      missed:         cancelledEncounters,
    },

    // ── Appointment overview (last 4 encounters) ────────────────────────
    recentAppointments,

    // ── Calendar dots (date → count) ──────────────────────────────────────
    calendarDotMap,
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// POST /api/dashboard/metrics — reserved for internal metric updates
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }
    if (!["PHYSICIAN", "ADMIN", "NURSE", "MEDICAL_ASSISTANT"].includes((session?.user as any)?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ success: true, message: "Metric endpoint reserved" });
  } catch (error) {
    console.error("Error in metrics POST:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed" } },
      { status: 500 }
    );
  }
}
