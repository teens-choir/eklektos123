import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LogOut, Users, CheckCircle, MessageSquare, Music,
  LayoutDashboard, Lock, MessageCircle, Megaphone, Menu, X
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/members", icon: Users, label: "Members" },
  { href: "/admin/attendance", icon: CheckCircle, label: "Attendance" },
  { href: "/admin/messages", icon: Megaphone, label: "Broadcasts" },
  { href: "/admin/music", icon: Music, label: "Music Rack" },
  { href: "/admin/chat", icon: MessageCircle, label: "Group Chat" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center text-muted-foreground tracking-widest uppercase">
      Authenticating...
    </div>
  );
  if (!user || user.role !== "admin") {
    setTimeout(() => setLocation(user ? "/member/home" : "/"), 0);
    return null;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => { queryClient.clear(); setLocation("/"); },
      onError: () => { queryClient.clear(); setLocation("/"); },
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 glass-panel border-r border-white/10 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-widest text-primary glow-text uppercase">COMMAND CENTER</h1>
          <button className="md:hidden text-muted-foreground hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium tracking-wide
                ${location === href ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-foreground"}`}
            >
              <Icon size={18} className={location === href ? "text-primary" : "text-primary/60"} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <div className="px-4 text-xs text-muted-foreground">
            {user.username} <span className="text-primary font-semibold">(Admin)</span>
          </div>
          <Link
            href="/member/change-password"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-white/5 text-muted-foreground hover:text-white transition-colors text-sm font-medium"
          >
            <Lock size={18} /> Security
          </Link>
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-destructive/20 text-destructive transition-colors text-sm font-medium disabled:opacity-50"
          >
            <LogOut size={18} /> {logout.isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 h-14 glass-panel border-b border-white/10 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-primary transition-colors">
            <Menu size={24} />
          </button>
          <h1 className="text-sm font-bold tracking-widest text-primary glow-text uppercase">COMMAND CENTER</h1>
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 page-transition pb-20 md:pb-8">
          {children}
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-white/10 flex justify-around items-center h-16 px-2">
          {navItems.slice(0, 5).map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-1 transition-colors
                ${location === href ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <Icon size={20} />
              <span className="text-[9px] tracking-wide">{label.split(" ")[0]}</span>
            </Link>
          ))}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 px-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Menu size={20} />
            <span className="text-[9px] tracking-wide">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
