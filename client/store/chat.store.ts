import { create } from "zustand";

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

const useChatStore = create<ChatStore>((set) => ({
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
}));

export default useChatStore;