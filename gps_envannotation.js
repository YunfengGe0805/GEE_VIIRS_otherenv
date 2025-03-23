var aot = ee.ImageCollection('MODIS/061/MCD19A2_GRANULES')
  .filterDate('2023-01-01', '2023-01-31')
  .select('Optical_Depth_047')
  .mean();
var points = ee.FeatureCollection('projects/ee-yunfengge0805/assets/gee');

var extractData = function(feature) {
  var point = feature.geometry();
  // AOT Extraction
  var aotVal = aot
    .resample('bilinear') // Apply interpolation [4]
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: 1000, // Match dataset native resolution
      bestEffort: true
    }).get('Optical_Depth_047');
  
  // Repeat for chlorophyll and AOT with their respective scales
  // ...

  return feature.set({'AOT': aotVal});
};
 
var results = points.map(extractData);
Export.table.toDrive({
  collection: results,
  description: 'AOT',
  fileFormat: 'CSV',
  selectors: ['longitude','latitude','AOT']
});

// For daily extraction: Modified to extract daily AOD values based on point-specific timestamps

var aotCollection = ee.ImageCollection('MODIS/061/MCD19A2_GRANULES')
  .select('Optical_Depth_047');

var points = ee.FeatureCollection('projects/ee-yunfengge0805/assets/gee');

var extractDailyAOT = function(feature) {
  var point = feature.geometry();
  var date = ee.Date(feature.get('t'));
  
  // Create 3-day window to handle potential data gaps
  var dailyAOT = aotCollection
    .filterDate(date.advance(-1, 'day'), date.advance(1, 'day')) // ±1 day buffer
    .mean(); // If multiple images exist, take average. Use .first() for nearest
  
  var aotVal = dailyAOT
    .resample('bilinear')
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: 1000,
      bestEffort: true
    }).get('Optical_Depth_047');

  return feature.set({
    'AOT': aotVal,
    'query_date': date.format('YYYY-MM-dd') // For validation
  });
};

var results = points.map(extractDailyAOT);

Export.table.toDrive({
  collection: results,
  description: 'Daily_AOT',
  fileFormat: 'CSV',
  selectors: ['latitude', 'longitude', 't', 'query_date', 'AOT']
});
