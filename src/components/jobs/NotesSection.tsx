import { useState } from 'react'
import { useJobNotes } from '../../hooks/useJobNotes'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  Send, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  User
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { JobNote } from '../../lib/supabase'

interface NotesSectionProps {
  jobId: string
  isExpanded: boolean
  onToggle: () => void
  notesCount: number
}

export function NotesSection({ jobId, isExpanded, onToggle, notesCount }: NotesSectionProps) {
  const { user } = useAuth()
  const { notes, isLoading, createNote, updateNote, deleteNote, isCreating } = useJobNotes(jobId)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteContent.trim()) return

    createNote(newNoteContent)
    setNewNoteContent('')
  }

  const handleEditNote = (note: JobNote) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
  }

  const handleSaveEdit = () => {
    if (!editingNoteId || !editContent.trim()) return

    updateNote({ noteId: editingNoteId, content: editContent })
    setEditingNoteId(null)
    setEditContent('')
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditContent('')
  }

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId)
    }
  }

  return (
    <div className="border-t border-gray-200 mt-4">
      {/* Header - Notes toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={16} />
          <span>
            {notesCount === 0 ? 'Add a note' : `${notesCount} note${notesCount > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* Expanded notes section */}
      {isExpanded && (
        <div className="pb-3">
          {/* Notes list */}
          {isLoading ? (
            <div className="py-4 text-center text-gray-500 text-sm">
              Loading notes...
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-3 mb-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                  {/* Note header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <User size={12} />
                      <span className="font-medium">
                        {note.user?.name || note.user?.email || 'Unknown user'}
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                    </div>
                    
                    {/* Actions (only for note author) */}
                    {note.user_id === user?.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit note"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Note content */}
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={2}
                        placeholder="Edit your note..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <X size={12} />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          <Check size={12} />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500 text-sm">
              No notes yet. Add the first one below!
            </div>
          )}

          {/* Add new note form */}
          <form onSubmit={handleSubmitNote} className="space-y-3">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add a note..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              disabled={isCreating}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!newNoteContent.trim() || isCreating}
                className="flex items-center gap-2"
              >
                <Send size={14} />
                {isCreating ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
