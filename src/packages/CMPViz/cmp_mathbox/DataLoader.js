import Papa from 'papaparse';
import state from './State';

export default class DataLoader {

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