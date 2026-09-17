import { useEffect, useRef, useState } from 'react'

const API = 'https://jsonplaceholder.typicode.com/users'

export default function Formulario({
  usuarioInicial,
  onCriado,
  onAtualizado,
  onCancelar,
}) {
  const [dados, setDados] = useState({
    name: usuarioInicial?.name ?? '',
    email: usuarioInicial?.email ?? '',
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const controllerRef = useRef(null)

  const editando = Boolean(usuarioInicial)

  useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [])

  function handleChange(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    controllerRef.current = new AbortController()
    const { signal } = controllerRef.current

    try {
      if (editando) {
        const resp = await fetch(`${API}/${usuarioInicial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados),
          signal,
        })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const atualizado = await resp.json()
        onAtualizado({ ...atualizado, id: usuarioInicial.id })
      } else {
        const resp = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados),
          signal,
        })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        onCriado(await resp.json())
      }
    } catch (e) {
      if (e.name !== 'AbortError') setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Nome"
        value={dados.name}
        onChange={(e) => handleChange('name', e.target.value)}
        disabled={enviando}
      />
      <input
        placeholder="Email"
        value={dados.email}
        onChange={(e) => handleChange('email', e.target.value)}
        disabled={enviando}
      />
      <button type="submit" disabled={enviando}>
        {enviando ? 'Salvando...' : 'Salvar'}
      </button>
      <button type="button" onClick={onCancelar} disabled={enviando}>
        Cancelar
      </button>
      {erro && <p>Erro: {erro}</p>}
    </form>
  )
}