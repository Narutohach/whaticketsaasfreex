import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import { getIO } from "../libs/socket";

export const verify = async (req: Request, res: Response): Promise<Response> => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const defaultVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "whaticket_meta_token";

  if (mode === "subscribe") {
    // Check if token matches global or any whatsapp connection
    if (token === defaultVerifyToken) {
      return res.status(200).send(challenge);
    }

    const whatsapp = await Whatsapp.findOne({
      where: { session: token as string }
    });

    if (whatsapp) {
      return res.status(200).send(challenge);
    }
  }

  return res.status(403).json({ error: "Verification failed" });
};

export const handle = async (req: Request, res: Response): Promise<Response> => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value) {
        const phoneNumberId = value.metadata?.phone_number_id;
        const messages = value.messages;
        const statuses = value.statuses;

        logger.info(`Received Meta Cloud API webhook for phone_number_id: ${phoneNumberId}`);

        // Find associated whatsapp connection
        const whatsapp = await Whatsapp.findOne({
          where: { number: phoneNumberId }
        });

        if (whatsapp) {
          const io = getIO();
          // Emit or enqueue for message pipeline
          if (messages && messages.length > 0) {
            io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-meta-message`, {
              whatsappId: whatsapp.id,
              messages
            });
          }
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (err: any) {
      logger.error(`Error processing Meta Webhook: ${err.message}`);
      return res.status(500).send("INTERNAL_ERROR");
    }
  }

  return res.sendStatus(404);
};
