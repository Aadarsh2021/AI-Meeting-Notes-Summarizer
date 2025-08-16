const express = require('express');
const router = express.Router();

// GET /api/summaries - Get all summaries
router.get('/', async (req, res) => {
  try {
    const { getAll } = require('../database');
    const summaries = await getAll(
      `SELECT * FROM summaries ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      summaries: summaries.map(summary => ({
        ...summary,
        created_at: new Date(summary.created_at).toISOString(),
        updated_at: new Date(summary.updated_at).toISOString()
      }))
    });

  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ 
      error: 'Failed to fetch summaries',
      message: error.message 
    });
  }
});

// GET /api/summaries/:id - Get specific summary
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { getRow } = require('../database');
    
    const summary = await getRow(
      `SELECT * FROM summaries WHERE id = ?`,
      [id]
    );

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({
      success: true,
      summary: {
        ...summary,
        created_at: new Date(summary.created_at).toISOString(),
        updated_at: new Date(summary.updated_at).toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch summary',
      message: error.message 
    });
  }
});

// POST /api/summaries - Save new summary
router.post('/', async (req, res) => {
  try {
    const { title, originalText, customInstruction, generatedSummary, editedSummary } = req.body;

    if (!title || !originalText || !generatedSummary) {
      return res.status(400).json({ 
        error: 'Title, original text, and generated summary are required' 
      });
    }

    const { runQuery } = require('../database');
    const result = await runQuery(
      `INSERT INTO summaries (title, original_text, custom_instruction, generated_summary, edited_summary) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, originalText, customInstruction || null, generatedSummary, editedSummary || generatedSummary]
    );

    res.status(201).json({
      success: true,
      message: 'Summary saved successfully',
      summaryId: result.id
    });

  } catch (error) {
    console.error('Error saving summary:', error);
    res.status(500).json({ 
      error: 'Failed to save summary',
      message: error.message 
    });
  }
});

// PUT /api/summaries/:id - Update summary
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, editedSummary } = req.body;

    if (!title && !editedSummary) {
      return res.status(400).json({ 
        error: 'At least one field to update is required' 
      });
    }

    const { runQuery, getRow } = require('../database');
    
    // Check if summary exists
    const existingSummary = await getRow(
      `SELECT * FROM summaries WHERE id = ?`,
      [id]
    );

    if (!existingSummary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];
    
    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    
    if (editedSummary !== undefined) {
      updateFields.push('edited_summary = ?');
      updateValues.push(editedSummary);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const updateQuery = `UPDATE summaries SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await runQuery(updateQuery, updateValues);

    res.json({
      success: true,
      message: 'Summary updated successfully'
    });

  } catch (error) {
    console.error('Error updating summary:', error);
    res.status(500).json({ 
      error: 'Failed to update summary',
      message: error.message 
    });
  }
});

// DELETE /api/summaries/:id - Delete summary
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { runQuery, getRow } = require('../database');
    
    // Check if summary exists
    const existingSummary = await getRow(
      `SELECT * FROM summaries WHERE id = ?`,
      [id]
    );

    if (!existingSummary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    // Delete related email logs first
    await runQuery(
      `DELETE FROM email_logs WHERE summary_id = ?`,
      [id]
    );

    // Delete the summary
    await runQuery(
      `DELETE FROM summaries WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Summary deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting summary:', error);
    res.status(500).json({ 
      error: 'Failed to delete summary',
      message: error.message 
    });
  }
});

module.exports = router;
