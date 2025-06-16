use tollgate_db;

// Clear existing collections to avoid duplicates
db.admins.drop();
db.drivers.drop();
db.tollgates.drop();

// 1. Populate Admins Collection
db.admins.insertMany([
  { name: "admin1", password: "adminpass123" },
  { name: "admin2", password: "adminpass456" }
]);

// 2. Populate Tollgates Collection (Tamil Nadu tollgates with realistic fares)
db.tollgates.insertMany([
  { tollgate: "Vanagaram", fare: 60 },
  { tollgate: "Rasampalayan", fare: 55 },
  { tollgate: "Boothakudi", fare: 65 },
  { tollgate: "Akkarai", fare: 36 },
  { tollgate: "Mahabalipuram", fare: 52 },
  { tollgate: "Vandiyur", fare: 50 },
  { tollgate: "Chinthamani", fare: 50 },
  { tollgate: "Valayankulam", fare: 50 },
  { tollgate: "Paranur", fare: 45 },
  { tollgate: "Nemili", fare: 70 }
]);

// 3. Populate Drivers Collection (with embedded vehicles and payments)
db.drivers.insertMany([
  {
    name: "driver1",
    password: "driverpass123",
    vehicles: ["TN01AB1234", "TN02CD5678"],
    payments: [
      { tollgate: "Vanagaram", fare: 60, timestamp: new Date("2025-06-15T10:00:00Z") },
      { tollgate: "Akkarai", fare: 36, timestamp: new Date("2025-06-15T12:00:00Z") }
    ]
  },
  {
    name: "driver2",
    password: "driverpass456",
    vehicles: ["TN03EF9012"],
    payments: [
      { tollgate: "Boothakudi", fare: 65, timestamp: new Date("2025-06-14T09:00:00Z") },
      { tollgate: "Vandiyur", fare: 50, timestamp: new Date("2025-06-14T11:00:00Z") }
    ]
  },
  {
    name: "driver3",
    password: "driverpass789",
    vehicles: ["TN04GH3456"],
    payments: []
  }
]);

print("Database tollgateManagement seeded successfully!");


