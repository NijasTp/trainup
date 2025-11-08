import { ROUTES } from "@/constants/routes";
import { Dumbbell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const GymNavbar: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", route: ROUTES.GYM_DASHBOARD },
    { label: "Subscriptions", route: ROUTES.GYM_SUBSCRIPTIONS },
    { label: "Announcements", route: ROUTES.GYM_ANNOUNCEMENTS },
    { label: "Attendance", route: ROUTES.GYM_ATTENDANCE },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between shadow-lg">
      <div
        onClick={() => navigate(ROUTES.GYM_DASHBOARD)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <Dumbbell className="text-blue-500" size={24} />
        <h1 className="text-white font-bold text-xl">TrainUp Gym</h1>
      </div>
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.route}
            to={item.route}
            className="text-gray-300 hover:text-white transition font-medium"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Link
        to={ROUTES.GYM_LOGIN}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
      >
        Logout
      </Link>
    </nav>
  );
};
