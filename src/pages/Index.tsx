import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense, lazy } from "react";
import { Plane, ChevronDown, ChevronUp, LogOut, Calendar, Home, CalendarDays, Share2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useFamilyAuth } from "@/contexts/FamilyAuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TermCard } from "@/components/ui/term-card";
import { TermDetailsDialog } from "@/components/ui/term-details-dialog";
import { SchoolHeader } from "@/components/school-header";
import { CompactCalendar } from "@/components/CompactCalendar";

const FlightDialog = lazy(() => import("@/components/ui/flight-dialog"));
const TransportDialog = lazy(() => import("@/components/ui/transport-dialog"));
const ExportDialog = lazy(() => import("@/components/ui/export-dialog"));
import ToDoDialog from "@/components/ui/todo-dialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { mockTerms } from "@/data/mock-terms";
import { useFlights } from "@/hooks/use-flights";
import { useTransport } from "@/hooks/use-transport";
import { useNotTravelling } from "@/hooks/use-not-travelling";
import { Term, TransportDetails } from "@/types/school";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isAfter, isToday, formatDistanceToNow } from "date-fns";
import { CalendarEvent } from "@/hooks/use-calendar-events";
import { useToast } from "@/hooks/use-toast";

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
  const [highlightedTerms, setHighlightedTerms] = useState<Set<string>>(new Set());
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareScope, setShareScope] = useState<'both' | 'benenden' | 'wycombe'>('both');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [heroScope, setHeroScope] = useState<'both' | 'benenden' | 'wycombe'>('both');
  const calendarSectionRef = useRef<HTMLDivElement | null>(null);
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { logout } = useFamilyAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { flights, loading, addFlight, editFlight, removeFlight, updateFlightStatus, isUpdatingFlightStatus } = useFlights();
  const { transport, isLoading: isTransportLoading, addTransport, editTransport, removeTransport, getTransportForTerm } = useTransport();
  const { notTravelling, loading: notTravellingLoading, setNotTravellingStatus, clearNotTravellingStatus } = useNotTravelling();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setHeroScope(selectedSchool as 'both' | 'benenden' | 'wycombe');
  }, [selectedSchool]);

  // Memoize expensive term filtering and sorting operations
  const filteredTerms = useMemo(() => {
    const now = new Date();
    const yearFiltered = selectedAcademicYear === 'all'
      ? mockTerms
      : mockTerms.filter(term => term.academicYear === selectedAcademicYear);

    // Filter out terms that have already ended (end date is before today)
    const dateFiltered = yearFiltered.filter(term =>
      isAfter(term.endDate, now) || isToday(term.endDate)
    );

    return dateFiltered;
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
    new Set(filteredTerms.map(term => term.id)),
    [filteredTerms]
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

  const resolveTransportDate = useCallback((item: TransportDetails, term?: Term): Date | null => {
    if (!term) return null;
    if (item.pickupTime) {
      const directDate = new Date(item.pickupTime);
      if (!Number.isNaN(directDate.getTime())) {
        return directDate;
      }
    }
    const base = new Date(item.direction === 'return' ? term.endDate : term.startDate);
    return Number.isNaN(base.getTime()) ? null : base;
  }, []);

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

  const handleSetNotTravelling = useCallback((termId: string) => {
    setNotTravellingStatus(termId);
  }, [setNotTravellingStatus]);

  const handleClearNotTravelling = useCallback((termId: string) => {
    clearNotTravellingStatus(termId);
  }, [clearNotTravellingStatus]);

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

  const extractTermIdFromEvent = useCallback((event: CalendarEvent) => {
    if (event.type === 'term') {
      return (event.details as Term)?.id;
    }
    if (event.type === 'not-travelling') {
      return (event.details?.term as Term)?.id ?? event.details?.termId;
    }

    return event.details?.termId ?? event.details?.term?.id;
  }, []);

  const scrollToTerm = useCallback((termId: string) => {
    const node = termRefs.current[termId];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleHighlightTerms = useCallback((termIds: string[]) => {
    if (!termIds.length) return;

    setHighlightedTerms(new Set(termIds));
    setExpandedCards(prev => {
      const next = new Set(prev);
      termIds.forEach(id => next.add(id));
      return next;
    });

    // Scroll after DOM updates
    const [firstTerm] = termIds;
    setTimeout(() => scrollToTerm(firstTerm), 75);

    // Clear highlight after 3 seconds
    setTimeout(() => setHighlightedTerms(new Set()), 3000);
  }, [scrollToTerm]);

  const handleCalendarEventClick = useCallback((event: CalendarEvent) => {
    const termId = extractTermIdFromEvent(event);
    if (!termId) return;

    const term = termLookup.get(termId);
    if (!term) return;

    setSelectedTerm(term);
    handleHighlightTerms([termId]);

    if (showTermCardPopup) {
      setShowTermCardPopup(false);
    }

    switch (event.type) {
      case 'flight':
        setShowFlightDialog(true);
        break;
      case 'transport':
        setShowTransportDialog(true);
        break;
      default:
        setShowTermDetailsDialog(true);
        break;
    }
  }, [extractTermIdFromEvent, termLookup, handleHighlightTerms, showTermCardPopup]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToCalendar = useCallback(() => {
    calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const computeNextTravel = useCallback((scope: 'both' | 'benenden' | 'wycombe') => {
    const now = new Date();
    const matches = (school: 'benenden' | 'wycombe') => scope === 'both' || scope === school;
    const entries: {
      date: Date;
      title: string;
      detail: string;
      status: 'booked' | 'unplanned' | 'staying';
      termId?: string;
      school?: 'benenden' | 'wycombe';
    }[] = [];

    flights.forEach(flight => {
      if (!isAfter(flight.departure.date, now)) return;
      const term = termLookup.get(flight.termId);
      if (term && !matches(term.school)) return;
      entries.push({
        date: flight.departure.date,
        title: `${flight.airline} ${flight.flightNumber}`,
        detail: `${flight.departure.airport} → ${flight.arrival.airport}`,
        status: 'booked',
        termId: term?.id,
        school: term?.school
      });
    });

    transport.forEach(item => {
      const term = termLookup.get(item.termId);
      if (term && !matches(term.school)) return;
      const eventDate = resolveTransportDate(item, term);
      if (!eventDate || !isAfter(eventDate, now)) return;
      entries.push({
        date: eventDate,
        title: `${item.type === 'school-coach' ? 'School Coach' : 'Taxi'} ${item.driverName ? `· ${item.driverName}` : ''}`,
        detail: `${item.direction === 'return' ? 'To School' : 'From School'}`,
        status: 'booked',
        termId: term?.id,
        school: term?.school
      });
    });

    notTravelling.forEach(entry => {
      const term = termLookup.get(entry.termId);
      if (!term || !isAfter(term.startDate, now)) return;
      if (!matches(term.school)) return;
      entries.push({
        date: term.startDate,
        title: 'Staying at school',
        detail: `${term.name}`,
        status: 'staying',
        termId: term.id,
        school: term.school
      });
    });

    if (!entries.length) {
      const upcomingTerm = filteredTerms.find(term => isAfter(term.startDate, now) && matches(term.school));
      if (upcomingTerm) {
        entries.push({
          date: upcomingTerm.startDate,
          title: `${upcomingTerm.name}`,
          detail: 'No travel booked yet',
          status: 'unplanned',
          termId: upcomingTerm.id,
          school: upcomingTerm.school
        });
      }
    }

    return entries.sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null;
  }, [flights, transport, notTravelling, termLookup, filteredTerms, resolveTransportDate]);

  const nextTravel = useMemo(
    () => computeNextTravel(heroScope),
    [computeNextTravel, heroScope]
  );

  const buildShareText = useCallback((scope: 'both' | 'benenden' | 'wycombe') => {
    const entry = computeNextTravel(scope);
    if (!entry) return '';
    const schoolLabel = scope === 'both'
      ? 'Both schools'
      : scope === 'benenden'
        ? 'Benenden'
        : 'Wycombe Abbey';
    const lines = [
      `Next travel (${schoolLabel}): ${entry.title} on ${entry.date.toDateString()} (${formatDistanceToNow(entry.date, { addSuffix: true })})`,
    ];
    if (entry.detail) lines.push(entry.detail);
    lines.push(entry.status === 'booked' ? 'Booked' : entry.status === 'staying' ? 'Not travelling' : 'Needs booking');
    return lines.join('\n');
  }, [computeNextTravel]);

  const shareNextTravel = useCallback(
    async (scope: 'both' | 'benenden' | 'wycombe') => {
      try {
        const shareText = buildShareText(scope);
        if (!shareText) {
          toast({
            title: "No travel to share",
            description: "Add a flight or transport first.",
          });
          return;
        }

        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: 'UK Schedules',
            text: shareText
          });
        } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Itinerary copied",
            description: "Paste it anywhere to share with family."
          });
        } else {
          toast({
            title: "Sharing unavailable",
            description: "Copy the itinerary manually from the print view.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Share failed', error);
        toast({
          title: "Share failed",
          description: "Try copying the itinerary instead.",
          variant: "destructive"
        });
      }
    },
    [buildShareText, toast]
  );

  const shareViaChannel = useCallback((scope: 'both' | 'benenden' | 'wycombe', channel: 'sms' | 'whatsapp' | 'telegram' | 'copy') => {
    const text = buildShareText(scope);
    if (!text) {
      toast({
        title: "No travel to share",
        description: "Add a flight or transport first.",
      });
      return;
    }
    const encoded = encodeURIComponent(text);
    let url = '';
    switch (channel) {
      case 'sms':
        url = `sms:&body=${encoded}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encoded}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=&text=${encoded}`;
        break;
      case 'copy':
        break;
    }

    if (channel === 'copy') {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          toast({ title: "Copied", description: "Share text copied to clipboard." });
        });
      } else {
        toast({ title: "Copy unavailable", description: "Clipboard not supported here.", variant: "destructive" });
      }
      return;
    }

    try {
      const win = window.open(url, '_blank');
      if (!win) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Share channel failed', err);
      toast({ title: "Sharing failed", description: "Try copying the text instead.", variant: "destructive" });
    }
  }, [buildShareText, toast]);



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

  // Handle URL parameters for highlighted terms from calendar
  useEffect(() => {
    const highlightParam = searchParams.get('highlight');
    const openParam = searchParams.get('open');
    const termIdParam = searchParams.get('termId');

    if (highlightParam) {
      const termIds = highlightParam.split(',');
      handleHighlightTerms(termIds);
    }

    if (openParam && termIdParam) {
      const term = termLookup.get(termIdParam);
      if (term) {
        setSelectedTerm(term);
        handleHighlightTerms([termIdParam]);

        switch (openParam) {
          case 'flight':
            setShowFlightDialog(true);
            break;
          case 'transport':
            setShowTransportDialog(true);
            break;
          default:
            setShowTermDetailsDialog(true);
            break;
        }
      }
    }

    if (highlightParam || (openParam && termIdParam)) {
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate, termLookup, handleHighlightTerms]);

  // Memoize earliest term for empty state message
  const earliestTerm = useMemo(() => {
    const terms = selectedSchool === 'both' ? mockTerms : mockTerms.filter(t => t.school === selectedSchool);
    return terms.slice().sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0] || null;
  }, [selectedSchool]);

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
                  UK Schedules
                </h1>
              </div>
            </div>
            <div className="flex-1 flex justify-end items-start">
              <div className="flex items-center gap-2">
                <ThemeToggle />
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
      <div className="sticky top-[64px] md:top-[72px] z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-6 py-4 flex flex-wrap justify-center gap-3">
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
          {!isMobile && (
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
          )}
          <ToDoDialog 
            terms={filteredTerms}
            flights={flights}
            transport={transport}
            notTravelling={notTravelling}
            onAddFlight={handleAddFlight}
            onAddTransport={handleAddTransport}
            onShowTerm={handleShowTerm}
          />
          <Button
            variant="outline"
            onClick={() => {
              setShareScope(selectedSchool as 'both' | 'benenden' | 'wycombe');
              setShareDialogOpen(true);
            }}
            size="sm"
            className="gap-2"
          >
            Share itinerary
          </Button>
          <Suspense fallback={<div className="text-xs text-muted-foreground">Loading export…</div>}>
            <ExportDialog
              flights={flights}
              transport={transport}
              notTravelling={notTravelling}
              terms={mockTerms}
            />
          </Suspense>
        </div>
      </div>

      {nextTravel && (
        <div className="container mx-auto px-6 pt-4">
          <div className="rounded-xl border border-border/60 bg-card/70 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between sticky top-[68px] z-30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Next travel</div>
                <div className="flex rounded-full border border-border/60 p-1 bg-muted/40">
                  {(['both','benenden','wycombe'] as const).map(scope => (
                    <Button
                      key={scope}
                      size="sm"
                      variant={heroScope === scope ? 'default' : 'ghost'}
                      className="h-7 px-3 text-xs"
                      onClick={() => setHeroScope(scope)}
                    >
                      {scope === 'both' ? 'Both' : scope === 'benenden' ? 'Benenden' : 'Wycombe'}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="text-lg font-semibold text-foreground">{nextTravel.title}</div>
              <div className="text-sm text-muted-foreground">{nextTravel.detail}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(nextTravel.date, { addSuffix: true })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={nextTravel.status === 'booked' ? 'default' : nextTravel.status === 'staying' ? 'secondary' : 'outline'}>
                {nextTravel.status === 'booked' ? 'Booked' : nextTravel.status === 'staying' ? 'Not travelling' : 'Needs booking'}
              </Badge>
              {nextTravel.termId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHighlightTerms([nextTravel.termId!])}
                >
                  Go to term
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="container mx-auto px-6 py-4">
        <div ref={calendarSectionRef} />
        <CompactCalendar
          selectedSchool={selectedSchool as 'benenden' | 'wycombe' | 'both'}
          onEventClick={handleCalendarEventClick}
          onSelectTermIds={handleHighlightTerms}
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 pb-24 lg:pb-8">
        {isMobile && (
          <Button
            className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg h-12 px-4 gap-2"
            onClick={() => setAddSheetOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Add travel</span>
          </Button>
        )}
        {flights.length === 0 && transport.length === 0 && notTravelling.length === 0 && earliestTerm && (
          <div className="mb-6 rounded-xl border border-dashed border-muted-foreground/30 bg-card/60 p-4 md:p-6 flex flex-col gap-3 md:items-center md:text-center">
            <div className="text-sm md:text-base text-muted-foreground">
              No travel plans yet. Add your first flight or transport for {earliestTerm.name}.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleAddFlight(earliestTerm.id)} size="sm">
                Add flight
              </Button>
              <Button variant="outline" onClick={() => handleAddTransport(earliestTerm.id)} size="sm">
                Add transport
              </Button>
            </div>
          </div>
        )}

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
                  <div key={term.id} ref={(el) => { termRefs.current[term.id] = el; }}>
                    <TermCard
                      term={term}
                      flights={flights.filter(f => f.termId === term.id)}
                      transport={getTransportForTerm(term.id)}
                      onAddFlight={handleAddFlight}
                      onViewFlights={handleViewFlights}
                      onAddTransport={handleAddTransport}
                      onViewTransport={handleViewTransport}
                      onSetNotTravelling={handleSetNotTravelling}
                      onClearNotTravelling={handleClearNotTravelling}
                      notTravellingStatus={notTravelling.find(nt => nt.termId === term.id)}
                      className="h-full"
                      isExpanded={expandedCards.has(term.id)}
                      onExpandedChange={(expanded) => handleExpandedChange(term.id, expanded)}
                      onUpdateFlightStatus={updateFlightStatus}
                      isUpdatingFlightStatus={isUpdatingFlightStatus}
                      highlighted={highlightedTerms.has(term.id)}
                    />
                  </div>
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
                  <div key={term.id} ref={(el) => { termRefs.current[term.id] = el; }}>
                    <TermCard
                      term={term}
                      flights={flights.filter(f => f.termId === term.id)}
                      transport={getTransportForTerm(term.id)}
                      onAddFlight={handleAddFlight}
                      onViewFlights={handleViewFlights}
                      onAddTransport={handleAddTransport}
                      onViewTransport={handleViewTransport}
                      onSetNotTravelling={handleSetNotTravelling}
                      onClearNotTravelling={handleClearNotTravelling}
                      notTravellingStatus={notTravelling.find(nt => nt.termId === term.id)}
                      className="h-full"
                      isExpanded={expandedCards.has(term.id)}
                      onExpandedChange={(expanded) => handleExpandedChange(term.id, expanded)}
                      onUpdateFlightStatus={updateFlightStatus}
                      isUpdatingFlightStatus={isUpdatingFlightStatus}
                      highlighted={highlightedTerms.has(term.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {selectedTerm && (
          <>
            <ErrorBoundary fallback={
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg">
                  <p>Flight dialog failed to load</p>
                  <button onClick={() => setShowFlightDialog(false)}>Close</button>
                </div>
              </div>
            }>
              <Suspense fallback={<div className="p-6 text-center text-sm text-muted-foreground">Loading flight details…</div>}>
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
            </ErrorBoundary>
            
            <ErrorBoundary fallback={
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg">
                  <p>Transport dialog failed to load</p>
                  <button onClick={() => setShowTransportDialog(false)}>Close</button>
                </div>
              </div>
            }>
              <Suspense fallback={<div className="p-6 text-center text-sm text-muted-foreground">Loading transport…</div>}>
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
            </ErrorBoundary>

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
                  onUpdateFlightStatus={updateFlightStatus}
                  isUpdatingFlightStatus={isUpdatingFlightStatus}
                  highlighted={highlightedTerms.has(popupTerm.id)}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share itinerary</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Choose which school’s next travel to share. We’ll only share the single next item.
              </p>
              <div className="flex flex-wrap gap-2">
                {(['both', 'benenden', 'wycombe'] as const).map(scope => (
                  <Button
                    key={scope}
                    variant={shareScope === scope ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShareScope(scope)}
                  >
                    {scope === 'both' ? 'Both schools' : scope === 'benenden' ? 'Benenden' : 'Wycombe Abbey'}
                  </Button>
                ))}
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 text-sm whitespace-pre-line">
                {buildShareText(shareScope) || 'No travel found to share yet.'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => shareViaChannel(shareScope, 'sms')}>Messages</Button>
                <Button variant="outline" onClick={() => shareViaChannel(shareScope, 'whatsapp')}>WhatsApp</Button>
                <Button variant="outline" onClick={() => shareViaChannel(shareScope, 'telegram')}>Telegram</Button>
                <Button variant="outline" onClick={() => shareViaChannel(shareScope, 'copy')}>Copy</Button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShareDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    await shareNextTravel(shareScope);
                    setShareDialogOpen(false);
                  }}
                >
                  Share next travel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border/60 shadow-inner">
          <div className="grid grid-cols-3 divide-x divide-border">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 py-3"
              onClick={scrollToTop}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 py-3"
              onClick={scrollToCalendar}
            >
              <CalendarDays className="h-5 w-5" />
              <span className="text-xs">Calendar</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 py-3"
              onClick={() => {
                setShareScope(selectedSchool as 'both' | 'benenden' | 'wycombe');
                setShareDialogOpen(true);
              }}
            >
              <Share2 className="h-5 w-5" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </div>

        <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
          <SheetContent side="bottom" className="h-auto pb-6">
            <SheetHeader>
              <SheetTitle>Quick add</SheetTitle>
              <SheetDescription>Use the nearest upcoming term for fast actions.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              <Button
                className="w-full h-12"
                onClick={() => {
                  if (!earliestTerm) {
                    toast({ title: "No terms available", description: "Add a term before adding travel.", variant: "destructive" });
                    return;
                  }
                  handleAddFlight(earliestTerm.id);
                  setAddSheetOpen(false);
                }}
              >
                Add flight ({earliestTerm ? earliestTerm.name : 'no term'})
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => {
                  if (!earliestTerm) {
                    toast({ title: "No terms available", description: "Add a term before adding travel.", variant: "destructive" });
                    return;
                  }
                  handleAddTransport(earliestTerm.id);
                  setAddSheetOpen(false);
                }}
              >
                Add transport
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => {
                  if (!earliestTerm) {
                    toast({ title: "No terms available", description: "Add a term before adding travel.", variant: "destructive" });
                    return;
                  }
                  handleShowTerm(earliestTerm.id);
                  setAddSheetOpen(false);
                }}
              >
                View term details
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}
