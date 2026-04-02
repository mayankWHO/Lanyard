import { supabase } from '../../config/supabase.js';
import { generateStructuredJson } from '../../services/gemini.service.js';

export const summarizeNotes = async (req, res) => {
    try {
        const { noteId, title, content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Note content is required',
            });
        }

        const data = await generateStructuredJson({
            systemInstruction: 'You are Lanyard, an execution intelligence note summarizer. Return concise actionable JSON.',
            prompt: `Summarize this note.\nTitle: ${title || 'Untitled'}\nContent:\n${content}`,
            schemaHint: JSON.stringify({
                summary: 'string',
                actionItems: ['string'],
                decisions: ['string'],
                containsBlockers: true,
            }, null, 2),
        });

        if (noteId) {
            await supabase
                .from('notes')
                .update({
                    ai_summary: data.summary,
                    ai_action_items: data.actionItems,
                    ai_decisions_extracted: data.decisions,
                    contains_blocker_language: data.containsBlockers,
                    last_ai_analysis: new Date().toISOString(),
                })
                .eq('id', noteId);
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Note summarize error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to summarize note',
            message: error.message,
        });
    }
};

export const extractDecisions = async (req, res) => {
    try {
        const { notes } = req.body;

        if (!Array.isArray(notes) || notes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'At least one note is required',
            });
        }

        const data = await generateStructuredJson({
            systemInstruction: 'You are Lanyard, a decision extraction assistant. Return structured project decisions only.',
            prompt: `Extract key decisions from these project notes:\n${JSON.stringify(notes)}`,
            schemaHint: JSON.stringify({
                decisions: [
                    {
                        title: 'string',
                        rationale: 'string',
                        impact: 'string',
                    },
                ],
            }, null, 2),
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Decision extraction error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to extract decisions',
            message: error.message,
        });
    }
};
