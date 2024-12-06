import { findThreadsByUser } from "../dbservices/thread";
import { Response, Request } from 'express';
import { getUser } from "../utility/channel";
import { error } from "console";

export const getThreads = async (req: Request, res: Response) => {
    try {
        const userId = res.locals?.userdata?.channelId;
        let threads = await findThreadsByUser(userId?.toString());
        threads = threads.filter((thread: any) => {
            return thread.users.length === 2 && !thread.users.includes(null);
        });
        threads = await Promise.all(threads.map(async ({ _id, users }) => {
            const otherUser = users.find((user: any) => user !== userId)
            console.log(otherUser);
            const user = await getUser(otherUser).catch(error=>{
                console.log(error);
            });
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