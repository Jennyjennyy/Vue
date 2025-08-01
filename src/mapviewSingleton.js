class MapViewSingleton {
  constructor() {
    if (!MapViewSingleton.instance) {
      this._mapView = null;
      MapViewSingleton.instance = this;
    }
    return MapViewSingleton.instance;
  }

  getMapView() {
    console.log('[Singleton] getMapView:', this._mapView);
    return this._mapView;
  }

  setMapView(view) {
    if (view && typeof view !== 'undefined') {
      this._mapView = view;  // 不是 ref，是纯 View
      console.log('[Singleton] setMapView:', view);
    } else {
      console.error('[Singleton] setMapView FAILED: view is', view);
    }
  }
}

const instance = new MapViewSingleton();
export default instance;
