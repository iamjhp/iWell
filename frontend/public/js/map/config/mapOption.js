var myStyles =[
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    }
];

export default function MapOptions(userPosition) {
    let mapOptions = {
        zoom: 16,
        center: userPosition,
        styles: myStyles,
    };

    return mapOptions
}