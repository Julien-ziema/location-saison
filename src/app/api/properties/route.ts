import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq, isNull, desc, and } from "drizzle-orm";

const createPropertySchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  description: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  surface: z.number().int().min(1).optional(),
  amenities: z.array(z.string()).optional(),
  photos: z.array(z.string().url()).optional(),
  pricePerNight: z.number().int().positive().optional(),
  defaultDepositPercent: z.number().int().min(10).max(100).optional(),
  defaultCautionAmount: z.number().int().positive().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const result = await db
    .select()
    .from(properties)
    .where(and(eq(properties.userId, userId), isNull(properties.deletedAt)))
    .orderBy(desc(properties.createdAt));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const {
    name,
    address,
    description,
    capacity,
    bedrooms,
    bathrooms,
    surface,
    amenities,
    photos,
    pricePerNight,
    defaultDepositPercent,
    defaultCautionAmount,
  } = parsed.data;

  const [created] = await db
    .insert(properties)
    .values({
      userId,
      name,
      address,
      description,
      capacity,
      bedrooms,
      bathrooms,
      surface,
      amenities,
      photos,
      pricePerNight,
      defaultDepositPercent,
      defaultCautionAmount,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
