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

  // Clean up database after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Close database connection after all tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test POST /api/add endpoint for creating new users
  describe("POST /api/add", () => {
    // Test successful user creation with all required fields
    test("should create a new user successfully", async () => {
      const userData = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      // Verify response status is 200 (success)
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      // Verify user data is returned correctly
      expect(response.body.first_name).toBe("John");
      expect(response.body.last_name).toBe("Doe");
    });

    // Test that missing required fields returns error
    test("should reject user with missing required fields", async () => {
      const userData = {
        id: 2,
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
    // Test retrieving multiple users from database
    test("should return all users", async () => {
      // Create test users in database
      await User.create({
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      // Create second test user
      await User.create({
        id: 2,
        first_name: "Jane",
        last_name: "Smith",
        birthday: new Date("1995-03-20"),
      });

      // Send GET request to retrieve all users
      const response = await request(app).get("/api/users");

      // Verify response contains all users
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    // Test retrieving users when database is empty
    test("should return empty array when no users exist", async () => {
      const response = await request(app).get("/api/users");

      // Verify empty response
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  // Test GET /api/users/:id endpoint for getting specific user details
  describe("GET /api/users/:id", () => {
    // Test retrieving a specific user by ID
    test("should return user details by id", async () => {
      // Create test user in database
      await User.create({
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      // Send GET request for specific user
      const response = await request(app).get("/api/users/1");

      // Verify user details returned correctly
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.first_name).toBe("John");
    });

    // Test requesting a non-existent user
    test("should return 404 when user not found", async () => {
      const response = await request(app).get("/api/users/9999");

      // Verify 404 error for non-existent user
      expect(response.status).toBe(404);
    });
  });
});
