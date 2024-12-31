import { AuthMethod, auth } from "../middleware/auth";
import { addEditor, createAgent, getAgent, getAgents, getDocContextofAgent, patchAgent, removeEditor, updateLinkInAgent } from "../controller/agent";

const express = require('express');

const router = express.Router();

router.route('/:id').get(auth([AuthMethod.TOKEN]), getAgent);
router.route('/').get(auth([AuthMethod.TOKEN]), getAgents);
router.route('/:id').patch(auth([AuthMethod.TOKEN]), patchAgent);
router.route('/').post(auth([AuthMethod.TOKEN]), createAgent);
router.route('/:id/doc').patch(auth([AuthMethod.TOKEN]), updateLinkInAgent);
router.route('/:id/getcontext').post(auth([AuthMethod.NONE]), getDocContextofAgent);
router.route('/:id/editor').patch(auth([AuthMethod.TOKEN]), addEditor);
router.route('/:id/editor/:editorId').delete(auth([AuthMethod.TOKEN]), removeEditor);

export default router;
