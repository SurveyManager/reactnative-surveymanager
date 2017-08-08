import React from 'react';
import LoginScreen from './App/views/LoginScreen.js';
import MainScreen from './App/views/MainScreen.js';
import { AppRegistry, View, StyleSheet, Dimensions, AsyncStorage, NetInfo, Modal, Button, Text } from 'react-native';
import { StackNavigator, NavigationActions } from 'react-navigation';
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


// Global events
var thisActivity = false;
var mainActivityNav = false;

nextQuestion = function () {
	survey.nextQuestion();
}

newSurvey = function () {
	// TODO ask before new
	survey.surveyNew();
}

clearDB = function () {
	Sstorage._clearAll();
}

switchToLoginActivity = function (e) {
	  //console.warn("show login activity", e, this);
	  if (e) {
		  thisActivity.setState({ modalVisible: true, modalTxt: e });
	  } else {
		  _goLoginActivity();
	  }
	}
_goLoginActivity = function () {
		thisActivity.setState({ modalVisible: false });
		/*const resetAction = NavigationActions.reset({
			index: 0,
			actions: [NavigationActions.navigate({ routeName: 'Home'})]
		});
		mainActivityNav.dispatch(resetAction);*/
	}




export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
		modalVisible: false, 
		modalTxt: "",
	}
	thisActivity=this;
  }


  render() {
    return (
      <View style={AppStyle.container}>
         <Modal
          animationType={"fade"}
          transparent={true}
          presentationStyle={"fullScreen"}
          visible={this.state.modalVisible}
          onRequestClose={() => { _goLoginActivity() }}
          >
          <View style={AppStyle.modal}>
          <View style={AppStyle.modalInner}>
            <Text style={AppStyle.modalTxt}>{this.state.modalTxt}</Text>
            <Button style={AppStyle.modalButton} onPress={() => { _goLoginActivity() }} title="OK" />
          </View></View>
        </Modal>

        <MainNavigator style={{ width: Dimensions.get('window').width }} />
      </View>
    );
  }
}

const AppStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    paddingTop: Constants.statusBarHeight,
  },
	modal: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		flex: 1,
		justifyContent: 'center',
		padding: 20,
	},
	modalInner: {
		backgroundColor: '#fff', 
		padding: 20,
		borderRadius: 10,
		alignItems: 'center',
	},
	modalButton: {
		margin: 10,
		width: 60,
	},
	modalTxt: {
		margin: 10,
	},

});
