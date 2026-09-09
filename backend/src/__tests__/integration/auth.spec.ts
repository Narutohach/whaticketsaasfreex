import http from "http";
import request from "supertest";
import { createTestServer, closeTestServer } from "./helpers/testServer";
import { createCompanyWithAdmin } from "./helpers/fixtures";

let server: http.Server;

beforeAll(async () => {
  server = await createTestServer();
});

afterAll(async () => {
  await closeTestServer();
});

describe("POST /auth/login", () => {
  it("issues a token for correct credentials", async () => {
    const { user } = await createCompanyWithAdmin();

    const response = await request(server).post("/auth/login").send({
      email: user.email,
      password: "senha-forte-123"
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe(user.email);
    expect(response.body.user.companyId).toBe(user.companyId);
  });

  it("rejects a wrong password without revealing which part was wrong", async () => {
    const { user } = await createCompanyWithAdmin();

    const response = await request(server).post("/auth/login").send({
      email: user.email,
      password: "senha-errada"
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("ERR_INVALID_CREDENTIALS");
  });

  it("rejects a nonexistent email with the same error as a wrong password", async () => {
    const response = await request(server).post("/auth/login").send({
      email: "ninguem@example.com",
      password: "qualquer-coisa"
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("ERR_INVALID_CREDENTIALS");
  });
});

describe("GET /tickets (protected routes)", () => {
  it("rejects a request with no Authorization header", async () => {
    const response = await request(server).get("/tickets");

    expect(response.status).toBe(401);
  });

  it("rejects a request with a malformed token", async () => {
    const response = await request(server)
      .get("/tickets")
      .set("Authorization", "Bearer not-a-real-token");

    expect(response.status).toBe(403);
  });
});
