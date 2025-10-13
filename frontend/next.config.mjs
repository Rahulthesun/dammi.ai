/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/', 
        destination : '/wsap_landing', //destination for redirect
        permanent: false //temporary redirecting 
      },
    ];
  },
};

export default nextConfig;
