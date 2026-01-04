import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Share2, ChevronLeft, ChevronRight, Check, Star, MapPin, CreditCard, ChevronRight as ArrowRight, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useApiProduct } from "@/hooks/useApiProducts";
import { useProductVariations } from "@/hooks/useProductVariations";
import { toast } from "sonner";

const Produto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cep, setCep] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
  const { addToCart } = useCart();
  
  const { data: product, isLoading, error } = useApiProduct(id || '');
  const { data: variations } = useProductVariations(id || '');

  // Set initial selections when variations load
  useEffect(() => {
    if (variations) {
      // Select first available color
      const availableColor = variations.colors.find(c => c.available);
      if (availableColor && !selectedColor) {
        setSelectedColor(availableColor.name);
      }
      // Select first available capacity
      const availableCapacity = variations.capacities.find(c => c.available);
      if (availableCapacity && !selectedCapacity) {
        setSelectedCapacity(availableCapacity.value);
      }
    }
  }, [variations]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Get current variation price and stock
  const getCurrentVariation = () => {
    if (!variations || !selectedColor || !selectedCapacity) return null;
    return variations.variations.find(
      v => v.color === selectedColor && v.capacity === selectedCapacity
    );
  };

  const currentVariation = getCurrentVariation();
  const currentPrice = currentVariation?.price || product?.price || 0;
  const currentStock = currentVariation?.stock ?? product?.stock ?? 0;

  // Check if a capacity is available for the selected color
  const isCapacityAvailableForColor = (capacity: string) => {
    if (!variations || !selectedColor) return false;
    return variations.variations.some(
      v => v.color === selectedColor && v.capacity === capacity && v.available
    );
  };

  // Check if a color is available for the selected capacity
  const isColorAvailableForCapacity = (color: string) => {
    if (!variations || !selectedCapacity) return true;
    return variations.variations.some(
      v => v.color === color && v.capacity === selectedCapacity && v.available
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Produto não encontrado</h1>
          <Link to="/">
            <Button>Voltar para a loja</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const installmentPrice = currentPrice / product.installments;

  const handleAddToCart = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      image: product.images[0],
      price: currentPrice,
      color: selectedColor || '',
      capacity: selectedCapacity || '',
    });
    toast.success("Produto adicionado ao carrinho!");
  };

  const handleBuyNow = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      image: product.images[0],
      price: currentPrice,
      color: selectedColor || '',
      capacity: selectedCapacity || '',
    });
    toast.success("Produto adicionado ao carrinho!");
    navigate('/carrinho');
  };

  const handleCalculateShipping = () => {
    if (cep.length < 8) {
      toast.error("Digite um CEP válido");
      return;
    }
    toast.info("Calculando frete...");
  };

  const handleUseLocation = () => {
    toast.info("Obtendo localização...");
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Header />
      
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/?category=${product.categorySlug}`} className="hover:text-primary transition-colors">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[300px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <main className="container py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          
          {/* Mobile Only - Title and SKU First */}
          <div className="lg:hidden order-1 space-y-3">
            <h1 className="text-xl font-semibold text-foreground leading-tight">
              {product.condition} {product.name} {selectedColor ? `- ${selectedColor}` : ''} - {product.conditionDescription || "Excelente - Sem marcas de uso"}
            </h1>
            <span className="text-sm text-muted-foreground block">Ref: {product.sku || product.id}</span>
          </div>

          {/* Left Column - Images */}
          <div className="space-y-2 order-2 lg:order-1">
            {/* Main Image */}
            <div className="relative aspect-square bg-background flex items-center justify-center rounded-lg overflow-hidden">
              <img
                src={product.images[currentImage]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 border border-border rounded-full flex items-center justify-center bg-background/90 hover:bg-secondary transition-colors shadow-sm"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 border border-border rounded-full flex items-center justify-center bg-background/90 hover:bg-secondary transition-colors shadow-sm"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 justify-start overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-20 h-20 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-colors ${
                      currentImage === index 
                        ? "border-primary" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <img 
                      src={image} 
                      alt="" 
                      className="w-full h-full object-contain bg-background" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info (after image on mobile) */}
          <div className="space-y-5 order-3 lg:order-2">
            {/* Title Row - Desktop Only */}
            <div className="hidden lg:flex items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold text-foreground leading-tight">
                {product.condition} {product.name} {selectedColor ? `- ${selectedColor}` : ''} - {product.conditionDescription || "Excelente - Sem marcas de uso"}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  aria-label="Adicionar aos favoritos"
                >
                  <Heart 
                    className={`w-6 h-6 ${isFavorite ? "fill-primary text-primary" : "text-primary"}`} 
                  />
                </button>
                <button 
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  aria-label="Compartilhar"
                >
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Mobile - Favorite/Share buttons */}
            <div className="lg:hidden flex items-center gap-2 justify-end -mt-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Adicionar aos favoritos"
              >
                <Heart 
                  className={`w-6 h-6 ${isFavorite ? "fill-primary text-primary" : "text-primary"}`} 
                />
              </button>
              <button 
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Compartilhar"
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* SKU and Rating - Desktop Only */}
            <div className="hidden lg:flex items-center gap-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Ref: {product.sku || product.id}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-muted-foreground text-muted-foreground" : "text-muted"}`}
                  />
                ))}
              </div>
            </div>

            {/* Condition Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md border border-blue-200">
                <Check className="w-4 h-4" />
                {product.conditionDescription || product.condition}
              </span>
            </div>

            {/* Price Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl lg:text-4xl font-bold text-foreground">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-sm text-muted-foreground">no PIX</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ou <span className="font-medium text-primary">{product.installments}x</span> de{" "}
                <span className="font-medium text-primary">{formatPrice(installmentPrice)}</span>
              </p>
            </div>

            {/* Payment Methods Link */}
            <button className="flex items-center gap-2 text-sm text-primary hover:underline w-full py-3 border-y border-border">
              <CreditCard className="w-5 h-5" />
              <span>veja todas as formas de pagamento</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            {/* Shipping Calculator */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Calcule o prazo de entrega</p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Insira seu CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="flex-1 h-11"
                  maxLength={9}
                />
                <Button 
                  onClick={handleCalculateShipping}
                  className="h-11 px-6 bg-[#1a1a2e] hover:bg-[#1a1a2e]/90 text-white"
                >
                  Calcular
                </Button>
              </div>
              <button 
                onClick={handleUseLocation}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Use minha localização</span>
              </button>
            </div>

            {/* Color Selector */}
            {variations && variations.colors.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Escolha a Cor{" "}
                  <span className="font-normal text-primary">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {variations.colors.map((color) => {
                    const isSelected = selectedColor === color.name;
                    const isAvailable = color.available && isColorAvailableForCapacity(color.name);
                    
                    return (
                      <button
                        key={color.name}
                        onClick={() => isAvailable && setSelectedColor(color.name)}
                        disabled={!isAvailable}
                        className={`w-10 h-10 rounded-md border-2 transition-all relative ${
                          isSelected 
                            ? 'border-foreground ring-1 ring-foreground' 
                            : 'border-border hover:border-muted-foreground'
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{ backgroundColor: color.code }}
                        aria-label={`Cor ${color.name}${!isAvailable ? ' - Indisponível' : ''}`}
                        title={`${color.name}${!isAvailable ? ' - Indisponível' : ''}`}
                      >
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[2px] bg-muted-foreground rotate-45 absolute" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Capacity Selector */}
            {variations && variations.capacities.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Escolha a Capacidade</p>
                <div className="flex gap-2 flex-wrap">
                  {variations.capacities.map((capacity) => {
                    const isSelected = selectedCapacity === capacity.value;
                    const isAvailable = capacity.available && isCapacityAvailableForColor(capacity.value);
                    
                    return (
                      <button
                        key={capacity.value}
                        onClick={() => isAvailable && setSelectedCapacity(capacity.value)}
                        disabled={!isAvailable}
                        className={`px-5 py-2.5 border-2 rounded-md text-sm font-medium transition-colors ${
                          isSelected 
                            ? 'border-foreground text-foreground bg-secondary' 
                            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                      >
                        {capacity.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Desktop Add to Cart Button */}
            <div className="hidden lg:flex gap-3 pt-4">
              <Button 
                onClick={handleAddToCart} 
                className="flex-1 h-14 text-base font-semibold bg-[#c8e600] hover:bg-[#b8d600] text-[#1a1a2e]"
                disabled={currentStock === 0}
              >
                {currentStock === 0 ? "Esgotado" : "Adicionar ao carrinho"}
              </Button>
              <Button 
                onClick={handleBuyNow} 
                className="flex-1 h-14 text-base font-semibold bg-[#1a1a2e] hover:bg-[#1a1a2e]/90 text-white"
                disabled={currentStock === 0}
              >
                Comprar
              </Button>
            </div>

            {/* Stock Warning */}
            {currentStock > 0 && currentStock <= 5 && (
              <p className="text-sm text-amber-600 font-medium text-center">
                Apenas {currentStock} unidades em estoque!
              </p>
            )}
          </div>
        </div>

        {/* Specifications Section */}
        {product.specs && product.specs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-6">Especificações</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {product.specs.map((spec) => (
                <div key={spec.label} className="space-y-1">
                  <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                  <dd className="font-medium">{spec.value}</dd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">Descrição do Produto</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        )}
      </main>

      {/* Fixed Bottom Bar - Mobile/Tablet */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 lg:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="container flex gap-3">
          <Button 
            onClick={handleAddToCart} 
            className="flex-1 h-12 text-sm font-semibold bg-[#c8e600] hover:bg-[#b8d600] text-[#1a1a2e]"
            disabled={currentStock === 0}
          >
            {currentStock === 0 ? "Esgotado" : "Adicionar ao carrinho"}
          </Button>
          <Button 
            onClick={handleBuyNow} 
            className="flex-1 h-12 text-sm font-semibold bg-[#1a1a2e] hover:bg-[#1a1a2e]/90 text-white"
            disabled={currentStock === 0}
          >
            Comprar
          </Button>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Produto;
