const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../app");
const User = require("../models/user");

describe("Users Service API", () => {
  let testIdCounter = 1; // Counter for unique test IDs
  
  beforeAll(async () => {
    // Connect to test database
    await connectDB(process.env.MONGODB_URI);
  });

  beforeEach(async () => {
    // Clean up before each test to ensure fresh state
    await User.deleteMany({});
    // Reset counter for each test suite section (optional but helps with debugging)
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
    // Small delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe("POST /api/add", () => {
    // Test successful user creation
    test("should create a new user successfully", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body.first_name).toBe("John");
      expect(response.body.last_name).toBe("Doe");
    });

    // Test missing required fields
    test("should return 400 when missing required fields", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: "John",
        // missing last_name and birthday
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Missing some required parameters"
      );
    });

    // Test future birthday rejection
    test("should reject user with future birthday", async () => {
      const userId = testIdCounter++;
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const userData = {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: futureDate.toISOString().split("T")[0],
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Birthday date can't be in the future"
      );
    });

    // Test duplicate user prevention
    test("should reject duplicate user id", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      // Create first user
      await request(app).post("/api/add").send(userData);

      // Try to create duplicate
      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain("User already exists");
    });

    // Test extra/malicious fields are ignored
    test("should ignore extra/malicious fields in payload", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-05-15",
        maliciousKey: "malicious",
        __proto__: { admin: true },
        randomField: "should be ignored",
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      // Ensure malicious fields are not stored
      expect(response.body.maliciousKey).toBeUndefined();
      expect(response.body.__proto__).not.toHaveProperty("admin");
    });

    // Test with partial required parameters (only half provided)
    test("should return 400 when only half of required params provided", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: "John",
        // Missing last_name and birthday
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Missing some required parameters"
      );
    });

    // Test with empty string values
    test("should handle empty string values properly", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: "",
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      // Should either be rejected or handled gracefully
      expect([400, 500]).toContain(response.status);
    });

    // Test with null values
    test("should reject null values in required fields", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: null,
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    // Test with zero id (falsy value, should be rejected)
    test("should reject zero as invalid id (falsy value)", async () => {
      const userData = {
        id: 0,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Missing some required parameters"
      );
    });

    // Test with negative id
    test("should accept negative id as valid", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: -userId,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(-userId);
    });

    // Test with very old birthday
    test("should accept very old birthday dates", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: "1900-01-01",
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });

    // Test with string id (type coercion)
    test("should handle string id type coercion", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: String(userId),
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      // Should either accept or reject, but not crash
      expect([200, 500]).toContain(response.status);
    });

    // Test with unicode/special characters
    test("should handle unicode and special characters in names", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: "José",
        last_name: "Müller",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.first_name).toBe("José");
      expect(response.body.last_name).toBe("Müller");
    });

    // Test with very long names
    test("should handle very long names", async () => {
      const userId = testIdCounter++;
      const longName = "A".repeat(500);
      const userData = {
        id: userId,
        first_name: longName,
        last_name: "Doe",
        birthday: "1990-05-15",
      };

      const response = await request(app).post("/api/add").send(userData);

      // Should handle gracefully
      expect([200, 500]).toContain(response.status);
    });

    // Test with invalid birthday format
    test("should handle invalid birthday format", async () => {
      const userId = testIdCounter++;
      const userData = {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: "not-a-date",
      };

      const response = await request(app).post("/api/add").send(userData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBeDefined();
    });
  });

  describe("GET /api/users", () => {
    // Test retrieving all users
    test("should return all users", async () => {
      const userId1 = testIdCounter++;
      const userId2 = testIdCounter++;
      // Create test users
      await User.create({
        id: userId1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });
      await User.create({
        id: userId2,
        first_name: "Jane",
        last_name: "Smith",
        birthday: new Date("1995-03-20"),
      });

      const response = await request(app).get("/api/users");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].first_name).toBe("John");
      expect(response.body[1].first_name).toBe("Jane");
    });

    // Test empty users list
    test("should return empty array when no users exist", async () => {
      const response = await request(app).get("/api/users");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("GET /api/users/:id", () => {
    // Test retrieving specific user
    test("should return user by id", async () => {
      const userId = testIdCounter++;
      await User.create({
        id: userId,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-05-15"),
      });

      const response = await request(app).get(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body.first_name).toBe("John");
      expect(response.body.last_name).toBe("Doe");
    });

    // Test user not found
    test("should return 404 when user not found", async () => {
      const response = await request(app).get("/api/users/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("User not found");
    });
  });
});
