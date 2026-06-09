var LaurentPolynomial = function(coeff) {
    this.coeff = new Map(coeff);
};
LaurentPolynomial.prototype.clone = function() {
    return new LaurentPolynomial(this.coeff);
};
LaurentPolynomial.prototype.iadd = function(other) {
    other.coeff.forEach(function(v, k) {
        var coeff = (this.coeff.get(k)||0)+v;
        if (coeff === 0) {
            this.coeff.delete(k);
        } else {
            this.coeff.set(k, coeff);
        }
    }, this);
    return this;
};
LaurentPolynomial.prototype.isub = function(other) {
    other.coeff.forEach(function(v, k) {
        var coeff = (this.coeff.get(k)||0)-v;
        if (coeff === 0) {
            this.coeff.delete(k);
        } else {
            this.coeff.set(k, coeff);
        }
    }, this);
    return this;
};
LaurentPolynomial.prototype.getProduct = function(other) {
    var coeff = new Map();
    this.coeff.forEach(function(v1, k1) {
        other.coeff.forEach(function(v2, k2) {
            var newCoeff = (coeff.get(k1+k2)||0)+v1*v2;
            if (newCoeff === 0) {
                coeff.delete(k1+k2);
            } else {
                coeff.set(k1+k2, newCoeff);
            }
        }, this);
    }, this);
    return new LaurentPolynomial(coeff);
};
LaurentPolynomial.prototype.mul = function(other) {
    if (typeof other === "object") {
        return this.getProduct(other);
    } else if (typeof other === "number") {
        if (other === 0) {
            return new LaurentPolynomial();
        }
        var result = this.clone();
        result.coeff.forEach(function(v, k) {
            result.coeff.set(k, v*other);
        });
        return result;
    }
    // undefined behaviour
};
LaurentPolynomial.prototype.rmul = function(other) {
    return this.mul(other);
};
LaurentPolynomial.prototype.imul = function(other) {
    if (typeof other === "object") {
        var coeff = new Map();
        this.coeff.forEach(function(v1, k1) {
            other.coeff.forEach(function(v2, k2) {
                var newCoeff = (coeff.get(k1+k2)||0)+v1*v2;
                if (newCoeff === 0) {
                    this.coeff.delete(k1+k2);
                } else {
                    this.coeff.set(k1+k2, newCoeff);
                }
            }, this);
        }, this);
        this.coeff = coeff;
        return this;
    } else if (typeof other === "number") {
        if (other === 0) {
            return new LaurentPolynomial();
        }
        this.coeff.forEach(function(v, k) {
            this.coeff.set(k, v*other);
        }, this);
        return this;
    }
};
LaurentPolynomial.prototype.getSum = function(other) {
    return this.clone().iadd(other);
};
LaurentPolynomial.prototype.neg = function(other) {
    var c = this.clone();
    c.coeff.forEach(function(v, k) {
        c.coeff.set(k, -v);
    });
    return c;
};
LaurentPolynomial.prototype.pos = function(other) {
    return this.clone();
};
LaurentPolynomial.prototype.eq = function(other) {
    return this.toString() === other.toString();
};
LaurentPolynomial.prototype.ne = function(other) {
    return this.toString() !== other.toString();
};
LaurentPolynomial.prototype.radd = function(other) {
    if (typeof other === "object") {
        return this.getSum(other);
    } else if (typeof other === "number") {
        var result = this.clone();
        var constant = (this.coeff.get(0)||0)+other;
        if (constant === 0) {
            result.coeff.delete(0);
        } else {
            result.coeff.set(0, constant);
        }
        return result;
    }
    // undefined behaviour
};
LaurentPolynomial.prototype.add = function(other) {
    return this.radd(other);
};
LaurentPolynomial.prototype.sub = function(other) {
    if (typeof other === "object") {
        return this.clone().isub(other);
    } else if (typeof other === "number") {
        return this.radd(-other);
    }
    // undefined behaviour
};
LaurentPolynomial.prototype.rsub = function(other) {
    if (typeof other === "object") {
        return this.neg().iadd(other);
    } else if (typeof other === "number") {
        return this.neg().radd(other);
    }
    // undefined behaviour
};
LaurentPolynomial.prototype.truediv = function(other) {
    if (typeof other === "object") {
        var remainder = this.clone();
        var quotient = new LaurentPolynomial();
        var powers = Array.from(remainder.coeff.keys());
        var maxPower = powers.reduce(function(a, b) { return Math.max(a, b); });
        var minPower = powers.reduce(function(a, b) { return Math.min(a, b); });
        var divisorPowers = Array.from(other.coeff.keys());
        divisorPowers.sort(function(a, b) { return a-b; });
        var divMaxPower = divisorPowers[divisorPowers.length-1];
        if (divisorPowers.length === 0) { return; }
        for (var p=maxPower;p>=minPower;p-=1) {
            var times = (remainder.coeff.get(p)||0)/other.coeff.get(divMaxPower);
            if (times === 0) { continue; }
            quotient.set(p-divMaxPower, times);
            for (var j=0;j<divisorPowers.length;j++) {
                var i = divisorPowers[j];
                var coeff = (remainder.coeff.get(p-divMaxPower+i)||0)-times*other.coeff.get(i);
                if (coeff === 0) {
                    remainder.coeff.delete(p-divMaxPower+i);
                } else {
                    remainder.coeff.set(p-divMaxPower+i, coeff);
                }
            }
        }
        if (Array.from(remainder.coeff.keys()).length === 0) {
            return quotient;
        }
    }
};
/**
 * Raises a polynomial to the power of a number.
 */
