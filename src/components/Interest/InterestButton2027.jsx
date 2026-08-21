import { lazy, Suspense, useState } from "react";
import MinecraftNumbers from "../MinecraftNumbers";

// Pulls in the firebase client, so keep it out of the initial bundle.
const InterestModal2027 = lazy(() => import("./InterestModal2027"));

/** Opens the FraserHacks 2027 interest form. The modal portals to document.body. */
export default function InterestButton2027({ className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`relative inline-flex items-center justify-center px-6 py-3 font-bold text-white rounded-2xl group cursor-pointer ${className}`}
      >
        {/* Blurred halo behind the button — this is the hero's primary CTA. */}
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-60 blur-md animate-pulse transition-opacity duration-300 group-hover:opacity-90" />

        <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

        <span className="absolute inset-[2px] rounded-2xl bg-gradient-to-r from-purple-950 via-pink-950 to-gray-950 transition-all duration-300 group-hover:opacity-0" />

        <div className="flex flex-col text-left">
          <div className="relative z-10 text-base md:text-lg lg:text-xl">
            Hacker Interest Form
          </div>
          <div className="relative z-10 text-[11px] md:text-xs opacity-90">
            <MinecraftNumbers>(FraserHacks 2027)</MinecraftNumbers>
          </div>
        </div>
        <span className="relative z-10 ml-2 text-lg">&gt;&gt;</span>
      </button>

      {open && (
        <Suspense fallback={null}>
          <InterestModal2027 onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
