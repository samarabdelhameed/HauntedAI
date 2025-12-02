import { motion } from 'framer-motion';
import { Ghost, Sparkles, Zap, Wallet } from 'lucide-react';
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
  const { isAuthenticated, login } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    soundManager.play('click');
    setIsConnecting(true);

    try {
      // Connect wallet
      const connection = await web3Manager.connectWallet();
      
      if (!connection) {
        setIsConnecting(false);
        return;
      }

      // Sign authentication message
      const message = 'Welcome to HauntedAI! Sign this message to authenticate.';
      const signature = await web3Manager.signMessage(connection.address, message);

      if (!signature) {
        alert('Signature required to authenticate');
        setIsConnecting(false);
        return;
      }

      // Login with backend
      const success = await login(connection.address, signature, message);

      if (success) {
        soundManager.play('success');
        navigate('/dashboard');
      } else {
        alert('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
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
          
          <motion.button
            onClick={handleConnectWallet}
            disabled={isConnecting || isAuthenticated}
            className={`glass px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              isAuthenticated 
                ? 'bg-green-500/20 text-green-400 cursor-default' 
                : 'hover:bg-[#FF6B00] hover:text-white'
            }`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={!isAuthenticated && !isConnecting ? { scale: 1.05 } : {}}
            onMouseEnter={() => !isConnecting && soundManager.play('hover')}
          >
            <Wallet className="w-5 h-5" />
            {isConnecting ? t('common.connecting') : isAuthenticated ? `✓ ${t('common.connected')}` : t('landing.connectWallet')}
          </motion.button>
        </div>
      </nav>

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
