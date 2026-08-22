import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/index";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types";

import { PhysicianDashboard } from "./_physician/PhysicianDashboard";
import { NurseDashboard } from "./_nurse/NurseDashboard";
import { MedicalAssistantDashboard } from "./_ma/MedicalAssistantDashboard";
import { FrontDeskDashboard } from "./_frontdesk/FrontDeskDashboard";
import { AdminDashboard } from "./_admin/AdminDashboard";
import { GenericDashboard } from "./_shared/GenericDashboard";

export default async function DashboardRouterPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = session.user as SessionUser;

  switch (user.role) {
    case "PHYSICIAN":
      return <PhysicianDashboard user={user} />;
    case "NURSE":
      return <NurseDashboard user={user} />;
    case "MEDICAL_ASSISTANT":
      return <MedicalAssistantDashboard user={user} />;
    case "FRONT_DESK":
      return <FrontDeskDashboard user={user} />;
    case "ADMIN":
      return <AdminDashboard user={user} />;
    case "PATIENT":
      // Revert to Patient portal dashboard when ready
      return <GenericDashboard />;
    default:
      return <GenericDashboard />;
  }
}
