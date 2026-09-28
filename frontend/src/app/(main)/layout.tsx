import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
