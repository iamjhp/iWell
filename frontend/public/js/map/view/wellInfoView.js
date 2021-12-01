class WellInfo {
    constructor(well) {
        this.well = well
    }

    createWellInfo() {
        let wellInfo = '<div id="well_info">' +
            '<h1 id="firstHeading" class="firstHeading">' + this.well.brunnen_art +'<br>(' +
            this.well.longitude + ', ' + this.well.latitude + ')' + '</h1>';
        if (this.well.bezeichnung !== 'null') {
            wellInfo += '<h2>' + this.well.bezeichnung + '</h2>';
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

    showClosestWellInfo(closestId, markers) {
        let idx4ClosestMarker
        for (let i = 0; i < markers.length; i++) {
            if (markers[i].wellId === closestId) idx4ClosestMarker = markers[i].arrNr
        }
        let closestMarker = markers[idx4ClosestMarker]
        //google.maps.event.trigger(closestMarker, 'click');
        return {lat: closestMarker.position.lat(), lng: closestMarker.position.lng()};
    }
}
export default WellInfo