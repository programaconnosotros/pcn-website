'use client';

import { usePathname } from 'next/navigation';
import { TerminalErrorScreen } from './terminal-error-screen';

export const NotFoundScreen = () => {
  const pathname = usePathname() ?? '/';

  return (
    <TerminalErrorScreen
      code="404"
      command={`cd ${pathname}`}
      output={[`bash: cd: ${pathname}: No such file or directory`]}
    />
  );
};
