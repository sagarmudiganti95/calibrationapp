sap.ui.define(["sap/ui/core/format/DateFormat"], function(DateFormat) {
	"use strict";

	return {

		formatDateToDDMMMYYYY: function(date) {

			if (date) {
				var oDate = (date instanceof Date) ? date : new Date(date);
				var dateFormat = DateFormat.getDateInstance({
					pattern: "dd-MMM-yyyy"
				});
				return dateFormat.format(oDate);
			} else {
				return null;
			}
		},
		padWithZeroes: function(number, length) {

			var my_string = '' + number;
			while (my_string.length < length) {
				my_string = '0' + my_string;
			}

			return my_string;

		},
		getPostDateFormat: function(date) {
			if (date) {
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				});

				var sDate = dateFormat.format(new Date(date));
				sDate = sDate + "T00:00:00";
				return sDate;
			} else {
				return null;
			}
		}
	};
});