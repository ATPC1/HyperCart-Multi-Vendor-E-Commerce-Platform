import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorOrders, updateOrderStatus } from '../store/slices/orderSlice';
import StatusBadge from '../components/common/StatusBadge';
import { Loader2 } from 'lucide-react';

export default function SellerOrders() {
  const dispatch = useDispatch();
  const { vendorOrders, loading, error } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchVendorOrders());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Order Management</h1>
        <p className="text-gray-500 text-sm mt-1">Track and update customer orders</p>
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
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendorOrders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-navy text-sm">#{order._id.substring(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-sm text-gray-600">{order.user?.name || 'Guest'}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx}>{item.qty}x {item.name}</div>
                      ))}
                    </td>
                    <td className="p-4 font-bold text-navy text-sm">${order.totalPrice.toFixed(2)}</td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-electric focus:border-electric block w-full p-2 outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {vendorOrders.length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No orders received yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
