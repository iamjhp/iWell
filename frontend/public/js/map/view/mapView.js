import RendererOption from '../config/rendererOption.js';
import WellInfoView from './wellInfoView.js';
import MarkerView from './markerView.js';
import Model from '../model/mapModel.js';

const markers = []
let activeInfoWindow = null;
var directionsRenderer = null;
var directionsService
var polyline = null
var polyline2 = null
var line = []
var myStyles =[
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    }
];

var intervalId = null;
var markerView = null;
var pMarker = null;
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
    initMap(wells, userPosition) {
        let mapOptions = {
            zoom: 16,
            center: userPosition,
            styles: myStyles 
        };

        let map = new google.maps.Map(document.getElementById('map'),
            mapOptions);
     markerView = new MarkerView(map);
        // add well markers and listeners to open info windows
        for (let i = 0; i < wells.length; i++) {
            let well = wells[i];
            let marker = markerView.createWellMarker(well, i)
            markers.push(marker);
            this.#addInfoWindowOnClick(marker, map, i, well, null);
        }
        new markerClusterer.MarkerClusterer({map, markers})


        //markerView = new MarkerView(map);
        pMarker = markerView.createPersonMarker(userPosition)
        this.addLocationButton(map);

        intervalId = setInterval(() => {
            this.updateUserPosition(markerView)
        }, 9000)
    }

    updateUserPosition(markerView) {
        let modelTest = new Model()
        modelTest.getUserLocation().then(newUserPosition => { 
            pMarker.setMap(null)
            pMarker = markerView.createPersonMarker(newUserPosition)
            //this.addLocationButton(map, closestMarkerId, newUserPosition);
        })
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

    #addInfoWindowOnClick(marker, map, i, well, userPosition) {
        let wellInfoView = new WellInfoView(well)
        //test.createWellInfo()
        const infowindow = new google.maps.InfoWindow({
            content: wellInfoView.createWellInfo(),
        });
        google.maps.event.addListener(marker, 'click', () => {
            activeInfoWindow&&activeInfoWindow.close();
            infowindow.open(map, marker);
            activeInfoWindow = infowindow;
            google.maps.event.addListener(infowindow, 'domready', () => {
                document.getElementById("route").addEventListener("click", () => {
                    activeInfoWindow&&activeInfoWindow.close();
                    clearInterval(intervalId);
                    let modelTest = new Model()
                    modelTest.getUserLocation().then(newUserPosition => { 
                        let targetPosition = {lat: marker.position.lat(), lng: marker.position.lng()}
                        this.test1(map, newUserPosition, targetPosition)
                    })

                    intervalId = setInterval(() => {
                        modelTest.getUserLocation().then(newUserPosition => {
                        let targetPosition = {lat: marker.position.lat(), lng: marker.position.lng()} 
                        this.test1(map, newUserPosition, targetPosition)
                        })
                    }, 9000)
                }); 
            })     
        })
    }

    addLocationButton(map) {
        document.getElementById("closestMarker").addEventListener("click", () => {
            google.maps.event.trigger(map, 'click');
            let modelTest = new Model()
            let wellInfoView = new WellInfoView()
            //this.test2(map, closestMarkerId, userPosition)
            clearInterval(intervalId);
            modelTest.getUserLocation().then(newUserPosition => {
                modelTest.getClosestWell().then(closestId => {
                    let targetPosition = wellInfoView.showClosestWellInfo(closestId, markers) 
                    this.test1(map, newUserPosition, targetPosition)

                    intervalId = setInterval(() => {
                        let targetPosition = wellInfoView.showClosestWellInfo(closestId, markers) 
                        this.test1(map, newUserPosition, targetPosition)
                    }, 9000)
                })
            });
        })
    }

    // User Start Position
    test1(map, userPosition, targetPosition) {
        pMarker.setMap(null)
        pMarker = markerView.createPersonMarker(userPosition)
        this.setUpRoute(map, targetPosition, userPosition)
        this.calculateAndDisplayDistance(userPosition, targetPosition)
    }

    // User New Position (fixed coord), , only for testing
    test2(map, closestMarkerId) {
        let modelTest = new Model()
        modelTest.getUserLocation().then(newUserPosition => { 
        let wellInfoView = new WellInfoView()
        let targetPosition = wellInfoView.showClosestWellInfo(closestMarkerId, markers)
        pMarker.setMap(null)
        pMarker = markerView.createPersonMarker({lat: 47.3776, lng: 8.5428})
        this.setUpRoute(map, targetPosition, {lat: 47.3776, lng: 8.5428})
        this.calculateAndDisplayDistance({lat: 47.3776, lng: 8.5428}, targetPosition)
    })
    }

    setUpRoute(map, targetPosition, userPosition) {
        if(directionsRenderer != null) {
            directionsRenderer.setMap(null);
            directionsRenderer = null;
            var size = line.length;

            for (let i=0; i<size; i++) 
            {                           
                line[i].setMap(null);
            }
        }

        let rendererOptions = RendererOption();
        directionsRenderer = new google.maps.DirectionsRenderer(rendererOptions);
        directionsService = new google.maps.DirectionsService();
        directionsRenderer.setMap(null);
        directionsRenderer.setMap(map);
        this.calculateAndDisplayRoute(userPosition, targetPosition, directionsService, directionsRenderer, map);
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
            line.push(polyline)
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
            line.push(polyline2)
            directionsRenderer.setDirections(response);
          })
          .catch(() => window.alert("Directions request failed due to " + status));
      }
}

function callback(response, status) {
    if (status === 'OK') {
        var results = response.rows[0].elements;
        document.getElementById("distance").textContent = "Entfernung: " + results[0].distance.text;
        document.getElementById("duration").textContent = "Dauer: " + results[0].duration.text;
    }
}