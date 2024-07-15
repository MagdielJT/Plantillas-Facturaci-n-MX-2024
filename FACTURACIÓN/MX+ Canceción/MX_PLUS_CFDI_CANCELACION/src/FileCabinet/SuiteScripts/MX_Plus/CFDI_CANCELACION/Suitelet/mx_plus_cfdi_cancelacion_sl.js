/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/https', 'N/log', 'N/record', 'N/format', 'N/search', 'N/currency', 'N/config', 'N/runtime'],
    /**
 * @param{log} log
 */
    (https, log, record, format, search, modcurrency, config, runtime) => {
        /**
         * 
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var INICIASUILET = ' ==== SE INISIA SUITELET ===='; 
            log.audit({title:'SE INISIA SUITELET 👻',details:INICIASUILET});
            scriptContext.response.write({ output: JSON.stringify(INICIASUILET) })
        }

        return {onRequest}

    });
