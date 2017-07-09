import Sands from '../lib/cmp/Sands';
import Chart from '../lib/cmp/Chart';
import DataLoader from '../lib/cmp/DataLoader'
import state from '../lib/cmp/State';

import TWEEN from '@tweenjs/tween.js';
import MathBox from 'mathbox';
import _ from 'lodash';

const chartScale=[1.5,1,1.5];
const chartRange={
    x:[1850, 2300],
    y:[12, 24],
    z:[-5, 5]
}

const startYear = 1850
const endYear = 2300
const yearPerMinute = () => state.yearPerMinute || 25 // * 12 // 25=>18min
const secPerYear = () => 60/yearPerMinute();


export default class CMPController {

    constructor(renderer, scene, camera, options) {
        options = options || {};
        this.position = options.position || [0, 0, 0];
        this.rotation = options.rotation || [0, 0, 0];
        this.visible = true;
        this.scale = options.scale || chartScale;

        let self = this;
        this.context = new MathBox.Context(renderer, scene, camera);
        this.context.init();
        this.resize(renderer.domElement.width, renderer.domElement.height);

        this.loader = new DataLoader();
        this.loader.load().then((data) => {
            self._drawMathbox(data);
        });

        this.currRot = [0, 0, 0];
    }

    _drawMathbox(datas) {
        let data = datas.active;
        let mathbox = this.context.api;

        // Mathbox view
        var view = this.view;
        var view = mathbox.cartesian({
            range: [chartRange.x, chartRange.y, chartRange.z],
            scale: chartScale,
            position: this.position,
            rotation: this.rotation
        });

        this.gridView = view;

        var origin = {
            x: chartRange.x[0],
            y: chartRange.y[0],
            z: chartRange.z[0]
        };
        // var origin = {x:0, y:0, z:0};

        this._drawGrid(view, origin);
        this._drawCharts(data, view, origin);

        if(!state.hideLegend){
            // Draw year label
            view.array({
                id: 'label-year',
                data: [[
                    0.0 * chartRange.x[0] + 1.0 * chartRange.x[1],
                    1.3 * chartRange.y[1] + (-0.3) * chartRange.y[0],
                    chartRange.z[0]
                ]],
                channels: 3, // necessary
                live: true,
            }).text({
                id: 'label-year-text',
                data: ['Year'],
            }).label({
                color: 0xffffff,
                background: state.colors.bg,
                size: 36*3,
                depth: 1
            });

            var labelYearText = mathbox.select("#label-year-text")
        }

        this.update();
    }

    _drawCharts(data, view, origin) {

        let mathbox = this.context.api;
        var charts = {}
        this.charts = charts;

        // color gradient for temperature curve
        view.interval({
            id:'tempratureColor',
            width: state.numData,
            channels: 4,
            items: 1,
            live: true,
            expr: (emit, x, i, t)=>{
                var min = 13
                var max = 23
                var val = data.temperature[i]

                var r0 = 1 - (val-min) / (max-min) // Green percentage
                var r1 = 1 - r0

                var c0 = [0.1, 0.7, 1] // Blue
                var c1 = [1, 0.2, 0.1] // Red
                var r = r0*c0[0]+r1*c1[0]
                var g = r0*c0[1]+r1*c1[1]
                var b = r0*c0[2]+r1*c1[2]
                var a = 1.0-Math.pow(Math.sin(t*3), 16) + r0 + 0.2
                if (x > state.Year) a *= 0.0
                emit(r, g, b, a) // make it blink alarm at high temperature
            }
        })

        // line alpha for co2 and balance curve
        // controlling part of line this is visible to creating years marching forward effect
        view.interval({
            id:'lineAlpha',
            width: state.numData,
            channels: 4,
            items: 1,
            live: true,
            expr: (emit, x, i, t)=>{
                var a = x > state.Year ? 0.0 : 1.0
                emit(1, 1, 1, a) // make it blink alarm at high temperature
            }
        })

        charts['temperature'] = new Chart(mathbox, {
            position: this.position,
            view: view,
            data: this.loader.data,
            x : data.year,
            y : data['temperature'],
            z_offset : -5,
            id : 'temperature',
            xRange : chartRange.x,
            yRange : [12, 24],
            zRange : chartRange.z,
            scale : chartScale,
            // color : 0xffcc44,
            color : 0xffffff,
            dotColor : 0x44bbff,
            colors : '#tempratureColor',
            //labelSize : labelSize,
            lineWidth : state.tempLineWidth,
            labelFunc: (year, val)=>{
                //return [''+year+': '+val+'\u2103 increase']
                //var str = val+'\u2103 increase';
                var str = val+'\u2103';
                // $("#tempVal").html(""+val+"&deg;C");
                return [str]
            }
        })

        charts['balance'] = new Chart(mathbox, {
            position: this.position,
            view: view,
            data: this.loader.data,
            x : data.year,
            y : data['balance'],
            z_offset : 0,
            id : 'balance',
            xRange : chartRange.x,
            yRange : [-1, 8],
            zRange : chartRange.z,
            scale : chartScale,
            //color : 0x00ffff,
            color : 0x02ff7f,
            colors : '#lineAlpha',
            //labelSize : labelSize,
            lineWidth: state.balanceLineWidth,
            labelFunc: (year, val)=>{
                //return [''+year+': '+val+' energy balance']
                //str = val + 'balance';
                var str = ''+val;
                // $("#energyVal").html(str);
                return [str];
            }
        })

        charts['co2'] = new Chart(mathbox, {
            position: this.position,
            view: view,
            data: this.loader.data,
            x : data.year,
            y : data['co2'],
            z_offset : 5,
            id : 'co2',
            xRange : chartRange.x,
            yRange : [0, 2200],
            zRange : chartRange.z,
            scale : chartScale,
            color : 0xaf8f30,
            colors : '#lineAlpha',
            lineWidth : state.co2LineWidth,
            //labelSize : labelSize,
            labelFunc: (year, val)=>{
                //return [''+year+': '+val+'PPM increase']
                //var str = val+'PPM increase';
                var str = val+'PPM';
                // $("#co2Val").html(str);
                return [str];
            }
        })

        // draw sands
	    this.sands = new Sands(mathbox, {
            x : data.year,
            y : data['temperature'],
            z_offset : -10,
            id : 'sands',
            position: this.position,
            xRange : chartRange.x,
            yRange : [12, 24],
            zRrange : chartRange.z,
            scale : chartScale,
            // color : 0xffcc44,
            color : 0xffffff,
            colors : '#tempratureColor'
	    })
    }

