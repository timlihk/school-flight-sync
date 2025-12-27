import { useState, useEffect } from "react";
import { Car, Plus, Trash2, Edit, Phone, Clock, CreditCard, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Term, TransportDetails, ServiceProvider } from "@/types/school";
import { useServiceProviders } from "@/hooks/use-service-providers";

interface TransportDialogProps {
  term: Term;
  transport: TransportDetails[];
  previousTransport?: TransportDetails[];
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
  previousTransport = [],
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
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [showProviderSelection, setShowProviderSelection] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; transportId: string | null }>({
    open: false,
    transportId: null,
  });
  const [newTransport, setNewTransport] = useState({
    type: 'school-coach' as 'school-coach' | 'taxi',
    direction: 'outbound' as 'outbound' | 'return',
    driverName: '',
    phoneNumber: '',
    licenseNumber: '',
    pickupTime: '',
    notes: ''
  });

  const {
    getProvidersByType,
    addServiceProvider
  } = useServiceProviders();

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Auto-fill transport details when a provider is selected
  const handleProviderSelect = (providerId: string, option: ComboboxOption) => {
    const provider = option.data as ServiceProvider;
    if (provider) {
      setNewTransport({
        ...newTransport,
        type: provider.vehicleType,
        driverName: provider.name,
        phoneNumber: provider.phoneNumber,
        licenseNumber: provider.licenseNumber || '',
        notes: provider.notes || ''
      });
      setSelectedProvider(providerId);
      setShowProviderSelection(false);
    }
  };

  // Handle saving new provider when manually entered
  const handleSaveAsNewProvider = async () => {
    if (newTransport.driverName && newTransport.phoneNumber && newTransport.type) {
      try {
        const newProvider: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'> = {
          name: newTransport.driverName,
          phoneNumber: newTransport.phoneNumber,
          licenseNumber: newTransport.licenseNumber,
          vehicleType: newTransport.type,
          notes: newTransport.notes,
          isActive: true,
        };
        await addServiceProvider(newProvider);
      } catch (error) {
        console.error('Error saving service provider:', error);
      }
    }
  };

  const handleAddTransport = async () => {
    if (!newTransport.type) {
      return;
    }

    // Save as new provider if this is a new provider and not editing
    if (!editingTransport && !selectedProvider && newTransport.driverName && newTransport.phoneNumber) {
      await handleSaveAsNewProvider();
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

  const handleDuplicateLast = () => {
    const last = previousTransport
      .filter(t => t.termId !== term.id)
      .sort((a, b) => {
        const aDate = a.pickupTime ? new Date(a.pickupTime).getTime() : 0;
        const bDate = b.pickupTime ? new Date(b.pickupTime).getTime() : 0;
        return bDate - aDate;
      })[0];
    if (!last) return;
    setIsAddingTransport(true);
    setNewTransport({
      type: last.type,
      direction: last.direction || 'outbound',
      driverName: last.driverName || '',
      phoneNumber: last.phoneNumber || '',
      licenseNumber: last.licenseNumber || '',
      pickupTime: last.pickupTime || '',
      notes: last.notes || ''
    });
  };

  const resetForm = () => {
    setNewTransport({
      type: 'school-coach',
      direction: 'outbound',
      driverName: '',
      phoneNumber: '',
      licenseNumber: '',
      pickupTime: '',
      notes: ''
    });
    setSelectedProvider('');
    setShowProviderSelection(true);
    setIsAddingTransport(false);
    setEditingTransport(null);
  };

  const handleEditTransport = (transportItem: TransportDetails) => {
    setNewTransport({
      type: transportItem.type,
      direction: transportItem.direction, // Add direction field
      driverName: transportItem.driverName,
      phoneNumber: transportItem.phoneNumber,
      licenseNumber: transportItem.licenseNumber,
      pickupTime: transportItem.pickupTime,
      notes: transportItem.notes || ''
    });
    setEditingTransport(transportItem);
    setShowProviderSelection(false); // Skip provider selection when editing
    setIsAddingTransport(true);
  };

  const getTransportTypeDisplay = (type: string) => {
    return type === 'school-coach' ? 'School Coach' : 'Taxi';
  };

  // Get provider options for the combobox
  const getProviderOptions = (): ComboboxOption[] => {
    const filteredProviders = getProvidersByType(newTransport.type);
    return filteredProviders.map(provider => ({
      value: provider.id,
      label: `${provider.name} (${provider.phoneNumber})`,
      data: provider
    }));
  };

  // Reset provider selection when transport type changes
  useEffect(() => {
    if (selectedProvider && !editingTransport) {
      setSelectedProvider('');
      setShowProviderSelection(true);
    }
  }, [newTransport.type, editingTransport, selectedProvider]);

  const dialogTitle = (
    <span className="flex items-center gap-2">
      <Car className="h-5 w-5" />
      Transport for {term.name}
    </span>
  );

  const dialogContent = (
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
                          {transportItem.direction === 'outbound' ? '✈️ From School' : '🏠 To School'} - {getTransportTypeDisplay(transportItem.type)}
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
                        onClick={() => setConfirmDelete({ open: true, transportId: transportItem.id })}
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
                <Label htmlFor="direction">Direction</Label>
                <Select
                  value={newTransport.direction}
                  onValueChange={(value: 'outbound' | 'return') =>
                    setNewTransport({ ...newTransport, direction: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">From School (Outbound)</SelectItem>
                    <SelectItem value="return">To School (Return)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

            {/* Service Provider Selection */}
            {showProviderSelection && !editingTransport && getProviderOptions().length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <Label>Select Existing Service Provider</Label>
                <Combobox
                  options={getProviderOptions()}
                  value={selectedProvider}
                  onSelect={handleProviderSelect}
                  placeholder="Search for a service provider..."
                  searchPlaceholder="Search providers..."
                  emptyMessage="No matching providers found."
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProviderSelection(false)}
                  >
                    Enter new provider instead
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Entry or New Provider Notice */}
            {(!showProviderSelection || getProviderOptions().length === 0) && !editingTransport && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {getProviderOptions().length === 0 
                      ? 'No existing providers found. Enter details below to add a new one.'
                      : 'Adding new service provider'
                    }
                  </span>
                </div>
                {getProviderOptions().length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProviderSelection(true)}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    ← Back to provider selection
                  </Button>
                )}
              </div>
            )}

            {/* Driver details - only show for taxi transport */}
            {newTransport.type === 'taxi' && (
              <>
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
              </>
            )}

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
          <div className="flex justify-center pt-4 border-t gap-3">
            <Button 
              onClick={() => setIsAddingTransport(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Transport
            </Button>
            <Button
              onClick={handleDuplicateLast}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              Reuse last
            </Button>
          </div>
        )}
    </div>
  );

  if (children) {
    return (
      <div onClick={() => setIsOpen(true)}>
        {children}
        <ResponsiveDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          title={dialogTitle}
          className="max-w-2xl"
        >
          {dialogContent}
        </ResponsiveDialog>
      </div>
    );
  }

  const handleConfirmDelete = () => {
    if (confirmDelete.transportId) {
      onRemoveTransport(confirmDelete.transportId);
    }
  };

  return (
    <>
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={dialogTitle}
        className="max-w-2xl"
      >
        {dialogContent}
      </ResponsiveDialog>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, transportId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Transport"
        description="Are you sure you want to delete this transport arrangement? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}

export default TransportDialog;
