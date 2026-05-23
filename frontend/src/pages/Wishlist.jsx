import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Loader2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  const handleRemove = (productId) => {
    dispatch(toggleWishlist(productId)).then(() => dispatch(fetchWishlist()));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: 1,
      vendor: product.user?._id || product.user,
    }));
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#0F3460', color: '#fff', fontWeight: '600' },
      icon: '🛒',
    });
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Heart className="w-16 h-16 mx-auto text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-navy mb-2">Your Wishlist</h2>
        <p className="text-gray-500 mb-6">Please sign in to view your saved items.</p>
        <Link to="/login" className="bg-electric text-white px-6 py-3 rounded-xl font-bold hover:bg-electric/90 transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-navy">My Wishlist</h1>
        <p className="text-gray-500 mt-1">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-electric" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Heart className="w-16 h-16 mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-navy mb-2">Nothing saved yet</h3>
          <p className="text-gray-500 mb-6">Browse products and click the heart to save your favorites.</p>
          <Link to="/products" className="bg-electric text-white px-6 py-3 rounded-xl font-bold hover:bg-electric/90 transition-colors inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => (
            <div key={product._id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <Link to={`/product/${product._id}`} className="relative overflow-hidden bg-slate-50" style={{ aspectRatio: '4/3' }}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
              <div className="p-4 flex flex-col flex-1 gap-2">
                <p className="text-xs font-semibold text-electric uppercase tracking-wide">{product.category}</p>
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-semibold text-navy hover:text-electric transition-colors line-clamp-2">{product.name}</h3>
                </Link>
                <p className="text-xl font-black text-navy mt-auto">${product.price?.toFixed(2)}</p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-navy text-white text-sm font-bold py-2.5 rounded-xl hover:bg-electric transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="p-2.5 text-gray-400 hover:text-electric hover:bg-red-50 rounded-xl border border-gray-100 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
