import React, { useEffect, useState } from "react";
import {Image} from 'react-native';
import {
  Body,
  Button,
  Card,
  CardItem,
  Container,
  Content,
  Text,
  H3
} from "native-base";
import * as Location from "expo-location";
import {weatherApi} from "../helpers/WeatherApi";
import {useTheme} from '../helpers/ThemeContext';
import {MyText} from '../helpers/TextField';

const InfoScreen = (props) => {
  const [nauticalWarnings, setNauticalWarnings] = useState([]);
  const [seaObs, setSeaObs] = useState([]);
  const [weatherObs, setWeatherObs] = useState({});

  const { colors } = useTheme();

  const containerStyle = {
    backgroundColor: colors.background
  };

  const primary ={
    backgroundColor: colors.primary
  }

  const textStyle = {
    color: colors.text
  }

  const fetchData = () => {
    fetch("https://meri.digitraffic.fi/api/v1/nautical-warnings/published")
      .then((response) => response.json())
      .then((data) => setNauticalWarnings(data.features));
  };

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
            fetch('https://pfa.foreca.com/api/v1/current//:location?location=' + (_location.coords.longitude) + ', ' + (_location.coords.latitude) + '&token=' + token)
              .then((response) => response.json())
              .then((responseJson) => {
                setWeatherObs(responseJson.current);
              })
          });
      }
    );
  };




  useEffect(() => {
    getLocAndFetch();
    fetchData();
  }, []);

  return (
    <Container style={containerStyle}>
      <Content>
        <Body>
          {nauticalWarnings.map((warning, i) => {
            if (i < 1) {
              return (
                <Card key={i}>
                  <CardItem>
                    <H3
                      onPress={() =>
                        props.navigation.navigate("Nautical Warning", {
                          warning,
                        })}>{warning.properties.areasEn}
                    </H3>
                  </CardItem>
                  <CardItem><Text onPress={() =>
                    props.navigation.navigate("Nautical Warning", {
                      warning,
                    })}>
                    {warning.properties.locationEn}:{" "}
                    {warning.properties.contentsEn}</Text>
                  </CardItem>
                </Card>
              );
            }
          })}
          <Button block light
            style={primary}
            onPress={() => props.navigation.navigate("Nautical Warnings")}
          >
            <Text style={textStyle}>Show all Nautical Warnings</Text>
          </Button>
          <Card style={containerStyle}>
            <CardItem header button
            style={containerStyle} onPress={() => props.navigation.navigate("Forecast")}>
              <Text style={{fontWeight: "bold"}, textStyle}>Sea state at your location: </Text>
            </CardItem>
            <CardItem style={containerStyle} button onPress={() => props.navigation.navigate("Forecast")}>
              <Image source={{uri: 'https://developer.foreca.com/static/images/symbols_pastel/' + (weatherObs.symbol) + '.png'}} style={{
                flex: 1,
                aspectRatio: 4,
                resizeMode: 'contain'
              }} />
            </CardItem>
            <CardItem style={containerStyle}>
              <Text style={textStyle}>{weatherObs.temperature ? `Air temperature: ${weatherObs.temperature}°C` : "Can't fetch air temp"}</Text>
              <Text style={textStyle}>{weatherObs.symbolPhrase ? `,  ${weatherObs.symbolPhrase}` : "Can't fetch string"}</Text>
            </CardItem>
            <CardItem style={containerStyle}>
              <Text style={textStyle}>{seaObs[0] ? `Seawater temperature: ${seaObs[0].seaTemp}°C` : "Can't fetch temperature"}</Text>
            </CardItem>
            <CardItem style={containerStyle}>
              <Text style={textStyle}>{weatherObs.windSpeed ? `Wind: ${weatherObs.windSpeed}m/s` : "Can't fetch wind speed"}</Text>
              <Text style={textStyle}>{weatherObs.windDirString ? ` ${weatherObs.windDirString}` : "Can't fetch wind dir"}</Text>
            </CardItem>
            <CardItem style={containerStyle}>
              <Text style={textStyle}>{seaObs[0] ? `Wave height: ${seaObs[0].sigWaveHeight}m` : "Can't fetch wave height"}</Text>
            </CardItem>
            <CardItem style={containerStyle}>
              <Text style={textStyle}>{seaObs[0] ? `Wave direction: ${seaObs[0].waveDir}` : "Can't fetch wave direction"}</Text>
            </CardItem>
            <CardItem style={containerStyle}>
              <Text style={textStyle}>{weatherObs.visibility ? `Visibility: ${(weatherObs.visibility / 1000).toFixed(1)}km` : "Can't fetch visibility"}</Text>
            </CardItem>
          </Card>
        </Body>
      </Content>
    </Container>
  );
};

export default InfoScreen;
