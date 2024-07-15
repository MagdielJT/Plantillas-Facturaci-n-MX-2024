/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/https', 'N/log','N/url', 'N/record', 'N/format', 'N/search', 'N/currency', 'N/config', 'N/runtime', '../../Utilities/EFX_FE_Lib', 'N/crypto/random', '../Lib/constants.js'],

    (https, log,url, record, format, search, modcurrency, config, runtime, libCFDI, crypto, constants) => {
        const { SERVICE_CP } = constants;
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
                const recCurrent = scriptContext.newRecord;
                const objForm = scriptContext.form;
                // const stStatus = recCurrent.getValue({
                //     fieldId: 'status'
                // });
                objForm.clientScriptModulePath='../Client/mxplus_cp_json_cl.js'
                // const stSuiteletLinkParam = runtime.getCurrentScript().getParameter({
                //     name: 'custscript_suiteletlink_test'
                // });
                // const suiteletURL = '\"' + stSuiteletLinkParam + '\"';
                // if (stStatus === 'Pending Fulfillment') {
                var output = url.resolveScript({
                    scriptId: SERVICE_CP.SCRIPTID,
                    deploymentId: SERVICE_CP.DEPLOYID,
                    returnExternalUrl: false
                });
                log.debug({ title: 'output', details: output })
                if(scriptContext.type===scriptContext.UserEventType.VIEW){
                    var tiene_uuid=recCurrent.getValue({fieldId:'custbody_mx_cfdi_uuid'})
                    var tiene_cert=recCurrent.getValue({fieldId:'custbody_psg_ei_certified_edoc'})
                    var tiene_cert_tkio=recCurrent.getValue({fieldId:'custbody_mx_plus_xml_certificado'});
                    if(tiene_uuid && tiene_cert && tiene_cert_tkio){
                        objForm.addButton({
                            id: 'custpage_pdfcartaportebtn',
                            label: 'Ver Carta Porte',
                            functionName: 'botonPDFCartaPorte',
                        });
                    }else{
                        objForm.addButton({
                            id: 'custpage_suiteletbutton',
                            label: 'Carta Porte',
                            functionName: 'bottonCartaporte',
                        });
                    }
                }
                // }
            } catch (error) {
                log.error({
                    title: 'beforeLoad_addButton',
                    details: error.message
                });
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
        */
        
        return { beforeLoad: beforeLoad }
        // return {beforeLoad, afterSubmit}
        // return {beforeLoad, beforeSubmit, afterSubmit}

    });