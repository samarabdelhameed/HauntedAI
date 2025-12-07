class SoundManager {
  private sounds: Map<string, HTMLAudioElement>;
  private enabled: boolean;

  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.initSounds();
  }

  private initSounds() {
    const soundUrls = {
      hover: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLZiTUIGGm98OeeSwkMUKjj8LZiGwU4kNbxzHkqBSl+zPLaizsKCFGn4+21YBkIMY/V8sp3JgYqfMrw2IU0CBNZPP7Xg==',
      click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLZiTUIGGm98OeeSwkMUKjj8LZiGwU4kNbxzHkqBSl+zPLaizsKCFGn4+21YBkIMY/V8sp3JgYqfMrw2IU0CBNZPP7Xg==',
      success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLZiTUIGGm98OeeSwkMUKjj8LZiGwU4kNbxzHkqBSl+zPLaizsKCFGn4+21YBkIMY/V8sp3JgYqfMrw2IU0CBNZPP7Xg==',
      error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLZiTUIGGm98OeeSwkMUKjj8LZiGwU4kNbxzHkqBSl+zPLaizsKCFGn4+21YBkIMY/V8sp3JgYqfMrw2IU0CBNZPP7Xg==',
    };

    Object.entries(soundUrls).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = 0.3;
      this.sounds.set(key, audio);
    });
  }

  play(soundName: string) {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      // Clone the audio to allow overlapping sounds
      const audioClone = sound.cloneNode() as HTMLAudioElement;
      audioClone.volume = sound.volume;
      audioClone.play().catch((error) => {
        // Silently fail - browser might block autoplay
        console.debug('Sound play blocked:', soundName);
      });
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setVolume(volume: number) {
    this.sounds.forEach((sound) => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }
}

export const soundManager = new SoundManager();
