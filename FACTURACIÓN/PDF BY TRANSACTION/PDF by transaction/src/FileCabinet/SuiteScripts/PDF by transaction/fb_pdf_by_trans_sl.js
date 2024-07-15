/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/render', 'N/record', 'N/ui/serverWidget', 'N/search'],
    /**
     * @param{log} log
     * @param{render} render
     * @param{record} record
     * @param{serverWidget} serverWidget
     * @param{search} search
     */
    function (log, render, record, serverWidget, search) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {

            try {
                var request = context.request, params = request.parameters, response = context.response;
                var templateID = params.templateID, recordID = params.recordID, typeRecord = params.typeRecord, savedSearch = params.savedSearch, requiredSearch = params.requiredSearch, createdfrom = params.createdfrom;
                log.audit('params data', {
                    templateID: templateID,
                    recordID: recordID,
                    typeRecord: typeRecord,
                    savedSearch: savedSearch,
                    requiredSearch: requiredSearch,
                    createdfrom: createdfrom
                });


                if (requiredSearch === false || requiredSearch === 'false') {
                    var renderer = render.create();
                    var results = [];
                    if (savedSearch !== 'null') {
                        var searchLoad = search.load({ id: savedSearch });
                        var filters = searchLoad.filters;
                        log.audit({ title: 'Filters', details: filters });
                        if (createdfrom === true || createdfrom === 'true') {
                            const idCreaetedTo = record.load({ type: typeRecord, id: recordID }).getValue({ fieldId: 'createdfrom' });
                            log.audit({ title: 'idCreaetedTo', details: idCreaetedTo });
                            var customFltr = search.createFilter({
                                name: 'internalid',
                                operator: search.Operator.IS,
                                values: idCreaetedTo
                            });
                            filters.push(customFltr);
                            log.debug({title:'filters 👻',details:filters});
                        }else{
                            var customFltr = search.createFilter({
                                name: 'internalid',
                                operator: search.Operator.IS,
                                values: recordID
                            });
                            filters.push(customFltr);
                        }
                        // log.audit({ title: 'filters mod', details: searchLoad.filters });
                        var rs = searchLoad.run();
                        results = rs.getRange(0, 1000);
                        var objResults = {
                            results
                        }
                        renderer.addCustomDataSource({
                            format: render.DataSource.OBJECT,
                            alias: "records",
                            data: objResults
                        });
                        log.audit({title: 'results', details: objResults});
                    }

                    let registro = record.load({ type: typeRecord, id: recordID });
                    
                    renderer.addRecord({
                        templateName: 'record',
                        record: registro
                    });
                    
                    renderer.setTemplateById(templateID);
                    var transactionFile = renderer.renderAsPdf();

                    if (transactionFile) {
                        response.writeFile({
                            file: transactionFile,
                            isInline: true
                        });
                    }
                } else {
                    var renderer = render.create();
                    var searchLoad = search.load({ id: savedSearch });
                    var filters = searchLoad.filters;
                    log.audit({ title: 'Filters', details: filters });
                    var customFltr = search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.IS,
                        values: recordID
                    });
                    filters.push(customFltr);
                    log.audit({ title: 'filters mod', details: searchLoad.filters });
                    var rs = searchLoad.run();
                    var results = rs.getRange(0, 1000);
                    log.audit({ title: 'results', details: results });
                    renderer.addSearchResults({
                        templateName: 'results',
                        searchResult: results
                    });
                    renderer.setTemplateById(templateID);

                    var transactionFile = renderer.renderAsPdf();

                    if (transactionFile) {
                        response.writeFile({
                            file: transactionFile,
                            isInline: true
                        });
                    }
                }

            } catch (e) {
                log.error('Error on onRequest', e);
                var formError = serverWidget.createForm({
                    title: ' '
                });
                formError.clientScriptModulePath = './fb_pdf_by_tran_error_cs.js';
                context.response.writePage(formError);
            }

        }

        return {
            onRequest: onRequest
        };

    });
