import { logout } from '@/redux/slices/adminAuthSlice';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

const menuItems = [
  { name: 'Dashboard', icon: 'fas fa-th-large', path: '/admin/dashboard' },
  { name: 'Diet Plans', icon: 'fas fa-apple-alt', path: '/admin/diet-plans' },
  { name: 'Workouts', icon: 'fas fa-dumbbell', path: '/admin/workouts' },
  { name: 'Trainers', icon: 'fas fa-user-friends', path: '/admin/trainers' },
  { name: 'Users', icon: 'fas fa-users', path: '/admin/users' },
  { name: 'Gyms', icon: 'fas fa-building', path: '/admin/gyms' },
];

const generalItems = [
  { name: 'Settings', icon: 'fas fa-cog', path: '/admin/settings' },
  { name: 'Help', icon: 'far fa-question-circle', path: '/admin/help' },
  { name: 'Logout', icon: 'fas fa-sign-out-alt' },
];

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  function handleLogout() {
    dispatch(logout())
    navigate("/admin/login");
  }

  return (
    <div className="flex flex-col justify-between w-full md:w-64 bg-[#071822] rounded-2xl p-6 h-full min-h-screen">
      <div>
        <div className="flex items-center gap-2 mb-10">
          <img
            alt="Fitness platform logo icon, stylized dumbbell in blue"
            className="w-8 h-8"
            height="32"
            src="https://storage.googleapis.com/a1aa/image/a975d5f0-259c-4290-143b-4168d4fd3494.jpg"
            width="32"
          />
          <span className="text-[#176B87] font-semibold text-lg select-none">
            Trainup
          </span>
        </div>
        <nav className="flex flex-col gap-5 text-sm font-medium select-none">
          <h3 className="text-xs text-gray-500 uppercase mb-2">Menu</h3>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${isActive ? 'text-[#176B87] bg-[#0D2F44]' : 'text-gray-500 hover:text-[#176B87] hover:bg-[#0D2F44]/50'
                }`
              }
            >
              <i className={`${item.icon} w-5`}></i>
              {item.name}
            </NavLink>
          ))}
          <h3 className="text-xs text-gray-500 uppercase mt-8 mb-2">General</h3>
          {generalItems.map((item) =>
            item.path ? (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${isActive ? 'text-[#176B87] bg-[#0D2F44]' : 'text-gray-500 hover:text-[#176B87] hover:bg-[#0D2F44]/50'
                  }`
                }
              >
                <i className={`${item.icon} w-5`}></i>
                {item.name}
              </NavLink>
            ) : (
              <button
                key={item.name}
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors text-gray-500 hover:text-[#176B87] hover:bg-[#0D2F44]/50"
              >
                <i className={`${item.icon} w-5`}></i>
                {item.name}
              </button>
            )
          )}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;