import { findThreadsByUser } from "../dbservices/thread";
import { Response, Request } from 'express';
import { getUser } from "../utility/channel";

export const getThreads = async (req: Request, res: Response) => {
    try {
        const userId = res.locals?.userdata?.channelId || 'M0EDNnVD0bHPwLSc';
        let threads = await findThreadsByUser(userId?.toString());
        threads = await Promise.all(threads.map(async ({ _id, users }) => {

            const otherUser = users.find((user: any) => user !== userId)
            const user = await getUser(otherUser) as any;
            return { id: _id, name: user?.title };
        }));
        console.log(threads)
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