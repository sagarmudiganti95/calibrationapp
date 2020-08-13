sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/message/Message",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/model/BindingMode",
	"sap/ui/model/type/String",
	"sap/m/ColumnListItem",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/comp/library",
	"sap/ui/core/library",
	"sap/ui/model/FilterType",
	"sap/m/MessageBox",
	"com/prism/zpmcalcheck/util/Formatter",
	"sap/ui/model/resource/ResourceModel"
], function(Controller, Message, JSONModel, MessagePopover, MessagePopoverItem, BindingMode, typeString, ColumnListItem,
	Filter, FilterOperator, compLibrary, library, FilterType, MessageBox, Formatter, ResourceModel) {
	"use strict";

	var ValueState = library.ValueState;
	var MessageType = library.MessageType;
	var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

	return Controller.extend("com.prism.zpmcalcheck.controller.FullPage", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf demo.com.FullToSplitApp.view.FullPage
		 */

		onInit: function() {
			//Init Function Satrted...

			//Main Model for whole project.
			this.oMainModel = this.getOwnerComponent().getModel();

			//initially a model is defined for plant, object type and equipment code field...
			var oInitialLoadData = {
				"PlantList": "",
				"ObjectTypeList": "",
				"EquipmentList": ""
			};
			this.oInitialLoadModel = new JSONModel(oInitialLoadData);
			this.oInitialLoadModel.setSizeLimit(10000);
			this.getView().setModel(this.oInitialLoadModel, "oInitialLoadModel");

			//Columns Model for Equipment Code Value Help Dialog
			this.oColEquipModel = new sap.ui.model.json.JSONModel();
			this.oColEquipModel.setData({
				"cols": [{
					"label": "Equipment Code",
					"template": "Equnr",
					"width": "5rem"
				}, {
					"label": "Description",
					"template": "Eqktx"

				}]
			});

			//Columns Model for Object Type Value Help Dialog
			this.oColObjTypeModel = new sap.ui.model.json.JSONModel();
			this.oColObjTypeModel.setData({
				"cols": [{
					"label": "Object Type",
					"template": "Eqart",
					"width": "5rem"
				}, {
					"label": "Description",
					"template": "Eartx"

				}]
			});

			var oInputParamData = this.getInitialInputParamPayload();

			this.oInputParamModel = new JSONModel(oInputParamData); // oviewmodel change 
			this.oInputParamModel.setSizeLimit(10000);
			this.getView().setModel(this.oInputParamModel, "oInputParamModel");

			//this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			//Setting Message Popoper Template
			var oMessageTemplate = new sap.m.MessageItem({
				type: '{oMessageModel>type}',
				title: '{oMessageModel>title}'
			});

			//Defining MessagePopover
			this.oMessagePopover = new sap.m.MessagePopover({
				items: {
					path: 'oMessageModel>/',
					template: oMessageTemplate
				}
			});

			this.oView.setModel(new JSONModel([]), "oMessageModel");
			this.byId("idMsgPopoverBtn").addDependent(this.oMessagePopover);

			//adding multiinput validators for object and equipment value help dialogs
			var ObjectType = this.getView().byId("ObjectType");
			var EquipCode = this.getView().byId("EquipCode");
			// ObjectType.addValidator(this._onObjectTypeMultiInputValidate);
			EquipCode.addValidator(this._onEquipCodeMultiInputValidate);

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("FullPage").attachMatched(this._onObjectMatched, this);

			// set i18n model on view
			/*var i18nModel = new ResourceModel({
				bundleName: "com.prism.zpmcalcheck.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");*/
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			//load model for plant, object type, and equipment code fields using call in batches initially...
			this.loadAllF4Helps();

		},

		/**
		 * Trigerred on Route Match event of Route 'FullPage'
		 */
		_onObjectMatched: function() {
			// Check whether User is already Logged In or Not
			if (!sap.ui.getCore().EmployeeCode) {
				var Msg = this.oBundle.getText("LoginError");
				sap.m.MessageToast.show(Msg, {
					closeOnBrowserNavigation: false
				}, true);

				// Navigate to Login Application Page as User is not logged in
				this.oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
				this.oCrossAppNav.toExternal({
					target: {
						semanticObject: "zpm_so_login",
						action: "display"
					}
				}, false);
			} else {
				// Set logged in Employee Code to Model
				this.oInputParamModel.getData().EmployeeCode = sap.ui.getCore().EmployeeCode;
				this.oInputParamModel.refresh();
			}
		},

		/**
		 * Batch Calls Loading Initially for All F4 Helps and DropDown..
		 */
		loadAllF4Helps: function() {

			this.getView().setBusy(true);
			this.oMainModel.setChangeGroups({
				sPath: {
					groupId: "myId"
				}
			});
			this.oMainModel.setDeferredGroups(["myId"]);
			this.oMainModel.read("/PlantSet", {
				groupId: "myId"
			});
			this.oMainModel.read("/ObjectTypeSet", {
				groupId: "myId"
			});
			this.oMainModel.read("/EquipmentSet", {
				groupId: "myId"
			});

			this.oMainModel.submitChanges({
				groupId: "myId",
				success: function(oData, oResponse) {
					this.getView().setBusy(false);
					var oInitialLoadData = this.oInitialLoadModel.getData();
					//Binding for plant field...
					if (oData.__batchResponses[0].statusCode === "200") {
						//oData.__batchResponses[0].data.results
						oInitialLoadData.PlantList = oData.__batchResponses[0].data.results;

					}

					//Binding for Object type field...
					if (oData.__batchResponses[1].statusCode === "200") {
						oInitialLoadData.ObjectTypeList = oData.__batchResponses[1].data.results;
					}

					//Binding for Equipment field...
					if (oData.__batchResponses[2].statusCode === "200") {
						oInitialLoadData.EquipmentList = oData.__batchResponses[2].data.results;
					}

					this.oInitialLoadModel.setData(oInitialLoadData);
					this.oInitialLoadModel.refresh();
				}.bind(this),
				error: function(oData, oResponse) {
					this.getView().setBusy(false);
					var Msg = this.oBundle.getText("LoadModelError");
					MessageBox.error(Msg, {
						title: "Unknown Error!"
					});
				}.bind(this)

			});
		},

		/**
		 * Plant onChange Event Triggered for validation
		 */
		onChangePlant: function(oEvent) {

			var newval = oEvent.getParameter("newValue");
			var key = oEvent.getSource().getSelectedItem();
			var sKey = oEvent.getSource().getSelectedKey(); // key for filtering in workcentre
			if (newval !== "" && key === null) {
				this.oInputParamModel.setProperty("/Plant_ValueState", "Warning");
				var Msg = this.oBundle.getText("ValidPlantError");
				this.oInputParamModel.setProperty("/Plant_ValueStateText", Msg);
				oEvent.getSource().setValue("");
				oEvent.getSource().focus();
			} else {
				//pass the selected key from plant and call the workcenter on plant select.
				this.oInputParamModel.setProperty("/Plant_ValueState", "None");
				var PlantFilter = new sap.ui.model.Filter({
					path: "Werks",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: sKey
				});
				var oFilters = new Array();
				oFilters.push(PlantFilter);
				var that = this;
				//var oWorkCenter = this.byId("WorkCenter");
				this.getView().setBusy(true);
				this.oMainModel.read("/WorkCenterSet", {
					filters: oFilters,
					success: function(oData) {
						this.getView().setBusy(false);
						if (oData.results) {
							var oInputParamData = this.oInputParamModel.getData();
							oInputParamData.WorkCenters = oData.results;
							this.oInputParamModel.setData(oInputParamData);
							this.oInputParamModel.refresh();
						}
					}.bind(this),
					error: function(oErr) {
						this.getView().setBusy(false);
						var Msg = this.oBundle.getText("WorkCenterLoadError");
						MessageBox.error(Msg, {
							title: "Unknown Error!",
							details: JSON.stringify(oErr),
							styleClass: sResponsivePaddingClasses
						});
					}.bind(this)
				});
			}
		},

		/**
		 * WorkCenter onChange Event Triggered for validation
		 */
		onChangeWorkCentre: function(oEvent) {
			var newval = oEvent.getParameter("newValue");
			var key = oEvent.getSource().getSelectedItem();

			if (newval !== "" && key === null) {
				this.oInputParamModel.setProperty("/WorkCenter_ValueState", "Warning");
				var Msg = this.oBundle.getText("ValidWorkCenterError");
				this.oInputParamModel.setProperty("/WorkCenter_ValueStateText", Msg);
				oEvent.getSource().setValue("");
				oEvent.getSource().focus();
			} else {
				this.oInputParamModel.setProperty("/WorkCenter_ValueState", "None");
			}
		},
		
		/**
		 * ObjectType onChange Event Triggered for validation
		 */
		onChangeObjectType: function(oEvent) {
			var newval = oEvent.getParameter("newValue");
			var key = oEvent.getSource().getSelectedItem();

			if (newval !== "" && key === null) {
				this.oInputParamModel.setProperty("/ObjectType_ValueState", "Warning");
				var Msg = this.oBundle.getText("ValidObjTypeError");
				this.oInputParamModel.setProperty("/ObjectType_ValueStateText", Msg);
				oEvent.getSource().setValue("");
				oEvent.getSource().focus();
			} else {
				this.oInputParamModel.setProperty("/ObjectType_ValueState", "None");
			}
		},

		/**
		 * Date Range onChange Event Triggered for validation
		 */
		onChangeDate: function(oEvent) {
			var bValid = oEvent.getParameter("valid");
			if (bValid) {
				this.oInputParamModel.setProperty("/Date_ValueState", "None");
			} else {
				this.oInputParamModel.setProperty("/Date_ValueState", "Warning");
				var Msg = this.oBundle.getText("ValidDateError");
				this.oInputParamModel.setProperty("/Date_ValueStateText", Msg);
				oEvent.getSource().setValue("");
				oEvent.getSource().focus();
			}
		},

		/**
		 * Object Type Value Helps Field functions
		 */
/*
		//Object Type on Change Validation event is Triggered
		onChangeObjectType: function(oEvent) {
			var newval = oEvent.getParameter("newValue");
			var tokens = oEvent.getSource().getSelectedItem();

			if (newval !== "" && tokens === null) {
				this.oInputParamModel.setProperty("/ObjectType_ValueState", "Warning");
				var Msg = this.oBundle.getText("ValidObjTypeError");
				this.oInputParamModel.setProperty("/ObjectType_ValueStateText", Msg );
				oEvent.getSource().setValue("");
				oEvent.getSource().focus();
			} else {
				this.oInputParamModel.setProperty("/ObjectType_ValueState", "None");
			}
		},

		//on Value Help Request Triggered
		onObjectTypeValueHelpRequested: function() {
			var aCols = this.oColObjTypeModel.getData().cols;
			this._oBasicSearchField = new sap.m.SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialog = sap.ui.xmlfragment("com.prism.zpmcalcheck.fragments.ObjTypeValueHelpDialog",
				this);
			this.getView().addDependent(this._oValueHelpDialog);

			//setting the range table for conditions in value help
			this._oValueHelpDialog.setRangeKeyFields([{
				label: "Object Type",
				key: "Eqart",
				type: "string"
			}]);

			var oFilterBar = this._oValueHelpDialog.getFilterBar();
			oFilterBar.setFilterBarExpanded(false);
			oFilterBar.setBasicSearch(this._oBasicSearchField);

			this._oValueHelpDialog.getTableAsync().then(function(oTable) {
				oTable.setModel(this.oInitialLoadModel);
				oTable.setModel(this.oColObjTypeModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/ObjectTypeList");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/ObjectTypeList", function() {
						return new ColumnListItem({
							cells: aCols.map(function(column) {
								return new sap.m.Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			var ObjectType = this.getView().byId("ObjectType");
			this._oValueHelpDialog.setTokens(ObjectType.getTokens());
			this._oValueHelpDialog.open();
		},

		//Object Type Value Help OK Press
		onObjectTypeValueHelpOkPress: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			var ObjectType = this.getView().byId("ObjectType");
			ObjectType.setTokens(aTokens);
			this._oValueHelpDialog.close();
		},

		//Object Type Value Help CANCEL Press
		onObjectTypeValueHelpCancelPress: function() {
			this._oValueHelpDialog.close();
		},

		//Object Type Value Help After Close Press
		onObjectTypeValueHelpAfterClose: function() {
			this._oValueHelpDialog.destroy();
		},

		//Object Type Value Help Filter Bar Search
		onObjectTypeValueHelpFilterBarSearch: function(oEvent) {
			var sSearchQuery = this._oBasicSearchField.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function(aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			aFilters.push(new Filter({
				filters: [
					new Filter({
						path: "Eqart",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Eartx",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					})
				],
				and: false
			}));

			this._ObjectTypeValueHelpFilterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		//Object Type Value Help Filtered Table
		_ObjectTypeValueHelpFilterTable: function(oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function(oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		},

		//Object Type Value Help Multi input validdate
		_onObjectTypeMultiInputValidate: function(oArgs) {
			if (oArgs.suggestionObject) {
				var oObject = oArgs.suggestionObject.getBindingContext("oInitialLoadModel").getObject(),
					oToken = new sap.m.Token();

				oToken.setKey(oObject.Eqart);
				oToken.setText(oObject.Eartx + " (" + oObject.Eqart + ")");
				return oToken;
			}

			return null;
		},
*/
		/**
		 * Equipment Code Value Helps Field functions
		 */

		//Equipment Code on Change Validation event is Triggered
		onChangeEquipCode: function(oEvent) {
			var newval = oEvent.getParameter("newValue");
			var tokens = oEvent.getSource().getSelectedItem();

			if (newval !== "" && tokens === null) {
				this.oInputParamModel.setProperty("/EquipCode_ValueState", "Warning");
				var Msg = this.oBundle.getText("ValidEquipCodeError");
				this.oInputParamModel.setProperty("/EquipCode_ValueStateText", Msg);
				oEvent.getSource().setValue("");
				oEvent.getSource().focus();
			} else {
				this.oInputParamModel.setProperty("/EquipCode_ValueState", "None");
			}
		},

		//Equipment Code Value Help Requested
		onEquipCodeValueHelpRequested: function() {
			var aCols = this.oColEquipModel.getData().cols;
			this._oBasicSearchField = new sap.m.SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialog = sap.ui.xmlfragment("com.prism.zpmcalcheck.fragments.EquipCodeValueHelpDialog",
				this);
			this.getView().addDependent(this._oValueHelpDialog);

			//setting the range table for conditions in value help
			this._oValueHelpDialog.setRangeKeyFields([{
					label: "Equipment Code",
					key: "Equnr",
					type: "string"
				}
			]);

			var oFilterBar = this._oValueHelpDialog.getFilterBar();
			oFilterBar.setBasicSearch(this._oBasicSearchField);

			this._oValueHelpDialog.getTableAsync().then(function(oTable) {
				oTable.setModel(this.oInitialLoadModel);
				oTable.setModel(this.oColEquipModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/EquipmentList");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/EquipmentList", function() {
						return new ColumnListItem({
							cells: aCols.map(function(column) {
								return new sap.m.Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			var EquipCode = this.getView().byId("EquipCode");
			this._oValueHelpDialog.setTokens(EquipCode.getTokens());
			this._oValueHelpDialog.open();

		},

		//value help dialog for Equipment code OK Press
		onEquipCodeValueHelpOkPress: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			var EquipCode = this.getView().byId("EquipCode");
			EquipCode.setTokens(aTokens);
			this._oValueHelpDialog.close();
		},

		//value help dialog for Equipment code CANCEL Press
		onEquipCodeValueHelpCancelPress: function() {
			this._oValueHelpDialog.close();
		},

		//value help dialog for Equipment code After Close 
		onEquipCodeValueHelpAfterClose: function() {
			this._oValueHelpDialog.destroy();
		},

		//value help dialog for Equipment code Filter Bar Search
		onEquipCodeValueHelpFilterBarSearch: function(oEvent) {

			var sSearchQuery = this._oBasicSearchField.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function(aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			aFilters.push(new Filter({
				filters: [
					new Filter({
						path: "Equnr",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					}),
					new Filter({
						path: "Eqktx",
						operator: FilterOperator.Contains,
						value1: sSearchQuery
					})
				],
				and: false
			}));

			this._onEquipCodeValueHelpfilterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		//value help dialog for Equipment code Filter Table
		_onEquipCodeValueHelpfilterTable: function(oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function(oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		},

		//value help dialog for Equipment code Multi Input Validation
		_onEquipCodeMultiInputValidate: function(oArgs) {
			if (oArgs.suggestionObject) {
				var oObject = oArgs.suggestionObject.getBindingContext("oInitialLoadModel").getObject(),
					oToken = new sap.m.Token();

				oToken.setKey(oObject.Equnr);
				oToken.setText(oObject.Eqktx + " (" + oObject.Equnr + ")");
				return oToken;
			}

			return null;
		},

		/**
		 * Radio Button Selection Change Event is Triggered.
		 */
		onSelectCallType: function(oEvent) {
			/*var oIndex = oEvent.getParameter("selectedIndex");
			this.oInputParamModel.getData();*/
		},

		/**
		 * NDC Barcode Scanner functionality
		 */
		onscan: function() {
			sap.ndc.BarcodeScanner.scan(
				function(mResult) {

				},
				function(Error) {
					//	alert("Scanning failed: " + Error);
				}
			);
		},

		/**
		 * Message Popover Button Click Event Triggered
		 */
		onMessagePopoverPress: function(oEvent) {
			this.oMessagePopover.toggle(oEvent.getSource());
		},

		//Navigate to Next Page from Detail 
		NavToNextPage: function() {
			this.oRouter.navTo("SecondFullPage");
		},

		/**
		 * Initial PayLoad Function
		 */
		getInitialInputParamPayload: function() {

			return ({
				"EmployeeCode": "", // Employee Code
				"Plant": "", // Plant Key
				"Plant_ValueState": "None", // Plant Value State
				"Plant_ValueStateText": "", // Plant Value State Text
				"WorkCenter": "", // Work Center Key
				"ObjectType": "", // ObjectType Key
				"WorkCenter_ValueState": "None", // Work Center State
				"WorkCenter_ValueStateText": "", // Work Center State Text
				"DateRange": null,
				"Date_ValueState": "None",
				"Date_ValueStateText": "",
				// "oObjectTypes": [],    Commented by Sagar bcoz suggestion items wasnt working with this...
				"ObjectType_ValueState": "None",
				"ObjectType_ValueStateText": "",
				// "oEquipCodes": [],    Commented by Sagar bcoz suggestion items wasnt working with this...
				"EquipCode_ValueState": "None",
				"EquipCode_ValueStateText": "",
				"CallType": 0,
				"WorkCenters": [], //Work Center Dropdow Values
				"Plants": [] //Plant DropDown Values..
			});
		},

		/**
		 * on Reset Function is Triggered to Reset the Complete data from Form and Error Messages
		 */
		onReset: function() {
			//reset the complete form
			var oInputParamData = this.getInitialInputParamPayload();
			oInputParamData.EmployeeCode = sap.ui.getCore().EmployeeCode;
			this.oInputParamModel.setData(oInputParamData);

			//remove the tokens selected from fields on reset
			var EquipCode = this.getView().byId("EquipCode");
			var ObjectType = this.getView().byId("ObjectType");
			EquipCode.removeAllTokens();
			ObjectType.removeAllTokens();

			//remove error messages on reset
			var oMessageModel = this.getView().getModel("oMessageModel");
			oMessageModel.setData([]);
			oMessageModel.refresh();

		},

		/**
		 * Object Type Value Help Handling of Define Conditions
		 */
		getRangeValueObject: function(oValue) {
			var oObject = {
				"Sign": "",
				"Option": "",
				"Low": "",
				"High": ""
			};
			if (oValue.exclude) {
				oObject.Sign = "E";
			} else {
				oObject.Sign = "I";
			}

			oObject.Low = (oValue.value1 !== null || oValue.value1 !== undefined || oValue.value1 !== "") ? oValue.value1 : "";
			oObject.High = (oValue.value2 !== null || oValue.value2 !== undefined || oValue.value2 !== "") ? oValue.value2 : "";
			oObject.Option = oValue.operation;

			return oObject;
		},

		/**
		 * Validation of Form and Submitting on Continue Button Press
		 */
		onContinue: function() {
			var aMessages = [];
			var oData = this.oInputParamModel.getData();
			if (oData.Plant === "") {
				this.oInputParamModel.setProperty("/Plant_ValueState", "Error");
				aMessages.push({
					type: "Error",
					title: this.oBundle.getText("PlantError")
				});
			}
			if (oData.WorkCenter === "") {
				this.oInputParamModel.setProperty("/WorkCenter_ValueState", "Error");
				aMessages.push({
					type: "Error",
					title: this.oBundle.getText("WorkCenterError")
				});
			}

			var ObjectType = this.byId("ObjectType");
			// var ObjectTypeTokens = ObjectType.getTokens();

			if (oData.ObjectType === "") {
				this.oInputParamModel.setProperty("/ObjectType_ValueState", "Error");
				aMessages.push({
					type: "Error",
					title: this.oBundle.getText("ObjectTypeError")
				});
			}

			if (oData.DateRange === null) {
				this.oInputParamModel.setProperty("/Date_ValueState", "Error");
				aMessages.push({
					type: "Error",
					title: this.oBundle.getText("DateRangeError")
				});
			}

			var oMessageModel = this.getView().getModel("oMessageModel");
			oMessageModel.setData(aMessages);
			oMessageModel.refresh();
			
			if (aMessages.length > 0) {
				this.oMessagePopover.openBy(this.byId("idMsgPopoverBtn"));
			} else {
				this.oInputParamModel.setProperty("/EquipCode_ValueState", "None");
				this.oInputParamModel.setProperty("/ObjectType_ValueState", "None");
				this.getInspectionCheckList();

			}
		},

		/**
		 * Get CheckList on Continue 
		 */
		getInspectionCheckList: function() {
			this.getView().setBusy(true);
			// Get User Input data from Model
			var oInputParamData = this.getView().getModel("oInputParamModel").getData();
			var i, oObj;

			var oPayload = {
				"ImNrflag": "",
				"ImNrremark": "",
				"ImObjid": oInputParamData.WorkCenter,
				"ImOperation": "GET",
				"ImPernr": oInputParamData.EmployeeCode,
				"ImSchman": (oInputParamData.CallType === 0) ? "X" : "", //"X",
				"ImFromdt": null,
				"ImTodt": null,
				"ImWerks": oInputParamData.Plant,
				"ImDate": [],
				"ImReportData": [],
				"ImObjectType": oInputParamData.ObjectType, //ObjectType.getTokens(), //previously it was array []...
				"ImEquipment": [], //EquipCode.getTokens(), //previously it was array []...
				"ExReportData": [],
				"ExErrorMessage": []
			};

			var aToFromDate = oInputParamData.DateRange.split(" - ");
			if (aToFromDate[0] === aToFromDate[1]) {
				oPayload.ImDate.push({
					"Sign": "I",
					"Option": "EQ",
					"Low": Formatter.getPostDateFormat(aToFromDate[0]),
					"High": null
				});
			} else {
				oPayload.ImDate.push({
					"Sign": "I",
					"Option": "BT",
					"Low": Formatter.getPostDateFormat(aToFromDate[0]),
					"High": Formatter.getPostDateFormat(aToFromDate[1])
				});
			}

			//commented as of now by sagar bcoz we r proceeding as per the sap ui5 sample design...
			var EquipCodeTokens = this.byId("EquipCode").getTokens();
			for (i = 0; i < EquipCodeTokens.length; i++) {
				// Checking whether token has range (User Define) selection or actual values
				if (EquipCodeTokens[i].getKey().indexOf("range") !== -1) {
					oObj = this.getRangeValueObject(EquipCodeTokens[i].getAggregation("customData")[0].getProperty("value"));
					oPayload.ImEquipment.push(oObj);
				} else {
					oPayload.ImEquipment.push({
						"Sign": "I",
						"Option": "EQ",
						"Low": EquipCodeTokens[i].getKey(),
						"High": ""
					});
				}
			}

			var ObjectTypeTokens = this.byId("ObjectType").getTokens();
			for (i = 0; i < ObjectTypeTokens.length; i++) {
				// Checking whether token has range (User Define) selection or actual values
				if (ObjectTypeTokens[i].getKey().indexOf("range") !== -1) {
					oObj = this.getRangeValueObject(ObjectTypeTokens[i].getAggregation("customData")[0].getProperty("value"));
					oPayload.ImObjectType.push(oObj);
				} else {
					oPayload.ImObjectType.push({
						"Sign": "I",
						"Option": "EQ",
						"Low": ObjectTypeTokens[i].getKey(),
						"High": ""
					});
				}
			}

			this.oMainModel.create("/InspCheckHeaderSet", oPayload, {
				method: "POST",
				success: this.onSuccessGetInspCheckList.bind(this),
				error: this.onErrorGetInspCheckList.bind(this)
			});

		},
		/**
		 * Called on Event of oData Service Success
		 */
		onSuccessGetInspCheckList: function(oData) {
			this.getView().setBusy(false);
			var oMessage, bErrorFound = false;
			// Checking Error Messages
			var oExErrorMessages = oData.ExErrorMessage.results;
			for (var i = 0; i < oExErrorMessages.length; i++) {

				if (oExErrorMessages[i].Type === "E") {
					bErrorFound = true;
					oMessage = new Message({
						message: oExErrorMessages[i].Message,
						type: MessageType.Error
					});
				} else if (oExErrorMessages[i].Type === "W") {
					bErrorFound = true;
					oMessage = new Message({
						message: oExErrorMessages[i].Message,
						type: MessageType.Warning
					});
				} else if (oExErrorMessages[i].Type === "I") {
					bErrorFound = true;
					oMessage = new Message({
						message: oExErrorMessages[i].Message,
						type: MessageType.Information
					});
				}
				sap.ui.getCore().getMessageManager().addMessages(oMessage);
			}
			// If no error found move to Master Detail Page
			if (!bErrorFound) {
				if (!oData.ExReportData.results || oData.ExReportData.results.length === 0) {
					var Msg = this.oBundle.getText("SelectionCriteriaError");
					MessageBox.error(Msg, {
						title: "No Result Found!",
						styleClass: sResponsivePaddingClasses
					});
				} else {
					this.getOwnerComponent().getModel("oDetailModel").setData(oData);
					this.oRouter.navTo("SplitAppMaster");
				}
			}

		},
		
		/**
		 * Called on Event of oData Service Error
		 */
		onErrorGetInspCheckList: function(oErr) {
			this.getView().setBusy(false);
				var Msg = this.oBundle.getText("ErrorCheckList");
			MessageBox.error(Msg, {
				title: "Unknown Error!",
				details: JSON.stringify(oErr),
				styleClass: sResponsivePaddingClasses
			});
		}

		
	});

});