import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Home, Lock, MessageCircle } from "lucide-react";

export function MemberLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-muted-foreground tracking-widest uppercase">Loading Sanctuary...</div>;
  if (!user) {
    setTimeout(() => setLocation("/"), 0);
    return null;
  }
  if (user.role === "admin") {
    setTimeout(() => setLocation("/admin/dashboard"), 0);
    return null;
  }

  const themeClass = user.voicePart ? `theme-${user.voicePart.toLowerCase()}` : "theme-normal";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/");
      },
      onError: () => {
        queryClient.clear();
        setLocation("/");
      }
    });
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${themeClass} font-sans pb-20 md:pb-0 md:pt-16`}>
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/10 hidden md:block">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-widest text-primary glow-text uppercase">SANCTUARY</h1>
            <p className="text-[10px] text-muted-foreground -mt-1 tracking-widest uppercase">{user.username} · {user.voicePart}</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/member/home" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="/member/chat" className="text-sm font-medium hover:text-primary transition-colors">Group Chat</Link>
            <Link href="/member/change-password" className="text-sm font-medium hover:text-primary transition-colors">Security</Link>
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

      <nav className="fixed bottom-0 w-full z-50 glass-panel border-t border-white/10 md:hidden flex justify-around items-center h-16 px-4">
        <Link href="/member/home" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
          <Home size={20} />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/member/chat" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
          <MessageCircle size={20} />
          <span className="text-[10px]">Chat</span>
        </Link>
        <Link href="/member/change-password" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
          <Lock size={20} />
          <span className="text-[10px]">Security</span>
        </Link>
        <button onClick={handleLogout} disabled={logout.isPending} className="flex flex-col items-center gap-1 text-destructive hover:text-destructive/80 disabled:opacity-50">
          <LogOut size={20} />
          <span className="text-[10px]">Logout</span>
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-8 page-transition pt-6 md:pt-8">
        {children}
      </main>
    </div>
  );
}
