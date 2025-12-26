'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorsClient } from './errors-client';
import { LogsClient } from './logs-client';

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

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type MonitoringClientProps = {
  errors: ErrorLog[];
  errorsPagination: PaginationInfo;
  logs: AppLog[];
  logsPagination: PaginationInfo;
  logLevel?: string;
};

export function MonitoringClient({ 
  errors, 
  errorsPagination,
  logs, 
  logsPagination,
  logLevel 
}: MonitoringClientProps) {
  const [activeTab, setActiveTab] = useState('errors');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="errors">Errores</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="errors" className="mt-4 overflow-visible">
        <ErrorsClient errors={errors} pagination={errorsPagination} />
      </TabsContent>
      <TabsContent value="logs" className="mt-4 overflow-visible">
        <LogsClient logs={logs} pagination={logsPagination} logLevel={logLevel} />
      </TabsContent>
    </Tabs>
  );
}


