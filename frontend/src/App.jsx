import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import OrderHistory from './pages/OrderHistory';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrders';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminCoupons from './pages/AdminCoupons';
import Wishlist from './pages/Wishlist';
import UserProfile from './pages/UserProfile';

// Protected Route Wrapper (Placeholder for later)
const ProtectedRoute = ({ children }) => {
  // In a real app, check Redux auth state here
  return children;
};

const ENDPOINT = "https://hypercart-backend-production.up.railway.app";
let socket;

function App() {
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    socket = io(ENDPOINT);

    if (user && user.role === 'vendor') {
      socket.emit('setup', user);
      
      socket.on('new_order', (data) => {
        toast.success(data.message || 'You have a new order!', {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#0F3460',
            color: '#fff',
            fontWeight: 'bold'
          },
          icon: '🎉',
        });
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <>
      <Toaster />
      <Router>
      <Routes>
        {/* Public & Buyer Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-status/:id" element={<OrderStatus />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* Auth Routes (No layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>

        {/* Vendor Dashboard Routes */}
        <Route path="/vendor" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="orders" element={<SellerOrders />} />
        </Route>
      </Routes>
      </Router>
    </>
  );
}

export default App;
