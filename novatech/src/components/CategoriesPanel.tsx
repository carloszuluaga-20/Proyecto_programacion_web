
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FolderOpen,
  Tags,
  ArrowUpRight,
  Layers3,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type Language = "es" | "en";

type CategoriesPanelProps = {
  onCategoriesChanged?: () => Promise<void> | void;
};

const translations = {
  es: {
    title: "Categorías",
    description: "Organiza y administra las categorías de tus productos.",
    newCategory: "Nueva categoría",
    editCategory: "Editar categoría",
    deleteCategory: "Eliminar categoría",
    totalCategories: "Total de categorías",
    heroEyebrow: "ORGANIZACIÓN DEL INVENTARIO",
    heroTitle: "Todo en su lugar.",
    heroSubtitle: "Crea y organiza las categorías que mantienen tu inventario bajo control.",
    results: "Categorías visibles",
    categoryList: "Lista de categorías",
    listDescription: "Consulta y administra tus categorías.",
    search: "Buscar categoría...",
    refresh: "Actualizar categorías",
    loading: "Cargando categorías...",
    noResults: "No se encontraron categorías.",
    noCategories: "Todavía no hay categorías.",
    tryAnother: "Prueba con otro nombre.",
    createFirst: "Crea tu primera categoría para organizar el inventario.",
    name: "Nombre",
    actions: "Acciones",
    formDescription: "Ingresa el nombre de la categoría.",
    categoryName: "Nombre de la categoría",
    example: "Ejemplo: Teclados",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    deleting: "Eliminando...",
    delete: "Eliminar",
    close: "Cerrar formulario",
    deleteConfirmation: "¿Estás seguro de que deseas eliminar la categoría",
    deleteNote: "Las categorías con productos asociados no se pueden eliminar.",
    nameRequired: "Debes escribir el nombre de la categoría.",
    nameTooLong: "El nombre no puede superar los 100 caracteres.",
    created: "Categoría creada correctamente.",
    updated: "Categoría actualizada correctamente.",
    deleted: "Categoría eliminada correctamente.",
    loadError: "No se pudieron cargar las categorías.",
    invalidResponse: "La respuesta de categorías no es válida.",
    saveError: "No se pudo guardar la categoría.",
    deleteError: "No se pudo eliminar la categoría.",
    unexpectedLoad: "Ocurrió un error al cargar las categorías.",
    unexpectedSave: "Ocurrió un error al guardar la categoría.",
    unexpectedDelete: "Ocurrió un error al eliminar la categoría.",
    alreadyExists: "Esta categoría ya existe.",
    hasProducts: "No puedes eliminar una categoría con productos asociados.",
  },
  en: {
    title: "Categories",
    description: "Organize and manage your product categories.",
    newCategory: "New category",
    editCategory: "Edit category",
    deleteCategory: "Delete category",
    totalCategories: "Total categories",
    heroEyebrow: "INVENTORY ORGANIZATION",
    heroTitle: "Everything in its place.",
    heroSubtitle: "Create and organize the categories that keep your inventory under control.",
    results: "Visible categories",
    categoryList: "Category list",
    listDescription: "View and manage your categories.",
    search: "Search categories...",
    refresh: "Refresh categories",
    loading: "Loading categories...",
    noResults: "No categories found.",
    noCategories: "There are no categories yet.",
    tryAnother: "Try another name.",
    createFirst: "Create your first category to organize your inventory.",
    name: "Name",
    actions: "Actions",
    formDescription: "Enter the category name.",
    categoryName: "Category name",
    example: "Example: Keyboards",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    deleting: "Deleting...",
    delete: "Delete",
    close: "Close form",
    deleteConfirmation: "Are you sure you want to delete the category",
    deleteNote: "Categories with associated products cannot be deleted.",
    nameRequired: "You must enter a category name.",
    nameTooLong: "The name cannot exceed 100 characters.",
    created: "Category created successfully.",
    updated: "Category updated successfully.",
    deleted: "Category deleted successfully.",
    loadError: "Could not load categories.",
    invalidResponse: "The categories response is invalid.",
    saveError: "Could not save the category.",
    deleteError: "Could not delete the category.",
    unexpectedLoad: "An error occurred while loading categories.",
    unexpectedSave: "An error occurred while saving the category.",
    unexpectedDelete: "An error occurred while deleting the category.",
    alreadyExists: "This category already exists.",
    hasProducts: "You cannot delete a category with associated products.",
  },
};

