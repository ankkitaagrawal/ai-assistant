import { findThreadsByUser } from "../dbservices/thread";
import { Response, Request } from 'express';
import { getUser } from "../utility/channel";

export const getThreads = async (req: Request, res: Response) => {
    try {
        const userId = res.locals?.userdata?.channelId;
        let threads = await findThreadsByUser(userId?.toString());
        threads = threads.map(async ({ _id, users }) => {
            const otherUser = users.find((user: any) => user !== userId)
            const { title: name } = await getUser(otherUser).catch((err) => { title: "Unknown" });
            return { id: _id, name };
        })
        return res.status(200).json({ success: true, data: { threads: threads } });
    } catch (err: any) {
        console.log(err.response)
        // res.status(400).json({ message: 'Some Error on function Server', data: { errMessage: err?.message }});
        res.status(400).json({
            message: 'Some Error on function Server',
            data: { errMessage: err?.message },
        });

    }
};