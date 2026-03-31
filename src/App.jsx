import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_EMAIL = "testemusica949@gmail.com";

const pastas = [
  { nome: "Culto de Domingo", valor: "culto-domingo" },
  { nome: "Culto de Quinta", valor: "culto-quinta" },
  { nome: "Eventos / Congressos", valor: "eventos" },
];

function App() {
  const [user, setUser] = useState(null);
  const [arquivos, setArquivos] = useState([]);
  const [pastaAtual, setPastaAtual] = useState("culto-domingo");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [busca, setBusca] = useState("");
  const [preview, setPreview] = useState(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (!error) window.location.reload();
    else alert("Erro no login");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const uploadArquivo = async (file) => {
    if (!file) return;

    const filePath = `${pastaAtual}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("midia")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.log(error);
      alert("Erro no upload");
      return;
    }

    listarArquivos();
  };

  const deletarArquivo = async (nomeArquivo) => {
    await supabase.storage.from("midia").remove([nomeArquivo]);
    listarArquivos();
  };

  const listarArquivos = async () => {
    const { data, error } = await supabase.storage
      .from("midia")
      .list(pastaAtual, { limit: 100 });

    if (error) {
      console.log("Erro ao listar:", error);
      return;
    }

    if (!data) {
      setArquivos([]);
      return;
    }

    const arquivosComUrl = data.map((file) => {
      const caminho = `${pastaAtual}/${file.name}`;

      const { data: urlData } = supabase.storage
        .from("midia")
        .getPublicUrl(caminho);

      return {
        name: caminho,
        url: urlData?.publicUrl || "",
      };
    });

    setArquivos(arquivosComUrl);
  };

  useEffect(() => {
    if (user) listarArquivos();
  }, [user, pastaAtual]);

  // LOGIN
  if (!user) {
    return (
      <div style={styles.login}>
        <div style={styles.loginBox}>
          <h2>🎵 Mídia Worship</h2>

          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            onChange={(e) => setSenha(e.target.value)}
          />

          <button onClick={login}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h3>📂 Pastas</h3>

        {pastas.map((p) => (
          <div
            key={p.valor}
            style={{
              ...styles.pasta,
              background:
                pastaAtual === p.valor
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "transparent",
              color: pastaAtual === p.valor ? "#fff" : "#cbd5f5",
            }}
            onClick={() => setPastaAtual(p.valor)}
          >
            {p.nome}
          </div>
        ))}

        <button onClick={logout} style={styles.logout}>
          Sair
        </button>
      </div>

      {/* CONTEÚDO */}
      <div style={styles.main}>
        <div style={styles.content}>
          <div style={styles.top}>
            <h2>🔥 {pastaAtual}</h2>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                placeholder="🔍 Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={styles.inputBusca}
              />

              <label style={styles.uploadButton}>
                📤 Enviar
                <input
                  type="file"
                  hidden
                  onChange={(e) => uploadArquivo(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div style={styles.grid}>
            {(arquivos || [])
              .filter((file) =>
                file?.name?.toLowerCase().includes(busca.toLowerCase())
              )
              .map((file, index) => (
                <div
                  key={index}
                  style={styles.card}
                  onClick={() => setPreview(file)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-5px) scale(1.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {file?.name?.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={file.url} style={styles.media} />
                  ) : (
                    <img src={file.url} style={styles.media} />
                  )}

                  {isAdmin && (
                    <button
                      style={styles.delete}
                      onClick={(e) => {
                        e.stopPropagation();
                        deletarArquivo(file.name);
                      }}
                    >
                      Excluir
                    </button>
                  )}

                  <a href={file.url} download style={styles.download}>
                    ⬇️ Download
                  </a>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {preview && (
        <div style={styles.modal} onClick={() => setPreview(null)}>
          {preview?.name?.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={preview.url} controls style={styles.modalMedia} />
          ) : (
            <img src={preview.url} style={styles.modalMedia} />
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#020617",
    color: "#fff",
  },

  sidebar: {
    width: 260,
    padding: 20,
    background: "rgba(15,23,42,0.9)",
    display: "flex",
    flexDirection: "column",
  },

  pasta: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    cursor: "pointer",
  },

  main: {
    flex: 1,
    overflowY: "auto",
  },

  content: {
    padding: 30,
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
  },

  inputBusca: {
    padding: 10,
    borderRadius: 10,
    border: "none",
  },

  uploadButton: {
    background: "#22c55e",
    padding: "10px 15px",
    borderRadius: 10,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 20,
  },

  card: {
    padding: 10,
    borderRadius: 12,
    background: "#0f172a",
    cursor: "pointer",
    transition: "0.2s",
  },

  media: {
    width: "100%",
    borderRadius: 10,
  },

  delete: {
    marginTop: 5,
    width: "100%",
    background: "#ef4444",
    border: "none",
    padding: 6,
    borderRadius: 6,
    color: "#fff",
  },

  download: {
    display: "block",
    marginTop: 5,
    textAlign: "center",
    background: "#3b82f6",
    padding: 6,
    borderRadius: 6,
    color: "#fff",
    textDecoration: "none",
  },

  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalMedia: {
    maxWidth: "90%",
    maxHeight: "90%",
  },

  login: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },

  loginBox: {
    padding: 20,
    background: "#111",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};

export default App;