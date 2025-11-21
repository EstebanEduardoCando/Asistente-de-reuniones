import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, PlusCircle, Mic } from 'lucide-react';

export function Layout() {
    const location = useLocation();

    const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
            >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                <span className="font-medium">{label}</span>
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-xl z-10">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Mic size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight">Meeting AI</h1>
                        <p className="text-xs text-slate-400 font-medium">Offline Assistant</p>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-2">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/new" icon={PlusCircle} label="New Meeting" />
                    <NavItem to="/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="p-6">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-slate-300">System Status</span>
                        </div>
                        <p className="text-xs text-slate-500">Ready to record & transcribe.</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-50 pointer-events-none" />
                <div className="relative h-full overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
