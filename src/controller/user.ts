import { findThreadsByUser } from "../dbservices/thread";
import { Response, Request } from 'express';
import { error } from "console";
import { updateUserModel } from "../dbservices/user";
import { userChannelPoxyMap } from "../middleware/authentication";

export const getUser = async (req: Request, res: Response) => {
    const user = res.locals?.user;
    return res.status(200).json({ success: true, data: { ...user } });
};
export const updateModel = async (req: Request, res: Response) => {
    try {
        const user = res.locals?.userdata;
        const updatedModel = req.body.model
        const validModels = [
            'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'chatgpt-4o-latest', 'gpt-4o-mini', 'gpt-3.5-turbo'
        ];

        if (!validModels.includes(updatedModel)) {
            return res.status(400).json({ success: false, message: 'Invalid Model' });
        }
        const updatedUser = await updateUserModel({ userId: user.channelId, model: updatedModel })
        if (updatedUser) userChannelPoxyMap[updatedUser?.proxyId] = updatedUser

        return res.status(200).json({ success: true, data: updatedUser });

    } catch (error: any) {
        res.status(400).json({ success: false, message: `some error on server : ${error?.message}` })
    }

};