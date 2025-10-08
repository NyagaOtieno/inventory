import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getLiveLocations } from '@/lib/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
const busIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Tracking() {
  const { data: locations = [], isLoading, refetch } = useQuery({
    queryKey: ['liveLocations'],
    queryFn: getLiveLocations,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p>Loading map...</p>
      </div>
    );
  }

  const center = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : [-1.2921, 36.8219]; // Default to Nairobi

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Live Bus Tracking</h2>
          <p className="text-muted-foreground mt-1">Real-time location of all active buses</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden h-[600px]">
        <MapContainer
          center={center as [number, number]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((location: any) => (
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
                    Last update: {new Date(location.lastUpdate).toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location: any) => (
          <div key={location.id} className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{location.bus.name}</h3>
                <p className="text-sm text-muted-foreground">{location.bus.plateNumber}</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Lat: {location.latitude.toFixed(4)}</p>
              <p>Lng: {location.longitude.toFixed(4)}</p>
              <p className="mt-1">Updated: {new Date(location.lastUpdate).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
