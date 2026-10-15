import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import * as ReactRouter from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return {
    ...actual,
    useRouteError: vi.fn(),
    useNavigate: () => vi.fn(),
  };
});

describe('RouteErrorBoundary Component', () => {
  it('renders 404 page not found when route error status is 404', () => {
    vi.mocked(ReactRouter.useRouteError).mockReturnValue({
      status: 404,
      statusText: 'Not Found',
      data: null,
      internal: false,
    });

    render(<RouteErrorBoundary />);

    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /campus home/i })).toBeInTheDocument();
  });

  it('renders generic 500 error when runtime error occurs', () => {
    vi.mocked(ReactRouter.useRouteError).mockReturnValue(new Error('Network connection timeout'));

    render(<RouteErrorBoundary />);

    expect(screen.getByText('Error 500')).toBeInTheDocument();
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.getByText('Network connection timeout')).toBeInTheDocument();
  });
});
