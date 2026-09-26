import React,{useState,useMemo,useId,useEffect} from 'react';
import {labs,defaultParams} from './lab-registry.mjs';
import {runLab} from './lab-models.mjs';
const fmt=x=>Math.abs(x)>=10000?x.toLocaleString('en',{maximumFractionDigits:0}):Math.abs(x)>=100?x.toFixed(0):Math.abs(x)>=1?Number(x.toFixed(2)).toString():Number(x.toPrecision(3)).toString();
function Plot({spec}){
 const id=useId(),all=spec.series.flatMap(s=>s.points),W=720,H=320,margin={left:64,right:20,top:30,bottom:65};
 let x0=spec.xDomain?.[0]??Math.min(...all.map(p=>p[0])),x1=spec.xDomain?.[1]??Math.max(...all.map(p=>p[0]));
 let y0=spec.yDomain?.[0]??Math.min(...all.map(p=>p[1])),y1=spec.yDomain?.[1]??Math.max(...all.map(p=>p[1]));
 if(spec.series.some(s=>s.type==='bar')){y0=Math.min(0,y0);y1=Math.max(0,y1);const range=x1-x0||1;x0-=range*.04;x1+=range*.04}
 if(x0===x1){x0--;x1++}if(y0===y1){y0--;y1++}
 if(!spec.yDomain){const pad=(y1-y0)*.1;const zeroFloor=y0>=0&&/density|count|squared|probability/i.test(spec.yLabel);y0=zeroFloor?0:y0-pad;y1+=pad}
 let pw=W-margin.left-margin.right,ph=H-margin.top-margin.bottom,ox=margin.left,oy=margin.top;
 if(spec.equalAspect){const unit=Math.min(pw/(x1-x0),ph/(y1-y0)),nw=unit*(x1-x0),nh=unit*(y1-y0);ox+=(pw-nw)/2;oy+=(ph-nh)/2;pw=nw;ph=nh}
 const X=x=>ox+(x-x0)/(x1-x0)*pw,Y=y=>oy+(y1-y)/(y1-y0)*ph;
 const ticks=Array.from({length:5},(_,i)=>i/4);
 const colors=['var(--primary)','var(--secondary-text)','var(--text)','var(--lab-warm)'];
 return <figure className="lab-figure"><figcaption>{spec.title}</figcaption><div className="lab-chart-scroll" tabIndex="0" role="region" aria-label={spec.title+' chart'}><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={id+'-title '+id+'-desc'}><title id={id+'-title'}>{spec.title}</title><desc id={id+'-desc'}>{spec.xLabel}; {spec.yLabel}. {spec.series.length} data series. Exact selected results appear below the controls.</desc><defs><clipPath id={id+'-clip'}><rect x={ox} y={oy} width={pw} height={ph}/></clipPath></defs>
 {ticks.map(t=>{const y=y0+t*(y1-y0);return <g key={'y'+t}><line className="lab-grid" x1={ox} x2={ox+pw} y1={Y(y)} y2={Y(y)}/><text className="lab-tick" x={ox-9} y={Y(y)+4} textAnchor="end">{fmt(y)}</text></g>})}
 {(spec.xTicks||ticks.map(t=>[x0+t*(x1-x0),fmt(x0+t*(x1-x0))])).map(([x,label])=><text key={'x'+x} className="lab-tick" x={X(x)} y={oy+ph+24} textAnchor="middle">{label}</text>)}
 <text className="lab-axis-title" x={ox+pw/2} y={H-10} textAnchor="middle">{spec.xLabel}</text><text className="lab-axis-title" transform={`translate(15 ${oy+ph/2}) rotate(-90)`} textAnchor="middle">{spec.yLabel}</text>
 <g clipPath={`url(#${id}-clip)`}>{spec.series.map((s,k)=>{const color=colors[k%colors.length];if(s.type==='scatter')return <g key={k} fill={color}>{s.points.map(([x,y],i)=><circle key={i} cx={X(x)} cy={Y(y)} r="3" opacity=".7"/>)}</g>;
 if(s.type==='bar'){const gap=s.points.length>1?Math.abs(X(s.points[1][0])-X(s.points[0][0])):30,width=Math.min(55,gap*.72);return <g key={k} fill={color}>{s.points.map(([x,y],i)=><rect key={i} x={X(x)-width/2} y={Math.min(Y(0),Y(y))} width={width} height={Math.max(.8,Math.abs(Y(y)-Y(0)))} opacity=".8"/>)}</g>}
 return <path key={k} d={s.points.map(([x,y],i)=>(i?'L':'M')+X(x)+','+Y(y)).join(' ')} fill="none" stroke={color} strokeWidth="2" strokeDasharray={k%3===1?'6 3':undefined}/>})}
 {(spec.hLines||[]).map((l,i)=><line key={'h'+i} x1={ox} x2={ox+pw} y1={Y(l.y)} y2={Y(l.y)} stroke="var(--muted)" strokeDasharray="3 4"/>)}
 {(spec.vLines||[]).map((l,i)=><line key={'v'+i} x1={X(l.x)} x2={X(l.x)} y1={oy} y2={oy+ph} stroke="var(--muted)" strokeDasharray="3 4"/>)}</g>
 {(spec.vLines||[]).map((l,i)=><text key={i} className="lab-reference" x={Math.max(ox+45,Math.min(ox+pw-45,X(l.x)))} y={17+(i%2)*12} textAnchor="middle">{l.label}</text>)}
 </svg></div><p className="lab-scroll-hint">เลื่อนกราฟแนวนอนเพื่อดูครบ</p>{!spec.hideLegend&&<ul className="lab-legend">{spec.series.map((s,i)=><li key={i}><span aria-hidden="true" style={{background:colors[i%4]}}/>{s.name}</li>)}</ul>}
 </figure>
}
function DataTable({table}){return <div className="lab-table-wrap" tabIndex="0" role="region" aria-label="Calculated data"><table><thead><tr>{table.columns.map(c=><th key={c} scope="col">{c}</th>)}</tr></thead><tbody>{table.rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
export default function ActiveLab({labId}){
 const lab=labs.find(x=>x.id===labId),[p,setP]=useState(()=>defaultParams(lab)),uid=useId();
 const output=useMemo(()=>runLab(lab.kind,p),[lab,p]);
 useEffect(()=>{if(location.hash==='#'+lab.id)requestAnimationFrame(()=>document.getElementById(lab.id)?.scrollIntoView({block:'start'}))},[lab.id]);
 const update=(c,value)=>setP(old=>({...old,[c.id]:c.type==='range'||/^[-\d.]+$/.test(value)?Number(value):value}));
 return <section className="active-lab" aria-labelledby={uid+'-heading'} data-kind={lab.kind}><div className="lab-heading"><div><p className="lab-eyebrow">ACTIVE VIZ</p><h3 id={uid+'-heading'}>{lab.title}</h3></div><button className="lab-reset" onClick={()=>setP(defaultParams(lab))}>Reset</button></div><p className="lab-prompt">{lab.prompt}</p><div className="lab-controls">{lab.controls.map(c=><div className="lab-control" key={c.id}><label htmlFor={uid+c.id}>{c.label}{c.type==='range'&&<output htmlFor={uid+c.id}>{p[c.id]} {c.unit}</output>}</label>{c.type==='range'?<input id={uid+c.id} type="range" min={c.min} max={c.max} step={c.step} value={p[c.id]} aria-valuetext={p[c.id]+' '+c.unit} onChange={e=>update(c,e.target.value)}/>:<select id={uid+c.id} value={p[c.id]} onChange={e=>update(c,e.target.value)}>{c.options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select>}</div>)}</div><dl className="lab-metrics" aria-live="polite" aria-atomic="true">{output.metrics.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="lab-plots">{output.charts.map((c,i)=><Plot key={i} spec={c}/>)}</div>{output.table&&<DataTable table={output.table}/>}<p className="lab-assumptions">{output.note}</p><p className="lab-data-status">Illustrative model · ข้อมูลสมมติ</p></section>
}
