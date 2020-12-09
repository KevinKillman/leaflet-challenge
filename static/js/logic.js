var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";








d3.json(url, function(response){

    
    var circlesGroup = [];
    console.log(response)
    if (d3.extent(response.features.map(feature => feature.geometry.coordinates[2]))[1] > 100) {
        var gradientScaleRed = d3.scaleLinear().domain([0, 200]).range([0,255])
        var gradientScaleGreen = d3.scaleLinear().domain([0, 200]).range([255,0])
    }else {
        var gradientScaleRed = d3.scaleLinear().domain(d3.extent(response.features.map(feature => feature.geometry.coordinates[2]))).range([0,255])
        var gradientScaleGreen = d3.scaleLinear().domain(d3.extent(response.features.map(feature => feature.geometry.coordinates[2]))).range([255,0])
    }
    var gradientScaleMagnitude = d3.scaleLinear().domain(d3.extent(response.features.map(feature => feature.properties.mag))).range([1000, 50000])
    console.log(d3.extent(response.features.map(feature => feature.properties.mag)));
    response.features.forEach(feature => {
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

    

    var circleLayer = L.layerGroup(circlesGroup);
   
    var overlayMaps = {
        "Weekly Earthquakes": circleLayer
    }
    var myMap = L.map("map", {
        center: [48.3593,-114.1698],
        zoom: 3,
        layers: [circleLayer]
      });
    L.control.layers(overlayMaps).addTo(myMap)
      
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