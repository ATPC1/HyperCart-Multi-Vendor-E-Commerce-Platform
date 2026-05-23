import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, Tag } from 'lucide-react';

export default function Sidebar({ role }) {
  const getLinks = () => {
    if (role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { name: 'Orders Overview', path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
        { name: 'Coupons', path: '/admin/coupons', icon: <Tag className="w-5 h-5" /> },
      ];
    }
    if (role === 'vendor') {
      return [
        { name: 'Dashboard', path: '/vendor/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'My Products', path: '/vendor/products', icon: <Package className="w-5 h-5" /> },
        { name: 'Orders', path: '/vendor/orders', icon: <ShoppingBag className="w-5 h-5" /> },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <div className="w-64 bg-navy text-white flex-shrink-0 hidden md:flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <span className="text-xl font-extrabold tracking-tight">HyperCart {role === 'admin' ? 'Admin' : 'Seller'}</span>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-electric text-white font-semibold shadow-md shadow-electric/20'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          Account Settings
        </Link>
      </div>
    </div>
  );
}
