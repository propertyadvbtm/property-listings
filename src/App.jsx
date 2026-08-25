import { useState, useEffect, useCallback } from "react";
import { Plus, X, Trash2, Pencil, RefreshCw, Link2, Check, AlertCircle, Home, Upload, Image as ImageIcon } from "lucide-react";

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

const BUCKET = "listing-photos";

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

  const uploadFile = useCallback(
    async (path, file) => {
      if (!config.url) throw new Error("Not connected");
      const res = await fetch(`${config.url}/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status} ${text}`);
      }
      return `${config.url}/storage/v1/object/public/${BUCKET}/${path}`;
    },
    [config.url, config.key]
  );

  const deleteFile = useCallback(
    async (path) => {
      if (!config.url) throw new Error("Not connected");
      await fetch(`${config.url}/storage/v1/object/${BUCKET}/${path}`, {
        method: "DELETE",
        headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
      });
    },
    [config.url, config.key]
  );

  return { call, uploadFile, deleteFile };
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
      setError("Ð£ÐºÐ°Ð¶Ð¸ Ð¸ URL, Ð¸ ÐºÐ»ÑÑ.");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/listings?select=id&limit=1`, {
        headers: { apikey: key.trim(), Authorization: `Bearer ${key.trim()}` },
      });
      if (!res.ok) throw new Error("ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð¿Ð¾Ð´ÐºÐ»ÑÑÐ¸ÑÑÑÑ. ÐÑÐ¾Ð²ÐµÑÑ URL Ð¸ ÐºÐ»ÑÑ.");
      onConnect({ url: cleanUrl, key: key.trim() });
    } catch (e) {
      setError(e.message || "ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð¿Ð¾Ð´ÐºÐ»ÑÑÐ¸ÑÑÑÑ.");
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
          ÐÐ¾Ð´ÐºÐ»ÑÑÐ¸ Ð±Ð°Ð·Ñ Ð¾Ð±ÑÑÐ²Ð»ÐµÐ½Ð¸Ð¹ Ð² Supabase, ÑÑÐ¾Ð±Ñ Ð½Ð°ÑÐ°ÑÑ.
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
          ÐÐ°Ð¹Ð´ÑÑÑ Ð² Project Settings â API. ÐÐ»ÑÑ ÑÑÐ°Ð½Ð¸ÑÑÑ ÑÐ¾Ð»ÑÐºÐ¾ Ð² ÑÑÐ¾Ð¹ ÑÐµÑÑÐ¸Ð¸.
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
          {testing ? "ÐÑÐ¾Ð²ÐµÑÑÑ..." : "ÐÐ¾Ð´ÐºÐ»ÑÑÐ¸ÑÑ"}
        </button>
      </div>
    </div>
  );
}

function StatusPill({ value }) {
  const map = {
    active: { label: "ÐÐºÑÐ¸Ð²Ð½Ð¾", bg: "#DCEAE3", fg: "#1B4B4C" },
    paused: { label: "ÐÐ°ÑÐ·Ð°", bg: "#F0E9D8", fg: "#8A6D1F" },
    booked: { label: "ÐÐ°Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¾", bg: "#F3B8A6", fg: "#8A3A22" },
    archived: { label: "ÐÑÑÐ¸Ð²", bg: "#E5E5E2", fg: "#6B6B66" },
  };
  const s = map[value] || map.active;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}

function PlatformBadge({ platform, status, onCycle }) {
  const syncMap = {
    pending: { bg: "#EAE3D3", fg: "#8A7B4F", label: "ÐÐ¶Ð¸Ð´Ð°ÐµÑ" },
    synced: { bg: "#DCEAE3", fg: "#1B4B4C", label: "Ð¡Ð¸Ð½ÑÑ." },
    error: { bg: "#F3B8A6", fg: "#8A3A22", label: "ÐÑÐ¸Ð±ÐºÐ°" },
    none: { bg: "#F0EEE7", fg: "#A6ADA9", label: "ÐÐµ Ð´Ð¾Ð±Ð°Ð²Ð»ÐµÐ½Ð¾" },
  };
  const s = syncMap[status] || syncMap.none;
  return (
    <button
      onClick={onCycle}
      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs w-full"
      style={{ background: s.bg, color: s.fg }}
      title="ÐÐ°Ð¶Ð¼Ð¸, ÑÑÐ¾Ð±Ñ ÑÐ¼ÐµÐ½Ð¸ÑÑ ÑÑÐ°ÑÑÑ"
    >
      <span className="font-medium">{platform}</span>
      <span>{s.label}</span>
    </button>
  );
}

function PhotosSection({ listingId, config, call, uploadFile, deleteFile }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await call(`listing_photos?listing_id=eq.${listingId}&select=*&order=sort_order.asc`);
      setPhotos(rows || []);
    } catch (e) {
      setError(e.message || "ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð·Ð°Ð³ÑÑÐ·Ð¸ÑÑ ÑÐ¾ÑÐ¾");
    } finally {
      setLoading(false);
    }
  }, [listingId, call]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${listingId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const url = await uploadFile(path, file);
        await call("listing_photos", {
          method: "POST",
          body: JSON.stringify({ listing_id: listingId, url, sort_order: photos.length }),
        });
      }
      await loadPhotos();
    } catch (e) {
      setError(e.message || "ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð·Ð°Ð³ÑÑÐ·Ð¸ÑÑ ÑÐ¾ÑÐ¾");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = async (photo) => {
    setError("");
    try {
      const path = photo.url.split(`/${BUCKET}/`)[1];
      if (path) await deleteFile(path);
      await call(`listing_photos?id=eq.${photo.id}`, { method: "DELETE" });
      await loadPhotos();
    } catch (e) {
      setError(e.message || "ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ ÑÐ´Ð°Ð»Ð¸ÑÑ ÑÐ¾ÑÐ¾");
    }
  };

  return (
    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${COLORS.ivoryDim}` }}>
      <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: "#5B6664" }}>
        Ð¤Ð¾ÑÐ¾
      </label>

      {error && (
        <div className="flex items-start gap-2 mb-3 text-xs" style={{ color: COLORS.coral }}>
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-3">
        {photos.map((p) => (
          <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden" style={{ background: COLORS.ivoryDim }}>
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(p)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "rgba(28,35,33,0.7)" }}
            >
              <X size={12} color="#fff" />
            </button>
          </div>
        ))}
        {loading && (
          <div className="aspect-square rounded-lg flex items-center justify-center" style={{ background: COLORS.ivoryDim }}>
            <RefreshCw size={16} className="animate-spin" color={COLORS.petrol} />
          </div>
        )}
      </div>

      <label
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
        style={{ background: COLORS.ivoryDim, color: COLORS.petrolDark }}
      >
        {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "ÐÐ°Ð³ÑÑÐ¶Ð°Ñ..." : "ÐÐ°Ð³ÑÑÐ·Ð¸ÑÑ ÑÐ¾ÑÐ¾"}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}

