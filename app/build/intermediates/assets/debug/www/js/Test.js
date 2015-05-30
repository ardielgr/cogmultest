
var Test = function() {
	
	var that = this;
	
	this.title;
	this.shortTitle;
	this.description;
	this.sections;
	this.numerOfQuestions;
	
	this.postParseConfig = false;	// true/false
	
	this.resultType;		// De momneto "integer|labeled"
	this.resultLabels;		// Etiqutas para las salidas de tipo TEXT
	this.resultCombination;	// Operación con la que se combinan los valores de cada una de las secciones.
	this.resultAttach;
	this.origin;
	
	// Es mejor hacer un metodo para evaluar, guardarlo en un array y luego otro para mostrar (populate?)
	
	this.evaluate = function() {
		
		var html = "<h3 class='ui-bar ui-bar-a ui-corner-all'>Resultados</h3>" +
					"<div class='ui-body'>" +
						"<table>" +
						  "<tr><th>Seccion</th><th>Resultado</th></tr>";
		var totalResult = 0;
		
		$.each(that.sections, function (sectionIndex, section) {
			
			html += "<tr><td>" + section.title + "</td>";
			
			var sectionResult = 0;
			
			$.each(section.questions, function (questionIndex, question) {
				
				if (question.evaluate) {
					if (question.answers.length == 1) {
						
						var answer = question.answers[0];
						
						if (answer.type === 'option') {
							sectionResult += parseInt($('#' + answer.id).val());
						}
						
						if (answer.type === 'checkbox') {
							
							var answerResult = 0;
							
							$.each(answer.options, function (optionIndex, option) {
								if ($('#' + option.id).is(':checked')) {
									answerResult += sectionResult += parseInt($('#' + option.id).val());	
								}
							});
						}
						
					}
				}
				
			});
			
			totalResult += sectionResult;
			
			html += "<td>" + sectionResult + "</td>";
			
			html += "</tr></div>";
			
		});
		
		html += "<tr><td>Total</td><td>" + totalResult + "</td></tr>";
		html += "</table></div>";
		
		$('#test-results-content').html("");
		$('#test-results-content').append(html);
		
	};
	
	this.toHtml = function() {
		
		var html = "<h3 class='ui-bar ui-bar-a ui-corner-all'>" + that.title + "</h3>" +
				"<div class='ui-body'>";
      
		for (var i = 0; i < that.sections.length; i++) {
			
			html += that.sections[i].toHtml() + "<br />";
		}
		
		html += "</div>";
		
		return html;
	};
};