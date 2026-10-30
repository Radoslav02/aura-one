/**
 * Central GSAP setup. Import `gsap` from here everywhere so plugins are
 * registered exactly once and custom eases are available globally.
 * (As of GSAP 3.13 every plugin, incl. SplitText/Flip/DrawSVG, is free.)
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { Observer } from 'gsap/Observer'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  Flip,
  CustomEase,
  DrawSVGPlugin,
  Draggable,
  InertiaPlugin,
  ScrambleTextPlugin,
  Observer,
  useGSAP,
)

/* ---- Custom eases (tweak here to change the whole site's "feel") ---- */
CustomEase.create('aura', 'M0,0 C0.16,1 0.3,1 1,1') // snappy expo-out
CustomEase.create('auraInOut', 'M0,0 C0.76,0 0.24,1 1,1') // cinematic in-out
CustomEase.create('auraBack', 'M0,0 C0.34,1.56 0.64,1 1,1') // slight overshoot

export const EASE = {
  out: 'aura',
  inOut: 'auraInOut',
  back: 'auraBack',
  elastic: 'elastic.out(1, 0.55)',
}

gsap.defaults({ ease: EASE.out, duration: 1 })

// Lenis handles scrolling; keep ScrollTrigger from fighting it on refresh
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, SplitText, Flip, CustomEase, DrawSVGPlugin, Draggable, InertiaPlugin, ScrambleTextPlugin, Observer, useGSAP }
