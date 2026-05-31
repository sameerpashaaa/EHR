import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_PATIENTS as ALL_MOCK_PATIENTS } from "@/data/mockPatients";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!['PHYSICIAN', 'ADMIN', 'NURSE', 'MEDICAL_ASSISTANT'].includes((session?.user as any)?.role || "")) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";

    // Simulated network delay for AI processing feel
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // --- AGENTIC INTENT PARSER ---
    // If the query looks like a complex intent, we generate an autonomous action.
    let autonomousActions: any[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Example Intent: "Refill Metformin 500mg for Raj Kumar for 3 months and send WhatsApp"
    if (lowerQuery.includes("refill") || lowerQuery.includes("prescribe")) {
      // NLP simulation for demo
      const hasDrug = lowerQuery.includes("metformin") ? "Metformin 500mg" : (lowerQuery.includes("drug") ? "Medication" : null);
      const hasPatient = lowerQuery.includes("raj") ? "Raj Kumar" : "Selected Patient";
      const hasDuration = lowerQuery.includes("months") ? "3 Months" : "1 Month";
      const hasChannel = lowerQuery.includes("whatsapp") ? "WhatsApp" : "SMS";

      if (hasDrug || lowerQuery.length > 15) {
        autonomousActions.push({
          type: "autonomous agent",
          title: `Autonomous Action: ${lowerQuery.includes("refill") ? "Refill" : "Prescribe"} ${hasDrug || "Medication"}`,
          subtitle: `Patient: ${hasPatient} • Duration: ${hasDuration} • Notify: ${hasChannel}`,
          iconName: "Sparkles",
          href: "#",
          isExecutable: true,
          actionPayload: {
            drug: hasDrug,
            patient: hasPatient,
            duration: hasDuration,
            notification: hasChannel
          }
        });
      }
    }
    // -----------------------------

    // Static application navigations
    const PAGES = [
      { type: "page", title: "Dashboard", subtitle: "Overview and metrics", iconName: "LayoutDashboard", href: "/" },
      { type: "page", title: "Schedule", subtitle: "Appointment management", iconName: "Calendar", href: "/schedule" },
      { type: "page", title: "Prescribe", subtitle: "Medications & prescriptions", iconName: "ClipboardList", href: "/prescribe" },
      { type: "page", title: "Transcript", subtitle: "Clinical notes & AI scribe", iconName: "FileText", href: "/transcript" },
      { type: "page", title: "Centralized Patient Dashboard", subtitle: "Patient registry and intake", iconName: "Users", href: "/patients" },
      { type: "page", title: "Predictive Timeline", subtitle: "AI health forecasting", iconName: "TrendingUp", href: "/predictive-timeline" },
      { type: "page", title: "WhatsApp Sync", subtitle: "Triage remote patients", iconName: "MessageCircle", href: "/whatsapp-sync" },
      { type: "page", title: "Settings", subtitle: "System configurations", iconName: "Settings", href: "/admin" },
    ];

    // AI specific tasks/actions

    const AI_ACTIONS = [
      { type: "ai action", title: "Draft WhatsApp Reply", subtitle: "Generate AI response for patient queries", iconName: "Sparkles", href: "/whatsapp-sync" },
      { type: "ai action", title: "Start Voice Consult", subtitle: "Trilingual audio assessment", iconName: "Mic", href: "/transcript" },
      { type: "ai action", title: "Analyze Lab Reports", subtitle: "Extract vitals using OCR", iconName: "Brain", href: "/documents" },
    ];

    // Patients lookup (simulating DB query)
    const MOCK_PATIENTS = ALL_MOCK_PATIENTS.map(p => {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      let subtitle = "";
      if (p.abhaId) subtitle += `ABHA: ${p.abhaId} • `;
      else if (p.id) subtitle += `${p.id} • `;
      subtitle += `${age}y • ${p.gender.toUpperCase()}`;
      if (p.primaryCondition) subtitle += ` • ${p.primaryCondition}`;

      return {
        type: "patient",
        title: p.fullName,
        subtitle,
        iconName: "User",
        href: `/patients/${p.id}`
      };
    });

    const allData = [...PAGES, ...AI_ACTIONS, ...MOCK_PATIENTS];

    // Basic NLP-like fuzzy matching
    const tokens = query.split(/\s+/).filter(Boolean);
    let results = allData.filter((item) =>
      tokens.every(token =>
        item.title.toLowerCase().includes(token) ||
        item.subtitle.toLowerCase().includes(token) ||
        item.type.toLowerCase().includes(token)
      )
    );

    // Also search real patients from the DB
    if (tokens.length > 0) {
      const realPatients = await db.patient.findMany({
        where: {
          AND: tokens.map((token: string) => ({
            OR: [
              { firstName: { contains: token, mode: "insensitive" } },
              { lastName: { contains: token, mode: "insensitive" } },
              { mrn: { contains: token, mode: "insensitive" } },
              { abhaId: { contains: token, mode: "insensitive" } },
              { telecoms: { some: { value: { contains: token, mode: "insensitive" } } } }
            ]
          }))
        },
        take: 10
      });

      const formattedRealPatients = realPatients.map(p => {
        const age = p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : "?";
        let subtitle = "";
        if (p.abhaId) subtitle += `ABHA: ${p.abhaId} • `;
        else if (p.mrn) subtitle += `${p.mrn} • `;
        subtitle += `${age}y • ${p.gender.toUpperCase()}`;

        return {
          type: "patient",
          title: `${p.firstName} ${p.lastName}`,
          subtitle,
          iconName: "User",
          href: `/patients/${p.id}`
        };
      });

      results = [...results, ...formattedRealPatients];
    }

    // Prioritize Autonomous Actions
    results = [...autonomousActions, ...results].slice(0, 8);

    return NextResponse.json({ results }); // Return max 8 matches

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
