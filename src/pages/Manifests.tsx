import { useQuery } from '@tanstack/react-query';
import { getManifests } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Manifests() {
  const { data: manifests = [], isLoading } = useQuery({
    queryKey: ['manifests'],
    queryFn: getManifests,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Trip Manifests</h2>
        <p className="text-muted-foreground mt-1">View all student check-in and check-out records</p>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Bus ID</TableHead>
              <TableHead>Assistant ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading manifests...
                </TableCell>
              </TableRow>
            ) : manifests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No manifests found
                </TableCell>
              </TableRow>
            ) : (
              manifests.map((manifest: any) => (
                <TableRow key={manifest.id}>
                  <TableCell className="font-medium">{manifest.id}</TableCell>
                  <TableCell>{manifest.studentId}</TableCell>
                  <TableCell>{manifest.busId}</TableCell>
                  <TableCell>{manifest.assistantId}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        manifest.status === 'CHECKED_IN'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {manifest.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(manifest.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="text-xs">
                    {manifest.latitude.toFixed(4)}, {manifest.longitude.toFixed(4)}
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
