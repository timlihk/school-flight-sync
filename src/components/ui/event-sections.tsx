import React from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown, Clock } from "lucide-react";
import { Term } from "@/types/school";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface EventSectionsProps {
  terms: Term[];
  school: 'benenden' | 'wycombe';
  className?: string;
}

export function EventSections({ terms, school, className }: EventSectionsProps) {
  const [isExeatOpen, setIsExeatOpen] = React.useState(false);
  const [isHalfTermOpen, setIsHalfTermOpen] = React.useState(false);

  // Filter events by type
  const exeatEvents = terms.filter(term => 
    school === 'benenden' 
      ? term.type === 'exeat' 
      : term.type === 'short-leave'
  );

  const halfTermEvents = terms.filter(term => 
    school === 'benenden' 
      ? term.type === 'half-term' 
      : term.type === 'long-leave'
  );

  const getEventBadgeColor = (type: Term['type']) => {
    switch (type) {
      case 'exeat':
      case 'short-leave':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case 'half-term':
      case 'long-leave':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getEventTitle = (school: string) => {
    return school === 'benenden' 
      ? { exeat: 'Fixed Exeat', halfTerm: 'Half Term' }
      : { exeat: 'Short Leave', halfTerm: 'Long Leave' };
  };

  const titles = getEventTitle(school);

  const renderEventCard = (event: Term) => {
    const duration = Math.ceil((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div key={event.id} className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-card-foreground">{event.name}</h4>
            <Badge 
              variant="secondary" 
              className={cn("mt-1", getEventBadgeColor(event.type))}
            >
              {event.type === 'exeat' ? 'Fixed Exeat' : 
               event.type === 'short-leave' ? 'Short Leave' :
               event.type === 'half-term' ? 'Half Term' : 'Long Leave'}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {`${format(event.startDate, 'MMM dd')} - ${format(event.endDate, 'MMM dd, yyyy')}`}
          </span>
          <span className="text-xs">({duration} days)</span>
        </div>
      </div>
    );
  };

  if (exeatEvents.length === 0 && halfTermEvents.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Fixed Exeat / Short Leave Section */}
      {exeatEvents.length > 0 && (
        <Card>
          <Collapsible open={isExeatOpen} onOpenChange={setIsExeatOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {titles.exeat} Events
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      {exeatEvents.length} events
                    </Badge>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExeatOpen && "rotate-180"
                      )} 
                    />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {exeatEvents.map(renderEventCard)}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Half Term / Long Leave Section */}
      {halfTermEvents.length > 0 && (
        <Card>
          <Collapsible open={isHalfTermOpen} onOpenChange={setIsHalfTermOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {titles.halfTerm} Events
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {halfTermEvents.length} events
                    </Badge>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isHalfTermOpen && "rotate-180"
                      )} 
                    />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {halfTermEvents.map(renderEventCard)}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
}