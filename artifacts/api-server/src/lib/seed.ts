import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logger } from "./logger";

const ADMIN_ACCOUNTS = [
  { username: "eyuelg", password: "choir2123" },
  { username: "yegetaa", password: "choir3212" },
  { username: "fiker", password: "choir6712" },
  { username: "lidiya", password: "choir6745" },
];

export async function seedAdmins(): Promise<void> {
  for (const admin of ADMIN_ACCOUNTS) {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, admin.username));
    if (!existing) {
      const passwordHash = await bcrypt.hash(admin.password, 12);
      await db.insert(usersTable).values({
        username: admin.username,
        passwordHash,
        role: "admin",
        voicePart: "Normal",
      });
      logger.info({ username: admin.username }, "Created admin account");
    }
  }
}
