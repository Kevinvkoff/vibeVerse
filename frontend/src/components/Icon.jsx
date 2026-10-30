import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faChartLine, faCirclePlay, faCompactDisc, faHouse, faMagnifyingGlass, faMusic, faPause, faUser } from '@fortawesome/free-solid-svg-icons'

const icons={home:faHouse,search:faMagnifyingGlass,library:faCompactDisc,studio:faMusic,profile:faUser,play:faCirclePlay,pause:faPause,chart:faChartLine,menu:faBars}
export function Icon({name,label}){return <FontAwesomeIcon icon={icons[name]} aria-label={label} aria-hidden={label?undefined:true}/>}
