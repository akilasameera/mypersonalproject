import React, { useState } from 'react';
import { User, LogIn, UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-sm sm:max-w-md w-full">
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 sm:mb-6 shadow-xl shadow-blue-500/25">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">Project Manager</h1>
          <p className="text-gray-600 text-base sm:text-lg">Organize your projects with elegance</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 relative z-10">
          <div className="flex bg-gray-50/80 rounded-xl p-1 sm:p-1.5 mb-6 sm:mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 flex items-center justify-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isLogin 
                  ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <LogIn className="w-4 h-4 mr-1 sm:mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 flex items-center justify-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                !isLogin 
                  ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <UserPlus className="w-4 h-4 mr-1 sm:mr-2" />
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50/80 backdrop-blur border border-red-200/50 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white text-base"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-3 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white text-base"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white text-base"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-[1.02] text-base"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> : <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;