function getApiError(
  data: unknown,
  fallback: string,
  language: Language,
) {
  if (
    typeof data !== "object" ||
    data === null ||
    !("error" in data) ||
    typeof data.error !== "string"
  ) {
    return fallback;
  }

  const error = data.error.toLowerCase();
  const t = translations[language];

  if (
    error.includes("already exists") ||
    error.includes("duplicate") ||
    error.includes("unique")
  ) {
    return t.alreadyExists;
  }

  if (
    error.includes("associated") ||
    error.includes("products") ||
    error.includes("in use")
  ) {
    return t.hasProducts;
  }

  if (
    error.includes("required") ||
    error.includes("empty")
  ) {
    return t.nameRequired;
  }

  if (
    error.includes("100 characters") ||
    error.includes("too long")
  ) {
    return t.nameTooLong;
  }

  return fallback;
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export default function CategoriesPanel({
  onCategoriesChanged,
}: CategoriesPanelProps) {
  const [language, setLanguage] = useState<Language>("es");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");

  const [categoryToDelete, setCategoryToDelete] =
    useState<Category | null>(null);

  const t = translations[language];

  // Listen for language changes from Settings.
  useEffect(() => {
    function updateLanguage() {
      try {
        const saved = window.localStorage.getItem("novatech_language");

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
        updateLanguage();
      }
    }

    updateLanguage();

    window.addEventListener(
      "novatech-language-change",
      handleLanguageChange,
    );

    window.addEventListener("storage", updateLanguage);

    return () => {
      window.removeEventListener(
        "novatech-language-change",
        handleLanguageChange,
      );

      window.removeEventListener("storage", updateLanguage);
    };
  }, []);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/categories", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiError(data, translations[language].loadError, language),
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(translations[language].invalidResponse);
      }

      const validCategories = data.filter(
        (item): item is Category =>
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "number" &&
          typeof item.name === "string",
      );

      setCategories(
        [...validCategories].sort((a, b) =>
          a.name.localeCompare(
            b.name,
            language === "es" ? "es" : "en",
          ),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : translations[language].unexpectedLoad,
      );
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase().trim()),
  );

  function openCreate() {
    setEditingId(null);
    setName("");
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setName("");
  }

  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      setError(t.nameRequired);
      return;
    }

    if (cleanName.length > 100) {
      setError(t.nameTooLong);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEditing = editingId !== null;

      const url = isEditing
        ? `/api/categories/${editingId}`
        : "/api/categories";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, t.saveError, language));
      }

      setShowForm(false);
      setEditingId(null);
      setName("");

      await loadCategories();

      if (onCategoriesChanged) {
        await onCategoriesChanged();
      }

      setSuccess(isEditing ? t.updated : t.created);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.unexpectedSave,
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory() {
    if (!categoryToDelete) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/categories/${categoryToDelete.id}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(getApiError(data, t.deleteError, language));
      }

      setCategoryToDelete(null);

      await loadCategories();

      if (onCategoriesChanged) {
        await onCategoriesChanged();
      }

      setSuccess(t.deleted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.unexpectedDelete,
      );
      setCategoryToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-7 pb-8">
      {/* Hero: visual language shared with NovaTech Dashboard */}
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#142e65] via-[#1c49a5] to-[#2563eb] px-6 py-9 text-white shadow-[0_18px_35px_-18px_rgba(30,64,175,0.5)] sm:px-10 sm:py-11">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-36 h-80 w-80 rounded-full border-[45px] border-white/5" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-44 right-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.15em] text-white/90">
              <Sparkles size={14} /> {t.heroEyebrow}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.heroTitle}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">{t.heroSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-blue-700 shadow-lg shadow-blue-950/10 transition hover:bg-blue-50"
          >
            <Plus size={18} /> {t.newCategory} <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle size={20} className="shrink-0" /> <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          <CheckCircle2 size={20} className="shrink-0" /> <span>{success}</span>
        </div>
      )}

      {/* Overview metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="novatech-card flex items-center justify-between p-6 sm:p-7">
          <div>
            <p className="text-sm font-medium text-slate-500">{t.totalCategories}</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">{loading ? "..." : categories.length}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Layers3 size={27} />
          </div>
        </section>
        <section className="novatech-card flex items-center justify-between p-6 sm:p-7">
          <div>
            <p className="text-sm font-medium text-slate-500">{t.results}</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">{loading ? "..." : filteredCategories.length}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Tags size={27} />
          </div>
        </section>
      </div>

      {/* Searchable category directory */}
      <section className="novatech-card overflow-hidden">
        <div className="flex flex-col gap-5 border-b border-slate-100 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FolderOpen size={21} /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">{t.categoryList}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{t.listDescription}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-none">
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
                aria-label={t.search}
                className="novatech-input !py-3 !pl-11 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => void loadCategories()}
              disabled={loading}
              title={t.refresh}
              aria-label={t.refresh}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={28} className="animate-spin text-blue-600" />
            <p className="text-sm">{t.loading}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><FolderOpen size={31} /></div>
            <p className="font-bold text-slate-800">{search ? t.noResults : t.noCategories}</p>
            <p className="text-sm text-slate-500">{search ? t.tryAnother : t.createFirst}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-slate-50/90 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-7 py-4">ID</th>
                  <th className="px-7 py-4">{t.name}</th>
                  <th className="px-7 py-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="group transition hover:bg-blue-50/30">
                    <td className="px-7 py-4 font-medium text-slate-400">#{category.id}</td>
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600"><FolderOpen size={19} /></div>
                        <span className="font-semibold text-slate-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-7 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          title={t.editCategory}
                          aria-label={`${t.editCategory}: ${category.name}`}
                          className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-blue-600 transition hover:bg-blue-100"
                        ><Pencil size={17} /></button>
                        <button
                          type="button"
                          onClick={() => {
                            setError("");
                            setSuccess("");
                            setCategoryToDelete(category);
                          }}
                          title={t.deleteCategory}
                          aria-label={`${t.deleteCategory}: ${category.name}`}
                          className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                        ><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-7 py-4 text-xs font-medium text-slate-500">
          <span>{t.results}</span>
          <span className="rounded-lg bg-white px-3 py-1.5 text-slate-700 shadow-sm">{loading ? "..." : filteredCategories.length}</span>
        </div>
      </section>

      {/* Create / edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="w-full max-w-md rounded-[26px] border border-slate-100 bg-white p-7 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="category-form-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {editingId !== null
                    ? t.editCategory
                    : t.newCategory}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t.formDescription}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label={t.close}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCategory} className="space-y-5">
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  {t.categoryName}
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.example}
                  maxLength={100}
                  required
                  autoFocus
                  disabled={saving}
                  className="novatech-input text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="novatech-button-primary text-sm disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Check size={17} />
                  )}

                  {saving ? t.saving : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            aria-describedby="delete-category-description"
            className="w-full max-w-md rounded-[26px] border border-slate-100 bg-white p-7 shadow-2xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={24} />
            </div>

            <h2
              id="delete-category-title"
              className="text-xl font-bold text-slate-900"
            >
              {t.deleteCategory}
            </h2>

            <p
              id="delete-category-description"
              className="mt-3 text-sm leading-6 text-slate-600"
            >
              {t.deleteConfirmation}{" "}
              <strong>{categoryToDelete.name}</strong>?
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {t.deleteNote}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                onClick={() => void deleteCategory()}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}

                {deleting ? t.deleting : t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
