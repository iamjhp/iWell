const markers = []
let activeInfoWindow = null;

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
            this.#addInfoWindowOnClick(marker, map, i, well);
        }

        new markerClusterer.MarkerClusterer({map, markers})

        this.addLocationButton(map, closestMarkerId, userPosition);
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

    addLocationButton(map, closestMarkerId, userPosition) {
        document.getElementById("button").addEventListener("click", () => {
            google.maps.event.trigger(map, 'click');
            let rendererOptions = this.createRendererOptions();
            const directionsRenderer = new google.maps.DirectionsRenderer(rendererOptions);
            const directionsService = new google.maps.DirectionsService();
            directionsRenderer.setMap(map);
            let targetPosition = this.showClosestWellInfo(closestMarkerId)
            this.calculateAndDisplayRoute(userPosition, targetPosition, directionsService, directionsRenderer, map); 
        });
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

    #addInfoWindowOnClick(marker, map, i, well) {
        const infowindow = new google.maps.InfoWindow({
            content: this.#createWellInfo(well),
        });
        google.maps.event.addListener(marker, 'click', (function (marker) {
            return function () {
                activeInfoWindow&&activeInfoWindow.close();
                infowindow.open(map, marker);
                activeInfoWindow = infowindow;
            }
        })(marker, i));
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
            "</div>";
        return wellInfo;
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
            var polyline = new google.maps.Polyline({
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
            var polyline2 = new google.maps.Polyline({
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