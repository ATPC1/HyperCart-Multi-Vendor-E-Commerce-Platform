import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders } from '../store/slices/adminSlice';
import StatusBadge from '../components/common/StatusBadge';
import { Search, Loader2 } from 'lucide-react';

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Global Orders Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor all transactions across the platform</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent outline-none w-64 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-electric" /></div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-sm text-gray-500">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-navy text-sm">#{order._id.substring(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-sm text-gray-600">{order.user?.name || 'Guest'}</td>
                    <td className="p-4 text-sm text-gray-600">{order.orderItems.length} items</td>
                    <td className="p-4 font-bold text-navy text-sm">${order.totalPrice.toFixed(2)}</td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No orders found on the platform yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
