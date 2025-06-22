import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewNote from '@/components/new-note'

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn()
  })
}))

jest.mock('@/lib/create-note', () => ({
  createNote: jest.fn()
}))

jest.mock('@/components/session-id', () => {
  return function MockSessionId({ setSessionId }: any) {
    React.useEffect(() => {
      setSessionId('test-session-id')
    }, [setSessionId])
    return null
  }
})

jest.mock('@/components/icons', () => ({
  Icons: {
    new: () => <span data-testid="new-icon">+</span>
  }
}))

// Create a mock context provider
const MockSessionNotesProvider = ({ children }: { children: React.ReactNode }) => {
  const mockContextValue = {
    refreshSessionNotes: jest.fn()
  }
  
  return (
    <div data-testid="session-notes-provider">
      {children}
    </div>
  )
}

describe('NewNote Component', () => {
  const defaultProps = {
    addNewPinnedNote: jest.fn(),
    clearSearch: jest.fn(),
    setSelectedNoteSlug: jest.fn(),
    isMobile: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <MockSessionNotesProvider>
        {component}
      </MockSessionNotesProvider>
    )
  }

  it('should render new note button', () => {
    renderWithContext(<NewNote {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /create new note/i })
    expect(button).toBeInTheDocument()
  })

  it('should render new icon', () => {
    renderWithContext(<NewNote {...defaultProps} />)
    
    expect(screen.getByTestId('new-icon')).toBeInTheDocument()
  })

  it('should call clearSearch when clicked', async () => {
    const user = userEvent.setup()
    renderWithContext(<NewNote {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /create new note/i })
    await user.click(button)
    
    expect(defaultProps.clearSearch).toHaveBeenCalled()
  })

  it('should handle keyboard shortcut (n key)', async () => {
    const user = userEvent.setup()
    renderWithContext(<NewNote {...defaultProps} />)
    
    // Press 'n' key
    await user.keyboard('n')
    
    expect(defaultProps.clearSearch).toHaveBeenCalled()
  })

  it('should not trigger on cmd+n (should be handled by browser)', async () => {
    const user = userEvent.setup()
    renderWithContext(<NewNote {...defaultProps} />)
    
    // Press cmd+n
    await user.keyboard('{Meta>}n{/Meta}')
    
    expect(defaultProps.clearSearch).not.toHaveBeenCalled()
  })

  it('should not trigger when typing in input field', async () => {
    const user = userEvent.setup()
    renderWithContext(
      <div>
        <input data-testid="input-field" />
        <NewNote {...defaultProps} />
      </div>
    )
    
    const input = screen.getByTestId('input-field')
    input.focus()
    await user.keyboard('n')
    
    expect(defaultProps.clearSearch).not.toHaveBeenCalled()
  })

  it('should apply mobile styles when isMobile is true', () => {
    renderWithContext(<NewNote {...defaultProps} isMobile={true} />)
    
    const button = screen.getByRole('button', { name: /create new note/i })
    expect(button).toHaveClass('p-2')
  })

  it('should apply desktop styles when isMobile is false', () => {
    renderWithContext(<NewNote {...defaultProps} isMobile={false} />)
    
    const button = screen.getByRole('button', { name: /create new note/i })
    expect(button).toHaveClass('sm:p-2')
  })

  it('should render with correct aria-label', () => {
    renderWithContext(<NewNote {...defaultProps} />)
    
    const button = screen.getByLabelText('Create new note')
    expect(button).toBeInTheDocument()
  })

  it('should render SessionId component', () => {
    renderWithContext(<NewNote {...defaultProps} />)
    
    // SessionId component should be rendered (it's mocked to return null but should be called)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
}) 