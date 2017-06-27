import MTLLoader from './lib/loaders/MTLLoader';

let mtlLoader = new MTLLoader();

export default (path) => {
  return new Promise((resolve, reject) => {
    mtlLoader.load(path, resolve, () => {}, reject);
  });
};
