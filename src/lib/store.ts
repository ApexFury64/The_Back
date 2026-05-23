import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { studentQuizzesData, studentAssignments, studentSubjects } from './mock-data';

export interface AppState {
  quizzes: any[];
  assignments: any[];
  subjects: any[];
  
  submitQuiz: (quizId: number, score: number) => void;
  submitAssignment: (assignmentId: number) => void;
  completeTopic: (subjectName: string, topicTitle: string) => void;
  resetProgress: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      quizzes: studentQuizzesData,
      assignments: studentAssignments,
      subjects: studentSubjects,

      submitQuiz: (quizId: number, score: number) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizId
              ? { ...q, status: 'completed', score, timeTaken: '15m' }
              : q
          ),
        }));
      },

      submitAssignment: (assignmentId: number) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId ? { ...a, status: 'submitted' } : a
          ),
        }));
      },

      completeTopic: (subjectName: string, topicTitle: string) => {
        set((state) => {
          const newSubjects = [...state.subjects];
          const subjectIndex = newSubjects.findIndex(s => s.name === subjectName);
          
          if (subjectIndex !== -1) {
            const subject = { ...newSubjects[subjectIndex] };
            let foundTopic = false;
            let unlockedNext = false;
            const newModules = subject.modules.map((mod: any) => {
              const newSubTopics = mod.subTopics.map((topic: any) => {
                if (topic.title === topicTitle) {
                  foundTopic = true;
                  return { ...topic, status: 'completed' };
                }
                if (foundTopic && !unlockedNext && topic.status === 'locked') {
                  unlockedNext = true;
                  return { ...topic, status: 'in-progress' };
                }
                return topic;
              });
              return { ...mod, subTopics: newSubTopics };
            });
            
            // If we completed the last topic in a module, we need to unlock the first topic in the next module
            if (foundTopic && !unlockedNext) {
              for (let i = 0; i < newModules.length; i++) {
                let unlockedInModule = false;
                newModules[i].subTopics = newModules[i].subTopics.map((topic: any) => {
                  if (!unlockedNext && !unlockedInModule && topic.status === 'locked') {
                    unlockedNext = true;
                    unlockedInModule = true;
                    return { ...topic, status: 'in-progress' };
                  }
                  return topic;
                });
              }
            }
            
            subject.modules = newModules;
            newSubjects[subjectIndex] = subject;
          }
          
          return { subjects: newSubjects };
        });
      },

      resetProgress: () => {
        set({
          quizzes: studentQuizzesData,
          assignments: studentAssignments,
          subjects: studentSubjects,
        });
      }
    }),
    {
      name: 'techwing-ai-tutor-storage',
    }
  )
);
