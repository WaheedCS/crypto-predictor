import { Activity } from 'lucide-react';
export default function Header() {
  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md bg-white/40 border-b border-opacity-20`}>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="font-semibold text-lg sm:block">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mr-3">
              <Activity size={18} className="text-white" />
            </div>
          </h2>
          <h1 className="font-bold text-xl">Asset<span className="text-indigo-600"> Optimizer</span></h1>
        </div>
      </div>
    </header>
  );
}