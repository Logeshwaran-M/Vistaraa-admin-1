import React from 'react';
import { 
  Plus, RefreshCw, Search, Eye, 
  Edit, Trash2, Star, ShoppingCart, 
  Package, IndianRupee, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductStats from './ProductStats';

const ProductList = ({
  products,
  loading,
  searchTerm,
  onSearchChange,
  onAddNew,
  onEdit,
  onView,
  onDelete, 
  onRefresh,
  getCategoryName,
  getSubCategoryName
}) => {

  const visibleProducts = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter(p =>
      String(p.name || "").toLowerCase().includes(term) ||
      String(p.basesku || "").toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const stats = React.useMemo(() => {
    const totalProducts = visibleProducts.length;
    const outOfStock = visibleProducts.filter(p => (p.stock || 0) === 0).length;
    const lowStock = visibleProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
    const inStock = visibleProducts.filter(p => p.stock > 10).length;
    return { totalProducts, outOfStock, lowStock, inStock };
  }, [visibleProducts]);

  return (
    <div className="w-full">
      {/* Search & Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, SKU or brand..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-3.5 bg-white border border-gray-100 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            title="Refresh list"
          >
            <RefreshCw size={20} className={`${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onAddNew}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-10">
        <ProductStats stats={stats} />
      </div>

      {/* Results Section */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold tracking-tight">Accessing Inventory...</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">We couldn't find any products matching your search criteria. Try a different term or add a new item.</p>
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl font-black hover:bg-gray-900 hover:text-white transition-all"
            >
              <Plus size={18} />
              Setup First Product
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50/50 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">General Info</th>
                    <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Categorization</th>
                    <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Financials</th>
                    <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Availability</th>
                    <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleProducts.map((product) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={product.id || product.productid}
                      className="group hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0].url || product.images[0]}
                                className="w-14 h-14 rounded-2xl object-cover bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform"
                                alt={product.name}
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                                <ShoppingCart className="text-gray-300" size={24} />
                              </div>
                            )}
                            {product.isFeatured && (
                              <div className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full border-2 border-white shadow-sm">
                                <Star className="text-white fill-white" size={10} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-gray-900 font-black text-sm group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-1">{product.name}</div>
                            <div className="text-gray-400 text-xs font-bold font-mono mt-0.5">{product.basesku || 'NO SKU'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 w-fit px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wide">
                            <Layers size={10} />
                            {product.categoryName || (getCategoryName ? getCategoryName(product.category) : 'N/A')}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 ml-1">{product.subcategoryName || 'No Subcategory'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <div className="text-gray-900 font-black flex items-center gap-0.5">
                            <IndianRupee size={12} />
                            {(product.offerprice || product.price)?.toLocaleString()}
                          </div>
                          {product.offerprice < product.price && (
                            <div className="text-gray-400 text-[10px] font-bold line-through ml-1 italic opacity-60">
                              ₹{product.price?.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 
                          product.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             product.stock > 10 ? 'bg-emerald-500' : 
                             product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {product.stock} Units
                        </div>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onView(product)}
                            className="p-2.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => onEdit(product)}
                            className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(product.productid || product.id)}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleProducts.map((product) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={product.id || product.productid}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url || product.images[0]}
                          className="w-20 h-20 rounded-2xl object-cover bg-gray-50"
                          alt={product.name}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                          <ShoppingCart className="text-gray-300" size={28} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-900 font-black text-sm uppercase tracking-tight line-clamp-2 leading-tight mb-1">{product.name}</h4>
                      <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg w-fit uppercase mb-2">
                        {product.categoryName || (getCategoryName ? getCategoryName(product.category) : 'General')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 font-black text-base flex items-center">
                          <IndianRupee size={14} strokeWidth={3} />
                          {(product.offerprice || product.price)?.toLocaleString()}
                        </span>
                        {product.offerprice < product.price && (
                           <span className="text-gray-400 text-xs font-bold line-through">₹{product.price?.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                      product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 
                      product.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {product.stock} Left
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(product)}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(product.productid || product.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;