import React, { useState } from "react";
import Icon from "../components/Icon";

const shortHash = (hash = "") => !hash ? "—" : hash.length > 18 ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : hash;

function formatDate(value) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function WalletView({
    walletInfo,
    wallets,
    walletUuid,
    form,
    setForm,
    submitTitle,
    submitting,
    reviewTitleCode,
    setReviewTitleCode,
    selectedReviewerWallet,
    setSelectedReviewerWallet,
    handleSendReview,
    titles,
    blocks,
    search,
    setSearch,
    message
}) {
    const [activeView, setActiveView] = useState("register");

    const filtered = titles.filter((item) => {
        const t = item?.transaction?.data || {};
        const q = search.trim().toLocaleLowerCase("es");
        return [t.codigo, t.titular, t.titulo, t.institucion].some((v) => String(v || "").toLocaleLowerCase("es").includes(q));
    });

    const views = [
        { id: "register", label: "Registrar título ($10)", icon: "plus" },
        { id: "review", label: "Enviar a revisión ($15)", icon: "file" },
        { id: "titles", label: "Consultar títulos", icon: "search" },
        { id: "blocks", label: "Cadena de bloques", icon: "blocks" },
    ];

    const handleChange = ({ target }) => setForm({ ...form, [target.name]: target.value });

    return (
        <main id="top">
            <section className="hero">
                <div className="hero-copy">
                    <span className="eyebrow">
                        <Icon name="seal" size={15} /> Wallet de {walletInfo?.userName || "Usuario"}
                    </span>
                    <h1>
                        Credenciales y <em>Transacciones.</em>
                    </h1>
                    <p>
                        Código de Wallet: <code>{walletUuid}</code> | Saldo Disponible: <strong>${walletInfo?.balance?.toFixed(2)}</strong>
                    </p>
                </div>
            </section>

            <nav className="view-tabs" aria-label="Secciones">
                {views.map((v) => (
                    <button
                        key={v.id}
                        className={activeView === v.id ? "active" : ""}
                        onClick={() => setActiveView(v.id)}
                    >
                        <Icon name={v.icon} size={18} />
                        {v.label}
                        {v.id === "titles" && <span className="count">{titles.length}</span>}
                        {v.id === "blocks" && <span className="count">{blocks.length}</span>}
                    </button>
                ))}
            </nav>

            {activeView === "register" && (
                <section className="panel">
                    <div className="panel-heading">
                        <div>
                            <span className="section-number">01</span>
                            <h2>Registrar nuevo título (Costo: $10.00)</h2>
                        </div>
                        <p>Al minar el bloque se descontará automáticamente $10.00 de tu saldo actual.</p>
                    </div>
                    <form onSubmit={submitTitle}>
                        <div className="form-section">
                            <h3><Icon name="file" size={18} /> Información de la credencial</h3>
                            <div className="form-grid two-columns">
                                <label>
                                    Código del título <span>*</span>
                                    <input name="codigo" value={form.codigo} onChange={handleChange} placeholder="Ej. TIT-2026-0001" required />
                                </label>
                                <label>
                                    Título obtenido <span>*</span>
                                    <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ej. Ingeniería en Sistemas" required />
                                </label>
                            </div>
                        </div>
                        <div className="form-section">
                            <h3><Icon name="user" size={18} /> Titular e institución</h3>
                            <div className="form-grid two-columns">
                                <label>
                                    Nombre completo del titular <span>*</span>
                                    <input name="titular" value={form.titular} onChange={handleChange} placeholder="Nombre y apellidos" required />
                                </label>
                                <label>
                                    Institución educativa <span>*</span>
                                    <input name="institucion" value={form.institucion} onChange={handleChange} placeholder="Nombre de la institución" required />
                                </label>
                            </div>
                        </div>
                        <div className="form-section">
                            <h3><Icon name="calendar" size={18} /> Periodo académico</h3>
                            <div className="form-grid three-columns">
                                <label>
                                    Fecha de inicio <span>*</span>
                                    <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} required />
                                </label>
                                <label>
                                    Fecha de finalización <span>*</span>
                                    <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} required />
                                </label>
                                <label>
                                    Fecha de emisión <span>*</span>
                                    <input type="date" name="fechaEmision" value={form.fechaEmision} onChange={handleChange} required />
                                </label>
                            </div>
                        </div>
                        <div className="form-section last">
                            <label>
                                Descripción adicional <small>Opcional</small>
                                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Distinciones..." />
                            </label>
                        </div>
                        <div className="form-footer">
                            <p><Icon name="seal" size={17} /> Pagarás $10.00 por el minado del bloque.</p>
                            <button className="primary-button" type="submit" disabled={submitting}>
                                {submitting ? "Minando..." : "Pagar $10.00 y Registrar"}
                                <Icon name="arrow" size={18} />
                            </button>
                        </div>
                        {message && (
                            <div className="message" role="status">
                                <Icon name="seal" size={18} />
                                <span>{message}</span>
                            </div>
                        )}
                    </form>
                </section>
            )}

            {activeView === "review" && (
                <section className="panel">
                    <div className="panel-heading compact">
                        <div>
                            <span className="section-number">02</span>
                            <h2>Enviar a revisión (Costo: $15.00)</h2>
                        </div>
                        <p>Se transferirán $15.00 de tu wallet a la wallet del revisor seleccionado.</p>
                    </div>
                    <form onSubmit={handleSendReview}>
                        <div className="form-section">
                            <div className="form-grid two-columns">
                                <label>
                                    Código del Título a Revisar <span>*</span>
                                    <input
                                        value={reviewTitleCode}
                                        onChange={(e) => setReviewTitleCode(e.target.value)}
                                        placeholder="Ej. TIT-2026-0001"
                                        required
                                    />
                                </label>
                                <label>
                                    Seleccionar Wallet Revisora <span>*</span>
                                    <select
                                        value={selectedReviewerWallet}
                                        onChange={(e) => setSelectedReviewerWallet(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "11px", borderRadius: "9px", border: "1px solid #cbd5e1" }}
                                    >
                                        <option value="">-- Seleccionar Revisor --</option>
                                        {wallets.filter((w) => w.walletId !== walletUuid).map((w) => (
                                            <option key={w.walletId} value={w.walletId}>
                                                {w.userName} ({w.walletId.slice(0, 8)}…)
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div className="form-footer">
                            <button className="primary-button" type="submit">
                                Transferir $15.00 y Solicitar Revisión <Icon name="arrow" size={18} />
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {activeView === "titles" && (
                <section className="panel">
                    <div className="panel-heading compact">
                        <div>
                            <span className="section-number">03</span>
                            <h2>Credenciales emitidas</h2>
                        </div>
                    </div>
                    <div className="search-wrap">
                        <Icon name="search" size={19} />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." />
                        <kbd>{filtered.length} resultados</kbd>
                    </div>
                    <div className="title-grid">
                        {filtered.map((item) => {
                            const t = item.transaction.data;
                            return (
                                <article className="credential" key={t.codigo}>
                                    <div className="credential-top">
                                        <span className="credential-icon"><Icon name="school" size={23} /></span>
                                        <span className="verified"><Icon name="check" size={13} /> Verificado</span>
                                    </div>
                                    <p className="credential-code">{t.codigo}</p>
                                    <h3>{t.titulo}</h3>
                                    <p className="holder">{t.titular}</p>
                                    <dl>
                                        <div><dt>Institución</dt><dd>{t.institucion}</dd></div>
                                        <div><dt>Emisión</dt><dd>{formatDate(t.fechaEmision)}</dd></div>
                                    </dl>
                                    <div className="hash-row">
                                        <Icon name="hash" size={15} />
                                        <code title={item.blockHash}>{shortHash(item.blockHash)}</code>
                                        <span>Bloque #{item.blockId}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            {activeView === "blocks" && (
                <section className="panel">
                    <div className="panel-heading compact">
                        <div>
                            <span className="section-number">04</span>
                            <h2>Cadena de bloques</h2>
                        </div>
                    </div>
                    <div className="block-list">
                        {blocks.map((b, i) => (
                            <article className="block-row" key={b.id}>
                                <div className="block-index">
                                    <span>{String(i + 1).padStart(2, "0")}</span>
                                    {i < blocks.length - 1 && <i />}
                                </div>
                                <div className="block-content">
                                    <div className="block-title">
                                        <span className="block-cube"><Icon name="blocks" size={20} /></span>
                                        <div>
                                            <h3>Bloque #{b.id}</h3>
                                            <p>{b.transactions?.length || 0} transacciones</p>
                                        </div>
                                        <span className="verified"><Icon name="check" size={13} /> Válido</span>
                                    </div>
                                    <div className="block-data">
                                        <span><small>Nonce</small><code>{b.nonce}</code></span>
                                        <span><small>Hash</small><code title={b.hash}>{shortHash(b.hash)}</code></span>
                                        <span><small>Hash anterior</small><code title={b.previousHash}>{shortHash(b.previousHash)}</code></span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}