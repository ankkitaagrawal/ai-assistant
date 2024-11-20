import { getCronDetailsOfUser, saveCronJobData } from "../controller/utility";

const express = require('express');

const routes = express.Router();

routes.route('/createcron').post(saveCronJobData);
routes.route('/crondetails/user/:userId').get(getCronDetailsOfUser);

export default routes;
