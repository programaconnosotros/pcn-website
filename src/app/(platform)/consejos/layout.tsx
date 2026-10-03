import { ConsejosNavProvider } from '@/components/advises/consejos-nav';

// `modal` is the parallel route that shows /consejos/<id> as a dialog over the list.
export default function ConsejosLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <ConsejosNavProvider>
      {children}
      {modal}
    </ConsejosNavProvider>
  );
}
