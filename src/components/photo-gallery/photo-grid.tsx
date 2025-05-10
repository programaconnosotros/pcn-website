'use client';

import { useState, useEffect } from 'react';
import { PhotoCard } from '@/components/photo-gallery/photo-card';

// Sample data for the community photos
const communityPhotos = [
  {
    id: 1,
    title: 'Hackathon Winners 2023',
    image: '/placeholder.svg?key=3hg05',
    author: 'Maria Rodriguez',
    authorAvatar: '/woman-programmer-profile.png',
    likes: 245,
    comments: 32,
    tags: ['hackathon', 'teamwork', 'javascript'],
    height: 400,
  },
  {
    id: 2,
    title: 'Python Workshop',
    image: '/python-workshop.png',
    author: 'Alex Chen',
    authorAvatar: '/asian-programmer-profile.png',
    likes: 189,
    comments: 24,
    tags: ['python', 'workshop', 'learning'],
    height: 280,
  },
  {
    id: 3,
    title: 'Code Review Session',
    image: '/programmers-code-review.png',
    author: 'James Wilson',
    authorAvatar: '/placeholder.svg?height=40&width=40&query=black man programmer profile',
    likes: 132,
    comments: 18,
    tags: ['codereview', 'collaboration', 'bestpractices'],
    height: 350,
  },
  {
    id: 4,
    title: 'Women in Tech Meetup',
    image: '/placeholder.svg?height=420&width=300&query=women in tech meetup event',
    author: 'Sarah Johnson',
    authorAvatar: '/placeholder.svg?height=40&width=40&query=woman with glasses programmer profile',
    likes: 312,
    comments: 45,
    tags: ['womenintech', 'diversity', 'networking'],
    height: 420,
  },
  {
    id: 5,
    title: 'React Conference 2023',
    image: '/placeholder.svg?height=300&width=300&query=react conference with audience',
    author: 'David Kim',
    authorAvatar: '/placeholder.svg?height=40&width=40&query=asian programmer profile',
    likes: 278,
    comments: 36,
    tags: ['react', 'conference', 'frontend'],
    height: 300,
  },
  {
    id: 6,
    title: 'Coding Competition',
    image: '/placeholder.svg?height=380&width=300&query=coding competition with participants',
    author: 'Emma Davis',
    authorAvatar: '/placeholder.svg?height=40&width=40&query=young woman programmer profile',
    likes: 201,
    comments: 29,
    tags: ['competition', 'algorithms', 'problemsolving'],
    height: 380,
  },
  {
    id: 7,
    title: 'Open Source Contributors',
    image:
      '/placeholder.svg?height=320&width=300&query=diverse group of programmers working together',
    author: 'Michael Brown',
    authorAvatar: '/placeholder.svg?height=40&width=40&query=man with beard programmer profile',
    likes: 167,
    comments: 22,
    tags: ['opensource', 'github', 'community'],
    height: 320,
  },
  {
    id: 8,
    title: 'AI Workshop',
    image:
      '/placeholder.svg?height=360&width=300&query=artificial intelligence workshop with neural network diagram',
    author: 'Sophia Martinez',
    authorAvatar: '/placeholder.svg?height=40&width=40&query=latina woman programmer profile',
    likes: 289,
    comments: 41,
    tags: ['ai', 'machinelearning', 'datascience'],
    height: 360,
  },
  {
    id: 9,
    title: 'Mobile App Development Team',
    image:
      '/placeholder.svg?height=340&width=300&query=mobile app development team working together',
    author: 'Daniel Lee',
    authorAvatar:
      '/placeholder.svg?height=40&width=40&query=asian man with glasses programmer profile',
    likes: 156,
    comments: 19,
    tags: ['mobiledev', 'apps', 'teamwork'],
    height: 340,
  },
  {
    id: 10,
    title: 'DevOps Pipeline Setup',
    image: '/placeholder.svg?height=290&width=300&query=devops pipeline diagram on whiteboard',
    author: 'Ryan Taylor',
    authorAvatar: '/placeholder.svg?height=40&width=40&query=man programmer profile',
    likes: 143,
    comments: 27,
    tags: ['devops', 'cicd', 'automation'],
    height: 290,
  },
  {
    id: 11,
    title: 'Blockchain Hackathon',
    image: '/placeholder.svg?height=370&width=300&query=blockchain hackathon with developers',
    author: 'Olivia Wilson',
    authorAvatar:
      '/placeholder.svg?height=40&width=40&query=woman with curly hair programmer profile',
    likes: 231,
    comments: 33,
    tags: ['blockchain', 'crypto', 'web3'],
    height: 370,
  },
  {
    id: 12,
    title: 'UX Design Workshop',
    image: '/placeholder.svg?height=310&width=300&query=ux design workshop with wireframes',
    author: 'Ethan Garcia',
    authorAvatar: '/placeholder.svg?height=40&width=40&query=latino man programmer profile',
    likes: 198,
    comments: 26,
    tags: ['uxdesign', 'userexperience', 'wireframing'],
    height: 310,
  },
];

export function PhotoGrid() {
  const isMobile = useMobile();
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1);
      } else if (width < 768) {
        setColumns(2);
      } else if (width < 1024) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Distribute photos into columns for masonry layout
  const getPhotosByColumn = () => {
    const photosByColumn = Array.from({ length: columns }, () => []);

    communityPhotos.forEach((photo, index) => {
      const columnIndex = index % columns;
      photosByColumn[columnIndex].push(photo);
    });

    return photosByColumn;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {getPhotosByColumn().map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {column.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      ))}
    </div>
  );
}
