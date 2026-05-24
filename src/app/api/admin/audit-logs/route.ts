import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/audit-logs - Get audit logs with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!['ADMIN'].includes((session?.user as any)?.role || "")) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const resource = searchParams.get("resource");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }
    
    if (resource) {
      where.resourceType = resource;
    }
    
    if (status) {
      where.outcome = status.toLowerCase(); // Map SUCCESS/FAILURE to outcome field in db if it uses lowercase
    }

    const total = await db.auditEvent.count({ where });
    const logs = await db.auditEvent.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { occurredAt: "desc" },
    });

    const formattedLogs = logs.map(l => ({
      id: l.id,
      userId: l.userId,
      userEmail: "", // The DB schema doesn't store userEmail natively on auditEvent, we map what we have
      userName: l.userName || "System",
      action: l.action,
      resource: l.resourceType,
      resourceId: l.resourceId,
      description: l.outcomeDescription || "",
      status: l.outcome.toUpperCase(),
      ipAddress: l.ipAddress || "",
      createdAt: l.occurredAt.toISOString(),
    }));

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/audit-logs - Create audit log entry
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!['ADMIN'].includes((session?.user as any)?.role || "")) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();

    const log = await db.auditEvent.create({
      data: {
        type: body.type || "OTHER",
        action: body.action,
        userId: session?.user?.email ? undefined : body.userId, // Can map to user ID if we have it, simplified here
        userName: session?.user?.name || body.userName || "System",
        userRole: (session?.user as any)?.role || "SYSTEM",
        resourceType: body.resource || "Unknown",
        resourceId: body.resourceId,
        outcome: body.status?.toLowerCase() || "success",
        outcomeDescription: body.description,
        ipAddress: body.ipAddress || null,
        occurredAt: new Date(),
      }
    });

    const formattedLog = {
      id: log.id,
      userId: log.userId,
      userEmail: session?.user?.email || body.userEmail,
      userName: log.userName,
      action: log.action,
      resource: log.resourceType,
      resourceId: log.resourceId,
      description: log.outcomeDescription,
      status: log.outcome.toUpperCase(),
      ipAddress: log.ipAddress,
      createdAt: log.occurredAt.toISOString(),
    };

    return NextResponse.json(formattedLog, { status: 201 });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}
