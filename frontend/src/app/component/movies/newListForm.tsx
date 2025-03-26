import React, { useRef, useEffect, useCallback } from 'react';

interface NewListFormProps {
  newListTitle: string;
  setNewListTitle: (title: string) => void;
  newListNote: string;
  setNewListNote: (note: string) => void;
  isCreatingList: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const NewListForm = React.memo(({ 
  newListTitle, 
  setNewListTitle, 
  newListNote, 
  setNewListNote,
  isCreatingList,
  onSubmit,
  onCancel
}: NewListFormProps) => {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the input only on initial mount
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);
  
  // Create memoized handlers to prevent focus issues
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewListTitle(e.target.value);
  }, [setNewListTitle]);
  
  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewListNote(e.target.value);
  }, [setNewListNote]);

  return (
    <form onSubmit={onSubmit} className="bg-[#13131b] p-4 rounded-lg border border-[#2a2a34] mb-4">
      <h3 className="text-lg font-semibold text-[#e4c9a3] mb-3">Create New List</h3>
      
      <div className="mb-3">
        <label htmlFor="newListTitle" className="block text-sm font-medium mb-1">
          List Title <span className="text-red-500">*</span>
        </label>
        <input
          ref={titleInputRef}
          type="text"
          id="newListTitle"
          value={newListTitle}
          onChange={handleTitleChange}
          className="w-full p-2 rounded-lg bg-[#0d0d14] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3]"
          required
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="newListNote" className="block text-sm font-medium mb-1">
          Notes <span className="text-red-500">*</span>
        </label>
        <textarea
          ref={notesRef}
          id="newListNote"
          value={newListNote}
          onChange={handleNotesChange}
          onFocus={(e) => {
            // Prevent any focus stealing
            e.stopPropagation();
          }}
          className="w-full p-2 rounded-lg bg-[#0d0d14] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3] min-h-[80px]"
          required
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-[#2a2a34] text-white py-1 px-3 rounded-lg hover:bg-[#3a3a44] transition duration-200 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[#d2b48c] text-[#0d0d14] py-1 px-4 rounded-lg hover:bg-[#e4c9a3] transition duration-200 disabled:opacity-50 text-sm"
          disabled={isCreatingList || !newListTitle.trim()}
        >
          {isCreatingList ? 'Creating...' : 'Create List'}
        </button>
      </div>
    </form>
  );
});

NewListForm.displayName = 'NewListForm';