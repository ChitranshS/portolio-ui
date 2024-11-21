// src/lib/threadStorage.ts

class ThreadStorageService {
  private readonly STORAGE_KEY = 'user_thread_ids';

  getThreadIds(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving thread IDs:', error);
      return [];
    }
  }

  addThreadId(threadId: string): void {
    try {
      const threadIds = this.getThreadIds();
      if (!threadIds.includes(threadId)) {
        threadIds.unshift(threadId); // Add to beginning
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(threadIds));
      }
    } catch (error) {
      console.error('Error saving thread ID:', error);
    }
  }

  removeThreadId(threadId: string): void {
    try {
      const threadIds = this.getThreadIds();
      const filteredIds = threadIds.filter(id => id !== threadId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredIds));
    } catch (error) {
      console.error('Error removing thread ID:', error);
    }
  }

  clearAllThreadIds(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing thread IDs:', error);
    }
  }
}

export const threadStorage = new ThreadStorageService();
