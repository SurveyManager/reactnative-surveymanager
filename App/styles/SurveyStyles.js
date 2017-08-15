'use strict';

import {
  StyleSheet,
} from 'react-native';
import Color from 'react-native-material-color';


var SurveyStyles = StyleSheet.create({
	textBtn : {
		padding: 10,
	},
	
	otherText: {
		padding: 20,
		margin: 10,
		color: Color.Black,
		borderColor: Color.BlueGrey, 
		borderRadius: 5,
		borderWidth: 0.5, 
	},
	activeOtherText: {
		padding: 20,
		margin: 10,
		color: Color.White,
		backgroundColor: Color.BlueGrey,
		borderColor: Color.BlueGrey, 
		borderRadius: 5,
		borderWidth: 0.5, 
	},
	
	activeOpionStyle : {
		backgroundColor: Color.BlueGrey,
		borderColor: Color.BlueGrey, 
		borderRadius: 5,
		borderWidth: 0.5, 
		color: Color.White,
		padding: 20,
		margin: 10
	},
	opionStyle : {
		backgroundColor: Color.White,
		borderColor: Color.BlueGrey, 
		color: Color.Black,
		borderWidth: 0.5, 
		borderRadius: 5,
		padding: 20,
		margin: 10
	},
	tips: {
		padding: 20,
		marginTop: 20,
		color: Color.BlueGrey,
	},
	button: {
		borderWidth: 0.5, 
		borderRadius: 5,
		padding: 20,
		margin: 5,
		width: 200, 
		fontSize: 20, 
		textAlign: 'center',
		backgroundColor: Color.LightGreen,
		color: Color.White,
		
	}
});

module.exports = SurveyStyles;
