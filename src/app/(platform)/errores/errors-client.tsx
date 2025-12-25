'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, User, Globe, Check } from 'lucide-react';
import { markErrorAsResolved } from '@/actions/errors/mark-as-resolved';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

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

type ErrorsClientProps = {
  errors: ErrorLog[];
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

export function ErrorsClient({ errors }: ErrorsClientProps) {
  const router = useRouter();
  const [markingAsResolved, setMarkingAsResolved] = useState<string | null>(null);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

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
      <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
        <CardContent className="pt-6">
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <p className="text-muted-foreground">No hay errores registrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {unresolvedErrors.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Sin resolver ({unresolvedErrors.length})</h3>
          <div className="space-y-3">
            {unresolvedErrors.map((error) => (
              <Card
                key={error.id}
                className="border-2 border-destructive/50 bg-gradient-to-br from-white to-red-50/50 transition-all duration-300 hover:scale-[1.02] hover:border-destructive hover:shadow-xl dark:border-red-900/50 dark:from-neutral-900 dark:to-red-950/20 dark:hover:border-red-800"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <CardTitle className="m-0 text-base">{error.message}</CardTitle>
                        <Badge variant="destructive">Sin resolver</Badge>
                      </div>
                      <div className="mb-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {error.path && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <span>{error.path}</span>
                          </div>
                        )}
                        {error.user && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
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
                            <Button variant="ghost" size="sm" className="mt-2">
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
                                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                                    {error.stack}
                                  </pre>
                                </div>
                              )}
                              {error.metadata && (
                                <div>
                                  <p className="mb-1 font-semibold">Metadata:</p>
                                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
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
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {resolvedErrors.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Resueltos ({resolvedErrors.length})</h3>
          <div className="space-y-3">
            {resolvedErrors.map((error) => (
              <Card
                key={error.id}
                className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 opacity-75 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <CardTitle className="m-0 text-base">{error.message}</CardTitle>
                        <Badge variant="default" className="bg-green-500">
                          Resuelto
                        </Badge>
                      </div>
                      <div className="mb-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {error.path && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <span>{error.path}</span>
                          </div>
                        )}
                        {error.user && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
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
                            <Button variant="ghost" size="sm" className="mt-2">
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
                                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                                    {error.stack}
                                  </pre>
                                </div>
                              )}
                              {error.metadata && (
                                <div>
                                  <p className="mb-1 font-semibold">Metadata:</p>
                                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
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
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
