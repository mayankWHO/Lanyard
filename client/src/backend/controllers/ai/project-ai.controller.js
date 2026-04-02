import { supabase } from '../../config/supabase.js';
import { generateStructuredJson } from '../../services/gemini.service.js';

function summarizeTaskStatus(tasks) {
    return {
        total: tasks.length,
        todo: tasks.filter((task) => task.status === 'todo').length,
        in_progress: tasks.filter((task) => task.status === 'in_progress').length,
        done: tasks.filter((task) => task.status === 'done').length,
        overdue: tasks.filter((task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done').length,
        critical: tasks.filter((task) => task.is_critical).length,
        without_definition_of_done: tasks.filter((task) => task.is_critical && !task.definition_of_done).length,
    };
}

async function getProjectContext(projectId) {
    const [{ data: project, error: projectError }, { data: tasks, error: taskError }, { data: notes, error: notesError }, { data: members, error: memberError }] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('tasks').select('id, title, status, priority, is_critical, assigned_to, goal, expected_outcome, definition_of_done, due_date, created_at, updated_at').eq('project_id', projectId),
        supabase.from('notes').select('id, title, content, is_pinned, is_decision, created_at').eq('project_id', projectId).order('created_at', { ascending: false }).limit(10),
        supabase.from('project_members').select('user_id, role').eq('project_id', projectId),
    ]);

    if (projectError || !project) {
        throw new Error(projectError?.message || 'Project not found');
    }

    if (taskError) {
        throw new Error(taskError.message);
    }

    if (notesError) {
        throw new Error(notesError.message);
    }

    if (memberError) {
        throw new Error(memberError.message);
    }

    return {
        project,
        tasks: tasks ?? [],
        notes: notes ?? [],
        members: members ?? [],
    };
}

export const getProjectSummary = async (req, res) => {
    try {
        const { projectId } = req.params;
        const context = await getProjectContext(projectId);
        const taskSummary = summarizeTaskStatus(context.tasks);

        const data = await generateStructuredJson({
            systemInstruction: context.project.ai_system_prompt || 'You are Lanyard, an execution intelligence assistant. Analyze project execution health and return concise structured JSON.',
            prompt: `Project:\n${JSON.stringify({
                id: context.project.id,
                name: context.project.name,
                description: context.project.description,
                status: context.project.status,
                target_end_date: context.project.target_end_date,
            })}\n\nTask summary:\n${JSON.stringify(taskSummary)}\n\nRecent tasks:\n${JSON.stringify(context.tasks.slice(0, 12))}\n\nRecent notes:\n${JSON.stringify(context.notes.slice(0, 6))}`,
            schemaHint: JSON.stringify({
                summary: 'string',
                completionPercent: 0,
                highlights: ['string'],
                blockers: ['string'],
                recommendations: ['string'],
            }, null, 2),
        });

        await supabase
            .from('projects')
            .update({ ai_last_summary: data })
            .eq('id', projectId);

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Project summary error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate project summary',
            message: error.message,
        });
    }
};

export const getProjectRisk = async (req, res) => {
    try {
        const { projectId } = req.params;
        const context = await getProjectContext(projectId);
        const taskSummary = summarizeTaskStatus(context.tasks);

        const data = await generateStructuredJson({
            systemInstruction: context.project.ai_system_prompt || 'You are Lanyard, an execution risk engine. Return a grounded risk score and short explanation in JSON.',
            prompt: `Analyze project risk.\n\nProject:\n${JSON.stringify({
                name: context.project.name,
                description: context.project.description,
                status: context.project.status,
                target_end_date: context.project.target_end_date,
            })}\n\nTask summary:\n${JSON.stringify(taskSummary)}\n\nTasks:\n${JSON.stringify(context.tasks.slice(0, 20))}\n\nNotes:\n${JSON.stringify(context.notes.slice(0, 8))}`,
            schemaHint: JSON.stringify({
                riskScore: 0,
                riskLevel: 'low | medium | high',
                reasons: ['string'],
                actions: ['string'],
            }, null, 2),
        });

        await supabase
            .from('projects')
            .update({
                risk_score: data.riskScore,
                risk_level: data.riskLevel,
                last_risk_analysis: new Date().toISOString(),
            })
            .eq('id', projectId);

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Project risk error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate project risk report',
            message: error.message,
        });
    }
};

export const getProjectWorkload = async (req, res) => {
    try {
        const { projectId } = req.params;
        const context = await getProjectContext(projectId);

        const data = await generateStructuredJson({
            systemInstruction: context.project.ai_system_prompt || 'You are Lanyard, a workload balancing assistant. Return structured JSON only.',
            prompt: `Analyze contributor workload.\n\nMembers:\n${JSON.stringify(context.members)}\n\nTasks:\n${JSON.stringify(context.tasks)}`,
            schemaHint: JSON.stringify({
                overloadedUsers: [{ userId: 'string', reason: 'string' }],
                balancedUsers: ['string'],
                bottlenecks: ['string'],
                recommendations: ['string'],
            }, null, 2),
        });

        await supabase
            .from('projects')
            .update({ ai_last_workload: data })
            .eq('id', projectId);

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Project workload error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate project workload analysis',
            message: error.message,
        });
    }
};

export const createProjectPostmortem = async (req, res) => {
    try {
        const { projectId } = req.params;
        const context = await getProjectContext(projectId);

        const data = await generateStructuredJson({
            systemInstruction: context.project.ai_system_prompt || 'You are Lanyard, a project retrospective assistant. Return practical JSON for a postmortem.',
            prompt: `Generate a postmortem for this project.\n\nProject:\n${JSON.stringify(context.project)}\n\nTasks:\n${JSON.stringify(context.tasks)}\n\nNotes:\n${JSON.stringify(context.notes)}`,
            schemaHint: JSON.stringify({
                wins: ['string'],
                delays: ['string'],
                issues: ['string'],
                improvements: ['string'],
                executiveSummary: 'string',
            }, null, 2),
        });

        await supabase
            .from('projects')
            .update({ ai_last_postmortem: data })
            .eq('id', projectId);

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Project postmortem error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate project postmortem',
            message: error.message,
        });
    }
};

export const getProjectAiConfig = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { data, error } = await supabase
            .from('projects')
            .select('id, ai_system_prompt')
            .eq('id', projectId)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Project not found',
                message: error?.message || 'Project not found',
            });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Get AI config error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch AI config',
            message: error.message,
        });
    }
};

export const updateProjectAiConfig = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { ai_system_prompt } = req.body;

        const { data, error } = await supabase
            .from('projects')
            .update({ ai_system_prompt: ai_system_prompt?.trim() || null })
            .eq('id', projectId)
            .select('id, ai_system_prompt')
            .single();

        if (error || !data) {
            return res.status(400).json({
                success: false,
                error: 'Failed to update AI config',
                message: error?.message || 'Unable to update AI config',
            });
        }

        return res.status(200).json({
            success: true,
            data,
            message: 'AI configuration updated successfully',
        });
    } catch (error) {
        console.error('Update AI config error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update AI config',
            message: error.message,
        });
    }
};
