import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireProjectMember, requireProjectAccess } from '../middleware/permission.middleware.js';
import {
    listTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask
} from '../controllers/task/index.js';

const router = express.Router();

// Task routes
// GET /api/v1/tasks/:projectId - List project tasks (any project member including viewers)
router.get('/:projectId', requireAuth, requireProjectAccess, listTasks);

// POST /api/v1/tasks/:projectId - Create task (Members and Owners can create)
router.post('/:projectId', requireAuth, requireProjectMember, createTask);

// GET /api/v1/tasks/:projectId/t/:taskId - Get task details (any project member including viewers)
router.get('/:projectId/t/:taskId', requireAuth, requireProjectAccess, getTask);

// PUT /api/v1/tasks/:projectId/t/:taskId - Update task (Members and Owners can edit)
router.put('/:projectId/t/:taskId', requireAuth, requireProjectMember, updateTask);

// DELETE /api/v1/tasks/:projectId/t/:taskId - Delete task (Members and Owners can delete)
router.delete('/:projectId/t/:taskId', requireAuth, requireProjectMember, deleteTask);

// Subtask routes
// POST /api/v1/tasks/:projectId/t/:taskId/subtasks - Create subtask (Members and Owners can create)
router.post('/:projectId/t/:taskId/subtasks', requireAuth, requireProjectMember, createSubtask);

// PUT /api/v1/tasks/:projectId/st/:subTaskId - Update subtask (Members and Owners can update)
router.put('/:projectId/st/:subTaskId', requireAuth, requireProjectMember, updateSubtask);

// DELETE /api/v1/tasks/:projectId/st/:subTaskId - Delete subtask (Members and Owners can delete)
router.delete('/:projectId/st/:subTaskId', requireAuth, requireProjectMember, deleteSubtask);

export default router;
