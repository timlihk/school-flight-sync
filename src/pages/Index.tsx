import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense, lazy } from "react";
import { Plane, LogOut, Calendar, Home, CalendarDays, Share2, Plus, Settings, RefreshCw } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isAfter, isToday, formatDistanceToNow, addDays, startOfDay, format } from "date-fns";
import { CalendarEvent, useCalendarEvents } from "@/hooks/use-calendar-events";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showFlightDialog, setShowFlightDialog] = useState(false);
  const [showTransportDialog, setShowTransportDialog] = useState(false);
  const [showTermDetailsDialog, setShowTermDetailsDialog] = useState(false);
  const [showTermCardPopup, setShowTermCardPopup] = useState(false);
  const [popupTerm, setPopupTerm] = useState<Term | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedSchool, setSelectedSchool] = useState<'both' | 'benenden' | 'wycombe'>('both');
  const [highlightedTerms, setHighlightedTerms] = useState<Set<string>>(new Set());
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareScope, setShareScope] = useState<'both' | 'benenden' | 'wycombe'>('both');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [heroScope, setHeroScope] = useState<'both' | 'benenden' | 'wycombe'>('both');
  const [activeTab, setActiveTab] = useState<'today' | 'trips' | 'calendar' | 'settings'>('today');
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { logout } = useFamilyAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { flights, loading, addFlight, editFlight, removeFlight, updateFlightStatus, isUpdatingFlightStatus, refetch: refetchFlights } = useFlights();
  const { transport, isLoading: isTransportLoading, addTransport, editTransport, removeTransport, getTransportForTerm, refetch: refetchTransport } = useTransport();
  const { notTravelling, loading: notTravellingLoading, setNotTravellingStatus, clearNotTravellingStatus, refetch: refetchNotTravelling } = useNotTravelling();
  const { toast } = useToast();
  const { events: calendarEvents } = useCalendarEvents(selectedSchool as 'both' | 'benenden' | 'wycombe');
  const isBusy = loading || isTransportLoading || notTravellingLoading || isRefreshing;

  const triggerHaptic = useCallback(() => {
    if (typeof navigator === 'undefined' || !(navigator as any).vibrate) return;
    try {
      (navigator as any).vibrate(10);
    } catch (err) {
      console.debug('Haptic vibrate failed', err);
    }
  }, []);

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


  // Filter to only upcoming terms for the selected school(s)
  const filteredTerms = useMemo(() => {
    const now = startOfDay(new Date());
    const bySchool = selectedSchool === 'both'
      ? mockTerms
      : mockTerms.filter(term => term.school === selectedSchool);

    return bySchool
      .filter(term => isAfter(term.endDate, now) || isToday(term.endDate))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [selectedSchool]);
    
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

    setActiveTab('trips');
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

    setActiveTab('trips');
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

  const thisWeekEvents = useMemo(() => {
    const today = startOfDay(new Date());
    const end = startOfDay(addDays(today, 7));
    const weekEvents = (calendarEvents || [])
      .filter(e => {
        const d = startOfDay(e.date);
        return (d >= today && d <= end);
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    if (weekEvents.length) return weekEvents;

    const next = (calendarEvents || [])
      .filter(e => startOfDay(e.date) >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    return next ? [next] : [];
  }, [calendarEvents]);

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

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    triggerHaptic();
    try {
      await Promise.all([
        refetchFlights(),
        refetchTransport(),
        refetchNotTravelling()
      ]);
      toast({ title: "Refreshed", description: "Latest schedule pulled in." });
    } catch (error) {
      console.error('Refresh failed', error);
      toast({ title: "Refresh failed", description: "Could not refresh right now.", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetchFlights, refetchTransport, refetchNotTravelling, toast, triggerHaptic]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    setIsPulling(window.scrollY <= 0);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !isPulling) return;
    const touch = e.touches[0];
    if (window.scrollY > 2) return;
    const deltaY = touch.clientY - (touchStartY.current ?? touch.clientY);
    if (deltaY > 0) {
      setPullDistance(Math.min(deltaY, 140));
    }
  }, [isMobile, isPulling]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    const touch = e.changedTouches[0];
    const deltaX = touchStartX.current !== null ? touch.clientX - touchStartX.current : 0;
    const deltaY = touchStartY.current !== null ? touch.clientY - touchStartY.current : 0;

    if (isPulling && pullDistance > 70) {
      handleRefresh();
    }

    const tabOrder: Array<typeof activeTab> = ['today', 'trips', 'calendar', 'settings'];
    if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 40) {
      const currentIndex = tabOrder.indexOf(activeTab);
      const nextIndex = deltaX < 0
        ? Math.min(tabOrder.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);
      if (tabOrder[nextIndex] !== activeTab) {
        triggerHaptic();
        setActiveTab(tabOrder[nextIndex]);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsPulling(false);
    setPullDistance(0);
  }, [activeTab, handleRefresh, isMobile, isPulling, pullDistance]);



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
    return filteredTerms.slice().sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0] || null;
  }, [filteredTerms]);

  const SchoolPills = () => (
    <div className="flex flex-wrap gap-2">
      {(['both', 'benenden', 'wycombe'] as const).map(scope => (
        <Button
          key={scope}
          size="sm"
          variant={selectedSchool === scope ? 'default' : 'outline'}
          className="rounded-full px-4"
          onClick={() => {
            triggerHaptic();
            setSelectedSchool(scope);
          }}
        >
          {scope === 'both' ? 'Both schools' : scope === 'benenden' ? 'Benenden' : 'Wycombe Abbey'}
        </Button>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <div className="space-y-5 px-4 py-5 md:px-6">
            <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground tracking-wide">
                    <span>Next travel</span>
                    <Badge variant="secondary" className="rounded-full">
                      {heroScope === 'both' ? 'Both' : heroScope === 'benenden' ? 'Benenden' : 'Wycombe Abbey'}
                    </Badge>
                  </div>
                  {nextTravel ? (
                    <>
                      <div className="text-xl font-semibold leading-tight">{nextTravel.title}</div>
                      <div className="text-sm text-muted-foreground">{nextTravel.detail}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(nextTravel.date, { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        <Badge variant={nextTravel.status === 'booked' ? 'default' : nextTravel.status === 'staying' ? 'secondary' : 'outline'}>
                          {nextTravel.status === 'booked' ? 'Booked' : nextTravel.status === 'staying' ? 'Not travelling' : 'Needs booking'}
                        </Badge>
                        {nextTravel.termId && (
                          <Button size="sm" variant="outline" onClick={() => handleHighlightTerms([nextTravel.termId!])}>
                            Go to term
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Add flights or transport to see your next trip here.</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex rounded-full border border-border/60 bg-muted/40 p-1">
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
                  <Button size="sm" variant="outline" onClick={() => { setShareScope(heroScope); setShareDialogOpen(true); }}>
                    <Share2 className="h-4 w-4 mr-1.5" /> Share
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Actions</p>
                  <h3 className="text-lg font-semibold">Plan fast</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  className="h-12"
                  disabled={isBusy}
                  onClick={() => {
                    if (isBusy) return;
                    triggerHaptic();
                    earliestTerm ? handleAddFlight(earliestTerm.id) : toast({ title: 'No terms', description: 'Add a term first.', variant: 'destructive' });
                  }}
                >
                  {isBusy && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
                  Add flight
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  disabled={isBusy}
                  onClick={() => {
                    if (isBusy) return;
                    triggerHaptic();
                    earliestTerm ? handleAddTransport(earliestTerm.id) : toast({ title: 'No terms', description: 'Add a term first.', variant: 'destructive' });
                  }}
                >
                  {isBusy && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
                  Add transport
                </Button>
                <Button
                  variant="secondary"
                  className="h-12"
                  disabled={isBusy}
                  onClick={() => {
                    triggerHaptic();
                    setAddSheetOpen(true);
                  }}
                >
                  {isBusy && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
                  Quick add sheet
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  disabled={isBusy}
                  onClick={() => {
                    triggerHaptic();
                    setActiveTab('calendar');
                  }}
                >
                  {isBusy && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
                  Open calendar
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide">This week</p>
                  <h3 className="text-lg font-semibold">Upcoming</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('calendar')}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </div>
              {thisWeekEvents.length === 0 && (
                <div className="text-sm text-muted-foreground">No events in the next few days. We’ll surface the next one automatically.</div>
              )}
              <div className="space-y-2">
                {thisWeekEvents.map(event => (
                  <button
                    key={event.id}
                    className="w-full rounded-xl border border-border/60 bg-muted/40 p-3 text-left hover:bg-accent transition-colors"
                    onClick={() => handleCalendarEventClick(event)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{format(event.date, 'EEE, MMM d')} · {event.school === 'benenden' ? 'Benenden' : 'Wycombe Abbey'}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                        {event.type === 'flight'
                          ? ((event as any)?.details?.type === 'outbound' ? 'From School' : 'To School')
                          : event.type === 'transport'
                            ? 'Transport'
                            : event.type === 'term'
                              ? 'School date'
                              : 'Not travelling'}
                      </Badge>
                    </div>
                    {event.description && (
                      <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {event.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'trips':
        return (
          <div className="px-4 py-5 md:px-6 pb-28 lg:pb-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Trips</p>
                <h2 className="text-xl font-semibold">By term</h2>
              </div>
              <div className="flex items-center gap-2">
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
                  size="sm"
                  onClick={() => {
                    setShareScope(selectedSchool as 'both' | 'benenden' | 'wycombe');
                    setShareDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share next travel
                </Button>
              </div>
            </div>

            <SchoolPills />

            <div className={`grid ${selectedSchool === 'both' ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-4xl'} gap-6`}>
              {/* Benenden School */}
              {shouldShowBenenden && (
                <div className="space-y-3">
                  <SchoolHeader 
                    schoolName="Benenden School"
                    variant="benenden"
                    onAcademicYearClick={() => handleShowScheduleForSchool('benenden')}
                  />
                  
                  <div className="space-y-4">
                    {benendenTerms.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                        No future terms left for Benenden.
                      </div>
                    )}
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
                          isMobile={isMobile}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wycombe Abbey School */}
              {shouldShowWycombe && (
                <div className="space-y-3">
                  <SchoolHeader 
                    schoolName="Wycombe Abbey School"
                    variant="wycombe"
                    onAcademicYearClick={() => handleShowScheduleForSchool('wycombe')}
                  />
                  
                  <div className="space-y-4">
                    {wycombeTerms.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                        No future terms left for Wycombe Abbey.
                      </div>
                    )}
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
                          isMobile={isMobile}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="px-4 py-5 md:px-6 pb-28 lg:pb-10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Calendar</p>
                <h2 className="text-xl font-semibold">Tap a date to manage</h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('today')}>
                Today
              </Button>
            </div>
            <SchoolPills />
            <CompactCalendar
              selectedSchool={selectedSchool as 'benenden' | 'wycombe' | 'both'}
              onEventClick={handleCalendarEventClick}
              onSelectTermIds={handleHighlightTerms}
            />
          </div>
        );
      case 'settings':
        return (
          <div className="px-4 py-5 md:px-6 pb-28 lg:pb-10 space-y-4 max-w-3xl">
            <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Theme</div>
                  <p className="text-xs text-muted-foreground">Switch to match your device.</p>
                </div>
                <ThemeToggle />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShareScope(selectedSchool as 'both' | 'benenden' | 'wycombe');
                    setShareDialogOpen(true);
                  }}
                >
                  Share next travel
                </Button>
                <Suspense fallback={<div className="text-sm text-muted-foreground">Loading export…</div>}>
                  <ExportDialog
                    flights={flights}
                    transport={transport}
                    notTravelling={notTravelling}
                    terms={mockTerms}
                  />
                </Suspense>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  Sign out of your family account
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isPulling && (
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="px-3 py-1 rounded-full border bg-card/90 text-xs shadow-sm">
            {pullDistance > 70 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}

      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-academic">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">UK Schedules</div>
              <div className="text-lg font-semibold">Travel planner</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="pb-24 lg:pb-10">
        {renderTabContent()}
      </div>

      {isMobile && (
        <Button
          className="fixed bottom-32 right-4 z-40 rounded-full shadow-lg h-12 px-4 gap-2"
          onClick={() => {
            triggerHaptic();
            setAddSheetOpen(true);
          }}
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm">Add travel</span>
        </Button>
      )}

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
                onClearNotTravelling={handleClearNotTravelling}
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

      <Sheet open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto pb-6">
          <SheetHeader>
            <SheetTitle>Share itinerary</SheetTitle>
            <SheetDescription>Pick a school and channel to send the very next trip.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 mt-2">
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
        </SheetContent>
      </Sheet>

      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent side="bottom" className="h-auto pb-6">
          <SheetHeader>
            <SheetTitle>Quick add</SheetTitle>
            <SheetDescription>Use the nearest upcoming term for fast actions.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <Button
              className="w-full h-12"
              disabled={isBusy}
              onClick={() => {
                if (isBusy) return;
                triggerHaptic();
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
              disabled={isBusy}
              onClick={() => {
                if (isBusy) return;
                triggerHaptic();
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
              disabled={isBusy}
              onClick={() => {
                if (isBusy) return;
                triggerHaptic();
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border/60 shadow-inner">
        <div className="grid grid-cols-4 divide-x divide-border">
          <Button
            variant={activeTab === 'today' ? 'default' : 'ghost'}
            className="flex flex-col items-center gap-1 py-3"
            onClick={() => {
              triggerHaptic();
              setActiveTab('today');
            }}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Today</span>
          </Button>
          <Button
            variant={activeTab === 'trips' ? 'default' : 'ghost'}
            className="flex flex-col items-center gap-1 py-3"
            onClick={() => {
              triggerHaptic();
              setActiveTab('trips');
            }}
          >
            <Plane className="h-5 w-5" />
            <span className="text-xs">Trips</span>
          </Button>
          <Button
            variant={activeTab === 'calendar' ? 'default' : 'ghost'}
            className="flex flex-col items-center gap-1 py-3"
            onClick={() => {
              triggerHaptic();
              setActiveTab('calendar');
            }}
          >
            <CalendarDays className="h-5 w-5" />
            <span className="text-xs">Calendar</span>
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            className="flex flex-col items-center gap-1 py-3"
            onClick={() => {
              triggerHaptic();
              setActiveTab('settings');
            }}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
