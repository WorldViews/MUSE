import Papa from 'papaparse';

const numData = 451;
var Year = 0;

var paramsDefault = {
    labelSize: 60,
    gridLineWidth: 5,
    chartGridLineWidth: 3,
    envelopeLineWidth: 3,
    refLineWidth: 3,
    co2LineWidth: 20,
    tempLineWidth: 60,
    balanceLineWidth: 30,
    hideLegend: false,
    showPanel: true,
    showGraphics: true,
    showVideo: false,

    colors: {
        x: '#FF4136',
        y: '#2ECC40',
        z: '#0074D9',
        bg: '#303025',
        // bg: '#FFFFFF'
    },

    capturer: {
        name: 'climate-trend',
        width: 3840,
        height: 2160,
        framerate: 30,
        format: 'png',
        timeLimit: 1200,
        startTime: 0,
        autoSaveTime: 60,
        display: true,
        reset: true
    }
}

class  CMPData {

    load() {
        let dataFiles = ['./data/rcp8p5.csv', './data/rcp2p6.csv'];
        let self = this;

        return Promise.all(dataFiles.map(f => {
                return this.loadData(f);
            }))
            .then(data => {
                console.log("done data loading")
                var data = {
                    'rcp8p5': self.processData(data[0], numData),
                    'rcp2p6': self.processData(data[1], numData),
                    'active': self.processData(data[0], numData)
                }
                window._data = data
                return data
            })
            .then(data => {
                const numPasses = 5
                for(var i = 0; i < numPasses; i++) {
                    data = self.smoothEnergyBalance(data);
                }
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

    constructor(renderer, scene, camera) {
        let self = this;
        this.context = new MathBox.Context(renderer, scene, camera);
        this.context.init();

        this.data = new CMPData();
        this.data.load().then((data) => {
            self.drawMathbox(data);
        });

        window.camera = camera;
        window.scene = scene;
        window.renderer = renderer;
        window.THREE = THREE;

        camera.position.set(-3.5, .4, 1.3);


        // this.loadDataViz().then((data) => {
        //     self.drawMathbox(data);
        // });
    }

    drawMathbox(datas) {
        const chartScale=[1.5,1,1.5];
        const chartRange={
            x:[1850, 2300],
            y:[12, 24],
            z:[-5, 5]
        }

        let data = datas.active;
        let mathbox = this.context.api;

        // Mathbox view
        var view = mathbox.cartesian({
            range: [chartRange.x, chartRange.y, chartRange.z],
            scale: chartScale,
        });

        var origin = {
            x: chartRange.x[0],
            y: chartRange.y[0],
            z: chartRange.z[0]
        };
        // var origin = {x:0, y:0, z:0};

        this.drawGrid(view, origin);

        // color gradient for temperature curve
        view.interval({
            id:'tempratureColor',
            width: numData,
            channels: 4,
            items: 1,
            live: true,
            expr: (emit, x, i, t)=>{
                var min = 13
                var max = 23
                var val = _data.active.temperature[i]

                var r0 = 1 - (val-min) / (max-min) // Green percentage
                var r1 = 1 - r0

                var c0 = [0.1, 0.7, 1] // Blue
                var c1 = [1, 0.2, 0.1] // Red
                var r = r0*c0[0]+r1*c1[0]
                var g = r0*c0[1]+r1*c1[1]
                var b = r0*c0[2]+r1*c1[2]
                var a = 1.0-Math.pow(Math.sin(t*3), 16) + r0 + 0.2
                if (x > Year) a *= 0.0
                emit(r, g, b, a) // make it blink alarm at high temperature
            }
        })

        // color gradient for co2 curve
        view.interval({
            id:'co2Color',
            width: numData,
            channels: 4,
            items: 1,
            live: true,
            expr: (emit, x, i, t)=>{
                var a = x > Year ? 0.0 : 1.0
                emit(1, 1, 1, a) // make it blink alarm at high temperature
            }
        })
    }

    drawGrid(view, origin) {
        const lineWidth = 1
        const alpha = 0.3

        view.transform({
            position:[0, origin.y, origin.z]
        })
        .grid({
            axes: "zx",
            divideX: 4,
            divideY: 5,
            niceX: false,
            niceY: false,
            width: lineWidth
        });

        view.transform({
            position:[2300, 0, origin.z]
        })
        .grid({
            axes: "yz",
            divideX: 4,
            divideY: 4,
            niceX: false,
            niceY: false,
            width: lineWidth
        });
    }

    drawAxis(view, origin) {
        var xticks = 6

        // X axis
        view.transform({
            position:[0, origin.y, origin.z]
        })
        .axis({
            axis: "x", // year
            end: true,
            width: 6,
            depth: 1,
            color: new THREE.Color(params.colors.x),
            opacity: 1.0,
        })

        view.scale({
            divide: 5,
            nice: false,
            origin: [1850, 12, 0, 0],
            axis: "x"
        })
        .ticks({
            classes: ['foo', 'bar'],
            width: 20
        })
        .text({
            live: false,
            data: interpolate(chartRange.x[0], chartRange.x[1], 6)
        })
        .label({
            color: 0xaaaaaa,
            background: params.colors.bg,
            size: 36,
            snap: false,
            depth: 1
            // offset: [1,1]
        })

        // Y axis
        view.transform({
            position:[origin.x, 0, origin.z]
        })
        .axis({
            axis: "y",
            end: true,
            width: 3,
            depth: 1,
            color: new THREE.Color(params.colors.y),
            opacity: .5,
        })

        // Z axis
        view.transform({
            position: [origin.x, origin.y, ]
        })
        .axis({
            axis: "z",
            end: true,
            width: 3,
            depth: 1,
            color: new THREE.Color(params.colors.z),
            opacity: .5,
        });

        // XyZ labela
        view.array({
            id: "colors",
            live: false,
            data: [new THREE.Color(params.colors.x), new THREE.Color(params.colors.y), new THREE.Color(params.colors.z)].map(function (color){
                return [color.r, color.g, color.b, 1];
            }),
        });

        view.array({
            data: [[2350,origin.y,origin.z], [1850,25,0], [1850,12,10]],
            channels: 3, // necessary
            live: false,
        }).text({
            data: ["year", "y", "z"],
        }).label({
            color: 0xaaaaaa,
            background: params.colors.bg,
            size: 48,
            depth: 1
        });
    }

    update() {
        this.context.frame();
    }

    resize(w, h) {
        this.context.resize({
            viewWidth: w, viewHeight: h
        });
    }
}
