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
      setError("\u0423\u043a\u0430\u0436\u0438 \u0438 URL, \u0438 \u043a\u043b\u044e\u0447.");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/listings?select=id&limit=1`, {
        headers: { apikey: key.trim(), Authorization: `Bearer ${key.trim()}` },
      });
      if (!res.ok) throw new Error("\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c\u0441\u044f. \u041f\u0440\u043e\u0432\u0435\u0440\u044c URL \u0438 \u043a\u043b\u044e\u0447.");
      onConnect({ url: cleanUrl, key: key.trim() });
    } catch (e) {
      setError(e.message || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c\u0441\u044f.");
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
          \u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438 \u0431\u0430\u0437\u0443 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439 \u0432 Supabase, \u0447\u0442\u043e\u0431\u044b \u043d\u0430\u0447\u0430\u0442\u044c.
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
          \u041d\u0430\u0439\u0434\u0451\u0448\u044c \u0432 Project Settings \u2192 API. \u041a\u043b\u044e\u0447 \u0445\u0440\u0430\u043d\u0438\u0442\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u0432 \u044d\u0442\u043e\u0439 \u0441\u0435\u0441\u0441\u0438\u0438.
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
          {testing ? "\u041f\u0440\u043e\u0432\u0435\u0440\u044f\u044e..." : "\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c"}
        </button>
      </div>
    </div>
  );
}

function StatusPill({ value }) {
  const map = {
    active: { label: "\u0410\u043a\u0442\u0438\u0432\u043d\u043e", bg: "#DCEAE3", fg: "#1B4B4C" },
    paused: { label: "\u041f\u0430\u0443\u0437\u0430", bg: "#F0E9D8", fg: "#8A6D1F" },
    booked: { label: "\u0417\u0430\u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u043e", bg: "#F3B8A6", fg: "#8A3A22" },
    archived: { label: "\u0410\u0440\u0445\u0438\u0432", bg: "#E5E5E2", fg: "#6B6B66" },
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
    pending: { bg: "#EAE3D3", fg: "#8A7B4F", label: "\u041e\u0436\u0438\u0434\u0430\u0435\u0442" },
    synced: { bg: "#DCEAE3", fg: "#1B4B4C", label: "\u0421\u0438\u043d\u0445\u0440." },
    error: { bg: "#F3B8A6", fg: "#8A3A22", label: "\u041e\u0448\u0438\u0431\u043a\u0430" },
    none: { bg: "#F0EEE7", fg: "#A6ADA9", label: "\u041d\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e" },
  };
  const s = syncMap[status] || syncMap.none;
  return (
    <button
      onClick={onCycle}
      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs w-full"
      style={{ background: s.bg, color: s.fg }}
      title="\u041d\u0430\u0436\u043c\u0438, \u0447\u0442\u043e\u0431\u044b \u0441\u043c\u0435\u043d\u0438\u0442\u044c \u0441\u0442\u0430\u0442\u0443\u0441"
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
      setError(e.message || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0444\u043e\u0442\u043e");
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
      setError(e.message || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0444\u043e\u0442\u043e");
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
      setError(e.message || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0444\u043e\u0442\u043e");
    }
  };

  return (
    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${COLORS.ivoryDim}` }}>
      <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: "#5B6664" }}>
        \u0424\u043e\u0442\u043e
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
        {uploading ? "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044e..." : "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0444\u043e\u0442\u043e"}
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
      <div className="flex gap-3">{field("\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a RU", "title_ru")}</div>
      <div className="flex gap-3">{field("\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a EN", "title_en")}</div>
      <div className="flex gap-3">
        {field("\u0421\u0434\u0435\u043b\u043a\u0430", "deal_type", {
          half: true,
          select: true,
          options: [
            { value: "rent", label: "\u0410\u0440\u0435\u043d\u0434\u0430" },
            { value: "sale", label: "\u041f\u0440\u043e\u0434\u0430\u0436\u0430" },
          ],
        })}
        {field("\u0422\u0438\u043f", "property_type", {
          half: true,
          select: true,
          options: [
            { value: "apartment", label: "\u041a\u0432\u0430\u0440\u0442\u0438\u0440\u0430" },
            { value: "house", label: "\u0414\u043e\u043c" },
            { value: "commercial", label: "\u041a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a\u0430\u044f" },
          ],
        })}
      </div>
      <div className="flex gap-3">
        {field("\u0420\u0430\u0439\u043e\u043d", "district", { half: true })}
        {field("\u0410\u0434\u0440\u0435\u0441", "address", { half: true })}
      </div>
      <div className="flex gap-3">
        {field("\u041f\u043b\u043e\u0449\u0430\u0434\u044c, \u043c\u00b2", "area_sqm", { half: true, type: "number" })}
        {field("\u041a\u043e\u043c\u043d\u0430\u0442", "rooms", { half: true, type: "number" })}
      </div>
      <div className="flex gap-3">
        {field("\u042d\u0442\u0430\u0436", "floor", { half: true, type: "number" })}
        {field("\u042d\u0442\u0430\u0436\u0435\u0439 \u0432\u0441\u0435\u0433\u043e", "total_floors", { half: true, type: "number" })}
      </div>
      <div className="flex gap-3">
        {field("\u0426\u0435\u043d\u0430", "price", { half: true, type: "number" })}
        {field("\u0412\u0430\u043b\u044e\u0442\u0430", "currency", {
          half: true,
          select: true,
          options: [
            { value: "USD", label: "USD" },
            { value: "GEL", label: "GEL" },
            { value: "EUR", label: "EUR" },
          ],
        })}
      </div>
      {field("\u0421\u0442\u0430\u0442\u0443\u0441", "status", {
        select: true,
        options: [
          { value: "active", label: "\u0410\u043a\u0442\u0438\u0432\u043d\u043e" },
          { value: "paused", label: "\u041f\u0430\u0443\u0437\u0430" },
          { value: "booked", label: "\u0417\u0430\u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u043e" },
          { value: "archived", label: "\u0410\u0440\u0445\u0438\u0432" },
        ],
      })}

      {form.id ? (
        <PhotosSection listingId={form.id} config={config} call={call} uploadFile={uploadFile} deleteFile={deleteFile} />
      ) : (
        <p className="text-xs pt-2" style={{ color: "#8A928F" }}>
          \u0424\u043e\u0442\u043e \u043c\u043e\u0436\u043d\u043e \u0431\u0443\u0434\u0435\u0442 \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u0441\u043b\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u044f.
        </p>
      )}

      <div className="flex gap-2 pt-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: COLORS.ivoryDim, color: COLORS.ink }}
        >
          {form.id ? "\u0417\u0430\u043a\u0440\u044b\u0442\u044c" : "\u041e\u0442\u043c\u0435\u043d\u0430"}
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: COLORS.coral, color: "#fff", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
          \u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c
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
      setError(e.message || "\u041e\u0448\u0438\u0431\u043a\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438");
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
      setError(e.message || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c");
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
      setError(e.message || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c");
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
      setError(e.message || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0441\u0442\u0430\u0442\u0443\u0441");
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
              \u041e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u044f
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
              title="\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} color={COLORS.petrol} />
            </button>
            <button
              onClick={() => setEditing("new")}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: COLORS.coral }}
              title="\u041d\u043e\u0432\u043e\u0435 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0435"
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
                {editing === "new" ? "\u041d\u043e\u0432\u043e\u0435 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0435" : "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c"}
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
              \u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439. \u0414\u043e\u0431\u0430\u0432\u044c \u043f\u0435\u0440\u0432\u043e\u0435.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="p-4 rounded-xl" style={{ background: "#fff", border: `1px solid ${COLORS.ivoryDim}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-medium" style={{ color: COLORS.petrolDark }}>
                    {l.title_ru || l.title_en || "\u0411\u0435\u0437 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044f"}
                  </h3>
                  <p className="text-xs flex items-center gap-1" style={{ color: "#8A928F" }}>
                    {l.district || "\u2014"} \u00b7 {l.rooms ? `${l.rooms} \u043a\u043e\u043c\u043d.` : ""} {l.area_sqm ? `\u00b7 ${l.area_sqm} \u043c\u00b2` : ""}
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
                  {l.price ? `${l.price} ${l.currency}` : "\u2014"}
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
