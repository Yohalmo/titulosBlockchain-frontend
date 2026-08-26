import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const API = "http://localhost:3001/api";
const emptyForm = { codigo: "", titular: "", titulo: "", institucion: "", fechaInicio: "", fechaFin: "", fechaEmision: "", descripcion: "" };

function Icon({ name, size = 20 }) {
  const paths = {
    seal: <><path d="M12 3 4.5 7v5c0 4.6 3.2 7.7 7.5 9 4.3-1.3 7.5-4.4 7.5-9V7L12 3Z"/><path d="m9 12 2 2 4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>, search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    blocks: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="8.5" y="14" width="7" height="7" rx="1"/><path d="M6.5 10v2h11v-2M12 12v2"/></>,
    user: <><circle cx="12" cy="8" r="3"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></>,
    school: <><path d="m3 10 9-5 9 5-9 5-9-5Z"/><path d="M7 12.5V17c3 2.5 7 2.5 10 0v-4.5M21 10v6"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    arrow: <path d="m9 18 6-6-6-6"/>, check: <path d="m5 12 4 4L19 6"/>,
    file: <><path d="M6 2h8l4 4v16H6V2Z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></>,
    hash: <><path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16"/></>
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const shortHash = (hash = "") => !hash ? "—" : hash.length > 18 ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : hash;
function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [titles, setTitles] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [verification, setVerification] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState("register");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    const [titlesRes, blocksRes, verifyRes] = await Promise.all([fetch(`${API}/titulos`), fetch(`${API}/blocks`), fetch(`${API}/verify`)]);
    if (!titlesRes.ok || !blocksRes.ok || !verifyRes.ok) throw new Error("API no disponible");
    setTitles(await titlesRes.json()); setBlocks(await blocksRes.json()); setVerification(await verifyRes.json());
  }
  useEffect(() => { loadData().catch(() => setMessage("No se pudo conectar con el backend.")); }, []);
  const handleChange = ({ target }) => setForm({ ...form, [target.name]: target.value });

  async function submit(event) {
    event.preventDefault(); setSubmitting(true); setMessage("Registrando el título y realizando Proof of Work…");
    try {
      const response = await fetch(`${API}/titulos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "No se pudo registrar el título."); return; }
      setMessage(""); setForm(emptyForm); await loadData();
      await Swal.fire({
        icon: "success",
        title: "Título registrado",
        text: `La credencial fue añadida correctamente al bloque #${data.blockId}.`,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#0a2342",
        background: "#ffffff",
        color: "#050a14",
        customClass: {
          popup: "certificate-alert",
          confirmButton: "certificate-alert-button"
        }
      });
    } catch { setMessage("Error de conexión con el backend."); } finally { setSubmitting(false); }
  }

  const filtered = titles.filter((item) => {
    const t = item?.transaction?.data || {}; const q = search.trim().toLocaleLowerCase("es");
    return [t.codigo, t.titular, t.titulo, t.institucion].some((v) => String(v || "").toLocaleLowerCase("es").includes(q));
  });
  const views = [{ id: "register", label: "Registrar título", icon: "plus" }, { id: "titles", label: "Consultar títulos", icon: "search" }, { id: "blocks", label: "Cadena de bloques", icon: "blocks" }];

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><Icon name="seal" size={23}/></span><span><strong>Certifica</strong><small>Registro académico</small></span></a><div className={`network-pill ${verification?.valid ? "is-valid" : ""}`}><span className="pulse"/>{verification?.valid ? "Red verificada" : "Sin verificar"}</div></header>
    <main id="top">
      <section className="hero"><div className="hero-copy"><span className="eyebrow"><Icon name="seal" size={15}/> Registro académico en blockchain</span><h1>Credenciales académicas <em>verificables.</em></h1><p>Registra y consulta títulos con trazabilidad e integridad garantizadas.</p></div></section>
      <nav className="view-tabs" aria-label="Secciones">{views.map((v) => <button key={v.id} className={activeView === v.id ? "active" : ""} onClick={() => setActiveView(v.id)}><Icon name={v.icon} size={18}/>{v.label}{v.id !== "register" && <span className="count">{v.id === "titles" ? titles.length : blocks.length}</span>}</button>)}</nav>

      {activeView === "register" && <section className="panel"><div className="panel-heading"><div><span className="section-number">01</span><h2>Registrar nuevo título</h2></div><p>Los campos marcados con <span>*</span> son obligatorios. Una vez registrado, el título no podrá modificarse.</p></div><form onSubmit={submit}>
        <div className="form-section"><h3><Icon name="file" size={18}/> Información de la credencial</h3><div className="form-grid two-columns"><label>Código del título <span>*</span><input name="codigo" value={form.codigo} onChange={handleChange} placeholder="Ej. TIT-2026-0001" required/></label><label>Título obtenido <span>*</span><input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ej. Ingeniería en Sistemas" required/></label></div></div>
        <div className="form-section"><h3><Icon name="user" size={18}/> Titular e institución</h3><div className="form-grid two-columns"><label>Nombre completo del titular <span>*</span><input name="titular" value={form.titular} onChange={handleChange} placeholder="Nombre y apellidos" required/></label><label>Institución educativa <span>*</span><input name="institucion" value={form.institucion} onChange={handleChange} placeholder="Nombre de la institución" required/></label></div></div>
        <div className="form-section"><h3><Icon name="calendar" size={18}/> Periodo académico</h3><div className="form-grid three-columns"><label>Fecha de inicio <span>*</span><input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} required/></label><label>Fecha de finalización <span>*</span><input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} required/></label><label>Fecha de emisión <span>*</span><input type="date" name="fechaEmision" value={form.fechaEmision} onChange={handleChange} required/></label></div></div>
        <div className="form-section last"><label>Descripción adicional <small>Opcional</small><textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Distinciones, especialidad u otra información relevante…"/></label></div>
        <div className="form-footer"><p><Icon name="seal" size={17}/> El registro será firmado y añadido permanentemente a la cadena.</p><button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Registrando…" : "Registrar en blockchain"}<Icon name="arrow" size={18}/></button></div>{message && <div className="message" role="status"><Icon name={message.includes("registrado") ? "check" : "seal"} size={18}/><span>{message}</span></div>}
      </form></section>}

      {activeView === "titles" && <section className="panel"><div className="panel-heading compact"><div><span className="section-number">02</span><h2>Credenciales emitidas</h2></div></div><div className="search-wrap"><Icon name="search" size={19}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por código, titular, título o institución…"/><kbd>{filtered.length} resultados</kbd></div><div className="title-grid">
        {filtered.length === 0 && <div className="empty-state"><Icon name="search" size={28}/><h3>No encontramos registros</h3><p>Prueba con otro término de búsqueda.</p></div>}
        {filtered.map((item) => { const t = item.transaction.data; return <article className="credential" key={t.codigo}><div className="credential-top"><span className="credential-icon"><Icon name="school" size={23}/></span><span className="verified"><Icon name="check" size={13}/> Verificado</span></div><p className="credential-code">{t.codigo}</p><h3>{t.titulo}</h3><p className="holder">{t.titular}</p><dl><div><dt>Institución</dt><dd>{t.institucion}</dd></div><div><dt>Emisión</dt><dd>{formatDate(t.fechaEmision)}</dd></div><div><dt>Periodo</dt><dd>{formatDate(t.fechaInicio)} — {formatDate(t.fechaFin)}</dd></div></dl><div className="hash-row"><Icon name="hash" size={15}/><code title={item.blockHash}>{shortHash(item.blockHash)}</code><span>Bloque #{item.blockId}</span></div></article>; })}
      </div></section>}

      {activeView === "blocks" && <section className="panel"><div className="panel-heading compact"><div><span className="section-number">03</span><h2>Cadena de bloques</h2></div><p>Cada bloque enlaza criptográficamente con el anterior.</p></div><div className="block-list">
        {blocks.length === 0 && <div className="empty-state"><Icon name="blocks" size={28}/><h3>Aún no hay bloques</h3><p>Los bloques aparecerán aquí al conectar la red.</p></div>}
        {blocks.map((b, i) => <article className="block-row" key={b.id}><div className="block-index"><span>{String(i + 1).padStart(2, "0")}</span>{i < blocks.length - 1 && <i/>}</div><div className="block-content"><div className="block-title"><span className="block-cube"><Icon name="blocks" size={20}/></span><div><h3>Bloque #{b.id}</h3><p>{b.transactions?.length || 0} transacciones</p></div><span className="verified"><Icon name="check" size={13}/> Válido</span></div><div className="block-data"><span><small>Nonce</small><code>{b.nonce}</code></span><span><small>Hash</small><code title={b.hash}>{shortHash(b.hash)}</code></span><span><small>Hash anterior</small><code title={b.previousHash}>{shortHash(b.previousHash)}</code></span></div></div></article>)}
      </div></section>}
    </main>
    <footer><span><Icon name="seal" size={15}/> Certifica</span><p>Infraestructura de confianza para credenciales académicas.</p><small>SHA-256 · Proof of Work · Registro inmutable</small></footer>
  </div>;
}
