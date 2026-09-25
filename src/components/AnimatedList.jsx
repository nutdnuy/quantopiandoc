// Adapted from React Bits AnimatedList. Native links replace clickable divs;
// native Tab remains intact, and layout transitions preserve result identity.
import {motion,useReducedMotion} from 'motion/react';
export default function AnimatedList({items}) {
 const reduced=useReducedMotion();
 return <div className="rb-list">{items.map(item=><motion.div layout={!reduced?'position':false} initial={false} transition={{duration:reduced?0:.15}} key={item.id} data-id={item.id}><a href={item.id+'.html'}><strong>{item.title}</strong><span>{item.subtitle} · {item.group}</span></a></motion.div>)}</div>;
}
