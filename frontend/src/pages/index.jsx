import { useState, useEffect } from 'react';
import { Upload, MessageCircle, FileText, Menu, X, Settings, HelpCircle, LogOut, Monitor, Loader2 } from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DammiDashboard() {
  const [widgetToken, setWidgetToken] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [questionnaireData, setQuestionnaireData] = useState({});
  const [businessId, setBusinessId] = useState(null);
  const [topK, setTopK] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [allowedDomain, setAllowedDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [url , setUrl] = useState("");

  const API_BASE_URL=process.env.NEXT_PUBLIC_API_BASE_URL
  
  //const API_BASE_URL = "https://damii-ai.fly.dev"; // Your actual API URL

  useEffect(() => {
    const fetchBusinessId = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user && user.id) {
          setBusinessId(user.id); // id itself is the businessId
          console.log("business id is" ,businessId)
          console.log("Fetched Business ID:", user.id);
        } else {
          console.warn("No user logged in. Please log in first.");
        }
      } catch (error) {
        console.error("Error fetching businessId:", error.message);
      }
    };

    fetchBusinessId();
  }, []);
  
  const updateDomain = async () => {
    if (!allowedDomain) {
      alert("Please enter a domain first.");
      return;
    }
    try {
      setSaving(true);
      console.log(`${API_BASE_URL}`);
      const response = await fetch(`${API_BASE_URL}/api/widget-domain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer YOUR_AUTH_TOKEN` // Add auth if needed
        },
        body: JSON.stringify({ businessId, domain: allowedDomain }),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to update domain');
      }
      
      alert("Domain updated ✅");
    } catch (err) {
      console.error("Error updating domain:", err);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
  const fetchToken = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/generate-widget-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (!response.ok) {
        //throw new Error('Network response was not ok');
        console.log('Failed to fetch widget token');
      }

      const data = await response.json();
      setWidgetToken(data.token);

    } catch (err) {
      console.error('Failed to fetch widget token:', err);
      setWidgetToken(null);
    } finally {
      setLoading(false);
    }
  };

  if (businessId) fetchToken();
  console.log(businessId);
}, [businessId]);


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('businessId', businessId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        // Headers are set automatically for FormData
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        status: 'success',
        message: result.message || 'File uploaded successfully'
      }]);
    } catch (error) {
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        status: 'error',
        message: error.message || 'Upload failed'
      }]);
    }
  };

  const handleDataScraping = async (url) => { 
  try {
    const response = await fetch("http://localhost:5000/api/scrape-website", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",  // <-- tell server it's JSON
      },
      body: JSON.stringify({ url, businessId }), // make sure property name matches backend
    });

    if (!response.ok) {
      throw new Error("Failed to get Server Response from Website");
    }

    const data = await response.json();
    console.log("Scraping result:", data);

  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Failed to fetch data from the website. Please try again.");
  }
};

  const handleQuery = async (question) => {
    if (!question.trim()) return;

    const userMessage = {
      sender: 'user',
      message: question,
      sources: []
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          businessId,
          topK,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      const aiData = await response.json();
      const aiMessage = {
      sender: 'ai',
      message: aiData.answer || 'No response from AI',
      sources: aiData.sources || []
    };

      
      setChatMessages(prev => [...prev, { sender: 'ai', ...aiMessage }]);

    } catch (error) {
      const errorMessage = {
        sender: 'ai',
        message: `❌ Error: ${error.message}`,
        sources: []
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuestionnaireSubmit = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/submit-questionnaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }
      
      alert('Questionnaire submitted successfully!');
      setQuestionnaireData({}); // Clear form on success
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const loadWidget = () => {
    // Remove existing widget if any
    const existingBubble = document.querySelector('[data-dammi-bubble]');
    const existingChat = document.querySelector('[data-dammi-chat]');
    if (existingBubble) existingBubble.remove();
    if (existingChat) existingChat.remove();

    // Create chat bubble
    const bubble = document.createElement('div');
    bubble.setAttribute('data-dammi-bubble', 'true');
    bubble.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; 
      background: #1E90FF; color: white; font-size: 28px; display: flex; 
      align-items: center; justify-content: center; border-radius: 50%; 
      cursor: pointer; z-index: 9999; box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3); 
      transition: transform 0.2s ease;
    `;
    bubble.innerText = '💬';
    bubble.onmouseenter = () => bubble.style.transform = 'scale(1.1)';
    bubble.onmouseleave = () => bubble.style.transform = 'scale(1)';
    document.body.appendChild(bubble);

    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.setAttribute('data-dammi-chat', 'true');
    chatWindow.style.cssText = `
      display: none; position: fixed; bottom: 90px; right: 20px; width: 320px; 
      height: 420px; background: white; border: 1px solid #ccc; border-radius: 10px; 
      z-index: 9999; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.15); 
      overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    chatWindow.innerHTML = `
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
    `;
    document.body.appendChild(chatWindow);

    let isOpen = false;
    
    function toggleChat() {
      isOpen = !isOpen;
      chatWindow.style.display = isOpen ? 'flex' : 'none';
    }

    bubble.onclick = toggleChat;
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
        website_link: questionnaireData.website_link || '',
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
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-black">Fetch Data from  Your Website</h3>        
                  <input
                    type='url'
                    value = {url}
                    onChange={(e)=> setUrl(e.target.value)}
                    placeholder='Your Website Link'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500'
                  />             
                  <button onClick={() => handleDataScraping(url)} className='mt-3 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm'>Fetch Data</button>
                </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                <ChatInput onSendMessage={handleQuery} />
              </div>
            )}

            {/* Questionnaire Tab */}
            {activeTab === 'questionnaire' && (
              <QuestionnaireForm
                data={questionnaireData}
                onChange={setQuestionnaireData}
                onSubmit={submitQuestionnaire}
              />
            )}

            {/* Widget Tab */}
            {activeTab === 'widget' && (
              <WidgetManager
                widgetToken={widgetToken}
                loading={loading}
                allowedDomain={allowedDomain}
                onDomainChange={setAllowedDomain}
                onUpdateDomain={updateDomain}
                saving={saving}
                onLoadWidget={loadWidget}
                onCloseWidget={closeWidget}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate component for chat input
function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask a question..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
      />
      <button
        onClick={handleSend}
        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
      >
        Send
      </button>
    </div>
  );
}



