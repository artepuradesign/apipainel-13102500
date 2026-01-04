import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  LogOut,
  Plus,
  List,
  TrendingUp,
  Clock,
  FolderTree,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser") || sessionStorage.getItem("adminUser");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (user) {
      try {
        const parsed = JSON.parse(user);
        setAdminUser({ name: parsed.nome ?? parsed.name ?? "Admin", email: parsed.email ?? "" });
      } catch {
        // ignore
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const stats = [
    {
      title: "Total de Vendas",
      value: "R$ 125.430,00",
      icon: DollarSign,
      change: "+12.5%",
      color: "text-green-500",
    },
    {
      title: "Pedidos",
      value: "156",
      icon: ShoppingCart,
      change: "+8.2%",
      color: "text-blue-500",
    },
    {
      title: "Produtos",
      value: "48",
      icon: Package,
      change: "+3",
      color: "text-purple-500",
    },
    {
      title: "Clientes",
      value: "1.234",
      icon: Users,
      change: "+24",
      color: "text-orange-500",
    },
  ];

  const recentOrders = [
    { id: "001", customer: "João Silva", product: "iPhone 14 Pro Max", value: "R$ 6.499,00", status: "Pago" },
    { id: "002", customer: "Maria Santos", product: "MacBook Air M2", value: "R$ 8.999,00", status: "Pendente" },
    { id: "003", customer: "Pedro Costa", product: "iPad Pro 11", value: "R$ 5.499,00", status: "Pago" },
    { id: "004", customer: "Ana Oliveira", product: "Apple Watch Series 9", value: "R$ 3.299,00", status: "Enviado" },
  ];

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
            <span className="text-sm text-muted-foreground">Painel Administrativo</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {adminUser?.name || "Admin"}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button asChild>
            <Link to="/admin/produtos/novo">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/produtos">
              <Package className="w-4 h-4 mr-2" />
              Gerenciar Produtos
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/categorias">
              <FolderTree className="w-4 h-4 mr-2" />
              Categorias
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/pedidos">
              <List className="w-4 h-4 mr-2" />
              Ver Pedidos
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.color}`}>
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pedidos Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/pedidos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Pedido</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Produto</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">#{order.id}</td>
                      <td className="p-3">{order.customer}</td>
                      <td className="p-3">{order.product}</td>
                      <td className="p-3">{order.value}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "Pago"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Pendente"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
