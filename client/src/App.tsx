// Import Switch, Route, and useLocation components from wouter for routing
import { Switch, Route, useLocation } from "wouter";

// Import the queryClient instance from the queryClient file
import { queryClient } from "./lib/queryClient";

// Import QueryClientProvider from @tanstack/react-query to provide the query client to the app
import { QueryClientProvider } from "@tanstack/react-query";

// Import Toaster component for displaying toast notifications
import { Toaster } from "@/components/ui/toaster";

// Import AuthProvider and useAuth hook for authentication context
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Import NotFound component for handling 404 errors
import NotFound from "@/pages/not-found";

// Import Home component for the home page
import Home from "@/pages/Home";

// Import Auth component for the authentication page
import Auth from "@/pages/Auth";

// Import Dashboard component for the main dashboard page
import Dashboard from "@/pages/Dashboard";

// Import ClientDashboard component for displaying client details
import ClientDashboard from "@/pages/ClientDashboard";

// Import NewGoal component for creating new goals
import NewGoal from "@/pages/NewGoal";

// Import NewClient component for creating new clients
import NewClient from "@/pages/NewClient"; // Import the NewClient component

// Define a simple ClientDetails component for displaying client details
const ClientDetails = () => <div>Client Details Page</div>;

// Define a ProtectedRoute component to handle routes that require authentication
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { user } = useAuth(); // Get the current user from the authentication context
  const isAuthenticated = Boolean(user); // Check if the user is authenticated
  return (
    <Route {...rest} component={() => isAuthenticated ? <Component /> : <></>} /> // Render the component if authenticated, otherwise render nothing
  );
}

// Define the Router component to handle the application's routing
// Import the Navbar component
import { Navbar } from "@/components/Navbar";

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();
  const isHomePage = location === "/";

  return (
    <div className="min-h-screen">
      {user && !isHomePage && <Navbar />}
      <main>
        <Switch>
          <Route path="/" component={Home} /> {/* Route for the home page */}
          <Route path="/auth" component={Auth} /> {/* Route for the authentication page */}
          <ProtectedRoute path="/dashboard" component={Dashboard} /> {/* Protected route for the dashboard */}
          <ProtectedRoute path="/clients/new" component={NewClient} /> {/* Protected route for creating new clients */}
          <ProtectedRoute path="/clients/:id" component={ClientDashboard} /> {/* Protected route for displaying client details */}
          <ProtectedRoute path="/clients/:id/goals/new" component={NewGoal} /> {/* Protected route for creating new goals */}
          <Route path="/clients/:id">
            <ClientDetails /> {/* Route for displaying client details */}
          </Route>
          <Route component={NotFound} /> {/* Route for handling 404 errors */}
        </Switch>
      </main>
    </div>
  );
}

// Define the main App component
function App() {
  return (
    <QueryClientProvider client={queryClient}> {/* Provide the query client to the app */}
      <AuthProvider> {/* Provide the authentication context to the app */}
        <Router /> {/* Render the Router component */}
        <Toaster /> {/* Render the Toaster component for displaying toast notifications */}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; // Export the App component as the default export