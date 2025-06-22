import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { searchNotes } from '@/lib/search'
import { groupNotesByCategory } from '@/lib/note-utils'
import { Note } from '@/lib/types'

// Mock all dependencies for E2E testing
jest.mock('@/utils/supabase/client')
jest.mock('next/navigation')
jest.mock('@/components/ui/use-toast')

describe('Notes Application E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Journey: Note Creation and Search', () => {
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
      }
    ]

    it('should allow user to search for notes', () => {
      const searchResults = searchNotes(mockNotes, 'React', 'session-1')
      
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].title).toBe('React Tutorial')
    })

    it('should allow user to access public notes from other sessions', () => {
      const searchResults = searchNotes(mockNotes, 'JavaScript', 'session-1')
      
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].title).toBe('JavaScript Guide')
      expect(searchResults[0].public).toBe(true)
    })

    it('should group notes by category for organization', () => {
      const pinnedNotes = new Set<string>()
      const groupedNotes = groupNotesByCategory(mockNotes, pinnedNotes)
      
      expect(groupedNotes.pinned).toBeDefined()
      expect(Array.isArray(groupedNotes.pinned)).toBe(true)
    })
  })

  describe('User Journey: Data Management', () => {
    it('should handle notes with various content types', () => {
      const diverseNotes: Note[] = [
        {
          id: '1',
          slug: 'note-1',
          title: 'Code Example',
          content: '```javascript\nconsole.log("Hello World");\n```',
          created_at: '2024-01-15T10:00:00Z',
          session_id: 'session-1',
          public: false,
          emoji: '💻'
        },
        {
          id: '2',
          slug: 'note-2',
          title: 'Meeting Notes',
          content: 'Discuss project timeline and milestones',
          created_at: '2024-01-16T10:00:00Z',
          session_id: 'session-1',
          public: false,
          emoji: '📅'
        }
      ]
      
      const codeResults = searchNotes(diverseNotes, 'javascript', 'session-1')
      const meetingResults = searchNotes(diverseNotes, 'meeting', 'session-1')
      
      expect(codeResults).toHaveLength(1)
      expect(meetingResults).toHaveLength(1)
    })

    it('should handle special characters in note content', () => {
      const specialNotes: Note[] = [
        {
          id: '1',
          slug: 'note-1',
          title: 'Special Characters',
          content: 'Test with @#$%^&*() symbols and emojis 🚀🎉',
          created_at: '2024-01-15T10:00:00Z',
          session_id: 'session-1',
          public: false,
          emoji: '🔧'
        }
      ]
      
      const symbolResults = searchNotes(specialNotes, '@#$%', 'session-1')
      const emojiResults = searchNotes(specialNotes, '🚀', 'session-1')
      
      expect(symbolResults).toHaveLength(1)
      expect(emojiResults).toHaveLength(1)
    })
  })

  describe('User Journey: Performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset: Note[] = Array.from({ length: 5000 }, (_, index) => ({
        id: `note-${index}`,
        slug: `note-${index}`,
        title: `Note ${index}`,
        content: `Content for note ${index} with some unique text ${index * 2}`,
        created_at: '2024-01-15T10:00:00Z',
        session_id: 'session-1',
        public: false,
        emoji: '📝'
      }))
      
      const startTime = performance.now()
      const searchResults = searchNotes(largeDataset, 'unique text 1000', 'session-1')
      const endTime = performance.now()
      
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].title).toBe('Note 500')
      expect(endTime - startTime).toBeLessThan(200) // Should complete within 200ms
    })

    it('should handle complex search queries efficiently', () => {
      const complexNotes: Note[] = [
        {
          id: '1',
          slug: 'note-1',
          title: 'React TypeScript Integration',
          content: 'How to integrate React with TypeScript for better development experience',
          created_at: '2024-01-15T10:00:00Z',
          session_id: 'session-1',
          public: false,
          emoji: '⚛️'
        }
      ]
      
      const startTime = performance.now()
      const searchResults = searchNotes(complexNotes, 'React TypeScript Integration', 'session-1')
      const endTime = performance.now()
      
      expect(searchResults).toHaveLength(1)
      expect(endTime - startTime).toBeLessThan(50) // Should complete within 50ms
    })
  })

  describe('User Journey: Accessibility', () => {
    it('should handle search with different case variations', () => {
      const caseNotes: Note[] = [
        {
          id: '1',
          slug: 'note-1',
          title: 'JavaScript Fundamentals',
          content: 'Learn the basics of JavaScript programming',
          created_at: '2024-01-15T10:00:00Z',
          session_id: 'session-1',
          public: false,
          emoji: '📚'
        }
      ]
      
      const lowerCaseResults = searchNotes(caseNotes, 'javascript', 'session-1')
      const upperCaseResults = searchNotes(caseNotes, 'JAVASCRIPT', 'session-1')
      const mixedCaseResults = searchNotes(caseNotes, 'JavaScript', 'session-1')
      
      expect(lowerCaseResults).toHaveLength(1)
      expect(upperCaseResults).toHaveLength(1)
      expect(mixedCaseResults).toHaveLength(1)
      expect(lowerCaseResults[0].id).toBe(upperCaseResults[0].id)
      expect(upperCaseResults[0].id).toBe(mixedCaseResults[0].id)
    })

    it('should handle search with partial matches', () => {
      const partialNotes: Note[] = [
        {
          id: '1',
          slug: 'note-1',
          title: 'Complete React Tutorial',
          content: 'A comprehensive guide to React development',
          created_at: '2024-01-15T10:00:00Z',
          session_id: 'session-1',
          public: false,
          emoji: '📖'
        }
      ]
      
      const partialTitleResults = searchNotes(partialNotes, 'React', 'session-1')
      const partialContentResults = searchNotes(partialNotes, 'comprehensive', 'session-1')
      
      expect(partialTitleResults).toHaveLength(1)
      expect(partialContentResults).toHaveLength(1)
    })
  })
}) 