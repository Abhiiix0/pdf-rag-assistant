"use client";

import React, { useState } from "react";
import Navbar, { type MobileTab } from "./Navbar";
import Upload from "./Upload";
import Chat from "./Chat";

export default function PDFUi() {
    const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
    return (
        <div className="flex flex-col h-screen w-full bg-white text-zinc-900 overflow-hidden font-sans">
            <Navbar mobileTab={mobileTab} setMobileTab={setMobileTab} />

            <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
                <Upload mobileTab={mobileTab} setMobileTab={setMobileTab} />
                <Chat mobileTab={mobileTab} />
            </div>
        </div>
    );
}
