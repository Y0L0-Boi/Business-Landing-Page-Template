import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import { Chatbot } from "@/components/ui/chatbot/Chatbot";
import Dashboard from "@/pages/Dashboard";
import ClientDashboard from "@/pages/ClientDashboard";
import NewGoal from "@/pages/NewGoal";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  return (
    <Route {...rest} component={() => isAuthenticated ? <Component /> : <></>} />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/clients/:id" component={ClientDashboard} />
      <ProtectedRoute path="/clients/:id/goals/new" component={NewGoal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
        <Chatbot className="!left-4 !right-auto" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;