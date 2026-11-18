
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import SalesPanel from "@/components/SalesPanel";
import CategoriesPanel from "@/components/CategoriesPanel";
import SettingsPanel from "@/components/SettingsPanel";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Settings,
  Search,
  Menu,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Plus,
  X,
  RefreshCw,
  Pencil,
  Trash2,
  LogOut,
  ArrowUpRight,
  ArrowRight,
  CircleCheck,
  Activity,
  Layers3,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
};

type ApiProduct = {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  stock: number;
};

type Category = {
  id: number;
  name: string;
};

type Sale = {
  id: number;
  total: number;
  createdAt: string;
};

type ProductForm = {
  name: string;
  category: string;
  price: string;
  stock: string;
};

type Language = "es" | "en";

const LANGUAGE_KEY = "novatech_language";

const emptyForm: ProductForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
};

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Productos",
    icon: Package,
  },
  {
    name: "Categorías",
    icon: Tags,
  },
  {
    name: "Ventas",
    icon: ShoppingCart,
  },
  {
    name: "Configuración",
    icon: Settings,
  },
];

const translations = {
  es: {
    dashboard: "Dashboard",
    products: "Productos",
    categories: "Categorías",
    sales: "Ventas",
    settings: "Configuración",
    system: "Sistema de gestión NovaTech",
    logout: "Cerrar sesión",
    loggingOut: "Cerrando sesión...",
    welcome: "Bienvenido a NovaTech",
    welcomeDescription:
      "Administra tus productos, inventario y ventas.",
    totalProducts: "Total productos",
    availableUnits: "Unidades disponibles",
    monthlySales: "Ventas del mes",
    lowStock: "Stock bajo",
    inventory: "Inventario de productos",
    dashboardOverview: "Tu negocio, en perspectiva",
    overviewTag: "PANEL DE CONTROL",
    catalogTag: "CATÁLOGO / INVENTARIO",
    workspace: "ESPACIO DE TRABAJO",
    overviewHint: "Todo lo importante de tu operación, en un solo lugar.",
    inventoryHealth: "Estado del inventario",
    inventoryHealthDescription: "Disponibilidad actual de tus productos",
    healthyProducts: "Productos disponibles",
    inventoryShortcut: "Explorar inventario",
    quickDescription: "Continúa trabajando desde donde lo necesitas.",
    catalogCount: "productos en catálogo",
    businessActivity: "Actividad comercial",
    salesMonthDetail: "Ingresos registrados este mes",
    dashboardOverviewDescription: "Consulta los indicadores y alertas principales de NovaTech.",
    stockAlerts: "Alertas de inventario",
    stockAlertsDescription: "Productos que requieren reposición.",
    noStockAlerts: "No hay productos con stock bajo ni agotado.",
    viewProducts: "Ver productos",
    quickAccess: "Accesos rápidos",
    manageProducts: "Administrar productos",
    manageCategories: "Administrar categorías",
    manageSales: "Gestionar ventas",
    outOfStockCount: "Productos agotados",
    inventoryValue: "Valor del inventario",
    inventoryDescription:
      "Consulta y administra tus productos.",
    searchProduct: "Buscar producto...",
    refreshInventory: "Actualizar inventario",
    addProduct: "Agregar producto",
    product: "Producto",
    category: "Categoría",
    price: "Precio",
    stock: "Stock",
    status: "Estado",
    actions: "Acciones",
    available: "Disponible",
    outOfStock: "Agotado",
    chooseCategory: "Seleccionar categoría",
    noCategories: "No hay categorías. Crea una en el módulo Categorías.",
    loadingProducts: "Cargando productos...",
    noProducts: "No se encontraron productos.",
    editProduct: "Editar producto",
    deleteProduct: "Eliminar producto",
    productName: "Nombre del producto",
    productNamePlaceholder: "Ej. Mouse Logitech G203",
    categoryPlaceholder: "Ej. Mouse",
    priceCop: "Precio (COP)",
    cancel: "Cancelar",
    saveChanges: "Guardar cambios",
    saveProduct: "Guardar producto",
    saving: "Guardando...",
    deleteQuestion: "¿Eliminar producto?",
    deleteWarning:
      "Esta acción eliminará el producto de la base de datos y no se puede deshacer.",
    confirmDelete: "Sí, eliminar",
    deleting: "Eliminando...",
    noCategory: "Sin categoría",
    inventoryError: "No se pudo consultar el inventario.",
    productsError: "Error al consultar productos.",
    salesError: "No se pudieron actualizar las ventas del mes.",
    logoutError: "No se pudo cerrar la sesión.",
    productValidation: "Revisa los datos del producto.",
    productCreateError: "No se pudo crear el producto.",
    productUpdateError: "No se pudo actualizar el producto.",
    productDeleteError:
      "No se pudo eliminar el producto. Puede tener registros asociados.",
    productCreated: "Producto creado correctamente.",
    productUpdated: "Producto actualizado correctamente.",
    productDeleted: "Producto eliminado correctamente.",
    productSaveError: "Error al guardar el producto.",
    productDeleteUnexpected: "Error al eliminar el producto.",
  },
  en: {
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    sales: "Sales",
    settings: "Settings",
    system: "NovaTech Management System",
    logout: "Log out",
    loggingOut: "Logging out...",
    welcome: "Welcome to NovaTech",
    welcomeDescription:
      "Manage your products, inventory and sales.",
    totalProducts: "Total products",
    availableUnits: "Available units",
    monthlySales: "Monthly sales",
    lowStock: "Low stock",
    inventory: "Product inventory",
    dashboardOverview: "Your business at a glance",
    overviewTag: "CONTROL CENTER",
    catalogTag: "CATALOG / INVENTORY",
    workspace: "WORKSPACE",
    overviewHint: "Everything that matters to your operation, in one place.",
    inventoryHealth: "Inventory health",
    inventoryHealthDescription: "Current product availability",
    healthyProducts: "Available products",
    inventoryShortcut: "Explore inventory",
    quickDescription: "Pick up your work where you need it.",
    catalogCount: "products in catalog",
    businessActivity: "Business activity",
    salesMonthDetail: "Revenue recorded this month",
    dashboardOverviewDescription: "Review NovaTech’s key metrics and inventory alerts.",
    stockAlerts: "Inventory alerts",
    stockAlertsDescription: "Products that need restocking.",
    noStockAlerts: "No products are low on stock or out of stock.",
    viewProducts: "View products",
    quickAccess: "Quick access",
    manageProducts: "Manage products",
    manageCategories: "Manage categories",
    manageSales: "Manage sales",
    outOfStockCount: "Out-of-stock products",
    inventoryValue: "Inventory value",
    inventoryDescription:
      "View and manage your products.",
    searchProduct: "Search products...",
    refreshInventory: "Refresh inventory",
    addProduct: "Add product",
    product: "Product",
    category: "Category",
    price: "Price",
    stock: "Stock",
    status: "Status",
    actions: "Actions",
    available: "Available",
    outOfStock: "Out of stock",
    chooseCategory: "Select a category",
    noCategories: "No categories available. Create one in Categories.",
    loadingProducts: "Loading products...",
    noProducts: "No products found.",
    editProduct: "Edit product",
    deleteProduct: "Delete product",
    productName: "Product name",
    productNamePlaceholder: "e.g. Logitech G203 Mouse",
    categoryPlaceholder: "e.g. Mouse",
    priceCop: "Price (COP)",
    cancel: "Cancel",
    saveChanges: "Save changes",
    saveProduct: "Save product",
    saving: "Saving...",
    deleteQuestion: "Delete product?",
    deleteWarning:
      "This action will permanently delete the product from the database.",
    confirmDelete: "Yes, delete",
    deleting: "Deleting...",
    noCategory: "Uncategorized",
    inventoryError: "Could not load inventory.",
    productsError: "Error loading products.",
    salesError: "Could not update monthly sales.",
    logoutError: "Could not log out.",
    productValidation: "Please check the product details.",
    productCreateError: "Could not create product.",
    productUpdateError: "Could not update product.",
    productDeleteError:
      "Could not delete the product. It may have related records.",
    productCreated: "Product created successfully.",
    productUpdated: "Product updated successfully.",
    productDeleted: "Product deleted successfully.",
    productSaveError: "Error saving product.",
    productDeleteUnexpected: "Error deleting product.",
  },
};

