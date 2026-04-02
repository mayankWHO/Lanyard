import { supabase } from '../../config/supabase.js';
import { generateStructuredJson } from '../../services/gemini.service.js';
import { PROJECT_ROLES, canUseProjectAi, normalizeRole } from '../../utils/rbac.js';

async function ensureTaskAiAccess(userId, projectId) {
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

    if (profileError || !profile) {
        throw new Error('Unable to verify user role for AI access');
    }

    const platformRole = normalizeRole(profile.role);
    if (platformRole === PROJECT_ROLES.ADMIN || platformRole === PROJECT_ROLES.OWNER) {
        return;
    }

    if (!projectId) {
        if (!canUseProjectAi(platformRole)) {
            throw new Error('Your role cannot use Gemini task assistance');
        }
        return;
    }

    const { data: membership, error: membershipError } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

    if (membershipError || !membership) {
        throw new Error('You do not have access to this project');
    }

    if (!canUseProjectAi(normalizeRole(membership.role))) {
        throw new Error('Your role cannot use Gemini task assistance');
    }
}

export const breakdownTask = async (req, res) => {
    try {
        const { title, description, priority, projectName, projectId } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Task title is required',
            });
        }

        await ensureTaskAiAccess(req.user.id, projectId);

        const data = await generateStructuredJson({
            systemInstruction: 'You are Lanyard, an AI planning assistant. Convert vague work into clear execution-ready tasks.',
            prompt: `Break down this task.\n\nProject: ${projectName || 'Unknown project'}\nTitle: ${title}\nDescription: ${description || 'No description'}\nPriority: ${priority || 'medium'}`,
            schemaHint: JSON.stringify({
                goal: 'string',
                expected_outcome: 'string',
                definition_of_done: 'string',
                subtasks: ['string'],
            }, null, 2),
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Task breakdown error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate task breakdown',
            message: error.message,
        });
    }
};

export const refineTask = async (req, res) => {
    try {
        const { title, description, goal, expected_outcome, definition_of_done, projectId } = req.body;

        await ensureTaskAiAccess(req.user.id, projectId);

        const data = await generateStructuredJson({
            systemInstruction: 'You are Lanyard, an execution clarity reviewer. Improve task wording and identify ambiguity.',
            prompt: `Refine this task.\n${JSON.stringify({ title, description, goal, expected_outcome, definition_of_done })}`,
            schemaHint: JSON.stringify({
                refined_title: 'string',
                refined_description: 'string',
                ambiguities: ['string'],
                missing_details: ['string'],
                stronger_definition_of_done: 'string',
            }, null, 2),
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Task refine error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to refine task',
            message: error.message,
        });
    }
};
