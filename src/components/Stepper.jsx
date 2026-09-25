// Adapted from React Bits Stepper (state, direction, indicator and presence patterns).
// Stage browsing is not completion; no implied progress/checkmarks. Native buttons,
// unhidden content sizing, reduced motion, and tokenized surfaces replace demo styling.
import {useState} from 'react';
import {motion,AnimatePresence,useReducedMotion} from 'motion/react';
export default function Stepper({steps}) {
 const [currentStep,setCurrentStep]=useState(0),[direction,setDirection]=useState(1);
 const reduced=useReducedMotion(),step=steps[currentStep];
 const updateStep=n=>{setDirection(n>currentStep?1:-1);setCurrentStep(n)};
 return <section className="rb-stepper" aria-label="Explore the seven study stages">
  <div className="stepper-heading"><p className="eyebrow">FIND YOUR STARTING POINT</p><span className="small">Part {currentStep+1} / {steps.length}</span></div>
  <div className="stepper-indicators" aria-label="Choose a study stage">{steps.map((s,i)=><button key={s.id} className="step-indicator" aria-label={`Part ${i+1}: ${s.title}`} aria-pressed={i===currentStep} onClick={()=>updateStep(i)}>{s.number}</button>)}</div>
  <AnimatePresence initial={false} mode="wait"><motion.div key={step.id} initial={reduced?false:{x:direction*12,opacity:0}} animate={{x:0,opacity:1}} exit={reduced?undefined:{x:-direction*12,opacity:0}} transition={{duration:reduced?0:.12}} className="stepper-content" aria-live="polite"><p className="eyebrow">{step.label}</p><h3>{step.title}</h3><p>{step.description}</p><a className="button outlined" href={step.topics[0]+'.html'}>Start this part ↗</a></motion.div></AnimatePresence>
  <div className="stepper-footer"><button className="text-button" disabled={currentStep===0} onClick={()=>updateStep(currentStep-1)}>← Previous part</button><button className="text-button" disabled={currentStep===steps.length-1} onClick={()=>updateStep(currentStep+1)}>Next part →</button></div>
 </section>;
}
