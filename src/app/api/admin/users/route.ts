import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["ADMIN", "PHYSICIAN", "NURSE", "MEDICAL_ASSISTANT", "FRONT_DESK", "PATIENT"]),
  department: z.string().optional(),
  organizationId: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/admin/users - List all users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!['ADMIN'].includes((session?.user as any)?.role || "")) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.isActive = status === "active";
    }

    const total = await db.user.count({ where });
    const users = await db.user.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        organization: true,
        practitioner: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map(u => ({
      ...u,
      twoFactorEnabled: false, // Not in schema, adding for backwards compatibility
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + users.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!['ADMIN'].includes((session?.user as any)?.role || "")) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const validated = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validated.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    let practitionerId = undefined;

    // If department is provided and it's a clinical role, we could create a practitioner
    if (validated.department && ['PHYSICIAN', 'NURSE', 'MEDICAL_ASSISTANT'].includes(validated.role)) {
       const newPractitioner = await db.practitioner.create({
         data: {
           identifier: `PRAC-${Date.now()}`,
           firstName: validated.name.split(' ')[0] || validated.name,
           lastName: validated.name.split(' ').slice(1).join(' ') || 'Unknown',
           specialty: validated.department,
           email: validated.email,
           active: validated.isActive,
         }
       });
       practitionerId = newPractitioner.id;
    }

    const user = await db.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        role: validated.role as any,
        isActive: validated.isActive,
        organizationId: validated.organizationId,
        practitionerId: practitionerId,
      },
      include: {
        organization: true,
        practitioner: true,
      }
    });

    const formattedUser = {
      ...user,
      twoFactorEnabled: false,
    };

    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
