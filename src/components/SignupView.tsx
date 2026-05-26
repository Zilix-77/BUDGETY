import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { setUserAuth, downloadAllAndSyncLocal } from '../storage';
import { signInWithGooglePopup } from '../lib/firebase';

interface SignupViewProps {
  onNavigate: (route: string) => void;
  onSignupSuccess: (name: string, email: string) => void;
}

export default function SignupView({ onNavigate, onSignupSuccess }: SignupViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const fbUser = await signInWithGooglePopup();
      if (fbUser) {
        // Sync profile down if returning user
        const hasProfile = await downloadAllAndSyncLocal(fbUser.uid, fbUser.email || '');
        
        const nameToUse = fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User';
        const emailToUse = fbUser.email || 'google_user@gmail.com';
        
        setUserAuth({
          name: nameToUse,
          email: emailToUse,
          loggedIn: true
        });

        onSignupSuccess(nameToUse, emailToUse);
      }
    } catch (err: any) {
      console.error(err);
      const isPopupClosed = err?.code === 'auth/popup-closed-by-user' || 
                            err?.message?.includes('popup-closed-by-user') || 
                            err?.message?.includes('popup_closed_by_user') ||
                            err?.message?.includes('closed by user');
      
      if (isPopupClosed) {
        setError('The Google Sign-Up popup was closed or blocked. Because this live workspace runs inside an iframe, some modern browsers block nested authentication prompts. To easily resolve this, please (1) Click the "Open in new window" icon at the top right of the application wrapper, or (2) Enable/allow popups for this origin, or (3) Go back and use standard manual signup credentials.');
      } else {
        setError(err?.message || 'Google Sign-Up failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setUserAuth({ name, email, loggedIn: true });
    onSignupSuccess(name, email);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div 
            onClick={() => onNavigate('landing')}
            className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl font-mono mx-auto mb-3 cursor-pointer hover:opacity-85"
          >
            B
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Create your layout</h2>
          <p className="text-neutral-500 text-sm mt-1">Start tracking and saving today</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-8"
        >
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 text-rose-800 rounded-xl text-xs flex gap-2 items-start border border-rose-100">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Full Name / Head of Household
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Adarsh"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., adarsh@gmail.com"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Choose Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 4 characters"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <button
               id="signup-submit"
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              Begin Free Buddying
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Real Cloud Google Sign In */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-100"></div>
              <span className="flex-shrink mx-4 text-neutral-400 text-[10px] uppercase font-semibold">Or secure with</span>
              <div className="flex-grow border-t border-neutral-100"></div>
            </div>

            <button
              id="google-signup-btn"
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 px-4 py-3 rounded-xl text-neutral-700 text-sm font-medium cursor-pointer transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? 'Connecting...' : 'Sign up with Google'}
            </button>
          </div>
        </motion.div>

        <p className="text-center text-sm text-neutral-500 mt-6 md:mt-8">
          Already have an account?{' '}
          <button
            id="signup-to-login"
            onClick={() => onNavigate('login')}
            className="text-neutral-900 border-b border-neutral-900 font-medium hover:opacity-80 transition-opacity"
          >
            Log in instead
          </button>
        </p>
      </div>
    </div>
  );
}
