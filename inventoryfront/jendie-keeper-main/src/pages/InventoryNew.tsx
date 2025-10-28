import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/lib/axios'; // Axios instance with baseURL and token
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UploadCloud, Download } from 'lucide-react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const InventoryNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dealers, setDealers] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    serialNumber: '',
    simNumber: '',
    model: '4G',
    dealerId: '',
    sellingPrice: '',
    dateAdded: new Date().toISOString().split('T')[0],
  });

  // Fetch dealers from backend
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const res = await API.get('/dealers');
        setDealers(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to load dealers',
          variant: 'destructive',
        });
      }
    };
    fetchDealers();
  }, []);

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Manual Add Unit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serialNumber || !formData.simNumber) {
      toast({ title: 'Error', description: 'Serial and SIM number are required', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    try {
      const payload = {
        model: formData.model,
        serialSimPairs: [
          {
            serialNumber: formData.serialNumber,
            simNumber: formData.simNumber,
          },
        ],
        dateAdded: formData.dateAdded,
      };

      await API.post('/inventory', payload);

      toast({ title: 'Success', description: 'Unit added successfully' });
      navigate('/inventory');
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add inventory unit',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Upload
  const handleUploadCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const inventoryMap: Record<string, any> = {};
        results.data.forEach((row: any) => {
          const { model, serialNumber, simNumber, dateAdded } = row;
          if (!model || !serialNumber || !simNumber) return;

          if (!inventoryMap[model])
            inventoryMap[model] = { model, serialSimPairs: [], dateAdded: dateAdded || new Date().toISOString().split('T')[0] };
          inventoryMap[model].serialSimPairs.push({ serialNumber, simNumber });
        });

        try {
          for (const inv of Object.values(inventoryMap)) {
            await API.post('/inventory', inv);
          }
          toast({ title: 'Success', description: 'CSV uploaded successfully' });
        } catch (err: any) {
          console.error(err);
          toast({ title: 'Error', description: err.response?.data?.message || 'CSV upload failed', variant: 'destructive' });
        }
      },
    });
  };

  // CSV Download
  const handleDownloadCSV = async () => {
    try {
      const res = await API.get('/inventory'); // Get all inventory
      const rows: any[] = [];

      res.data.data.forEach((item: any) => {
        item.serialSims.forEach((s: any) => {
          rows.push({
            model: item.model,
            serialNumber: s.serialNumber,
            simNumber: s.simNumber,
            dateAdded: item.dateAdded.split('T')[0],
            status: s.status,
          });
        });
      });

      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'inventory_export.csv');
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to export CSV', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={() => navigate('/inventory')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
      </Button>

      <Card className="max-w-2xl shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Unit</CardTitle>
          <CardDescription>Register a new speed governor unit in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Manual Add Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  placeholder="JSG-2024-006"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="simNumber">SIM Card Number *</Label>
                <Input
                  id="simNumber"
                  placeholder="254700123461"
                  value={formData.simNumber}
                  onChange={(e) => handleChange('simNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Select value={formData.model} onValueChange={(v) => handleChange('model', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4G">4G</SelectItem>
                  <SelectItem value="2G">2G</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="gradient-primary hover:opacity-90 transition-opacity"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Unit'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
                Cancel
              </Button>
            </div>
          </form>

          {/* CSV Upload */}
          <div className="pt-6">
            <Label>Upload CSV</Label>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleUploadCSV(e.target.files[0])}
            />
          </div>

          {/* CSV Download */}
          <div className="pt-4">
            <Button type="button" onClick={handleDownloadCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryNew;
