

var StorageManager = function () {
	
	var that = this;
	
	this.nextTestId;
	this.tests;
	
	this.nextInstanceId;
	this.instances;
	
	this.nextPatientId;
	this.patients;
	
	/*
	 * Prepara el estado de la memoria interna por primera vez
	 */
	this.initialize = function() {
		
		// Creamos la estructura para los test si no existe
		if (!window.localStorage.getItem('storage_manager_test_id')) {
			window.localStorage.setItem('storage_manager_test_id', 0);
		}
		
		if (!window.localStorage.getItem('storage_manager_tests')) {
			window.localStorage.setItem('storage_manager_tests', JSON.stringify(new Array()));
		} 
	
		// Hacemos lo mismo para last TestInstances
		if (!window.localStorage.getItem('storage_manager_instance_id')) {
			window.localStorage.setItem('storage_manager_instance_id', 0);
		}
		
		if (!window.localStorage.getItem('storage_manager_instances')) {
			window.localStorage.setItem('storage_manager_instances', JSON.stringify(new Array()));
		}
		
		// Y lo mismo para los Patients
		if (!window.localStorage.getItem('storage_manager_patient_id')) {
			window.localStorage.setItem('storage_manager_patient_id', 0);
		}
		
		if (!window.localStorage.getItem('storage_manager_patients')) {
			window.localStorage.setItem('storage_manager_patients', JSON.stringify(new Array()));
		}
	};
	
	this.commit = function() {
		// Guaramos los datos
		window.localStorage.setItem('storage_manager_tests', JSON.stringify(that.tests));
		window.localStorage.setItem('storage_manager_instances', JSON.stringify(that.instances));
		window.localStorage.setItem('storage_manager_patients', JSON.stringify(that.patients));
		
		// Y los indices
		window.localStorage.setItem('storage_manager_test_id', that.nextTestId);
		window.localStorage.setItem('storage_manager_instance_id', that.nextInstanceId);
		window.localStorage.setItem('storage_manager_patient_id', that.nextPatientId);
	};
	
	/*
	 * Trea los datos a memoria desde disco
	 */
	this.retrieve = function() {
		// Cargamos los datos
		that.tests = $.parseJSON(window.localStorage.getItem('storage_manager_tests'));
		that.instances = $.parseJSON(window.localStorage.getItem('storage_manager_instances'));
		that.patients = $.parseJSON(window.localStorage.getItem('storage_manager_patients'));
		
		that.nextTestId = parseInt(window.localStorage.getItem('storage_manager_test_id'));
		that.nextInstanceId = parseInt(window.localStorage.getItem('storage_manager_instance_id'));
		that.nextPatientId = parseInt(window.localStorage.getItem('storage_manager_patient_id'));
	};
	
	/*
	 * Comrpueba la existencia de elementos
	 */
	
	this.existsTest = function(id) {
		return false;
	};
	
	this.existsInstance = function(id) {
		return false;
	};
	
	this.existsPatient = function(name) {
		
		that.retrieve();
		var exists = false;
		
		$.each(that.patients, function (index, internal_id) {
			
			var patient = that.loadPatient(internal_id);
			
			if (patient === name)
				exists = true;
							
		});
		
		return exists;
	};
	
	/*
	 * Elimina un test de la memoria interna
	 */
	this.removeTest = function(id) {
		
		window.localStorage.removeItem('test_' + id);
		var idx = that.tests.indexOf(id);
		that.tests.splice(idx, 1);
		that.commit();
	};

	this.removeInstance = function(id) {
		
		window.localStorage.removeItem('instance_' + id);
		var idx = that.instances.indexOf(id);
		that.instances.splice(idx, 1);
		that.commit();
	};
	
	
	this.removePatient = function(id, removeRecords) {
		
		if (removeRecords)
			that.removePatientRecords(id);
		
		window.localStorage.removeItem('patient_' + id);
		var idx = that.patients.indexOf(id);
		that.patients.splice(idx, 1);
		that.commit();
	};
	
	this.removePatientRecords = function(id) {
		
		var patient = that.loadPatient(id);
		var records = that.loadInstanceList();
		
		//console.log("PATIENT: " + patient);
	 	
		for (var i = 0; i < records.length; i++) {
			//console.log("PATIENT_ID: " + records[i].data.patientID);
			if (records[i].data.patientID == patient) {
				that.removeInstance(records[i].data.id);			
			}
		}
	};
	
	/*
	 * Guarda un test en formato JSON en la memoria interna del telefono
	 */
	this.saveTest = function(test) {
		that.tests.push(that.nextTestId);
		that.save('test_' + that.nextTestId, JSON.stringify(test));
		that.nextTestId += 1;
		that.commit();
		
		return true;
	};
	
	this.saveInstance = function(instance) {
		that.instances.push(that.nextInstanceId);
		that.save('instance_' + that.nextInstanceId, JSON.stringify(instance));
		that.nextInstanceId += 1;
		that.commit();
		
		return true;
	};
	
	this.updateInstance = function(instance) {
		
		that.save('instance_' + instance.id, JSON.stringify(instance));
		return true;
	};
	
	this.savePatient = function(patient) {
		that.patients.push(that.nextPatientId);
		that.save('patient_' + that.nextPatientId, JSON.stringify(patient));
		that.nextPatientId += 1;
		that.commit();
		
		return true;
	};
	
	this.savePatientIfNotExists = function (patient) {
		
		if (!that.existsPatient(patient)) {
			
			that.savePatient(patient);
			return true;
		}
		
		return false;
	};
	
	this.save = function (id, json) {
		window.localStorage.setItem(id, json);
	};
	
	/*
	 * Carga un test de la memoria interna y lo devuelve como objeto
	 */
	this.loadTest = function(id) {
		return that.load('test_' + id);
	};
	
	this.loadInstance = function(id) {
		return that.load('instance_' + id);
	};
	
	this.loadPatient = function(id) {
		return that.load('patient_' + id);
	};
	
	this.load = function(id) {
		
		var json = window.localStorage.getItem(id);
		
		if (json)
			return $.parseJSON(json);
		
		return null;
	};
	
	this.loadUnfinalizedInstances = function() {
		
		that.retrieve();
		
		var instanceList = new Array();
		
		$.each(that.instances, function (index, id) {
			
			var instance = that.loadInstance(id);
			
			if (instance) {


				if (!instance.finalized)
				instanceList.push({ 
					'id' : id,
					'test' : instance.test.shortTitle,
					'patient' : instance.patientID,
					'date' : instance.shortDate,
				});
			}
			else
				console.log("Incoherencia en los datos.");
		});
		
		return instanceList;
		
	};
	
	this.removeFinalizedInstances = function () {
		
		that.retrieve();
		
		$.each(that.instances, function (index, id) {
			that.removeInstance(id);
		});
	};
	
	this.removePatientFinalizedInstances = function (patientId) {
		
		var list = that.loadPatientFinalizedInstances(patientId);
		
		for (var i = 0; i < list.length; i++)
			that.removeInstance(list[i].id);
		
	};
	
	this.loadFinalizedInstances = function() {
		
		that.retrieve();
		
		var instanceList = new Array();
		
		$.each(that.instances, function (index, id) {
			
			var instance = that.loadInstance(id);
			
			if (instance) {

				if (instance.finalized)
				instanceList.push({ 
					'id' : id,
					'test' : instance.test.shortTitle,
					'patient' : instance.patientID,
					'date' : instance.shortDate,
					'csv' : instance.csv
				});
			}
			else
				console.log("Incoherencia en los datos.");
		});
		
		return instanceList;
		
	};
	
	this.loadPatientFinalizedInstances = function(patientId) {
		
		that.retrieve();
		
		var instanceList = new Array();
		
		$.each(that.instances, function (index, id) {
			
			var instance = that.loadInstance(id);
			
			if (instance) {
				if (instance.finalized && instance.patientID === patientId)



				instanceList.push({ 
					'id' : id,
					'test' : instance.test.shortTitle,
					'patient' : instance.patientID,
					'date' : instance.date,
					'shortDate' : instance.shortDate,
					'csv' : instance.csv
				});
			}
			else
				console.log("Incoherencia en los datos.");
		});
		
		var reverseList = new Array();
		
		for (var i = instanceList.length - 1; i >= 0; i--)
			reverseList.push(instanceList[i]);
		
		return reverseList;
	};
	
	this.loadPatientList = function() {
		
		that.retrieve();
		
		var list = new Array();
		
		$.each(that.patients, function (index, id) {
			
			var patient = that.loadPatient(id);
			
			if (patient)
				list.push({ 'name': patient, 'id': id });
			else
				console.log("Incoherencia en los datos.");
				
		});
		
		return list;
	};
	
	this.loadInstanceList = function() {
		
		that.retrieve();
		
		var list = new Array();
		
		$.each(that.instances, function (index, id) {
			
			var instance = that.loadInstance(id);
			
			if (instance)
				list.push({ 'data': instance });
			else
				console.log("Incoherencia en los datos.");
				
		});
		
		return list;
	};
	
	/*
	 * Devuelve la lista con titulo e id de todos los test almacenados en la memoria interna
	 */
	this.loadTestList = function() {
		
		that.retrieve();
		
		var testList = new Array();
		
		$.each(that.tests, function (index, testId) {
			
			var test = that.loadTest(testId);
			
			if (test)
				testList.push({ 'title': test.title, 'id': testId });
			else
				console.log("Incoherencia en los datos.");
				
		});
		
		return testList;
	};
	
	that.initialize();
	that.retrieve();
	
};