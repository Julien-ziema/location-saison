import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { parseId } from "@/lib/api/helpers";

const patchPropertySchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
  description: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const params = await context.params;
  const id = parseId(params);
  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, userId), isNull(properties.deletedAt)))
    .limit(1);

  if (!existing[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(properties)
    .set(parsed.data)
    .where(eq(properties.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const params = await context.params;
  const id = parseId(params);
  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, userId), isNull(properties.deletedAt)))
    .limit(1);

  if (!existing[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .update(properties)
    .set({ deletedAt: new Date() })
    .where(eq(properties.id, id));

  return new NextResponse(null, { status: 204 });
}
