import { supabase } from '../../config/supabase.js';

//list all tasks for a project
export const listTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status, assigned_to } = req.query;

        let query = supabase
            .from('tasks')
            .select(`
                *,
                subtasks(
                    id,
                    title,
                    is_completed,
                    order_index,
                    ai_generated
                )
            `)
            .eq('project_id', projectId);

        // Filter by status if provided
        if (status) {
            query = query.eq('status', status);
        }

        // Filter by assigned user if provided
        if (assigned_to) {
            query = query.eq('assigned_to', assigned_to);
        }

        const { data: tasks, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch tasks',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('List tasks error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//create a new task (Admin or Project Admin)
export const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const {
            title,
            description,
            status,
            priority,
            is_critical,
            assigned_to,
            goal,
            expected_outcome,
            definition_of_done,
            due_date
        } = req.body;
        const userId = req.user.id;

        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Task title is required'
            });
        }

        // Verify project exists
        const { data: projectExists, error: projectError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .single();

        if (projectError || !projectExists) {
            return res.status(404).json({
                success: false,
                error: 'Project not found',
                message: 'The specified project does not exist'
            });
        }

        // If assigned_to is provided, verify user exists and is a project member
        if (assigned_to) {
            const { data: memberExists } = await supabase
                .from('project_members')
                .select('user_id')
                .eq('project_id', projectId)
                .eq('user_id', assigned_to)
                .single();

            if (!memberExists) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    message: 'Assigned user must be a member of the project'
                });
            }
        }

        const taskData = {
            project_id: projectId,
            title: title.trim(),
            description: description?.trim() || null,
            status: status || 'todo',
            priority: priority || null,
            is_critical: is_critical || false,
            assigned_to: assigned_to || null,
            created_by: userId,
            goal: goal?.trim() || null,
            expected_outcome: expected_outcome?.trim() || null,
            definition_of_done: definition_of_done?.trim() || null,
            due_date: due_date || null
        };

        const { data: task, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to create task',
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            data: task,
            message: 'Task created successfully'
        });
    } catch (error) {
        console.error('Create task error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//get task details
export const getTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const { data: task, error } = await supabase
            .from('tasks')
            .select(`
                *,
                subtasks(
                    id,
                    title,
                    is_completed,
                    order_index,
                    ai_generated,
                    completed_at,
                    created_at
                )
            `)
            .eq('id', taskId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found',
                    message: 'The requested task does not exist'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch task',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Get task error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//update task
export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const {
            title,
            description,
            status,
            priority,
            is_critical,
            assigned_to,
            goal,
            expected_outcome,
            definition_of_done,
            due_date
        } = req.body;

        const updateData = {};

        if (title !== undefined && title.trim() !== '') updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        if (is_critical !== undefined) updateData.is_critical = is_critical;
        if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
        if (goal !== undefined) updateData.goal = goal?.trim() || null;
        if (expected_outcome !== undefined) updateData.expected_outcome = expected_outcome?.trim() || null;
        if (definition_of_done !== undefined) updateData.definition_of_done = definition_of_done?.trim() || null;
        if (due_date !== undefined) updateData.due_date = due_date;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'No valid fields to update'
            });
        }

        const { data: task, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', taskId)
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to update task',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: task,
            message: 'Task updated successfully'
        });
    } catch (error) {
        console.error('Update task error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//delete task (Admin or Project Admin)
export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to delete task',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Delete task error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};
