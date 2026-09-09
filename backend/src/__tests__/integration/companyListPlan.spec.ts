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

/**
 * Regressão real: o frontend às vezes chama GET /companies/listPlan/undefined
 * (ver MainListItems.js) antes do AuthContext carregar o usuário. Como um
 * super admin passa pelo `isSuper ||` sem checar o id, isso batia direto no
 * banco com um id literal "undefined" e estourava um 500 com SQL cru
 * (SequelizeDatabaseError) em vez de uma resposta de erro tratada.
 */
describe("GET /companies/listPlan/:id — validação do id", () => {
  it("rejeita um id não numérico com 400 em vez de deixar estourar 500", async () => {
    const superAdmin = await createCompanyWithAdmin({ super: true });

    const response = await request(server)
      .get("/companies/listPlan/undefined")
      .set("Authorization", `Bearer ${superAdmin.token}`);

    expect(response.status).toBe(400);
  });

  it("continua aceitando um id numérico válido", async () => {
    const superAdmin = await createCompanyWithAdmin({ super: true });

    const response = await request(server)
      .get(`/companies/listPlan/${superAdmin.company.id}`)
      .set("Authorization", `Bearer ${superAdmin.token}`);

    expect(response.status).toBe(200);
  });
});
