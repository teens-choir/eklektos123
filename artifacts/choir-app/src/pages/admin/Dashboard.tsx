import { AdminLayout } from "@/components/AdminLayout";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { Users, Music, MessageSquare, CheckCircle, XCircle } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() }});

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold tracking-widest text-primary glow-text uppercase mb-8">System Overview</h2>
      
      {isLoading ? (
        <div className="text-muted-foreground animate-pulse tracking-widest uppercase">Scanning database...</div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Members" value={stats.totalMembers} icon={<Users />} color="text-white" />
          <StatCard title="Sopranos" value={stats.sopranoCount} icon={<Users />} color="text-[#FF3B30]" />
          <StatCard title="Altos" value={stats.altoCount} icon={<Users />} color="text-[#8B5CF6]" />
          <StatCard title="Normal" value={stats.normalCount} icon={<Users />} color="text-[#D4AF37]" />
          
          <StatCard title="Present Today" value={stats.presentToday} icon={<CheckCircle />} color="text-green-500" />
          <StatCard title="Absent Today" value={stats.absentToday} icon={<XCircle />} color="text-red-500" />
          
          <StatCard title="Active Directives" value={stats.totalMessages} icon={<MessageSquare />} color="text-primary" />
          <StatCard title="Music Files" value={stats.totalMusicFiles} icon={<Music />} color="text-primary" />
        </div>
      ) : null}
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-primary/50 transition-colors group">
      <div className={`w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <div className="text-4xl font-light tracking-tight mb-2 group-hover:glow-text group-hover:text-primary transition-colors text-white">{value}</div>
      <div className="text-xs tracking-widest text-muted-foreground uppercase">{title}</div>
    </div>
  );
}
