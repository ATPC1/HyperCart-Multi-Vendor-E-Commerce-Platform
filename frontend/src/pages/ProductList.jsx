import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, updateProductStockLive } from '../store/slices/productSlice';
import { socket } from '../App';
import ProductCard from '../components/common/ProductCard';
import { Loader2, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Sports & Outdoors', 'Wellness & Beauty'];

const SORT_OPTIONS = [
  { label: 'Featured', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const categoryParam = searchParams.get('category') || '';

  const [priceRange, setPriceRange] = useState(2000);
  const [category, setCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const dispatch = useDispatch();
  const { items: rawProducts, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (category) params.set('category', category);
    params.set('maxPrice', priceRange);
    dispatch(fetchProducts(params.toString()));
  }, [dispatch, keyword, category, priceRange]);

  useEffect(() => {
    if (!socket) return;
    const handleStockUpdate = (updates) => {
      dispatch(updateProductStockLive(updates));
    };
    socket.on('stock_update', handleStockUpdate);
    return () => socket.off('stock_update', handleStockUpdate);
  }, [dispatch]);

  // Client-side sort
  const products = [...rawProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const handleCategoryChange = (cat) => {
    setCategory(prev => prev === cat ? '' : cat);
  };

  const clearFilters = () => {
    setCategory('');
    setPriceRange(2000);
    setSortBy('');
  };

  const activeFiltersCount = (category ? 1 : 0) + (priceRange < 2000 ? 1 : 0);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-navy text-base">Filters</h3>
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-electric font-semibold hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Category</h4>
        <div className="space-y-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-gray-600 hover:bg-slate-100'
              }`}
            >
              <span>{cat}</span>
              {category === cat && <X className="w-3.5 h-3.5 opacity-70" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Price</h4>
          <span className="text-sm font-bold text-navy">${priceRange.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          step="50"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-electric cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$0</span>
          <span>$2,000</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link to="/" className="hover:text-navy">Home</Link>
        <span>/</span>
        <span className="text-navy font-medium">{keyword ? `"${keyword}"` : category || 'All Products'}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-navy">
                {keyword ? `Results for "${keyword}"` : category || 'All Products'}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm hover:border-navy transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {activeFiltersCount > 0 && <span className="bg-electric text-white text-xs rounded-full px-1.5">{activeFiltersCount}</span>}
              </button>
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy shadow-sm cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(category || priceRange < 2000) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category && (
                <span className="flex items-center gap-1.5 bg-navy/10 text-navy text-xs font-semibold px-3 py-1.5 rounded-full">
                  {category}
                  <button onClick={() => setCategory('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {priceRange < 2000 && (
                <span className="flex items-center gap-1.5 bg-navy/10 text-navy text-xs font-semibold px-3 py-1.5 rounded-full">
                  Max ${priceRange}
                  <button onClick={() => setPriceRange(2000)}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="shimmer h-52 w-full" />
                  <div className="p-4 space-y-3">
                    <div className="shimmer h-3 w-1/2 rounded-full" />
                    <div className="shimmer h-4 w-full rounded-full" />
                    <div className="shimmer h-4 w-3/4 rounded-full" />
                    <div className="flex justify-between mt-4">
                      <div className="shimmer h-6 w-20 rounded-full" />
                      <div className="shimmer h-8 w-28 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 bg-red-50 p-12 rounded-2xl">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-navy mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="bg-electric text-white px-6 py-3 rounded-xl font-semibold hover:bg-electric/90 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <div key={product._id} className="animate-fadeInUp" style={{ animationDelay: `${i * 50}ms` }}>
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
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-navy">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar />
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full bg-navy text-white py-3 rounded-xl font-bold hover:bg-navy/90 transition-colors"
            >
              Show {products.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
