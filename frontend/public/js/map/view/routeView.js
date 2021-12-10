var polyline = null
var polyline2 = null

class RouteView {
    calculateAndDisplayRoute(userPosition, targetPosition, directionsService, directionsRenderer, map, line) {
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
export default RouteView