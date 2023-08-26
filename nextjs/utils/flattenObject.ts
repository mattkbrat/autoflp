import { AnyObject } from 'chart.js/dist/types/basic';

function flattenObject(ob: AnyObject): AnyObject {
  const toReturn: AnyObject = {};
  // const ports = ;

  for (const i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;
    if (typeof ob[i] === undefined || ob[i] === null || ob[i] === '') continue;

    if (typeof ob[i] == 'object') {
      const flatObject = flattenObject(ob[i]);

      for (const x in flatObject) {
        if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue;

        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

export default flattenObject;