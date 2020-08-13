sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var TablePersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "com.prism.zpmcalcheck-tasktable-taskcol",
					order: 1,
					text: "Task",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-objtypeCol",
					order: 2,
					text: "Object Type",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-freqcol",
					order: 3,
					text: "Frequency",
					visible: false
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-paramcol",
					order: 4,
					text: "Parameter Value",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-remarkcol",
					order: 5,
					text: "Remarks",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-lowlimitcol",
					order: 6,
					text: "Lower Limit",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-uplimitcol",
					order: 7,
					text: "Upper Limit",
					visible: true
				}
			]
		},

		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns : [{
					id: "com.prism.zpmcalcheck-tasktable-taskcol",
					order: 1,
					text: "Task",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-objtypeCol",
					order: 2,
					text: "Object Type",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-freqcol",
					order: 3,
					text: "Frequency",
					visible: false
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-paramcol",
					order: 4,
					text: "Parameter Value",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-remarkcol",
					order: 5,
					text: "Remarks",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-lowlimitcol",
					order: 6,
					text: "Lower Limit",
					visible: true
				},
				{
					id: "com.prism.zpmcalcheck-tasktable-uplimitcol",
					order: 7,
					text: "Upper Limit",
					visible: true
				}
							]
			};

			//set personalization
			this._oBundle = oInitialData;

			//reset personalization, i.e. display table as defined
	//		this._oBundle = null;

			oDeferred.resolve();
			return oDeferred.promise();
		},

		//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
		//to 'Weight (Important!)', but will leave all other column names as they are.
		getCaption : function (oColumn) {
			if (oColumn.getHeader() && oColumn.getHeader().getText) {
				if (oColumn.getHeader().getText() === "Weight") {
					return "Weight (Important!)";
				}
			}
			return null;
		},

		getGroup : function(oColumn) {
			if ( oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
				return "Primary Group";
			}
			return "Secondary Group";
		}
	};

	return TablePersoService;

});