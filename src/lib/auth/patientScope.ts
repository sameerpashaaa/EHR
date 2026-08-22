import { SessionUser } from "@/types";

/**
 * Returns Prisma query filter objects to scope data based on the user's role.
 */
export function getPatientScopeFilter(user: SessionUser | undefined | null) {
  if (!user) {
    return { id: "UNAUTHORIZED_NO_ACCESS" }; // Force empty result
  }

  // If the user is a PATIENT, they can only access their own patient record
  if (user.role === "PATIENT") {
    const patientId = (user as any).patientId;
    if (!patientId) return { id: "UNAUTHORIZED_NO_ACCESS" };
    return { id: patientId };
  }

  // If the user is a clinical staff member and restricted to an organization, we could add org filtering here.
  // For now, staff can see all patients.
  return {};
}

/**
 * For queries on related tables (e.g. encounters, prescriptions), filters by patientId.
 */
export function getRelatedPatientScopeFilter(user: SessionUser | undefined | null) {
  if (!user) {
    return { patientId: "UNAUTHORIZED_NO_ACCESS" };
  }

  if (user.role === "PATIENT") {
    const patientId = (user as any).patientId;
    if (!patientId) return { patientId: "UNAUTHORIZED_NO_ACCESS" };
    return { patientId };
  }

  return {};
}

/**
 * Returns a select object for Prisma to restrict fields based on role.
 * e.g., FRONT_DESK should not see clinical data.
 */
export function getPatientSelectScope(user: SessionUser | undefined | null) {
  if (!user) return { id: true };

  // If the user is FRONT_DESK, they only see demographics.
  if (user.role === "FRONT_DESK") {
    return {
      id: true,
      mrn: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
      telecoms: true,
      addresses: true,
      // Exclude clinical fields: ssn, medications, conditions, allergies, etc.
    };
  }

  // Default: return undefined (which means all fields or default select in the query)
  return undefined;
}
