import React from 'react';
import LoginScreen from './App/views/LoginScreen.js';
import MainScreen from './App/views/MainScreen.js';
import { AppRegistry, View, StyleSheet, Dimensions, } from 'react-native';
import { StackNavigator, } from 'react-navigation';
import { Constants } from 'expo';


var uuid = require('react-native-uuid');

var _storage = require('./App/models/storage.js');
	Sstorage=new _storage();
	Sstorage.init({});
	
var _restapi = require('./App/models/restapi.js');
	restapi=new _restapi();
	restapi.init("https://survey.sovgvd.info/your-surveys/API");

const MainNavigator = StackNavigator({
  Home: { screen: LoginScreen },
  Main: { screen: MainScreen },
});


export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <MainNavigator style={{ width: Dimensions.get('window').width }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    paddingTop: Constants.statusBarHeight,
  },
});
