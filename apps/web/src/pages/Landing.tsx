import { motion } from 'framer-motion';
import { Ghost, Sparkles, Zap, Wallet, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { web3Manager } from '../utils/web3';
import AnimatedBackground from '../components/AnimatedBackground';
import GlowButton from '../components/GlowButton';
import FloatingGhost from '../components/FloatingGhost';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { soundManager } from '../utils/soundManager';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, login, connectWalletOffline, logout } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    soundManager.play('click');
    setIsConnecting(true);

    try {
      // Step 1: Connect wallet (MetaMask)
      const connection = await web3Manager.connectWallet();
      
      if (!connection) {
        setIsConnecting(false);
        return;
      }

      // Step 2: Try to sign message (optional for offline mode)
      const message = 'Welcome to HauntedAI! Sign this message to authenticate.';
      let signature: string | null = null;
      
      try {
        signature = await web3Manager.signMessage(connection.address, message);
      } catch (signError: any) {
        // User might reject signature - that's okay for offline mode
        if (signError?.message?.includes('reject') || signError?.code === 4001) {
          // User rejected signature - continue with offline mode
        } else {
          throw signError;
        }
      }

      // Step 3: Try to login with backend API
      let apiAvailable = false;
      if (signature) {
        try {
          const success = await login(connection.address, signature, message);
          if (success) {
            apiAvailable = true;
            soundManager.play('success');
            navigate('/dashboard');
        setIsConnecting(false);
        return;
      }
        } catch (apiError: any) {
          // API is not available - continue to offline mode
          const errorMessage = apiError?.message || '';
          if (!errorMessage.includes('ERR_CONNECTION_REFUSED') && !errorMessage.includes('Failed to fetch')) {
            // Unexpected error - rethrow
            throw apiError;
          }
        }
      }

      // Step 4: If API is not available, use offline mode
      if (!apiAvailable) {
        // Connect wallet in offline mode
        connectWalletOffline(connection.address);
        soundManager.play('success');
        // Show success message (not error)
        setApiError(null);
        
        // Auto navigate immediately
        navigate('/dashboard');
      }
    } catch (error: any) {
      // Only handle unexpected errors
      const errorMessage = error?.message || '';
      
      // Check if it's a MetaMask connection error
      if (errorMessage.includes('User rejected') || errorMessage.includes('reject') || error?.code === 4001) {
        // User rejected MetaMask connection
        setApiError('تم إلغاء الاتصال بالمحفظة.');
      } else if (!errorMessage.includes('ERR_CONNECTION_REFUSED') && !errorMessage.includes('Failed to fetch')) {
        // Unexpected error
        if (process.env.NODE_ENV === 'development') {
      console.error('Wallet connection error:', error);
        }
        setApiError('فشل الاتصال بالمحفظة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsConnecting(false);
      setIsLoading(false);
    }
  };

  const handleContinueOffline = () => {
    localStorage.setItem('offline_mode', 'true');
    soundManager.play('success');
    setApiError(null);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {[...Array(5)].map((_, i) => (
        <FloatingGhost key={i} delay={i * 0.5} />
      ))}

      <nav className="absolute top-0 w-full z-10 px-8 py-6 flex justify-between items-center">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Ghost className="w-10 h-10 text-[#FF6B00]" />
          <span className="font-creepster text-3xl text-[#FF6B00] text-glow">
            HauntedAI
          </span>
        </motion.div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <motion.button
              onClick={async () => {
                soundManager.play('click');
                await logout();
                navigate('/');
              }}
              className="glass px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => soundManager.play('hover')}
            >
              <Wallet className="w-5 h-5" />
              {t('common.disconnect') || 'Disconnect'}
            </motion.button>
          ) : (
          <motion.button
            onClick={handleConnectWallet}
              disabled={isConnecting}
              className="glass px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 hover:bg-[#FF6B00] hover:text-white"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
              whileHover={!isConnecting ? { scale: 1.05 } : {}}
            onMouseEnter={() => !isConnecting && soundManager.play('hover')}
          >
            <Wallet className="w-5 h-5" />
              {isConnecting ? t('common.connecting') : t('landing.connectWallet')}
          </motion.button>
          )}
        </div>
      </nav>

      {/* API Error Notification */}
      {apiError && (
        <motion.div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="glass border-2 border-yellow-500/50 bg-yellow-900/20 p-4 rounded-lg shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-yellow-400 font-bold mb-2">⚠️ API غير متاح</h3>
                <p className="text-gray-300 text-sm mb-3">{apiError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleContinueOffline}
                    className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8C00] transition-colors text-sm font-semibold"
                  >
                    المتابعة بدون API
                  </button>
                  <button
                    onClick={() => setApiError(null)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    إغلاق
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  لتشغيل API: <code className="bg-black/30 px-1 rounded">npm run dev:api</code>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center space-y-8 max-w-4xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.h1
            className="font-creepster text-7xl md:text-9xl text-[#FF6B00] text-glow"
            animate={{
              textShadow: [
                '0 0 20px rgba(255, 107, 0, 0.8)',
                '0 0 40px rgba(255, 107, 0, 1)',
                '0 0 20px rgba(255, 107, 0, 0.8)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {t('landing.title')}
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl text-gray-300 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {t('landing.subtitle')}
          </motion.p>

          <motion.div
            className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div onMouseEnter={() => soundManager.play('hover')}>
              <GlowButton
                onClick={() => {
                  soundManager.play('click');
                  navigate('/dashboard');
                }}
                variant="primary"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  {t('landing.enterRoom')}
                </div>
              </GlowButton>
            </div>

            <div onMouseEnter={() => soundManager.play('hover')}>
              <GlowButton
                onClick={() => {
                  soundManager.play('click');
                  navigate('/explore');
                }}
                variant="accent"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  {t('landing.viewGallery')}
                </div>
              </GlowButton>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {[
              { title: t('landing.features.agents.title'), desc: t('landing.features.agents.desc'), icon: '👻' },
              { title: t('landing.features.realtime.title'), desc: t('landing.features.realtime.desc'), icon: '✨' },
              { title: t('landing.features.storage.title'), desc: t('landing.features.storage.desc'), icon: '🔮' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="glass p-6 rounded-xl hover:border-[#FF6B00] transition-all duration-300"
                whileHover={{ scale: 1.05, y: -10 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 + idx * 0.2 }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-[#FF6B00]">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      />
    </div>
  );
}
