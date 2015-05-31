
/* CONSTANTES */
var APP_DIRECTORY = "PsicoTest";
var IMAGES_DIRECTORY = APP_DIRECTORY + "/images";
var TEMPORARY_DIRECTORY = APP_DIRECTORY + "/tmp";
var EXPORT_DIRECTORY = APP_DIRECTORY + "/export";
var IMPORT_DIRECTORY = APP_DIRECTORY + "/import";
var RESULT_IMAGE_DIRECTORY = IMAGES_DIRECTORY + "/result";
var CONFIG_IMAGE_DIRECTORY = IMAGES_DIRECTORY + "/config";

var AppController = function() {

	var that = this;
	
	this.storageManager = new StorageManager();
	this.testController;
	
	this.timer = false;
	this.timerTimeLimit;
	this.timerTime;
	this.timerFormId;
	this.timerIntervalId;
	
	this.tempTest;
	
	this.postParseImageTarget;

	
	this.createDirectories = function() {
		
		var AppDirectoriesCreated = parseInt(window.localStorage.getItem('app_directories_created'));
		
		if (AppDirectoriesCreated != 1) {
		
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
				fileSys.root.getDirectory(APP_DIRECTORY, {create:true, exclusive: false}, function (directory) {
					fileSys.root.getDirectory(IMAGES_DIRECTORY, {create:true, exclusive: false}, function (directory) {
						fileSys.root.getDirectory(TEMPORARY_DIRECTORY, {create:true, exclusive: false}, function (directory) {
							fileSys.root.getDirectory(RESULT_IMAGE_DIRECTORY, {create:true, exclusive: false}, function (directory) {
								fileSys.root.getDirectory(CONFIG_IMAGE_DIRECTORY, {create:true, exclusive: false}, function (directory) {
									fileSys.root.getDirectory(EXPORT_DIRECTORY, {create:true, exclusive: false}, function (directory) {
										fileSys.root.getDirectory(IMPORT_DIRECTORY, {create:true, exclusive: false}, function (directory) {
											window.localStorage.setItem('app_directories_created', 1);
										}, function(error) { /*alert(error.code);*/ });
									}, function(error) { /*alert(error.code);*/ });
								}, function(error) { /*alert(error.code);*/ });
							}, function(error) { /*alert(error.code);*/ });
						}, function(error) { /*alert(error.code);*/ });
					}, function(error) { /*alert(error.code);*/ });
				}, function(error) { /*alert(error.code);*/ });
			}, function(error) { /*alert(error.code);*/ });
		}
		
	};
	
	this.loadPreConfigTests = function() {
		
		var preconfigTestsLoaded = parseInt(window.localStorage.getItem('preconfig_tests_loaded'));
		
		if (preconfigTestsLoaded != 1) {
			that.loadNewTest('tests/cummings.xml', 'app');
			that.loadNewTest('tests/fototest.xml', 'app');
			that.loadNewTest('tests/minimental.xml', 'app');
			that.loadNewTest('tests/tam.xml', 'app');
			
			window.localStorage.setItem('preconfig_tests_loaded', 1);
		}		
	};
	
	/*
	 * Carga un test a partir de un fihcero de configuracion XML y lo guarda en la memoria del telefono
	 */
	this.loadNewTest = function (uri, origin) {
		
		var parser = new TestParser();
		
		if (origin == 'url') {
			$('#test-manage-add-url-loading').show();
			parser.getUrlXml(uri);
		} else if (origin == 'local') {
			parser.getLocalXml(uri);
		}
		else if (origin == 'app') {
			parser.getAppXml(uri);
		}
	};
	
	this.checkPostParseConfigAndSave = function(test) {
		that.tempTest = test;
		
		if (test.postParseConfig) {
			
			html = "";
			
			$.each(test.sections, function(sectionIndex, section) {
				$.each(section.questions, function(questionIndex, question) {
					if (question.mediaRequired === 'image') {
						html += "<span><strong>Imagen necesaria para pregunta " + (parseInt(question.absoluteIndex) + 1) + "</strong></span>" +
						"<div style='text-align: center;'><img src='' style='max-width: 60%; margin:10px;' id='" + question.id +"-post-parse-image' /></div>" + 
						"<div class='ui-grid-a' style='border-bottom: 1px dotted #707070;'>" +
					    "<div class='ui-block-a'><a href='#' onclick='window.appController.capturePostParseImage(\"" + question.id + "-post-parse-image\", \"library\")' class='ui-shadow ui-btn ui-corner-all ui-btn-icon-left ui-icon-grid'>Galeria</a></div>" +
					    "<div class='ui-block-b'><a href='#' onclick='window.appController.capturePostParseImage(\"" + question.id + "-post-parse-image\", \"camera\")' class='ui-shadow ui-btn ui-corner-all ui-btn-icon-right ui-icon-camera'>Camara</a></div>" +
					    "</div>";
						}
				});
			});
			
			$('#post-parse-config-page-content').html(html);
			$.mobile.navigate('#post-parse-config-page');
		}
		
		else {
			that.saveNewTest(test, true);
		}
	};
	
	this.processPostParseConfig = function () {
		
		$.each(that.tempTest.sections, function(sectionIndex, section) {
			$.each(section.questions, function(questionIndex, question) {
				if (question.mediaRequired === 'image') {
					
					var path = $('#' + question.id + '-post-parse-image').attr('src');
					question.mediaImageSrc = path;
					
				}
			});
		});
		
		that.saveNewTest(that.tempTest, true);
	};
	
	this.saveNewTest = function (test, notify) {
		
		that.tempTest = null;
		
		if (test != null) {
			
			if (that.storageManager.saveTest(test) && notify) {
				navigator.notification.alert(
					"El test '" + test.title  + "' fue guardado correctamente!",
					function() {},
					'Test cargado',
					'Aceptar'
				);
				that.goToTestManager();
			}
		}
		else if (notify) {
			navigator.notification.alert(
				"No se ha podido cargar el test. Corrija los errores y pruebe de nuevo.",
				function() {},
				'Error',
				'Aceptar'
			);
			navigator.notification.vibrate(100);
		}
		
		$('#test-manage-add-url-loading').hide();
	};
	
	/*
	 * Carga un test desde la memoria del telefono y ¡¡¡¡se lo entrega a TestController para ejecutarlo!!!!
	 */
	this.startTest = function (test_id, patient_id,medico) {
		
		console.log(patient_id);
		var test = that.storageManager.loadTest(test_id);
		var testInstance = new TestInstance(test, null, patient_id,medico);
		that.testController = new TestController(testInstance);

		// Guaramos el paciente si es nuevo
		that.storageManager.savePatientIfNotExists(patient_id);

		that.testController.generateUI();
		that.testController.navigateToFirstPage();
	};

	this.resumeTest = function (testInstanceId) {

		var testInstance = that.storageManager.loadInstance(testInstanceId);

		testInstance.startDate = new Date();

		that.testController = new TestController(testInstance);

		that.testController.generateUI();
		that.testController.navigateToCurrentPage();
	};

	this.showTestResult = function(testInstanceId) {

		var testInstance = that.storageManager.loadInstance(testInstanceId);

		that.testController = new TestController(testInstance);

		that.testController.showResult();
	};

	this.removeTest = function (testId) {
		navigator.notification.vibrate(100);
		navigator.notification.confirm(
	    		'¿Está seguro de que desea elminar este test?', // message
	             function(buttonIndex) {
	    			
	    			if (buttonIndex == 2) {
	    				that.storageManager.removeTest(testId);
	    				that.goToTestManager();
	    				
	    			}
	    			
	    		},
	            'Eliminar test',
	            'Cancelar,Aceptar'
	    );
	};

	this.removeRecord = function (instanceId) {
		navigator.notification.vibrate(100);
		navigator.notification.confirm(
	    		'¿Está segudo de que desea eliminar este test del historial?', // message
	             function(buttonIndex) {
	    			
	    			if (buttonIndex == 2) {
	    				that.storageManager.removeInstance(instanceId);
	    				that.goToTestRecords();
	    			}
	    			
	    		},
	            'Eliminar del historial',
	            'Cancelar,Aceptar'
	    );
	};
	
	this.removePatient = function (id, name) {
		navigator.notification.vibrate(100);
		navigator.notification.confirm(
	    		"¿Está seguro de que desea eliminar al paciente '" + name + "'? También se eliminará todo su historial.",
	             function(buttonIndex) {
	    			
	    			if (buttonIndex == 2) {
	    				that.storageManager.removePatient(id, true);
	    				that.goToPatientManager();
	    			}

	    		},
	            'Eliminar paciente',
	            'Cancelar,Aceptar'
	    );

	};

	this.removeInstance = function (instanceId) {
		navigator.notification.vibrate(100);
		navigator.notification.confirm(
	    		'¿Está seguro de que desea descartar este test?', // message
	             function(buttonIndex) {
	    			
	    			if (buttonIndex == 2) {
	    				that.storageManager.removeInstance(instanceId);
	    				$.mobile.navigate('#home');
	    				window.appController.checkUnfinalizedInstances();
	    			}
	    			
	    		},
	            'Descartar test',
	            'Cancelar,Aceptar'
	    );
		// Eliminar fotos adjuntas al resultado : entry.remove(success, fail);
	};
	
	this.removeInstanceFromSingle = function (instanceId, patientId) {
		navigator.notification.vibrate(100);
		navigator.notification.confirm(
	    		'¿Está seguro de que desea descartar este test?', // message
	             function(buttonIndex) {
	    			
	    			if (buttonIndex == 2) {
	    				that.storageManager.removeInstance(instanceId);
	    				that.goToPatientRecords(patientId);
	    			}
	    			
	    		},
	            'Descartar test',
	            'Cancelar,Aceptar'
	    );
		// Eliminar fotos adjuntas al resultado : entry.remove(success, fail);
	};

	this.navigateToHome = function () {
		that.checkUnfinalizedInstances();
	};

	this.checkUnfinalizedInstances = function() {

		var unfinalizedTests = that.storageManager.loadUnfinalizedInstances();
		var html = "";

		if (unfinalizedTests.length > 0) {

			html += "<table class='test-records'>";

			for (var i = 0; i < unfinalizedTests.length; i++) {
				html += "<tr>";
				html += "<td>" + unfinalizedTests[i].patient + "<br />" + unfinalizedTests[i].test + " - " + unfinalizedTests[i].date + "</td>";
				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.removeInstance(" + unfinalizedTests[i].id + ")' class='ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.resumeTest(" + unfinalizedTests[i].id + ")' class='ui-btn ui-icon-arrow-r ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "</tr>";
			}

			html += "</table>";

			$('#unfinalized-tests-content').html(html);
			$('#unfinalized-tests').show();
		}
		else 
			$('#unfinalized-tests').hide();
	};

	this.goToTestManager = function () {

		var testList = window.appController.storageManager.loadTestList();

		if (testList.length > 0) {
			html = "<table class='test-records'>";
			for (var i = 0; i < testList.length; i++) {
				html += "<tr>";
				html += "<td>" +  testList[i].title + "</td>";
				//html += "<td><div id='custom-border-radius'><a href='#' onclick='window.appController.showTestResult(" + finalizedInstances[i].id + ")' class='ui-btn ui-icon-eye ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.removeTest(" + testList[i].id + ")' class='ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				//html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.viewTest(" + testList[i].id + ")' class='ui-btn ui-icon-eye ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "</tr>";
			}
			html += "</table>";
			$('#test-manage-main-list').html(html);
		}
		else {
			$('#test-manage-main-list').html("<h4>No hay tests disponibles</h4>");
		}	 

		$.mobile.navigate( "#test-manage-main");
	};

	this.goToTestRecords = function() {

		var finalizedInstances = that.storageManager.loadFinalizedInstances();
		var html = "";

		if (finalizedInstances.length > 0) {

			html += "<table class='test-records'>";

			for (var i = 0; i < finalizedInstances.length; i++) {
				html += "<tr>";
				html += "<td>" + finalizedInstances[i].patient + "<br />" + finalizedInstances[i].test + " - " + finalizedInstances[i].date + "</td>";
				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.removeRecord(" + finalizedInstances[i].id + ")' class='ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.showTestResult(" + finalizedInstances[i].id + ")' class='ui-btn ui-icon-eye ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "</tr>";
			}

			html += "</table>";

			$('#test-records-content').html(html);

		}
		else 
			$('#test-records-content').html("<h4>El historial no tiene registros</h4>");


		$.mobile.navigate('#test-records');
	};
	
	this.goToPatientManager = function() {
		
		var patients = that.storageManager.loadPatientList();
		var html = "";

		if (patients.length > 0) {

			html += "<table class='test-records'>";

			for (var i = 0; i < patients.length; i++) {
				html += "<tr>";
				html += "<td>" + patients[i].name + "</td>";
				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.removePatient(\"" + patients[i].id + "\",\"" + patients[i].name + "\")' class='ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.goToPatientRecords(\"" + patients[i].name + "\")' class='ui-btn ui-icon-bullets ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "</tr>";
			}

			html += "</table>";

			$('#patient-manage-content').html(html);

		}
		else 
			$('#patient-manage-content').html("<h4>No existen pacientes guardados</h4>");


		$.mobile.navigate('#patient-manage');
		
	};
	
	this.goToPatientRecords = function (patientId) {
		
		console.log(patientId);
		
		var instances = that.storageManager.loadPatientFinalizedInstances(patientId);
		var html = "";

		if (instances.length > 0) {

			html += "<div class='ui-body ui-body-a'><table class='test-records'>";

			for (var i = 0; i < instances.length; i++) {
				html += "<tr>";
				html += "<td>" + instances[i].patient + "<br />" + instances[i].test + " - " + instances[i].date + "</td>";
				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.removeInstanceFromSingle(" + instances[i].id + ", " + patientId + "); ' class='ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.showTestResult(" + instances[i].id + ")' class='ui-btn ui-icon-eye ui-btn-icon-notext ui-corner-all'>No text</a></div>";
				html += "</tr>";
			}

			html += "</table></div>";
			
			html += "<a href='#' class='ui-btn ui-corner-all ui-icon-delete ui-btn-icon-left' onclick='window.appController.removeRecords(\"" + patientId + "\"); window.appController.goToPatientRecords(\"" + patientId + "\");'>Vaciar</a>";

			$('#patient-test-records-content').html(html);
			$('#patient-test-records-title').html("Historial de " + patientId);

		}
		else 
			$('#patient-test-records-content').html("<div class='ui-body ui-body-a'><h4>El paciente no tiene tests finalizados</h4></div>");


		$.mobile.navigate('#patient-test-records');
		
	};




	
	this.selectPatient = function (id) {
		$('#search-patient-select').collapsible( "collapse" );
		$('#pre-init-patient-id').val(id);
	};
	
	this.selectTest = function (id, title) {
		$('#search-test-select').collapsible( "collapse" );
		$('#pre-init-test-id').val(id);
		$('#pre-init-test-name').val(title);
	};
	
	this.counterHelperPlus = function (input_id) {
		
		var number = parseInt($('#' + input_id).val());
		number++;
		
		$('#' + input_id).val(number);
		
	};
	
	this.counterHelperMinus = function (input_id) {
		
		var number = parseInt($('#' + input_id).val());

		if (number > 0)
			number--;
		
		$('#' + input_id).val(number);
		
	};
	
	this.setCountdown = function (time, form_id) {
		
		if (that.timer == true)
			clearInterval(that.timerInvervalId);
		
		that.timer = true;
		that.timerTimeLimit = parseInt(time);
		that.timerTime = parseInt(time);
		that.timerFormId = form_id;
	};
	
	this.startCountdown = function () {
		that.timerInvervalId = setInterval( function() { that.countdown(); }, 1000);
	};
	
	this.restartCountdown = function () {
		that.timerTime = that.timerTimeLimit;
		$('#' + that.timerFormId).html(that.timerTimeLimit);
		clearInterval(that.timerInvervalId);
	};
	
	this.stopCountdown = function () {
		if (that.timer) {
			navigator.notification.vibrate(100);
			$('#' + that.timerFormId).html(0);
			clearInterval(that.timerInvervalId);
		}
	};
	
	this.countdown = function() {
		
		if (that.timerTime > 0) {
			that.timerTime -= 1;
			$('#' + that.timerFormId).html(that.timerTime);
		}
		else {
			that.stopCountdown();
		}
	};
	
	// CAPTURA PARA IMAGES EN CONFIGURACION
	
	this.capturePostParseImage = function (target, source) {
		
		that.postParseImageTarget = target;
		
		if (source == 'camera') {
		
			navigator.camera.getPicture(
					function (imageURI) { that.getFilePostParseImage(imageURI, 'move'); }, 
					function(message) { /*alert("Error: " + message);*/ }, 
					{ quality: 50, destinationType: Camera.DestinationType.FILE_URI });
		}
		
		else if (source == 'library') {
			navigator.camera.getPicture(
					function (imageURI) { that.getFilePostParseImage(imageURI, 'copy'); }, 
					function(message) { /*alert("Error: " + message);*/ }, 
					{ quality: 50, destinationType: Camera.DestinationType.FILE_URI, sourceType: Camera.PictureSourceType.PHOTOLIBRARY });
		}
		
	};
	
	this.getFilePostParseImage = function(file, mode) {
		if (mode === 'move')
			window.resolveLocalFileSystemURI(file, that.movePostParseImage, function(error) { });
		else if (mode === 'copy')
			window.resolveLocalFileSystemURI(file, that.copyPostParseImage, function(error) { });
	};
	
	this.copyPostParseImage = function (entry){ 
	    var d = new Date();
	    var n = d.getTime();
	    //new file name
	    var newFileName = n + ".jpg";
	    var myFolderApp = CONFIG_IMAGE_DIRECTORY;

	    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
	    //The folder is created if doesn't exist
	    fileSys.root.getDirectory( myFolderApp,
	                    {create:true, exclusive: false},
	                    function(directory) {
	                        entry.copyTo(directory, newFileName, that.processPostParseImage, function(error) { /*alert(error.code);*/ });
	                    },
	                    function(error) { /*alert(error.code);*/ });
	                    },
	                    function(error) { /*alert(error.code);*/ });
	};
	
	this.movePostParseImage = function (entry){ 
	    var d = new Date();
	    var n = d.getTime();
	    //new file name
	    var newFileName = n + ".jpg";
	    var myFolderApp = CONFIG_IMAGE_DIRECTORY;

	    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
	    //The folder is created if doesn't exist
	    fileSys.root.getDirectory( myFolderApp,
	                    {create:true, exclusive: false},
	                    function(directory) {
	                        entry.moveTo(directory, newFileName, that.processPostParseImage, function(error) { /*alert(error.code);*/ });
	                    },
	                    function(error) { /*alert(error.code);*/ });
	                    },
	                    function(error) { /*alert(error.code);*/ });
	};
	
	this.processPostParseImage = function(entry) {
		
		var img = $('#' + that.postParseImageTarget);
		img.attr('src', entry.fullPath);
	};
	
	// CAPTURA IMAGENES PARA RESULTADO
	
	this.captureResultImage = function () {
	    // Take picture using device camera and retrieve image as base64-encoded string
		navigator.camera.getPicture(
				function (imageURI) { that.getFileResultImage(imageURI); }, 
				function(message) { /*alert("Error: " + message);*/ }, 
				{ quality: 50, destinationType: Camera.DestinationType.FILE_URI });
	};
	
	this.getFileResultImage = function(file) {
		window.resolveLocalFileSystemURI(file, that.moveResultImage, function(error) { /*alert(error.code);*/ });
	};
	
	this.moveResultImage = function (entry){ 
	    var d = new Date();
	    var n = d.getTime();
	    //new file name
	    var newFileName = n + ".jpg";
	    var myFolderApp = RESULT_IMAGE_DIRECTORY;

	    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
	    //The folder is created if doesn't exist
	    fileSys.root.getDirectory( myFolderApp,
	                    {create:true, exclusive: false},
	                    function(directory) {
	                        entry.moveTo(directory, newFileName, that.processResultImage, function(error) { /*alert(error.code);*/ });
	                    },
	                    function(error) { /*alert(error.code);*/ });
	                    },
	                    function(error) { /*alert(error.code);*/ });
	};
	
	this.processResultImage = function(entry) {
		
		that.testController.testInstance.resultImages.push(entry.fullPath);
			
		var img = "<img style='max-width:46%; margin: 2%;' src='" + entry.fullPath +"' />";
		
		$('#final-test-page-images').append(img);
	};
	
	this.showFullScreenImage = function(id) {
		
		var img = $('#' + id);
		
		var html = "<img class='full-screen-image' src='" + img.attr('src') + "' />";
		
		$('#full-screen-image-content').html(html);
		$.mobile.navigate('#full-screen-image');
		
	};
	
	this.removeRecords = function (patientId) {
		navigator.notification.vibrate(100);
	    navigator.notification.confirm(
	    		'¿Está seguro de que desea eliminar el hostorial?', // message
	             function(buttonIndex) {
	    			
	    			if (buttonIndex == 2) {
	    				
	    				if (patientId == null) {
	    					that.storageManager.removeFinalizedInstances();
	    					that.goToTestRecords();		
	    				}
	    				else {
	    					that.storageManager.removePatientFinalizedInstances(patientId);
	    					that.goToPatientRecords(patientId);
	    				}
	    			}
	    			
	    		},
	            'Borrar historial',
	            'Cancelar,Aceptar'
	    );
	};
	
	this.exportRecords = function (patientId,syncOption) {
		
		var d = new Date();
	    var n = d.getTime();
	    var instances;
	    var newFileName;
	    
	    if (patientId == null) {
	    	instances = window.appController.storageManager.loadFinalizedInstances();
	    	newFileName = 'export_' + n + ".csv";
	    }
	    else {
	    	instances = window.appController.storageManager.loadPatientFinalizedInstances(patientId);
	    	newFileName = 'export_' + patientId + '_' + n + ".csv";
	    }
	    
	    if (instances.length == 0) {
	    	navigator.notification.alert(
				"El historial está vacío.",
				function() {},
				'No se ha exportado',
				'Aceptar'
			);
	    }
	    else {

		    var fileContent = "";
		    for (var i = 0; i < instances.length; i++)
		    	fileContent += instances[i].csv + '\r\n';

			if( syncOption ){

        	 $.ajax({

                  url: 'http://192.168.1.17/psycotest/sync.php',
                  type: 'post',
                  data: {"r": fileContent },

                  success: function(data, status) {

                      alert( data );

                  },
                  error: function(xhr, desc, err) {
                    console.debug(xhr);
                    console.debug("Details: " + desc.d + "\nError:" + err.d );
                    alert(desc+" -- "+err );
                  }
                }); // end ajax call

                return false;

			}

			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {      
				fileSystem.root.getFile(EXPORT_DIRECTORY + "/" + newFileName, { create: true, exclusive: false }, function (fileEntry) {
					fileEntry.createWriter(function (writer) {
						
						writer.onwriteend = function(evt) {
							navigator.notification.alert(
								"Se ha guardado el historial en '" + EXPORT_DIRECTORY + "/" + newFileName + "'",
								function() {},
								'Historial exportado',
								'Aceptar'
							);
					    };
						
						writer.write(fileContent);
						writer.abort();
						
					}, function () { /* error */ });
				},
				function () { /* error */ });
			},
			function() { /* error */ });
	    }
		
	};


	$("#test-manage-refresh-repo").click(function(){

	$.ajax({

                              url: 'http://192.168.1.17/psycotest/getrepo.php',
                              type: 'get',
                              success: function(data, status) {

                                 lala = JSON.parse(data);
                                 data = "";
                                 for( i = 0 ; i < lala.length ; i++ )
                                 {
                                 	data += '<input type="checkbox" name="repofile" value="'+lala[i]+'" /> '+lala[i]+"<br/>";
                                 }

            					 $("#listadorepo").html(data);

                              },
                              error: function(xhr, desc, err) {
                                console.debug(xhr);
                                console.debug("Details: " + desc.d + "\nError:" + err.d );
                                alert(desc+" -- "+err );
                              }
                            }); // end ajax call


	});

	//var selected = [];
	$("#test-manage-download-repo").click(function(){

        $('#listadorepo input:checked').each(function() {
            //selected.push($(this).attr('name'));
        	window.appController.loadNewTest( "http://192.168.1.17/psycotest/"+$(this).val() , 'url' );
        	//alert( );

        });

	});



	this.loadLocalXMLList = function () {
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
		    //The folder is created if doesn't exist
		    fileSys.root.getDirectory(IMPORT_DIRECTORY,
		        {create:true, exclusive: false},
		        	function(directory) {
		        		var directoryReader = directory.createReader();
		        		
		        		directoryReader.readEntries(function(entries) {
		        			
		        			var i;
		        			var html = "<table class='test-records'>";
	
		        		    for (i = 0; i < entries.length; i++) {
		        		    	
		        		    	html += "<tr>";
		        				html += "<td>" + entries[i].name + "</td>";
		        				html += "<td class='btn'><div id='custom-border-radius'><a href='#' onclick='window.appController.loadNewTest(\"" + entries[i].fullPath + "\", \"local\");' class='ui-btn ui-icon-check ui-btn-icon-notext ui-corner-all'>No text</a></div>";
		        				html += "</tr>";
		        		    }
		        		    
		        		    html += "</table>";
		        		    
		        		    $('#test-manage-add-local-list').html(html);
		        		    $.mobile.navigate('#test-manage-add-local');
		        			
		        		}, function() { 
		        			
		        			navigator.notification.alert(
									"Error al leer los ficheros del directorio de importación.",
								function() {},
								'Historial exportado',
								'Aceptar'
							);
		        		});
		        		
		            },
		            function(error) { /*alert(error.code);*/ });
			},
		    function(error) { /*alert(error.code);*/ }
		);
	};
};

