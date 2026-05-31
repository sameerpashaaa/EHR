import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/index";
import { patientSchema, patientSearchSchema } from "@/lib/validation/patient";
import { hasPermission } from "@/lib/auth/roles";
import { generateMRN } from "@/lib/utils";
import { z } from "zod";
import { db } from "@/lib/db";

// GET /api/patients - List patients with search and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }
    if (!['PHYSICIAN', 'ADMIN', 'NURSE', 'MEDICAL_ASSISTANT'].includes((session?.user as any)?.role || "")) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (!hasPermission((session.user as any).role, "patients:read")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const params = {
      query: searchParams.get("query") || undefined,
      gender: searchParams.get("gender") || undefined,
      status: searchParams.get("status") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      sortBy: searchParams.get("sortBy") || "lastName",
      sortOrder: (searchParams.get("sortOrder") || "asc") as "asc" | "desc",
    };

    const validated = patientSearchSchema.parse(params);

    const where: any = {};
    
    if (validated.query) {
      const tokens = validated.query.split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        where.AND = tokens.map((token: string) => ({
          OR: [
            { firstName: { contains: token, mode: "insensitive" } },
            { lastName: { contains: token, mode: "insensitive" } },
            { mrn: { contains: token, mode: "insensitive" } },
            { abhaId: { contains: token, mode: "insensitive" } },
            { telecoms: { some: { value: { contains: token, mode: "insensitive" } } } },
          ]
        }));
      }
    }

    if (validated.gender) {
      where.gender = validated.gender;
    }

    if (validated.status) {
      where.status = validated.status;
    }

    const total = await db.patient.count({ where });
    const start = (validated.page - 1) * validated.limit;

    const paginatedPatients = await db.patient.findMany({
      where,
      orderBy: { [validated.sortBy]: validated.sortOrder },
      skip: start,
      take: validated.limit,
      include: {
        primaryPhysician: true,
        addresses: true,
        telecoms: true,
      }
    });

    // Transform DB model slightly to match frontend expected fields for the table
    const formattedPatients = paginatedPatients.map((p) => ({
      ...p,
      fullName: `${p.firstName} ${p.lastName}`,
      dateOfBirth: p.dateOfBirth.toISOString().split("T")[0],
      phone: p.telecoms?.find((t) => t.system === "PHONE")?.value || "",
      email: p.telecoms?.find((t) => t.system === "EMAIL")?.value || "",
      address: p.addresses?.[0]
        ? `${p.addresses[0].line1}, ${p.addresses[0].city}, ${p.addresses[0].state} ${p.addresses[0].postalCode}`
        : "",
      primaryPhysician: p.primaryPhysician 
        ? `${p.primaryPhysician.lastName}, ${p.primaryPhysician.firstName}`
        : "Unassigned",
      lastVisit: new Date().toISOString().split("T")[0], // Mock recent visit
      primaryCondition: "N/A"
    }));

    return NextResponse.json({
      success: true,
      data: formattedPatients,
      meta: {
        page: validated.page,
        limit: validated.limit,
        total,
        totalPages: Math.ceil(total / validated.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch patients",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create new patient
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }
    if (!['PHYSICIAN', 'ADMIN', 'NURSE', 'MEDICAL_ASSISTANT'].includes((session?.user as any)?.role || "")) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (!hasPermission((session.user as any).role, "patients:create")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = patientSchema.parse(body);

    // Check for duplicate
    const existingPatient = await db.patient.findFirst({
      where: {
        firstName: { equals: validated.firstName, mode: "insensitive" },
        lastName: { equals: validated.lastName, mode: "insensitive" },
        dateOfBirth: new Date(validated.dateOfBirth),
      }
    });

    if (existingPatient) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_PATIENT",
            message: "A patient with this name and DOB already exists",
          },
        },
        { status: 409 }
      );
    }

    // Create new patient
    const newPatient = await db.patient.create({
      data: {
        mrn: generateMRN(),
        firstName: validated.firstName,
        lastName: validated.lastName,
        middleName: validated.middleName || "",
        gender: validated.gender as any,
        dateOfBirth: new Date(validated.dateOfBirth),
        status: validated.status as any,
        telecoms: {
          create: validated.telecoms?.map((t: any) => ({
            system: t.system,
            value: t.value,
            use: t.use,
            isPrimary: t.isPrimary || false,
          })) || []
        },
        addresses: {
          create: validated.addresses?.map((a: any) => ({
            use: a.use,
            type: a.type || "BOTH",
            line1: a.line1,
            line2: a.line2 || "",
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            country: a.country || "US",
            isPrimary: a.isPrimary || false,
          })) || []
        },
        emergencyContacts: {
          create: validated.emergencyContacts?.map((e: any) => ({
            name: e.name,
            relationship: e.relationship,
            phone: e.phone,
            email: e.email || "",
            isPrimary: e.isPrimary || false,
          })) || []
        }
      },
      include: {
        telecoms: true,
        addresses: true,
        emergencyContacts: true,
      }
    });

    const formattedPatient = {
      ...newPatient,
      dateOfBirth: newPatient.dateOfBirth.toISOString().split("T")[0],
      phone: newPatient.telecoms?.find((t) => t.system === "PHONE")?.value || "",
      email: newPatient.telecoms?.find((t) => t.system === "EMAIL")?.value || "",
      address: newPatient.addresses?.[0]
        ? `${newPatient.addresses[0].line1}, ${newPatient.addresses[0].city}, ${newPatient.addresses[0].state} ${newPatient.addresses[0].postalCode}`
        : "",
      primaryPhysician: "Unassigned",
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedPatient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating patient:", error);
    
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
          message: "Failed to create patient",
        },
      },
      { status: 500 }
    );
  }
}
