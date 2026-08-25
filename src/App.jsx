import { useState, useEffect, useCallback } from "react";
import { Plus, X, Trash2, Pencil, RefreshCw, Link2, Check, AlertCircle, Home } from "lucide-react";

const COLORS = {
  petrol: "#1B4B4C",
  petrolDark: "#0F3435",
  coral: "#E8674A",
  coralSoft: "#F3B8A6",
  ivory: "#F6F2E9",
  ivoryDim: "#EAE3D3",
  ink: "#1C2321",
};

const PLATFORMS = [
  { key: "myhome", label: "myHome.ge" },
  { key: "ss", label: "SS.ge" },
  { key: "korter", label: "Korter.ge" },
];

const EMPTY_LISTING = {
  title_ru: "",
  title_en: "",
  deal_type: "rent",
  property_type: "apartment",
  district: "",
  address: "",
  area_sqm: "",
  rooms: "",
  floor: "",
  total_floors: "",
  price: "",
  currency: "USD",
  status: "active",
};

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

function useSupabase(config) {
  const headers = config.url
    ? {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
      }
    : null;

  const call = useCallback(
    async (path, options = {}) => {
      if (!config.url) throw new Error("Not connected");
      const res = await fetch(`${config.url}/rest/v1/${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status} ${text}`);
      }
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) return res.json();
      return null;
    },
    [config.url, config.key]
  );

  return { call };
}

