import "@/styles/globals.css";
import { AuthGuard } from "@/components/AuthGuard";

export default function App({ Component, pageProps, router }) {
  const publicPages = ["/login", "/signup"];
  const isPublicPage = publicPages.includes(router.pathname);

  if (isPublicPage) {
    return <Component {...pageProps} />;
  }

  return (
    <AuthGuard>
      <Component {...pageProps} />
    </AuthGuard>
  );
}
