import { createNote } from '@/lib/create-note'

// Mock the dependencies
let mockSupabase: any;

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabase)
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })
}))

describe('create-note', () => {
  let mockRouter: any;
  let mockAddNewPinnedNote: jest.Mock;
  let mockRefreshSessionNotes: jest.Mock;
  let mockSetSelectedNoteSlug: jest.Mock;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ data: { id: 'test-note-id' }, error: null })
      }))
    }
    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    }
    mockAddNewPinnedNote = jest.fn()
    mockRefreshSessionNotes = jest.fn().mockResolvedValue(undefined)
    mockSetSelectedNoteSlug = jest.fn()
  })

  describe('createNote', () => {
    it('should create a new note successfully', async () => {
      const sessionId = 'test-session'
      
      await createNote(
        sessionId,
        mockRouter,
        mockAddNewPinnedNote,
        mockRefreshSessionNotes,
        mockSetSelectedNoteSlug,
        false
      )

      expect(mockSupabase.from).toHaveBeenCalledWith('notes')
      expect(mockAddNewPinnedNote).toHaveBeenCalled()
      expect(mockRefreshSessionNotes).toHaveBeenCalled()
    })

    it('should handle Supabase error', async () => {
      const sessionId = 'test-session'
      const errorMessage = 'Database error'
      mockSupabase.from = jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ data: null, error: { message: errorMessage } })
      }))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await createNote(
        sessionId,
        mockRouter,
        mockAddNewPinnedNote,
        mockRefreshSessionNotes,
        mockSetSelectedNoteSlug,
        false
      )

      expect(consoleSpy).toHaveBeenCalledWith('Error creating note:', expect.anything())
      consoleSpy.mockRestore()
    })

    it('should add note to pinned notes', async () => {
      const sessionId = 'test-session'
      
      await createNote(
        sessionId,
        mockRouter,
        mockAddNewPinnedNote,
        mockRefreshSessionNotes,
        mockSetSelectedNoteSlug,
        false
      )

      expect(mockAddNewPinnedNote).toHaveBeenCalledWith(expect.stringMatching(/^new-note-/))
    })

    it('should handle desktop navigation flow', async () => {
      const sessionId = 'test-session'
      
      await createNote(
        sessionId,
        mockRouter,
        mockAddNewPinnedNote,
        mockRefreshSessionNotes,
        mockSetSelectedNoteSlug,
        false
      )

      expect(mockSetSelectedNoteSlug).toHaveBeenCalledWith(expect.stringMatching(/^new-note-/))
    })

    it('should handle mobile navigation flow', async () => {
      const sessionId = 'test-session'
      
      await createNote(
        sessionId,
        mockRouter,
        mockAddNewPinnedNote,
        mockRefreshSessionNotes,
        mockSetSelectedNoteSlug,
        true
      )

      expect(mockRouter.push).toHaveBeenCalledWith(expect.stringMatching(/\/notes\/new-note-/))
    })

    it('should handle null session ID', async () => {
      await createNote(
        null,
        mockRouter,
        mockAddNewPinnedNote,
        mockRefreshSessionNotes,
        mockSetSelectedNoteSlug,
        false
      )

      // Should still attempt to create note with generated session ID
      expect(mockSupabase.from).toHaveBeenCalledWith('notes')
    })

    it('should generate unique note ID and slug', async () => {
      const sessionId = 'test-session'
      
      await createNote(
        sessionId,
        mockRouter,
        mockAddNewPinnedNote,
        mockRefreshSessionNotes,
        mockSetSelectedNoteSlug,
        false
      )

      const fromMock = mockSupabase.from.mock.results[0].value;
      const insertCall = fromMock.insert.mock.calls[0][0]
      expect(insertCall.id).toMatch(/^[a-zA-Z0-9-]+$/)
      expect(insertCall.slug).toMatch(/^new-note-[a-zA-Z0-9-]+$/)
    })

    it('should set correct timestamp', async () => {
      const sessionId = 'test-session'
      const beforeCreate = new Date()
      
      await createNote(
        sessionId,
        mockRouter,
        mockAddNewPinnedNote,
        mockRefreshSessionNotes,
        mockSetSelectedNoteSlug,
        false
      )

      const afterCreate = new Date()
      const fromMock = mockSupabase.from.mock.results[0].value;
      const insertCall = fromMock.insert.mock.calls[0][0]
      const createdTime = new Date(insertCall.created_at)
      
      expect(createdTime.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
      expect(createdTime.getTime()).toBeLessThanOrEqual(afterCreate.getTime())
    })
  })
}) 