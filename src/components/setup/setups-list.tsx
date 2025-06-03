'use client';

import { fetchSetups } from '@/actions/setup/fetch-setup';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { SetupCard } from './setup-card';
import UploadSetupModal from './upload-setup-modal';

interface Setup {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  title: string;
  description: string;
  image: string;
  likes: number;
  comments: number;
  date: string;
  isLiked: boolean;
}


const mockSetups: Setup[] = [
  {
    id: "1",
    user: {
      name: "Carlos Rodriguez",
      username: "carlosdev",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    title: "Mi setup de desarrollo 2025",
    description: "Setup minimalista para programar. MacBook Pro M3, monitor 4K, teclado mecánico y mouse inalámbrico.",
    image: "/placeholder.svg?height=300&width=400",
    likes: 24,
    comments: 8,
    date: "2 de junio de 2025 a las 14:30",
    isLiked: false,
  },
  {
    id: "2",
    user: {
      name: "Ana Martinez",
      username: "anagamer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    title: "Gaming setup RGB",
    description:
      "Setup gaming completo con iluminación RGB. PC custom, monitor curvo 144Hz, silla gamer y periféricos RGB.",
    image: "/placeholder.svg?height=300&width=400",
    likes: 45,
    comments: 12,
    date: "1 de junio de 2025 a las 20:15",
    isLiked: true,
  },
  {
    id: "3",
    user: {
      name: "Miguel Torres",
      username: "miketech",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    title: "Workstation profesional",
    description: "Setup para diseño gráfico y video editing. Dual monitor, tableta gráfica, iluminación profesional.",
    image: "/placeholder.svg?height=300&width=400",
    likes: 18,
    comments: 5,
    date: "31 de mayo de 2025 a las 16:45",
    isLiked: false,
  },
];

export function SetupsList({ sessionId }: { sessionId: string | null }) {
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: setups, isLoading,refetch } = useQuery({
    queryKey: ['setups'],
    queryFn: () => fetchSetups(1),
  });

  const handleLike = (setupId: string) => {
    if (!sessionId) {
      setShowAuthModal(true);
      return;
    }
  };

  const handlePublishSetup = () => {
    if (!sessionId) {
      setShowAuthModal(true);
      return;
    }
    setShowUploadModal(true);
  };

  const handleComment = (setupId: string) => {
    if (!sessionId) {
      setShowAuthModal(true);
      return;
    }
    console.log("Comentar en setup:", setupId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Setups</h1>
            <p className="text-gray-600 mt-2">
              {"Comparte tu espacio de trabajo y descubre configuraciones increíbles 🖥️"}
            </p>
          </div>
          <Button
            onClick={handlePublishSetup}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-black/20"
          >
            <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Publicar tu setup
          </Button>
        </div>

        {/* Setups Grid */}
        <div className="grid gap-6">
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
                sessionId={sessionId}
                key={setup.id}
                setup={setup}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          )}
        </div>

        {/* Upload Setup Modal */}
        <UploadSetupModal
          userId={sessionId!}
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
          onSubmit={(setupData) => {
            console.log("Nuevo setup:", setupData);
            setShowUploadModal(false);
          }}
          isAuthenticated={!!sessionId}
          onAuthRequired={() => setShowAuthModal(true)}
        />
      </div>
    </div>
  );
} 