import { useState } from "react";
import { Car, Plus, Trash2, Edit, Phone, Clock, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Term, TransportDetails } from "@/types/school";
import { cn } from "@/lib/utils";

interface TransportDialogProps {
  term: Term;
  transport: TransportDetails[];
  onAddTransport: (transport: Omit<TransportDetails, 'id'>) => void;
  onRemoveTransport: (transportId: string) => void;
  onEditTransport: (transportId: string, updates: Partial<TransportDetails>) => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransportDialog({
  term,
  transport,
  onAddTransport,
  onRemoveTransport,
  onEditTransport,
  children,
  open,
  onOpenChange
}: TransportDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isAddingTransport, setIsAddingTransport] = useState(false);
  const [editingTransport, setEditingTransport] = useState<TransportDetails | null>(null);
  const [newTransport, setNewTransport] = useState({
    type: 'school-coach' as 'school-coach' | 'taxi',
    driverName: '',
    phoneNumber: '',
    licenseNumber: '',
    pickupTime: '',
    notes: ''
  });

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleAddTransport = () => {
    if (!newTransport.type) {
      return;
    }

    if (editingTransport) {
      onEditTransport(editingTransport.id, {
        ...newTransport,
        termId: term.id
      });
    } else {
      onAddTransport({
        ...newTransport,
        termId: term.id
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setNewTransport({
      type: 'school-coach',
      driverName: '',
      phoneNumber: '',
      licenseNumber: '',
      pickupTime: '',
      notes: ''
    });
    setIsAddingTransport(false);
    setEditingTransport(null);
  };

  const handleEditTransport = (transportItem: TransportDetails) => {
    setNewTransport({
      type: transportItem.type,
      driverName: transportItem.driverName,
      phoneNumber: transportItem.phoneNumber,
      licenseNumber: transportItem.licenseNumber,
      pickupTime: transportItem.pickupTime,
      notes: transportItem.notes || ''
    });
    setEditingTransport(transportItem);
    setIsAddingTransport(true);
  };

  const getTransportTypeDisplay = (type: string) => {
    return type === 'school-coach' ? 'School Coach' : 'Taxi';
  };

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Transport for {term.name}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {transport.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Current Transport</h3>
            {transport.map((transportItem) => (
              <Card key={transportItem.id} className="border border-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {getTransportTypeDisplay(transportItem.type)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {transportItem.driverName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {transportItem.phoneNumber}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {transportItem.licenseNumber}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {transportItem.pickupTime}
                        </div>
                      </div>
                      {transportItem.notes && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {transportItem.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTransport(transportItem)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveTransport(transportItem.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isAddingTransport ? (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-foreground">
              {editingTransport ? 'Edit Transport' : 'Add New Transport'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transport-type">Type</Label>
                <Select 
                  value={newTransport.type} 
                  onValueChange={(value: 'school-coach' | 'taxi') => 
                    setNewTransport({ ...newTransport, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school-coach">School Coach</SelectItem>
                    <SelectItem value="taxi">Taxi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup-time">Pickup Time</Label>
                <Input
                  id="pickup-time"
                  type="time"
                  value={newTransport.pickupTime}
                  onChange={(e) => setNewTransport({ ...newTransport, pickupTime: e.target.value })}
                  placeholder="e.g., 14:30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driver-name">Driver Name</Label>
                <Input
                  id="driver-name"
                  value={newTransport.driverName}
                  onChange={(e) => setNewTransport({ ...newTransport, driverName: e.target.value })}
                  placeholder="e.g., John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  value={newTransport.phoneNumber}
                  onChange={(e) => setNewTransport({ ...newTransport, phoneNumber: e.target.value })}
                  placeholder="e.g., +44 7123 456789"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license-number">License Number</Label>
              <Input
                id="license-number"
                value={newTransport.licenseNumber}
                onChange={(e) => setNewTransport({ ...newTransport, licenseNumber: e.target.value })}
                placeholder="e.g., ABC123 or License #12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transport-notes">Notes (optional)</Label>
              <Textarea
                id="transport-notes"
                value={newTransport.notes}
                onChange={(e) => setNewTransport({ ...newTransport, notes: e.target.value })}
                placeholder="Additional details..."
                className="min-h-[60px]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddTransport} size="sm">
                {editingTransport ? 'Update Transport' : 'Add Transport'}
              </Button>
              <Button onClick={resetForm} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center pt-4 border-t">
            <Button 
              onClick={() => setIsAddingTransport(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Transport
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );

  if (children) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {dialogContent}
    </Dialog>
  );
}

export default TransportDialog;