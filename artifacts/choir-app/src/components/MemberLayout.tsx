import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Home, Lock, MessageCircle, Monitor, Tablet, Smartphone } from "lucide-react";
import { useDevice } from "@/lib/device";

const navLinks = [
  { href: "/member/home", icon: Home, label: "Home" },
  { href: "/member/chat", icon: MessageCircle, label: "Chat" },
  { href: "/member/change-password", icon: Lock, label: "Security" },
];

export function MemberLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { device, setDevice } = useDevice();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-muted-foreground tracking-widest uppercase">
      Loading Sanctuary...
    </div>
  );
  if (!user) { setTimeout(() => setLocation("/"), 0); return null; }
  if (user.role === "admin") { setTimeout(() => setLocation("/admin/dashboard"), 0); return null; }

  const themeClass = user.voicePart ? `theme-${user.voicePart.toLowerCase()}` : "theme-normal";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => { queryClient.clear(); setLocation("/"); },
      onError: () => { queryClient.clear(); setLocation("/"); },
    });
  };

  const isPc = device === "pc";
  const isMobile = device === "mobile";

  const DeviceSwitcher = () => (
    <div className="flex items-center gap-1">
      {([["pc", <Monitor size={13} />], ["tablet", <Tablet size={13} />], ["mobile", <Smartphone size={13} />]] as const).map(([type, icon]) => (
        <button
          key={type}
          onClick={() => { setDevice(type); setLocation("/device-select"); }}
          title={`Switch to ${type}`}
          className={`p-1.5 rounded transition-colors ${device === type ? "text-primary bg-primary/15" : "text-muted-foreground hover:text-white"}`}
        >
          {icon}
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div className={`flex flex-col min-h-screen bg-background text-foreground ${themeClass} font-sans`}>
        <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/10 flex items-center justify-between px-4 h-14">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-primary glow-text">SANCTUARY</p>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase">{user.username} · {user.voicePart}</p>
          </div>
          <DeviceSwitcher />
        </header>
        <main className="flex-1 p-4 pt-20 pb-24 page-transition">
          {children}
        </main>
        <nav className="fixed bottom-0 w-full z-50 glass-panel border-t border-white/10 flex justify-around items-center h-16 px-4">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 transition-colors ${location === href ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
              <Icon size={22} />
              <span className="text-[10px]">{label}</span>
            </Link>
          ))}
          <button onClick={handleLogout} disabled={logout.isPending} className="flex flex-col items-center gap-1 text-destructive hover:text-destructive/80 disabled:opacity-50">
            <LogOut size={22} />
            <span className="text-[10px]">Logout</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background text-foreground ${themeClass} font-sans pt-16`}>
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/10">
        <div className={`mx-auto px-6 h-16 flex items-center justify-between ${isPc ? "max-w-7xl" : "max-w-5xl"}`}>
          <div>
            <h1 className="text-lg font-bold tracking-widest text-primary glow-text uppercase">SANCTUARY</h1>
            <p className="text-[10px] text-muted-foreground -mt-1 tracking-widest uppercase">{user.username} · {user.voicePart}</p>
          </div>
          <div className="flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${location === href ? "text-primary" : "hover:text-primary"}`}
              >
                {label}
              </Link>
            ))}
            <DeviceSwitcher />
            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
            >
              {logout.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>
      <main className={`mx-auto page-transition ${isPc ? "max-w-7xl p-10" : "max-w-5xl p-4 md:p-8"}`}>
        {children}
      </main>
    </div>
  );
}
