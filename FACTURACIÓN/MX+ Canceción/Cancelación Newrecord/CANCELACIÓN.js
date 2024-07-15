/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
// define(['N/log', 'N/url'],
define(['N/log', 'N/url', '../Lib/cfdi_cancelacion_constants.js'],
    /**
 * @param{log} log
 */
    (log, url, cfdi_cancelacion_constants) => {
        const { SERVICE_CP } = cfdi_cancelacion_constants;
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            try {
                const newRecord = scriptContext.newRecord;
                const uuid = newRecord.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });
                const esCancelado = newRecord.getValue({ fieldId: 'custbody_efx_fe_cfdi_cancelled' });
                if (uuid && (esCancelado=='F' || esCancelado == false)) {
                    const objForm = scriptContext.form;
                    log.debug({ title: 'beforeLoad_addButton', details: [uuid, esCancelado] });
                    log.debug({ title: 'SERVICE', details: [SERVICE_CP.SCRIPTID, SERVICE_CP.DEPLOYID] });
                    objForm.clientScriptModulePath = '../Client/mx_plus_cfdi_cancelacion_cl.js';
                    var output = url.resolveScript({
                        scriptId: SERVICE_CP.SCRIPTID,
                        deploymentId: SERVICE_CP.DEPLOYID,
                        returnExternalUrl: false
                    });
                    log.debug({ title: 'output', details: output });
                    objForm.addButton({
                        id: 'custpage_cancelacion_new',
                        label: 'Cancelar CFDI',
                        functionName: 'bottonCancelarCFDI',
                    });
                }
            } catch (error) {
                log.error({
                    title: 'beforeLoad_addButton',
                    details: error.message
                });
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        return {beforeLoad:beforeLoad}
        // return {beforeLoad, beforeSubmit, afterSubmit}

    });
