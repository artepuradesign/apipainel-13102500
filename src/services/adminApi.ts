// URL base da API PHP Admin
export const ADMIN_API_BASE = 'https://iplaceseminovos.apipainel.com.br/api/admin';

// Tipos
export interface AdminProduct {
  id: number;
  sku: string;
  nome: string;
  slug: string;
  descricao: string;
  descricao_curta: string;
  categoria_id: number;
  categoria: string;
  condicao: string;
  condicao_descricao: string;
  preco: number;
  preco_original: number;
  desconto_percentual: number;
  estoque: number;
  garantia_meses: number;
  destaque: boolean;
  ativo: boolean;
  imagens: { id?: number; url: string; ordem: number; principal: boolean }[];
  especificacoes: { id?: number; label: string; valor: string }[];
  created_at: string;
  updated_at: string;
}

export interface AdminCategory {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  imagem: string;
  ordem: number;
  ativo: boolean;
}

// Helper para requisições autenticadas
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
    throw new Error('Sessão expirada');
  }

  return response;
};

// ==================== PRODUTOS ====================

export const fetchAdminProducts = async (): Promise<AdminProduct[]> => {
  const response = await authFetch(`${ADMIN_API_BASE}/produtos.php`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao buscar produtos');
  }
  
  return data.data;
};

export const fetchAdminProduct = async (id: number): Promise<AdminProduct> => {
  const response = await authFetch(`${ADMIN_API_BASE}/produtos.php?id=${id}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao buscar produto');
  }
  
  return data.data;
};

export const createAdminProduct = async (product: Omit<Partial<AdminProduct>, 'imagens'> & { imagens?: string[] }): Promise<{ id: number }> => {
  const response = await authFetch(`${ADMIN_API_BASE}/produtos.php`, {
    method: 'POST',
    body: JSON.stringify(product),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao criar produto');
  }
  
  return data.data;
};

export const updateAdminProduct = async (id: number, product: Omit<Partial<AdminProduct>, 'imagens'> & { imagens?: string[] }): Promise<void> => {
  const response = await authFetch(`${ADMIN_API_BASE}/produtos.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao atualizar produto');
  }
};

export const deleteAdminProduct = async (id: number): Promise<void> => {
  const response = await authFetch(`${ADMIN_API_BASE}/produtos.php?id=${id}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao excluir produto');
  }
};

// ==================== CATEGORIAS ====================

export const fetchAdminCategories = async (): Promise<AdminCategory[]> => {
  const response = await authFetch(`${ADMIN_API_BASE}/categorias.php`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao buscar categorias');
  }
  
  return data.data;
};

export const fetchAdminCategory = async (id: number): Promise<AdminCategory> => {
  const response = await authFetch(`${ADMIN_API_BASE}/categorias.php?id=${id}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao buscar categoria');
  }
  
  return data.data;
};

export const createAdminCategory = async (category: Partial<AdminCategory>): Promise<{ id: number }> => {
  const response = await authFetch(`${ADMIN_API_BASE}/categorias.php`, {
    method: 'POST',
    body: JSON.stringify(category),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao criar categoria');
  }
  
  return data.data;
};

export const updateAdminCategory = async (id: number, category: Partial<AdminCategory>): Promise<void> => {
  const response = await authFetch(`${ADMIN_API_BASE}/categorias.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao atualizar categoria');
  }
};

export const deleteAdminCategory = async (id: number): Promise<void> => {
  const response = await authFetch(`${ADMIN_API_BASE}/categorias.php?id=${id}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao excluir categoria');
  }
};

// ==================== PEDIDOS ====================

export interface AdminPedido {
  id: number;
  numero: string;
  nome_cliente: string;
  email_cliente: string;
  telefone_cliente?: string;
  total: number;
  status: string;
  forma_pagamento: string;
  created_at: string;
  itens?: Array<{
    id: number;
    nome: string;
    quantidade: number;
    preco_unitario: number;
  }>;
}

export interface AdminStats {
  totalVendas: number;
  totalPedidos: number;
  totalProdutos: number;
  totalCategorias: number;
}

export const fetchAdminPedidos = async (limite = 50, pagina = 1): Promise<{ pedidos: AdminPedido[]; total: number }> => {
  const response = await authFetch(`${ADMIN_API_BASE}/pedidos.php?limite=${limite}&pagina=${pagina}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Erro ao buscar pedidos');
  }
  
  return { pedidos: data.data.pedidos, total: data.data.total };
};

export const fetchAdminStats = async (): Promise<AdminStats> => {
  // Buscar produtos, pedidos e categorias em paralelo
  const [produtosRes, pedidosRes, categoriasRes] = await Promise.all([
    authFetch(`${ADMIN_API_BASE}/produtos.php`),
    authFetch(`${ADMIN_API_BASE}/pedidos.php?limite=1000`),
    authFetch(`${ADMIN_API_BASE}/categorias.php`),
  ]);
  
  const [produtosData, pedidosData, categoriasData] = await Promise.all([
    produtosRes.json(),
    pedidosRes.json(),
    categoriasRes.json(),
  ]);
  
  const produtos = produtosData.success ? produtosData.data : [];
  const pedidos = pedidosData.success ? pedidosData.data.pedidos : [];
  const categorias = categoriasData.success ? categoriasData.data : [];
  
  // Calcular total de vendas (pedidos com status pago, preparando, enviado ou entregue)
  const statusPagos = ['pago', 'preparando', 'enviado', 'entregue'];
  const totalVendas = pedidos
    .filter((p: AdminPedido) => statusPagos.includes(p.status))
    .reduce((acc: number, p: AdminPedido) => acc + Number(p.total || 0), 0);
  
  return {
    totalVendas,
    totalPedidos: pedidos.length,
    totalProdutos: produtos.length,
    totalCategorias: categorias.length,
  };
};
