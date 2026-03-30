import { Outlet, NavLink } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckSquare, 
  DollarSign,
  ClipboardCheck,
  GraduationCap,
} from 'lucide-react';

export function Layout() {
  const navItems = [
    { path: '/', label: '대시보드', icon: LayoutDashboard },
    { path: '/performance', label: '수행평가', icon: ClipboardCheck },
    { path: '/students', label: '학생 관리', icon: Users },
    { path: '/schedule', label: '수업 스케줄', icon: Calendar },
    { path: '/attendance', label: '출결 관리', icon: CheckSquare },
    { path: '/billing', label: '수업료 정산', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Top Banner */}
      <div className="bg-[#F5C518] text-[#2D2A26] text-center py-2 text-sm">
        학원비 결제 관리 시스템
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#F0EBE1] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5C518] rounded-2xl flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6 text-[#2D2A26]" />
              </div>
              <h1 className="text-xl text-[#2D2A26]" style={{ fontWeight: 700 }}>학원 관리</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-[#F0EBE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3.5 rounded-t-xl transition-all ${
                    isActive
                      ? 'bg-[#FFF8E1] text-[#B8860B] border-b-2 border-[#F5C518]'
                      : 'text-[#8A8478] hover:text-[#2D2A26] hover:bg-[#FFFDF7]'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}