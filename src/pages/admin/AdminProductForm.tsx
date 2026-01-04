import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Package, LogOut, Plus, Trash2, Loader2, ImagePlus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  fetchAdminProduct,
  fetchAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  AdminProduct,
  AdminCategory,
} from "@/services/adminApi";

interface ImageInput {
  id?: number;
  url: string;
  ordem: number;
  principal: boolean;
}

interface SpecInput {
  id?: number;
  label: string;
  valor: string;
}

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'novo';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  
  const [formData, setFormData] = useState({
    nome: "",
    sku: "",
    categoria_id: "",
    condicao: "",
    condicao_descricao: "",
    preco: "",
    preco_original: "",
    estoque: "",
    garantia_meses: "12",
    descricao: "",
    descricao_curta: "",
    destaque: false,
    ativo: true,
  });

  const [images, setImages] = useState<ImageInput[]>([
    { url: "", ordem: 0, principal: true }
  ]);

  const [specs, setSpecs] = useState<SpecInput[]>([]);

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchAdminCategories();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Fallback para categorias fixas se API falhar
        setCategories([
          { id: 1, nome: 'iPhone', slug: 'iphone', descricao: '', imagem: '', ordem: 1, ativo: true },
          { id: 2, nome: 'iPad', slug: 'ipad', descricao: '', imagem: '', ordem: 2, ativo: true },
          { id: 3, nome: 'Apple Watch', slug: 'apple-watch', descricao: '', imagem: '', ordem: 3, ativo: true },
          { id: 4, nome: 'Mac', slug: 'mac', descricao: '', imagem: '', ordem: 4, ativo: true },
          { id: 5, nome: 'Acessórios', slug: 'acessorios', descricao: '', imagem: '', ordem: 5, ativo: true },
        ]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (isEditing) {
      loadProduct();
    }
  }, [navigate, isEditing, id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await fetchAdminProduct(Number(id));

      setFormData({
        nome: product.nome || "",
        sku: product.sku || "",
        categoria_id: String(product.categoria_id || ""),
        condicao: product.condicao || "",
        condicao_descricao: product.condicao_descricao || "",
        preco: String(product.preco || ""),
        preco_original: String(product.preco_original || ""),
        estoque: String(product.estoque || ""),
        garantia_meses: String(product.garantia_meses || "12"),
        descricao: product.descricao || "",
        descricao_curta: product.descricao_curta || "",
        destaque: product.destaque || false,
        ativo: product.ativo !== false,
      });

      if (product.imagens && product.imagens.length > 0) {
        setImages(product.imagens);
      }

      if (product.especificacoes && product.especificacoes.length > 0) {
        setSpecs(product.especificacoes);
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar produto');
      navigate('/admin/produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Gerenciamento de imagens
  const addImage = () => {
    setImages([...images, { url: "", ordem: images.length, principal: false }]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Se removeu a principal, definir a primeira como principal
    if (images[index].principal && newImages.length > 0) {
      newImages[0].principal = true;
    }
    setImages(newImages);
  };

  const updateImage = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index].url = url;
    setImages(newImages);
  };

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      principal: i === index,
    }));
    setImages(newImages);
  };

  // Gerenciamento de especificações
  const addSpec = () => {
    setSpecs([...specs, { label: "", valor: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'label' | 'valor', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome || !formData.categoria_id || !formData.preco) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Filtrar imagens vazias
    const validImages = images.filter(img => img.url.trim());
    if (validImages.length === 0) {
      toast.error("Adicione pelo menos uma imagem");
      return;
    }

    // Filtrar specs vazias
    const validSpecs = specs.filter(s => s.label.trim() && s.valor.trim());

    try {
      setSaving(true);

      const productData = {
        nome: formData.nome,
        sku: formData.sku,
        categoria_id: Number(formData.categoria_id),
        condicao: formData.condicao,
        condicao_descricao: formData.condicao_descricao,
        preco: Number(formData.preco),
        preco_original: Number(formData.preco_original) || Number(formData.preco),
        estoque: Number(formData.estoque) || 0,
        garantia_meses: Number(formData.garantia_meses) || 12,
        descricao: formData.descricao,
        descricao_curta: formData.descricao_curta,
        destaque: formData.destaque,
        ativo: formData.ativo,
        imagens: validImages.map((img) => img.url),
        especificacoes: validSpecs,
      };

      if (isEditing) {
        await updateAdminProduct(Number(id), productData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await createAdminProduct(productData);
        toast.success("Produto cadastrado com sucesso!");
      }
      
      navigate("/admin/produtos");
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error(isEditing ? "Erro ao atualizar produto" : "Erro ao cadastrar produto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-primary">
              iPlace<span className="text-foreground">seminovos</span>
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">
              {isEditing ? "Editar Produto" : "Novo Produto"}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/produtos">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {isEditing ? "Editar Produto" : "Cadastrar Novo Produto"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    placeholder="Ex: iPhone 14 Pro Max 256GB"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    placeholder="Ex: IPH14PM-256-AZL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria_id">Categoria *</Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={(value) => handleChange("categoria_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condicao">Condição *</Label>
                  <Select
                    value={formData.condicao}
                    onValueChange={(value) => handleChange("condicao", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excelente">Excelente</SelectItem>
                      <SelectItem value="Muito Bom">Muito Bom</SelectItem>
                      <SelectItem value="Bom">Bom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condicao_descricao">Descrição da Condição</Label>
                  <Input
                    id="condicao_descricao"
                    value={formData.condicao_descricao}
                    onChange={(e) => handleChange("condicao_descricao", e.target.value)}
                    placeholder="Ex: Bateria acima de 90%"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco">Preço de Venda (R$) *</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => handleChange("preco", e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_original">Preço Original (R$)</Label>
                  <Input
                    id="preco_original"
                    type="number"
                    step="0.01"
                    value={formData.preco_original}
                    onChange={(e) => handleChange("preco_original", e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoque">Estoque *</Label>
                  <Input
                    id="estoque"
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => handleChange("estoque", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="garantia_meses">Garantia (meses)</Label>
                  <Input
                    id="garantia_meses"
                    type="number"
                    value={formData.garantia_meses}
                    onChange={(e) => handleChange("garantia_meses", e.target.value)}
                    placeholder="12"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao_curta">Descrição Curta</Label>
                  <Input
                    id="descricao_curta"
                    value={formData.descricao_curta}
                    onChange={(e) => handleChange("descricao_curta", e.target.value)}
                    placeholder="Breve descrição do produto"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição Completa</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    placeholder="Descreva o produto, estado de conservação, acessórios inclusos..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-6 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="destaque"
                      checked={formData.destaque}
                      onCheckedChange={(checked) => handleChange("destaque", checked)}
                    />
                    <Label htmlFor="destaque">Produto em destaque</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => handleChange("ativo", checked)}
                    />
                    <Label htmlFor="ativo">Produto ativo</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="w-5 h-5" />
                Imagens
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addImage}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Imagem
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {images.map((image, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-move" />
                  
                  {image.url && (
                    <img 
                      src={image.url} 
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <Input
                      value={image.url}
                      onChange={(e) => updateImage(index, e.target.value)}
                      placeholder="Cole a URL da imagem"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mainImage"
                        checked={image.principal}
                        onChange={() => setMainImage(index)}
                        id={`main-${index}`}
                      />
                      <Label htmlFor={`main-${index}`} className="text-sm text-muted-foreground">
                        Imagem principal
                      </Label>
                    </div>
                  </div>
                  
                  {images.length > 1 && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <p className="text-sm text-muted-foreground">
                Cole URLs de imagens do produto. A imagem marcada como principal aparecerá na listagem.
              </p>
            </CardContent>
          </Card>

          {/* Especificações */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Especificações</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addSpec}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Especificação
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {specs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma especificação adicionada. Clique em "Adicionar Especificação" para incluir.
                </p>
              ) : (
                specs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      value={spec.label}
                      onChange={(e) => updateSpec(index, 'label', e.target.value)}
                      placeholder="Ex: Cor"
                      className="flex-1"
                    />
                    <Input
                      value={spec.valor}
                      onChange={(e) => updateSpec(index, 'valor', e.target.value)}
                      placeholder="Ex: Azul Pacífico"
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeSpec(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Salvar Alterações" : "Cadastrar Produto"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/produtos">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
