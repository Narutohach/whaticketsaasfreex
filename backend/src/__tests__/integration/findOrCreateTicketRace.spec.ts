// Só importar os models não inicializa o Sequelize — precisa deste import
// para registrar os models na instância (ver database/index.ts).
import sequelize from "../../database";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import Company from "../../models/Company";
import FindOrCreateTicketService from "../../services/TicketServices/FindOrCreateTicketService";

/**
 * Regressão real: o processamento de mensagens roda em paralelo (várias
 * mensagens do mesmo tick chegam ao mesmo tempo), e FindOrCreateTicketService
 * fazia um clássico check-then-create sem proteção — duas chamadas
 * concorrentes para o mesmo contato podiam ambas ver "nenhum ticket" e as
 * duas tentarem criar, uma delas estourando a constraint
 * contactid_companyid_unique (Tickets) e derrubando aquela mensagem.
 *
 * Concorrência de verdade contra o banco, não erro do Sequelize mockado: é o
 * único jeito de validar a race de fato.
 */
describe("FindOrCreateTicketService — corrida de criação concorrente", () => {
  afterAll(async () => {
    await sequelize.close();
  });

  it("resolves both concurrent calls to the same ticket instead of one of them failing", async () => {
    const company = await Company.create({
      name: `Empresa-race-${Date.now()}`,
      status: true
    } as Company);

    const whatsapp = await Whatsapp.create({
      name: `Conexao-race-${Date.now()}`,
      companyId: company.id
    } as Whatsapp);

    const contact = await Contact.create({
      name: "Contato race",
      number: `5511${Math.floor(Math.random() * 100000000)}`,
      companyId: company.id
    } as Contact);

    const [ticketA, ticketB] = await Promise.all([
      FindOrCreateTicketService(contact, whatsapp.id, 1, company.id),
      FindOrCreateTicketService(contact, whatsapp.id, 1, company.id)
    ]);

    expect(ticketA.id).toBe(ticketB.id);

    const ticketsForContact = await Ticket.findAll({
      where: { contactId: contact.id, companyId: company.id, whatsappId: whatsapp.id }
    });

    expect(ticketsForContact).toHaveLength(1);
  });
});
