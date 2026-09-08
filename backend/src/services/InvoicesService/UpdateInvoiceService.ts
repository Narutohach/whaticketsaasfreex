import AppError from "../../errors/AppError";
import Invoice from "../../models/Invoices";

interface InvoiceData {
  status: string;
  id?: number | string;
  companyId?: number;
}

const UpdateInvoiceService = async (
  InvoiceData: InvoiceData
): Promise<Invoice> => {
  const { id, status, companyId } = InvoiceData;

  // `companyId` só vem vazio no fluxo do super admin, que administra as
  // faturas de todas as empresas.
  const invoice = await Invoice.findOne({
    where: companyId ? { id, companyId } : { id }
  });

  if (!invoice) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  await invoice.update({
    status,
  });

  return invoice;
};

export default UpdateInvoiceService;
