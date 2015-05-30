

var TestInstance = function(test, state, patient, medico ) {
	
	var that = this;
	
	var dateFormat = new DateFormat();
	
	this.id;
	
	this.patientID = patient;
	this.date = dateFormat.format(new Date());
	this.shortDate = dateFormat.shortFormat(new Date());
	
	this.finalized = false;
	this.startDate = null;
	this.time;

	this.medico = medico;

	this.currentQuestion = 0;
	
	this.test = test;		// Estructura
	this.state = state;		// Estado
	this.resultHtmlTable = "<table class='result-table'><tr><td>No hay resultados</td></tr></table>";
	this.resultImages;
	this.resultImagesHtml = "<div>No existen imagenes adjuntas</div>";
	this.csv;
	
	this.initialize = function() {
		var storageManager = new StorageManager();
		that.id = storageManager.nextInstanceId;
		that.time = 0;
		that.resultImages = new Array();
		storageManager.saveInstance(that);
	};
	
	this.initialize();
};