'use client';

import { cn } from '@/lib/utils';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Badge } from '@/components/ui/badge';
import { Info, AlertCircle, AlertTriangle, Bug, User, Globe } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

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

type LogsClientProps = {
  logs: AppLog[];
  pagination: PaginationInfo;
  logLevel?: string;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'hace menos de un minuto';
  if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return `hace ${days} día${days > 1 ? 's' : ''}`;
};

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'warn':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'debug':
      return <Bug className="h-4 w-4 text-purple-500" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
};

const getLevelBadgeVariant = (
  level: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (level) {
    case 'info':
      return 'default';
    case 'warn':
      return 'outline';
    case 'error':
      return 'destructive';
    case 'debug':
      return 'secondary';
    default:
      return 'default';
  }
};

const TruncatedText = ({ text, maxLength = 100 }: { text: string; maxLength?: number }) => {
  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? `${text.substring(0, maxLength)}...` : text;

  if (!isTruncated) {
    return <span className="break-words">{text}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help break-words">{displayText}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-md break-words">
          <p className="whitespace-pre-wrap">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function LogsClient({ logs, pagination, logLevel }: LogsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>(() => {
    const logsByLevel = {
      error: logs.filter((l) => l.level === 'error'),
      warn: logs.filter((l) => l.level === 'warn'),
      info: logs.filter((l) => l.level === 'info'),
      debug: logs.filter((l) => l.level === 'debug'),
    };
    if (logLevel) return logLevel;
    if (logsByLevel.error.length > 0) return 'error';
    if (logsByLevel.warn.length > 0) return 'warn';
    if (logsByLevel.info.length > 0) return 'info';
    if (logsByLevel.debug.length > 0) return 'debug';
    return 'error';
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('logPage', page.toString());
    if (activeTab !== 'error') {
      params.set('logLevel', activeTab);
    } else {
      params.delete('logLevel');
    }
    router.push(`/monitoreo?${params.toString()}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('logPage', '1'); // Reset to first page when changing tabs
    if (tab !== 'error') {
      params.set('logLevel', tab);
    } else {
      params.delete('logLevel');
    }
    router.push(`/monitoreo?${params.toString()}`);
  };

  const toggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  // Agrupar logs por nivel
  const logsByLevel = {
    error: logs.filter((l) => l.level === 'error'),
    warn: logs.filter((l) => l.level === 'warn'),
    info: logs.filter((l) => l.level === 'info'),
    debug: logs.filter((l) => l.level === 'debug'),
  };

  if (logs.length === 0) {
    return (
      <div className="border border-pcnGreen-200 px-4 py-6 text-center">
        <Info className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-muted-foreground">No hay logs registrados</p>
      </div>
    );
  }

  // Crear array de tabs disponibles
  const availableTabs = [
    {
      value: 'error',
      label: 'Errores',
      count: logsByLevel.error.length,
      icon: getLevelIcon('error'),
    },
    {
      value: 'warn',
      label: 'Advertencias',
      count: logsByLevel.warn.length,
      icon: getLevelIcon('warn'),
    },
    {
      value: 'info',
      label: 'Información',
      count: logsByLevel.info.length,
      icon: getLevelIcon('info'),
    },
    {
      value: 'debug',
      label: 'Debug',
      count: logsByLevel.debug.length,
      icon: getLevelIcon('debug'),
    },
  ].filter((tab) => tab.count > 0);

  const getGridColsClass = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      default:
        return 'grid-cols-4';
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className={`mb-4 grid w-full ${getGridColsClass(availableTabs.length)}`}>
        {availableTabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">{tab.icon}</span>
            <span className="truncate">{tab.label}</span>
            <span className="hidden sm:inline">({tab.count})</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {logsByLevel.error.length > 0 && (
        <TabsContent value="error" className="mt-0">
          <RuledGrid className="grid-cols-1">
            {logsByLevel.error.map((log) => (
              <div key={log.id} className={cn(ruledCellClassName, 'bg-red-500/[0.03] p-3')}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
                      <h3 className="m-0 min-w-0 flex-1 font-mono text-sm font-medium">
                        <TruncatedText text={log.message} maxLength={120} />
                      </h3>
                      <Badge variant={getLevelBadgeVariant(log.level)} className="flex-shrink-0">
                        {log.level}
                      </Badge>
                    </div>
                    <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                      {log.path && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{log.path}</span>
                        </div>
                      )}
                      {log.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{log.user.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(log.createdAt)} - {formatDate(log.createdAt)}
                    </p>
                    {log.metadata && (
                      <Collapsible
                        open={expandedLogs.has(log.id)}
                        onOpenChange={() => toggleExpand(log.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs">
                            <ChevronDown
                              className={`mr-2 h-4 w-4 transition-transform ${
                                expandedLogs.has(log.id) ? 'rotate-180' : ''
                              }`}
                            />
                            {expandedLogs.has(log.id) ? 'Ocultar' : 'Ver'} metadata
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words break-all rounded-md bg-muted p-3 text-xs">
                            {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </RuledGrid>
        </TabsContent>
      )}

      {logsByLevel.warn.length > 0 && (
        <TabsContent value="warn" className="mt-0">
          <RuledGrid className="grid-cols-1">
            {logsByLevel.warn.map((log) => (
              <div key={log.id} className={cn(ruledCellClassName, 'bg-yellow-500/[0.03] p-3')}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
                      <h3 className="m-0 min-w-0 flex-1 font-mono text-sm font-medium">
                        <TruncatedText text={log.message} maxLength={120} />
                      </h3>
                      <Badge variant={getLevelBadgeVariant(log.level)} className="flex-shrink-0">
                        {log.level}
                      </Badge>
                    </div>
                    <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                      {log.path && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{log.path}</span>
                        </div>
                      )}
                      {log.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{log.user.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(log.createdAt)} - {formatDate(log.createdAt)}
                    </p>
                    {log.metadata && (
                      <Collapsible
                        open={expandedLogs.has(log.id)}
                        onOpenChange={() => toggleExpand(log.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs">
                            <ChevronDown
                              className={`mr-2 h-4 w-4 transition-transform ${
                                expandedLogs.has(log.id) ? 'rotate-180' : ''
                              }`}
                            />
                            {expandedLogs.has(log.id) ? 'Ocultar' : 'Ver'} metadata
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words break-all rounded-md bg-muted p-3 text-xs">
                            {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </RuledGrid>
        </TabsContent>
      )}

      {logsByLevel.info.length > 0 && (
        <TabsContent value="info" className="mt-0">
          <RuledGrid className="grid-cols-1">
            {logsByLevel.info.map((log) => (
              <div key={log.id} className={cn(ruledCellClassName, 'p-3')}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
                      <h3 className="m-0 min-w-0 flex-1 font-mono text-sm font-medium">
                        <TruncatedText text={log.message} maxLength={120} />
                      </h3>
                      <Badge variant={getLevelBadgeVariant(log.level)} className="flex-shrink-0">
                        {log.level}
                      </Badge>
                    </div>
                    <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                      {log.path && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{log.path}</span>
                        </div>
                      )}
                      {log.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{log.user.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(log.createdAt)} - {formatDate(log.createdAt)}
                    </p>
                    {log.metadata && (
                      <Collapsible
                        open={expandedLogs.has(log.id)}
                        onOpenChange={() => toggleExpand(log.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs">
                            <ChevronDown
                              className={`mr-2 h-4 w-4 transition-transform ${
                                expandedLogs.has(log.id) ? 'rotate-180' : ''
                              }`}
                            />
                            {expandedLogs.has(log.id) ? 'Ocultar' : 'Ver'} metadata
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words break-all rounded-md bg-muted p-3 text-xs">
                            {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </RuledGrid>
        </TabsContent>
      )}

      {logsByLevel.debug.length > 0 && (
        <TabsContent value="debug" className="mt-0">
          <RuledGrid className="grid-cols-1">
            {logsByLevel.debug.map((log) => (
              <div key={log.id} className={cn(ruledCellClassName, 'p-3 opacity-75')}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
                      <h3 className="m-0 min-w-0 flex-1 font-mono text-sm font-medium">
                        <TruncatedText text={log.message} maxLength={120} />
                      </h3>
                      <Badge variant={getLevelBadgeVariant(log.level)} className="flex-shrink-0">
                        {log.level}
                      </Badge>
                    </div>
                    <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                      {log.path && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{log.path}</span>
                        </div>
                      )}
                      {log.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{log.user.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(log.createdAt)} - {formatDate(log.createdAt)}
                    </p>
                    {log.metadata && (
                      <Collapsible
                        open={expandedLogs.has(log.id)}
                        onOpenChange={() => toggleExpand(log.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs">
                            <ChevronDown
                              className={`mr-2 h-4 w-4 transition-transform ${
                                expandedLogs.has(log.id) ? 'rotate-180' : ''
                              }`}
                            />
                            {expandedLogs.has(log.id) ? 'Ocultar' : 'Ver'} metadata
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words break-all rounded-md bg-muted p-3 text-xs">
                            {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </RuledGrid>
        </TabsContent>
      )}

      <div className="mt-4">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
        <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
          Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}{' '}
          logs
        </p>
      </div>
    </Tabs>
  );
}
