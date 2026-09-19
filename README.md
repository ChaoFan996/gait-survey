# Gait Research Library

An interactive companion to **Gait Recognition: A Survey and Outlook**, with an emphasis on advances from 2020 to 2026 and relevant foundational work.

## Features

- Keyword, year and venue filters, combined in one query.
- Venue, authors, and an expandable abstract for every record.
- Core Motivation, Key Idea and Main Techniques for each record.
- A clickable word cloud based on per-paper term frequency, with source-field selection.
- Year-by-year animation and a publication timeline.
- Paper details, publication links, citation export and shareable filtered URLs.
- Responsive layout, keyboard navigation and reduced-motion support.
- English interface and summaries; no tracking, backend or external JavaScript dependencies.

## Data and interpretation

The initial catalogue contains 278 publication records from the author-maintained paper-summary workbook, the manuscript bibliography, Table I and the 2026 literature update. Conference and journal versions are retained separately. Exact repeated workbook rows and citation aliases for the same publication are merged. Older and related references are included for context.

Original summaries retain their provenance. Companion editorial summaries are concise syntheses of the survey text and recorded source evidence, not quotations or author-endorsed abstracts. They are not a substitute for reading the papers. Metadata corrections are recorded per paper. The archive contains one withdrawn early-access record, explicitly labeled and excluded from word-cloud statistics.

Abstract panels distinguish original abstracts extracted from the supplied papers from concise editorial abstract summaries based on linked publications. Every abstract panel includes attribution or a source link; summaries are explicitly labeled.

The word cloud counts each term at most once per paper in the selected summary fields. It excludes generic function words and uses selected compound research terms. It describes this collection, not citation impact or a complete census of the field. The 2026 collection is partial. The website cloud is recomputed from the extended catalogue; it is not a numerical reproduction of the manuscript's older Figure 5 snapshot.

## Local preview

```sh
python3 -m http.server 8765 
```

Open http://localhost:8765/ . The site also works by opening `index.html` directly.

## Publishing

The `publish/` folder contains a flat, standalone GitHub Pages package. Upload its contents to the root of `ChaoFan996/gait-survey`. In **Settings → Pages**, select **Deploy from a branch**, **main**, **/(root)**, then save.

The intended address is https://chaofan996.github.io/gait-survey/ . Publication status should be checked in GitHub Pages before citing the address.

## Maintaining records

Edit `papers.json` in the flat package, then run `python3 sync_data.py` to regenerate `papers.js` and validate record identifiers, summary fields and English-only content. Commit both data files. Keep IDs stable so existing paper links continue to work.

The local development folder additionally keeps extraction scripts and editorial overrides. `scripts/build_data.py` rebuilds `dist/data/` from the author's local survey archive; these original workbooks, PDFs and extraction caches are not part of the public package.

## Rights

Paper titles, publication metadata and linked research remain attributable to their authors and publishers. No paper PDFs are redistributed. The survey logo and editorial content remain with the survey authors.
