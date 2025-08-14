import { GraduationCap, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        <GraduationCap className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">
          {schoolName}
        </h2>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Academic Year 2024-2025
        </span>
        <Badge variant={getBadgeVariant() as any} className="text-xs">
          {termCount} terms
        </Badge>
      </div>
    </div>
  );
}