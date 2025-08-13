export const fakeShelves = [
  { name: "Energy Drink Shelf", osa: [80, 85, 90, 70, 60, 75, 80, 90], shortage: 17.5, operating: 4, shortageHour: 0.7 },
  { name: "Fresh Produce Shelf 1", osa: [90, 92, 95, 88, 85, 90, 93, 95], shortage: 10, operating: 4, shortageHour: 0.4 },
  { name: "Medicine Shelf 1", osa: [85, 80, 82, 78, 75, 80, 85, 88], shortage: 12.5, operating: 4, shortageHour: 0.5 },
];

export const fakeSummary = {
  avgShortage: 25.3,
  onTimeRecovery: 61.2,
  onTimeTarget: 61,
};

export const fakeShortageByShelf = [
  { shelf: "Beverages", hours: 120, rate: 25 },
  { shelf: "Fresh food", hours: 80, rate: 18 },
  { shelf: "Household", hours: 60, rate: 15 },
  { shelf: "Packaged Food", hours: 40, rate: 12 },
  { shelf: "Personal care", hours: 30, rate: 10 },
];

export const fakeRecoveryByShelf = [
  { shelf: "Beverages", count: 80, rate: 60 },
  { shelf: "Fresh food", count: 60, rate: 62 },
  { shelf: "Household", count: 40, rate: 61 },
  { shelf: "Packaged Food", count: 30, rate: 59 },
  { shelf: "Personal care", count: 20, rate: 58 },
];

export const fakeCustomerVisit = {
  labels: ["10-19", "20-29", "30-39", "40-49"],
  datasets: [
    { label: "Nữ", data: [5000, 8000, 6000, 3900], backgroundColor: "#ff85c0" },
    { label: "Nam", data: [4000, 7000, 5000, 3000], backgroundColor: "#5cdbd3" },
    { label: "Khác", data: [200, 300, 100, 50], backgroundColor: "#d3adf7" },
  ],
};