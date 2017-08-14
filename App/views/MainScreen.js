import React from 'react';
import {
  AppRegistry,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button
} from 'react-native';
import { StackNavigator, NavigationActions, } from 'react-navigation';
import l18n from '../localization/MainScreen.js';

const MainScreenStyles = StyleSheet.create({
	NavView: {
		flexDirection: 'row', 
		width: 180, 
	},
	NavBtnAlert: {
		width: 60,
		margin: 5, 
		padding: 10, 
		borderRadius: 4, 
		borderWidth: 0.5, 
		borderColor: '#d6d7da', 
		backgroundColor: '#ff0000',
	},
	NavBtnTxtAlert: {
		textAlign: 'center',
		color: '#ffffff'
	},
	NavBtn: {
		width: 60,
		margin: 5, 
		padding: 10, 
		borderRadius: 4, 
		borderWidth: 0.5, 
		borderColor: '#00aa00', 
		backgroundColor: '#00ff00',
	},
	NavBtnTxt: {
		textAlign: 'center',
		color: '#000000'
	},
	surveyTitle: {
		fontSize: 20,
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 5,
		paddingRight: 5,
	},
	surveyDescription: {
		fontSize: 15,
		paddingTop: 10,
		paddingBottom: 5,
		paddingLeft: 5,
		paddingRight: 5,
		lineHeight: 25
	},
	SurveyTextBtn : {
		padding: 10,
	}

});


class MainScreen extends React.Component {
  static navigationOptions = {
    title: l18n.htitle,
    headerRight: ( <View style={MainScreenStyles.NavView}><TouchableOpacity onPress={() => this.clearDB()} style={MainScreenStyles.NavBtnAlert}><Text style={MainScreenStyles.NavBtnTxtAlert}>DBG</Text></TouchableOpacity><TouchableOpacity onPress={() => this.newSurvey()} style={MainScreenStyles.NavBtn}><Text style={MainScreenStyles.NavBtnTxt}>New</Text></TouchableOpacity><TouchableOpacity onPress={() => this.nextQuestion()} style={MainScreenStyles.NavBtn}><Text style={MainScreenStyles.NavBtnTxt}>Next</Text></TouchableOpacity></View> )
  };

  
  constructor() {
    super();
    this.state = {
      survey: false,
      q: [],
      qother: []
    };
    //mainActivity=this;
  }
  
  doLoad = function () {
	  console.warn("doLoad");
	  survey.getSurvey( function (r,e, other) {
			this.setState({ survey: r, q: e, qother: other});
		  }.bind(this) );
  }
 
	componentDidMount() {
		//this.doLoad();
	} 

  render() {
	const { navigate } = this.props.navigation;
    return (
      <View>
      <Button title="Modal" onPress={() => switchToLoginActivity()} />
		<ScrollView>
			<Text style={MainScreenStyles.surveyTitle}>{this.state.survey.title}</Text><Text style={MainScreenStyles.surveyDescription}>{this.state.survey.description}</Text>
			{ this.state.q }
			{ this.state.qother }
		</ScrollView>
      </View>
    );
  }
}


export default MainScreen;
