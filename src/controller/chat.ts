
import producer from "../config/producer";
import { getPreviousMessage, sendMessage } from "../utility/aimiddleware";
import { Response, Request } from 'express';



export const sendMessageToAi = async (req: Request, res: Response) => {
    try {
        const { message } = req.body
        const data = res.locals?.user;
        const userId = data?.proxyId;
        const variables = {
            user_id: userId,
            system_prompt: "behave like a assisstatnt ",
            diary: data?.prompt,
            // context: JSON.stringify(appContext),
            channeluserId: data?.channelId
        };
        const response = await sendMessage(message, variables, userId);
        return res.status(200).json({ success: true, data: { message: response } })
    } catch (err: any) {
        console.log(err.response)
        res.status(400).json({
            message: 'Some Error on  Server',
            data: { errMessage: err?.message },
        });
    }
};


export const getMessages = async (req: Request, res: Response) => {
    try {
        const user = res.locals?.user;
        const threadId = req.query.threadId || user.proxyId;
        const response = await getPreviousMessage(threadId.toString());
        return res.status(200).json({ success: true, data: { chats: response } })
    } catch (err: any) {
        console.log(err.response)
        // res.status(400).json({ message: 'Some Error on function Server', data: { errMessage: err?.message }});
        res.status(400).json({
            message: 'Some Error on function Server',
            data: { errMessage: err?.message },
        });


    }
};

export const sendMessageToUser = async (req: Request, res: Response) => {

    const { message } = req.body;
    const user = res.locals?.user;
    const from = user?.channelId || req.body.from;  // TODO need to change this , due to security concern .
    const to = req.params.uid
    const QUEUE_NAME = process.env.MESSAGE_QUEUE || 'message';
    producer.publishToQueue(QUEUE_NAME, { message, to, from }).then((value) => {
        res.status(200).json({ success: true });
    }).catch((error) => {
        res.status(400).json({ success: false, error });
    });
}