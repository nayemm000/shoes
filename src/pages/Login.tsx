import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err: any) {
      console.error("Google Auth error:", err);
      alert("Google Sign-In failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        alert("Email/Password login is currently disabled. Please use Google Sign-In or enable 'Email/Password' in the Firebase Console under Authentication > Sign-in method.");
      } else {
        alert(err.message || "Authentication failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12"
      >
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
              <span className="text-white font-black text-3xl">S</span>
           </div>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter">
             {isRegister ? "Join the" : "Welcome"} <span className="text-gray-300">Club.</span>
           </h2>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-100 text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black uppercase text-gray-300 tracking-widest">Or</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center space-x-3 hover:bg-gray-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
          >
            <LogIn className="w-5 h-5" />
            <span>{isRegister ? "Create Account" : "Access Vault"}</span>
          </button>
        </form>

        <div className="mt-8 text-center">
           <button
             onClick={() => setIsRegister(!isRegister)}
             className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
           >
             {isRegister ? "Already a member? Sign In" : "New dynamic? Create profile"}
           </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center space-x-2 text-[10px] uppercase font-bold text-gray-400">
           <ShieldCheck className="w-4 h-4 text-green-500" />
           <span>Encrypted Session</span>
        </div>
      </motion.div>
    </div>
  );
}
