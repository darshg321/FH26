import { useCallback, useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import MinecraftNumbers from "../../components/MinecraftNumbers";
import { GALLERY_PHOTOS } from "../../data/galleryPhotos";

function Lightbox({ index, onClose, onStep }) {
  const photo = GALLERY_PHOTOS[index];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg border border-white/30 px-3 py-1.5 text-white transition-colors hover:bg-white/10"
        aria-label="Close photo viewer"
      >
        ✕
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onStep(-1);
        }}
        className="absolute left-2 rounded-lg border border-white/30 px-3 py-2 text-xl text-white transition-colors hover:bg-white/10 md:left-6"
        aria-label="Previous photo"
      >
        &lt;
      </button>

      <img
        src={photo.src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
        style={{
          boxShadow:
            "0 0 20px rgba(120, 192, 255, 0.2), 0 0 40px rgba(186, 180, 255, 0.15), 0 0 60px rgba(219, 176, 255, 0.1)",
        }}
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onStep(1);
        }}
        className="absolute right-2 rounded-lg border border-white/30 px-3 py-2 text-xl text-white transition-colors hover:bg-white/10 md:right-6"
        aria-label="Next photo"
      >
        &gt;
      </button>

      <div className="absolute bottom-4 text-sm text-white/60">
        <MinecraftNumbers>{`${index + 1} / ${GALLERY_PHOTOS.length}`}</MinecraftNumbers>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  const step = useCallback((delta) => {
    setActiveIndex((prev) => {
      if (prev == null) return prev;
      const count = GALLERY_PHOTOS.length;
      return (prev + delta + count) % count;
    });
  }, []);

  useEffect(() => {
    if (activeIndex == null) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setActiveIndex(null);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, step]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex flex-col items-center px-4 pb-20 pt-24 md:pt-28">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 via-fuchsia-400 to-purple-400 md:text-4xl">
            Photo Gallery
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/55">
            <MinecraftNumbers>
              {`${GALLERY_PHOTOS.length} photos from FraserHacks 26, March 26, 2026.`}
            </MinecraftNumbers>
          </p>
        </div>

        <div className="grid w-full max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {GALLERY_PHOTOS.map((photo, index) => (
            <button
              key={photo.file}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Open photo ${index + 1}`}
              className="group overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/40 via-black/50 to-purple-950/30 p-1.5 shadow-[0_0_24px_-8px_rgba(217,70,239,0.35)] transition hover:border-fuchsia-400/35"
            >
              <img
                src={photo.thumb}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full rounded-xl object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </main>

      {activeIndex != null ? (
        <Lightbox
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onStep={step}
        />
      ) : null}
    </div>
  );
}
