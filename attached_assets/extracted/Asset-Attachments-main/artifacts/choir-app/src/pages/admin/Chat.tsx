import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
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

export default function AdminChat() {
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

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-widest text-primary glow-text uppercase flex items-center gap-3">
            <MessageCircle size={28} /> Group Chat
          </h1>
          <p className="text-muted-foreground text-sm mt-1">All members and admins — your messages glow</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
          {isLoading && (
            <div className="text-center text-muted-foreground py-10 tracking-widest uppercase text-sm">Loading chat...</div>
          )}
          {!isLoading && (!messages || messages.length === 0) && (
            <div className="text-center text-muted-foreground py-20 tracking-widest uppercase text-sm">No messages yet. Start the conversation.</div>
          )}
          {messages?.map(msg => {
            const isAdmin = msg.authorRole === "admin";
            const isMine = msg.authorId === currentUser?.id;
            const vpColor = voicePartColors[msg.authorVoicePart] || "#D4AF37";
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"} group`}
              >
                <div className={`max-w-[75%] relative`}>
                  {!isMine && (
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold tracking-wider"
                        style={{ color: isAdmin ? "#D4AF37" : vpColor }}
                      >
                        {msg.authorUsername}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: "rgba(212,175,55,0.2)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.4)" }}>
                          ADMIN
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${
                      isMine
                        ? "rounded-tr-sm"
                        : "rounded-tl-sm"
                    }`}
                    style={isAdmin ? {
                      background: "rgba(212,175,55,0.1)",
                      border: "1px solid rgba(212,175,55,0.4)",
                      boxShadow: "0 0 20px rgba(212,175,55,0.3), 0 0 40px rgba(212,175,55,0.1)",
                    } : isMine ? {
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    } : {
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
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
            placeholder="Type a message as admin..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
            style={{ boxShadow: text ? "0 0 0 1px rgba(212,175,55,0.3)" : undefined }}
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMessage.isPending}
            className="px-5 py-3 rounded-xl font-semibold text-sm tracking-wider disabled:opacity-40 transition-all flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.8), rgba(212,175,55,0.5))",
              boxShadow: "0 0 15px rgba(212,175,55,0.3)",
              color: "#000",
            }}
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
