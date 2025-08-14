import { GraduationCap, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import benendenLogo from "/lovable-uploads/2862c869-2c37-4d6f-a4f9-6d8f96162fad.png";
import wycommebLogo from "/lovable-uploads/ca153a00-902a-4a17-a0dc-2f475bb46d6e.png";

interface SchoolHeaderProps {
  schoolName: string;
  termCount: number;
  variant: 'benenden' | 'wycombe';
  academicYear?: string;
  onAcademicYearClick?: () => void;
}

export function SchoolHeader({ schoolName, termCount, variant, academicYear = "2025-2026", onAcademicYearClick }: SchoolHeaderProps) {
  const getBadgeVariant = () => {
    return variant === 'benenden' ? 'default' : 'secondary';
  };

  return (
    <div className="text-center space-y-3 animate-fade-in">
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-card shadow-soft border border-border p-2 flex items-center justify-center">
          <img 
            src={variant === 'benenden' ? benendenLogo : wycommebLogo} 
            alt={`${schoolName} logo`}
            className="w-8 h-8 object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {schoolName}
        </h2>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span 
          className={`text-sm ${onAcademicYearClick ? 'text-primary cursor-pointer hover:underline' : 'text-muted-foreground'}`}
          onClick={onAcademicYearClick}
        >
          Academic Year {academicYear}
          {onAcademicYearClick && <span className="ml-1 text-xs text-muted-foreground">- Click for detailed schedule</span>}
        </span>
        <Badge variant={getBadgeVariant() as any} className="text-xs">
          {termCount} terms
        </Badge>
      </div>
    </div>
  );
}