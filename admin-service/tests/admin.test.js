/*
 * Admin Service Tests - Minimal test suite
 * Tests the GET /api/about endpoint for retrieving developer team information
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../app");

// Test suite for Admin Service API
describe("Admin Service API", () => {
  // Connect to test database before running tests
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI);
  });

  // Close database connection after all tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test GET /api/about endpoint for retrieving developer team
  describe("GET /api/about", () => {
    // Test that endpoint returns developer team with valid structure
    test("should return developer team with first and last names", async () => {
      // Send GET request to retrieve developer team
      const response = await request(app).get("/api/about");

      // Verify HTTP status is successful
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Verify at least one developer is returned
      expect(response.body.length).toBeGreaterThan(0);

      // Iterate through each developer to validate structure
      response.body.forEach((dev) => {
        // Verify each developer has required fields
        expect(dev).toHaveProperty("first_name");
        expect(dev).toHaveProperty("last_name");
        // Verify fields are strings with content
        expect(typeof dev.first_name).toBe("string");
        expect(typeof dev.last_name).toBe("string");
      });
    });
  });
});
