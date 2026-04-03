import { Router, type IRouter } from "express";
import { db, usersTable, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

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

router.get("/messages", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  if (!currentUser) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const messages = await db.select({
    id: messagesTable.id,
    content: messagesTable.content,
    targetVoicePart: messagesTable.targetVoicePart,
    isAnnouncement: messagesTable.isAnnouncement,
    createdAt: messagesTable.createdAt,
    authorId: messagesTable.authorId,
  }).from(messagesTable).orderBy(messagesTable.createdAt);

  const authors = await db.select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable);
  const authorMap = new Map(authors.map(a => [a.id, a.username]));

  const filtered = currentUser.role === "admin"
    ? messages
    : messages.filter(m => m.targetVoicePart === null || m.targetVoicePart === currentUser.voicePart);

  res.json(filtered.map(m => ({
    id: m.id,
    content: m.content,
    targetVoicePart: m.targetVoicePart,
    isAnnouncement: m.isAnnouncement,
    createdAt: m.createdAt.toISOString(),
    authorUsername: authorMap.get(m.authorId) || "Admin",
  })));
});

router.post("/messages", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const { content, targetVoicePart, isAnnouncement } = req.body;
  if (content == null) {
    res.status(400).json({ error: "Content required" });
    return;
  }

  const [message] = await db.insert(messagesTable).values({
    content,
    targetVoicePart: targetVoicePart || null,
    isAnnouncement: !!isAnnouncement,
    authorId: req.session.userId!,
  }).returning();

  const [author] = await db.select({ username: usersTable.username })
    .from(usersTable).where(eq(usersTable.id, req.session.userId!));

  res.status(201).json({
    id: message.id,
    content: message.content,
    targetVoicePart: message.targetVoicePart,
    isAnnouncement: message.isAnnouncement,
    createdAt: message.createdAt.toISOString(),
    authorUsername: author?.username || "Admin",
  });
});

router.delete("/messages/:id", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  await db.delete(messagesTable).where(eq(messagesTable.id, id));
  res.sendStatus(204);
});

export default router;
