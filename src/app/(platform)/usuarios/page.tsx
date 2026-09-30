import { PageTitle } from '@/components/ui/page-title';
import { getUsers } from '@/actions/users/get-users';
import { DataTable } from '@/components/comunity/data-table';
import { columns } from '@/components/comunity/users-columns';

const CommunityPage = async () => {
  const users = await getUsers();

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitle path="usuarios" meta={`${users.length} usuarios registrados`} />

          <DataTable columns={columns} data={users} />
        </div>
      </div>
    </>
  );
};

export default CommunityPage;
