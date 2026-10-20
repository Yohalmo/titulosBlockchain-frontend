import React from "react";
import Icon from "./Icon";

export default function Topbar({
    isWallet,
    walletInfo,
    selectedServer,
    setSelectedServer,
    serverOptions,
    verification
}) {
    return (
        <header className="topbar">
            <a className="brand" href="/">
                <span className="brand-mark">
                    <Icon name="seal" size={23} />
                </span>
                <span>
                    <strong>Certifica</strong>
                    <small>
                        {isWallet
                            ? `Wallet: ${walletInfo?.userName || "Cargando..."}`
                            : "Registro académico"}
                    </small>
                </span>
            </a>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    justifyContent: "flex-end"
                }}
            >
                <label htmlFor="wallet-server" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    Servidor conectado
                </label>
                <select
                    id="wallet-server"
                    value={selectedServer}
                    onChange={(e) => setSelectedServer(e.target.value)}
                    style={{
                        maxWidth: "230px",
                        padding: "9px 11px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "9px",
                        background: "white",
                        color: "#0f172a"
                    }}
                >
                    {serverOptions.map((server) => (
                        <option key={server.url} value={server.url}>
                            {server.label}
                        </option>
                    ))}
                </select>

                {isWallet && walletInfo && (
                    <div
                        style={{
                            background: "#0a2342",
                            color: "#fff",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "bold",
                            fontSize: "0.9rem"
                        }}
                    >
                        Saldo: ${walletInfo.balance?.toFixed(2)}
                    </div>
                )}

                <div className={`network-pill ${verification?.valid ? "is-valid" : ""}`}>
                    <span className="pulse" />
                    {verification?.valid ? "Red verificada" : "Sin verificar"}
                </div>
            </div>
        </header>
    );
}