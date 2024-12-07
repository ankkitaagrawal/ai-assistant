import { getPluginDetails, perfromAction } from "../controller/plugin";
import { getThreads } from "../controller/thread";
import { decodeToken } from "../middleware/authentication";
import { getUser } from "../controller/user";
import { AuthMethod, auth } from "../middleware/auth";

const express = require('express');

const routes = express.Router();

routes.route('/').get(auth([AuthMethod.TOKEN]), getUser);

export default routes;
