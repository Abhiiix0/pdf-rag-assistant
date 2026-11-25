import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PdfStore {
    docId: string | null;
    pdf: File | null;
    pdfName: string;
    pdfSize: number;

    setDocId: (id: string) => void;
    setPdf: (file: File | null) => void;
    setPdfName: (name: string) => void;
    resetPdf: () => void;
}

const usePdfStore = create<PdfStore>()(
    persist(
        (set) => ({
            docId: null,
            pdf: null,
            pdfName: "",
            pdfSize: 0,

            setDocId: (id) => set({ docId: id }),

            setPdf: (file) => set({ pdf: file, pdfSize: file?.size ?? 0 }),

            setPdfName: (name) => set({ pdfName: name }),

            resetPdf: () =>
                set({
                    docId: null,
                    pdf: null,
                    pdfName: "",
                    pdfSize: 0,
                }),
        }),
        {
            name: "pdf-store",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                docId: state.docId,
                pdfName: state.pdfName,
                pdfSize: state.pdfSize,
            }),
            skipHydration: true,
        }
    )
);

export default usePdfStore;
