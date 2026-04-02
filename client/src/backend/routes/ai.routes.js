import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
    requireProjectAccess,
    requireAiAccess,
    requireAiConfigAccess,
    requireProjectMember,
    requireProjectOwner,
} from '../middleware/permission.middleware.js';
import {
    getProjectSummary,
    getProjectRisk,
    getProjectWorkload,
    createProjectPostmortem,
    getProjectAiConfig,
    updateProjectAiConfig,
    breakdownTask,
    refineTask,
    summarizeNotes,
    extractDecisions,
} from '../controllers/ai/index.js';

const router = express.Router();

router.post('/tasks/breakdown', requireAuth, breakdownTask);
router.post('/tasks/refine', requireAuth, refineTask);

router.get('/projects/:projectId/summary', requireAuth, requireProjectAccess, requireAiAccess, getProjectSummary);
router.get('/projects/:projectId/risk', requireAuth, requireProjectAccess, requireProjectMember, getProjectRisk);
router.get('/projects/:projectId/workload', requireAuth, requireProjectAccess, requireProjectMember, getProjectWorkload);
router.post('/projects/:projectId/postmortem', requireAuth, requireProjectAccess, requireProjectMember, createProjectPostmortem);
router.get('/projects/:projectId/config', requireAuth, requireProjectAccess, getProjectAiConfig);
router.put('/projects/:projectId/config', requireAuth, requireProjectOwner, requireAiConfigAccess, updateProjectAiConfig);

router.post('/notes/summarize', requireAuth, summarizeNotes);
router.post('/notes/extract-decisions', requireAuth, extractDecisions);

export default router;
