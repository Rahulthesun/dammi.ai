import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle, ArrowLeft, Loader2  , PhoneIcon , MessageCircleDashed} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams }  from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState('create_account'); // 'create_account' or 'verify_otp'

  const searchParams = useSearchParams();
  const initialPhone = searchParams.get('phone') || "";

  const [formData, setFormData] = useState({
    phone: initialPhone,
    email: '',
    otp: ''
    
  });
  const [otp , setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  const API_BASE_URL = "http://localhost:5000"

  // Check if user is already logged in
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is already logged in, redirect to dashboard
          router.replace('/');
          return;
        }
      } catch (error) {
        console.log('Error checking current user:');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkCurrentUser();
  }, [router]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.phone || !formData.email ) {
      setError('Please fill in all required fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
        const response = await fetch(`${API_BASE_URL}/api/whatsapp-otp-gen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formData.phone }),
        });

        console.log(response)
        if (!response.ok) {
            //const errorData = await response.json();
            throw new Error('Failed to send OTP. Please try again.');
            
        }
        const data = await response.json();
        sessionStorage.setItem('phone' , formData.phone)
        sessionStorage.setItem('email' , formData.email)
        sessionStorage.setItem('otp' , data.enc_data.encrypted)
        sessionStorage.setItem('otp_iv' , data.enc_data.iv)
        sessionStorage.setItem('otp_authTag' , data.enc_data.authTag)
        

        setStep('verify_otp')

        
        
    }    
    catch(error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    }
    finally {
        setLoading(false);
    };
  };

  //To Link Meta Whatsapp Business Account to this account
  const linkMetaWBA = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/whatsapp/oauth` , 
            {
                method: "GET" , 
                headers: {
                    "Accept" : "application/json",
                }
            }
        );
        const data = await response.json();
        window.location.href = data.url; // Facebook redirect url to fetch initial code
    }
    catch(error) {
        console.error(error)
    }
        //window.location.href = "";
  };

  const verifyOtp = async () => {
        console.log("Verifying OTP ...");
        const encrypted_otp = sessionStorage.getItem('otp')
        try {
            const response = await fetch(`${API_BASE_URL}/api/whatsapp-otp-gen/verification` , {
                method: 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    otp: formData.otp,
                    phone: sessionStorage.getItem('phone'),
                    email: sessionStorage.getItem('email'),
                    //The Decrypt() function expects this data in this format
                    encryptedData : {
                        encrypted : sessionStorage.getItem('otp'),
                        iv : sessionStorage.getItem('otp_iv'),
                        authTag : sessionStorage.getItem('otp_authTag')
                    }

                })
            })
            const data = await response.json();
            const user_id = data.id
            console.log(data)
            sessionStorage.setItem('id' , user_id);//userid
            linkMetaWBA(user_id)

            if (!response.ok) {
                console.log("Couldn't Verify OTP")
            }
        } catch(error) {
            
        }
  };

  

  const goBackToSignup = () => {
    setStep('create_account');
    setMessage('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && step === 'create_account') {
      handleCreateAccount();
    }
  };

  // Show loading spinner while checking if user is already authenticated
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-100 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 'create_account' ? (
              <User className="w-8 h-8 text-violet-600" />
            ) : (
              <MessageCircleDashed className="w-8 h-8 text-violet-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'create_account' ? 'Create Account' : 'Verify OTP'}
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'create_account' 
              ? 'Join Dammi AI and get started today' 
              : `Check your Whatsapp at ${formData.phone.slice(formData.phone.length , formData.phone.length-2)}`
            }
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${step === 'create_account' ? 'bg-violet-600' : 'bg-violet-200'}`} />
            <div className={`w-8 h-1 ${step === 'check_email' ? 'bg-violet-200' : 'bg-gray-200'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'verify_otp' ? 'bg-violet-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {/* Create Account Step */}
        {step === 'create_account' && (
          <div className="space-y-6">

            <div>

              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors text-black"
                  placeholder="Enter your Admin Phone Number"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors text-black"
                  placeholder="Enter Your Email Address"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                </button>
              </div>
            </div>

            
            

            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        )}




        {/* Verify Email Step */}
        {step === 'verify_otp' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                OTP
              </label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  required
                  maxLength={4}
                  minLength={4}
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors text-black"
                  placeholder="Enter The 4-Digit OTP"
                  disabled={loading}
                />
                
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the code? 
                <button 
                    //onClick={}
                    className="text-violet-600 hover:text-violet-800 font-medium transition-colors"
                    disabled={loading}
                    >
                    Resend Code
                </button>
              </p>
              
              <button
                type="button"
                onClick={verifyOtp}
                disabled={loading}
                className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                {loading ? (
                    <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verifying OTP
                    </>
                ) : 'Verify OTP'}
              </button>
            </div>

            
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-violet-600 hover:text-violet-800 font-medium transition-colors"
              disabled={loading}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}