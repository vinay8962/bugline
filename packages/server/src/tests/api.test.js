import request from "supertest";
import app from "../server.js";

describe("BugLine API Tests", () => {
  describe("Health Check", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("BugLine API is running");
    });
  });

  describe("API Documentation", () => {
    it("should return API documentation", async () => {
      const response = await request(app).get("/docs").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("BugLine API Documentation");
    });
  });

  describe("Authentication", () => {
    it("should require authentication for protected routes", async () => {
      const response = await request(app).get("/api/v1/users/me").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Access token required");
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for undefined routes", async () => {
      const response = await request(app).get("/undefined-route").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("not found");
    });
  });
});
