import { useState, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useListMusic, useDeleteMusic, getListMusicQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Music, FileText, Link as LinkIcon, Upload, ExternalLink, FileMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tab = "upload" | "link";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function MusicManager() {
  const { data: musicFiles, isLoading } = useListMusic({ query: { queryKey: getListMusicQueryKey() } });
  const deleteMusic = useDeleteMusic();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>("upload");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("all");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle(""); setUrl(""); setFile(null); setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!title || !file) { setError("Title and file are required"); return; }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("targetVoicePart", target === "all" ? "" : target);
      form.append("file", file);
      const res = await fetch(`${BASE}/api/music/upload`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Upload failed");
        return;
      }
      reset();
      queryClient.invalidateQueries({ queryKey: getListMusicQueryKey() });
    } catch (e) {
      setError("Network error");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = async () => {
    if (!title || !url) { setError("Title and URL are required"); return; }
    setUploading(true);
    setError("");
    try {
      const ext = url.split(".").pop()?.toLowerCase();
      const fileType = ext === "pdf" ? "pdf" : ext === "mp3" || ext === "wav" ? "mp3" : "other";
      const res = await fetch(`${BASE}/api/music`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url,
          fileType,
          targetVoicePart: target === "all" ? null : target,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to add link");
        return;
      }
      reset();
      queryClient.invalidateQueries({ queryKey: getListMusicQueryKey() });
    } catch (e) {
      setError("Network error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    deleteMusic.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMusicQueryKey() })
    });
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold tracking-widest text-primary glow-text uppercase mb-8 flex items-center gap-3">
        <Music size={28} /> Music Database
      </h2>

      <div className="glass-panel p-6 rounded-xl border border-white/10 mb-8">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setTab("upload"); reset(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-widest uppercase transition-all ${tab === "upload" ? "bg-primary text-black" : "bg-white/5 text-muted-foreground hover:text-white"}`}
          >
            <Upload size={14} /> Upload File
          </button>
          <button
            onClick={() => { setTab("link"); reset(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-widest uppercase transition-all ${tab === "link" ? "bg-primary text-black" : "bg-white/5 text-muted-foreground hover:text-white"}`}
          >
            <LinkIcon size={14} /> Add Link
          </button>
        </div>

        {error && <p className="text-destructive text-xs mb-4 tracking-wide">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-black/40 border-white/10 h-10 text-white" placeholder="Song or piece name" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Target Group</label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="bg-black/40 border-white/10 h-10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL VOICES</SelectItem>
                <SelectItem value="Soprano">SOPRANO</SelectItem>
                <SelectItem value="Alto">ALTO</SelectItem>
                <SelectItem value="Normal">NORMAL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {tab === "upload" ? (
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">File (PDF, MP3, WAV)</label>
              <div
                className="relative border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
                style={file ? { borderColor: "rgba(212,175,55,0.5)", background: "rgba(212,175,55,0.05)" } : undefined}
              >
                <input ref={fileRef} type="file" accept=".pdf,.mp3,.wav,.m4a" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                {file ? (
                  <div className="flex items-center justify-center gap-3 text-primary">
                    <FileMusic size={24} />
                    <span className="text-sm font-semibold truncate max-w-[200px]">{file.name}</span>
                    <span className="text-muted-foreground text-xs">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Upload size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click to choose a file</p>
                    <p className="text-xs mt-1 opacity-60">PDF, MP3, WAV · Max 50MB</p>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploading || !title || !file}
              className="bg-primary text-black tracking-widest uppercase font-bold h-10 hover:bg-primary/80 shrink-0"
            >
              <Upload size={16} className="mr-2" /> {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">URL</label>
              <Input value={url} onChange={e => setUrl(e.target.value)} className="bg-black/40 border-white/10 h-10 text-white" placeholder="https://drive.google.com/..." />
            </div>
            <Button
              onClick={handleAddLink}
              disabled={uploading || !title || !url}
              className="bg-primary text-black tracking-widest uppercase font-bold h-10 hover:bg-primary/80 shrink-0"
            >
              <Plus size={16} className="mr-2" /> {uploading ? "Adding..." : "Add Link"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="text-muted-foreground tracking-widest uppercase text-sm">Scanning archives...</div>
        ) : musicFiles?.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground py-20 tracking-widest uppercase text-sm">No music files yet. Upload one above.</div>
        ) : musicFiles?.map(file => (
          <div key={file.id} className="glass-panel p-5 rounded-xl border border-white/10 flex flex-col group hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:glow-border transition-all">
                {file.fileType === "pdf" ? <FileText size={24} /> : file.fileType === "mp3" ? <FileMusic size={24} /> : <LinkIcon size={24} />}
              </div>
              <div className="flex items-center gap-2">
                {file.isUploaded && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full tracking-widest uppercase font-bold" style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}>
                    UPLOADED
                  </span>
                )}
                <button onClick={() => handleDelete(file.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2 -mr-2 -mt-2">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 truncate">{file.title}</h3>
            <div className="flex justify-between items-end mt-auto pt-4 border-t border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Target: {file.targetVoicePart || "ALL"}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Type: {file.fileType}</span>
              </div>
              <a
                href={`${BASE}${file.url.startsWith("/api") ? file.url : file.url}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-primary hover:text-primary-foreground hover:bg-primary px-3 py-1.5 rounded transition-colors uppercase tracking-widest border border-primary/50 flex items-center gap-1"
              >
                <ExternalLink size={12} /> Open
              </a>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
