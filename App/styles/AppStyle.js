'use strict';

import {
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Constants } from 'expo';
import Color from 'react-native-material-color';


var AppStyle = StyleSheet.create({
	Main: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		backgroundColor: Color.Black,
	},
	MenuHeader: {
		fontSize: 20,
		paddingTop: 50,
		paddingBottom: 50,
		paddingLeft: 10,
		paddingRight: 10,
		lineHeight: 25,
		textAlign: 'left',
		color: Color.LightGreen,
		backgroundColor: Color.Black, 
		shadowColor: '#000',
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.8,
		shadowRadius: 2,
		elevation: 5,
	},
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.Gray,
    paddingTop: Constants.statusBarHeight,
  },
  MenuModal: {
	  backgroundColor: Color.Transparent,
  },
  MenuModalInner: {
		backgroundColor: Color.White, 
	},
	MenuModalButton: {
		paddingTop: 5,
		paddingBottom: 10,
		paddingLeft: 5,
		paddingRight: 5,
	},
	MenuModalButtonLogout: {
		paddingTop: 40,
		paddingLeft: 5,
		paddingRight: 5,
		paddingBottom: 5,
	},

	MenuModalButtonTxt: {
		padding: 10,
		textAlign: 'left',
		color: Color.Black
	},
	MenuModalTxt: {
		padding: 5,
		textAlign: 'right',
		color: Color.Black
	},
	modal: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		flex: 1,
		justifyContent: 'center',
		padding: 20,
	},
	modalInner: {
		backgroundColor: Color.White, 
		padding: 20,
		borderRadius: 10,
		alignItems: 'center',
	},
	modalButtons: {
		flexDirection: 'row', 
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalButton: {
		margin: 10,
		width: 100,
	},
	modalTxt: {
		margin: 10,
	},
	LoginText : {
		width: 200,
		padding: 10,
	},
	statusBar: {
		backgroundColor: Color.LightGreen,
	}

});

module.exports = AppStyle;
