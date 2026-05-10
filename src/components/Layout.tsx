import { Outlet } from 'react-router-dom';
import Header from './Header';
import GadoBot from './GadoBot';
import { useDirection } from '@/hooks/use-direction';

export default function Layout() {
  useDirection();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-xs sm:text-sm text-muted-foreground px-3">
        © {new Date().getFullYear()} GadoPro — Islamic Inheritance Distribution
      </footer>
      <GadoBot />
    </div>
  );
}
