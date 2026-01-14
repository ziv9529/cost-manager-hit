/*
 * Costs Service Tests
 * This module performs testing on the Costs Service API endpoints.
 * It validates cost creation, user validation, and the monthly report
 * generation logic
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../app");
const Cost = require("../models/cost");
const User = require("../models/user");
const Report = require("../models/report");

/*
 * Test Suite Configuration
 * Manages database connection setup and ensures a clean state
 * between individual test cases by clearing collections.
 */
describe("Costs Service API", () => {
  // Counter for unique test IDs
  let testIdCounter = 1;

  beforeAll(async () => {
    // Connect to test database
    await connectDB(process.env.MONGODB_URI);
  });

  beforeEach(async () => {
    // Clean up before each test to ensure fresh state
    await Cost.deleteMany({});
    await User.deleteMany({});
    await Report.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each individual test
    await Cost.deleteMany({});
    await User.deleteMany({});
    await Report.deleteMany({});
    // Small delay to ensure cleanup completes
    await new Promise((resolve) => setTimeout(resolve, 200));
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

 /*
  * POST /api/add Tests
  * Verifies the creation of new cost items, input validation,
  * security against unwanted fields, and logic constraints.
  */
  describe("POST /api/add", () => {
    // Test successful cost creation
    test("should create a new cost successfully", async () => {
      const userId = testIdCounter++;
      // Create a user first and ensure it's saved
      const user = await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      // Verify user was created
      expect(user.id).toBe(userId);

      const costData = {
        userid: userId,
        description: "lunch",
        category: "food",
        sum: 25.5,
      };

      // Execute the POST request to create a cost
      const response = await request(app).post("/api/add").send(costData);

      // Verify response status and data integrity
      expect(response.status).toBe(200);
      expect(response.body.userid).toBe(userId);
      expect(response.body.description).toBe("lunch");
      expect(response.body.category).toBe("food");
      expect(response.body.sum).toBe(25.5);
    });

    // Test missing required fields
    test("should return 400 when missing required fields", async () => {
      const costData = {
        userid: 1,
        description: "lunch",
        // missing category and sum fields
      };

      const response = await request(app).post("/api/add").send(costData);

      // Expect a Bad Request status due to validation failure
      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Missing some required parameters"
      );
    });

    // Test invalid category
    test("should reject invalid category", async () => {
      const userId = testIdCounter++;
      // Create a user first
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      const costData = {
        userid: userId,
        description: "lunch",
        category: "invalid",
        sum: 25.5,
      };

      const response = await request(app).post("/api/add").send(costData);

      // Verify that enum validation in the schema is working
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("invalid category invalid");
    });

    // Test with extra/malicious fields
    test("should ignore extra/unwanted fields in request", async () => {
      const userId = testIdCounter++;
      // Create a user first
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      const costData = {
        userid: userId,
        description: "lunch",
        category: "food",
        sum: 25.5,
        maliciousKey: "rm -rf /",
        anotherWeirdField: "hack attempt",
        randomField: "should be ignored",
      };

      const response = await request(app).post("/api/add").send(costData);

      expect(response.status).toBe(200);
      // Verify extra fields were not stored
      expect(response.body).not.toHaveProperty("maliciousKey");
      expect(response.body).not.toHaveProperty("anotherWeirdField");
      expect(response.body).not.toHaveProperty("randomField");
      // Verify only expected fields exist
      expect(response.body.userid).toBe(userId);
      expect(response.body.description).toBe("lunch");
    });

    // Test with only half of required parameters
    test("should reject when only userid and description provided", async () => {
      const costData = {
        userid: 1,
        description: "lunch",
        // missing category and sum
      };

      const response = await request(app).post("/api/add").send(costData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Missing some required parameters"
      );
    });

    // Test with empty string values
    test("should reject with empty string description", async () => {
      const userId = testIdCounter++;
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      const costData = {
        userid: userId,
        description: "",
        category: "food",
        sum: 25.5,
      };

      const response = await request(app).post("/api/add").send(costData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Missing some required parameters"
      );
    });

    // Test with null values
    test("should reject with null sum", async () => {
      const userId = testIdCounter++;
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      const costData = {
        userid: userId,
        description: "lunch",
        category: "food",
        sum: null,
      };

      const response = await request(app).post("/api/add").send(costData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Missing some required parameters"
      );
    });

    // Test with zero sum (falsy value, should be rejected)
    test("should reject cost with zero sum (falsy value)", async () => {
      const userId = testIdCounter++;
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      const costData = {
        userid: userId,
        description: "free item",
        category: "food",
        sum: 0,
      };

      const response = await request(app).post("/api/add").send(costData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Missing some required parameters"
      );
    });

    // Test with very large sum
    test("should accept cost with large sum value", async () => {
      const userId = testIdCounter++;
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      const costData = {
        userid: userId,
        description: "expensive item",
        category: "housing",
        sum: 999999.99,
      };

      const response = await request(app).post("/api/add").send(costData);

      expect(response.status).toBe(200);
      expect(response.body.sum).toBe(999999.99);
    });

    // Test with string userid instead of number
    test("should handle string userid gracefully", async () => {
      const costData = {
        userid: "notanumber",
        description: "lunch",
        category: "food",
        sum: 25.5,
      };

      const response = await request(app).post("/api/add").send(costData);

      // Should fail because user won't be found
      expect(response.status).toBe(500);
    });

    // Test non-existent user
    test("should reject cost for non-existent user", async () => {
      const costData = {
        userid: 999,
        description: "lunch",
        category: "food",
        sum: 25.5,
      };

      const response = await request(app).post("/api/add").send(costData);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("User not found");
    });

    // Test past date rejection
    test("should reject past month dates", async () => {
      const userId = testIdCounter++;
      // Create a user first
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      const costData = {
        userid: userId,
        description: "lunch",
        category: "food",
        sum: 25.5,
        date: pastDate.toISOString().split("T")[0],
      };

      const response = await request(app).post("/api/add").send(costData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Can't add cost with a past date"
      );
    });
  });

  describe("GET /api/report", () => {
    // Test monthly report generation
    test("should return monthly report for current month", async () => {
      const userId = testIdCounter++;
      // Create a user
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      // Create costs for current month
      const today = new Date();
      await Cost.create({
        userid: userId,
        description: "lunch",
        category: "food",
        sum: 25.5,
        date: new Date(today.getFullYear(), today.getMonth(), 15),
      });
      await Cost.create({
        userid: userId,
        description: "book",
        category: "education",
        sum: 50,
        date: new Date(today.getFullYear(), today.getMonth(), 20),
      });

      const response = await request(app).get(
        `/api/report?id=${userId}&year=${today.getFullYear()}&month=${
          today.getMonth() + 1
        }`
      );

      expect(response.status).toBe(200);
      expect(response.body.userid).toBe(userId);
      expect(response.body.costs).toBeDefined();
      expect(response.body.costs.length).toBeGreaterThan(0);
    });

    // Test missing parameters
    test("should return 400 when missing parameters", async () => {
      const response = await request(app).get("/api/report?id=1");

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Missing required parameters");
    });

    // Test invalid month
    test("should return 400 for invalid month", async () => {
      const response = await request(app).get(
        "/api/report?id=1&year=2026&month=13"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Month must be between 1 and 12");
    });

    // Test past month report caching (Computed Design Pattern)
    test("should cache and reuse past month reports", async () => {
      const userId = testIdCounter++;
      // Create a user
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      // Add a cost from last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const costDate = lastMonth.toISOString().split("T")[0];

      await Cost.create({
        userid: userId,
        description: "groceries",
        category: "food",
        sum: 50.0,
        date: new Date(costDate),
      });

      // Request report for past month (should compute and cache)
      const year = lastMonth.getFullYear();
      const month = lastMonth.getMonth() + 1;

      const response1 = await request(app).get(
        `/api/report?id=${userId}&year=${year}&month=${month}`
      );

      expect(response1.status).toBe(200);
      expect(response1.body.costs).toBeDefined();
      expect(response1.body.costs.length).toBeGreaterThan(0);

      // Request same report again (should use cache)
      const response2 = await request(app).get(
        `/api/report?id=${userId}&year=${year}&month=${month}`
      );

      expect(response2.status).toBe(200);
      // Both requests should return same data (from cache)
      expect(JSON.stringify(response1.body)).toBe(
        JSON.stringify(response2.body)
      );
    });

    // Test that current month reports are computed fresh (not cached)
    test("should compute current month reports in real-time (no caching)", async () => {
      const userId = testIdCounter++;
      // Create a user
      await User.create({
        id: userId,
        first_name: "Jane",
        last_name: "Smith",
        birthday: new Date("1995-03-20"),
      });

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // First request for current month
      const response1 = await request(app).get(
        `/api/report?id=${userId}&year=${year}&month=${month}`
      );

      expect(response1.status).toBe(200);
      expect(response1.body.costs).toBeDefined();

      // Add a cost for current month
      await Cost.create({
        userid: userId,
        description: "lunch",
        category: "food",
        sum: 15.0,
        date: now,
      });

      // Second request for current month should also succeed
      const response2 = await request(app).get(
        `/api/report?id=${userId}&year=${year}&month=${month}`
      );

      expect(response2.status).toBe(200);
      expect(response2.body.costs).toBeDefined();
      // Verify both responses have the same structure (5 categories)
      expect(response2.body.costs.length).toBe(5);
    });

    // Test that past month reports ARE saved to database (Computed Design Pattern)
    test("should save past month reports to database for caching", async () => {
      const userId = testIdCounter++;
      // Create a user
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      // Add a cost from last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      await Cost.create({
        userid: userId,
        description: "groceries",
        category: "food",
        sum: 50.0,
        date: lastMonth,
      });

      // Verify no cached report exists yet
      const year = lastMonth.getFullYear();
      const month = lastMonth.getMonth() + 1;
      let cachedReport = await Report.findOne({
        userid: userId,
        year: year,
        month: month,
      });
      expect(cachedReport).toBeNull();

      // Request report for past month
      const response = await request(app).get(
        `/api/report?id=${userId}&year=${year}&month=${month}`
      );

      expect(response.status).toBe(200);

      // Verify report was now saved to database
      cachedReport = await Report.findOne({
        userid: userId,
        year: year,
        month: month,
      });
      expect(cachedReport).not.toBeNull();
      expect(cachedReport.userid).toBe(userId);
      expect(cachedReport.year).toBe(year);
      expect(cachedReport.month).toBe(month);
      expect(cachedReport.costs).toBeDefined();
    });

    // Test that current month reports are NOT saved to database
    test("should NOT save current month reports to database", async () => {
      const userId = testIdCounter++;
      // Create a user
      await User.create({
        id: userId,
        first_name: "Jane",
        last_name: "Smith",
        birthday: new Date("1995-03-20"),
      });

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // Add a cost for current month
      await Cost.create({
        userid: userId,
        description: "lunch",
        category: "food",
        sum: 15.0,
        date: now,
      });

      // Request report for current month
      const response = await request(app).get(
        `/api/report?id=${userId}&year=${year}&month=${month}`
      );

      expect(response.status).toBe(200);

      // Verify report was NOT saved to database
      const cachedReport = await Report.findOne({
        userid: userId,
        year: year,
        month: month,
      });
      expect(cachedReport).toBeNull();
    });
  });
});
