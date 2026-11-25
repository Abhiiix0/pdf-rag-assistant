import { create } from "zustand";

interface PdfStore {
    docId: string | null;
    pdf: File | null;
    pdfName: string;

    setDocId: (id: string) => void;
    setPdf: (file: File | null) => void;
    setPdfName: (name: string) => void;
    resetPdf: () => void;
}

const usePdfStore = create<PdfStore>((set) => ({
    docId: null,
    pdf: null,
    pdfName: "",

    setDocId: (id) => set({ docId: id }),

    setPdf: (file) => set({ pdf: file }),

    setPdfName: (name) => set({ pdfName: name }),

    resetPdf: () =>
        set({
            docId: null,
            pdf: null,
            pdfName: "",
        }),
}));

export default usePdfStore;