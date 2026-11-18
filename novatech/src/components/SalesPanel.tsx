
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  RefreshCw,
  ReceiptText,
  TrendingUp,
  PackageCheck,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

type SaleItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
};

type Sale = {
  id: number;
  total: number;
  userId: number;
  createdAt: string;
  items: SaleItem[];
};

type CartItem = {
  productId: number;
  quantity: number;
};

type Language = "es" | "en";

type Props = {
  products: Product[];
  onSaleCompleted: () => Promise<void> | void;
};

const LANGUAGE_KEY = "novatech_language";

const translations = {
  es: {
    title: "Gestión de ventas",
    description: "Registra ventas y consulta las transacciones realizadas.",
    newSale: "Nueva venta",
    product: "Producto",
    selectProduct: "Seleccionar producto",
    available: "disponibles",
    quantity: "Cantidad",
    addToSale: "Agregar a la venta",
    selectedProducts: "Productos seleccionados",
    emptyCart: "Aún no has agregado productos.",
    remove: "Quitar",
    total: "Total",
    registering: "Registrando venta...",
    confirmSale: "Confirmar venta",
    salesSummary: "Resumen de ventas",
    registeredSales: "Ventas registradas",
    historicalTotal: "Total histórico",
    recentSales: "Últimas ventas",
    refreshSales: "Actualizar ventas",
    loadingSales: "Cargando ventas...",
    noSales: "Todavía no hay ventas registradas.",
    sale: "Venta",
    units: "unidades",
    selectProductError: "Selecciona un producto.",
    invalidQuantity: "Ingresa una cantidad válida.",
    stockError: (stock: number, name: string) =>
      `Solo hay ${stock} unidades disponibles de ${name}.`,
    historyError: "No se pudo consultar el historial de ventas.",
    loadError: "Error al consultar ventas.",
    registerError: "No se pudo registrar la venta.",
    unexpectedRegisterError: "Error al registrar la venta.",
    saleSuccess: (id: number | string) =>
      `Venta #${id} registrada correctamente.`,
  },
  en: {
    title: "Sales management",
    description: "Record sales and review completed transactions.",
    newSale: "New sale",
    product: "Product",
    selectProduct: "Select a product",
    available: "available",
    quantity: "Quantity",
    addToSale: "Add to sale",
    selectedProducts: "Selected products",
    emptyCart: "You haven't added any products yet.",
    remove: "Remove",
    total: "Total",
    registering: "Recording sale...",
    confirmSale: "Confirm sale",
    salesSummary: "Sales summary",
    registeredSales: "Recorded sales",
    historicalTotal: "Historical total",
    recentSales: "Recent sales",
    refreshSales: "Refresh sales",
    loadingSales: "Loading sales...",
    noSales: "No sales have been recorded yet.",
    sale: "Sale",
    units: "units",
    selectProductError: "Select a product.",
    invalidQuantity: "Enter a valid quantity.",
    stockError: (stock: number, name: string) =>
      `Only ${stock} units of ${name} are available.`,
    historyError: "Could not load the sales history.",
    loadError: "Error loading sales.",
    registerError: "Could not record the sale.",
    unexpectedRegisterError: "Error recording the sale.",
    saleSuccess: (id: number | string) =>
      `Sale #${id} recorded successfully.`,
  },
};

const money = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getApiError(data: unknown, fallback: string, language: Language) {
  if (
    typeof data !== "object" ||
    data === null ||
    !("error" in data) ||
    typeof data.error !== "string"
  ) {
    return fallback;
  }

  const message = data.error.toLowerCase();
  const t = translations[language];

  if (
    message.includes("stock") ||
    message.includes("insufficient") ||
    message.includes("inventario")
  ) {
    return language === "en"
      ? "Insufficient stock. Refresh the inventory and try again."
      : "Stock insuficiente. Actualiza el inventario e inténtalo de nuevo.";
  }

  if (
    message.includes("invalid") ||
    message.includes("quantity") ||
    message.includes("cantidad")
  ) {
    return t.invalidQuantity;
  }

  return fallback;
}

