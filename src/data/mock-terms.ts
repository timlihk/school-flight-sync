import { Term } from "@/types/school";

export const mockTerms: Term[] = [
  // Benenden School Terms 2024-2025
  {
    id: "ben-autumn-2024",
    name: "Autumn Term",
    startDate: new Date("2024-09-04"),
    endDate: new Date("2024-12-13"),
    type: "term",
    school: "benenden"
  },
  {
    id: "ben-autumn-half-2024",
    name: "Autumn Half Term",
    startDate: new Date("2024-10-19"),
    endDate: new Date("2024-11-03"),
    type: "half-term",
    school: "benenden"
  },
  {
    id: "ben-christmas-2024",
    name: "Christmas Holiday",
    startDate: new Date("2024-12-14"),
    endDate: new Date("2025-01-12"),
    type: "holiday",
    school: "benenden"
  },
  {
    id: "ben-spring-2025",
    name: "Spring Term", 
    startDate: new Date("2025-01-13"),
    endDate: new Date("2025-04-04"),
    type: "term",
    school: "benenden"
  },
  {
    id: "ben-spring-half-2025",
    name: "Spring Half Term",
    startDate: new Date("2025-02-15"),
    endDate: new Date("2025-02-23"),
    type: "half-term", 
    school: "benenden"
  },
  {
    id: "ben-easter-2025",
    name: "Easter Holiday",
    startDate: new Date("2025-04-05"),
    endDate: new Date("2025-04-27"),
    type: "holiday",
    school: "benenden"
  },
  {
    id: "ben-summer-2025",
    name: "Summer Term",
    startDate: new Date("2025-04-28"),
    endDate: new Date("2025-07-04"),
    type: "term",
    school: "benenden"
  },
  {
    id: "ben-summer-half-2025",
    name: "Summer Half Term",
    startDate: new Date("2025-05-24"),
    endDate: new Date("2025-06-01"),
    type: "half-term",
    school: "benenden"
  },
  {
    id: "ben-summer-holiday-2025",
    name: "Summer Holiday",
    startDate: new Date("2025-07-05"),
    endDate: new Date("2025-09-01"),
    type: "holiday",
    school: "benenden"
  },

  // Wycombe Abbey School Terms 2024-2025
  {
    id: "wyc-autumn-2024",
    name: "Autumn Term",
    startDate: new Date("2024-09-08"),
    endDate: new Date("2024-12-17"),
    type: "term",
    school: "wycombe"
  },
  {
    id: "wyc-autumn-half-2024",
    name: "Autumn Half Term",
    startDate: new Date("2024-10-21"),
    endDate: new Date("2024-11-05"),
    type: "half-term",
    school: "wycombe"
  },
  {
    id: "wyc-christmas-2024",
    name: "Christmas Holiday",
    startDate: new Date("2024-12-18"),
    endDate: new Date("2025-01-15"),
    type: "holiday",
    school: "wycombe"
  },
  {
    id: "wyc-spring-2025",
    name: "Spring Term",
    startDate: new Date("2025-01-16"),
    endDate: new Date("2025-04-08"),
    type: "term",
    school: "wycombe"
  },
  {
    id: "wyc-spring-half-2025",
    name: "Spring Half Term",
    startDate: new Date("2025-02-17"),
    endDate: new Date("2025-02-25"),
    type: "half-term",
    school: "wycombe"
  },
  {
    id: "wyc-easter-2025",
    name: "Easter Holiday",
    startDate: new Date("2025-04-09"),
    endDate: new Date("2025-05-02"),
    type: "holiday",
    school: "wycombe"
  },
  {
    id: "wyc-summer-2025",
    name: "Summer Term",
    startDate: new Date("2025-05-03"),
    endDate: new Date("2025-07-08"),
    type: "term",
    school: "wycombe"
  },
  {
    id: "wyc-summer-half-2025",
    name: "Summer Half Term",
    startDate: new Date("2025-05-26"),
    endDate: new Date("2025-06-03"),
    type: "half-term",
    school: "wycombe"
  },
  {
    id: "wyc-summer-holiday-2025",
    name: "Summer Holiday",
    startDate: new Date("2025-07-09"),
    endDate: new Date("2025-09-03"),
    type: "holiday",
    school: "wycombe"
  }
];