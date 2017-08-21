'use strict';

import {
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Constants } from 'expo';
import Color from 'react-native-material-color';


var MainScreenStyles = StyleSheet.create({
	MainView: {
		paddingTop: Constants.statusBarHeight,
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		backgroundColor: Color.Black,
	},
	ScrollView: {
		backgroundColor: Color.White,
	},
	NavView: {
		flexDirection: 'row', 
		width: Dimensions.get('window').width, 
		backgroundColor: Color.LightGreen,
		shadowColor: '#000',
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.8,
		shadowRadius: 2,
		elevation: 5,
	},
	NavTitle: {
		color: Color.White,
		fontSize: 20,
		paddingTop:15, 
	},
	NavBtnMenu: {
		width: 60,
		margin: 5, 
		padding: 10, 
		backgroundColor: Color.Transparent,
	},
	NavBtnMenuModal: {
		width: 60,
		margin: 5, 
		padding: 5, 
		backgroundColor: Color.Transparent,
	},
	NavBtnAlert: {
		width: 60,
		margin: 5, 
		padding: 10, 
		borderRadius: 4, 
		borderWidth: 0.5, 
		borderColor: Color.Red[900], 
		backgroundColor: Color.Red,
	},
	NavBtnTxtAlert: {
		textAlign: 'center',
		color: Color.White
	},
	NavBtn: {
		width: 100,
		margin: 5, 
		padding: 10, 
		borderRadius: 4, 
		borderWidth: 0.5, 
		borderColor: Color.LightGreen[900], 
		backgroundColor: Color.LightGreen,
	},
	NavBtnNext: {
		position: 'absolute',
		bottom: 15,
		right: 20,
		backgroundColor: Color.Transparent,
	},
	NavSyncIcon : {
		position: 'absolute',
		bottom: 15,
		right: 50,
		backgroundColor: Color.Transparent,
	},
	NavBtnTxt: {
		textAlign: 'center',
		color: Color.White
	},
	surveyTitle: {
		fontSize: 20,
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		color: Color.Black,
	},
	surveyDescription: {
		fontSize: 15,
		paddingTop: 10,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		lineHeight: 25,
		color: Color.Grey,
	},
	SurveyTextBtn : {
		padding: 10,
	}

});

module.exports = MainScreenStyles;
