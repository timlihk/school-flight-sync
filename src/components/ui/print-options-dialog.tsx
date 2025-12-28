import { useState } from 'react';
import { Printer, School, Calendar, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface PrintOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (options: PrintOptions) => void;
  availableYears?: string[];
}

export interface PrintOptions {
  schools: {
    benenden: boolean;
    wycombe: boolean;
  };
  year: string;
  layout: 'separate' | 'side-by-side';
}

export function PrintOptionsDialog({
  open,
  onOpenChange,
  onPrint,
  availableYears = ['2025-2026', '2026-2027']
}: PrintOptionsDialogProps) {
  const { toast } = useToast();
  const [selectedSchools, setSelectedSchools] = useState({
    benenden: true,
    wycombe: true
  });
  const [selectedYear, setSelectedYear] = useState(availableYears[0] || '2025-2026');
  const [layout, setLayout] = useState<'separate' | 'side-by-side'>('separate');

  const handleSchoolToggle = (school: 'benenden' | 'wycombe') => {
    setSelectedSchools(prev => ({
      ...prev,
      [school]: !prev[school]
    }));
  };

  const handlePrint = () => {
    // Validate at least one school is selected
    if (!selectedSchools.benenden && !selectedSchools.wycombe) {
      toast({
        title: "No School Selected",
        description: "Please select at least one school to print.",
        variant: "destructive",
      });
      return;
    }

    // If only one school is selected, force separate layout
    const effectiveLayout = (!selectedSchools.benenden || !selectedSchools.wycombe) 
      ? 'separate' 
      : layout;

    const options: PrintOptions = {
      schools: selectedSchools,
      year: selectedYear,
      layout: effectiveLayout
    };

    onPrint(options);
    onOpenChange(false);
  };

  const bothSchoolsSelected = selectedSchools.benenden && selectedSchools.wycombe;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Options
          </DialogTitle>
          <DialogDescription>
            Select which school schedules and year you want to print
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* School Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <School className="h-4 w-4" />
              Select Schools
            </Label>
            <div className="space-y-2 pl-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="benenden"
                  checked={selectedSchools.benenden}
                  onCheckedChange={() => handleSchoolToggle('benenden')}
                />
                <Label
                  htmlFor="benenden"
                  className="text-sm font-normal cursor-pointer"
                >
                  Benenden School
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wycombe"
                  checked={selectedSchools.wycombe}
                  onCheckedChange={() => handleSchoolToggle('wycombe')}
                />
                <Label
                  htmlFor="wycombe"
                  className="text-sm font-normal cursor-pointer"
                >
                  Wycombe School
                </Label>
              </div>
            </div>
          </div>

          {/* Year Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Academic Year
            </Label>
            <RadioGroup value={selectedYear} onValueChange={setSelectedYear}>
              {availableYears.map(year => (
                <div key={year} className="flex items-center space-x-2 pl-6">
                  <RadioGroupItem value={year} id={year} />
                  <Label htmlFor={year} className="text-sm font-normal cursor-pointer">
                    {year}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Layout Options - Only show if both schools are selected */}
          {bothSchoolsSelected && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Print Layout
              </Label>
              <RadioGroup value={layout} onValueChange={(value) => setLayout(value as 'separate' | 'side-by-side')}>
                <div className="flex items-center space-x-2 pl-6">
                  <RadioGroupItem value="separate" id="separate" />
                  <Label htmlFor="separate" className="text-sm font-normal cursor-pointer">
                    Separate pages for each school
                  </Label>
                </div>
                <div className="flex items-center space-x-2 pl-6">
                  <RadioGroupItem value="side-by-side" id="side-by-side" />
                  <Label htmlFor="side-by-side" className="text-sm font-normal cursor-pointer">
                    Side-by-side comparison
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Info message when only one school is selected */}
          {!bothSchoolsSelected && (selectedSchools.benenden || selectedSchools.wycombe) && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              Side-by-side layout is only available when both schools are selected.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}