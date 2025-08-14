// Parse term details from scraped school website data
const benendenData = `
Monday 1 September | 8.30am | Staff Training
Tuesday 2 September | 8.30am | Staff training
Tuesday 2 September | 11.00am | Grey Jumpers return to School
Tuesday 2 September | 12.00pm | Fourth and new Upper Fourth boarders and day students arrive at School
Tuesday 2 September | 12.00pm | Six One boarders return to School*
Tuesday 2 September | 3.00pm | Current Upper Fourth, Lower Fifth, Fifth and Upper Fifth boarders return to School*
Tuesday 2 September | 4.00pm | New Lower Fifth and Fifth boarders and day students arrive at School
Tuesday 2 September | 5.45pm | Six Two boarders return to School*
Wednesday 3 September | 8.00am | Current Day students return to School
Saturday 6 and Sunday 7 September |  | Closed Weekend
Friday 26 September | 12.30pm | Fixed Exeat begins
Sunday 28 September | 7.30pm | Fixed Exeat ends – Houses reopen from 6.00pm when staff are back on duty
Friday 17 October | 12.30pm | Half Term begins
Sunday 2 November | 7.30pm | Half Term ends
Friday 21 November | 12.30pm | Fixed Exeat begins
Sunday 23 November | 7.30pm | Fixed Exeat ends – Houses reopen from 6.00pm when staff are back on duty
Saturday 6 and Sunday 7 December |  | Closed Weekend
Wednesday 10 December | 1.00pm | Term ends
`;

const wycombeData = `
Thursday 28 August – Friday 29 August |  | Staff INSET Days
Monday 1 September |  | Term Starts: UVI, LVI, UIII, UV
Tuesday 2 September |  | Term Starts: UIV, LV, LIV
Saturday 6 September- Sunday 7 September |  | Closed Weekend
Saturday 27 September – Monday 29 September |  | Short Leave
Friday 17 October – Sunday 2 November |  | Long Leave
Wednesday 19 November – Sunday 23 November |  | Short Leave
Saturday 6 December – Sunday 7 December |  | Closed Weekend
Wednesday 10 December |  | Term ends
`;

function parseTermData(data: string) {
  return data.trim().split('\n').filter(line => line.trim()).map(line => {
    const parts = line.split(' | ');
    return {
      date: parts[0]?.trim() || '',
      time: parts[1]?.trim() || '',
      event: parts[2]?.trim() || ''
    };
  });
}

export const termDetails = {
  benenden: {
    "autumn-2025": parseTermData(benendenData),
    "spring-2026": [
      { date: "Monday 5 January", time: "8.30am", event: "Staff training" },
      { date: "Monday 5 January", time: "from 4.00pm", event: "Term begins, boarders return to School" },
      { date: "Tuesday 6 January", time: "8.00am", event: "Day students return to School" },
      { date: "Saturday 10 and Sunday 11 January", time: "", event: "Closed Weekend" },
      { date: "Friday 23 January", time: "12.30pm", event: "Fixed Exeat begins" },
      { date: "Sunday 25 January", time: "7.30pm", event: "Fixed Exeat Ends – Houses reopen from 6.00pm when staff are back on duty" },
      { date: "Friday 13 February", time: "12.30pm", event: "Half Term begins" },
      { date: "Sunday 22 February", time: "7.30pm", event: "Half Term ends" },
      { date: "Friday 13 March", time: "12.30pm", event: "Fixed Exeat begins" },
      { date: "Sunday 15 March", time: "7.30pm", event: "Fixed Exeat ends – Houses reopen from 6.00pm when staff are back on duty" },
      { date: "Saturday 21 and Sunday 22 March", time: "", event: "Closed Weekend" },
      { date: "Friday 27 March", time: "12.30pm", event: "Term ends" }
    ],
    "summer-2026": [
      { date: "Sunday 5 April", time: "", event: "Easter Sunday" },
      { date: "Monday 20 April", time: "8.30am", event: "Staff Training" },
      { date: "Monday 20 April", time: "from 4.00pm", event: "Term begins, boarders return to School" },
      { date: "Tuesday 21 April", time: "8.00am", event: "Day students return to School" },
      { date: "Saturday 25 and Sunday 26 April", time: "", event: "Closed Weekend" },
      { date: "Friday 1 May", time: "12.30pm", event: "Fixed Exeat begins" },
      { date: "Monday 4 May", time: "7.30pm", event: "Fixed Exeat ends – Houses reopen from 6.00pm when staff are back on duty" },
      { date: "Friday 22 May", time: "12.30pm", event: "Half Term begins" },
      { date: "Sunday 31 May", time: "7.30pm", event: "Half Term ends" },
      { date: "Friday 19 June", time: "12.30pm", event: "Fixed Exeat Begins" },
      { date: "Sunday 21 June", time: "7.30pm", event: "Fixed Exeat ends – Houses reopen from 6.00pm when staff are back on duty" },
      { date: "Saturday 27 and Sunday 28 June", time: "", event: "Closed Weekend" },
      { date: "Saturday 4 July", time: "", event: "Term ends (after Speech Day)" }
    ]
  },
  wycombe: {
    "autumn-2025": parseTermData(wycombeData),
    "spring-2026": [
      { date: "Monday 5 January – Tuesday 6 January", time: "", event: "Staff INSET Days and Parent Teacher Meetings" },
      { date: "Tuesday 6 January", time: "", event: "Term Starts" },
      { date: "Saturday 10 January – Sunday 11 January", time: "", event: "Closed Weekend" },
      { date: "Friday 23 January – Sunday 25 January", time: "", event: "Short Leave" },
      { date: "Friday 13 February – Sunday 22 February", time: "", event: "Long Leave" },
      { date: "Saturday 14 March – Monday 16 March", time: "", event: "Short Leave" },
      { date: "Saturday 21 March – Sunday 22 March", time: "", event: "Closed Weekend" },
      { date: "Thursday 26 March", time: "", event: "Term ends" }
    ],
    "summer-2026": [
      { date: "Monday 20 April – Tuesday 21 April", time: "", event: "Staff INSET Days and Parent Teacher Meetings" },
      { date: "Tuesday 21 April", time: "", event: "Term Starts" },
      { date: "Saturday 25 April – Sunday 26 April", time: "", event: "Closed Weekend" },
      { date: "Friday 1 May – Monday 4 May", time: "", event: "Short Leave (starts for UVI after the Clarence Leavers' Ceremony on Friday 1 May)" },
      { date: "Friday 22 May – Sunday 31 May", time: "", event: "Long Leave" },
      { date: "Friday 12 June – Sunday 14 June", time: "", event: "Short Leave" },
      { date: "Saturday 20 June and Sunday 21 June", time: "", event: "Closed Weekend" },
      { date: "Friday 26 June", time: "", event: "Term ends" }
    ]
  }
};

export function getTermDetailsKey(termName: string): string {
  const lowerName = termName.toLowerCase();
  if (lowerName.includes("autumn") && lowerName.includes("2025")) return "autumn-2025";
  if (lowerName.includes("spring") && lowerName.includes("2026")) return "spring-2026";
  if (lowerName.includes("summer") && lowerName.includes("2026")) return "summer-2026";
  return "";
}