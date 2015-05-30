
var TestController = function(testInstance) {

	var that = this;

	this.testInstance = testInstance;
	this.storageManager = new StorageManager();
	
	/*
	 *  A partir del estado del TestInstance actualiza los valores del formulario en la UI 
	 */
	this.updateUI = function() {
		//var state = testInstance.state;

	};
	
	this.navigateToFirstPage = function () {
		$.mobile.navigate("#init_test_page");
	};
	
	this.navigateToCurrentPage = function () {
		
		if (that.testInstance.currentQuestion == that.testInstance.test.numberOfQuestions)
			$.mobile.navigate("#final_test_page");
		else
			$.mobile.navigate("#question_page_" + that.testInstance.currentQuestion);
	};
	
	this.goHome = function() {
		
		var now = new Date();
		
		if (!that.testInstance.finalized) {
			navigator.notification.vibrate(100);
			navigator.notification.confirm(
		    		'¿Está seguro de que desea salir?', // message
		             function(buttonIndex) {
		    			
		    			if (buttonIndex == 2) {
		    				that.testInstance.time += now - that.testInstance.startDate;
							that.updateState();
							
							that.storageManager.updateInstance(that.testInstance);
							$.mobile.navigate('#home');
							window.appController.checkUnfinalizedInstances();
			    		}
		    			
		    		},
		            'Salir',
		            'Cancelar,Aceptar'
		    );
		}
		else {
			$.mobile.navigate('#home');
			window.appController.checkUnfinalizedInstances();
		}
		
	};
	
	this.previousPage = function(fromQuestion) {
		
		//var toQuestion = parseInt(fromQuestion) - 1;
		
		//$.mobile.navigate(toPage, { transition: 'slide', reverse: true});
		//$('.progress').val(toQuestion);
        //$('.progress').slider("refresh");
		
	};
	
	this.nextPage = function(fromQuestion) {
		
		//console.log("StarDate: " + that.testInstance.startDate);
		
		var toQuestion = parseInt(fromQuestion) + 1;
		
		var toPage;
		
		if (toQuestion == that.testInstance.test.numberOfQuestions)
			toPage = "#final_test_page";
		else
			toPage = "#question_page_" + toQuestion;
		
		that.updateState();
		that.testInstance.currentQuestion = toQuestion;
		
		that.storageManager.updateInstance(that.testInstance);
		
		//$('.progress').val(toQuestion);
        //$('.progress').slider("refresh");
		
		$.mobile.navigate(toPage, { transition: 'slide'});
	};
	
	this.initTest = function() {
		
		that.testInstance.startDate = new Date();

		$.mobile.navigate("#question_page_0");
	};
	
	this.finalize = function() {
		
		var now = new Date();
		
		that.testInstance.finalized = true;
		that.testInstance.currentQuestion = 0;
		that.testInstance.time += now - that.testInstance.startDate;
		
		that.evaluate(); // Se genera el result en testInstance
		
		that.storageManager.updateInstance(that.testInstance);
		
		that.showResult();
	};
	
	this.showResult = function() {
		
		var dateFormat = new DateFormat();
		prettyTime = dateFormat.time(new Date(that.testInstance.time));
		
		html = "<div data-role='page' id='test-result-page'>" +
			"<div data-role='header'>" +
				"<h1>Resultados</h1>" +
			"</div>" +
			"<div role='main' class='ui-content'>" +
				//"<h3 class='ui-bar ui-bar-a ui-corner-all'>Resultados</h3>" +
				"<table class='instance-data-table'>" +
		        "<tr><th>Test</th><td>" + that.testInstance.test.title + "</td></tr>" +
		        "<tr><th>Paciente</th><td>"+ that.testInstance.patientID +"</td></tr>" +
		        "<tr><th>Medico</th><td>"+ that.testInstance.medico +"</td></tr>" +
		        "<tr><th>Fecha</th><td>" + that.testInstance.date + "</td></tr>" +
		        "<tr><th>Tiempo</th><td>" + prettyTime +"</td></tr>" +
		        "</table>" +
				"<p><strong>Resumen evaluacion</strong></p>" +
				
				that.testInstance.resultHtmlTable;
		
		if (that.testInstance.resultImages.length > 0) {
			html += "<p><strong>Imagenes adjuntas</strong></p>" +
			that.testInstance.resultImagesHtml; 
		}
		
		html += "<div data-role='footer' data-position='fixed'>" +
					"<div data-role='navbar'>" +
						"<ul>" +
							//"<li><a href='#test-pre-init' data-icon='arrow-l'>Vovler</a></li>" +
							"<li><a href='#' onclick='window.appController.testController.goHome();' data-icon='home'>Inicio</a></li>" +
							//"<li><a href='#question_page_0' data-icon='arrow-r'>Comenzar</a></li>" +
						"</ul>" +
					"</div>" +
				"</div>" +
			"</div>" +
		"</div>";
		
		$('#test-result-page').remove();
		$('body').append(html);
		
		$.mobile.navigate("#test-result-page");
		
	};

	this.generateUI = function() {

		var html = "";
		var test = that.testInstance.test;
		var state = that.testInstance.state;

		html += "<div class='test-ui-page' data-role='page' id='init_test_page'>" +
		"<div data-role='header'>" +
		"<h1>Comenzar</h1>" +
		"</div>" +
		"<div role='main' class='ui-content'>" +
		"<h3 class='ui-bar ui-bar-a ui-corner-all'>" + test.title + "</h3>" +
		"<div class='ui-body'><p>" + test.description + "</p></div>" +
		"</div>" +
		"<div data-role='footer' data-position='fixed'>" +
		"<div data-role='navbar'>" +
		"<ul>" +
		"<li><a href='#test-pre-init' data-icon='arrow-l'>Vovler</a></li>" +
		"<li><a href='#' onclick='window.appController.testController.goHome();' data-icon='home'>Inicio</a></li>" +
		"<li><a href='#' onclick='window.appController.testController.initTest();' data-icon='arrow-r'>Comenzar</a></li>" +
		"</ul>" +
        "</div>" +
		"</div>" +
		"</div>";

		$.each(test.sections, function(sectionIndex, section) {
			$.each(section.questions, function(questionIndex, question) {

				html += "<div class='test-ui-page' data-role='page' id='question_page_" + question.absoluteIndex + "'>" +	// Pagina por pregunta
				//"<div data-role='header'>" +
				//"<h1>PsicoTest</h1>" +
				//"</div>" +
				"<div role='main' class='ui-content'>";
				
				//html += "<form class='full-width-slider'>" +
		        //"<input name='progress' class='progress' data-highlight='true' min='0' max='"+ parseInt(test.numerOfQuestions) +"' value='' type='range'>"+
		        //"</form>";
				
				html += "<h3 class='ui-bar ui-bar-a ui-corner-all'>" + section.title + "</h3>";
				
				html += "<div class='ui-body ui-body-a ui-corner-all'><p>" + question.title + "</p></div>";
				
				if (question.mediaImageSrc != '') {
					html += "<div style='text-align:center;'><img id='" + question.id + "-image-display' onclick='window.appController.showFullScreenImage(\"" + question.id + "-image-display\");' style='max-width:100%; margin-top: 15px;' src='" + question.mediaImageSrc + "' /></div>";
				}
				
				if (question.timeLimit != null) {
					
					html += "<div style='display: table; margin:0 auto; margin-top: 10px;'><fieldset data-role='controlgroup' data-type='horizontal' data-inline='false'>" +
				    "<button onclick='window.appController.restartCountdown();' class='ui-shadow ui-btn ui-corner-all ui-icon-refresh ui-btn-icon-right'>Reiniciar</button>" +
				    "<a href='#' id='"+ question.id +"_timer' class='ui-shadow ui-btn ui-corner-all'>" + question.timeLimit + "</a>" +
				    "<a href='#' onclick='window.appController.startCountdown();' class='ui-shadow ui-btn ui-corner-all ui-icon-carat-r ui-btn-icon-right'>Comenzar</a>" +
				    "</fieldset></div>";
					
					$(document).on( "pageshow", "#question_page_" + question.absoluteIndex , function( event ) {
						window.appController.setCountdown(question.timeLimit, question.id + "_timer"); 
					});
				}

				if (question.evaluate) {

					var columns = { 1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', };
					
					if (question.answers.length > 1)
						html += "<div class='ui-grid-" + columns[question.answers.length - 1] +"'>";

					$.each(question.answers, function(answerIndex, answer) {

						if (question.answers.length > 1) 
							html += "<div class='ui-block-" + (columns[answerIndex + 1]) + "'><div style='padding:5px; padding-top: 15px;'>" + answer.label + "</div>";

						switch (answer.type) {

						case 'integer':
						case 'test':
							
							if (answer.inputHelper == 'counter') {
								
								if (state == null) {

									html += "<div class='ui-grid-b center'>" +
									"<div class='ui-block-a' style='text-align:right; padding-right: 5px; padding-top: 3px;'><a href='#' class='ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-minus ui-btn-icon-notext ui-mini' onclick='window.appController.counterHelperMinus(\""  + answer.id + "\")'>-</a></div>" +
									"<div class='ui-block-b'><input id='" + answer.id + "' value='0' type='text'></div>" +
									"<div class='ui-block-c' style='text-align:left; padding-left: 5px; padding-top: 3px;'><a href='#' class='ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-plus ui-btn-icon-notext' onclick='window.appController.counterHelperPlus(\""  + answer.id + "\")'>+</a></div>" +
									"</div>";
								}
								else {
									
									html += "<div class='ui-grid-b center'>" +
									"<div class='ui-block-a' style='text-align:right; padding-right: 5px; padding-top: 3px;'><a href='#' class='ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-minus ui-btn-icon-notext ui-mini' onclick='window.appController.counterHelperMinus(\""  + answer.id + "\")'>-</a></div>" +
									"<div class='ui-block-b'><input id='" + answer.id + "' value='"+ state[sectionIndex][questionIndex][answerIndex] +"' type='text'></div>" +
									"<div class='ui-block-c' style='text-align:left; padding-left: 5px; padding-top: 3px;'><a href='#' class='ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-plus ui-btn-icon-notext' onclick='window.appController.counterHelperPlus(\""  + answer.id + "\")'>+</a></div>" +
									"</div>";
								}
							}
							else {
							
								if (state == null)
									html += "<p style='padding:5px;'><input type='text' id='" + answer.id + "' /></p>";
								else
									html += "<p style='padding:5px;'><input type='text' id='" + answer.id + "' value='" + state[sectionIndex][questionIndex][answerIndex] + "' /></p>";
							}
							break;

						case 'checkbox':
							if (state == null) {
							html += "<fieldset data-role='controlgroup' style='padding:5px;'>";

							for (var i = 0; i < answer.options.length; i++) {
								html += "<input value='" + answer.options[i].value + "' name='" + answer.options[i].id + "' id='" + answer.options[i].id + "' type='checkbox'>";
								html += "<label for='" + answer.options[i].id + "'>" + answer.options[i].text + "</label>";
							}

							html += "</fieldset>";
							}
							else {
								html += "<fieldset data-role='controlgroup' style='padding:5px;'>";

								for (var i = 0; i < answer.options.length; i++) {
									
									if (state[sectionIndex][questionIndex][answerIndex][i] == true)
										html += "<input value='" + answer.options[i].value + "' name='" + answer.options[i].id + "' id='" + answer.options[i].id + "' type='checkbox' checked>";
									else
										html += "<input value='" + answer.options[i].value + "' name='" + answer.options[i].id + "' id='" + answer.options[i].id + "' type='checkbox'>";
									html += "<label for='" + answer.options[i].id + "'>" + answer.options[i].text + "</label>";
								}

								html += "</fieldset>";	
							}
							
							break;

						case 'option':
							
							if (state == null) {
							html += "<fieldset data-role='controlgroup' style='padding:5px;'>";

							for (var i = 0; i < answer.options.length; i++) {
								html += "<input value='" + answer.options[i].value + "' name='" + answer.id + "' id='" + answer.options[i].id + "' type='radio'>";
								html += "<label for='" + answer.options[i].id + "'>" + answer.options[i].text + "</label>";
							}

							html += "</fieldset>";
							}
							else {
								html += "<fieldset data-role='controlgroup' style='padding:5px;'>";

								for (var i = 0; i < answer.options.length; i++) {
									if (state[sectionIndex][questionIndex][answerIndex][i] == true)
										html += "<input value='" + answer.options[i].value + "' name='" + answer.id + "' id='" + answer.options[i].id + "' type='radio' checked>";
									else
										html += "<input value='" + answer.options[i].value + "' name='" + answer.id + "' id='" + answer.options[i].id + "' type='radio'>";
									html += "<label for='" + answer.options[i].id + "'>" + answer.options[i].text + "</label>";
								}

								html += "</fieldset>";								
							}
							break;

						case 'boolean':
							html += "<p style='padding:5px;'><select name='slider-flip' id='" + answer.id + "' data-role='slider'>";

							for (var i = 0; i < answer.options.length; i++) {
								html += "<option id='" + answer.options[i].id + "' value='" + answer.options[i].value + "'>" + answer.options[i].text + "</option>"; 
							}

							html += "</select></p>";

							break;
						}

						if (question.answers.length > 1)
							html += "</div>";

					});

					if (question.answers.length > 1)
						html += "</div>";
				}
				
				if (question.instructions)
					html += "<div data-role='collapsible' data-mini='true'>" +
						"<h4>Instrucciones</h4>" +
						"<p>" + question.instructions + "</p></div>";
				
				html += "</div>"; 	// Fin del content la pagina
				
				html += "<div data-role='footer' data-position='fixed'><div data-role='navbar'><ul>";
				if (question.absoluteIndex != 0)				
					html += "<li><a onclick='window.appController.testController.previousPage(" + question.absoluteIndex + ");' href='#question_page_" + (parseInt(question.absoluteIndex) - 1) + "'data-transition='slide' data-direction='reverse'  data-icon='arrow-l'>Anterior</a></li>";
				else
					html += "<li><a class='ui-disabled' href='#' data-icon='arrow-l'>Anterior</a></li>";

				html += "<li><a href='#' onclick='window.appController.testController.goHome();' data-icon='home'>Inicio</a></li>";
				
				//onclick='window.appController.testController.testInstance.updateState();'
				html += "<li><a onclick='window.appController.testController.nextPage(" + question.absoluteIndex + ");' data-transition='slide' href='#' data-icon='arrow-r'>Siguiente</a></li>";
				
				html += "</ul></div>";	// Fin barra botones navegacion

				html += "</div>" +		// Fin del footer
				"</div>"; // fin de la pagina
			});
		});

		html += "<div class='test-ui-page' data-role='page' id='final_test_page'>" +
		"<div data-role='header'>" +
		"<h1>Finalizar</h1>" +
		"</div>" +
		"<div role='main' class='ui-content'>" +
			"<p>No quedan mas preguntas.</p>";
		
		if (test.resultAttach === 'image') {
			html += "<a onclick='window.appController.captureResultImage();' class='ui-btn ui-corner-all ui-icon-camera ui-btn-icon-right'>Agregar imagen al resultado</a>" + 
			"<div id='final-test-page-images'></div>";
		}
		
		html += "</div>" +
		"<div data-role='footer' data-position='fixed'>" +
		"<div data-role='navbar'><ul>" +
		"<li><a data-transition='slide' data-direction='reverse' href='#question_page_" + (test.numberOfQuestions - 1) + "' data-icon='arrow-l'>Volver</a></li>" +
		"<li><a href='#home' data-icon='home'>Inicio</a></li>" + 
		"<li><a onclick='window.appController.testController.finalize();' href='#' data-icon='check'>Finalizar</a></li>" +
		"</ul></div>" +
		"</div>" +
		"</div>";
		
		$('.test-ui-page').remove();
		$('body').append(html);
		
		//$('.ui-slider-handle').hide();
        //$('.progress').hide();
        //$('.ui-slider-track').css('margin','0 15px 0 15px');
	};
	/*
	this.getHtml = function() {
		
		var test = that.testInstance.test;
		
		html = "<div data-role='page' id='test-html-page'>" +
		"<div data-role='header'>" +
			"<h1>PsicoTest</h1>" +
		"</div>" +
		"<div role='main' class='ui-content'>" +
			"<h3 class='ui-bar ui-bar-a ui-corner-all'>Resultados</h3>" +
			"<table class='instance-data-table'>" +
	        "<tr><th>Nombre</th><td>" + test.title + "</td></tr>" +
	        "<tr><th>Preguntas</th><td>"+ test.numerOfQuestions +"</td></tr>" +
	        "</table>" +
			"<p><strong>Estructura</strong></p>" +
			
			that.testInstance.resultHtmlTable + 
			
			"<div data-role='footer' data-position='fixed'>" +
				"<div data-role='navbar'>" +
					"<ul>" +
						//"<li><a href='#test-pre-init' data-icon='arrow-l'>Vovler</a></li>" +
						"<li><a href='#' onclick='window.appController.testController.goHome();' data-icon='home'>Inicio</a></li>" +
						//"<li><a href='#question_page_0' data-icon='arrow-r'>Comenzar</a></li>" +
					"</ul>" +
				"</div>" +
			"</div>" +
		"</div>" +
		"</div>";
		
		var result = "<table class='result-table'>" +
		"<tr><th>#</th><th>Pregunta</th></tr>";
		$.each(test.sections, function (sectionIndex, section) {	
			result += "<tr><th colspan='2' class='section-title'>" + section.title + "</th></tr>";
			$.each(section.questions, function (questionIndex, question) {
				result += "<tr><td>" + (parseInt(question.absoluteIndex) + 1) + "</td><td>" + question.title + "</td></tr>";
			});
		});
		result += "</table>";
		
		return result;
	};*/
	
	this.evaluate = function() {
		
		var result;
		var allQuestionValues = new Array();
		var testValue;
		var test = that.testInstance.test;
		var state = that.testInstance.state;
		
		result = "<table class='result-table'>" +
					"<tr><th>#</th><th>Pregunta</th><th>Valor</th></tr>"; 
		
		var sectionValues = new Array();
		
		$.each(test.sections, function (sectionIndex, section) {
			
			result += "<tr><th colspan='3' class='section-title'>" + section.title + "</th></tr>";
			
			var questionValues = new Array();
			
			$.each(section.questions, function (questionIndex, question) {
				
				if (question.evaluate) {
					
					var answerValues = new Array();
					
					$.each(question.answers, function (answerIndex, answer) {
						
						switch (answer.type) {
						
						case 'checkbox':
						case 'option':
						case 'boolean':
							
							var answerValue = 0;
							
							$.each(answer.options, function (optionIndex, option) {
								if (state[sectionIndex][questionIndex][answerIndex][optionIndex] === true) {
									answerValue += parseInt(option.value);
								}
								
							});
							
							answerValues.push(answerValue);
														
							break;
							
						case 'integer':
							answerValues.push(parseInt(state[sectionIndex][questionIndex][answerIndex]));
							break;
						case 'text':
							answerValues.push(state[sectionIndex][questionIndex][answerIndex]);
							break;
						
						}
					});
					
					var questionValue = 0;
				
					switch (question.resultCombination) {
						default:
						case 'sum':
							questionValue = 0;
							for (var i = 0; i < answerValues.length; i++)
								questionValue += answerValues[i];
							break;
						case 'multiplication':
							questionValue = 1;
							for (var i = 0; i < answerValues.length; i++)
								questionValue *= answerValues[i];
							break;
						case 'none':
							questionValue = answerValues[0];
							break;
					}
					
					allQuestionValues.push(questionValue);
						
					result += "<tr><td>" + (parseInt(question.absoluteIndex) + 1) + "</td><td>" + question.title + "</td><td>" + questionValue + "</td></tr>";
					
					questionValues.push(questionValue);
				}
				else {
					result += "<tr><td>" + (parseInt(question.absoluteIndex) + 1) + "</td><td>" + question.title + "</td><td></td></tr>";
				}
					
			});
			
			that.testInstance.allQuestionValues = allQuestionValues;
			
			var sectionValue = 0;
			
			switch (section.resultCombination) {
			case 'sum':
				sectionValue = 0;
				for (var i = 0; i < questionValues.length; i++)
					sectionValue += questionValues[i];
				result += "<tr class='section-result'><td colspan='2'>Total seccion</td><td>" + sectionValue + "</td></tr>";
				break;
			case 'multiplication':
				sectionValue = 1;
				for (var i = 0; i < questionValues.length; i++)
					sectionValue *=questionValues[i];
				result += "<tr class='section-result'><td colspan='2'>Total secci�n</td><td>" + sectionValue + "</td></tr>";
				break;
			case 'none':
				result += "<tr class='section-result'><td colspan='2'>Total secci�n</td><td>-</td></tr>";
				break;
			default:
					sectionValue = 0;
				for (var i = 0; i < questionValues.length; i++)
					sectionValue += questionValues[i];
				result += "<tr class='section-result'><td colspan='2'>Total seccion</td><td>" + sectionValue + "</td></tr>";
				break;
			}
			
			sectionValues.push(sectionValue);
			
		});
		
		switch (test.resultCombination) {
		case 'sum':
			testValue = 0;
			for (var i = 0; i < sectionValues.length; i++)
				testValue += sectionValues[i];
			result += "<tr class='test-result'><td colspan='2'>Total test</td><td>" + testValue + "</td></tr>";
			break;
		case 'multiplication':
			testValue = 1;
			for (var i = 0; i < questionValues.length; i++)
				sectionValue *=questionValues[i];
			result += "<tr class='section-result'><td colspan='2'>Total test</td><td>" + testValue + "</td></tr>";
			break;
			
		case 'none':
			testValue = "-";
			result += "<tr class='test-result'><td colspan='2'>Total test</td><td>-</td></tr>";
			break;
			
		default:
			testValue = 0;
			for (var i = 0; i < sectionValues.length; i++)
				testValue += sectionValues[i];
			
			result += "<tr class='test-result'><td colspan='2'>Total test</td><td>" + testValue + "</td></tr>";
		}
		
		result += "</table>";
		
		// Crear el div con las imagenes adjuntas al resultado
		
		that.testInstance.resultHtmlTable = result;
		
		if (that.testInstance.resultImages.length > 0) {
			var html = "<div>";
			for (var i = 0; i < that.testInstance.resultImages.length; i++)
				html += "<img style='max-width:100%; margin-bottom:10px;' src='" +  that.testInstance.resultImages[i] + "' />";
			html += "</div>";
			
			that.testInstance.resultImagesHtml = html;
		}
		
		// Creacion del CSV
		
		var dateFormat = new DateFormat();
		prettyTime = dateFormat.time(new Date(that.testInstance.time));
			
		var csv = test.title +';'+that.testInstance.medico+';' + that.testInstance.patientID + ';' + that.testInstance.shortDate + ';' + prettyTime + ';' + testValue;
			
		for (var i = 0; i < allQuestionValues.length; i++) {
			csv += ';' + allQuestionValues[i];
		}
		
		that.testInstance.csv = csv;
	};
	
	/* 
	 * Actualiza el estado de la instancia del test a partir de los valores del formulario del test.
	 */
	this.updateState = function() {
		
		var test = that.testInstance.test;
		var state = new Array();
		
		$.each(test.sections, function (sectionIndex, section) {
			
			var section_state = new Array();
			
			$.each(section.questions, function (questionIndex, question) {
				
				var question_state = new Array();
				
				if (question.evaluate) {
					
					$.each(question.answers, function (answerIndex, answer) {
						
						var answer_state = new Array();

						switch (answer.type) {
						
						case 'integer':
						case 'text':
							
							var value = $('#' + answer.id).val();
							answer_state.push(value);
							
							break;
						
						case 'option':
						case 'checkbox':
							
							$.each(answer.options, function (optionIndex, option) {
								if ($('#' + option.id).is(':checked'))
									answer_state.push(true);
								else
									answer_state.push(false);
							});
							
							break;
							
						case 'boolean':
							
							$.each(answer.options, function (optionIndex, option) {	
								if ($('#' + option.id).is(':selected'))
									answer_state.push(true);
								else
									answer_state.push(false);
							});							
							
							break;
						}
						
						question_state.push(answer_state);
						
					});
				}
				
				section_state.push(question_state);
			});
			
			state.push(section_state);
		});
		
		that.testInstance.state = state;
	};
};