import http from "http";
import request from "supertest";
import { createTestServer, closeTestServer } from "./helpers/testServer";
import { createCompanyWithAdmin } from "./helpers/fixtures";
import User from "../../models/User";
import { createAccessToken } from "../../helpers/CreateTokens";

let server: http.Server;

beforeAll(async () => {
  server = await createTestServer();
});

afterAll(async () => {
  await closeTestServer();
});

describe("rotas restritas a super admin", () => {
  it("rejects a regular company admin", async () => {
    const companyA = await createCompanyWithAdmin({ super: false });

    const response = await request(server)
      .get("/companies")
      .set("Authorization", `Bearer ${companyA.token}`);

    expect(response.status).toBe(401);
  });

  it("allows a super admin", async () => {
    const superAdmin = await createCompanyWithAdmin({ super: true });

    const response = await request(server)
      .get("/companies")
      .set("Authorization", `Bearer ${superAdmin.token}`);

    expect(response.status).toBe(200);
  });
});

describe("exclusão de usuário restrita a perfil admin", () => {
  it("rejects a non-admin profile", async () => {
    const companyA = await createCompanyWithAdmin();

    const agent = await User.create({
      name: "Agente comum",
      email: `agente-${Date.now()}@example.com`,
      password: "senha-forte-123",
      profile: "user",
      companyId: companyA.company.id
    } as unknown as User);

    const agentToken = createAccessToken(agent);

    const response = await request(server)
      .delete(`/users/${companyA.user.id}`)
      .set("Authorization", `Bearer ${agentToken}`);

    expect(response.status).toBe(403);
  });

  it("allows an admin profile to delete a user from the same company", async () => {
    const companyA = await createCompanyWithAdmin();

    const target = await User.create({
      name: "Para remover",
      email: `remover-${Date.now()}@example.com`,
      password: "senha-forte-123",
      profile: "user",
      companyId: companyA.company.id
    } as unknown as User);

    const response = await request(server)
      .delete(`/users/${target.id}`)
      .set("Authorization", `Bearer ${companyA.token}`);

    expect(response.status).toBe(200);
  });
});
