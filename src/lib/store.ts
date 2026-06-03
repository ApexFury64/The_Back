import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppState {
  userEmail: string;
  userName: string;
  userRole: string;
  schoolId: string;
  schoolName: string;
  userStandard: string;
  refreshKey: number;

  setUser: (data: { email: string; name: string; role: string; schoolId?: string; schoolName?: string; userStandard?: string }) => void;
  triggerRefresh: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userEmail: '',
      userName: '',
      userRole: '',
      schoolId: '',
      schoolName: '',
      userStandard: '8',
      refreshKey: 0,

      setUser: (data) => {
        set({
          userEmail: data.email,
          userName: data.name,
          userRole: data.role,
          schoolId: data.schoolId || '',
          schoolName: data.schoolName || '',
          userStandard: data.userStandard || '8',
        });
      },

      triggerRefresh: () => {
        set((state) => ({ refreshKey: state.refreshKey + 1 }));
      },

      logout: () => {
        set({ userEmail: '', userName: '', userRole: '', schoolId: '', schoolName: '', refreshKey: 0 });
      },
    }),
    {
      name: 'AI Tutor-ai-tutor-storage',
    }
  )
);

