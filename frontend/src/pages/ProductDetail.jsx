import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Shield, Truck, Package, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { createProductReview } from '../store/slices/productSlice';
import axios from 'axios';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { user } = useSelector(state => state.auth);
  const { reviewSuccess, reviewError, reviewLoading } = useSelector(state => state.products);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5001/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, reviewSuccess]);

  useEffect(() => {
    if (reviewSuccess) {
      alert('Review Submitted!');
      setRating(5);
      setComment('');
    }
  }, [reviewSuccess]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(createProductReview({
      productId: id,
      review: { rating, comment }
    }));
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: quantity,
      vendor: product.user._id
    }));
    alert('Added to cart!');
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-electric" /></div>;
  if (error) return <div className="text-center text-red-500 py-20">{error}</div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          <div className="p-8 bg-gray-50 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="max-w-full h-auto rounded-2xl shadow-lg mix-blend-multiply" />
          </div>

          <div className="p-8 lg:p-12">
            <div className="mb-2">
              <span className="text-electric font-semibold text-sm tracking-wide uppercase">{product.user?.name}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-navy mb-4 tracking-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-1 text-gray-700 font-medium">{product.rating || 5.0}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 hover:text-navy cursor-pointer transition-colors">{product.numReviews || 0} Reviews</span>
            </div>

            <div className="text-4xl font-black text-navy mb-6">${product.price.toFixed(2)}</div>

            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-6 mb-8 py-6 border-y border-gray-100">
              <div className="flex items-center">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-navy hover:text-navy transition-colors"
                >-</button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-navy hover:text-navy transition-colors"
                >+</button>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-green-600">In Stock</span>
                <span className="text-gray-500 ml-2">({product.stock} available)</span>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-navy text-white hover:bg-navy/90 hover:shadow-lg hover:-translate-y-1'}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-50">
                <Truck className="w-6 h-6 text-electric mb-2" />
                <span className="text-xs font-semibold text-navy">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-50">
                <Shield className="w-6 h-6 text-electric mb-2" />
                <span className="text-xs font-semibold text-navy">1 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-50">
                <Package className="w-6 h-6 text-electric mb-2" />
                <span className="text-xs font-semibold text-navy">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-12">
        <h2 className="text-2xl font-bold text-navy mb-6">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Reviews List */}
          <div>
            {product.reviews.length === 0 ? (
              <div className="text-gray-500 bg-slate-50 p-6 rounded-2xl text-center">No reviews yet. Be the first to review this product!</div>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-navy">{review.name}</strong>
                      <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{review.createdAt?.substring(0, 10)}</p>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Form */}
          <div>
            <h3 className="text-xl font-bold text-navy mb-4">Write a Customer Review</h3>
            {reviewError && <div className="text-red-500 mb-4 bg-red-50 p-3 rounded-lg text-sm">{reviewError}</div>}
            {user ? (
              <form onSubmit={submitHandler} className="space-y-4 bg-slate-50 p-6 rounded-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-electric outline-none"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea 
                    required
                    rows="4" 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-electric outline-none"
                    placeholder="Share your thoughts about this product..."
                  ></textarea>
                </div>
                <button 
                  disabled={reviewLoading}
                  type="submit" 
                  className="w-full flex justify-center items-center bg-electric text-white py-3 rounded-xl font-bold hover:bg-electric/90 transition-colors disabled:opacity-70"
                >
                  {reviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl text-center">
                Please <a href="/login" className="text-electric hover:underline font-bold">sign in</a> to write a review.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
