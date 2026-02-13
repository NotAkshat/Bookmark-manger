"use client";

import { supabase } from "@/lib/supabase";
import { WavyBackground } from "@/components/ui/wavy-background";
import { motion } from "framer-motion";

export default function Home() {
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/dashboard`,
      },
    });
  };

  return (
    <WavyBackground className="min-h-screen">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-10 shadow-2xl"
        >
          

          <div className="relative z-10 text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome Back
            </h1>

            <p className="text-gray-400 text-sm">
              Sign in to access your private bookmarks
            </p>

            <button
              onClick={signIn}
              className="
                w-full
                bg-white
                text-black
                font-medium
                py-3
                rounded-lg
                hover:bg-gray-200
                transition
                flex
                items-center
                justify-center
                gap-3
              "
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          </div>
        </motion.div>
      </div>
    </WavyBackground>
  );
}
