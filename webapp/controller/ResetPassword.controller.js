sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	var validation;
	var opswd;
	var ocnfrmpswd;
	var oErrText;
	var sErrString;
	var opswdVal;
	var ocnfrmpswdVal;

	return Controller.extend("com.prism.zpmcalcheck.controller.ResetPassword", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.prism.zpmcalcheck.view.LoginPage
		 */

		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			validation = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
			opswd = this.byId("idPassword");
			ocnfrmpswd = this.byId("idConfirmPassword");
			oErrText = this.byId("idResetErrMsg");
			opswdVal = opswd.getValue();
			ocnfrmpswdVal = ocnfrmpswd.getValue();
			oErrText.setText("");

				this.oRouter.getRoute("ResetPassword").attachMatched(this._onRouteMatched, this);
				// Hint: we don't want to do it this way
				/*this.oRouter.attachRouteMatched(function(oEvent) {
					var sRouteName, oArgs, oView;
					sRouteName = oEvent.getParameter("name");
					if (sRouteName === "ResetPassword") {
						this._onRouteMatched(oEvent);
					}
				}, this);**/

		},
		_onRouteMatched:function(oEvent){
			this.EmployeeCode = oEvent.getParameters("arguments").arguments.EmployeeCode;
		},
		
		onNavPress: function() {
			this.oRouter.navTo("LoginPage");
		},

		onChange1: function() {
			if (opswd.getValue().match(validation)) {
				ocnfrmpswd.focus();
				opswd.setValueState("None");
				opswd.focus();
			} else {
				sErrString =
					"Please Match the required Format";
				opswd.setValueState("Error");
				oErrText.setText("sErrString");
				opswd.setValueStateText("Please Match the required Format");

			}
			oErrText.setText(sErrString);

		},

		onChange2: function() {
			if (opswd.getValue() !== ocnfrmpswd.getValue()) {
				sErrString =
					"Passwords doesn't Match !";
				ocnfrmpswd.setValueState("Error");
				ocnfrmpswd.setValueStateText("Passwords doesn't Match !");

			} else if (!ocnfrmpswd.getValue().match(validation)) {
				sErrString =
					"Please Match the required Format";
				ocnfrmpswd.setValueState("Error");
				ocnfrmpswd.setValueStateText("Please Match the required Format");
			} else {
				ocnfrmpswd.setValueState("None");
				opswd.setValueState("None");
				sErrString = "";
			}
			oErrText.setText(sErrString);
		},
		
		//switch button show password event
		onShow: function() {
			var showPassword = this.byId("showPassword");
			if (showPassword.getState("true")) {
				ocnfrmpswd.setType("Text");
				opswd.setType("Text");
			} else {
				ocnfrmpswd.setType("Password");
				opswd.setType("Password");
			}
		},
		
		//on Reset Button Press
		onPressReset: function() {
			var sPassword = opswd.getValue();
			var sConfirmPassword = ocnfrmpswd.getValue();
			if (sPassword === "" && sConfirmPassword === "") {
				sErrString = "Please Enter Passwords";
				oErrText.setText(sErrString);
			} else {
				var oPayload = {
					"ImFlag": "RESET",
					"ImUsername": this.EmployeeCode,//"sUsername",
					"ImPassword": sConfirmPassword,
					"ImStatus": "",
					"LoginResult": []
				};

				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/LoginHeaderSet", oPayload, {
					method: "POST",
					success: function(data) {
					
						if (data.LoginResult.results[0].Type === "S") {
							MessageToast.show(data.LoginResult.results[0].Message,{closeOnBrowserNavigation: false});
							this.oRouter.navTo("LoginPage");
						} else if (data.LoginResult.results[0].Type === "E") {
							oErrText.setText(data.LoginResult.results[0].Message);
						}
					}.bind(this),
					error: function() {

					}
				});

			}

		}

	});

});