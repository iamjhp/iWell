import MapView from '../view/mapView.js';
import MapModel from '../model/mapModel.js';
/**
 * @class MapController
 *
 * Controller for the iWell Application.
 * Links the user input and the view output.
 */
 class MapController {
    /**
     * Initializes a new instance of the MapController with the given service instances.
     * @param model model
     * @param view view
     */
     constructor(model, view) {
      this.model = model;
      this.view = view;
      //this.view.find_closest_Well = this.#find_closest_Well.bind(this);
    }

    getClosestWell() {
      let Model = new MapModel()
      let closestId = Model.getClosestWell()
      return closestId
    }
 }
 export default MapController

const app = new MapController(new MapModel(), new MapView())

app.model.getWells()
  .then(wells => {
    app.model.getUserLocation()
      .then(userPosition => {
        app.view.initMap(wells, userPosition);
  });
})