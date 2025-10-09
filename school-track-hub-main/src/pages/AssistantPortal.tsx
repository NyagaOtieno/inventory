import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getManifests, getStudents, getBuses } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AssistantPortal() {
  const { data: manifests = [] } = useQuery({
    queryKey: ['manifests'],
    queryFn: getManifests,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: getBuses,
  });

  const checkedIn = manifests.filter((m: any) => m.status === 'CHECKED_IN').length;
  const checkedOut = manifests.filter((m: any) => m.status === 'CHECKED_OUT').length;

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bus Assistant Portal</h1>
          <p className="text-muted-foreground mt-1">Manage student attendance and safety</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Checked In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <span className="text-3xl font-bold">{checkedIn}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checked Out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-8 w-8 text-muted-foreground" />
                <span className="text-3xl font-bold">{checkedOut}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{students.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Bus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold text-lg">{buses[0]?.name || 'Not Assigned'}</p>
              <p className="text-muted-foreground">{buses[0]?.plateNumber || 'N/A'}</p>
              <p className="text-sm">Route: {buses[0]?.route || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Check-In/Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No students found</p>
              ) : (
                students.slice(0, 6).map((student: any) => {
                  const manifest = manifests.find((m: any) => m.studentId === student.id);
                  const status = manifest?.status;

                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Grade {student.grade || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {status === 'CHECKED_IN' ? (
                          <Badge variant="default" className="bg-success">Checked In</Badge>
                        ) : status === 'CHECKED_OUT' ? (
                          <Badge variant="secondary">Checked Out</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
