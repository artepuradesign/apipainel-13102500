import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Star, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useApiProducts } from "@/hooks/useApiProducts";

const FilterContent = () => (
  <div className="space-y-6">
    <div>
      <h4 className="font-medium mb-3 text-sm">Condição</h4>
      <div className="space-y-2">
        {["Excelente", "Muito Boa", "Boa"].map((cond) => (
          <label key={cond} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            <span className="text-muted-foreground">{cond}</span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <h4 className="font-medium mb-3 text-sm">Preço</h4>
      <div className="space-y-2">
        {["Até R$ 1.500", "R$ 1.500 - R$ 3.000", "R$ 3.000 - R$ 5.000", "Acima de R$ 5.000"].map((range) => (
          <label key={range} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            <span className="text-muted-foreground">{range}</span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <h4 className="font-medium mb-3 text-sm">Capacidade</h4>
      <div className="space-y-2">
        {["64GB", "128GB", "256GB", "512GB", "1TB"].map((cap) => (
          <label key={cap} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            <span className="text-muted-foreground">{cap}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

const Busca = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const categoria = searchParams.get("categoria") || "";
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { products, isLoading, error } = useApiProducts();

  // Filtrar produtos baseado na busca ou categoria
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product) => {
      // Filtro por categoria (usando slug)
      if (categoria) {
        const categoryMatch = 
          product.categorySlug?.toLowerCase() === categoria.toLowerCase() ||
          product.category?.toLowerCase() === categoria.toLowerCase();
        if (!categoryMatch) return false;
      }
      
      // Filtro por termo de busca
      if (query) {
        const searchLower = query.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const descMatch = product.description?.toLowerCase().includes(searchLower);
        const categoryNameMatch = product.category?.toLowerCase().includes(searchLower);
        if (!nameMatch && !descMatch && !categoryNameMatch) return false;
      }
      
      return true;
    });
  }, [products, query, categoria]);

  const searchLabel = categoria || query || "Todos os produtos";

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb - Hidden on mobile */}
      <div className="bg-secondary py-2 md:py-3 hidden sm:block">
        <div className="container">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">{categoria ? categoria : `Busca: "${query}"`}</span>
          </nav>
        </div>
      </div>

      <main className="container py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold mb-4">Filtros</h3>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold truncate">{searchLabel}</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {isLoading ? "Carregando..." : `${filteredProducts.length} produtos`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px]">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                    <div className="mt-6 pt-4 border-t border-border">
                      <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                        Aplicar Filtros
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <select className="px-2 md:px-4 py-2 border border-border rounded-lg bg-background text-xs md:text-sm">
                  <option>Relevância</option>
                  <option>Menor preço</option>
                  <option>Maior preço</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <p className="text-destructive">Erro ao carregar produtos</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhum produto encontrado para "{searchLabel}"</p>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/produto/${product.slug || product.id}`}
                    className="bg-card rounded-lg p-3 md:p-4 border border-border hover:shadow-lg transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative aspect-square rounded-lg mb-2 md:mb-4 overflow-hidden bg-secondary">
                      <img
                        src={product.images?.[0] || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                      {product.discountPercent > 0 && (
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-primary text-primary-foreground text-[10px] md:text-xs font-medium rounded">
                          -{product.discountPercent}%
                        </span>
                      )}
                      <span className="text-[10px] md:text-xs text-muted-foreground truncate">
                        {product.condition}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xs md:text-sm font-medium text-foreground line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] mb-1 md:mb-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-0.5 mb-1 md:mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 md:w-3 md:h-3 ${i < (product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                        />
                      ))}
                    </div>

                    {/* Price */}
                    <div className="space-y-0.5">
                      {product.originalPrice > product.price && (
                        <p className="text-muted-foreground line-through text-[10px] md:text-sm">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                      <p className="text-base md:text-xl font-bold text-foreground">
                        {formatPrice(product.price)}
                      </p>
                      {product.installments > 1 && (
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {product.installments}x de {formatPrice(product.price / product.installments)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Busca;
