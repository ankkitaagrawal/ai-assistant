import { AuthMethod, auth } from "../middleware/auth";
import { getUser, updateAIService } from "../controller/user";
import { createAgent, getAgent, getDocContextofAgent, patchAgent, updateLinkInAgent } from "../controller/agent";

const express = require('express');

const router = express.Router();

router.route('/:id').get(auth([AuthMethod.TOKEN]), getAgent);
router.route('/:id').patch(auth([AuthMethod.TOKEN]), patchAgent);
router.route('/').post(auth([AuthMethod.TOKEN]), createAgent);
router.route('/:id/doc').patch(auth([AuthMethod.TOKEN]), updateLinkInAgent);
router.route('/:id/getcontext').get(auth([AuthMethod.NONE]), getDocContextofAgent);

export default router;
