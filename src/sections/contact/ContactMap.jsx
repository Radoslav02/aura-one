import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'

const STUDIO = [44.8176, 20.4633] // Belgrade — PLACEHOLDER: replace with the real address

/** Leaflet map styled to the palette with a custom pulsing pin */
export default function ContactMap() {
  const { t } = useTranslation()
  const root = useRef(null)
  useSectionColor(root, SECTION.navy)

  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'aura-pin-wrap',
        html: `<div class="aura-pin"><span class="aura-pin__ring"></span><span class="aura-pin__ring aura-pin__ring--2"></span><span class="aura-pin__dot"></span></div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -22],
      }),
    [],
  )

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      gsap.fromTo(
        '[data-map]',
        { clipPath: reduce ? 'inset(0% round var(--radius))' : 'inset(8% 6% 8% 6% round var(--radius))', opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0% round var(--radius))', opacity: 1, duration: 1.4, ease: 'auraInOut', scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section relative overflow-hidden" aria-labelledby="map-title">
      <style>{`
        .aura-pin-wrap { background: none; border: 0; }
        .aura-pin { position: relative; width: 48px; height: 48px; }
        .aura-pin__dot { position: absolute; left: 50%; top: 50%; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 999px; background: var(--c-accent); box-shadow: 0 0 0 4px var(--dark), 0 0 24px var(--c-accent); }
        .aura-pin__ring { position: absolute; inset: 0; border-radius: 999px; border: 2px solid var(--c-primary); opacity: 0; transform: scale(0.3); animation: aura-pulse 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        .aura-pin__ring--2 { border-color: var(--c-secondary); animation-delay: 1.2s; }
        @keyframes aura-pulse { 0% { transform: scale(0.3); opacity: 0.9; } 100% { transform: scale(1.6); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .aura-pin__ring { animation: none; opacity: 0.5; transform: scale(1); } }
        .leaflet-popup-content-wrapper { background: var(--dark); color: var(--light); border-radius: 1rem; font-weight: 700; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
        .leaflet-popup-tip { background: var(--dark); }
        .leaflet-container a.leaflet-popup-close-button { color: var(--light); }
        .leaflet-control-attribution { background: rgba(14,11,22,0.7) !important; color: rgba(255,248,240,0.7) !important; font-size: 10px; }
        .leaflet-control-attribution a { color: var(--c-accent) !important; }
        .leaflet-bar a { background: var(--dark); color: var(--light); border-color: rgba(255,255,255,0.1); }
        .leaflet-bar a:hover { background: var(--c-accent); color: var(--dark); }
      `}</style>

      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="eyebrow mb-4">{t('contact.info.addressLabel')}</p>
            <SplitHeading as="h2" id="map-title" className="display display-lg">
              {t('contact.map.title')}
            </SplitHeading>
          </div>
          <p className="lead !text-base md:!text-lg md:text-right md:max-w-xs">{t('contact.info.address')}</p>
        </div>

        <div data-map className="relative h-[60vh] min-h-[22rem] overflow-hidden" style={{ borderRadius: 'var(--radius)', clipPath: 'inset(0% round var(--radius))' }} data-cursor="drag">
          <MapContainer center={STUDIO} zoom={15} scrollWheelZoom={false} className="w-full h-full" style={{ height: '100%', width: '100%' }} zoomControl>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={STUDIO} icon={icon}>
              <Popup>{t('contact.map.pin')}</Popup>
            </Marker>
          </MapContainer>
          {/* vignette so the map melts into the section */}
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 120px rgba(11,16,38,0.9)', borderRadius: 'var(--radius)' }} aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
