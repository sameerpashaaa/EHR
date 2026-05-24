import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/index";
import { hasPermission } from "@/lib/auth/roles";
import { patientUpdateSchema } from "@/lib/validation/patient";
import { z } from "zod";
import { db } from "@/lib/db";

// GET /api/patients/[id] - Get single patient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    if (!hasPermission(session.user.role as any, "patients:read")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
        { status: 403 }
      );
    }

    const patient = await db.patient.findUnique({
      where: { id: params.id },
      include: {
        telecoms: true,
        addresses: true,
        emergencyContacts: true,
        insurancePolicies: true,
        primaryPhysician: true,
      }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Patient not found" } },
        { status: 404 }
      );
    }

    const formattedPatient = {
      ...patient,
      dateOfBirth: patient.dateOfBirth.toISOString().split("T")[0],
      phone: patient.telecoms?.find((t) => t.system === "PHONE")?.value || "",
      email: patient.telecoms?.find((t) => t.system === "EMAIL")?.value || "",
      address: patient.addresses?.[0]
        ? `${patient.addresses[0].line1}, ${patient.addresses[0].city}, ${patient.addresses[0].state} ${patient.addresses[0].postalCode}`
        : "",
      primaryPhysician: patient.primaryPhysician 
        ? `${patient.primaryPhysician.lastName}, ${patient.primaryPhysician.firstName}`
        : "Unassigned",
    };

    return NextResponse.json({
      success: true,
      data: formattedPatient,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch patient",
        },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/patients/[id] - Update patient
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    if (!hasPermission(session.user.role as any, "patients:update")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = patientUpdateSchema.parse(body);

    const existingPatient = await db.patient.findUnique({
      where: { id: params.id }
    });

    if (!existingPatient) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Patient not found" } },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (validated.firstName !== undefined) updateData.firstName = validated.firstName;
    if (validated.lastName !== undefined) updateData.lastName = validated.lastName;
    if (validated.middleName !== undefined) updateData.middleName = validated.middleName;
    if (validated.gender !== undefined) updateData.gender = validated.gender;
    if (validated.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(validated.dateOfBirth);
    if (validated.status !== undefined) updateData.status = validated.status;

    // For a real production app, telecoms, addresses, emergencyContacts would be synced
    // For simplicity of this endpoint update, we just update the core scalar fields
    // if complex nested updates are passed, you would use prisma nested update/upsert/deleteMany here

    const updatedPatient = await db.patient.update({
      where: { id: params.id },
      data: updateData,
      include: {
        telecoms: true,
        addresses: true,
        emergencyContacts: true,
        insurancePolicies: true,
        primaryPhysician: true,
      }
    });

    const formattedPatient = {
      ...updatedPatient,
      dateOfBirth: updatedPatient.dateOfBirth.toISOString().split("T")[0],
      phone: updatedPatient.telecoms?.find((t) => t.system === "PHONE")?.value || "",
      email: updatedPatient.telecoms?.find((t) => t.system === "EMAIL")?.value || "",
      address: updatedPatient.addresses?.[0]
        ? `${updatedPatient.addresses[0].line1}, ${updatedPatient.addresses[0].city}, ${updatedPatient.addresses[0].state} ${updatedPatient.addresses[0].postalCode}`
        : "",
      primaryPhysician: updatedPatient.primaryPhysician 
        ? `${updatedPatient.primaryPhysician.lastName}, ${updatedPatient.primaryPhysician.firstName}`
        : "Unassigned",
    };

    return NextResponse.json({
      success: true,
      data: formattedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid patient data",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update patient",
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id] - Delete patient (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    if (!hasPermission(session.user.role as any, "patients:delete")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
        { status: 403 }
      );
    }

    const patient = await db.patient.findUnique({
      where: { id: params.id }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Patient not found" } },
        { status: 404 }
      );
    }

    // Soft delete by setting status to INACTIVE
    const updatedPatient = await db.patient.update({
      where: { id: params.id },
      data: { status: "INACTIVE" },
      include: {
        telecoms: true,
        addresses: true,
        emergencyContacts: true,
        insurancePolicies: true,
        primaryPhysician: true,
      }
    });

    const formattedPatient = {
      ...updatedPatient,
      dateOfBirth: updatedPatient.dateOfBirth.toISOString().split("T")[0],
      phone: updatedPatient.telecoms?.find((t) => t.system === "PHONE")?.value || "",
      email: updatedPatient.telecoms?.find((t) => t.system === "EMAIL")?.value || "",
      address: updatedPatient.addresses?.[0]
        ? `${updatedPatient.addresses[0].line1}, ${updatedPatient.addresses[0].city}, ${updatedPatient.addresses[0].state} ${updatedPatient.addresses[0].postalCode}`
        : "",
      primaryPhysician: updatedPatient.primaryPhysician 
        ? `${updatedPatient.primaryPhysician.lastName}, ${updatedPatient.primaryPhysician.firstName}`
        : "Unassigned",
    };

    return NextResponse.json({
      success: true,
      data: formattedPatient,
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete patient",
        },
      },
      { status: 500 }
    );
  }
}
