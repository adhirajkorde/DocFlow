import React, { useRef, useState, useContext } from 'react';
import { Upload, Loader2, X, UploadCloud, FileText } from 'lucide-react';
import { importDocument } from '../services/documents';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';

const FileUploadButton = () => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useContext(ToastContext);
  const navigate = useNavigate();

  const handleFileChange = async (file) => {
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const validExts = ['.txt', '.md'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(fileExt)) {
      toast.error('Invalid file type. Only .txt and .md allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 2MB.');
      return;
    }

    setIsUploading(true);
    try {
      const doc = await importDocument(file);
      toast.success('File imported successfully');
      setIsModalOpen(false);
      navigate(`/documents/${doc.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to import file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition-all font-medium text-sm"
      >
        <Upload size={18} className="text-gray-500 dark:text-gray-400" />
        <span>Import</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60 transition-opacity" onClick={() => !isUploading && setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl w-full max-w-md mx-auto flex flex-col overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-800">
            
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#161b22]/50 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Import Document</h3>
              <button 
                onClick={() => !isUploading && setIsModalOpen(false)} 
                disabled={isUploading}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-full disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div 
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  accept=".txt,.md"
                  className="hidden"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Importing document...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
                      <UploadCloud size={32} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Supported formats: Markdown or Plain Text</p>
                    
                    <div className="flex items-center space-x-3 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                      <span className="flex items-center"><FileText size={14} className="mr-1" /> .md</span>
                      <span>•</span>
                      <span className="flex items-center"><FileText size={14} className="mr-1" /> .txt</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUploadButton;
