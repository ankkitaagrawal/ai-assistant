import { createCron, getCronDetailsByUserId } from "../dbservices/cron"
import { Response, Request } from 'express';


export const saveCronJobData = async (req: Request, res: Response) => {

    try {
        const {isOnce, message ,userId ,cronExpression} = req.body
        const response = await createCron({isOnce, message, userId ,cronExpression });
        return res.status(200).json({ success: true, data: { message: response } })
    } catch (err: any) {
        console.log(err.response)
        res.status(400).json({
            message: 'Some Error on  Server',
            data: { errMessage: err?.message },
        });

    }
}
export const getCronDetailsOfUser = async (req: Request, res: Response) => {

    try {
        const { userId } = req.params
        const response = await getCronDetailsByUserId(userId)
        return res.status(200).json({ success: true, data: { message: response } })
    } catch (err: any) {
        console.log(err.response)
        res.status(400).json({
            message: 'Some Error on  Server',
            data: { errMessage: err?.message },
        });

    }
}