import { getForumData } from './forum-data';
import { ForumClient } from '@/components/forum/forum-client';

const ForumPage = async () => {
  const data = await getForumData();
  return <ForumClient data={data} />;
};

export default ForumPage;