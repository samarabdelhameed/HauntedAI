import { motion } from 'framer-motion';
import { Search, Filter, Eye, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { soundManager } from '../utils/soundManager';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Explore() {
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadAssets();
  }, [filterType]);

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      const filters = filterType !== 'all' ? { agentType: filterType } : undefined;
      const response = await apiClient.listAssets(filters);

      if (response.data) {
        setAssets(response.data as any[]);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    soundManager.play('success');
    alert('CID copied to clipboard!');
  };

  const filteredAssets = assets.filter((asset) =>
    searchTerm
      ? asset.cid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.agentType?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );



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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by CID or agent type..."
                className="w-full glass pl-12 pr-4 py-3 rounded-lg focus:border-[#FF6B00] focus:outline-none transition-all"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="glass px-6 py-3 rounded-lg hover:border-[#FF6B00] transition-all focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="story">Story</option>
              <option value="asset">Image</option>
              <option value="code">Code</option>
              <option value="deploy">Deploy</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400 py-16">Loading assets...</div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              No assets found. Create some haunted content to see it here!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset, idx) => (
                <motion.div
                  key={asset.id}
                  className="glass rounded-xl overflow-hidden cursor-pointer hover:border-[#FF6B00] transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => {
                    soundManager.play('click');
                    setSelectedAsset(asset);
                  }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs text-gray-400 uppercase mb-1">
                          {asset.agentType}
                        </div>
                        <h3 className="text-lg font-bold">{asset.fileType || 'Content'}</h3>
                      </div>
                      <div className="px-3 py-1 bg-[#FF6B00]/20 text-[#FF6B00] rounded-full text-xs">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-gray-500 break-all mb-3">
                      {asset.cid?.substring(0, 40)}...
                    </div>
                    <div className="text-sm text-gray-400">
                      Size: {(asset.fileSize / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-[#FF6B00]">
                  {selectedAsset.agentType} Asset
                </h2>
                <div className="flex gap-4 text-sm text-gray-400 mb-4">
                  <span>{selectedAsset.fileType}</span>
                  <span>{new Date(selectedAsset.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-400">IPFS CID</div>
                  <motion.button
                    onClick={() => copyToClipboard(selectedAsset.cid)}
                    className="p-2 hover:bg-[#FF6B00] rounded-lg transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </motion.button>
                </div>
                <div className="font-mono text-sm break-all">{selectedAsset.cid}</div>
              </div>

              <div className="glass p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Metadata</div>
                <div className="space-y-1 text-sm">
                  <div>Size: {(selectedAsset.fileSize / 1024).toFixed(2)} KB</div>
                  <div>Room ID: {selectedAsset.roomId}</div>
                </div>
              </div>

              <motion.button
                onClick={() => {
                  soundManager.play('click');
                  window.open(`https://ipfs.io/ipfs/${selectedAsset.cid}`, '_blank');
                }}
                className="w-full bg-[#FF6B00] py-4 rounded-lg font-bold shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:shadow-[0_0_30px_rgba(255,107,0,0.8)] transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View on IPFS
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
