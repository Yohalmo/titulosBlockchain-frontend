import  React, { useEffect, useState } from "react";

const API = "http://localhost:3000/api";

const emptyForm = {
  codigo: "",
  titular: "",
  titulo: "",
  institucion: "",
  fechaInicio: "",
  fechaFin: "",
  fechaEmision: "",
  descripcion: ""
};

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [titles, setTitles] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [verification, setVerification] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    const [titlesRes, blocksRes, verifyRes] = await Promise.all([
      fetch(`${API}/titulos`),
      fetch(`${API}/blocks`),
      fetch(`${API}/verify`)
    ]);

    setTitles(await titlesRes.json());
    setBlocks(await blocksRes.json());
    setVerification(await verifyRes.json());
  }

  useEffect(() => {
    loadData().catch(() => {
      setMessage("No se pudo conectar con el backend.");
    });
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function submit(e) {
    e.preventDefault();
    setMessage("Registrando título y realizando Proof of Work...");

    try {
      const response = await fetch(`${API}/titulos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo registrar.");
        return;
      }

      setMessage(
        `Título registrado en el bloque #${data.blockId}. Hash: ${data.hash}`
      );

      setForm(emptyForm);
      await loadData();
    } catch {
      setMessage("Error de conexión con el backend.");
    }
  }

  const filtered = titles.filter((item) => {
    const t = item.transaction.data;
    const q = search.toLowerCase();

    return (
      t.codigo.toLowerCase().includes(q) ||
      t.titular.toLowerCase().includes(q) ||
      t.titulo.toLowerCase().includes(q) ||
      t.institucion.toLowerCase().includes(q)
    );
  });

  return (
    <main className="container">
      <header>
        <h1>Blockchain de Títulos Académicos</h1>
        <p>
          Registro verificable de títulos mediante bloques, SHA-256 y
          Proof of Work.
        </p>
      </header>

      <section className="status">
        <strong>Estado de blockchain:</strong>{" "}
        <span className={verification?.valid ? "ok" : "bad"}>
          {verification?.valid ? "Íntegra" : "No verificada"}
        </span>
        <span> · Bloques: {blocks.length}</span>
      </section>

      <section className="card">
        <h2>Registrar título</h2>

        <form onSubmit={submit}>
          <label>
            Código del título
            <input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              placeholder="TIT-2026-0001"
              required
            />
          </label>

          <label>
            Titular
            <input
              name="titular"
              value={form.titular}
              onChange={handleChange}
              placeholder="Nombre completo"
              required
            />
          </label>

          <label>
            Título obtenido
            <input
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Ingeniería en Sistemas"
              required
            />
          </label>

          <label>
            Institución
            <input
              name="institucion"
              value={form.institucion}
              onChange={handleChange}
              placeholder="Universidad"
              required
            />
          </label>

          <div className="grid">
            <label>
              Fecha de inicio
              <input
                type="date"
                name="fechaInicio"
                value={form.fechaInicio}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Fecha de finalización
              <input
                type="date"
                name="fechaFin"
                value={form.fechaFin}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Fecha de emisión
              <input
                type="date"
                name="fechaEmision"
                value={form.fechaEmision}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label>
            Descripción
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Información adicional..."
            />
          </label>

          <button type="submit">Registrar en Blockchain</button>
        </form>

        {message && <p className="message">{message}</p>}
      </section>

      <section className="card">
        <h2>Consultar títulos</h2>

        <input
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código, titular, título o institución"
        />

        <div className="titles">
          {filtered.length === 0 && <p>No hay registros.</p>}

          {filtered.map((item) => {
            const t = item.transaction.data;

            return (
              <article className="title" key={t.codigo}>
                <h3>{t.titulo}</h3>
                <p><strong>Titular:</strong> {t.titular}</p>
                <p><strong>Institución:</strong> {t.institucion}</p>
                <p><strong>Periodo:</strong> {t.fechaInicio} → {t.fechaFin}</p>
                <p><strong>Emisión:</strong> {t.fechaEmision}</p>
                <p><strong>Código:</strong> {t.codigo}</p>
                <p><strong>Bloque:</strong> #{item.blockId}</p>
                <small>Hash: {item.blockHash}</small>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>Cadena de bloques</h2>

        {blocks.map((block) => (
          <article className="block" key={block.id}>
            <strong>Bloque #{block.id}</strong>
            <p>Nonce: {block.nonce}</p>
            <p>Hash: {block.hash}</p>
            <p>Previous Hash: {block.previousHash}</p>
            <p>Transacciones: {block.transactions.length}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
