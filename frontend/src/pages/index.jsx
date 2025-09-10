import { useState, useEffect } from 'react';
import { Upload, MessageCircle, FileText, Menu, X, Settings, HelpCircle, LogOut, Monitor } from 'lucide-react';




export default function Home() {
  const [widgetToken, setWidgetToken] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [questionnaireData, setQuestionnaireData] = useState({});
  const [businessId, setBusinessId] = useState('demo-business');
  const [topK, setTopK] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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


  useEffect(() => {
  const fetchToken = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-widget-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });
      const data = await res.json();
      if (res.ok) {
        setWidgetToken(data.token);
      } else {
        console.error('Token fetch error:', data.error);
      }
    } catch (err) {
      console.error('Failed to fetch widget token:', err);
    }
  };

  if (businessId) fetchToken();
}, [businessId]);


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/query`, {
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

  const handleQuestionnaireSubmit = async (data) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submit-questionnaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Questionnaire submitted successfully!'); k
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

  const closeWidget = () => {
    const bubble = document.querySelector('[data-dammi-bubble]');
    const chat = document.querySelector('[data-dammi-chat]');
    if (bubble) bubble.remove();
    if (chat) chat.remove();
    alert('Widget removed successfully!');
  };

  const menuItems = [
    { id: 'upload', label: 'Upload Documents', icon: Upload, description: 'Upload and manage files' },
    { id: 'chat', label: 'Chat Interface', icon: MessageCircle, description: 'Ask questions and get answers' },
    { id: 'questionnaire', label: 'Questionnaire', icon: FileText, description: 'Fill out business information' },
    { id: 'widget', label: 'Widget Manager', icon: Monitor, description: 'Manage chat widget' }
  ];

  const bottomMenuItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  const submitQuestionnaire = () => {
    const data = {
      full_name: questionnaireData.full_name || '',
      role: questionnaireData.role || '',
      businessId: questionnaireData.businessId || 'demo-business',
      responses: {
        company_info: questionnaireData.company_info || '',
        products_services: questionnaireData.products_services || '',
        target_audience: questionnaireData.target_audience || '',
        additional_info: questionnaireData.additional_info || ''
      }
    };
    handleQuestionnaireSubmit(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
    {/* Sidebar */}
    <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
      sidebarOpen ? 'w-72' : 'w-20'
    } bg-white border-r border-gray-200 shadow-lg`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {sidebarOpen && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dammi AI</h1>
              <p className="text-xs text-gray-500">AI Assistant</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-3 rounded-lg transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <IconComponent className={`${sidebarOpen ? 'w-5 h-5' : 'w-7 h-7'} ${
                  activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${
                      activeTab === item.id ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          {bottomMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900`}
              >
                <IconComponent className={`${sidebarOpen ? 'w-5 h-5' : 'w-7 h-7'} text-gray-500`} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className={`flex-1 transition-all duration-300 ${
      sidebarOpen ? 'ml-72' : 'ml-20'
    }`}>
      
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">
              {menuItems.find(item => item.id === activeTab)?.description}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileInput"
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business ID</label>
                  <input
                    type="text"
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 border border-gray-200 rounded-xl p-4 overflow-y-auto bg-gray-50">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : 'bg-white border border-gray-200 shadow-sm text-black'
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
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
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Questionnaire Tab */}
          {activeTab === 'questionnaire' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={questionnaireData.full_name || ''}
                      onChange={(e) => setQuestionnaireData({...questionnaireData, full_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input
                      type="text"
                      value={questionnaireData.role || ''}
                      onChange={(e) => setQuestionnaireData({...questionnaireData, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business ID</label>
                  <input
                    type="text"
                    value={questionnaireData.businessId || 'demo-business'}
                    onChange={(e) => setQuestionnaireData({...questionnaireData, businessId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Information</label>
                  <textarea
                    rows="3"
                    value={questionnaireData.company_info || ''}
                    onChange={(e) => setQuestionnaireData({...questionnaireData, company_info: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Products/Services</label>
                  <textarea
                    rows="3"
                    value={questionnaireData.products_services || ''}
                    onChange={(e) => setQuestionnaireData({...questionnaireData, products_services: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <textarea
                    rows="3"
                    value={questionnaireData.target_audience || ''}
                    onChange={(e) => setQuestionnaireData({...questionnaireData, target_audience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                  <textarea
                    rows="3"
                    value={questionnaireData.additional_info || ''}
                    onChange={(e) => setQuestionnaireData({...questionnaireData, additional_info: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
                  />
                </div>

                <button
                  onClick={submitQuestionnaire}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-sm"
                >
                  Submit Questionnaire
                </button>
              </div>
            </div>
          )}

          {/* Widget Tab */}
          {activeTab === 'widget' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Embed Widget</h3>
                <p className="text-blue-700 mb-4">
                  Add this code to your website to embed the Dammi AI chat widget:
                </p>
                <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  {widgetToken 
  ? `<script src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/widget.js?token=${widgetToken}"></script>` 
  : 'Loading token...'}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">Demo Widget</h3>
                <p className="text-yellow-700 mb-4">
                  Click the button below to load a demo widget on this page:
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={loadWidget}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    Load Demo Widget
                  </button>
                  <button
                    onClick={closeWidget}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Close Widget
                  </button>
                </div>
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
  </div>
);
}