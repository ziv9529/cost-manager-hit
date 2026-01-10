const request = require("supertest");
const mongoose = require("mongoose");
const { app, connectDB } = require("../app");

describe("Admin Service API", () => {
  beforeAll(async () => {
    // Connect to test database
    await connectDB(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe("GET /api/about", () => {
    test("should return developer team with first and last names", async () => {
      const response = await request(app).get("/api/about");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      response.body.forEach((dev) => {
        expect(dev).toHaveProperty("first_name");
        expect(dev).toHaveProperty("last_name");
        expect(typeof dev.first_name).toBe("string");
        expect(typeof dev.last_name).toBe("string");
        expect(dev.first_name.trim().length).toBeGreaterThan(0);
        expect(dev.last_name.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
