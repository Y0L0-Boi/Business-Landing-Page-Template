import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">FinPilot</span>
          </Link>
        </div>
        <nav className="flex-1">
          <ul className="flex gap-4">
            <li>
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/clients/new" className="text-sm font-medium transition-colors hover:text-primary">
                    New Client
                  </Link>
                </li>
                {/* Added a link for the client list page */}
                <li>
                  <Link href="/clients" className="text-sm font-medium transition-colors hover:text-primary">
                    Clients
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-300">
                {user?.username || "User"}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-500 text-blue-400 hover:bg-blue-900/30"
                onClick={async () => {
                  try {
                    await logout();
                    setLocation('/auth', { replace: true });
                  } catch (error) {
                    console.error("Logout failed:", error);
                  }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}