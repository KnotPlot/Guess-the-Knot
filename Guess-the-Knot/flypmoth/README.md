# knot-calculations
Calculate some knot invariants. [Try it now!](https://clarence-chew.github.io/knot-calculations/)

To draw a knot, click on the canvas to draw line segments that will connect to form a polygonal line.
By clicking "Print Knot", you can get your knot data in the console.
You can import the knot by calling `setKnot(...)` with your data. There are also buttons to click to make certain preset knots.

Letting A(t) be the Alexander polynomial, |A(-1)| is the largest number such that there exists a Fox n-coloring of the knot.
It is normal that the Alexander polynomial calculated by determinant might differ from other sources by a factor of t^n or by sign.

Features:
- Input knots using setKnot() from the console, or by drawing the knot
- `PRESETS["3_1"]` until `PRESETS["6_3"]` are available
- Alexander polynomial calculation using skein relation
- Alexander polynomial calculation using determinant
- Jones polynomial works
- HOMFLY polynomial uses the skein relation of (a L+) - (1/a L-) = z L0 as described [here](http://katlas.org/wiki/The_HOMFLY-PT_Polynomial)
- HOMFLY (l, z) polynomial tested against Wolfram MathWorld

These are tested on the sample knots given in the code, compared [here](http://katlas.org/wiki/The_Rolfsen_Knot_Table).

Other data sources for checking:
- [3_1](https://mathworld.wolfram.com/TrefoilKnot.html)
- [4_1](https://mathworld.wolfram.com/FigureEightKnot.html)
- [5_1](https://mathworld.wolfram.com/SolomonsSealKnot.html)
- (no source for 5_2)
- [6_1](https://mathworld.wolfram.com/StevedoresKnot.html)
- [6_2](https://mathworld.wolfram.com/MillerInstituteKnot.html)

TODO:
- Add feature for links (need to specify orientation)
- Fox n-coloring generator