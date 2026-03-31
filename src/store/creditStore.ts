import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CreditStore {
  credits: number;
  unlimited: boolean;
  plan: string | null;
  addCredits: (n: number) => void;
  setUnlimited: (v: boolean) => void;
  useCredit: () => boolean;
  syncFromDB: () => Promise<void>;        // 로그인 후 DB에서 동기화
  useCreditDB: () => Promise<boolean>;    // 서버사이드 차감
}

export const useCreditStore = create<CreditStore>()(
  persist(
    (set, get) => ({
      credits: 0,
      unlimited: false,
      plan: null,

      addCredits: (n) => set((s) => ({ credits: s.credits + n })),
      setUnlimited: (v) => set({ unlimited: v }),

      // 로컬 차감 (비로그인 fallback)
      useCredit: () => {
        const { credits, unlimited } = get();
        if (unlimited) return true;
        if (credits <= 0) return false;
        set({ credits: credits - 1 });
        return true;
      },

      // DB에서 크레딧 불러오기 (로그인 시 호출)
      syncFromDB: async () => {
        try {
          const res = await fetch('/api/credits');
          if (!res.ok) return;
          const data = await res.json();
          set({ credits: data.balance ?? 0, unlimited: data.unlimited ?? false, plan: data.plan ?? null });
        } catch {}
      },

      // 서버에서 크레딧 차감 (다운로드 시 호출)
      useCreditDB: async () => {
        const { unlimited } = get();
        if (unlimited) return true;

        try {
          const res = await fetch('/api/credits', { method: 'POST' });
          if (res.status === 402) return false;
          if (!res.ok) {
            // 서버 오류 시 로컬 차감으로 fallback
            return get().useCredit();
          }
          const data = await res.json();
          if (data.unlimited) {
            set({ unlimited: true });
          } else {
            set({ credits: data.balance });
          }
          return true;
        } catch {
          return get().useCredit();
        }
      },
    }),
    { name: 'bg-remover-credits' }
  )
);
