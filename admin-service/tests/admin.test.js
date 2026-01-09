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
    // Test retrieving developer information
    test("should return developer team information", async () => {
      const response = await request(app).get("/api/about");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    // Test developer object structure
    test("should return developers with required fields", async () => {
      const response = await request(app).get("/api/about");

      expect(response.status).toBe(200);
      response.body.forEach((dev) => {
        expect(dev).toHaveProperty("first_name");
        expect(dev).toHaveProperty("last_name");
        expect(typeof dev.first_name).toBe("string");
        expect(typeof dev.last_name).toBe("string");
      });
    });

    // Test response contains valid names
    test("should return valid developer names", async () => {
      const response = await request(app).get("/api/about");

      expect(response.status).toBe(200);
      expect(response.body[0].first_name).toBeTruthy();
      expect(response.body[0].last_name).toBeTruthy();
      expect(response.body[0].first_name.length).toBeGreaterThan(0);
      expect(response.body[0].last_name.length).toBeGreaterThan(0);
    });

    // Test endpoint does not accept POST requests
    test("should reject POST requests to /api/about", async () => {
      const response = await request(app)
        .post("/api/about")
        .send({ name: "Test" });

      expect([404, 405]).toContain(response.status);
    });

    // Test endpoint does not accept PUT requests
    test("should reject PUT requests to /api/about", async () => {
      const response = await request(app)
        .put("/api/about")
        .send({ name: "Test" });

      expect([404, 405]).toContain(response.status);
    });

    // Test endpoint does not accept DELETE requests
    test("should reject DELETE requests to /api/about", async () => {
      const response = await request(app).delete("/api/about");

      expect([404, 405]).toContain(response.status);
    });

    // Test multiple calls return consistent data
    test("should return consistent data across multiple calls", async () => {
      const response1 = await request(app).get("/api/about");
      const response2 = await request(app).get("/api/about");

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(JSON.stringify(response1.body)).toBe(
        JSON.stringify(response2.body)
      );
    });

    // Test all developers have both names
    test("should ensure all developers have both first and last names", async () => {
      const response = await request(app).get("/api/about");

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);

      response.body.forEach((dev) => {
        expect(dev.first_name).toBeTruthy();
        expect(dev.last_name).toBeTruthy();
        expect(typeof dev.first_name).toBe("string");
        expect(typeof dev.last_name).toBe("string");
        // Ensure names are not just whitespace
        expect(dev.first_name.trim().length).toBeGreaterThan(0);
        expect(dev.last_name.trim().length).toBeGreaterThan(0);
      });
    });

    // Test response structure is valid JSON
    test("should return valid JSON response", async () => {
      const response = await request(app).get("/api/about");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/json/);
      // If we can access it as array, it's valid JSON
      expect(Array.isArray(response.body)).toBe(true);
    });

    // Test no unexpected fields in response
    test("should not contain unexpected fields in developer objects", async () => {
      const response = await request(app).get("/api/about");

      expect(response.status).toBe(200);
      const allowedKeys = ["first_name", "last_name", "_id", "__v"];

      response.body.forEach((dev) => {
        const devKeys = Object.keys(dev);
        devKeys.forEach((key) => {
          // Allow MongoDB internal fields and defined fields
          expect(
            allowedKeys.includes(key) ||
              key.startsWith("_") ||
              key.toLowerCase().includes("id")
          ).toBe(true);
        });
      });
    });

    // Test empty body in GET request is handled
    test("should ignore body in GET request", async () => {
      const response = await request(app)
        .get("/api/about")
        .send({ malicious: "data" });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    // Test query parameters are ignored
    test("should ignore query parameters", async () => {
      const response = await request(app).get(
        "/api/about?sort=name&limit=10&offset=0"
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    // Test endpoint is accessible (Express.js routes are case-insensitive by default)
    test("should handle different casing in request", async () => {
      const response = await request(app).get("/api/About");

      // Express.js routes are case-insensitive for path, so this should succeed
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    // Test response has reasonable length
    test("should return developers array with reasonable length", async () => {
      const response = await request(app).get("/api/about");

      expect(response.status).toBe(200);
      expect(response.body.length).toBeLessThanOrEqual(100);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });
});
