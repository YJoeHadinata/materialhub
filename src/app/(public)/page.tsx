import { getFeaturedProducts } from "@/server/services/product.service";
import { getAllTaxonomies } from "@/server/services/taxonomy.service";
import { getCurrentUser } from "@/server/authorization";
import { HeroSection } from "@/components/home/hero-section";
import { WorkflowSection } from "@/components/home/workflow-section";
import { FeaturedSection } from "@/components/home/featured-section";
import { CategoryTaxonomySection } from "@/components/home/category-taxonomy-section";
import { CuratedCollectionsSection } from "@/components/home/curated-collections-section";
import { TradeCtaSection } from "@/components/home/trade-cta-section";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, taxonomies, currentUser] = await Promise.all([
    getFeaturedProducts(6),
    getAllTaxonomies(),
    getCurrentUser(),
  ]);

  const heroSwatches = featuredProducts.slice(0, 4);

  return (
    <div>
      <HeroSection
        heroSwatches={heroSwatches}
        materialTypesCount={taxonomies.materialTypes.length}
        finishesCount={taxonomies.finishes.length}
        currentUser={currentUser}
      />

      <WorkflowSection />

      <FeaturedSection
        products={featuredProducts}
        currentUser={currentUser}
      />

      <CategoryTaxonomySection
        materialTypes={taxonomies.materialTypes}
      />

      <CuratedCollectionsSection />

      <TradeCtaSection />
    </div>
  );
}
