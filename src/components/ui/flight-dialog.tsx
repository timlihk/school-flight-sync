import { useState } from "react";
import { format } from "date-fns";
import { 
  Plane, Plus, X, Edit2, Calendar, Clock, 
  ArrowRight, ArrowLeft, Check, MapPin, 
  Ticket, StickyNote, Copy, Trash2
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface FlightDialogProps {
  term: Term;
  flights: FlightDetails[];
  previousFlights?: FlightDetails[];
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
  previousFlights = [],
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

  const airlineMap: { [key: string]: string } = {
    'CX': 'Cathay Pacific', 'BA': 'British Airways', 'LH': 'Lufthansa',
    'AF': 'Air France', 'KL': 'KLM', 'QF': 'Qantas',
    'SQ': 'Singapore Airlines', 'EK': 'Emirates', 'QR': 'Qatar Airways',
    'TG': 'Thai Airways', 'UA': 'United Airlines', 'DL': 'Delta Air Lines',
    'AA': 'American Airlines', 'VS': 'Virgin Atlantic', 'EY': 'Etihad Airways',
    'TK': 'Turkish Airlines', 'JL': 'Japan Airlines', 'NH': 'ANA'
  };

  const getAirlineFromCode = (flightNumber: string): string => {
    const code = flightNumber.substring(0, 2).toUpperCase();
    return airlineMap[code] || '';
  };

  const handleFlightNumberChange = (flightNumber: string) => {
    const airline = getAirlineFromCode(flightNumber);
    setNewFlight(prev => ({ 
      ...prev, 
      flightNumber: flightNumber.toUpperCase(),
      airline: airline || prev.airline
    }));
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

  const handleDuplicateLast = () => {
    const last = previousFlights
      .filter(f => f.termId !== term.id)
      .sort((a, b) => b.departure.date.getTime() - a.departure.date.getTime())[0];
    if (!last) {
      toast({ title: "No previous flights", description: "Add a flight first to reuse it.", variant: "destructive" });
      return;
    }
    setIsAddingFlight(true);
    setNewFlight({
      type: last.type,
      airline: last.airline,
      flightNumber: last.flightNumber,
      departureAirport: last.departure.airport,
      departureDate: format(term.startDate, 'yyyy-MM-dd'),
      departureTime: last.departure.time,
      arrivalAirport: last.arrival.airport,
      arrivalDate: format(term.startDate, 'yyyy-MM-dd'),
      arrivalTime: last.arrival.time,
      confirmationCode: last.confirmationCode || '',
      notes: last.notes || ''
    });
    toast({ title: "Flight details copied", description: "Review and update times as needed." });
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

  const getDirectionIcon = (type: string) => {
    return type === 'outbound' ? 
      <ArrowRight className="h-4 w-4" /> : 
      <ArrowLeft className="h-4 w-4" />;
  };

  const formatAirportDisplay = (airport: string) => {
    // Extract terminal if present
    const match = airport.match(/^([A-Z]{3})\s*(T\d+)?$/i);
    if (match) {
      const [, code, terminal] = match;
      return { code: code.toUpperCase(), terminal: terminal?.toUpperCase() };
    }
    return { code: airport, terminal: null };
  };

  const dialogTitle = (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
        <Plane className="h-5 w-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Flight Details</h2>
        <p className="text-sm text-muted-foreground">{term.name}</p>
      </div>
    </div>
  );

  const currentFlightsList = (
    <div className="space-y-3">
      {flights.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Flights</h3>
          <div className="space-y-3">
            {flights.map((flight) => {
              const dep = formatAirportDisplay(flight.departure.airport);
              const arr = formatAirportDisplay(flight.arrival.airport);
              
              return (
                <Card key={flight.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    {/* Flight Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50/50 to-blue-50/50 dark:from-sky-950/20 dark:to-blue-950/20 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          flight.type === 'outbound'
                            ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                            : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                        )}>
                          {getDirectionIcon(flight.type)}
                          {flight.type === 'outbound' ? 'From School' : 'To School'}
                        </span>
                        <span className="font-semibold text-sm">{flight.airline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {onEditFlight && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFlight(flight)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete({ open: true, flightId: flight.id })}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Flight Route */}
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Departure */}
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-foreground">{dep.code}</div>
                          {dep.terminal && (
                            <div className="text-xs text-muted-foreground">{dep.terminal}</div>
                          )}
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {flight.departure.time}
                          </div>
                        </div>
                        
                        {/* Flight Path */}
                        <div className="flex flex-col items-center gap-1">
                          <Plane className="h-5 w-5 text-sky-500 rotate-90" />
                          <div className="text-xs font-medium text-sky-600">{flight.flightNumber}</div>
                        </div>
                        
                        {/* Arrival */}
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-foreground">{arr.code}</div>
                          {arr.terminal && (
                            <div className="text-xs text-muted-foreground">{arr.terminal}</div>
                          )}
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {flight.arrival.time}
                          </div>
                        </div>
                      </div>
                      
                      {/* Date & Confirmation */}
                      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(flight.departure.date, 'MMM dd, yyyy')}
                        </span>
                        {flight.confirmationCode && (
                          <span className="flex items-center gap-1">
                            <Ticket className="h-3 w-3" />
                            {flight.confirmationCode}
                          </span>
                        )}
                      </div>
                      
                      {flight.notes && (
                        <div className="mt-3 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground flex items-start gap-1.5">
                          <StickyNote className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {flight.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const flightForm = (
    <div className="space-y-5">
      {/* Flight Type & Number */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Direction</Label>
          <Select 
            value={newFlight.type} 
            onValueChange={(value: 'outbound' | 'return') => 
              setNewFlight(prev => ({ ...prev, type: value }))
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
          <Label className="text-sm font-medium">Flight Number</Label>
          <Input
            value={newFlight.flightNumber}
            onChange={(e) => handleFlightNumberChange(e.target.value)}
            placeholder="e.g., CX251"
            className="h-11 font-mono uppercase"
          />
        </div>
      </div>

      {/* Airline */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Airline</Label>
        <Input
          value={newFlight.airline}
          onChange={(e) => setNewFlight(prev => ({ ...prev, airline: e.target.value }))}
          placeholder="e.g., Cathay Pacific"
          className="h-11"
        />
      </div>

      {/* Route Section */}
      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Route Details
        </h4>
        
        {/* Departure */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Departure</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Airport</Label>
              <Input
                value={newFlight.departureAirport}
                onChange={(e) => setNewFlight(prev => ({ ...prev, departureAirport: e.target.value.toUpperCase() }))}
                placeholder="LHR T3"
                className="h-10 font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Time</Label>
              <Input
                type="time"
                value={newFlight.departureTime}
                onChange={(e) => setNewFlight(prev => ({ ...prev, departureTime: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>
        </div>

        {/* Arrival */}
        <div className="space-y-3 pt-2 border-t border-border/30">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Arrival</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Airport</Label>
              <Input
                value={newFlight.arrivalAirport}
                onChange={(e) => setNewFlight(prev => ({ ...prev, arrivalAirport: e.target.value.toUpperCase() }))}
                placeholder="HKG T1"
                className="h-10 font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Time</Label>
              <Input
                type="time"
                value={newFlight.arrivalTime}
                onChange={(e) => setNewFlight(prev => ({ ...prev, arrivalTime: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
          <div className="space-y-2">
            <Label className="text-xs">Departure Date</Label>
            <Input
              type="date"
              value={newFlight.departureDate}
              onChange={(e) => setNewFlight(prev => ({ ...prev, departureDate: e.target.value }))}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Arrival Date</Label>
            <Input
              type="date"
              value={newFlight.arrivalDate}
              onChange={(e) => setNewFlight(prev => ({ ...prev, arrivalDate: e.target.value }))}
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Confirmation Code */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Ticket className="h-4 w-4 text-muted-foreground" />
          Confirmation Code (Optional)
        </Label>
        <Input
          value={newFlight.confirmationCode}
          onChange={(e) => setNewFlight(prev => ({ ...prev, confirmationCode: e.target.value.toUpperCase() }))}
          placeholder="ABC123"
          className="h-11 font-mono uppercase"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          Notes (Optional)
        </Label>
        <Textarea
          value={newFlight.notes}
          onChange={(e) => setNewFlight(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Seat preferences, meal requests, etc."
          className="min-h-[80px] resize-none"
        />
      </div>
    </div>
  );

  const dialogContent = (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-6 pb-20">
          {currentFlightsList}
          
          {isAddingFlight ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  {editingFlight ? <Edit2 className="h-4 w-4 text-sky-600" /> : <Plus className="h-4 w-4 text-sky-600" />}
                </div>
                <h3 className="font-semibold">
                  {editingFlight ? 'Edit Flight' : 'Add New Flight'}
                </h3>
              </div>
              {flightForm}
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={() => setIsAddingFlight(true)}
                className="w-full h-12 gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
              >
                <Plus className="h-5 w-5" />
                Add New Flight
              </Button>
              {previousFlights.length > 0 && (
                <Button
                  onClick={handleDuplicateLast}
                  variant="outline"
                  className="w-full h-12 gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Reuse Last Flight
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Fixed Footer with Actions */}
      {isAddingFlight && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/50 md:relative md:bottom-auto md:left-auto md:right-auto md:mt-6 md:-mx-6 md:-mb-6 md:px-6 md:py-4">
          <div className="flex gap-3 max-w-2xl mx-auto md:max-w-none">
            <Button 
              onClick={handleAddFlight}
              className="flex-1 h-12 gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
            >
              <Check className="h-4 w-4" />
              {editingFlight ? 'Update Flight' : 'Add Flight'}
            </Button>
            <Button 
              onClick={resetForm} 
              variant="outline" 
              className="h-12 px-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const handleConfirmDelete = () => {
    if (confirmDelete.flightId) {
      onRemoveFlight(confirmDelete.flightId);
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
