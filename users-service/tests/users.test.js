/*
 * Users Service Tests
 * Tests the core endpoints: POST /api/add , GET /api/users and GET /api/user/:id
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../app");
const User = require("../models/user");

// Test suite for Users Service API endpoints
describe("Users Service API", () => {
  // Setup database connection before all tests
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI);
  });

  // Close database connection after all tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test POST /api/add endpoint for creating new users
  describe("POST /api/add", () => {
    // Test successful user creation with all required fields
    test("should create a new user successfully", async () => {
      const uniqueId = Date.now();
      const userData = {
        id: uniqueId,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      // Verify response status is 200 (success)
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(uniqueId);
      expect(response.body.first_name).toBe("John");
      expect(response.body.last_name).toBe("Doe");

      // Clean up created user
      await User.deleteOne({ id: uniqueId });
    });

    // Test that missing required fields returns error
    test("should reject user with missing required fields", async () => {
      const uniqueId = Date.now() + 1;
      const userData = {
        id: uniqueId,
        first_name: "Jane",
        // Missing last_name and birthday
      };

      const response = await request(app).post("/api/add").send(userData);

      // Verify error response for missing parameters
      expect(response.status).toBe(400);
    });
  });

  // Test GET /api/users endpoint for retrieving all users
  describe("GET /api/users", () => {
    // Test that endpoint returns users array successfully
    test("should return all users as an array", async () => {
      const response = await request(app).get("/api/users");

      // Verify response is successful and returns an array
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Test GET /api/users/:id endpoint for getting specific user details
  describe("GET /api/users/:id", () => {
    // Test retrieving a specific user by ID
    test("should return user details by id", async () => {
      const uniqueId = Date.now() + 2;

      // Create test user in database
      await User.create({
        id: uniqueId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      // Send GET request for specific user
      const response = await request(app).get(`/api/users/${uniqueId}`);

      // Verify user details returned correctly
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(uniqueId);
      expect(response.body.first_name).toBe("John");

      // Clean up created user
      await User.deleteOne({ id: uniqueId });
    });

    // Test requesting a non-existent user
    test("should return 404 when user not found", async () => {
      const nonExistentId = 999999999;
      const response = await request(app).get(`/api/users/${nonExistentId}`);

      // Verify 404 error for non-existent user
      expect(response.status).toBe(404);
    });
  });
});
