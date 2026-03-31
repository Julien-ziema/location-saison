import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { parseId } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const params = await context.params;
  const id = parseId(params);
  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const result = await db
    .select({
      id: properties.id,
      name: properties.name,
      address: properties.address,
      description: properties.description,
      capacity: properties.capacity,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      surface: properties.surface,
      amenities: properties.amenities,
      photos: properties.photos,
      pricePerNight: properties.pricePerNight,
      defaultDepositPercent: properties.defaultDepositPercent,
      defaultCautionAmount: properties.defaultCautionAmount,
      createdAt: properties.createdAt,
    })
    .from(properties)
    .where(and(eq(properties.id, id), isNull(properties.deletedAt)))
    .limit(1);

  if (!result[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}
