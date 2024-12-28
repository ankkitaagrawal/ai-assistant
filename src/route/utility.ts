import { deleteCron, getCronDetailsOfUser, saveCronJobData, searchVectorData, updateUserPrompt } from "../controller/utility";
import { Request, Response } from "express";
import redis from '../config/redis';
import { APIResponseBuilder } from "../service/utility";
import { DocumentLoader } from "../service/document-loader";
import { Doc } from '../service/document';
import { next } from "cheerio/dist/commonjs/api/traversing";
import { NextFunction } from "connect";

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
// For testing purpose
routes.route('/chunk').get(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const url = req.query.url as string;
        const chunkSize = parseInt(req.query.chunkSize as string) || 512;
        const overlap = parseInt(req.query.overlap as string) || 50;
        const loader = new DocumentLoader();
        const content = await loader.getContent(url) as any;
        let doc = new Doc("testing", content, { agentId: "testing", public: true });
        doc = await doc.chunk(chunkSize, overlap);
        res.json({ doc });
    } catch (error) {
        next(error);
    }
});

routes.route('/search').post(searchVectorData);

export default routes;
