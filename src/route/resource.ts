import { Router } from 'express';
import { AuthMethod, auth } from '../middleware/auth';
import {
    createResource,
    getResources,
    getResource,
    updateResource,
    deleteResource,
    refreshResource
} from '../controller/resource';

const router = Router();

// Basic CRUD routes
router.route('/')
    .get(auth([AuthMethod.TOKEN]), getResources)
    .post(auth([AuthMethod.TOKEN]), createResource);

router.route('/:id')
    .get(auth([AuthMethod.TOKEN]), getResource)
    .patch(auth([AuthMethod.TOKEN]), updateResource)
    .delete(auth([AuthMethod.TOKEN]), deleteResource);
router.route('/:id/refresh')
    .patch(auth([AuthMethod.TOKEN]), refreshResource);

export default router;