function ListingForm({ initial, onSave, onCancel, saving, config, call, uploadFile, deleteFile }) {
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
      <div className="flex gap-3">{field("ÐÐ°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº RU", "title_ru")}</div>
      <div className="flex gap-3">{field("ÐÐ°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº EN", "title_en")}</div>
      <div className="flex gap-3">
        {field("Ð¡Ð´ÐµÐ»ÐºÐ°", "deal_type", {
          half: true,
          select: true,
          options: [
            { value: "rent", label: "ÐÑÐµÐ½Ð´Ð°" },
            { value: "sale", label: "ÐÑÐ¾Ð´Ð°Ð¶Ð°" },
          ],
        })}
        {field("Ð¢Ð¸Ð¿", "property_type", {
          half: true,
          select: true,
          options: [
            { value: "apartment", label: "ÐÐ²Ð°ÑÑÐ¸ÑÐ°" },
            { value: "house", label: "ÐÐ¾Ð¼" },
            { value: "commercial", label: "ÐÐ¾Ð¼Ð¼ÐµÑÑÐµÑÐºÐ°Ñ" },
          ],
        })}
      </div>
      <div className="flex gap-3">
        {field("Ð Ð°Ð¹Ð¾Ð½", "district", { half: true })}
        {field("ÐÐ´ÑÐµÑ", "address", { half: true })}
      </div>
      <div className="flex gap-3">
        {field("ÐÐ»Ð¾ÑÐ°Ð´Ñ, Ð¼Â²", "area_sqm", { half: true, type: "number" })}
        {field("ÐÐ¾Ð¼Ð½Ð°Ñ", "rooms", { half: true, type: "number" })}
      </div>
      <div className="flex gap-3">
        {field("Ð­ÑÐ°Ð¶", "floor", { half: true, type: "number" })}
        {field("Ð­ÑÐ°Ð¶ÐµÐ¹ Ð²ÑÐµÐ³Ð¾", "total_floors", { half: true, type: "number" })}
      </div>
      <div className="flex gap-3">
        {field("Ð¦ÐµÐ½Ð°", "price", { half: true, type: "number" })}
        {field("ÐÐ°Ð»ÑÑÐ°", "currency", {
          half: true,
          select: true,
          options: [
            { value: "USD", label: "USD" },
            { value: "GEL", label: "GEL" },
            { value: "EUR", label: "EUR" },
          ],
        })}
      </div>
      {field("Ð¡ÑÐ°ÑÑÑ", "status", {
        select: true,
        options: [
          { value: "active", label: "ÐÐºÑÐ¸Ð²Ð½Ð¾" },
          { value: "paused", label: "ÐÐ°ÑÐ·Ð°" },
          { value: "booked", label: "ÐÐ°Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¾" },
          { value: "archived", label: "ÐÑÑÐ¸Ð²" },
        ],
      })}

      {form.id ? (
        <PhotosSection listingId={form.id} config={config} call={call} uploadFile={uploadFile} deleteFile={deleteFile} />
      ) : (
        <p className="text-xs pt-2" style={{ color: "#8A928F" }}>
          Ð¤Ð¾ÑÐ¾ Ð¼Ð¾Ð¶Ð½Ð¾ Ð±ÑÐ´ÐµÑ Ð´Ð¾Ð±Ð°Ð²Ð¸ÑÑ Ð¿Ð¾ÑÐ»Ðµ ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ Ð¾Ð±ÑÑÐ²Ð»ÐµÐ½Ð¸Ñ.
        </p>
      )}

      <div className="flex gap-2 pt-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: COLORS.ivoryDim, color: COLORS.ink }}
        >
          {form.id ? "ÐÐ°ÐºÑÑÑÑ" : "ÐÑÐ¼ÐµÐ½Ð°"}
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: COLORS.coral, color: "#fff", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
          Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ
        </button>
      </div>
    </div>
  );
}

