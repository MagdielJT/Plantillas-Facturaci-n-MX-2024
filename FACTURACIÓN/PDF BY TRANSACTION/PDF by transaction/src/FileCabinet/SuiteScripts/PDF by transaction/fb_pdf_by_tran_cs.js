/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/ui/message', 'N/search'],
/**
 * @param{url} url
 * @param{message} message
 * @param{search} search
 */
function(url, message, search) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }

    function renderButton (templateID, typeRecord, recordID, savedSerachID, requiredSearch,createdfrom) {
        try {
            if (templateID) {
                var urlResolve = url.resolveScript({
                    scriptId: 'customscript_fb_pdf_by_trans_sl',
                    deploymentId: 'customdeploy_fb_pdf_by_trans_sl',
                    params: {
                        templateID: templateID,
                        typeRecord: typeRecord,
                        recordID: recordID,
                        savedSearch: savedSerachID,
                        requiredSearch: requiredSearch,
                        createdfrom: createdfrom
                    }
                });
                window.open(urlResolve, '_blank');
            } else {
                var customMsg = message.create({
                    title: "Error",
                    message: "No se encuentra configurado la plantilla para renderizar",
                    type: message.Type.ERROR,
                    duration: 15000
                });

                customMsg.show();
            }
        } catch (e) {
            console.log({title: 'Error renderButton:', details: e});
        }
    }

    function renderChek(bankAccountId, transactionId) {
        try {
            // console.log({title:'Data function', details:{bankAccountId: bankAccountId, transactionId: transactionId}});
            var configTemplate = getConfigTemplate(bankAccountId);
            console.log(configTemplate);
            if (configTemplate.error) {
                var customMsg = message.create({
                    title: "Error",
                    message: configTemplate.reason,
                    type: message.Type.ERROR,
                    duration: 15000
                });
                customMsg.show();
            } else {
                var transactions = [];
                transactions.push(transactionId)
                var resolveUrl = url.resolveScript({
                    scriptId: 'customscript_efx_ia_pdf_print_sl',
                    deploymentId: 'customdeploy_efx_ia_pdf_print_sl',
                    returnExternalUrl: false,
                    params: {
                        selectedIDS: JSON.stringify(transactions),
                        pdfTemplate: configTemplate.templateId,
                        pdfTemplateName: configTemplate.templateName
                    }
                });
                window.open(resolveUrl, '_blank');
            }
        } catch (e) {
            console.error({title:'Error on render Check', details:e});
        }
    }

    function getConfigTemplate(bankAccountId) {
        try {
            var customrecord_efx_ia_configurationSearchObj = search.create({
                type: "customrecord_efx_ia_configuration",
                filters:
                    [
                        ["custrecord_efx_ia_set_adv_account", search.Operator.ANYOF, bankAccountId],
                        "AND",
                        ["isinactive", search.Operator.IS, "F"]
                    ],
                columns:
                    [
                        {name: "custrecord_efx_ia_set_adv_account"},
                        {name: "custrecord_efx_ia_set_adv_pdf"}
                    ]
            });
            var searchResultCount = customrecord_efx_ia_configurationSearchObj.runPaged().count;
            var data = {
                templateId: '',
                templateName: '',
                accountId: '',
                error: false,
                reason: ''
            };
            if (searchResultCount === 1) {
                customrecord_efx_ia_configurationSearchObj.run().each(function (result) {
                    var templateId = result.getValue({name: "custrecord_efx_ia_set_adv_pdf"});
                    var templateName = result.getText({name: "custrecord_efx_ia_set_adv_pdf"});
                    var accountId = result.getValue({name: "custrecord_efx_ia_set_adv_account"});
                    data.templateId = templateId;
                    data.templateName = templateName;
                    data.accountId = accountId;
                    return true;
                });
            } else {
                switch (searchResultCount) {
                    case 0:
                        data.error = true;
                        data.reason = 'No se encontró una plantilla PDF configurada para esta cuenta';
                        break;
                    default:
                        data.error = true;
                        data.reason = 'Existe más de una plantilla PDF configurada para esta cuenta, o se presento un error con la información';
                        break;
                }
            }
            return data;
        } catch (e) {
            console.error(e)
        }
    }

    return {
        pageInit: pageInit,
        renderButton: renderButton,
        renderChek: renderChek
    };
    
});
