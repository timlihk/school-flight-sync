import { useState, Suspense, lazy, useMemo, useCallback } from "react";
import { Calendar, Plane, Car, ChevronDown, ChevronUp, FileText, Download, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFamilyAuth } from "@/contexts/FamilyAuthContext";
import { TermCard } from "@/components/ui/term-card";
import { TermDetailsDialog } from "@/components/ui/term-details-dialog";
import { SchoolHeader } from "@/components/school-header";

// Lazy load heavy dialog components for better initial bundle size
const FlightDialog = lazy(() => import("@/components/ui/flight-dialog").then(module => ({ default: module.FlightDialog })));
const TransportDialog = lazy(() => import("@/components/ui/transport-dialog").then(module => ({ default: module.TransportDialog })));
const ToDoDialog = lazy(() => import("@/components/ui/todo-dialog").then(module => ({ default: module.ToDoDialog })));
const ExportDialog = lazy(() => import("@/components/ui/export-dialog").then(module => ({ default: module.ExportDialog })));
import { EventSections } from "@/components/ui/event-sections";
import { mockTerms, getAcademicYears } from "@/data/mock-terms";
import { useFlights } from "@/hooks/use-flights";
import { useTransport } from "@/hooks/use-transport";
import { useNotTravelling } from "@/hooks/use-not-travelling";
import { Term, NotTravellingStatus } from "@/types/school";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Index() {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showFlightDialog, setShowFlightDialog] = useState(false);
  const [showTransportDialog, setShowTransportDialog] = useState(false);
  const [showTermDetailsDialog, setShowTermDetailsDialog] = useState(false);
  const [showTermCardPopup, setShowTermCardPopup] = useState(false);
  const [popupTerm, setPopupTerm] = useState<Term | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('both');
  
  const { logout } = useFamilyAuth();
  const { flights, loading, addFlight, editFlight, removeFlight } = useFlights();
  const { transport, isLoading: isTransportLoading, addTransport, editTransport, removeTransport, getTransportForTerm } = useTransport();
  const { notTravelling, loading: notTravellingLoading, setNotTravellingStatus } = useNotTravelling();

  // Memoize expensive term filtering and sorting operations
  const filteredTerms = useMemo(() => {
    return selectedAcademicYear === 'all' 
      ? mockTerms 
      : mockTerms.filter(term => term.academicYear === selectedAcademicYear);
  }, [selectedAcademicYear]);
    
  const { benendenTerms, wycombeTerms } = useMemo(() => {
    const benenden = filteredTerms
      .filter(term => term.school === 'benenden')
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const wycombe = filteredTerms
      .filter(term => term.school === 'wycombe')
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    return { benendenTerms: benenden, wycombeTerms: wycombe };
  }, [filteredTerms]);

  // Memoize school visibility flags
  const { shouldShowBenenden, shouldShowWycombe } = useMemo(() => ({
    shouldShowBenenden: selectedSchool === 'both' || selectedSchool === 'benenden',
    shouldShowWycombe: selectedSchool === 'both' || selectedSchool === 'wycombe'
  }), [selectedSchool]);

  // Memoize all term IDs for expand/collapse functionality
  const allTermIds = useMemo(() => 
    new Set(mockTerms.map(term => term.id)), 
    []
  );

  const handleToggleExpandAll = useCallback(() => {
    if (allExpanded) {
      setExpandedCards(new Set());
      setAllExpanded(false);
    } else {
      setExpandedCards(allTermIds);
      setAllExpanded(true);
    }
  }, [allExpanded, allTermIds]);

  // Memoize term lookup for better performance
  const termLookup = useMemo(() => 
    new Map(mockTerms.map(term => [term.id, term])), 
    []
  );

  const handleAddFlight = useCallback((termId: string) => {
    const term = termLookup.get(termId);
    if (term) {
      setSelectedTerm(term);
      setShowFlightDialog(true);
      // Close popup if it's open
      if (showTermCardPopup) {
        setShowTermCardPopup(false);
      }
    }
  }, [termLookup, showTermCardPopup]);

  const handleViewFlights = useCallback((termId: string) => {
    const term = termLookup.get(termId);
    if (term) {
      setSelectedTerm(term);
      setShowFlightDialog(true);
    }
  }, [termLookup]);

  const handleSetNotTravelling = useCallback((termId: string, type: 'flights' | 'transport') => {
    setNotTravellingStatus(termId, type);
  }, [setNotTravellingStatus]);

  const handleAddTransport = useCallback((termId: string) => {
    const term = termLookup.get(termId);
    if (term) {
      setSelectedTerm(term);
      setShowTransportDialog(true);
      // Close popup if it's open
      if (showTermCardPopup) {
        setShowTermCardPopup(false);
      }
    }
  }, [termLookup, showTermCardPopup]);

  const handleViewTransport = useCallback((termId: string) => {
    const term = termLookup.get(termId);
    if (term) {
      setSelectedTerm(term);
      setShowTransportDialog(true);
    }
  }, [termLookup]);

  // Memoize school URLs to prevent recreation on every render
  const schoolUrls = useMemo(() => ({
    benenden: 'https://www.benenden.school/news/term-dates/',
    wycombe: 'https://www.wycombeabbey.com/term-dates/'
  }), []);

  const handleShowScheduleForSchool = useCallback((school: 'benenden' | 'wycombe') => {
    window.open(schoolUrls[school], '_blank');
  }, [schoolUrls]);

  const handleShowTerm = useCallback((termId: string) => {
    const term = termLookup.get(termId);
    if (term) {
      setPopupTerm(term);
      setShowTermCardPopup(true);
    }
  }, [termLookup]);


  // Memoize DialogLoader component to prevent unnecessary re-renders
  const DialogLoader = useMemo(() => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
    </div>
  ), []);

  // Optimize expanded card change handler with useCallback
  const handleExpandedChange = useCallback((termId: string, expanded: boolean) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(termId);
      } else {
        newSet.delete(termId);
      }
      return newSet;
    });
  }, []);

  if (loading || isTransportLoading || notTravellingLoading) {
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
          <div className="flex items-center justify-between">
            <div className="flex-1" />
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
            <div className="flex-1 flex justify-end items-start">
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Family Account
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* Filter Controls */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-wrap justify-center gap-3">
          <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Academic Years</SelectItem>
              {getAcademicYears().map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="Select School" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Both Schools</SelectItem>
              <SelectItem value="benenden">Benenden School</SelectItem>
              <SelectItem value="wycombe">Wycombe Abbey School</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleToggleExpandAll}
            className="gap-2 w-32 h-9 font-normal"
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
          <Suspense fallback={<DialogLoader />}>
            <ToDoDialog 
              terms={filteredTerms}
              flights={flights}
              transport={transport}
              notTravelling={notTravelling}
              onAddFlight={handleAddFlight}
              onAddTransport={handleAddTransport}
              onShowTerm={handleShowTerm}
            />
          </Suspense>
          <Suspense fallback={<DialogLoader />}>
            <ExportDialog
              flights={flights}
              transport={transport}
              notTravelling={notTravelling}
              terms={mockTerms}
            />
          </Suspense>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className={`grid ${selectedSchool === 'both' ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-3xl mx-auto'} gap-8`}>
          {/* Benenden School */}
          {shouldShowBenenden && (
            <div className="space-y-6">
              <SchoolHeader 
                schoolName="Benenden School"
                termCount={benendenTerms.length}
                variant="benenden"
                academicYear={selectedAcademicYear === 'all' ? '2025-2026' : selectedAcademicYear}
                onAcademicYearClick={() => handleShowScheduleForSchool('benenden')}
              />
              
              <div className="space-y-4">
                {benendenTerms.map((term) => (
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
                  onExpandedChange={(expanded) => handleExpandedChange(term.id, expanded)}
                />
                ))}
              </div>
            </div>
          )}

          {/* Wycombe Abbey School */}
          {shouldShowWycombe && (
            <div className="space-y-6">
              <SchoolHeader 
                schoolName="Wycombe Abbey School"
                termCount={wycombeTerms.length}
                variant="wycombe"
                academicYear={selectedAcademicYear === 'all' ? '2025-2026' : selectedAcademicYear}
                onAcademicYearClick={() => handleShowScheduleForSchool('wycombe')}
              />
              
              <div className="space-y-4">
                {wycombeTerms.map((term) => (
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
                  onExpandedChange={(expanded) => handleExpandedChange(term.id, expanded)}
                />
                ))}
              </div>
            </div>
          )}
        </div>


        {selectedTerm && (
          <>
            <Suspense fallback={<DialogLoader />}>
              <FlightDialog
                term={selectedTerm}
                flights={flights.filter(f => f.termId === selectedTerm.id)}
                onAddFlight={addFlight}
                onEditFlight={editFlight}
                onRemoveFlight={removeFlight}
                open={showFlightDialog}
                onOpenChange={setShowFlightDialog}
              />
            </Suspense>
            
            <Suspense fallback={<DialogLoader />}>
              <TransportDialog
                term={selectedTerm}
                transport={getTransportForTerm(selectedTerm.id)}
                onAddTransport={addTransport}
                onEditTransport={editTransport}
                onRemoveTransport={removeTransport}
                open={showTransportDialog}
                onOpenChange={setShowTransportDialog}
              />
            </Suspense>

            <TermDetailsDialog
              term={selectedTerm}
              open={showTermDetailsDialog}
              onOpenChange={setShowTermDetailsDialog}
            />
          </>
        )}

        {/* Term Card Popup Modal */}
        {popupTerm && (
          <Dialog open={showTermCardPopup} onOpenChange={setShowTermCardPopup}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {popupTerm.name}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <TermCard
                  term={popupTerm}
                  flights={flights.filter(f => f.termId === popupTerm.id)}
                  transport={getTransportForTerm(popupTerm.id)}
                  onAddFlight={handleAddFlight}
                  onViewFlights={handleViewFlights}
                  onAddTransport={handleAddTransport}
                  onViewTransport={handleViewTransport}
                  onSetNotTravelling={handleSetNotTravelling}
                  notTravellingStatus={notTravelling.find(nt => nt.termId === popupTerm.id)}
                  isExpanded={true}
                  onExpandedChange={() => {}}
                  className="border-0 shadow-none bg-transparent"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}