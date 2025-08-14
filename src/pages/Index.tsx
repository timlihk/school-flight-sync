import { useState } from "react";
import { Calendar, Plane, Car, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TermCard } from "@/components/ui/term-card";
import { FlightDialog } from "@/components/ui/flight-dialog";
import { TransportDialog } from "@/components/ui/transport-dialog";
import { ToDoDialog } from "@/components/ui/todo-dialog";
import { TermDetailsDialog } from "@/components/ui/term-details-dialog";
import { SchoolHeader } from "@/components/school-header";
import { EventSections } from "@/components/ui/event-sections";
import { mockTerms, getAcademicYears } from "@/data/mock-terms";
import { useFlights } from "@/hooks/use-flights";
import { useTransport } from "@/hooks/use-transport";
import { Term, NotTravellingStatus } from "@/types/school";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Index() {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showFlightDialog, setShowFlightDialog] = useState(false);
  const [showTransportDialog, setShowTransportDialog] = useState(false);
  const [showTermDetailsDialog, setShowTermDetailsDialog] = useState(false);
  const [notTravelling, setNotTravelling] = useState<NotTravellingStatus[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showFlightsOnly, setShowFlightsOnly] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
  
  const { flights, loading, addFlight, editFlight, removeFlight } = useFlights();
  const { transport, isLoading: isTransportLoading, addTransport, editTransport, removeTransport, getTransportForTerm } = useTransport();

  // Filter by academic year first, then separate by school and sort chronologically
  const filteredTerms = selectedAcademicYear === 'all' 
    ? mockTerms 
    : mockTerms.filter(term => term.academicYear === selectedAcademicYear);
    
  const benendenTerms = filteredTerms
    .filter(term => term.school === 'benenden')
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const wycombeTerms = filteredTerms
    .filter(term => term.school === 'wycombe')
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  console.log('Current showFlightsOnly state:', showFlightsOnly);
  console.log('Total Benenden terms:', benendenTerms.length);
  console.log('Total Wycombe terms:', wycombeTerms.length);

  // Filter terms that need flights to be booked if showFlightsOnly is enabled
  const filteredBenendenTerms = showFlightsOnly 
    ? benendenTerms.filter(term => {
        const termFlights = flights.filter(f => f.termId === term.id);
        const termNotTravelling = notTravelling.find(nt => nt.termId === term.id);
        
        console.log(`Filtering ${term.name} (${term.id}):`, {
          termFlights: termFlights.length,
          isNotTravelling: termNotTravelling?.noFlights,
          shouldShow: termFlights.length === 0 && !termNotTravelling?.noFlights
        });
        
        // Show ONLY if has no flight info AND hasn't been marked as not travelling
        return termFlights.length === 0 && !termNotTravelling?.noFlights;
      })
    : benendenTerms;
  const filteredWycombeTerms = showFlightsOnly 
    ? wycombeTerms.filter(term => {
        const termFlights = flights.filter(f => f.termId === term.id);
        const termNotTravelling = notTravelling.find(nt => nt.termId === term.id);
        
        console.log(`Filtering ${term.name} (${term.id}):`, {
          termFlights: termFlights.length,
          isNotTravelling: termNotTravelling?.noFlights,
          shouldShow: termFlights.length === 0 && !termNotTravelling?.noFlights
        });
        
        // Show ONLY if has no flight info AND hasn't been marked as not travelling
        return termFlights.length === 0 && !termNotTravelling?.noFlights;
      })
    : wycombeTerms;

  console.log('After filtering - Benenden terms:', filteredBenendenTerms.length);
  console.log('After filtering - Wycombe terms:', filteredWycombeTerms.length);

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

      {/* Academic Year Header with Detailed Schedule */}
      <div className="container mx-auto px-6 py-4">
        <div className="text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg cursor-pointer hover:bg-card transition-colors"
            onClick={() => {
              console.log('Academic year clicked!');
              console.log('Selected academic year:', selectedAcademicYear);
              console.log('Filtered terms:', filteredTerms.length);
              
              // Create a dummy term with the selected academic year for the dialog
              const yearTerms = filteredTerms.filter(t => selectedAcademicYear === 'all' || t.academicYear === selectedAcademicYear);
              console.log('Year terms found:', yearTerms.length);
              
              if (yearTerms.length > 0) {
                console.log('Setting selected term:', yearTerms[0]);
                setSelectedTerm(yearTerms[0]); // Use the first term as representative
                setShowTermDetailsDialog(true);
                console.log('Opening dialog');
              } else {
                console.log('No terms found for this academic year');
              }
            }}
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {selectedAcademicYear === 'all' ? 'All Academic Years' : `Academic Year ${selectedAcademicYear}`}
            </span>
            <span className="text-xs text-muted-foreground">- Click for detailed schedule</span>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-wrap justify-center gap-3">
          <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Academic Years</SelectItem>
              {getAcademicYears().map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            terms={filteredTerms}
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

            <TermDetailsDialog
              term={selectedTerm}
              open={showTermDetailsDialog}
              onOpenChange={setShowTermDetailsDialog}
            />
          </>
        )}
      </main>
    </div>
  );
}