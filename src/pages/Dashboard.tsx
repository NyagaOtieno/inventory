import { useQuery } from '@tanstack/react-query';
import { Users, Bus, ClipboardList, MapPin } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { getStudents, getBuses, getManifests, getLiveLocations } from '@/lib/api';

export default function Dashboard() {
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: getBuses,
  });

  const { data: manifests = [] } = useQuery({
    queryKey: ['manifests'],
    queryFn: getManifests,
  });

  const { data: liveLocations = [] } = useQuery({
    queryKey: ['liveLocations'],
    queryFn: getLiveLocations,
  });

  const activeBuses = buses.filter((bus: any) => bus.status === 'ACTIVE').length;
  const tripsToday = manifests.filter((m: any) => {
    const today = new Date().toDateString();
    return new Date(m.timestamp).toDateString() === today;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={students.length}
          icon={Users}
          trend="+12% from last month"
          colorClass="text-primary"
        />
        <StatsCard
          title="Active Buses"
          value={activeBuses}
          icon={Bus}
          trend={`${buses.length} total buses`}
          colorClass="text-accent"
        />
        <StatsCard
          title="Trips Today"
          value={tripsToday}
          icon={ClipboardList}
          colorClass="text-info"
        />
        <StatsCard
          title="Buses on Route"
          value={liveLocations.length}
          icon={MapPin}
          trend="Live tracking active"
          colorClass="text-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {manifests.slice(0, 5).map((manifest: any) => (
              <div key={manifest.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">Student #{manifest.studentId}</p>
                  <p className="text-sm text-muted-foreground">Bus #{manifest.busId}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    manifest.status === 'CHECKED_IN'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {manifest.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Active Routes</h3>
          <div className="space-y-4">
            {buses
              .filter((bus: any) => bus.status === 'ACTIVE')
              .map((bus: any) => (
                <div key={bus.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{bus.name}</p>
                    <p className="text-sm text-muted-foreground">{bus.route}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{bus.plateNumber}</p>
                    <p className="text-xs text-muted-foreground">{bus.driver}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
