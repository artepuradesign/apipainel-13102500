import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { QrCode, CreditCard, ShieldCheck, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import PaymentModal from "@/components/PaymentModal";

const Checkout = () => {
  const { cartItems, getTotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const subtotal = getTotal();
  const shipping = subtotal > 299 ? 0 : 29.9;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-xl md:text-2xl font-semibold mb-4">Carrinho vazio</h1>
          <Link to="/"><Button>Voltar para a loja</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 md:py-8">
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <Button variant="ghost" size="sm" asChild className="text-xs md:text-sm">
            <Link to="/carrinho"><ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />Voltar</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "pix" | "card")} className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1">
                      <QrCode className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base">PIX</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Aprovação instantânea</p>
                      </div>
                      <span className="ml-auto text-xs font-medium text-green-600 shrink-0">5% off</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-sm md:text-base">Cartão de Crédito</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Em até 12x sem juros</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <Button onClick={() => setShowPaymentModal(true)} className="w-full mt-6" size="lg">
                  Continuar para Pagamento
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs md:text-sm gap-2">
                    <span className="text-muted-foreground truncate">{item.quantity}x {item.name}</span>
                    <span className="shrink-0">{(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-green-600">{shipping === 0 ? "Grátis" : shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                {paymentMethod === "pix" && (
                  <div className="flex justify-between text-xs md:text-sm text-green-600">
                    <span>Desconto PIX (5%)</span>
                    <span>-{(total * 0.05).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base md:text-lg">
                  <span>Total</span>
                  <span>{(paymentMethod === "pix" ? total * 0.95 : total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground bg-muted p-2 md:p-3 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Compra 100% segura</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentMethod={paymentMethod}
        total={total}
        subtotal={subtotal}
        shipping={shipping}
        cartItems={cartItems}
      />
    </div>
  );
};

export default Checkout;
