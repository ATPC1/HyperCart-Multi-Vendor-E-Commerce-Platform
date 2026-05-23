import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User as UserIcon, Search, Menu, LogOut, X, Home, Package, History, LayoutDashboard } from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { clearCart } from '../../store/slices/cartSlice';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearCart());
    setMobileMenuOpen(false);
    navigate('/');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/products?keyword=${keyword}` : '/products');
    setKeyword('');
    setSearchFocused(false);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
      <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center shadow-md shadow-navy/20 group-hover:scale-105 transition-transform duration-300">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-navy tracking-tight hidden sm:block">HyperCart</span>
            </Link>

            {/* Search Bar - desktop */}
            <form onSubmit={submitHandler} className={`hidden md:flex flex-1 max-w-md relative transition-all duration-200 ${searchFocused ? 'max-w-xl' : ''}`}>
              <div className="relative w-full flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all bg-slate-50 focus:bg-white"
                />
                {keyword && (
                  <button type="button" onClick={() => setKeyword('')} className="absolute right-3 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Nav Links - desktop */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600 flex-shrink-0">
              <Link to="/" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-navy transition-colors">Home</Link>
              <Link to="/products" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-navy transition-colors">Products</Link>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 text-gray-600 hover:text-navy hover:bg-slate-100 rounded-xl transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-electric text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <Link to={`/${user.role}/dashboard`} className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-electric text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm font-semibold text-gray-700 max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-electric hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors shadow-sm">
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2.5 text-gray-600 hover:text-navy hover:bg-slate-100 rounded-xl transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 w-72 max-w-full h-full bg-white shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-navy flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-navy">HyperCart</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={(e) => { submitHandler(e); setMobileMenuOpen(false); }} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy bg-slate-50"
                />
              </div>
            </form>

            <nav className="flex flex-col gap-1">
              {[
                { to: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
                { to: '/products', label: 'Products', icon: <Package className="w-4 h-4" /> },
                { to: '/cart', label: `Cart (${cartCount})`, icon: <ShoppingCart className="w-4 h-4" /> },
                ...(user ? [
                  { to: '/orders', label: 'My Orders', icon: <History className="w-4 h-4" /> },
                  { to: `/${user.role}/dashboard`, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
                ] : []),
              ].map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-slate-100 hover:text-navy transition-colors text-sm"
                >
                  <span className="text-gray-400">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-electric text-white flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-electric border border-red-100 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-navy text-white px-4 py-3 rounded-xl font-bold hover:bg-navy/90 transition-colors">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
