import { useState } from "react";
import { Calendar, Plane, Car, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TermCard } from "@/components/ui/term-card";
import { FlightDialog } from "@/components/ui/flight-dialog";
import { TransportDialog } from "@/components/ui/transport-dialog";
import { ToDoDialog } from "@/components/ui/todo-dialog";
import { SchoolHeader } from "@/components/school-header";
import { EventSections } from "@/components/ui/event-sections";
import { mockTerms } from "@/data/mock-terms";
import { useFlights } from "@/hooks/use-flights";
import { useTransport } from "@/hooks/use-transport";
import { Term, NotTravellingStatus } from "@/types/school";

export default function Index() {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showFlightDialog, setShowFlightDialog] = useState(false);
  const [showTransportDialog, setShowTransportDialog] = useState(false);
  const [notTravelling, setNotTravelling] = useState<NotTravellingStatus[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showFlightsOnly, setShowFlightsOnly] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);
  
  const { flights, loading, addFlight, editFlight, removeFlight } = useFlights();
  const { transport, isLoading: isTransportLoading, addTransport, editTransport, removeTransport, getTransportForTerm } = useTransport();

  // Separate terms by school and sort chronologically
  const benendenTerms = mockTerms
    .filter(term => term.school === 'benenden')
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const wycombeTerms = mockTerms
    .filter(term => term.school === 'wycombe')
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Filter terms that need flights to be booked if showFlightsOnly is enabled
  const filteredBenendenTerms = showFlightsOnly 
    ? benendenTerms.filter(term => {
        const termFlights = flights.filter(f => f.termId === term.id);
        const termNotTravelling = notTravelling.find(nt => nt.termId === term.id);
        const needsFlights = term.type === 'holiday' || term.type === 'half-term' || 
                            term.type === 'exeat' || term.type === 'short-leave' || 
                            term.type === 'long-leave' || term.type === 'term';
        
        // Show if needs flights, doesn't have "not travelling" marked, and has missing flights
        if (!needsFlights || termNotTravelling?.noFlights) return false;
        
        const needsBothFlights = term.type === 'half-term' || term.type === 'exeat' || 
                                term.type === 'short-leave' || term.type === 'long-leave';
        
        if (needsBothFlights) {
          const hasOutbound = termFlights.some(f => f.type === 'outbound');
          const hasReturn = termFlights.some(f => f.type === 'return');
          return !hasOutbound || !hasReturn;
        } else {
          return termFlights.length === 0;
        }
      })
    : benendenTerms;
  const filteredWycombeTerms = showFlightsOnly 
    ? wycombeTerms.filter(term => {
        const termFlights = flights.filter(f => f.termId === term.id);
        const termNotTravelling = notTravelling.find(nt => nt.termId === term.id);
        const needsFlights = term.type === 'holiday' || term.type === 'half-term' || 
                            term.type === 'exeat' || term.type === 'short-leave' || 
                            term.type === 'long-leave' || term.type === 'term';
        
        // Show if needs flights, doesn't have "not travelling" marked, and has missing flights
        if (!needsFlights || termNotTravelling?.noFlights) return false;
        
        const needsBothFlights = term.type === 'half-term' || term.type === 'exeat' || 
                                term.type === 'short-leave' || term.type === 'long-leave';
        
        if (needsBothFlights) {
          const hasOutbound = termFlights.some(f => f.type === 'outbound');
          const hasReturn = termFlights.some(f => f.type === 'return');
          return !hasOutbound || !hasReturn;
        } else {
          return termFlights.length === 0;
        }
      })
    : wycombeTerms;

  const handleToggleExpandAll = () => {
    if (allExpanded) {
      setExpandedCards(new Set());
      setAllExpanded(false);
    } else {
      const allTermIds = new Set(mockTerms.map(term => term.id));
      setExpandedCards(allTermIds);
      setAllExpanded(true);
    }
  };

  const handleAddFlight = (termId: string) => {
    const term = mockTerms.find(t => t.id === termId);
    if (term) {
      setSelectedTerm(term);
      setShowFlightDialog(true);
    }
  };

  const handleViewFlights = (termId: string) => {
    const term = mockTerms.find(t => t.id === termId);
    if (term) {
      setSelectedTerm(term);
      setShowFlightDialog(true);
    }
  };

  const handleSetNotTravelling = (termId: string, type: 'flights' | 'transport') => {
    setNotTravelling(prev => {
      const existing = prev.find(nt => nt.termId === termId);
      if (existing) {
        return prev.map(nt => 
          nt.termId === termId 
            ? { 
                ...nt, 
                ...(type === 'flights' ? { noFlights: true } : { noTransport: true })
              }
            : nt
        );
      } else {
        return [...prev, { 
          termId, 
          ...(type === 'flights' ? { noFlights: true } : { noTransport: true })
        }];
      }
    });
  };

  const handleAddTransport = (termId: string) => {
    const term = mockTerms.find(t => t.id === termId);
    if (term) {
      setSelectedTerm(term);
      setShowTransportDialog(true);
    }
  };

  const handleViewTransport = (termId: string) => {
    const term = mockTerms.find(t => t.id === termId);
    if (term) {
      setSelectedTerm(term);
      setShowTransportDialog(true);
    }
  };

  if (loading || isTransportLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading school data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-full bg-gradient-academic">
                <Plane className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                School Flight Sync
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Manage your daughters' school term dates and travel arrangements
            </p>
          </div>
        </div>
      </header>

      {/* Filter Controls */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleExpandAll}
            className="gap-2"
          >
            {allExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expand All
              </>
            )}
          </Button>
          <Button
            variant={showFlightsOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFlightsOnly(!showFlightsOnly)}
            className="gap-2"
          >
            <Plane className="h-4 w-4" />
            {showFlightsOnly ? "Show All Cards" : "Show Cards with Flights to Book"}
          </Button>
          <ToDoDialog 
            terms={mockTerms}
            flights={flights}
            transport={transport}
            notTravelling={notTravelling}
            onAddFlight={handleAddFlight}
            onAddTransport={handleAddTransport}
          />
        </div>
      </div>

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
              {filteredBenendenTerms.map((term) => (
                <TermCard
                  key={term.id}
                  term={term}
                  flights={flights.filter(f => f.termId === term.id)}
                  transport={getTransportForTerm(term.id)}
                  onAddFlight={handleAddFlight}
                  onViewFlights={handleViewFlights}
                  onAddTransport={handleAddTransport}
                  onViewTransport={handleViewTransport}
                  onSetNotTravelling={handleSetNotTravelling}
                  notTravellingStatus={notTravelling.find(nt => nt.termId === term.id)}
                  className="h-full"
                  isExpanded={expandedCards.has(term.id)}
                  onExpandedChange={(expanded) => {
                    setExpandedCards(prev => {
                      const newSet = new Set(prev);
                      if (expanded) {
                        newSet.add(term.id);
                      } else {
                        newSet.delete(term.id);
                      }
                      return newSet;
                    });
                  }}
                />
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
              {filteredWycombeTerms.map((term) => (
                <TermCard
                  key={term.id}
                  term={term}
                  flights={flights.filter(f => f.termId === term.id)}
                  transport={getTransportForTerm(term.id)}
                  onAddFlight={handleAddFlight}
                  onViewFlights={handleViewFlights}
                  onAddTransport={handleAddTransport}
                  onViewTransport={handleViewTransport}
                  onSetNotTravelling={handleSetNotTravelling}
                  notTravellingStatus={notTravelling.find(nt => nt.termId === term.id)}
                  className="h-full"
                  isExpanded={expandedCards.has(term.id)}
                  onExpandedChange={(expanded) => {
                    setExpandedCards(prev => {
                      const newSet = new Set(prev);
                      if (expanded) {
                        newSet.add(term.id);
                      } else {
                        newSet.delete(term.id);
                      }
                      return newSet;
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </div>


        {selectedTerm && (
          <>
            <FlightDialog
              term={selectedTerm}
              flights={flights.filter(f => f.termId === selectedTerm.id)}
              onAddFlight={addFlight}
              onEditFlight={editFlight}
              onRemoveFlight={removeFlight}
              open={showFlightDialog}
              onOpenChange={setShowFlightDialog}
            />
            
            <TransportDialog
              term={selectedTerm}
              transport={getTransportForTerm(selectedTerm.id)}
              onAddTransport={addTransport}
              onEditTransport={editTransport}
              onRemoveTransport={removeTransport}
              open={showTransportDialog}
              onOpenChange={setShowTransportDialog}
            />
          </>
        )}
      </main>
    </div>
  );
}