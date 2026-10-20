import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import Icon from "./components/Icon";
import OrchestratorView from "./views/OrchestratorView";
import WalletView from "./views/WalletView";

const DEFAULT_SERVER = import.meta.env.VITE_API_URL || "http://localhost:3001";
const INITIAL_SERVERS = [{ label: "Nodo 1 · Puerto 3001", url: "http://localhost:3001" }];

const emptyForm = {
    codigo: "", titular: "", titulo: "", institucion: "", fechaInicio: "", fechaFin: "", fechaEmision: "", descripcion: ""
};

function MainContainer({ isWallet }) {
    const { uuid } = useParams();
    const walletUuid = isWallet ? uuid : null;

    const [form, setForm] = useState(emptyForm);
    const [titles, setTitles] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [walletInfo, setWalletInfo] = useState(null);
    const [verification, setVerification] = useState(null);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [newUserName, setNewUserName] = useState("");
    const [initialBalance, setInitialBalance] = useState("100");

    const [reviewTitleCode, setReviewTitleCode] = useState("");
    const [selectedReviewerWallet, setSelectedReviewerWallet] = useState("");

    const [serverOptions, setServerOptions] = useState(INITIAL_SERVERS);
    const [selectedServer, setSelectedServer] = useState(DEFAULT_SERVER);
    const [newNodePort, setNewNodePort] = useState("3002");
    const [nodesInfo, setNodesInfo] = useState({ currentNode: null, peers: [], launchedNodes: [] });

    const API = `${selectedServer.replace(/\/$/, "")}/api`;

    function addUniqueServer(url) {
        if (!url) return;
        const formattedUrl = url.replace(/\/$/, "");
        const portMatch = formattedUrl.match(/:(\d+)$/);
        const port = portMatch ? portMatch[1] : "Custom";

        setServerOptions((prev) => {
            if (prev.some((s) => s.url === formattedUrl)) return prev;
            return [...prev, { label: `Nodo · Puerto ${port}`, url: formattedUrl }];
        });
    }

    async function loadData() {
        const [titlesRes, blocksRes, verifyRes, walletsRes] = await Promise.all([
            fetch(`${API}/titulos`),
            fetch(`${API}/blocks`),
            fetch(`${API}/verify`),
            fetch(`${API}/wallets`),
        ]);

        if (titlesRes.ok) setTitles(await titlesRes.json());
        if (blocksRes.ok) setBlocks(await blocksRes.json());
        if (verifyRes.ok) setVerification(await verifyRes.json());
        if (walletsRes.ok) setWallets(await walletsRes.json());

        if (walletUuid) {
            const walletRes = await fetch(`${API}/wallets/${walletUuid}`);
            if (walletRes.ok) setWalletInfo(await walletRes.json());
        }
    }

    async function fetchNodesInfo() {
        try {
            const res = await fetch(`${API}/nodes`);
            if (res.ok) {
                const data = await res.json();

                setNodesInfo((prev) => {
                    const previousLaunched = prev.launchedNodes || [];
                    const incomingLaunched = data.launchedNodes || [];

                    // Combinamos sin duplicados
                    const allLaunchedSet = new Set([...previousLaunched, ...incomingLaunched]);

                    if (Array.isArray(data.peers)) {
                        data.peers.forEach((peerUrl) => {
                            const match = peerUrl.match(/:(\d+)$/);
                            if (match && Number(match[1]) !== 3001) {
                                allLaunchedSet.add(Number(match[1]));
                            }
                        });
                    }

                    return {
                        currentNode: data.currentNode,
                        peers: data.peers || prev.peers || [],
                        // Mantenemos siempre los puertos lanzados descubiertos
                        launchedNodes: Array.from(allLaunchedSet).filter((port) => port !== 3001)
                    };
                });

                if (data.currentNode) addUniqueServer(`http://localhost:${data.currentNode}`);
                if (Array.isArray(data.peers)) data.peers.forEach(addUniqueServer);
            }
        } catch {
        }
    }

    useEffect(() => {
        loadData().then(() => fetchNodesInfo()).catch(() => setMessage("No se pudo conectar con el servidor."));
    }, [selectedServer, walletUuid]);

    useEffect(() => {
        const socket = io(selectedServer, { transports: ["websocket", "polling"] });
        socket.on("chain_updated", () => { loadData().catch(() => { }); });
        socket.on("node_launched", (data) => {
            if (data?.launchedUrl) addUniqueServer(data.launchedUrl);
            fetchNodesInfo().catch(() => { });
        });
        return () => { socket.disconnect(); };
    }, [selectedServer]);

    async function handleCreateWallet(e) {
        e.preventDefault();
        const generatedUuid = crypto.randomUUID();
        try {
            const res = await fetch(`${API}/wallets/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    walletId: generatedUuid,
                    userName: newUserName,
                    initialBalance: Number(initialBalance)
                })
            });

            const data = await res.json();
            if (res.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "¡Wallet Creada!",
                    html: `<p>Enlace de la wallet creada:</p><a href="/wallet/${generatedUuid}" target="_blank">Abrir Wallet de ${newUserName}</a>`,
                    confirmButtonText: "Entendido"
                });
                setNewUserName("");
                loadData();
            } else {
                setMessage(data.error);
            }
        } catch {
            setMessage("Error al crear la wallet.");
        }
    }

    async function submitTitle(event) {
        event.preventDefault();
        setSubmitting(true);
        setMessage("Registrando título y realizando Proof of Work…");

        try {
            const response = await fetch(`${API}/titulos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, walletId: walletUuid }),
            });

            const data = await response.json();
            if (!response.ok) {
                setMessage(data.error || "No se pudo registrar el título.");
                return;
            }
            setMessage("");
            setForm(emptyForm);
            await loadData();

            await Swal.fire({
                icon: "success",
                title: "Título registrado",
                text: `Credencial añadida al bloque #${data.blockId}. Saldo actual: $${data.newBalance.toFixed(2)}`,
                confirmButtonColor: "#0a2342",
            });
        } catch {
            setMessage("Error de conexión con el servidor.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSendReview(e) {
        e.preventDefault();
        if (!reviewTitleCode || !selectedReviewerWallet) return;

        try {
            const res = await fetch(`${API}/titulos/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    titleCode: reviewTitleCode,
                    senderWalletId: walletUuid,
                    receiverWalletId: selectedReviewerWallet
                })
            });

            const data = await res.json();
            if (res.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "Enviado a Revisión",
                    text: `Se han transferido $15.00 al revisor. Tu saldo actual: $${data.newBalance.toFixed(2)}`
                });
                setReviewTitleCode("");
                loadData();
            } else {
                setMessage(data.error);
            }
        } catch {
            setMessage("Error al enviar a revisión.");
        }
    }

    async function handleLaunchNode(e) {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/nodes/launch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ port: Number(newNodePort) }),
            });
            const data = await res.json();
            if (res.ok) {
                const newPort = Number(data.port);
                addUniqueServer(`http://localhost:${newPort}`);

                setNodesInfo(prev => ({
                    ...prev,
                    launchedNodes: Array.from(new Set([...(prev.launchedNodes || []), newPort]))
                }));

                setNewNodePort(String(newPort + 1));
                await fetchNodesInfo();
            }
        } catch { }
    }

    // Función para detener y eliminar un nodo servidor
    async function handleStopNode(portToStop) {
        const portNum = Number(portToStop);
        try {
            const res = await fetch(`http://localhost:3001/api/nodes/stop`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ port: portNum })
            });

            if (res.ok) {
                setNodesInfo(prev => ({
                    ...prev,
                    launchedNodes: (prev.launchedNodes || []).filter(p => p !== portNum)
                }));

                const stoppedUrl = `http://localhost:${portNum}`;
                setServerOptions(prev => prev.filter(s => s.url !== stoppedUrl));

                if (selectedServer === stoppedUrl) {
                    setSelectedServer(DEFAULT_SERVER);
                }

                await fetchNodesInfo();
            }
        } catch { }
    }

    useEffect(() => {
        const socket = io(selectedServer, { transports: ["websocket", "polling"] });

        socket.on("chain_updated", () => { loadData().catch(() => { }); });

        socket.on("node_launched", (data) => {
            if (data?.launchedUrl) addUniqueServer(data.launchedUrl);
            fetchNodesInfo().catch(() => { });
        });

        // --- ESCUCHAR SERVIDORES ELIMINADOS/DETENIDOS ---
        socket.on("node_stopped", (data) => {
            if (data?.stoppedUrl) {
                setServerOptions(prev => prev.filter(s => s.url !== data.stoppedUrl));
                if (selectedServer === data.stoppedUrl) {
                    setSelectedServer(DEFAULT_SERVER);
                }
            }
            fetchNodesInfo().catch(() => { });
        });

        return () => { socket.disconnect(); };
    }, [selectedServer]);

    return (
        <div className="app-shell">
            <header className="topbar">
                <a className="brand" href="/">
                    <span className="brand-mark"><Icon name="seal" size={23} /></span>
                    <span>
                        <strong>Certifica</strong>
                        <small>{isWallet ? `Wallet: ${walletInfo?.userName || "Cargando..."}` : "Registro académico"}</small>
                    </span>
                </a>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <label htmlFor="wallet-server" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Servidor conectado</label>
                    <select
                        id="wallet-server"
                        value={selectedServer}
                        onChange={(e) => setSelectedServer(e.target.value)}
                        style={{ maxWidth: "230px", padding: "9px 11px", border: "1px solid #cbd5e1", borderRadius: "9px", background: "white", color: "#0f172a" }}
                    >
                        {serverOptions.map((server) => <option key={server.url} value={server.url}>{server.label}</option>)}
                    </select>

                    {isWallet && walletInfo && (
                        <div style={{ background: "#0a2342", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.9rem" }}>
                            Saldo: ${walletInfo.balance?.toFixed(2)}
                        </div>
                    )}

                    <div className={`network-pill ${verification?.valid ? "is-valid" : ""}`}>
                        <span className="pulse" />
                        {verification?.valid ? "Red verificada" : "Sin verificar"}
                    </div>
                </div>
            </header>

            {!isWallet ? (
                <OrchestratorView
                    wallets={wallets}
                    newUserName={newUserName}
                    setNewUserName={setNewUserName}
                    initialBalance={initialBalance}
                    setInitialBalance={setInitialBalance}
                    handleCreateWallet={handleCreateWallet}
                    newNodePort={newNodePort}
                    setNewNodePort={setNewNodePort}
                    handleLaunchNode={handleLaunchNode}
                    handleStopNode={handleStopNode}
                    nodesInfo={nodesInfo}
                    message={message}
                />
            ) : (
                <WalletView
                    walletInfo={walletInfo}
                    wallets={wallets}
                    walletUuid={walletUuid}
                    form={form}
                    setForm={setForm}
                    submitTitle={submitTitle}
                    submitting={submitting}
                    reviewTitleCode={reviewTitleCode}
                    setReviewTitleCode={setReviewTitleCode}
                    selectedReviewerWallet={selectedReviewerWallet}
                    setSelectedReviewerWallet={setSelectedReviewerWallet}
                    handleSendReview={handleSendReview}
                    titles={titles}
                    blocks={blocks}
                    search={search}
                    setSearch={setSearch}
                    message={message}
                />
            )}

            <footer>
                <span><Icon name="seal" size={15} /> Certifica</span>
                <p>Infraestructura de confianza para credenciales académicas.</p>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainContainer isWallet={false} />} />
                <Route path="/wallet/:uuid" element={<MainContainer isWallet={true} />} />
            </Routes>
        </BrowserRouter>
    );
}