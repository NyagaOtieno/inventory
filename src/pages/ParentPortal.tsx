import { useQuery } from '@tanstack/react-query';
import { MapPin, Bus, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { getStudents, getBuses, getLiveLocations } from '@/lib/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const busIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function ParentPortal() {
  const currentUser = getCurrentUser();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: getBuses,
  });

  const { data: locations = [], refetch } = useQuery({
    queryKey: ['liveLocations'],
    queryFn: getLiveLocations,
    refetchInterval: 30000,
  });

  // Filter students for this parent (in real app, filter by parentId)
  const myStudents = students.filter((student: any) => 
    student.parent === currentUser?.name || students.slice(0, 2)
  );

  const myBusIds = myStudents.map((s: any) => s.busId);
  const myBuses = buses.filter((b: any) => myBusIds.includes(b.id));

  const center = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : [-1.2921, 36.8219];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Parent Portal</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome, {currentUser?.name || 'Parent'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Children</h2>
          <p className="text-muted-foreground">Track your children's bus routes and status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myStudents.map((student: any) => {
            const bus = buses.find((b: any) => b.id === student.busId);
            return (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle>{student.name}</CardTitle>
                  <CardDescription>{student.grade}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-primary" />
                    <span className="text-sm">{bus?.name || 'Not Assigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span className="text-sm">{bus?.route || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'CHECKED_IN'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Bus Tracking</CardTitle>
            <CardDescription>Real-time location of your children's buses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <MapContainer
                key={locations.length}
                center={center as [number, number]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations
                  .filter((loc: any) => myBusIds.includes(loc.bus?.id))
                  .map((location: any) => (
                    <Marker
                      key={location.id}
                      position={[location.latitude, location.longitude]}
                      icon={busIcon}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{location.bus.name}</h3>
                          <p className="text-sm">{location.bus.plateNumber}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated: {new Date(location.lastUpdate).toLocaleTimeString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myBuses.map((bus: any) => (
            <Card key={bus.id}>
              <CardHeader>
                <CardTitle>{bus.name}</CardTitle>
                <CardDescription>{bus.plateNumber}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Route</span>
                  <span className="text-sm text-muted-foreground">{bus.route}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Driver</span>
                  <span className="text-sm text-muted-foreground">{bus.driver}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bus.status === 'ACTIVE'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {bus.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
