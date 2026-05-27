import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  role: z.enum(["Physician", "Nurse Practitioner", "Administrator", "Other"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    // Map role
    let mappedRole: "PHYSICIAN" | "NURSE" | "ADMIN" | "FRONT_DESK" = "FRONT_DESK";
    if (validated.role === "Physician") {
      mappedRole = "PHYSICIAN";
    } else if (validated.role === "Nurse Practitioner") {
      mappedRole = "NURSE";
    } else if (validated.role === "Administrator") {
      mappedRole = "ADMIN";
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Generate unique identifier for organization
    const orgIdentifier = `ORG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Use transaction to create org and user
    const result = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          identifier: orgIdentifier,
          name: validated.organizationName,
        },
      });

      const user = await tx.user.create({
        data: {
          email: validated.email.toLowerCase(),
          name: validated.name,
          password: hashedPassword,
          role: mappedRole,
          organizationId: org.id,
        },
      });

      return { user, org };
    });

    return NextResponse.json({
      success: true,
      message: "Workspace created successfully.",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
