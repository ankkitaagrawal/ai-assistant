import { getPluginDetails } from "../controller/plugin";

const express = require('express');

const routes = express.Router();

routes.route('/:id').get(getPluginDetails)

export default routes;
