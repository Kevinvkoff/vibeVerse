import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const demoTracks = [
  { id: 1, title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We’re Dreaming', time: '4:03', color: 'violet', cover: 'photo-1470225620780-dba8ba36b745', genre: 'Électro' },
  { id: 2, title: 'The Less I Know The Better', artist: 'Tame Impala', album: 'Currents', time: '3:36', color: 'orange', cover: 'photo-1500530855697-b586d89ba3ee', genre: 'Indie' },
  { id: 3, title: 'Sunset Lover', artist: 'Petit Biscuit', album: 'Presence', time: '3:57', color: 'pink', cover: 'photo-1470252649378-9c29740c9fa8', genre: 'Électro' },
  { id: 4, title: 'Feels Like We Only Go Backwards', artist: 'Tame Impala', album: 'Lonerism', time: '3:12', color: 'blue', cover: 'photo-1518837695005-2083093ee35b', genre: 'Indie' },
  { id: 5, title: 'Instant Crush', artist: 'Daft Punk', album: 'Random Access Memories', time: '5:37', color: 'gold', cover: 'photo-1519608487953-e999c86e7455', genre: 'Électro' },
]

const collections = [
  { id: 'mix-night', title: 'Nuits électriques', color: 'mix-purple', cover: 'photo-1519608487953-e999c86e7455' },
  { id: 'mix-sun', title: 'Soleil dans les écouteurs', color: 'mix-orange', cover: 'photo-1470252649378-9c29740c9fa8' },
  { id: 'mix-indie', title: 'Indie, toujours', color: 'mix-green', cover: 'photo-1500530855697-b586d89ba3ee' },
  { id: 'mix-calm', title: 'Loin du bruit', color: 'mix-blue', cover: 'photo-1518837695005-2083093ee35b' },
]
const starterPlaylistTracks = {
  'Nuits électriques': [1, 3, 5],
  'Soleil dans les écouteurs': [1, 2, 3],
  'Indie, toujours': [2, 4],
  'Loin du bruit': [3, 4, 5],
}

const coverStyle = (cover, width = 480) => ({
  backgroundImage: cover?.startsWith('http')
    ? `url("${cover}")`
    : `url("https://images.unsplash.com/${cover}?auto=format&fit=crop&w=${width}&q=85")`,
})

const formatDuration = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
const fetchCatalog = async () => {
  const catalog = []
  let page = 1
  let lastPage = 1

  do {
    const response = await fetch(`/api/tracks?page=${page}`)
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const payload = await response.json()
    if (!Array.isArray(payload.data)) throw new Error('Invalid tracks response')
    catalog.push(...payload.data)
    lastPage = Number(payload.last_page) || 1
    page += 1
  } while (page <= lastPage)

  return catalog
}

const readStored = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Could not save ${key} in browser storage.`, error)
  }
}

const openAudioLibrary = () => new Promise((resolve, reject) => {
  const request = indexedDB.open('vibeverse-audio-library', 1)
  request.onupgradeneeded = () => request.result.createObjectStore('audio', { keyPath: 'id' })
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

const saveAudioFile = async (record) => {
  const database = await openAudioLibrary()
  await new Promise((resolve, reject) => {
    const transaction = database.transaction('audio', 'readwrite')
    transaction.objectStore('audio').put(record)
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
  database.close()
}

const loadAudioFiles = async () => {
  const database = await openAudioLibrary()
  const records = await new Promise((resolve, reject) => {
    const transaction = database.transaction('audio', 'readonly')
    const request = transaction.objectStore('audio').getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  database.close()
  return records
}

function Icon({ name, size = 20 }) {
  const paths = {
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    library: <path d="M4 5v14M8 5v14M12 6v12M17 5l3 14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    heart: <path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.4 4.4 0 0 1 12 6.6a4.4 4.4 0 0 1 8.8 2.2Z" />,
    play: <path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none" />,
    pause: <path d="M8 5h3v14H8zM15 5h3v14h-3z" fill="currentColor" stroke="none" />,
    next: <path d="m5 5 10 7-10 7zM19 5v14" fill="currentColor" stroke="none" />,
    shuffle: <path d="m3 7 18 10M3 17 18 7M18 7h3v3M18 17h3v-3" />,
    repeat: <path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3" />,
    volume: <path d="M11 5 6 9H3v6h3l5 4zM15 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /><path d="M10 11v5m4-5v5" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [tracks, setTracks] = useState(demoTracks)
  const [activeTrack, setActiveTrack] = useState(demoTracks[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [liked, setLiked] = useState(() => readStored('vibeverse-liked', []))
  const [playlists, setPlaylists] = useState(() => readStored('vibeverse-playlists', null) ?? collections.map((item) => ({
    ...item,
    trackIds: starterPlaylistTracks[item.title],
  })))
  const [activeNav, setActiveNav] = useState('Accueil')
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  const [filterGenre, setFilterGenre] = useState('Tout')
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef(null)
  const fileInputRef = useRef(null)
  const activeTrackRef = useRef(activeTrack)
  const playNextRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetchCatalog()
      .then((catalog) => {
        const apiTracks = catalog.map((track, index) => ({
          id: track.id,
          title: track.title,
          artist: track.artist?.name ?? 'Artiste inconnu',
          album: track.album?.title ?? 'Single',
          time: formatDuration(track.duration_seconds ?? 0),
          duration: track.duration_seconds ?? 0,
          audioUrl: track.audio_url,
          color: demoTracks[index % demoTracks.length].color,
          cover: track.cover_url ?? track.album?.cover_url ?? demoTracks[index % demoTracks.length].cover,
          genre: track.genre ?? 'Autre',
        }))
        if (!cancelled && apiTracks.length > 0) {
          setTracks(apiTracks)
          setActiveTrack(apiTracks[0])
          setPlaylists((current) => current.map((playlist) => {
            const seededTracks = playlist.trackIds.length > 0
              ? playlist.trackIds.map((id) => demoTracks.find((track) => track.id === id)?.title)
              : starterPlaylistTracks[playlist.title]?.map((id) => demoTracks.find((track) => track.id === id)?.title) ?? []
            return {
              ...playlist,
              trackIds: playlist.trackIds.length > 0
                ? playlist.trackIds.map((id, index) => apiTracks.some((track) => track.id === id)
                  ? id
                  : apiTracks.find((track) => track.title === seededTracks[index])?.id).filter((id) => id !== undefined)
                : seededTracks.map((title) => apiTracks.find((track) => track.title === title)?.id).filter((id) => id !== undefined),
            }
          }))
        }
      })
      .catch((error) => {
        console.error('Could not load the VibeVerse catalogue.', error)
        if (!cancelled) setNotice('Catalogue de démonstration affiché : l’API est momentanément indisponible.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    loadAudioFiles()
      .then((files) => {
        if (cancelled || files.length === 0) return
        const restoredTracks = files.map((file, index) => ({
          id: file.id,
          title: file.title,
          artist: 'Fichier importé',
          album: 'Ma musique',
          time: '—:—',
          duration: 0,
          audioUrl: URL.createObjectURL(file.blob),
          localFile: true,
          color: demoTracks[index % demoTracks.length].color,
          cover: demoTracks[index % demoTracks.length].cover,
          genre: 'Importé',
        }))
        setTracks((current) => [...current.filter((track) => !restoredTracks.some((restored) => restored.id === track.id)), ...restoredTracks])
      })
      .catch((error) => {
        console.error('Could not restore imported audio files.', error)
        if (!cancelled) setNotice('Impossible de restaurer ta musique importée depuis ce navigateur.')
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    writeStored('vibeverse-liked', liked)
  }, [liked])

  useEffect(() => {
    writeStored('vibeverse-playlists', playlists)
  }, [playlists])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    if (!activeTrack.audioUrl) {
      audio.pause()
      return
    }
    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Could not play this audio track.', error)
        setIsPlaying(false)
        setNotice('Lecture impossible. Vérifie le fichier audio ou son adresse.')
      })
    } else {
      audio.pause()
    }
  }, [activeTrack, isPlaying, volume])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 5000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const filteredTracks = useMemo(() => {
    let visible = tracks
    if (activeNav === 'Titres likés') visible = visible.filter((track) => liked.includes(track.id))
    if (selectedPlaylist) visible = visible.filter((track) => selectedPlaylist.trackIds.includes(track.id))
    if (activeNav === 'Explorer' && filterGenre !== 'Tout') visible = visible.filter((track) => track.genre === filterGenre)
    const search = query.trim().toLocaleLowerCase()
    if (search) visible = visible.filter((track) => `${track.title} ${track.artist} ${track.genre} ${track.album}`.toLocaleLowerCase().includes(search))
    return visible
  }, [activeNav, filterGenre, liked, query, selectedPlaylist, tracks])

  const toggleLike = (track) => setLiked((current) => current.includes(track.id) ? current.filter((id) => id !== track.id) : [...current, track.id])
  const playTrack = (track, queue = filteredTracks) => {
    if (!track) return
    if (activeTrack.id === track.id) {
      if (!track.audioUrl) setNotice('Ajoute un fichier audio pour écouter ce morceau.')
      else setIsPlaying((playing) => !playing)
    }
    else {
      setActiveTrack(track)
      setProgress(0)
      setDuration(track.duration ?? 0)
      setIsPlaying(Boolean(track.audioUrl))
      if (!track.audioUrl) setNotice('Ajoute un fichier audio pour écouter ce morceau.')
    }
    if (queue.length) setQueueIds(queue.map((item) => item.id))
  }
  const [queueIds, setQueueIds] = useState(() => demoTracks.map((track) => track.id))

  const playNext = (direction = 1) => {
    const queue = tracks.filter((track) => queueIds.includes(track.id))
    if (!queue.length) return
    if (shuffle && direction > 0) {
      const candidates = queue.filter((track) => track.id !== activeTrack.id)
      playTrack(candidates[Math.floor(Math.random() * candidates.length)] ?? queue[0], queue)
      return
    }
    const foundIndex = queue.findIndex((track) => track.id === activeTrack.id)
    const currentIndex = foundIndex === -1 ? (direction > 0 ? -1 : 0) : foundIndex
    const nextIndex = (currentIndex + direction + queue.length) % queue.length
    playTrack(queue[nextIndex], queue)
  }

  useEffect(() => {
    activeTrackRef.current = activeTrack
    playNextRef.current = playNext
  })

  useEffect(() => {
    const handleShortcuts = (event) => {
      const target = event.target
      const isTyping = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.querySelector('.search-box input')?.focus()
      } else if (event.code === 'Space' && !isTyping) {
        event.preventDefault()
        if (activeTrackRef.current.audioUrl) setIsPlaying((playing) => !playing)
        else fileInputRef.current?.click()
      } else if (event.code === 'ArrowRight' && !isTyping) {
        playNextRef.current?.()
      } else if (event.code === 'ArrowLeft' && !isTyping) {
        playNextRef.current?.(-1)
      }
    }
    window.addEventListener('keydown', handleShortcuts)
    return () => window.removeEventListener('keydown', handleShortcuts)
  }, [])

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files ?? [])
    const audioFiles = files.filter((file) => file.type.startsWith('audio/'))
    if (!audioFiles.length) {
      setNotice('Sélectionne un fichier audio pris en charge.')
      event.target.value = ''
      return
    }
    try {
      const imported = await Promise.all(audioFiles.map(async (file, index) => {
        const id = `local-${Date.now()}-${index}`
        const title = file.name.replace(/\.[^.]+$/, '')
        await saveAudioFile({ id, title, blob: file })
        return {
          id,
          title,
          artist: 'Fichier importé',
          album: 'Ma musique',
          time: '—:—',
          duration: 0,
          audioUrl: URL.createObjectURL(file),
          localFile: true,
          color: demoTracks[(tracks.length + index) % demoTracks.length].color,
          cover: demoTracks[(tracks.length + index) % demoTracks.length].cover,
          genre: 'Importé',
        }
      }))
      setTracks((current) => [...current, ...imported])
      setActiveNav('Explorer')
      setFilterGenre('Tout')
      setNotice(`${audioFiles.length} morceau${audioFiles.length > 1 ? 'x ajoutés' : ' ajouté'} à ta bibliothèque.`)
    } catch (error) {
      console.error('Could not import audio files.', error)
      setNotice('Import impossible. Vérifie les permissions de stockage de ton navigateur.')
    } finally {
      event.target.value = ''
    }
  }

  const createPlaylist = (event) => {
    event.preventDefault()
    const name = playlistName.trim()
    if (!name) return
    const playlist = {
      id: `playlist-${Date.now()}`,
      title: name,
      color: 'mix-green',
      cover: collections[playlists.length % collections.length].cover,
      trackIds: [],
    }
    setPlaylists((current) => [...current, playlist])
    setPlaylistName('')
    setIsPlaylistDialogOpen(false)
    setSelectedPlaylist(playlist)
    setActiveNav('Ma bibliothèque')
  }

  const addTrackToPlaylist = (playlistId, track) => {
    if (!playlistId) {
      setNotice('Crée une playlist pour y ajouter ce morceau.')
      setIsPlaylistDialogOpen(true)
      return
    }
    setPlaylists((current) => current.map((playlist) => playlist.id === playlistId && !playlist.trackIds.includes(track.id)
      ? { ...playlist, trackIds: [...playlist.trackIds, track.id] }
      : playlist))
    const playlist = playlists.find((item) => item.id === playlistId)
    setNotice(playlist ? `« ${track.title} » ajouté à « ${playlist.title} ».` : 'Morceau ajouté à la playlist.')
  }

  const removeTrackFromPlaylist = (playlistId, track) => {
    setPlaylists((current) => current.map((playlist) => playlist.id === playlistId
      ? { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== track.id) }
      : playlist))
    setNotice(`« ${track.title} » retiré de la playlist.`)
  }

  const removePlaylist = (playlistId) => {
    setPlaylists((current) => current.filter((playlist) => playlist.id !== playlistId))
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null)
      setActiveNav('Ma bibliothèque')
    }
  }

  const onTrackEnded = () => {
    if (repeat) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.error('Could not replay this audio track.', error)
        setIsPlaying(false)
      })
    } else if (queueIds.filter((id) => tracks.some((track) => track.id === id)).length > 1) playNext()
    else setIsPlaying(false)
  }

  const genres = ['Tout', ...new Set(tracks.map((track) => track.genre).filter(Boolean))]
  const pageTitle = selectedPlaylist?.title ?? (activeNav === 'Titres likés' ? 'Tes titres likés' : activeNav === 'Ma bibliothèque' ? 'Ta bibliothèque' : activeNav === 'Explorer' ? 'Explorer les sons' : 'Ta musique, ton monde.')

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => { setActiveNav('Accueil'); setSelectedPlaylist(null) }} aria-label="VibeVerse, accueil">
          <span className="brand-mark"><i /><i /><i /><i /></span><span>vibe<span className="brand-light">verse</span></span>
        </button>
        <nav className="main-nav" aria-label="Navigation principale">
          {[['Accueil', 'home'], ['Explorer', 'search'], ['Ma bibliothèque', 'library']].map(([label, icon]) => (
            <button key={label} className={`nav-link ${activeNav === label ? 'selected' : ''}`} onClick={() => { setActiveNav(label); setSelectedPlaylist(null) }}><Icon name={icon} /><span>{label}</span></button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="library-heading"><span>TA COLLECTION</span><button aria-label="Créer une playlist" onClick={() => setIsPlaylistDialogOpen(true)}><Icon name="plus" size={19} /></button></div>
        <button className={`nav-link library-link ${activeNav === 'Titres likés' ? 'selected' : ''}`} onClick={() => { setActiveNav('Titres likés'); setSelectedPlaylist(null) }}><span className="liked-icon"><Icon name="heart" size={18} /></span><span>Titres likés <small>{liked.length} titre{liked.length > 1 ? 's' : ''}</small></span></button>
        <div className="playlist-list">{playlists.map((item) => <button key={item.id} className={`playlist-link ${selectedPlaylist?.id === item.id ? 'playlist-selected' : ''}`} onClick={() => { setSelectedPlaylist(item); setActiveNav('Ma bibliothèque') }}><span className={`mini-cover ${item.color}`} style={coverStyle(item.cover, 100)} /><span>{item.title}</span></button>)}</div>
        <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-spark">✳</span><p>La musique est meilleure <strong>quand elle nous rassemble.</strong></p><span className="note-caption">PARTAGE TES VIBES.</span></div><button className="profile" onClick={() => fileInputRef.current?.click()}><span className="avatar">L</span><span>Ajouter ma musique<small>Importer des fichiers audio</small></span><span className="profile-dots"><Icon name="plus" size={17} /></span></button></div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="history-controls"><button aria-label="Retour à l’accueil" onClick={() => { setActiveNav('Accueil'); setSelectedPlaylist(null) }}>‹</button><button aria-label="Explorer" onClick={() => { setActiveNav('Explorer'); setSelectedPlaylist(null) }}>›</button></div>
          <label className="search-box"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Que veux-tu écouter ?" aria-label="Rechercher des titres ou artistes" /><kbd>⌘ K</kbd></label>
          <div className="top-actions"><button className="upgrade-button" onClick={() => fileInputRef.current?.click()}><Icon name="plus" size={14} /> Importer ma musique</button><button className="notification-button" aria-label="Créer une playlist" onClick={() => setIsPlaylistDialogOpen(true)}><Icon name="plus" size={17} /></button></div>
        </header>

        <div className="page-content">
          <div className="greeting-row"><div><p className="eyebrow">{activeNav === 'Accueil' ? 'TA BANDE-SON DU JOUR' : activeNav.toUpperCase()}</p><h1>{pageTitle === 'Ta musique, ton monde.' ? <>Ta musique, <span>ton monde.</span></> : pageTitle}</h1><p className="greeting-sub">{activeNav === 'Accueil' ? 'Un nouveau jour, une nouvelle bande-son.' : `${filteredTracks.length} morceau${filteredTracks.length > 1 ? 'x' : ''} dans ta sélection.`}</p></div><div className="greeting-art" aria-hidden="true"><span>♪</span><span>♫</span><span>♪</span><div className="art-orb" /></div></div>

          {activeNav === 'Accueil' && <section className="quick-picks" aria-label="Reprendre l'écoute"><button className="quick-card quick-highlight" onClick={() => playTrack(tracks[0])}><span className="quick-cover cover-violet" style={coverStyle(tracks[0]?.cover, 180)} /><span className="quick-title">Tes découvertes<br />de la semaine</span><span className="quick-play"><Icon name="play" size={17} /></span></button>{playlists.slice(0, 5).map((item) => <button className="quick-card" key={item.id} onClick={() => { setSelectedPlaylist(item); setActiveNav('Ma bibliothèque') }}><span className={`quick-cover ${item.color}`} style={coverStyle(item.cover, 180)} /><span className="quick-title">{item.title}</span><span className="quick-play"><Icon name="play" size={17} /></span></button>)}</section>}

          {activeNav === 'Explorer' && <div className="genre-filters" aria-label="Filtrer par genre">{genres.map((genre) => <button key={genre} className={filterGenre === genre ? 'genre-active' : ''} onClick={() => setFilterGenre(genre)}>{genre}</button>)}<button className="import-inline" onClick={() => fileInputRef.current?.click()}><Icon name="plus" size={15} /> Importer des fichiers</button></div>}

          {activeNav === 'Accueil' && <section className="section-block"><div className="section-heading"><div><p className="eyebrow">FAIT POUR TOI</p><h2>Dans ta rotation <span className="heading-spark">✳</span></h2><p className="section-description">Des morceaux qui te ressemblent, aujourd’hui.</p></div><button className="text-link" onClick={() => { setActiveNav('Explorer'); setSelectedPlaylist(null) }}>Tout découvrir <Icon name="arrow" size={14} /></button></div>
            <div className="track-grid">{filteredTracks.slice(0, 5).map((track, index) => <button className="track-card" key={track.id} onClick={() => playTrack(track)}><span className={`track-cover ${track.color}`} style={coverStyle(track.cover)}><span className="cover-index">0{index + 1}</span><span className="card-play"><Icon name="play" size={17} /></span></span><span className="track-card-title">{track.title}</span><span className="track-card-artist">{track.artist}</span></button>)}</div>
          </section>}

          <section className="section-block tracks-section"><div className="section-heading track-heading"><div><p className="eyebrow">{activeNav === 'Accueil' ? 'TES PROCHAINES VIBES' : 'TA SÉLECTION'}</p><h2>{selectedPlaylist ? 'Dans cette playlist.' : activeNav === 'Titres likés' ? 'Les morceaux que tu aimes.' : activeNav === 'Explorer' ? 'Tous les morceaux.' : activeNav === 'Ma bibliothèque' ? 'Tes playlists.' : 'Un peu plus de toi.'}</h2></div><div className="heading-actions">{selectedPlaylist && <button className="text-link delete-playlist" onClick={() => removePlaylist(selectedPlaylist.id)}><Icon name="trash" size={14} /> Supprimer</button>}<button className="text-link" onClick={() => fileInputRef.current?.click()}><Icon name="plus" size={14} /> Ajouter ma musique</button></div></div>
            {activeNav === 'Ma bibliothèque' && !selectedPlaylist && <div className="library-playlist-grid">{playlists.map((playlist) => <button className="library-playlist-card" key={playlist.id} onClick={() => setSelectedPlaylist(playlist)}><span className={`library-playlist-cover ${playlist.color}`} style={coverStyle(playlist.cover)} /><strong>{playlist.title}</strong><small>{playlist.trackIds.length} morceau{playlist.trackIds.length === 1 ? '' : 'x'}</small></button>)}<button className="library-playlist-card new-playlist-card" onClick={() => setIsPlaylistDialogOpen(true)}><span><Icon name="plus" size={28} /></span><strong>Créer une playlist</strong></button></div>}
            {(activeNav !== 'Ma bibliothèque' || selectedPlaylist) && <><div className="table-head"><span>#</span><span>TITRE</span><span>ALBUM</span><span><Icon name="clock" size={15} /></span></div>
            <div className="track-table">{filteredTracks.map((track, index) => <div className={`track-row ${activeTrack.id === track.id ? 'currently-playing' : ''}`} key={track.id}><button className="row-index" aria-label={`Lire ${track.title}`} onClick={() => playTrack(track)}>{activeTrack.id === track.id && isPlaying ? <span className="playing-bars"><i /><i /><i /></span> : <><span className="index-number">{String(index + 1).padStart(2, '0')}</span><span className="row-play"><Icon name="play" size={15} /></span></>}</button><button className="row-song" onClick={() => playTrack(track)}><span className={`row-cover ${track.color}`} style={coverStyle(track.cover, 100)} /><span><strong>{track.title}</strong><small>{track.artist}</small></span></button><span className="row-album">{track.album}</span><div className="row-actions"><button className={`like-button ${liked.includes(track.id) ? 'is-liked' : ''}`} aria-label={liked.includes(track.id) ? 'Retirer des titres likés' : 'Ajouter aux titres likés'} onClick={() => toggleLike(track)}><Icon name="heart" size={17} /></button>{selectedPlaylist ? <button className="remove-track-button" aria-label={`Retirer ${track.title} de la playlist`} onClick={() => removeTrackFromPlaylist(selectedPlaylist.id, track)}><Icon name="trash" size={15} /></button> : <select aria-label={`Ajouter ${track.title} à une playlist`} value="" onChange={(event) => event.target.value && addTrackToPlaylist(event.target.value, track)}><option value="">＋</option>{playlists.map((playlist) => <option value={playlist.id} key={playlist.id}>{playlist.title}</option>)}</select>}<span>{track.time}</span></div></div>)}</div>
            {isLoading && <p className="empty-search">Chargement du catalogue…</p>}
            {!isLoading && filteredTracks.length === 0 && <div className="empty-search">{query ? <>Aucun titre ne correspond à « {query} ».</> : activeNav === 'Titres likés' ? 'Tes titres likés apparaîtront ici.' : selectedPlaylist ? 'Cette playlist est vide. Ajoute des morceaux avec le menu ＋.' : 'Aucun morceau ici pour le moment.'}</div>}</>}
          </section>
          <footer className="page-footer"><span>FAIT AVEC ♡ ET UN PEU TROP DE CAFÉ.</span><span>VIBEVERSE © 2026</span></footer>
        </div>
      </section>

      <footer className="player"><div className="now-playing"><span className={`now-cover ${activeTrack.color}`} style={coverStyle(activeTrack.cover, 140)} /><div className="now-info"><strong>{activeTrack.title}</strong><span>{activeTrack.artist}</span></div><button className={`like-button ${liked.includes(activeTrack.id) ? 'is-liked' : ''}`} aria-label="Aimer ce titre" onClick={() => toggleLike(activeTrack)}><Icon name="heart" size={17} /></button></div><div className="player-center"><div className="player-controls"><button className={shuffle ? 'control-active' : ''} aria-label="Lecture aléatoire" aria-pressed={shuffle} onClick={() => setShuffle((current) => !current)}><Icon name="shuffle" size={16} /></button><button aria-label="Titre précédent" onClick={() => playNext(-1)}><Icon name="next" size={16} /></button><button className="main-play" aria-label={isPlaying ? 'Mettre en pause' : 'Lire'} onClick={() => { if (!activeTrack.audioUrl) { fileInputRef.current?.click(); setNotice('Importe un fichier audio pour démarrer la lecture.') } else setIsPlaying((playing) => !playing) }}><Icon name={isPlaying ? 'pause' : 'play'} size={18} /></button><button aria-label="Titre suivant" onClick={() => playNext()}><Icon name="next" size={16} /></button><button className={repeat ? 'control-active' : ''} aria-label="Répéter le morceau" aria-pressed={repeat} onClick={() => setRepeat((current) => !current)}><Icon name="repeat" size={16} /></button></div><div className="timeline"><span>{formatDuration(Math.floor(progress))}</span><input aria-label="Position de lecture" type="range" min="0" max={duration || activeTrack.duration || 1} value={Math.min(progress, duration || activeTrack.duration || 1)} onChange={(event) => { const time = Number(event.target.value); setProgress(time); if (audioRef.current) audioRef.current.currentTime = time }} /><span>{duration ? formatDuration(Math.floor(duration)) : activeTrack.time}</span></div></div><div className="player-extra"><Icon name="volume" size={19} /><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /><button className="queue-button" aria-label="File d'attente" onClick={() => { setActiveNav('Explorer'); setSelectedPlaylist(null) }}><Icon name="library" size={17} /></button></div></footer>
      <audio ref={audioRef} src={activeTrack.audioUrl || undefined} onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)} onLoadedMetadata={(event) => {
        const seconds = event.currentTarget.duration
        setDuration(seconds)
        if (Number.isFinite(seconds)) {
          setTracks((current) => current.map((track) => track.id === activeTrackRef.current.id ? { ...track, duration: seconds, time: formatDuration(Math.floor(seconds)) } : track))
          setActiveTrack((current) => current.id === activeTrackRef.current.id ? { ...current, duration: seconds, time: formatDuration(Math.floor(seconds)) } : current)
        }
      }} onEnded={onTrackEnded} onError={() => { if (activeTrack.audioUrl) { setIsPlaying(false); setNotice(`Impossible de lire « ${activeTrack.title} » : vérifie le fichier audio.`) } }} />
      <input ref={fileInputRef} className="visually-hidden" type="file" accept="audio/*" multiple onChange={handleFiles} />
      {isPlaylistDialogOpen && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsPlaylistDialogOpen(false) }}><form className="playlist-dialog" onSubmit={createPlaylist}><button className="dialog-close" type="button" aria-label="Fermer" onClick={() => setIsPlaylistDialogOpen(false)}><Icon name="close" /></button><p className="eyebrow">TA COLLECTION</p><h2>Crée ta playlist</h2><label htmlFor="playlist-name">Nom de la playlist</label><input id="playlist-name" autoFocus maxLength="60" value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="Ex. Matin tranquille" required /><button className="create-playlist-button" type="submit" disabled={!playlistName.trim()}>Créer la playlist</button></form></div>}
      {notice && <div className="toast" role="status"><span>✳</span>{notice}<button aria-label="Fermer" onClick={() => setNotice('')}>×</button></div>}
    </main>
  )
}

export default App
