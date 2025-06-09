'use client';
import { deleteSetup } from '@/actions/setup/delete-setup';
import { fetchSetups } from '@/actions/setup/fetch-setup';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Session, User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { Heart, LogIn, Plus, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { SetupCard } from './setup-card';
import UploadSetupModal from './upload-setup-modal';

export function SetupsList({ session }: { session: (Session & { user: User }) | null }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalAction, setModalAction] = useState<'delete' | null>(null);
  const [selectedSetup, setSelectedSetup] = useState<any>(null);
  const [setupToEdit, setSetupToEdit] = useState<any>(null);

  const {
    data: setups,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['setups'],
    queryFn: () => fetchSetups(1),
    staleTime: 0,
    gcTime: 0,
  });

  const handlePublishSetup = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    setSetupToEdit(null);
    setShowUploadModal(true);
  };

  const handleDeleteSetup = (setup: any) => {
    if (!session) {
      setModalAction('delete');
      setShowAuthModal(true);
      return;
    }
    setSelectedSetup(setup);
    setModalAction('delete');
    setShowAuthModal(true);
  };

  const handleEditSetup = (setup: any) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    setSetupToEdit({
      id: setup.id,
      title: setup.title,
      description: setup.content,
      imageUrl: setup.imageUrl,
    });
    setShowUploadModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSetup) return;

    try {
      setShowAuthModal(false);
      await deleteSetup(selectedSetup.id);
      toast.success('Setup eliminado exitosamente');
      refetch();
    } catch (error) {
      toast.error('Error al eliminar el setup');
    } finally {
      setShowAuthModal(false);
      setSelectedSetup(null);
      setModalAction(null);
    }
  };

  return (
    <div className="bg-white dark:bg-black">
      <div className="p-6">
        <div className="mb-8 flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Setups</h1>
            <p className="mt-2 text-gray-600 dark:text-white">
              {'Comparte tu espacio de trabajo y descubre configuraciones increíbles 🖥️'}
            </p>
          </div>
          <Button
            onClick={handlePublishSetup}
            className="w-full rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-gray-800 hover:shadow-lg hover:shadow-black/20 dark:text-black sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Publica tu setup
          </Button>
        </div>

        {/* Setups Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {setups?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3">
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No hay setups aún</h3>
              <p className="mt-2 text-sm text-gray-500">
                Sé el primero en compartir tu setup con la comunidad
              </p>
            </div>
          ) : (
            setups?.map((setup) => (
              <SetupCard
                session={session}
                key={setup.id}
                setup={setup}
                onDelete={() => handleDeleteSetup(setup)}
                onEdit={() => handleEditSetup(setup)}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            ))
          )}
        </div>
        <ModalSetup
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
          title={
            modalAction === 'delete'
              ? '¿Estás seguro de eliminar este setup?'
              : 'Se parte de la comunidad para continuar'
          }
          description={
            modalAction === 'delete'
              ? 'Esta acción no se puede deshacer.'
              : 'Necesitas una cuenta para realizar acciones en el sitio. Regístrate gratis o inicia sesión para descubrir más funcionalidades.'
          }
          icon={
            modalAction === 'delete' ? (
              <X className="h-8 w-8 text-red-500" />
            ) : (
              <Heart className="h-8 w-8 text-pink-500" />
            )
          }
          onConfirm={modalAction === 'delete' ? handleConfirmDelete : undefined}
        />

        {/* Upload Setup Modal */}
        <UploadSetupModal
          userId={session?.user.id!}
          open={showUploadModal}
          onOpenChange={(open) => {
            setShowUploadModal(open);
            if (!open) setSetupToEdit(null);
          }}
          onSubmit={() => {
            setShowUploadModal(false);
            setSetupToEdit(null);
          }}
          isAuthenticated={!!session?.user.id}
          onAuthRequired={() => setShowAuthModal(true)}
          refetch={refetch}
          setupToEdit={setupToEdit}
        />
      </div>
    </div>
  );
}

interface ModalSetupProps {
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  onLogin?: () => void;
  onRegister?: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onConfirm?: () => void;
}

export const ModalSetup = ({
  showAuthModal,
  setShowAuthModal,
  onLogin,
  onRegister,
  title,
  description,
  onConfirm,
}: ModalSetupProps) => {
  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4 text-center">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </DialogTitle>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>
        </DialogHeader>

        <div className="space-y-3">
          {onConfirm ? (
            <Button
              variant="destructive"
              className="w-full rounded-lg bg-red-500 py-3 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20"
              onClick={onConfirm}
            >
              Confirmar
            </Button>
          ) : (
            <>
              <Link href="/autenticacion/iniciar-sesion" className="w-full">
                <Button
                  variant="outline"
                  className="hover:shadow-white-500/20 mb-2 w-full rounded-lg bg-black py-3 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-black hover:text-white hover:shadow-lg dark:bg-pcnGreen dark:text-black"
                >
                  Iniciar sesión
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/autenticacion/registro" className="w-full">
                <Button
                  variant="outline"
                  className="hover:shadow-black-500/20 w-full rounded-lg py-3 font-medium text-black transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:text-white"
                >
                  Crear cuenta
                  <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
