import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ChatRole = "user" | "assistant";

export interface ChatMessageData {
    id: string;
    role: ChatRole;
    content: string;
    time?: string;
    sources?: number[];
}

interface ChatStore {
    messages: ChatMessageData[];
    isLoading: boolean;
    error: string | null;

    addMessage: (message: ChatMessageData) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetChat: () => void;
}

const useChatStore = create<ChatStore>()(
    persist(
        (set) => ({
            messages: [],
            isLoading: false,
            error: null,

            addMessage: (message) =>
                set((state) => ({
                    messages: [...state.messages, message],
                })),

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error }),

            resetChat: () =>
                set({
                    messages: [],
                    isLoading: false,
                    error: null,
                }),
        }),
        {
            name: "chat-store",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({ messages: state.messages }),
            skipHydration: true,
        }
    )
);

export default useChatStore;
