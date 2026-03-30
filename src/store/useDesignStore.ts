import { create } from "zustand";

interface DesignState {
  prompt: string;
  hexColors: string[];
  uploadedLogoUrl: string | null;
  uploadedDesignUrl: string | null;
  aiPreviewUrl: string | null;
  setPrompt: (prompt: string) => void;
  addHexColor: (color: string) => void;
  removeHexColor: (color: string) => void;
  setUploadedLogoUrl: (url: string | null) => void;
  setUploadedDesignUrl: (url: string | null) => void;
  setAiPreviewUrl: (url: string | null) => void;
  resetDesign: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  prompt: "",
  hexColors: [],
  uploadedLogoUrl: null,
  uploadedDesignUrl: null,
  aiPreviewUrl: null,
  setPrompt: (prompt) => set({ prompt }),
  addHexColor: (color) =>
    set((state) => ({
      hexColors: state.hexColors.includes(color) ? state.hexColors : [...state.hexColors, color],
    })),
  removeHexColor: (color) =>
    set((state) => ({
      hexColors: state.hexColors.filter((c) => c !== color),
    })),
  setUploadedLogoUrl: (url) => set({ uploadedLogoUrl: url }),
  setUploadedDesignUrl: (url) => set({ uploadedDesignUrl: url }),
  setAiPreviewUrl: (url) => set({ aiPreviewUrl: url }),
  resetDesign: () =>
    set({
      prompt: "",
      hexColors: [],
      uploadedLogoUrl: null,
      uploadedDesignUrl: null,
      aiPreviewUrl: null,
    }),
}));
