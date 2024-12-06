
import producer from "../config/producer";
import { getPreviousMessage, sendMessage } from "../utility/aimiddleware";
import { Response, Request } from 'express';



export const sendMessageToAi = async (req: Request, res: Response) => {
    try {
        const { message } = req.body
        const userId = req.tokenData?.user?.id?.toString();
        const data = res.locals?.userdata;
        // const appContext = data.appList.map((app: any) => {
        //     return {
        //         appId: app.pluginData._id,
        //         appName: app.pluginData.appName,
        //         description: app.pluginData.description
        //     };
        // });
        const response = await sendMessage(message,
            {
                user_id: userId,
                system_prompt: "behave like a assisstatnt ",
                diary : data.prompt ,
                // context: JSON.stringify(appContext),
                channeluserId: data.channelId
            }
            , userId);
        console.log(response)
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
        const threadId = req.query.threadId || req.tokenData?.user.id;
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

    const { message} = req.body
    const from = res.locals?.userdata?.channelId || req.body.by  // TODO need to change this , due to security concern .
    const to = req.params.uid
    producer.publishToQueue('message', { message, to, from }).then((value) => {
        res.status(200).json({ success: true });
    }).catch((error) => {
        res.status(400).json({ success: false, error });
    });

}