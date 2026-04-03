import { Router, type IRouter } from "express";
import { db, usersTable, attendanceTable, messagesTable, musicTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function requireAuth(req: any, res: any): boolean {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

async function requireAdmin(req: any, res: any): Promise<boolean> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
}

router.get("/users", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    role: usersTable.role,
    voicePart: usersTable.voicePart,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.role, "member")).orderBy(usersTable.username);

  res.json(users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })));
});

router.patch("/users/:id/voice-part", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const { voicePart } = req.body;
  if (!["Soprano", "Alto", "Normal"].includes(voicePart)) {
    res.status(400).json({ error: "Invalid voice part" });
    return;
  }

  const [user] = await db.update(usersTable)
    .set({ voicePart })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ ...user, createdAt: user.createdAt.toISOString() });
});

router.get("/admin/stats", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const today = getToday();

  const [members] = await db.select({ count: sql<number>`count(*)::int` })
    .from(usersTable).where(eq(usersTable.role, "member"));

  const [soprano] = await db.select({ count: sql<number>`count(*)::int` })
    .from(usersTable).where(and(eq(usersTable.role, "member"), eq(usersTable.voicePart, "Soprano")));

  const [alto] = await db.select({ count: sql<number>`count(*)::int` })
    .from(usersTable).where(and(eq(usersTable.role, "member"), eq(usersTable.voicePart, "Alto")));

  const [normal] = await db.select({ count: sql<number>`count(*)::int` })
    .from(usersTable).where(and(eq(usersTable.role, "member"), eq(usersTable.voicePart, "Normal")));

  const [presentToday] = await db.select({ count: sql<number>`count(*)::int` })
    .from(attendanceTable).where(and(eq(attendanceTable.status, "present"), eq(attendanceTable.date, today)));

  const [absentToday] = await db.select({ count: sql<number>`count(*)::int` })
    .from(attendanceTable).where(and(eq(attendanceTable.status, "absent"), eq(attendanceTable.date, today)));

  const [totalMessages] = await db.select({ count: sql<number>`count(*)::int` })
    .from(messagesTable);

  const [totalMusic] = await db.select({ count: sql<number>`count(*)::int` })
    .from(musicTable);

  res.json({
    totalMembers: members.count,
    sopranoCount: soprano.count,
    altoCount: alto.count,
    normalCount: normal.count,
    presentToday: presentToday.count,
    absentToday: absentToday.count,
    totalMessages: totalMessages.count,
    totalMusicFiles: totalMusic.count,
  });
});

export default router;
