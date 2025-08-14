import { GraduationCap, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import benendenLogo from "@/assets/benenden-logo.png";
import wycommebLogo from "@/assets/wycombe-logo.png";

interface SchoolHeaderProps {
  schoolName: string;
  termCount: number;
  variant: 'benenden' | 'wycombe';
}

export function SchoolHeader({ schoolName, termCount, variant }: SchoolHeaderProps) {
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
        <span className="text-sm text-muted-foreground">
          Academic Year 2025-2026
        </span>
        <Badge variant={getBadgeVariant() as any} className="text-xs">
          {termCount} terms
        </Badge>
      </div>
    </div>
  );
}