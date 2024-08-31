import { AddAdvise } from '@components/advises/add-advise';
import { Heading2 } from '@components/ui/heading-2';
import { AdvisesList } from '@/components/advises/advises-list';
import { auth } from '@/auth';

const AdvisesPage = async () => {
  const session = await auth();

  return (
    <div className="mt-4 md:px-20">
      <div className="mb-6 flex items-center justify-between">
        <Heading2>Consejos</Heading2>
        {session && <AddAdvise />}
      </div>

      <AdvisesList />
    </div>
  );
};

export default AdvisesPage;
