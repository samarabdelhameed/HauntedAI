import { motion } from 'framer-motion';
import { Bot, Plus, Activity, Clock, Eye, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { soundManager } from '../utils/soundManager';

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const agents = [
    {
      id: 1,
      name: 'Story Weaver',
      status: 'active',
      lastCID: 'Qm...abc123',
      activity: [20, 45, 30, 60, 40, 75, 50],
    },
    {
      id: 2,
      name: 'Image Conjurer',
      status: 'idle',
      lastCID: 'Qm...xyz789',
      activity: [40, 30, 50, 25, 60, 35, 45],
    },
    {
      id: 3,
      name: 'Audio Phantom',
      status: 'active',
      lastCID: 'Qm...def456',
      activity: [30, 55, 40, 70, 45, 80, 60],
    },
    {
      id: 4,
      name: 'Video Specter',
      status: 'idle',
      lastCID: 'Qm...ghi789',
      activity: [50, 40, 60, 35, 55, 40, 50],
    },
  ];

  const recentRooms = [
    { id: 'room-001', status: 'completed', date: '2025-12-01', name: 'Haunted Story' },
    { id: 'room-002', status: 'running', date: '2025-12-01', name: 'Ghost Image' },
    { id: 'room-003', status: 'completed', date: '2025-11-30', name: 'Scary Audio' },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="flex">
        <aside className="w-64 h-screen glass border-r border-gray-800 p-6 sticky top-0">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-3xl font-creepster text-[#FF6B00] mb-8">HauntedAI</div>

            <nav className="space-y-2">
              {[
                { icon: Activity, label: 'Dashboard', active: true, path: '/dashboard' },
                { icon: Bot, label: 'Live Rooms', active: false, path: '/room/demo' },
                { icon: Eye, label: 'Explore', active: false, path: '/explore' },
                { icon: User, label: 'Profile', active: false, path: '/profile' },
              ].map((item, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    soundManager.play('click');
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    item.active
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_20px_rgba(255,107,0,0.5)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ x: 5 }}
                  onMouseEnter={() => soundManager.play('hover')}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </motion.button>
              ))}
            </nav>

            <div className="glass p-4 rounded-lg mt-8">
              <div className="text-sm text-gray-400 mb-2">Wallet Balance</div>
              <div className="text-2xl font-bold text-[#FF6B00]">1,250 HHCW</div>
            </div>
          </motion.div>
        </aside>

        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-400">Manage your haunted AI agents</p>
              </div>

              <motion.button
                onClick={() => {
                  soundManager.play('click');
                  setShowModal(true);
                }}
                onMouseEnter={() => soundManager.play('hover')}
                className="flex items-center gap-2 bg-[#FF6B00] px-6 py-3 rounded-lg font-semibold shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:shadow-[0_0_30px_rgba(255,107,0,0.8)] transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                New Session
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  className="glass p-6 rounded-xl hover:border-[#FF6B00] transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <Bot className="w-8 h-8 text-[#FF6B00]" />
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        agent.status === 'active'
                          ? 'bg-green-500/20 text-green-400 animate-pulse'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {agent.status}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">Last: {agent.lastCID}</p>

                  <div className="flex items-end gap-1 h-16">
                    {agent.activity.map((value, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-[#FF6B00] rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${value}%` }}
                        transition={{ delay: idx * 0.1 + i * 0.05 }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="glass p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Recent Rooms</h2>
              <div className="space-y-3">
                {recentRooms.map((room, idx) => (
                  <motion.div
                    key={room.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          room.status === 'running'
                            ? 'bg-green-400 animate-pulse'
                            : 'bg-gray-400'
                        }`}
                      />
                      <div>
                        <div className="font-semibold">{room.name}</div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {room.date}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/room/${room.id}`)}
                      onMouseEnter={() => soundManager.play('hover')}
                      className="px-4 py-2 bg-[#FF6B00]/20 hover:bg-[#FF6B00] rounded-lg transition-all"
                    >
                      View
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="glass p-8 rounded-2xl max-w-md w-full mx-4"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-6 text-[#FF6B00]">New Session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Enter your idea</label>
                <input
                  type="text"
                  placeholder="A haunted castle story..."
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 focus:border-[#FF6B00] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Language</label>
                <select className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 focus:border-[#FF6B00] focus:outline-none transition-all">
                  <option>English</option>
                  <option>Arabic</option>
                  <option>French</option>
                </select>
              </div>
              <motion.button
                onClick={() => {
                  soundManager.play('success');
                  navigate('/room/new');
                }}
                onMouseEnter={() => soundManager.play('hover')}
                className="w-full bg-[#FF6B00] py-4 rounded-lg font-bold shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:shadow-[0_0_30px_rgba(255,107,0,0.8)] transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Summon Agents
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
