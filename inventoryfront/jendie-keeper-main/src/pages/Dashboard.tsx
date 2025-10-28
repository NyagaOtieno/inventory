// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import API from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, TrendingUp, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUnits: 0,
    availableUnits: 0,
    soldUnits: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both inventory and sales concurrently
        const [inventoryRes, salesRes] = await Promise.all([
          API.get("/inventory"),
          API.get("/sales"),
        ]);

        const inventory = inventoryRes.data?.data || [];
        const sales = salesRes.data || [];

        // ---------------------
        // 🔹 Inventory metrics
        // ---------------------
        const totalUnits = inventory.reduce(
          (sum: number, item: any) => sum + (item.serialSims?.length || 0),
          0
        );

        const availableUnits = inventory.reduce((sum: number, item: any) => {
          const available =
            item.serialSims?.filter((s: any) => s.status === "available").length || 0;
          return sum + available;
        }, 0);

        const soldUnits = inventory.reduce((sum: number, item: any) => {
          const sold =
            item.serialSims?.filter((s: any) => s.status === "sold").length || 0;
          return sum + sold;
        }, 0);

        // ---------------------
        // 💰 Sales metrics
        // ---------------------
        const revenue = sales.reduce(
          (sum: number, sale: any) => sum + (sale.totalPrice || 0),
          0
        );

        // ---------------------
        // 🕓 Recent Activity
        // ---------------------
        const inventoryActivity = inventory
          .map((item: any) => ({
            type: "Inventory",
            message: `Added model ${item.model} (${item.serialSims?.length || 0} units)`,
            date: item.createdAt,
          }))
          .slice(-3);

        const salesActivity = sales
          .map((sale: any) => ({
            type: "Sale",
            message: `Sold ${sale.product?.model || "a unit"} for KSh ${sale.totalPrice.toLocaleString()}`,
            date: sale.createdAt,
          }))
          .slice(-3);

        const combinedActivity = [...inventoryActivity, ...salesActivity]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5);

        // ✅ Update state
        setStats({ totalUnits, availableUnits, soldUnits, revenue });
        setRecentActivity(combinedActivity);
      } catch (error: any) {
        console.error("Dashboard fetch error:", error);
        toast({
          title: "Error loading dashboard",
          description:
            error.response?.data?.message ||
            "Unable to fetch data from backend API.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Stat cards definition
  const statCards = [
    {
      title: "Total Units",
      value: loading ? "..." : stats.totalUnits,
      icon: Package,
      gradient: "bg-blue-500",
      textColor: "text-blue-500",
    },
    {
      title: "Available",
      value: loading ? "..." : stats.availableUnits,
      icon: CheckCircle,
      gradient: "bg-green-500",
      textColor: "text-green-500",
    },
    {
      title: "Sold",
      value: loading ? "..." : stats.soldUnits,
      icon: TrendingUp,
      gradient: "bg-purple-500",
      textColor: "text-purple-500",
    },
    {
      title: "Total Revenue",
      value: loading ? "..." : `KSh ${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your speed governor inventory and sales performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="shadow-soft hover:shadow-medium transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={`w-10 h-10 rounded-lg ${stat.gradient} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.title === "Total Units" && "All registered devices"}
                  {stat.title === "Available" && "Ready for sale"}
                  {stat.title === "Sold" && "Units sold"}
                  {stat.title === "Total Revenue" && "From all completed sales"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity + Quick Stats */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity found.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Placeholder */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              More analytics coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
