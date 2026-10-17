import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { ReactQueryProvider } from './react-query-provider';

const Probe = () => {
  const client = useQueryClient();
  return <span>{client ? 'con cliente' : 'sin cliente'}</span>;
};

describe('ReactQueryProvider', () => {
  it('provides a QueryClient to its children', () => {
    render(
      <ReactQueryProvider>
        <Probe />
      </ReactQueryProvider>,
    );
    expect(screen.getByText('con cliente')).toBeInTheDocument();
  });
});
