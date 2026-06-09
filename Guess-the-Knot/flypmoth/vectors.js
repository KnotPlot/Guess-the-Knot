var Vectors = {
    sub: function(a, b) { return [a[0]-b[0], a[1]-b[1]]; },
    dot: function(a, b) { return a[0]*b[0]+a[1]*b[1]; },
    cross: function(a, b) { return a[0]*b[1]-a[1]*b[0]; },
    ccw: function(a, b, c) { return Vectors.cross(Vectors.sub(b, a), Vectors.sub(c, b)) > 0; },
    dist2: function(a, b) { return (a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]); },
    roundVec: function(a, b) { return [Math.round(a[0]), Math.round(a[1])]; },
    dist: function(a, b) { return Math.sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1])); },
    // Calculates closest point to line
    closestPoint: function(pt, lineStart, lineStop) {
        var vec = Vectors.sub(lineStop, lineStart);
        var relPt = Vectors.sub(pt, lineStart);
        var dprod = Vectors.dot(relPt, vec);
        var vecLenSq = Vectors.dot(vec, vec);
        if (0 <= dprod && dprod <= vecLenSq) {
            return [lineStart[0]+dprod*vec[0]/vecLenSq, lineStart[1]+dprod*vec[1]/vecLenSq];
        }
        if (Vectors.dist(lineStart, pt)<=Vectors.dist(lineStop, pt)) {
            return lineStart;
        }
        return lineStop;
    },
    // Calculates distance from point to line segent
    distToLine: function(pt, lineStart, lineStop) {
        var vec = Vectors.sub(lineStop, lineStart);
        var relPt = Vectors.sub(pt, lineStart);
        var dprod = Vectors.dot(relPt, vec);
        var vecLenSq = Vectors.dot(vec, vec);
        if (0 <= dprod && dprod <= vecLenSq) {
            var closePt = [lineStart[0]+dprod*vec[0]/vecLenSq, lineStart[1]+dprod*vec[1]/vecLenSq];
            return Vectors.dist(closePt, pt);
        }
        return Math.min(Vectors.dist(lineStart, pt), Vectors.dist(lineStop, pt));
    },
    // Calculates unit vector from a1 to a2
    unit: function(a1, a2) {
        var vec = Vectors.sub(a2, a1);
        var d = Vectors.dist(a1, a2);
        return [vec[0]/d, vec[1]/d];
    },
    // Calculates intersection point of line formed by a1, a2 and line formed by b1, b2
    intersect: function(a1, a2, b1, b2) {
        var d1 = Vectors.cross(a1, a2);
        var d2 = Vectors.cross(b1, b2);
        var denom = (a1[0]-a2[0])*(b1[1]-b2[1])-(a1[1]-a2[1])*(b1[0]-b2[0]);
        if (denom === 0) { return null; }
        return [(d1*(b1[0]-b2[0])-(a1[0]-a2[0])*d2)/denom, (d1*(b1[1]-b2[1])-(a1[1]-a2[1])*d2)/denom];
    },
    // Calculates intersection point of line segments formed by [a1, a2] and [b1, b2]
    intersectSegments: function(a1, a2, b1, b2) {
        var pt = Vectors.intersect(a1, a2, b1, b2);
        if (pt === null) { return null; }
        // ccw checks for other line segment going from ccw to cw of this line segment
        if (Vectors.ccw(a1, b2, a2) !== Vectors.ccw(a1, b1, a2) &&
            Vectors.ccw(b1, a2, b2) !== Vectors.ccw(b1, a1, b2)) {
            return pt;
        }
        return null;
    },
};

(function() {
    var test = false;
    if (test) {
        console.log(Vectors.closestPoint([0, 0], [-1, 1], [1, 1])); // [0, 1]
        console.log(Vectors.closestPoint([2, 2], [-1, 1], [1, 1])); // [1, 1]
        console.log(Vectors.closestPoint([-2, -2], [-1, 1], [1, 1])); // [-1, 1]
        console.log(Vectors.distToLine([0, 0], [-1, 1], [1, 1])) // 1
        console.log(Vectors.distToLine([2, 2], [-1, 1], [1, 1])); // sqrt2
        console.log(Vectors.distToLine([-2, -2], [-1, 1], [1, 1])); // sqrt10
    }
})();
