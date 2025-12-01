import { motion } from 'framer-motion';
import { Send, Copy, X, Terminal } from 'lucide-react';
import { useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import FloatingGhost from '../components/FloatingGhost';

export default function LiveRoom() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState([
    { type: 'info', message: 'Room initialized...' },
    { type: 'success', message: 'Story Agent connected' },
    { type: 'success', message: 'Image Agent connected' },
    { type: 'info', message: 'Waiting for input...' },
  ]);

  const [preview, setPreview] = useState({
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'The Haunted Manor',
    story: 'In the depths of the forgotten forest stands a manor, abandoned for centuries...',
    cids: [
      { type: 'Story', cid: 'QmStory123...' },
      { type: 'Image', cid: 'QmImage456...' },
    ],
  });

  const handleSummon = () => {
    if (!input.trim()) return;

    setLogs((prev) => [
      ...prev,
      { type: 'info', message: `Processing: "${input}"` },
      { type: 'success', message: 'Story Agent generating...' },
      { type: 'success', message: 'Image Agent creating visual...' },
    ]);

    setInput('');
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {[...Array(3)].map((_, i) => (
        <FloatingGhost key={i} delay={i * 0.7} size={80} />
      ))}

      <div className="flex flex-col h-screen">
        <header className="glass border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.div
              className="text-2xl font-creepster text-[#FF6B00]"
              animate={{
                textShadow: [
                  '0 0 10px rgba(255, 107, 0, 0.8)',
                  '0 0 20px rgba(255, 107, 0, 1)',
                  '0 0 10px rgba(255, 107, 0, 0.8)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Live Room
            </motion.div>
            <div className="px-3 py-1 bg-white/10 rounded-full text-sm">
              Room ID: <span className="text-[#FF6B00] font-mono">abc-123</span>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Active
            </div>
          </div>

          <motion.button
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
            whileHover={{ scale: 1.05 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 flex flex-col">
            <div className="glass p-4 rounded-lg mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSummon()}
                  placeholder="Enter your haunted idea..."
                  className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 focus:border-[#FF6B00] focus:outline-none transition-all"
                />
                <motion.button
                  onClick={handleSummon}
                  className="bg-[#FF6B00] px-6 py-3 rounded-lg font-semibold shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:shadow-[0_0_30px_rgba(255,107,0,0.8)] transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                  Summon
                </motion.button>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="relative"
                  animate={{
                    scale: [1, 1.02, 1],
                    rotate: [0, 1, -1, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="w-64 h-64 bg-gradient-to-br from-[#FF6B00] to-[#FF0040] rounded-full blur-3xl opacity-20 absolute inset-0" />
                  <div className="w-48 h-48 bg-[#FF6B00] rounded-full blur-2xl opacity-30 absolute inset-0 m-auto" />
                </motion.div>

                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-[#FF6B00] rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: Math.cos((i * Math.PI * 2) / 8) * 100,
                      y: Math.sin((i * Math.PI * 2) / 8) * 100,
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="glass p-4 rounded-lg h-48 overflow-y-auto scrollbar-hide">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                <Terminal className="w-4 h-4" />
                Live Logs
              </div>
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    className={`${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'success'
                        ? 'text-green-400'
                        : 'text-gray-400'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log.message}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <aside className="w-96 glass border-l border-gray-800 p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold mb-4 text-[#FF6B00]">Preview</h2>
                <div className="space-y-4">
                  <motion.img
                    src={preview.image}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <h3 className="text-lg font-bold">{preview.title}</h3>
                  <p className="text-sm text-gray-400">{preview.story}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 text-[#FF6B00]">CIDs</h2>
                <div className="space-y-3">
                  {preview.cids.map((cid, idx) => (
                    <motion.div
                      key={idx}
                      className="p-3 bg-white/5 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-400">{cid.type}</div>
                          <div className="font-mono text-sm">{cid.cid}</div>
                        </div>
                        <motion.button
                          className="p-2 hover:bg-[#FF6B00] rounded-lg transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
}
