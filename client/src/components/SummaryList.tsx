import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Calendar, 
  Edit3, 
  Trash2, 
  Share2, 
  Download, 
  RefreshCw,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Summary } from '../types';
import EmailShareModal from './EmailShareModal';

interface SummaryListProps {
  summaries: Summary[];
  loading: boolean;
  onSummaryUpdated: (summary: Summary) => void;
  onSummaryDeleted: (summaryId: number) => void;
  onRefresh: () => void;
}

const SummaryList: React.FC<SummaryListProps> = ({
  summaries,
  loading,
  onSummaryUpdated,
  onSummaryDeleted,
  onRefresh
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Set<number>>(new Set());

  const handleEdit = (summary: Summary) => {
    setEditingId(summary.id);
    setEditTitle(summary.title);
    setEditContent(summary.editedSummary);
  };

  const handleSave = async (summaryId: number) => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Title and content cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/summaries/${summaryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          editedSummary: editContent.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedSummary = {
          ...summaries.find(s => s.id === summaryId)!,
          title: editTitle.trim(),
          editedSummary: editContent.trim(),
          updatedAt: new Date().toISOString()
        };
        onSummaryUpdated(updatedSummary);
        setEditingId(null);
        toast.success('Summary updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update summary');
      }
    } catch (error) {
      console.error('Error updating summary:', error);
      toast.error('Failed to update summary. Please try again.');
    }
  };

  const handleDelete = async (summaryId: number) => {
    if (!window.confirm('Are you sure you want to delete this summary? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/summaries/${summaryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onSummaryDeleted(summaryId);
        toast.success('Summary deleted successfully!');
      } else {
        toast.error(data.error || 'Failed to delete summary');
      }
    } catch (error) {
      console.error('Error deleting summary:', error);
      toast.error('Failed to delete summary. Please try again.');
    }
  };

  const handleDownload = (summary: Summary) => {
    const blob = new Blob([summary.editedSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  const handleShare = (summary: Summary) => {
    setSelectedSummary(summary);
    setShowEmailModal(true);
  };

  const toggleExpanded = (summaryId: number) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(summaryId)) {
      newExpanded.delete(summaryId);
    } else {
      newExpanded.add(summaryId);
    }
    setExpandedSummaries(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading summaries...</span>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No summaries yet</h3>
        <p className="text-gray-600 mb-4">Generate your first summary to get started!</p>
        <button
          onClick={onRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Saved Summaries ({summaries.length})
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Summaries List */}
      <div className="space-y-4">
        {summaries.map((summary) => (
          <div key={summary.id} className="bg-white rounded-lg shadow-sm border">
            {/* Summary Header */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingId === summary.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-lg font-semibold text-gray-900 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900">{summary.title}</h3>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(summary.createdAt)}
                    {summary.updatedAt !== summary.createdAt && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Updated {formatDate(summary.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {editingId === summary.id ? (
                    <>
                      <button
                        onClick={() => handleSave(summary.id)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-md transition-colors"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-2 rounded-md transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(summary)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(summary)}
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-2 rounded-md transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare(summary)}
                        className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded-md transition-colors"
                        title="Share via Email"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(summary.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Content */}
            <div className="p-4">
              {editingId === summary.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
              ) : (
                <div>
                  <button
                    onClick={() => toggleExpanded(summary.id)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
                  >
                    {expandedSummaries.has(summary.id) ? (
                      <EyeOff className="w-4 h-4 mr-1" />
                    ) : (
                      <Eye className="w-4 h-4 mr-1" />
                    )}
                    {expandedSummaries.has(summary.id) ? 'Show Less' : 'Show More'}
                  </button>
                  
                  <div className={`text-gray-700 leading-relaxed ${
                    expandedSummaries.has(summary.id) ? '' : 'max-h-24 overflow-hidden'
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {summary.editedSummary}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Instructions (if any) */}
            {summary.customInstruction && (
              <div className="px-4 pb-4">
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                  <strong>Custom Instructions:</strong> {summary.customInstruction}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Email Share Modal */}
      {showEmailModal && selectedSummary && (
        <EmailShareModal
          summary={selectedSummary}
          summaryContent={selectedSummary.editedSummary}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedSummary(null);
          }}
        />
      )}
    </div>
  );
};

export default SummaryList;
