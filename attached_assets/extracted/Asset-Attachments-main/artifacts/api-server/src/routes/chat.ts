import { Router, type IRouter } from "express";
import { db, usersTable, chatMessagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/chat", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const messages = await db
    .select({
      id: chatMessagesTable.id,
      content: chatMessagesTable.content,
      authorId: chatMessagesTable.authorId,
      authorUsername: usersTable.username,
      authorRole: usersTable.role,
      authorVoicePart: usersTable.voicePart,
      createdAt: chatMessagesTable.createdAt,
    })
    .from(chatMessagesTable)
    .innerJoin(usersTable, eq(chatMessagesTable.authorId, usersTable.id))
    .orderBy(desc(chatMessagesTable.createdAt))
    .limit(100);

  res.json(messages.reverse().map(m => ({
    id: m.id,
    content: m.content,
    authorId: m.authorId,
    authorUsername: m.authorUsername,
    authorRole: m.authorRole,
    authorVoicePart: m.authorVoicePart,
    createdAt: m.createdAt.toISOString(),
  })));
});

router.post("/chat", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { content } = req.body;
  if (!content || !content.trim()) {
    res.status(400).json({ error: "Message content required" });
    return;
  }

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  if (!currentUser) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const [message] = await db.insert(chatMessagesTable).values({
    content: content.trim(),
    authorId: req.session.userId,
  }).returning();

  res.status(201).json({
    id: message.id,
    content: message.content,
    authorId: message.authorId,
    authorUsername: currentUser.username,
    authorRole: currentUser.role,
    authorVoicePart: currentUser.voicePart,
    createdAt: message.createdAt.toISOString(),
  });
});

router.delete("/chat/:id", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  if (!currentUser) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [msg] = await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.id, id));
  if (!msg) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  if (currentUser.role !== "admin" && msg.authorId !== currentUser.id) {
    res.status(403).json({ error: "Cannot delete others' messages" });
    return;
  }

  await db.delete(chatMessagesTable).where(eq(chatMessagesTable.id, id));
  res.sendStatus(204);
});

export default router;
