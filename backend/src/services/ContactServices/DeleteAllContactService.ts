import Contact from "../../models/Contact";

interface Request {
  contactIds: (string | number)[];
  companyId: number;
}

const DeleteAllContactService = async ({
  contactIds,
  companyId
}: Request): Promise<void> => {
  await Contact.destroy({
    where: { id: contactIds, companyId }
  });
};

export default DeleteAllContactService;
