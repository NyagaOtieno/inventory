import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
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
import { getBuses, getStudents } from '@/lib/api';

export default function Buses() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: buses = [], isLoading } = useQuery({
    queryKey: ['buses'],
    queryFn: getBuses,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const getStudentCount = (busId: number) => {
    return students.filter((s: any) => s.busId === busId).length;
  };

  const filteredBuses = buses.filter((bus: any) =>
    bus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Buses</h2>
          <p className="text-muted-foreground mt-1">Manage fleet and bus assignments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Bus
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buses..."
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
              <TableHead>Plate Number</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading buses...
                </TableCell>
              </TableRow>
            ) : filteredBuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No buses found
                </TableCell>
              </TableRow>
            ) : (
              filteredBuses.map((bus: any) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.name}</TableCell>
                  <TableCell>{bus.plateNumber}</TableCell>
                  <TableCell>{bus.route}</TableCell>
                  <TableCell>{bus.driver}</TableCell>
                  <TableCell>{bus.capacity}</TableCell>
                  <TableCell>{getStudentCount(bus.id)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bus.status === 'ACTIVE'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {bus.status}
                    </span>
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