export default function ListingsManager() {
  const [config, setConfig] = useState({ url: "", key: "" });
  const [listings, setListings] = useState([]);
  const [platformStatus, setPlatformStatus] = useState({});
  const [photoCounts, setPhotoCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { call, uploadFile, deleteFile } = useSupabase(config);

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
      const photos = await call("listing_photos?select=listing_id");
      const counts = {};
      (photos || []).forEach((p) => {
        counts[p.listing_id] = (counts[p.listing_id] || 0) + 1;
      });
      setPhotoCounts(counts);
    } catch (e) {
      setError(e.message || "ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸");
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
        await loadAll();
      } else {
        delete payload.id;
        const created = await call("listings", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(payload),
        });
        await loadAll();
        if (created && created[0]) {
          setEditing(created[0]);
          setSaving(false);
          return;
        }
      }
      setEditing(null);
    } catch (e) {
      setError(e.message || "ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ ÑÐ¾ÑÑÐ°Ð½Ð¸ÑÑ");
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
      setError(e.message || "ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ ÑÐ´Ð°Ð»Ð¸ÑÑ");
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
        await call(`listing_platform_status?listing_id=eq.${listingId}&platform=eq.${platform}`, {
          method: "DELETE",
        });
      } else {
        await call(`listing_platform_status?listing_id=eq.${listingId}&platform=eq.${platform}`, {
          method: "PATCH",
          body: JSON.stringify({
            sync_status: next,
            last_synced_at: next === "synced" ? new Date().toISOString() : null,
          }),
        });
      }
      await loadAll();
    } catch (e) {
      setError(e.message || "ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð¾Ð±Ð½Ð¾Ð²Ð¸ÑÑ ÑÑÐ°ÑÑÑ");
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
            <h1 className="text-xl tracking-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: COLORS.petrolDark }}>
              ÐÐ±ÑÑÐ²Ð»ÐµÐ½Ð¸Ñ
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
              title="ÐÐ±Ð½Ð¾Ð²Ð¸ÑÑ"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} color={COLORS.petrol} />
            </button>
            <button
              onClick={() => setEditing("new")}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: COLORS.coral }}
              title="ÐÐ¾Ð²Ð¾Ðµ Ð¾Ð±ÑÑÐ²Ð»ÐµÐ½Ð¸Ðµ"
            >
              <Plus size={17} color="#fff" />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 mb-4 text-sm p-3 rounded-lg" style={{ background: "#F3B8A6", color: "#8A3A22" }}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {editing && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: "#fff", border: `1px solid ${COLORS.ivoryDim}` }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium" style={{ color: COLORS.petrolDark }}>
                {editing === "new" ? "ÐÐ¾Ð²Ð¾Ðµ Ð¾Ð±ÑÑÐ²Ð»ÐµÐ½Ð¸Ðµ" : "Ð ÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°ÑÑ"}
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
              config={config}
              call={call}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
            />
          </div>
        )}

        {!loading && listings.length === 0 && !editing && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "#8A928F" }}>
              ÐÐ¾ÐºÐ° Ð½ÐµÑ Ð¾Ð±ÑÑÐ²Ð»ÐµÐ½Ð¸Ð¹. ÐÐ¾Ð±Ð°Ð²Ñ Ð¿ÐµÑÐ²Ð¾Ðµ.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="p-4 rounded-xl" style={{ background: "#fff", border: `1px solid ${COLORS.ivoryDim}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-medium" style={{ color: COLORS.petrolDark }}>
                    {l.title_ru || l.title_en || "ÐÐµÐ· Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ñ"}
                  </h3>
                  <p className="text-xs flex items-center gap-1" style={{ color: "#8A928F" }}>
                    {l.district || "â"} Â· {l.rooms ? `${l.rooms} ÐºÐ¾Ð¼Ð½.` : ""} {l.area_sqm ? `Â· ${l.area_sqm} Ð¼Â²` : ""}
                    {photoCounts[l.id] ? (
                      <span className="flex items-center gap-0.5 ml-1">
                        <ImageIcon size={11} /> {photoCounts[l.id]}
                      </span>
                    ) : null}
                  </p>
                </div>
                <StatusPill value={l.status} />
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-medium" style={{ color: COLORS.coral }}>
                  {l.price ? `${l.price} ${l.currency}` : "â"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(l)} className="p-1.5 rounded-md" style={{ background: COLORS.ivory }}>
                    <Pencil size={14} color={COLORS.petrol} />
                  </button>
                  <button onClick={() => deleteListing(l.id)} className="p-1.5 rounded-md" style={{ background: COLORS.ivory }}>
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
