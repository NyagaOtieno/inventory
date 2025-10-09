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
import { getAssistants, getBuses } from '@/lib/api';

export default function Assistants() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: assistants = [], isLoading } = useQuery({
    queryKey: ['assistants'],
    queryFn: getAssistants,
  });

  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: getBuses,
  });

  const getBusName = (busId: number) => {
    const bus = buses.find((b: any) => b.id === busId);
    return bus ? bus.name : 'Not Assigned';
  };

  const filteredAssistants = assistants.filter((assistant: any) =>
    assistant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Assistants</h2>
          <p className="text-muted-foreground mt-1">Manage bus assistants and their assignments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Assistant
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assistants..."
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Loading assistants...
                </TableCell>
              </TableRow>
            ) : filteredAssistants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No assistants found
                </TableCell>
              </TableRow>
            ) : (
              filteredAssistants.map((assistant: any) => (
                <TableRow key={assistant.id}>
                  <TableCell className="font-medium">{assistant.name}</TableCell>
                  <TableCell>{assistant.phoneNumber}</TableCell>
                  <TableCell>{getBusName(assistant.busId)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
