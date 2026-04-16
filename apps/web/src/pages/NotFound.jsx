import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-black text-slate-800 select-none">404</p>
        <h1 className="text-2xl font-bold text-white mt-4">Page not found</h1>
        <p className="text-slate-500 mt-2 text-sm">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-8 mx-auto">
          <Home className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
