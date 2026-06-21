"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ShoppingBag, 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Plus,
  Minus,
  Check,
  Facebook,
  Instagram,
  Twitter,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function ProductPreviewContent() {
  const searchParams = useSearchParams();
  const productStr = searchParams.get("product");
  
  if (!productStr) return <div className="p-20 text-center text-white">No product data found.</div>;
  
  const product = JSON.parse(decodeURIComponent(productStr));
  const isHighEnd = product.variant === "high-end";

  // Luxury Theme Colors:
  // Dark Gray: bg-slate-900 / bg-slate-950
  // Cream: text-orange-50 / bg-orange-50
  // Gold: text-amber-500 / border-amber-500 / bg-amber-500

  return (
    <div className={`min-h-screen ${isHighEnd ? 'bg-slate-950' : 'bg-white'} text-slate-900 overflow-x-hidden`}>
      {/* Navigation */}
      <nav className={`px-6 py-6 flex justify-between items-center border-b ${isHighEnd ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-white'} backdrop-blur-md sticky top-0 z-50`}>
        <div className="flex items-center gap-2">
          <div className={`h-10 w-10 ${isHighEnd ? 'bg-amber-500' : 'bg-slate-900'} rounded-full flex items-center justify-center`}>
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className={`text-xl font-black tracking-tighter ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>AURA HAVEN</span>
        </div>
        <div className={`hidden md:flex gap-8 text-sm font-bold tracking-widest uppercase ${isHighEnd ? 'text-slate-400' : 'text-slate-500'}`}>
          <a href="#" className="hover:text-amber-500 transition-colors">Catalog</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Our Story</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Support</a>
        </div>
        <Button size="icon" variant="ghost" className={isHighEnd ? 'text-white' : 'text-slate-950'}>
          <ShoppingBag className="h-5 w-5" />
        </Button>
      </nav>

      {/* Product Hero */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-2 gap-16 items-center">
        {/* Image Side */}
        <div className="relative group">
          <div className={`absolute -inset-4 ${isHighEnd ? 'bg-amber-500/10' : 'bg-slate-100'} rounded-[2rem] blur-2xl group-hover:blur-3xl transition-all duration-700`}></div>
          <div className={`relative aspect-square rounded-2xl overflow-hidden border ${isHighEnd ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50 shadow-xl'}`}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingBag className="h-32 w-32 opacity-20" />
              </div>
            )}
          </div>
          {isHighEnd && (
            <Badge className="absolute top-6 right-6 bg-amber-500 text-slate-950 font-black px-4 py-1 tracking-widest text-[10px] uppercase">
              Exclusive Luxury Edition
            </Badge>
          )}
        </div>

        {/* Content Side */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <span className={`text-xs font-bold tracking-widest uppercase ${isHighEnd ? 'text-slate-500' : 'text-slate-400'}`}>
                1,240+ Verified Reviews
              </span>
            </div>
            <h1 className={`text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>
              {product.name}
            </h1>
            <p className={`text-lg leading-relaxed ${isHighEnd ? 'text-slate-400' : 'text-slate-600'}`}>
              {product.description || "The ultimate standard in modern lifestyle technology. Crafted for those who demand excellence in every detail."}
            </p>
          </div>

          <div className="flex items-baseline gap-4">
            <span className={`text-5xl font-black ${isHighEnd ? 'text-amber-500' : 'text-slate-950'}`}>
              ${product.price.toFixed(2)}
            </span>
            <span className={`text-xl line-through ${isHighEnd ? 'text-slate-700' : 'text-slate-300'}`}>
              ${(product.price * 1.5).toFixed(2)}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className={`flex items-center border ${isHighEnd ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'} rounded-full px-4 py-2`}>
                <button className="p-1"><Minus className="h-4 w-4" /></button>
                <span className="px-6 font-bold">1</span>
                <button className="p-1"><Plus className="h-4 w-4" /></button>
              </div>
              <Button className={`flex-1 rounded-full h-14 text-lg font-black tracking-widest uppercase ${
                isHighEnd ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-slate-950 hover:bg-slate-800 text-white'
              }`}>
                Add to Bag
              </Button>
            </div>
            <p className={`text-center text-xs font-bold tracking-widest uppercase py-2 ${isHighEnd ? 'text-emerald-500' : 'text-emerald-600'}`}>
              <Check className="inline h-3 w-3 mr-1" /> In Stock & Ready to Ship
            </p>
          </div>

          <div className={`grid grid-cols-3 gap-4 pt-8 border-t ${isHighEnd ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="text-center space-y-2">
              <Truck className={`h-6 w-6 mx-auto ${isHighEnd ? 'text-amber-500' : 'text-slate-900'}`} />
              <p className={`text-[10px] font-black uppercase tracking-widest ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>Free Shipping</p>
            </div>
            <div className="text-center space-y-2">
              <ShieldCheck className={`h-6 w-6 mx-auto ${isHighEnd ? 'text-amber-500' : 'text-slate-900'}`} />
              <p className={`text-[10px] font-black uppercase tracking-widest ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>2yr Warranty</p>
            </div>
            <div className="text-center space-y-2">
              <RotateCcw className={`h-6 w-6 mx-auto ${isHighEnd ? 'text-amber-500' : 'text-slate-900'}`} />
              <p className={`text-[10px] font-black uppercase tracking-widest ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>30-Day Return</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className={`py-24 ${isHighEnd ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center ${isHighEnd ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-900 text-white'}`}>
              <Star className="h-8 w-8" />
            </div>
            <h3 className={`text-xl font-black uppercase tracking-tighter ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>Elite Quality</h3>
            <p className={`text-sm leading-relaxed ${isHighEnd ? 'text-slate-400' : 'text-slate-600'}`}>
              Every {product.name} is rigorously tested for performance and durability.
            </p>
          </div>
          <div className="space-y-4">
            <div className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center ${isHighEnd ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-900 text-white'}`}>
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className={`text-xl font-black uppercase tracking-tighter ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>Secure Design</h3>
            <p className={`text-sm leading-relaxed ${isHighEnd ? 'text-slate-400' : 'text-slate-600'}`}>
              Advanced safety features integrated directly into the core architecture.
            </p>
          </div>
          <div className="space-y-4">
            <div className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center ${isHighEnd ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-900 text-white'}`}>
              <Check className="h-8 w-8" />
            </div>
            <h3 className={`text-xl font-black uppercase tracking-tighter ${isHighEnd ? 'text-white' : 'text-slate-950'}`}>Modern Aesthetic</h3>
            <p className={`text-sm leading-relaxed ${isHighEnd ? 'text-slate-400' : 'text-slate-600'}`}>
              A minimalist silhouette that complements any high-end environment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${isHighEnd ? 'bg-slate-950 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 ${isHighEnd ? 'bg-amber-500' : 'bg-slate-900'} rounded-full flex items-center justify-center`}>
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter">AURA HAVEN</span>
          </div>
          
          <div className="flex gap-6">
            <Facebook className="h-5 w-5 opacity-50 hover:opacity-100 cursor-pointer" />
            <Instagram className="h-5 w-5 opacity-50 hover:opacity-100 cursor-pointer" />
            <Twitter className="h-5 w-5 opacity-50 hover:opacity-100 cursor-pointer" />
          </div>
          
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
            © 2026 AURA HAVEN LUXURY TECH. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
      
      {/* Back to Dashboard Button (Fixed) */}
      <button 
        onClick={() => window.close()}
        className="fixed bottom-8 left-8 bg-brand-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 hover:bg-brand-600 transition-all z-[100]"
      >
        <ArrowLeft className="h-4 w-4" /> Exit Preview
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
