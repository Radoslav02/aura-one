import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { LenisProvider } from './context/LenisContext'
import { ThemeProvider } from './context/ThemeContext'
import { TransitionProvider } from './context/TransitionContext'
import LangLayout from './layouts/LangLayout'
import { detectLanguage, LANG_CODES } from './i18n'

// Pages are code-split; each carries its own sections & 3D scenes
const Home = lazy(() => import('./pages/Home'))
const Product = lazy(() => import('./pages/Product'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

/** Full-height placeholder while a page chunk loads, so the footer never jumps into view (CLS) */
const Fallback = () => <div style={{ minHeight: '100svh' }} aria-hidden="true" />

/** "/" or "/unknown/path" → "/{lang}/path" */
function RootRedirect() {
  const location = useLocation()
  const lang = detectLanguage()
  const path = location.pathname === '/' ? '' : location.pathname
  return <Navigate to={`/${lang}${path}${location.search}`} replace />
}

function LangGuard() {
  const { lang } = useParams()
  const location = useLocation()
  if (!LANG_CODES.includes(lang)) {
    // first segment is not a language → prepend detected language
    return <Navigate to={`/${detectLanguage()}${location.pathname}${location.search}`} replace />
  }
  return <LangLayout />
}

export default function App() {
  return (
    <LenisProvider>
      <ThemeProvider>
        <TransitionProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/:lang" element={<LangGuard />}>
              <Route index element={<Suspense fallback={<Fallback />}><Home /></Suspense>} />
              <Route path="product" element={<Suspense fallback={<Fallback />}><Product /></Suspense>} />
              <Route path="about" element={<Suspense fallback={<Fallback />}><About /></Suspense>} />
              <Route path="contact" element={<Suspense fallback={<Fallback />}><Contact /></Suspense>} />
              <Route path="*" element={<Suspense fallback={<Fallback />}><NotFound /></Suspense>} />
            </Route>
          </Routes>
        </TransitionProvider>
      </ThemeProvider>
    </LenisProvider>
  )
}
