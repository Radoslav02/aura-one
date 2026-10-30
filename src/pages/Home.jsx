import Page from '../components/Page'
import { SECTION } from '../data/colorways'
import Hero from '../sections/home/Hero'
import ExplodedScroll from '../sections/home/ExplodedScroll'
import NoiseScene from '../sections/home/NoiseScene'
import HorizontalFeatures from '../sections/home/HorizontalFeatures'
import Configurator from '../sections/home/Configurator'
import Gallery from '../sections/home/Gallery'
import VideoShowcase from '../sections/home/VideoShowcase'
import Testimonials from '../sections/home/Testimonials'
import CTA from '../sections/home/CTA'

export default function Home() {
  return (
    <Page seo="home" color={SECTION.dark}>
      <Hero />
      <ExplodedScroll />
      <NoiseScene />
      <HorizontalFeatures />
      <Configurator />
      <Gallery />
      <VideoShowcase />
      <Testimonials />
      <CTA />
    </Page>
  )
}
