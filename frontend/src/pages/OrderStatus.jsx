import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function OrderStatus() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to home page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden">
        {/* Success Animation Background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
        
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-navy mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. Your order has been successfully placed and is being processed.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Number</p>
          <p className="text-lg font-mono font-bold text-navy">#{id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-electric" />
            Redirecting to home in 5 seconds...
          </p>
          
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-electric text-white rounded-xl font-bold hover:bg-electric/90 transition-colors"
          >
            Go to Home Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Add a quick loader component for the redirect message
const Loader2 = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
);
