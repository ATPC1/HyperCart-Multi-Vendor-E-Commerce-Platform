import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, X, User, UserPlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity } from '../store/slices/cartSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleUpdateQuantity = (id, newQty) => {
    if(newQty < 1) return;
    dispatch(updateQuantity({ id, qty: newQty }));
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleProceedToCheckout = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <h1 className="text-3xl font-extrabold text-navy mb-8">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">Your cart is currently empty.</p>
          <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all bg-electric rounded-xl hover:bg-electric/90">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cartItems.map(item => (
              <div key={item.product} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-gray-50" />
                <div className="flex-1">
                  <h3 className="font-semibold text-navy text-lg line-clamp-1">{item.name}</h3>
                  <p className="text-electric font-bold mt-1">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-50 rounded-lg border border-gray-200">
                    <button onClick={() => handleUpdateQuantity(item.product, item.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-l-lg transition-colors">-</button>
                    <span className="w-10 text-center font-medium text-sm">{item.qty}</span>
                    <button onClick={() => handleUpdateQuantity(item.product, item.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-r-lg transition-colors">+</button>
                  </div>
                  <button onClick={() => handleRemoveItem(item.product)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-96">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg text-navy mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span className="font-semibold text-navy">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span className="font-semibold text-navy">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <span className="font-bold text-base text-navy">Total</span>
                  <span className="font-black text-2xl text-electric">${total.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={handleProceedToCheckout} className="w-full bg-navy text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-navy/90 hover:shadow-lg transition-all">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-navy hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8 mt-2">
              <div className="w-16 h-16 bg-electric/10 text-electric rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">Sign In to Checkout</h2>
              <p className="text-gray-500 text-sm">Please sign in or create an account to proceed with your order securely.</p>
            </div>

            <div className="space-y-4">
              <Link to="/login?redirect=/checkout" className="w-full py-4 flex items-center justify-center gap-2 font-bold rounded-xl text-white bg-navy hover:bg-navy/90 transition-colors">
                <User className="w-5 h-5" />
                Sign In
              </Link>
              <Link to="/signup?redirect=/checkout" className="w-full py-4 flex items-center justify-center gap-2 font-bold rounded-xl text-navy bg-slate-50 border-2 border-slate-100 hover:border-electric hover:bg-electric/5 transition-all">
                <UserPlus className="w-5 h-5" />
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
