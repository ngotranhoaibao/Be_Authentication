import express from 'express';
import { create, getAll, update, remove } from '../controllers/project.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tất cả các API dưới đây đều yêu cầu phải đăng nhập
router.use(protect);

router.post('/', create);
router.get('/', getAll);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;