import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Save, X, Check, Loader2 } from 'lucide-react';

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const EditableContent = ({ content, onSave, isEditing = false, onToggleEdit }) => {
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [editing, setEditing] = useState(isEditing);
  const contentRef = useRef(null);
  const saveDebounced = useRef(null);
  const initialContentSet = useRef(false);

  useEffect(() => {
    setEditedContent(content);
    setHasChanges(false);
    setShowSaved(false);
    initialContentSet.current = false;
  }, [content]);

  useEffect(() => {
    setEditing(isEditing);
  }, [isEditing]);

  useEffect(() => {
    if (editing && contentRef.current && !initialContentSet.current) {
      contentRef.current.innerHTML = editedContent;
      contentRef.current.focus();
      initialContentSet.current = true;
    }
  }, [editing, editedContent]);

  // Debounced auto-save
  useEffect(() => {
    if (!editing) return;
    if (!hasChanges) return;
    if (!saveDebounced.current) {
      saveDebounced.current = debounce(async (val) => {
        setIsSaving(true);
        try {
          await onSave(val);
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 1200);
          setHasChanges(false);
        } catch (e) {
          // Optionally show error
        } finally {
          setIsSaving(false);
        }
      }, 1500);
    }
    saveDebounced.current(editedContent);
    // eslint-disable-next-line
  }, [editedContent]);

  const handleContentChange = (e) => {
    const newContent = e.target.innerHTML;
    setEditedContent(newContent);
    setHasChanges(newContent !== content);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      await onSave(editedContent);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1200);
      setHasChanges(false);
    } catch (error) {
      // Optionally show error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setHasChanges(false);
    setEditing(false);
    if (onToggleEdit) onToggleEdit(false);
  };

  const handleKeyDown = (e) => {
    // Save on Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    // Cancel on Escape
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (editing) {
    return (
      <div className="relative">
        {/* Edit Toolbar - Auto-save only */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-700">Editing Mode</span>
          {isSaving && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          )}
          {showSaved && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">Saved!</span>
            </div>
          )}
          {hasChanges && !isSaving && !showSaved && (
            <div className="flex items-center gap-2 text-yellow-600">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Unsaved changes</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">Auto-save enabled</span>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <X className="w-4 h-4 inline mr-1" /> Exit Edit
            </button>
          </div>
        </div>
        <div
          ref={contentRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          className="property-analysis-content min-h-[500px] outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg p-6 border border-gray-300 bg-white"
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Edit Button - always visible in top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => { setEditing(true); if (onToggleEdit) onToggleEdit(true); }}
          className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md opacity-0 group-hover:opacity-100"
          title="Edit Content"
        >
          <Edit3 className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      {/* Read-only Content */}
      <div 
        className="property-analysis-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default EditableContent; 