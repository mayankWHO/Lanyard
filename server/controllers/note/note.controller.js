import { supabase } from '../../config/supabase.js';

//get all notes for a project
export const listNotes = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { category, is_pinned, is_decision } = req.query;

        let query = supabase
            .from('notes')
            .select('*')
            .eq('project_id', projectId);

        // Filter by category if provided
        if (category) {
            query = query.eq('category', category);
        }

        // Filter by pinned status if provided
        if (is_pinned !== undefined) {
            query = query.eq('is_pinned', is_pinned === 'true');
        }

        // Filter by decision status if provided
        if (is_decision !== undefined) {
            query = query.eq('is_decision', is_decision === 'true');
        }

        const { data: notes, error } = await query
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch notes',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: notes,
            count: notes.length
        });
    } catch (error) {
        console.error('List notes error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//create a new note
export const createNote = async (req, res) => {
    try {
        const { projectId } = req.params;
        const {
            title,
            content,
            category,
            tags,
            is_pinned,
            is_decision
        } = req.body;
        const userId = req.user.id;

        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Note title is required'
            });
        }

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Note content is required'
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

        const noteData = {
            project_id: projectId,
            title: title.trim(),
            content: content.trim(),
            category: category?.trim() || null,
            tags: tags || [],
            is_pinned: is_pinned || false,
            is_decision: is_decision || false,
            created_by: userId
        };

        const { data: note, error } = await supabase
            .from('notes')
            .insert([noteData])
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to create note',
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            data: note,
            message: 'Note created successfully'
        });
    } catch (error) {
        console.error('Create note error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//get note details
export const getNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        const { data: note, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Note not found',
                    message: 'The requested note does not exist'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch note',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: note
        });
    } catch (error) {
        console.error('Get note error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//update note
export const updateNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const {
            title,
            content,
            category,
            tags,
            is_pinned,
            is_decision
        } = req.body;

        const updateData = {};

        if (title !== undefined && title.trim() !== '') updateData.title = title.trim();
        if (content !== undefined && content.trim() !== '') updateData.content = content.trim();
        if (category !== undefined) updateData.category = category?.trim() || null;
        if (tags !== undefined) updateData.tags = tags;
        if (is_pinned !== undefined) updateData.is_pinned = is_pinned;
        if (is_decision !== undefined) updateData.is_decision = is_decision;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'No valid fields to update'
            });
        }

        const { data: note, error } = await supabase
            .from('notes')
            .update(updateData)
            .eq('id', noteId)
            .select('*')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Note not found',
                    message: 'The specified note does not exist'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to update note',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data: note,
            message: 'Note updated successfully'
        });
    } catch (error) {
        console.error('Update note error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};

//delete note
export const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Note not found',
                    message: 'The specified note does not exist'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to delete note',
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Delete note error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    }
};
