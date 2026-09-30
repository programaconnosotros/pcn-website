import { PageTitle } from '@/components/ui/page-title';
import { RuledCell, RuledGrid } from '@/components/ui/ruled-grid';
import { getUsers } from '@/actions/users/get-users';
import { DataTable } from '@/components/comunity/data-table';
import { columns } from '@/components/comunity/users-columns';

const DAY_MS = 86_400_000;

const Stat = ({ label, value, hint }: { label: string; value: string | number; hint: string }) => (
  <RuledCell className="px-3 py-2">
    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-glow font-mono text-xl font-semibold tabular-nums text-pcnGreen">{value}</p>
    <p className="truncate font-mono text-[10px] text-muted-foreground/70">{hint}</p>
  </RuledCell>
);

const CommunityPage = async () => {
  const users = await getUsers();

  const now = Date.now();
  const newThisMonth = users.filter(
    (user) => now - new Date(user.createdAt).getTime() < 30 * DAY_MS,
  ).length;
  const verified = users.filter((user) => user.emailVerified).length;
  const admins = users.filter((user) => user.role === 'ADMIN').length;
  const withProfile = users.filter(
    (user) => user.jobTitle || user.career || user.slogan || user.languages.length > 0,
  ).length;
  const percent = (value: number) =>
    users.length ? `${Math.round((value / users.length) * 100)}%` : '—';

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <DataTable
          header={<PageTitle path="usuarios" meta={`${users.length} usuarios registrados`} />}
          intro={
            <RuledGrid className="mb-4 grid-cols-2 sm:grid-cols-4">
              <Stat label="nuevos" value={`+${newThisMonth}`} hint="últimos 30 días" />
              <Stat label="verificados" value={percent(verified)} hint={`${verified} emails`} />
              <Stat
                label="perfil completo"
                value={percent(withProfile)}
                hint="cargo, estudios o bio"
              />
              <Stat label="admins" value={admins} hint="con acceso de administración" />
            </RuledGrid>
          }
          columns={columns}
          data={users}
        />
      </div>
    </div>
  );
};

export default CommunityPage;
