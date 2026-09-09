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
 * Fase 12: suspensão por inadimplência. O cron de faturamento já desligava
 * Company.status 3 dias após o vencimento, mas nada respeitava a flag — dava
 * para reconectar o WhatsApp e seguir operando sem pagar.
 *
 * Os testes de "continua acessível" são tão importantes quanto os de bloqueio:
 * se o caminho de pagamento for bloqueado junto, o cliente inadimplente não
 * consegue se regularizar e a suspensão vira irreversível.
 */
describe("empresa suspensa (status = false)", () => {
  it("blocks sending a message", async () => {
    const { company, token } = await createCompanyWithAdmin();
    const { ticket } = await createTicketForCompany(company.id);
    await company.update({ status: false });

    const response = await request(server)
      .post(`/messages/${ticket.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "oi" });

    expect(response.status).toBe(402);
    expect(response.body.error).toBe("ERR_COMPANY_SUSPENDED");
  });

  it("blocks creating a campaign", async () => {
    const { company, token } = await createCompanyWithAdmin();
    await company.update({ status: false });

    const response = await request(server)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Campanha teste" });

    expect(response.status).toBe(402);
  });

  // A suspensão derruba as sessões de WhatsApp; sem esta checagem bastava
  // escanear um QR novo para desfazer a suspensão na prática.
  it("blocks reconnecting a WhatsApp session", async () => {
    const { company, token } = await createCompanyWithAdmin();
    await company.update({ status: false });

    const response = await request(server)
      .post("/whatsappsession/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(402);
  });

  it("still allows reading tickets, so the data does not look lost", async () => {
    const { company, token } = await createCompanyWithAdmin();
    const { ticket } = await createTicketForCompany(company.id);
    await company.update({ status: false });

    const response = await request(server)
      .get(`/tickets/${ticket.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it("still allows reaching the billing routes, otherwise paying is impossible", async () => {
    const { company, token } = await createCompanyWithAdmin();
    await company.update({ status: false });

    const response = await request(server)
      .get("/invoices/all")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it("still allows logging in, otherwise the customer cannot reach the payment screen", async () => {
    const { company, user } = await createCompanyWithAdmin();
    await company.update({ status: false });

    const response = await request(server).post("/auth/login").send({
      email: user.email,
      password: "senha-forte-123"
    });

    expect(response.status).toBe(200);
  });

  it("never blocks a super admin", async () => {
    const { company, token } = await createCompanyWithAdmin({ super: true });
    const { ticket } = await createTicketForCompany(company.id);
    await company.update({ status: false });

    // Não há sessão real do WhatsApp no teste: GetTicketWbotWithRetry tenta
    // de novo por alguns segundos antes de desistir (ver
    // helpers/GetTicketWbotWithRetry.ts) — daí o timeout maior. O que este
    // teste verifica é isActiveCompany, não o resultado do envio.
    const response = await request(server)
      .post(`/messages/${ticket.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "oi" });

    expect(response.status).not.toBe(402);
  }, 15000);
});

describe("empresa ativa", () => {
  it("is not blocked by the suspension check", async () => {
    const { company, token } = await createCompanyWithAdmin();
    await company.update({ status: true });

    const response = await request(server)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Campanha teste" });

    expect(response.status).not.toBe(402);
  });
});
