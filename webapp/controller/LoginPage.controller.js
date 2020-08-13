sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"com/prism/zpmcalcheck/util/Formatter"
], function(Controller, MessageToast, Formatter) {
	"use strict";

	return Controller.extend("com.prism.zpmcalcheck.controller.LoginPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.prism.zpmcalcheck.view.LoginPage
		 */
		onInit: function() {
			var ImagePath = jQuery.sap.getModulePath("com/prism/zpmcalcheck", "/util/loginIcon2.png");
			//var svgLogo = sap.ui.require.toUrl("com.prism.zpmcalcheck/util/loginIcon.png");
			this.getView().byId("idLoginImg").setSrc(ImagePath);

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

		},

		//UserName Validation Allowing upto 8 Digtis Only...
		onUsernameChange: function() {
			var idLoginUsername = this.getView().byId("idLoginUsername");
			var sUsername = idLoginUsername.getValue();
			if (sUsername.length > 8) {
				idLoginUsername.setValueState("Warning");
				idLoginUsername.setValueStateText("Only 8 Digits are allowed in Username");
				idLoginUsername.setValue("");
				idLoginUsername.focus();
			} else {
				idLoginUsername.setValueState("None");
			}
		},

		//on Login Button Press
		onPressLogin: function(oData) {
			this.getView().setBusy(true);
			var oErrText = this.getView().byId("idLoginErrMsg");
			var sUsername = this.getView().byId("idLoginUsername").getValue();
			var sPassword = this.getView().byId("idLoginPassword").getValue();
			var sErrString;
			oErrText.setText("");
			if (!sUsername || !sPassword) {
				this.getView().setBusy(false);
				if (!sUsername && !sPassword) {
					sErrString = "Please enter Username & Password.";
				} else if (!sUsername && sPassword) {
					sErrString = "Please enter Username.";
				} else if (sUsername && !sPassword) {
					sErrString = "Please enter Password.";
				}
				oErrText.setText(sErrString);
			} else {
				/*var LoginResultdata = {
					"Type": "",
					"Message": ""
				};*/

				var Payload = {
					"ImFlag": "LOGIN",
					"ImUsername": Formatter.padWithZeroes(sUsername, 8),
					"ImPassword": sPassword,
					"ImStatus": "",
					"LoginResult": []
				};

				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/LoginHeaderSet", Payload, {
					method: "POST",
					success: function(data) {
						this.getView().setBusy(false);
						if (data.LoginResult.results[0].Type === "S") {
							sap.ui.getCore().EmployeeCode = sUsername;
							MessageToast.show(data.LoginResult.results[0].Message, {
								closeOnBrowserNavigation: false
							});
							this.oRouter.navTo("FullPage");
						} else if (data.LoginResult.results[0].Type === "E") {
							oErrText.setText(data.LoginResult.results[0].Message);
							//this.oRouter.navTo("FullPage");
						}

					}.bind(this),
					error: function(oErr) {
						this.getView().setBusy(false);
						sap.m.MessageBox.error("Error while getting Inspection Check List.\n Please try again.", {
							title: "Unknown Error!",
							details: JSON.stringify(oErr)
								//styleClass: sResponsivePaddingClasses
						});
					}.bind(this)
				});
				//	this.oRouter.navTo("FullPage");

			}

		},

		//on Reset Button Press
		onPressResetPassword: function() {
			this.getView().setBusy(true);
			var oErrText = this.getView().byId("idLoginErrMsg");
			var sUsername = this.getView().byId("idLoginUsername").getValue();
			//var sPassword = this.getView().byId("idLoginPassword").getValue();
			var sErrString;
			oErrText.setText("");
			if (!sUsername) {
				this.getView().setBusy(false);
				sErrString = "Please enter an Username.";
				oErrText.setText(sErrString);
			} else {
				// Checking Username Valid or Not;
				var Payload = {
					"ImFlag": "NEW_CHECK",
					"ImUsername": Formatter.padWithZeroes(sUsername),
					"ImPassword": "",
					"ImStatus": "",
					"LoginResult": []
				};

				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/LoginHeaderSet", Payload, {
					method: "POST",
					success: function(data) {
						this.getView().setBusy(false);
						if (data.LoginResult.results[0].Type === "S") {

							MessageToast.show(data.LoginResult.results[0].Message, {
								closeOnBrowserNavigation: false
							});
							this.oRouter.navTo("ResetPassword", {
								EmployeeCode: sUsername
							});
						} else if (data.LoginResult.results[0].Type === "E") {
							oErrText.setText(data.LoginResult.results[0].Message);
						}

					}.bind(this),
					error: function(oErr) {
						this.getView().setBusy(false);
						sap.m.MessageBox.error("Error while getting Inspection Check List.\n Please try again.", {
							title: "Unknown Error!",
							details: JSON.stringify(oErr)
								//styleClass: sResponsivePaddingClasses
						});
					}.bind(this)
				});
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.prism.zpmcalcheck.view.LoginPage
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.prism.zpmcalcheck.view.LoginPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.prism.zpmcalcheck.view.LoginPage
		 */
		//	onExit: function() {
		//
		//	}

	});

});