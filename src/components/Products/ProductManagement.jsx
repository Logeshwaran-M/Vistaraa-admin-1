import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Package, ArrowLeft, Plus } from "lucide-react";

// Import separated components
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import ProductDetails from "./ProductDetails";

const ProductManagement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [productsSnap, categoriesSnap, subCategoriesSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "subcategories"))
      ]);

      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCategories(categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSubCategories(subCategoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentView('add');
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setCurrentView('edit');
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setCurrentView('view');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProduct(null);
    setSearchTerm("");
  };

  const filteredProducts = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return products.filter((p) => {
      const nameMatch = String(p.name || "").toLowerCase().includes(term);
      const categoryMatch = !filterCategory || p.category === filterCategory;
      return nameMatch && categoryMatch;
    });
  }, [products, debouncedSearch, filterCategory]);

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || "N/A";
  const getSubCategoryName = (id) => subCategories.find(s => s.id === id)?.name || "";

  return (
    <div className="min-h-screen bg-[#fcfdff] w-full pb-10">
      {/* MANAGEMENT HEADER (RESPONSIVE) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentView}
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className="px-4 md:px-8 py-6 md:py-8 bg-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-30"
        >
          <div className="flex items-center gap-4">
            {currentView !== 'list' && (
              <button 
                onClick={handleBackToList}
                className="p-2 hover:bg-gray-50 rounded-xl transition-all border border-gray-100 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Package className="text-indigo-600 hidden sm:block" />
                {currentView === 'list' && "Product Hub"}
                {currentView === 'add' && "New Creation"}
                {currentView === 'edit' && "Refining Product"}
                {currentView === 'view' && "Product Spotlight"}
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">
                {currentView === 'list' && "Overview of your digital inventory."}
                {currentView === 'add' && "Expanding your marketplace catalog."}
                {currentView === 'edit' && `Modifying: ${selectedProduct?.name}`}
                {currentView === 'view' && "Deep dive into product metrics."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {currentView === 'list' && (
              <>
                <button 
                  onClick={fetchAll}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm transition-all shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Sync
                </button>
                <button 
                  onClick={handleAddNew}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition-all shadow-lg shadow-indigo-100"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <main className="max-w-[1600px] mx-auto transition-all duration-300 mt-6 px-4 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {currentView === 'add' && (
              <ProductForm 
                mode="add" 
                categories={categories} 
                subCategories={subCategories} 
                onSave={() => { fetchAll(); handleBackToList(); }} 
                onCancel={handleBackToList} 
              />
            )}
            {currentView === 'edit' && (
              <ProductForm 
                mode="edit" 
                product={selectedProduct} 
                categories={categories} 
                subCategories={subCategories} 
                onSave={() => { fetchAll(); handleBackToList(); }} 
                onCancel={handleBackToList} 
              />
            )}
            {currentView === 'view' && (
              <ProductDetails 
                product={selectedProduct} 
                categories={categories} 
                subCategories={subCategories} 
                onEdit={handleEdit} 
                onClose={handleBackToList} 
              />
            )}
            {currentView === 'list' && (
              <ProductList
                products={filteredProducts}
                categories={categories}
                subCategories={subCategories}
                loading={loading}
                searchTerm={searchTerm}
                filterCategory={filterCategory}
                filterStatus={filterStatus}
                onSearchChange={setSearchTerm}
                onCategoryFilterChange={setFilterCategory}
                onStatusFilterChange={setFilterStatus}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                onRefresh={fetchAll}
                getCategoryName={getCategoryName}
                getSubCategoryName={getSubCategoryName}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProductManagement;