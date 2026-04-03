import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminMembers from "@/pages/admin/Members";
import AdminAttendance from "@/pages/admin/Attendance";
import AdminMessages from "@/pages/admin/Messages";
import AdminMusic from "@/pages/admin/Music";
import AdminChat from "@/pages/admin/Chat";
import MemberHome from "@/pages/member/Home";
import MemberChat from "@/pages/member/Chat";
import ChangePassword from "@/pages/member/ChangePassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/members" component={AdminMembers} />
      <Route path="/admin/attendance" component={AdminAttendance} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/music" component={AdminMusic} />
      <Route path="/admin/chat" component={AdminChat} />
      <Route path="/member/home" component={MemberHome} />
      <Route path="/member/chat" component={MemberChat} />
      <Route path="/member/change-password" component={ChangePassword} />
      <Route>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans tracking-widest uppercase">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary glow-text mb-4">404</h1>
            <p className="text-muted-foreground">Sector not found.</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
