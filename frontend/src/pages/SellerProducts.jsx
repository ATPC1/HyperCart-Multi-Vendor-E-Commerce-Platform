import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Loader2, X, Upload, ImageIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorProducts, createProduct, deleteProduct, updateProduct } from '../store/slices/productSlice';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Sports & Outdoors', 'Wellness & Beauty'];

function ProductModal({ mode, product, onClose, onSave }) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price || '');
  const [stock, setStock] = useState(product?.stock || '');
  const [category, setCategory] = useState(product?.category || 'Electronics');
  const [description, setDescription] = useState(product?.description || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = imagePreview;
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      setUploading(true);
      try {
        const { data } = await axios.post('http://localhost:5001/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = data.imageUrl;
      } catch { toast.error('Image upload failed'); setUploading(false); return; }
      setUploading(false);
    } else if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400';
    }
    onSave({ name, price: Number(price), stock: Number(stock), category, description, image: imageUrl });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-navy p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-navy mb-6">{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-navy focus:border-transparent outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-navy focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
              <input required type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-navy focus:border-transparent outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-navy outline-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className="flex gap-3 items-start">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0" />
              )}
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-navy hover:bg-slate-50 transition-colors text-center">
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">{imageFile ? imageFile.name : 'Click to upload image'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required rows="3" value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-navy outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
            <button disabled={uploading} type="submit" className="flex-1 flex justify-center items-center bg-electric text-white py-2.5 rounded-xl font-bold hover:bg-electric/90 transition-colors disabled:opacity-70">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'edit' ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SellerProducts() {
  const dispatch = useDispatch();
  const { vendorItems, loading, error } = useSelector(state => state.products);
  const [modalMode, setModalMode] = useState(null); // null | 'add' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => { dispatch(fetchVendorProducts()); }, [dispatch]);

  const openAdd = () => { setEditingProduct(null); setModalMode('add'); };
  const openEdit = (product) => { setEditingProduct(product); setModalMode('edit'); };
  const closeModal = () => { setModalMode(null); setEditingProduct(null); };

  const handleSave = (formData) => {
    if (modalMode === 'edit') {
      dispatch(updateProduct({ id: editingProduct._id, productData: formData })).then((res) => {
        if (!res.error) { toast.success('Product updated!'); closeModal(); }
        else toast.error(res.payload || 'Update failed');
      });
    } else {
      dispatch(createProduct(formData)).then((res) => {
        if (!res.error) { toast.success('Product published!'); closeModal(); }
        else toast.error(res.payload || 'Create failed');
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id)).then(() => toast.success('Product deleted'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product catalog ({vendorItems.length} items)</p>
        </div>
        <button onClick={openAdd} className="bg-electric text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-electric/90 hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-electric" /></div>
      ) : error ? (
        <div className="text-red-500 text-center bg-red-50 p-6 rounded-2xl">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendorItems.map(product => (
                  <tr key={product._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-100" />
                        <span className="font-semibold text-navy text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-navy/5 text-navy text-xs font-semibold rounded-lg">{product.category}</span></td>
                    <td className="p-4 text-sm font-bold text-gray-700">${product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${product.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock} left
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-gray-400 hover:text-electric hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vendorItems.length === 0 && (
                  <tr><td colSpan="5" className="p-12 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-500 font-medium">No products yet</p>
                    <p className="text-gray-400 text-sm">Click "Add Product" to get started</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalMode && (
        <ProductModal mode={modalMode} product={editingProduct} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
}
