import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Mail, Send, Loader2 } from 'lucide-react';
import { Summary } from '../types';

interface EmailShareModalProps {
  summary: Summary;
  summaryContent: string;
  onClose: () => void;
}

const EmailShareModal: React.FC<EmailShareModalProps> = ({ summary, summaryContent, onClose }) => {
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [subject, setSubject] = useState(`Meeting Summary: ${summary.title}`);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const handleSend = async () => {
    const validRecipients = recipients.filter(email => email.trim() !== '');
    
    if (validRecipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validRecipients.filter(email => !emailRegex.test(email.trim()));
    
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryId: summary.id,
          recipients: validRecipients.map(email => email.trim()),
          subject: subject.trim(),
          message: message.trim(),
          summaryContent
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Summary shared successfully with ${validRecipients.length} recipient(s)!`);
        onClose();
      } else {
        // Handle email configuration errors
        if (data.error && data.error.includes('Email service not configured')) {
          toast.error('Email sharing is not configured. Please set up email credentials in the backend.', {
            duration: 6000,
          });
          console.log('Email setup instructions:', data.setupInstructions);
        } else {
          toast.error(data.error || 'Failed to share summary');
        }
      }
    } catch (error) {
      console.error('Error sharing summary:', error);
      toast.error('Failed to share summary. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-purple-500" />
            Share Summary via Email
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recipients *
            </label>
            <div className="space-y-2">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={recipient}
                    onChange={(e) => updateRecipient(index, e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {recipients.length > 1 && (
                    <button
                      onClick={() => removeRecipient(index)}
                      className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addRecipient}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:bg-purple-50 px-3 py-2 rounded-md transition-colors"
              >
                + Add Another Recipient
              </button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note to your email..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
            />
          </div>

          {/* Summary Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary Preview
            </label>
            <div className="bg-gray-50 p-4 rounded-md max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {summaryContent.length > 200 
                  ? `${summaryContent.substring(0, 200)}...` 
                  : summaryContent
                }
              </p>
            </div>
          </div>

          {/* Email Configuration Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Email Configuration Required
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    To enable email sharing, you need to configure email credentials in your backend.
                    Set up EMAIL_USER and EMAIL_PASS in your .env file.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
              )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailShareModal;
