const blueMarker = "../../pictures/user_marker.png"
const wellImage = "../../pictures/well_marker.png"

var userIcon = {
    url: "../../pictures/user_marker.png", // url
    scaledSize: new google.maps.Size(50, 50), // scaled size
};

class Marker {
    constructor(map) {
        this.map = map
    }

    createPersonMarker(userPosition) {
        let maker = new google.maps.Marker({
            title: 'you',
            position: new google.maps.LatLng(userPosition),
            map: this.map,
            icon: userIcon,
        })
        return maker;
    }

    createWellMarker(well, i) {
        return new google.maps.Marker({
            title: well.nummer,
            position: new google.maps.LatLng(well.latitude, well.longitude),
            wellId : well.id,
            arrNr : i,
            map: this.map,
            icon: wellImage,
        });
    }

    getMarkers(markers) {
        return markers;
    }
}

export default Marker

