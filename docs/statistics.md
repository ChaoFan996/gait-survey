# Statistical scope and benchmark interpretation

[Back to the project](../README.md) · [Contribution guide](../CONTRIBUTING.md)

These rules document the current manuscript snapshot and the evidence shown in the companion.

## Scope and counting rules

The current manuscript snapshot, **`survey-2026-09-21`**, contains **160 publications from 2020–2025 and 212 recorded modality uses**. Membership is frozen in [`companion.json`](../companion.json) (`records`), with scope recorded in [`data/snapshot.json`](../data/snapshot.json). The broader catalogue currently contains 278 references, including foundational and selected 2026 work. Adding a reference to the catalogue does not automatically add it to the manuscript statistics.

Included conferences: **CVPR, ICCV, ECCV, WACV, BMVC, ACCV, IJCB, AAAI, ACM MM**. Included journals: **TPAMI, TIFS, TIP, TNNLS, TCSVT, TBIOM, TMM, IJCV, PR**. PRL, NeurIPS, workshops, and preprints are outside this statistical scope. A benchmark result may cite another venue to reproduce Tables III–IV; this does not add its source paper to the statistical corpus.

The original 168-row modality archive was reconciled to 160 publications: five PRL records, one wearable-only study, one withdrawn record, and one duplicate were excluded. Row-level reasons are in [`data-audit.json`](../data-audit.json). Distinct conference and journal publications count separately; duplicate records or citation aliases for the same publication count once.

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
