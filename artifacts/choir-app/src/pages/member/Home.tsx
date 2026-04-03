import { MemberLayout } from "@/components/MemberLayout";
import { useGetCurrentUser, useListMessages, useListMusic, useGetMyAttendanceStats, getListMessagesQueryKey, getListMusicQueryKey, getGetMyAttendanceStatsQueryKey } from "@workspace/api-client-react";
import { FileText, Music, Link as LinkIcon, AlertCircle, Megaphone } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Home() {
  const { data: user } = useGetCurrentUser();
  const { data: messages } = useListMessages({ query: { queryKey: getListMessagesQueryKey() }});
  const { data: musicFiles } = useListMusic({ query: { queryKey: getListMusicQueryKey() }});
  const { data: stats } = useGetMyAttendanceStats({ query: { queryKey: getGetMyAttendanceStatsQueryKey() }});

  const attendanceRate = stats ? stats.attendanceRate : 0;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (attendanceRate / 100) * circumference;

  return (
    <MemberLayout>
      <div className="mb-12 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-3">Welcome, <span className="font-bold text-primary glow-text">{user?.username}</span></h2>
        <div className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-primary border border-primary/30 inline-block px-4 py-1.5 rounded bg-primary/10">
          Designation: {user?.voicePart || "Unassigned"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8 lg:col-span-1">
          <div className="glass-panel p-8 rounded-2xl border border-primary/30 glow-border text-center flex flex-col items-center">
            <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-6">Vital Signs (Attendance)</h3>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={offset} 
                  className="text-primary transition-all duration-1000 ease-out" 
                  style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))' }} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold text-white glow-text">{Math.round(attendanceRate)}%</span>
              </div>
            </div>
            <div className="mt-8 flex gap-6 text-xs font-bold uppercase tracking-widest">
              <div className="flex flex-col items-center gap-1 text-green-500">
                <span className="text-2xl font-light">{stats?.presentCount || 0}</span>
                Present
              </div>
              <div className="flex flex-col items-center gap-1 text-red-500">
                <span className="text-2xl font-light">{stats?.absentCount || 0}</span>
                Absent
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">Directives</h3>
            {messages?.length === 0 ? (
              <div className="text-muted-foreground italic text-sm tracking-widest">No directives yet.</div>
            ) : messages?.map(msg => (
              <div
                key={msg.id}
                className="glass-panel p-5 rounded-xl border"
                style={msg.isAnnouncement ? {
                  borderColor: "rgba(251,191,36,0.6)",
                  background: "rgba(251,191,36,0.04)",
                  boxShadow: "0 0 25px rgba(251,191,36,0.2), 0 0 60px rgba(251,191,36,0.05)",
                } : msg.targetVoicePart ? {
                  borderColor: "rgba(var(--primary),0.5)",
                  background: "rgba(var(--primary),0.05)",
                } : {
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {msg.isAnnouncement && (
                    <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                      <Megaphone size={12} /> Announcement
                    </div>
                  )}
                  {msg.targetVoicePart && (
                    <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                      <AlertCircle size={12} /> For {msg.targetVoicePart} only
                    </div>
                  )}
                </div>
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-medium border-t border-white/5 pt-3">
                  {new Date(msg.createdAt).toLocaleDateString()} · by {msg.authorUsername}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">Music Rack</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {musicFiles?.length === 0 ? (
              <div className="text-muted-foreground italic text-sm tracking-widest">No files in database.</div>
            ) : musicFiles?.map(file => (
              <a key={file.id} href={file.isUploaded ? `${BASE}${file.url}` : file.url} target="_blank" rel="noreferrer" className="glass-panel p-5 rounded-xl border border-white/10 hover:border-primary hover:bg-primary/5 transition-all group flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-black/40 flex items-center justify-center text-primary group-hover:glow-text group-hover:scale-110 group-hover:bg-primary/20 transition-all flex-shrink-0">
                  {file.fileType === 'pdf' ? <FileText size={24} /> : file.fileType === 'mp3' ? <Music size={24} /> : <LinkIcon size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors truncate">{file.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{file.fileType}</span>
                    {file.targetVoicePart && <span className="text-[10px] font-bold text-primary border border-primary/30 px-1.5 py-0.5 rounded bg-primary/10 uppercase tracking-widest">{file.targetVoicePart}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
