import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import CountUp from './components/CountUp.jsx';
import AnimatedList from './components/AnimatedList.jsx';
import Stepper from './components/Stepper.jsx';
import curriculum from '../data/curriculum.json';
const pathRoot=document.querySelector('#path-explorer');
if(pathRoot)createRoot(pathRoot).render(<Stepper steps={curriculum}/>);
const results=document.querySelector('#search-results');
if(results){const root=createRoot(results);window.researchRenderResults=items=>root.render(items.length?<AnimatedList items={items.slice(0,30)}/>:<p>ไม่พบหัวข้อ ลองใช้คำสั้นลง หรือค้นด้วยชื่อภาษาอังกฤษ</p>)}
function readCount(){try{return Object.values(JSON.parse(localStorage.getItem('qrl-completed')||'{}')).filter(Boolean).length}catch{return 0}}
function ReadCount(){const[count,setCount]=useState(readCount);useEffect(()=>{const update=()=>setCount(readCount());window.addEventListener('research-progress',update);return()=>window.removeEventListener('research-progress',update)},[]);return <span className="completion-count" aria-live="polite"><CountUp to={count}/> / 53 lessons read</span>}
const counter=document.querySelector('#read-count');if(counter)createRoot(counter).render(<ReadCount/>);
