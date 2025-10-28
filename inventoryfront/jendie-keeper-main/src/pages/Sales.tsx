import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Sales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); // Assuming you store JWT here

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get(
          'https://jendie-inventory-backend-production.up.railway.app/api/sales',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSales(response.data); // Adjust if response has a nested `data` property
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [token]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sales Records</h1>
          <p className="text-muted-foreground">Track all completed sales</p>
        </div>
        <Button onClick={() => navigate('/sales/new')}>New Sale</Button>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>SIM Card</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading sales...
                    </TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No sales recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale: any) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.serialNumber || '—'}</TableCell>
                      <TableCell>{sale.simCardNumber || '—'}</TableCell>
                      <TableCell>{sale.model || '—'}</TableCell>
                      <TableCell>{sale.buyerName || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={sale.dealerName ? 'default' : 'secondary'}>
                          {sale.dealerName ? 'Dealer' : 'Direct'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        KSh {sale.totalAmount?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        {sale.dateSold
                          ? new Date(sale.dateSold).toLocaleDateString()
                          : '—'}
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

export default Sales;
