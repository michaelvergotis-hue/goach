import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthInfo } from "@/lib/server/auth";

export const runtime = "nodejs";

// GET - fetch groups for a user, or all groups (admin)
export async function GET(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const all = searchParams.get("all"); // For admin to get all groups

  const sql = getDb();

  try {
    if (all === "true") {
      if (!auth.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Get all groups with member counts (admin)
      const groups = await sql`
        SELECT
          g.id,
          g.name,
          g.created_by,
          g.created_at,
          COUNT(gm.user_id) as member_count,
          ARRAY_AGG(gm.user_id) as members
        FROM groups g
        LEFT JOIN group_members gm ON g.id = gm.group_id
        GROUP BY g.id
        ORDER BY g.created_at DESC
      `;
      return NextResponse.json(groups);
    }

    if (userId && userId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const effectiveUserId = userId || auth.userId;

    // Get groups the user is a member of, including all members
    const groups = await sql`
      SELECT
        g.id,
        g.name,
        g.created_at,
        (
          SELECT ARRAY_AGG(gm2.user_id)
          FROM group_members gm2
          WHERE gm2.group_id = g.id
        ) as members
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ${effectiveUserId}
      ORDER BY g.name
    `;
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

// POST - create a new group (admin)
export async function POST(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, members } = body;

    if (!name) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }

    const sql = getDb();

    // Create the group
    const [group] = await sql`
      INSERT INTO groups (name, created_by)
      VALUES (${name}, ${auth.userId})
      RETURNING id, name, created_at
    `;

    // Add members if provided
    if (members && Array.isArray(members) && members.length > 0) {
      for (const userId of members) {
        await sql`
          INSERT INTO group_members (group_id, user_id)
          VALUES (${group.id}, ${userId})
          ON CONFLICT (group_id, user_id) DO NOTHING
        `;
      }
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}

// PUT - update group members
export async function PUT(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { groupId, members } = body;

    if (!groupId || !members) {
      return NextResponse.json({ error: "groupId and members required" }, { status: 400 });
    }

    const groupIdNum = typeof groupId === "number" ? groupId : parseInt(String(groupId));
    if (!Number.isFinite(groupIdNum)) {
      return NextResponse.json({ error: "Invalid groupId" }, { status: 400 });
    }

    const sql = getDb();

    // Remove all existing members
    await sql`DELETE FROM group_members WHERE group_id = ${groupIdNum}`;

    // Add new members
    for (const userId of members) {
      await sql`
        INSERT INTO group_members (group_id, user_id)
        VALUES (${groupIdNum}, ${userId})
        ON CONFLICT (group_id, user_id) DO NOTHING
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
  }
}

// DELETE - delete a group
export async function DELETE(request: NextRequest) {
  const auth = await getAuthInfo();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const sql = getDb();
  const groupIdNum = parseInt(groupId);
  if (!Number.isFinite(groupIdNum)) {
    return NextResponse.json({ error: "Invalid groupId" }, { status: 400 });
  }

  try {
    await sql`DELETE FROM groups WHERE id = ${groupIdNum}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
  }
}
