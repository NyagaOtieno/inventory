import { Link, useLocation, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  LogOut,
} from "lucide-react";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/inventory", label: "Inventory", icon: Package },
    { path: "/dealers", label: "Dealers", icon: Users },
    { path: "/sales", label: "Sales", icon: ShoppingCart },
  ];

  const firstLetter = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card relative">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            Jendie Speed Governor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Inventory System</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {firstLetter}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role || "staff"}
              </p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
