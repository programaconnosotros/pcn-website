'use client';

import { useState } from 'react';
import { Talk } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mic, Plus, Pencil, ExternalLink } from 'lucide-react';
import { DeleteTalkButton } from './delete-talk-button';
import { TalkForm } from './talk-form';

type Props = {
  talks: Talk[];
  eventId: string;
};

export function TalksList({ talks, eventId }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingTalk, setEditingTalk] = useState<Talk | null>(null);

  return (
    <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Charlas ({talks.length} total)
          </CardTitle>
          <Button size="sm" variant="pcn" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Nueva charla
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {talks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay charlas para este evento.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Orden</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Speaker</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Recursos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {talks.map((talk) => {
                  const hasProfessionalData = talk.isProfessional && talk.jobTitle && talk.enterprise;
                  const hasStudentData = talk.isStudent && talk.career && talk.studyPlace;

                  return (
                    <TableRow key={talk.id}>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {talk.order}
                      </TableCell>
                      <TableCell className="max-w-[200px] font-medium">{talk.title}</TableCell>
                      <TableCell className="whitespace-nowrap">{talk.speakerName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {hasProfessionalData && (
                            <div className="text-sm text-muted-foreground">
                              <Badge variant="outline" className="mb-1">Profesional</Badge>
                              <p><span className="font-medium">Rol:</span> {talk.jobTitle}</p>
                              <p><span className="font-medium">Empresa:</span> {talk.enterprise}</p>
                            </div>
                          )}
                          {hasStudentData && (
                            <div className="text-sm text-muted-foreground">
                              <Badge variant="outline" className="mb-1">Estudiante</Badge>
                              <p><span className="font-medium">Carrera:</span> {talk.career}</p>
                              <p><span className="font-medium">Universidad:</span> {talk.studyPlace}</p>
                            </div>
                          )}
                          {!hasProfessionalData && !hasStudentData && (
                            <span className="text-sm text-muted-foreground">Sin información</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {talk.slidesUrl && (
                            <a
                              href={talk.slidesUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Slides
                            </a>
                          )}
                          {talk.videoUrl && (
                            <a
                              href={talk.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Video
                            </a>
                          )}
                          {!talk.slidesUrl && !talk.videoUrl && (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTalk(talk)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <DeleteTalkButton talkId={talk.id} talkTitle={talk.title} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva charla</DialogTitle>
          </DialogHeader>
          <TalkForm
            eventId={eventId}
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTalk} onOpenChange={(open) => !open && setEditingTalk(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar charla</DialogTitle>
          </DialogHeader>
          {editingTalk && (
            <TalkForm
              talk={editingTalk}
              onSuccess={() => setEditingTalk(null)}
              onCancel={() => setEditingTalk(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
