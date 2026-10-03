import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_INPUT, type HouseInput, type PredictionResult } from "@/lib/model";
import { hashPassword, uid } from "@/lib/utils";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type SavedPrediction = {
  id: string;
  createdAt: string;
  userId: string;
  input: HouseInput;
  price: number;
  ppsf: number;
  confidence: number;
  source: "user" | "sample";
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type Theme = "light" | "dark";

type SessionState = {
  theme: Theme;
  bannerDismissed: boolean;
  users: User[];
  sessionUserId: string | null;
  predictions: SavedPrediction[];
  lastResult: SavedPrediction | null;
  messages: ContactMessage[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  dismissBanner: () => void;
  register: (input: { name: string; email: string; password: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (input: { email: string; password: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  savePrediction: (input: HouseInput, result: PredictionResult) => SavedPrediction;
  deletePrediction: (id: string) => void;
  addMessage: (input: { name: string; email: string; message: string }) => void;
};

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const SAMPLE_PREDICTIONS: SavedPrediction[] = [
  seed("Pune", 1000, 2, 2, 1, "Yes", "Apartment", 5, "Semi-Furnished", 5_200_000),
  seed("Mumbai", 1200, 3, 2, 1, "Yes", "Apartment", 4, "Furnished", 8_500_000),
  seed("Nagpur", 800, 2, 2, 1, "No", "Apartment", 8, "Semi-Furnished", 3_600_000),
  seed("Pune", 1500, 3, 3, 2, "Yes", "Independent House", 3, "Furnished", 10_500_000),
  seed("Thane", 1100, 2, 2, 1, "Yes", "Apartment", 6, "Semi-Furnished", 7_200_000),
  seed("Bangalore", 950, 2, 2, 1, "Yes", "Apartment", 7, "Unfurnished", 5_800_000),
  seed("Delhi NCR", 1400, 3, 3, 2, "Yes", "Villa", 2, "Furnished", 12_000_000),
  seed("Chennai", 720, 2, 1, 1, "No", "Apartment", 12, "Semi-Furnished", 3_200_000),
  seed("Hyderabad", 880, 2, 2, 1, "Yes", "Apartment", 5, "Furnished", 4_400_000),
  seed("Kolkata", 650, 1, 1, 1, "No", "Studio", 15, "Unfurnished", 2_500_000),
  seed("Ahmedabad", 1100, 3, 2, 1, "Yes", "Independent House", 9, "Semi-Furnished", 4_800_000),
  seed("Mumbai", 780, 2, 2, 1, "No", "Apartment", 18, "Unfurnished", 6_100_000),
];

function seed(
  city: HouseInput["city"],
  area: number,
  bedrooms: number,
  bathrooms: number,
  floors: number,
  parking: HouseInput["parking"],
  propertyType: HouseInput["propertyType"],
  age: number,
  furnished: HouseInput["furnished"],
  price: number,
): SavedPrediction {
  return {
    id: `sample_${city}_${area}_${price}`,
    createdAt: "2026-09-12T10:00:00.000Z",
    userId: "sample",
    input: { city, area, bedrooms, bathrooms, floors, parking, propertyType, age, furnished },
    price,
    ppsf: Math.round(price / area),
    confidence: 86,
    source: "sample",
  };
}

export const useAppStore = create<SessionState>()(
  persist(
    (set, get) => ({
      theme: "light",
      bannerDismissed: false,
      users: [],
      sessionUserId: null,
      predictions: SAMPLE_PREDICTIONS,
      lastResult: null,
      messages: [],
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const theme = get().theme === "dark" ? "light" : "dark";
        applyTheme(theme);
        set({ theme });
      },
      dismissBanner: () => set({ bannerDismissed: true }),
      register: async ({ name, email, password }) => {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        if (trimmedName.length < 2) return { ok: false, error: "Please enter your full name." };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          return { ok: false, error: "Enter a valid email address." };
        }
        if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
        if (get().users.some((u) => u.email === trimmedEmail)) {
          return { ok: false, error: "An account with this email already exists. Try logging in." };
        }
        const user: User = {
          id: uid("user"),
          name: trimmedName,
          email: trimmedEmail,
          passwordHash: await hashPassword(password),
        };
        set({ users: [...get().users, user], sessionUserId: user.id });
        return { ok: true };
      },
      login: async ({ email, password }) => {
        const trimmedEmail = email.trim().toLowerCase();
        const user = get().users.find((u) => u.email === trimmedEmail);
        if (!user) return { ok: false, error: "No account found for that email." };
        const hash = await hashPassword(password);
        if (hash !== user.passwordHash) return { ok: false, error: "Incorrect password. Please try again." };
        set({ sessionUserId: user.id });
        return { ok: true };
      },
      logout: () => set({ sessionUserId: null }),
      savePrediction: (input, result) => {
        const userId = get().sessionUserId ?? "guest";
        const saved: SavedPrediction = {
          id: uid("pred"),
          createdAt: new Date().toISOString(),
          userId,
          input,
          price: result.price,
          ppsf: result.ppsf,
          confidence: result.confidence,
          source: "user",
        };
        set({
          lastResult: saved,
          predictions: [saved, ...get().predictions].slice(0, 80),
        });
        return saved;
      },
      deletePrediction: (id) => {
        set({
          predictions: get().predictions.filter((p) => p.id !== id),
          lastResult: get().lastResult?.id === id ? null : get().lastResult,
        });
      },
      addMessage: (input) => {
        const msg: ContactMessage = {
          id: uid("msg"),
          createdAt: new Date().toISOString(),
          name: input.name.trim(),
          email: input.email.trim(),
          message: input.message.trim(),
        };
        set({ messages: [msg, ...get().messages].slice(0, 30) });
      },
    }),
    {
      name: "hpp-store-v1",
      partialize: (state) => ({
        theme: state.theme,
        bannerDismissed: state.bannerDismissed,
        users: state.users,
        sessionUserId: state.sessionUserId,
        predictions: state.predictions,
        lastResult: state.lastResult,
        messages: state.messages,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
        if (state && state.predictions.length === 0) {
          state.predictions = SAMPLE_PREDICTIONS;
        }
      },
    },
  ),
);

export function useSessionUser() {
  return useAppStore((s) => s.users.find((u) => u.id === s.sessionUserId) ?? null);
}

export const emptyHouseForm = DEFAULT_INPUT;
