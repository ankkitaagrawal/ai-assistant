import { Request, Response } from "express";
import producer from "../db/producer";
export const processWebhook = async (req: Request, res: Response) => {

    const { tool, event } = req.params;
    producer.publishToQueue('webhook', { tool, event }).then((value) => {
        res.status(200).json({ success: true });
    }).catch((error) => {
        res.status(500).json({ success: false, error });
    });
}