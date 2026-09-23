# Cross-domain evidence and Figure 5

The explorer retains source-only transfer records separately by reporting paper, method configuration, training dataset and target dataset. Select a result source before comparing its scores. Source, input, training, target and metric filters are preserved in shareable URLs. The transfer matrix follows the selected source and input filter; the paired-change table always uses BiggerGait Table 1.

## Coverage added on 2026-09-23

- BigGait (CVPR 2024), Table 4: 18 records for GaitSet, GaitBase and BigGait across six transfer directions among CCPG, CASIA-B* and SUSTech1K. The ReID comparator rows are outside this import.
- DenoisingGait (CVPR 2025), supplementary Table 9: 24 records for GaitSet, GaitBase, BigGait and DenoisingGait across the same six directions, retaining all listed conditions and overall scores. The ReID comparator rows are outside this import.
- GaitMax (CVPR 2026), Table 3: 12 records for its six compared methods, trained on CCPG and tested on CASIA-B and SUSTech1K. Import individual conditions, not the aggregate means.

These 54 records supplement the existing 35 BiggerGait-source records (including two records with unreported scores). Repeated scores under distinct reporting sources are provenance records, not independent experiments or additional methods. This is a selected literature comparison, not an exhaustive cross-domain leaderboard. Target-data adaptation and multi-dataset pretraining-only evaluations are not pooled into it.

## Protocol safeguards

CASIA-B and CASIA-B* retain the reporting paper's dataset label; preprocessing equivalence is not inferred. `R1` represents the source's reported overall score. GaitMax's SUSTech1K mean covers a different set of conditions and is not substituted for an overall score. No missing overall score is calculated by averaging available conditions. Source-reported values are transcribed without correcting or reconciling discrepancies: for example, CCPG-trained GaitBase on SUSTech1K has 16.8 overall in BiggerGait Table 1 and 17.3 in DenoisingGait supplementary Table 9. The BigGait UM values in GaitMax and DenoisingGait are also retained separately.

## Figure selection

`data/cross-domain-figure.json` records the selection and exact experiment IDs for the added panels. Figure 5 keeps the original 46 scores and 12 paired differences in (a–c). Panel (d) adds six CL scores from GaitMax Table 3, with methods in columns and target conditions in rows. The former panel (e) is removed from the figure; all its source records remain available in the explorer under CASIA-B* and SUSTech1K training. Sources and preprocessing notes accompany the manuscript caption.

The downloadable vector figure is `assets/cross-domain-transfer.pdf`. Its builder and canonical selection live in the survey workspace at `overleaf/statistics/rebuild_transfer_figure.py` and `cross_domain_results.json`. After editing, regenerate the PDF, copy it to `assets/`, and synchronize the selection JSON. Then run `python3 scripts/build_data.py`, `python3 scripts/validate_data.py`, and `node --check companion.js`. Validation checks every displayed score against the source-specific record and prevents mean/overall substitution.
