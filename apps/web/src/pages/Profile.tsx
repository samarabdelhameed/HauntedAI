import { motion } from 'framer-motion';
import { Wallet, Copy, Award, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('assets');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = [
    { label: 'Rooms Created', value: '24', icon: TrendingUp },
    { label: 'Assets Generated', value: '156', icon: Award },
    { label: 'Tokens Earned', value: '1,250', icon: Wallet },
  ];

  const badges = [
    { name: 'Ghost Master', rarity: 'Legendary', image: '👻' },
    { name: 'AI Summoner', rarity: 'Epic', image: '🔮' },
    { name: 'Story Weaver', rarity: 'Rare', image: '📖' },
  ];

  const userAssets = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'My Haunted Creation',
      date: '2025-12-01',
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/2161018/pexels-photo-2161018.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Dark Fantasy',
      date: '2025-11-30',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="glass p-8 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B00] to-[#FF0040] rounded-full flex items-center justify-center text-4xl">
                  👻
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Anonymous Spirit</h1>
                  <p className="text-gray-400">Haunting since 2025</p>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
                <div className="font-mono text-sm">0x1234...5678</div>
              </div>
              <motion.button
                className="p-3 hover:bg-[#FF6B00] rounded-lg transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Copy className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="glass p-6 rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <stat.icon className="w-8 h-8 text-[#FF6B00] mb-4" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex gap-4 mb-6 border-b border-gray-800">
              {['assets', 'badges', 'stats'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-4 capitalize font-semibold transition-all ${
                    activeTab === tab
                      ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'assets' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userAssets.map((asset, idx) => (
                  <motion.div
                    key={asset.id}
                    className="glass rounded-xl overflow-hidden hover:border-[#FF6B00] transition-all cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <img
                      src={asset.image}
                      alt={asset.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold mb-2">{asset.title}</h3>
                      <p className="text-sm text-gray-400">{asset.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {badges.map((badge, idx) => (
                  <motion.div
                    key={idx}
                    className="glass p-6 rounded-xl text-center hover:border-[#FF6B00] transition-all"
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    whileHover={{ rotateY: 10, scale: 1.05 }}
                  >
                    <div className="text-6xl mb-4">{badge.image}</div>
                    <h3 className="font-bold mb-2">{badge.name}</h3>
                    <div className="text-sm text-[#FF6B00]">{badge.rarity}</div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Most Active Agent</div>
                  <div className="text-xl font-bold">Story Weaver</div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Total Processing Time</div>
                  <div className="text-xl font-bold">127 minutes</div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Success Rate</div>
                  <div className="text-xl font-bold text-green-400">98.5%</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
