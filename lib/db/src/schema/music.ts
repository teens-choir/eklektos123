import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const musicTable = pgTable("music", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  fileType: text("file_type").notNull().default("other"),
  targetVoicePart: text("target_voice_part"),
  isUploaded: boolean("is_uploaded").notNull().default(false),
  authorId: integer("author_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMusicSchema = createInsertSchema(musicTable).omit({ id: true, createdAt: true });
export type InsertMusic = z.infer<typeof insertMusicSchema>;
export type Music = typeof musicTable.$inferSelect;
