'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, AlertCircle, AlertTriangle, Bug, User, Globe } from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

type LogsClientProps = {
  logs: AppLog[];
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

const getLevelBadgeVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
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

export function LogsClient({ logs }: LogsClientProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

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
      <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay logs registrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determinar qué secciones abrir por defecto (solo errores)
  const defaultOpenSections = logsByLevel.error.length > 0 ? ['error'] : [];

  return (
    <Accordion type="multiple" defaultValue={defaultOpenSections} className="space-y-4">
      {logsByLevel.error.length > 0 && (
        <AccordionItem value="error" className="border rounded-lg px-4 overflow-visible">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              {getLevelIcon('error')}
              <span>Errores ({logsByLevel.error.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible">
            <div className="space-y-3 pt-4 px-2">
              {logsByLevel.error.map((log) => (
              <Card
                key={log.id}
                className="border-2 border-destructive/50 bg-gradient-to-br from-white to-red-50/50 transition-all duration-300 hover:scale-[1.02] hover:border-destructive hover:shadow-xl dark:border-red-900/50 dark:from-neutral-900 dark:to-red-950/20 dark:hover:border-red-800"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
                        <CardTitle className="text-base m-0 min-w-0 flex-1">
                          <TruncatedText text={log.message} maxLength={120} />
                        </CardTitle>
                        <Badge variant={getLevelBadgeVariant(log.level)} className="flex-shrink-0">{log.level}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                        {log.path && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <span>{log.path}</span>
                          </div>
                        )}
                        {log.user && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
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
                            <Button variant="ghost" size="sm" className="mt-2">
                              <ChevronDown
                                className={`h-4 w-4 mr-2 transition-transform ${
                                  expandedLogs.has(log.id) ? 'rotate-180' : ''
                                }`}
                              />
                              {expandedLogs.has(log.id) ? 'Ocultar' : 'Ver'} metadata
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto overflow-y-auto max-h-96 break-words whitespace-pre-wrap break-all">
                              {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                            </pre>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {logsByLevel.warn.length > 0 && (
        <AccordionItem value="warn" className="border rounded-lg px-4 overflow-visible">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              {getLevelIcon('warn')}
              <span>Advertencias ({logsByLevel.warn.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible">
            <div className="space-y-3 pt-4 px-2">
              {logsByLevel.warn.map((log) => (
              <Card
                key={log.id}
                className="border-2 border-yellow-500/50 bg-gradient-to-br from-white to-yellow-50/50 transition-all duration-300 hover:scale-[1.02] hover:border-yellow-500 hover:shadow-xl dark:border-yellow-900/50 dark:from-neutral-900 dark:to-yellow-950/20 dark:hover:border-yellow-800"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
                        <CardTitle className="text-base m-0 min-w-0 flex-1">
                          <TruncatedText text={log.message} maxLength={120} />
                        </CardTitle>
                        <Badge variant={getLevelBadgeVariant(log.level)} className="flex-shrink-0">{log.level}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                        {log.path && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <span>{log.path}</span>
                          </div>
                        )}
                        {log.user && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
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
                            <Button variant="ghost" size="sm" className="mt-2">
                              <ChevronDown
                                className={`h-4 w-4 mr-2 transition-transform ${
                                  expandedLogs.has(log.id) ? 'rotate-180' : ''
                                }`}
                              />
                              {expandedLogs.has(log.id) ? 'Ocultar' : 'Ver'} metadata
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto overflow-y-auto max-h-96 break-words whitespace-pre-wrap break-all">
                              {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                            </pre>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {logsByLevel.info.length > 0 && (
        <AccordionItem value="info" className="border rounded-lg px-4 overflow-visible">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              {getLevelIcon('info')}
              <span>Información ({logsByLevel.info.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible">
            <div className="space-y-3 pt-4 px-2">
              {logsByLevel.info.map((log) => (
              <Card
                key={log.id}
                className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
                        <CardTitle className="text-base m-0 min-w-0 flex-1">
                          <TruncatedText text={log.message} maxLength={120} />
                        </CardTitle>
                        <Badge variant={getLevelBadgeVariant(log.level)} className="flex-shrink-0">{log.level}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                        {log.path && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <span>{log.path}</span>
                          </div>
                        )}
                        {log.user && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
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
                            <Button variant="ghost" size="sm" className="mt-2">
                              <ChevronDown
                                className={`h-4 w-4 mr-2 transition-transform ${
                                  expandedLogs.has(log.id) ? 'rotate-180' : ''
                                }`}
                              />
                              {expandedLogs.has(log.id) ? 'Ocultar' : 'Ver'} metadata
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto overflow-y-auto max-h-96 break-words whitespace-pre-wrap break-all">
                              {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                            </pre>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {logsByLevel.debug.length > 0 && (
        <AccordionItem value="debug" className="border rounded-lg px-4 overflow-visible">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              {getLevelIcon('debug')}
              <span>Debug ({logsByLevel.debug.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="overflow-visible">
            <div className="space-y-3 pt-4 px-2">
              {logsByLevel.debug.map((log) => (
              <Card
                key={log.id}
                className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20 opacity-75"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
                        <CardTitle className="text-base m-0 min-w-0 flex-1">
                          <TruncatedText text={log.message} maxLength={120} />
                        </CardTitle>
                        <Badge variant={getLevelBadgeVariant(log.level)} className="flex-shrink-0">{log.level}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                        {log.path && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <span>{log.path}</span>
                          </div>
                        )}
                        {log.user && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
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
                            <Button variant="ghost" size="sm" className="mt-2">
                              <ChevronDown
                                className={`h-4 w-4 mr-2 transition-transform ${
                                  expandedLogs.has(log.id) ? 'rotate-180' : ''
                                }`}
                              />
                              {expandedLogs.has(log.id) ? 'Ocultar' : 'Ver'} metadata
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto overflow-y-auto max-h-96 break-words whitespace-pre-wrap break-all">
                              {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                            </pre>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}


