import { Router, type IRouter } from "express";
import { db, usersTable, musicTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

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

router.get("/music/files/:filename", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const filename = path.basename(req.params.filename as string);
  const filepath = path.join(uploadDir, filename);
  if (!fs.existsSync(filepath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.sendFile(filepath);
});

router.get("/music", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  if (!currentUser) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const files = await db.select().from(musicTable).orderBy(musicTable.createdAt);

  const filtered = currentUser.role === "admin"
    ? files
    : files.filter(f => f.targetVoicePart === null || f.targetVoicePart === currentUser.voicePart);

  res.json(filtered.map(f => ({
    id: f.id,
    title: f.title,
    url: f.url,
    fileType: f.fileType,
    targetVoicePart: f.targetVoicePart,
    isUploaded: f.isUploaded,
    createdAt: f.createdAt.toISOString(),
  })));
});

router.post("/music/upload", upload.single("file"), async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "File required" });
    return;
  }

  const { title, targetVoicePart } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title required" });
    return;
  }

  const ext = path.extname(file.originalname).toLowerCase();
  let fileType: "pdf" | "mp3" | "other" = "other";
  if (ext === ".pdf") fileType = "pdf";
  else if (ext === ".mp3" || ext === ".wav" || ext === ".m4a") fileType = "mp3";

  const url = `/api/music/files/${file.filename}`;

  const [music] = await db.insert(musicTable).values({
    title,
    url,
    fileType,
    targetVoicePart: targetVoicePart || null,
    isUploaded: true,
    authorId: req.session.userId!,
  }).returning();

  res.status(201).json({
    id: music.id,
    title: music.title,
    url: music.url,
    fileType: music.fileType,
    targetVoicePart: music.targetVoicePart,
    isUploaded: music.isUploaded,
    createdAt: music.createdAt.toISOString(),
  });
});

router.post("/music", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const { title, url, fileType, targetVoicePart } = req.body;
  if (!title || !url) {
    res.status(400).json({ error: "Title and URL required" });
    return;
  }

  const [music] = await db.insert(musicTable).values({
    title,
    url,
    fileType: fileType || "other",
    targetVoicePart: targetVoicePart || null,
    isUploaded: false,
    authorId: req.session.userId!,
  }).returning();

  res.status(201).json({
    id: music.id,
    title: music.title,
    url: music.url,
    fileType: music.fileType,
    targetVoicePart: music.targetVoicePart,
    isUploaded: music.isUploaded,
    createdAt: music.createdAt.toISOString(),
  });
});

router.delete("/music/:id", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [music] = await db.select().from(musicTable).where(eq(musicTable.id, id));
  if (music?.isUploaded && music.url.startsWith("/api/music/files/")) {
    const filename = path.basename(music.url);
    const filepath = path.join(uploadDir, filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  }

  await db.delete(musicTable).where(eq(musicTable.id, id));
  res.sendStatus(204);
});

export default router;
