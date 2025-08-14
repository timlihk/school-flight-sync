import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAcademicYears } from "@/data/mock-terms";

interface ExportDialogProps {
  onExport: (school: 'both' | 'benenden' | 'wycombe', academicYear: string) => void;
  children?: React.ReactNode;
}

export function ExportDialog({ onExport, children }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<'both' | 'benenden' | 'wycombe'>('both');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');

  const handleExport = () => {
    onExport(selectedSchool, selectedAcademicYear);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            className="gap-2 w-32 h-9 font-normal"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Travel Agenda
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* School Selection */}
          <div className="space-y-3">
            <Label htmlFor="school">Select School</Label>
            <RadioGroup
              value={selectedSchool}
              onValueChange={(value) => setSelectedSchool(value as 'both' | 'benenden' | 'wycombe')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="cursor-pointer">Both Schools</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="benenden" id="benenden" />
                <Label htmlFor="benenden" className="cursor-pointer">Benenden School Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wycombe" id="wycombe" />
                <Label htmlFor="wycombe" className="cursor-pointer">Wycombe Abbey School Only</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Academic Year Selection */}
          <div className="space-y-3">
            <Label htmlFor="year">Academic Year</Label>
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Academic Years</SelectItem>
                {getAcademicYears().map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Info */}
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p>Your PDF will include:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>All term dates for selected criteria</li>
              <li>Flight bookings with confirmation codes</li>
              <li>Transport arrangements and contacts</li>
              <li>Professional formatting for printing</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Generate PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}