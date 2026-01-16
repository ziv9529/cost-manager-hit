/*
 * Logs Service Tests
 * Tests the core endpoint: GET /api/logs
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../app");

// Test suite for Logs Service API
describe("Logs Service API", () => {
  // Connect to test database before running tests
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI);
  });

  // Close database connection after all tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test GET /api/logs endpoint for retrieving all logs
  describe("GET /api/logs", () => {
    // Test that endpoint returns logs successfully
    test("should return all logs", async () => {
      // Send GET request to retrieve all logs from system
      const response = await request(app).get("/api/logs");

      // Verify response is successful and returns array
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
