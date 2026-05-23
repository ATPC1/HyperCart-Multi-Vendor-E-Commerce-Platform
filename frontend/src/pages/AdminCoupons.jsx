import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Tag, ToggleLeft, ToggleRight, Trash2, Loader2, Percent, DollarSign } from 'lucide-react';

export default function AdminCoupons() {
  const { user } = useSelector((state) => state.auth);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [expiresAt, setExpiresAt] = useState('');
  const [creating, setCreating] = useState(false);

  const cfg = { headers: { Authorization: `Bearer ${user?.token}` } };

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get('https://hypercart-backend-production.up.railway.app/api/coupons', cfg);
      setCoupons(data);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post('https://hypercart-backend-production.up.railway.app/api/coupons', {
        code, discountType, discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        expiresAt: expiresAt || undefined,
      }, cfg);
      toast.success(`Coupon "${code.toUpperCase()}" created!`);
      setShowModal(false);
      setCode(''); setDiscountValue(''); setMinOrderAmount('0'); setExpiresAt('');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally { setCreating(false); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.put(`https://hypercart-backend-production.up.railway.app/api/coupons/${id}/toggle`, {}, cfg);
      setCoupons((prev) => prev.map((c) => (c._id === id ? data : c)));
    } catch { toast.error('Failed to toggle'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`https://hypercart-backend-production.up.railway.app/api/coupons/${id}`, cfg);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('Coupon deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy">Coupon Management</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage discount codes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-electric text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-electric/90 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Discount</th>
                  <th className="p-4 font-medium">Min Order</th>
                  <th className="p-4 font-medium">Expires</th>
                  <th className="p-4 font-medium">Uses</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-navy text-sm bg-navy/5 px-2.5 py-1 rounded-lg">{c.code}</span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-700">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`} off
                    </td>
                    <td className="p-4 text-sm text-gray-600">${c.minOrderAmount}</td>
                    <td className="p-4 text-sm text-gray-600">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                    <td className="p-4 text-sm text-gray-600">{c.usageCount}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(c._id)} className="p-1.5 text-gray-400 hover:text-navy rounded-lg hover:bg-slate-100 transition-colors" title="Toggle status">
                          {c.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 text-gray-400 hover:text-electric hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan="7" className="p-10 text-center text-gray-400">No coupons yet. Create your first one!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-electric" /> Create New Coupon
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input required type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE20"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-navy uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                    </span>
                    <input required type="number" min="1" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full pl-8 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order ($)</label>
                  <input type="number" min="0" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                  <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 bg-electric text-white py-2.5 rounded-xl font-bold hover:bg-electric/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
