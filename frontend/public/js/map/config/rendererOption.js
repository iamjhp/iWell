export default function RendererOptions(preserveViewBoolean) {
  
    let rendererOptions = {
        preserveViewport: preserveViewBoolean,
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