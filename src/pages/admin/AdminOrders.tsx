import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  Eye,
  ArrowLeft,
  LogOut,
  Package,
  User,
  CreditCard,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  address: string;
  createdAt: string;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "001",
      customer: "João Silva",
      email: "joao@email.com",
      phone: "(11) 99999-9999",
      products: [{ name: "iPhone 14 Pro Max 256GB", quantity: 1, price: 6499 }],
      total: 6499,
      status: "paid",
      paymentMethod: "PIX",
      address: "Rua das Flores, 123 - São Paulo, SP",
      createdAt: "2024-01-15T10:30:00",
    },
    {
      id: "002",
      customer: "Maria Santos",
      email: "maria@email.com",
      phone: "(21) 88888-8888",
      products: [
        { name: "MacBook Air M2 256GB", quantity: 1, price: 8999 },
        { name: "Magic Mouse", quantity: 1, price: 499 },
      ],
      total: 9498,
      status: "pending",
      paymentMethod: "Cartão de Crédito",
      address: "Av. Brasil, 456 - Rio de Janeiro, RJ",
      createdAt: "2024-01-15T14:20:00",
    },
    {
      id: "003",
      customer: "Pedro Costa",
      email: "pedro@email.com",
      phone: "(31) 77777-7777",
      products: [{ name: "iPad Pro 11 256GB", quantity: 1, price: 5499 }],
      total: 5499,
      status: "shipped",
      paymentMethod: "PIX",
      address: "Rua Minas Gerais, 789 - Belo Horizonte, MG",
      createdAt: "2024-01-14T16:45:00",
    },
    {
      id: "004",
      customer: "Ana Oliveira",
      email: "ana@email.com",
      phone: "(41) 66666-6666",
      products: [{ name: "Apple Watch Series 9", quantity: 1, price: 3299 }],
      total: 3299,
      status: "delivered",
      paymentMethod: "Cartão de Crédito",
      address: "Rua Paraná, 321 - Curitiba, PR",
      createdAt: "2024-01-13T09:15:00",
    },
    {
      id: "005",
      customer: "Carlos Mendes",
      email: "carlos@email.com",
      phone: "(51) 55555-5555",
      products: [{ name: "AirPods Pro 2", quantity: 2, price: 1599 }],
      total: 3198,
      status: "cancelled",
      paymentMethod: "PIX",
      address: "Av. Rio Grande, 654 - Porto Alegre, RS",
      createdAt: "2024-01-12T11:00:00",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast.success("Status atualizado com sucesso!");
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary" as const },
      paid: { label: "Pago", variant: "default" as const },
      shipped: { label: "Enviado", variant: "outline" as const },
      delivered: { label: "Entregue", variant: "default" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    };
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <span className="text-sm text-muted-foreground">Pedidos</span>
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
            <Link to="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Pedidos ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou número do pedido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="paid">Pago</SelectItem>
                              <SelectItem value="shipped">Enviado</SelectItem>
                              <SelectItem value="delivered">Entregue</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Pedido #{order.id}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="font-medium">{order.customer}</p>
                                    <p className="text-sm text-muted-foreground">{order.email}</p>
                                    <p className="text-sm text-muted-foreground">{order.phone}</p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                  <p className="text-sm">{order.address}</p>
                                </div>

                                <div className="flex items-start gap-3">
                                  <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                                  <p className="text-sm">{order.paymentMethod}</p>
                                </div>

                                <div className="flex items-start gap-3">
                                  <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-medium mb-2">Produtos</p>
                                    {order.products.map((product, index) => (
                                      <div key={index} className="flex justify-between text-sm py-1">
                                        <span>{product.name} x{product.quantity}</span>
                                        <span>{formatPrice(product.price)}</span>
                                      </div>
                                    ))}
                                    <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                                      <span>Total</span>
                                      <span>{formatPrice(order.total)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum pedido encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOrders;
