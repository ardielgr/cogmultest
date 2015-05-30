var MultiInputAnswer = function() {
	
	var that = this;
	
	this.id;				// Titulo o pregunta
	this.options;			// Array opciones
	this.type;
	this.label;
	
	this.toHtml = function() {
		
		
		if (that.type === 'option') {
			// Cambiar clase dependiendo de si son dos (boolean -> toggle) o mas opciones
			var html = "<select name='slider-flip' id='" + that.id + "' data-role='slider'>";
			
			for (var i = 0; i < that.options.length; i++) {
				
				if (i == 0) 
					html += "<option id='" + that.options[i].id + "' value='" + that.options[i].value + "' selected=''>" + that.options[i].text + "</option>";
				else
					html += "<option id='" + that.options[i].id + "' value='" + that.options[i].value + "'>" + that.options[i].text + "</option>"; 
			}
			
			html += "</select>";
			
			return html;
		}
			
		if (that.type === 'checkbox') {
			
			
			var html = "<fieldset data-role='controlgroup'>";

			for (var i = 0; i < that.options.length; i++) {
				html += "<input value='" + that.options[i].value + "' name='" + that.options[i].id + "' id='" + that.options[i].id + "' type='checkbox'>";
			    html += "<label for='" + that.options[i].id + "'>" + that.options[i].text + "</label>";
			}
			
			html += "</fieldset>";
			
			return html;
		}
			
	};
};