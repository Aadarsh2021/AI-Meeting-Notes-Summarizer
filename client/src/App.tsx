import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Summarizer from './components/Summarizer';
import SummaryList from './components/SummaryList';
import { Summary } from './types';

function App() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [activeTab, setActiveTab] = useState<'summarizer' | 'summaries'>('summarizer');
  const [loading, setLoading] = useState(false);

  // Fetch summaries on component mount
  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/summaries');
      const data = await response.json();
      
      if (data.success) {
        setSummaries(data.summaries);
      }
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryGenerated = (newSummary: Summary) => {
    setSummaries(prev => [newSummary, ...prev]);
    setActiveTab('summaries');
  };

  const handleSummaryUpdated = (updatedSummary: Summary) => {
    setSummaries(prev => 
      prev.map(summary => 
        summary.id === updatedSummary.id ? updatedSummary : summary
      )
    );
  };

  const handleSummaryDeleted = (summaryId: number) => {
    setSummaries(prev => prev.filter(summary => summary.id !== summaryId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          <button
            onClick={() => setActiveTab('summarizer')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'summarizer'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            📝 New Summary
          </button>
          <button
            onClick={() => setActiveTab('summaries')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'summaries'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            📚 Saved Summaries
          </button>
        </div>

        {/* Content */}
        {activeTab === 'summarizer' ? (
          <Summarizer onSummaryGenerated={handleSummaryGenerated} />
        ) : (
          <SummaryList
            summaries={summaries}
            loading={loading}
            onSummaryUpdated={handleSummaryUpdated}
            onSummaryDeleted={handleSummaryDeleted}
            onRefresh={fetchSummaries}
          />
        )}
      </main>
    </div>
  );
}

export default App;
