const markers = []
let activeInfoWindow = null;
var directionsRenderer
var directionsService
var polyline
var polyline2

/**
 * @class MapView
 * View for the iWell Application.
 * Visual representation of the MapModel.
 */
export default class MapView {
    /**
     * Initializes a new instance of the MapView.
     */
    constructor() {
        this.blueMarker = "../../pictures/BlueMarker_24.png"
        this.wellImage = "../../pictures/well_marker.png"
        this.find_closest_Well = null;
    }

    /**
     * Initializes the Map, fills it with Markers pointing to the given wells and adds a marker pointing to the given
     * user location. Also adds a listener to the well markers so as to open an information window when the
     * user clicks on a well marker. Furthermore a MarkerClusterer is initialized for the well markers to group markers
     * which are too close to each other when zooming out.
     * @param wells wells which should be marked on the map
     * @param userPosition current location of the user
     */
    initMap(wells, userPosition, closestMarkerId) {
        let mapOptions = {
            zoom: 16,
            center: userPosition
        };

        let map = new google.maps.Map(document.getElementById('map'),
            mapOptions);

        //google.maps.event.addListener(map, 'click', this.find_closest_Well);
        
        this.#createPersonMarker(userPosition, map)
        
        // add well markers and listeners to open info windows
        for (let i = 0; i < wells.length; i++) {
            let well = wells[i];
            let marker = this.#createWellMarker(well, map, i)
            markers.push(marker);
            this.#addInfoWindowOnClick(marker, map, i, well, userPosition);
        }

        new markerClusterer.MarkerClusterer({map, markers})

        this.addLocationButton(map, closestMarkerId, userPosition);
        
        
            
    }

    calculateAndDisplayDistance(userPosition, targetPosition) {
        var service = new google.maps.DistanceMatrixService();
        var from = new google.maps.LatLng(userPosition.lat, userPosition.lng);
        var dest = new google.maps.LatLng(targetPosition.lat, targetPosition.lng);
        
        service.getDistanceMatrix(
            {
                origins: [from],
                destinations: [dest],
                travelMode: 'WALKING'
            }, callback);
    }

    /**
     * Shows the closest well in accordance with the user location.
     * @param closestId
     */
    showClosestWellInfo(closestId) {
        let idx4ClosestMarker
        for (let i = 0; i < markers.length; i++) {
            if (markers[i].wellId == closestId) idx4ClosestMarker = markers[i].arrNr
        }
        let closestMarker = markers[idx4ClosestMarker]
        var closestMarkerCoor = {lat: closestMarker.position.lat(), lng: closestMarker.position.lng()} 
        //google.maps.event.trigger(closestMarker, 'click');
        return closestMarkerCoor;
    }

    getMarkers() {
        return markers;
    }

