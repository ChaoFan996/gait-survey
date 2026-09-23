# Cross-domain evidence and Figure 5

The explorer retains source-only transfer records separately by reporting paper, method configuration, training dataset and target dataset. Select a reporting source before comparing scores. Source, input, training, target and metric filters are preserved in shareable URLs. The transfer matrix follows the selected source and input filter. Figure 5 and the explorer no longer display a calculated-difference panel.

## Imported evidence

- BiggerGait (NeurIPS 2025), Table 1: 35 records for CCPG and CCGR-Mini training, including two records with unreported scores.
- BigGait (CVPR 2024), Table 4: 18 records for GaitSet, GaitBase and BigGait across six transfer directions among CCPG, CASIA-B* and SUSTech1K. ReID comparator rows are outside this import.
- DenoisingGait (CVPR 2025), supplementary Table 9: 24 records for GaitSet, GaitBase, BigGait and DenoisingGait across the same six directions, retaining all listed conditions and overall scores. ReID comparator rows are outside this import.
- GaitMax (CVPR 2026), Table 3: 12 records for six methods, trained on CCPG and tested on CASIA-B and SUSTech1K. Import individual conditions, not the aggregate means.
- Gait3D (CVPR 2022), supplementary Table 3: all six GaitSet transfer records, including rank-1, rank-5 and mAP. GREW as a test target uses the authors' custom 1,000-identity subset.
- GPGait (ICCV 2023), Table 1: all 48 cross-domain records for GaitGraph, GaitGraph2, GaitTR and GPGait across CASIA-B, OUMVLP-Pose, GREW and Gait3D. Within-domain entries are excluded. Values follow the published CVF table, including GaitTR's OUMVLP-Pose-to-CASIA-B mean of 7.84 (the repository README reports 7.85).

There are 143 cross-domain provenance records. Repeated scores under distinct reporting sources are not independent experiments or additional methods. This is a selected literature comparison, not an exhaustive leaderboard. Target-data adaptation (such as GOUDA) and multi-dataset pretraining-only evaluations are not pooled into source-only transfer.

## Protocol safeguards

`GREW (1,000-ID subset)` is separate from `GREW`: Gait3D's supplementary evaluation samples 1,000 identities from the GREW training partition and uses 1,000 query / 4,095 gallery sequences. GPGait uses the standard 6,000-identity GREW test split. Its CASIA-B, GREW and Gait3D poses come from HRNet; OUMVLP-Pose uses AlphaPose joints mapped to COCO17, and indoor evaluations exclude identical views. These details appear alongside selected records, not only in this document.

OU-LP and OUMVLP-Pose are distinct datasets. CASIA-B and CASIA-B* retain each source's labels; preprocessing equivalence is not inferred. `R1` is the source-reported rank-1 score; `Mean` is preserved where the source explicitly labels a condition mean. GaitMax's SUSTech1K mean is not substituted for an overall score. Missing aggregates are not inferred.

Discrepancies are retained by reporting source: CCPG-trained GaitBase on SUSTech1K has 16.8 overall in BiggerGait Table 1 and 17.3 in DenoisingGait supplementary Table 9; BigGait UM values also differ across GaitMax and DenoisingGait. The interface retains up to two reported decimal places.

## Figure selection and rebuilding

`data/cross-domain-figure.json` records the exact source records selected for the added panels. The six-panel, double-column figure contains 88 reported scores and two unreported cells:

- (a–b): 46 scores from BiggerGait Table 1, for CCPG and CCGR-Mini training.
- (c): six CL scores from GaitMax Table 3.
- (d): eight CL scores for BigGait and DenoisingGait under CASIA-B* / SUSTech1K training, from DenoisingGait supplementary Table 9.
- (e): 12 rank-1 / rank-5 / mAP scores for four GaitSet transfer directions from Gait3D supplementary Table 3. The GREW target carries a dagger identifying its custom split.
- (f): 16 rank-1 scores for four pose methods and four directions from GPGait Table 1, including both GREW-to-Gait3D and Gait3D-to-GREW.

The computed-difference panel is removed. The alternative RGB training-source panel is restored following the correction that differences, rather than that panel, should be removed. All panels use one percentage scale, with metrics stated explicitly.

The downloadable vector figure is `assets/cross-domain-transfer.pdf`. Its builder and canonical selection live in the survey workspace at `overleaf/statistics/rebuild_transfer_figure.py` and `cross_domain_results.json`. After editing, regenerate the PDF, copy it to `assets/`, and synchronize the selection JSON. Run `python3 scripts/build_data.py`, `python3 scripts/validate_data.py`, and `node --check companion.js`. Validation checks displayed values against source-specific records, dataset split separation, and absence of mean/overall substitution.
