sap.ui.define([
	"com/prism/zpmcalcheck/controller/BaseController",
	"sap/m/TablePersoController",
	"com/prism/zpmcalcheck/util/TablePersoService",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/message/Message",
	"../util/Formatter"
], function(BaseController, TablePersoController, TablePersoService, JSONModel, MessageToast, MessageBox, Message, Formatter) {
	"use strict";
	return BaseController.extend("com/prism/zpmcalcheck.controller.Detail", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf demo.com.FullToSplitApp.view.Detail
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (!sap.ui.getCore().EmployeeCode) {
				MessageToast.show("Please login using Employye Code.", {
					closeOnBrowserNavigation: false
				});
				// Ask User to Login
				this.oRouter.navTo("LoginPage");
			}
			this.oView = this.getView();
			this.oTaskTable = this.byId("idTaskTable");

			//Main Model 
			this.oMainModel = this.getOwnerComponent().getModel();
			// init and activate controller
			this._oTPC = new TablePersoController({
				table: this.oTaskTable,
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "com.prism.zpmcalcheck",
				persoService: TablePersoService
			}).activate();

			// Setting Message Popoper Template
			var oMessageTemplate = new sap.m.MessageItem({
				type: '{oMessageModel>type}',
				title: '{oMessageModel>title}'
			});

			// Defining MessagePopover
			this.oMessagePopover = new sap.m.MessagePopover({
				items: {
					path: 'oMessageModel>/',
					template: oMessageTemplate
				}
			});

			this.oView.setModel(new JSONModel([]), "oMessageModel");
			this.byId("idMsgPopoverBtn").addDependent(this.oMessagePopover);

			this.oDetailModel = this.getOwnerComponent().getModel("oDetailModel");

			this.oRouter.getRoute("DetailPage").attachMatched(this._onObjectMatched, this);

		},
		_onObjectMatched: function(oEvent) {
			this.oView.setBusy(true);
			var oDetailData = this.oDetailModel.getData();
			if (oDetailData) {
				this.oQueryParam = oEvent.getParameters("arguments").arguments.QueryEquipID;
				this.oQueryParam = JSON.parse(this.oQueryParam);
				var dtGltrp = null,
					sEqktx = "",
					bSubmitBtnEnabled = true;

				var oTaskList = oDetailData.ExReportData.results;

				this.byId("idNextEquipBtn").setEnabled(false);
				this.byId("idPrevEquipBtn").setEnabled(false);
				if (this.oQueryParam.PrevEquipID) {
					this.byId("idPrevEquipBtn").setEnabled(true);
				}
				if (this.oQueryParam.NextEquipID) {
					this.byId("idNextEquipBtn").setEnabled(true);
				}

				oDetailData.Equnr = this.oQueryParam.CurrEquipID;

				for (var i = 0; i < oTaskList.length; i++) {
					if (oTaskList[i].Equnr === oDetailData.Equnr) {
						sEqktx = oTaskList[i].Eqktx;
						dtGltrp = oTaskList[i].Gltrp;
						oTaskList[i].ParamValue_Enabled = true;
						oTaskList[i].Input = (oTaskList[i].Check !== "X" && oTaskList[i].Input === "") ? "OK" : oTaskList[i].Input;
						oTaskList[i].SubmitBtn_Enabled = (oTaskList[i].SubmitBtn_Enabled === undefined) ? true : oTaskList[i].SubmitBtn_Enabled;
						bSubmitBtnEnabled = oTaskList[i].SubmitBtn_Enabled;
						if (bSubmitBtnEnabled) {
							oTaskList[i].ParamValue_Visible = (oTaskList[i].Check === "X") ? false : true;
							oTaskList[i].Remark_Enabled = true;
							//	oTaskList[i].LowLimit_Enabled = (oTaskList[i].Check === "") ? false : true;
							//	oTaskList[i].UppLimit_Enabled = (oTaskList[i].Check === "") ? false : true;
						} else {
							oTaskList[i].ParamValue_Visible = false;
							oTaskList[i].Remark_Enabled = false;
							//	oTaskList[i].LowLimit_Enabled = false;
							//	oTaskList[i].UppLimit_Enabled = false;
						}
					}
				}
				oDetailData.Eqktx = sEqktx;
				oDetailData.Gltrp = dtGltrp;
				oDetailData.SubmitBtn_Enabled = bSubmitBtnEnabled;
				oDetailData.ExReportData.results = oTaskList;

				var oBinding = this.oTaskTable.getBinding("items");
				oBinding.filter();
				var oFilter = new sap.ui.model.Filter("Equnr", sap.ui.model.FilterOperator.EQ, oDetailData.Equnr);
				oBinding.filter([oFilter]);
				this.oDetailModel.setData(oDetailData);
				this.oDetailModel.refresh();
			} else {
				// Move to Back Page and Show Message Toast for error

			}
			this.oView.setBusy(false);
		},

		onPersoButtonPressed: function() {
			this._oTPC.openDialog();
		},

		onPressPrevious: function() {
			var oQueryParam = this.getPrevAndNextEquipment(this.oQueryParam.PrevEquipID);
			oQueryParam = JSON.stringify(oQueryParam);
			this.oRouter.navTo("DetailPage", {
				QueryEquipID: oQueryParam
			},false);
		},

		onPressNext: function() {
			var oQueryParam = this.getPrevAndNextEquipment(this.oQueryParam.NextEquipID);
			oQueryParam = JSON.stringify(oQueryParam);
			this.oRouter.navTo("DetailPage", {
				QueryEquipID: oQueryParam
			},false);
		},
		//message popover for the message manager errors
		onMessagePopoverPress: function(oEvent) {
			this.oMessagePopover.toggle(oEvent.getSource());
		},

		onSubmit: function() {
			var aMessages = [];
			var oTableItems = this.oTaskTable.getItems(); //[0].getBindingContext("oDetailModel").getProperty();
			var oContext;
			var ImReportData = jQuery.extend(true,[],[]);
			for (var i = 0; i < oTableItems.length; i++) {
				oContext = oTableItems[i].getBindingContext("oDetailModel").getProperty();
				ImReportData.push(oContext);
				/*if (oContext.Check === "X") {
					if (!oContext.Toleranzun1) {
						aMessages.push({
							type: "Error",
							title: "Enter a Lower Limit for Task " + oContext.Vornr + "."
						});
					}
					if (!oContext.Toleranzob1) {
						aMessages.push({
							type: "Error",
							title: "Enter an Upper Limit for Task " + oContext.Vornr + "."
						});
					}
				} else {
					if (!oContext.Input) {
						aMessages.push({
							type: "Error",
							title: "Enter a Parameter Value for Task " + oContext.Vornr + "."
						});
					}
				}*/
				if (!oContext.Input) {
						aMessages.push({
							type: "Error",
							title: "Enter a Parameter Value for Task " + oContext.Vornr + "."
						});
				}
			}
			var oMessageModel = this.getView().getModel("oMessageModel");
			oMessageModel.setData(aMessages);
			oMessageModel.refresh();
			if (aMessages.length > 0) {
				this.oMessagePopover.openBy(this.byId("idMsgPopoverBtn"));
			} else {
				var oDetailData = this.oDetailModel.getData();
				var oPayload = {
					"ImNrflag": oDetailData.ImNrflag,
					"ImNrremark": oDetailData.ImNrremark,
					"ImObjid": oDetailData.ImObjid,
					"ImOperation": "MOD",
					"ImPernr": Formatter.padWithZeroes(oDetailData.ImPernr), //oInputParamData.EmployeeCode,
					"ImSchman": oDetailData.ImSchman,
					"ImFromdt": null,
					"ImTodt": null,
					"ImWerks": oDetailData.ImWerks,
					"ImDate": [],
					"ImReportData": [],
					"ImObjectType": [],
					"ImEquipment": [],
					"ExReportData": [],
					"ExErrorMessage": []
				};
				oPayload.ImDate.push({
					"Sign": "I",
					"Option": "EQ",
					"Low": Formatter.getPostDateFormat(oDetailData.Gltrp),
					"High": null
				});

				oPayload.ImEquipment.push({
					"Sign": "I",
					"Option": "EQ",
					"Low": oDetailData.Equnr,
					"High": ""
				});
				ImReportData = ImReportData.filter(function(props) {
					delete props.ParamValue_Visible;
					delete props.ParamValue_Enabled;
					delete props.SubmitBtn_Enabled;
					delete props.Remark_Enabled;
					//	delete props.LowLimit_Enabled;
					//	delete props.UppLimit_Enabled;
					delete props.__metadata;
					delete props.__proto__;
					props.Gltrp = Formatter.getPostDateFormat(props.Gltrp);
					props.Gstrp = Formatter.getPostDateFormat(props.Gstrp);
					return true;
				});
				oPayload.ImReportData = ImReportData;

				this.getView().setBusy(true);
				// Calling Service
				this.oMainModel.create("/InspCheckHeaderSet", oPayload, {
					method: "POST",
					success: this.onSuccessGetInspCheckList.bind(this),
					error: this.onErrorGetInspCheckList.bind(this)
				});
			}

		},

		onSuccessGetInspCheckList: function(oData) {
			this.getView().setBusy(false);
			var aMessages = [],
				bErrorFound = false,
				sSuccessMessage = "";
			// Checking Error Messages
			var oExErrorMessages = oData.ExErrorMessage.results;
			for (var i = 0; i < oExErrorMessages.length; i++) {

				if (oExErrorMessages[i].Type === "E") {
					bErrorFound = true;
					aMessages.push({
						type: "Error",
						title: oExErrorMessages[i].Message
					});

				} else if (oExErrorMessages[i].Type === "W") {
					bErrorFound = true;
					aMessages.push({
						type: "Warning",
						title: oExErrorMessages[i].Message
					});
				} else if (oExErrorMessages[i].Type === "I") {
					sSuccessMessage = oExErrorMessages[i].Message;
					aMessages.push({
						type: "Information",
						title: oExErrorMessages[i].Message
					});
				} else if (oExErrorMessages[i].Type === "S") {
					sSuccessMessage = oExErrorMessages[i].Message;
					aMessages.push({
						type: "Success",
						title: oExErrorMessages[i].Message
					});
				}

			}
			if (aMessages.length > 0 && sSuccessMessage === "") {
				var oMessageModel = this.getView().getModel("oMessageModel");
				oMessageModel.setData(aMessages);
				oMessageModel.refresh();
				this.oMessagePopover.toggle(this.byId("idMsgPopoverBtn"));
			}
			// If no error found move to Master Detail Page
			if (!bErrorFound || sSuccessMessage !== "") {
				MessageToast.show(sSuccessMessage);
				var oDetailData = this.oDetailModel.getData();
				var oTaskList = oDetailData.ExReportData.results;
				oDetailData.SubmitBtn_Enabled = false;
				for (i = 0; i < oTaskList.length; i++) {
					if (oTaskList[i].Equnr === oDetailData.Equnr) {
						oTaskList[i].ParamValue_Enabled = false;
						oTaskList[i].Remark_Enabled = false;
						oDetailData.SubmitBtn_Enabled = false;
					}
				}
				oDetailData.ExReportData.results = oTaskList;
				this.oDetailModel.setData(oDetailData);
				this.oDetailModel.refresh();
			}

		},
		onErrorGetInspCheckList: function(oErr) {
			this.getView().setBusy(false);
			MessageBox.error("Error while getting Inspection Check List.\n Please try again.", {
				title: "Unknown Error!",
				details: JSON.stringify(oErr)
					//styleClass: sResponsivePaddingClasses
			});

		},
		navToMaster: function() {
			/*var sPreviousHash = sap.ui.core.routing.History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("SplitAppMaster", {}, true);
			}*/
			this.getRouter().navTo("SplitAppMaster", {}, true);
		}
	});
});