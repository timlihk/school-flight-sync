import { useState } from "react";
import { Calendar, Plane, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TermCard } from "@/components/ui/term-card";
import { FlightDialog } from "@/components/ui/flight-dialog";
import { SchoolHeader } from "@/components/school-header";
import { mockTerms } from "@/data/mock-terms";
import { FlightDetails } from "@/types/school";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [flights, setFlights] = useState<FlightDetails[]>([]);
  const { toast } = useToast();

  const benendenTerms = mockTerms.filter(term => term.school === 'benenden');
  const wycombeTerms = mockTerms.filter(term => term.school === 'wycombe');

  const addFlight = (newFlight: Omit<FlightDetails, 'id'>) => {
    const flight: FlightDetails = {
      ...newFlight,
      id: `flight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setFlights(prev => [...prev, flight]);
    
    toast({
      title: "Flight Added",
      description: `${flight.type === 'outbound' ? 'Outbound' : 'Return'} flight ${flight.flightNumber} has been added successfully.`,
    });
  };

  const removeFlight = (flightId: string) => {
    setFlights(prev => prev.filter(f => f.id !== flightId));
    
    toast({
      title: "Flight Removed",
      description: "Flight has been removed from your schedule.",
      variant: "destructive",
    });
  };

  const getFlightsForTerm = (termId: string) => {
    return flights.filter(flight => flight.termId === termId);
  };

  const handleAddFlight = (termId: string) => {
    // This will be handled by the FlightDialog component
    console.log('Add flight for term:', termId);
  };

  const handleViewFlights = (termId: string) => {
    // This will be handled by the FlightDialog component  
    console.log('View flights for term:', termId);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-full bg-gradient-academic">
                <Plane className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                School Flight Sync
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your daughters' school term dates and flight arrangements for 
              <span className="font-semibold text-benenden"> Benenden School</span> and 
              <span className="font-semibold text-wycombe"> Wycombe Abbey School</span>
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Academic Year 2024-2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>2 Schools</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{mockTerms.length} Terms & Holidays</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Benenden School */}
          <div className="space-y-6">
            <SchoolHeader 
              schoolName="Benenden School"
              termCount={benendenTerms.length}
              variant="benenden"
            />
            
            <div className="space-y-4">
              {benendenTerms.map((term) => (
                <FlightDialog
                  key={term.id}
                  term={term}
                  flights={getFlightsForTerm(term.id)}
                  onAddFlight={addFlight}
                  onRemoveFlight={removeFlight}
                >
                  <div className="cursor-pointer">
                    <TermCard
                      term={term}
                      flights={getFlightsForTerm(term.id)}
                      onAddFlight={handleAddFlight}
                      onViewFlights={handleViewFlights}
                      className="hover:shadow-elegant transition-all duration-300"
                    />
                  </div>
                </FlightDialog>
              ))}
            </div>
          </div>

          {/* Wycombe Abbey School */}
          <div className="space-y-6">
            <SchoolHeader 
              schoolName="Wycombe Abbey School"
              termCount={wycombeTerms.length}
              variant="wycombe"
            />
            
            <div className="space-y-4">
              {wycombeTerms.map((term) => (
                <FlightDialog
                  key={term.id}
                  term={term}
                  flights={getFlightsForTerm(term.id)}
                  onAddFlight={addFlight}
                  onRemoveFlight={removeFlight}
                >
                  <div className="cursor-pointer">
                    <TermCard
                      term={term}
                      flights={getFlightsForTerm(term.id)}
                      onAddFlight={handleAddFlight}
                      onViewFlights={handleViewFlights}
                      className="hover:shadow-elegant transition-all duration-300"
                    />
                  </div>
                </FlightDialog>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-card rounded-full shadow-soft border border-border">
            <span className="text-sm text-muted-foreground">
              Total flights tracked:
            </span>
            <span className="font-semibold text-flight text-lg">
              {flights.length}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
