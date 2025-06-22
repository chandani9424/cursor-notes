import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createNote } from '@/lib/create-note'
import { searchNotes } from '@/lib/search'
import { groupNotesByCategory } from '@/lib/note-utils'
import { Note } from '@/lib/types'

// Mock all dependencies
jest.mock('@/utils/supabase/client', () => {
  const actual = jest.requireActual('@/utils/supabase/client');
  return {
    ...actual,
    createClient: jest.fn(),
  };
});

describe('Notes Application Integration Tests', () => {
  const mockNotes = [
    {
      id: '1',
      slug: 'note-1',
      title: 'React Tutorial',
      content: 'Learn React basics and hooks',
      created_at: new Date().toISOString(),
      session_id: 'session-1',
      public: false,
      emoji: '⚛️'
    },
    {
      id: '2',
      slug: 'note-2',
      title: 'JavaScript Guide',
      content: 'Advanced JavaScript concepts',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      session_id: 'session-1',
      public: true,
      emoji: '📚'
    },
    {
      id: '3',
      slug: 'note-3',
      title: 'TypeScript Notes',
      content: 'TypeScript fundamentals',
      created_at: '2024-01-10T10:00:00Z',
      session_id: 'session-2',
      public: false,
      emoji: '🔷'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Note Creation Workflow', () => {
    let mockSupabase: any;
    let mockRouter: any;
    let mockAddNewPinnedNote: jest.Mock;
    let mockRefreshSessionNotes: jest.Mock;
    let mockSetSelectedNoteSlug: jest.Mock;

    beforeEach(() => {
      mockSupabase = {
        from: jest.fn(() => ({
          insert: jest.fn().mockResolvedValue({ data: { id: 'test-note-id' }, error: null })
        }))
      };
      mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
      };
      mockAddNewPinnedNote = jest.fn();
      mockRefreshSessionNotes = jest.fn().mockResolvedValue(undefined);
      mockSetSelectedNoteSlug = jest.fn();
      const { createClient } = require('@/utils/supabase/client');
      createClient.mockReturnValue(mockSupabase);
    });

    it('should create a new note and add it to the list', async () => {
      // Create a new note
      await createNote(
        'session-1',
        mockRouter as any,
        mockAddNewPinnedNote,
        mockRefreshSessionNotes,
        mockSetSelectedNoteSlug,
        false
      )

      // Verify the note was created
      expect(mockAddNewPinnedNote).toHaveBeenCalledWith(
        expect.stringMatching(/^new-note-/)
      )
      expect(mockRefreshSessionNotes).toHaveBeenCalled()
      expect(mockSetSelectedNoteSlug).toHaveBeenCalledWith(
        expect.stringMatching(/^new-note-/)
      )
    })

    it('should handle note creation errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Mock Supabase to return an error
      const { createClient } = require('@/utils/supabase/client')
      createClient.mockReturnValue({
        from: jest.fn(() => ({
          insert: jest.fn().mockResolvedValue({ error: new Error('Database error') })
        }))
      })

      const mockRouter = {
        push: jest.fn(),
        refresh: jest.fn()
      }

      await createNote(
        'session-1',
        mockRouter as any,
        jest.fn(),
        jest.fn(),
        jest.fn(),
        false
      )

      expect(consoleSpy).toHaveBeenCalledWith('Error creating note:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('Search and Filter Workflow', () => {
    const mockNotes: Note[] = [
      {
        id: '1',
        slug: 'note-1',
        title: 'React Tutorial',
        content: 'Learn React basics',
        created_at: '2024-01-15T10:00:00Z',
        session_id: 'session-1',
        public: false,
        emoji: '📝'
      },
      {
        id: '2',
        slug: 'note-2',
        title: 'JavaScript Guide',
        content: 'Advanced JavaScript concepts',
        created_at: '2024-01-16T10:00:00Z',
        session_id: 'session-2',
        public: true,
        emoji: '📚'
      },
      {
        id: '3',
        slug: 'note-3',
        title: 'TypeScript Notes',
        content: 'TypeScript fundamentals and React integration',
        created_at: '2024-01-17T10:00:00Z',
        session_id: 'session-1',
        public: false,
        emoji: '🔷'
      }
    ]

    it('should search and filter notes correctly', () => {
      const searchResults = searchNotes(mockNotes, 'React', 'session-1')
      
      expect(searchResults).toHaveLength(2)
      expect(searchResults[0].title).toBe('React Tutorial')
      expect(searchResults[1].title).toBe('TypeScript Notes')
    })

    it('should group notes by category correctly', () => {
      const pinnedNotes = new Set<string>()
      const groupedNotes = groupNotesByCategory(mockNotes, pinnedNotes)
      
      expect(groupedNotes.pinned).toBeDefined()
      expect(groupedNotes.today).toBeDefined()
      expect(groupedNotes.yesterday).toBeDefined()
      expect(groupedNotes.older).toBeDefined()
    })

    it('should handle empty search results', () => {
      const searchResults = searchNotes(mockNotes, 'nonexistent', 'session-1')
      
      expect(searchResults).toHaveLength(0)
    })

    it('should respect session isolation for private notes', () => {
      const session1Results = searchNotes(mockNotes, 'TypeScript', 'session-1')
      const session2Results = searchNotes(mockNotes, 'TypeScript', 'session-2')
      
      expect(session1Results).toHaveLength(1) // Own private note
      expect(session2Results).toHaveLength(0) // No access to other session's private note
    })

    it('should allow access to public notes across sessions', () => {
      const session1Results = searchNotes(mockNotes, 'JavaScript', 'session-1')
      const session2Results = searchNotes(mockNotes, 'JavaScript', 'session-2')
      
      expect(session1Results).toHaveLength(1) // Public note accessible
      expect(session2Results).toHaveLength(1) // Public note accessible
      expect(session1Results[0].title).toBe('JavaScript Guide')
      expect(session2Results[0].title).toBe('JavaScript Guide')
    })
  })

  describe('Data Validation Workflow', () => {
    it('should handle notes with missing optional fields', () => {
      const notesWithMissingFields: Note[] = [
        {
          id: '1',
          slug: 'note-1',
          title: 'Test Note',
          content: 'Test content',
          created_at: '2024-01-15T10:00:00Z',
          session_id: 'session-1',
          public: false
          // emoji is optional
        }
      ]
      
      const searchResults = searchNotes(notesWithMissingFields, 'Test', 'session-1')
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].title).toBe('Test Note')
    })

    it('should handle notes with empty content', () => {
      const notesWithEmptyContent: Note[] = [
        {
          id: '1',
          slug: 'note-1',
          title: 'Empty Note',
          content: '',
          created_at: '2024-01-15T10:00:00Z',
          session_id: 'session-1',
          public: false,
          emoji: '📝'
        }
      ]
      
      const searchResults = searchNotes(notesWithEmptyContent, 'Empty', 'session-1')
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].title).toBe('Empty Note')
    })
  })

  describe('Performance Workflow', () => {
    it('should handle large number of notes efficiently', () => {
      const largeNotesArray: Note[] = Array.from({ length: 1000 }, (_, index) => ({
        id: `note-${index}`,
        slug: `note-${index}`,
        title: `Note ${index}`,
        content: `Content for note ${index}`,
        created_at: '2024-01-15T10:00:00Z',
        session_id: 'session-1',
        public: false,
        emoji: '📝'
      }))
      
      const startTime = performance.now()
      const searchResults = searchNotes(largeNotesArray, 'Note 500', 'session-1')
      const endTime = performance.now()
      
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].title).toBe('Note 500')
      expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
    })
  })
}) 