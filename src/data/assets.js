/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PLACEHOLDER ASSETS — swap these for real brand assets.           ║
 * ║  Images:  Unsplash (free licence)  → put yours in /public/images  ║
 * ║  Videos:  Pexels  (free licence)   → put yours in /public/videos  ║
 * ║  Model:   procedural Three.js build → drop a GLB in /public/models║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

/** Unsplash helper: returns a responsive, auto-format (WebP/AVIF) URL */
export const unsplash = (id, w = 1200, q = 75) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`

/** srcset builder for <img srcset> */
export const srcset = (id, widths = [480, 768, 1200, 1800]) =>
  widths.map((w) => `${unsplash(id, w)} ${w}w`).join(', ')

export const VIDEOS = {
  // Aerial city intersection (Pexels #3121459) — Home › Noise cancellation scene
  city: {
    src: 'https://videos.pexels.com/video-files/3121459/3121459-hd_1280_720_24fps.mp4',
    poster: unsplash('1477959858617-67f85cf4f1df', 1600),
  },
  // Ocean waves aerial (Pexels #1409899) — Home › Product film placeholder
  film: {
    src: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1280_720_25fps.mp4',
    poster: unsplash('1449824913935-59a10b8d2000', 1600),
  },
}

export const IMAGES = {
  // Home › lifestyle gallery (8)
  gallery: [
    { id: '1516280440614-37939bbacd81', ratio: '3 / 4', speed: 1.0 },
    { id: '1520170350707-b2da59970118', ratio: '4 / 5', speed: 1.4 },
    { id: '1571019613454-1cb2f99b2d8b', ratio: '3 / 4', speed: 0.8 },
    { id: '1436491865332-7a61a109cc05', ratio: '4 / 5', speed: 1.2 },
    { id: '1511379938547-c1f69419868d', ratio: '3 / 4', speed: 1.5 },
    { id: '1470225620780-dba8ba36b745', ratio: '4 / 5', speed: 0.9 },
    { id: '1505740420928-5e560c06d30e', ratio: '1 / 1', speed: 1.3 },
    { id: '1545127398-14699f92334b', ratio: '4 / 5', speed: 1.1 },
  ],
  // Product page
  product: {
    hero: '1583394838336-acd977736f90',
    detail: '1546435770-a3e426bf472b',
    wide: '1484704849700-f032a568e944',
  },
  // About › timeline (5)
  timeline: [
    '1470229722913-7c0e2dbbafd3',
    '1581092160562-40aa08e78837',
    '1518770660439-4636190af475',
    '1529333166437-7750a6dd5a70',
    '1546435770-a3e426bf472b',
  ],
  // About › team portraits (6)
  team: [
    '1494790108377-be9c29b29330',
    '1507003211169-0a1dd7228f2d',
    '1438761681033-6461ffad8d80',
    '1500648767791-00dcc994a43e',
    '1534528741775-53994a69daeb',
    '1472099645785-5658abf4ff4e',
  ],
  // About › studio gallery (6)
  studio: [
    '1497366216548-37526070297c',
    '1497215728101-856f4ea42174',
    '1524758631624-e2822e304c36',
    '1527443224154-c4a3942d3acf',
    '1519389950473-47ba0277781c',
    '1486406146926-c627a92ad1ab',
  ],
  // Home › testimonials avatars (6)
  avatars: [
    '1494790108377-be9c29b29330',
    '1500648767791-00dcc994a43e',
    '1438761681033-6461ffad8d80',
    '1507003211169-0a1dd7228f2d',
    '1573164713988-8665fc963095',
    '1472099645785-5658abf4ff4e',
  ],
  og: unsplash('1505740420928-5e560c06d30e', 1200),
}

/**
 * 3D model. The site ships with a procedural headphone built from Three.js
 * primitives (see /src/scenes/HeadphoneModel.jsx). To use a real model, export
 * a Draco-compressed GLB to /public/models/aura-one.glb with these node names:
 * Headband, CupL, CupR, CushionL, CushionR, DriverL, DriverR, Chip — then set
 * USE_GLB to true.
 */
export const MODEL = {
  USE_GLB: false,
  url: '/models/aura-one.glb',
}
