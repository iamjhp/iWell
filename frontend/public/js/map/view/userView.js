import Model2 from '../model/mapModel.js';

class UserView {
    constructor() {

    }

    updateUserPosition(markerView, pMarker) {
        let Model = new Model2()
        Model.getUserLocation().then(newUserPosition => { 
            pMarker.setMap(null)
            pMarker = markerView.createPersonMarker(newUserPosition)
        })
    }
}
export default UserView