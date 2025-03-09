
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="font-bold text-xl">FinPilot</span>
            </a>
          </Link>
        </div>
        <nav className="flex-1">
          <ul className="flex gap-4">
            <li>
              <Link href="/">
                <a className="text-sm font-medium transition-colors hover:text-primary">
                  Home
                </a>
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link href="/dashboard">
                    <a className="text-sm font-medium transition-colors hover:text-primary">
                      Dashboard
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/clients/new">
                    <a className="text-sm font-medium transition-colors hover:text-primary">
                      New Client
                    </a>
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button 
  variant="outline" 
  size="sm" 
  onClick={() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/auth', { replace: true });
      }
    });
  }}
  disabled={logoutMutation.isPending}
>
  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
</Button>
            </>
          ) : (
            <Link href="/auth">
              <a>
                <Button size="sm">Login</Button>
              </a>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
