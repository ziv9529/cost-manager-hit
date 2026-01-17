/*
 * Costs Service Tests
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

  // Close database connection after all tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test POST /api/add endpoint for creating cost items
  describe("POST /api/add", () => {
    // Test successful cost creation with required fields
    test("should create a new cost successfully", async () => {
      const uniqueId = Date.now();

      // Create test user first (required for adding costs)
      await User.create({
        id: uniqueId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      // Prepare cost data with required fields
      const costData = {
        userid: uniqueId,
        description: "test_lunch",
        category: "food",
        sum: 25.5,
      };

      // Send POST request to create cost
      const response = await request(app).post("/api/add").send(costData);

      // Verify response is successful and contains correct data
      expect(response.status).toBe(200);
      expect(response.body.userid).toBe(uniqueId);
      expect(response.body.description).toBe("test_lunch");
      expect(response.body.sum).toBe(25.5);

      // Clean up created cost and user
      await Cost.deleteOne({ userid: uniqueId, description: "test_lunch" });
      await User.deleteOne({ id: uniqueId });
    });

    // Test that missing required fields returns error
    test("should reject cost with missing required fields", async () => {
      const uniqueId = Date.now() + 1;

      // Create test user
      await User.create({
        id: uniqueId,
        first_name: "Jane",
        last_name: "Smith",
        birthday: new Date("1995-03-20"),
      });

      // Prepare incomplete cost data
      const costData = {
        userid: uniqueId,
        description: "test_lunch",
        // Missing category and sum
      };

      // Send POST request with incomplete data
      const response = await request(app).post("/api/add").send(costData);

      // Verify error response for missing parameters
      expect(response.status).toBe(400);

      // Clean up created user (cost shouldn't be created)
      await User.deleteOne({ id: uniqueId });
    });
  });

  // Test GET /api/report endpoint for monthly cost reports
  describe("GET /api/report", () => {
    // Test monthly report generation for current month
    test("should return monthly report for current month", async () => {
      const uniqueId = Date.now() + 2;

      // Create test user
      await User.create({
        id: uniqueId,
        first_name: "Bob",
        last_name: "Johnson",
        birthday: new Date("1992-07-10"),
      });

      // Create costs for current month
      const today = new Date();
      await Cost.create({
        userid: uniqueId,
        description: "test_lunch",
        category: "food",
        sum: 25.5,
        date: new Date(today.getFullYear(), today.getMonth(), 15),
      });

      // Send GET request with query parameters
      const response = await request(app).get(
        `/api/report?id=${uniqueId}&year=${today.getFullYear()}&month=${
          today.getMonth() + 1
        }`,
      );

      // Verify report is returned successfully
      expect(response.status).toBe(200);
      expect(response.body.userid).toBe(uniqueId);

      // Clean up created cost and user
      await Cost.deleteOne({ userid: uniqueId, description: "test_lunch" });
      await User.deleteOne({ id: uniqueId });
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
