/*
 * Admin Service Tests
 * This module performs testing on the Admin Service API endpoints.
 * It ensures proper response status, structure, and data validity.
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../app");

/*
 * Main Test Suite
 * Sets up the environment, manages database connections (setup/teardown),
 * and groups related tests.
 */
describe("Admin Service API", () => {
  beforeAll(async () => {
    // Connect to test database
    await connectDB(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  /*
   * Test Case: Retrieve Developer Team
   * Verifies that the endpoint returns a valid list of developers
   * with correct property types and non-empty strings.
   */
  describe("GET /api/about", () => {
    test("should return developer team with first and last names", async () => {
      // Execute the GET request to the endpoint
      const response = await request(app).get("/api/about");

      // Verify HTTP status and basic response structure
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Iterate through each developer object to validate properties
      response.body.forEach((dev) => {
        expect(dev).toHaveProperty("first_name");
        expect(dev).toHaveProperty("last_name");
        expect(typeof dev.first_name).toBe("string");
        expect(typeof dev.last_name).toBe("string");
        // Ensure strings are not empty
        expect(dev.first_name.trim().length).toBeGreaterThan(0);
        expect(dev.last_name.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
