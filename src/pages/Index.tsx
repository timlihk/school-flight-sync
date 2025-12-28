import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense, lazy } from "react";
import { Plane, Calendar, Share2, Plus, List, LayoutGrid, LogOut, BusFront } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AccountChip } from "@/components/ui/account-chip";
import { NetworkStatusBanner } from "@/components/ui/network-status-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { FlightDetails } from "@/types/school";
import { useFamilyAuth } from "@/contexts/FamilyAuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TermCard } from "@/components/ui/term-card";
import { TermDetailsDialog } from "@/components/ui/term-details-dialog";
import { SchoolHeader } from "@/components/school-header";
import { CompactCalendar } from "@/components/CompactCalendar";
import TripTimeline from "@/components/ui/trip-timeline";

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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isAfter, isToday, formatDistanceToNow, addDays, startOfDay, format, differenceInHours } from "date-fns";
import { CalendarEvent, useCalendarEvents } from "@/hooks/use-calendar-events";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";
import { MobileBottomNav, MainNavTab } from "@/components/dashboard/MobileBottomNav";
import { TodayTab } from "@/components/dashboard/tabs/TodayTab";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { NextTravelEntry } from "@/types/next-travel";

const NAV_TABS: MainNavTab[] = ['today', 'trips', 'calendar', 'settings'];

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
  const [heroScope, setHeroScope] = useState<'benenden' | 'wycombe'>('benenden');
  const [heroExpanded, setHeroExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<MainNavTab>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tripsView, setTripsView] = useState<'timeline' | 'cards'>('timeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'booked' | 'needs' | 'staying'>('all');
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { logout } = useFamilyAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { flights, loading, addFlight, editFlight, removeFlight, updateFlightStatus, isUpdatingFlightStatus, refetch: refetchFlights, dataUpdatedAt: flightsUpdatedAt, isFetching: isFlightsFetching } = useFlights();
  const { transport, isLoading: isTransportLoading, addTransport, editTransport, removeTransport, getTransportForTerm, refetch: refetchTransport, dataUpdatedAt: transportUpdatedAt, isFetching: isTransportFetching } = useTransport();
  const { notTravelling, loading: notTravellingLoading, setNotTravellingStatus, clearNotTravellingStatus, refetch: refetchNotTravelling, dataUpdatedAt: notTravUpdatedAt, isFetching: isNotTravFetching } = useNotTravelling();
  const { toast } = useToast();
  const { events: calendarEvents } = useCalendarEvents(selectedSchool as 'both' | 'benenden' | 'wycombe');
  const isBusy = isRefreshing;
  const dataTimestamps = [flightsUpdatedAt, transportUpdatedAt, notTravUpdatedAt].filter(Boolean) as number[];
  const combinedUpdatedAt = dataTimestamps.length ? Math.max(...dataTimestamps) : undefined;
  const isAnyFetching = isFlightsFetching || isTransportFetching || isNotTravFetching || isRefreshing;
  const { isOnline } = useNetworkStatus();

  const fabLabel = activeTab === 'today'
    ? 'Add flight'
    : activeTab === 'trips'
      ? 'Add transport'
      : activeTab === 'calendar'
        ? 'Add travel'
        : 'Share';
  const handleFab = () => {
    triggerHaptic();
    switch (activeTab) {
      case 'today':
        if (nextAvailableTerm) {
          handleAddFlight(nextAvailableTerm.id);
        } else {
          toast({ title: "No upcoming term", description: "Add a term before adding travel.", variant: "destructive" });
        }
        break;
      case 'trips':
        if (nextAvailableTerm) {
          handleAddTransport(nextAvailableTerm.id);
        } else {
          toast({ title: "No upcoming term", description: "Add a term before adding travel.", variant: "destructive" });
        }
        break;
      case 'calendar':
        setAddSheetOpen(true);
        break;
      case 'settings':
        setShareScope(selectedSchool);
        setShareDialogOpen(true);
        break;
    }
  };

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const triggerHaptic = useCallback((type: 'select' | 'success' | 'warning' = 'select') => {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    const patterns: Record<typeof type, number | number[]> = {
      select: 10,
      success: [10, 30, 10],
      warning: [40, 30, 40],
    };
    try {
      navigator.vibrate(patterns[type] || 10);
    } catch {
      // Vibration not supported
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
    if (selectedSchool === 'benenden' || selectedSchool === 'wycombe') {
      setHeroScope(selectedSchool);
    }
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

  const handleAddFlightPersist = useCallback((flight: Omit<FlightDetails, 'id'>) => {
    addFlight(flight);
  }, [addFlight]);

  const handleEditFlightPersist = useCallback((flightId: string, flight: Omit<FlightDetails, 'id'>) => {
    editFlight(flightId, flight);
  }, [editFlight]);

  const handleRemoveFlightPersist = useCallback((flightId: string) => {
    if (!isOnline) {
      toast({ title: "Can't delete offline", description: "Go online to remove flights.", variant: "destructive" });
      return;
    }
    removeFlight(flightId);
  }, [isOnline, removeFlight, toast]);

  const handleAddTransportPersist = useCallback((transportItem: Omit<TransportDetails, 'id'>) => {
    addTransport(transportItem);
  }, [addTransport]);

  const handleEditTransportPersist = useCallback((transportId: string, updates: Partial<TransportDetails>) => {
    editTransport(transportId, updates);
  }, [editTransport]);

  const handleRemoveTransportPersist = useCallback((transportId: string) => {
    if (!isOnline) {
      toast({ title: "Can't delete offline", description: "Go online to remove transport.", variant: "destructive" });
      return;
    }
    removeTransport(transportId);
  }, [isOnline, removeTransport, toast]);

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
    const entries: NextTravelEntry[] = [];

    flights.forEach(flight => {
      if (!isAfter(flight.departure.date, now)) return;
      const term = termLookup.get(flight.termId);
      if (!term || !matches(term.school)) return;
      entries.push({
        date: flight.departure.date,
        title: `${flight.airline} ${flight.flightNumber}`,
        detail: `${flight.departure.airport} → ${flight.arrival.airport}`,
        status: flight.status === 'booked' ? 'booked' : 'unplanned',
        termId: term.id,
        school: term.school,
        meta: {
          timeLabel: flight.departure.time || format(flight.departure.date, 'p'),
          confirmation: flight.confirmationCode,
          notes: flight.notes,
        }
      });
    });

    transport.forEach(item => {
      const term = termLookup.get(item.termId);
      if (!term || !matches(term.school)) return;
      const eventDate = resolveTransportDate(item, term);
      if (!eventDate || !isAfter(eventDate, now)) return;
      entries.push({
        date: eventDate,
        title: `${item.type === 'school-coach' ? 'School Coach' : 'Taxi'} ${item.driverName ? `· ${item.driverName}` : ''}`,
        detail: `${item.direction === 'return' ? 'To School' : 'From School'}`,
        status: 'booked',
        termId: term.id,
        school: term.school,
        meta: {
          timeLabel: format(eventDate, 'p'),
          notes: item.notes,
        }
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
  const nextTravelDetail = useMemo(() => {
    if (!nextTravel) return '';
    const hours = differenceInHours(nextTravel.date, new Date());
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }, [nextTravel]);

  const buildShareText = useCallback((scope: 'both' | 'benenden' | 'wycombe') => {
    const entry = computeNextTravel(scope);
    if (!entry) return '';
    const schoolLabel = scope === 'both'
      ? 'Both schools'
      : scope === 'benenden'
        ? 'Benenden'
        : 'Wycombe';
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
  const filteredThisWeek = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return thisWeekEvents.filter(e => {
      const matchText = !term || e.title.toLowerCase().includes(term) || (e.description || '').toLowerCase().includes(term);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'booked' && e.type !== 'not-travelling') ||
        (statusFilter === 'needs' && e.type === 'term') ||
        (statusFilter === 'staying' && e.type === 'not-travelling');
      return matchText && matchStatus;
    });
  }, [thisWeekEvents, searchTerm, statusFilter]);

  const termMatchesFilters = useCallback((term: Term) => {
    const text = `${term.name} ${term.school}`.toLowerCase();
    const termFlights = flights.filter(f => f.termId === term.id);
    const termTransport = transport.filter(t => t.termId === term.id);
    const status = termFlights.length || termTransport.length
      ? 'booked'
      : notTravelling.find(nt => nt.termId === term.id)
        ? 'staying'
        : 'needs';
    const matchesStatus = statusFilter === 'all' || statusFilter === status;
    const searchLower = searchTerm.trim().toLowerCase();
    const matchesSearch = !searchLower
      || text.includes(searchLower)
      || termFlights.some(f => `${f.flightNumber} ${f.airline} ${f.departure.airport} ${f.arrival.airport}`.toLowerCase().includes(searchLower))
      || termTransport.some(t => `${t.driverName || ''} ${t.type}`.toLowerCase().includes(searchLower));
    return matchesSearch && matchesStatus;
  }, [flights, transport, notTravelling, searchTerm, statusFilter]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [handleRefresh]);




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
  const nextAvailableTerm = useMemo(() => {
    const now = new Date();
    return filteredTerms.find(term => term.startDate.getTime() >= now.getTime()) ?? earliestTerm ?? null;
  }, [filteredTerms, earliestTerm]);
  const handleHeroShare = useCallback(() => {
    setShareScope(heroScope);
    setShareDialogOpen(true);
  }, [heroScope]);
  const handlePlanShare = useCallback(() => {
    triggerHaptic();
    setShareScope(selectedSchool as 'both' | 'benenden' | 'wycombe');
    setShareDialogOpen(true);
  }, [selectedSchool, triggerHaptic]);
  const handleQuickAddFlight = useCallback(() => {
    triggerHaptic();
    if (!nextAvailableTerm) {
      toast({ title: "No upcoming term", description: "Add a term before adding travel.", variant: "destructive" });
      return;
    }
    handleAddFlight(nextAvailableTerm.id);
  }, [handleAddFlight, nextAvailableTerm, toast, triggerHaptic]);
  const handleQuickAddTransport = useCallback(() => {
    triggerHaptic();
    if (!nextAvailableTerm) {
      toast({ title: "No upcoming term", description: "Add a term before adding transport.", variant: "destructive" });
      return;
    }
    handleAddTransport(nextAvailableTerm.id);
  }, [handleAddTransport, nextAvailableTerm, toast, triggerHaptic]);
  const handleHeroManageBooking = useCallback((entry: NextTravelEntry) => {
    if (!entry.termId) return;
    handleHighlightTerms([entry.termId]);
    const term = termLookup.get(entry.termId);
    if (!term) return;
    setSelectedTerm(term);
    setShowFlightDialog(true);
  }, [handleHighlightTerms, termLookup, setSelectedTerm]);

  const handleSchoolSelect = useCallback((scope: 'both' | 'benenden' | 'wycombe') => {
    triggerHaptic();
    setSelectedSchool(scope);
    scrollToTop();
  }, [triggerHaptic, scrollToTop]);

  const handleNavSelect = useCallback((tab: typeof activeTab) => {
    triggerHaptic('select');
    setActiveTab(tab);
    scrollToTop();
  }, [triggerHaptic, scrollToTop]);
  const handleSwipeTabs = useCallback((direction: 'next' | 'prev') => {
    const currentIndex = NAV_TABS.indexOf(activeTab);
    const nextIndex = direction === 'next'
      ? Math.min(NAV_TABS.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);
    if (NAV_TABS[nextIndex] !== activeTab) {
      triggerHaptic();
      setActiveTab(NAV_TABS[nextIndex]);
      scrollToTop();
    }
  }, [activeTab, scrollToTop, triggerHaptic]);

  const { bind: pullHandlers, isPulling, pullDistance } = usePullToRefresh({
    isEnabled: isMobile,
    onRefresh: handleRefresh,
    onSwipe: handleSwipeTabs,
  });

  const SchoolPills = () => (
    <div className="flex flex-wrap gap-2">
      {(['both', 'benenden', 'wycombe'] as const).map(scope => (
        <Button
          key={scope}
          size="sm"
          variant={selectedSchool === scope ? 'default' : 'outline'}
          className="rounded-full px-4"
          onClick={() => handleSchoolSelect(scope)}
        >
          {scope === 'both' ? 'Both schools' : scope === 'benenden' ? 'Benenden' : 'Wycombe'}
        </Button>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayTab
            heroEntry={nextTravel}
            heroEntryDetail={nextTravelDetail}
            heroScope={heroScope}
            onHeroScopeChange={setHeroScope}
            heroExpanded={heroExpanded}
            onToggleHeroExpanded={() => setHeroExpanded(prev => !prev)}
            isOnline={isOnline}
            earliestTerm={earliestTerm}
            onAddFlight={handleAddFlight}
            onAddTransport={handleAddTransport}
            onViewTrip={(termId) => handleHighlightTerms([termId])}
            onManageBooking={handleHeroManageBooking}
            onShareHero={handleHeroShare}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onQuickAddFlight={handleQuickAddFlight}
            onQuickAddTransport={handleQuickAddTransport}
            onSharePlanFast={handlePlanShare}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            isBusy={isBusy}
            schoolPills={<SchoolPills />}
            filteredThisWeek={filteredThisWeek}
            onCalendarEventClick={handleCalendarEventClick}
            onNavigateToCalendar={() => handleNavSelect('calendar')}
          />
        );
      case 'trips':
        return (
          <div className="px-4 py-5 md:px-6 pb-28 lg:pb-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Trips</p>
                <h2 className="text-xl font-semibold">{tripsView === 'timeline' ? 'Timeline' : 'By term'}</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-border p-0.5">
                  <Button
                    variant={tripsView === 'timeline' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setTripsView('timeline')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={tripsView === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setTripsView('cards')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
                <ToDoDialog
                  terms={filteredTerms}
                  flights={flights}
                  transport={transport}
                  notTravelling={notTravelling}
                  onAddFlight={handleAddFlight}
                  onAddTransport={handleAddTransport}
                  onShowTerm={handleShowTerm}
                />
              </div>
            </div>

            <SchoolPills />

            {tripsView === 'timeline' ? (
              <TripTimeline
                terms={filteredTerms}
                flights={flights}
                transport={transport}
                onFlightClick={handleViewFlights}
                onTransportClick={handleViewTransport}
                onTermClick={handleShowTerm}
                onAddFlight={() => earliestTerm && handleAddFlight(earliestTerm.id)}
                onAddTransport={() => earliestTerm && handleAddTransport(earliestTerm.id)}
                selectedSchool={selectedSchool}
              />
            ) : (
              <>

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
                    {benendenTerms.map((term) => {
                      if (!termMatchesFilters(term)) return null;
                      const pendingCount = 0;
                      return (
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
                            pendingCount={pendingCount}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Wycombe School */}
              {shouldShowWycombe && (
                <div className="space-y-3">
                  <SchoolHeader 
                    schoolName="Wycombe School"
                    variant="wycombe"
                    onAcademicYearClick={() => handleShowScheduleForSchool('wycombe')}
                  />
                  
                  <div className="space-y-4">
                    {wycombeTerms.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                        No future terms left for Wycombe.
                      </div>
                    )}
                    {wycombeTerms.map((term) => {
                      if (!termMatchesFilters(term)) return null;
                      const pendingCount = 0;
                      return (
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
                            pendingCount={pendingCount}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
              </>
            )}
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
              <Button variant="outline" size="sm" onClick={() => handleNavSelect('today')}>
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[140px] w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[56px] rounded-xl" />
          <Skeleton className="h-[56px] rounded-xl" />
          <Skeleton className="h-[56px] rounded-xl" />
          <Skeleton className="h-[56px] rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[96px] w-full rounded-xl" />
          <Skeleton className="h-[96px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      {...pullHandlers}
    >
      <div className="fixed top-16 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div
          className={cn(
            "px-3 py-1 rounded-full border bg-card/90 text-xs shadow-sm transition-transform transition-opacity duration-150",
            isPulling ? "opacity-100" : "opacity-0"
          )}
          style={{
            transform: `scale(${1 + Math.min(pullDistance, 80) / 240}) translateY(${Math.min(pullDistance, 60) / 6}px)`,
          }}
        >
          {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      </div>

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
            <AccountChip
              onLogout={logout}
              title="Family Account"
              label="Family"
              subtitle={selectedSchool === 'both' ? 'Both schools' : selectedSchool === 'benenden' ? 'Benenden' : 'Wycombe'}
            />
          </div>
        </div>
      </header>

      <NetworkStatusBanner
        dataUpdatedAt={combinedUpdatedAt}
        isRefreshing={isAnyFetching}
        perSource={[
          { label: 'Flights', updatedAt: flightsUpdatedAt, isFetching: isFlightsFetching },
          { label: 'Transport', updatedAt: transportUpdatedAt, isFetching: isTransportFetching },
          { label: 'Status', updatedAt: notTravUpdatedAt, isFetching: isNotTravFetching },
        ]}
        onRefresh={() => {
          refetchFlights();
          refetchTransport();
          refetchNotTravelling();
        }}
      />

      <div className="pb-24 lg:pb-10">
        {renderTabContent()}
      </div>

      {isMobile && (
        <Button
          className="fixed bottom-32 right-4 z-40 rounded-full shadow-lg h-12 px-4 gap-2"
          onClick={handleFab}
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm">{fabLabel}</span>
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
                previousFlights={flights}
                onAddFlight={handleAddFlightPersist}
                onEditFlight={handleEditFlightPersist}
                onRemoveFlight={handleRemoveFlightPersist}
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
                previousTransport={transport}
                onAddTransport={handleAddTransportPersist}
                onEditTransport={handleEditTransportPersist}
                onRemoveTransport={handleRemoveTransportPersist}
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
        <ResponsiveDialog
          open={showTermCardPopup}
          onOpenChange={setShowTermCardPopup}
          title={
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {popupTerm.name}
            </div>
          }
          className="max-w-2xl"
        >
          <div className="mt-2">
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
              pendingCount={0}
            />
          </div>
        </ResponsiveDialog>
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
                  {scope === 'both' ? 'Both schools' : scope === 'benenden' ? 'Benenden' : 'Wycombe'}
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
            <SheetDescription>
              {nextAvailableTerm
                ? `Fast actions for ${nextAvailableTerm.name}.`
                : 'No upcoming terms available yet.'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <Button
              className="w-full h-12 justify-start gap-3"
              disabled={isBusy || !nextAvailableTerm}
              onClick={() => {
                if (isBusy) return;
                triggerHaptic();
                if (!nextAvailableTerm) {
                  toast({ title: "No terms available", description: "Add a term before adding travel.", variant: "destructive" });
                  return;
                }
                handleAddFlight(nextAvailableTerm.id);
                setAddSheetOpen(false);
              }}
            >
              <Plane className="h-4 w-4" />
              Add flight {nextAvailableTerm ? `(${nextAvailableTerm.name})` : ''}
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 justify-start gap-3"
              disabled={isBusy || !nextAvailableTerm}
              onClick={() => {
                if (isBusy) return;
                triggerHaptic();
                if (!nextAvailableTerm) {
                  toast({ title: "No terms available", description: "Add a term before adding travel.", variant: "destructive" });
                  return;
                }
                handleAddTransport(nextAvailableTerm.id);
                setAddSheetOpen(false);
              }}
            >
              <BusFront className="h-4 w-4" />
              Add transport
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 justify-start gap-3"
              disabled={isBusy || !nextAvailableTerm}
              onClick={() => {
                if (isBusy) return;
                triggerHaptic();
                if (!nextAvailableTerm) {
                  toast({ title: "No terms available", description: "Add a term before adding travel.", variant: "destructive" });
                  return;
                }
                handleShowTerm(nextAvailableTerm.id);
                setAddSheetOpen(false);
              }}
            >
              View term details
            </Button>
            <Button
              variant="ghost"
              className="w-full h-12 justify-start gap-3"
              onClick={() => {
                triggerHaptic();
                setShareScope(selectedSchool as 'both' | 'benenden' | 'wycombe');
                setShareDialogOpen(true);
                setAddSheetOpen(false);
              }}
            >
              <Share2 className="h-4 w-4" />
              Share upcoming travel
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {isMobile && (
        <MobileBottomNav activeTab={activeTab} onSelect={handleNavSelect} />
      )}
    </div>
  );
}
