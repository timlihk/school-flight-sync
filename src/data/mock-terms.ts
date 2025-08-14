import { Term } from '@/types/school';

export const mockTerms: Term[] = [
  // BENENDEN SCHOOL TERMS 2025-2027
  // Autumn Term 2025
  {
    id: 'ben-autumn-2025',
    school: 'benenden',
    name: 'Autumn Term',
    type: 'term',
    startDate: new Date('2025-09-02'),
    endDate: new Date('2025-12-10'),
    academicYear: '2025-2026',
    description: 'Full autumn term',
    scheduleDetails: [
      { date: '2025-09-01', time: '8:30am', event: 'Staff Training' },
      { date: '2025-09-02', time: '8:30am', event: 'Staff training' },
      { date: '2025-09-02', time: '11:00am', event: 'Grey Jumpers return to School' },
      { date: '2025-09-02', time: '12:00pm', event: 'Fourth and new Upper Fourth boarders arrive' },
      { date: '2025-09-02', time: '3:00pm', event: 'Current Upper Fourth, Lower Fifth, Fifth and Upper Fifth boarders return' },
      { date: '2025-09-03', time: '8:00am', event: 'Current Day students return to School' },
    ]
  },
  {
    id: 'ben-autumn-exeat-2025',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2025-09-26'),
    endDate: new Date('2025-09-28'),
    academicYear: '2025-2026',
    description: 'Fixed exeat weekend',
    scheduleDetails: [
      { date: '2025-09-26', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2025-09-28', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-autumn-half-2025',
    school: 'benenden',
    name: 'Half Term',
    type: 'half-term',
    startDate: new Date('2025-10-17'),
    endDate: new Date('2025-11-02'),
    academicYear: '2025-2026',
    description: 'Autumn half term break',
    scheduleDetails: [
      { date: '2025-10-17', time: '12:30pm', event: 'Half Term begins' },
      { date: '2025-11-02', time: '7:30pm', event: 'Half Term ends' },
    ]
  },
  {
    id: 'ben-nov-exeat-2025',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2025-11-21'),
    endDate: new Date('2025-11-23'),
    academicYear: '2025-2026',
    description: 'November fixed exeat',
    scheduleDetails: [
      { date: '2025-11-21', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2025-11-23', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-christmas-2025',
    school: 'benenden',
    name: 'Christmas Holiday',
    type: 'holiday',
    startDate: new Date('2025-12-10'),
    endDate: new Date('2026-01-05'),
    academicYear: '2025-2026',
    description: 'Christmas holiday break',
    scheduleDetails: [
      { date: '2025-12-10', time: '1:00pm', event: 'Term ends' },
    ]
  },

  // Spring Term 2026
  {
    id: 'ben-spring-2026',
    school: 'benenden',
    name: 'Spring Term',
    type: 'term',
    startDate: new Date('2026-01-05'),
    endDate: new Date('2026-03-27'),
    academicYear: '2025-2026',
    description: 'Full spring term',
    scheduleDetails: [
      { date: '2026-01-05', time: '8:30am', event: 'Staff training' },
      { date: '2026-01-05', time: '4:00pm', event: 'Term begins, boarders return' },
      { date: '2026-01-06', time: '8:00am', event: 'Day students return to School' },
    ]
  },
  {
    id: 'ben-jan-exeat-2026',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2026-01-23'),
    endDate: new Date('2026-01-25'),
    academicYear: '2025-2026',
    description: 'January fixed exeat',
    scheduleDetails: [
      { date: '2026-01-23', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2026-01-25', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-spring-half-2026',
    school: 'benenden',
    name: 'Half Term',
    type: 'half-term',
    startDate: new Date('2026-02-13'),
    endDate: new Date('2026-02-22'),
    academicYear: '2025-2026',
    description: 'Spring half term break',
    scheduleDetails: [
      { date: '2026-02-13', time: '12:30pm', event: 'Half Term begins' },
      { date: '2026-02-22', time: '7:30pm', event: 'Half Term ends' },
    ]
  },
  {
    id: 'ben-mar-exeat-2026',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2026-03-13'),
    endDate: new Date('2026-03-15'),
    academicYear: '2025-2026',
    description: 'March fixed exeat',
    scheduleDetails: [
      { date: '2026-03-13', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2026-03-15', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-easter-2026',
    school: 'benenden',
    name: 'Easter Holiday',
    type: 'holiday',
    startDate: new Date('2026-03-27'),
    endDate: new Date('2026-04-19'),
    academicYear: '2025-2026',
    description: 'Easter holiday break',
    scheduleDetails: [
      { date: '2026-03-27', time: '12:30pm', event: 'Term ends' },
    ]
  },

  // Summer Term 2026
  {
    id: 'ben-summer-2026',
    school: 'benenden',
    name: 'Summer Term',
    type: 'term',
    startDate: new Date('2026-04-19'),
    endDate: new Date('2026-07-04'),
    academicYear: '2025-2026',
    description: 'Full summer term',
    scheduleDetails: [
      { date: '2026-04-19', time: '8:30am', event: 'Staff Training' },
      { date: '2026-04-19', time: '4:00pm', event: 'Term begins, boarders return' },
      { date: '2026-04-20', time: '8:00am', event: 'Day students return to School' },
    ]
  },
  {
    id: 'ben-may-exeat-2026',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-05-04'),
    academicYear: '2025-2026',
    description: 'May fixed exeat',
    scheduleDetails: [
      { date: '2026-05-01', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2026-05-04', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-summer-half-2026',
    school: 'benenden',
    name: 'Half Term',
    type: 'half-term',
    startDate: new Date('2026-05-22'),
    endDate: new Date('2026-05-31'),
    academicYear: '2025-2026',
    description: 'Summer half term break',
    scheduleDetails: [
      { date: '2026-05-22', time: '12:30pm', event: 'Half Term begins' },
      { date: '2026-05-31', time: '7:30pm', event: 'Half Term ends' },
    ]
  },
  {
    id: 'ben-jun-exeat-2026',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2026-06-19'),
    endDate: new Date('2026-06-21'),
    academicYear: '2025-2026',
    description: 'June fixed exeat',
    scheduleDetails: [
      { date: '2026-06-19', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2026-06-21', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-summer-holiday-2026',
    school: 'benenden',
    name: 'Summer Holiday',
    type: 'holiday',
    startDate: new Date('2026-07-04'),
    endDate: new Date('2026-09-02'),
    academicYear: '2025-2026',
    description: 'Summer holiday break',
    scheduleDetails: [
      { date: '2026-07-04', time: '', event: 'Term ends (after Speech Day)' },
    ]
  },

  // BENENDEN SCHOOL TERMS 2026-2027
  // Autumn Term 2026
  {
    id: 'ben-autumn-2026',
    school: 'benenden',
    name: 'Autumn Term',
    type: 'term',
    startDate: new Date('2026-09-02'),
    endDate: new Date('2026-12-10'),
    academicYear: '2026-2027',
    description: 'Full autumn term 2026',
    scheduleDetails: [
      { date: '2026-09-01', time: '8:30am', event: 'Staff Training' },
      { date: '2026-09-02', time: '8:30am', event: 'Staff Training' },
      { date: '2026-09-02', time: 'TBC', event: 'Term begins, boarders return' },
      { date: '2026-09-03', time: '8:00am', event: 'Day students return to School' },
    ]
  },
  {
    id: 'ben-autumn-exeat-2026',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2026-09-25'),
    endDate: new Date('2026-09-27'),
    academicYear: '2026-2027',
    description: 'Fixed exeat weekend',
    scheduleDetails: [
      { date: '2026-09-25', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2026-09-27', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-autumn-half-2026',
    school: 'benenden',
    name: 'Half Term',
    type: 'half-term',
    startDate: new Date('2026-10-16'),
    endDate: new Date('2026-11-01'),
    academicYear: '2026-2027',
    description: 'Autumn half term break',
    scheduleDetails: [
      { date: '2026-10-16', time: '12:30pm', event: 'Half Term begins' },
      { date: '2026-11-01', time: '7:30pm', event: 'Half Term ends' },
    ]
  },
  {
    id: 'ben-nov-exeat-2026',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2026-11-20'),
    endDate: new Date('2026-11-22'),
    academicYear: '2026-2027',
    description: 'November fixed exeat',
    scheduleDetails: [
      { date: '2026-11-20', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2026-11-22', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-christmas-2026',
    school: 'benenden',
    name: 'Christmas Holiday',
    type: 'holiday',
    startDate: new Date('2026-12-10'),
    endDate: new Date('2027-01-05'),
    academicYear: '2026-2027',
    description: 'Christmas holiday break',
    scheduleDetails: [
      { date: '2026-12-10', time: '1:00pm', event: 'Term ends' },
    ]
  },

  // Spring Term 2027
  {
    id: 'ben-spring-2027',
    school: 'benenden',
    name: 'Spring Term',
    type: 'term',
    startDate: new Date('2027-01-05'),
    endDate: new Date('2027-03-24'),
    academicYear: '2026-2027',
    description: 'Full spring term',
    scheduleDetails: [
      { date: '2027-01-04', time: '8:30am', event: 'Staff Training' },
      { date: '2027-01-05', time: '8:30am', event: 'Staff Training' },
      { date: '2027-01-05', time: '4:00pm', event: 'Term begins, boarders return' },
      { date: '2027-01-06', time: '8:00am', event: 'Day students return to School' },
    ]
  },
  {
    id: 'ben-jan-exeat-2027',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2027-01-22'),
    endDate: new Date('2027-01-24'),
    academicYear: '2026-2027',
    description: 'January fixed exeat',
    scheduleDetails: [
      { date: '2027-01-22', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2027-01-24', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-spring-half-2027',
    school: 'benenden',
    name: 'Half Term',
    type: 'half-term',
    startDate: new Date('2027-02-12'),
    endDate: new Date('2027-02-21'),
    academicYear: '2026-2027',
    description: 'Spring half term break',
    scheduleDetails: [
      { date: '2027-02-12', time: '12:30pm', event: 'Half Term begins' },
      { date: '2027-02-21', time: '7:30pm', event: 'Half Term ends' },
    ]
  },
  {
    id: 'ben-mar-exeat-2027',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2027-03-12'),
    endDate: new Date('2027-03-14'),
    academicYear: '2026-2027',
    description: 'March fixed exeat',
    scheduleDetails: [
      { date: '2027-03-12', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2027-03-14', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-easter-2027',
    school: 'benenden',
    name: 'Easter Holiday',
    type: 'holiday',
    startDate: new Date('2027-03-24'),
    endDate: new Date('2027-04-19'),
    academicYear: '2026-2027',
    description: 'Easter holiday break',
    scheduleDetails: [
      { date: '2027-03-24', time: '12:30pm', event: 'Term ends' },
    ]
  },

  // Summer Term 2027
  {
    id: 'ben-summer-2027',
    school: 'benenden',
    name: 'Summer Term',
    type: 'term',
    startDate: new Date('2027-04-19'),
    endDate: new Date('2027-07-03'),
    academicYear: '2026-2027',
    description: 'Full summer term',
    scheduleDetails: [
      { date: '2027-04-19', time: '8:30am', event: 'Staff Training' },
      { date: '2027-04-19', time: '4:00pm', event: 'Term begins, boarders return' },
      { date: '2027-04-20', time: '8:00am', event: 'Day students return to School' },
    ]
  },
  {
    id: 'ben-apr-exeat-2027',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2027-04-30'),
    endDate: new Date('2027-05-03'),
    academicYear: '2026-2027',
    description: 'April/May fixed exeat',
    scheduleDetails: [
      { date: '2027-04-30', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2027-05-03', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-summer-half-2027',
    school: 'benenden',
    name: 'Half Term',
    type: 'half-term',
    startDate: new Date('2027-05-28'),
    endDate: new Date('2027-06-06'),
    academicYear: '2026-2027',
    description: 'Summer half term break',
    scheduleDetails: [
      { date: '2027-05-28', time: '12:30pm', event: 'Half Term begins' },
      { date: '2027-06-06', time: '7:30pm', event: 'Half Term ends' },
    ]
  },
  {
    id: 'ben-jun-exeat-2027',
    school: 'benenden',
    name: 'Fixed Exeat',
    type: 'exeat',
    startDate: new Date('2027-06-18'),
    endDate: new Date('2027-06-20'),
    academicYear: '2026-2027',
    description: 'June fixed exeat',
    scheduleDetails: [
      { date: '2027-06-18', time: '12:30pm', event: 'Fixed Exeat begins' },
      { date: '2027-06-20', time: '7:30pm', event: 'Fixed Exeat ends' },
    ]
  },
  {
    id: 'ben-summer-holiday-2027',
    school: 'benenden',
    name: 'Summer Holiday',
    type: 'holiday',
    startDate: new Date('2027-07-03'),
    endDate: new Date('2027-09-01'),
    academicYear: '2026-2027',
    description: 'Summer holiday break',
    scheduleDetails: [
      { date: '2027-07-03', time: '', event: 'Term ends (after Speech Day)' },
    ]
  },

  // WYCOMBE ABBEY SCHOOL TERMS 2025-2027
  // Autumn Term 2025
  {
    id: 'wyc-autumn-2025',
    school: 'wycombe',
    name: 'Autumn Term',
    type: 'term',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-12-10'),
    academicYear: '2025-2026',
    description: 'Full autumn term',
    scheduleDetails: [
      { date: '2025-08-28', time: '', event: 'Staff INSET Days' },
      { date: '2025-08-29', time: '', event: 'Staff INSET Days' },
      { date: '2025-09-01', time: '', event: 'UVI, LVI, UIII, UV return' },
      { date: '2025-09-02', time: '', event: 'UIV, LV, LIV return' },
    ]
  },
  {
    id: 'wyc-autumn-short-2025',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2025-09-27'),
    endDate: new Date('2025-09-29'),
    academicYear: '2025-2026',
    description: 'September short leave',
    scheduleDetails: [
      { date: '2025-09-27', time: '', event: 'Short Leave begins' },
      { date: '2025-09-29', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-autumn-long-2025',
    school: 'wycombe',
    name: 'Long Leave',
    type: 'long-leave',
    startDate: new Date('2025-10-17'),
    endDate: new Date('2025-11-02'),
    academicYear: '2025-2026',
    description: 'Autumn long leave',
    scheduleDetails: [
      { date: '2025-10-17', time: '', event: 'Long Leave begins' },
      { date: '2025-11-02', time: '', event: 'Long Leave ends' },
    ]
  },
  {
    id: 'wyc-nov-short-2025',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2025-11-19'),
    endDate: new Date('2025-11-23'),
    academicYear: '2025-2026',
    description: 'November short leave',
    scheduleDetails: [
      { date: '2025-11-19', time: '', event: 'Short Leave begins' },
      { date: '2025-11-23', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-christmas-2025',
    school: 'wycombe',
    name: 'Christmas Holiday',
    type: 'holiday',
    startDate: new Date('2025-12-10'),
    endDate: new Date('2026-01-06'),
    academicYear: '2025-2026',
    description: 'Christmas holiday break',
    scheduleDetails: [
      { date: '2025-12-10', time: '', event: 'Term ends' },
    ]
  },

  // Spring Term 2026
  {
    id: 'wyc-spring-2026',
    school: 'wycombe',
    name: 'Spring Term',
    type: 'term',
    startDate: new Date('2026-01-06'),
    endDate: new Date('2026-03-26'),
    academicYear: '2025-2026',
    description: 'Full spring term',
    scheduleDetails: [
      { date: '2026-01-05', time: '', event: 'Staff INSET Days and Parent Teacher Meetings' },
      { date: '2026-01-06', time: '', event: 'Term Starts' },
    ]
  },
  {
    id: 'wyc-jan-short-2026',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2026-01-23'),
    endDate: new Date('2026-01-25'),
    academicYear: '2025-2026',
    description: 'January short leave',
    scheduleDetails: [
      { date: '2026-01-23', time: '', event: 'Short Leave begins' },
      { date: '2026-01-25', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-spring-long-2026',
    school: 'wycombe',
    name: 'Long Leave',
    type: 'long-leave',
    startDate: new Date('2026-02-13'),
    endDate: new Date('2026-02-22'),
    academicYear: '2025-2026',
    description: 'Spring long leave',
    scheduleDetails: [
      { date: '2026-02-13', time: '', event: 'Long Leave begins' },
      { date: '2026-02-22', time: '', event: 'Long Leave ends' },
    ]
  },
  {
    id: 'wyc-mar-short-2026',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2026-03-14'),
    endDate: new Date('2026-03-16'),
    academicYear: '2025-2026',
    description: 'March short leave',
    scheduleDetails: [
      { date: '2026-03-14', time: '', event: 'Short Leave begins' },
      { date: '2026-03-16', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-easter-2026',
    school: 'wycombe',
    name: 'Easter Holiday',
    type: 'holiday',
    startDate: new Date('2026-03-26'),
    endDate: new Date('2026-04-21'),
    academicYear: '2025-2026',
    description: 'Easter holiday break',
    scheduleDetails: [
      { date: '2026-03-26', time: '', event: 'Term ends' },
    ]
  },

  // Summer Term 2026
  {
    id: 'wyc-summer-2026',
    school: 'wycombe',
    name: 'Summer Term',
    type: 'term',
    startDate: new Date('2026-04-21'),
    endDate: new Date('2026-06-26'),
    academicYear: '2025-2026',
    description: 'Full summer term',
    scheduleDetails: [
      { date: '2026-04-20', time: '', event: 'Staff INSET Days and Parent Teacher Meetings' },
      { date: '2026-04-21', time: '', event: 'Term Starts' },
    ]
  },
  {
    id: 'wyc-may-short-2026',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-05-04'),
    academicYear: '2025-2026',
    description: 'May short leave',
    scheduleDetails: [
      { date: '2026-05-01', time: '', event: 'Short Leave begins' },
      { date: '2026-05-04', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-summer-long-2026',
    school: 'wycombe',
    name: 'Long Leave',
    type: 'long-leave',
    startDate: new Date('2026-05-22'),
    endDate: new Date('2026-05-31'),
    academicYear: '2025-2026',
    description: 'Summer long leave',
    scheduleDetails: [
      { date: '2026-05-22', time: '', event: 'Long Leave begins' },
      { date: '2026-05-31', time: '', event: 'Long Leave ends' },
    ]
  },
  {
    id: 'wyc-jun-short-2026',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2026-06-12'),
    endDate: new Date('2026-06-14'),
    academicYear: '2025-2026',
    description: 'June short leave',
    scheduleDetails: [
      { date: '2026-06-12', time: '', event: 'Short Leave begins' },
      { date: '2026-06-14', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-summer-holiday-2026',
    school: 'wycombe',
    name: 'Summer Holiday',
    type: 'holiday',
    startDate: new Date('2026-06-26'),
    endDate: new Date('2026-09-07'),
    academicYear: '2025-2026',
    description: 'Summer holiday break',
    scheduleDetails: [
      { date: '2026-06-26', time: '', event: 'Term ends' },
    ]
  },

  // WYCOMBE ABBEY SCHOOL TERMS 2026-2027
  // Autumn Term 2026
  {
    id: 'wyc-autumn-2026',
    school: 'wycombe',
    name: 'Autumn Term',
    type: 'term',
    startDate: new Date('2026-09-07'),
    endDate: new Date('2026-12-11'),
    academicYear: '2026-2027',
    description: 'Full autumn term 2026',
    scheduleDetails: [
      { date: '2026-09-03', time: '', event: 'Staff Development Days' },
      { date: '2026-09-04', time: '', event: 'Staff Development Days' },
      { date: '2026-09-07', time: '', event: 'Girls return' },
      { date: '2026-09-08', time: '', event: 'Girls return' },
    ]
  },
  {
    id: 'wyc-autumn-short-2026',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2026-09-26'),
    endDate: new Date('2026-09-28'),
    academicYear: '2026-2027',
    description: 'September short leave',
    scheduleDetails: [
      { date: '2026-09-26', time: '', event: 'Short Leave begins' },
      { date: '2026-09-28', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-autumn-long-2026',
    school: 'wycombe',
    name: 'Long Leave',
    type: 'long-leave',
    startDate: new Date('2026-10-16'),
    endDate: new Date('2026-11-01'),
    academicYear: '2026-2027',
    description: 'Autumn long leave',
    scheduleDetails: [
      { date: '2026-10-16', time: '', event: 'Long Leave begins' },
      { date: '2026-11-01', time: '', event: 'Long Leave ends' },
    ]
  },
  {
    id: 'wyc-nov-short-2026',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2026-11-18'),
    endDate: new Date('2026-11-22'),
    academicYear: '2026-2027',
    description: 'November short leave',
    scheduleDetails: [
      { date: '2026-11-18', time: '', event: 'Short Leave begins' },
      { date: '2026-11-22', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-christmas-2026',
    school: 'wycombe',
    name: 'Christmas Holiday',
    type: 'holiday',
    startDate: new Date('2026-12-11'),
    endDate: new Date('2027-01-05'),
    academicYear: '2026-2027',
    description: 'Christmas holiday break',
    scheduleDetails: [
      { date: '2026-12-11', time: '', event: 'Term ends' },
    ]
  },

  // Spring Term 2027
  {
    id: 'wyc-spring-2027',
    school: 'wycombe',
    name: 'Spring Term',
    type: 'term',
    startDate: new Date('2027-01-05'),
    endDate: new Date('2027-03-24'),
    academicYear: '2026-2027',
    description: 'Full spring term',
    scheduleDetails: [
      { date: '2027-01-04', time: '', event: 'Staff Development Days' },
      { date: '2027-01-05', time: '', event: 'Girls return' },
    ]
  },
  {
    id: 'wyc-jan-short-2027',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2027-01-29'),
    endDate: new Date('2027-01-31'),
    academicYear: '2026-2027',
    description: 'January short leave',
    scheduleDetails: [
      { date: '2027-01-29', time: '', event: 'Short Leave begins' },
      { date: '2027-01-31', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-spring-long-2027',
    school: 'wycombe',
    name: 'Long Leave',
    type: 'long-leave',
    startDate: new Date('2027-02-12'),
    endDate: new Date('2027-02-21'),
    academicYear: '2026-2027',
    description: 'Spring long leave',
    scheduleDetails: [
      { date: '2027-02-12', time: '', event: 'Long Leave begins' },
      { date: '2027-02-21', time: '', event: 'Long Leave ends' },
    ]
  },
  {
    id: 'wyc-mar-short-2027',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2027-03-13'),
    endDate: new Date('2027-03-15'),
    academicYear: '2026-2027',
    description: 'March short leave',
    scheduleDetails: [
      { date: '2027-03-13', time: '', event: 'Short Leave begins' },
      { date: '2027-03-15', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-easter-2027',
    school: 'wycombe',
    name: 'Easter Holiday',
    type: 'holiday',
    startDate: new Date('2027-03-24'),
    endDate: new Date('2027-04-20'),
    academicYear: '2026-2027',
    description: 'Easter holiday break',
    scheduleDetails: [
      { date: '2027-03-24', time: '', event: 'Term ends' },
    ]
  },

  // Summer Term 2027
  {
    id: 'wyc-summer-2027',
    school: 'wycombe',
    name: 'Summer Term',
    type: 'term',
    startDate: new Date('2027-04-20'),
    endDate: new Date('2027-07-02'),
    academicYear: '2026-2027',
    description: 'Full summer term',
    scheduleDetails: [
      { date: '2027-04-19', time: '', event: 'Staff Development Days' },
      { date: '2027-04-20', time: '', event: 'Girls return' },
    ]
  },
  {
    id: 'wyc-apr-short-2027',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2027-04-30'),
    endDate: new Date('2027-05-03'),
    academicYear: '2026-2027',
    description: 'April/May short leave',
    scheduleDetails: [
      { date: '2027-04-30', time: '', event: 'Short Leave begins' },
      { date: '2027-05-03', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-summer-long-2027',
    school: 'wycombe',
    name: 'Long Leave',
    type: 'long-leave',
    startDate: new Date('2027-05-28'),
    endDate: new Date('2027-06-06'),
    academicYear: '2026-2027',
    description: 'Summer long leave',
    scheduleDetails: [
      { date: '2027-05-28', time: '', event: 'Long Leave begins' },
      { date: '2027-06-06', time: '', event: 'Long Leave ends' },
    ]
  },
  {
    id: 'wyc-jun-short-2027',
    school: 'wycombe',
    name: 'Short Leave',
    type: 'short-leave',
    startDate: new Date('2027-06-18'),
    endDate: new Date('2027-06-20'),
    academicYear: '2026-2027',
    description: 'June short leave',
    scheduleDetails: [
      { date: '2027-06-18', time: '', event: 'Short Leave begins' },
      { date: '2027-06-20', time: '', event: 'Short Leave ends' },
    ]
  },
  {
    id: 'wyc-summer-holiday-2027',
    school: 'wycombe',
    name: 'Summer Holiday',
    type: 'holiday',
    startDate: new Date('2027-07-02'),
    endDate: new Date('2027-09-06'),
    academicYear: '2026-2027',
    description: 'Summer holiday break',
    scheduleDetails: [
      { date: '2027-07-02', time: '', event: 'Term ends' },
    ]
  },
];

// Helper function to get unique academic years
export const getAcademicYears = (): string[] => {
  const years = [...new Set(mockTerms.map(term => term.academicYear))];
  return years.sort();
};