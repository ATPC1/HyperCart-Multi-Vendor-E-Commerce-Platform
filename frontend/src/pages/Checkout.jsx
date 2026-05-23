import { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, Loader2, Tag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart } from '../store/slices/cartSlice';
import axios from 'axios';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { cartItems } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);

  const [address, setAddress] = useState({ fullName: '', address: '', city: '', postalCode: '' });
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Flexible Payment Gateway states
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'sandbox'
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.1;
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + tax - discount);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    // Dynamically load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [navigate]);

  // Card formatting and network helpers
  const getCardNetwork = (number) => {
    const cleanNumber = number.replace(/\s+/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5')) return 'mastercard';
    if (cleanNumber.startsWith('6') || cleanNumber.startsWith('9')) return 'rupay';
    return 'unknown';
  };
  const cardNetwork = getCardNetwork(cardNumber);

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // digits only
    const matches = value.match(/.{1,4}/g);
    const formatted = matches ? matches.join(' ') : '';
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    if (value.length <= 5) {
      setCardExpiry(value);
    }
  };

  const handleCardCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardCvv(value);
    }
  };

  const handlePayment = async () => {
    if (!address.fullName || !address.address || !address.city || !address.postalCode) {
      alert('Please fill out all shipping details first.');
      return;
    }

    if (paymentMethod === 'sandbox') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length !== 16) {
        alert('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardName.trim()) {
        alert('Please enter the cardholder name.');
        return;
      }
      if (cardExpiry.length !== 5) {
        alert('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length !== 3) {
        alert('Please enter a valid 3-digit CVV.');
        return;
      }
    }

    setLoading(true);

    try {
      if (paymentMethod === 'sandbox') {
        // Simulated authorization wait
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const orderData = {
          orderItems: cartItems,
          shippingAddress: address,
          paymentMethod: 'Credit Card (Mock Sandbox)',
          totalPrice: total,
          paymentResult: {
            id: `mock_cc_${new Date().getTime()}`,
            status: 'success',
            update_time: new Date().toISOString(),
            email_address: user.email,
          }
        };
        
        const createdOrder = await dispatch(createOrder(orderData)).unwrap();
        dispatch(clearCart());
        navigate(`/order-status/${createdOrder._id}`);
        return;
      }

      // 1. Get Razorpay order id from backend
      const { data } = await axios.post(
        'https://hypercart-backend-production.up.railway.app/api/orders/razorpay',
        { amount: total },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const razorpayOrderId = data.id;

      if (data.isMock) {
        console.log('[Checkout] Mock payment mode enabled! Bypassing Razorpay popup.');
        const orderData = {
          orderItems: cartItems,
          shippingAddress: address,
          paymentMethod: 'Razorpay (Mock)',
          totalPrice: total,
          paymentResult: {
            id: `mock_pay_${new Date().getTime()}`,
            status: 'success',
            update_time: new Date().toISOString(),
            email_address: user.email,
          }
        };
        
        const createdOrder = await dispatch(createOrder(orderData)).unwrap();
        dispatch(clearCart());
        navigate(`/order-status/${createdOrder._id}`);
        return;
      }

      // 2. Open Razorpay modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'HyperCart',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const orderData = {
              orderItems: cartItems,
              shippingAddress: address,
              paymentMethod: 'Razorpay',
              totalPrice: total,
              paymentResult: {
                id: response.razorpay_payment_id,
                status: 'success',
                update_time: new Date().toISOString(),
                email_address: user.email,
              }
            };
            
            const createdOrder = await dispatch(createOrder(orderData)).unwrap();
            dispatch(clearCart());
            navigate(`/order-status/${createdOrder._id}`);
          } catch (err) {
            console.error('Failed to create order', err);
            alert('Payment successful but failed to save order. Contact support.');
          }
        },
        prefill: {
          name: address.fullName,
          email: user.email,
        },
        theme: {
          color: '#0F3460'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-navy mb-8">Secure Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          
          {/* Section 1: Shipping Address */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm">1</span>
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-electric focus:border-transparent outline-none text-sm" placeholder="John Doe" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input required type="text" value={address.address} onChange={e => setAddress({...address, address: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-electric focus:border-transparent outline-none text-sm" placeholder="123 Main St" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input required type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-electric focus:border-transparent outline-none text-sm" placeholder="New York" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input required type="text" value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-electric focus:border-transparent outline-none text-sm" placeholder="10001" />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm">2</span>
              Select Payment Method
            </h2>
            <p className="text-sm text-gray-500 mb-6">Choose how you want to pay. All payments are sandbox-friendly.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Razorpay */}
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-32 ${
                  paymentMethod === 'razorpay'
                    ? 'border-electric bg-electric/5 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy text-sm sm:text-base">Razorpay Gateway</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-electric' : 'border-gray-300'}`}>
                    {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-electric" />}
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Pay securely via UPI, NetBanking, Card, or Wallets with Razorpay checkout.</p>
              </div>

              {/* Option B: Credit Card Sandbox */}
              <div
                onClick={() => setPaymentMethod('sandbox')}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-32 ${
                  paymentMethod === 'sandbox'
                    ? 'border-electric bg-electric/5 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy text-sm sm:text-base">Credit Card Sandbox</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'sandbox' ? 'border-electric' : 'border-gray-300'}`}>
                    {paymentMethod === 'sandbox' && <div className="w-2.5 h-2.5 rounded-full bg-electric" />}
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Instantly test the shopping workflow using our interactive 3D card simulator.</p>
              </div>
            </div>

            {/* Sandbox Credit Card Form */}
            {paymentMethod === 'sandbox' && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                
                {/* 3D Flipping Card Graphic */}
                <div className="w-full max-w-sm mx-auto h-52 relative rounded-2xl mb-8 select-none" style={{ perspective: '1000px' }}>
                  <div
                    className="w-full h-full rounded-2xl transition-transform duration-700 ease-out relative"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Front of Card */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-2xl p-6 text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-xl flex flex-col justify-between"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <div className="w-10 h-8 bg-amber-300 rounded-lg flex items-center justify-center overflow-hidden border border-amber-400 opacity-90 relative">
                            <div className="absolute inset-2 border border-amber-600 rounded"></div>
                            <div className="w-px h-full bg-amber-600 absolute left-1/3"></div>
                            <div className="w-px h-full bg-amber-600 absolute right-1/3"></div>
                            <div className="h-px w-full bg-amber-600 absolute top-1/3"></div>
                            <div className="h-px w-full bg-amber-600 absolute bottom-1/3"></div>
                          </div>
                          <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h.01M8 12h.01M12 12h.01M16 12h.01M19 12h.01M12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="font-heading font-black text-xl italic tracking-wide uppercase select-none">
                          {cardNetwork === 'visa' && 'VISA'}
                          {cardNetwork === 'mastercard' && 'mastercard'}
                          {cardNetwork === 'rupay' && 'RuPay'}
                          {cardNetwork === 'unknown' && 'CARD'}
                        </span>
                      </div>
                      
                      <div className="text-2xl font-mono tracking-widest text-center py-2 select-all">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="min-w-0 flex-1 pr-4">
                          <span className="text-[9px] text-white/60 block uppercase tracking-wider mb-0.5">Cardholder</span>
                          <span className="text-sm font-mono font-bold uppercase tracking-wide truncate block">
                            {cardName || 'ANURAG TIWARI'}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[9px] text-white/60 block uppercase tracking-wider mb-0.5">Expires</span>
                          <span className="text-sm font-mono font-bold tracking-wide">
                            {cardExpiry || 'MM/YY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-gray-900 via-indigo-950 to-gray-800 text-white shadow-xl flex flex-col justify-between py-6"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="w-full h-11 bg-gray-950 mt-2"></div>
                      
                      <div className="px-6 flex flex-col gap-1">
                        <span className="text-[8px] text-white/50 uppercase tracking-widest text-right">Authorized Signature</span>
                        <div className="flex items-center bg-white/10 rounded overflow-hidden">
                          <div className="flex-1 h-9 bg-gradient-to-r from-gray-200 via-white to-gray-300 opacity-90 px-3 flex items-center italic text-gray-800 font-mono font-bold tracking-wider select-none">
                            xxxx xxxx xxxx
                          </div>
                          <div className="w-12 h-9 bg-yellow-400 text-gray-900 flex items-center justify-center font-mono font-black text-sm select-all">
                            {cardCvv || '•••'}
                          </div>
                        </div>
                      </div>

                      <div className="px-6 flex justify-between items-center text-[8px] text-white/40">
                        <span>HYPERCART SECURE SANDBOX</span>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold font-mono">HC</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      onFocus={() => setIsFlipped(false)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-electric focus:border-transparent outline-none text-sm font-mono tracking-widest"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value.toUpperCase())}
                      onFocus={() => setIsFlipped(false)}
                      placeholder="ANURAG TIWARI"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-electric focus:border-transparent outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleCardExpiryChange}
                      onFocus={() => setIsFlipped(false)}
                      placeholder="MM/YY"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-electric focus:border-transparent outline-none text-sm font-mono tracking-wider"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={handleCardCvvChange}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      placeholder="•••"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-electric focus:border-transparent outline-none text-sm font-mono tracking-widest"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right side Order Summary Panel */}
        <div className="w-full lg:w-96">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-lg text-navy mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.product} className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <span className="text-sm font-bold">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-4 border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-navy">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span className="font-semibold text-navy">${tax.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{appliedCoupon.code}</span>
                  <span className="font-semibold">-${appliedCoupon.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="font-bold text-base text-navy">Total</span>
                <span className="font-black text-2xl text-electric">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <Tag className="w-4 h-4" />
                    <span className="font-bold text-sm">{appliedCoupon.code}</span>
                    <span className="text-xs">applied</span>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-green-600 hover:text-green-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                  <button
                    disabled={couponLoading || !couponCode.trim()}
                    onClick={async () => {
                      setCouponLoading(true);
                      try {
                        const { data } = await axios.post('https://hypercart-backend-production.up.railway.app/api/coupons/apply',
                          { code: couponCode, orderAmount: subtotal + tax },
                          { headers: { Authorization: `Bearer ${user.token}` } }
                        );
                        setAppliedCoupon(data);
                      } catch (err) {
                        alert(err.response?.data?.message || 'Invalid coupon');
                      } finally { setCouponLoading(false); }
                    }}
                    className="bg-navy text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-navy/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                    Apply
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={handlePayment}
              disabled={loading || cartItems.length === 0}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mb-4 ${loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-electric text-white hover:bg-electric/90 hover:shadow-lg'}`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              {loading ? 'Processing secure payment...' : paymentMethod === 'razorpay' ? 'Pay with Razorpay' : 'Complete Sandbox Order'}
            </button>
            
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Payments are secure and encrypted.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
