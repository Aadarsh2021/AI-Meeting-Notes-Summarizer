const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// POST /api/summarize - Generate AI summary
router.post('/', async (req, res) => {
  try {
    const { text, customInstruction, title } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    // Build the prompt for Groq
    let prompt = `Please provide a comprehensive summary of the following text`;
    
    if (customInstruction && customInstruction.trim().length > 0) {
      prompt += `\n\nCustom Instructions: ${customInstruction}`;
    }
    
    prompt += `\n\nText to summarize:\n${text}`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert at summarizing meeting notes, transcripts, and documents. Provide clear, structured summaries that are easy to understand and actionable."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192", // Using Llama 3.1 8B model
      temperature: 0.3,
      max_tokens: 2048,
    });

    const generatedSummary = completion.choices[0]?.message?.content || 'No summary generated';

    // Save to database
    const { runQuery } = require('../database');
    const result = await runQuery(
      `INSERT INTO summaries (title, original_text, custom_instruction, generated_summary, edited_summary) 
       VALUES (?, ?, ?, ?, ?)`,
      [title || 'Untitled Summary', text, customInstruction || null, generatedSummary, generatedSummary]
    );

    res.json({
      success: true,
      summary: {
        id: result.id,
        title: title || 'Untitled Summary',
        originalText: text,
        customInstruction: customInstruction || null,
        generatedSummary,
        editedSummary: generatedSummary,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Summarization error:', error);
    
    if (error.message.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid or missing Groq API key. Please check your configuration.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error.message 
    });
  }
});

module.exports = router;
