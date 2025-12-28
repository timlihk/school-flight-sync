import { School } from "@/hooks/use-calendar-events";

export type NextTravelStatus = "booked" | "staying" | "unplanned";

export interface NextTravelEntry {
  date: Date;
  title: string;
  detail: string;
  status: NextTravelStatus;
  termId?: string;
  school: Exclude<School, "both">;
  meta?: {
    confirmation?: string;
    notes?: string;
    timeLabel?: string;
  };
}
