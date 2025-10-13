import Head from "next/head";
import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";

const CONTACT_EMAIL = "hello@buildify-web.com";

export default function DataDeletion() {
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
        <title>User Data Deletion — Dammi.ai</title>
        <meta
          name="description"
          content="Instructions for Facebook users to delete their data from Dammi.ai — an AI-powered WhatsApp automation platform by Buildify Web (India)."
        />
      </Head>

      <main className="min-h-screen bg-white text-gray-800">
        <div className="max-w-4xl mx-auto p-6 lg:p-12">
          <div
            className="flex flex-row items-center space-x-0.5 mb-2 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <ChevronLeft className="mt-0" />
            <p className="text-gray-500 text-xl">Dammi.ai</p>
          </div>

          <header className="mb-8">
            <div className="inline-block px-4 py-1 rounded-full bg-[#3B82F6] text-white font-semibold">
              Dammi.ai
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900">
              User Data Deletion Instructions
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Effective date:{" "}
              <strong>{new Date().toISOString().split("T")[0]}</strong>
            </p>
          </header>

          <section className="space-y-6">
            {[
              {
                title: "Overview",
                content: `At Dammi.ai, a product of Buildify Web (India), we respect your privacy and comply with Meta Platform’s data policies. This page explains how you can request the deletion of your data collected through Facebook Login or related integrations.`,
              },
              {
                title: "1. Automatic Deletion",
                list: [
                  "If you remove the Dammi.ai app from your Facebook or Instagram account settings, all linked tokens and associated user data are automatically deleted from our systems within 30 days.",
                ],
              },
              {
                title: "2. Manual Deletion Request",
                content: `If you would like to manually request deletion of your account data (including Facebook-linked information), please follow these steps:`,
                list: [
                  "Send an email to ",
                  "Use the subject line: “User Data Deletion Request — Dammi.ai”.",
                  "Include your registered email address and (if applicable) your Facebook/Instagram user ID.",
                  "Our team will verify your request and confirm data deletion within 7 working days.",
                ],
              },
              {
                title: "3. Data Types Subject to Deletion",
                list: [
                  "Basic profile information (name, email, profile picture) received via Facebook Login.",
                  "Access tokens and session identifiers.",
                  "Any metadata related to conversations or analytics linked to your account.",
                ],
              },
              {
                title: "4. Data Retention Exceptions",
                content: `Certain transactional or compliance-related records (e.g., billing or payment data) may be retained as required by Indian law or legitimate business obligations.`,
              },
              {
                title: "5. Contact Us",
                content: `For any questions regarding data handling or deletion, you can contact us at `,
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

                {section.list && (
                  <ul className="list-disc ml-6 mt-3 text-gray-700 space-y-2">
                    {section.list.map((item, j) => (
                      <li key={j}>
                        {item === "Send an email to " ? (
                          <>
                            {item}
                            <a
                              href={`mailto:${CONTACT_EMAIL}`}
                              className="text-[#3B82F6] font-medium"
                            >
                              {CONTACT_EMAIL}
                            </a>
                          </>
                        ) : (
                          item
                        )}
                      </li>
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
