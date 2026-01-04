import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  ShoppingCart,
  DollarSign,
  LogOut,
  Plus,
  List,
  TrendingUp,
  Clock,
  FolderTree,
} from "lucide-react";
import { fetchAdminStats, fetchAdminPedidos, AdminPedido } from "@/services/adminApi";

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

  // Buscar estatísticas
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });

  // Buscar pedidos recentes
  const { data: pedidosData, isLoading: loadingPedidos } = useQuery({
    queryKey: ["admin-pedidos-recentes"],
    queryFn: () => fetchAdminPedidos(5, 1),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aguardando_pagamento: "Aguardando",
      pendente: "Pendente",
      pago: "Pago",
      preparando: "Preparando",
      enviado: "Enviado",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aguardando_pagamento: "bg-yellow-100 text-yellow-700",
      pendente: "bg-yellow-100 text-yellow-700",
      pago: "bg-green-100 text-green-700",
      preparando: "bg-blue-100 text-blue-700",
      enviado: "bg-purple-100 text-purple-700",
      entregue: "bg-green-100 text-green-700",
      cancelado: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const statsCards = [
    {
      title: "Total de Vendas",
      value: stats ? formatCurrency(stats.totalVendas) : "R$ 0,00",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Pedidos",
      value: stats?.totalPedidos?.toString() ?? "0",
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Produtos",
      value: stats?.totalProdutos?.toString() ?? "0",
      icon: Package,
      color: "text-purple-500",
    },
    {
      title: "Categorias",
      value: stats?.totalCategorias?.toString() ?? "0",
      icon: FolderTree,
      color: "text-orange-500",
    },
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
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    {loadingStats ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    )}
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
            {loadingPedidos ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pedidosData?.pedidos && pedidosData.pedidos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Pedido</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Valor</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosData.pedidos.map((pedido: AdminPedido) => (
                      <tr key={pedido.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">#{pedido.numero}</td>
                        <td className="p-3">{pedido.nome_cliente}</td>
                        <td className="p-3">{formatCurrency(Number(pedido.total))}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pedido.status)}`}>
                            {getStatusLabel(pedido.status)}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-sm">
                          {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum pedido encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;