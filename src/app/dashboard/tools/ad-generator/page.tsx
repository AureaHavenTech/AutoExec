"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Target, 
  Volume2, 
  Layout, 
  Loader2,
  ArrowRight,
  Download,
  Copy,
  Check
} from "lucide-react";

export default function AdGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    platform: "TikTok",
    targetAudience: "",
    brandVoice: "Luxury"
  });
  const [generatedAd, setGeneratedAd] = useState<{
    imageUrl: string;
    hook: string;
    body: string;
    cta: string;
    targeting: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateAd = async () => {
    if (!formData.productName || !formData.productDescription) return;
    
    setLoading(true);
    try {
      // 1. Generate Ad Copy
      const copyRes = await fetch("/api/generate-ad-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const copyData = await copyRes.json();

      // 2. Generate Image
      const imageRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription: formData.productDescription,
          brand: formData.productName,
          style: `${formData.brandVoice.toLowerCase()} luxury, high-end e-commerce`
        })
      });
      const imageData = await imageRes.json();

      setGeneratedAd({
        imageUrl: imageData.url,
        hook: copyData.hook,
        body: copyData.body,
        cta: copyData.cta,
        targeting: copyData.targeting
      });
    } catch (error) {
      console.error("Error generating ad:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-brand-400" />
          <span>AI Ad Generator</span>
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
          Create high-converting ad creatives and copy in seconds. Optimized for TikTok, Instagram, and Facebook.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card className="p-6 bg-slate-900/40 border-slate-800 shadow-xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Type className="h-4 w-4 text-brand-400" /> Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="e.g. Aura Silk Pillowcase"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-brand-400" /> Product Description
              </label>
              <textarea
                name="productDescription"
                value={formData.productDescription}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the main benefits and features of your product..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Layout className="h-4 w-4 text-brand-400" /> Platform
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm appearance-none"
                >
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="All">All Platforms</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-brand-400" /> Brand Voice
                </label>
                <select
                  name="brandVoice"
                  value={formData.brandVoice}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm appearance-none"
                >
                  <option value="Luxury">Luxury</option>
                  <option value="Fun">Fun</option>
                  <option value="Professional">Professional</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Storytelling">Storytelling</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-400" /> Target Audience
              </label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                placeholder="e.g. Skincare enthusiasts, 25-45 women"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm"
              />
            </div>

            <Button
              onClick={generateAd}
              disabled={loading || !formData.productName || !formData.productDescription}
              className="w-full py-6 text-base font-bold bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-xl shadow-lg shadow-brand-500/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Generating Your Ad...
                </>
              ) : (
                <>
                  Generate Ad Creative
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Preview Section */}
        <div className="space-y-6">
          {!generatedAd && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/10 min-h-[400px]">
              <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">No ad generated yet</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                Fill out the form and click generate to see the magic happen.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/10 animate-pulse min-h-[400px]">
              <Loader2 className="h-12 w-12 text-brand-500 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-300">Axel AI is working...</h3>
              <p className="text-slate-500 text-sm mt-2">
                Designing your visual and crafting perfect copy.
              </p>
            </div>
          )}

          {generatedAd && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Image Preview */}
              <Card className="overflow-hidden bg-slate-900/40 border-slate-800 shadow-2xl relative group rounded-2xl">
                <img 
                  src={generatedAd.imageUrl} 
                  alt="Generated Ad" 
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <a 
                    href={generatedAd.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-950/80 backdrop-blur-md rounded-full text-white hover:text-brand-400 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
                <div className="p-4 bg-gradient-to-t from-slate-950 to-transparent">
                  <Badge className="bg-brand-500 text-slate-950 border-none font-bold">
                    AI GENERATED CREATIVE
                  </Badge>
                </div>
              </Card>

              {/* Copy Section */}
              <Card className="p-6 bg-slate-900/40 border-slate-800 shadow-xl space-y-4 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Type className="h-5 w-5 text-brand-400" />
                    Ad Copy
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(`${generatedAd.hook}\n\n${generatedAd.body}\n\n${generatedAd.cta}`)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy All"}
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Hook</span>
                    <p className="text-white font-semibold mt-1 italic">"{generatedAd.hook}"</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Body</span>
                    <p className="text-slate-300 mt-1 leading-relaxed text-sm">{generatedAd.body}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">CTA</span>
                    <p className="text-brand-400 font-bold mt-1 text-sm">{generatedAd.cta}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Target className="h-3 w-3" /> Targeting Tips
                  </span>
                  <p className="text-slate-400 text-xs mt-1.5">{generatedAd.targeting}</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
