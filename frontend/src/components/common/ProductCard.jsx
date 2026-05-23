import { ShoppingCart, Star, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { ids: wishlistIds, loading: wishlistLoading } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);
  const isWishlisted = wishlistIds?.includes(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      product: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: 1,
      vendor: product.sellerId || product.sellerName
    }));
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#0F3460', color: '#fff', fontWeight: '600' },
      icon: '🛒',
    });
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please sign in to save items'); return; }
    dispatch(toggleWishlist(product.id)).then(() => {
      toast(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist ❤️', {
        style: { background: isWishlisted ? '#fff' : '#0F3460', color: isWishlisted ? '#333' : '#fff' },
      });
    });
  };
  const stars = Math.round(product.rating || 4);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      
      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative overflow-hidden bg-slate-50 block" style={{ aspectRatio: '4/3' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          style={{ transform: 'scale(1)' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <span className="bg-white text-navy text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-3 h-3" /> Quick View
          </span>
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${isWishlisted ? 'bg-electric text-white scale-110' : 'bg-white/90 text-gray-400 hover:text-electric hover:scale-110'}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.stock === 0 && (
            <span className="bg-gray-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="bg-electric text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
              Only {product.stock} left!
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-[11px] font-semibold text-electric uppercase tracking-wider">{product.sellerName}</p>

        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-navy transition-colors text-sm">{product.name}</h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.numReviews ?? 0})</span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
          <div>
            <span className="text-xl font-black text-navy">${product.price.toFixed(2)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-navy text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-electric transition-all duration-200 shadow-sm hover:shadow-electric/30 hover:shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
