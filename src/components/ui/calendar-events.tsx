import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Term } from "@/types/school";

interface CalendarEventsProps {
  terms: Term[];
  className?: string;
}

export function CalendarEvents({ terms, className }: CalendarEventsProps) {
  // Filter for terms that require travel (terms, half-terms, holidays)
  const travelTerms = terms.filter(term => 
    ['term', 'half-term', 'holiday'].includes(term.type)
  ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'term':
        return 'bg-gradient-academic text-primary-foreground';
      case 'half-term':
        return 'bg-accent/40 text-accent-foreground';
      case 'holiday':
        return 'bg-gradient-warm text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'term':
        return 'Term Start';
      case 'half-term':
        return 'Half Term';
      case 'holiday':
        return 'Holiday';
      default:
        return 'Event';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Travel Calendar Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {travelTerms.map((term) => (
            <div 
              key={term.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:shadow-soft transition-shadow"
            >
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(term.type)}`}>
                {getEventTypeName(term.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {term.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {term.school === 'benenden' ? 'Benenden' : 'Wycombe'}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {format(term.startDate, 'MMM dd')}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Travel day
                </p>
              </div>
            </div>
          ))}
          
          {travelTerms.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No travel events found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}