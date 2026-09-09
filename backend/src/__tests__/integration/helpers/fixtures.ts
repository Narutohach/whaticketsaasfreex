import Company from "../../../models/Company";
import User from "../../../models/User";
import Contact from "../../../models/Contact";
import Ticket from "../../../models/Ticket";
import { createAccessToken } from "../../../helpers/CreateTokens";

let sequence = 0;

/** Sufixo único por chamada para evitar colisão de campos UNIQUE entre testes. */
const unique = (label: string): string => {
  sequence += 1;
  return `${label}-${Date.now()}-${sequence}`;
};

export const createCompanyWithAdmin = async (
  overrides: { super?: boolean; profile?: string } = {}
) => {
  const company = await Company.create({
    name: unique("Empresa"),
    status: true
  } as Company);

  const user = await User.create({
    name: unique("Usuario"),
    email: `${unique("user")}@example.com`,
    password: "senha-forte-123",
    profile: overrides.profile || "admin",
    super: overrides.super || false,
    companyId: company.id
  } as unknown as User);

  const token = createAccessToken(user);

  return { company, user, token };
};

export const createTicketForCompany = async (companyId: number) => {
  const contact = await Contact.create({
    name: unique("Contato"),
    number: `55119${Math.floor(Math.random() * 100000000)}`,
    companyId
  } as Contact);

  const ticket = await Ticket.create({
    status: "open",
    companyId,
    contactId: contact.id,
    unreadMessages: 0
  } as Ticket);

  return { contact, ticket };
};
