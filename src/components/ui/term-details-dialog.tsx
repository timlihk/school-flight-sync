import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Calendar, Clock, School } from "lucide-react";
import { format } from "date-fns";
import { Term } from "@/types/school";
import { termDetails, getTermDetailsKey } from "@/data/term-details";

interface TermDetailsDialogProps {
  term: Term | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermDetailsDialog({ term, open, onOpenChange }: TermDetailsDialogProps) {
  if (!term) return null;

  const detailsKey = getTermDetailsKey(term.name, term.startDate, term.school);
  console.log('Term details lookup:', term.name, term.startDate, term.school, 'key:', detailsKey);
  const schoolDetails = term.school === 'benenden' ? termDetails.benenden : termDetails.wycombe;
  const details = schoolDetails[detailsKey as keyof typeof schoolDetails] || [];

  const getEventTypeColor = (event: string) => {
    if (event.toLowerCase().includes("term starts") || event.toLowerCase().includes("term begins")) {
      return "bg-gradient-academic text-primary-foreground";
    }
    if (event.toLowerCase().includes("half term") || event.toLowerCase().includes("long leave")) {
      return "bg-gradient-warm text-primary-foreground";
    }
    if (event.toLowerCase().includes("short leave") || event.toLowerCase().includes("exeat")) {
      return "bg-accent/40 text-accent-foreground";
    }
    if (event.toLowerCase().includes("closed weekend")) {
      return "bg-muted text-muted-foreground";
    }
    return "bg-secondary/20 text-secondary-foreground";
  };

  const dialogTitle = (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${term.school === 'benenden' ? 'bg-benenden/10' : 'bg-wycombe/10'}`}>
        <School className="h-5 w-5" />
      </div>
      <div>
        <div className="font-semibold text-foreground">{term.name}</div>
        <div className="text-sm text-muted-foreground font-normal">
          {term.school === 'benenden' ? 'Benenden School' : 'Wycombe School'}
        </div>
      </div>
    </div>
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={dialogTitle} className="max-w-2xl">
      <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-foreground">
                {format(term.startDate, 'MMMM d, yyyy')} - {format(term.endDate, 'MMMM d, yyyy')}
              </div>
              <div className="text-sm text-muted-foreground">
                {term.type.charAt(0).toUpperCase() + term.type.slice(1).replace('-', ' ')}
              </div>
            </div>
          </div>

          {details.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Detailed Schedule
              </h3>
              <div className="space-y-2">
                {(() => {
                  // Group events by date
                  const groupedEvents = details.reduce((acc, detail) => {
                    const date = detail.date;
                    if (!acc[date]) {
                      acc[date] = [];
                    }
                    acc[date].push(detail);
                    return acc;
                  }, {} as Record<string, typeof details>);

                  return Object.entries(groupedEvents).map(([date, dateEvents]) => (
                    <div 
                      key={date}
                      className="p-3 rounded-lg border border-border hover:shadow-soft transition-shadow"
                    >
                      <div className="font-medium text-foreground text-sm mb-2">
                        {date}
                      </div>
                      <div className="space-y-2">
                        {dateEvents.map((detail, index) => (
                          <div key={index} className="flex flex-col gap-1">
                            {detail.time && (
                              <div className="text-xs text-muted-foreground">
                                {detail.time}
                              </div>
                            )}
                            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium w-fit ${getEventTypeColor(detail.event)}`}>
                              {detail.event}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                No detailed schedule available for this term.
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Check the school's official website for more information.
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              *Existing day students are very welcome to come back at the same time as boarders if they wish to personalise spaces in their Houses.
            </div>
          </div>
      </div>
    </ResponsiveDialog>
  );
}