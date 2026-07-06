import React, { useState, useEffect, useContext } from 'react';
import { shareDocument, revokeShare, listShares } from '../services/documents';
import { X, UserMinus, Loader2 } from 'lucide-react';
import { ToastContext } from '../context/ToastContext';

const ShareModal = ({ documentId, onClose }) => {
  const [shares, setShares] = useState([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const toast = useContext(ToastContext);

  useEffect(() => {
    fetchShares();
  }, [documentId]);

  const fetchShares = async () => {
    try {
      const data = await listShares(documentId);
      setShares(data);
    } catch (err) {
      toast.error('Failed to load shares.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email.');
      return;
    }
    
    setSharing(true);
    try {
      await shareDocument(documentId, email, permission);
      toast.success('Document shared successfully');
      setEmail('');
      await fetchShares();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to share document.');
    } finally {
      setSharing(false);
    }
  };

  const handleRevoke = async (userId) => {
    try {
      await revokeShare(documentId, userId);
      setShares(shares.filter(s => s.sharedWithUser.id !== userId));
      toast.success('Access removed');
    } catch (err) {
      toast.error('Failed to remove user.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60 transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-800">
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#161b22]/50 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Share Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form onSubmit={handleShare} className="flex space-x-3 mb-8">
            <input
              type="email"
              placeholder="Enter email address..."
              required
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-gray-50/50 dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 transition-all text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-gray-50/50 dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 transition-all text-sm cursor-pointer"
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
              >
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <button
              type="submit"
              disabled={sharing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-5 rounded-xl shadow-sm hover:shadow transition-all text-sm font-medium disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
            >
              {sharing ? <Loader2 size={16} className="animate-spin" /> : 'Invite'}
            </button>
          </form>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">People with access</h4>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0d1117]/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">This document is not shared with anyone yet.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {shares.map(share => (
                  <li key={share.sharedWithUser.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group">
                    <div className="flex items-center space-x-3 overflow-hidden flex-1 pr-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm border border-indigo-200 dark:border-indigo-700/50">
                        {share.sharedWithUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{share.sharedWithUser.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{share.sharedWithUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {share.permission}
                      </span>
                      <button
                        onClick={() => handleRevoke(share.sharedWithUser.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remove access"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
