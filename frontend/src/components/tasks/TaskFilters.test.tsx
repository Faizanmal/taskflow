import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaskFilters from './TaskFilters';

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

describe('TaskFilters', () => {
  const mockOnFiltersChange = jest.fn();
  const defaultFilters = {
    search: '',
    status: undefined,
    priority: undefined,
    startDate: undefined,
    endDate: undefined,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(
      <TaskFilters filters={defaultFilters} onChange={mockOnFiltersChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('calls onChange when search input changes', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilters filters={defaultFilters} onChange={mockOnFiltersChange} />,
      { wrapper: createWrapper() }
    );

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'test query');

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('renders status filter dropdown', () => {
    render(
      <TaskFilters filters={defaultFilters} onChange={mockOnFiltersChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
  });

  it('renders priority filter dropdown', () => {
    render(
      <TaskFilters filters={defaultFilters} onChange={mockOnFiltersChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('combobox', { name: /priority/i })).toBeInTheDocument();
  });

  it('renders sort controls', () => {
    render(
      <TaskFilters filters={defaultFilters} onChange={mockOnFiltersChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('combobox', { name: /sort/i })).toBeInTheDocument();
  });

  it('shows clear button when filters are active', () => {
    const activeFilters = {
      ...defaultFilters,
      search: 'test',
    };

    render(
      <TaskFilters filters={activeFilters} onChange={mockOnFiltersChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    const activeFilters = {
      ...defaultFilters,
      search: 'test',
      status: ['TODO'] as TaskStatus[],
    };

    render(
      <TaskFilters filters={activeFilters} onChange={mockOnFiltersChange} />,
      { wrapper: createWrapper() }
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(expect.objectContaining({
      search: '',
      status: undefined,
    }));
  });

  it('has proper accessibility attributes', () => {
    render(
      <TaskFilters filters={defaultFilters} onChange={mockOnFiltersChange} />,
      { wrapper: createWrapper() }
    );

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('aria-label');
  });
});
