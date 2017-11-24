
// This is responsible for creating the top level MUSE object
// and putting it in the window namespace if we are in browser.
//
// Mose "end users" will use MUSE by just importing MUSE.
// MUSE will be a convenience that imports many core modules
// and attaches those classes and vars to MUSE.   But those
// classes should not count on just importing MUSE to getTime
// all class definitions, as there could be a circular reference
// problem.   Instead they should import MUSEBase, then explicitly
// importing the modules they depend on.


if (MUSE) {
    alert("MUSE already defined - MUSEBase should be first import");
}
else {
    var MUSE = {};
}

if (window)
    window.MUSE = MUSE;

MUSE.returnValue = function(val)
{
    console.log("MUSE.returnValue "+val);
    window.MUSE.RETURN = val;
}

// This can be used to ensure that some other scripts are loaded before
// a function is called and returns a value.
MUSE.require = function(deps, done) {
    if (typeof deps == "string") {
        deps = [deps];
    }
    var promises = deps.map(url => $.getScript(url));
    window.PROMISES = promises;
    MUSE.RETURN_PROMISE = Promise.all(promises).then(() => {
        console.log("***************>>>>>>>>>>>>>>>>>>> Loaded all of "+deps);
        done();
        console.log("got value "+MUSE.RETURN);
        //MUSE.RETURN = val;
    });
}

export {MUSE};
