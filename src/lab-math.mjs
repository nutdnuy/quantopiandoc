// Deterministic teaching models. Values are hypothetical, never market observations.
export const sum=a=>a.reduce((s,x)=>s+x,0);
export const mean=a=>sum(a)/a.length;
export const variance=(a,ddof=1)=>sum(a.map(x=>(x-mean(a))**2))/(a.length-ddof);
export const sd=a=>Math.sqrt(variance(a));
export const linspace=(a,b,n=101)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));
export const zip=(x,y)=>x.map((v,i)=>[v,y[i]]);
export const pct=(x,d=2)=>(100*x).toFixed(d)+'%';
export const num=(x,d=3)=>Number.isFinite(x)?x.toFixed(d):'ไม่กำหนด';
export function random(seed=42){let s=seed>>>0;return()=>{s=(1664525*s+1013904223)>>>0;return(s+.5)/4294967296}}
export function normals(n,seed=42){const r=random(seed);return Array.from({length:n},()=>Math.sqrt(-2*Math.log(r()))*Math.cos(2*Math.PI*r()))}
export function corr(x,y){const mx=mean(x),my=mean(y);return sum(x.map((a,i)=>(a-mx)*(y[i]-my)))/Math.sqrt(sum(x.map(a=>(a-mx)**2))*sum(y.map(a=>(a-my)**2)))}
export function ranks(x){const ids=x.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0]),r=[];for(let j=0;j<ids.length;){let k=j+1;while(k<ids.length&&ids[k][0]===ids[j][0])k++;for(let z=j;z<k;z++)r[ids[z][1]]=(j+k+1)/2;j=k}return r}
export const spearman=(x,y)=>corr(ranks(x),ranks(y));
export const normalPdf=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
export function normalCdf(x){const z=Math.abs(x),t=1/(1+.2316419*z);const a=1-normalPdf(z)*t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x<0?1-a:a}
export function normalQuantile(p){let lo=-9,hi=9;for(let i=0;i<65;i++){const mid=(lo+hi)/2;if(normalCdf(mid)<p)lo=mid;else hi=mid}return(lo+hi)/2}
export function gamma(z){const c=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];if(z<.5)return Math.PI/(Math.sin(Math.PI*z)*gamma(1-z));z--;let x=.99999999999980993;for(let i=0;i<c.length;i++)x+=c[i]/(z+i+1);const t=z+7.5;return Math.sqrt(2*Math.PI)*t**(z+.5)*Math.exp(-t)*x}
export function studentPdfStandardized(x,nu){const s=Math.sqrt((nu-2)/nu),t=x/s;return gamma((nu+1)/2)/(Math.sqrt(nu*Math.PI)*gamma(nu/2))*(1+t*t/nu)**(-(nu+1)/2)/s}
export function gammaStandardized(x,k,sign=1){const z=sign*x*Math.sqrt(k)+k;return z<=0?0:Math.sqrt(k)*z**(k-1)*Math.exp(-z)/gamma(k)}
export function histogram(a,bins=20){const lo=Math.min(...a),hi=Math.max(...a),w=(hi-lo||1)/bins;const counts=Array(bins).fill(0);for(const x of a)counts[Math.min(bins-1,Math.floor((x-lo)/w))]++;return counts.map((n,i)=>[lo+(i+.5)*w,n])}
export function solve(A,b){const a=A.map((r,i)=>[...r,b[i]]),n=b.length;for(let k=0;k<n;k++){let pivot=k;for(let i=k+1;i<n;i++)if(Math.abs(a[i][k])>Math.abs(a[pivot][k]))pivot=i;[a[k],a[pivot]]=[a[pivot],a[k]];if(Math.abs(a[k][k])<1e-13)throw Error('Singular teaching model');const d=a[k][k];for(let j=k;j<=n;j++)a[k][j]/=d;for(let i=0;i<n;i++)if(i!==k){const f=a[i][k];for(let j=k;j<=n;j++)a[i][j]-=f*a[k][j]}}return a.map(r=>r[n])}
export function ols(X,y){const k=X[0].length,A=Array.from({length:k},(_,i)=>Array.from({length:k},(_,j)=>sum(X.map(r=>r[i]*r[j])))),b=Array.from({length:k},(_,i)=>sum(X.map((r,j)=>r[i]*y[j])));const beta=solve(A,b),fitted=X.map(r=>sum(r.map((x,j)=>x*beta[j]))),residual=y.map((x,i)=>x-fitted[i]);return{beta,fitted,residual,r2:1-sum(residual.map(x=>x*x))/sum(y.map(x=>(x-mean(y))**2))}}
export const fitLine=(x,y)=>ols(x.map(v=>[1,v]),y);
export function quantile(a,p){const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,k=Math.floor(i);return s[k]+(s[Math.min(k+1,s.length-1)]-s[k])*(i-k)}
// Integrate the upper (1-alpha) empirical probability mass, including fractional cutoff mass.
export function expectedShortfall(losses,alpha){const a=[...losses].sort((x,y)=>y-x),mass=a.length*(1-alpha),whole=Math.floor(mass),fraction=mass-whole;return(sum(a.slice(0,whole))+(fraction>1e-12?a[whole]*fraction:0))/mass}
export function wealth(returns,start=100){let v=start;return[start,...returns.map(r=>v*=1+r)]}
export function maxDrawdown(path){let peak=path[0],worst=0;for(const v of path){peak=Math.max(peak,v);worst=Math.min(worst,v/peak-1)}return worst}
export function rolling(x,n){return x.map((_,i)=>i+1<n?null:mean(x.slice(i-n+1,i+1)))}
