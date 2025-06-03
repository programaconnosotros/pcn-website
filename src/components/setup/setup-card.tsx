'use client';

import { Setup } from '@/actions/setup/get-setup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
interface SetupCardProps {
  setup: Setup;
  onLike: (setupId: string) => void;
  onComment: (setupId: string) => void;
  sessionId: string | null;
}

export function SetupCard({ setup, onLike, onComment, sessionId }: SetupCardProps) {
  const [imgError, setImgError] = useState(false);
  console.log({setup});
  return (
    <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 transition-transform duration-200 group-hover:scale-105">
              <AvatarImage src={setup.author.image || "/placeholder.svg"} alt={setup.author.name} />
              <AvatarFallback>{setup.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-black">
                {setup.author.name}
              </h3>
              <p className="text-sm text-gray-500 transition-colors duration-200 group-hover:text-gray-600">
                @{setup.author.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <h2 className="text-xl font-bold text-gray-900 mb-2 transition-colors duration-200 group-hover:text-black">
          {setup.title}
        </h2>
        <p className="text-gray-600 mb-4 transition-colors duration-200 group-hover:text-gray-700">
          {setup.content}
        </p>

        <div className="relative rounded-lg overflow-hidden">
        <Image
        src={imgError || !setup.imageUrl ? "/white.png" : setup.imageUrl}
        alt={setup.title}
        width={800}
        height={400}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => setImgError(true)}
          />  
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(setup.id)}
              className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                setup.likes.some((like) => like.userId === sessionId) ? "text-red-500" : "text-gray-500"
              } hover:text-red-500`}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${setup.likes.some((like) => like.userId === sessionId) ? "fill-current scale-110" : ""}`}
              />
              <span className="transition-all duration-200">{setup.likes.length} me gusta</span>
            </Button>
          </div>

          <span className="text-sm text-gray-500 transition-colors duration-200 group-hover:text-gray-600 font-medium">
            {setup.createdAt.toLocaleDateString()}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
} 