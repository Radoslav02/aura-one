/**
 * The four AURA One colorways. `primary/secondary/accent` drive the CSS
 * variables of the whole site; `material/cushion/detail` drive the 3D model.
 * `accent` is always light enough to carry dark text (buttons, cursor label).
 */
export const COLORWAYS = {
  violet: {
    key: 'violet',
    hex: '#7B2FF7',
    primary: '#7B2FF7',
    secondary: '#FF5E5B',
    accent: '#C6F432',
    glow: 'rgba(123,47,247,0.55)',
    material: '#6B25E0',
    cushion: '#1A1426',
    detail: '#C6F432',
  },
  coral: {
    key: 'coral',
    hex: '#FF5E5B',
    primary: '#FF5E5B',
    secondary: '#7B2FF7',
    accent: '#FFD23F',
    glow: 'rgba(255,94,91,0.55)',
    material: '#F4544F',
    cushion: '#E7D3B5',
    detail: '#FFD23F',
  },
  lime: {
    key: 'lime',
    hex: '#C6F432',
    primary: '#C6F432',
    secondary: '#7B2FF7',
    accent: '#00B4D8',
    glow: 'rgba(198,244,50,0.5)',
    material: '#B4E52A',
    cushion: '#23242A',
    detail: '#7B2FF7',
  },
  ocean: {
    key: 'ocean',
    hex: '#00B4D8',
    primary: '#00B4D8',
    secondary: '#FF5E5B',
    accent: '#FFD23F',
    glow: 'rgba(0,180,216,0.55)',
    material: '#0AA3C4',
    cushion: '#C9CFD6',
    detail: '#FF5E5B',
  },
}

export const COLORWAY_KEYS = Object.keys(COLORWAYS)

/** Dominant colours used by sections (bg / fg / cursor) */
export const SECTION = {
  dark: { bg: '#0E0B16', fg: '#FFF8F0', cursor: '#C6F432' },
  deepViolet: { bg: '#2A0E6E', fg: '#FFF8F0', cursor: '#C6F432' },
  navy: { bg: '#0B1026', fg: '#FFF8F0', cursor: '#00B4D8' },
  light: { bg: '#FFF8F0', fg: '#0E0B16', cursor: '#7B2FF7' },
  coral: { bg: '#FF5E5B', fg: '#0E0B16', cursor: '#FFF8F0' },
  sunny: { bg: '#FFD23F', fg: '#0E0B16', cursor: '#7B2FF7' },
  violet: { bg: '#7B2FF7', fg: '#FFF8F0', cursor: '#C6F432' },
  ocean: { bg: '#00B4D8', fg: '#0E0B16', cursor: '#FFF8F0' },
  lime: { bg: '#C6F432', fg: '#0E0B16', cursor: '#7B2FF7' },
}
