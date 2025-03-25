// 加载MODIS数据集
var modis = ee.ImageCollection('MODIS/061/MCD19A2_GRANULES').select('Optical_Depth_047');

// 筛选2023年的数据
var modis2023 = modis.filterDate('2023-01-01', '2023-03-31');


// 加载CSV文件
var csvData = ee.FeatureCollection('projects/ee-yunfengge0805/assets/gee');

//var date = ee.Date(csvData.get(0).get('t'));
//print(date)


// 定义一个函数来提取每个点的值
var extractValues = function(feature) {
  var geometry = feature.geometry();
  var date = ee.Date(feature.get('t'));
  //var formattedDate = date.format('yyyy-MM-dd');

  // 筛选对应日期的MODIS图像
  //var image = modis2023.filterDate('2023-01-03', '2023-01-31').first();
  var image = modis2023.filterDate(date, date.advance(5, 'day')).mosaic();
  
  // 提取值
  var values = image.resample('bilinear').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 1000,
    bestEffort: true
  }).get('Optical_Depth_047');
  
  var coordinates = feature.geometry().coordinates();
  var latitude = coordinates.get(1); // Latitude (index 1)
  var longitude = coordinates.get(0); // Longitude (index 0)
  // 添加提取的值到特征
   return feature.set({
    'AOT': values,
    'lat': latitude,
    'long': longitude,
    't': date
  });
};



// 应用函数到所有特征
var extractedData = csvData.map(extractValues);
print(extractedData)
 // 导出结果为CSV
Export.table.toDrive({
   collection: extractedData,
   description: 'extracted_modis_values',
   fileFormat: 'CSV',
   selectors: ['long','lat', 't', 'AOT']
 });