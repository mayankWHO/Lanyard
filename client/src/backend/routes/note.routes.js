import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireProjectMember, requireProjectAccess } from '../middleware/permission.middleware.js';
import {
    listNotes,
    createNote,
    getNote,
    updateNote,
    deleteNote
} from '../controllers/note/index.js';

const router = express.Router();

// Note routes
// GET /api/v1/notes/:projectId - List project notes (any project member including viewers)
router.get('/:projectId', requireAuth, requireProjectAccess, listNotes);

// POST /api/v1/notes/:projectId - Create note (Members and Owners can create)
router.post('/:projectId', requireAuth, requireProjectMember, createNote);

// GET /api/v1/notes/:projectId/n/:noteId - Get note details (any project member including viewers)
router.get('/:projectId/n/:noteId', requireAuth, requireProjectAccess, getNote);

// PUT /api/v1/notes/:projectId/n/:noteId - Update note (Members and Owners can edit)
router.put('/:projectId/n/:noteId', requireAuth, requireProjectMember, updateNote);

// DELETE /api/v1/notes/:projectId/n/:noteId - Delete note (Members and Owners can delete)
router.delete('/:projectId/n/:noteId', requireAuth, requireProjectMember, deleteNote);

export default router;
