import express from 'express';
import { create, getAll, update, remove } from '../controllers/project.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', create);
router.get('/', getAll);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;