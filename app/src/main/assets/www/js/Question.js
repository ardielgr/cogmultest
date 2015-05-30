/*
 * Clase genérica para las preguntas
 */

var Question = function() {
	
	var that = this;
	
	this.id;
	this.absoluteIndex;
	this.number;
	this.title;					// Titulo o pregunta
	this.instructions;			// Texto explicativo
	this.timeLimit; 			// Limite de tiempo (en segundos)
	this.mediaRequired;			// image/other
	
	this.mediaImageSrc = '';			// imagePath
	
	this.evaluate;				// Se espera entrada o no
	
	this.answers;				// respuestas
	
	this.resultType;			// Tipo de resultado (integer|labeled)
	this.resultLabels;			// Etiquetas para los resultados tipo labeled (a nivel de pregunta)
	this.resultCombination;		// Combinación de las respuestas (sum|multiplication)
	
	this.toHtml = function() {
		
		var html = "";
		
		if (that.number != "")		
			html += "<div><h4>" + that.number + ". " + that.title + "</h4>";
		else
			html += "<div><h4>" + that.title + "</h4>";
		
		if (that.evaluate) {
			
			
			switch (that.answers.length) {
			
			case 1:
				html += that.answers[0].toHtml();
				break;
			case 2:
				html += "<div class='ui-grid-a'>";
				html += "<div class='ui-block-a'><div class='ui-bar ui-bar-a'>" + that.answers[0].toHtml() + "</div></div>";
				html += "<div class='ui-block-b'><div class='ui-bar ui-bar-a'>" + that.answers[1].toHtml() + "</div></div>";
				html += "</div>";
				break;
			case 3:
				html += "<div class='ui-grid-a'>";
				html += "<div class='ui-block-a'><div class='ui-bar ui-bar-a'>" + that.answers[0].toHtml() + "</div></div>";
				html += "<div class='ui-block-b'><div class='ui-bar ui-bar-a'>" + that.answers[1].toHtml() + "</div></div>";
				html += "<div class='ui-block-c'><div class='ui-bar ui-bar-a'>" + that.answers[3].toHtml() + "</div></div>";
				html += "</div>";
				break;
			}
		}
		
		else {
			
		}
		
		html += "</div>";
		
		return html;
	};
};