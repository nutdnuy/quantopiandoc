// Run with: node --test qa/lab-models.test.mjs
// Financial examples below are hypothetical; expected answers are hand-calculated.
import test from 'node:test';
import fs from 'node:fs';
const curriculum=JSON.parse(fs.readFileSync(new URL('../data/curriculum.json',import.meta.url)));
const lessonIds=curriculum.flatMap(g=>g.topics).filter(id=>JSON.parse(fs.readFileSync(new URL('../content/'+id+'.json',import.meta.url))).format!=='essay');
import assert from 'node:assert/strict';
import {
  mean, variance, sd, corr, ranks, spearman, normalPdf, normalCdf,
  normalQuantile, fitLine, quantile, expectedShortfall, wealth, maxDrawdown,
} from '../src/lab-math.mjs';
import {runLab} from '../src/lab-models.mjs';
import {labs, defaultParams, lessonLabs} from '../src/lab-registry.mjs';

function near(actual, expected, tolerance = 1e-10, context = '') {
  assert.ok(Number.isFinite(actual), `${context}: expected a finite number, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `${context}: expected ${expected} ± ${tolerance}, got ${actual}`);
}
function metric(output, label) {
  const found = output.metrics.find(([name]) => name === label);
  assert.ok(found, `Missing metric: ${label}`);
  return found[1];
}
function metricNumber(output, label) {
  const value = metric(output, label);
  const number = typeof value === 'number' ? value : Number.parseFloat(value);
  assert.ok(Number.isFinite(number), `${label}: not a numeric metric (${value})`);
  return number;
}
function pointAt(series, x) {
  const point = series.points.find(([px]) => Math.abs(px - x) < 1e-9);
  assert.ok(point, `No chart point at x=${x}`);
  return point[1];
}
function defaults(kind) {
  const lab = labs.find(item => item.kind === kind);
  assert.ok(lab, `Missing registered kind: ${kind}`);
  return defaultParams(lab);
}
function run(kind, changes = {}) {
  return runLab(kind, {...defaults(kind), ...changes});
}
function assertFiniteNumbers(value, context) {
  if (typeof value === 'number') assert.ok(Number.isFinite(value), `${context}: ${value}`);
  else if (Array.isArray(value)) value.forEach((item, i) => assertFiniteNumbers(item, `${context}[${i}]`));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) assertFiniteNumbers(item, `${context}.${key}`);
  }
}
function checkOutput(output, lab, params) {
  assertFiniteNumbers(output, lab.id);
  assert.ok(Array.isArray(output.charts));
  assert.ok(Array.isArray(output.metrics) && output.metrics.length > 0);
  assert.equal(typeof output.note, 'string');
  assert.ok(output.note.length > 0, `${lab.id}: missing assumptions`);
  for (const [label, value] of output.metrics) {
    assert.equal(typeof label, 'string');
    assert.ok(!/NaN|Infinity|ไม่กำหนด/.test(String(value)), `${lab.id}: ${label} = ${value}`);
  }
  if (!output.charts.length) {
    // The two independent sliders can deliberately select a nonstationary GARCH.
    assert.equal(lab.kind, 'garch');
    assert.ok(params.alpha + params.beta >= 1);
  }
  for (const chart of output.charts) {
    assert.ok(chart.series.length > 0, `${lab.id}: empty chart`);
    for (const series of chart.series) {
      assert.ok(series.points.length > 0, `${lab.id}: empty series`);
      for (const point of series.points) {
        assert.equal(point.length, 2);
        point.forEach(number => assert.ok(Number.isFinite(number), `${lab.id}: invalid point`));
      }
    }
  }
  // Rolling tables intentionally show "NaN" before a full window exists.
  // Numeric NaN is still rejected recursively; text placeholders are allowed in tables.
}
function boundaryCases(lab) {
  const initial = defaultParams(lab);
  const dimensions = lab.controls.map(control => {
    const values = control.type === 'range' ? [control.min, control.max]
      : control.options.map(([value]) => /^[-\d.]+$/.test(value) ? Number(value) : value);
    return {id: control.id, values};
  });
  const candidates = [initial];
  for (const {id, values} of dimensions) {
    for (const value of values) candidates.push({...initial, [id]: value});
  }
  // Include simultaneous endpoints and every categorical option, not just one slider at a time.
  let corners = [initial];
  for (const {id, values} of dimensions) {
    corners = corners.flatMap(params => values.map(value => ({...params, [id]: value})));
  }
  candidates.push(...corners);
  return [...new Map(candidates.map(params => [JSON.stringify(params), params])).values()];
}

test('registry has unique configurations and covers every practice lesson', () => {
  assert.equal(labs.length, lessonIds.length + 1);
  assert.equal(new Set(labs.map(lab => lab.id)).size, labs.length);
  assert.deepEqual([...new Set(labs.map(lab => lab.lesson))].sort(), [...lessonIds].sort());
  assert.equal(lessonLabs('statistical-moments').length, 2);
});

// Keep each lesson configuration as its own test: aliases and duplicates can have
// different default overrides, so testing each model kind alone misses regressions.
for (const lab of labs) {
  test(`${lab.id} ${lab.lesson}/${lab.kind}: boundaries, deterministic reset and no mutation`, () => {
    const savedDefinition = structuredClone(lab);
    const originalParams = defaultParams(lab);
    const originalOutput = runLab(lab.kind, Object.freeze({...originalParams}));
    checkOutput(originalOutput, lab, originalParams);
    for (const params of boundaryCases(lab)) {
      const before = structuredClone(params);
      checkOutput(runLab(lab.kind, Object.freeze(params)), lab, params);
      assert.deepEqual(params, before, `${lab.id}: the model mutated its inputs`);
    }
    const editedParams = defaultParams(lab);
    editedParams[lab.controls[0].id] = '__simulate_edited_control__';
    const resetParams = defaultParams(lab);
    assert.notStrictEqual(resetParams, originalParams);
    assert.deepEqual(resetParams, originalParams, `${lab.id}: reset retained edited values`);
    assert.deepEqual(runLab(lab.kind, resetParams), originalOutput,
      `${lab.id}: reset did not reproduce the same seeded output`);
    assert.deepEqual(lab, savedDefinition, `${lab.id}: model/defaults mutated the registry`);
  });
}

test('sample and population variance retain their denominators, units and translation invariance', () => {
  const x = [2, 4, 4, 4, 5, 5, 7, 9]; // Sum = 40; squared deviations from 5 sum to 32.
  near(mean(x), 5);
  near(variance(x, 0), 4);
  near(variance(x), 32 / 7);
  near(sd(x), Math.sqrt(32 / 7));
  near(variance(x.map(value => value + 100)), 32 / 7);
  near(variance(x.map(value => value * 100)), 320000 / 7, 1e-8);
});

test('correlation, tied ranks and exact OLS recover independently known relationships', () => {
  const x = [-2, -1, 0, 1, 2], y = [-5, -2, 1, 4, 7];
  near(corr(x, y), 1);
  near(corr(x, [...y].reverse()), -1);
  assert.deepEqual(ranks([10, 20, 20, 40]), [1, 2.5, 2.5, 4]);
  near(spearman([1, 2, 3, 4], [1, 4, 9, 16]), 1);
  const fitted = fitLine(x, y);
  near(fitted.beta[0], 1);
  near(fitted.beta[1], 3);
  near(fitted.r2, 1);
  fitted.residual.forEach(value => near(value, 0));
});

test('Normal functions match fixed population reference values', () => {
  near(normalPdf(0), 0.3989422804014327, 1e-12);
  near(normalCdf(0), 0.5, 1e-7);
  near(normalCdf(1.96), 0.9750021048517795, 1e-7);
  near(normalQuantile(0.975), 1.959963984540054, 2e-6);
  near(normalQuantile(0.025), -1.959963984540054, 2e-6);
  const output = run('distribution', {mu: 2, sigma: 1.5});
  near(metricNumber(output, 'Mean'), 2);
  near(metricNumber(output, 'Variance'), 2.25);
  near(pointAt(output.charts[0].series[0], 2), 0.2659615202676218, 1e-12);
});

test('simple, log and compounded returns use consistent bases', () => {
  const output = run('return', {before: 100, after: 110});
  near(metricNumber(output, 'Simple return'), 10, 1e-10);
  near(metricNumber(output, 'Log return'), 9.53, 1e-10);
  assert.deepEqual(wealth([0.2, -0.2]), [100, 120, 96]);
  const twoPeriods = run('means', {a: 20, b: -20});
  near(metricNumber(twoPeriods, 'Arithmetic mean'), 0);
  near(metricNumber(twoPeriods, 'Ending wealth'), 96);
  near(metricNumber(twoPeriods, 'Geometric mean'), -2.02, 1e-10);
  near(maxDrawdown([100, 120, 90]), -0.25);
  near(maxDrawdown([100, 101, 102]), 0);
});

test('weighted return example retains percentage-point rather than decimal variance units', () => {
  const output = run('weighted', {weight: 60});
  const portfolio = output.charts[0].series.find(series => series.name === 'Portfolio');
  [1.4, -1.2, 2.2].forEach((expected, i) => near(portfolio.points[i][1], expected));
  near(metricNumber(output, 'Portfolio mean'), 0.8);
  near(metricNumber(output, 'Portfolio sample variance'), 3.16);
});

test('known-variance confidence intervals and AR population variance match analytic values', () => {
  const small = run('confidence', {n: 25, level: 95});
  const large = run('confidence', {n: 100, level: 95});
  const width = output => output.charts[0].series[0].points[1][0]
    - output.charts[0].series[0].points[0][0];
  near(width(small), 0.7839855938160216, 1e-6);
  near(width(large), width(small) / 2);
  near(metricNumber(small, 'Known SE'), 0.2);
  near(metricNumber(run('ar', {phi: 0.5}), 'Theoretical variance'), 4 / 3, 0.0005);
  const garch = run('garch', {alpha: 0.1, beta: 0.8});
  near(metricNumber(garch, 'ω'), 0.1);
  near(metricNumber(garch, 'Unconditional SD'), 1);
});

test('CAPM and APT use annual premiums once and retain the risk-free intercept', () => {
  for (const [beta, expected] of [[0, 2], [0.5, 4.5], [1, 7], [1.2, 8], [1.5, 9.5]]) {
    near(metricNumber(run('capm', {beta, premium: 5}), 'Expected return'), expected);
  }
  near(metricNumber(run('capm', {beta: -0.5, premium: 5}), 'Expected return'), -0.5);
  near(metricNumber(run('apt', {b1: 1.2, b2: 0.5, p1: 5, p2: 2}), 'Expected return'), 9);
  near(metricNumber(run('apt', {b1: 0, b2: 0, p1: 8, p2: -3}), 'Expected return'), 2);
});

test('covariance shrinkage preserves diagonal variance and removes off-diagonal covariance at one', () => {
  const sample = run('covariance', {n: 50, shrink: 0});
  const diagonal = run('covariance', {n: 50, shrink: 1});
  const half = run('covariance', {n: 50, shrink: 0.5});
  const s = sample.charts[0].series[0], d = diagonal.charts[0].series[0];
  const h = half.charts[0].series[0], known = sample.charts[0].series[1];
  near(pointAt(known, 0), 1);
  near(pointAt(known, 100), 1);
  near(pointAt(known, 50), Math.sqrt(0.825)); // 50/50, unit variance, correlation 0.65.
  near(pointAt(d, 0), pointAt(s, 0));
  near(pointAt(d, 100), pointAt(s, 100));
  near(pointAt(d, 50) ** 2, (pointAt(d, 0) ** 2 + pointAt(d, 100) ** 2) / 4);
  near(pointAt(h, 50) ** 2, (pointAt(s, 50) ** 2 + pointAt(d, 50) ** 2) / 2);
  near(metricNumber(diagonal, 'Estimated correlation'), 0);
});

test('beta hedge cancels market P&L while preserving positive residual risk', () => {
  // 60% A (beta 1.4) + 40% B (beta 0.7) gives beta 1.12.
  // Independent residual variances contribute 0.36*0.64 + 0.16*0.36 = 0.288 %².
  const output = run('hedge', {weight: 60, hedge: 1.12});
  near(metricNumber(output, 'Portfolio beta before'), 1.12);
  near(metricNumber(output, 'Beta after hedge'), 0);
  near(metricNumber(output, 'Common-risk share'), 0);
  const [before, after] = String(metric(output, 'SD before / after')).split('/').map(Number.parseFloat);
  near(before, 2.303, 1e-10);
  near(after, 0.537, 1e-10);
  assert.ok(after > 0, 'Market neutrality must not erase residual risk');
  output.charts[0].series[1].points.forEach(([, pnl]) => near(pnl, 0));
  const under = run('hedge', {weight: 60, hedge: 0.92});
  const over = run('hedge', {weight: 60, hedge: 1.32});
  assert.equal(metric(under, 'SD before / after'), metric(over, 'SD before / after'));
  near(pointAt(under.charts[0].series[1], 2), 0.4);
  near(pointAt(over.charts[0].series[1], 2), -0.4);
});

test('leverage charges interest on debt and can exhaust equity without capping the loss', () => {
  // Equity 100, borrowed 100: assets 200 grow to 210, debt grows to 102, equity = 108.
  near(metricNumber(run('leverage', {leverage: 2, ret: 5, borrow: 2}), 'Ending equity (start 100)'), 108);
  near(metricNumber(run('leverage', {leverage: 2, ret: -5, borrow: 2}), 'Equity return'), -12);
  near(metricNumber(run('leverage', {leverage: 1, ret: 5, borrow: 10}), 'Equity return'), 5);
  near(metricNumber(run('leverage', {leverage: 5, ret: -20, borrow: 0}), 'Ending equity (start 100)'), 0);
  assert.ok(metricNumber(run('leverage', {leverage: 5, ret: -40, borrow: 0}), 'Ending equity (start 100)') < 0);
});

test('futures P&L depends on points and multiplier, not the amount of margin', () => {
  const smallMargin = run('futures', {contracts: 2, change: -20, margin: 2000});
  const largeMargin = run('futures', {contracts: 2, change: -20, margin: 10000});
  near(metricNumber(smallMargin, 'Notional'), 200000);
  near(metricNumber(smallMargin, 'P&L'), -2000);
  near(metricNumber(largeMargin, 'P&L'), -2000);
  near(metricNumber(smallMargin, 'P&L / margin'), -100);
  near(metricNumber(largeMargin, 'P&L / margin'), -20);
});

test('equal-weight diversification matches independent and correlated benchmark cases', () => {
  near(metricNumber(run('concentration', {n: 1, rho: 0.95}), 'Portfolio SD'), 2);
  near(metricNumber(run('concentration', {n: 4, rho: 0}), 'Portfolio SD'), 1);
  near(metricNumber(run('concentration', {n: 4, rho: 0}), 'Equivalent independent assets'), 4);
  const correlated = run('concentration', {n: 4, rho: 0.5});
  near(metricNumber(correlated, 'Portfolio SD'), Math.sqrt(2.5), 0.0005);
  near(metricNumber(correlated, 'Equivalent independent assets'), 1.6);
});

test('ETF known-variance interval uses both independent variances and translates with the mean', () => {
  const output = run('etf', {n: 50, diff: 0});
  const shifted = run('etf', {n: 50, diff: 0.5});
  const interval = output.charts[0].series[0].points;
  const other = shifted.charts[0].series[0].points;
  // Each population SD is 1 percentage point: SE = sqrt(2/50) = 0.2 points.
  near(interval[1][0] - interval[0][0], 0.7839855938160216, 1e-6);
  near(other[0][0] - interval[0][0], 0.5);
  near(other[1][0] - interval[1][0], 0.5);
});

test('annual basis-point cost is deducted daily before portfolio compounding', () => {
  const free = run('portfolio', {weight: 60, cost: 0});
  const charged = run('portfolio', {weight: 60, cost: 252}); // 252 bp/year = 1 bp/day.
  const a = free.charts[0].series[0].points.map(point => point[1]);
  const b = charged.charts[0].series[0].points.map(point => point[1]);
  assert.equal(a.length, 253);
  near(a[0], 100);
  near(b[0], 100);
  for (let i = 1; i < a.length; i++) near(a[i] / a[i - 1] - b[i] / b[i - 1], 0.0001, 1e-12);
  assert.equal(metric(free, 'Annualized SD'), metric(charged, 'Annualized SD'));
  assert.ok(metricNumber(charged, 'Total return') < metricNumber(free, 'Total return'));
  assert.ok(metricNumber(charged, 'Sharpe (Rf = 0)') < metricNumber(free, 'Sharpe (Rf = 0)'));
});

test('empirical VaR interpolates without mutating data; ES integrates fractional mass and ties', () => {
  const values = [30, 0, 20, 10], saved = [...values];
  near(quantile(values, 0), 0);
  near(quantile(values, 0.95), 28.5);
  near(quantile(values, 1), 30);
  assert.deepEqual(values, saved);
  const losses = [0, 10, 10, 50], unchanged = [...losses];
  near(expectedShortfall(losses, 0), 17.5);
  near(expectedShortfall(losses, 0.5), 30); // Top two observations, not all values >= 10.
  near(expectedShortfall(losses, 0.625), 110 / 3); // Top 1.5 observations: (50 + 0.5*10)/1.5.
  near(expectedShortfall(losses, 0.9), 50); // Less than one observation of tail mass.
  near(expectedShortfall(losses.map(value => value + 7), 0.625), 110 / 3 + 7);
  near(expectedShortfall(losses.map(value => 2 * value), 0.625), 220 / 3);
  assert.deepEqual(losses, unchanged);
});

test('tail-loss lab retains ES above VaR and reacts to worse losses with the same sample', () => {
  const initial = run('tailrisk', {alpha: 95, shock: 0});
  const shocked = run('tailrisk', {alpha: 95, shock: 10});
  for (const output of [initial, shocked, run('tailrisk', {alpha: 99.5, shock: 4})]) {
    assert.ok(metricNumber(output, 'Empirical ES') >= metricNumber(output, 'Historical VaR'));
  }
  assert.ok(metricNumber(shocked, 'Historical VaR') >= metricNumber(initial, 'Historical VaR'));
  assert.ok(metricNumber(shocked, 'Empirical ES') > metricNumber(initial, 'Empirical ES'));
  near(metricNumber(run('tailrisk', {alpha: 99.5, shock: 4}), 'Expected tail mass'), 2.5);
});

test('market impact converts participation to basis points and has quadratic sensitivity', () => {
  const base = run('impact', {size: 3, time: 50});
  near(metricNumber(base, 'X / (ADV × T)'), 6);
  near(metricNumber(base, 'Model cost'), 3.6);
  near(metricNumber(run('impact', {size: 6, time: 50}), 'Model cost'), 14.4);
  near(metricNumber(run('impact', {size: 3, time: 100}), 'Model cost'), 0.9);
  near(metricNumber(run('impact', {size: 10, time: 20}), 'Model cost'), 250);
});

test('order-book execution weights fills by shares and charges spread versus midpoint', () => {
  // Buy 100 at 100.02 and 50 at 100.04: total 15004, average 100.026666...
  const output = run('execution', {size: 150});
  near(metricNumber(output, 'Average fill price'), 100.0267, 1e-10);
  near(metricNumber(output, 'Cost vs mid'), 2.67, 1e-10);
  assert.equal(output.table.rows.reduce((total, row) => total + row[2], 0), 150);
});
