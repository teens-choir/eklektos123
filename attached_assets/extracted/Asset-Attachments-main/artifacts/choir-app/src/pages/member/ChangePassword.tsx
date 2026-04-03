import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MemberLayout } from "@/components/MemberLayout";
import { useChangePassword, useGetCurrentUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChangePassword() {
  const { data: user } = useGetCurrentUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const changePassword = useChangePassword();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    changePassword.mutate({ data: { currentPassword, newPassword } }, {
      onSuccess: () => {
        toast({ title: "Security Clearances Updated", description: "Your password has been changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.error || "Failed to update password", variant: "destructive" });
      }
    });
  };

  const Content = (
    <div className="max-w-md mx-auto mt-12 w-full">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary glow-border mb-6">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-bold tracking-widest text-primary glow-text uppercase text-center">Security Clearance</h2>
        <p className="text-muted-foreground text-xs uppercase tracking-widest mt-2 text-center">Update your access codes</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-primary/20 glow-border space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Current Code</label>
          <Input 
            type="password" 
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="bg-black/40 border-white/10 h-12 focus-visible:ring-primary text-white text-lg tracking-widest" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">New Code</label>
          <Input 
            type="password" 
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="bg-black/40 border-white/10 h-12 focus-visible:ring-primary text-white text-lg tracking-widest" 
          />
        </div>
        <Button 
          type="submit" 
          disabled={changePassword.isPending}
          className="w-full h-14 mt-4 bg-primary text-primary-foreground tracking-widest uppercase font-bold text-sm hover:bg-primary/80 transition-all hover:scale-[1.02]"
        >
          Update Clearance
        </Button>
      </form>
    </div>
  );

  if (user?.role === "admin") {
    return <AdminLayout>{Content}</AdminLayout>;
  }

  return <MemberLayout>{Content}</MemberLayout>;
}
