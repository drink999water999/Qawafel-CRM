'use client';

import { useState, useEffect } from 'react';
import { getNotes, addNote, deleteNote } from '@/lib/noteActions';

interface Note {
  id: number;
  content: string;
  createdAt: Date;
  userId: string;
  userName: string;
}

interface NotesProps {
  entityType: 'lead' | 'customer' | 'merchant';
  entityId: number;
  entityName: string;
}

export default function Notes({ entityType, entityId, entityName }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId]);

  const loadNotes = async () => {
    setIsLoading(true);
    const result = await getNotes(entityType, entityId);
    if (result.success && result.notes) {
      setNotes(result.notes);
    }
    setIsLoading(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    const result = await addNote(entityType, entityId, newNote);
    
    if (result.success) {
      setNewNote('');
      loadNotes();
    } else {
      alert(result.error || 'Failed to add note');
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Delete this note?')) return;

    const result = await deleteNote(noteId);
    if (result.success) {
      loadNotes();
    } else {
      alert(result.error || 'Failed to delete note');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Notes for {entityName}
      </h3>

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={3}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newNote.trim()}
          className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Note'}
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500 text-center py-4">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {note.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  title="Delete note"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
