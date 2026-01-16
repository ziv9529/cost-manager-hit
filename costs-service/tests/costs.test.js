/*
 * Costs Service Tests - Minimal test suite
 * Tests the core endpoints: POST /api/add and GET /api/report
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../app");
const Cost = require("../models/cost");
const User = require("../models/user");

// Main test suite for Costs Service API
describe("Costs Service API", () => {
  // Connect to test database before running tests
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI);
  });

  // Clean database after each test
  afterEach(async () => {
    await Cost.deleteMany({});
    await User.deleteMany({});
  });

  // Close database connection after all tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test POST /api/add endpoint for creating cost items
  describe("POST /api/add", () => {
    // Test successful cost creation with required fields
    test("should create a new cost successfully", async () => {
      // Create test user first (required for adding costs)
      await User.create({
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      // Prepare cost data with required fields
      const costData = {
        userid: 1,
        description: "lunch",
        category: "food",
        sum: 25.5,
      };

      // Send POST request to create cost
      const response = await request(app).post("/api/add").send(costData);

      // Verify response is successful and contains correct data
      expect(response.status).toBe(200);
      expect(response.body.userid).toBe(1);
      expect(response.body.description).toBe("lunch");
      expect(response.body.sum).toBe(25.5);
    });

    // Test that missing required fields returns error
    test("should reject cost with missing required fields", async () => {
      // Create test user
      await User.create({
        id: 2,
        first_name: "Jane",
        last_name: "Smith",
        birthday: new Date("1995-03-20"),
      });

      // Prepare incomplete cost data
      const costData = {
        userid: 2,
        description: "lunch",
        // Missing category and sum
      };

      // Send POST request with incomplete data
      const response = await request(app).post("/api/add").send(costData);

      // Verify error response for missing parameters
      expect(response.status).toBe(400);
    });
  });

  // Test GET /api/report endpoint for monthly cost reports
  describe("GET /api/report", () => {
    // Test monthly report generation for current month
    test("should return monthly report for current month", async () => {
      // Create test user
      await User.create({
        id: 3,
        first_name: "Bob",
        last_name: "Johnson",
        birthday: new Date("1992-07-10"),
      });

      // Create costs for current month
      const today = new Date();
      await Cost.create({
        userid: 3,
        description: "lunch",
        category: "food",
        sum: 25.5,
        date: new Date(today.getFullYear(), today.getMonth(), 15),
      });

      // Send GET request with query parameters
      const response = await request(app).get(
        `/api/report?id=3&year=${today.getFullYear()}&month=${
          today.getMonth() + 1
        }`
      );

      // Verify report is returned successfully
      expect(response.status).toBe(200);
      expect(response.body.userid).toBe(3);
    });

    // Test report request with missing parameters
    test("should return 400 when missing required parameters", async () => {
      // Send GET request with incomplete parameters
      const response = await request(app).get("/api/report?id=1");

      // Verify error response for missing parameters
      expect(response.status).toBe(400);
    });
  });
});
