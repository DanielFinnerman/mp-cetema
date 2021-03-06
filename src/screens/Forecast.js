import React, {useEffect, useState} from "react";
import {Alert} from 'react-native';
import {
  Body,
  Button,
  Card,
  CardItem,
  Container,
  Content,
  Text,
  H1,
  H3
} from "native-base";
import {weatherApi} from "../helpers/WeatherApi";
import * as Location from "expo-location";

const Forecast = () => {
  const [seaObs, setSeaObs] = useState([]);
  const [weatherObs, setWeatherObs] = useState([]);

  const getLocAndFetch = async () => {
    console.log("Forecast user location..");
    let {status} = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
    }

    // should update if location changes by 20m and every 5s
    // but doesn't distanceinterval overrites timeinterval, big suck
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10,
        timeInterval: 5000
      },
      (_location) => {
        // correct data structure could be set here
        fetch('https://pfa.foreca.com/authorize/token?user=' + (weatherApi.user) + '&password=' + (weatherApi.password), {
          method: 'POST'
        })
          .then((response) => response.json())
          //If response is in json then in success
          .then((responseJson) => {
            //Success
            token = responseJson.access_token;
            fetch('https://pfa.foreca.com/api/v1/marine/forecast/hourly/:location?location=' + (_location.coords.longitude) + ', ' + (_location.coords.latitude) + '&token=' + token)
              .then((response) => response.json())
              .then((responseJson) => {
                setSeaObs(responseJson.forecast);
              })
            fetch('https://pfa.foreca.com/api/v1/forecast/hourly/:location?location=' + (_location.coords.longitude) + ', ' + (_location.coords.latitude) + '&token=' + token)
              .then((response) => response.json())
              .then((responseJson) => {
                setWeatherObs(responseJson.forecast);
              })
          });
      }
    );
  };

  useEffect(() => {
    getLocAndFetch();
  }, []);

  return (
    <Container>
      {seaObs ?
        <>
      <Content ref={c => (this.component = c)}>
        <Body>
          <Card>
            <H1>Marine forecast at your location</H1>
          </Card>
          {seaObs.map((item, i) => {
            return (
              <Card key={i}>
                <CardItem>
                <H3>{item.time ? `${item.time.substring(0, 10)}` : "Can't fetch time"}</H3>
                  <H3>{item.time ? ` ${item.time.substring(11, 16)}` : "Can't fetch time"}</H3>
                </CardItem>
                <CardItem>
                  <Text>{item.seaTemp ? `Seawater temperature: ${item.seaTemp}°C` : "Can't fetch temp"}</Text>
                </CardItem>
                <CardItem>
                  <Text>{item.sigWaveHeight ? `Wave height: ${item.sigWaveHeight}m` : "Can't fetch wave height"}</Text>
                </CardItem>
                <CardItem>
                  <Text>{item.waveDir ? `Wave direction: ${item.waveDir}` : "Can't fetch wave dir"}</Text>
                </CardItem>
              </Card>
            );
          })}
          <Button block light
            onPress={() => this.component._root.scrollToPosition(0, 0)}>
            <Text>Back to top</Text>
          </Button>
        </Body>
      </Content>
      </> : <Text>Loading</Text>}
    </Container>
  );
};

export default Forecast;