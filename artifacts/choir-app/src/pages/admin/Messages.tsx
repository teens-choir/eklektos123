import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useListMessages, useCreateMessage, useDeleteMessage, getListMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Send, Megaphone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Messages() {
  const { data: messages, isLoading } = useListMessages({ query: { queryKey: getListMessagesQueryKey() } });
  const createMsg = useCreateMessage();
  const deleteMsg = useDeleteMessage();
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [target, setTarget] = useState<string>("all");
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  const handleSend = () => {
    if (!content.trim()) return;
    createMsg.mutate({
      data: {
        content,
        targetVoicePart: target === "all" ? null : target,
        isAnnouncement,
      }
    }, {
      onSuccess: () => {
        setContent("");
        setIsAnnouncement(false);
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMsg.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() })
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl font-bold tracking-widest text-primary glow-text uppercase flex items-center gap-3">
          <Megaphone size={28} /> Broadcast Center
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-primary/20 glow-border self-start">
          <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">Compose Message</h3>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Enter message content..."
            className="min-h-[160px] bg-black/40 border-white/10 mb-4 focus-visible:ring-primary text-white resize-none"
          />
          <div className="flex flex-col gap-4">
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="w-full bg-black/40 border-white/10 text-white h-12">
                <SelectValue placeholder="Target Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL VOICES</SelectItem>
                <SelectItem value="Soprano">SOPRANO (TENOR) ONLY</SelectItem>
                <SelectItem value="Alto">ALTO (BASS) ONLY</SelectItem>
                <SelectItem value="Normal">NORMAL ONLY</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={() => setIsAnnouncement(v => !v)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold tracking-wider uppercase transition-all ${
                isAnnouncement
                  ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
              }`}
            >
              <Megaphone size={16} />
              {isAnnouncement ? "Announcement (pinned)" : "Mark as Announcement"}
            </button>

            <Button
              onClick={handleSend}
              disabled={createMsg.isPending || !content.trim()}
              className="w-full h-12 bg-primary text-primary-foreground tracking-widest uppercase font-bold hover:bg-primary/80 transition-colors"
            >
              <Send size={16} className="mr-2" /> Transmit
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">Messages Log</h3>
          {isLoading ? (
            <div className="text-muted-foreground tracking-widest uppercase text-sm">Retrieving logs...</div>
          ) : messages?.length === 0 ? (
            <div className="text-muted-foreground italic text-sm tracking-widest">No messages yet.</div>
          ) : messages?.map(msg => (
            <div
              key={msg.id}
              className="glass-panel p-5 rounded-xl border relative group hover:border-primary/30 transition-colors"
              style={msg.isAnnouncement ? {
                borderColor: "rgba(251,191,36,0.5)",
                background: "rgba(251,191,36,0.04)",
                boxShadow: "0 0 20px rgba(251,191,36,0.1)",
              } : { borderColor: "rgba(255,255,255,0.1)" }}
            >
              <button
                onClick={() => handleDelete(msg.id)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {msg.isAnnouncement && (
                  <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest font-bold border-amber-400/50 text-amber-400 bg-amber-400/10">
                    <Megaphone size={10} /> Announcement
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest font-bold
                  ${msg.targetVoicePart === "Soprano" ? "border-[#FF3B30] text-[#FF3B30] bg-[#FF3B30]/10" :
                    msg.targetVoicePart === "Alto" ? "border-[#8B5CF6] text-[#8B5CF6] bg-[#8B5CF6]/10" :
                    msg.targetVoicePart === "Normal" ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10" :
                    "border-primary text-primary bg-primary/10"}`}>
                  {msg.targetVoicePart || "ALL VOICES"}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              <div className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-white/5 flex items-center gap-1">
                <MessageSquare size={10} /> by {msg.authorUsername}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
