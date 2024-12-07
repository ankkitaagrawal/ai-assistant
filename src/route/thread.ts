import { getPluginDetails, perfromAction } from "../controller/plugin";
import { getThreads } from "../controller/thread";
import { AuthMethod, auth } from "../middleware/auth";
import { decodeToken } from "../middleware/authentication";

const express = require('express');

const routes = express.Router();

routes.route('/').get(auth([AuthMethod.TOKEN]), getThreads);

export default routes;
