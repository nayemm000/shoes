import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth
    let role = "user";
    if (email === "admin@solesphere.com" || (email === "nxnayeem0000@gmail.com" && password === "Amrin")) {
      role = "admin";
    }
    login({ email, name: email.split("@")[0], role });
    navigate("/");
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
           {(email === "admin@solesphere.com" || (email === "nxnayeem0000@gmail.com" && password === "Amrin")) && (
             <p className="mt-2 text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 inline-block px-3 py-1 rounded-full">Admin Mode Detected</p>
           )}
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
            className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center space-x-3 hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
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
