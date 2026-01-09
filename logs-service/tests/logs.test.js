const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../app");
const Log = require("../models/log");

describe("Logs Service API", () => {
  beforeAll(async () => {
    // Connect to test database
    await connectDB(process.env.MONGODB_URI);
  });

  beforeEach(async () => {
    // Clean up before each test to ensure clean state
    await Log.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe("GET /api/logs", () => {
    // Test retrieving all logs
    test("should return all logs", async () => {
      // Create test logs
      await Log.create({
        userid: 1,
        action: "POST /api/add",
        details: "User added successfully",
      });
      await Log.create({
        userid: 2,
        action: "GET /api/users",
        details: "Users retrieved",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].userid).toBe(1);
      expect(response.body[1].userid).toBe(2);
    });

    // Test empty logs list
    test("should return empty array when no logs exist", async () => {
      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    // Test log contains required fields
    test("should return logs with all required fields", async () => {
      await Log.create({
        userid: 1,
        action: "POST /api/add",
        details: "User added successfully",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty("userid");
      expect(response.body[0]).toHaveProperty("action");
      expect(response.body[0]).toHaveProperty("timestamp");
    });

    // Test logs are returned in correct order
    test("should return logs in creation order", async () => {
      const log1 = await Log.create({
        userid: 1,
        action: "POST /api/add",
        details: "First log",
      });
      const log2 = await Log.create({
        userid: 2,
        action: "GET /api/users",
        details: "Second log",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].userid).toBe(1);
      expect(response.body[1].userid).toBe(2);
    });

    // Test with very large number of logs
    test("should handle retrieving large number of logs", async () => {
      const logs = [];
      for (let i = 0; i < 100; i++) {
        logs.push({
          userid: i,
          action: `GET /api/users/${i}`,
          details: `User ${i} retrieved`,
        });
      }
      await Log.insertMany(logs);

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(100);
    });

    // Test with unicode/special characters in logs
    test("should handle unicode and special characters", async () => {
      await Log.create({
        userid: 1,
        action: "POST /api/add",
        details: "User José Müller added successfully 🎉",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body[0].details).toContain("José");
      expect(response.body[0].details).toContain("🎉");
    });

    // Test with very long action strings
    test("should handle very long action strings", async () => {
      const longAction = "GET " + "/".repeat(500);
      await Log.create({
        userid: 1,
        action: longAction,
        details: "Long action test",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body[0].action).toBe(longAction);
    });

    // Test with empty details
    test("should handle logs with empty details", async () => {
      await Log.create({
        userid: 1,
        action: "GET /api/logs",
        details: "",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body[0].details).toBe("");
    });

    // Test with null/undefined details
    test("should handle logs with null details", async () => {
      await Log.create({
        userid: 1,
        action: "GET /api/logs",
        details: null,
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    // Test with zero userid
    test("should handle zero userid", async () => {
      await Log.create({
        userid: 0,
        action: "GET /api/logs",
        details: "Zero user test",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body[0].userid).toBe(0);
    });

    // Test with negative userid
    test("should handle negative userid", async () => {
      await Log.create({
        userid: -1,
        action: "GET /api/logs",
        details: "Negative user test",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body[0].userid).toBe(-1);
    });

    // Test with very large userid
    test("should handle very large userid", async () => {
      const largeId = Number.MAX_SAFE_INTEGER;
      await Log.create({
        userid: largeId,
        action: "GET /api/logs",
        details: "Large userid test",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      expect(response.body[0].userid).toBe(largeId);
    });

    // Test timestamp format
    test("should return logs with valid timestamp format", async () => {
      await Log.create({
        userid: 1,
        action: "GET /api/logs",
        details: "Timestamp test",
      });

      const response = await request(app).get("/api/logs");

      expect(response.status).toBe(200);
      const timestamp = response.body[0].timestamp;
      expect(timestamp).toBeDefined();
      // Verify it's a valid date string or ISO format
      expect(!isNaN(Date.parse(timestamp))).toBe(true);
    });
  });
});
