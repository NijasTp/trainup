import type React from "react";
import { useState } from "react";
import { Dumbbell, LayoutDashboard, Users, UserCheck, Building2, LogOut, FileText, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "@/services/authService";
import { logout } from "@/redux/slices/adminAuthSlice";

const Logo = ({ className }: { className?: string }) => (
  <div className={`flex items-center ${className}`}>
    <Dumbbell className="mr-2 h-6 w-6" />
    <div className="text-2xl font-bold text-white">
      <span className="text-[#4B8B9B]">Train</span>up
    </div>
  </div>
);

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: UserCheck, label: "Trainers", path: "/admin/trainers" },
    { icon: Building2, label: "Gyms", path: "/admin/gyms" },
    { icon: FileText, label: "Templates", path: "/admin/templates" },
  ];

  const handleLogout = async () => {
    try {
      dispatch(logout());
      await logoutAdmin();
      navigate("/admin/login");
    } catch (error: any) {
      console.log("error logout:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#1F2A44] flex">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>


      <div
        className={`fixed inset-y-0 left-0 w-64 bg-[#111827] border-r border-[#4B8B9B]/30 transform transition-transform duration-300 ease-in-out z-50
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:w-64`}
      >
        <div className="p-6 flex justify-between items-center">
          <Logo />
          <button onClick={toggleSidebar} className="lg:hidden text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false); 
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-[#4B8B9B]/20 text-[#4B8B9B] border-r-2 border-[#4B8B9B]"
                    : "text-gray-300 hover:bg-[#1F2A44] hover:text-white"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              handleLogout();
              setIsSidebarOpen(false); 
            }}
            className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </nav>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col">
        <div className="lg:hidden bg-[#111827] p-4 flex justify-between items-center border-b border-[#4B8B9B]/30">
          <Logo />
          <button onClick={toggleSidebar} className="text-gray-300">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};