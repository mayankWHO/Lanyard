import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireProjectOwner, requireProjectAccess } from '../middleware/permission.middleware.js';
import {
    listProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
    listProjectMembers,
    addProjectMember,
    updateProjectMember,
    removeProjectMember
} from '../controllers/project/index.js';

const router = express.Router();

// Project routes (all require authentication)
// GET /api/v1/projects - List user projects
router.get('/', requireAuth, listProjects);

// POST /api/v1/projects - Create project (any authenticated user becomes owner)
router.post('/', requireAuth, createProject);

// GET /api/v1/projects/:projectId - Get project details (any project member including viewers)
router.get('/:projectId', requireAuth, requireProjectAccess, getProject);

// PUT /api/v1/projects/:projectId - Update project (Owner only)
router.put('/:projectId', requireAuth, requireProjectOwner, updateProject);

// DELETE /api/v1/projects/:projectId - Delete project (Owner only)
router.delete('/:projectId', requireAuth, requireProjectOwner, deleteProject);

// Member routes
// GET /api/v1/projects/:projectId/members - List project members (any project member including viewers)
router.get('/:projectId/members', requireAuth, requireProjectAccess, listProjectMembers);

// POST /api/v1/projects/:projectId/members - Add member (Owner only)
router.post('/:projectId/members', requireAuth, requireProjectOwner, addProjectMember);

// PUT /api/v1/projects/:projectId/members/:userId - Update member role (Owner only)
router.put('/:projectId/members/:userId', requireAuth, requireProjectOwner, updateProjectMember);

// DELETE /api/v1/projects/:projectId/members/:userId - Remove member (Owner only)
router.delete('/:projectId/members/:userId', requireAuth, requireProjectOwner, removeProjectMember);

export default router;
