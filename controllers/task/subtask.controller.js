import { supabase } from '../../config/supabase.js';

//create a subtask
export const createSubtask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, order_index, ai_generated } = req.body;

        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Subtask title is required'
            });
        }

        // Verify task exists
        const { data: taskExists, error: taskError } = await supabase
            .from('tasks')
            .select('id, project_id')
            .eq('id', taskId)
            .single();

        if (taskError || !taskExists) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: 'The specified task does not exist'
            });
        }

        const subtaskData = {
            task_id: taskId,
            title: title.trim(),
            order_index: order_index || 0,
            ai_generated: ai_generated || false,
            is_completed: false
        };

        const { data: subtask, error } = await supabase
            .from('subtasks')
            .insert([subtaskData])
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to create subtask',
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            data: subtask,
            message: 'Subtask created successfully'
        });
    } catch (error) {
        console.error('Create subtask error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//update subtask (any project member can update status)
export const updateSubtask = async (req, res) => {
    try {
        const { subTaskId } = req.params;
        const { title, is_completed, order_index } = req.body;

        const updateData = {};

        if (title !== undefined && title.trim() !== '') updateData.title = title.trim();
        if (is_completed !== undefined) updateData.is_completed = is_completed;
        if (order_index !== undefined) updateData.order_index = order_index;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'No valid fields to update'
            });
        }

        const { data: subtask, error } = await supabase
            .from('subtasks')
            .update(updateData)
            .eq('id', subTaskId)
            .select('*')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Subtask not found',
                    message: 'The specified subtask does not exist'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to update subtask',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: subtask,
            message: 'Subtask updated successfully'
        });
    } catch (error) {
        console.error('Update subtask error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//delete subtask (Admin or Project Admin)
export const deleteSubtask = async (req, res) => {
    try {
        const { subTaskId } = req.params;

        const { error } = await supabase
            .from('subtasks')
            .delete()
            .eq('id', subTaskId);

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Subtask not found',
                    message: 'The specified subtask does not exist'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to delete subtask',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Subtask deleted successfully'
        });
    } catch (error) {
        console.error('Delete subtask error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};
