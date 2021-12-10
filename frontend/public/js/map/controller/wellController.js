import MapModel from '../model/mapModel.js';

class WellController {
    constructor(model) {
        this.model = model
    }

    getClosestWell() {
        let Model = new MapModel()
        let closestId = Model.getClosestWell()
        return closestId
    }
}
export default WellController