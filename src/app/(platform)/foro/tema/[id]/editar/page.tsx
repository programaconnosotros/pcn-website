import { notFound } from 'next/navigation';
import { getPostForEdit } from '@/actions/forum_posts/get-for-edit';
import { EditPostForm } from './edit-post-form';

interface EditPostPageProps {
  params: { id: string };
}

const EditPostPage = async ({ params }: EditPostPageProps) => {
  try {
    const result = await getPostForEdit(params.id);

    if (!result.success) {
      notFound();
    }

    return <EditPostForm post={result.post} />;
  } catch (error) {
    console.error('Error loading post for edit:', error);
    notFound();
  }
};

export default EditPostPage;
