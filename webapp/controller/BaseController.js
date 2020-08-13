sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/Device"
], function(Controller, History, UIComponent,Device) {
	"use strict";
	var oMasterList;
	return Controller.extend("com.prism.zpmcalcheck.controller.BaseController", {

		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome", {}, true /*no history*/);
			}
		},
		
		/**
		 * Parameters - sCurrEquipID - Current Equipment Code
		 * Called to get Previous & Next Equipment Code based on current passed value
		 * Return Previous, Current & Next Equipment code in Object to be used as Navigation Parameter
		 * @memberOf BaseController & Wherever BaseController has used
		 */
		getPrevAndNextEquipment: function(sCurrEquipID){
			var oQuery = {
				"CurrEquipID":sCurrEquipID,
				"PrevEquipID":"",
				"NextEquipID":""
			};
			// Checking Master List Reference defined or not
			if(oMasterList){
				var oItems = oMasterList.getItems();
				if(oItems.length > 1){
					// Looping on Master List current visible list items to find out reference of Current Equip ID
					for(var i=0;i<oItems.length;i++){
						var oContext = oItems[i].getBindingContext("oMasterModel").getProperty();
						
						if(oContext.Equnr === sCurrEquipID){
							// Set Master List Item selected in Other than Phone Device
							if(!Device.system.phone){
								oMasterList.setSelectedItem(oItems[i]);
							}
							// Checking for Previous Equipment Code 
							if(oItems[i-1]){
								var oPrevContext = oItems[i-1].getBindingContext("oMasterModel").getProperty();
								oQuery.PrevEquipID = oPrevContext.Equnr;
							}
							// Checking for Next Equipment Code 
							if(oItems[i+1]){
								var oNextContext = oItems[i+1].getBindingContext("oMasterModel").getProperty();
								oQuery.NextEquipID = oNextContext.Equnr;
							}
							break;
						}
					}
				}
			}
			return oQuery;
		},
		setMasterListRef: function(oList){
			oMasterList = oList;
		},
		getMasterListRef: function(){
			return oMasterList;
		}

	});

});