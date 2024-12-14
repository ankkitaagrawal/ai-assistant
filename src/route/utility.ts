import { deleteCron, getCronDetailsOfUser, saveCronJobData, updateUserPrompt } from "../controller/utility";
import { Request, Response } from "express";
import redis from '../config/redis';
import { APIResponseBuilder } from "../service/utility";
const express = require('express');

const routes = express.Router();

routes.route('/cron').post(saveCronJobData);
routes.route('/cron/user/:userId').get(getCronDetailsOfUser);
routes.route('/cron/:id').delete(deleteCron);
routes.route('/update-prompt').post(updateUserPrompt)
routes.route('/cache/flush').delete(async (req: Request, res: Response) => {
    const responseBuilder = new APIResponseBuilder();
    const keys = await redis.keys('assistant:*');
    for (const key of keys) {
        await redis.del(key);
    }
    const response = responseBuilder.setSuccess({ "keys": keys }).build();
    res.json(response);
});

export default routes;
