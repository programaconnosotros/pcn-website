'use client';

import { useState, type PropsWithChildren } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export const ReactQueryProvider = ({ children }: PropsWithChildren) => {
  const [client] = useState(new QueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
