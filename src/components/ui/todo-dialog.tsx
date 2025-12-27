import { useState } from "react";
import { format, isAfter, isBefore, addMonths } from "date-fns";
import { CheckSquare, Plane, Car, Calendar, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Term, FlightDetails, TransportDetails, NotTravellingStatus } from "@/types/school";
import { cn } from "@/lib/utils";

interface ToDoDialogProps {
  terms: Term[];
  flights: FlightDetails[];
  transport: TransportDetails[];
  notTravelling: NotTravellingStatus[];
  onAddFlight: (termId: string) => void;
  onAddTransport: (termId: string) => void;
  onShowTerm?: (termId: string) => void;
  children?: React.ReactNode;
}

interface ToDoItem {
  id: string;
  term: Term;
  type: 'flight' | 'transport';
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  dueDate: Date;
}

export function ToDoDialog({ 
  terms, 
  flights, 
  transport, 
  notTravelling,
  onAddFlight, 
  onAddTransport, 
  onShowTerm,
  children 
}: ToDoDialogProps) {
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'flight' | 'transport'>('all');
  const [schoolFilter, setSchoolFilter] = useState<'all' | 'benenden' | 'wycombe'>('all');

  // Get terms in next 12 months
  const now = new Date();
  const next12Months = addMonths(now, 12);
  
  const upcomingTerms = terms.filter(term => 
    isAfter(term.startDate, now) && isBefore(term.startDate, next12Months)
  );

  // Generate to-do items
  const generateToDoItems = (): ToDoItem[] => {
    const items: ToDoItem[] = [];

    upcomingTerms.forEach(term => {
      const termFlights = flights.filter(f => f.termId === term.id);
      const termTransport = transport.filter(t => t.termId === term.id);
      const termNotTravelling = notTravelling.find(nt => nt.termId === term.id);
      
      // Check if flights are needed and missing
      const needsFlights = term.type === 'holiday' || term.type === 'half-term' || 
                          term.type === 'exeat' || term.type === 'short-leave' || 
                          term.type === 'long-leave' || term.type === 'term';
      
      if (needsFlights && !termNotTravelling?.noFlights) {
        const needsBothFlights = term.type === 'half-term' || term.type === 'exeat' || 
                                term.type === 'short-leave' || term.type === 'long-leave';
        
        if (needsBothFlights) {
          // Check for missing outbound or return flights
          const hasOutbound = termFlights.some(f => f.type === 'outbound');
          const hasReturn = termFlights.some(f => f.type === 'return');
          
          if (!hasOutbound || !hasReturn) {
            const daysUntil = Math.ceil((term.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            let urgency: 'high' | 'medium' | 'low' = 'low';
            
            if (daysUntil <= 30) urgency = 'high';
            else if (daysUntil <= 60) urgency = 'medium';

            const missingTypes = [];
            if (!hasOutbound) missingTypes.push('from school');
            if (!hasReturn) missingTypes.push('to school');

            items.push({
              id: `flight-${term.id}`,
              term,
              type: 'flight',
              title: `Book ${missingTypes.join(' & ')} flight${missingTypes.length > 1 ? 's' : ''} for ${term.name}`,
              description: `${term.school === 'benenden' ? 'Benenden' : 'Wycombe Abbey'} - ${format(term.startDate, 'MMM dd, yyyy')}`,
              urgency,
              dueDate: term.startDate
            });
          }
        } else if (termFlights.length === 0) {
          // For other term types, check if any flights exist
          const daysUntil = Math.ceil((term.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          let urgency: 'high' | 'medium' | 'low' = 'low';
          
          if (daysUntil <= 30) urgency = 'high';
          else if (daysUntil <= 60) urgency = 'medium';

          items.push({
            id: `flight-${term.id}`,
            term,
            type: 'flight',
            title: `Book flights for ${term.name}`,
            description: `${term.school === 'benenden' ? 'Benenden' : 'Wycombe Abbey'} - ${format(term.startDate, 'MMM dd, yyyy')}`,
            urgency,
            dueDate: term.startDate
          });
        }
      }

      // Check if transport is needed and missing
      if (needsFlights && termTransport.length === 0) {
        const daysUntil = Math.ceil((term.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let urgency: 'high' | 'medium' | 'low' = 'low';
        
        if (daysUntil <= 14) urgency = 'high';
        else if (daysUntil <= 30) urgency = 'medium';

        items.push({
          id: `transport-${term.id}`,
          term,
          type: 'transport',
          title: `Arrange transport for ${term.name}`,
          description: `${term.school === 'benenden' ? 'Benenden' : 'Wycombe Abbey'} - ${format(term.startDate, 'MMM dd, yyyy')}`,
          urgency,
          dueDate: term.startDate
        });
      }
    });

    // Sort by urgency and date
    return items.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  };

  const allToDoItems = generateToDoItems();
  
  // Apply filters
  const toDoItems = allToDoItems.filter(item => {
    const typeMatch = typeFilter === 'all' || item.type === typeFilter;
    const schoolMatch = schoolFilter === 'all' || item.term.school === schoolFilter;
    return typeMatch && schoolMatch;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Calendar className="h-4 w-4" />;
      case 'low': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const handleItemClick = (item: ToDoItem) => {
    setOpen(false);
    // Show the term card instead of directly adding
    if (onShowTerm) {
      onShowTerm(item.term.id);
    } else {
      // Fallback to old behavior if onShowTerm is not provided
      if (item.type === 'flight') {
        onAddFlight(item.term.id);
      } else {
        onAddTransport(item.term.id);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            className="gap-2 w-28 h-9 font-normal"
          >
            <CheckSquare className="h-4 w-4" />
            To Do
            {toDoItems.length > 0 && (
              <Badge variant="destructive" className="ml-1 min-w-[20px] h-5 text-xs flex items-center justify-center">
                {toDoItems.length}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Travel To-Do List
            <Badge variant="outline" className="ml-auto">
              Next 12 months
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        {/* Filters */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={(value: 'all' | 'flight' | 'transport') => setTypeFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="flight">Flights</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={schoolFilter} onValueChange={(value: 'all' | 'benenden' | 'wycombe') => setSchoolFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by school" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              <SelectItem value="benenden">Benenden</SelectItem>
              <SelectItem value="wycombe">Wycombe Abbey</SelectItem>
            </SelectContent>
          </Select>
          
          <Badge variant="outline" className="ml-auto">
            {toDoItems.length} of {allToDoItems.length} items
          </Badge>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {toDoItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckSquare className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-muted-foreground">
                    No outstanding flights or transport to book for the next 12 months.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {toDoItems.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    item.urgency === 'high' && "border-destructive/50 bg-destructive/5"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          "p-2 rounded-full",
                          item.type === 'flight' ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" : "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                        )}>
                          {item.type === 'flight' ? (
                            <Plane className="h-4 w-4" />
                          ) : (
                            <Car className="h-4 w-4" />
                          )}
                        </div>
                        
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {format(item.dueDate, 'MMM dd, yyyy')}</span>
                            <span>•</span>
                            <span>{Math.ceil((item.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge variant={getUrgencyColor(item.urgency)} className="gap-1 text-xs">
                        {getUrgencyIcon(item.urgency)}
                        {item.urgency}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {toDoItems.length > 0 && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground text-center">
              Click any item to add flights or transport
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ToDoDialog;
