import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Sparkles, Loader2, Download, Share2 } from 'lucide-react';
import { Summary } from '../types';
import EmailShareModal from './EmailShareModal';

interface SummarizerProps {
  onSummaryGenerated: (summary: Summary) => void;
}

const Summarizer: React.FC<SummarizerProps> = ({ onSummaryGenerated }) => {
  const [text, setText] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [title, setTitle] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);

  const handleGenerateSummary = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to summarize');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          customInstruction: customInstruction.trim() || undefined,
          title: title.trim() || 'Untitled Summary'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedSummary(data.summary.generatedSummary);
        setEditedSummary(data.summary.generatedSummary);
        setCurrentSummary(data.summary);
        toast.success('Summary generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!currentSummary || !editedSummary.trim()) {
      toast.error('Please generate a summary first');
      return;
    }

    try {
      const response = await fetch(`/api/summaries/${currentSummary.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || currentSummary.title,
          editedSummary: editedSummary.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Summary saved successfully!');
        // Update the current summary with saved data
        const updatedSummary = {
          ...currentSummary,
          title: title || currentSummary.title,
          editedSummary: editedSummary.trim(),
          updatedAt: new Date().toISOString()
        };
        setCurrentSummary(updatedSummary);
        onSummaryGenerated(updatedSummary);
      } else {
        toast.error(data.error || 'Failed to save summary');
      }
    } catch (error) {
      console.error('Error saving summary:', error);
      toast.error('Failed to save summary. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!editedSummary) return;
    
    const blob = new Blob([editedSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'summary'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  const handleShare = () => {
    if (!editedSummary) {
      toast.error('Please generate a summary first');
      return;
    }
    setShowEmailModal(true);
  };

  const resetForm = () => {
    setText('');
    setCustomInstruction('');
    setTitle('');
    setGeneratedSummary('');
    setEditedSummary('');
    setCurrentSummary(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-500" />
          Input Transcript
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Summary Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your summary..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="customInstruction" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions (Optional)
            </label>
            <input
              type="text"
              id="customInstruction"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items'"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Transcript / Notes *
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your meeting transcript, call notes, or any text you want to summarize..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating || !text.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Summary Section */}
      {generatedSummary && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-green-500" />
            Generated Summary
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="editedSummary" className="block text-sm font-medium text-gray-700 mb-2">
                Edit Summary (Optional)
              </label>
              <textarea
                id="editedSummary"
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveSummary}
                className="bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                💾 Save Summary
              </button>
              
              <button
                onClick={handleDownload}
                className="bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              
              <button
                onClick={handleShare}
                className="bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share via Email
              </button>
              
              <button
                onClick={resetForm}
                className="bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                🔄 Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Share Modal */}
      {showEmailModal && (
        <EmailShareModal
          summary={currentSummary!}
          summaryContent={editedSummary}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};

export default Summarizer;
