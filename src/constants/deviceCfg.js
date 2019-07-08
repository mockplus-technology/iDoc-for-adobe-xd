const IOS = [
  { name: 'iOS @1x', value: 'ios1x', sliceScale: 4, artboardScale: 1, },
  { name: 'iOS @2x', value: 'ios2x', sliceScale: 2, artboardScale: 1, },
  { name: 'iOS @3x', value: 'ios3x', sliceScale: 4 / 3, artboardScale: 1, }
];

const Android = [
  { name: 'Android mdpi', value: 'mdpi', sliceScale: 4, artboardScale: 1, },
  { name: 'Android hdpi', value: 'hdpi', sliceScale: 4 / 1.5, artboardScale: 1, },
  { name: 'Android xhdpi', value: 'xhdpi', sliceScale: 4 / 2, artboardScale: 1 },
  { name: 'Android xxhdpi', value: 'xxhdpi', sliceScale: 4 / 3, artboardScale: 1, },
  { name: 'Android xxxhdpi', value: 'xxxhdpi', sliceScale: 1, artboardScale: 1, },
];

const Web = [
  { name: 'Web @1x', value: 'Web1x', sliceScale: 2, artboardScale: 1, },
  { name: 'Web @2x', value: 'Web2x', sliceScale: 1, artboardScale: 1, },
];


const all = function() {
  const lst = [...IOS,'-',...Android,'-',...Web];
  return lst;
  // return IOS.concat(Android,Web);
};

module.exports = {
  IOS,
  Android,
  Web,
  all,
};