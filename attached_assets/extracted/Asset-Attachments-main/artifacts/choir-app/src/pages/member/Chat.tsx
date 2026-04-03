import { useState, useEffect, useRef } from "react";
import { MemberLayout } from "@/components/MemberLayout";
import { useGetCurrentUser, useListChatMessages, useSendChatMessage, useDeleteChatMessage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Trash2, MessageCircle } from "lucide-react";

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(isoDate).toLocaleDateString();
}

const voicePartColors: Record<string, string> = {
  Soprano: "#FF3B30",
  Alto: "#8B5CF6",
  Normal: "#D4AF37",
};

export default function MemberChat() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: messages, isLoading } = useListChatMessages({}, { refetchInterval: 3000 });
  const sendMessage = useSendChatMessage();
  const deleteMsg = useDeleteChatMessage();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage.mutate({ data: { content: text.trim() } }, {
      onSuccess: () => {
        setText("");
        queryClient.invalidateQueries({ queryKey: ["listChatMessages"] });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMsg.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listChatMessages"] })
    });
  };

  const vpColor = voicePartColors[currentUser?.voicePart || "Normal"] || "#D4AF37";

  return (
    <MemberLayout>
      <div className="flex flex-col" style={{ height: "calc(100vh - 9rem)" }}>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-widest uppercase flex items-center gap-3" style={{ color: vpColor, textShadow: `0 0 20px ${vpColor}66` }}>
            <MessageCircle size={26} /> Choir Chat
          </h1>
          <p className="text-muted-foreground text-xs mt-1 tracking-widest uppercase">Group chat — admins glow in gold</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
          {isLoading && (
            <div className="text-center text-muted-foreground py-10 tracking-widest uppercase text-sm">Loading chat...</div>
          )}
          {!isLoading && (!messages || messages.length === 0) && (
            <div className="text-center text-muted-foreground py-20 tracking-widest uppercase text-sm">No messages yet. Say something!</div>
          )}
          {messages?.map(msg => {
            const isAdmin = msg.authorRole === "admin";
            const isMine = msg.authorId === currentUser?.id;
            const authorVpColor = voicePartColors[msg.authorVoicePart] || "#D4AF37";
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"} group`}
              >
                <div className="max-w-[78%] relative">
                  {!isMine && (
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold tracking-wider"
                        style={{ color: isAdmin ? "#D4AF37" : authorVpColor }}
                      >
                        {msg.authorUsername}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.4)" }}>
                          ADMIN
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMine ? "rounded-tr-sm" : "rounded-tl-sm"
                    }`}
                    style={isAdmin ? {
                      background: "rgba(212,175,55,0.08)",
                      border: "1px solid rgba(212,175,55,0.5)",
                      boxShadow: "0 0 25px rgba(212,175,55,0.35), 0 0 60px rgba(212,175,55,0.1)",
                    } : isMine ? {
                      background: `${vpColor}22`,
                      border: `1px solid ${vpColor}55`,
                      boxShadow: `0 0 10px ${vpColor}22`,
                    } : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {msg.content}
                    {isMine && (
                      <span className="block text-[10px] text-muted-foreground mt-1 text-right">{timeAgo(msg.createdAt)}</span>
                    )}
                  </div>
                  {(isMine || currentUser?.role === "admin") && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/80 hover:bg-destructive text-white rounded-full p-1"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Say something to the choir..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              borderColor: text ? `${vpColor}60` : undefined,
              boxShadow: text ? `0 0 0 1px ${vpColor}33` : undefined,
            }}
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMessage.isPending}
            className="px-5 py-3 rounded-xl font-semibold text-sm tracking-wider disabled:opacity-40 transition-all flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${vpColor}cc, ${vpColor}88)`,
              boxShadow: `0 0 15px ${vpColor}44`,
              color: vpColor === "#D4AF37" ? "#000" : "#fff",
            }}
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </MemberLayout>
  );
}
