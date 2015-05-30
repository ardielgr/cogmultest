/*
function xmlToJson (xml) {
		
		// Create the return object
	var obj = {};
	if (xml.nodeType == 1) { // element
	// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				//console.log(attribute.nodeName + " : " + attribute.nodeValue);
			}
		}
			
	} else if (xml.nodeType == 3) { // text
		//obj = xml.nodeValue;
		//console.log(xml.nodeValue);
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	
	console.log(obj);		
}
*/

var TestParser = function(xmlPath) {
	
	var that = this;
	this.test;
	
	this.getTest = function () {
		return that.test;
	};
	
	this.getUrlXml = function (url) {
		
		function onSuccess(fileSystem) {
			
			var d = new Date();
		    var n = d.getTime();
		    //new file name
		    var newFileName = n + ".xml";
			
		    fileSystem.root.getFile(newFileName, { create: true }, function (fileEntry) {
		    	
		    	var fileTransfer = new FileTransfer();
				var uri = encodeURI(url);

				fileTransfer.download(
				    uri,
				    fileEntry.fullPath,
				    function(entry) {
				    	
				    	// Una vez descargado el fichero, lo abrimos y lo parseamos
				    	$.ajax({
							type: 'GET',
							url: entry.fullPath,
							dataType: 'xml',
							async: false,
							success: that.parse,
							error: function(e) {
								alert("El documento no tiene una estructura XML valida. Compruebe el cierre de etiquetas.");
								window.appController.saveNewTest(null);
							}
						});
				    },
				    function(error) {
				        alert("No se pudo descargar el fichero de configuracion. Compruebe la URL facilitada y su conexion a internet");
				    	window.appController.saveNewTest(null);
				    },
				    false,
				    {
				        headers: {
				            Connection: "close"
				        }
				    }
				);
		    	
		    }, function (message) { alert("No se ha podido crear el fichero temporal necesario para el parsing."); window.appController.saveNewTest(null); });
		}

		// Pedimos un fichero local para poder guardar el XML
		window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, onSuccess, function (evt) {
			window.appController.saveNewTest(null);
			alert("Error del sistema de arhivos inesperado.");
		});
	};
	
	this.getLocalXml = function (uri) {

		window.resolveLocalFileSystemURI(uri, function(fileEntry) {
				$.ajax({
					type: 'GET',
					url: fileEntry.fullPath,
					dataType: 'xml',
					async: false,
					success: that.parse,
					error: function(e) {
						alert("El documento no tiene una estructura XML valida. Compruebe el cierre de etiquetas.");
						window.appController.saveNewTest(null);
					}
				});
			}, function (error) { alert("No se ha podido extraer el fichero desde la memoria interna del dispositivo."); }
		);
	};
	
	this.getAppXml = function (uri) {

		$.ajax({
			type: 'GET',
			url: uri,
			dataType: 'xml',
			async: false,
			success: that.parse,
			error: function(e) {
				alert("El documento no tiene una estructura XML valida. Compruebe el cierre de etiquetas.");
				window.appController.saveNewTest(null);
			}
		});
	};
	
	this.parse = function (xml) {
			
		that.test = new Test();
		var test = that.test;
		var index = 0;
		var errors = false;
		var errorsMessages = new Array();
		
		// Obtenemos el nodo Test
		if (xml.getElementsByTagName('Test')) {
			testNode = xml.getElementsByTagName('Test')[0];
			
			// Propiedades del test
			
			if (testNode.getElementsByTagName('Title').length > 0 && testNode.getElementsByTagName('Title')[0].childNodes.length > 0)
				test.title = testNode.getElementsByTagName('Title')[0].childNodes[0].nodeValue;
			else {
				errorsMessages.push("El nodo Test no tiene contiene el elemento Title obligatorio.\n");
				errors = true;
			}
			
			if (testNode.getElementsByTagName('ShortTitle').length > 0 && testNode.getElementsByTagName('ShortTitle')[0].childNodes.length > 0)
				test.shortTitle = testNode.getElementsByTagName('ShortTitle')[0].childNodes[0].nodeValue;
			else {
				errorsMessages.push("El nodo Test no tiene contiene el elemento ShortTitle obligatorio.");
				errors = true;
			}
			
			if (testNode.getElementsByTagName('Origin').length > 0 && testNode.getElementsByTagName('Origin')[0].childNodes.length > 0)
				test.origin = testNode.getElementsByTagName('Origin')[0].childNodes[0].nodeValue;
			
			if (testNode.getElementsByTagName('Description').length > 0 && testNode.getElementsByTagName('Description')[0].childNodes.length > 0)
				test.description = testNode.getElementsByTagName('Description')[0].childNodes[0].nodeValue.replace(/%([a-zA-Z]+)%/g, "<$1>");
			else {
				errorsMessages.push("El nodo Test no tiene contiene el elemento Description obligatorio.");
				errors = true;
			}
			
			if (testNode.getElementsByTagName('Result').length > 0) {
				var resultNode = testNode.getElementsByTagName('Result')[0];
				
				test.resultType = resultNode.getAttribute('type');
				test.resutlCombination = resultNode.getAttribute('combination');
				test.resultAttach = resultNode.getAttribute('attachment-required');
			}
			
			// Obtenemos los nodos secciones
			var sectionNodes = testNode.getElementsByTagName('Section');
			
			if (sectionNodes) {
			
				var sections = new Array();
				
				// Comienzo proceso de secciones
				$.each(sectionNodes, function (sectionIndex, node) {
					
					var section = new Section();
					
					// Propiedades de la Seccion
					
					if (node.getElementsByTagName('Title').length > 0 && node.getElementsByTagName('Title')[0].childNodes.length > 0)
						section.title = node.getElementsByTagName('Title')[0].childNodes[0].nodeValue;
					else {
						errorsMessages.push("El nodo Section (s" + (parseInt(sectionIndex) + 1) + ") no contiene el elemento obligatorio Title.");
						errors = true;
					}
					
					if (node.getElementsByTagName('Description').length > 0 && node.getElementsByTagName('Description')[0].childNodes.length > 0)
						section.description = node.getElementsByTagName('Description')[0].childNodes[0].nodeValue.replace(/%([a-zA-Z]+)%/g, "<$1>");
					
					if (node.getElementsByTagName('Result').length > 0 ) {
						var resultNode = testNode.getElementsByTagName('Result')[0];
						section.resultType = resultNode.getAttribute('type');
						section.resultCombination = resultNode.getAttribute('combination');
					}
					
					section.id = "s_" + sectionIndex;
					
					// Procesar preguntas
					
					var questionsNode = node.getElementsByTagName('Questions')[0];
					
					if (questionsNode) {	// Comprobamos existencia nodo Questions
						var questionNodes = questionsNode.getElementsByTagName('Question');		// Lista de nodos Question (cada una de las preguntas)
						
						if (questionNodes) {	// Comprobamos existencia de al menos un todo Question
						
							var numberOfQuestion = 1;
							var questions = new Array();
							
							// Comienzo proceso de preguntas
							$.each(questionNodes, function (questionIndex, node) {
							
								var question = new Question();
											
								// Tipo de pregunta (not_evaluate| normal)
								if (node.getAttribute('type') === 'not-evaluate') {
									question.evaluate = false;
									question.number = "";
									
								}
								else {
									question.evaluate = true;
									question.number = numberOfQuestion++;
								}
								
								// timeLimit Attribute
								if (node.getAttribute('time-limit'))
									question.timeLimit = node.getAttribute('time-limit');
								else
									question.timeLimit = null;
							
								question.id = "q_" + sectionIndex + "_" + questionIndex;
								question.absoluteIndex = index++;
								
								// Display (cómo se muestra la pregunta)
								var displayNode = node.getElementsByTagName('Display')[0];
								
								if (displayNode) {
								
									if (displayNode.getElementsByTagName('Title').length > 0 && displayNode.getElementsByTagName('Title')[0].childNodes. length > 0)
										question.title = displayNode.getElementsByTagName('Title')[0].childNodes[0].nodeValue;
									else {
										errorsMessages.push("El nodo Display (s" + (parseInt(sectionIndex) + 1) + ", q" + (parseInt(questionIndex) + 1) + ") no tiene contiene el elemento Title obligatorio.");
										errors = true;
									}
									
									if (displayNode.getElementsByTagName('Instructions').length > 0 && displayNode.getElementsByTagName('Instructions')[0].childNodes. length > 0)
										question.instructions = displayNode.getElementsByTagName('Instructions')[0].childNodes[0].nodeValue.replace(/%([a-zA-Z]+)%/g, "<$1>");
									
									question.mediaRequired = displayNode.getAttribute('media-required');
									
									if (test.origin == 'app' && displayNode.getAttribute('image-src'))
										question.mediaImageSrc = displayNode.getAttribute('image-src');
									
									if(question.mediaRequired != null)
										test.postParseConfig = true;
									
									if (node.getElementsByTagName('Result').length > 0) {
										var resultNode = node.getElementsByTagName('Result')[0];
										
										question.resultType = resultNode.getAttribute('type');
										question.resultCombination = resultNode.getAttribute('combination');
									}
									
									if (question.evaluate) {
									
										var answersNode = node.getElementsByTagName('Answers')[0];				// Nodo Answers	
										
										if (answersNode) {
											var answersNodeList = answersNode.getElementsByTagName('Answer');		// Lista de nodos Answer (cada una de las respuestas)
											
											if (answersNodeList) {
											
												var answers = new Array();
												// Comienzo proceso de respuestas
												$.each(answersNodeList, function(answerIndex, node) {
													
													switch (node.getAttribute('type')) {
													
													case 'integer':
													case 'text':
														
														var answer = new SingleInputAnswer();
														answer.id = "a_" + sectionIndex + "_" + questionIndex + "_" + answerIndex;
														answer.inputHelper = node.getAttribute('input-helper');
														answer.label = node.getAttribute('label');
														answer.type = node.getAttribute('type');
														
														answers.push(answer);
														break;
														
													case 'boolean':
													case 'option':
													case 'checkbox':
														
														var answer = new MultiInputAnswer();
														
														answer.id = "a_" + sectionIndex + "_" + questionIndex + "_" + answerIndex;
														answer.inputHelper = null;
														answer.type = node.getAttribute('type');
														answer.label = node.getAttribute('label');
														
														answer.options = new Array();
														
														var optionNodeList = node.getElementsByTagName('Option');
														
														if (optionNodeList) {
														
															$.each(optionNodeList, function(optionIndex, node) {
																
																if (node.getAttribute('value')) {
																	var option = new Option();
																	option.value = node.getAttribute('value');
																	
																	if (node.childNodes.length > 0) {
																		option.text = node.childNodes[0].nodeValue;
																		option.id = "o_" + sectionIndex + "_" + questionIndex + "_" + answerIndex + "_" + optionIndex;
																		answer.options.push(option);
																	}
																	else {
																		errorsMessages.push("El nodo Option debe contener texto entre sus etiquetas.");
																		errors = true;
																	}
																}
																else {
																	errorsMessages.push("El nodo Option no contiene el atributo 'value' obligatorio.");
																	errors = true;
																}	
															});
															
															answers.push(answer);
														}
														
														else {
															errorsMessages.push("El tipo de respuesta '" + node.getAttribute('type') +"' debe contener al menos un nodo Option.");
															errors = true;
														}
														
														break;
													default:
														errorsMessages.push("El nodo Answer no contiene el atributo 'type' obligatorio.");
														errors = true;
														break;
													
													}
												});
												
												question.answers = answers;
											}
											else {
												errorsMessages.push("El nodo Answers debe contener al menos un nodo Answer.");
												errors = true;
											}	
										}
									}
									
									questions.push(question);
								} // No 
								else {
									errorsMessages.push("El nodo Question (s" + (parseInt(sectionIndex) + 1) + ", q" + (parseInt(questionIndex) + 1) + ") no tiene contiene el elemento Display obligatorio.");
									errors = true;
								}
								
							}); // Fin proceso preguntas
							
							section.questions = questions;
							
							sections.push(section);
						} // No Question node
						else {
							errorsMessages.push("El nodo Questions debe contener al menos un nodo Question.");
							errors = true;
						}
					}	// No Questions node
					else {
						errorsMessages.push("El nodo Section no tiene contiene el elemento Questions obligatorio.");
						errors = true;
					}
				});	// Fin proceso de secciones
				
				test.numberOfQuestions = index;
				test.sections = sections;
			} // No section node
			else {
				errorsMessages.push("Debe exister al menos un nodo Section.");
				errors = true;
			}
		}
		else {
			errorsMessages.push("No se ha encontrado el nodo Test obligatorio.");
			errors = true;
		}
		
		if (!errors) {
			
			if (test.origin != 'app')
				window.appController.checkPostParseConfigAndSave(test);
			else
				window.appController.saveNewTest(test, false);
		}
		else {
			 
			var errorsString = "La estructura del fichero no ha sido aceptada. \n\n";
			for (var i = 0; i < errorsMessages.length; i++)
				errorsString += "Error " + (i + 1) + ": " + errorsMessages[i] + "\n";
			
			alert(errorsString);
		}
	};
};