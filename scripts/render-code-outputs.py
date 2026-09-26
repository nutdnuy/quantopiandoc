"""Execute the lesson examples locally and preserve exact outputs with input/code hashes.
No network or historical market data is used. Run after editing lesson Python blocks.
"""
import ast, contextlib, hashlib, io, json, platform, re, sys
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import scipy
import statsmodels
ROOT=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]
OUT=Path(sys.argv[2]) if len(sys.argv)>2 else ROOT
ASSETS=OUT/'public/assets/code-outputs'
ASSETS.mkdir(parents=True,exist_ok=True)
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'axes.prop_cycle':matplotlib.cycler(color=['#6200EE','#007D71','#A84B00']),'figure.dpi':130,'savefig.facecolor':'white','axes.facecolor':'white','figure.facecolor':'white'})
fixtures={
 'plotting-data':'''import numpy as np
import pandas as pd
rng = np.random.default_rng(42)
noise = rng.normal(size=(100, 2))
r = np.column_stack([0.01 * noise[:, 0],
                     0.01 * (0.6 * noise[:, 0] + 0.8 * noise[:, 1])])
prices = pd.DataFrame(np.vstack([np.ones(2), np.cumprod(1 + r, axis=0)]) * 100,
                      index=pd.date_range("2020-01-01", periods=101),
                      columns=["Asset A", "Asset B"])''',
 'variance':'''import numpy as np
returns = np.array([-0.02, -0.01, 0.00, 0.01, 0.02, 0.08])''',
 'statistical-moments':'''import numpy as np
returns = np.array([-0.08, -0.02, -0.01, 0.00, 0.01, 0.01, 0.02, 0.02, 0.03, 0.04])''',
 'residuals-analysis':'''import numpy as np
rng = np.random.default_rng(14)
features = np.linspace(-2, 2, 200)
target = 0.2 + 1.5 * features + (0.2 + np.abs(features)) * rng.normal(size=200)''',
 'violations-of-regression-models':'''import numpy as np
rng = np.random.default_rng(14)
features = np.linspace(-2, 2, 200)
target = 0.2 + 1.5 * features + (0.2 + np.abs(features)) * rng.normal(size=200)''',
 'pca':'''import numpy as np
rng = np.random.default_rng(42)
z = rng.normal(size=(200, 3))
returns = np.column_stack([z[:, 0], 0.7*z[:, 0] + 0.7*z[:, 1],
                           0.4*z[:, 0] + 0.8*z[:, 2]]) * 0.01''',
 'universe-selection':'''import numpy as np
import pandas as pd
rng = np.random.default_rng(22)
eligible = pd.DataFrame(rng.random((30, 3)) > 0.25,
                        index=pd.date_range("2020-01-01", periods=30),
                        columns=["A", "B", "C"])''',
 'ranking-universes-by-factors':'''import pandas as pd
factor_today = pd.Series([1, 2, 3, 4, 5, 6, 7, 8], index=list("ABCDEFGH"))
forward_return = pd.Series([-0.02, 0.01, -0.01, 0.03, 0.02, 0.01, 0.04, 0.05],
                           index=list("ABCDEFGH"))''',
 'why-hedge-ii':'''import numpy as np
B = np.array([[1.2, 0.3], [0.8, -0.2]])
F = np.diag([0.02**2, 0.01**2])
specific_variance = np.array([0.01**2, 0.012**2])
w = np.array([0.6, 0.4])''',
 'position-concentration-risk':'''import numpy as np
import pandas as pd
rng = np.random.default_rng(16)
z = rng.normal(size=(200, 3))
returns = pd.DataFrame(np.column_stack([z[:, 0],
                       0.7*z[:, 0] + 0.7*z[:, 1],
                       0.4*z[:, 0] + 0.8*z[:, 2]]) * 0.01,
                       columns=["A", "B", "C"])''',
 'var-and-cvar':'''import numpy as np
rng = np.random.default_rng(46)
portfolio_returns = rng.normal(0.0003, 0.01, 500)
portfolio_returns[::50] -= 0.04''',
 'regression-model-instability':'''import numpy as np
import pandas as pd
rng = np.random.default_rng(12)
x = pd.Series(rng.normal(size=200))
beta = np.r_[np.ones(100), np.full(100, 2.0)]
y = pd.Series(0.2 + beta * x.to_numpy() + rng.normal(0, 0.3, 200))'''
}
probes={
'introduction-to-research':['print("Observations:", len(observations))\nprint("Mean / sample SD:", observations.mean(), observations.std(ddof=1))',''],
'introduction-to-python':['','','','print(simple_return(100, 103))'],
'introduction-to-numpy':['','print("Portfolio returns:", portfolio_returns)\nprint("Portfolio mean:", portfolio_mean)',''],
'introduction-to-pandas':['','print(pd.DataFrame({"return": simple_returns, "change": price_changes, "rolling_mean": rolling_mean, "rolling_std": rolling_std}))'],
'plotting-data':[''],
'random-variables':['print("Normal sample mean / SD:", mu, sigma)\nprint("Jarque-Bera statistic / p-value:", normality.statistic, normality.pvalue)\nprint("Dice mean / Binomial mean:", dice.mean(), wins.mean())'],
'variance':['print("Range / mean absolute deviation:", spread, mean_abs_dev)\nprint("Sample variance / SD:", sample_variance, sample_std)\nprint("Downside all / conditional:", downside_all, downside_cond)'],
'statistical-moments':['print("Skewness:", skewness)\nprint("Excess kurtosis:", excess)\nprint("Pearson kurtosis:", pearson_kurtosis)'],
'spearman-rank-correlation':['print("Pearson:", pearson.statistic)\nprint("Spearman / rank correlation:", spearman.statistic, manual)'],
'residuals-analysis':['print("Coefficients:", fit.params)\nprint("Breusch-Pagan LM / p-value:", lm_stat, lm_pvalue)','print(result)'],
'violations-of-regression-models':['print("OLS coefficients:", ordinary.params)\nprint("OLS standard errors:", ordinary.bse)\nprint("HC1 standard errors:", robust.bse)','print("HAC standard errors:", hac.bse)'],
'integration-cointegration-and-stationarity':['print("Random-walk length / differenced length:", len(x), len(recovered))\nprint("First differences:", recovered[:5])\nprint("Equal to innovations[1:]:", np.allclose(recovered, innovation[1:]))'],
'pca':['print("Eigenvalues:", values)\nprint("Explained variance:", explained)\nprint("Total share:", explained.sum())'],
'universe-selection':['print("Eligible days (last 5 rows):")\nprint(history_count.tail())\nprint("Smoothed membership (last 5 rows):")\nprint(smoothed.tail())'],
'ranking-universes-by-factors':['print(paired)\nprint("Rank IC / p-value:", ic, p_value)'],
'long-short-equity':['print("Weights:", weights)\nprint("Net / gross exposure:", sum(weights.values()), sum(abs(w) for w in weights.values()))'],
'why-hedge-ii':['print("Factor exposures:", exposure)\nprint("Common / specific / total variance:", common_variance, specific_risk_variance, total_variance)\nprint("Common share:", common_share)'],
'position-concentration-risk':['print("Equal weights:", weights)\nprint("Portfolio variance / SD:", portfolio_variance, portfolio_volatility)\nprint("Direct variance:", portfolio_returns.var(ddof=1))'],
'var-and-cvar':['print("Historical VaR / ES:", historical_var, historical_es)\nprint("Normal VaR:", normal_var)'],
'regression-model-instability':['print("First coefficients:", first.params.to_numpy())\nprint("Second coefficients:", second.params.to_numpy())\nprint("Out-of-sample MSE:", np.mean((y.iloc[cut:] - prediction)**2))'],
'p-hacking-and-multiple-comparisons-bias':['print("Tests:", len(p_values))\nprint("Uncorrected / Bonferroni discoveries:", uncorrected, corrected)']}
notes={
'plotting-data':'ข้อมูลราคา Asset A/B จำลอง 101 วัน (100 returns): Histogram นับความถี่ของ return A, Scatter จับคู่ returns ในวันเดียวกัน และ Price index เริ่มที่ 100 ทั้งสองสินทรัพย์',
'introduction-to-research':'Normal sample 500 ค่า จาก seed 42; เป็นข้อมูลจำลอง ไม่มีหน่วยตลาด',
'statistical-moments':'ใช้ผลตอบแทนสมมติ 10 ค่าที่แสดงในข้อมูลตัวอย่าง; Pearson kurtosis เท่ากับ excess kurtosis + 3',
'means':'ผลตอบแทน +20% และ −20% ทำให้ทุน 100 เหลือ 96 แม้ arithmetic mean เท่ากับ 0',
'var-and-cvar':'ผลขาดทุนคำนวณจากทุน 100,000 และผลตอบแทนจำลอง 500 ช่วง; ES ในโค้ดนี้ใช้ค่าเฉลี่ย observations ที่เกิน VaR cutoff',
'violations-of-regression-models':'OLS, HC1 และ HAC ใช้ coefficients เดียวกัน แต่ประมาณ standard errors ต่างกัน',
'position-concentration-risk':'Variance จาก covariance matrix ตรงกับ variance ของผลตอบแทนพอร์ตที่คำนวณโดยตรง'}
np.set_printoptions(precision=6,suppress=True)
pd.set_option('display.width',100)
pd.set_option('display.max_columns',8)
manifest={'runtime':{'python':platform.python_version(),'numpy':np.__version__,'pandas':pd.__version__,'scipy':scipy.__version__,'statsmodels':statsmodels.__version__,'matplotlib':matplotlib.__version__},'lessons':{}}
for path in sorted((ROOT/'content').glob('*.json')):
 lesson=json.loads(path.read_text());id=lesson['id'];codes=re.findall(r'```python\n([\s\S]*?)```',lesson['body'])
 if not codes:continue
 env={'__name__':'__lesson_example__'};setup=fixtures.get(id,'');exec(setup,env)
 entry={'setup':setup,'dataStatus':'ข้อมูลสมมติ ใช้เพื่อสาธิตการคำนวณ','outputs':[]}
 for i,code in enumerate(codes):
  buffer=io.StringIO();probe=(probes.get(id,[])+['']*len(codes))[i]
  before=set(plt.get_fignums())
  with contextlib.redirect_stdout(buffer):
   exec(compile(code,f'{id}-block-{i+1}','exec'),env)
   if probe:exec(probe,env)
  images=[]
  for n in set(plt.get_fignums())-before:
   fig=plt.figure(n)
   filename=f'{id}-{i+1}-{n}.png'
   fig.savefig(ASSETS/filename,dpi=160,bbox_inches='tight')
   images.append({'src':'assets/code-outputs/'+filename,'alt':notes.get(id,'ผลกราฟจากโค้ดตัวอย่างที่รันด้วยข้อมูลสมมติ'),'wide':id=='plotting-data'})
  text=buffer.getvalue().rstrip()
  if not text and not images:raise RuntimeError(f'No visible output: {id} block {i+1}')
  entry['outputs'].append({'codeHash':hashlib.sha256(code.encode()).hexdigest(),'probe':probe,'text':text,'images':images,'caption':notes.get(id,'ผลจากการรันโค้ดด้วยข้อมูลตัวอย่างที่ระบุ ตัวเลขใน array ของ NumPy แสดงทศนิยมไม่เกิน 6 ตำแหน่ง')})
  plt.close('all')
 manifest['lessons'][id]=entry
(OUT/'data').mkdir(exist_ok=True)
(OUT/'data/code-outputs.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'lessonsWithCode':len(manifest['lessons']),'executedBlocks':sum(len(x['outputs']) for x in manifest['lessons'].values()),'figures':len(list(ASSETS.glob('*.png'))),'runtime':manifest['runtime']},indent=2))
