import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = "https://jendie-inventory-backend-production.up.railway.app/api";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();

  // editing context: parent inventory id & serial id
  const [editingParentId, setEditingParentId] = useState(null);
  const [editingSerialId, setEditingSerialId] = useState(null);
  const [editData, setEditData] = useState({ model: "", serialNumber: "", simNumber: "" });

  // helper to attach auth header if token present
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/inventory`, { headers: getAuthHeaders() });
      setInventory(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("fetchInventory error:", err);
      toast({
        title: "Error fetching inventory",
        description: (err?.response?.data?.message) || "Could not load inventory data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      available: { variant: "default", className: "bg-green-500 hover:bg-green-600" },
      sold: { variant: "secondary", className: "bg-purple-500 text-white" },
      reserved: { variant: "outline", className: "border-yellow-500 text-yellow-500" },
    };
    const config = variants[status] || variants.available;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredData = useMemo(() => {
    return inventory.filter(item => {
      const sims = item.serialSims || [];
      const searchMatch = search
        ? sims.some(s =>
            (s.serialNumber || "").toLowerCase().includes(search.toLowerCase()) ||
            (s.simNumber || "").includes(search)
          ) || (item.model || "").toLowerCase().includes(search.toLowerCase())
        : true;
      const statusMatch = statusFilter === "all" ? true : sims.some(s => s.status === statusFilter);
      return searchMatch && statusMatch;
    });
  }, [inventory, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const startEdit = (s, model, parentId) => {
    setEditingParentId(parentId);
    setEditingSerialId(s.id);
    setEditData({ model: model || "", serialNumber: s.serialNumber || "", simNumber: s.simNumber || "" });
  };

  const cancelEdit = () => {
    setEditingParentId(null);
    setEditingSerialId(null);
    setEditData({ model: "", serialNumber: "", simNumber: "" });
  };

  /**
   * saveEdit:
   * Preferred call: PUT /inventory/:parentId with payload containing updated fields
   * If backend expects updating a specific serial, we try PUT /inventory/serials/:serialId as fallback.
   */
  const saveEdit = async (parentId, serialId) => {
    try {
      // Build payload that most inventory APIs accept:
      // update parent model and nested serial entry (by id)
      const payload = {
        model: editData.model,
        // some backends accept serialSims array with objects to update
        serialSims: [
          {
            id: serialId,
            serialNumber: editData.serialNumber,
            simNumber: editData.simNumber,
          },
        ],
      };

      // Primary attempt: update parent product
      await axios.put(`${BASE_URL}/inventory/${parentId}`, payload, { headers: getAuthHeaders() });

      toast({ title: "✅ Updated", description: "Inventory updated successfully" });
      cancelEdit();
      fetchInventory();
    } catch (err) {
      // Fallback: try updating the serial directly if API exposes that
      console.warn("Primary PUT failed, attempting fallback:", err?.response?.data || err);
      try {
        // Try endpoint for serial (common pattern: /inventory/serials/:serialId or /serials/:id)
        await axios.put(`${BASE_URL}/inventory/serials/${serialId}`, {
          serialNumber: editData.serialNumber,
          simNumber: editData.simNumber,
          // optionally model if API accepts
          model: editData.model,
        }, { headers: getAuthHeaders() });

        toast({ title: "✅ Updated (fallback)", description: "Serial updated successfully" });
        cancelEdit();
        fetchInventory();
      } catch (err2) {
        console.error("Fallback update failed:", err2);
        toast({
          title: "Error updating",
          description: err2?.response?.data?.message || "Failed to update record",
          variant: "destructive",
        });
      }
    }
  };

  /**
   * deleteItem:
   * Prefer to delete the serial by calling an endpoint that targets the parent inventory (removes specific serial),
   * if that's unavailable, try deleting the whole parent product as last resort.
   */
  const deleteItem = async (parentId, serialId, serialNumber, status) => {
    if (status === "sold" || status === "reserved") {
      toast({
        title: "Cannot delete",
        description: "Item is sold or reserved",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${serialNumber || "this item"}?`)) return;

    try {
      // Attempt to delete serial specifically (common pattern)
      await axios.delete(`${BASE_URL}/inventory/serials/${serialId}`, { headers: getAuthHeaders() });
      toast({ title: "🗑️ Deleted", description: "Serial removed successfully" });
      fetchInventory();
      return;
    } catch (err) {
      console.warn("Delete serial endpoint failed, trying remove-from-parent or delete-parent:", err?.response?.data || err);
      // fallback 1: call parent endpoint with query/body to remove the serial (if API supports)
      try {
        // some APIs accept DELETE /inventory/:parentId?serialId=...
        await axios.delete(`${BASE_URL}/inventory/${parentId}`, {
          params: { serialId },
          headers: getAuthHeaders(),
        });
        toast({ title: "🗑️ Deleted", description: "Serial removed from parent inventory" });
        fetchInventory();
        return;
      } catch (err2) {
        console.warn("Delete with query fallback failed:", err2?.response?.data || err2);
        // fallback 2: as last resort, attempt deleting the parent product (be careful)
        try {
          await axios.delete(`${BASE_URL}/inventory/${parentId}`, { headers: getAuthHeaders() });
          toast({ title: "🗑️ Deleted", description: "Parent inventory deleted (last-resort)" });
          fetchInventory();
          return;
        } catch (err3) {
          console.error("All delete attempts failed:", err3);
          toast({
            title: "Error deleting",
            description: (err3?.response?.data?.message) || "Failed to delete record",
            variant: "destructive",
          });
        }
      }
    }
  };

  // derived helper: show total pages guard
  const showTotalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory</h1>
          <p className="text-muted-foreground">Manage your speed governor units</p>
        </div>
        <Link to="/inventory/new">
          <Button className="gradient-primary hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4 mr-2" /> Add New Unit
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-soft mb-6">
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by serial, SIM, or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-soft">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>SIM Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No inventory found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) =>
                    (item.serialSims || []).map((s) => (
                      <TableRow key={`${item.id}-${s.id}`}>
                        <TableCell>
                          {editingParentId === item.id && editingSerialId === s.id ? (
                            <Input
                              value={editData.model}
                              onChange={(e) =>
                                setEditData((prev) => ({ ...prev, model: e.target.value }))
                              }
                            />
                          ) : (
                            item.model
                          )}
                        </TableCell>
                        <TableCell>
                          {editingParentId === item.id && editingSerialId === s.id ? (
                            <Input
                              value={editData.serialNumber}
                              onChange={(e) =>
                                setEditData((prev) => ({ ...prev, serialNumber: e.target.value }))
                              }
                            />
                          ) : (
                            s.serialNumber
                          )}
                        </TableCell>
                        <TableCell>
                          {editingParentId === item.id && editingSerialId === s.id ? (
                            <Input
                              value={editData.simNumber}
                              onChange={(e) =>
                                setEditData((prev) => ({ ...prev, simNumber: e.target.value }))
                              }
                            />
                          ) : (
                            s.simNumber
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(s.status)}</TableCell>
                        <TableCell>{new Date(item.dateAdded).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                          {editingParentId === item.id && editingSerialId === s.id ? (
                            <>
                              <Button size="sm" variant="outline" onClick={() => saveEdit(item.id, s.id)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(s, item.model, item.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteItem(item.id, s.id, s.serialNumber, s.status)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {showTotalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {showTotalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(showTotalPages, p + 1))}
            disabled={page === showTotalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Inventory;
