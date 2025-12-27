import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, Plane, Plus, X, Edit2 } from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FlightDetails, Term } from "@/types/school";
import { useToast } from "@/hooks/use-toast";

interface FlightDialogProps {
  term: Term;
  flights: FlightDetails[];
  onAddFlight: (flight: Omit<FlightDetails, 'id'>) => void;
  onRemoveFlight: (flightId: string) => void;
  onEditFlight?: (flightId: string, flight: Omit<FlightDetails, 'id'>) => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FlightDialog({ 
  term, 
  flights, 
  onAddFlight, 
  onRemoveFlight, 
  onEditFlight,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: FlightDialogProps) {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightDetails | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; flightId: string | null }>({
    open: false,
    flightId: null,
  });

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;
  
  const [newFlight, setNewFlight] = useState({
    type: 'outbound' as 'outbound' | 'return',
    airline: '',
    flightNumber: '',
    departureAirport: '',
    departureDate: format(term.startDate, 'yyyy-MM-dd'),
    departureTime: '',
    arrivalAirport: '',
    arrivalDate: format(term.startDate, 'yyyy-MM-dd'),
    arrivalTime: '',
    confirmationCode: '',
    notes: ''
  });

  // Airline mapping based on IATA codes
  const getAirlineFromCode = (flightNumber: string): string => {
    const code = flightNumber.substring(0, 2).toUpperCase();
    const airlineMap: { [key: string]: string } = {
      'CX': 'Cathay Pacific',
      'BA': 'British Airways',
      'LH': 'Lufthansa',
      'AF': 'Air France',
      'KL': 'KLM',
      'QF': 'Qantas',
      'SQ': 'Singapore Airlines',
      'EK': 'Emirates',
      'QR': 'Qatar Airways',
      'TG': 'Thai Airways',
      'UA': 'United Airlines',
      'DL': 'Delta Air Lines',
      'AA': 'American Airlines',
      'VS': 'Virgin Atlantic',
      'EY': 'Etihad Airways',
      'TK': 'Turkish Airlines',
      'JL': 'Japan Airlines',
      'NH': 'ANA'
    };
    return airlineMap[code] || '';
  };

  const handleAddFlight = () => {
    if (!newFlight.flightNumber || !newFlight.departureDate || !newFlight.airline || 
        !newFlight.departureAirport || !newFlight.arrivalAirport || 
        !newFlight.departureTime || !newFlight.arrivalTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required flight details.",
        variant: "destructive",
      });
      return;
    }

    const flightData = {
      termId: term.id,
      type: newFlight.type,
      airline: newFlight.airline,
      flightNumber: newFlight.flightNumber,
      departure: {
        airport: newFlight.departureAirport,
        date: new Date(newFlight.departureDate),
        time: newFlight.departureTime
      },
      arrival: {
        airport: newFlight.arrivalAirport,
        date: new Date(newFlight.arrivalDate),
        time: newFlight.arrivalTime
      },
      confirmationCode: newFlight.confirmationCode,
      notes: newFlight.notes
    };

    if (editingFlight && onEditFlight) {
      onEditFlight(editingFlight.id, flightData);
      setEditingFlight(null);
    } else {
      onAddFlight(flightData);
    }

