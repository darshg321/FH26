/**
 * Photos: filenames match files in public/images/event_photos.
 *
 * Each name needs three files, since the originals are far too heavy to ship:
 *   event_photos/<name>          the original (not loaded by the site)
 *   event_photos/large/<name>    ~1920px wide, used by the lightbox
 *   event_photos/thumbs/<name>   ~900px wide, used by the grids
 *
 * Regenerate both sizes after adding photos (run from public/images/event_photos):
 *   for f in *.jpg; do ffmpeg -y -i "$f" -vf "scale='min(1920,iw)':-2" -q:v 4 "large/$f"; done
 *   for f in *.jpg; do ffmpeg -y -i "$f" -vf "scale='min(900,iw)':-2"  -q:v 4 "thumbs/$f"; done
 */
const PHOTO_DIR = "/images/event_photos";

/** encodeURI so filenames with spaces / parentheses still resolve. */
const toPhoto = (file) => ({
  file,
  src: encodeURI(`${PHOTO_DIR}/large/${file}`),
  thumb: encodeURI(`${PHOTO_DIR}/thumbs/${file}`),
});

/** The handful shown in the gallery preview on the home page. */
const FEATURED_FILES = [
  "IMG_0010.jpg",
  "IMG_0043.jpg",
  "IMG_0080.jpg",
  "IMG_0113.jpg",
  "IMG_0149.jpg",
];

/** Everything shown on /gallery. */
const ALL_FILES = [
  "IMG_9992.jpg",
  "IMG_0010.jpg",
  "IMG_0019.jpg",
  "IMG_0021.jpg",
  "IMG_0026.jpg",
  "IMG_0027.jpg",
  "IMG_0030.jpg",
  "IMG_0039.jpg",
  "IMG_0043.jpg",
  "IMG_0047.jpg",
  "IMG_0060.jpg",
  "IMG_0063.jpg",
  "IMG_0080.jpg",
  "IMG_0083.jpg",
  "IMG_0088.jpg",
  "IMG_0101.jpg",
  "IMG_0113.jpg",
  "IMG_0123.jpg",
  "IMG_0130.jpg",
  "IMG_0135.jpg",
  "IMG_0139.jpg",
  "IMG_0140.jpg",
  "IMG_0142.jpg",
  "IMG_0146.jpg",
  "IMG_0149.jpg",
  "IMG_0153.jpg",
  "IMG_20260330_175119 (1).jpg",
  "IMG_20260330_175119 (5).jpg",
  "IMG_20260330_175119 (9).jpg",
  "IMG_20260330_175120 (10).jpg",
  "IMG_20260330_175120 (11).jpg",
  "IMG_20260330_175121.jpg",
  "IMG_20260330_175121 (2).jpg",
  "IMG_20260330_175121 (3).jpg",
  "IMG_20260330_175121 (4).jpg",
  "IMG_20260330_175121 (5).jpg",
  "IMG_20260330_175121 (6).jpg",
  "IMG_20260330_175121 (8).jpg",
  "IMG_20260330_175121 (9).jpg",
  "IMG_20260330_175121 (10).jpg",
  "IMG_20260330_175121 (11).jpg",
  "IMG_20260330_175122 (4).jpg",
  "IMG_20260330_175124 (5).jpg",
  "IMG_20260330_175124 (7).jpg",
  "IMG_20260330_175129 (2).jpg",
  "IMG_20260330_175129 (4).jpg",
  "IMG_20260330_175129 (5).jpg",
  "IMG_20260330_175129 (6).jpg",
  "IMG_20260330_175129 (7).jpg",
  "IMG_20260330_175130.jpg",
  "IMG_20260330_175130 (4).jpg",
  "IMG_20260330_175130 (5).jpg",
];

export const FEATURED_PHOTOS = FEATURED_FILES.map(toPhoto);
export const GALLERY_PHOTOS = ALL_FILES.map(toPhoto);
