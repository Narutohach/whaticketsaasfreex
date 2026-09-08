import { WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import mime from "mime-types";

import ffmpegPath from "ffmpeg-static";
import formatBody from "../../helpers/Mustache";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  companyId?: number;
  body?: string;
  isForwarded?: boolean;  
}

ffmpeg.setFfmpegPath(ffmpegPath);

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const processAudio = async (audio: string, companyId: string): Promise<string> => {
  const outputAudio = `${publicFolder}/company${companyId}/${new Date().getTime()}.ogg`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath} -i ${audio} -vn -c:a libopus -b:a 128k ${outputAudio} -y`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

const processAudioFile = async (audio: string, companyId: string): Promise<string> => {
  const outputAudio = `${publicFolder}/company${companyId}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};


export const getMessageOptions = async (
  fileName: string,
  pathMedia: string,
  companyId?: string,
  body: string = " "
): Promise<any> => {
  const mimeType = mime.lookup(pathMedia);
  const typeMessage = mimeType.split("/")[0];

  try {
    if (!mimeType) {
      throw new Error("Invalid mimetype");
    }
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const typeAudio = true; //fileName.includes("audio-record-site");
      const convert = await processAudio(pathMedia, companyId);
      if (typeAudio) {
        options = {
          audio: fs.readFileSync(convert),
		  mimetype: "audio/ogg; codecs=opus",
		  ptt: true, // Certifique-se de que PTT está definido corretamente
        };
      } else {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/mp4" : mimeType,
          ptt: true
        };
      }
    } else if (typeMessage === "document") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body ? body : null,
      };
    }

    return options;
  } catch (e) {
    Sentry.captureException(e);
    console.log(e);
    return null;
  }
};


import Whatsapp from "../../models/Whatsapp";
import { ChannelProviderFactory } from "../Channels/ChannelProviderFactory";

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body,
  isForwarded = false
}: Request): Promise<any> => {
  try {
    let whatsapp = ticket.whatsapp;
    if (!whatsapp && ticket.whatsappId) {
      whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
    }

    const bodyMessage = formatBody(body, ticket.contact);

    if (whatsapp && (whatsapp.provider === "meta_cloud" || whatsapp.provider === "meta")) {
      const channel = ChannelProviderFactory.getProvider(whatsapp);
      const mediaUrl = `${process.env.BACKEND_URL || "http://localhost:8080"}/public/company${ticket.companyId}/${media.filename || path.basename(media.path)}`;
      const sent = await channel.sendMedia({
        to: ticket.contact.number,
        mediaPath: mediaUrl,
        mediaType: media.mimetype,
        caption: bodyMessage,
        filename: media.originalname
      });

      await ticket.update({ lastMessage: bodyMessage });
      return {
        key: {
          id: sent.id,
          remoteJid: `${ticket.contact.number}@s.whatsapp.net`,
          fromMe: true
        }
      };
    }

    const wbot = await GetTicketWbot(ticket);
    const companyId = ticket.companyId.toString();

    const pathMedia = media.path;
    const mimeType = media.mimetype;
    const typeMessage = mimeType.split("/")[0];
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: media.originalname.replace('/', '-')
      };
    } else if (typeMessage === "audio") {
      // Verifica se o arquivo já é OGG
      if (mimeType === "audio/ogg") {
        options = {
          audio: fs.readFileSync(pathMedia),
          mimetype: "audio/ogg; codecs=opus",
          ptt: true // Define como push-to-talk
        };
      } else {
        // Converte para OGG se não for
        const convert = await processAudio(pathMedia, companyId);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/ogg; codecs=opus",
          ptt: true
        };
      }
    } else if (typeMessage === "document" || mimeType === "application/pdf") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: media.originalname.replace('/', '-'),
        mimetype: media.mimetype
      };
    } else if (typeMessage === "image") {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: bodyMessage
      };
    } else {
      // Caso o tipo de mídia não seja reconhecido, trata como documento
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: media.originalname.replace('/', '-'),
        mimetype: media.mimetype
      };
    }

    const jidServer = ticket.isGroup
      ? "g.us"
      : ticket.contact.isLid
        ? "lid"
        : "s.whatsapp.net";

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${jidServer}`,
      {
        ...options
      }
    );

    await ticket.update({ lastMessage: bodyMessage });

    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;


