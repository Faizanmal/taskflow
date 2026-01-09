import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BulkActionsToolbar from './BulkActionsToolbar';

// Mock the useBulkTasks hook
jest.mock('@/hooks/useBulkTasks', () => ({
  useBulkUpdateTasks: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useBulkDeleteTasks: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

// Create a wrapper with React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};

describe('BulkActionsToolbar', () => {
  const mockOnClearSelection = jest.fn();
  const selectedTaskIds = ['task-1', 'task-2', 'task-3'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays number of selected tasks', () => {
    render(
      <BulkActionsToolbar
        tasks={[]}
        selectedTaskIds={selectedTaskIds}
        onSelectionChange={jest.fn()}
        onClearSelection={mockOnClearSelection}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('renders clear selection button', () => {
    render(
      <BulkActionsToolbar
        tasks={[]}
        selectedTaskIds={selectedTaskIds}
        onSelectionChange={jest.fn()}
        onClearSelection={mockOnClearSelection}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /clear|cancel|deselect/i })).toBeInTheDocument();
  });

  it('calls onClearSelection when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BulkActionsToolbar
        tasks={[]}
        selectedTaskIds={selectedTaskIds}
        onSelectionChange={jest.fn()}
        onClearSelection={mockOnClearSelection}
      />,
      { wrapper: createWrapper() }
    );

    const clearButton = screen.getByRole('button', { name: /clear|cancel|deselect/i });
    await user.click(clearButton);

    expect(mockOnClearSelection).toHaveBeenCalled();
  });

  it('renders status update button', () => {
    render(
      <BulkActionsToolbar
        tasks={[]}
        selectedTaskIds={selectedTaskIds}
        onSelectionChange={jest.fn()}
        onClearSelection={mockOnClearSelection}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /status/i })).toBeInTheDocument();
  });

  it('renders priority update button', () => {
    render(
      <BulkActionsToolbar
        tasks={[]}
        selectedTaskIds={selectedTaskIds}
        onSelectionChange={jest.fn()}
        onClearSelection={mockOnClearSelection}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /priority/i })).toBeInTheDocument();
  });

  it('renders delete button', () => {
    render(
      <BulkActionsToolbar
        tasks={[]}
        selectedTaskIds={selectedTaskIds}
        onSelectionChange={jest.fn()}
        onClearSelection={mockOnClearSelection}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('does not render when no tasks are selected', () => {
    const { container } = render(
      <BulkActionsToolbar
        tasks={[]}
        selectedTaskIds={[]}
        onSelectionChange={jest.fn()}
        onClearSelection={mockOnClearSelection}
      />,
      { wrapper: createWrapper() }
    );

    // The toolbar should be hidden or not render content
    expect(container.textContent).toBe('');
  });

  it('has proper accessibility attributes', () => {
    render(
      <BulkActionsToolbar
        tasks={[]}
        selectedTaskIds={selectedTaskIds}
        onSelectionChange={jest.fn()}
        onClearSelection={mockOnClearSelection}
      />,
      { wrapper: createWrapper() }
    );

    // Check for toolbar role or region
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toBeInTheDocument();
  });
});
