import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  StyleSheet,
  View,
  Dimensions,
  ToastAndroid,
  Text,
  LogBox,
} from "react-native";
import * as Location from "expo-location";
import firebase from "../helpers/firebase";
import * as TaskManager from "expo-task-manager";
import mapStyles from "../helpers/mapStyle";

let LOCATION_TASK = "backgroundLocation";

TaskManager.defineTask(LOCATION_TASK, ({ data: { locations }, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log("Received new locations");
});

export default class MainScreen extends React.Component {
  constructor() {
    //ignore yellow errors
    LogBox.ignoreAllLogs(true);

    super();
    this.state = {
      initialRegion: {
        latitude: 60.1587262,
        longitude: 24.922834,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
      uid: "",
      shipLocations: [],
      shipMetadata: [],
      combinedResult: [],
      userMarkers: [],
    };
  }

  componentDidMount() {
    /*firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.getUserLocation()
        this.setState({
          uid: firebase.auth().currentUser.uid,
        });
      } else {
        console.log("user not logged in")
      }
    });*/

    const success = (res) => (res.ok ? res.json() : Promise.resolve({}));

    const locations = fetch(
      "https://meri.digitraffic.fi/api/v1/locations/latest"
    ).then(success);

    const metadata = fetch(
      "https://meri.digitraffic.fi/api/v1/metadata/vessels"
    ).then(success);

    return Promise.all([locations, metadata])
      .then(([locations, metadata]) => {
        this.setState({
          shipLocations: locations.features,
          shipMetadata: metadata,
        });
      })
      .catch((error) => console.error(error));
  }

  componentWillMount() {
    this.getMarkers();
  }

  async componentWillUnmount() {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }

  mapMarkers = () => {
    //get current time in milliseconds from unix epoch
    const currentTime = Date.now();

    //current time minus 1 minute in milliseconds
    const filterTime = currentTime - 36000;

    //accept results when result timestamp is larger than the filterTime
    const combinedResult = this.state.shipLocations
      .filter((result) => result.properties.timestampExternal >= filterTime)
      .map((locObj) => ({
        ...this.state.shipMetadata.find(
          (metaObj) => metaObj.mmsi === locObj.mmsi
        ),
        ...locObj,
      }));

    //console.log(combinedResult)

    return combinedResult.map((result, index) => {
      if (result.shipType >= 70 && result.shipType <= 89) {
        return (
          <Marker
            key={index}
            coordinate={{
              latitude: result.geometry.coordinates[1],
              longitude: result.geometry.coordinates[0],
            }}
            title={result.mmsi.toString()}
            description={
              (
                (currentTime - result.properties.timestampExternal) /
                1000
              ).toString() +
              " seconds ago " +
              "shiptype: " +
              result.shipType +
              " ship name: " +
              result.name
            }
            image={require("../assets/cargoshipicon.png")}
          ></Marker>
        );
      } else if (result.shipType >= 60 && result.shipType <= 69) {
        return (
          <Marker
            key={index}
            coordinate={{
              latitude: result.geometry.coordinates[1],
              longitude: result.geometry.coordinates[0],
            }}
            title={result.mmsi.toString()}
            pinColor="green"
            description={
              (
                (currentTime - result.properties.timestampExternal) /
                1000
              ).toString() +
              " seconds ago " +
              "shiptype: " +
              result.shipType +
              " ship name: " +
              result.name
            }
            image={require("../assets/cruiseicon.png")}
          ></Marker>
        );
      } else {
        return (
          <Marker
            key={index}
            coordinate={{
              latitude: result.geometry.coordinates[1],
              longitude: result.geometry.coordinates[0],
            }}
            title={result.mmsi.toString()}
            description={
              (
                (currentTime - result.properties.timestampExternal) /
                1000
              ).toString() +
              " seconds ago " +
              "shiptype: " +
              result.shipType +
              " ship name: " +
              result.name
            }
            image={require("../assets/boaticon.png")}
          ></Marker>
        );
      }
    });
  };

  getUserLocation = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if (status === "granted") {
      // foreground service to track location on background
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Boat App",
          notificationBody: "Tracking location",
          notificationColor: "#FFFFF",
        },
      });
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 10,
          timeInterval: 10000,
        },
        (location) => {
          this.persistLocation(location);
          console.log("Watch Position", location);
        }
      );
    } else {
      // do something if location permissions not accepted
    }
  };

  persistLocation = async (location) => {
    firebase
      .firestore()
      .collection("locations")
      .doc(this.state.uid)
      .set(location, { merge: true })
      .then((docRef) => {
        console.log("New document added", JSON.stringify(location));
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };

  getMarkers = () => {
    firebase
      .firestore()
      .collection("locations")
      .get()
      .then((snapshot) => {
        let userMarkers = [];
        snapshot.forEach((location) => {
          userMarkers.push(location.data());
        });
        this.setState({ userMarkers });
      });
  };

  createMarkers = () => {
    console.log("createMarkers", this.state.userMarkers);
    return this.state.userMarkers.map((location, index) => {
      if (location.coords.latitude && location.coords.longitude) {
        return (
          <Marker
            key={index}
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={"usermarker"}
            description={"usermarker"}
            image={require("../assets/usericon.png")}
          ></Marker>
        );
      }
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1, marginBottom: this.state.marginBottom }}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyles}
            showsUserLocation={true}
            showsMyLocationButton={true}
            initialRegion={this.state.initialRegion}
            onRegionChangeComplete={this.onChangeValue}
            ref={(ref) => (this.map = ref)}
          >
            {this.mapMarkers()}
            {this.createMarkers()}
          </MapView>
        </View>
      </View>
    );
  }
}
