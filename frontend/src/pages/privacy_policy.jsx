import Head from "next/head";
import  {useEffect} from 'react';
import { ChevronLeft } from 'lucide-react';

const CONTACT_EMAIL = "hello@buildify-web.com";

export default function PrivacyPolicy() {

    useEffect(() => {
      const fontLink = document.createElement('link');
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap';
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);

      const style = document.createElement('style');
      style.textContent = `
        body { font-family: 'Manrope', sans-serif !important; }
        .cursor-blink { animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `;
      document.head.appendChild(style);
    },[]);

    
  return (
    <>
      <Head>
        <title>Privacy Policy — Dammi.ai</title>
        <meta
          name="description"
          content="Privacy Policy for Dammi.ai — WhatsApp conversational agent for businesses under Buildify Web (India)."
        />
      </Head>

      <main className="min-h-screen bg-white text-gray-800">
        <div className="max-w-4xl mx-auto p-6 lg:p-12">
          <div className="flex flex-row items-center space-x-0.5 mb-2 cursor-pointer" onClick={() => window.location.href="/"}>
            <ChevronLeft className="mt-0" />
            <p className="text-gray-500 text-xl">Dammi.ai</p>
          </div>

          <header className="mb-8">
            <div className="inline-block px-4 py-1 rounded-full bg-[#3B82F6] text-white font-semibold">
              Dammi.ai
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900">
              Privacy Policy
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Effective date:{" "}
              <strong>{new Date().toISOString().split("T")[0]}</strong>
            </p>
          </header>

          <section className="space-y-6">
            {[
              {
                title: "Introduction",
                content: `Dammi.ai ("we", "us", "our") is a product of Buildify Web, an Indian MSME company. We provide AI-powered WhatsApp conversational solutions for businesses. This Privacy Policy explains how we collect, use, and protect your data. By using our services, you agree to the practices described below.`,
              },
              {
                title: "1. Data Controller",
                content: `The data controller for Dammi.ai is Buildify Web (India). For any privacy-related questions or to exercise your rights, contact us at `,
                link: true,
              },
              {
                title: "2. Information We Collect",
                list: [
                  "Business Account Data: phone numbers linked to your WhatsApp Business account and related identifiers.",
                  "Message Content: messages, media, and metadata transmitted through Dammi.ai. We store them only as needed for delivery and processing.",
                  "Usage Data: logs, timestamps, analytics, and diagnostic data for performance and support.",
                  "Technical Data: IP address, browser type, device info, cookies, and related telemetry for security and reliability.",
                  "Customer Data: optional configuration files, message templates, and uploaded content for automation.",
                ],
              },
            ].map((section, i) => (
              <article key={i} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-semibold text-[#3B82F6]">{section.title}</h2>
                {section.content && (
                  <p className="mt-3 text-gray-700">
                    {section.content}
                    {section.link && (
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="text-[#3B82F6] font-medium ml-1"
                      >
                        {CONTACT_EMAIL}
                      </a>
                    )}
                  </p>
                )}
                {section.list && (
                  <ul className="list-disc ml-6 mt-3 text-gray-700 space-y-2">
                    {section.list.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            <footer className="mt-8 text-center text-sm text-gray-500">
              <p>
                © {new Date().getFullYear()} Buildify Web /{" "}
                <span className="text-[#3B82F6] font-medium">Dammi.ai</span> — All rights reserved.
              </p>
            </footer>
          </section>
        </div>
      </main>
    </>
  );
}
