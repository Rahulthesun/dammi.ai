import Head from "next/head";
import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";

const CONTACT_EMAIL = "hello@buildify-web.com";

export default function TermsOfService() {
  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const style = document.createElement("style");
    style.textContent = `
      body { font-family: 'Manrope', sans-serif !important; }
      .cursor-blink { animation: blink 1s infinite; }
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      <Head>
        <title>Terms of Service — Dammi.ai</title>
        <meta
          name="description"
          content="Terms of Service for Dammi.ai — an AI-powered WhatsApp conversational platform by Buildify Web (India)."
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
              Terms of Service
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
                content: `Welcome to Dammi.ai, a product of Buildify Web — an Indian MSME company. By accessing or using Dammi.ai ("the Service"), you agree to comply with these Terms of Service ("Terms"). Please read them carefully before using our WhatsApp conversational platform.`,
              },
              {
                title: "1. Eligibility & Account Responsibility",
                list: [
                  "You must be a registered business or authorized representative to use Dammi.ai.",
                  "You are responsible for maintaining the confidentiality of your login credentials and WhatsApp Business API access.",
                  "Any misuse or unauthorized access may result in immediate suspension or termination.",
                ],
              },
              {
                title: "2. Service Description",
                content: `Dammi.ai provides businesses with AI-based WhatsApp automation tools to handle customer interactions, inquiries, and workflows. Features may include chatbot automation, analytics, and API integrations.`,
              },
              {
                title: "3. Acceptable Use Policy",
                list: [
                  "You must comply with WhatsApp Business API and Meta policies.",
                  "You may not use Dammi.ai to send spam, abusive, illegal, or deceptive messages.",
                  "You agree not to reverse-engineer, resell, or misuse the Service.",
                ],
              },
              {
                title: "4. Payment & Subscription",
                list: [
                  "Paid plans (Starter, Pro) are billed monthly or annually as per your selection.",
                  "All fees are non-refundable except as required by law.",
                  "Failure to make timely payments may result in service suspension.",
                ],
              },
              {
                title: "5. Data & Privacy",
                content: `Your use of Dammi.ai is governed by our Privacy Policy, which explains how we collect and handle your data.`,
                linkText: "Read Privacy Policy",
                linkHref: "/privacy",
              },
              {
                title: "6. Intellectual Property",
                content: `All software, content, and branding within Dammi.ai are owned by Buildify Web. You may not copy, modify, or distribute them without written consent.`,
              },
              {
                title: "7. Limitation of Liability",
                content: `To the maximum extent permitted by Indian law, Buildify Web and its affiliates shall not be liable for indirect, incidental, or consequential damages arising from your use or inability to use Dammi.ai.`,
              },
              {
                title: "8. Termination",
                content: `We reserve the right to terminate or suspend your account if we believe you violated these Terms or applicable laws. Upon termination, your access to data and services may be restricted.`,
              },
              {
                title: "9. Governing Law & Jurisdiction",
                content: `These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Tamil Nadu, India.`,
              },
              {
                title: "10. Contact Us",
                content: `For any questions or concerns about these Terms, contact us at `,
                link: true,
              },
            ].map((section, i) => (
              <article
                key={i}
                className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm"
              >
                <h2 className="text-2xl font-semibold text-[#3B82F6]">
                  {section.title}
                </h2>

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

                {section.linkText && (
                  <a
                    href={section.linkHref}
                    className="block mt-3 text-[#3B82F6] font-medium hover:underline"
                  >
                    {section.linkText}
                  </a>
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
                <span className="text-[#3B82F6] font-medium">Dammi.ai</span> — All
                rights reserved.
              </p>
            </footer>
          </section>
        </div>
      </main>
    </>
  );
}
