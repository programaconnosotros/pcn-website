'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorsClient } from './errors-client';
import type { PaginationInfo } from './table-parts';
import { LogsClient, type LogCounts } from './logs-client';

type ErrorLog = {
  id: string;
  message: string;
  stack: string | null;
  path: string | null;
  userId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  metadata: string | null;
  resolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  resolver: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type AppLog = {
  id: string;
  level: string;
  message: string;
  path: string | null;
  userId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  metadata: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type MonitoringClientProps = {
  errors: ErrorLog[];
  errorsPagination: PaginationInfo;
  logs: AppLog[];
  logsPagination: PaginationInfo;
  logLevel?: string;
  logCounts: LogCounts;
  unresolvedErrors: number;
};

export function MonitoringClient({
  errors,
  errorsPagination,
  logs,
  logsPagination,
  logLevel,
  logCounts,
  unresolvedErrors,
}: MonitoringClientProps) {
  const searchParams = useSearchParams();
  // A reload on a filtered or paged log view should land back on the logs tab.
  const [activeTab, setActiveTab] = useState(() =>
    searchParams.has('logLevel') || searchParams.has('logPage') ? 'logs' : 'errors',
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
      <TabsList aria-label="Vista de monitoreo">
        <TabsTrigger value="errors">
          errores
          <span className="text-muted-foreground/70 tabular-nums">
            ({unresolvedErrors.toLocaleString()})
          </span>
        </TabsTrigger>
        <TabsTrigger value="logs">
          logs
          <span className="text-muted-foreground/70 tabular-nums">
            ({logCounts.total.toLocaleString()})
          </span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="errors" className="mt-3">
        <ErrorsClient errors={errors} pagination={errorsPagination} />
      </TabsContent>
      <TabsContent value="logs" className="mt-3">
        <LogsClient
          logs={logs}
          pagination={logsPagination}
          logLevel={logLevel}
          counts={logCounts}
        />
      </TabsContent>
    </Tabs>
  );
}
