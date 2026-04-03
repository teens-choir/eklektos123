import { Router, type IRouter } from "express";
import { db, usersTable, attendanceTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function getToday(): string {
  return new Date().toISOString().split("T")[0];
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

// IMPORTANT: /attendance/my-stats must come before /attendance/:userId
router.get("/attendance/my-stats", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const records = await db.select().from(attendanceTable)
    .where(eq(attendanceTable.userId, req.session.userId));

  const totalSessions = records.length;
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const attendanceRate = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

  res.json({ totalSessions, presentCount, absentCount, attendanceRate });
});

router.get("/attendance", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const today = getToday();
  const members = await db.select().from(usersTable).where(eq(usersTable.role, "member"));

  // Ensure all members have an attendance record for today
  for (const member of members) {
    const [existing] = await db.select().from(attendanceTable)
      .where(and(eq(attendanceTable.userId, member.id), eq(attendanceTable.date, today)));
    if (!existing) {
      await db.insert(attendanceTable).values({
        userId: member.id,
        status: "absent",
        date: today,
      });
    }
  }

  const records = await db.select({
    id: attendanceTable.id,
    userId: attendanceTable.userId,
    username: usersTable.username,
    voicePart: usersTable.voicePart,
    status: attendanceTable.status,
    date: attendanceTable.date,
  }).from(attendanceTable)
    .innerJoin(usersTable, eq(attendanceTable.userId, usersTable.id))
    .where(eq(attendanceTable.date, today))
    .orderBy(usersTable.voicePart, usersTable.username);

  res.json(records);
});

router.patch("/attendance/:userId", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const today = getToday();

  const { status } = req.body;
  if (!["present", "absent"].includes(status)) {
    res.status(400).json({ error: "Status must be 'present' or 'absent'" });
    return;
  }

  const [existing] = await db.select().from(attendanceTable)
    .where(and(eq(attendanceTable.userId, userId), eq(attendanceTable.date, today)));

  let record;
  if (existing) {
    [record] = await db.update(attendanceTable)
      .set({ status })
      .where(and(eq(attendanceTable.userId, userId), eq(attendanceTable.date, today)))
      .returning();
  } else {
    [record] = await db.insert(attendanceTable).values({
      userId,
      status,
      date: today,
    }).returning();
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  res.json({
    id: record.id,
    userId: record.userId,
    username: user?.username || "",
    voicePart: user?.voicePart || "Normal",
    status: record.status,
    date: record.date,
  });
});

export default router;
