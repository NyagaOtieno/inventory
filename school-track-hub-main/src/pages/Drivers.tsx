import { useQuery } from '@tanstack/react-query';
import { Plus, Search, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getBuses } from '@/lib/api';

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: buses = [], isLoading } = useQuery({
    queryKey: ['buses'],
    queryFn: getBuses,
  });

  // Extract unique drivers from buses
  const drivers = buses
    .filter((bus: any) => bus.driver)
    .map((bus: any) => ({
      id: bus.driverId || bus.id,
      name: typeof bus.driver === 'object' ? bus.driver.name : bus.driver,
      phone: typeof bus.driver === 'object' ? bus.driver.phone : 'N/A',
      busId: bus.id,
      busName: bus.name,
      plateNumber: bus.plateNumber,
    }))
    .filter((driver: any, index: number, self: any[]) => 
      index === self.findIndex((d) => d.name === driver.name)
    );

  const filteredDrivers = drivers.filter((driver: any) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Drivers</h2>
          <p className="text-muted-foreground mt-1">Manage bus drivers and their assignments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Assigned Bus</TableHead>
              <TableHead>Plate Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading drivers...
                </TableCell>
              </TableRow>
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No drivers found
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver: any) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{driver.busName}</TableCell>
                  <TableCell>{driver.plateNumber}</TableCell>
                  <TableCell className="text-right">
                    <Link to="/tracking">
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        View Location
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
