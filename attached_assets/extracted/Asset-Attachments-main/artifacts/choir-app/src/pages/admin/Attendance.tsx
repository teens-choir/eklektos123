import { AdminLayout } from "@/components/AdminLayout";
import { useListAttendance, useUpdateAttendance, getListAttendanceQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";

export default function Attendance() {
  const { data: records, isLoading } = useListAttendance({ query: { queryKey: getListAttendanceQueryKey() }});
  const updateAttendance = useUpdateAttendance();
  const queryClient = useQueryClient();

  const handleToggle = (userId: number, status: "present" | "absent") => {
    updateAttendance.mutate({ id: userId, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey() });
      }
    });
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold tracking-widest text-primary glow-text uppercase mb-8">Daily Roll Call</h2>
      
      {isLoading ? (
        <div className="text-muted-foreground tracking-widest uppercase">Loading roll call...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records?.map(record => (
            <div key={record.id} className={`glass-panel p-4 rounded-xl border flex items-center justify-between transition-all duration-300
              ${record.status === 'present' ? 'border-green-500/50 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 
                record.status === 'absent' ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
                'border-white/10'}`}>
              <div>
                <div className="font-medium text-white text-lg">{record.username}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  {record.voicePart || 'UNASSIGNED'}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleToggle(record.userId, "present")}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${record.status === 'present' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-black/40 text-muted-foreground hover:text-green-500 hover:border hover:border-green-500/50'}`}
                >
                  <Check size={20} />
                </button>
                <button 
                  onClick={() => handleToggle(record.userId, "absent")}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${record.status === 'absent' ? 'bg-red-500 text-black shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-black/40 text-muted-foreground hover:text-red-500 hover:border hover:border-red-500/50'}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
