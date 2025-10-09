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
import { getParents, getStudents } from '@/lib/api';

export default function Parents() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: parents = [], isLoading } = useQuery({
    queryKey: ['parents'],
    queryFn: getParents,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const getStudentNames = (studentIds: number[] | undefined) => {
    if (!studentIds || !Array.isArray(studentIds)) return 'N/A';
    return studentIds
      .map((id) => {
        const student = students.find((s: any) => s.id === id);
        return student ? student.name : '';
      })
      .filter(Boolean)
      .join(', ') || 'N/A';
  };

  const filteredParents = parents.filter((parent: any) =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Parents</h2>
          <p className="text-muted-foreground mt-1">Manage parent contacts and linked students</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Parent
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parents..."
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
              <TableHead>Email</TableHead>
              <TableHead>Linked Students</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading parents...
                </TableCell>
              </TableRow>
            ) : filteredParents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No parents found
                </TableCell>
              </TableRow>
            ) : (
              filteredParents.map((parent: any) => (
                <TableRow key={parent.id}>
                  <TableCell className="font-medium">{parent.name}</TableCell>
                  <TableCell>{parent.phoneNumber}</TableCell>
                  <TableCell>{parent.email}</TableCell>
                  <TableCell>{getStudentNames(parent.studentIds)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
