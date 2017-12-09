// https://github.com/shinout/SortedList/blob/master/SortedList.js
/**
 * SortedList : constructor
 */


// Damn... I hate to have to include this sort of junk.... /dgk
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if ( !Array.prototype.forEach ) {

    Array.prototype.forEach = function( callback, thisArg ) {

        var T, k;

        if ( this == null ) {
            throw new TypeError( " this is null or not defined" );
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0; // Hack to convert O.length to a UInt32

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if ( {}.toString.call(callback) != "[object Function]" ) {
            throw new TypeError( callback + " is not a function" );
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if ( thisArg ) {
            T = thisArg;
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while( k < len ) {

            var kValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if ( k in O ) {

                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[ k ];

                // ii. Call the Call internal method of callback with T as the this value and
                // argument list containing kValue, k, and O.
                callback.call( T, kValue, k, O );
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {

        var T, A, k;

        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if ({}.toString.call(callback) != "[object Function]") {
            throw new TypeError(callback + " is not a function");
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg) {
            T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len) where Array is
        // the standard built-in constructor with that name and len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while(k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[ k ];

                // ii. Let mappedValue be the result of calling the Call internal method of callback
                // with T as the this value and argument list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

                // For best browser support, use the following:
                A[ k ] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}


function SortedList() {
    var arr     = null,
        options = {},
        args    = arguments;

    ["0","1"].forEach(function(n) {
        var val = args[n];
        //if (Array.isArray(val)) {
        if (jQuery.isArray(val)) {
            arr = val;
        }
        else if (val && typeof val == "object") {
            options = val;
        }
    });

    if (typeof options.filter == 'function') {
        this._filter = options.filter;
    }

    if (typeof options.compare == 'function') {
        this._compare = options.compare;
    }
    else if (typeof options.compare == 'string' && SortedList.compares[options.compare]) {
        this._compare = SortedList.compares[options.compare];
    }

    this._unique = !!options.unique;

    if (options.resume && arr) {
        arr.forEach(function(v, i) { this.push(v) }, this);
    }
    else if (arr) this.insert.apply(this, arr);
};

/**
 * SortedList.create(val1, val2)
 * creates an instance
 **/
SortedList.create = function(val1, val2) {
    return new SortedList(val1, val2);
};


SortedList.prototype = new Array();
SortedList.prototype.constructor = Array.prototype.constructor;

/**
 * sorted.insertOne(val)
 * insert one value
 * returns false if failed, inserted position if succeed
 **/
SortedList.prototype.insertOne = function(val) {
    var pos = this.bsearch(val);
    if (this._unique && this.key(val, pos) != null) return false;
    if (!this._filter(val, pos)) return false;
    this.splice(pos+1, 0, val);
    return pos+1;
};

/**
 * sorted.insert(val1, val2, ...)
 * insert multi values
 * returns the list of the results of insertOne()
 **/
SortedList.prototype.insert = function() {
    return Array.prototype.map.call(arguments, function(val) {
        return this.insertOne(val);
    }, this);
};

/**
 * sorted.remove(pos)
 * remove the value in the given position
 **/
SortedList.prototype.remove = function(pos) {
    this.splice(pos, 1);
    return this;
}

/**
 * sorted.bsearch(val)
 * @returns position of the value
 **/
SortedList.prototype.bsearch = function(val) {
    if (!this.length) return -1;
    var mpos,
        spos = 0,
        epos = this.length;
    while (epos - spos > 1) {
        mpos = Math.floor((spos + epos)/2);
        var mval = this[mpos];
        var comp = this._compare(val, mval);
        if (comp == 0) return mpos;
        if (comp > 0)  spos = mpos;
        else           epos = mpos;
    }
    return (spos == 0 && this._compare(this[0], val) > 0) ? -1 : spos;
};

/**
 * sorted.key(val)
 * @returns first index if exists, null if not
 **/
SortedList.prototype.key = function(val, bsResult) {
    if (bsResult== null) bsResult = this.bsearch(val);
    var pos = bsResult;
    if (pos == -1 || this._compare(this[pos], val) < 0)
        return (pos+1 < this.length && this._compare(this[pos+1], val) == 0) ? pos+1 : null;
    while (pos >= 1 && this._compare(this[pos-1], val) == 0) pos--;
    return pos;
};

/**
 * sorted.key(val)
 * @returns indexes if exists, null if not
 **/
SortedList.prototype.keys = function(val, bsResult) {
    var ret = [];
    if (bsResult == null) bsResult = this.bsearch(val);
    var pos = bsResult;
    while (pos >= 0 && this._compare(this[pos], val) == 0) {
        ret.push(pos);
        pos--;
    }

    var len = this.length;
    pos = bsResult+1;
    while (pos < len && this._compare(this[pos], val) == 0) {
        ret.push(pos);
        pos++;
    }
    return ret.length ? ret : null;
};

/**
 * sorted.unique()
 * @param createNew : create new instance
 * @returns first index if exists, null if not
 **/
SortedList.prototype.unique = function(createNew) {
    if (createNew) return this.filter(function(v, k) {
        return k == 0 || this._compare(this[k-1], v) != 0;
    }, this);
    var total = 0;
    this.map(function(v, k) {
        if (k == 0 || this._compare(this[k-1], v) != 0) return null;
        return k - (total++);
    }, this)
        .forEach(function(k) {
            if (k != null) this.remove(k);
        }, this)
    return this;
};

/**
 * sorted.toArray()
 * get raw array
 **/
SortedList.prototype.toArray = function() {
    return this.slice();
};


/**
 * default filtration function
 **/
SortedList.prototype._filter = function(val, pos) {
    return true;
};


/**
 * comparison functions 
 **/
SortedList.compares = {
    "number": function(a, b) {
        var c = a - b;
        return (c > 0) ? 1 : (c == 0)  ? 0 : -1;
    },

    "string": function(a, b) {
        return (a > b) ? 1 : (a == b)  ? 0 : -1;
    }
};

/**
 * sorted.compare(a, b)
 * default comparison function
 **/
SortedList.prototype._compare = SortedList.compares["string"];
if (typeof exports == 'object' && exports === this) module.exports = SortedList;

export {SortedList};
