import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "edge";

// GET - fetch feed posts for a group
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const limit = parseInt(searchParams.get("limit") || "50");
  const before = searchParams.get("before"); // For pagination

  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const sql = getDb();

  try {
    let posts;
    if (before) {
      posts = await sql`
        SELECT id, user_id, post_type, content, created_at
        FROM feed_posts
        WHERE group_id = ${parseInt(groupId)}
          AND created_at < ${before}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      posts = await sql`
        SELECT id, user_id, post_type, content, created_at
        FROM feed_posts
        WHERE group_id = ${parseInt(groupId)}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

// POST - create a new feed post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, userId, postType, content } = body;

    if (!groupId || !userId || !postType || !content) {
      return NextResponse.json(
        { error: "groupId, userId, postType, and content required" },
        { status: 400 }
      );
    }

    // Valid post types: 'workout', 'pr', 'chat'
    if (!['workout', 'pr', 'chat'].includes(postType)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }

    const sql = getDb();

    // Verify user is a member of the group
    const [membership] = await sql`
      SELECT 1 FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${userId}
    `;

    if (!membership) {
      return NextResponse.json({ error: "User is not a member of this group" }, { status: 403 });
    }

    // Create the post
    const [post] = await sql`
      INSERT INTO feed_posts (group_id, user_id, post_type, content)
      VALUES (${groupId}, ${userId}, ${postType}, ${JSON.stringify(content)})
      RETURNING id, user_id, post_type, content, created_at
    `;

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

// DELETE - delete a post (own posts only)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const userId = searchParams.get("userId");

  if (!postId || !userId) {
    return NextResponse.json({ error: "postId and userId required" }, { status: 400 });
  }

  const sql = getDb();

  try {
    // Only delete if the user owns the post
    await sql`
      DELETE FROM feed_posts
      WHERE id = ${parseInt(postId)} AND user_id = ${userId}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
