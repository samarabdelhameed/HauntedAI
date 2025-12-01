import { motion } from 'framer-motion';
import { Search, Filter, Eye } from 'lucide-react';
import { useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Explore() {
  const [selectedAsset, setSelectedAsset] = useState<number | null>(null);

  const assets = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'The Haunted Manor',
      agent: 'Story + Image',
      views: 1250,
      story: 'A long abandoned manor in the depths of a forgotten forest. Legend speaks of spirits that still roam its halls...',
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/2161018/pexels-photo-2161018.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Midnight Whispers',
      agent: 'Audio + Story',
      views: 980,
      story: 'Strange whispers echo through the darkness, telling tales of forgotten souls...',
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Ghost Ship',
      agent: 'Image + Video',
      views: 2100,
      story: 'An ancient vessel appears in the fog, crewed by phantoms from another age...',
    },
    {
      id: 4,
      image: 'https://images.pexels.com/photos/3009759/pexels-photo-3009759.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Cursed Forest',
      agent: 'Story + Image',
      views: 1540,
      story: 'Trees twisted by dark magic, paths that lead nowhere, voices in the wind...',
    },
    {
      id: 5,
      image: 'https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Shadow Realm',
      agent: 'Image + Audio',
      views: 1890,
      story: 'A dimension where shadows have form and darkness speaks...',
    },
    {
      id: 6,
      image: 'https://images.pexels.com/photos/1670723/pexels-photo-1670723.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Phantom Orchestra',
      agent: 'Audio + Story',
      views: 1320,
      story: 'Music plays in an empty hall, performed by musicians long since departed...',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-5xl font-creepster text-[#FF6B00] mb-2 text-glow">
              Haunted Gallery
            </h1>
            <p className="text-gray-400">Explore creations from the darkness</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search haunted creations..."
                className="w-full glass pl-12 pr-4 py-3 rounded-lg focus:border-[#FF6B00] focus:outline-none transition-all"
              />
            </div>
            <motion.button
              className="glass px-6 py-3 rounded-lg flex items-center gap-2 hover:border-[#FF6B00] transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <Filter className="w-5 h-5" />
              Filters
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset, idx) => (
              <motion.div
                key={asset.id}
                className="glass rounded-xl overflow-hidden cursor-pointer hover:border-[#FF6B00] transition-all"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => setSelectedAsset(asset.id)}
              >
                <div className="relative overflow-hidden group">
                  <motion.img
                    src={asset.image}
                    alt={asset.title}
                    className="w-full h-48 object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{asset.title}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                    <span>{asset.agent}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {asset.views}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{asset.story}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {selectedAsset && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedAsset(null)}
        >
          <motion.div
            className="glass p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {assets
              .filter((a) => a.id === selectedAsset)
              .map((asset) => (
                <div key={asset.id} className="space-y-6">
                  <motion.img
                    src={asset.image}
                    alt={asset.title}
                    className="w-full h-64 object-cover rounded-lg"
                    layoutId={`image-${asset.id}`}
                  />
                  <div>
                    <h2 className="text-3xl font-bold mb-2 text-[#FF6B00]">
                      {asset.title}
                    </h2>
                    <div className="flex gap-4 text-sm text-gray-400 mb-4">
                      <span>{asset.agent}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {asset.views}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{asset.story}</p>
                  <div className="glass p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">IPFS CID</div>
                    <div className="font-mono text-sm">QmExample123abc...</div>
                  </div>
                  <motion.button
                    className="w-full bg-[#FF6B00] py-4 rounded-lg font-bold shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:shadow-[0_0_30px_rgba(255,107,0,0.8)] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Download
                  </motion.button>
                </div>
              ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
