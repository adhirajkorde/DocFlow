import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Edit2, Trash2, Users } from 'lucide-react';
import ShareModal from './ShareModal';

const DocumentCard = ({ document, onRename, onDelete, variant = 'owned' }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(document.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleCardClick = (e) => {
    if (!isEditing && !isSharing) {
      navigate(`/documents/${document.id}`);
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (editTitle.trim() === '' || editTitle === document.title) {
      setIsEditing(false);
      setEditTitle(document.title);
      return;
    }
    
    try {
      await onRename(document.id, editTitle.trim());
      setIsEditing(false);
    } catch (err) {
      setEditTitle(document.title);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure? This cannot be undone.")) {
      setIsDeleting(true);
      onDelete(document.id).catch(() => setIsDeleting(false));
    }
  };

  // Extract plain text from HTML content for preview (simple regex, for UI purposes only)
  const previewText = document.content ? document.content.replace(/<[^>]+>/g, '').substring(0, 80) : 'No content yet...';

  return (
    <>
      <div 
        className={`group bg-white dark:bg-[#161b22] rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-gray-100 dark:border-gray-800 p-5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-h-[160px] ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleRenameSubmit} className="flex-1" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  autoFocus
                  className="w-full px-2 py-1 border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-gray-900 dark:text-white bg-transparent font-medium"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onBlur={handleRenameSubmit}
                  maxLength={150}
                />
              </form>
            ) : (
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 tracking-tight">
                {document.title}
              </h4>
            )}
          </div>
          
          {variant === 'owned' && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setIsSharing(true)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title="Share"
              >
                <Users size={16} />
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title="Rename"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={handleDeleteClick}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex-1">
           <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
             {previewText}
           </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {document.updatedAt ? formatDistanceToNow(new Date(document.updatedAt)) : 'Unknown time'} ago
          </p>
          
          {variant === 'shared' && (
            <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-md max-w-[50%]">
              <span className={`w-1.5 h-1.5 rounded-full ${document.permission === 'edit' ? 'bg-indigo-500' : 'bg-gray-400'}`}></span>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 truncate" title={`Shared by ${document.ownerName}`}>
                by {document.ownerName?.split(' ')[0] || 'Unknown'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {isSharing && variant === 'owned' && (
        <ShareModal documentId={document.id} onClose={() => setIsSharing(false)} />
      )}
    </>
  );
};

export default DocumentCard;
