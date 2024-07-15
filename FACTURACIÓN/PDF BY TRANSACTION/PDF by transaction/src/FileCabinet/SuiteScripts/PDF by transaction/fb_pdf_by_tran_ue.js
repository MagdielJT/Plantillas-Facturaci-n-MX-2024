/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/runtime', 'N/record', 'N/search'],
/**
 * @param{log} log
 * @param{runtime} runtime
 * @param{record} record
 * @param{search} search
 */
function(log, runtime, record, search) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
        try {
            var form = scriptContext.form;
            var objRecord = scriptContext.newRecord;
            var typeTransaction = objRecord.type;
            var scriptObj = runtime.getCurrentScript();
            var templateID = scriptObj.getParameter({name: 'custscript_fb_id_template_pdf'});
            var requiredSearch = scriptObj.getParameter({name: 'custscript_fb_required_search'});
            var savedsearch = scriptObj.getParameter({name: 'custscript_fb_id_saved_search'});
            var createdfrom = scriptObj.getParameter({name: 'custscript_fb_search_to_created_from'});
            log.audit('script parameters', {templateID: templateID, requiredSearch: requiredSearch, savedsearch: savedsearch, createdfrom: createdfrom});
            if (scriptContext.type === scriptContext.UserEventType.VIEW) {
                log.audit({title:'account id', details: runtime.accountId});
                var accountID = runtime.accountId;
                /*if (accountID === 'TSTDRV2220309' || accountID === '5907646_SB1') {
                    if (!templateID) {
                        if (typeTransaction === record.Type.CHECK) {
                            form.addButton({
                                id: 'custpage_btn_pdf_template',
                                label: 'Imprimir Cheque',
                                functionName: 'renderChek(' + objRecord.getValue({fieldId: 'account'}) + ',' + objRecord.id + ')'
                            });
                            form.clientScriptModulePath = './efx_pdf_by_tran_cs.js';
                        }
                        if (typeTransaction === record.Type.VENDOR_PAYMENT) {
                            var paymentmethod = objRecord.getText({fieldId: 'paymentmethod'});
                            if (paymentmethod.toUpperCase() === 'CHECK' || paymentmethod.toUpperCase() === 'CHEQUE') {
                                form.addButton({
                                    id: 'custpage_btn_pdf_template',
                                    label: 'Imprimir Cheque',
                                    functionName: 'renderChek(' + objRecord.getValue({fieldId: 'account'}) + ',' + objRecord.id + ')'
                                });
                                form.clientScriptModulePath = './efx_pdf_by_tran_cs.js';
                            }
                        }
                    } else {
                        log.audit('transaction parameters', {typeTransaction: typeTransaction, templateID: templateID, recordID : objRecord.id, requiredSearch: requiredSearch,
                            savedsearchID: savedsearch});
                        form.addButton({
                            id: 'custpage_btn_pdf_template',
                            label: 'Generar PDF',
                            functionName: 'renderButton(' + templateID + ',"' + typeTransaction + '",' + objRecord.id + ',"'+savedsearch+'",'+requiredSearch+')'
                        });
                        form.clientScriptModulePath = './efx_pdf_by_tran_cs.js';
                    }
                } else {*/
                    log.audit('transaction parameters', {typeTransaction: typeTransaction, templateID: templateID, recordID : objRecord.id, createdfrom: createdfrom, requiredSearch: requiredSearch,
                    savedsearchID: savedsearch});

                    form.addButton({
                        id: 'custpage_btn_pdf_template',
                        label: 'Generate PDF',
                        functionName: 'renderButton(' + templateID + ',"' + typeTransaction + '",' + objRecord.id + ',"'+savedsearch+'","'+requiredSearch+'","'+createdfrom+'")'
                    });
                    form.clientScriptModulePath = './fb_pdf_by_tran_cs.js';
                //}
            }
        } catch (e) {
            log.error('Error on before load', e);
        }
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});
