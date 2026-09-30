'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { getContentMarks } from '@/actions/content-marks/get-content-marks';
import { setContentMark } from '@/actions/content-marks/set-content-mark';
import type {
  ContentMarkEntry,
  ContentMarkKind,
  ContentType,
} from '@/actions/content-marks/content-marks';

type MarksData = Awaited<ReturnType<typeof getContentMarks>>;

interface SetMarkInput {
  contentId: string;
  mark: string;
  value: boolean;
}

const LOGIN_URL = '/autenticacion/iniciar-sesion';

/**
 * The logged-in user's marks on one kind of content (read articles, watched videos…), with
 * optimistic toggles. Anonymous visitors are pointed to the login page when they try to mark.
 */
export function useContentMarks<T extends ContentType>(contentType: T) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const queryKey = useMemo(() => ['content-marks', contentType], [contentType]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getContentMarks(contentType),
    staleTime: 60 * 1000,
  });

  const marked = useMemo(() => {
    const byMark = new Map<string, Set<string>>();
    for (const { contentId, mark } of data?.marks ?? []) {
      if (!byMark.has(mark)) byMark.set(mark, new Set());
      byMark.get(mark)!.add(contentId);
    }
    return byMark;
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (changes: SetMarkInput[]) => {
      for (const { contentId, mark, value } of changes) {
        await setContentMark(contentType, contentId, mark, value);
      }
    },
    onMutate: async (changes) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MarksData>(queryKey);
      queryClient.setQueryData<MarksData>(queryKey, (current) => {
        if (!current) return current;
        let marks: ContentMarkEntry[] = current.marks;
        for (const { contentId, mark, value } of changes) {
          marks = marks.filter((m) => !(m.contentId === contentId && m.mark === mark));
          if (value) marks = [{ contentId, mark }, ...marks];
        }
        return { ...current, marks };
      });
      return { previous };
    },
    onError: (_error, _changes, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error('No pudimos guardar el cambio. Probá de nuevo.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const has = useCallback(
    (contentId: string, mark: ContentMarkKind<T>) => marked.get(mark)?.has(contentId) ?? false,
    [marked],
  );

  const ids = useCallback(
    (mark: ContentMarkKind<T>) => marked.get(mark) ?? new Set<string>(),
    [marked],
  );

  /** Applies several mark changes at once, e.g. marking as read also clears "to read". */
  const set = useCallback(
    (changes: { contentId: string; mark: ContentMarkKind<T>; value: boolean }[]) => {
      if (!data?.isAuthenticated) {
        toast('Iniciá sesión para guardar tu progreso', {
          action: { label: 'Iniciar sesión', onClick: () => router.push(LOGIN_URL) },
        });
        return;
      }
      mutation.mutate(changes);
    },
    [data?.isAuthenticated, mutation, router],
  );

  const toggle = useCallback(
    (contentId: string, mark: ContentMarkKind<T>) =>
      set([{ contentId, mark, value: !has(contentId, mark) }]),
    [has, set],
  );

  return {
    isAuthenticated: data?.isAuthenticated ?? false,
    isLoading,
    has,
    ids,
    set,
    toggle,
  };
}
