import React from 'react';
import { Shield, BookOpen, AlertTriangle, Database, ArrowLeft, Trash2, Info } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  icon: React.ReactNode;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

function LegalLayout({ title, icon, onNavigate, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-12 md:py-16 font-sans">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-950 mb-8 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-neutral-205 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </button>

        <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs p-6 md:p-10">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-6 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
              <p className="text-[11px] text-neutral-450 uppercase tracking-widest font-bold mt-0.5">Budgety Legal Framework</p>
            </div>
          </div>

          <div className="prose prose-neutral max-w-none text-sm text-neutral-600 leading-relaxed space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// 1. PRIVACY POLICY
export function PrivacyView({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <LegalLayout title="Privacy Policy" icon={<Shield className="w-5 h-5" />} onNavigate={onNavigate}>
      <div>
        <p className="text-neutral-500 text-xs italic mb-4">Last updated: May 26, 2026</p>
        <p>
          At <strong>BUDGETY</strong>, we hold your personal financial privacy as our absolute highest priority. 
          Our design architecture is engineered around user safety and client-side independence.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">1. Client-Side Local Storage</h3>
        <p>
          All financial data—including your daily income, transaction entries, budgets, family configurations, 
          and savings records—is stored **locally inside your own web browser** (client-side <code>localStorage</code>). 
          We do not transmit, sync, or replicate your personal balance sheets permanently to our servers.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">2. Live Notification Channels</h3>
        <p>
          If you opt-in to receive Telegram Risk Alerts, our temporary notification service only processes 
          the <code>chatId</code> and the alert <code>message</code> to dispatch updates. This communication data is 
          transient and is not logged, warehoused, or retained on our hardware permanently.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">3. Indian DPDP Act 2023 Compliance</h3>
        <p>
          In absolute alignment with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India, 
          you operate as the complete and sole master of your data. You hold irrevocable rights which include:
        </p>
        <ul className="list-disc list-inside space-y-2 mt-2 pl-4">
          <li><strong>Right to Access</strong>: Since everything remains on your local browser container, you can inspect daily values natively inside your app screens.</li>
          <li><strong>Right to Correction & Erasure</strong>: You have total control to modify or wipe clean any transaction history. Clearing data from within setup instantly removes it from the browser storage.</li>
          <li><strong>Data Minimization</strong>: We ask for zero irrelevant details and require no permanent back-end login databases.</li>
        </ul>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">4. Support & Grievances</h3>
        <p>
          For any technical inquiries or assistance regarding storage configurations, please contact our support desk 
          at <a href="mailto:adarsh.7025.v@gmail.com" className="text-neutral-900 underline">adarsh.7025.v@gmail.com</a>.
        </p>
      </div>
    </LegalLayout>
  );
}

// 2. TERMS OF SERVICE
export function TermsView({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <LegalLayout title="Terms of Service" icon={<BookOpen className="w-5 h-5" />} onNavigate={onNavigate}>
      <div>
        <p className="text-neutral-500 text-xs italic mb-4">Last updated: May 26, 2026</p>
        <p>
          Welcome to Budgety. By accessing or utilizing this application, you agree to be bound by these Terms of Service.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">1. Scope of Service & Platform</h3>
        <p>
          Budgety is a personal finance companion crafted to assist Indian households (with a special emphasis on Kerala savings circles, chitti schedules, and family allocations) in making healthier daily financial entries. 
          Its tools are designed strictly for household simulation and local planning.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">2. User Obligations & Data Safety</h3>
        <p>
          Because all transactions are stored within the client-side system, you are solely responsible for maintaining 
          the security and backups of your device and browser cache. Clearing site cached storage might result in 
          local data loss. We do not provide cloud recovery for local files.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">3. Prohibited Conduct</h3>
        <p>
          You are prohibited from exploiting this locally styled framework to run commercial credit pools, unauthorized 
          lending desks, or mock banking registers.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">4. Governing Law & Jurisdiction</h3>
        <p>
          These Terms are governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes 
          arising out of or related to these terms shall be subject exclusively to the courts of <strong>Kerala</strong> jurisdiction.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">5. Disclaimer of Liability</h3>
        <p>
          <strong>EZYPC</strong> and its development team provide this application on an "as-is" and "as-available" basis. 
          EZYPC shall not be liable for any direct, indirect, incidental, or consequential financial losses, missed savings, 
          incorrect entry records, or unfavorable economic outcomes associated with using this product.
        </p>
      </div>
    </LegalLayout>
  );
}

// 3. FINANCIAL DISCLAIMER
export function DisclaimerView({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <LegalLayout title="Financial Disclaimer" icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} onNavigate={onNavigate}>
      <div>
        <p className="text-neutral-500 text-xs italic mb-4">Last updated: May 26, 2026</p>
        
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6">
          <p className="text-amber-900 font-bold text-xs flex gap-2 items-center">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            ATTENTION: READ BEFORE UTILIZING APP METRICS
          </p>
        </div>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">1. Educational Simulation Only</h3>
        <p>
          All default dynamic envelopes and parameters (such as the 50/30/20 rule, Kerala Chitti allocations, Low Income 
          safety targets, and High Saving ratio configurations) provided in the <strong>Presets Dashboard</strong> are 
          intended solely as comparative financial simulations and generic calculators.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">2. No Licensed Advisory Services</h3>
        <p>
          Budgety is <strong>NOT</strong> licensed, registered, or authorized by the <strong>Securities and Exchange Board of India (SEBI)</strong>, 
          or any other financial, banking, tax, or legal regulatory authority of India. The contents of this app do 
          not constitute professional investment, credit, legal, or tax advice.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">3. Requirement for Qualified Professional Consultation</h3>
        <p>
          Personal financial planning involves significant real-world tax liabilities, inflation rules, and family risks. 
          You are strongly advised to seek advice from a certified personal financial planner or registered wealth manager before 
          acting upon any recommendations, allocations, goal projections, or risk warnings in this app.
        </p>

        <p className="mt-8 font-medium text-neutral-800">
          By utilizing Budgety's tools, you acknowledge that you are using this simulation entirely at your own risk.
        </p>
      </div>
    </LegalLayout>
  );
}

// 4. STORAGE & COOKIE NOTICE
export function CookiesView({ onNavigate }: { onNavigate: (route: string) => void }) {
  const keysList = [
    { key: 'budgety_user', purpose: 'Preserves safe user logs, session flags and authorization handles locally.' },
    { key: 'budgety_profile', purpose: 'Remembers setup limits, family counts, and customized savings profiles.' },
    { key: 'budgety_expenses', purpose: 'Holds all daily income and expense item columns.' },
    { key: 'budgety_categories', purpose: 'Saves your envelope budgets and custom categories.' },
    { key: 'budgety_goals', purpose: 'Tracks savings milestones, allocation schedules, and target numbers.' },
    { key: 'budgety_notes', purpose: 'Maintains active temporary text written inside the quick scratchpad.' },
    { key: 'budgety_notes_archive', purpose: 'Tracks retired scratchpad notes after the 3-day window.' },
    { key: 'budgety_iotracker', purpose: 'Keeps ledger rows of hand-to-hand lending transactions.' },
    { key: 'budgety_bills', purpose: 'Saves recurring monthly household commitments.' },
    { key: 'budgety_monthhistory', purpose: 'Maintains past months and comparative performance metrics.' }
  ];

  return (
    <LegalLayout title="Storage & Cookie Notice" icon={<Database className="w-5 h-5" />} onNavigate={onNavigate}>
      <div>
        <p className="text-neutral-500 text-xs italic mb-4">Last updated: May 26, 2026</p>
        <p>
          At Budgety, we value clean performance. We do **not** use any third-party marketing, analytics, or behavioral cookies 
          to log your personal activity or sell targeted promotions.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">1. Local Storage Details</h3>
        <p className="mb-4">
          To provide smooth page loads without requiring slow database calls, we utilize client-side <code>localStorage</code> keys 
          to remember your setup parameters. Here is our complete inventory of storage keys:
        </p>

        <div className="overflow-x-auto border border-neutral-100 rounded-xl mb-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-700 border-b border-neutral-100">
                <th className="p-3 font-bold font-mono">Storage Key Item</th>
                <th className="p-3 font-bold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-650">
              {keysList.map((item) => (
                <tr key={item.key} className="hover:bg-neutral-50/50">
                  <td className="p-3 font-mono text-[10.5px] text-neutral-900 font-medium">{item.key}</td>
                  <td className="p-3 whitespace-normal break-words">{item.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">2. How to Erase Your Local Records</h3>
        <p>
          You are in full control of your local footprint. If you wish to completely wipe out all localized files:
        </p>
        <ol className="list-decimal list-inside space-y-2 mt-2 pl-4">
          <li>Go to the <strong>Setup Screen</strong> inside Budgety and select "Simulation Reset / Delete Data".</li>
          <li>Or simply clear your internet browser's <strong>Site Data Cache</strong> for this URL domain instantly.</li>
        </ol>
      </div>
    </LegalLayout>
  );
}

// 5. ABOUT VIEW (SMALL "ABOUT US")
export function AboutView({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <LegalLayout title="About Budgety" icon={<Info className="w-5 h-5 text-neutral-100" />} onNavigate={onNavigate}>
      <div className="space-y-6">
        <p className="text-neutral-500 text-xs italic">Last updated: May 26, 2026</p>
        
        <p>
          <strong>Budgety</strong> is an intelligent, high-performance visual financial assistant crafted designed to bring structure, transparency, and health to household budgets. Built in India, it features an elegant Swiss-Minimalist appearance that focuses on the core mechanics of personal bookkeeping without clutter, banners, or data selling.
        </p>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">Our Mission & Principles</h3>
        <p>
          We believe financial planning tools should be personal, direct, and completely free of commercial surveillance. Budgety operates on three core design pillars:
        </p>
        <ul className="list-disc list-inside space-y-2.5 pl-4">
          <li><strong>Absolute Client Sovereignty</strong>: Your numbers are yours alone. All records live locally inside your web browser. Even when connected to our optional, low-latency Google Firebase core synchronization pipeline for family sharing, and standard Single Sign-On, your financial details are securely safeguarded by robust, rule-enforced credentials.</li>
          <li><strong>Aesthetic Clarity</strong>: Distractions are excluded. Utilizing beautiful negative space, precise margins, and <strong>JetBrains Mono</strong> display panels, your financial limits remain legible and clear across all browser frames.</li>
          <li><strong>Realistic Scenarios</strong>: Budgety is tailor-made to handle physical life events (such as tracking peer-to-peer personal loans, handling summer bill peaks, managing recurring household commitments, and calculating flexible custom savings goals).</li>
        </ul>

        <h3 className="text-base font-bold text-neutral-900 mt-6 mb-2">Our Architecture</h3>
        <p>
          Budgety runs a hybrid, real-time client-to-cloud reconciler. By pairing high-speed localized caches in your browser with secure backend Cloud Firestore containers, users enjoy immediate rendering in sub-millisecond response times, without risk of offline write blocking or credential leakages.
        </p>

        <p className="pt-4 border-t border-neutral-100">
          Created with care by <strong>EZYPC</strong>. For feedback, legal guidelines, or technical support, drop us a line directly at <a href="mailto:adarsh.7025.v@gmail.com" className="text-neutral-950 underline font-semibold">adarsh.7025.v@gmail.com</a>.
        </p>
      </div>
    </LegalLayout>
  );
}

