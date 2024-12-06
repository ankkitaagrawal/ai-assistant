import { Request, Response } from "express";
import producer from "../config/producer";
export const processWebhook = async (req: Request, res: Response) => {
    const { tool, event } = req.params;
    const QUEUE_NAME = process.env.WEBHOOK_QUEUE || 'webhook';

    producer.publishToQueue(QUEUE_NAME, { tool, event }).then((value) => {
        res.status(200).json({ success: true });
    }).catch((error) => {
        res.status(500).json({ success: false, error });
    });
}