import { School } from "@/hooks/use-calendar-events";

export type NextTravelStatus = "booked" | "staying" | "unplanned" | "needs-transport" | "needs-flight";

export interface NextTravelEntry {
  date: Date;
  title: string;
  detail: string;
  status: NextTravelStatus;
  kind?: "flight" | "transport" | "info";
  termId?: string;
  school: Exclude<School, "both">;
  meta?: {
    confirmation?: string;
    notes?: string;
    timeLabel?: string;
    transport?: {
      status: "booked" | "not-booked";
      label: string;
      timeLabel?: string;
      driverName?: string;
      phoneNumber?: string;
      notes?: string;
    };
  };
}
