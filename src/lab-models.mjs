import {sum,mean,variance,sd,linspace,zip,pct,num,random,normals,corr,spearman,normalPdf,normalCdf,normalQuantile,studentPdfStandardized,gammaStandardized,histogram,ols,fitLine,quantile,expectedShortfall,wealth,maxDrawdown,rolling} from './lab-math.mjs';
const line=(name,points)=>({name,points,type:'line'}), dots=(name,points)=>({name,points,type:'scatter'}),bars=(name,points)=>({name,points,type:'bar'});
const chart=(title,xLabel,yLabel,series,extra={})=>({title,xLabel,yLabel,series,...extra});
const seq=a=>a.map((v,i)=>[i+1,v]);
const metrics=(...a)=>a;
const dataNote='ข้อมูลสมมติสำหรับทดลองสูตร ใช้ seed คงที่ จึงเปรียบเทียบผลเมื่อปรับค่าได้';
const result=(charts,metrics,note,table)=>({charts,metrics,note:note||dataNote,table});
const normalData=(rho=.6,n=120)=>{const x=normals(n,41),e=normals(n,97),y=x.map((v,i)=>rho*v+Math.sqrt(1-rho*rho)*e[i]);return{x,y}};
export function runLab(kind,p){
 switch(kind){
 case 'sample': {
  const x=normals(p.n,42).map(v=>v*p.sigma),bins=histogram(x,p.bins);
  return result([chart('Normal sample','Simulated value','Count',[bars('Sample',bins)])],metrics(['n',p.n],['Mean',num(mean(x))],['Sample SD',num(sd(x))]),'สุ่ม Normal ที่มีค่าเฉลี่ย 0; sigma เป็นค่าของประชากร Sample SD เปลี่ยนได้เมื่อขนาดตัวอย่างเปลี่ยน');
 }
 case 'return': {
  const r=p.after/p.before-1;
  return result([chart('Price and return','Time','Price (units)',[line('Price',[[0,p.before],[1,p.after]])],{xTicks:[[0,'Before'],[1,'After']],yDomain:[0,Math.max(p.before,p.after)*1.15]})],metrics(['Simple return',pct(r)],['Price change',num(p.after-p.before,2)],['Log return',pct(Math.log(p.after/p.before))]),'ราคาสมมติสองเวลา Simple return = after / before − 1; Log return = ln(after / before)');
 }
 case 'weighted': {
  const w=p.weight/100,A=[1,-2,3],B=[2,0,1],r=A.map((x,i)=>w*x+(1-w)*B[i]);
  return result([chart('Weighted returns','Period','Return (%)',[line('Asset A',seq(A)),line('Asset B',seq(B)),line('Portfolio',seq(r))])],metrics(['Weight A',pct(w,0)],['Portfolio mean',num(mean(r))+'%'],['Portfolio sample variance',num(variance(r))+' %²']), 'ข้อมูลเดียวกับ NumPy example: A = [1, −2, 3]% และ B = [2, 0, 1]% น้ำหนักรวม 100%',{columns:['Period','A (%)','B (%)','Portfolio (%)'],rows:r.map((v,i)=>[i+1,A[i],B[i],num(v)])});
 }
 case 'rolling': {
  const r=normals(30,19).map(v=>.01*v),prices=wealth(r),avg=rolling(prices,p.window);
  return result([chart('Rolling mean','Day','Price (units)',[line('Price',seq(prices)),line(p.window+'-day mean',avg.map((v,i)=>[i+1,v]).filter(x=>x[1]!==null))])],metrics(['Window',p.window+' days'],['First available mean','Day '+p.window],['Latest mean',num(avg.at(-1),2)]),'ราคาเริ่ม 100 ผลตอบแทนรายวันจำลอง Normal(0, 1%) ใช้ min_periods เท่ากับ window; ช่วงที่ข้อมูลยังไม่ครบแสดง NaN',{columns:['Day','Price','Rolling mean'],rows:prices.slice(0,10).map((v,i)=>[i+1,num(v,2),avg[i]===null?'NaN':num(avg[i],2)])});
 }
 case 'plotting': {
  const {x,y}=normalData(p.rho,100),a=x.map(v=>v/100),b=y.map(v=>v/100);
  return result([chart('Histogram','Asset A return (%)','Count',[bars('100 daily returns',histogram(x,p.bins))]),chart('Scatter plot','Asset A return (%)','Asset B return (%)',[dots('Same-day pairs',zip(x,y))]),chart('Indexed prices','Day','Index (start = 100)',[line('Asset A',seq(wealth(a))),line('Asset B',seq(wealth(b)))])],metrics(['Sample correlation',num(corr(x,y))],['Bins',p.bins],['Returns',100]),'ราคาและผลตอบแทนสมมติ 100 วัน ค่า rho ควบคุมความสัมพันธ์ของประชากร; จำนวน bins เปลี่ยน histogram แต่ไม่เปลี่ยนข้อมูล');
 }
 case 'means': {
  const a=p.a/100,b=p.b/100,path=wealth([a,b]),ar=(a+b)/2,geo=Math.sqrt((1+a)*(1+b))-1;
  return result([chart('Compounded wealth','Period','Wealth (units)',[line('Wealth',path.map((v,i)=>[i,v]))])],metrics(['Arithmetic mean',pct(ar)],['Geometric mean',pct(geo)],['Ending wealth',num(path.at(-1),2)]),'ทุนเริ่มต้น 100; ผลตอบแทนสองช่วงไม่มีเงินฝากถอนหรือค่าธรรมเนียม Geometric mean คือผลตอบแทนคงที่ที่ทบต้นได้มูลค่าปลายทางเท่ากัน');
 }
 case 'distribution': {
  const x=linspace(-4,4,161),mu=p.mu,sigma=p.sigma;
  return result([chart('Normal distribution','X (units)','Probability density',[line('Normal PDF',x.map(v=>[mu+sigma*v,normalPdf(v)/sigma]))])],metrics(['Mean',num(mu,1)],['Variance',num(sigma*sigma,2)],['P(μ − σ ≤ X ≤ μ + σ)','68.27%']),'กราฟเป็น density ตามสูตร Normal ไม่ใช่ histogram; ความน่าจะเป็นเท่ากับพื้นที่ใต้เส้น ไม่ใช่ความสูงของเส้น ณ จุดเดียว');
 }
 case 'variance': {
  const x=[-2,-1,0,1,2,p.outlier],m=mean(x),target=p.target;
  return result([chart('Distance from the mean','Observation','Squared deviation (%²)',[bars('(x − mean)²',x.map((v,i)=>[i+1,(v-m)**2]))])],metrics(['Sample mean',num(m)+'%'],['Sample variance',num(variance(x))+' %²'],['Downside semivariance',num(mean(x.map(v=>Math.min(v-target,0)**2)))+' %²']), 'ข้อมูลผลตอบแทนสมมติ 6 ค่า: −2, −1, 0, 1, 2 และค่าที่ปรับได้ หน่วย %; Sample variance หารด้วย n−1 ส่วน downside semivariance หารด้วย n');
 }
 case 'skewness': {
  const x=linspace(-5,5,251),k=p.shape;
  return result([chart('Left skew, symmetry, right skew','Standardized value z','Density',[line('Left skew',x.map(v=>[v,gammaStandardized(v,k,-1)])),line('Normal',x.map(v=>[v,normalPdf(v)])),line('Right skew',x.map(v=>[v,gammaStandardized(v,k,1)]))])],metrics(['Left skewness',num(-2/Math.sqrt(k))],['Normal skewness','0'],['Right skewness',num(2/Math.sqrt(k))]),'เส้นซ้ายและขวาเป็น Gamma ที่สะท้อนและปรับให้ mean = 0, variance = 1 เหมือน Normal; shape สูงขึ้นทำให้ skewness มีขนาดลดลง กราฟนี้ยกตัวอย่าง ไม่ใช่กฎว่า skewness = 0 ต้องสมมาตรเสมอ');
 }
 case 'kurtosis': {
  const x=linspace(-6,6,361),nu=p.nu,series=[line('Uniform (K = 1.8)',x.map(v=>[v,Math.abs(v)<Math.sqrt(3)?1/(2*Math.sqrt(3)):0])),line('Normal (K = 3)',x.map(v=>[v,normalPdf(v)])),line('Student t (K = '+num(3+6/(nu-4),2)+')',x.map(v=>[v,studentPdfStandardized(v,nu)]))];
  const tail=series.map(s=>({...s,points:s.points.filter(q=>q[0]>=2)}));
  return result([chart('Same mean and variance','Standardized value z','Density',series),chart('Right tail: z ≥ 2','Standardized value z','Density (zoom)',tail)],metrics(['Student t df',nu],['Pearson kurtosis',num(3+6/(nu-4))],['Excess kurtosis',num(6/(nu-4))]),'ทั้งสามแจกแจงมี mean = 0 และ variance = 1 Student t ใช้ df > 4 เพื่อให้ fourth moment มีค่าจำกัด กราฟหางใช้แกนตั้งคนละสเกลกับกราฟเต็ม; Kurtosis ไม่ได้วัดเฉพาะความแหลมของยอด');
 }
 case 'correlation': {
  const {x,y}=normalData(p.rho,p.n);
  return result([chart('Correlation sample','X','Y',[dots('Paired observations',zip(x,y))])],metrics(['Population ρ',num(p.rho,2)],['Sample Pearson r',num(corr(x,y))],['n',p.n]),'X และ noise เป็น Normal อิสระ; Y = ρX + √(1−ρ²)noise ค่า correlation ในตัวอย่างจึงไม่จำเป็นต้องเท่ากับ ρ');
 }
 case 'spearman': {
  const x=linspace(-2,2,100),e=normals(100,31),y=x.map((v,i)=>Math.exp(v)+p.noise*e[i]);if(p.outlier)y[95]+=20;
  return result([chart('Nonlinear relationship','X','Y',[dots('Y = exp(X) + noise',zip(x,y))])],metrics(['Pearson',num(corr(x,y))],['Spearman',num(spearman(x,y))]),'ข้อมูลสมมติแบบ monotonic แต่ไม่เป็นเส้นตรง เพิ่ม noise หรือ outlier แล้วเปรียบเทียบค่าที่ใช้ตัวเลขจริงกับค่าที่ใช้อันดับ');
 }
 case 'confidence': case 'estimation': {
  const n=p.n,z=normalQuantile((1+p.level/100)/2),means=Array.from({length:40},(_,i)=>mean(normals(n,100+i))),se=1/Math.sqrt(n),covered=means.filter(v=>Math.abs(v)<=z*se).length;
  const series=means.map((v,i)=>line('Sample '+(i+1),[[v-z*se,i+1],[v+z*se,i+1]]));
  return result([chart('40 confidence intervals','Population mean (units)','Repeated sample',series,{vLines:[{x:0,label:'True mean = 0'}],hideLegend:true})],metrics(['Known SE',num(se)],['Interval width',num(2*z*se)],['Intervals covering 0',covered+' / 40']), 'จำลอง 40 ชุดจาก Normal(0,1), รู้ population σ = 1 ใช้ z interval อัตราครอบคลุมระยะยาวเท่ากับ confidence level ภายใต้สมมติฐานนี้; 40 ชุดอาจไม่ให้สัดส่วนตรงพอดี');
 }
 case 'hypothesis': {
  const z=p.effect*Math.sqrt(p.n),alpha=p.alpha/100,critical=normalQuantile(1-alpha/2),pv=2*(1-normalCdf(Math.abs(z))),x=linspace(-5,5,251);
  return result([chart('Two-sided z test','z statistic','Density under H₀',[line('H₀: μ = 0',x.map(v=>[v,normalPdf(v)]))],{vLines:[{x:-critical,label:'−critical'},{x:critical,label:'+critical'},{x:Math.max(-5,Math.min(5,z)),label:'Observed z'}]})],metrics(['Observed z',num(z)],['Two-sided p-value',pv<.00001?'< 0.00001':num(pv,5)],['Decision',pv<alpha?'Reject H₀':'Do not reject H₀']),'ตัวอย่าง z test: รู้ population σ = 1, ข้อมูลอิสระและ Normal; effect คือ sample mean ห่างจาก 0 กี่หน่วย σ เส้น z ถูกจำกัดตำแหน่งแสดงที่ ±5; p-value ไม่ใช่ความน่าจะเป็นที่ H₀ เป็นจริง');
 }
 case 'regression': case 'residuals': case 'violations': case 'misspecification': {
  const x=linspace(-2,2,100),e=normals(100,11),y=x.map((v,i)=>.2+p.slope*v+(p.mode==='curve'?.8*v*v:0)+p.noise*e[i]*(p.mode==='hetero'?.2+Math.abs(v):1)),f=fitLine(x,y);
  const charts=[chart('OLS fit','X','Y',[dots('Data',zip(x,y)),line('OLS fitted line',zip(x,f.fitted))])];
  if(kind!=='regression')charts.push(chart('Residual plot','X','Residual',[dots('Residual',zip(x,f.residual))],{hLines:[{y:0,label:'0'}]}));
  return result(charts,metrics(['Intercept estimate',num(f.beta[0])],['Slope estimate',num(f.beta[1])],['R²',num(f.r2)],['Residual SD',num(sd(f.residual))]),'สมมติ Y = 0.2 + slope·X + noise; ตัวเลือก quadratic เพิ่ม 0.8X² ส่วน heteroscedastic noise มี SD เพิ่มตาม |X| เส้น OLS ยังคงเป็นเส้นตรง รูปร่าง residual ใช้ตรวจแบบจำลอง ไม่ใช่ผลทดสอบนัยสำคัญ');
 }
 case 'multiple': {
  const x1=normals(200,23),e=normals(200,24),x2=x1.map((v,i)=>p.rho*v+Math.sqrt(1-p.rho*p.rho)*e[i]),noise=normals(200,25),y=x1.map((v,i)=>.2+1.2*v-.5*x2[i]+p.noise*noise[i]),f=ols(x1.map((v,i)=>[1,v,x2[i]]),y);
  return result([chart('Observed and fitted Y','Fitted Y','Observed Y',[dots('200 observations',zip(f.fitted,y))])],metrics(['β₁ estimate (true 1.2)',num(f.beta[1])],['β₂ estimate (true −0.5)',num(f.beta[2])],['X₁/X₂ correlation',num(corr(x1,x2))],['R²',num(f.r2)]),'Y = 0.2 + 1.2X₁ − 0.5X₂ + noise ปรับ correlation ของ predictors เพื่อดูผลต่อค่าประมาณ; ข้อมูลสมมติชุดนี้ไม่แสดงเหตุและผล');
 }
 case 'likelihood': {
  const x=normals(p.n,19).map(v=>2+.5*v),m=mean(x),ll=mu=>-.5*sum(x.map(v=>((v-mu)/.5)**2)),max=ll(m),curve=linspace(1.4,2.6,161).map(mu=>[mu,ll(mu)-max]);
  return result([chart('Normal log-likelihood','Candidate μ','Log-likelihood minus maximum',[line('Known σ = 0.5',curve)],{vLines:[{x:p.mu,label:'Candidate'}]})],metrics(['MLE μ̂',num(m)],['Candidate μ',num(p.mu,2)],['Relative log-likelihood',num(ll(p.mu)-max)]),'ข้อมูลสมมติ Normal(2, 0.5²) การเลื่อนเส้น candidate แสดง log-likelihood เทียบกับจุดสูงสุด; ค่า μ ที่ทำให้สูงสุดตรงกับ sample mean เมื่อ σ คงที่');
 }
 case 'ar': {
  const e=normals(400,7),x=[0];for(let i=1;i<400;i++)x.push(p.phi*x.at(-1)+e[i]);const a=x.slice(160);
  return result([chart('AR(1) after burn-in','Period','X',[line('Xₜ',seq(a))])],metrics(['φ',num(p.phi,2)],['Theoretical variance',num(1/(1-p.phi*p.phi))],['Sample lag-1 correlation',num(corr(a.slice(0,-1),a.slice(1)))]),'Xₜ = φXₜ₋₁ + εₜ, ε ~ Normal(0,1); ตัด 160 ช่วงแรกและจำกัด |φ| < 1 ค่า variance และ correlation จาก 240 ช่วงอาจต่างจากค่าประชากร');
 }
 case 'cointegration': case 'pairs': case 'futures-reversion': {
  const e=normals(180,7),u=normals(180,8),x=[],y=[],sp=[];let a=100,b=0,c=0;
  for(let i=0;i<180;i++){a+=e[i];b=.7*b+u[i];c+=u[i];x.push(a);y.push(1.2*a+(p.mode==='independent'?c:b));sp.push(y[i]-p.hedge*a)}
  return result([chart('Two price series','Period','Price (units)',[line('X',seq(x)),line('Y',seq(y))]),chart('Spread Y − hedge × X','Period','Spread (units)',[line('Spread',seq(sp))])],metrics(['Hedge coefficient',num(p.hedge,2)],['Spread SD',num(sd(sp))],['Last spread z-score (180 points)',num((sp.at(-1)-mean(sp))/sd(sp))]),'สมมติ X เป็น random walk; Y = 1.2X + stationary AR(1) spread หรือ + random walk ตามตัวเลือก z-score ใช้ mean/SD ของทั้ง 180 จุดถึงจุดท้าย ไม่ใช่ rolling window การตั้ง hedge = 1.2 ไม่ทำให้ spread แบบ random walk stationary กราฟไม่ทดแทน statistical test และยังไม่รวมต้นทุน');
 }
 case 'garch': {
  const alpha=p.alpha,beta=p.beta;if(alpha+beta>=1)return result([],metrics(['α + β',num(alpha+beta,2)]),'เลือก α + β < 1 เพื่อให้แบบจำลองนี้มี unconditional variance จำกัด');
  const omega=1-alpha-beta,e=normals(240,32),r=[],v=[];let h=1,prev=0;for(let i=0;i<240;i++){h=omega+alpha*prev*prev+beta*h;prev=Math.sqrt(h)*e[i];v.push(Math.sqrt(h));r.push(prev)}
  return result([chart('Conditional volatility','Period','Return / volatility (%)',[line('Return',seq(r)),line('Conditional SD',seq(v))])],metrics(['α + β',num(alpha+beta,2)],['ω',num(omega)+' %²'],['Unconditional SD','1.000%']),'GARCH(1,1): hₜ = ω + αr²ₜ₋₁ + βhₜ₋₁ กำหนด ω = 1−α−β ในหน่วย %² เพื่อให้ unconditional variance = 1 %² ใช้ Normal innovations ไม่ใช่ค่าที่ fit จากตลาด');
 }
 case 'kalman': {
  const e=normals(140,11),v=normals(140,21),truth=[],obs=[],filtered=[];let state=0,m=0,P=1,K=0;for(let i=0;i<140;i++){state+=.1*e[i];const z=state+p.noise*v[i];P+=p.q;K=P/(P+p.noise*p.noise);m+=K*(z-m);P=(1-K)*P;truth.push(state);obs.push(z);filtered.push(m)}
  return result([chart('Local-level Kalman filter','Period','State (units)',[line('Latent state',seq(truth)),dots('Observation',seq(obs)),line('Filtered estimate',seq(filtered))])],metrics(['Latest Kalman gain',num(K)],['RMSE against latent state',num(Math.sqrt(mean(filtered.map((x,i)=>(x-truth[i])**2))))]),'Latent state จำลองเป็น random walk ที่ Q จริง = 0.01; ปรับ Q ที่ filter สมมติและ measurement SD โดย R = SD² ค่าเริ่ม m = 0, P = 1; การเห็น latent state ทำได้เพราะเป็นข้อมูลจำลอง');
 }
 case 'pca': {
  const {x,y}=normalData(p.rho,150),vx=variance(x),vy=variance(y),c=corr(x,y)*Math.sqrt(vx*vy),disc=Math.sqrt((vx-vy)**2+4*c*c),l1=(vx+vy+disc)/2,l2=(vx+vy-disc)/2,theta=.5*Math.atan2(2*c,vx-vy),dir=[Math.cos(theta),Math.sin(theta)];
  return result([chart('Principal component direction','Centered asset A','Centered asset B',[dots('Returns',zip(x.map(v=>v-mean(x)),y.map(v=>v-mean(y)))),line('PC1 direction',[[-3*dir[0],-3*dir[1]],[3*dir[0],3*dir[1]]])],{xDomain:[-4,4],yDomain:[-4,4],equalAspect:true})],metrics(['PC1 explained variance',pct(l1/(l1+l2))],['PC2 explained variance',pct(l2/(l1+l2))],['Sample correlation',num(corr(x,y))]),'PCA จาก covariance matrix ของผลตอบแทนสมมติ 150 ช่วง หลังหักค่าเฉลี่ยรายสินทรัพย์ เครื่องหมายของ eigenvector กลับด้านได้โดยไม่เปลี่ยนองค์ประกอบ');
 }
 case 'universe': {
  const seed=random(88),rows=Array.from({length:10},(_,i)=>{const volume=Array.from({length:21},()=>Math.round(100+900*seed()));const count=volume.filter(v=>v>=p.threshold).length;return[String.fromCharCode(65+i),volume.at(-1),count,count>=p.days?'Included':'Excluded']});
  return result([chart('Eligibility history','Asset','Days passing threshold',[bars('Days (last 21)',rows.map((r,i)=>[i+1,r[2]]))],{xTicks:rows.map((r,i)=>[i+1,r[0]]),yDomain:[0,21],hLines:[{y:p.days,label:'Required days'}]})],metrics(['Included assets',rows.filter(r=>r[3]==='Included').length+' / 10'],['Lookback','21 days']), 'Volume สมมติหน่วยพันหุ้นต่อวัน เลือกสินทรัพย์ที่ผ่าน minimum volume อย่างน้อยตามจำนวนวันที่กำหนด ใช้ข้อมูลย้อนหลัง 21 วันเท่านั้น ไม่จำลอง delisting หรือ corporate actions',{columns:['Asset','Last volume (k)','Eligible days','Membership'],rows});
 }
 case 'factor': {
  const score=linspace(-2,2,50),e=normals(50,61),ret=score.map((v,i)=>p.strength*v+p.noise*e[i]),buckets=Array.from({length:5},(_,i)=>mean(ret.slice(10*i,10*i+10)));
  return result([chart('Forward return by factor quintile','Factor quintile','Mean forward return (%)',[bars('10 assets / quintile',buckets.map((v,i)=>[i+1,v]))]),chart('Factor and forward return','Factor score','Forward return (%)',[dots('50 hypothetical assets',zip(score,ret))])],metrics(['Rank IC',num(spearman(score,ret))],['Top − bottom return',num(buckets[4]-buckets[0])+'%'],['n',50]),'Forward return = strength × factor score + noise หน่วย %; IC ใช้ Spearman ข้ามสินทรัพย์ในรอบเดียว ผลนี้ไม่ใช่ backtest และไม่รวม turnover หรือต้นทุน');
 }
 case 'fundamental': case 'apt': {
  const b1=p.b1,b2=p.b2,p1=p.p1,p2=p.p2,rf=2,total=rf+b1*p1+b2*p2;
  return result([chart('Factor return contributions','Component','Expected return (% / year)',[bars('Contribution',[[1,rf],[2,b1*p1],[3,b2*p2]])],{xTicks:[[1,'Risk-free'],[2,'Factor 1'],[3,'Factor 2']]})],metrics(['Expected return',num(total,2)+'% / year'],['Factor 1 contribution',num(b1*p1,2)+' pp'],['Factor 2 contribution',num(b2*p2,2)+' pp']),'ตัวอย่าง E[R] = Rf + β₁λ₁ + β₂λ₂ กำหนด Rf = 2% ต่อปี Risk premium ทั้งสองหน่วย % ต่อปี เป็นค่าที่สมมติ ไม่ใช่ค่าพยากรณ์ผลตอบแทน');
 }
 case 'longshort': case 'value': {
  const scores=[.9,.7,.3,.1],names=['A','B','C','D'],short=p.short/100,long=kind==='value'?1+short:p.long/100,w=[long/2,long/2,-short/2,-short/2],r=[p.premium+1,p.premium-1,-p.premium+.5,-p.premium-.5];
  return result([chart('Portfolio weights','Asset','Weight (% of equity)',[bars('Weight',w.map((v,i)=>[i+1,v*100]))],{xTicks:names.map((v,i)=>[i+1,v])})],metrics(['Net exposure',pct(sum(w),0)],['Gross exposure',pct(sum(w.map(Math.abs)),0)],['One-period return',num(sum(w.map((v,i)=>v*r[i])))+'%']), 'คะแนนและผลตอบแทนสมมติ 4 หุ้น Long หุ้นคะแนนสูง Short หุ้นคะแนนต่ำ ผลตอบแทนพอร์ต = Σ weight × return ยังไม่หัก borrow fee หรือต้นทุนซื้อขาย',{columns:['Asset','Score','Weight','Return','Contribution'],rows:names.map((n,i)=>[n,scores[i],pct(w[i]),num(r[i],2)+'%',num(w[i]*r[i],2)+' pp'])});
 }
 case 'futures': {
  const start=2000,mult=50,q=p.contracts,change=p.change,pnl=q*mult*change,notional=q*mult*start;
  return result([chart('Futures P&L','Price change (points)','P&L (currency units)',[line('Long position',linspace(-100,100,101).map(d=>[d,q*mult*d]))],{vLines:[{x:change,label:'Selected change'}]})],metrics(['Notional',num(notional,0)],['P&L',num(pnl,0)],['P&L / margin',pct(pnl/p.margin)]),'สัญญาสมมติ F₀ = 2,000, multiplier = 50 หน่วยเงินต่อจุด P&L = contracts × multiplier × ΔF; margin เป็นฐานเงินที่ใส่ ไม่ใช่ขีดจำกัดการขาดทุน');
 }
 case 'capm': {
  const rf=2,premium=p.premium,r=rf+p.beta*premium;
  return result([chart('Security market line','Beta','Expected return (% / year)',[line('CAPM',linspace(-.5,2.5).map(b=>[b,rf+b*premium]))],{vLines:[{x:p.beta,label:'Selected beta'}]})],metrics(['Beta (unitless)',num(p.beta,2)],['Expected return',num(r,2)+'% / year']), 'สมมติ Rf = 2% ต่อปี และ market risk premium ตามที่เลือก E[R] = Rf + β × premium; CAPM expected return ไม่ใช่ผลตอบแทนที่รับรองว่าจะเกิด');
 }
 case 'covariance': {
  const {x,y}=normalData(.65,p.n),vx=variance(x),vy=variance(y),c=corr(x,y)*Math.sqrt(vx*vy),lambda=p.shrink,estimated=w=>Math.sqrt(w*w*vx+(1-w)**2*vy+2*w*(1-w)*c*(1-lambda)),truth=w=>Math.sqrt(w*w+(1-w)**2+2*w*(1-w)*.65);
  return result([chart('Portfolio volatility','Weight A (%)','Volatility (% / period)',[line('Sample / shrunk covariance',linspace(0,1).map(w=>[w*100,estimated(w)])),line('Known simulation covariance',linspace(0,1).map(w=>[w*100,truth(w)]))])],metrics(['Observations',p.n],['Shrinkage λ',num(lambda,2)],['Estimated correlation',num(c*(1-lambda)/Math.sqrt(vx*vy))]),'ผลตอบแทนสมมติ SD = 1% ต่อช่วง, correlation จริง 0.65 Shrink toward diagonal: (1−λ)Σsample + λdiag(Σsample) ไม่ใช่การเลือก λ แบบ optimal');
 }
 case 'exposure': case 'risk-management': case 'hedge': {
  const weight=p.weight/100,hedge=p.hedge,marketBeta=weight*1.4+(1-weight)*.7,netBeta=marketBeta-hedge,marketSD=2,specificVariance=weight*weight*.8**2+(1-weight)**2*.6**2,totalVar=netBeta*netBeta*marketSD*marketSD+specificVariance,unhedged=marketBeta*marketBeta*marketSD*marketSD+specificVariance;
  return result([chart('Market component','Market return (%)','Portfolio market P&L (%)',[line('Before hedge',linspace(-5,5).map(r=>[r,marketBeta*r])),line('After hedge',linspace(-5,5).map(r=>[r,netBeta*r]))])],metrics(['Portfolio beta before',num(marketBeta)],['Beta after hedge',num(netBeta)],['SD before / after',num(Math.sqrt(unhedged))+'% / '+num(Math.sqrt(totalVar))+'%'],['Common-risk share',pct(netBeta*netBeta*marketSD*marketSD/totalVar)]),'หุ้น A/B มี beta 1.4/0.7 และ residual SD 0.8%/0.6% ต่อช่วง; residual อิสระกันและจากตลาด ตลาด SD = 2% Hedge ด้วยการ Short ตลาดตามน้ำหนักที่เลือก ไม่มี financing cost และ basis risk');
 }
 case 'portfolio': {
  const {x,y}=normalData(.3,252),w=p.weight/100,r=x.map((v,i)=>(w*(.04+v)+(1-w)*(.02+.6*y[i]))/100-p.cost/10000/252),path=wealth(r),vol=sd(r)*Math.sqrt(252),annualMean=mean(r)*252;
  return result([chart('Portfolio equity','Trading day','Wealth (start = 100)',[line('Portfolio',path.map((v,i)=>[i,v]))])],metrics(['Total return',pct(path.at(-1)/100-1)],['Annualized SD',pct(vol)],['Sharpe (Rf = 0)',num(annualMean/vol)],['Max drawdown (252 days)',pct(maxDrawdown(path))]),'ข้อมูลสมมติ 252 วัน น้ำหนักคงที่และ rebalance รายวัน ค่า cost หักเฉลี่ยตามวัน หน่วย bp/ปี; annualized SD/Sharpe ใช้สมมติฐานการรวม variance แบบอิสระ Max drawdown ไม่ annualize');
 }
 case 'etf': {
  const n=p.n,a=normals(n,101).map(v=>v+p.diff),b=normals(n,102),delta=mean(a)-mean(b),se=Math.sqrt(2/n),z=normalQuantile(.975);
  return result([chart('Difference in mean return','Mean difference (% / period)','',[line('95% interval (known variance)',[[delta-z*se,0],[delta+z*se,0]]),dots('Sample difference',[[delta,0]])],{vLines:[{x:0,label:'No difference'}],yDomain:[-1,1]})],metrics(['Sample difference',num(delta)+'%'],['95% interval',num(delta-z*se)+' to '+num(delta+z*se)+'%'],['n per fund',n]),'ตัวอย่างสองกองทุนสมมติที่เป็นอิสระและ Normal รู้ SD ของแต่ละกอง = 1% ต่อช่วง ช่วงความเชื่อมั่นนี้ใช้ known-variance z interval ไม่ใช่การยืนยันว่า ETF จริงเป็นอิสระหรือมี variance เท่ากัน');
 }
 case 'leverage': {
  const L=p.leverage,r=p.ret/100,borrow=p.borrow/100,equityReturn=L*r-(L-1)*borrow,final=100*(1+equityReturn);
  return result([chart('Leverage and equity return','Asset return (%)','Equity return (%)',[line('No leverage',linspace(-40,40).map(x=>[x,x])),line('With financing cost',linspace(-40,40).map(x=>[x,L*x-(L-1)*p.borrow]))],{vLines:[{x:p.ret,label:'Selected return'}]})],metrics(['Equity return',pct(equityReturn)],['Ending equity (start 100)',num(final,2)],['Borrowed amount',num(100*(L-1),0)]),'ช่วงเดียว: ลงทุน L เท่าของ equity เริ่มต้น กู้ L−1 เท่าในอัตราที่ระบุ ไม่มี margin call หรือ forced liquidation ในแบบจำลอง หาก equity ≤ 0 แปลว่าสินทรัพย์ไม่พอชำระหนี้');
 }
 case 'concentration': {
  const n=p.n,rho=p.rho,sigma=2,risk=k=>sigma*Math.sqrt(rho+(1-rho)/k),effective=n/(1+(n-1)*rho);
  return result([chart('Equal-weight diversification','Number of assets','Portfolio SD (% / period)',[line('Equal weights',Array.from({length:50},(_,i)=>[i+1,risk(i+1)]))],{vLines:[{x:n,label:'Selected n'}]})],metrics(['Portfolio SD',num(risk(n))+'%'],['Asset SD','2%'],['Equivalent independent assets',num(effective,2)]),'สินทรัพย์สมมติทุกตัวมี SD 2% ต่อช่วงและ correlation คู่เท่ากัน ρ น้ำหนักเท่ากัน: σp² = σ²[ρ + (1−ρ)/n] จำนวนสินทรัพย์เท่ากันจึงให้การกระจายความเสี่ยงต่างกันได้');
 }
 case 'tailrisk': {
  const e=normals(500,46),r=e.map((v,i)=>.0003+.01*v-(i%50===0?p.shock/100:0)),loss=r.map(v=>-100000*v),alpha=p.alpha/100,v=quantile(loss,alpha),es=expectedShortfall(loss,alpha);
  return result([chart('Portfolio loss distribution','Loss (currency units)','Count',[bars('500 hypothetical periods',histogram(loss,35))],{vLines:[{x:v,label:'VaR'},{x:es,label:'ES'}]})],metrics(['Historical VaR',num(v,0)],['Empirical ES',num(es,0)],['Expected tail mass',num(500*(1-alpha),1)+' observations']),'มูลค่าพอร์ต 100,000 ผลตอบแทน Normal จำลองและเพิ่มขาดทุนทุก 50 ช่วงตาม shock; Loss = −value × return VaR ใช้ quantile แบบ linear interpolation; ES เฉลี่ย probability mass ส่วนหางรวม fractional cutoff mass');
 }
 case 'regime': {
  const x=normals(120,12),e=normals(120,13),y=x.map((v,i)=>.2+(i<60?1:p.beta)*v+.3*e[i]),f1=fitLine(x.slice(0,60),y.slice(0,60)),f2=fitLine(x.slice(60),y.slice(60)),mse=mean(y.slice(60).map((v,i)=>(v-f1.beta[0]-f1.beta[1]*x[i+60])**2));
  return result([chart('Regression before and after a break','X','Y',[dots('First 60',zip(x.slice(0,60),y.slice(0,60))),dots('Next 60',zip(x.slice(60),y.slice(60))),line('First fit',linspace(-3,3).map(v=>[v,f1.beta[0]+f1.beta[1]*v])),line('Second fit',linspace(-3,3).map(v=>[v,f2.beta[0]+f2.beta[1]*v]))])],metrics(['First slope',num(f1.beta[1])],['Second slope',num(f2.beta[1])],['Old model MSE on next 60',num(mse)]),'ข้อมูลสมมติ 120 ช่วง beta จริงของ 60 ช่วงแรก = 1 และเปลี่ยนเป็นค่าที่ปรับในอีก 60 ช่วง ประเมิน out-of-sample error โดยใช้ model จากครึ่งแรก');
 }
 case 'overfit': {
  const x=linspace(-1,1,10),e=normals(10,9),y=x.map((v,i)=>v*v+.1*e[i]),test=linspace(-1,1,200),te=normals(200,10),yt=test.map((v,i)=>v*v+.1*te[i]),X=x.map(v=>Array.from({length:p.degree+1},(_,j)=>v**j)),fit=ols(X,y),predict=v=>sum(fit.beta.map((b,j)=>b*v**j)),testMSE=mean(yt.map((v,i)=>(v-predict(test[i]))**2));
  return result([chart('Polynomial fit','X','Y',[dots('10 training points',zip(x,y)),line('Fitted polynomial',test.map(v=>[v,predict(v)])),line('True relation: x²',test.map(v=>[v,v*v]))])],metrics(['Degree',p.degree],['Train MSE',num(mean(fit.residual.map(v=>v*v)),6)],['Test MSE (200 points)',num(testMSE,6)]),'Y = X² + Normal noise SD 0.1 ใช้ training 10 จุดและ test 200 จุดที่สร้างแยกกัน domain เดียวกัน กราฟเป็นการจำลอง ไม่ใช่ผล backtest; การลอง degree หลังดู test ซ้ำทำให้ test กลายเป็น validation');
 }
 case 'multiple-tests': {
  const alpha=p.alpha/100,m=p.trials,prob=1-(1-alpha)**m,bonf=1-(1-alpha/m)**m;
  return result([chart('At least one false positive','Number of independent tests','Probability (%)',[line('Uncorrected',linspace(1,200,200).map(n=>[n,100*(1-(1-alpha)**n)])),line('Bonferroni',linspace(1,200,200).map(n=>[n,100*(1-(1-alpha/n)**n)]))],{vLines:[{x:m,label:'Selected tests'}],yDomain:[0,100]})],metrics(['Uncorrected family error',pct(prob)],['Bonferroni threshold per test',num(alpha/m,6)],['Expected false positives',num(m*alpha,2)]),'เส้น probability ใช้สมมติฐานว่า H₀ จริงทุก test และ tests เป็นอิสระ สูตร 1−(1−α)^m ใช้ไม่ได้ทั่วไปเมื่อ tests พึ่งพากัน ส่วน Bonferroni bound ควบคุม family-wise error ได้โดยไม่ต้องอิสระ');
 }
 case 'execution': {
  const mid=100,capacity=100,levels=Array.from({length:20},(_,i)=>({price:100.02+i*.02,qty:capacity}));let left=p.size,cost=0;const rows=levels.map(l=>{const fill=Math.min(left,l.qty);left-=fill;cost+=fill*l.price;return[l.price,l.qty,fill]});const avg=cost/p.size,bps=(avg-mid)/mid*10000;
  return result([chart('Ask-side depth','Cumulative quantity (shares)','Ask price (currency)',[line('Limit-order ladder',levels.map((l,i)=>[(i+1)*capacity,l.price]))],{vLines:[{x:p.size,label:'Buy size'}]})],metrics(['Buy quantity',p.size],['Average fill price',num(avg,4)],['Cost vs mid',num(bps,2)+' bp']), 'Order book สมมติ midpoint = 100, best ask = 100.02 แต่ละระดับมี 100 หุ้น ราคาเพิ่มระดับละ 0.02 เติมคำสั่ง Market Buy ตามลำดับราคา ไม่มี replenishment หรือการตอบสนองจากผู้ซื้อขายอื่น',{columns:['Ask price','Available shares','Filled shares'],rows:rows.filter(r=>r[2]>0).map(r=>[num(r[0],2),r[1],r[2]])});
 }
 case 'impact': {
  const size=p.size/100,time=p.time/100,participation=size/time,cost=.1*participation**2*10000;
  return result([chart('Volume Share Slippage','Order / interval volume (%)','Model cost (bp)',[line('C = 0.1 × participation²',linspace(0,.5).map(q=>[q*100,.1*q*q*10000]))],{vLines:[{x:participation*100,label:'Selected participation'}]})],metrics(['X / ADV',num(p.size,1)+'%'],['Execution time',num(p.time,0)+'% of day'],['X / (ADV × T)',pct(participation)],['Model cost',num(cost,2)+' bp']), 'สาธิตสูตร Volume Share Slippage C = 0.1|X/(VT)|² โดย C เป็นสัดส่วนราคา สมมติ volume สม่ำเสมอตลอดวัน; coefficient 0.1 ใช้เพื่ออธิบายรูปแบบเดิม ไม่ใช่ calibration ของตลาดปัจจุบัน กราฟแสดง participation ถึง 50%');
 }
 default: throw new Error('Unknown lab kind: '+kind);
 }
}