// Separate component for questionnaire form
function QuestionnaireForm({ data, onChange, onSubmit }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={data.full_name || ''}
              onChange={(e) => handleFieldChange('full_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              type="text"
              value={data.role || ''}
              onChange={(e) => handleFieldChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business ID</label>
          <inputx
            type="text"
            value={data.businessId || 'demo-business'}
            onChange={(e) => handleFieldChange('businessId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Information</label>
          <textarea
            rows="3"
            value={data.company_info || ''}
            onChange={(e) => handleFieldChange('company_info', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website Link</label>
          <input
            type="url"
            value={data.website_link || ''}
            onChange={(e) => handleFieldChange('websiteLink', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Products/Services</label>
          <textarea
            rows="3"
            value={data.products_services || ''}
            onChange={(e) => handleFieldChange('products_services', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
          <textarea
            rows="3"
            value={data.target_audience || ''}
            onChange={(e) => handleFieldChange('target_audience', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
          <textarea
            rows="3"
            value={data.additional_info || ''}
            onChange={(e) => handleFieldChange('additional_info', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-500"
          />
        </div>

        <button
          onClick={onSubmit}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-sm"
        >
          Submit Questionnaire
        </button>
      </div>
    </div>
  );
}

// Separate component for widget manager
function WidgetManager({ 
  widgetToken, 
  loading, 
  allowedDomain, 
  onDomainChange, 
  onUpdateDomain, 
  saving, 
  onLoadWidget, 
  onCloseWidget 
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Embed Widget</h3>
        <p className="text-blue-700 mb-4">
          Add this code to your website to embed the Dammi AI chat widget:
        </p>
        
        {/* Domain Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Domain
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={allowedDomain}
              onChange={(e) => onDomainChange(e.target.value)}
              placeholder="example.com"
              className="flex-1 p-2 border border-gray-300 rounded-lg text-black placeholder-gray-500"
            />
            <button
              onClick={onUpdateDomain}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading token...
            </div>
          ) : widgetToken ? (
            `<script src="https://your-domain.com/widget.js?token=${widgetToken}"></script>`
          ) : (
            'Error loading token'
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">Demo Widget</h3>
        <p className="text-yellow-700 mb-4">
          Click the button below to load a demo widget on this page:
        </p>
        <div className="flex gap-3">
          <button
            onClick={onLoadWidget}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            Load Demo Widget
          </button>
          <button
            onClick={onCloseWidget}
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

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Integration Guide</h3>
        <div className="space-y-3 text-green-700">
          <p><strong>Step 1:</strong> Copy the embed code above</p>
          <p><strong>Step 2:</strong> Paste it before the closing &lt;/body&gt; tag on your website</p>
          <p><strong>Step 3:</strong> Configure your allowed domain above</p>
          <p><strong>Step 4:</strong> Test the widget functionality</p>
        </div>
      </div>
    </div>
  );
}