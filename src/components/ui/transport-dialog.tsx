import { useState, useEffect } from "react";
import { Car, Plus, Trash2, Edit, Phone, Clock, CreditCard, User, Search, ArrowRight, ArrowLeft, Check, X, Copy } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    if (!newTransport.type) return;

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
      direction: transportItem.direction,
      driverName: transportItem.driverName,
      phoneNumber: transportItem.phoneNumber,
      licenseNumber: transportItem.licenseNumber,
      pickupTime: transportItem.pickupTime,
      notes: transportItem.notes || ''
    });
    setEditingTransport(transportItem);
    setShowProviderSelection(false);
    setIsAddingTransport(true);
  };

  const getTransportTypeDisplay = (type: string) => {
    return type === 'school-coach' ? 'School Coach' : 'Taxi';
  };

  const getProviderOptions = (): ComboboxOption[] => {
    const filteredProviders = getProvidersByType(newTransport.type);
    return filteredProviders.map(provider => ({
      value: provider.id,
      label: `${provider.name} (${provider.phoneNumber})`,
      data: provider
    }));
  };

  useEffect(() => {
    if (selectedProvider && !editingTransport) {
      setSelectedProvider('');
      setShowProviderSelection(true);
    }
  }, [newTransport.type, editingTransport, selectedProvider]);

  const getDirectionIcon = (direction: string) => {
    return direction === 'outbound' ? 
      <ArrowRight className="h-4 w-4" /> : 
      <ArrowLeft className="h-4 w-4" />;
  };

  const dialogTitle = (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
        <Car className="h-5 w-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Transport</h2>
        <p className="text-sm text-muted-foreground">{term.name}</p>
      </div>
    </div>
  );

  const currentTransportList = (
    <div className="space-y-3">
      {transport.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Arrangements</h3>
          <div className="space-y-3">
            {transport.map((transportItem) => (
              <Card key={transportItem.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-card to-card/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                          transportItem.type === 'school-coach' 
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        )}>
                          {getDirectionIcon(transportItem.direction)}
                          {transportItem.direction === 'outbound' ? 'From School' : 'To School'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getTransportTypeDisplay(transportItem.type)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{transportItem.driverName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{transportItem.phoneNumber}</span>
                        </div>
                        {transportItem.licenseNumber && (
                          <div className="flex items-center gap-2 text-foreground">
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate">{transportItem.licenseNumber}</span>
                          </div>
                        )}
                        {transportItem.pickupTime && (
                          <div className="flex items-center gap-2 text-foreground">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{transportItem.pickupTime}</span>
                          </div>
                        )}
                      </div>
                      
                      {transportItem.notes && (
                        <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                          {transportItem.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTransport(transportItem)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete({ open: true, transportId: transportItem.id })}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const transportForm = (
    <div className="space-y-5">
      {/* Direction & Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Direction</Label>
          <Select
            value={newTransport.direction}
            onValueChange={(value: 'outbound' | 'return') =>
              setNewTransport({ ...newTransport, direction: value })
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outbound">
                <span className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  From School
                </span>
              </SelectItem>
              <SelectItem value="return">
                <span className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  To School
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Vehicle Type</Label>
          <Select
            value={newTransport.type}
            onValueChange={(value: 'school-coach' | 'taxi') =>
              setNewTransport({ ...newTransport, type: value })
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="school-coach">School Coach</SelectItem>
              <SelectItem value="taxi">Taxi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pickup Time */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Pickup Time</Label>
        <Input
          type="time"
          value={newTransport.pickupTime}
          onChange={(e) => setNewTransport({ ...newTransport, pickupTime: e.target.value })}
          className="h-11"
        />
      </div>

      {/* Service Provider Selection */}
      {showProviderSelection && !editingTransport && getProviderOptions().length > 0 && (
        <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            Quick Select Provider
          </Label>
          <Combobox
            options={getProviderOptions()}
            value={selectedProvider}
            onSelect={handleProviderSelect}
            placeholder="Search existing providers..."
            searchPlaceholder="Type to search..."
            emptyMessage="No matching providers found."
            className="w-full"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowProviderSelection(false)}
            className="text-xs"
          >
            Or enter new provider details manually
          </Button>
        </div>
      )}

      {/* New Provider Notice */}
      {(!showProviderSelection || getProviderOptions().length === 0) && !editingTransport && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getProviderOptions().length === 0 
                ? 'No existing providers. Enter details below.'
                : 'Adding new service provider'}
            </span>
          </div>
          {getProviderOptions().length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowProviderSelection(true)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Back to provider selection
            </Button>
          )}
        </div>
      )}

      {/* Driver Details - only for taxi */}
      {newTransport.type === 'taxi' && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
          <h4 className="text-sm font-semibold text-muted-foreground">Driver Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Driver Name</Label>
              <Input
                value={newTransport.driverName}
                onChange={(e) => setNewTransport({ ...newTransport, driverName: e.target.value })}
                placeholder="John Smith"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Phone Number</Label>
              <Input
                value={newTransport.phoneNumber}
                onChange={(e) => setNewTransport({ ...newTransport, phoneNumber: e.target.value })}
                placeholder="+44 7123 456789"
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">License Number</Label>
            <Input
              value={newTransport.licenseNumber}
              onChange={(e) => setNewTransport({ ...newTransport, licenseNumber: e.target.value })}
              placeholder="ABC123"
              className="h-11"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Notes (Optional)</Label>
        <Textarea
          value={newTransport.notes}
          onChange={(e) => setNewTransport({ ...newTransport, notes: e.target.value })}
          placeholder="Any additional details..."
          className="min-h-[80px] resize-none"
        />
      </div>
    </div>
  );

  const dialogContent = (
    <div className="space-y-6">
      {currentTransportList}
      
      {isAddingTransport ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {editingTransport ? <Edit className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
            </div>
            <h3 className="font-semibold">
              {editingTransport ? 'Edit Transport' : 'Add New Transport'}
            </h3>
          </div>
          {transportForm}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button 
              onClick={handleAddTransport}
              className="flex-1 h-11 gap-2"
            >
              <Check className="h-4 w-4" />
              {editingTransport ? 'Update Transport' : 'Add Transport'}
            </Button>
            <Button 
              onClick={resetForm} 
              variant="outline" 
              className="h-11 px-6"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={() => setIsAddingTransport(true)}
            className="w-full h-11 gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Transport
          </Button>
          {previousTransport.length > 0 && (
            <Button
              onClick={handleDuplicateLast}
              variant="outline"
              className="w-full h-11 gap-2"
            >
              <Copy className="h-4 w-4" />
              Reuse Last Transport
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const handleConfirmDelete = () => {
    if (confirmDelete.transportId) {
      onRemoveTransport(confirmDelete.transportId);
    }
  };

  return (
    <>
      {children && (
        <div onClick={() => setIsOpen(true)}>
          {children}
        </div>
      )}
      
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={dialogTitle}
        className="max-w-lg"
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
