import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          if (router.pathname !== "/login") router.replace("/login");
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        if (router.pathname !== "/login") router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setIsAuthenticated(false);
          if (router.pathname !== "/login") router.replace("/login");
        } else {
          setIsAuthenticated(true);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [router]);

  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}
