import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Lock, Check, Loader2, Shield, Phone, MapPin, Home, Save } from 'lucide-react';

export default function UserProfile() {
  const { user, loading: profileLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [nameLoading, setNameLoading] = useState(false);

  // Shipping address
  const [shipFullName, setShipFullName] = useState(user?.shippingAddress?.fullName || '');
  const [shipAddress, setShipAddress] = useState(user?.shippingAddress?.address || '');
  const [shipCity, setShipCity] = useState(user?.shippingAddress?.city || '');
  const [shipPostal, setShipPostal] = useState(user?.shippingAddress?.postalCode || '');
  const [addressLoading, setAddressLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setNameLoading(true);
    try {
      await dispatch(updateProfile({ name, phone })).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      await dispatch(updateProfile({
        shippingAddress: {
          fullName: shipFullName,
          address: shipAddress,
          city: shipCity,
          postalCode: shipPostal,
        }
      })).unwrap();
      toast.success('Shipping address saved!');
    } catch (err) {
      toast.error(err || 'Failed to update address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await dispatch(updateProfile({ currentPassword, password: newPassword })).unwrap();
      toast.success('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-navy">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your personal information, shipping address, and security</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy to-electric text-white flex items-center justify-center text-2xl font-black shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-xl font-bold text-navy">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 px-3 py-0.5 bg-navy/10 text-navy text-xs font-bold rounded-full capitalize">{user.role}</span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <User className="w-5 h-5 text-electric" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-slate-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-electric" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={nameLoading || (name === user.name && phone === (user.phone || ''))}
            className="flex items-center gap-2 bg-navy text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Shipping Address card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <form onSubmit={handleUpdateAddress} className="space-y-5">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <MapPin className="w-5 h-5 text-electric" /> Default Shipping Address
          </h2>
          <p className="text-sm text-gray-500 -mt-3">This address will be automatically filled during checkout.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Receiver)</label>
              <input
                type="text"
                value={shipFullName}
                onChange={(e) => setShipFullName(e.target.value)}
                placeholder="Anurag Tiwari"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-electric" /> Street Address
              </label>
              <input
                type="text"
                value={shipAddress}
                onChange={(e) => setShipAddress(e.target.value)}
                placeholder="123 Main Street, Apt 4B"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={shipCity}
                onChange={(e) => setShipCity(e.target.value)}
                placeholder="Lucknow"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
              <input
                type="text"
                value={shipPostal}
                onChange={(e) => setShipPostal(e.target.value)}
                placeholder="226001"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={addressLoading}
            className="flex items-center gap-2 bg-electric text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-electric/90 transition-colors disabled:opacity-50"
          >
            {addressLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Address
          </button>
        </form>
      </div>

      {/* Password card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <Shield className="w-5 h-5 text-electric" /> Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all" />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="flex items-center gap-2 bg-electric text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-electric/90 transition-colors disabled:opacity-50"
          >
            {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
