
var DateFormat = function() {
	
	var that = this;
	
	this.months = new Array("enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "septiembre", "octubre", "noviembre", "diciembre");
	
	this.format = function (date) {
		var dateString = "";
		dateString += date.getDate() + " de ";
		dateString += that.months[date.getMonth()] + " de ";
		dateString += date.getFullYear() + " ";
		if (date.getHours() < 10)
			dateString += "0";
		dateString += date.getHours() + ":";
		if (date.getMinutes() < 10)
			dateString += "0";
		dateString += date.getMinutes();
		
		return dateString;
	};
	
	this.shortFormat = function (date) {
		var dateString = "";
		
		if (date.getDate() < 10)
			dateString += "0";
		dateString += date.getDate() + "/";
		
		if (date.getMonth() < 10)
			dateString += "0";
		dateString += (date.getMonth() + 1) + "/";
		
		dateString += date.getFullYear() + " ";
		
		if (date.getHours() < 10)
			dateString += "0";
		dateString += date.getHours() + ":";
		
		if (date.getMinutes() < 10)
			dateString += "0";
		dateString += date.getMinutes();
		
		return dateString;
	};
	
	this.time = function (date) {
		
		var dateString = "";
		
		if (date.getHours() < 10)
			dateString += "0";
		dateString += date.getHours() + ":";
		
		if (date.getMinutes() < 10)
			dateString += "0";
		dateString += date.getMinutes() + ":";
		
		if (date.getSeconds() < 10)
			dateString += "0";
		dateString += date.getSeconds();
		
		return dateString;
	};
	
};