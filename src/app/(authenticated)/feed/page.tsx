import { auth } from '@/auth';
import Advises from '@/components/advises/advises';
import { SignOut } from '@/components/auth/sign-out';
import { SidebarDemo } from '@/components/sidebar-demo';

const Feed = async () => {
  return (
    <div>
      {/* <SidebarDemo /> */}
      <Advises />
    </div>
  );
};

export default Feed;
