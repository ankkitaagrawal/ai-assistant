import { getPluginDetails, perfromAction } from "../controller/plugin";
import { getThreads } from "../controller/thread";
import { decodeToken } from "../middleware/authentication";
import { getUser } from "../controller/user";

const express = require('express');

const routes = express.Router();

routes.route('/').get(decodeToken, getUser);

export default routes;
