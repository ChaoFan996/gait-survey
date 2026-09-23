# Code & openness

The [interactive view](https://chaofan996.github.io/gait-survey/?view=codebases) accompanies Sec. III-C, “Code and Openness.” It combines three distinct datasets, each with its own scope:

1. **Repository snapshot:** eight selected public repositories spanning method implementations, shared frameworks, dataset benchmarks, and a system demonstration. This is neither an exhaustive list nor a claim to list the eight largest projects. The count is GitHub's `stargazers_count`; stars describe attention, not recognition accuracy or reproducibility. All-in-One-Gait is an OpenGait subproject.
2. **OpenGait history:** cumulative daily counts reconstructed from the public [GitHub aggregate star-history endpoint](https://docs.github.com/en/rest/activity/starring#get-repository-star-history). All 258 continuous weeks were retrieved on 23 September 2026 (Asia/Shanghai), with daily counts summing to weekly totals and the final 1,150 matching the repository snapshot. This is not a set of independently archived historical net-star totals. Unstar effects are not measured separately; day/week boundaries are not guaranteed to align with UTC. No stargazer identities are collected.
3. **Publication statements:** 160 publications from the same fixed 2020–2025 collection as the dataset and modality statistics. Annual denominators are 14, 13, 20, 34, 36, and 43. The corpus includes reviews and related studies, not only new recognition methods. Distinct conference and journal publications are counted separately. Years follow the fixed corpus, including online-first years where applicable.

## What counts as a code-release claim?

An explicit statement in the inspected paper that the authors' own recognition or evaluation code is available or will be released. Each publication counts once.

| Status | Interpretation |
| --- | --- |
| Stated as available | The paper explicitly describes its own code as available or released. |
| Promised release | The paper explicitly promises to release its own code, including upon acceptance. |
| Resource link / statement only | A project link or resource statement that does not meet the own-code definition. |
| No explicit claim found | No qualifying statement was found in the inspected text. This does not mean closed source. |

The numerator excludes dataset-only release statements, project links without explicit code statements, third-party implementations, later reimplementations, and promises of only annotation tools or model weights. “Available” describes the authors' statement; repository accessibility, execution, license status, and accessibility at publication have not been verified.

| Year | Publications | Stated available | Promised release | Combined |
| --- | ---: | ---: | ---: | ---: |
| 2020 | 14 | 1 | 1 | 2 (14.3%) |
| 2021 | 13 | 1 | 1 | 2 (15.4%) |
| 2022 | 20 | 4 | 2 | 6 (30.0%) |
| 2023 | 34 | 10 | 2 | 12 (35.3%) |
| 2024 | 36 | 10 | 5 | 15 (41.7%) |
| 2025 | 43 | 12 | 6 | 18 (41.9%) |
| Total | 160 | 38 | 17 | 55 (34.4%) |

## Audit and corrections

This is a source-text audit dated 23 September 2026, using full-text search and contextual screening of archived PDFs. HSTL and DyGait required OCR. Page numbers refer to PDF pages, not printed page labels. The audit concerns inspected versions, not reconstructed submission-time versions. Paraphrased decisions, evidence-page numbers, and available publication links are published; full paper text and private archive paths are not.

GaitPart's own-source-code promise qualifies. OUMVLP-Pose's discussion of AlphaPose code and its own dataset release does not. HybridGait and CCGR have resource links without explicit own-code-release statements in the inspected text. These classifications describe statements, not whether the repositories contain code.

Corrections are welcome through an [issue](https://github.com/ChaoFan996/gait-survey/issues/new): supply the paper ID, primary publication URL, inspected version, page number, and proposed status. Human review is needed before adopting a corrected classification. A change to the counting definition requires a new documented audit version.

## Maintain the view

- `codebases.json` is canonical: metadata, repository snapshot, aggregate history, annual counts, and 160 public audit records. `data/code-source-links.json` documents 28 primary-publication links added where the older catalogue lacked a URL; all 160 audit records now have a source link.
- `codebases-data.js` is generated for static/offline browsing. `codebases.js` and `codebases.css` provide filters, charts, and selection export.
- `assets/public-codebases-statistics.pdf` is the fixed manuscript figure, 7.16 × 2.25 inches, with three panels in one row, with embedded Times New Roman and vector graphics. It retains its own snapshot date if the interactive data are later refreshed.
- For a new star snapshot, retrieve the selected repositories and **all** aggregate-history pages, validate daily/weekly totals, update retrieval dates, and preserve the publication audit date and corpus membership. Never infer paper claims from current GitHub links.
- For a claim correction, update the record, its evidence page and decision, the annual counts, and `meta.claimAuditDate`. Document the change in `CHANGELOG.md`.
- Rebuild with `python3 scripts/build_data.py`, then run `python3 scripts/validate_data.py` and `node --check codebases.js`. Validation checks membership, annual numerators/denominators, daily continuity, history totals, and generated-bundle parity.

Year, status, and search filters are encoded in the page URL. They affect the record table and selection download; the annual chart retains the fixed denominator. Public JSON and the manuscript PDF can also be downloaded from the view.
