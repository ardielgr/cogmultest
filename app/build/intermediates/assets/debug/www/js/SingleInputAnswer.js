

var SingleInputAnswer = function() {
	
	var that = this;
	
	this.id;
	this.inputHelper;
	this.type;
	this.label;
	
	this.toHtml = function () {
		
		// añadir label ?
		var html = "<input type='text' id='" + that.id + "' />";
		
		switch(that.inputHelper) {
		
		case 'counter':
			// ...
			break;
		}
		
		return html;
	};
	
};