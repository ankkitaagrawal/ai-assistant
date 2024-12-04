import { findThreadsByUser } from "../dbservices/thread";
import { Response, Request } from 'express';

export const getThreads = async (req: Request, res: Response) => {
    try {
        const userId = req.tokenData?.user.id
        const threads = await findThreadsByUser(userId?.toString());
        return res.status(200).json({ success: true, data: { threads: threads } })
    } catch (err: any) {
        console.log(err.response)
        // res.status(400).json({ message: 'Some Error on function Server', data: { errMessage: err?.message }});
        res.status(400).json({
            message: 'Some Error on function Server',
            data: { errMessage: err?.message },
        });

    }
};