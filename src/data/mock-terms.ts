import { Term } from "@/types/school";

// Real term dates scraped from school websites - Academic Year 2025-2026
export const mockTerms: Term[] = [
  // Benenden School Terms 2025-2026
  {
    id: "ben-autumn-2025",
    name: "Autumn Term Start",
    startDate: new Date("2025-09-02"),
    endDate: new Date("2025-12-10"),
    type: "term",
    school: "benenden"
  },
  {
    id: "ben-autumn-exeat1-2025",
    name: "Fixed Exeat",
    startDate: new Date("2025-09-26"),
    endDate: new Date("2025-09-28"),
    type: "exeat",
    school: "benenden"
  },
  {
    id: "ben-autumn-half-2025",
    name: "Half Term",
    startDate: new Date("2025-10-17"),
    endDate: new Date("2025-11-02"),
    type: "half-term",
    school: "benenden"
  },
  {
    id: "ben-autumn-exeat2-2025",
    name: "Fixed Exeat",
    startDate: new Date("2025-11-21"),
    endDate: new Date("2025-11-23"),
    type: "exeat",
    school: "benenden"
  },
  {
    id: "ben-christmas-2025",
    name: "Christmas Holiday",
    startDate: new Date("2025-12-10"),
    endDate: new Date("2026-01-05"),
    type: "holiday",
    school: "benenden"
  },
  {
    id: "ben-spring-2026",
    name: "Spring Term Start",
    startDate: new Date("2026-01-05"),
    endDate: new Date("2026-03-27"),
    type: "term",
    school: "benenden"
  },
  {
    id: "ben-spring-exeat1-2026",
    name: "Fixed Exeat",
    startDate: new Date("2026-01-23"),
    endDate: new Date("2026-01-25"),
    type: "exeat",
    school: "benenden"
  },
  {
    id: "ben-spring-half-2026",
    name: "Half Term",
    startDate: new Date("2026-02-13"),
    endDate: new Date("2026-02-22"),
    type: "half-term",
    school: "benenden"
  },
  {
    id: "ben-spring-exeat2-2026",
    name: "Fixed Exeat",
    startDate: new Date("2026-03-13"),
    endDate: new Date("2026-03-15"),
    type: "exeat",
    school: "benenden"
  },
  {
    id: "ben-easter-2026",
    name: "Easter Holiday",
    startDate: new Date("2026-03-27"),
    endDate: new Date("2026-04-20"),
    type: "holiday",
    school: "benenden"
  },
  {
    id: "ben-summer-2026",
    name: "Summer Term Start",
    startDate: new Date("2026-04-20"),
    endDate: new Date("2026-07-04"),
    type: "term",
    school: "benenden"
  },
  {
    id: "ben-summer-exeat1-2026",
    name: "Fixed Exeat",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-05-04"),
    type: "exeat",
    school: "benenden"
  },
  {
    id: "ben-summer-half-2026",
    name: "Half Term",
    startDate: new Date("2026-05-22"),
    endDate: new Date("2026-05-31"),
    type: "half-term",
    school: "benenden"
  },
  {
    id: "ben-summer-exeat2-2026",
    name: "Fixed Exeat",
    startDate: new Date("2026-06-19"),
    endDate: new Date("2026-06-21"),
    type: "exeat",
    school: "benenden"
  },
  {
    id: "ben-summer-holiday-2026",
    name: "Summer Holiday",
    startDate: new Date("2026-07-04"),
    endDate: new Date("2026-09-01"),
    type: "holiday",
    school: "benenden"
  },

  // Wycombe Abbey School Terms 2025-2026
  {
    id: "wyc-autumn-2025",
    name: "Autumn Term Start",
    startDate: new Date("2025-09-01"),
    endDate: new Date("2025-12-10"),
    type: "term",
    school: "wycombe"
  },
  {
    id: "wyc-autumn-short1-2025",
    name: "Short Leave",
    startDate: new Date("2025-09-27"),
    endDate: new Date("2025-09-29"),
    type: "short-leave",
    school: "wycombe"
  },
  {
    id: "wyc-autumn-long-2025",
    name: "Long Leave (Half Term)",
    startDate: new Date("2025-10-17"),
    endDate: new Date("2025-11-02"),
    type: "long-leave",
    school: "wycombe"
  },
  {
    id: "wyc-autumn-short2-2025",
    name: "Short Leave",
    startDate: new Date("2025-11-19"),
    endDate: new Date("2025-11-23"),
    type: "short-leave",
    school: "wycombe"
  },
  {
    id: "wyc-christmas-2025",
    name: "Christmas Holiday",
    startDate: new Date("2025-12-10"),
    endDate: new Date("2026-01-06"),
    type: "holiday",
    school: "wycombe"
  },
  {
    id: "wyc-spring-2026",
    name: "Spring Term Start",
    startDate: new Date("2026-01-06"),
    endDate: new Date("2026-03-26"),
    type: "term",
    school: "wycombe"
  },
  {
    id: "wyc-spring-short1-2026",
    name: "Short Leave",
    startDate: new Date("2026-01-23"),
    endDate: new Date("2026-01-25"),
    type: "short-leave",
    school: "wycombe"
  },
  {
    id: "wyc-spring-long-2026",
    name: "Long Leave (Half Term)",
    startDate: new Date("2026-02-13"),
    endDate: new Date("2026-02-22"),
    type: "long-leave",
    school: "wycombe"
  },
  {
    id: "wyc-spring-short2-2026",
    name: "Short Leave",
    startDate: new Date("2026-03-14"),
    endDate: new Date("2026-03-16"),
    type: "short-leave",
    school: "wycombe"
  },
  {
    id: "wyc-easter-2026",
    name: "Easter Holiday",
    startDate: new Date("2026-03-26"),
    endDate: new Date("2026-04-21"),
    type: "holiday",
    school: "wycombe"
  },
  {
    id: "wyc-summer-2026",
    name: "Summer Term Start",
    startDate: new Date("2026-04-21"),
    endDate: new Date("2026-06-26"),
    type: "term",
    school: "wycombe"
  },
  {
    id: "wyc-summer-short1-2026",
    name: "Short Leave",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-05-04"),
    type: "short-leave",
    school: "wycombe"
  },
  {
    id: "wyc-summer-long-2026",
    name: "Long Leave (Half Term)",
    startDate: new Date("2026-05-22"),
    endDate: new Date("2026-05-31"),
    type: "long-leave",
    school: "wycombe"
  },
  {
    id: "wyc-summer-short2-2026",
    name: "Short Leave",
    startDate: new Date("2026-06-12"),
    endDate: new Date("2026-06-14"),
    type: "short-leave",
    school: "wycombe"
  },
  {
    id: "wyc-summer-holiday-2026",
    name: "Summer Holiday",
    startDate: new Date("2026-06-26"),
    endDate: new Date("2026-09-01"),
    type: "holiday",
    school: "wycombe"
  }
];