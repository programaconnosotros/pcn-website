import { SignOut } from '@components/auth/sign-out';

const Profile = () => (
  <div className="mb-4 flex justify-between">
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Mi perfil</h1>
    <SignOut />
  </div>
);

export default Profile;
