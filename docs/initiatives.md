# Projects and competitions

The [project index](https://chaofan996.github.io/gait-survey/?view=initiatives&kind=projects) and [competition index](https://chaofan996.github.io/gait-survey/?view=initiatives&kind=competitions) accompany Sections III-E and III-D. The initial release contains **9 funded research entries and 11 competition editions**, with sources checked on **2026-09-23**.

## Scope

Include funded research with a documented connection to gait identity recognition, multimodal biometrics, or related person/object re-identification. The labels distinguish gait-specific work, multimodal identity research, and broader ReID. BRIAR includes gait and face/body fusion; Video LINCS covers broader object association and is not described as a gait-only program. The historical DARPA HumanID program is distinct from the modern HID competition series.

Health monitoring, rehabilitation, motor-intention recognition and procurement projects are outside this index. Mobilise-D, gaitQ's clinical intervention project and the Chinese movement-assistance projects researched during curation were therefore not included. A dataset or laboratory is not itself treated as a funded project.

HID 2020–2026 has a separate entry for each edition. MGR 2024 is an ACM MM **HCMA workshop challenge**, not asserted to be a main-conference Grand Challenge. OUMVLP-OF includes its later training-data update. AG-ReID and AG-VPReID are labeled related ReID tasks. Do not compare rankings across editions without checking data, splits and allowed external resources.

## Reading dates and funding

Year filters match documented project intervals or competition editions. Where only a launch or solicitation year is known, the record matches that year. This is a historical research index, not an active-grant or registration calendar. Dates for the Southampton HumanID entry describe that award, not the entire DARPA program. The Chongqing entry records approval and acceptance milestones, not an inferred contract period.

Funding is optional and appears under **Scope & sources**. An amount must have a primary source and an explicit scope: total project, subproject, annual allocation, or direct/indirect costs. Missing funding means it was not established from the linked material. Do not substitute an institution's total budget, a funding-call ceiling, procurement value or a commercial investment. Project titles translated from Chinese or Japanese retain the original title and a citation note.

## Add or correct a record

1. Edit `initiatives.json`, the canonical data source. Keep stable IDs and provide `kind`, title, country/region, host/funder, documented years, scope, concise summary, details, tags, source links and citation metadata.
2. Check every factual summary against an official grant record, government/institutional report, organizer website or organizer-authored competition report. Each source includes a short `evidence` description. `checkedOn` records the date of source inspection; it is not a claim of independent human review.
3. State the basis of dates in `periodBasis`. Supply `originalTitle` for translated projects. `funding.sourceUrl`, if present, must match a source in that entry. Reuse a citation key only when the source metadata is identical; the BibTeX export deduplicates shared sources.
4. Run `python3 scripts/build_initiatives.py` and `python3 scripts/validate_data.py`. The regular `build_data.py` also regenerates the initiative bundle and citations.
5. Preview both types, search by project/dataset name, combine year/region/scope filters, reload a shared URL and inspect the mobile layout. Commit canonical records and generated files together.

`initiatives-data.js` is the browser bundle; `initiatives.bib` contains source citations. The page exports the selected JSON records with filters and provenance. Neither project entries nor competition entries contribute to the fixed 160-publication statistical snapshot.

## Manuscript links

```latex
Additional competitions, evaluation settings, and official sources are available in the website's filterable index.\footnote{\url{https://chaofan996.github.io/gait-survey/?view=initiatives&kind=competitions}}

More related projects and official sources are available in the website's filterable index.\footnote{\url{https://chaofan996.github.io/gait-survey/?view=initiatives&kind=projects}}
```
