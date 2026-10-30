import { useMemo, useState } from 'react'
import { Navigation } from './components/Navigation'
import { Player } from './components/Player'
import { Home } from './components/Home'
import { ArtistStudio } from './components/ArtistStudio'
import { Profile } from './components/Profile'
import './App.css'
import './navigation.css'

const tracks=[['Kinshasa la nuit','Maya K.','Afrobeat',48231],['Tika ngai','Junior M.','Rumba',39102],['Mboka','Naya Soul','Soul',27880],['Lualaba','Kivu Waves','Amapiano',22190],['Biso nyonso','Sango','Hip-hop',18844]].map((item,index)=>({id:index+1,title:item[0],artist:item[1],genre:item[2],plays:item[3],likes:1200+index*237,duration:`3:4${index}`}))

export default function App(){const[page,setPage]=useState('Accueil');const[active,setActive]=useState(tracks[0]);const[playing,setPlaying]=useState(false);const[query,setQuery]=useState('');const[liked,setLiked]=useState(new Set());const[connected,setConnected]=useState(true);const filtered=useMemo(()=>tracks.filter(t=>`${t.title} ${t.artist} ${t.genre}`.toLowerCase().includes(query.toLowerCase())),[query]);const play=track=>{setActive(track);setPlaying(true)};const toggleLike=id=>setLiked(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next});return <main className="app-shell"><Navigation page={page} onNavigate={setPage} connected={connected} onAuthToggle={()=>setConnected(value=>!value)}/><section className="content"><header><label className="search">Rechercher<input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Titre, artiste ou genre"/></label><div className="top-links"><button onClick={()=>setPage('Premium')}>Premium</button><button>Assistance</button><button>Télécharger</button><button>Confidentialité</button><button>Conditions</button><button className="profile-link" onClick={()=>setPage('Profil')}>{connected?'Kevin':'Connexion'}</button></div></header>{page==='Studio artiste'?<ArtistStudio/>:page==='Profil'?<Profile/>:<Home tracks={filtered} activeTrack={active} isPlaying={playing} onPlay={play} liked={liked} onLike={toggleLike}/>}</section><Player track={active} isPlaying={playing} onToggle={()=>setPlaying(value=>!value)}/></main>}
