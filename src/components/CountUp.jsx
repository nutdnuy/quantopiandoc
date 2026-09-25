// Adapted from React Bits CountUp, pinned commit in data/interaction-manifest.json.
// Retains the motion-value/spring subscription, with final-value accessibility and reduced motion.
import {useEffect,useRef} from 'react';
import {useMotionValue,useSpring,useReducedMotion} from 'motion/react';
export default function CountUp({to}) {
 const ref=useRef(null), reduced=useReducedMotion();
 const value=useMotionValue(to), spring=useSpring(value,{damping:60,stiffness:240});
 useEffect(()=>{if(reduced){value.jump(to);spring.jump(to)}else value.set(to)},[to,reduced,value,spring]);
 useEffect(()=>spring.on('change',n=>{if(ref.current)ref.current.textContent=String(Math.round(n))}),[spring]);
 return <span><span aria-hidden="true" ref={ref}>{to}</span><span className="sr-only">{to}</span></span>;
}
