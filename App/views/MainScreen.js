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
		width: 140, 
	},
	NavBtn: {
		width: 60,
		margin: 5, 
		padding: 10, 
		borderRadius: 4, 
		borderWidth: 0.5, 
		borderColor: '#d6d7da', 
		backgroundColor: '#ff0000',
	},
	NavBtnTxt: {
		textAlign: 'center',
		color: '#ffffff'
	},
	surveyTitle: {
		fontSize: 20,
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 5,
		paddingRight: 5,
	},
	articleDescription: {
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
    headerRight: ( <View style={MainScreenStyles.NavView}><TouchableOpacity onPress={() => this.newSurvey()} style={MainScreenStyles.NavBtn}><Text style={MainScreenStyles.NavBtnTxt}>New</Text></TouchableOpacity><TouchableOpacity onPress={() => this.nextQuestion()} style={MainScreenStyles.NavBtn}><Text style={MainScreenStyles.NavBtnTxt}>Next</Text></TouchableOpacity></View> )
  };

  
  constructor() {
    super();
    this.state = {
      survey: false,
      q: []
    };
    survey.showLoginActivity = this.showLoginActivity;
  }
  
  doLoad = function () {
	  survey.getSurvey( function (r,e) {
			this.setState({ survey: r, q: e });
		  }.bind(this) );
  }
  showLoginActivity = function () {
		const resetAction = NavigationActions.reset({
		index: 0,
		actions: [
			NavigationActions.navigate({ routeName: 'Home'})
		]
		})
		this.props.navigation.dispatch(resetAction);

	}

 
	componentDidMount() {
		this.doLoad();
	} 

  render() {
	const { navigate } = this.props.navigation;
    return (
      <View>
		<ScrollView>
			<Text style={MainScreenStyles.surveyTitle}>{this.state.survey.title}</Text><Text style={MainScreenStyles.surveyDescription}>{this.state.survey.description}</Text>
			{ this.state.q }
		</ScrollView>
      </View>
    );
  }
}


export default MainScreen;
