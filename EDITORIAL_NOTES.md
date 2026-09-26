# Editorial decisions

This is a Thai synthesis of the locally preserved Quantopian course. It is not a line-by-line translation or a claim that old code has been migrated and executed. All 53 source topic folders are mapped once into the new learning path; source artifacts remain unchanged for comparison.

## Reading sequence

1. Research questions and Python tools.
2. Statistical foundations.
3. Regression and time-series models.
4. Universe, signals, and factor evaluation.
5. Strategy construction.
6. Portfolio exposures and risk.
7. Research robustness and execution limitations.

Each chapter starts with a question or conceptual bridge, defines terms and symbols in context, develops the reasoning in connected prose, then provides takeaways and a reflective exercise. Source names remain in the English subtitle to support lookup.

## Source ambiguities corrected in the Thai synthesis

The corrections below follow the definitions and equations already in the local material and ordinary algebra/statistical reasoning. No outside source was consulted during creation. Historical original notebooks are retained unchanged, so a source reader may still encounter the older wording.

| Topic | Clarification in the new prose |
|---|---|
| ARCH/GARCH/GMM | Moment count alone does not establish identification. Check rank and independent moment information before estimating all parameters. |
| Autocorrelation / AR | An AR structure does not by itself imply heavy-tailed marginal returns. A stationary Gaussian AR model can remain marginally Normal. |
| Beta hedging / Portfolio Analysis | A beta-neutral portfolio still has estimation error, residual risk, and potentially unmodeled factor exposures. |
| Random Variables | CLT concerns appropriately normalized sums/means under assumptions; standardization alone does not make an arbitrary variable Normal. Normal log returns, rather than Normal simple returns, connect to Lognormal prices. |
| PCA | Matrix orientation, centering, and eigenvalue ordering are kept consistent. Avoid repeating an incorrect fraction in the historical example. |
| Portfolio Analysis | HML compares high book-to-market with low book-to-market. Neither win rate nor trade count alone establishes investment skill. |
| Position Concentration | Zero covariance is weaker than independence. Diversification depends on covariance, weights and exposures, not asset count alone. |
| Residuals / Violations of Regression | Heteroscedasticity alone need not bias OLS coefficients; inference and coefficient consistency are separate issues. Robust/HAC errors do not repair endogeneity or the wrong functional form. |
| Regression Instability | Distinguish unstable coefficients from unstable predictions, and a test result from a posterior probability about the null. |
| Spearman | The shortcut rank formula assumes no ties. A zero rank correlation does not rule out other forms of dependence. |
| Statistical Moments | Distinguish raw, central and standardized moments; zero skewness does not prove symmetry. Explain Jarque–Bera p-values in the correct direction. |
| Variance | Distinguish population and sample denominators, conditional downside variance and downside semivariance. State the finite-variance condition for Chebyshev. |
| Universe Selection | Universe turnover and trading turnover differ; historical QTradableStocksUS rules are historical context, not current API guarantees. |
| Overfitting | Keep exploration, validation and final testing separate. Respect time order. A Kalman model still has assumptions and parameters. |
| VaR / CVaR | Define the loss sign explicitly. VaR is a quantile, not a maximum loss; discrete expected-shortfall calculations require appropriate cutoff mass. |
| Why Hedge I | Use r_i − beta_i r_m for a market hedge. Residualize sector returns against market returns in the intended direction. Information ratio and Sharpe ratio are not interchangeable. |
| Why Hedge II | Use beta_1 beta_2 in the covariance cross term and variances for specific risk; Bᵀw = 0 is neutrality to the modeled exposures. |
| p-Hacking | Bonferroni controls family-wise error without requiring independent tests. The shortcut probability 1−(1−alpha)^m does require independent events. |
| Python / NumPy | Use Python 3 syntax in the new prose and explain 1-D transpose/shape behavior accurately. Original Python 2 notebooks remain unchanged. |
| Futures | Keep contango/backwardation direction and the distinction between a tradable contract and a continuous research series clear. |

## Technical boundaries

- Original output figures and text are preserved as stored outputs, not recomputed empirical evidence.
- Rendered source pages omit remote media and escape raw HTML; the exact original notebook/HTML remains downloadable.
- The source snapshot contains 92 notebooks and 91 HTML previews. Ranking Universes by Factors has no original HTML preview; its reading page is generated from its Notebook.
- Python code syntax is checked separately from execution. Snippets that require existing data are examples, not self-contained programs.
- No claim is made that old Quantopian APIs or data feeds are available today.

## Quantara presentation clarification — 2026-09-26

The owner clarified that “Quantara Design” means the established fictional Quantara world shown in the Robo Trade reference, not the Quantsera brand interpretation used in the first local draft. The current presentation reuses the exact Deltaris workshop, master-and-golem, city-card and learning-atlas illustrations, with the canonical approved QuantCorner marks. No lesson mathematics, source attribution or original Quantopian artifact is changed by this visual correction.

Local records explicitly confirm the Quantara kingdom and Deltaris as home to Algorithmic Trading Masters who build brass golems. The presentation introduces no new city, named character, ruler or historical event. The exact reference `learning-atlas.png` is retained for visual continuity; the source project later revised a duplicate northern settlement in another map version. This illustration is not used to make claims about six-city geography. Exact copies, origins and hashes are listed in `data/quantara-assets.json`.

## Welcome content and language — 2026-09-26

The Welcome page now introduces quantitative investment research with Python and the seven actual curriculum parts. Removed copied Deltaris/Algorithmic Trading Masters lore, guild jokes, maker labels, and the automaton dialogue. Existing Quantara map and Quant Researcher artwork remain as supporting illustration. The researcher registry is draft; the page assigns no city, biography, or named persona. Edited welcome copy and group summaries using the owner-invoked no-ai-slop skill: concrete subjects, direct reading guidance, and preserved notebook limitations. No lesson body, equation, source artifact, topic ID, or lesson order was changed.
