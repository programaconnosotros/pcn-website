'use client';

import { cn } from '@/lib/utils';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, User, Globe, Check } from 'lucide-react';
import { markErrorAsResolved } from '@/actions/errors/mark-as-resolved';
import { toast } from 'sonner';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

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

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ErrorsClientProps = {
  errors: ErrorLog[];
  pagination: PaginationInfo;
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

export function ErrorsClient({ errors, pagination }: ErrorsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [markingAsResolved, setMarkingAsResolved] = useState<string | null>(null);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>(
    errors.filter((e) => !e.resolved).length > 0 ? 'unresolved' : 'resolved',
  );

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('errorPage', page.toString());
    router.push(`/monitoreo?${params.toString()}`);
  };

  const unresolvedErrors = errors.filter((e) => !e.resolved);
  const resolvedErrors = errors.filter((e) => e.resolved);

  const handleMarkAsResolved = async (errorId: string) => {
    setMarkingAsResolved(errorId);
    try {
      await markErrorAsResolved(errorId);
      toast.success('Error marcado como resuelto');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Error al marcar el error como resuelto');
    } finally {
      setMarkingAsResolved(null);
    }
  };

  const toggleExpand = (errorId: string) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(errorId)) {
      newExpanded.delete(errorId);
    } else {
      newExpanded.add(errorId);
    }
    setExpandedErrors(newExpanded);
  };

  if (errors.length === 0) {
    return (
      <div className="border border-pcnGreen-200 px-4 py-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-500" />
        <p className="text-muted-foreground">No hay errores registrados</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 grid w-full grid-cols-2">
        {unresolvedErrors.length > 0 && (
          <TabsTrigger value="unresolved" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Sin resolver ({unresolvedErrors.length})
          </TabsTrigger>
        )}
        {resolvedErrors.length > 0 && (
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Resueltos ({resolvedErrors.length})
          </TabsTrigger>
        )}
      </TabsList>

      {unresolvedErrors.length > 0 && (
        <TabsContent value="unresolved" className="mt-0">
          <RuledGrid className="grid-cols-1">
            {unresolvedErrors.map((error) => (
              <div key={error.id} className={cn(ruledCellClassName, 'bg-red-500/[0.03] p-3')}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-destructive" />
                      <h3 className="m-0 min-w-0 flex-1 font-mono text-sm font-medium">
                        <TruncatedText text={error.message} maxLength={120} />
                      </h3>
                      <Badge variant="destructive" className="flex-shrink-0">
                        Sin resolver
                      </Badge>
                    </div>
                    <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                      {error.path && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{error.path}</span>
                        </div>
                      )}
                      {error.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{error.user.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(error.createdAt)} - {formatDate(error.createdAt)}
                    </p>
                    {(error.stack || error.metadata) && (
                      <Collapsible
                        open={expandedErrors.has(error.id)}
                        onOpenChange={() => toggleExpand(error.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs">
                            <ChevronDown
                              className={`mr-2 h-4 w-4 transition-transform ${
                                expandedErrors.has(error.id) ? 'rotate-180' : ''
                              }`}
                            />
                            {expandedErrors.has(error.id) ? 'Ocultar' : 'Ver'} detalles
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="space-y-2 text-sm">
                            {error.stack && (
                              <div>
                                <p className="mb-1 font-semibold">Stack trace:</p>
                                <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words break-all rounded-md bg-muted p-3 text-xs">
                                  {error.stack}
                                </pre>
                              </div>
                            )}
                            {error.metadata && (
                              <div>
                                <p className="mb-1 font-semibold">Metadata:</p>
                                <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words break-all rounded-md bg-muted p-3 text-xs">
                                  {JSON.stringify(JSON.parse(error.metadata), null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsResolved(error.id)}
                    disabled={markingAsResolved === error.id}
                    className="ml-4"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Marcar como resuelto
                  </Button>
                </div>
              </div>
            ))}
          </RuledGrid>
        </TabsContent>
      )}

      {resolvedErrors.length > 0 && (
        <TabsContent value="resolved" className="mt-0">
          <RuledGrid className="grid-cols-1">
            {resolvedErrors.map((error) => (
              <div key={error.id} className={cn(ruledCellClassName, 'p-3 opacity-75')}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <h3 className="m-0 min-w-0 flex-1 font-mono text-sm font-medium">
                        <TruncatedText text={error.message} maxLength={120} />
                      </h3>
                      <Badge variant="default" className="flex-shrink-0 bg-green-500">
                        Resuelto
                      </Badge>
                    </div>
                    <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                      {error.path && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{error.path}</span>
                        </div>
                      )}
                      {error.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{error.user.name}</span>
                        </div>
                      )}
                      {error.resolver && (
                        <div className="flex items-center gap-1">
                          <span>Resuelto por: {error.resolver.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(error.createdAt)} - {formatDate(error.createdAt)}
                      {error.resolvedAt && <> • Resuelto: {formatDate(error.resolvedAt)}</>}
                    </p>
                    {(error.stack || error.metadata) && (
                      <Collapsible
                        open={expandedErrors.has(error.id)}
                        onOpenChange={() => toggleExpand(error.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs">
                            <ChevronDown
                              className={`mr-2 h-4 w-4 transition-transform ${
                                expandedErrors.has(error.id) ? 'rotate-180' : ''
                              }`}
                            />
                            {expandedErrors.has(error.id) ? 'Ocultar' : 'Ver'} detalles
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="space-y-2 text-sm">
                            {error.stack && (
                              <div>
                                <p className="mb-1 font-semibold">Stack trace:</p>
                                <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words break-all rounded-md bg-muted p-3 text-xs">
                                  {error.stack}
                                </pre>
                              </div>
                            )}
                            {error.metadata && (
                              <div>
                                <p className="mb-1 font-semibold">Metadata:</p>
                                <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words break-all rounded-md bg-muted p-3 text-xs">
                                  {JSON.stringify(JSON.parse(error.metadata), null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
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
          errores
        </p>
      </div>
    </Tabs>
  );
}
