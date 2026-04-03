import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LogOut, Users, CheckCircle, Music,
  LayoutDashboard, Lock, MessageCircle, Megaphone, Menu, X,
  Monitor, Tablet, Smartphone
} from "lucide-react";
import { useDevice } from "@/lib/device";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/members", icon: Users, label: "Members" },
  { href: "/admin/attendance", icon: CheckCircle, label: "Attendance" },
  { href: "/admin/messages", icon: Megaphone, label: "Broadcasts" },
  { href: "/admin/music", icon: Music, label: "Music Rack" },
  { href: "/admin/chat", icon: MessageCircle, label: "Group Chat" },
];

function DeviceSwitcher() {
  const { device, setDevice } = useDevice();
  const [, setLocation] = useLocation();
  const options: { type: "pc" | "tablet" | "mobile"; icon: React.ReactNode; label: string }[] = [
    { type: "pc", icon: <Monitor size={13} />, label: "PC" },
    { type: "tablet", icon: <Tablet size={13} />, label: "Tablet" },
    { type: "mobile", icon: <Smartphone size={13} />, label: "Mobile" },
  ];
  return (
    <div className="px-4 mb-1">
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1.5">Layout</p>
      <div className="flex gap-1">
        {options.map(({ type, icon, label }) => (
          <button
            key={type}
            onClick={() => { setDevice(type); setLocation("/device-select"); }}
            title={`Switch to ${label}`}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] uppercase tracking-wider transition-colors
              ${device === type
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-white border border-white/5 hover:border-white/20"}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { device } = useDevice();

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

  const isPc = device === "pc";
  const isTablet = device === "tablet";
  const isMobile = device === "mobile";

  const navItemClass = (href: string) =>
    `flex items-center gap-3 px-4 ${isTablet ? "py-4" : "py-3"} rounded-md transition-colors text-sm font-medium tracking-wide
    ${location === href ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-foreground"}`;

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <h1 className={`font-bold tracking-widest text-primary glow-text uppercase ${isPc ? "text-lg" : "text-base"}`}>
          COMMAND CENTER
        </h1>
        {!isPc && (
          <button className="text-muted-foreground hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} onClick={() => setSidebarOpen(false)} className={navItemClass(href)}>
            <Icon size={isTablet ? 20 : 18} className={location === href ? "text-primary" : "text-primary/60"} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 flex flex-col gap-2">
        <DeviceSwitcher />
        <div className="px-4 text-xs text-muted-foreground mt-1">
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
    </>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
        <header className="flex items-center justify-between px-4 h-14 glass-panel border-b border-white/10 shrink-0">
          <h1 className="text-sm font-bold tracking-widest text-primary glow-text uppercase">COMMAND</h1>
          <button onClick={handleLogout} disabled={logout.isPending} className="text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50">
            <LogOut size={20} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-20 page-transition">
          {children}
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-white/10 flex justify-around items-center h-16 px-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-1 py-1 transition-colors
                ${location === href ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <Icon size={22} />
              <span className="text-[9px] tracking-wide">{label.split(" ")[0]}</span>
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  const sidebarWidth = isPc ? "w-72" : "w-64";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {isTablet && sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        ${isPc ? `static ${sidebarWidth}` : `fixed inset-y-0 left-0 z-50 ${sidebarWidth}`}
        glass-panel border-r border-white/10 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isPc ? "" : (sidebarOpen ? "translate-x-0" : "-translate-x-full")}
      `}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {isTablet && (
          <header className="flex items-center justify-between px-4 h-14 glass-panel border-b border-white/10 shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-primary transition-colors">
              <Menu size={24} />
            </button>
            <h1 className="text-sm font-bold tracking-widest text-primary glow-text uppercase">COMMAND CENTER</h1>
            <button onClick={handleLogout} disabled={logout.isPending} className="text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50">
              <LogOut size={20} />
            </button>
          </header>
        )}
        <main className={`flex-1 overflow-y-auto page-transition ${isPc ? "p-10" : "p-6"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
