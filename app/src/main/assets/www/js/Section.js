
var Section = function() {
	
	var that = this;
	
	this.id;
	this.title;
	this.description;
	this.questions;
	
	this.resultType;			// Tipo de resultado (integer|labeled)
	this.resultLabels;			// Etiquetas para la salida de tipo labeled
	this.resultCombination;		// Operación con la que se combinan cada uno de los resultados de las preguntas
	
	this.toHtml = function() {
		
		var html = "<div class='ui-corner-all custom-corners'>" +
				"<div class='ui-bar ui-bar-a'><h3>"+ that.title +"</h3></div>" +
				"<div class='ui-body ui-body-a'>";
		
		for (var i = 0; i < that.questions.length; i++) {
			
			html += "<p>" + that.questions[i].toHtml() + "</p>"; 
		}
		
		html += "</div></div>";
		
		return html;
	};
};