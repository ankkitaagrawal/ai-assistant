import { deleteCron, getCronDetailsOfUser, saveCronJobData, updateUserPrompt } from "../controller/utility";

const express = require('express');

const routes = express.Router();

routes.route('/cron').post(saveCronJobData);
routes.route('/cron/user/:userId').get(getCronDetailsOfUser);
routes.route('/cron/:id').delete(deleteCron);
routes.route('/update-prompt').post(updateUserPrompt)

export default routes;
