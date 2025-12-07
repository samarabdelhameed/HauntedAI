import { motion } from 'framer-motion';
import { Copy, X, Terminal, Play, BookOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/apiClient';
import { soundManager } from '../utils/soundManager';
import AnimatedBackground from '../components/AnimatedBackground';
import FloatingGhost from '../components/FloatingGhost';

interface Log {
  timestamp: string;
  agentType: string;
  level: string;
  message: string;
}

export default function LiveRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storyText, setStoryText] = useState<string | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!id) {
      navigate('/dashboard');
      return;
    }

    loadRoom();

    return () => {
      // Cleanup SSE connection
      if (sseRef.current) {
        sseRef.current.close();
      }
      // Cleanup refresh interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [id, isAuthenticated, navigate]);

  useEffect(() => {
    // Auto-scroll logs
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadRoom = async () => {
    if (!id) return;

    try {
      const response = await apiClient.getRoom(id);

      if (response.error || !response.data) {
        console.error('Room not found:', response.error);
        alert('Room not found');
        navigate('/dashboard');
        return;
      }

      setRoom(response.data);
      setIsLoading(false);

      // Load story if available (don't await to avoid blocking)
      loadStory(response.data);

      // Connect to SSE for live logs only once
      if (!sseRef.current) {
        connectSSE();
      }
      
      // Stop refresh interval if room is done or error
      if (response.data?.status === 'done' || response.data?.status === 'error') {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Failed to load room:', error);
      setIsLoading(false);
      alert('Failed to load room: ' + (error as Error).message);
      navigate('/dashboard');
    }
  };

  const connectSSE = () => {
    if (!id) return;
    
    // Close existing connection if any
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    try {
      const eventSource = apiClient.createSSEConnection(
        id,
        (log) => {
          setLogs((prev) => [...prev, log]);
          
          // Play sound based on log level
          try {
            if (log.level === 'success') {
              soundManager.play('success');
            } else if (log.level === 'error') {
              soundManager.play('error');
            } else if (log.level === 'info' && log.message.includes('starting')) {
              soundManager.play('hover');
            }
          } catch (e) {
            // Sound might not be ready yet
          }
        },
        (error) => {
          console.error('SSE connection error:', error);
        }
      );

      sseRef.current = eventSource;
    } catch (error) {
      console.error('Failed to connect SSE:', error);
    }
  };

  const handleStartWorkflow = async () => {
    if (!id) return;

    setIsStarting(true);
    
    // Enable sound on first user interaction
    try {
      soundManager.play('click');
    } catch (e) {
      console.log('Sound not ready yet');
    }

    try {
      const response = await apiClient.startRoom(id);

      if (response.error) {
        alert('Failed to start workflow: ' + response.error);
        return;
      }

      soundManager.play('success');
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          agentType: 'orchestrator',
          level: 'info',
          message: 'Workflow started successfully',
        },
      ]);

      // Reload room data periodically to get updated assets
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(async () => {
        await loadRoom();
      }, 3000); // Check every 3 seconds

      // Clear interval after 60 seconds or when room is done
      setTimeout(() => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      }, 60000);
    } catch (error) {
      console.error('Failed to start workflow:', error);
      alert('Failed to start workflow');
    } finally {
      setIsStarting(false);
    }
  };

  const loadStory = async (roomData: any) => {
    if (!roomData?.assets) return;

    // Find story asset
    const storyAsset = roomData.assets.find((asset: any) => asset.agentType === 'story');
    if (!storyAsset) return;

    try {
      setIsLoadingStory(true);
      
      // First, check if story content is in metadata
      if (storyAsset.metadata) {
        try {
          const metadata = typeof storyAsset.metadata === 'string' 
            ? JSON.parse(storyAsset.metadata) 
            : storyAsset.metadata;
          
          if (metadata?.content) {
            setStoryText(metadata.content);
            return;
          }
        } catch (e) {
          // If metadata parsing fails, continue to IPFS fetch
        }
      }

      // If not in metadata, try to fetch from IPFS
      if (storyAsset.cid) {
        // Try multiple IPFS gateways
        const gateways = [
          `https://w3s.link/ipfs/${storyAsset.cid}`,
          `https://ipfs.io/ipfs/${storyAsset.cid}`,
          `https://gateway.pinata.cloud/ipfs/${storyAsset.cid}`,
          `https://${storyAsset.cid}.ipfs.w3s.link/`,
        ];

        let storyLoaded = false;
        
        for (const gatewayUrl of gateways) {
          try {
            const response = await fetch(gatewayUrl, {
              method: 'GET',
              headers: {
                'Accept': 'text/plain, text/*, */*',
              },
            });
            
            if (response.ok) {
              const text = await response.text();
              if (text && text.trim().length > 0) {
                setStoryText(text);
                storyLoaded = true;
                break;
              }
            }
          } catch (error) {
            // Try next gateway
            continue;
          }
        }

        if (!storyLoaded) {
          // If we can't fetch from IPFS, set to null to show CID instead
          setStoryText(null);
        }
      }
    } catch (error) {
      console.error('Failed to load story:', error);
      setStoryText(null);
    } finally {
      setIsLoadingStory(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    soundManager.play('success');
    alert('CID copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-2xl text-gray-400">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

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
              Room ID: <span className="text-[#FF6B00] font-mono">{id?.substring(0, 8)}</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                room.status === 'running'
                  ? 'bg-green-500/20 text-green-400'
                  : room.status === 'done'
                  ? 'bg-blue-500/20 text-blue-400'
                  : room.status === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  room.status === 'running' ? 'animate-pulse bg-green-400' : ''
                }`}
              />
              {room.status}
            </div>
            <motion.button
              onClick={() => {
                soundManager.play('click');
                alert('🔊 Sounds enabled! You should hear sounds on events now.');
              }}
              className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm hover:bg-purple-500/40 transition-all"
              whileHover={{ scale: 1.05 }}
              title="Test sound"
            >
              🔊
            </motion.button>
          </div>

          <motion.button
            onClick={() => {
              soundManager.play('click');
              navigate('/dashboard');
            }}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
            whileHover={{ scale: 1.05 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 flex flex-col">
            <div className="glass p-4 rounded-lg mb-4">
              <div className="flex flex-col gap-3">
                <div className="text-sm text-gray-400">
                  <strong>Input:</strong> {room.inputText}
                </div>
                {room.status === 'idle' && (
                  <motion.button
                    onClick={handleStartWorkflow}
                    disabled={isStarting}
                    className="bg-[#FF6B00] px-6 py-3 rounded-lg font-semibold shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:shadow-[0_0_30px_rgba(255,107,0,0.8)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    whileHover={!isStarting ? { scale: 1.05 } : {}}
                    whileTap={!isStarting ? { scale: 0.95 } : {}}
                  >
                    <Play className="w-5 h-5" />
                    {isStarting ? 'Starting...' : 'Start Workflow'}
                  </motion.button>
                )}
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

            <div className="glass p-4 rounded-lg h-64 overflow-y-auto scrollbar-hide">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                <Terminal className="w-4 h-4" />
                Live Logs ({logs.length})
              </div>
              <div className="space-y-2 font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    Waiting for logs... Start the workflow to see agent activity.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <motion.div
                      key={idx}
                      className={`${
                        log.level === 'error'
                          ? 'text-red-400'
                          : log.level === 'success'
                          ? 'text-green-400'
                          : log.level === 'warn'
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <span className="text-gray-600">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>{' '}
                      <span className="text-[#FF6B00]">[{log.agentType}]</span> {log.message}
                    </motion.div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

          <aside className="w-96 glass border-l border-gray-800 p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Story Section */}
              {room.assets?.some((asset: any) => asset.agentType === 'story') && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-[#FF6B00] flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Generated Story
                  </h2>
                  {isLoadingStory ? (
                    <div className="text-center text-gray-500 py-8">Loading story...</div>
                  ) : storyText ? (
                    <motion.div
                      className="p-4 bg-white/5 rounded-lg border border-[#FF6B00]/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                          {storyText}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-4 bg-white/5 rounded-lg border border-[#FF6B00]/20">
                      <p className="text-gray-400 text-sm mb-2">
                        Story has been generated and uploaded to IPFS.
                      </p>
                      {room.assets
                        .find((asset: any) => asset.agentType === 'story')
                        ?.cid && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">CID:</p>
                          <p className="font-mono text-xs text-gray-400 break-all">
                            {room.assets.find((asset: any) => asset.agentType === 'story')?.cid}
                          </p>
                          <motion.button
                            onClick={() =>
                              copyToClipboard(
                                room.assets.find((asset: any) => asset.agentType === 'story')?.cid || ''
                              )
                            }
                            className="mt-2 px-3 py-1 bg-[#FF6B00]/20 hover:bg-[#FF6B00] rounded text-xs transition-all flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Copy className="w-3 h-3" />
                            Copy CID
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold mb-4 text-[#FF6B00]">Assets</h2>
                {room.assets && room.assets.length > 0 ? (
                  <div className="space-y-4">
                    {room.assets.map((asset: any, idx: number) => (
                      <motion.div
                        key={asset.id}
                        className="p-4 bg-white/5 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-xs text-gray-400 uppercase">{asset.agentType}</div>
                            <div className="text-sm text-gray-300">{asset.fileType}</div>
                          </div>
                          <motion.button
                            onClick={() => copyToClipboard(asset.cid)}
                            className="p-2 hover:bg-[#FF6B00] rounded-lg transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                        </div>
                        {asset.agentType === 'asset' && asset.fileType === 'image/png' && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-[#FF6B00]/20">
                            <div style={{
                              width: '100%',
                              height: '200px',
                              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 25%, #2a0a0a 50%, #1a0a1a 75%, #0a0a0a 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                position: 'absolute',
                                top: '20%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '64px',
                                animation: 'float 3s ease-in-out infinite'
                              }}>👻</div>
                              <div style={{
                                position: 'absolute',
                                bottom: '20%',
                                left: '20%',
                                fontSize: '32px',
                                opacity: 0.7
                              }}>🏚️</div>
                              <div style={{
                                position: 'absolute',
                                bottom: '20%',
                                right: '20%',
                                fontSize: '32px',
                                opacity: 0.7
                              }}>🕯️</div>
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '80%',
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent, #FF6B00, transparent)',
                                opacity: 0.3
                              }}></div>
                              <style>{`
                                @keyframes float {
                                  0%, 100% { transform: translateX(-50%) translateY(0px); }
                                  50% { transform: translateX(-50%) translateY(-20px); }
                                }
                              `}</style>
                            </div>
                          </div>
                        )}
                        <div className="font-mono text-xs text-gray-500 break-all mb-2">
                          {asset.cid}
                        </div>
                        {asset.agentType === 'code' && (
                          <motion.button
                            onClick={() => {
                              try {
                                const metadata = typeof asset.metadata === 'string' 
                                  ? JSON.parse(asset.metadata) 
                                  : asset.metadata;
                                
                                if (metadata?.gameCode) {
                                  // Open game in new window with data URL
                                  const gameWindow = window.open('', '_blank');
                                  if (gameWindow) {
                                    gameWindow.document.write(metadata.gameCode);
                                    gameWindow.document.close();
                                  }
                                } else {
                                  // Fallback to demo
                                  window.open('/demo-game.html', '_blank');
                                }
                              } catch (e) {
                                console.error('Error opening game:', e);
                                window.open('/demo-game.html', '_blank');
                              }
                            }}
                            className="mt-2 px-4 py-2 bg-[#FF6B00] hover:bg-[#FF8C00] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all w-full"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-4 h-4" />
                            🎮 Play Game
                          </motion.button>
                        )}
                        {asset.agentType === 'deploy' && asset.metadata && (() => {
                          try {
                            const metadata = typeof asset.metadata === 'string' 
                              ? JSON.parse(asset.metadata) 
                              : asset.metadata;
                            if (metadata?.url) {
                              return (
                                <motion.a
                                  href={metadata.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Play className="w-4 h-4" />
                                  Play Game (Vercel)
                                </motion.a>
                              );
                            }
                          } catch (e) {
                            return null;
                          }
                          return null;
                        })()}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No assets generated yet. Start the workflow to create content.
                  </div>
                )}
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
}
