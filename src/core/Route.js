
var ROUTES = [];

class RouteObject
{
        constructor(src, dst, fun) {
            console.log("Route "+src+" "+dst);
            fun = fun || (v => v);
            this.src = src;
            this.dst = dst;
            this.fun = fun;
            game.state.on(src, v => {
                game.state.set(dst, fun(v));
            });
            ROUTES.push(this);
        }
}

function Route(src, dst, fun) {
    return new RouteObject(src, dst, fun);
}

window.Route = Route;

export {RouteObject, Route, ROUTES};
