import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { listDocuments, createDocument, updateDocument, deleteDocument, listSharedWithMe } from '../services/documents';
import DocumentCard from '../components/DocumentCard';
import FileUploadButton from '../components/FileUploadButton';
import { Plus, FileText, Users, Clock, FileQuestion, FilePlus } from 'lucide-react';
import { ToastContext } from '../context/ToastContext';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const [owned, shared] = await Promise.all([
        listDocuments(),
        listSharedWithMe()
      ]);
      setDocuments(owned);
      setSharedDocs(shared);
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    const title = window.prompt("Enter document title:");
    if (!title || title.trim() === '') return;

    try {
      setIsCreating(true);
      const newDoc = await createDocument(title.trim());
      toast.success('Document created successfully');
      navigate(`/documents/${newDoc.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create document');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRename = async (id, newTitle) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, title: newTitle } : doc));
    try {
      await updateDocument(id, { title: newTitle });
      toast.success('Document renamed');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to rename document');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete document');
      throw err;
    }
  };

  const SkeletonLoaders = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse h-40 flex flex-col justify-between">
          <div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700/50 rounded-md w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-md w-full mb-2"></div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-md w-2/3"></div>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700/50 rounded-md w-1/3"></div>
        </div>
      ))}
    </div>
  );

  const stats = [
    { label: 'Total Documents', value: loading ? '-' : documents.length, icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Shared with Me', value: loading ? '-' : sharedDocs.length, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Recently Edited', value: loading ? '-' : [...documents, ...sharedDocs].filter(d => new Date(d.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: Clock, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0d1117] flex flex-col transition-colors">
      <Navbar />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and collaborate on your documents</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FileUploadButton />
            <button
              onClick={handleCreateNew}
              disabled={isCreating}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-5 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-75 disabled:cursor-not-allowed font-medium text-sm"
            >
              <Plus size={18} />
              <span>{isCreating ? 'Creating...' : 'New Document'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 flex items-center space-x-3">
            <FileQuestion size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center space-x-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Documents Content */}
        <div className="space-y-16">
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">My Documents</h3>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-1 px-3 rounded-full text-xs font-semibold">{documents.length}</span>
            </div>
            
            {loading ? (
              <SkeletonLoaders />
            ) : documents.length === 0 ? (
              <div className="bg-white dark:bg-[#161b22] p-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-full mb-4">
                  <FilePlus size={32} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No documents yet</h4>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">Create your first document to start writing, planning, and collaborating.</p>
                <button onClick={handleCreateNew} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center space-x-1">
                  <Plus size={16} /> <span>Create Document</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {documents.map(doc => (
                  <DocumentCard 
                    key={doc.id} 
                    document={doc} 
                    onRename={handleRename}
                    onDelete={handleDelete}
                    variant="owned"
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center space-x-3 mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Shared With Me</h3>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-1 px-3 rounded-full text-xs font-semibold">{sharedDocs.length}</span>
            </div>
            
            {loading ? (
              <SkeletonLoaders />
            ) : sharedDocs.length === 0 ? (
              <div className="bg-transparent p-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center min-h-[250px]">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-full mb-4">
                  <Users size={32} className="text-purple-500 dark:text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No shared documents</h4>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Documents that others share with you will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {sharedDocs.map(doc => (
                  <DocumentCard 
                    key={doc.id} 
                    document={doc} 
                    variant="shared"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
