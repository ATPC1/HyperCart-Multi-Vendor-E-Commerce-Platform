import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';
import StatusBadge from '../components/common/StatusBadge';
import { Package, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrderHistory() {
  const dispatch = useDispatch();
  const { myOrders: orders, loading, error } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-navy">Order History</h1>
        <Link to="/products" className="text-sm font-medium text-electric hover:text-navy transition-colors">
          Continue Shopping &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-electric" /></div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all bg-electric rounded-xl hover:bg-electric/90">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-8 text-sm">
                  <div>
                    <p className="text-gray-500 mb-0.5">Order Placed</p>
                    <p className="font-semibold text-navy">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5">Total</p>
                    <p className="font-semibold text-navy">${order.totalPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5">Order Number</p>
                    <p className="font-semibold text-navy">#{order._id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div>
                  <StatusBadge status={order.status} />
                </div>
              </div>
              
              <div className="p-6">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 mb-4 last:mb-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-navy">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Quantity: {item.qty}</p>
                    </div>
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-slate-50 transition-colors">
                      <Package className="w-4 h-4" />
                      Track Package
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
