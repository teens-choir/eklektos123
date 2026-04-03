import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLogin, useRegister, useGetCurrentUser } from "@workspace/api-client-react";
import { Music, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading, isError: userError } = useGetCurrentUser();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") setLocation("/admin/dashboard");
      else setLocation("/member/home");
    }
  }, [user, setLocation]);

  if (userLoading && !userError) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!username || !password) {
      setErrorMsg("Username and password are required.");
      return;
    }

    const payload = { data: { username, password } };

    if (isLogin) {
      loginMutation.mutate(payload, {
        onSuccess: (res) => {
          setLocation(res.role === "admin" ? "/admin/dashboard" : "/member/home");
        },
        onError: (err: any) => {
          setErrorMsg(err?.error || "Login failed");
        }
      });
    } else {
      registerMutation.mutate(payload, {
        onSuccess: () => {
          setLocation("/member/home");
        },
        onError: (err: any) => {
          setErrorMsg(err?.error || "Registration failed");
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden theme-normal">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl z-10 page-transition border-primary/30 glow-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 glow-border">
            <Music className="text-primary w-8 h-8 glow-text" />
          </div>
          <h1 className="text-3xl font-bold tracking-widest uppercase glow-text text-center">Teenagers Choir</h1>
          <p className="text-primary mt-2 tracking-widest text-sm uppercase">Sanctuary Entrance</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3 text-destructive">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Username</label>
            <Input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/40 border-white/10 h-12 focus-visible:ring-primary focus-visible:border-primary transition-all text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Password</label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border-white/10 h-12 focus-visible:ring-primary focus-visible:border-primary transition-all text-white"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-md font-bold tracking-widest uppercase bg-primary hover:bg-primary/80 text-primary-foreground transition-all hover:scale-[1.02]"
            disabled={loginMutation.isPending || registerMutation.isPending}
          >
            {isLogin ? "Access System" : "Join Choir"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
          >
            {isLogin ? "Need clearance? Register here" : "Have clearance? Login here"}
          </button>
        </div>
      </div>
    </div>
  );
}