function ConnectScreen({ onConnect }) {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);

  const handleConnect = async () => {
    setError("");
    const cleanUrl = url.trim().replace(/\/+$/, "");
    if (!cleanUrl || !key.trim()) {
      setError("Укажи и URL, и ключ.");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/listings?select=id&limit=1`, {
        headers: { apikey: key.trim(), Authorization: `Bearer ${key.trim()}` },
      });
      if (!res.ok) throw new Error("Не удалось подключиться. Проверь URL и ключ.");
      onConnect({ url: cleanUrl, key: key.trim() });
    } catch (e) {
      setError(e.message || "Не удалось подключиться.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      style={{ background: COLORS.ivory, color: COLORS.ink, minHeight: "100vh" }}
      className="flex items-center justify-center p-6"
    >
      <div className="w-full max-w-sm">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center mb-6"
          style={{ background: COLORS.petrol }}
        >
          <Home size={20} color={COLORS.ivory} strokeWidth={1.75} />
        </div>
        <h1
          className="text-2xl mb-1 tracking-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: COLORS.petrolDark }}
        >
          Property Advisory Batumi
        </h1>
        <p className="text-sm mb-8" style={{ color: "#5B6664" }}>
          Подключи базу объявлений в Supabase, чтобы начать.
        </p>

        <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "#5B6664" }}>
          Project URL
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://xxxxx.supabase.co"
          className="w-full mb-4 px-3.5 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: "#fff", border: `1px solid ${COLORS.ivoryDim}` }}
        />

        <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "#5B6664" }}>
          Anon public key
        </label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="eyJhbGciOi..."
          type="password"
          className="w-full mb-2 px-3.5 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: "#fff", border: `1px solid ${COLORS.ivoryDim}` }}
        />
        <p className="text-xs mb-5" style={{ color: "#8A928F" }}>
          Найдёшь в Project Settings → API. Ключ хранится только в этой сессии.
        </p>

        {error && (
          <div className="flex items-start gap-2 mb-4 text-sm" style={{ color: COLORS.coral }}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={testing}
          className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-opacity"
          style={{ background: COLORS.coral, color: "#fff", opacity: testing ? 0.7 : 1 }}
        >
          {testing ? <RefreshCw size={15} className="animate-spin" /> : <Link2 size={15} />}
          {testing ? "Проверяю..." : "Подключить"}
        </button>
      </div>
    </div>
  );
}

function StatusPill({ value }) {
  const map = {
    active: { label: "Активно", bg: "#DCEAE3", fg: "#1B4B4C" },
    paused: { label: "Пауза", bg: "#F0E9D8", fg: "#8A6D1F" },
    booked: { label: "Забронировано", bg: "#F3B8A6", fg: "#8A3A22" },
    archived: { label: "Архив", bg: "#E5E5E2", fg: "#6B6B66" },
  };
  const s = map[value] || map.active;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

function PlatformBadge({ platform, status, onCycle }) {
  const syncMap = {
    pending: { bg: "#EAE3D3", fg: "#8A7B4F", label: "Ожидает" },
    synced: { bg: "#DCEAE3", fg: "#1B4B4C", label: "Синхр." },
    error: { bg: "#F3B8A6", fg: "#8A3A22", label: "Ошибка" },
    none: { bg: "#F0EEE7", fg: "#A6ADA9", label: "Не добавлено" },
  };
  const s = syncMap[status] || syncMap.none;
  return (
    <button
      onClick={onCycle}
      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs w-full"
      style={{ background: s.bg, color: s.fg }}
      title="Нажми, чтобы сменить статус"
    >
      <span className="font-medium">{platform}</span>
      <span>{s.label}</span>
    </button>
  );
}

function ListingForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_LISTING);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const field = (label, key, opts = {}) => (
    <div className={opts.half ? "w-1/2" : "w-full"}>
      <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#5B6664" }}>
        {label}
      </label>
      {opts.select ? (
        <select
          value={form[key]}
          onChange={set(key)}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none bg-white"
          style={{ border: `1px solid ${COLORS.ivoryDim}` }}
        >
          {opts.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={form[key] ?? ""}
          onChange={set(key)}
          type={opts.type || "text"}
          placeholder={opts.placeholder}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ border: `1px solid ${COLORS.ivoryDim}` }}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-3">{field("Заголовок RU", "title_ru")}</div>
      <div className="flex gap-3">{field("Заголовок EN", "title_en")}</div>
      <div className="flex gap-3">
        {field("Сделка", "deal_type", {
          half: true,
          select: true,
          options: [
            { value: "rent", label: "Аренда" },
            { value: "sale", label: "Продажа" },
          ],
        })}
        {field("Тип", "property_type", {
          half: true,
          select: true,
          options: [
            { value: "apartment", label: "Квартира" },
            { value: "house", label: "Дом" },
            { value: "commercial", label: "Коммерческая" },
          ],
        })}
      </div>
      <div className="flex gap-3">
        {field("Район", "district", { half: true })}
        {field("Адрес", "address", { half: true })}
      </div>
      <div className="flex gap-3">
        {field("Площадь, м²", "area_sqm", { half: true, type: "number" })}
        {field("Комнат", "rooms", { half: true, type: "number" })}
      </div>
      <div className="flex gap-3">
        {field("Этаж", "floor", { half: true, type: "number" })}
        {field("Этажей всего", "total_floors", { half: true, type: "number" })}
      </div>
      <div className="flex gap-3">
        {field("Цена", "price", { half: true, type: "number" })}
        {field("Валюта", "currency", {
          half: true,
          select: true,
          options: [
            { value: "USD", label: "USD" },
            { value: "GEL", label: "GEL" },
            { value: "EUR", label: "EUR" },
          ],
        })}
      </div>
      {field("Статус", "status", {
        select: true,
        options: [
          { value: "active", label: "Активно" },
          { value: "paused", label: "Пауза" },
          { value: "booked", label: "Забронировано" },
          { value: "archived", label: "Архив" },
        ],
      })}

      <div className="flex gap-2 pt-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: COLORS.ivoryDim, color: COLORS.ink }}
        >
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: COLORS.coral, color: "#fff", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
          Сохранить
        </button>
      </div>
    </div>
  );
}

export default function ListingsManager() {
  const [config, setConfig] = useState({ url: "", key: "" });
  const [listings, setListings] = useState([]);
  const [platformStatus, setPlatformStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { call } = useSupabase(config);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const ls = await call("listings?select=*&order=created_at.desc");
      setListings(ls || []);
      const ps = await call("listing_platform_status?select=*");
      const grouped = {};
      (ps || []).forEach((row) => {
        grouped[row.listing_id] = grouped[row.listing_id] || {};
        grouped[row.listing_id][row.platform] = row.sync_status;
      });
      setPlatformStatus(grouped);
    } catch (e) {
      setError(e.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    if (config.url) loadAll();
  }, [config.url, loadAll]);

  const saveListing = async (form) => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        area_sqm: form.area_sqm === "" ? null : Number(form.area_sqm),
        rooms: form.rooms === "" ? null : Number(form.rooms),
        floor: form.floor === "" ? null : Number(form.floor),
        total_floors: form.total_floors === "" ? null : Number(form.total_floors),
        price: form.price === "" ? null : Number(form.price),
      };
      if (form.id) {
        await call(`listings?id=eq.${form.id}`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(payload),
        });
      } else {
        delete payload.id;
        await call("listings", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      await loadAll();
    } catch (e) {
      setError(e.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  const deleteListing = async (id) => {
    setError("");
    try {
      await call(`listings?id=eq.${id}`, { method: "DELETE" });
      await loadAll();
    } catch (e) {
      setError(e.message || "Не удалось удалить");
    }
  };

  const cyclePlatform = async (listingId, platform) => {
    const current = platformStatus[listingId]?.[platform] || "none";
    const order = ["none", "pending", "synced", "error"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    setError("");
    try {
      if (current === "none") {
        await call("listing_platform_status", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ listing_id: listingId, platform, sync_status: next }),
        });
      } else if (next === "none") {
        await call(
          `listing_platform_status?listing_id=eq.${listingId}&platform=eq.${platform}`,
          { method: "DELETE" }
        );
      } else {
        await call(
          `listing_platform_status?listing_id=eq.${listingId}&platform=eq.${platform}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              sync_status: next,
              last_synced_at: next === "synced" ? new Date().toISOString() : null,
            }),
          }
        );
      }
      await loadAll();
    } catch (e) {
      setError(e.message || "Не удалось обновить статус");
    }
  };

  if (!config.url) {
    return <ConnectScreen onConnect={setConfig} />;
  }

  return (
    <div style={{ background: COLORS.ivory, color: COLORS.ink, minHeight: "100vh" }}>
      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl tracking-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: COLORS.petrolDark }}
            >
              Объявления
            </h1>
            <p className="text-xs" style={{ color: "#8A928F" }}>
              Property Advisory Batumi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "#fff", border: `1px solid ${COLORS.ivoryDim}` }}
              title="Обновить"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} color={COLORS.petrol} />
            </button>
            <button
              onClick={() => setEditing("new")}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: COLORS.coral }}
              title="Новое объявление"
            >
              <Plus size={17} color="#fff" />
            </button>
          </div>
        </div>

        {error && (
          <div
            className="flex items-start gap-2 mb-4 text-sm p-3 rounded-lg"
            style={{ background: "#F3B8A6", color: "#8A3A22" }}
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {editing && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: "#fff", border: `1px solid ${COLORS.ivoryDim}` }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium" style={{ color: COLORS.petrolDark }}>
                {editing === "new" ? "Новое объявление" : "Редактировать"}
              </h2>
              <button onClick={() => setEditing(null)}>
                <X size={16} color="#8A928F" />
              </button>
            </div>
            <ListingForm
              initial={editing === "new" ? EMPTY_LISTING : editing}
              onSave={saveListing}
              onCancel={() => setEditing(null)}
              saving={saving}
            />
          </div>
        )}

        {!loading && listings.length === 0 && !editing && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "#8A928F" }}>
              Пока нет объявлений. Добавь первое.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {listings.map((l) => (
            <div
              key={l.id}
              className="p-4 rounded-xl"
              style={{ background: "#fff", border: `1px solid ${COLORS.ivoryDim}` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-medium" style={{ color: COLORS.petrolDark }}>
                    {l.title_ru || l.title_en || "Без названия"}
                  </h3>
                  <p className="text-xs" style={{ color: "#8A928F" }}>
                    {l.district || "—"} · {l.rooms ? `${l.rooms} комн.` : ""}{" "}
                    {l.area_sqm ? `· ${l.area_sqm} м²` : ""}
                  </p>
                </div>
                <StatusPill value={l.status} />
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-medium" style={{ color: COLORS.coral }}>
                  {l.price ? `${l.price} ${l.currency}` : "—"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(l)} className="p-1.5 rounded-md" style={{ background: COLORS.ivory }}>
                    <Pencil size={14} color={COLORS.petrol} />
                  </button>
                  <button
                    onClick={() => deleteListing(l.id)}
                    className="p-1.5 rounded-md"
                    style={{ background: COLORS.ivory }}
                  >
                    <Trash2 size={14} color={COLORS.coral} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {PLATFORMS.map((p) => (
                  <PlatformBadge
                    key={p.key}
                    platform={p.label}
                    status={platformStatus[l.id]?.[p.key] || "none"}
                    onCycle={() => cyclePlatform(l.id, p.key)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
