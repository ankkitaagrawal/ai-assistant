import { getPluginDetails, perfromAction } from "../controller/plugin";
import { getThreads } from "../controller/thread";
import { decodeToken } from "../middleware/authentication";

const express = require('express');

const routes = express.Router();

routes.route('/').get(decodeToken, getThreads);

export default routes;
