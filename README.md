# Reverie
An endlessly zooming kaleidoscope tunnel, drawn entirely by a WebGL fragment shader.
No build step, no dependencies.

## Controls
- Move the pointer: bends the centre, twists the spiral, changes zoom speed
- Click / tap: cycles symmetry (6, 8, 12, 5 folds)
- Palette: cycles Opal, Dusk, Aurora
- Save PNG: exports the current frame

## How it works
1. Screen coordinates become log-polar coordinates, so zooming in is a simple scroll along one axis.
2. The angle is mirrored into N wedges (kaleidoscope fold).
3. The coordinates are domain-warped four times, then turned into glowing line patterns.
4. Red, green and blue are sampled at slightly different depths for chromatic fringing.
5. A cosine palette, filmic tone-map, vignette and grain finish the look.