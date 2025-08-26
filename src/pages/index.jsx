import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [questionnaireData, setQuestionnaireData] = useState({});
  const [businessId, setBusinessId] = useState('demo-business');
  const [topK, setTopK] = useState(3);

  useEffect(() => {
    // Add initial welcome message
    setChatMessages([
      {
        sender: 'ai',
        message: 'Hi! I\'m Dammi AI. Upload some documents and I\'ll help you find answers!',
        sources: []
      }
    ]);
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          status: 'success',
          message: result.message
        }]);
      } else {
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          status: 'error',
          message: result.error
        }]);
      }
    } catch (error) {
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        status: 'error',
        message: 'Network error occurred'
      }]);
    }
  };

  const handleQuery = async (question) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage = {
      sender: 'user',
      message: question,
      sources: []
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question,
          businessId,
          topK: parseInt(topK)
        })
      });

      const result = await response.json();

      if (response.ok) {
        const aiMessage = {
          sender: 'ai',
          message: result.answer,
          sources: result.sources || []
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          sender: 'ai',
          message: `❌ Error: ${result.error}`,
          sources: []
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        sender: 'ai',
        message: `❌ Network error: ${error.message}`,
        sources: []
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuestionnaireSubmit = async (formData) => {
    try {
      const response = await fetch('/api/submit-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Questionnaire submitted successfully!');
        setQuestionnaireData({});
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    }
  };

  const loadWidget = () => {
    // Simulate widget loading
    const script = document.createElement('script');
    script.textContent = `
      (function () {
        const businessId = "demo-business";
        const apiBaseUrl = window.location.origin;

        // Remove existing widget if any
        const existingBubble = document.querySelector('[data-dammi-bubble]');
        const existingChat = document.querySelector('[data-dammi-chat]');
        if (existingBubble) existingBubble.remove();
        if (existingChat) existingChat.remove();

        const bubble = document.createElement('div');
        bubble.setAttribute('data-dammi-bubble', 'true');
        bubble.style = "position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background: #1E90FF; color: white; font-size: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; z-index: 9999; box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3); transition: transform 0.2s ease;";
        bubble.innerText = '💬';
        bubble.onmouseenter = () => bubble.style.transform = 'scale(1.1)';
        bubble.onmouseleave = () => bubble.style.transform = 'scale(1)';
        document.body.appendChild(bubble);

        const chatWindow = document.createElement('div');
        chatWindow.setAttribute('data-dammi-chat', 'true');
        chatWindow.style = "display: none; position: fixed; bottom: 90px; right: 20px; width: 320px; height: 420px; background: white; border: 1px solid #ccc; border-radius: 10px; z-index: 9999; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.15); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;";
        chatWindow.innerHTML = \`
          <div style="padding: 15px; background: linear-gradient(135deg, #1E90FF, #0066CC); color: white; font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
            <span>Ask Dammi</span>
            <span style="cursor: pointer; font-size: 18px; opacity: 0.8; transition: opacity 0.2s;" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>
          </div>
          <div style="flex: 1; padding: 15px; overflow-y: auto; background: #f8f9fa;">
            <div style="margin-bottom: 12px; padding: 8px 12px; border-radius: 12px; background: white; border: 1px solid #e0e0e0;">
              <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Dammi</div>
              <div>Hi! I'm here to help. What can I assist you with today?</div>
            </div>
          </div>
          <div style="padding: 10px; border-top: 1px solid #eee; background: white;">
            <input placeholder="Ask something..." style="width: 100%; border: 1px solid #ddd; border-radius: 20px; padding: 10px 15px; outline: none; font-size: 14px;" onkeypress="if(event.key==='Enter') alert('Widget demo - would send: ' + this.value)" />
          </div>
        \`;
        document.body.appendChild(chatWindow);

        let isOpen = false;
        
        function toggleChat() {
          isOpen = !isOpen;
          chatWindow.style.display = isOpen ? 'flex' : 'none';
        }

        bubble.onclick = toggleChat;
      })();
    `;
    document.head.appendChild(script);
    alert('Widget loaded! Look for the chat bubble in the bottom right corner.');
  };

  return (
    <>
      <Head>
        <title>Dammi AI - Complete Frontend Interface</title>
        <meta name="description" content="AI-powered document Q&A system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-10 text-white">
            <h1 className="text-5xl font-bold mb-4 text-shadow-lg">Dammi AI</h1>
            <p className="text-xl opacity-90">Complete Frontend Interface</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
            {['upload', 'chat', 'questionnaire', 'widget'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 mx-1 rounded-lg transition-all duration-300 font-medium ${
                  activeTab === tab
                    ? 'bg-white/20 text-white transform -translate-y-0.5'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Document Upload</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-lg text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">Supports PDF, DOCX, and TXT files</p>
                  </label>
                </div>

                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Uploaded Files:</h3>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        file.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{file.name}</span>
                          <span className={`px-2 py-1 rounded text-sm ${
                            file.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {file.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{file.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Chat Interface</h2>
                
                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business ID</label>
                    <input
                      type="text"
                      value={businessId}
                      onChange={(e) => setBusinessId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Top K Results</label>
                    <input
                      type="number"
                      value={topK}
                      onChange={(e) => setTopK(e.target.value)}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-96 border border-gray-200 rounded-lg p-4 overflow-y-auto bg-gray-50">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 text-xs opacity-75">
                            <strong>Sources:</strong>
                            {msg.sources.map((source, idx) => (
                              <div key={idx} className="mt-1">
                                Source {idx + 1} (Score: {source.score?.toFixed(3)}): {source.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleQuery(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Ask a question..."]');
                      if (input && input.value.trim()) {
                        handleQuery(input.value);
                        input.value = '';
                      }
                    }}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Questionnaire Tab */}
            {activeTab === 'questionnaire' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Questionnaire Form</h2>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = {
                    full_name: formData.get('full_name'),
                    role: formData.get('role'),
                    businessId: formData.get('businessId'),
                    responses: {
                      company_info: formData.get('company_info'),
                      products_services: formData.get('products_services'),
                      target_audience: formData.get('target_audience'),
                      additional_info: formData.get('additional_info')
                    }
                  };
                  handleQuestionnaireSubmit(data);
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        name="role"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business ID</label>
                    <input
                      type="text"
                      name="businessId"
                      defaultValue="demo-business"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Information</label>
                    <textarea
                      name="company_info"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Products/Services</label>
                    <textarea
                      name="products_services"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <textarea
                      name="target_audience"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                    <textarea
                      name="additional_info"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Submit Questionnaire
                  </button>
                </form>
              </div>
            )}

            {/* Widget Tab */}
            {activeTab === 'widget' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Widget Management</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Embed Widget</h3>
                  <p className="text-blue-700 mb-4">
                    Add this code to your website to embed the Dammi AI chat widget:
                  </p>
                  <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    {`<script src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/widget.js?token=your-token-here"></script>`}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">Demo Widget</h3>
                  <p className="text-yellow-700 mb-4">
                    Click the button below to load a demo widget on this page:
                  </p>
                  <button
                    onClick={loadWidget}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    Load Demo Widget
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Widget Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Floating chat bubble in bottom-right corner</li>
                    <li>• Expandable chat window</li>
                    <li>• Real-time AI responses</li>
                    <li>• Source citations</li>
                    <li>• Mobile responsive</li>
                    <li>• Customizable styling</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-shadow-lg {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </>
  );
}
