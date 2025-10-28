import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const SalesNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [inventory, setInventory] = useState<any[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [dealers, setDealers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mpesaOption, setMpesaOption] = useState<"stk" | "upload" | "">("");
  const [balance, setBalance] = useState(0);

  const [formData, setFormData] = useState({
    saleType: "",
    dealerId: "",
    quantity: "",
    unitPrice: "",
    totalAmount: "",
    amountPaid: "",
    buyerName: "",
    buyerContact: "",
    paymentMethod: "",
    mpesaPhone: "",
    mpesaAmount: "",
    mpesaCode: "",
    proofOfPayment: null as File | null,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, dealerRes] = await Promise.all([
          axios.get(
            "https://jendie-inventory-backend-production.up.railway.app/api/inventory",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            "https://jendie-inventory-backend-production.up.railway.app/api/dealers",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        setInventory(invRes.data?.data || []);
        setDealers(dealerRes.data?.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory or dealers.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (selectedModel) {
      const filtered = inventory.filter((item) => item.model === selectedModel);
      setFilteredInventory(filtered);
      if (filtered.length > 0) {
        setFormData((prev) => ({
          ...prev,
          unitPrice: filtered[0].price?.toString() || "0",
        }));
      }
    } else {
      setFilteredInventory([]);
    }
  }, [selectedModel, inventory]);

  useEffect(() => {
    const qty = Number(formData.quantity);
    const price = Number(formData.unitPrice);
    const paid = Number(formData.amountPaid || 0);
    if (qty > 0 && price > 0) {
      const total = qty * price;
      setFormData((prev) => ({ ...prev, totalAmount: total.toString() }));
      setBalance(total - paid);
    }
  }, [formData.quantity, formData.unitPrice, formData.amountPaid]);

  const totalAvailable = filteredInventory.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const handleChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, proofOfPayment: e.target.files[0] }));
    }
  };

  const handleDealerSelect = (dealerId: string) => {
    const dealer = dealers.find((d) => d.id === dealerId || d._id === dealerId);
    if (dealer) {
      handleChange("unitPrice", dealer.price?.toString() || "0");
      handleChange("dealerId", dealerId);
    }
  };

  const handleSaleTypeChange = (type: string) => {
    handleChange("saleType", type);
    if (type === "dealer") {
      handleChange("buyerName", "");
      handleChange("buyerContact", "");
    } else {
      handleChange("dealerId", "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModel || filteredInventory.length === 0) {
      toast({
        title: "Missing Model",
        description: "Select a model with stock.",
        variant: "destructive",
      });
      return;
    }

    const qty = Number(formData.quantity);
    if (qty > totalAvailable) {
      toast({
        title: "Invalid Quantity",
        description: `Cannot sell more than available stock (${totalAvailable}).`,
        variant: "destructive",
      });
      return;
    }

    if (formData.saleType === "direct" && Number(formData.unitPrice) < 9500) {
      toast({
        title: "Invalid Price",
        description: "Direct sale price must be ≥ KSh 9500.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build saleItems and deduct from inventory correctly
      const saleItems: any[] = [];
      let remaining = qty;

      for (const item of filteredInventory) {
        if (remaining <= 0) break;
        const deduct = Math.min(item.quantity, remaining);
        remaining -= deduct;

        saleItems.push({
          productId: Number(item.id),
          quantity: deduct,
          serialNumber: item.serialNumber || "",
          simNumber: item.simNumber || "",
        });
      }

      // Build JSON payload
      const payload: any = {
        userId: formData.saleType === "direct" ? 2 : Number(formData.dealerId),
        dealerId: formData.saleType === "direct" ? 0 : Number(formData.dealerId),
        negotiatedPrice: Number(formData.totalAmount),
        isDirectSale: formData.saleType === "direct",
        saleItems,
      };

      // POST JSON
      await axios.post(
        "https://jendie-inventory-backend-production.up.railway.app/api/sales",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "✅ Sale Recorded",
        description: `Stock updated for ${selectedModel}.`,
      });

      // Update inventory quantities properly
      for (const item of saleItems) {
        const invItem = inventory.find((i) => i.id === item.productId);
        if (!invItem) continue;
        const newQty = invItem.quantity - item.quantity;
        await axios.put(
          `https://jendie-inventory-backend-production.up.railway.app/api/inventory/${item.productId}`,
          { quantity: newQty < 0 ? 0 : newQty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      navigate("/sales");
    } catch (error) {
      console.error("Sale failed:", error);
      toast({
        title: "Error",
        description: "Failed to record sale.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={() => navigate("/sales")} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sales
      </Button>

      <Card className="max-w-3xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Record New Sale</CardTitle>
          <CardDescription>Select model and record sale</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label>Product Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product model" />
                </SelectTrigger>
                <SelectContent>
                  {[...new Set(inventory.map((i) => i.model))].map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedModel && (
              <div>
                <Label>Available Stock</Label>
                <Input value={totalAvailable} disabled />
              </div>
            )}

            {/* Sale Type */}
            <div className="space-y-2">
              <Label>Sale Type</Label>
              <Select
                value={formData.saleType}
                onValueChange={handleSaleTypeChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sale type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dealer">Dealer</SelectItem>
                  <SelectItem value="direct">Direct Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dealer / Direct Client */}
            {formData.saleType === "dealer" && (
              <div className="space-y-2">
                <Label>Dealer</Label>
                <Select
                  value={formData.dealerId}
                  onValueChange={handleDealerSelect}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dealer" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealers.map((d) => (
                      <SelectItem key={d._id || d.id} value={d._id || d.id}>
                        {d.name} — KSh {Number(d.price).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.saleType === "direct" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Name</Label>
                  <Input
                    value={formData.buyerName}
                    onChange={(e) => handleChange("buyerName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Client Contact</Label>
                  <Input
                    value={formData.buyerContact}
                    onChange={(e) => handleChange("buyerContact", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Quantity + Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity (Available: {totalAvailable})</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Unit Price (KSh)</Label>
                <Input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => handleChange("unitPrice", e.target.value)}
                  disabled={formData.saleType === "dealer"}
                  required
                />
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Amount</Label>
                <Input value={formData.totalAmount} readOnly />
              </div>
              <div>
                <Label>Amount Paid</Label>
                <Input
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => handleChange("amountPaid", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Balance</Label>
              <Input value={balance} readOnly />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(v) => handleChange("paymentMethod", v)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-PESA</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="lpo">LPO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* M-PESA Options */}
            {formData.paymentMethod === "mpesa" && (
              <>
                <Label>M-PESA Option</Label>
                <Select
                  value={mpesaOption}
                  onValueChange={(v: "stk" | "upload") => setMpesaOption(v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select M-PESA option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stk">STK Push</SelectItem>
                    <SelectItem value="upload">Upload POP / Enter Code</SelectItem>
                  </SelectContent>
                </Select>

                {mpesaOption === "stk" && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label>M-PESA Phone</Label>
                      <Input
                        placeholder="07XXXXXXXX"
                        value={formData.mpesaPhone}
                        onChange={(e) => handleChange("mpesaPhone", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Amount (KSh)</Label>
                      <Input
                        type="number"
                        value={formData.mpesaAmount}
                        onChange={(e) => handleChange("mpesaAmount", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {mpesaOption === "upload" && (
                  <div className="mt-2 space-y-2">
                    <Label>Upload Proof / Enter Code</Label>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                    />
                    <Input
                      placeholder="Enter M-PESA Code"
                      value={formData.mpesaCode}
                      onChange={(e) => handleChange("mpesaCode", e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            {/* Other payment proof */}
            {["bank", "cheque", "lpo"].includes(formData.paymentMethod) && (
              <div className="space-y-2">
                <Label>Upload Proof of Payment</Label>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Record Sale"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/sales")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesNew;