    _drawGrid(view, origin) {
        const lineWidth = state.gridLineWidth;
        const alpha = 0.3;

        view
            .transform({
                position:[0, origin.y, 0]
            })
            .grid({
                axes: "zx",
                divideX: 4,
                divideY: 5,
                niceX: false,
                niceY: false,
                width: lineWidth,
            });

        view
            .transform({
                position:[2300, 0, 0]
            })
            .grid({
                axes: "yz",
                divideX: 4,
                divideY: 4,
                niceX: false,
                niceY: false,
                width: lineWidth,
            });

        this.play();
    }


    update(t) {
        TWEEN.update();
        if (this.charts) {
            let data = this.loader.data.active;
            let charts = this.charts;
            Object.keys(charts).forEach(id => {
                charts[id].update(data[id])
            });
            this.sands.update(data['temperature']);
        }

        // animate the graph
        this.currRot[1] += Math.PI*2/3600;
        if (this.currRot[1] > Math.PI*2) {
            this.currRot[1] -= Math.PI*2;
        }
        this.rotation = this.currRot;

        if (this.dirty) {
            this._updateMatrix();
        }

        this.context.frame();
    }

    resize(w, h) {
        this.context.resize({
            viewWidth: w, viewHeight: h
        });
    }

    // seek val 0 -> 1 : years 1850 -> 2300
    seek(val) {
        var start = startYear + parseInt(val*(endYear - startYear));
        var dur = (endYear - start)*(secPerYear());
        this._playHistory(dur, start, endYear)
    }

    play() {
        this.seek(0);
    }

    stop() {
        this._stopHistory();
    }

    _playHistory(_duration, _from, _to) {
        this._stopHistory()
        var duration = _duration || 120 // 2min
        var param = {y: _from}
        this.historyT1 = new TWEEN.Tween(param)
            .to({y:_to}, duration*1000)
            .onUpdate(()=>{
                state.SandYear = Math.round(param.y)
            })
            .start()

        var param1 = {y: _from}
        setTimeout(()=>{
            this.historyT2 = new TWEEN.Tween(param1)
                .to({y:_to}, duration*1000)
                .onUpdate(()=>{
                    state.Year = Math.round(param1.y)
                })
                .start()
        }, 4000)
    }

    _stopHistory() {
        TWEEN.remove(this.historyT1)
        TWEEN.remove(this.historyT2)
    }

    // array x,y,z [0, 0, 0]
    set position(pos) {
        // Some validation etc.
        this._position = pos;
        this.dirty = true;
    }

    get position() {
        return this._position || [0, 0, 0];
    }

    // array x,y,z [0, 0, 0]
    set rotation(pos) {
        // Some validation etc.
        this._rotation = pos;
        this.dirty = true;
    }

    get rotation() {
        return this._rotation || [0, 0, 0];
    }

    // array x,y,z [0, 0, 0]
    set scale(pos) {
        // Some validation etc.
        this._scale = pos;
        this.dirty = true;
    }

    get scale() {
        return this._scale || [1, 1, 1];
    }

    // array x,y,z [0, 0, 0]
    set visible(val) {
        this._visible = val;
        _.set(this, "context.scene.root.visible", val);
        (val) ? this.play() : this.stop();
    }

    get visible() {
        return this._visible;
    }

    _updateMatrix() {
        if (this.context) {
            let mathbox = this.context.api;
            mathbox.
                select('cartesian')
                .set('rotation', this._rotation)
                .set('position', this._position)
                .set('scale', this._scale);
        }
    }
}
