import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

// Mock products for search suggestions
const mockProducts = [
  { id: 1, name: "Capa Dupla iPhone XS Max Originais iPlace, Fortaleza, Ouro Rosa", price: 9.00, image: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=60&h=60&fit=crop" },
  { id: 2, name: "Capa iPhone XS Max Originais iPlace, Rio, Silicone Amarelo", price: 21.35, image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=60&h=60&fit=crop" },
  { id: 3, name: "iPhone 12 Pro Max 128GB Azul Pacífico", price: 2699.00, image: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=60&h=60&fit=crop" },
  { id: 4, name: "iPhone 13 Pro 256GB Grafite", price: 3499.00, image: "https://images.unsplash.com/photo-1632661674596-df8be59a8713?w=60&h=60&fit=crop" },
  { id: 5, name: "iPhone 14 Pro Max 512GB Roxo Profundo", price: 5999.00, image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=60&h=60&fit=crop" },
];

const SearchDropdown = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<typeof mockProducts>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length > 1) {
      const filtered = mockProducts.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleProductClick = (productId: number) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/produto/${productId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length > 0) {
      setIsOpen(false);
      navigate(`/busca?q=${encodeURIComponent(query)}`);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="search"
            placeholder="Busca aqui..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => query.length > 1 && setIsOpen(true)}
            className="w-full pl-4 pr-10 py-2 rounded-full border-border bg-secondary"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </form>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <span className="text-sm text-primary font-medium">Produtos sugeridos</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="w-full flex items-center gap-4 p-3 hover:bg-secondary transition-colors text-left"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-1">{product.name}</p>
                  <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
