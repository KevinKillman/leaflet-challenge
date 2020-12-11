var base_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/"
var endpoints = ["all_month.geojson",
                "1.0_month.geojson",
                "2.5_month.geojson",
                "4.5_month.geojson"]
var plates_url = "static/js/plates.json";



function buildLayer(featureArray){
    var circlesGroup = [];
    if (d3.extent(featureArray.map(feature => feature.geometry.coordinates[2]))[1] > 100) {
        var gradientScaleRed = d3.scaleLinear().domain([0, 100]).range([0,255])
        var gradientScaleGreen = d3.scaleLinear().domain([0, 100]).range([255,0])
    }else {
        var gradientScaleRed = d3.scaleLinear().domain(d3.extent(featureArray.map(feature => feature.geometry.coordinates[2]))).range([0,255])
        var gradientScaleGreen = d3.scaleLinear().domain(d3.extent(featureArray.map(feature => feature.geometry.coordinates[2]))).range([255,0])
    }
    var gradientScaleMagnitude = d3.scaleLinear().domain(d3.extent(featureArray.map(feature => feature.properties.mag))).range([15000, 30000])
    // console.log(d3.extent(featureArray.map(feature => feature.properties.mag)));
    featureArray.forEach(feature => {
        var coords = feature.geometry.coordinates
        circlesGroup.push(L.circle([coords[1], coords[0]], {
            color: `rgb(${gradientScaleRed(feature.geometry.coordinates[2])}, ${gradientScaleGreen(feature.geometry.coordinates[2])}, 0)`,
            stroke: false,
            radius: gradientScaleMagnitude(feature.properties.mag),
            fillOpacity: 100
        }).bindPopup(`<h3>${feature.properties.place}</h3>
        <hr>
        <ul> 
            <li>Magnitude: ${feature.properties.mag}</li>
            <li>Depth: ${coords[2]}</li>
            <li>Time: ${new Date(feature.properties.time).toString()}</li>
            <li><a href="${feature.properties.url}" target="_blank">More Info Here</a></li>
        </ul>`));
    });
    var circleLayerGroup = L.layerGroup(circlesGroup);
    return circleLayerGroup;
};





var plateLayer;
d3.json(plates_url, function(plates_response){
    plateLayer = L.geoJSON(plates_response.features, {
        style: function(feature) {
            return {
                fillOpacity: .3,
                fillColor: 'grey',
                color:'orange',
                weight: 3,
                opacity: .3,

            }
        },
        onEachFeature: function(feature, layer){
            layer.bindPopup(`Plate Name: ${feature.properties.PlateName}`)
        }

    })
})



d3.json(base_url+ "all_week.geojson", function(monthResponse){
    d3.json(base_url+ "1.0_week.geojson", function(response1){
        d3.json(base_url+ "2.5_week.geojson", function(response2){
            d3.json(base_url+ "4.5_week.geojson", function(response3){
                var init_layer = buildLayer(monthResponse.features);
                var baseMaps = {"All Weekly Earthquakes": init_layer,
                "Magnitude 1.0 or greater": buildLayer(response1.features),
                "Magnitude 2.5 or greater": buildLayer(response2.features),
                "Magnitude 4.5 or greater": buildLayer(response3.features)};
                var overlayMaps = {
                    
                    "Tectonic Plates": plateLayer
                }
                var myMap = L.map("map", {
                    center: [48.3593,-114.1698],
                    zoom: 3,
                    layers: [init_layer]
                });
                L.control.layers(baseMaps, overlayMaps).addTo(myMap)
                
                // Adding tile layer
                L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
                    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
                    tileSize: 512,
                    maxZoom: 18,
                    zoomOffset: -1,
                    id: "mapbox/dark-v10",
                    accessToken: API_KEY
                }).addTo(myMap);
        





            });
        });
    });
});


