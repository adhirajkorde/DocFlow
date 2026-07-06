import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getDocument, updateDocument } from '../services/documents';
import { ArrowLeft, AlertCircle, Users, Loader2 } from 'lucide-react';
import DocumentEditor from '../components/DocumentEditor';
import ShareModal from '../components/ShareModal';
import { ToastContext } from '../context/ToastContext';

const EditorPage = () => {
  const { id } = useParams();
  const toast = useContext(ToastContext);
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const doc = await getDocument(id);
      setDocument(doc);
      setTitle(doc.title);
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 403 || err.response.status === 400)) {
        setError(err.response.data?.error?.message || 'Document not found or access denied');
      } else {
        setError('Failed to load document');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTitleBlur = async () => {
    if (!title.trim() || title === document.title) {
      setTitle(document?.title || '');
      return;
    }
    
    try {
      const updated = await updateDocument(id, { title: title.trim() });
      setDocument(updated);
      toast.success('Title updated');
    } catch (err) {
      toast.error('Failed to rename document. Please try again.');
      setTitle(document.title);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col transition-colors">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading document...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col transition-colors">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center px-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-6">
            <AlertCircle size={48} className="text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{error}</p>
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-xl transition-colors">
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </Link>
        </main>
      </div>
    );
  }

  const isOwner = document?.permission === 'owner';
  const isViewOnly = document?.permission === 'view';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col transition-colors selection:bg-indigo-100 dark:selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100">
      <Navbar />
      
      {/* Sticky Header */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-[#0e1117]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 pr-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-xl transition-all shrink-0">
              <ArrowLeft size={18} />
            </Link>
            
            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/dashboard" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors hidden sm:block">Dashboard</Link>
              <span className="hidden sm:block">/</span>
              <span className="truncate max-w-[150px] sm:max-w-[300px] font-medium text-gray-900 dark:text-gray-200">
                {title || 'Untitled'}
              </span>
              {isViewOnly && (
                <span className="text-[10px] uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-bold border border-gray-200 dark:border-gray-700 shrink-0">
                  Read Only
                </span>
              )}
            </div>
          </div>
          
          {isOwner && (
            <button
              onClick={() => setIsSharing(true)}
              className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 py-2 px-4 rounded-xl transition-colors text-sm font-semibold border border-indigo-200/50 dark:border-indigo-700/30 shrink-0 shadow-sm"
            >
              <Users size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-12 py-10 flex flex-col h-full">
        {/* Notion-like Title Area */}
        <div className="mb-8">
          {!isOwner ? (
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight break-words">
              {title}
            </h1>
          ) : (
            <input
              type="text"
              className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight border-none bg-transparent focus:ring-0 focus:outline-none placeholder-gray-300 dark:placeholder-gray-700 w-full break-words py-2 resize-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              maxLength={150}
              placeholder="Untitled Document"
            />
          )}
        </div>

        {/* Editor Wrapper */}
        <div className="flex-1 w-full flex flex-col relative">
           <DocumentEditor documentId={id} initialContent={document.content} permission={document.permission} />
        </div>
      </main>

      {isSharing && (
        <ShareModal documentId={document.id} onClose={() => setIsSharing(false)} />
      )}
    </div>
  );
};

export default EditorPage;
