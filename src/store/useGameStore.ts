import { create } from 'zustand';

export type Scene = 'INTRO' | 'STORY' | 'DOOR_1' | 'DOOR_2' | 'DOOR_3' | 'TREASURE' | 'REVEAL' | 'RESTARTING';

interface GameState {
  currentScene: Scene;
  doorsUnlocked: number[];
  isAudioOn: boolean;
  
  // Actions
  setScene: (scene: Scene) => void;
  unlockDoor: (doorId: number) => void;
  toggleAudio: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentScene: 'INTRO',
  doorsUnlocked: [],
  isAudioOn: true,

  setScene: (scene) => set({ currentScene: scene }),
  unlockDoor: (doorId) => set((state) => ({ 
    doorsUnlocked: state.doorsUnlocked.includes(doorId) 
      ? state.doorsUnlocked 
      : [...state.doorsUnlocked, doorId] 
  })),
  toggleAudio: () => set((state) => ({ isAudioOn: !state.isAudioOn })),
  resetGame: () => set({ 
    currentScene: 'RESTARTING', 
    doorsUnlocked: [] 
  }),
}));
