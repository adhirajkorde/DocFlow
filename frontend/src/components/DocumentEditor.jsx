import React, { useState, useEffect, useRef, useContext } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { updateDocument } from '../services/documents';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { useDebouncedSave } from '../utils/useDebounceSave';
import { ToastContext } from '../context/ToastContext';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['clean'],
  ],
};

const readOnlyModules = {
  toolbar: false,
};

const DocumentEditor = ({ documentId, initialContent, permission = 'owner' }) => {
  const toast = useContext(ToastContext);
  const [content, setContent] = useState(initialContent || '');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isRetrying, setIsRetrying] = useState(false);
  const isSavingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastSavedContentRef = useRef(initialContent || '');
  const retryTimeoutRef = useRef(null);

  const isViewOnly = permission === 'view';

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  const performSave = async (contentToSave, isRetry = false, isManual = false) => {
    if (isViewOnly) return;
    
    if (isManual) {
      // Immediate feedback for perceived performance
      toast.success('Document saved successfully');
    }

    if (isSavingRef.current && !isRetry) return;
    if (contentToSave === lastSavedContentRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');
    setIsRetrying(isRetry);

    try {
      await updateDocument(documentId, { content: contentToSave });
      if (!isMountedRef.current) return;
      lastSavedContentRef.current = contentToSave;
      isSavingRef.current = false;
      setSaveStatus('idle');
    } catch (error) {
      if (!isMountedRef.current) return;
      isSavingRef.current = false;
      setSaveStatus('error');
      setIsRetrying(true);
      
      if (!isManual) {
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            performSave(latestContentRef.current, true);
          }
        }, 3000);
      } else {
        toast.error('Failed to save document. Retrying in background...');
      }
    }
  };

  const latestContentRef = useRef(content);
  useEffect(() => {
    latestContentRef.current = content;
  }, [content]);

  const { debouncedSave, cancel: cancelDebounce } = useDebouncedSave((contentToSave) => {
    if (!isViewOnly) {
      performSave(contentToSave, false, false);
    }
  }, 1500);

  const handleChange = (newContent, delta, source) => {
    setContent(newContent);
    if (source === 'user' && !isViewOnly) {
      debouncedSave(newContent);
    }
  };

  const handleManualSave = () => {
    if (isViewOnly) return;
    cancelDebounce();
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    performSave(content, false, true);
  };

  return (
    <div className={`flex flex-col flex-1 h-full w-full relative quill-wrapper group ${isViewOnly ? 'read-only' : ''}`}>
      {!isViewOnly && (
        <div className="absolute top-2.5 right-4 z-10 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-sm font-medium">
            {saveStatus === 'error' && (
              <span className="text-red-500 dark:text-red-400 flex items-center space-x-1.5 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-lg shadow-sm border border-red-100 dark:border-red-900/50 backdrop-blur-md">
                <AlertCircle size={14} />
                <span>{isRetrying ? 'Retrying...' : 'Save failed'}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleManualSave}
            className="bg-white/80 dark:bg-[#161b22]/80 hover:bg-white dark:hover:bg-[#21262d] text-gray-700 dark:text-gray-200 py-1.5 px-4 rounded-lg text-sm font-medium shadow-sm transition-all border border-gray-200 dark:border-gray-700 backdrop-blur-md"
          >
            Save
          </button>
        </div>
      )}

      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={isViewOnly ? readOnlyModules : modules}
        readOnly={isViewOnly}
        className="h-full flex flex-col border-none flex-1"
      />
    </div>
  );
};

export default DocumentEditor;