    resetForm();
  };

  const resetForm = () => {
    setNewFlight({
      type: 'outbound',
      airline: '',
      flightNumber: '',
      departureAirport: '',
      departureDate: format(term.startDate, 'yyyy-MM-dd'),
      departureTime: '',
      arrivalAirport: '',
      arrivalDate: format(term.startDate, 'yyyy-MM-dd'),
      arrivalTime: '',
      confirmationCode: '',
      notes: ''
    });
    setIsAddingFlight(false);
    setEditingFlight(null);
  };

  const handleEditFlight = (flight: FlightDetails) => {
    setEditingFlight(flight);
    setNewFlight({
      type: flight.type,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      departureAirport: flight.departure.airport,
      departureDate: format(flight.departure.date, 'yyyy-MM-dd'),
      departureTime: flight.departure.time,
      arrivalAirport: flight.arrival.airport,
      arrivalDate: format(flight.arrival.date, 'yyyy-MM-dd'),
      arrivalTime: flight.arrival.time,
      confirmationCode: flight.confirmationCode || '',
      notes: flight.notes || ''
    });
    setIsAddingFlight(true);
  };

  const handleFlightNumberChange = (flightNumber: string) => {
    const airline = getAirlineFromCode(flightNumber);
    setNewFlight(prev => ({ 
      ...prev, 
      flightNumber,
      airline: airline || prev.airline
    }));
  };


  const dialogTitle = (
    <span className="flex items-center gap-2">
      <Plane className="h-5 w-5" />
      Flight Details - {term.name}
    </span>
  );

  const dialogContent = (
    <div className="space-y-6">
        {/* Existing Flights */}
        {flights.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Current Flights</h3>
            <div className="grid gap-4">
              {flights.map((flight) => (
                <div 
                  key={flight.id} 
                  className="p-4 border border-border rounded-lg bg-card hover:shadow-soft transition-shadow"
                >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {flight.type === 'outbound' ? '✈️' : '🛬'}
                        </span>
                        <span className="font-semibold text-foreground">
                        {flight.type === 'outbound' ? 'From School Flight' : 'To School Flight'}
                        </span>
                      </div>
                    <div className="flex items-center gap-1">
                      {onEditFlight && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFlight(flight)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete({ open: true, flightId: flight.id })}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        {flight.airline} {flight.flightNumber}
                      </p>
                      <p className="text-muted-foreground">
                        {flight.departure.airport} → {flight.arrival.airport}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {format(flight.departure.date, 'MMM dd, yyyy')}
                      </p>
                      <p className="text-muted-foreground">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Depart: {flight.departure.time} | Arrive: {flight.arrival.time}
                      </p>
                    </div>
                  </div>
                  
                  {flight.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {flight.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Flight Form */}
        {isAddingFlight ? (
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
            <h3 className="text-lg font-semibold text-foreground">
              {editingFlight ? 'Edit Flight' : 'Add New Flight'}
            </h3>
            
            {/* Flight Form */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Flight Type</Label>
                  <Select 
                    value={newFlight.type} 
                    onValueChange={(value: 'outbound' | 'return') => 
                      setNewFlight(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">From School</SelectItem>
                      <SelectItem value="return">To School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flightNumber">Flight Number</Label>
                  <Input
                    id="flightNumber"
                    value={newFlight.flightNumber}
                    onChange={(e) => handleFlightNumberChange(e.target.value)}
                    placeholder="e.g., BA123, CX251"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="airline">Airline</Label>
                  <Input
                    id="airline"
                    value={newFlight.airline}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, airline: e.target.value }))}
                    placeholder="e.g., British Airways"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureDate">Departure Date</Label>
                  <Input
                    id="departureDate"
                    type="date"
                    value={newFlight.departureDate}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, departureDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureAirport">Departure Airport</Label>
                  <Input
                    id="departureAirport"
                    value={newFlight.departureAirport}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, departureAirport: e.target.value }))}
                    placeholder="e.g., LHR T5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={newFlight.departureTime}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, departureTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrivalAirport">Arrival Airport</Label>
                  <Input
                    id="arrivalAirport"
                    value={newFlight.arrivalAirport}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, arrivalAirport: e.target.value }))}
                    placeholder="e.g., HKG T1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">Arrival Time</Label>
                  <Input
                    id="arrivalTime"
                    type="time"
                    value={newFlight.arrivalTime}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, arrivalTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalDate">Arrival Date</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={newFlight.arrivalDate}
                  onChange={(e) => setNewFlight(prev => ({ ...prev, arrivalDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmationCode">Confirmation Code (Optional)</Label>
              <Input
                id="confirmationCode"
                value={newFlight.confirmationCode}
                onChange={(e) => setNewFlight(prev => ({ ...prev, confirmationCode: e.target.value }))}
                placeholder="e.g., ABC123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newFlight.notes}
                onChange={(e) => setNewFlight(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the flight..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddFlight} variant="flight">
                {editingFlight ? 'Update Flight' : 'Add Flight'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => setIsAddingFlight(true)}
            variant="flight"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Flight
          </Button>
        )}
    </div>
  );

  if (children) {
    // When used with a trigger, we need to handle the trigger separately
    return (
      <div onClick={() => setIsOpen(true)}>
        {children}
        <ResponsiveDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          title={dialogTitle}
          className="max-w-4xl"
        >
          {dialogContent}
        </ResponsiveDialog>
      </div>
    );
  }

  const handleConfirmDelete = () => {
    if (confirmDelete.flightId) {
      onRemoveFlight(confirmDelete.flightId);
    }
  };

  return (
    <>
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={dialogTitle}
        className="max-w-4xl"
      >
        {dialogContent}
      </ResponsiveDialog>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, flightId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Flight"
        description="Are you sure you want to delete this flight? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}

export default FlightDialog;
