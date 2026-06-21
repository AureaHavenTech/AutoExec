"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Package, 
  Smartphone, 
  Sparkles, 
  ChevronRight, 
  Layout, 
  Camera, 
  Tag, 
  Layers,
  ArrowRight,
  ExternalLink,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/components/ui/notifications";

export default function StorefrontPage() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Pet Tech",
    description: "",
    image_url: "",
    variant: "high-end"
  });

  const categories = ["Pet Tech", "Beauty", "Home/Office AI Tech"];
  const variants = ["high-end", "budget"];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/storefront");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      addNotification("Validation Error", "Name and price are required.", "warning");
      return;
    }

    try {
      const res = await fetch("/api/storefront", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "create_product", 
          data: { ...newProduct, price: parseFloat(newProduct.price) } 
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification("Product Created", `${newProduct.name} has been added to your catalog.`, "success");
        setIsAdding(false);
        setNewProduct({
          name: "",
          price: "",
          category: "Pet Tech",
          description: "",
          image_url: "",
          variant: "high-end"
        });
        fetchProducts();
      }
    } catch (err) {
      addNotification("Error", "Failed to create product.", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch("/api/storefront", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_product", data: { id } })
      });
      const data = await res.json();
      if (data.success) {
        addNotification("Product Deleted", "Product removed from catalog.", "success");
        fetchProducts();
      }
    } catch (err) {
      addNotification("Error", "Failed to delete product.", "error");
    }
  };

  const generateProductPage = (product: any) => {
    // This is where we'd call the engine to generate the HTML
    // For now, we'll just show a success message and open the preview page
    addNotification("Generating Page", "Creating beautiful luxury layout...", "info");
    setTimeout(() => {
      window.open(`/dashboard/storefront/preview?product=${encodeURIComponent(JSON.stringify(product))}`, "_blank");
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Aura Haven Storefront</span>
            <ShoppingBag className="h-6 w-6 text-brand-400" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Build and manage your luxury product catalog for Dropshipping.
          </p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-brand-600 hover:bg-brand-700 h-10 px-6"
        >
          {isAdding ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> Add Product</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 bg-slate-900/40 border-brand-500/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreateProduct} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Product Name</label>
                <input 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. Smart Pet Feeder Pro"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price (USD)</label>
                  <input 
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="99.99"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Variant Style</label>
                <div className="flex gap-2">
                  {variants.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNewProduct({...newProduct, variant: v})}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        newProduct.variant === v 
                          ? "bg-brand-500/10 border-brand-500 text-brand-400" 
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input 
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500 min-h-[100px]"
                  placeholder="Luxury description for the product..."
                />
              </div>
              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 h-11">
                Save Product to Catalog
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Catalog Display */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
            <p className="text-slate-500 mt-4 font-medium">Loading Aura Haven catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full border border-dashed border-slate-800 rounded-2xl p-20 text-center">
            <Package className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Your catalog is empty</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">Add your first Pet Tech, Beauty, or AI product to get started.</p>
            <Button variant="outline" className="mt-6 border-slate-700" onClick={() => setIsAdding(true)}>
              Create Your First Product
            </Button>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="overflow-hidden bg-slate-900/30 border-slate-900 group hover:border-brand-500/50 transition-all duration-300">
              <div className="relative h-48 bg-slate-950 overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-800">
                    <Package className="h-16 w-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className={`
                    ${product.variant === 'high-end' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}
                    backdrop-blur-md px-2 py-0.5 text-[9px] font-black tracking-tighter uppercase
                  `}>
                    {product.variant}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 bg-white text-black" onClick={() => generateProductPage(product)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 bg-white text-black">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="danger" className="rounded-full h-9 w-9" onClick={() => handleDeleteProduct(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{product.category}</p>
                  </div>
                  <span className="text-lg font-black text-brand-400">${product.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {product.description || "No description provided."}
                </p>
                <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Layers className="h-3 w-3" />
                    <span>Layout: Luxury</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-brand-400 hover:text-brand-300 hover:bg-brand-500/5" onClick={() => generateProductPage(product)}>
                    Preview Page <ArrowRight className="h-3 w-3 ml-1.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Luxury Style Demo Card */}
      <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <Sparkles className="h-40 w-40 text-brand-400" />
        </div>
        <div className="relative z-10 space-y-4 max-w-xl">
          <Badge className="bg-brand-500/10 text-brand-400 border-brand-500/20 mb-2">Exclusive Owner Feature</Badge>
          <h2 className="text-2xl font-black text-white leading-tight">
            Generate &ldquo;Aura Haven&rdquo; Luxury Landing Pages in Seconds
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            AutoExec uses a proprietary CSS framework (Dark Gray + Cream + Gold) to build high-converting storefronts. 
            No more paywalls or platform locks. You own the code, the traffic, and the customer data.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Full Code Ownership</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Zero Transaction Fees</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>SEO Optimized</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
