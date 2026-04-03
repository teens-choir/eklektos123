import { AdminLayout } from "@/components/AdminLayout";
import { useListUsers, useUpdateVoicePart, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";

const voicePartConfig = {
  Soprano: { color: "#FF3B30", label: "Soprano (Tenor)" },
  Alto: { color: "#8B5CF6", label: "Alto (Bass)" },
  Normal: { color: "#D4AF37", label: "Normal" },
} as const;

type VoicePart = keyof typeof voicePartConfig;

export default function Members() {
  const { data: users, isLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });
  const updateVoicePart = useUpdateVoicePart();
  const queryClient = useQueryClient();

  const handleUpdate = (userId: number, voicePart: VoicePart) => {
    updateVoicePart.mutate({ id: userId, data: { voicePart } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }),
    });
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold tracking-widest text-primary glow-text uppercase mb-6 flex items-center gap-3">
        <Users size={26} /> Personnel Directory
      </h2>

      {isLoading ? (
        <div className="text-muted-foreground tracking-widest uppercase text-sm">Loading personnel data...</div>
      ) : (
        <>
          <div className="hidden md:block glass-panel rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-muted-foreground uppercase tracking-wider text-xs border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium">Operative</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Voice Part</th>
                  <th className="p-4 font-medium text-right">Assign Voice Part</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users?.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{user.username}</td>
                    <td className="p-4 text-muted-foreground uppercase text-xs tracking-widest">{user.role}</td>
                    <td className="p-4">
                      <VoiceBadge voicePart={user.voicePart} />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        {(Object.entries(voicePartConfig) as [VoicePart, typeof voicePartConfig[VoicePart]][]).map(([vp, cfg]) => (
                          <button
                            key={vp}
                            onClick={() => handleUpdate(user.id, vp)}
                            className={`px-3 py-1.5 bg-black/40 border rounded text-xs font-bold tracking-widest transition-all ${
                              user.voicePart === vp
                                ? "text-black font-bold"
                                : "border-white/10 text-muted-foreground hover:border-current"
                            }`}
                            style={user.voicePart === vp
                              ? { backgroundColor: cfg.color, borderColor: cfg.color, color: "#000" }
                              : { "--hover-color": cfg.color } as any
                            }
                            onMouseEnter={e => {
                              if (user.voicePart !== vp) {
                                (e.currentTarget as HTMLElement).style.borderColor = cfg.color;
                                (e.currentTarget as HTMLElement).style.color = cfg.color;
                              }
                            }}
                            onMouseLeave={e => {
                              if (user.voicePart !== vp) {
                                (e.currentTarget as HTMLElement).style.borderColor = "";
                                (e.currentTarget as HTMLElement).style.color = "";
                              }
                            }}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {users?.map(user => (
              <div key={user.id} className="glass-panel p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-white text-base">{user.username}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{user.role}</div>
                  </div>
                  <VoiceBadge voicePart={user.voicePart} />
                </div>
                <div className="flex gap-2">
                  {(Object.entries(voicePartConfig) as [VoicePart, typeof voicePartConfig[VoicePart]][]).map(([vp, cfg]) => (
                    <button
                      key={vp}
                      onClick={() => handleUpdate(user.id, vp)}
                      className="flex-1 py-2.5 rounded-lg text-xs font-bold tracking-widest transition-all border"
                      style={user.voicePart === vp
                        ? { backgroundColor: cfg.color, borderColor: cfg.color, color: "#000" }
                        : { borderColor: "rgba(255,255,255,0.1)", color: cfg.color, backgroundColor: `${cfg.color}11` }
                      }
                    >
                      {vp}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function VoiceBadge({ voicePart }: { voicePart: string }) {
  const cfg = voicePartConfig[voicePart as VoicePart];
  if (!cfg) return (
    <span className="inline-flex items-center px-2 py-1 rounded border text-[10px] uppercase tracking-widest font-bold border-white/20 text-white/40">
      Unassigned
    </span>
  );
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded border text-[10px] uppercase tracking-widest font-bold"
      style={{ borderColor: cfg.color, color: cfg.color, backgroundColor: `${cfg.color}18` }}
    >
      {cfg.label}
    </span>
  );
}
