/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var sentinel = ee.ImageCollection("COPERNICUS/S2"),
    Kiambu = ee.FeatureCollection("users/vctrchirchir/Kiambu"),
    VisParam = {"opacity":1,"bands":["B4","B3","B2"],"min":538.82,"max":3698.18,"gamma":1},
    NDVIparam = {"opacity":1,"bands":["B8"],"min":0.031962413229048255,"max":0.6560095382109284,"palette":["ff4117","ff8911","f3ff23","66ff25"]},
    NDBIparam = {"opacity":1,"bands":["B11"],"min":-0.18556225687265396,"max":0.22221272081136703,"palette":["39ff13","fff721","ff5321"]},
    NDWIparam = {"opacity":1,"bands":["B8"],"min":-0.1666096889972687,"max":0.30476747393608095,"palette":["ffc82f","72ff37","1d30ff"]},
    L8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA"),
    L8RGB = {"opacity":1,"bands":["B4","B3","B2"],"min":0.07682543829083442,"max":0.21962867096066474,"gamma":1},
    L8NDVI = {"opacity":1,"bands":["B5"],"min":0.38219940721988677,"max":0.6374527508020401,"palette":["ff390e","ff9a33","fff60e","7cff17"]},
    L8NDBI = {"opacity":1,"bands":["B6"],"min":-0.3743756645917892,"max":0.16053151428699494,"palette":["9eff1b","ffed21","ffb91f","ff5c1f"]},
    L8NDWI = {"opacity":1,"bands":["B5"],"min":-0.12005251824855805,"max":0.33306762754917146,"palette":["ff9f11","ffed1d","19ffb4","190cff"]};
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var locations= {
  Gatundu_North: Kiambu.filter(ee.Filter.inList('subcounty',['Gatundu North'])),
  Gatundu_South: Kiambu.filter(ee.Filter.inList('subcounty',['Gatundu South'])),
  Githunguri: Kiambu.filter(ee.Filter.inList('subcounty',['Githunguri'])),
  Juja: Kiambu.filter(ee.Filter.inList('subcounty',['Juja'])),
  Kabete: Kiambu.filter(ee.Filter.inList('subcounty',['Kabete'])),
  Kiambaa: Kiambu.filter(ee.Filter.inList('subcounty',['Kiambaa'])),
  Kiambu: Kiambu.filter(ee.Filter.inList('subcounty',['Kiambu'])),
  Kikuyu: Kiambu.filter(ee.Filter.inList('subcounty',['Lari'])),
  Limuru: Kiambu.filter(ee.Filter.inList('subcounty',['Limuru'])),
  Ruiru: Kiambu.filter(ee.Filter.inList('subcounty',['Ruiru'])),
  Thika_Town: Kiambu.filter(ee.Filter.inList('subcounty',['Thika Town']))
};

var indices={
  TrueColor:'True Color',
  NDVI:'ndvi',
  NDBI:'ndbi',
  NDWI:'ndwi'
}

var start=ee.Image(L8.first()).date().get('year').format();
var now=Date.now();
var end=ee.Date(now).format()

var selectLocation=ui.Select({
  placeholder:'Select A subcounty',
  items:Object.keys(locations),
  onChange:function(key){
    Map.clear()
    Map.centerObject(locations[key])
    Map.addLayer(locations[key])
  }
})

var selectIndices=ui.Select({
  placeholder:'Select An Index or True Colur',
  items:Object.keys(indices)
})
//function for calculating indices
function calcIndex(a,b){
  return (a.subtract(b).divide)(a.add(b));
}
var dateRange=ee.DateRange(start,end).evaluate(function(range){
  var dateSlider=ui.DateSlider({
    start:range['dates'][0],
    end:range['dates'][1],
    value:range['dates'][1],
    period:180,
    onChange:task
  });
  print(dateSlider.setValue(now));
})
var task=function(range){
  var roi=locations[selectLocation.getValue()]
  var data=L8.filterDate(range.start(),range.end()).filterBounds(roi).sort('CLOUD_COVER').first();
  print(data)
  var clip=data.clip(roi);
  
  
  
  switch(selectIndices.getValue()){
    case 'TrueColor':
      Map.clear()
      Map.addLayer(clip,L8RGB,'True Color '+selectLocation.getValue())
      break;
    case 'NDVI':
      Map.clear();
      Map.addLayer(calcIndex(clip.select('B5'),clip.select('B4')),L8NDVI,'NDVI For '+selectLocation.getValue())
      break;
    case 'NDBI':
      Map.clear();
      Map.addLayer(calcIndex(clip.select('B6'),clip.select('B5')),L8NDBI,'NDBI For '+selectLocation.getValue())
      break;
    case 'NDWI':
      Map.clear();
      Map.addLayer(calcIndex(clip.select('B5'),clip.select('B6')),L8NDWI,'NDWI For '+selectLocation.getValue())
      break;
  }
};



print(selectLocation);
print(selectIndices);
