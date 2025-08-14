import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, Plane, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { FlightDetails, Term } from "@/types/school";

interface FlightDialogProps {
  term: Term;
  flights: FlightDetails[];
  onAddFlight: (flight: Omit<FlightDetails, 'id'>) => void;
  onRemoveFlight: (flightId: string) => void;
  children: React.ReactNode;
}

export function FlightDialog({ 
  term, 
  flights, 
  onAddFlight, 
  onRemoveFlight, 
  children 
}: FlightDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
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
    notes: ''
  });

  const handleAddFlight = () => {
    if (!newFlight.airline || !newFlight.flightNumber || !newFlight.departureAirport) {
      return;
    }

    onAddFlight({
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
      notes: newFlight.notes
    });

    // Reset form
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
      notes: ''
    });
    setIsAddingFlight(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plane className="h-5 w-5" />
            Flight Details - {term.name}
          </DialogTitle>
        </DialogHeader>

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
                          {flight.type === 'outbound' ? 'Outbound Flight' : 'Return Flight'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFlight(flight.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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

          {/* Add New Flight Form */}
          {isAddingFlight ? (
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
              <h3 className="text-lg font-semibold text-foreground">Add New Flight</h3>
              
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
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                  <Label htmlFor="flightNumber">Flight Number</Label>
                  <Input
                    id="flightNumber"
                    value={newFlight.flightNumber}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, flightNumber: e.target.value }))}
                    placeholder="e.g., BA123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureAirport">Departure Airport</Label>
                  <Input
                    id="departureAirport"
                    value={newFlight.departureAirport}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, departureAirport: e.target.value }))}
                    placeholder="e.g., LHR"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalAirport">Arrival Airport</Label>
                  <Input
                    id="arrivalAirport"
                    value={newFlight.arrivalAirport}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, arrivalAirport: e.target.value }))}
                    placeholder="e.g., CDG"
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

                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={newFlight.departureTime}
                    onChange={(e) => setNewFlight(prev => ({ ...prev, departureTime: e.target.value }))}
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
                  Add Flight
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingFlight(false)}
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
      </DialogContent>
    </Dialog>
  );
}
