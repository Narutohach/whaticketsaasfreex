import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";
import { campaignQueue } from "../../queues";

export async function RestartService(id: number, companyId: number) {
  const campaign = await Campaign.findOne({
    where: { id, companyId }
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  await campaign.update({ status: "EM_ANDAMENTO" });

  await campaignQueue.add("ProcessCampaign", {
    id: campaign.id,
    delay: 3000
  });
}