export default function SalesPanel({
  products,
  onSaleCompleted,
}: Props) {
  const [language, setLanguage] = useState<Language>("es");
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const t = translations[language];

  // Keep the selected language synchronized with Settings.
  useEffect(() => {
    function loadLanguage() {
      try {
        const saved = window.localStorage.getItem(LANGUAGE_KEY);

        if (saved === "es" || saved === "en") {
          setLanguage(saved);
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

      if (nextLanguage === "es" || nextLanguage === "en") {
        setLanguage(nextLanguage);
      } else {
        loadLanguage();
      }
    }

    loadLanguage();

    window.addEventListener(
      "novatech-language-change",
      handleLanguageChange,
    );
    window.addEventListener("storage", loadLanguage);

    return () => {
      window.removeEventListener(
        "novatech-language-change",
        handleLanguageChange,
      );
      window.removeEventListener("storage", loadLanguage);
    };
  }, []);

  // Load sales history.
  const loadSales = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/sales", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(translations[language].historyError);
      }

      if (!Array.isArray(data)) {
        throw new Error(translations[language].loadError);
      }

      setSales(data as Sale[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : translations[language].loadError,
      );
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  // Build cart details from current inventory.
  const cartDetails = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find(
            (p) => p.id === item.productId,
          );

          return product
            ? {
                ...item,
                name: product.name,
                price: product.price,
                stock: product.stock,
              }
            : null;
        })
        .filter(
          (item): item is NonNullable<typeof item> =>
            item !== null,
        ),
    [cart, products],
  );

  const total = cartDetails.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const salesTotal = sales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  );

  // Add an available product to the cart.
  function addToCart() {
    setError("");
    setSuccess("");

    const id = Number(selectedId);
    const count = Number(quantity);

    const product = products.find((p) => p.id === id);

    if (!product) {
      setError(t.selectProductError);
      return;
    }

    if (!Number.isSafeInteger(count) || count <= 0) {
      setError(t.invalidQuantity);
      return;
    }

    const existing =
      cart.find((item) => item.productId === id)?.quantity ?? 0;

    if (existing + count > product.stock) {
      setError(t.stockError(product.stock, product.name));
      return;
    }

    setCart((current) =>
      current.some((item) => item.productId === id)
        ? current.map((item) =>
            item.productId === id
              ? {
                  ...item,
                  quantity: item.quantity + count,
                }
              : item,
          )
        : [...current, { productId: id, quantity: count }],
    );

    setSelectedId("");
    setQuantity("1");
  }

  // Register the sale through the existing API.
  async function registerSale() {
    if (submitting || cart.length === 0) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, t.registerError, language));
      }

      const saleId =
        typeof data === "object" &&
        data !== null &&
        "sale" in data &&
        typeof data.sale === "object" &&
        data.sale !== null &&
        "id" in data.sale &&
        typeof data.sale.id === "number"
          ? data.sale.id
          : "";

      setCart([]);

      setSuccess(t.saleSuccess(saleId));

      await Promise.all([
        loadSales(),
        Promise.resolve(onSaleCompleted()),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.unexpectedRegisterError,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-7 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#142d65] via-[#1d49a6] to-[#2563eb] px-6 py-9 text-white shadow-[0_16px_38px_rgba(30,64,175,0.15)] sm:px-10 sm:py-11">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full border-[50px] border-white/5" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-160px] right-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em]">
            <TrendingUp size={15} /> {language === "es" ? "Centro de operaciones" : "Operations center"}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-xl text-base text-blue-100">{t.description}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white/90">
            <CheckCircle2 size={17} className="text-emerald-300" />
            {language === "es" ? "Inventario conectado en tiempo real" : "Real-time inventory connected"}
          </div>
        </div>
      </section>

      {/* Status messages */}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><ReceiptText size={23} /></span>
            <ArrowUpRight size={19} className="text-slate-300" />
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">{t.registeredSales}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{loading ? "..." : sales.length}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><TrendingUp size={23} /></span>
            <ArrowUpRight size={19} className="text-slate-300" />
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">{t.historicalTotal}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{loading ? "..." : money(salesTotal)}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><PackageCheck size={23} /></span>
            <ArrowUpRight size={19} className="text-slate-300" />
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">{t.selectedProducts}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        {/* New sale and cart */}
        <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-6 sm:px-7">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><ShoppingCart size={23} /></span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.newSale}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{language === "es" ? "Selecciona productos y prepara la transacción." : "Select products and prepare the transaction."}</p>
            </div>
          </div>

          <div className="space-y-5 p-6 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
              <div>
                <label htmlFor="sale-product" className="mb-2 block text-sm font-semibold text-slate-700">{t.product}</label>
                <select id="sale-product" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={submitting} className="novatech-input min-h-12 w-full bg-white text-sm">
                  <option value="">{t.selectProduct}</option>
                  {products.filter((p) => p.stock > 0).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {money(p.price)} ({p.stock} {t.available})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sale-quantity" className="mb-2 block text-sm font-semibold text-slate-700">{t.quantity}</label>
                <input id="sale-quantity" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={submitting} className="novatech-input min-h-12 w-full text-sm" />
              </div>
            </div>
            <button type="button" onClick={addToCart} disabled={submitting} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50">
              <Plus size={19} /> {t.addToSale}
            </button>
          </div>

          <div className="border-t border-slate-100 px-6 pb-7 pt-6 sm:px-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">{t.selectedProducts}</h3>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{cartDetails.length}</span>
            </div>
            {cartDetails.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm"><ShoppingCart size={23} /></span>
                <p className="text-sm text-slate-500">{t.emptyCart}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartDetails.map((item) => (
                  <div key={item.productId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600"><PackageCheck size={20} /></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.quantity} × {money(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{money(item.quantity * item.price)}</span>
                      <button type="button" disabled={submitting} aria-label={`${t.remove} ${item.name}`} title={`${t.remove} ${item.name}`} onClick={() => setCart((current) => current.filter((p) => p.productId !== item.productId))} className="rounded-xl border border-red-100 bg-white p-2.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"><Trash2 size={17} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 rounded-2xl bg-[#f1f5ff] px-5 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600">{t.total}</span>
                <span className="text-2xl font-extrabold tracking-tight text-[#173b91]">{money(total)}</span>
              </div>
            </div>
            <button type="button" onClick={() => void registerSale()} disabled={submitting || cart.length === 0} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_6px_16px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? <Loader2 size={19} className="animate-spin" /> : <CreditCard size={19} />}
              {submitting ? t.registering : t.confirmSale}
            </button>
          </div>
        </section>

        {/* History */}
        <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><ReceiptText size={22} /></span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t.recentSales}</h2>
                <p className="text-xs text-slate-500">{t.salesSummary}</p>
              </div>
            </div>
            <button type="button" aria-label={t.refreshSales} title={t.refreshSales} onClick={() => void loadSales()} disabled={loading} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
          </div>
          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-slate-500"><Loader2 size={25} className="animate-spin" /><p className="text-sm">{t.loadingSales}</p></div>
          ) : sales.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-5 text-center text-slate-500"><ReceiptText size={28} className="text-slate-300" /><p className="text-sm">{t.noSales}</p></div>
          ) : (
            <div className="max-h-[610px] divide-y divide-slate-100 overflow-y-auto">
              {sales.slice(0, 10).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between gap-3 px-6 py-4 transition hover:bg-slate-50/70">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={19} /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{t.sale} #{sale.id}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{sale.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0} {t.units}</p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm font-bold text-slate-900">{money(sale.total)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-xs font-medium text-slate-500">
            {language === "es" ? "Mostrando hasta 10 ventas recientes" : "Showing up to 10 recent sales"}
          </div>
        </section>
      </div>
    </div>
  );
}
