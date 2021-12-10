import RendererOption from '../config/rendererOption.js';
import MapOption from '../config/mapOption.js'
import WellInfoView from './wellInfoView.js';
import MarkerView from './markerView.js';
import UserView from './userView.js'
import Model from '../model/mapModel.js';
import Route from './routeView.js'
import MapController from '../controller/mapController.js'

const markers = []
let activeInfoWindow = null;
var directionsRenderer = null;
var directionsService
var line = []
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
        let map = new google.maps.Map(document.getElementById('map'),
            MapOption(userPosition));
        markerView = new MarkerView(map);

        pMarker = markerView.createPersonMarker(userPosition)

        // add well markers and listeners to open info windows
        for (let i = 0; i < wells.length; i++) {
            let well = wells[i];
            let marker = markerView.createWellMarker(well, i)
            markers.push(marker);
            this.#addInfoWindowOnClick(marker, map, well);
        }
        new markerClusterer.MarkerClusterer({map, markers})

        this.addLocationButton(map);

        let userView = new UserView()
        intervalId = setInterval(() => {
            userView.updateUserPosition(markerView, pMarker)
        }, 9000)
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

    #addInfoWindowOnClick(marker, map, well) {
        let wellInfoView = new WellInfoView(well)
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
                    modelTest.getUserLocation().then(userPosition => { 
                        let targetPosition = {lat: marker.position.lat(), lng: marker.position.lng()}
                        this.updateUserLocation(map, userPosition, targetPosition, false)
                    })

                    intervalId = setInterval(() => {
                        modelTest.getUserLocation().then(newUserPosition => {
                            let targetPosition = {lat: marker.position.lat(), lng: marker.position.lng()} 
                            this.updateUserLocation(map, newUserPosition, targetPosition, true)
                        })
                    }, 9000)
                }); 
            })     
        })
    }

    addLocationButton(map) {
        document.getElementById("closestMarker").addEventListener("click", () => {
            google.maps.event.trigger(map, 'click');
            let model = new Model()
            let wellInfoView = new WellInfoView()
            let mapController = new MapController()
            
            clearInterval(intervalId);
            mapController.getClosestWell().then(closestId => {
                model.getUserLocation().then(userPosition => {
                    let targetPosition = wellInfoView.showClosestWellInfo(closestId, markers) 
                    this.updateUserLocation(map, userPosition, targetPosition, false)
                })
                
                intervalId = setInterval(() => {
                    model.getUserLocation().then(newUserPosition => {
                        let targetPosition = wellInfoView.showClosestWellInfo(closestId, markers) 
                        this.updateUserLocation(map, newUserPosition, targetPosition, true)
                    })
                }, 9000)

            })
        })
    }

    updateUserLocation(map, userPosition, targetPosition, preserveViewport) {
        pMarker.setMap(null)
        pMarker = markerView.createPersonMarker(userPosition)
        this.setUpRoute(map, targetPosition, userPosition, preserveViewport)
        this.calculateAndDisplayDistance(userPosition, targetPosition)
    }

    setUpRoute(map, targetPosition, userPosition, preserveViewport) {
        if(directionsRenderer != null) {
            directionsRenderer.setMap(null);
            directionsRenderer = null;
            var size = line.length;

            for (let i=0; i<size; i++) {                           
                line[i].setMap(null);
            }
        }

        let rendererOptions = RendererOption(preserveViewport);
        directionsRenderer = new google.maps.DirectionsRenderer(rendererOptions);
        directionsService = new google.maps.DirectionsService();
        directionsRenderer.setMap(null);
        directionsRenderer.setMap(map);
        
        let routeView = new Route()
        routeView.calculateAndDisplayRoute(userPosition, targetPosition, directionsService, directionsRenderer, map, line)
    }
}

function callback(response, status) {
    if (status === 'OK') {
        var results = response.rows[0].elements;
        document.getElementById("distance").textContent = "Entfernung: " + results[0].distance.text;
        document.getElementById("duration").textContent = "Dauer: " + results[0].duration.text;
    }
}