function onDeviceReady() {

	$(document).ready(function() {
		window.appController = new AppController();
		window.appController.checkUnfinalizedInstances();

		// onclick='window.appController.loadTest(" + testList[i].id + ", null)' href='#' id='load_test_" + testList[i].id + "'

		$('#test-manage-btn').click(function() { 
			window.appController.goToTestManager(); 
		});

		$('#test-manage-add-url-submit-btn').click(function() {
			window.appController.loadNewTest($('#test-xml-location').val(), 'url'); 
		});
		
		$('#test-manage-launch-local').click(function() {
			
			window.appController.loadLocalXMLList();
			
		});
		
		$('#patient-manage-submit-btn').click(function() {
			if(window.appController.storageManager.savePatientIfNotExists($('#patient-manage-name').val())) {
				navigator.notification.alert(
						"El paciente '" + $('#patient-manage-name').val() + "' fue guardado correctamente.",
						function() {},
						'Paciente guardado',
						'Aceptar'
					);
			}
			else {
				navigator.notification.alert(
						"El paciente '" + $('#patient-manage-name').val() + "' ya existe.",
						function() {},
						'Aviso',
						'Aceptar'
					);
			}
			
			$('#patient-manage-name').val('');
			window.appController.goToPatientManager();
		});
		
		// RECORDS
		
		$('#test-records-remove-btn').click(function() {
			window.appController.removeRecords(null);
		});
		
		$('#test-records-export-btn').click(function() {
			window.appController.exportRecords(null,false);
		});

		$('#test-records-sync-btn').click(function() {
        	window.appController.exportRecords(null,true);
        });
		
		$('#patients-manage-btn').click(function() {
			window.appController.goToPatientManager();
		});

		$('#test-init-btn').click(function() {

			var testList = window.appController.storageManager.loadTestList();
			var patientList = window.appController.storageManager.loadPatientList();
			
			var patientListHtml = "<div data-role='collapsible' id='search-patient-select'>" +
				"<h2>Seleccionar paciente existente</h2><ul id='search-patient-lisview' data-role='listview' data-filter='true'>";
			
			for (var i = 0; i < patientList.length; i++) {
				patientListHtml += "<li><a href='#' onclick='window.appController.selectPatient(\"" + patientList[i].name + "\");'>" + patientList[i].name + "</a></li>";			
			}
			
			patientListHtml += "</ul></div>";
			
			var testListHtml = "<div data-role='collapsible' id='search-test-select'>" +
			"<h2>Seleccione uno</h2><ul id='search-test-lisview' data-role='listview' data-filter='true'>";
		
			for (var i = 0; i < testList.length; i++) {
				testListHtml += "<li><a href='#' onclick='window.appController.selectTest(\"" + testList[i].id + "\", \"" + testList[i].title + "\");'>" + testList[i].title + "</a></li>";			
			}
			
			testListHtml += "</ul></div>";

			$('#test-pre-init-patient-list-content').html(patientListHtml);
			$('#test-pre-init-test-list-content').html(testListHtml);
			$('#search-patient-lisview').listview({filter: true});
			$('#search-test-lisview').listview({filter: true});
			$('#search-patient-select').collapsible();
			$('#search-test-select').collapsible();
			
			$.mobile.navigate('#test-pre-init');
		});

		$('#test-records-btn').click(function() {	 
			window.appController.goToTestRecords();
		});
		
		$('#get-image').click(function() {
			window.appController.addResultImage();
		});

		$('#test-pre-init-submit-btn').click(function() {

			var test_id = $('#pre-init-test-id').val();
			var patient_id = $('#pre-init-patient-id').val();
			var doctor_id = $('#pre-init-doctor-id').val();

			if (test_id === 'null' || patient_id.length == 0){
				
				navigator.notification.alert(
						"Debe introducir un identificador de paciente y seleccionar un tipo de test.",
					function() {},
					'Datos requeridos',
					'Aceptar'
				);
			}
			else {
				window.appController.startTest(test_id, patient_id,doctor_id);
			}
		});
		
		$( window ).load(function() {
			window.appController.createDirectories();
			window.appController.loadPreConfigTests();
		});
	});

};

document.addEventListener("deviceready", onDeviceReady(), false);