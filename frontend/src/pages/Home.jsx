import { useEffect } from 'react';
import { ArrowRight, Zap, Shield, Globe, Star, TrendingUp, Users, ShoppingBag, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/common/ProductCard';
import { useState } from 'react';

const SLIDER_IMAGES = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600&h=600', // Fashion
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600&h=600', // Offers/Sale
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1600&h=600', // Tech/Electronics
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1600&h=600', // Beauty
];

function AutoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] relative overflow-hidden bg-navy group">
      {SLIDER_IMAGES.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0 bg-black/30 z-10" />
          <img src={img} alt={`Offer slide ${index + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white pointer-events-none">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black drop-shadow-2xl mb-4 tracking-tight">Flash Deals Active</h2>
        <p className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-lg text-white/90">Grab them before they're gone!</p>
      </div>
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
        {SLIDER_IMAGES.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 shadow-md ${
              index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const CATEGORIES = [
  { label: 'Electronics', emoji: '💻', color: 'from-blue-500 to-indigo-600' },
  { label: 'Fashion', emoji: '👗', color: 'from-pink-500 to-rose-600' },
  { label: 'Home & Living', emoji: '🏠', color: 'from-amber-500 to-orange-600' },
  { label: 'Sports & Outdoors', emoji: '🏃‍♂️', color: 'from-green-500 to-teal-600' },
  { label: 'Wellness & Beauty', emoji: '🌸', color: 'from-purple-500 to-pink-600' },
];

function Hero() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const submitHandler = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/products?keyword=${keyword}` : '/products');
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-navy text-white">
      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-electric/20 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-blue-600/25 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-purple-600/15 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm shadow-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
          </span>
          <span className="text-sm font-medium text-white/90">Live Inventory · Real-time Updates</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-[80px] font-black tracking-tighter mb-6 leading-[0.9]">
          Shop Smarter,<br />
          <span className="gradient-text">Live Better.</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-lg md:text-xl text-white/60 mb-10 font-light leading-relaxed">
          Discover thousands of products from top vendors. Secure payments, instant delivery tracking, and unbeatable prices.
        </p>

        {/* Hero search bar */}
        <form onSubmit={submitHandler} className="relative max-w-lg mx-auto mb-10 flex">
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Search for anything..."
            className="flex-1 pl-6 pr-4 py-4 rounded-l-2xl text-gray-900 text-sm font-medium focus:outline-none shadow-xl"
          />
          <button type="submit" className="bg-electric hover:bg-electric/90 text-white px-6 py-4 rounded-r-2xl font-bold text-sm transition-colors shadow-xl">
            Search
          </button>
        </form>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/products" className="group inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-electric rounded-2xl hover:bg-electric/90 hover:shadow-lg hover:shadow-electric/30 hover:-translate-y-1 transition-all duration-300">
            Browse All Products
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/signup" className="group inline-flex items-center justify-center px-8 py-4 font-bold text-white border border-white/20 rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
            Become a Vendor
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
          {[
            { icon: <ShoppingBag className="w-5 h-5" />, value: '10K+', label: 'Products' },
            { icon: <Users className="w-5 h-5" />, value: '500+', label: 'Vendors' },
            { icon: <Star className="w-5 h-5" />, value: '4.9★', label: 'Rating' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 flex flex-col items-center gap-1">
              <div className="text-electric">{s.icon}</div>
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-xs text-white/50 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategorySection() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-navy">Shop by Category</h2>
          <p className="text-gray-500 mt-1 text-sm">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.label}
              to={`/products?category=${encodeURIComponent(cat.label)}`}
              className={`group relative overflow-hidden bg-gradient-to-br ${cat.color} p-6 rounded-3xl text-white text-center flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer`}
            >
              <div className="text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{cat.emoji}</div>
              <span className="font-bold text-sm tracking-wide">{cat.label}</span>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-3xl" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBanner() {
  const features = [
    { icon: <Shield className="w-5 h-5 text-electric" />, title: 'Secure Payments', desc: 'Powered by Razorpay' },
    { icon: <Zap className="w-5 h-5 text-electric" />, title: 'Fast Delivery', desc: 'Express shipping available' },
    { icon: <Globe className="w-5 h-5 text-electric" />, title: 'Multi-Vendor', desc: '500+ trusted sellers' },
    { icon: <TrendingUp className="w-5 h-5 text-electric" />, title: 'Best Prices', desc: 'Price-match guarantee' },
  ];
  return (
    <section className="bg-slate-50 border-y border-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-gray-100">{f.icon}</div>
              <div>
                <p className="font-semibold text-navy text-sm">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-electric text-xs font-bold uppercase tracking-widest mb-2">Handpicked for You</p>
            <h2 className="text-3xl font-black text-navy tracking-tight">Featured Products</h2>
            <p className="text-slate-500 mt-1">Top-rated items from our best sellers</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-1 text-electric font-semibold hover:text-navy transition-colors group text-sm">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="shimmer h-48 w-full" />
                <div className="p-4 space-y-3">
                  <div className="shimmer h-3 w-2/3 rounded-full" />
                  <div className="shimmer h-4 w-full rounded-full" />
                  <div className="shimmer h-4 w-4/5 rounded-full" />
                  <div className="flex justify-between mt-4">
                    <div className="shimmer h-6 w-20 rounded-full" />
                    <div className="shimmer h-8 w-24 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 bg-red-50 p-8 rounded-2xl">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold text-gray-400">No products yet</p>
            <p className="text-sm">Sellers haven't added anything yet!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, i) => (
              <div key={product._id} className="animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
                <ProductCard
                  product={{
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    sellerId: product.user?._id,
                    sellerName: product.user?.name || 'Unknown Seller',
                    stock: product.stock,
                    image: product.image,
                    rating: product.rating,
                    numReviews: product.numReviews,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link to="/products" className="inline-flex items-center gap-2 text-electric font-semibold">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TestimonialBanner() {
  const testimonials = [
    { name: 'Aarav M.', text: 'Best shopping platform I\'ve used. Super fast and reliable!', stars: 5 },
    { name: 'Priya K.', text: 'Love the multi-vendor selection. Found everything I needed.', stars: 5 },
    { name: 'Rahul S.', text: 'Real-time stock updates are a game changer. Highly recommend.', stars: 5 },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-electric text-xs font-bold uppercase tracking-widest mb-2">What customers say</p>
          <h2 className="text-3xl font-black text-navy">Loved by Thousands</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="bg-slate-50 border border-gray-100 rounded-3xl p-8 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex text-amber-400">
                {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">"{t.text}"</p>
              <p className="text-navy font-bold text-sm">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="font-sans">
      <AutoSlider />
      <Hero />
      <TrustBanner />
      <CategorySection />
      <FeaturedProducts />
      <TestimonialBanner />
    </div>
  );
}
