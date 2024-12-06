import { findThreadsByUser } from "../dbservices/thread";
import { Response, Request } from 'express';
import { error } from "console";

export const getUser = async (req: Request, res: Response) => {
    const user = res.locals?.userdata;
    return res.status(200).json({ success: true, data: { ...user } });
};