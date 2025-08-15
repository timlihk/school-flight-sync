import { useState } from 'react';
import { Download, FileText, Database, Printer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FlightDetails, TransportDetails, NotTravellingStatus, Term } from '@/types/school';
import {
  exportToCSV,
  exportToJSON,
  transformFlightsForCSV,
  transformTransportForCSV,
  createCompleteBackup
} from '@/utils/exportUtils';
import { format } from 'date-fns';

interface ExportDialogProps {
  flights: FlightDetails[];
  transport: TransportDetails[];
  notTravelling: NotTravellingStatus[];
  terms: Term[];
}

export function ExportDialog({ flights, transport, notTravelling, terms }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportFlightsCSV = async () => {
    try {
      setIsExporting(true);
      const csvData = transformFlightsForCSV(flights, terms);
      
      if (csvData.length === 0) {
        toast({
          title: "No Flight Data",
          description: "There are no flights to export.",
          variant: "destructive",
        });
        return;
      }

      const filename = `school-flights-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      exportToCSV(csvData, filename);
      
      toast({
        title: "Export Successful",
        description: `Exported ${csvData.length} flights to ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export flight data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTransportCSV = async () => {
    try {
      setIsExporting(true);
      const csvData = transformTransportForCSV(transport, terms);
      
      if (csvData.length === 0) {
        toast({
          title: "No Transport Data",
          description: "There are no transport arrangements to export.",
          variant: "destructive",
        });
        return;
      }

      const filename = `school-transport-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      exportToCSV(csvData, filename);
      
      toast({
        title: "Export Successful",
        description: `Exported ${csvData.length} transport arrangements to ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export transport data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCompleteBackup = async () => {
    try {
      setIsExporting(true);
      const backupData = createCompleteBackup(flights, transport, notTravelling, terms);
      const filename = `school-flight-sync-backup-${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`;
      
      exportToJSON(backupData, filename);
      
      toast({
        title: "Backup Created",
        description: `Complete data backup saved as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintView = () => {
    // Open print-friendly view in new window
    window.open('/print', '_blank');
  };

  const getTotalStats = () => {
    return {
      flights: flights.length,
      transport: transport.length,
      terms: terms.length,
      schools: [...new Set(terms.map(t => t.school))].length
    };
  };

  const stats = getTotalStats();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Export Family Travel Data
          </DialogTitle>
          <DialogDescription>
            Export your family's school travel data for backup or sharing. All exports include data for both schools.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">{stats.flights}</div>
                  <div className="text-muted-foreground">Flights</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{stats.transport}</div>
                  <div className="text-muted-foreground">Transport</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{stats.terms}</div>
                  <div className="text-muted-foreground">Terms</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{stats.schools}</div>
                  <div className="text-muted-foreground">Schools</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="grid gap-3">
            {/* CSV Exports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV Exports
                </CardTitle>
                <CardDescription>
                  Export data in spreadsheet-friendly CSV format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Flight Data</div>
                    <div className="text-sm text-muted-foreground">
                      All flight details including dates, times, and confirmation codes
                    </div>
                  </div>
                  <Button
                    onClick={handleExportFlightsCSV}
                    disabled={isExporting || flights.length === 0}
                    size="sm"
                  >
                    Export CSV
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Transport Data</div>
                    <div className="text-sm text-muted-foreground">
                      Driver details, contact information, and pickup times
                    </div>
                  </div>
                  <Button
                    onClick={handleExportTransportCSV}
                    disabled={isExporting || transport.length === 0}
                    size="sm"
                  >
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Complete Backup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Complete Backup
                </CardTitle>
                <CardDescription>
                  Full backup of all family data including settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">JSON Backup</div>
                    <div className="text-sm text-muted-foreground">
                      Complete data backup in JSON format for restoration
                    </div>
                  </div>
                  <Button
                    onClick={handleExportCompleteBackup}
                    disabled={isExporting}
                    size="sm"
                  >
                    Create Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Print View */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print-Friendly View
                </CardTitle>
                <CardDescription>
                  Open a print-optimized view of your travel schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Printable Schedule</div>
                    <div className="text-sm text-muted-foreground">
                      Clean layout optimized for printing or PDF generation
                    </div>
                  </div>
                  <Button
                    onClick={handlePrintView}
                    disabled={isExporting}
                    size="sm"
                    variant="outline"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}