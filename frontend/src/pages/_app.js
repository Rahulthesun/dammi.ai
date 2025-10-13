import "@/styles/globals.css";
import { AuthGuard } from "@/components/AuthGuard";
import Head from 'next/head';

export default function App({ Component, pageProps, router }) {
  const publicPages = ['/wsap_signup', '/wsap_landing' , '/privacy_policy', '/tos']; //"/login", "/signup",
  const isPublicPage = publicPages.includes(router.pathname);

  if (isPublicPage) {
    return (
      <>
        <Head>
          <script src="https://cdn.tailwindcss.com"></script>
        </Head>
        <Component {...pageProps} />
      </>
    );
  }

  return (
    <>
      <Head>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </>
  );
}