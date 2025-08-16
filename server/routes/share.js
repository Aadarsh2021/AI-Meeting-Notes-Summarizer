const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
      process.env.EMAIL_USER === 'your_email@gmail.com' || 
      process.env.EMAIL_PASS === 'your_app_password_here') {
    throw new Error('Email credentials not configured. Please set up EMAIL_USER and EMAIL_PASS in your .env file.');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// POST /api/share - Share summary via email
router.post('/', async (req, res) => {
  try {
    const { summaryId, recipients, subject, message, summaryContent } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient is required' });
    }

    if (!summaryContent) {
      return res.status(400).json({ error: 'Summary content is required' });
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid email addresses', 
        invalidEmails 
      });
    }

    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_USER === 'your_email@gmail.com' || 
        process.env.EMAIL_PASS === 'your_app_password_here') {
      return res.status(500).json({ 
        error: 'Email service not configured. Please set up email credentials in your .env file.',
        setupInstructions: 'Set EMAIL_USER and EMAIL_PASS in your .env file to enable email sharing.'
      });
    }

    // Create email transporter
    const transporter = createTransporter();

    // Prepare email content
    const emailSubject = subject || 'Meeting Summary Shared';
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${emailSubject}</h2>
        
        ${message ? `<p style="color: #666; margin-bottom: 20px;">${message}</p>` : ''}
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #444; margin-top: 0;">Summary</h3>
          <div style="white-space: pre-wrap; color: #333; line-height: 1.6;">
            ${summaryContent}
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          This summary was generated using AI Meeting Notes Summarizer.
        </p>
      </div>
    `;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients.join(', '),
      subject: emailSubject,
      html: emailBody,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log email in database
    if (summaryId) {
      const { runQuery } = require('../database');
      await runQuery(
        `INSERT INTO email_logs (summary_id, recipients, subject, status) 
         VALUES (?, ?, ?, ?)`,
        [summaryId, recipients.join(', '), emailSubject, 'sent']
      );
    }

    res.json({
      success: true,
      message: 'Summary shared successfully',
      messageId: info.messageId,
      recipients: recipients
    });

  } catch (error) {
    console.error('Email sharing error:', error);
    
    if (error.message.includes('Email credentials not configured')) {
      return res.status(500).json({ 
        error: 'Email service not configured',
        message: error.message,
        setupInstructions: 'Please configure EMAIL_USER and EMAIL_PASS in your .env file.'
      });
    }
    
    if (error.code === 'EAUTH') {
      return res.status(401).json({ 
        error: 'Email authentication failed. Please check your email credentials.' 
      });
    }
    
    if (error.code === 'ECONNECTION') {
      return res.status(500).json({ 
        error: 'Failed to connect to email server. Please check your email configuration.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to share summary',
      message: error.message 
    });
  }
});

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_USER === 'your_email@gmail.com' || 
        process.env.EMAIL_PASS === 'your_app_password_here') {
      return res.status(500).json({
        error: 'Email service not configured',
        message: 'Please set up EMAIL_USER and EMAIL_PASS in your .env file.',
        setupInstructions: 'Set EMAIL_USER and EMAIL_PASS in your .env file to enable email sharing.'
      });
    }

    const transporter = createTransporter();
    
    // Verify connection configuration
    await transporter.verify();
    
    res.json({
      success: true,
      message: 'Email configuration is valid'
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      error: 'Email configuration test failed',
      message: error.message
    });
  }
});

module.exports = router;
