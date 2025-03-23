var dataset = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG')
                  .filter(ee.Filter.date('2024-03-01', '2024-04-01'));
var nighttime = dataset.select('avg_rad').mean();
//var nighttimeVis = {min: 0.0, max: 60.0};
//Map.setCenter(120.39,36.12, 8);
//Map.addLayer(nighttime, nighttimeVis, 'Nighttime');
var geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[88, 42],
          [88, -15],
          [155, -15],
          [155, 42]]], null, false);
Export.image.toDrive({
  image: nighttime,
  description: '202403',
  folder: 'VIIRSALAN',
  region: geometry,
  scale: 463.83,
  maxPixels: 1e10
});