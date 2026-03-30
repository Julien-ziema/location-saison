import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";

async function seed() {
  const email = "test@locaflow.dev";

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log("User déjà existant");
    return;
  }

  const hashedPassword = await bcrypt.hash("password", 12);

  await db.insert(users).values({
    email,
    name: "Test Owner",
    role: "owner",
    password: hashedPassword,
  });

  console.log("Seed terminé : test@locaflow.dev créé");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
