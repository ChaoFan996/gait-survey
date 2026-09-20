# Gait Research Library

An interactive companion to **Gait Recognition: A Survey and Outlook**.

**[Homepage](https://chaofan996.github.io/gait-survey/)** · [Statistical membership](statistics-membership.csv) · [Counts](statistics-counts.csv) · [Relationship evidence](relationships.csv)

The companion supports an ongoing survey effort: source-linked records, reproducible statistics, and a documented review workflow let us incorporate new research while preserving the evidence behind each manuscript version. Propose additions through a pull request or a repository issue with the relevant paper and source location.

## Explore the survey

| View | Contents | Manuscript counterpart |
| --- | --- | --- |
| Literature | Searchable papers, Core Motivation, Key Idea, Main Techniques, publication links, and citations | Research landscape |
| Benchmarks | Within-domain and cross-domain rankings, source records, and training-source comparisons | Tables III–IV |
| Statistics | Dataset frequency, annual usage, inclusive combinations, modality counts, and dataset resources | Table II and Figures 5–6 |
| Research map | Papers linked to five methodological dimensions and challenges/outlooks, with supporting survey passages | Sections IV–VI and the research agenda in Table V |

The static site has no backend or external JavaScript dependencies. Filters are shareable, records can be exported, and the layout supports desktop and mobile browsing.

## Statistical scope and counting rules

The current manuscript snapshot, **`survey-2026-09-21`**, contains **160 publications from 2020–2025 and 212 recorded modality uses**. Membership is frozen in [`companion.json`](companion.json) (`records`), with scope recorded in [`data/snapshot.json`](data/snapshot.json). The broader catalogue currently contains 278 references, including foundational and selected 2026 work. Adding a reference to the catalogue does not automatically add it to the manuscript statistics.

Included conferences: **CVPR, ICCV, ECCV, WACV, BMVC, ACCV, IJCB, AAAI, ACM MM**. Included journals: **TPAMI, TIFS, TIP, TNNLS, TCSVT, TBIOM, TMM, IJCV, PR**. PRL, NeurIPS, workshops, and preprints are outside this statistical scope. A benchmark result may cite another venue to reproduce Tables III–IV; this does not add its source paper to the statistical corpus.

The original 168-row modality archive was reconciled to 160 publications: five PRL records, one wearable-only study, one withdrawn record, and one duplicate were excluded. Row-level reasons are in [`data-audit.json`](data-audit.json). Distinct conference and journal publications count separately; duplicate records or citation aliases for the same publication count once.

- **Datasets:** one use per publication and dataset. Percentages divide by the selected publication count. Co-usage is inclusive: a paper using A, B, and C contributes to A+B, A+C, B+C, and A+B+C. The top ten combinations follow this rule.
- **Modalities:** one use per publication and recorded modality. The 212 uses include inference inputs, training auxiliaries, and cross-modal settings. Multiple recorded inputs describe the source record, rather than necessarily implying inference-time fusion. Skeleton and Pose retain the archive's distinct labels.
- **Resources:** descriptions correspond to Table II. Fixed-corpus usage remains visible alongside filtered usage. OU-ISIR usage follows records labeled OU-LP; other variants remain separate. A dash denotes unavailable or uncoded information.
- **Year, venue, and word-cloud views:** use the same 160-publication membership. Each cloud term counts at most once per eligible paper in the selected summary fields.
- **Research-map counts:** dimension totals and dimension–outlook intersections use the 160-publication corpus. The browsable map also includes cited foundational, related, and 2026 papers. An unmarked cell means there is no indexed discussion link for that pair.

The snapshot contains 14, 13, 20, 34, 36, and 43 publications in 2020 through 2025, respectively. Statistical views expose their contributing records or a downloadable membership list.

## Benchmark interpretation

This release contains **120 experimental records**, including alternative sources. Rankings compare a selected **dataset, protocol, metric, and gait-training source**. Inputs, upstream models, and external pretraining are shown with the available source information. Full CCGR and CCGR-Mini, CCPG gait and person-ReID protocols, and CASIA-B versus the transfer setting CASIA-B* remain distinct.

For **CCGR-Mini**, select the highest R1 for each listed method configuration among the imported sources. Keep every companion metric from that same experiment; an unreported mAP or mINP stays `null`. Source history retains alternative reports. For example, the selected GaitBase record is 27.0 / 24.9 / 9.7; BigGait's selected 88.0 R1 record has unreported mAP and mINP.

Cross-domain records specify the gait-training source and target benchmark. The paired-source view compares a method across two training datasets; recorded external training resources remain part of its interpretation.

## Updating the companion

### 1. Add or correct a paper

Edit [`papers.json`](papers.json), the canonical literature catalogue. Copy a structurally similar record and use a stable, unique `id`; retain that ID when correcting metadata so existing links keep working. Include title, authors, year, normalized venue, primary publication URL, citation key, and BibTeX. Identify the publication before merging duplicate titles or conference/journal versions.

| Field | Question |
| --- | --- |
| `motivation` | **Why this work?** What problem or limitation motivates it? |
| `idea` | **What changes?** What is the central contribution? |
| `techniques` | **How does it work?** Which mechanisms implement the idea? |

The survey's initial collection and three-field summaries used LLM assistance followed by record-by-record human verification. Continue that workflow for additions: check metadata, each summary, inputs, and dataset claims against the linked paper before merging. Record evidence and review information in `provenance`, for example:

```json
{
  "source": "Primary publication",
  "evidence": "Sections 3–4; Table 2",
  "reviewedBy": "Reviewer name or repository handle",
  "reviewedOn": "YYYY-MM-DD"
}
```

Use `abstractKind` and `abstractSource` to distinguish an original abstract from an editorial summary. Mark publication status and unresolved fields explicitly. Set `complete` only after the required summaries have been reviewed. A withdrawn or out-of-scope reference may remain as a labeled catalogue entry. `statisticsEligible` and `venueInScope` are generated by the build script.

### 2. Add benchmark evidence

Edit `companion.json` → `results`. Each record needs a unique `id`, method and year, input, `domain` (`within` or `cross`), `train`, `target`, `configuration`, `resources`, `metrics`, and `source`. The `origin` field should identify the source table, page, or supplementary location. The source object contains `key`, `title`, `url`, `venue`, `year`, and the catalogue `paperId` where available.

Check the original table and protocol notes. Preserve a separate record when the protocol, method variant, training resources, or source experiment differs. Use `null` for unreported metrics. Add a new benchmark key with a protocol description when its setting differs from an existing one. Recheck the CCGR-Mini selection rule when adding its results.

### 3. Maintain method–challenge–outlook links

The initial map indexes explicit citations in Sections IV–VI: **101 linked publications, 152 links, and 47 evidence passages**. Links open the relevant discussion and source publication. They describe where a paper informs the survey's analysis; one paper can appear under several dimensions or outlooks.

When the manuscript changes, regenerate from an authorized local copy:

```sh
python3 scripts/build_research_map.py --manuscript /path/to/main.tex
```

The builder records the manuscript revision and content hash and exports discussion excerpts; it does not copy the full manuscript into this repository. Review generated passages and citation resolutions. If a section is renamed, update the builder's section mapping.

To add a relationship before it appears in the manuscript, append a reviewed entry to [`data/relationship-additions.json`](data/relationship-additions.json), then rerun the builder:

```json
{
  "paperId": "existing-publication-id",
  "nodeId": "robustness",
  "relationship": "Occlusion modeling",
  "evidence": "A concise explanation supported by a specific section or experiment.",
  "sourceUrl": "https://primary-publication-url",
  "reviewedBy": "Reviewer name or repository handle",
  "reviewedOn": "YYYY-MM-DD"
}
```

Use a node ID from `research-map.json`. The map labels these additions as *Curated paper evidence*. If the manuscript is unavailable, propose the addition in a pull request for a maintainer to regenerate and review.

### 4. Release a new statistical snapshot

Routine catalogue additions leave current manuscript membership unchanged. To extend statistical coverage, make a dedicated snapshot update:

1. Agree on the new date range and venue scope; verify candidate publications and reconcile duplicates.
2. Update `companion.json` → `records`, retaining publication IDs, dataset labels, modalities, and provenance. Document additions, removals, and corrections in release notes and the reconciliation log.
3. Update `data/snapshot.json` and matching `companion.json` metadata: snapshot ID, period, venue list, publication total, and modality-use total. Update `catalogue` usage values from the new membership.
4. Regenerate counts and update manuscript Table II and Figures 5–6. Review the timeline date range, figure labels, and explanatory text in the website and README when extending beyond 2025.
5. Validate and inspect the rendered views. Commit statistics separately from prose or layout changes, and tag the approved manuscript snapshot so earlier figures remain reproducible.

This separation supports a growing literature resource and a recoverable statistical basis for each survey revision.

### 5. Regenerate, validate, and review

Python **3.9+** is sufficient for the data scripts; Node.js is used for JavaScript syntax checks. No package installation is required.

```sh
python3 scripts/build_data.py
python3 scripts/validate_data.py
node --check app.js
node --check companion.js
node --check research-map.js
python3 -m http.server 8766
```

Open [the local preview](http://localhost:8766/). Inspect the changed records, one benchmark source dialog, statistical membership, a map passage, and the mobile layout. Review `git diff` before committing.

Commit canonical JSON and generated bundles/exports together. The build updates `papers.js`, `companion-data.js`, `research-map-data.js`, `statistics-membership.csv`, `statistics-counts.csv`, and `data-audit.json`; the map builder also writes `relationships.csv`. Generated files follow canonical records and should not be edited independently.

Validation checks IDs, scope and counts, dataset-resource usage, nullable metric ranges, source URLs, benchmark selection, relationship evidence, and JSON/JavaScript synchronization. GitHub Actions runs these checks on pushes and pull requests. The human source check in steps 1–3 establishes the accuracy of the research claims.

### 6. Publish a reviewed update

Use a branch and pull request for contributions. Describe sources checked, affected manuscript figures/tables, and validation results. Keep data corrections, snapshot changes, and interface edits in clearly described commits; record releases in [`CHANGELOG.md`](CHANGELOG.md).

The repository root is the GitHub Pages site package. After merging into the Pages publishing branch, check deployment status and open the [public homepage](https://chaofan996.github.io/gait-survey/) to verify views and downloads. Keep tokens and private source files out of the repository.

## File guide

| File | Role |
| --- | --- |
| `papers.json` | Canonical metadata and three-field summaries |
| `companion.json` | Statistical records, resources, protocols, and benchmark evidence |
| `data/snapshot.json` | Statistical scope and expected totals |
| `data/relationship-additions.json` | Human-reviewed relationships beyond manuscript citation indexing |
| `research-map.json` | Map nodes, links, passages, and manuscript provenance |
| `scripts/build_data.py` | Generate browser bundles, membership, and counts |
| `scripts/build_research_map.py` | Generate map and CSV from the manuscript and reviewed additions |
| `scripts/validate_data.py` | Check consistency before release |

## Rights

Paper titles, publication metadata, and linked research remain attributable to their authors and publishers. No paper PDFs are redistributed. The survey logo and editorial content remain with the survey authors.
