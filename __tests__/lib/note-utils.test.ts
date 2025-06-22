import { groupNotesByCategory, sortGroupedNotes } from '@/lib/note-utils'

describe('note-utils', () => {
  describe('groupNotesByCategory', () => {
    const mockNotes = [
      {
        id: '1',
        slug: 'note-1',
        title: 'Pinned Note',
        content: 'Content 1',
        created_at: '2024-01-15T10:00:00Z',
        session_id: 'session-1',
        public: false,
        category: 'general'
      },
      {
        id: '2',
        slug: 'note-2',
        title: 'Today Note',
        content: 'Content 2',
        created_at: new Date().toISOString(),
        session_id: 'session-1',
        public: false,
        category: 'general'
      },
      {
        id: '3',
        slug: 'note-3',
        title: 'Yesterday Note',
        content: 'Content 3',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        session_id: 'session-1',
        public: false,
        category: 'general'
      },
      {
        id: '4',
        slug: 'note-4',
        title: 'Public Note',
        content: 'Content 4',
        created_at: '2024-01-10T10:00:00Z',
        session_id: 'session-1',
        public: true,
        category: 'public'
      },
      {
        id: '5',
        slug: 'note-5',
        title: 'Old Note',
        content: 'Content 5',
        created_at: '2023-12-01T10:00:00Z',
        session_id: 'session-1',
        public: false,
        category: 'general'
      }
    ]

    it('should group pinned notes correctly', () => {
      const pinnedNotes = new Set(['note-1'])
      const result = groupNotesByCategory(mockNotes, pinnedNotes)
      
      expect(result.pinned).toHaveLength(1)
      expect(result.pinned[0].slug).toBe('note-1')
    })

    it('should group today notes correctly', () => {
      const pinnedNotes = new Set()
      const result = groupNotesByCategory(mockNotes, pinnedNotes)
      
      expect(result.today).toBeDefined()
      expect(result.today.length).toBeGreaterThan(0)
    })

    it('should group yesterday notes correctly', () => {
      const pinnedNotes = new Set()
      const result = groupNotesByCategory(mockNotes, pinnedNotes)
      
      expect(result.yesterday).toBeDefined()
      expect(result.yesterday.length).toBeGreaterThan(0)
    })

    it('should preserve public note categories', () => {
      const pinnedNotes = new Set()
      const result = groupNotesByCategory(mockNotes, pinnedNotes)
      
      expect(result.public).toBeDefined()
      expect(result.public[0].slug).toBe('note-4')
    })

    it('should group old notes correctly', () => {
      const pinnedNotes = new Set()
      const result = groupNotesByCategory(mockNotes, pinnedNotes)
      
      expect(result.older).toBeDefined()
      expect(result.older.length).toBeGreaterThan(0)
    })

    it('should handle empty notes array', () => {
      const result = groupNotesByCategory([], new Set<string>())
      expect(result.pinned).toEqual([])
      expect(Object.keys(result).sort()).toEqual([
        'pinned', 'today', 'yesterday', 'older', '7', '30'
      ].sort())
    })

    it('should handle empty pinned notes set', () => {
      const notes = [
        { slug: 'a', created_at: '2024-01-01', public: false },
        { slug: 'b', created_at: '2024-01-02', public: false }
      ]
      const result = groupNotesByCategory(notes, new Set<string>())
      expect(result.pinned).toEqual([])
    })

    it('should handle all notes as pinned', () => {
      const notes = [
        { slug: 'a', created_at: '2024-01-01', public: false },
        { slug: 'b', created_at: '2024-01-02', public: false }
      ]
      const pinned = new Set<string>(['a', 'b'])
      const result = groupNotesByCategory(notes, pinned)
      expect(result.pinned).toHaveLength(2)
    })

    it('should handle some notes as pinned', () => {
      const notes = [
        { slug: 'a', created_at: '2024-01-01', public: false },
        { slug: 'b', created_at: '2024-01-02', public: false }
      ]
      const pinned = new Set<string>(['a'])
      const result = groupNotesByCategory(notes, pinned)
      expect(result.pinned).toHaveLength(1)
    })

    it('should handle notes with no category', () => {
      const notes = [
        { slug: 'a', created_at: '2024-01-01', public: false }
      ]
      const result = groupNotesByCategory(notes, new Set<string>())
      expect(result.pinned).toEqual([])
    })
  })

  describe('sortGroupedNotes', () => {
    it('should sort notes by created_at in descending order', () => {
      const groupedNotes = {
        today: [
          { created_at: '2024-01-15T10:00:00Z' },
          { created_at: '2024-01-16T10:00:00Z' },
          { created_at: '2024-01-14T10:00:00Z' }
        ],
        pinned: [
          { created_at: '2024-01-13T10:00:00Z' },
          { created_at: '2024-01-17T10:00:00Z' }
        ]
      }

      sortGroupedNotes(groupedNotes)

      expect(groupedNotes.today[0].created_at).toBe('2024-01-16T10:00:00Z')
      expect(groupedNotes.today[1].created_at).toBe('2024-01-15T10:00:00Z')
      expect(groupedNotes.today[2].created_at).toBe('2024-01-14T10:00:00Z')
      
      expect(groupedNotes.pinned[0].created_at).toBe('2024-01-17T10:00:00Z')
      expect(groupedNotes.pinned[1].created_at).toBe('2024-01-13T10:00:00Z')
    })

    it('should handle empty categories', () => {
      const groupedNotes = {
        today: [],
        pinned: []
      }

      expect(() => sortGroupedNotes(groupedNotes)).not.toThrow()
    })

    it('should handle single note categories', () => {
      const groupedNotes = {
        today: [{ created_at: '2024-01-15T10:00:00Z' }]
      }

      expect(() => sortGroupedNotes(groupedNotes)).not.toThrow()
      expect(groupedNotes.today).toHaveLength(1)
    })
  })
}) 