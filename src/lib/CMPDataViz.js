import Papa from 'papaparse';
import Sands from './cmp/Sands';
import Chart from './cmp/Chart';
import TWEEN from '@tweenjs/tween.js';
import state from './cmp/State';

const chartScale=[1.5,1,1.5];
const chartRange={
    x:[1850, 2300],
    y:[12, 24],
    z:[-5, 5]
}

class CMPDataLoader {

    load() {
        let dataFiles = ['./data/rcp8p5.csv', './data/rcp2p6.csv'];
        let self = this;

        return Promise.all(dataFiles.map(f => {
                return this.loadData(f);
            }))
            .then(data => {
                console.log("done data loading")
                var data = {
                    'rcp8p5': self.processData(data[0], state.numData),
                    'rcp2p6': self.processData(data[1], state.numData),
                    'active': self.processData(data[0], state.numData)
                }
                return data
            })
            .then(data => {
                const numPasses = 5
                for(var i = 0; i < numPasses; i++) {
                    data = self.smoothEnergyBalance(data);
                }
                self.data = data;
                return data
            });
    }

    applySmooth(data) {
        var len = data.length
        data[0] = (2*data[0] + data[1])/3.0
        data[len-1] = (2*data[len-1] + data[len-2])/3.0
        for (var i=1; i<len-1; i++){
            data[i] = (data[i-1]+data[i]+data[i+1])/3.0
        }
    }

    smoothEnergyBalance(data) {
        let self = this;
        Object.keys(data).forEach((key) => {
            self.applySmooth(data[key].balance)
        });
        return data;
    }

    loadData(file) {
        var promise = new Promise((resolve, reject) => {
            Papa.parse(file, {
                download: true,
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                error: (err) => {
                    reject(err);
                },
                complete:(results, file) => {
                    resolve(results.data);
                }
            });
        });
        return promise;
    }

    processData(data, numData) {
        var res = {
            year: [],
            temperature: [],
            co2: [],
            ice: [],
            balance: [],
            precipitation: []
        };

        for (var i = 0; i < numData; i++) {
            res.year.push(data[i].year);
            res.temperature.push(data[i].Temperature);
            res.co2.push(data[i].CO2Concentration);
            res.ice.push(data[i].SeaIceFraction);
            res.balance.push(data[i].EnergyBalance);
            res.precipitation.push(data[i].Precipitation);
        }

        return res;
    }

}


export default class CMPDataVis {

    constructor(renderer, scene, camera, options) {
        options = options || {};
        this.position = options.position || [0, 0, 0];
        this.rotation = options.rotation || [0, 0, 0];

        let self = this;
        this.context = new MathBox.Context(renderer, scene, camera);
        this.context.init();
        this.resize(renderer.domElement.width, renderer.domElement.height);

        this.loader = new CMPDataLoader();
        this.loader.load().then((data) => {
            self._drawMathbox(data);
        });
    }

    _drawMathbox(datas) {
        let data = datas.active;
        let mathbox = this.context.api;

        // Mathbox view
        var view = this.view;
        var view = mathbox.cartesian({
            range: [chartRange.x, chartRange.y, chartRange.z],
            scale: this.scale,
            position: this.position,
            rotation: this.rotation
        });

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
            z_offset : -10,
            id : 'temperature',
            xRange : chartRange.x,
            yRange : [12, 24],
            zRange : chartRange.z,
            scale : this.scale,
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
            z_offset : -5,
            id : 'balance',
            xRange : chartRange.x,
            yRange : [-1, 8],
            zRange : chartRange.z,
            scale : this.scale,
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
            z_offset : 0,
            id : 'co2',
            xRange : chartRange.x,
            yRange : [0, 2200],
            zRange : chartRange.z,
            scale : this.scale,
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
			scale : this.scale,
			// color : 0xffcc44,
			color : 0xffffff,
			colors : '#tempratureColor'
	    })
    }

    _drawGrid(view, origin) {
        const lineWidth = state.gridLineWidth;
        const alpha = 0.3;

        view
        //.transform({ position: this.position })
        .transform({
            position:[0, origin.y, origin.z]
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
        //.transform({ position: this.position })
        .transform({
            position:[2300, 0, origin.z]
        })
        .grid({
            axes: "yz",
            divideX: 4,
            divideY: 4,
            niceX: false,
            niceY: false,
            width: lineWidth,
        });

        this.startHistory();
    }


    update() {
		TWEEN.update();
        if (this.charts) {
            let data = this.loader.data.active;
            let charts = this.charts;
            Object.keys(charts).forEach(id => {
                charts[id].update(data[id])
            });
            this.sands.update(data['temperature']);
        }
        this.context.frame();
    }

    resize(w, h) {
        this.context.resize({
            viewWidth: w, viewHeight: h
        });
    }

    startHistory() {
        var startYear = 1850
        var year_per_minute = state.yearPerMinute || 25 // * 12 // 25=>18min
        var endYear = 2300

        function yearsToSec(year, year_per_minute) {
            var sec_per_year = 60/year_per_minute
            return (year-startYear) * sec_per_year
        }

        this.playHistory(yearsToSec(endYear, year_per_minute), startYear, endYear)
    }

    playHistory(_duration, _from, _to) {
        this.stopHistory()
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

    stopHistory() {
        TWEEN.remove(this.historyT1)
        TWEEN.remove(this.historyT2)
    }
}
