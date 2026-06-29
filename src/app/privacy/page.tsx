"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { Zap, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Axel AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/affiliates" className="hover:text-white transition-colors">Affiliates</Link>
        </nav>
        <Link href="/dashboard"><Button variant="primary" size="sm">Launch App</Button></Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: June 25, 2026</p>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Account information: name, email address, and password</li>
              <li>Profile information: company name, website, social media handles</li>
              <li>Content you create: posts, drafts, messages, and other materials</li>
              <li>Payment information: processed securely through Stripe (we do not store credit card details)</li>
              <li>Communications: messages you send us and your preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Provide, maintain, and improve our AI-powered services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. AI-Generated Content</h2>
            <p>Our services use artificial intelligence to generate content based on your input. You retain ownership of any content you create using our platform. AI-generated content is provided as a starting point and should be reviewed before use.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Cookies</h2>
            <p>We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with small amounts of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>With service providers who perform services on our behalf (e.g., Stripe for payments)</li>
              <li>If required by law or to protect our rights</li>
              <li>In connection with a business transfer (merger, acquisition, or sale of assets)</li>
              <li>With your consent or at your direction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. GDPR Compliance</h2>
            <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your personal data.</p>
            <p className="mt-3">Your rights include:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>The right to access, update, or delete your information</li>
              <li>The right of rectification</li>
              <li>The right to object</li>
              <li>The right of restriction</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Services</h2>
            <p>Our platform integrates with third-party services including:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Stripe</strong> for payment processing</li>
              <li><strong>OpenAI</strong> for AI-powered content generation</li>
              <li><strong>Social media platforms</strong> for content publishing</li>
            </ul>
            <p className="mt-3">These services have their own privacy policies governing data handling.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
            <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-3 text-brand-400">support@axelai.app</p>
            <p className="text-slate-400 text-sm">Aura Haven Tech<br />Proudly built by Lindsey and the Axel AI team</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