LaurentPolynomial.prototype.pow = function(other) {
    if (typeof other === "number" && other >= 0 && Number.isInteger(other)) {
        if (other === 0) {
            return new LaurentPolynomial([[0, 1]]);
        } else if (other === 1) {
            return this.clone();
        } else if (other % 2 === 1) {
            return this.getProduct(this.getProduct(this).pow((other-1)/2));
        }
        return this.getProduct(this).pow(other/2);
    }
};
LaurentPolynomial.prototype.call = function(x) {
    if (typeof x === "number") {
        var result = 0;
        this.coeff.forEach(function(v, k) {
            result += v * Math.pow(x, k);
        });
        return result;
    }
};
LaurentPolynomial.prototype.clean = function() {
    var powers = Array.from(this.coeff.keys());
    powers.sort(function(a, b) { return a-b; });
    var newCoeff = new Map();
    for (var i=0;i<powers.length;i++) {
        newCoeff.set(powers[i], this.coeff.get(powers[i]));
    }
    this.coeff = newCoeff;
};
LaurentPolynomial.prototype.repr = function() {
    this.clean();
    var constructStr = "";
    this.coeff.forEach(function(v, k) {
        constructStr += ",["+k+","+v+"]";
    });
    return "new LaurentPolynomial(new Map(["+constructStr.slice(1)+"]))";
};
LaurentPolynomial.prototype.toString = function() {
    var signStr = function(x) { if (x>=0) { return "+"+x; } return ""+x; };
    this.clean();
    var result = "";
    this.coeff.forEach(function(v, k) {
        if (v === 0) {
            return;
        } else if (k === 0) {
            result += signStr(v);
        } else if (k === 1) {
            result += signStr(v)+"x";
        } else if (k === -1) {
            result += signStr(v)+"/x";
        } else if (k > 0) {
            result += signStr(v)+"x^"+k;
        } else if (k < 0) {
            result += signStr(v)+"/x^"+(-k);
        }
    });
    return result || "0";
};

(function() {
    var test = false;
    if (test) {
        var a = new LaurentPolynomial([[0, 1]]);
        var b = new LaurentPolynomial([[1, 1]]);
        var c = a.add(b);
        var d = new LaurentPolynomial([[-1, 1]]);
        console.log(a.toString() === "+1");
        console.log(b.toString() === "+1x");
        console.log(c.toString() === "+1+1x");
        console.log(d.toString() === "+1/x");
        console.log(a.add(b).pow(3).toString() === "+1+3x+3x^2+1x^3");
        console.log(a.add(d).pow(3).toString() === "+1/x^3+3/x^2+3/x+1");
        console.log(d.add(b).pow(3).toString() === "+1/x^3+3/x+3x+1x^3");
        console.log(a.eq(eval(a.repr())));
        console.log(b.eq(eval(b.repr())));
        console.log(c.eq(eval(c.repr())));
        console.log(d.eq(eval(d.repr())));
    }
})();