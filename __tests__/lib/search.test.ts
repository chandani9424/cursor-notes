import { searchNotes } from '@/lib/search'
import { Note } from '@/lib/types'

describe('search', () => {
  describe('searchNotes', () => {
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

    it('should return empty array for empty search term', () => {
      const result = searchNotes(mockNotes, '', 'session-1')
      expect(result).toHaveLength(0)
    })

    it('should return empty array for no matching notes', () => {
      const result = searchNotes(mockNotes, 'nonexistent', 'session-1')
      expect(result).toHaveLength(0)
    })

    it('should filter notes by title', () => {
      const result = searchNotes(mockNotes, 'React', 'session-1')
      
      // Should return both notes that contain "React" in title or content
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('React Tutorial')
      expect(result[1].title).toBe('TypeScript Notes') // Contains "React" in content
    })

    it('should filter notes by content', () => {
      const result = searchNotes(mockNotes, 'JavaScript', 'session-1')
      
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('JavaScript Guide')
    })

    it('should be case insensitive', () => {
      const result = searchNotes(mockNotes, 'react', 'session-1')
      
      // Should return both notes that contain "react" in title or content
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('React Tutorial')
      expect(result[1].title).toBe('TypeScript Notes') // Contains "React" in content
    })

    it('should return public notes from other sessions', () => {
      const result = searchNotes(mockNotes, 'JavaScript', 'session-1')
      
      expect(result).toHaveLength(1)
      expect(result[0].session_id).toBe('session-2')
      expect(result[0].public).toBe(true)
    })

    it('should return own private notes', () => {
      const result = searchNotes(mockNotes, 'React', 'session-1')
      
      // Should return both notes that contain "React" in title or content
      expect(result).toHaveLength(2)
      expect(result[0].session_id).toBe('session-1')
      expect(result[1].session_id).toBe('session-1')
    })

    it('should not return private notes from other sessions', () => {
      const result = searchNotes(mockNotes, 'TypeScript', 'session-2')
      
      expect(result).toHaveLength(0) // TypeScript note is private and belongs to session-1
    })

    it('should handle partial matches', () => {
      const result = searchNotes(mockNotes, 'Tut', 'session-1')
      
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('React Tutorial')
    })

    it('should handle special characters', () => {
      const notesWithSpecialChars: Note[] = [
        {
          id: '4',
          slug: 'note-4',
          title: 'Test @#$%',
          content: 'Special characters test',
          created_at: '2024-01-18T10:00:00Z',
          session_id: 'session-1',
          public: false,
          emoji: '🔧'
        }
      ]
      
      const result = searchNotes(notesWithSpecialChars, '@#$%', 'session-1')
      expect(result).toHaveLength(1)
    })
  })
}) 