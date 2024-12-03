import { getPluginDetails, perfromAction } from "../controller/plugin";

const express = require('express');

const routes = express.Router();

routes.route('/:id').get(getPluginDetails)
routes.route('/:appId/action/:actionId').post(perfromAction)

export default routes;
