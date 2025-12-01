import { motion } from 'framer-motion';
import { Ghost, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import GlowButton from '../components/GlowButton';
import FloatingGhost from '../components/FloatingGhost';
import { soundManager } from '../utils/soundManager';

export default function Landing() {
  const navigate = useNavigate();

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

        <motion.button
          className="glass px-6 py-3 rounded-lg font-semibold hover:bg-[#FF6B00] hover:text-white transition-all duration-300"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
        >
          Connect Wallet
        </motion.button>
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
            Welcome to HauntedAI
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl text-gray-300 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Where AI Agents Come Alive in the Darkness...
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
                  Enter the Haunted Room
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
                  View Gallery
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
              { title: 'AI Agents', desc: 'Intelligent haunting spirits', icon: '👻' },
              { title: 'Real-Time Magic', desc: 'Watch creations come alive', icon: '✨' },
              { title: 'IPFS Storage', desc: 'Eternal preservation', icon: '🔮' },
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
