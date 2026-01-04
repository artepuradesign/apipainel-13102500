import { useState } from "react";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import FilterChips from "@/components/FilterChips";
import ProductGrid from "@/components/ProductGrid";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      
      <main className="container py-4 md:py-8">
        {/* Filter Chips - Horizontal scroll on mobile */}
        <div className="mb-4 md:mb-6">
          <FilterChips 
            selectedCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory} 
          />
        </div>
        
        <ProductGrid categoryFilter={selectedCategory} />
      </main>

      <FAQ />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
