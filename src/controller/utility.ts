import { createCron, deleteCronById, getCronDetailsByUserId } from "../dbservices/cron"
import { Response, Request, NextFunction } from 'express';
import { vectorSearch } from "../service/langchain";
import { APIResponseBuilder } from "../service/utility";


export const saveCronJobData = async (req: Request, res: Response) => {

    try {

        const { to, isOnce, message, from, userId, cronExpression, id, timezone, cronJobId } = req.body
        const response = await createCron({ isOnce, message, userId, cronExpression, id, timezone, cronJobId, to, from });
        return res.status(200).json({ success: true, data: response })
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
        return res.status(200).json({ success: true, data: response })
    } catch (err: any) {
        console.log(err.response)
        res.status(400).json({
            message: 'Some Error on  Server',
            data: { errMessage: err?.message },
        });

    }
}
export const deleteCron = async (req: Request, res: Response) => {

    try {
        const { id } = req.params
        const response = await deleteCronById(id)
        return res.status(200).json({ success: true, data: response })
    } catch (err: any) {
        console.log(err.response)
        res.status(400).json({
            message: 'Some Error on  Server',
            data: { errMessage: err?.message },
        });

    }
}

export const searchVectorData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responseBuilder = new APIResponseBuilder();
        const { query, agentId } = req.body;
        const docIds = await vectorSearch(query, agentId);
        responseBuilder.setSuccess({ "docs": docIds });
        res.json(responseBuilder.build());
    } catch (error) {
        next(error);
    }
}