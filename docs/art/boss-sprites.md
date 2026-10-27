# Academy boss portraits

57 individual transparent creature portraits, one per stable boss ID. Subjects are recorded in `boss-sprite-concepts.json`; required anatomical/equipment cues are in `boss-medical-motifs.json`. The user approved detailed fantasy blended with medical guardian. Generated with the built-in image-generation tool, using the fantasy Blue Bloater and the medical-guardian preview as style references. Names, questions, and progress IDs are unchanged.

Shared prompt: one full-body fantasy RPG creature on genuine transparent background. Painterly facets, navy/teal shadows, antique brass accents and warm rim lighting. Readable silhouette at small card size. Use the individual concept's body shape and props; don't copy the reference pose/body. Entire subject and extremities within the central 80% of the square. No text, scenery, floor, border, UI or baked checkerboard. Symbolic creature, not a caricature of a real patient or medical diagram.

Production assets: `img/bosses/<id>.webp`, 384 × 384 with alpha, quality 86. Original PNGs remain in the image-generation output directory. `tools/build_boss_sprites.py` refuses to build with missing assets and generates the existing BOSS_SPRITES registry.

Each sprite is a single illustration. Existing portrait-container idle, hit, lunge, aura and victory effects remain. CSS reduced-motion and pause rules apply unchanged. Frame-specific creature animations are a future phase, not represented by duplicate still frames.
