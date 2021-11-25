const zhawCoordinates = {lat: 47.3776, lng: 8.5328}
//const zhawCoordinates = {lat: 47.3876, lng: 8.5428}

/**
 * Gets the well entries from the MySQL database.
 * @returns {Promise<T>}
 */
 async function getWellsFromDB() {
    /* 
    let wells = [];
    await fetch("/Brunnen").then(response => wells = response.json());
    return wells;
    */
    const response = await fetch('/Brunnen');
    const json = await response.json();
    return json;
}
//const wellDB = await getWellsFromDB();
var latTest
var lngTest
/**
 * @class MapModel
 * Model of the iWell application.
 * Manages the data & logic of the application. Stores the wells entries from the database.
 */
export default class MapModel {

    /**
     * Initializes a new instance of the MapModel with the well entries from the database.
     */
    constructor() {
        this.well = this.init();
    }

    async init() {
       return await getWellsFromDB();
    }

    getWells() {
        return this.well;
    }

    userGeolocation() {
        if (navigator.geolocation) {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {enableHighAccuracy:true}          
                )
            })
        } else {
            return -1;
        }
        //return 0;
        
    }

    async getUserLocation() {
        let test = await this.userGeolocation();
        if (test === -1) {
            console.log("zhaw: ")
            return zhawCoordinates
        }
        
        //return {lat: test.coords.latitude, lng: test.coords.longitude }
        return zhawCoordinates
    }

    /**
     * Calculates the closest well from the user's location and returns the id of this well.
     * @param event
     * @returns {number} id of the closest well
     */
    async getClosestWell(event) {
        let distances = [];
        let closest = -1;
        let idx = -1;
        let coord = await this.getUserLocation();
        await this.init().then(wel => {
            for (let i = 0; i < wel.length; i++) {
                let wellCoordinate = new google.maps.LatLng(wel[i].latitude, wel[i].longitude)
                let zhaw = new google.maps.LatLng(coord.lat, coord.lng)
                let d = google.maps.geometry.spherical.computeDistanceBetween(wellCoordinate, zhaw);
                distances[i] = d;
                if (idx == -1 || d < distances[idx]) {
                    idx = i;
                    closest = wel[i].id;
                }
            }
        })
        return closest;
    }
}