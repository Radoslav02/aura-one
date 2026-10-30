import Page from '../components/Page'
import { SECTION } from '../data/colorways'
import ProductHero from '../sections/product/ProductHero'
import DriverDiagram from '../sections/product/DriverDiagram'
import SpecsGrid from '../sections/product/SpecsGrid'
import ColorwayTable from '../sections/product/ColorwayTable'
import ProductFAQ from '../sections/product/ProductFAQ'
import CTA from '../sections/home/CTA'

export default function Product() {
  return (
    <Page seo="product" color={SECTION.dark}>
      <ProductHero />
      <DriverDiagram />
      <SpecsGrid />
      <ColorwayTable />
      <ProductFAQ />
      <CTA />
    </Page>
  )
}
