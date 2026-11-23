import { useEffect, useState } from 'react'
import './App.css'

// Endereço da API (definido na Vercel pela variável VITE_API_URL)
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/notes`

const FORM_VAZIO = { id: null, titulo: '', texto: '' }

function App() {
  const [notas, setNotas] = useState([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    buscarNotas()
  }, [])

  // READ - GET /api/notes
  async function buscarNotas() {
    setCarregando(true)
    setErro('')
    try {
      const resposta = await fetch(API_URL)
      if (!resposta.ok) throw new Error()
      setNotas(await resposta.json())
    } catch {
      setErro('Não foi possível carregar as notas. Verifique se a API está online.')
    } finally {
      setCarregando(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // CREATE - POST /api/notes | UPDATE - PUT /api/notes/:id
  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.titulo.trim() || !form.texto.trim()) return

    const editando = form.id !== null
    setSalvando(true)
    setErro('')
    try {
      const resposta = await fetch(editando ? `${API_URL}/${form.id}` : API_URL, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: form.titulo, texto: form.texto }),
      })
      if (!resposta.ok) throw new Error()
      setForm(FORM_VAZIO)
      await buscarNotas()
    } catch {
      setErro(editando ? 'Não foi possível atualizar a nota.' : 'Não foi possível criar a nota.')
    } finally {
      setSalvando(false)
    }
  }

  function handleEditar(nota) {
    setForm({ id: nota.id, titulo: nota.titulo, texto: nota.texto })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // DELETE - DELETE /api/notes/:id
  async function handleExcluir(nota) {
    if (!window.confirm(`Excluir a nota "${nota.titulo}"?`)) return
    setErro('')
    try {
      const resposta = await fetch(`${API_URL}/${nota.id}`, { method: 'DELETE' })
      if (!resposta.ok) throw new Error()
      if (form.id === nota.id) setForm(FORM_VAZIO)
      await buscarNotas()
    } catch {
      setErro('Não foi possível excluir a nota.')
    }
  }

  function formatarData(iso) {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <main className="container">
      <header>
        <h1>Minhas Notas</h1>
        <p className="subtitulo">CRUD consumindo uma API Express hospedada no Render</p>
      </header>

      <form onSubmit={handleSubmit} className="formulario">
        <h2>{form.id ? 'Editar nota' : 'Nova nota'}</h2>
        <input
          name="titulo"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange}
          required
        />
        <textarea
          name="texto"
          placeholder="Escreva sua nota..."
          rows="4"
          value={form.texto}
          onChange={handleChange}
          required
        />
        <div className="acoes">
          <button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : form.id ? 'Atualizar nota' : 'Criar nota'}
          </button>
          {form.id && (
            <button type="button" className="secundario" onClick={() => setForm(FORM_VAZIO)}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {erro && <p className="erro">{erro}</p>}

      {carregando ? (
        <p className="info">
          Carregando notas... (no plano gratuito do Render a API pode levar até 1 minuto para acordar)
        </p>
      ) : notas.length === 0 ? (
        <p className="info">Nenhuma nota cadastrada ainda.</p>
      ) : (
        <section className="grade">
          {notas.map((nota) => (
            <article key={nota.id} className={`nota ${form.id === nota.id ? 'editando' : ''}`}>
              <h3>{nota.titulo}</h3>
              <p>{nota.texto}</p>
              <small>Criada em {formatarData(nota.criadoEm)}</small>
              <div className="acoes">
                <button onClick={() => handleEditar(nota)}>Editar</button>
                <button className="perigo" onClick={() => handleExcluir(nota)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default App
