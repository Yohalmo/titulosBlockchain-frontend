import React from "react";
import Icon from "../components/Icon";

export default function OrchestratorView({
    wallets,
    newUserName,
    setNewUserName,
    initialBalance,
    setInitialBalance,
    handleCreateWallet,
    newNodePort,
    setNewNodePort,
    handleLaunchNode,
    handleStopNode,
    nodesInfo,
    message
}) {

    return (
        <main id="top">
            <section className="hero">
                <div className="hero-copy">
                    <span className="eyebrow">
                        <Icon name="seal" size={15} /> Red Blockchain & Registro Académico
                    </span>
                    <h1>
                        Panel Orquestador <em>Central.</em>
                    </h1>
                    <p>
                        Despliega nuevos nodos en la red P2P y administra la creación de wallets con saldo inicial.
                    </p>
                </div>
            </section>

            <section className="panel">
                <div className="panel-heading">
                    <div>
                        <span className="section-number">01</span>
                        <h2>Panel de Administración y Despliegue</h2>
                    </div>
                </div>

                <div className="form-grid two-columns">
                    <div className="form-section">
                        <h3><Icon name="wallet" size={18} /> Crear Nueva Wallet</h3>
                        <form onSubmit={handleCreateWallet}>
                            <div className="form-grid">
                                <label>
                                    Nombre del Usuario <span>*</span>
                                    <input
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                        placeholder="Ej. Yohalmo Vasquez"
                                        required
                                    />
                                </label>
                                <label style={{ marginTop: "1rem" }}>
                                    Saldo Inicial ($) <span>*</span>
                                    <input
                                        type="number"
                                        value={initialBalance}
                                        onChange={(e) => setInitialBalance(e.target.value)}
                                        placeholder="Ej. 100"
                                        required
                                    />
                                </label>
                            </div>
                            <div className="form-footer" style={{ marginTop: "1.5rem" }}>
                                <button className="primary-button" type="submit">
                                    Generar Wallet <Icon name="arrow" size={18} />
                                </button>
                            </div>
                        </form>


                        <div className="form-section" style={{ marginTop: "2rem" }}>
                            <h3>Wallets Registradas en la Red</h3>
                            <div className="title-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", marginTop: "1rem" }}>
                                {wallets.length === 0 && <p>No hay wallets registradas aún.</p>}
                                {wallets.map((w) => (
                                    <article className="credential" key={w.walletId}>
                                        <h3>{w.userName}</h3>
                                        <p className="holder">Saldo: <strong>${w.balance?.toFixed(2)}</strong></p>
                                        <div className="hash-row" style={{ marginTop: "1rem" }}>
                                            <Icon name="wallet" size={15} />
                                            <a href={`/wallet/${w.walletId}`} target="_blank" rel="noreferrer" style={{ color: "#0a2342", fontWeight: 600 }}>
                                                Abrir Wallet
                                            </a>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3><Icon name="server" size={18} /> Lanzar Nuevo Servidor P2P</h3>
                        <form onSubmit={handleLaunchNode}>
                            <label>
                                Puerto de Escucha <span>*</span>
                                <input
                                    type="number"
                                    value={newNodePort}
                                    onChange={(e) => setNewNodePort(e.target.value)}
                                    placeholder="Ej. 3002"
                                    required
                                />
                            </label>
                            <div className="form-footer" style={{ marginTop: "1.5rem" }}>
                                <button className="primary-button" type="submit">
                                    Lanzar Servidor <Icon name="arrow" size={18} />
                                </button>
                            </div>
                        </form>

                        <div className="form-section" style={{ marginTop: "2rem" }}>
                            <h3>Estado de los Nodos en la Red P2P</h3>
                            <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.2" }}>
                                <li><strong>Puerto Local Conectado:</strong> {nodesInfo.currentNode || "3001"}</li>
                            </ul>

                            {nodesInfo.launchedNodes?.length > 0 && (
                                <div style={{ marginTop: "1.5rem" }}>
                                    <h4>Servidores Creados por este Orquestador:</h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "0.5rem" }}>
                                        {nodesInfo.launchedNodes.map((port) => (
                                            <div
                                                key={port}
                                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                                            >
                                                <span><strong>Nodo Secundario:</strong> Puerto {port} (http://localhost:{port})</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStopNode(port)}
                                                    style={{ background: "#e11d48", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                                                >
                                                    Detener Servidor
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="message" role="status" style={{ marginTop: "1.5rem" }}>
                        <Icon name="server" size={18} />
                        <span>{message}</span>
                    </div>
                )}
            </section>
        </main>
    );
}