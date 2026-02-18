import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useDirection } from '@/hooks/use-direction';

export default function Layout() {
  useDirection();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} GadoPro — Islamic Inheritance Distribution
      </footer>
    </div>
  );
}
