function setup_artist_datatable(datasource_url) {
	var Dom = YAHOO.util.Dom,
	Event = YAHOO.util.Event,
	XHRDataSource = YAHOO.util.XHRDataSource,
	DataTable = YAHOO.widget.ScrollingDataTable,
	Paginator = YAHOO.widget.Paginator;

	/**
	 * ArtistTable creates a paginated DataTable.
	 */
	ArtistTable = {
		/**
		 * Initialize all the DataTable.
		 */
		init: function () {
			var myColumnDefs,
				myDataSource,
				myConfigs,
				myPaginator;
	
			// Define the DataTable's columns
			myColumnDefs = [{key:"artist", label:"Artist", sortable:false,
				width:"25%"}];
		
			// Create a new DataSource
			myDataSource = new XHRDataSource(datasource_url +"?");
	
			// data.php just happens to use JSON. Let the DataSource
			// know to expect JSON data.
			myDataSource.responseType = XHRDataSource.TYPE_JSON;
	
			// Define the structure of the DataSource data.
		    myDataSource.responseSchema = {
		        resultsList: "contents.results",
		        fields: ["artist"],
		        metaFields: {
		            totalRecords: "contents.record_count"
		    	}
			};
	
			// Set the DataTable configuration
		    myConfigs = {
	        	initialRequest:"",
	        	dynamicData: true,
	        	height:"100%",
	        	width:"100%",
	        	selectionMode:"single",
				// This configuration item is what builds the query string
				// passed to the DataSource.
				generateRequest: this.requestBuilder
		    };
	
			// Create the DataTable.
			myDataTable = new DataTable("artist_dtable", myColumnDefs, myDataSource, myConfigs);
	        // Enable row highlighting
			//myDataTable.subscribe("rowMouseoverEvent", myDataTable.onEventHighlightRow);
			//myDataTable.subscribe("rowMouseoutEvent", myDataTable.onEventUnhighlightRow);
			myDataTable.subscribe("rowClickEvent", myDataTable.onEventSelectRow);
			myDataTable.subscribe("rowSelectEvent", function(oArgs) {
				//alert(oArgs.record.getData('artist'));
				AlbumTable.fireDT(false);
			});
	
			// Define an event handler that scoops up the totalRecords which we sent as
			// part of the JSON data. This is then used to tell the paginator the total records.
			// This happens after each time the DataTable is updated with new data.
			myDataTable.handleDataReturnPayload = function(oRequest, oResponse, oPayload) {
				oPayload.totalRecords = oResponse.meta.totalRecords;
				return oPayload;
			}
	
			// Store the DataTable and DataSource for use elsewhere in this script.
			ArtistTable.myDataSource = myDataSource;
			ArtistTable.myDataTable = myDataTable;
	
	        // Initial load
			ArtistTable.fireDT(false);
		},
	
		/**
		 * This method is passed into the DataTable's "generateRequest" configuration
		 * setting overriding the default generateRequest function. This function puts
		 * together a query string which is passed to the DataSource each time a new
		 * set of data is requested. All of the custom sorting and filtering options
		 * added in by this script are gathered up here and inserted into the
		 * query string.
		 * @param {Object} oState
		 * @param {Object} oSelf
		 * These parameters are explained in detail in DataTable's API
		 * documentation. It's important to note that oState contains
		 * a reference to the paginator and the pagination state and
		 * the column sorting state as well.
		 */
		requestBuilder: function (oState, oSelf) {
			return "&blah=";
		},
	
		/**
		 * This method is used to fire off a request for new data for the
		 * DataTable from the DataSource. The new state of the DataTable,
		 * after the request for new data, will be determined here.
		 * @param {Boolean} resetRecordOffset
		 */
		fireDT: function (resetRecordOffset) {
	        var oState = ArtistTable.myDataTable.getState(),
	        	request,
	        	oCallback;
	
			/* We don't always want to reset the recordOffset.
			If we want the Paginator to be set to the first page,
			pass in a value of true to this method. Otherwise, pass in
			false or anything falsy and the paginator will remain at the
			page it was set at before.*/
	        if (resetRecordOffset) {
	        	oState.pagination.recordOffset = 0;
	        }
	
			/* If the column sort direction needs to be updated, that may be done here.
			It is beyond the scope of this example, but the DataTable::sortColumn() method
			has code that can be used with some modification. */
	
			/*
			This example uses onDataReturnSetRows because that method
			will clear out the old data in the DataTable, making way for
			the new data.*/
			oCallback = {
			    success : ArtistTable.myDataTable.onDataReturnSetRows,
			    failure : ArtistTable.myDataTable.onDataReturnSetRows,
	            argument : oState,
			    scope : ArtistTable.myDataTable
			};
	
			// Generate a query string
	        request = ArtistTable.myDataTable.get("generateRequest")(oState, ArtistTable.myDataTable);
	
			// Fire off a request for new data.
			ArtistTable.myDataSource.sendRequest(request, oCallback);
		}
	};
	
	ArtistTable.init();
	return ArtistTable;
}