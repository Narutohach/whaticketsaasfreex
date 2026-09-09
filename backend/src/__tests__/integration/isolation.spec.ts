import http from "http";
import request from "supertest";
import { createTestServer, closeTestServer } from "./helpers/testServer";
import {
  createCompanyWithAdmin,
  createTicketForCompany
} from "./helpers/fixtures";

let server: http.Server;

beforeAll(async () => {
  server = await createTestServer();
});

afterAll(async () => {
  await closeTestServer();
});

/**
 * Regressão para a Fase 1 do PLANO-MELHORIA: o bug recorrente do codebase era
 * service com findByPk(id) sem filtro de companyId, permitindo ler dados de
 * outra empresa por enumeração de id. Cada bloco abaixo cobre um domínio que
 * já foi corrigido nesta sessão — o objetivo é travar se alguém reintroduzir
 * o mesmo padrão.
 */
describe("isolamento multiempresa", () => {
  describe("tickets", () => {
    it("does not let company A read company B's ticket by id", async () => {
      const companyA = await createCompanyWithAdmin();
      const companyB = await createCompanyWithAdmin();
      const { ticket } = await createTicketForCompany(companyB.company.id);

      const response = await request(server)
        .get(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${companyA.token}`);

      expect(response.status).not.toBe(200);
    });

    it("lets a company read its own ticket", async () => {
      const companyA = await createCompanyWithAdmin();
      const { ticket } = await createTicketForCompany(companyA.company.id);

      const response = await request(server)
        .get(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${companyA.token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(ticket.id);
    });

    it("does not let company A delete company B's ticket", async () => {
      const companyA = await createCompanyWithAdmin();
      const companyB = await createCompanyWithAdmin();
      const { ticket } = await createTicketForCompany(companyB.company.id);

      const response = await request(server)
        .delete(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${companyA.token}`);

      expect(response.status).not.toBe(200);

      const stillThere = await request(server)
        .get(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${companyB.token}`);

      expect(stillThere.status).toBe(200);
    });
  });

  describe("usuários", () => {
    it("does not let company A read company B's user by id", async () => {
      const companyA = await createCompanyWithAdmin();
      const companyB = await createCompanyWithAdmin();

      const response = await request(server)
        .get(`/users/${companyB.user.id}`)
        .set("Authorization", `Bearer ${companyA.token}`);

      expect(response.status).toBe(404);
    });

    it("does not let a non-super admin list another company's users via ?companyId=", async () => {
      const companyA = await createCompanyWithAdmin();
      const companyB = await createCompanyWithAdmin();

      const response = await request(server)
        .get(`/users/list?companyId=${companyB.company.id}`)
        .set("Authorization", `Bearer ${companyA.token}`);

      expect(response.status).toBe(403);
    });
  });
});
