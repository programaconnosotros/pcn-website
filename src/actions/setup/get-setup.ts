type Content = {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string; email: string; image: string | null };
};

export type Setup = Content & {
    likes: {
      userId: string;
    }[];
  };
