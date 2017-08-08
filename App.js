import React from 'react';
import LoginScreen from './App/views/LoginScreen.js';
import MainScreen from './App/views/MainScreen.js';
import { AppRegistry, View, StyleSheet, Dimensions, AsyncStorage, NetInfo } from 'react-native';
import { StackNavigator, } from 'react-navigation';
import { Constants } from 'expo';


var uuid = require('react-native-uuid');

var _storage = require('./App/models/SurveyStorage.js');
	Sstorage=new _storage();
	Sstorage.init({});
	
var _restapi = require('./App/models/restapi.js');
	restapi=new _restapi();
	restapi.init("https://survey.sovgvd.info/your-survey/API/");
	
var _manager = require('./App/models/Survey.js');
	survey = new _manager();
	survey.init({},Sstorage);

NetInfo.fetch().then( function (survey,t) {
	survey.networkChange(t);
}.bind(null, survey));

NetInfo.addEventListener(
  'change',
  function (survey, t) { survey.networkChange(t); }.bind(null, survey)
);



const MainNavigator = StackNavigator({
  Home: { screen: LoginScreen },
  Main: { screen: MainScreen },
});

nextQuestion = function () {
	survey.nextQuestion();
}

newSurvey = function () {
	// TODO ask before new
	survey.surveyNew();
}

clearDB = function () {
	Sstorage._clearAll();
	//Sstorage.sync('eba86247-5bfd-43d9-a78d-18089348fc9f');
}


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