    #createPersonMarker(userPosition, map) {
        let test = new google.maps.Marker({
            title: 'you',
            position: new google.maps.LatLng(userPosition),
            map: map,
            icon: this.blueMarker,
        })
        //console.log("PersonMarker: " + test.position)
    }

    #createWellMarker(well, map, i) {
        return new google.maps.Marker({
            title: well.nummer,
            position: new google.maps.LatLng(well.latitude, well.longitude),
            wellId : well.id,
            arrNr : i,
            map: map,
            icon: this.wellImage,
        });
    }

    #addInfoWindowOnClick(marker, map, i, well, userPosition) {
        const infowindow = new google.maps.InfoWindow({
            content: this.#createWellInfo(well),
        });
        google.maps.event.addListener(marker, 'click', () => {
            activeInfoWindow&&activeInfoWindow.close();
            infowindow.open(map, marker);
            activeInfoWindow = infowindow;
            google.maps.event.addListener(infowindow, 'domready', () => {
                document.getElementById("route").addEventListener("click", () => {
                    let targetPosition = {lat: marker.position.lat(), lng: marker.position.lng()}
                    this.setUpRoute(map, targetPosition, userPosition)
                    this.calculateAndDisplayDistance(userPosition, targetPosition)
                }); 
            })     
        })
        /*
        google.maps.event.addListener(marker, 'click', (function (marker) {
            return function () {
                activeInfoWindow&&activeInfoWindow.close();
                infowindow.open(map, marker);
                activeInfoWindow = infowindow;
                let test = this.test()
            }
        })(marker, i)); */
    }

    addLocationButton(map, closestMarkerId, userPosition) {
        document.getElementById("closestMarker").addEventListener("click", () => {
            google.maps.event.trigger(map, 'click');
            let targetPosition = this.showClosestWellInfo(closestMarkerId)
            this.setUpRoute(map, targetPosition, userPosition)
            this.calculateAndDisplayDistance(userPosition, targetPosition)
        });
    }

    setUpRoute(map, targetPosition, userPosition) {
        if(directionsRenderer != null) {
            directionsRenderer.setMap(null);
            directionsRenderer = null;
            polyline.setMap(null)
            polyline2.setMap(null)
        }
        let rendererOptions = this.createRendererOptions();
            directionsRenderer = new google.maps.DirectionsRenderer(rendererOptions);
            directionsService = new google.maps.DirectionsService();
            directionsRenderer.setMap(null);
            directionsRenderer.setMap(map);
            //let targetPosition = this.showClosestWellInfo(closestMarkerId)
            this.calculateAndDisplayRoute(userPosition, targetPosition, directionsService, directionsRenderer, map);
    }

    #createWellInfo(well) {
        let wellInfo = '<div id="well_info">' +
            '<h1 id="firstHeading" class="firstHeading">' + well.brunnen_art +'<br>(' +
            well.longitude + ', ' + well.latitude + ')' + '</h1>';
        if (well.bezeichnung !== 'null') {
            wellInfo += '<h2>' + well.bezeichnung + '</h2>';
        }
        wellInfo += '<img src="pictures\\outline_water_drop_black_24dp.png" alt="Brunnen" align="left">' +
            "<div>" +
            '<p style="margin-left: 60px;"><b>Trinkbar:</b> Ja' +
            "<br><br>" +
            "<b>Wasserqualität:</b> Sehr gut" +
            "<br>" +
            "</p>" +
            "</div>" +
            "</div>"+
            "<button id='route'>Route</button>";
        return wellInfo;
    }

    test() {
        console.log("heelllllllllllllllllor")
        alert('Hello')
    }

    createRendererOptions() {
        let rendererOptions = {
            //preserveViewport: true,
            //map: map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: "red",
                strokeWeight: 4,
                strokeOpacity: 0,
                icons: [{
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: '#C83939',
                      fillOpacity: 1,
                      scale: 2,
                      strokeColor: '#C83939',
                      strokeOpacity: 1,
                    },
                    offset: '0',
                    repeat: '10px'
                  }]
              }
        }
        return rendererOptions;
    }

    calculateAndDisplayRoute(userPosition, targetPosition, directionsService, directionsRenderer, map) {
        directionsService
          .route({
            origin: userPosition,
            destination: targetPosition,
            travelMode: google.maps.TravelMode.WALKING
          })
          .then((response) => {
            polyline = new google.maps.Polyline({
                map: map,
                strokeColor: "red",
                strokeOpacity: 0,
                strokeWeight: 4,
                icons: [{
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: '#C83939',
                      fillOpacity: 1,
                      scale: 2,
                      strokeColor: '#C83939',
                      strokeOpacity: 1,
                    },
                    offset: '0',
                    repeat: '10px'
                  }],
                path: [targetPosition, response.routes[0].legs[0].end_location //des
                        ]
                
            });
            polyline2 = new google.maps.Polyline({
                map: map,
                strokeColor: "red",
                strokeOpacity: 0,
                strokeWeight: 4,
                icons: [{
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: '#C83939',
                      fillOpacity: 1,
                      scale: 2,
                      strokeColor: '#C83939',
                      strokeOpacity: 1,
                    },
                    offset: '0',
                    repeat: '10px'
                  }],
                path: [userPosition, response.routes[0].legs[0].start_location
                        ]
                
            });
            directionsRenderer.setDirections(response);
          })
          .catch((e) => window.alert("Directions request failed due to " + status));
      }
}

function callback(response, status) {
    if (status == 'OK') {
        //var origins = response.originAddresses;
        //var destinations = response.destinationAddresses;
        var results = response.rows[0].elements;
        document.getElementById("distance").textContent = "Entfernung: " + results[0].distance.text;
        document.getElementById("duration").textContent = "Dauer: " + results[0].duration.text;
        /*
        for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            console.log(results[i].distance.text)
            console.log(results[i].duration.text)
            document.getElementById("distance").textContent = "Entfernung: " + results[i].distance.text;
            document.getElementById("duration").textContent = "Dauer: " + results[i].duration.text;
            
            for (var j = 0; j < results.length; j++) {
                var element = results[j];
                var distance = element.distance.text;
                var duration = element.duration.text;
                var from = origins[i];
                var to = destinations[j];
            }
            */
        
    }
}

function test2() {
    alert("hello")
}