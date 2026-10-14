# October 2026 manuscript alignment

This is a focused update of the existing research companion, preserving its layout and statistical snapshot.

## Source and interpretation

The source is the author-supplied 20-page `2025_GaitSurvey_Chao-4.pdf`, received on 2026-10-11. Its SHA-256 is `8ca6e098cc7596897b3b8db7e0aa80f79eb7e4a620997525d115109016634499`. The unpublished PDF is not redistributed by the website.

The title is **Modern Gait Recognition: A Survey from Deep Learning to Foundation Models**. Coverage focuses on January 2020–September 2026, with earlier work providing context. The revised discussion asks what works, where gains fail, and what transfers.

| Website change | Manuscript basis |
| --- | --- |
| Progress and limits: eight concise rows | Table V, p. 12; Sec. IV-F, pp. 12–13 |
| Synthetic-data reading route | Sec. IV-C, p. 11 |
| Data and model scaling | Combined Sec. IV-F, p. 13 |
| Foundation-model outlook | Sec. V-B, pp. 13–14 |
| Healthcare: usual gait versus meaningful change | Sec. V-C, p. 14 |
| Agents: long-video analysis and robotics | Sec. V-D, p. 14 |
| Privacy across data reuse and the whole system | Sec. VI, pp. 14–15 |

Updated passages are **editorial summaries**, with page provenance and source publications. They are distinguished from the older core map's indexed manuscript passages. Topic links indicate discussion relevance; they do not assert that a cited paper demonstrates every capability in that topic. In particular, MovieNet and robot ReID provide application context rather than proof of gait-enabled agents.

## Added records

- [GaitCrafter, ICCV Workshops 2025](https://openaccess.thecvf.com/content/ICCV2025W/FoundGen-Bio/html/Mitra_GaitCrafter_Diffusion_Model_for_Biometric_Preserving_Gait_Synthesis_ICCVW_2025_paper.html).
- [The Gait Signature of Frailty, arXiv 2026](https://arxiv.org/abs/2603.24434).
- [MovieNet, ECCV 2020](https://arxiv.org/abs/2007.10937).

Metadata was cross-checked against the bibliography audit and these primary publication pages. Existing catalogue IDs are preserved. The GaitEditor preprint keeps its existing website citation key; it is not silently replaced by a later journal version.

## Preserved data

The 160-publication statistical membership, 212 modality uses, benchmark records (228 including alternative sources), code audit and project/competition records are unchanged. The benchmark explorer remains a representative result snapshot, not a claim to reproduce every result in the latest manuscript. The expanded catalogue has 281 references; catalogue additions do not enter the frozen counts.

## Reproduction and review

`data/survey-guide.json` is the canonical reading guide. Run `python3 scripts/build_data.py` and `python3 scripts/validate_data.py` to regenerate and check the browser data and exports. The guide applies only its named topics and updated learning passages; other indexed map passages retain their original provenance. Git history and `CHANGELOG.md` identify the exact changed files. Review this guide when aligning any later manuscript.
