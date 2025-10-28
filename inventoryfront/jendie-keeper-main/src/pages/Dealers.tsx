import { useState, useEffect } from 'react';
import API from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Dealer {
  id: number | string;
  name: string;
  email?: string;
  phone: string;
  price?: number;
}

const Dealers = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    price: 0,
  });
  const [dealerToDelete, setDealerToDelete] = useState<Dealer | null>(null);

  const { toast } = useToast();

  const fetchDealers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dealers');
      const dealerList = Array.isArray(res.data?.data) ? res.data.data : [];
      setDealers(dealerList);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load dealers',
        variant: 'destructive',
      });
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDealer) {
        await API.put(`/dealers/${editingDealer.id}`, formData);
        toast({ title: 'Success', description: 'Dealer updated successfully' });
      } else {
        await API.post('/dealers', formData);
        toast({ title: 'Success', description: 'Dealer added successfully' });
      }
      setIsDialogOpen(false);
      setFormData({ name: '', email: '', phone: '', price: 0 });
      setEditingDealer(null);
      fetchDealers();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  const openDialogForEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setFormData({
      name: dealer.name,
      email: dealer.email || '',
      phone: dealer.phone,
      price: dealer.price || 0,
    });
    setIsDialogOpen(true);
  };

  // Delete dealer with modern toast confirmation
  const confirmDeleteDealer = (dealer: Dealer) => {
    setDealerToDelete(dealer);
    toast({
      title: 'Confirm Delete',
      description: `Are you sure you want to delete ${dealer.name}?`,
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteDealer(dealer.id)}
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setDealerToDelete(null)}
          >
            Cancel
          </Button>
        </div>
      ),
      duration: 10000, // Keep toast long enough to act
    });
  };

  const handleDeleteDealer = async (id: number | string) => {
    try {
      await API.delete(`/dealers/${id}`);
      toast({ title: 'Deleted', description: 'Dealer deleted successfully' });
      setDealerToDelete(null);
      fetchDealers();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Cannot delete dealer with reserved/sold inventory',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dealers</h1>
          <p className="text-muted-foreground">Manage your dealer network</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4 mr-2" /> {editingDealer ? 'Edit Dealer' : 'Add Dealer'}
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDealer ? 'Edit Dealer' : 'Add New Dealer'}</DialogTitle>
              <DialogDescription>
                {editingDealer ? 'Update dealer information' : 'Register a new dealer in your network'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dealer Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (KSh) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || 0}
                  onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full gradient-primary hover:opacity-90 transition-opacity">
                {editingDealer ? 'Update Dealer' : 'Add Dealer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : dealers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No dealers registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  dealers.map(dealer => (
                    <TableRow key={dealer.id}>
                      <TableCell>{dealer.name}</TableCell>
                      <TableCell>{dealer.email || '-'}</TableCell>
                      <TableCell>{dealer.phone}</TableCell>
                      <TableCell className="text-right">
                        KSh {dealer.price?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => openDialogForEdit(dealer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => confirmDeleteDealer(dealer)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dealers;
