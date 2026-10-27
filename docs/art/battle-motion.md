# Battle worlds and drawn guardian motion

Approved 2026-10-27. Generated with the built-in image-generation tool. Battle environments are original assets, separate from the academy/menu and course banners.

## Environment prompt

Production battle background for fantasy respiratory-care RPG. Wide landscape 3:2 composition, detailed painted fantasy game environment, navy/teal and antique brass. Camera at standing eye level aimed toward empty arena stage. Empty central 55% for animated full-body boss, visible floor contact at lower third, ground plane and depth. Rich details concentrated to edges and distance. Crisp painterly materials, atmospheric depth, restrained lighting behind character. No characters, silhouettes, UI, writing, letters, labels, logos or watermark. No study room, library, main menu or course-banner hospital illustration.

Individual environment subjects are in `battle-arena-concepts.json`.

## Pose-sheet prompt

Identity reference: corresponding `img/bosses/<id>.webp`. Preserve exact character, face, anatomy, proportions, colors and medical equipment from that original and the concept in `boss-sprite-concepts.json`. Six individually drawn full-body animation poses in a strict equal-cell 3-column by 2-row grid, square cells, genuine alpha background. Reading order: neutral guard; idle inhale with chest/bellows expanded and elbows/wings open, feet still; attack wind-up drawing arm/head/weapon back and bracing legs; decisive strike extending arm/weapon/jaws with bent planted stance; hit recoil protecting chest with head and shoulders pulled back; recovery crouch returning to guard. Same body scale/camera and feet baseline. Entire silhouette within central84% of each cell. Anatomical pose changes, no rotated/translated duplicate cutouts. Detailed painterly fantasy, antique brass, teal/navy and original palette. Maintain recognizability and limb count. No scenery, floor, shadow, writing, grid lines, numbers, borders or connecting characters. Alpha=0 outside creatures, no painted gradient/checkerboard.

Oxygenator uses the approved six-pose design preview as its source. The source manifest records all original PNGs and preparation scale. Original source images stay in the image-generation output directory.

## Runtime and preparation

`tools/pose_cells.py` identifies the six separate guardian silhouettes by alpha connectivity, retains associated detached details, and rejects sheets with joined bodies. `tools/prepare_boss_motion.py` crops and resamples these complete silhouettes with one scale per character, aligns visible silhouettes to a shared baseline, preserves alpha, and packs six 384px square cells into a 1152x768 WebP atlas. It synthesizes no new poses. Static portraits remain unchanged. `BossMotion` overlays sheets only on combat portraits after successful loading; image failures preserve the static fallback. Idle alternates neutral/inhale. Attacks show wind-up/strike/recovery; hits show recoil/recovery. Pose timers stop for saved pause, reduced motion and hidden documents. Router cleanup cancels motion/FX.

The six arena files are 1440x960 WebPs. All six arenas and 57 atlases are precached for offline battles.

Four sheets were regenerated with compact full-body poses and at least90px transparent margins to prevent adjoining silhouettes: asthma, emphysema-no, m202-s10, m203-s05. The larger-margin prompt preserves the six-pose sequence and guardian identities; it limits each figure to about300px within each512px cell.