const currency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export default function Home() {
  const router = useRouter();

  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [language, setLanguage] = useState<Language>("es");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthlySales, setMonthlySales] = useState(0);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);

  const t = translations[language];

  // Load the saved language preference
  useEffect(() => {
    function loadLanguage() {
      try {
        const saved = window.localStorage.getItem(
          LANGUAGE_KEY
        );

        if (saved === "es" || saved === "en") {
          setLanguage(saved);
          document.documentElement.lang = saved;
        }
      } catch (err) {
        console.error("Error loading language:", err);
      }
    }

    function handleLanguageChange(event: Event) {
      const customEvent = event as CustomEvent<{
        language?: Language;
      }>;

      const nextLanguage = customEvent.detail?.language;

      if (
        nextLanguage === "es" ||
        nextLanguage === "en"
      ) {
        setLanguage(nextLanguage);
      }
    }

    loadLanguage();

    window.addEventListener(
      "novatech-language-change",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "novatech-language-change",
        handleLanguageChange
      );
    };
  }, []);

  // Load products and category names
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productsResponse, categoriesResponse] =
        await Promise.all([
          fetch("/api/products", {
            cache: "no-store",
            credentials: "same-origin",
          }),
          fetch("/api/categories", {
            cache: "no-store",
            credentials: "same-origin",
          }),
        ]);

      if (
        productsResponse.status === 401 ||
        categoriesResponse.status === 401
      ) {
        router.replace("/login");
        return;
      }

      if (
        !productsResponse.ok ||
        !categoriesResponse.ok
      ) {
        throw new Error(
          "No se pudo consultar el inventario."
        );
      }

      const productsData: ApiProduct[] =
        await productsResponse.json();

      const categoriesData: Category[] =
        await categoriesResponse.json();

      setCategories(categoriesData);

      const categoryNames = new Map(
        categoriesData.map((category) => [
          category.id,
          category.name,
        ])
      );

      setProducts(
        productsData.map((product) => ({
          id: product.id,
          name: product.name,
          category:
            categoryNames.get(product.categoryId) ?? "",
          price: product.price,
          stock: product.stock,
        }))
      );
    } catch (err) {
      setCategories([]);
      setError(
        err instanceof Error
          ? err.message
          : "Error al consultar productos."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load monthly sales using Colombia's timezone
  const loadMonthlySales = useCallback(async () => {
    setSalesLoading(true);

    try {
      const response = await fetch("/api/sales", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "No se pudieron consultar las ventas."
        );
      }

      const sales: Sale[] = await response.json();

      const formatter = new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: "America/Bogota",
          year: "numeric",
          month: "2-digit",
        }
      );

      const currentMonth = formatter.format(
        new Date()
      );

      const total = sales.reduce((sum, sale) => {
        const saleDate = new Date(sale.createdAt);

        if (
          !Number.isFinite(saleDate.getTime()) ||
          formatter.format(saleDate) !== currentMonth
        ) {
          return sum;
        }

        return sum + Number(sale.total);
      }, 0);

      setMonthlySales(total);
    } catch (err) {
      console.error(
        "Error loading monthly sales:",
        err
      );

      setError(
        "No se pudieron actualizar las ventas del mes."
      );
    } finally {
      setSalesLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProducts();
    void loadMonthlySales();
  }, [loadProducts, loadMonthlySales]);

  // Inventory statistics
  const totalStock = products.reduce(
    (sum, product) => sum + product.stock,
    0
  );

  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 6
  ).length;

  const outOfStock = products.filter((product) => product.stock === 0).length;

  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );

  const alertProducts = products.filter((product) => product.stock <= 6);

  const filteredProducts = products.filter(
    (product) =>
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // Log out
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "same-origin",
        }
      );

      if (!response.ok) {
        throw new Error(t.logoutError);
      }

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.logoutError
      );

      setLoggingOut(false);
    }
  }

  // Open product creation form
  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  // Open product editing form
  function openEdit(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });

    setError("");
    setMessage("");
    setShowForm(true);
  }

  // Create or update a product
  async function saveProduct(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      form.price.trim() === "" ||
      form.stock.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      setError(t.productValidation);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const isEditing = editingId !== null;

    try {
      const response = await fetch(
        isEditing
          ? `/api/products/${editingId}`
          : "/api/products",
        {
          method: isEditing ? "PATCH" : "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            category: form.category.trim(),
            price,
            stock,
          }),
        }
      );

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          isEditing
            ? t.productUpdateError
            : t.productCreateError
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setActive("Productos");

      await loadProducts();

      setMessage(
        isEditing
          ? t.productUpdated
          : t.productCreated
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.productSaveError
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete a product
  async function deleteProduct() {
    if (deletingId === null) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/products/${deletingId}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        }
      );

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          t.productDeleteError
        );
      }

      setDeletingId(null);

      await loadProducts();

      setMessage(t.productDeleted);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.productDeleteUnexpected
      );

      setDeletingId(null);
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    {
      label: t.totalProducts,
      value: String(products.length),
      icon: Package,
      isLoading: loading,
    },
    {
      label: t.availableUnits,
      value: String(totalStock),
      icon: Boxes,
      isLoading: loading,
    },
    {
      label: t.monthlySales,
      value: currency(monthlySales),
      icon: TrendingUp,
      isLoading: salesLoading,
    },
    {
      label: t.lowStock,
      value: String(lowStock),
      icon: AlertTriangle,
      isLoading: loading,
    },
  ];

  function getNavigationLabel(name: string) {
    switch (name) {
      case "Dashboard":
        return t.dashboard;
      case "Productos":
        return t.products;
      case "Categorías":
        return t.categories;
      case "Ventas":
        return t.sales;
      case "Configuración":
        return t.settings;
      default:
        return name;
    }
  }

  const healthyProducts = products.filter((product) => product.stock > 6).length;
  const inventoryCount = products.length;

  const goTo = (name: string) => {
    setActive(name);
    setSidebarOpen(false);
    setError("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-[#e7ecf5] bg-white shadow-[8px_0_30px_rgba(15,23,42,0.025)] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[94px] items-center gap-3 border-b border-slate-100 px-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"><Boxes size={25} strokeWidth={2} /></div>
          <div><h1 className="text-[22px] font-extrabold tracking-tight text-[#101c36]">Nova<span className="text-blue-600">Tech</span></h1><p className="text-[11px] font-medium tracking-wide text-slate-400">INVENTORY MANAGER</p></div>
        </div>
        <div className="px-5 pt-8 pb-3"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.19em] text-slate-400">{t.workspace}</p></div>
        <nav className="flex-1 space-y-1.5 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = active === item.name;
            return <button key={item.name} type="button" onClick={() => goTo(item.name)} className={`group flex w-full items-center gap-3 rounded-[13px] px-4 py-3.5 text-left text-sm font-semibold transition-all ${selected ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`}><Icon size={19} strokeWidth={selected ? 2.2 : 1.8}/><span className="flex-1">{getNavigationLabel(item.name)}</span>{selected && <ChevronRight size={16} className="text-blue-100"/>}</button>;
          })}
        </nav>
        <div className="mx-5 mb-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4"><div className="mb-2 flex items-center gap-2 text-blue-700"><ShieldCheck size={18}/><span className="text-xs font-bold">NovaTech</span></div><p className="text-xs leading-5 text-slate-500">{t.system}</p></div>
        <div className="border-t border-slate-100 p-4"><button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><LogOut size={18}/>{loggingOut ? t.loggingOut : t.logout}</button></div>
      </aside>

      {sidebarOpen && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

      <div className="min-w-0 lg:ml-[270px]">
        <header className="sticky top-0 z-20 flex h-[94px] items-center justify-between border-b border-[#e7ecf5] bg-white/95 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-4"><button type="button" aria-label="Open menu" className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={21}/></button><div><p className="text-xs font-medium text-slate-400">NovaTech <span className="px-1 text-slate-300">/</span> {t.workspace}</p><h2 className="mt-1 text-xl font-bold tracking-tight text-[#101c36]">{getNavigationLabel(active)}</h2></div></div>
          <div className="flex items-center gap-3"><span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500"/>NovaTech</span><div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-blue-100 bg-blue-50 text-sm font-extrabold text-blue-700">AD</div></div>
        </header>

        <main className="mx-auto max-w-[1550px] space-y-7 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {active === "Ventas" ? <SalesPanel products={products} onSaleCompleted={async () => {await Promise.all([loadProducts(), loadMonthlySales()]);}}/> : active === "Categorías" ? <CategoriesPanel onCategoriesChanged={async () => {await loadProducts();}}/> : active === "Configuración" ? <SettingsPanel/> : <>
            {active === "Dashboard" ? <>
              {/* Dashboard hero */}
              <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#122c64] via-[#1744a1] to-[#2563eb] px-7 py-9 text-white shadow-xl shadow-blue-900/10 sm:px-10 sm:py-11">
                <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[50px] border-white/[0.06]"/><div className="pointer-events-none absolute bottom-[-120px] right-32 h-64 w-64 rounded-full bg-white/[0.04]"/>
                <div className="relative z-10"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.15em]"><Activity size={13}/>{t.overviewTag}</span><h3 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{t.dashboardOverview}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">{t.overviewHint}</p><button type="button" onClick={() => goTo("Productos")} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50">{t.inventoryShortcut}<ArrowUpRight size={17}/></button></div>
              </section>
              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
              {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
              {/* KPI cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((card, index) => {const Icon=card.icon;const tones=["bg-blue-50 text-blue-600","bg-indigo-50 text-indigo-600","bg-emerald-50 text-emerald-600","bg-amber-50 text-amber-600"];return <div key={card.label} className="group rounded-[22px] border border-[#e5ebf5] bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.035)] transition-all hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[index]}`}><Icon size={23}/></div><ArrowUpRight size={17} className="text-slate-300 transition-colors group-hover:text-blue-600"/></div><p className="mt-6 text-sm font-medium text-slate-500">{card.label}</p><p className="mt-2 text-[30px] font-extrabold tracking-tight text-[#101c36]">{card.isLoading ? "..." : card.value}</p></div>;})}</div>
              <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[24px] border border-[#e5ebf5] bg-white p-6 shadow-sm sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><div className="rounded-xl bg-amber-50 p-2 text-amber-600"><AlertTriangle size={19}/></div><h4 className="text-lg font-bold text-[#101c36]">{t.stockAlerts}</h4></div><p className="mt-2 text-sm text-slate-500">{t.stockAlertsDescription}</p></div><button type="button" onClick={() => goTo("Productos")} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800">{t.viewProducts}<ArrowRight size={16}/></button></div><div className="mt-6">{loading ? <p className="text-sm text-slate-500">{t.loadingProducts}</p> : alertProducts.length === 0 ? <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-5 py-10 text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CircleCheck size={27}/></div><p className="text-sm font-semibold text-emerald-800">{t.noStockAlerts}</p></div> : <div className="max-h-72 space-y-2 overflow-y-auto">{alertProducts.slice(0,8).map(product => <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"><span className="min-w-0 truncate text-sm font-semibold text-slate-700">{product.name}</span><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${product.stock===0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{product.stock===0 ? t.outOfStock : `${t.lowStock}: ${product.stock}`}</span></div>)}</div>}</div></section>
                <section className="rounded-[24px] border border-[#e5ebf5] bg-white p-6 shadow-sm sm:p-7"><div className="flex items-center gap-2"><div className="rounded-xl bg-blue-50 p-2 text-blue-600"><Layers3 size={19}/></div><h4 className="text-lg font-bold text-[#101c36]">{t.inventoryHealth}</h4></div><p className="mt-2 text-sm text-slate-500">{t.inventoryHealthDescription}</p><div className="mt-7 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">{inventoryCount>0 && <><div className="bg-emerald-500" style={{width:`${healthyProducts/inventoryCount*100}%`}}/><div className="bg-amber-400" style={{width:`${lowStock/inventoryCount*100}%`}}/><div className="bg-red-400" style={{width:`${outOfStock/inventoryCount*100}%`}}/></>}</div><div className="mt-6 grid grid-cols-3 gap-2 text-center"><div><p className="text-xl font-extrabold text-emerald-600">{loading ? "..." : healthyProducts}</p><p className="mt-1 text-xs text-slate-500">{t.available}</p></div><div><p className="text-xl font-extrabold text-amber-600">{loading ? "..." : lowStock}</p><p className="mt-1 text-xs text-slate-500">{t.lowStock}</p></div><div><p className="text-xl font-extrabold text-red-600">{loading ? "..." : outOfStock}</p><p className="mt-1 text-xs text-slate-500">{t.outOfStock}</p></div></div><div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5"><div><p className="text-xs text-slate-500">{t.outOfStockCount}</p><p className="mt-1 text-xl font-extrabold text-[#101c36]">{loading ? "..." : outOfStock}</p></div><div><p className="text-xs text-slate-500">{t.inventoryValue}</p><p className="mt-1 text-lg font-extrabold text-[#101c36]">{loading ? "..." : currency(inventoryValue)}</p></div></div></section>
              </div>
              <section className="rounded-[24px] border border-[#e5ebf5] bg-white p-6 shadow-sm sm:p-7"><div className="mb-5"><h4 className="text-lg font-bold text-[#101c36]">{t.quickAccess}</h4><p className="mt-1 text-sm text-slate-500">{t.quickDescription}</p></div><div className="grid gap-3 md:grid-cols-3">{[{name:"Productos",label:t.manageProducts,icon:Package},{name:"Categorías",label:t.manageCategories,icon:Tags},{name:"Ventas",label:t.manageSales,icon:ShoppingCart}].map(item=>{const Icon=item.icon;return <button key={item.name} type="button" onClick={()=>goTo(item.name)} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm"><Icon size={20}/></div><span className="flex-1 text-sm font-bold text-slate-700">{item.label}</span><ArrowUpRight size={17} className="text-slate-400 group-hover:text-blue-600"/></button>;})}</div></section>
            </> : <>
              {/* Products header */}
              <section className="flex flex-wrap items-center justify-between gap-5"><div><span className="text-[11px] font-bold tracking-[0.16em] text-blue-600">{t.catalogTag}</span><h3 className="mt-2 text-3xl font-extrabold tracking-tight text-[#101c36]">{t.inventory}</h3><p className="mt-2 text-sm text-slate-500">{t.inventoryDescription}</p></div><div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3"><p className="text-2xl font-extrabold text-blue-700">{loading ? "..." : inventoryCount}</p><p className="text-xs font-semibold text-blue-500">{t.catalogCount}</p></div></section>
              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
              {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
              <section className="overflow-hidden rounded-[24px] border border-[#e5ebf5] bg-white shadow-[0_4px_22px_rgba(15,23,42,0.035)]"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:px-7"><div><h4 className="text-lg font-bold text-[#101c36]">{t.inventory}</h4><p className="mt-1 text-sm text-slate-400">{t.inventoryDescription}</p></div><div className="flex flex-wrap items-center gap-2.5"><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"><Search size={18} className="text-slate-400"/><input type="text" placeholder={t.searchProduct} value={search} onChange={event=>setSearch(event.target.value)} className="w-40 bg-transparent text-sm outline-none sm:w-52"/></div><button type="button" onClick={()=>{void Promise.all([loadProducts(),loadMonthlySales()]);}} disabled={loading||salesLoading} aria-label={t.refreshInventory} title={t.refreshInventory} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={18}/></button><button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"><Plus size={18}/>{t.addProduct}</button></div></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f8faff] text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-7 py-5">{t.product}</th><th className="px-6 py-5">{t.category}</th><th className="px-6 py-5">{t.price}</th><th className="px-6 py-5">{t.stock}</th><th className="px-6 py-5">{t.status}</th><th className="px-6 py-5">{t.actions}</th></tr></thead><tbody>{!loading && filteredProducts.map(product=><tr key={product.id} className="border-t border-slate-100 transition-colors hover:bg-blue-50/30"><td className="px-7 py-5"><div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600"><Package size={19}/></div><span className="font-bold text-slate-800">{product.name}</span></div></td><td className="px-6 py-5"><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{product.category||t.noCategory}</span></td><td className="px-6 py-5 font-bold text-slate-800">{currency(product.price)}</td><td className="px-6 py-5 font-semibold text-slate-700">{product.stock}</td><td className="px-6 py-5"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${product.stock===0 ? "bg-red-50 text-red-700" : product.stock<=6 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}><span className={`h-1.5 w-1.5 rounded-full ${product.stock===0 ? "bg-red-500" : product.stock<=6 ? "bg-amber-500" : "bg-emerald-500"}`}/>{product.stock===0?t.outOfStock:product.stock<=6?t.lowStock:t.available}</span></td><td className="px-6 py-5"><div className="flex gap-2"><button type="button" onClick={()=>openEdit(product)} title={t.editProduct} aria-label={`${t.editProduct}: ${product.name}`} className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100"><Pencil size={17}/></button><button type="button" onClick={()=>setDeletingId(product.id)} title={t.deleteProduct} aria-label={`${t.deleteProduct}: ${product.name}`} className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 hover:bg-red-100"><Trash2 size={17}/></button></div></td></tr>)}{loading && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">{t.loadingProducts}</td></tr>}{!loading && filteredProducts.length===0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">{t.noProducts}</td></tr>}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-7 py-4"><span className="text-xs font-medium text-slate-500">{loading ? "..." : filteredProducts.length} {t.catalogCount}</span><span className="flex items-center gap-1 text-xs font-semibold text-blue-600"><CircleCheck size={15}/>{t.system}</span></div>
              </section>
            </>}
          </>}
        </main>
      </div>

      {/* Create/edit product modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3
                id="product-form-title"
                className="text-xl font-bold"
              >
                {editingId !== null
                  ? t.editProduct
                  : t.addProduct}
              </h3>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
                className="text-slate-500"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={saveProduct}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="product-name"
                  className="mb-1 block text-sm font-medium"
                >
                  {t.productName}
                </label>
                <input
                  id="product-name"
                  required
                  maxLength={150}
                  value={form.name}
                  placeholder={t.productNamePlaceholder}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="product-category"
                  className="mb-1 block text-sm font-medium"
                >
                  {t.category}
                </label>
                <select
                  id="product-category"
                  required
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  disabled={categories.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
                >
                  <option value="">{t.chooseCategory}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="mt-2 text-sm text-amber-700">
                    {t.noCategories}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="product-price"
                    className="mb-1 block text-sm font-medium"
                  >
                    {t.priceCop}
                  </label>

                  <input
                    id="product-price"
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={form.price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-stock"
                    className="mb-1 block text-sm font-medium"
                  >
                    {t.stock}
                  </label>

                  <input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.stock}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        stock:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-600"
                >
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium"
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? t.saving
                    : editingId !== null
                      ? t.saveChanges
                      : t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete product confirmation */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3
              id="delete-title"
              className="text-xl font-bold"
            >
              {t.deleteQuestion}
            </h3>

            <p className="mt-3 text-sm text-slate-600">
              {t.deleteWarning}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setDeletingId(null)
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void deleteProduct()
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving
                  ? t.deleting
                  : t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
