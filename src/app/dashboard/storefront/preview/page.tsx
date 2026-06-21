"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ProductPreviewContent() {
  const searchParams = useSearchParams();
  const productStr = searchParams.get("product");
  const productId = searchParams.get("id");
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (productStr) {
      try {
        setProduct(JSON.parse(decodeURIComponent(productStr)));
        setLoading(false);
      } catch (e) {
        console.error("Error parsing product data:", e);
        setLoading(false);
      }
    } else if (productId) {
      // Fetch product by ID
      fetch(`/api/storefront?id=${productId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.products && data.products.length > 0) {
            setProduct(data.products[0]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching product:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [productStr, productId]);

  if (loading) return <div className="p-20 text-center text-white">Loading product...</div>;
  if (!product) return <div className="p-20 text-center text-white">No product data found.</div>;
  
  const isHighEnd = product.variant === "high-end";

  return (
    <div className={`min-h-screen ${isHighEnd ? 'bg-slate-950' : 'bg-white'} text-slate-900 overflow-x-hidden`}>
      <nav className={`px-6 py-6 flex justify-between items-center border-b ${isHighEnd ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-white'} backdrop-blur-md sticky top-0 z-50`}>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-black tracking-tighter ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>AURA HAVEN</span>
        </div>
        <button className={isHighEnd ? 'text-white' : 'text-slate-950 font-bold'}>BAG</button>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative group">
          <div className={`relative aspect-square rounded-2xl overflow-hidden border ${isHighEnd ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50 shadow-xl'}`}>
            {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className={`text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>
              {product.name}
            </h1>
            <p className={`text-lg leading-relaxed ${isHighEnd ? 'text-slate-400' : 'text-slate-600'}`}>
              {product.description}
            </p>
          </div>

          <div className="flex items-baseline gap-4">
            <span className={`text-5xl font-black ${isHighEnd ? 'text-amber-500' : 'text-slate-950'}`}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button className={`w-full rounded-full h-14 text-lg font-black tracking-widest uppercase ${
            isHighEnd ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-white'
          }`}>
            Add to Bag
          </button>
        </div>
      </section>
      
      <button 
        onClick={() => window.history.back()}
        className="fixed bottom-8 left-8 bg-brand-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl z-[100]"
      >
        Exit Preview
      </button>
    </div>
  );
}

export default function ProductPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Preview...</div>}>
      <ProductPreviewContent />
    </Suspense>
  );
}
