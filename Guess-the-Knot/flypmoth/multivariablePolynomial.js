var MultivariablePolynomial = function(coeff, variables) {
    // Initialise the polynomial, given a map of coefficients indexed by tuples of powers, which strings separated by commas
    this.coeff = new Map(coeff);
    this.variables = variables.slice();
};
MultivariablePolynomial.prototype.clone = function(coeff, variables) {
    return new MultivariablePolynomial(this.coeff, this.variables);
};
MultivariablePolynomial.prototype.iadd = function(other) {
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
MultivariablePolynomial.prototype.isub = function(other) {
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
var addPowStrings = function(k1, k2) {
    k1 = k1.split(",");
    k2 = k2.split(",");
    return k1.map(function(v, i) { return (+v)+(+k2[i]); }).join(",");
};
//println(addPowStrings("1,2", "-2,4")==="-1,6");
/**
 * Multiplies the two multivariable polynomials. This function assumes same variables for this and other.
 */
MultivariablePolynomial.prototype.getProduct = function(other) {
    var coeff = new Map();
    this.coeff.forEach(function(v1, k1) {
        other.coeff.forEach(function(v2, k2) {
            var newPower = addPowStrings(k1, k2);
            var newCoeff = (coeff.get(newPower)||0)+v1*v2;
            if (newCoeff === 0) {
                coeff.delete(newPower);
            } else {
                coeff.set(newPower, newCoeff);
            }
        }, this);
    }, this);
    return new MultivariablePolynomial(coeff, this.variables);
};
MultivariablePolynomial.prototype.mul = function(other) {
    if (typeof other === "object") {
        return this.getProduct(other);
    } else if (typeof other === "number") {
        if (other === 0) {
            return new MultivariablePolynomial(undefined, this.variables);
        }
        var result = this.clone();
        result.coeff.forEach(function(v, k) {
            result.coeff.set(k, v*other);
        });
        return result;
    }
    // undefined behaviour
};
MultivariablePolynomial.prototype.rmul = function(other) {
    return this.mul(other);
};
MultivariablePolynomial.prototype.imul = function(other) {
    if (typeof other === "object") {
        var coeff = new Map();
        this.coeff.forEach(function(v1, k1) {
            other.coeff.forEach(function(v2, k2) {
                var newPower = addPowStrings(k1, k2);
                var newCoeff = (coeff.get(newPower)||0)+v1*v2;
                if (newCoeff === 0) {
                    this.coeff.delete(newPower);
                } else {
                    this.coeff.set(newPower, newCoeff);
                }
            }, this);
        }, this);
        this.coeff = coeff;
        return this;
    } else if (typeof other === "number") {
        if (other === 0) {
            return new MultivariablePolynomial(undefined, this.variables);
        } else {
            this.coeff.forEach(function(v, k) {
                this.coeff.set(k, v*other);
            }, this);
            return this;
        }
    }
    // undefined behaviour
};
MultivariablePolynomial.prototype.getSum = function(other) {
    var c = this.clone();
    return c.iadd(other);
};
MultivariablePolynomial.prototype.neg = function() {
    var c = this.clone();
    c.coeff.forEach(function(v, k) {
        c.coeff.set(k, -v);
    });
    return c;
};
MultivariablePolynomial.prototype.pos = function() {
    return this.clone();
};
MultivariablePolynomial.prototype.eq = function(other) {
    return this.toString() === other.toString();
};
MultivariablePolynomial.prototype.neq = function(other) {
    return this.toString() !== other.toString();
};
MultivariablePolynomial.prototype.radd = function(other) {
    if (typeof other === "object") {
        return this.getSum(other);
    } else if (typeof other === "number") {
        var result = this.clone();
        var constKey = ",0".repeat(this.variables.length).slice(1);
        var constant = (this.coeff.get(constKey)||0)+other;
        if (constant === 0) {
            result.coeff.delete(constKey);
        } else {
            result.coeff.set(constKey, constant);
        }
        return result;
    }
    // undefined behaviour
};
MultivariablePolynomial.prototype.add = function(other) {
    return this.radd(other);
};
MultivariablePolynomial.prototype.sub = function(other) {
    if (typeof other === "object") {
        return this.clone().isub(other);
    } else if (typeof other === "number") {
        return this.radd(-other);
    }
};
MultivariablePolynomial.prototype.rsub = function(other) {
    if (typeof other === "object") {
        return this.neg().iadd(other);
    } else if (typeof other === "number") {
        return this.neg().radd(other);
    }
    // undefined behaviour
};
MultivariablePolynomial.prototype.pow = function(other) {
    if (typeof other === "number" && other >= 0 && Number.isInteger(other)) {
        if (other === 0) {
            var constKey = ",0".repeat(this.variables.length).slice(1);
            return new MultivariablePolynomial(new Map([[constKey, 1]]), this.variables);
        } else if (other === 1) {
            return this.clone();
        } else if (other % 2 === 1) {
            return this.getProduct(this.getProduct(this).pow((other-1)/2));
        }
        return this.getProduct(this).pow(other/2);
    }
};
MultivariablePolynomial.prototype.call = function() {
    if (typeof x === "number") {
        var result = 0;
        this.coeff.forEach(function(v, k) {
            result += v * k.split(",").reduce(function(acc, cur, i) { return acc * Math.pow(arguments[i], +cur); }, 1);
        });
        return result;
    }
};
MultivariablePolynomial.prototype.clean = function() {
    var powers = Array.from(this.coeff.keys());
    powers.sort(); // string sort because I'm lazy
    var newCoeff = new Map();
    for (var i=0;i<powers.length;i++) {
        newCoeff.set(powers[i], this.coeff.get(powers[i]));
    }
    this.coeff = newCoeff;
};
MultivariablePolynomial.prototype.repr = function() {
    this.clean();
    var constructStr = "";
    this.coeff.forEach(function(v, k) {
        constructStr += ",["+k+","+v+"]";
    });
    return "new MultivariablePolynomial(new Map(["+constructStr.slice(1)+"]),["+this.variables+"])";
};
MultivariablePolynomial.prototype.toString = function() {
    var signStr = function(x) { if (x>=0) { return "+"+x; } return ""+x; };
    this.clean();
    var result = "";
    var constKey = ",0".repeat(this.variables.length).slice(1);
    this.coeff.forEach(function(v, k) {
        if (v === 0) {
            return;
        } else if (k === constKey) {
            result += signStr(v);
        } else {
            result += signStr(v);
            var negPow = "";
            k.split(",").forEach(function(v, i) {
                v = +v;
                if (v > 0) {
                    result += this.variables[i]+"^"+v;
                } else if (v < 0) {
                    negPow += this.variables[i]+"^"+(-v);
                }
            }, this);
            if (negPow) {
                result += "/"+negPow;
            }
        }
    }, this);
    return result || "0";
};