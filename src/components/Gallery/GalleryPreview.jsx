import { useState } from "react";
import GlassContainer from "../Recap/RecapComponents/RecapProjects/GlassContainer";
import MinecraftNumbers from "../MinecraftNumbers";
import { FEATURED_PHOTOS, GALLERY_PHOTOS } from "../../data/galleryPhotos";

export default function GalleryPreview() {
  const [hoveredImage, setHoveredImage] = useState(null);

  return (
    <div className="flex w-full justify-center">
      {/* Plain anchor, not a router Link: this renders inside the r3f canvas, which has no router context. */}
      <a
        href="/gallery"
        aria-label={`Open the full photo gallery (${GALLERY_PHOTOS.length} photos)`}
        className="group w-4/5 max-w-5xl no-underline"
      >
        <GlassContainer className="p-4 md:p-5 lg:p-6 text-white transition-colors duration-300 group-hover:border-white/45">
          <div className="mb-3 flex flex-row items-end justify-between gap-4 md:mb-4">
            <div className="flex flex-col">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold">
                Photo Gallery
              </div>
              <div className="hidden md:block text-sm md:text-base opacity-70 leading-5 md:leading-6">
                A look back at everything that happened on hackathon day.
              </div>
            </div>
            <div className="shrink-0 text-xs md:text-sm lg:text-base opacity-70 transition-opacity duration-300 group-hover:opacity-100">
              View all <MinecraftNumbers>{GALLERY_PHOTOS.length}</MinecraftNumbers>{" "}
              &gt;&gt;
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-3">
            {FEATURED_PHOTOS.map((photo, index) => (
              <img
                key={photo.file}
                src={photo.thumb}
                alt=""
                loading="lazy"
                className={`
                  aspect-[4/5] w-full object-cover rounded-lg
                  transition-all duration-500 ease-out
                  ${index > 2 ? "hidden md:block" : ""}
                  ${
                    hoveredImage !== null && hoveredImage !== index
                      ? "opacity-70"
                      : ""
                  }
                `}
                style={{
                  boxShadow:
                    hoveredImage === index
                      ? "0 0 14px rgba(217,70,239,0.6), 0 0 34px rgba(217,70,239,0.45), 0 0 70px rgba(168,85,247,0.35)"
                      : "0 0 20px rgba(120, 192, 255, 0.2), 0 0 40px rgba(186, 180, 255, 0.15)",
                }}
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
              />
            ))}
          </div>
        </GlassContainer>
      </a>
    </div>
  );
}
