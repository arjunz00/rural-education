import { Router } from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  deleteResource,
  streamResourceAudio,
  downloadResourceAudio
} from '../controllers/resourceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff } from '../middleware/rbac.js';

const router = Router();

// Publicly streamable & downloadable audio endpoints (HTML5 <audio> & <a download>)
router.get('/:id/audio', streamResourceAudio);
router.get('/:id/download', downloadResourceAudio);

// Authenticated resource routes
router.use(authenticateToken);

router.get('/', getResources);
router.get('/:id', getResourceById);
router.post('/', requireStaff, createResource);
router.delete('/:id', requireStaff, deleteResource);

export default router;
