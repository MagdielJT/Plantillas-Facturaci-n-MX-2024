/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/render', 'N/search', 'N/runtime', './libsatcodes', './libcustomitems', './summary', 'N/file', 'N/xml', 'N/encode', 'N/https', 'N/http', './pagodata', 'N/config', './XmlToPdf', 'N/format', './EFX_FE_Lib', 'N/url'/*,'../EFX_FE_Config_Parameters'*/],
    /**
     * @param{https} https
     * @param{record} record
     * @param{search} search
     */
    function (record, render, search, runtime, SATCodesDao, customItems, summaryCalc, file, xml, encode, https, http, pagodata, config, XmlToPdf, format, libCFDI, url/*,runtimeObj*/) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function search_sendingMethod(client_edoc_package) {
            var data_to_return = {};
            try {
                const customrecordEiSendingMethodSearchFilters = [
                    [
                        "custrecord_psg_ei_edoc_standard",
                        search.Operator.ANYOF,
                        client_edoc_package,

                    ],
                    "AND",
                    ['isinactive', search.Operator.IS, "F"],
                    "AND",
                    ['custrecord_ei_sending_method_for_certifi', search.Operator.IS, "T"]
                ];

                const customrecordEiSendingMethodSearchColName = search.createColumn({
                    name: "name",
                    sort: search.Sort.ASC,
                });
                const customrecordEiSendingMethodSearchColEDocumentPackage =
                    search.createColumn({ name: "custrecord_psg_ei_edoc_standard" });
                const customrecordEiSendingMethodSearchColSubsidiary =
                    search.createColumn({ name: "custrecord_psg_ei_sm_subsidiary" });
                const customrecordEiSendingMethodSearchColSendingMethodForCertification =
                    search.createColumn({
                        name: "custrecord_ei_sending_method_for_certifi",
                    });
                const idSendingMethodForCertification =
                    search.createColumn({
                        name: "internalid",
                    });

                const customrecordEiSendingMethodSearch = search.create({
                    type: "customrecord_ei_sending_method",
                    filters: customrecordEiSendingMethodSearchFilters,
                    columns: [
                        customrecordEiSendingMethodSearchColName,
                        customrecordEiSendingMethodSearchColEDocumentPackage,
                        customrecordEiSendingMethodSearchColSubsidiary,
                        customrecordEiSendingMethodSearchColSendingMethodForCertification,
                        idSendingMethodForCertification
                    ],
                });

                const customrecordEiSendingMethodSearchPagedData =
                    customrecordEiSendingMethodSearch.runPaged({ pageSize: 1000 });
                for (
                    let i = 0;
                    i < customrecordEiSendingMethodSearchPagedData.pageRanges.length;
                    i++
                ) {
                    const customrecordEiSendingMethodSearchPage =
                        customrecordEiSendingMethodSearchPagedData.fetch({ index: i });
                    customrecordEiSendingMethodSearchPage.data.forEach((result) => {
                        const name = result.getValue(
                            customrecordEiSendingMethodSearchColName
                        );
                        const eDocumentPackage = result.getValue(
                            customrecordEiSendingMethodSearchColEDocumentPackage
                        );
                        const subsidiary = result.getValue(
                            customrecordEiSendingMethodSearchColSubsidiary
                        );
                        const sendingMethodForCertification = result.getValue(
                            customrecordEiSendingMethodSearchColSendingMethodForCertification
                        );
                        const idMethodForCertification = result.getValue(
                            idSendingMethodForCertification
                        );
                        data_to_return = {
                            name,
                            eDocumentPackage,
                            subsidiary,
                            sendingMethodForCertification,
                            idMethodForCertification
                        };
                    });
                }
                return data_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in search_sendingMethod', details: err });
                return data_to_return;
            }
        }
        function onRequest(context) {
            var scriptObj = runtime.getCurrentScript();
            // var ObjScript = runtimeObj.getParameters();
            var folderBase = scriptObj.getParameter({ name: 'custscript_efx_fe_folder_certify' });
            var folderBaseSubsidiaria = scriptObj.getParameter({ name: 'custscript_efx_fe_folder_subsidiary' });
            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'subsidiaries' });
            //var folderBase = ObjScript['custrecord_efx_fe_configura_folder'];
            log.audit({ title: 'folderBase', details: folderBase });
            var idPropietario = scriptObj.getParameter({ name: 'custscript_efx_fe_owner_certify' });
            var cfdiversion = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_version' });
            //crear y devolver info
            log.audit({ title: 'context.request.parameters', details: context.request.parameters });
            var tipo_transaccion = context.request.parameters.trantype || '';
            var id_transaccion = context.request.parameters.tranid || '';
            var tipo_cp = context.request.parameters.tipo || '';
            var idtimbre = context.request.parameters.idtimbre || '';
            var pagoCompensacion = context.request.parameters.pagoCompensacion || '';
            var idCompensacion = context.request.parameters.idCompensacion || '';
            var tipo_transaccion_gbl = '';
            var tipo_transaccion_gbl_tipo = '';
            var tipo_transaccion_cp = '';
            var accountid = '';

            var tranid_Array = new Array();
            var pagoCompensacion_Array = new Array();
            var pagoCompensacionBody = '';
            if (pagoCompensacion == 'T') {
                log.audit({ title: 'context.request', details: context.request });
                log.audit({ title: 'context.request.body', details: context.request.body });
                tipo_transaccion = "customerpayment";
                if (context.request.body) {
                    id_transaccion
                    pagoCompensacionBody = JSON.parse(context.request.body);
                    tranid_Array = pagoCompensacionBody.arrayPagosCompensacion;

                }
            }

            log.audit({ title: 'tranid_Array', details: tranid_Array });

            log.audit({ title: 'tipo_transaccion', details: tipo_transaccion });
            log.audit({ title: 'id_transaccion', details: id_transaccion });
            log.audit({ title: 'tipo_cp', details: tipo_cp });
            log.audit({ title: 'idtimbre', details: idtimbre });

            var conpanyinformationObj = config.load({
                type: config.Type.COMPANY_INFORMATION
            });
            accountid = conpanyinformationObj.getValue('companyid');

            var enabled = false;
            enabled = validaAcceso(accountid);
            log.audit({ title: 'enabled', details: enabled });

            //crear
            log.audit({ title: 'idtimbre', details: idtimbre });
            log.audit({ title: 'tipo_transaccion', details: tipo_transaccion });
            if (tipo_transaccion == 'customsale_efx_fe_factura_global') {
                tipo_transaccion_gbl = tipo_transaccion;
                tipo_transaccion = 'invoice';
            } else if (tipo_transaccion == 'cashsale' && tipo_cp) {
                tipo_transaccion_cp = tipo_transaccion;
                tipo_transaccion = 'itemfulfillment';
            } else if (tipo_transaccion == 'salesorder' && tipo_cp) {
                tipo_transaccion_cp = tipo_transaccion;
                tipo_transaccion = 'itemfulfillment';
            } else if (tipo_transaccion == 'itemfulfillment' && tipo_cp) {
                tipo_transaccion_cp = tipo_transaccion;
                tipo_transaccion = 'itemfulfillment';
            } else if (tipo_transaccion == 'purchaseorder' || tipo_transaccion == 'itemreceipt') {
                tipo_transaccion_cp = tipo_transaccion;
                tipo_transaccion = 'itemfulfillment';
            }

            log.audit({ title: 'tipo_transaccion', details: tipo_transaccion });
            log.audit({ title: 'tipo_transaccion_cp', details: tipo_transaccion_cp });
            log.audit({ title: 'idPropietario', details: idPropietario });
            log.audit({ title: 'id_transaccion', details: id_transaccion });
            log.audit({ title: 'tipo_cp', details: tipo_cp });
            var respuesta = {
                success: false,
                xml_generated: '',
                xml_certified: '',
                pdf_generated: '',
                uuid: '',
                tranid: '',
                trantype: '',
                error_details: '',
                error_texto: '',
                error_objeto: '',
                mensaje: ''
            }

            if (enabled == true) {

                if ((tipo_transaccion && id_transaccion) || tranid_Array.length > 0) {

                    if (tipo_cp) {
                        var recordCp = record.load({
                            type: 'customrecord_efx_fe_cp_carta_porte',
                            id: idtimbre
                        });

                        var recordobj = record.load({
                            type: tipo_transaccion_cp,
                            id: id_transaccion
                        });
                        var id_template = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_ctempxml' });
                        var generar_pdf = recordobj.getValue({ fieldId: 'custbody_edoc_gen_trans_pdf' });
                        var tran_sendingmethod = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_cmetpxml' });
                        var tran_tranid = recordobj.getValue({ fieldId: 'tranid' });
                        var tran_uuid = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_cuuid' });
                        var tran_xml = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_cxml' });
                        var tran_pdf = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_cpdf' });
                    } else {
                        if (tipo_transaccion_gbl) {
                            var recordobj = record.load({
                                type: tipo_transaccion_gbl,
                                id: id_transaccion
                            });
                            tipo_transaccion_gbl_tipo = recordobj.getValue({ fieldId: 'custbody_efx_fe_gbl_type' });
                            var id_template = recordobj.getValue({ fieldId: 'custbody_efx_fe_gbl_plantilla' });
                            var generar_pdf = recordobj.getValue({ fieldId: 'custbody_edoc_gen_trans_pdf' });
                            var tran_sendingmethod = recordobj.getValue({ fieldId: 'custbody_efx_fe_gbl_envio' });
                            var tran_tranid = recordobj.getValue({ fieldId: 'tranid' });
                            var tran_uuid = recordobj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });
                            var tran_xml = recordobj.getValue({ fieldId: 'custbody_edoc_generated_pdf' });
                            var tran_pdf = recordobj.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
                        } else if (tipo_transaccion_cp) {
                            var recordobj = record.load({
                                type: tipo_transaccion_cp,
                                id: id_transaccion
                            });
                            var id_template = recordobj.getValue({ fieldId: 'custbody_psg_ei_template' });
                            if (!id_template) {
                                id_template = recordobj.getValue({ fieldId: 'custbody_efx_fe_plantilla_docel' });
                            }
                            var generar_pdf = recordobj.getValue({ fieldId: 'custbody_edoc_gen_trans_pdf' });
                            var tran_sendingmethod = recordobj.getValue({ fieldId: 'custbody_psg_ei_sending_method' });
                            if (!tran_sendingmethod) {
                                tran_sendingmethod = recordobj.getValue({ fieldId: 'custbody_efx_fe_metodo_docel' });
                            }
                            var tran_tranid = recordobj.getValue({ fieldId: 'tranid' });
                            var tran_uuid = recordobj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });
                            var tran_xml = recordobj.getValue({ fieldId: 'custbody_edoc_generated_pdf' });
                            var tran_pdf = recordobj.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
                        } else if (tranid_Array.length > 0) {
                            var recordobj = record.load({
                                type: tipo_transaccion,
                                id: tranid_Array[0].idPagos
                            });
                            var id_template = recordobj.getValue({ fieldId: 'custbody_psg_ei_template' });
                            var generar_pdf = recordobj.getValue({ fieldId: 'custbody_edoc_gen_trans_pdf' });
                            var tran_sendingmethod = recordobj.getValue({ fieldId: 'custbody_psg_ei_sending_method' });
                            var tran_tranid = recordobj.getValue({ fieldId: 'tranid' });
                            var tran_uuid = recordobj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });
                            var tran_xml = recordobj.getValue({ fieldId: 'custbody_edoc_generated_pdf' });
                            var tran_pdf = recordobj.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
                        } else {
                            var recordobj = record.load({
                                type: tipo_transaccion,
                                id: id_transaccion
                            });
                            var id_template = recordobj.getValue({ fieldId: 'custbody_psg_ei_template' });
                            if (!id_template) {
                                id_template = recordobj.getValue({ fieldId: 'custbody_efx_fe_plantilla_docel' });
                            }
                            var generar_pdf = recordobj.getValue({ fieldId: 'custbody_edoc_gen_trans_pdf' });
                            var tran_sendingmethod = recordobj.getValue({ fieldId: 'custbody_psg_ei_sending_method' });
                            if (!tran_sendingmethod) {
                                tran_sendingmethod = recordobj.getValue({ fieldId: 'custbody_efx_fe_metodo_docel' });
                            }
                            var tran_tranid = recordobj.getValue({ fieldId: 'tranid' });
                            var tran_uuid = recordobj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });
                            var tran_xml = recordobj.getValue({ fieldId: 'custbody_edoc_generated_pdf' });
                            var tran_pdf = recordobj.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
                        }
                    }



                    var subsidiaria = '';
                    if (!tran_uuid) {
                        try {
                            if (folderBaseSubsidiaria || folderBaseSubsidiaria == true || folderBaseSubsidiaria == 'true' || folderBaseSubsidiaria == 'T') {
                                if (SUBSIDIARIES) {

                                    var subsidiaria_id = recordobj.getValue({ fieldId: 'subsidiary' });
                                    var subsidiary_info = search.lookupFields({
                                        type: search.Type.SUBSIDIARY,
                                        id: subsidiaria_id,
                                        columns: ['name']
                                    });

                                    log.audit({ title: 'subsidiary_info.name: ', details: subsidiary_info.name });

                                    subsidiaria = subsidiary_info.name;
                                }
                            }

                            //busqueda de datos del pac
                            // MOD: sending method is empty so first set it and then retrieve the sending method
                            if (!tran_sendingmethod || !id_template) {
                                // get client from transaction
                                var clientId = '';
                                var record_type = '';
                                switch (recordobj.type) {
                                    case "invoice":
                                        record_type = "invoice";
                                        break;
                                    case "customerpayment":
                                        record_type = "payment";
                                        break;
                                    case "creditmemo":
                                        record_type = "credit";
                                        break;
                                }
                                if (tipo_transaccion === 'customerpayment') {
                                    clientId = recordobj.getValue({
                                        fieldId: "customer",
                                    });
                                } else {
                                    clientId = recordobj.getValue({
                                        fieldId: "entity",
                                    });
                                }
                                log.audit({ title: 'clientId', details: clientId });
                                if (clientId) {
                                    var objRecord_client = record.load({
                                        type: record.Type.CUSTOMER,
                                        id: clientId,
                                    });
                                    // datos que obtiene del cliente
                                    var client_edoc_package = objRecord_client.getValue({
                                        fieldId: "custentity_psg_ei_entity_edoc_standard",
                                    });
                                    var sending_method_client = search_sendingMethod(client_edoc_package);
                                    if (sending_method_client) {
                                        log.debug({
                                            title: "sending_method_client",
                                            details: sending_method_client,
                                        });
                                        if (sending_method_client) {
                                            const customrecordPsgEiTemplateSearchFilters = [
                                                ["name", "haskeywords", "4.0"],
                                                "AND",
                                                ["name", "haskeywords", record_type],

                                                "AND",
                                                [
                                                    "custrecord_psg_ei_template_edoc_standard",
                                                    search.Operator.ANYOF,
                                                    sending_method_client.eDocumentPackage,
                                                ],
                                            ];

                                            const customrecordPsgEiTemplateSearchColName = search.createColumn({
                                                name: "name",
                                                sort: search.Sort.ASC,
                                            });
                                            const customrecordPsgEiTemplateSearchColIdDeScript =
                                                search.createColumn({
                                                    name: "scriptid",
                                                });
                                            const customrecordPsgEiTemplateSearchColPaqueteDeDocumentosElectrnicos =
                                                search.createColumn({
                                                    name: "custrecord_psg_ei_template_edoc_standard",
                                                });
                                            const customrecordPsgEiTemplateSearchColTipoDeContenido =
                                                search.createColumn({ name: "custrecord_psg_file_content_type" });
                                            const customrecordPsgEiTemplateSearchColSubsidiaria =
                                                search.createColumn({
                                                    name: "custrecord_psg_ei_template_subsidiary",
                                                });
                                            const customrecordPsgEiTemplateSearchColInternalId = search.createColumn({ name: 'internalid' });


                                            const customrecordPsgEiTemplateSearch = search.create({
                                                type: "customrecord_psg_ei_template",
                                                filters: customrecordPsgEiTemplateSearchFilters,
                                                columns: [
                                                    customrecordPsgEiTemplateSearchColName,
                                                    customrecordPsgEiTemplateSearchColIdDeScript,
                                                    customrecordPsgEiTemplateSearchColPaqueteDeDocumentosElectrnicos,
                                                    customrecordPsgEiTemplateSearchColTipoDeContenido,
                                                    customrecordPsgEiTemplateSearchColSubsidiaria,
                                                    customrecordPsgEiTemplateSearchColInternalId,

                                                ],
                                            });

                                            const customrecordPsgEiTemplateSearchPagedData =
                                                customrecordPsgEiTemplateSearch.runPaged({ pageSize: 1000 });
                                            for (
                                                var i = 0;
                                                i < customrecordPsgEiTemplateSearchPagedData.pageRanges.length;
                                                i++
                                            ) {
                                                const customrecordPsgEiTemplateSearchPage =
                                                    customrecordPsgEiTemplateSearchPagedData.fetch({ index: i });
                                                customrecordPsgEiTemplateSearchPage.data.forEach((result) => {
                                                    const name = result.getValue(
                                                        customrecordPsgEiTemplateSearchColName
                                                    );
                                                    const idDeScript = result.getValue(
                                                        customrecordPsgEiTemplateSearchColIdDeScript
                                                    );
                                                    const paqueteDeDocumentosElectrnicos = result.getValue(
                                                        customrecordPsgEiTemplateSearchColPaqueteDeDocumentosElectrnicos
                                                    );
                                                    const tipoDeContenido = result.getValue(
                                                        customrecordPsgEiTemplateSearchColTipoDeContenido
                                                    );
                                                    const subsidiaria = result.getValue(
                                                        customrecordPsgEiTemplateSearchColSubsidiaria
                                                    );
                                                    const internalId = result.getValue(customrecordPsgEiTemplateSearchColInternalId);

                                                    srch_results = {
                                                        name,
                                                        paqueteDeDocumentosElectrnicos,
                                                        subsidiaria,
                                                        internalId
                                                    };
                                                });
                                            }
                                            // var actual_sendingmethod = curr_record.getValue({
                                            //   fieldId: "custbody_psg_ei_sending_method"
                                            // });

                                            try {
                                                recordobj.setValue({
                                                    fieldId: "custbody_psg_ei_template",
                                                    value: parseInt(srch_results.internalId),
                                                });
                                                recordobj.setValue({
                                                    fieldId: "custbody_psg_ei_sending_method",
                                                    value: parseInt(sending_method_client.idMethodForCertification),
                                                    ignoreFieldChange: true,

                                                });
                                                recordobj.save({
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                });
                                                //   var after_sendingmethod2 = curr_record.getValue({
                                                //     fieldId: "custbody_psg_ei_sending_method"
                                                //   });
                                                //   var after_template = curr_record.getValue({
                                                //     fieldId: "custbody_psg_ei_template"
                                                //   });

                                            } catch (errstr) {
                                                log.debug({ title: 'Error in setting fields', details: errstr });
                                            }

                                            log.audit({ title: "srch_results", details: srch_results });
                                        } else {
                                            log.error({ title: 'sending_method_client', details: "No se encontró sending Method de cliente" });
                                        }
                                    } else {
                                        respuesta.success = false;
                                        respuesta.xml_generated = '';
                                        respuesta.xml_certified = '';
                                        respuesta.pdf_generated = '';
                                        respuesta.tranid = id_transaccion;
                                        respuesta.trantype = tipo_transaccion;
                                        respuesta.error_details = 'Su cliente no cuenta con Paquete de Documentos Electrónicos, favor de editar su cliente.';
                                        respuesta.error_texto = '';
                                        respuesta.error_objeto = '';
                                        context.response.write({
                                            output: JSON.stringify(respuesta)
                                        });
                                    }


                                }
                                tran_sendingmethod = recordobj.getValue({ fieldId: 'custbody_psg_ei_sending_method' });
                                id_template = recordobj.getValue({ fieldId: 'custbody_psg_ei_template' });
                                log.audit({ title: 'tran_sendingmethod changed', details: tran_sendingmethod });
                            }
                            // END MOD para método de envío y de plantilla de documento electrónico
                            log.audit({ title: 'tran_sendingmethod', details: tran_sendingmethod });
                            var send_method_obj = search.lookupFields({
                                type: 'customrecord_ei_sending_method',
                                columns: ['custrecord_psg_ei_edoc_standard'],
                                id: tran_sendingmethod,
                            });
                            log.audit({ title: 'send_method_obj', details: send_method_obj });

                            var send_method_e_package = send_method_obj['custrecord_psg_ei_edoc_standard'][0].value;

                            log.audit({ title: 'send_method_e_package', details: send_method_e_package });
                            var e_package_obj = search.lookupFields({
                                type: 'customrecord_psg_ei_standards',
                                columns: ['name'],
                                id: send_method_e_package,
                            });


                            var e_package_name = e_package_obj['name'];

                            log.audit({ title: 'e_package_name', details: e_package_name });
                            var filtros_Array_pac = new Array();
                            filtros_Array_pac.push(['custrecord_mx_edoc_package_name', search.Operator.IS, e_package_name]);
                            filtros_Array_pac.push('and');
                            filtros_Array_pac.push(['custrecord_mx_pacinfo_enable', search.Operator.IS, 'T']);
                            if (SUBSIDIARIES) {

                                var subsidiaria_id = recordobj.getValue({ fieldId: 'subsidiary' });
                                filtros_Array_pac.push('and');
                                filtros_Array_pac.push(['custrecord_mx_pacinfo_subsidiary', search.Operator.ANYOF, subsidiaria_id]);
                            }

                            var search_pacinfo = search.create({
                                type: 'customrecord_mx_pac_connect_info',
                                filters: filtros_Array_pac,
                                columns: [
                                    search.createColumn({ name: 'custrecord_mx_pacinfo_username' }),
                                    search.createColumn({ name: 'custrecord_mx_pacinfo_url' }),
                                    search.createColumn({ name: 'custrecord_mx_pacinfo_taxid' }),
                                    search.createColumn({ name: 'custrecord_mx_invoice_pdf_tmpl' }),
                                    search.createColumn({ name: 'custrecord_mx_cash_sale_pdf_tmpl' }),
                                    search.createColumn({ name: 'custrecord_mx_credit_memo_pdf_tmpl' }),
                                    search.createColumn({ name: 'custrecord_mx_item_fulfillment_pdf_tmpl' }),
                                    search.createColumn({ name: 'custrecord_mx_customer_payment_pdf_tmpl' }),
                                ]
                            });

                            var ejecutar = search_pacinfo.run();
                            var resultado = ejecutar.getRange(0, 100);
                            log.audit({ title: 'resultado', details: resultado });
                            var tax_id_pac = resultado[0].getValue({ name: 'custrecord_mx_pacinfo_taxid' });
                            log.audit({ title: 'tax_id_pac', details: tax_id_pac });
                            var user_pac = resultado[0].getValue({ name: 'custrecord_mx_pacinfo_username' });
                            log.audit({ title: 'user_pac', details: user_pac });
                            var pass_pac = resultado[0].getValue({ name: 'custrecord_mx_pacinfo_password' });
                            log.audit({ title: 'pass_pac', details: pass_pac });
                            var url_pac = resultado[0].getValue({ name: 'custrecord_mx_pacinfo_url' });
                            log.audit({ title: 'url_pac', details: url_pac });
                            var template_invoice_pac = '';




                            if (tipo_transaccion == 'invoice') {
                                log.audit({ title: 'resultado', details: resultado });
                                template_invoice_pac = resultado[0].getValue({ name: 'custrecord_mx_invoice_pdf_tmpl' });
                                log.audit({ title: 'template_invoice_pac', details: template_invoice_pac });
                            } else if (tipo_transaccion == 'cashsale') {
                                template_invoice_pac = resultado[0].getValue({ name: 'custrecord_mx_cash_sale_pdf_tmpl' });
                            } else if (tipo_transaccion == 'creditmemo') {
                                template_invoice_pac = resultado[0].getValue({ name: 'custrecord_mx_credit_memo_pdf_tmpl' });
                            } else if (tipo_transaccion == 'customerpayment') {
                                template_invoice_pac = resultado[0].getValue({ name: 'custrecord_mx_customer_payment_pdf_tmpl' });
                            } else if (tipo_transaccion == 'itemfulfillment') {
                                template_invoice_pac = resultado[0].getValue({ name: 'custrecord_mx_item_fulfillment_pdf_tmpl' });
                            }


                            //fin busqueda datos del pac
                            log.audit({ title: 'generar_pdf', details: generar_pdf });

                            var id_cliente_tran = '';

                            if (tipo_transaccion != 'itemfulfillment') {
                                if (tipo_transaccion == 'customerpayment') {
                                    id_cliente_tran = recordobj.getValue({ fieldId: 'customer' });
                                } else {
                                    id_cliente_tran = recordobj.getValue({ fieldId: 'entity' });
                                }

                                var entityObj = '';
                                if (tipo_transaccion == 'vendbill') {
                                    entityObj = record.load({
                                        type: 'vendor',
                                        id: id_cliente_tran
                                    });
                                } else {
                                    entityObj = record.load({
                                        type: 'customer',
                                        id: id_cliente_tran
                                    });
                                }
                                var cfdiversionCustomer = entityObj.getValue({ fieldId: 'custentity_efx_fe_version' });
                            } else {
                                var cfdiversionCustomer = 2;
                            }



                            log.audit({ title: 'recordobj', details: recordobj });

                            // var recordObjrecord = recordobj.getRecord();
                            var recordObjrecord = recordobj;
                            log.audit({ title: 'recordObjrecord', details: recordObjrecord });
                            if (pagoCompensacion == 'T') {
                                id_template = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_pc_plantilla' });
                                log.audit({ title: 'id_template', details: JSON.stringify(id_template) });
                            }

                            var templateobj = record.load({
                                type: 'customrecord_psg_ei_template',
                                id: id_template,
                            });

                            var template = templateobj.getValue({ fieldId: 'custrecord_psg_ei_template_content' });
                        } catch (obtenrecord) {
                            log.audit({ title: 'obtenrecord', details: obtenrecord });
                        }
                        try {


                            /*delete recordObjrecord["sublists"].recmachcustrecord_mx_rcs_orig_trans;
                            delete recordObjrecord["sublists"].recmachcustrecord_mcp_if_r_parent;
                            delete recordObjrecord["sublists"].paymentevent;
                            delete recordObjrecord["sublists"].recmachcustrecord_efx_fe_cp_autotransporte;
                            delete recordObjrecord["sublists"].recmachcustrecord_efx_fe_cp_ubicaciones;
                            delete recordObjrecord["sublists"].recmachcustrecord_efx_fe_cp_figuratransporter;
                            delete recordObjrecord["sublists"].recmachcustrecord_mcp_if_o_parent;
                            delete recordObjrecord["sublists"].recmachcustrecord_mcp_if_frt_parent;*/

                            if (tranid_Array.length > 0) {
                                var result = {}
                                for (var ta = 0; ta < tranid_Array.length; ta++) {
                                    var recordobj_PC = record.load({
                                        type: tipo_transaccion,
                                        id: tranid_Array[ta].idPagos
                                    });
                                    var result_pc = obtenercustomobject(recordobj_PC, {}, tipo_transaccion, tipo_transaccion_gbl, tipo_cp, tranid_Array[ta].idPagos, pagoCompensacionBody, pagoCompensacion, tipo_transaccion_gbl_tipo);
                                    pagoCompensacion_Array.push(result_pc);
                                    /*var fileresult_obj = file.create({
                                        name: 'Recordobjbody.json',
                                        fileType: file.Type.PLAINTEXT,
                                        contents: JSON.stringify(pagoCompensacionBody),
                                        folder: 8862
                                    });


                                    fileresult_obj.save();*/
                                }
                                /*var objPagocompensacion = {
                                    "PagoCompensacionArray":pagoCompensacion_Array
                                }*/
                                //log.audit({title: 'objPagocompensacion', details: objPagocompensacion});
                                result.PagoCompensacionArray = pagoCompensacion_Array;
                                log.audit({ title: 'PagoCompensacionArray', details: result });
                                /*var fileresult_obj = file.create({
                                    name: 'Recordobj.json',
                                    fileType: file.Type.PLAINTEXT,
                                    contents: JSON.stringify(result),
                                    folder: 8862
                                });*/



                                result = pagoCompensacionBody;



                                //fileresult_obj.save();
                                var customJson = {
                                    customDataSources: [
                                        {
                                            format: render.DataSource.OBJECT,
                                            alias: 'custom',
                                            data: result,
                                        },
                                    ],
                                };

                            } else {
                                var result = obtenercustomobject(recordObjrecord, {}, tipo_transaccion, tipo_transaccion_gbl, tipo_cp, id_transaccion, tipo_transaccion_gbl_tipo);
                                log.audit({ title: 'result', details: result });
                                var customJson = {
                                    customDataSources: [
                                        {
                                            format: render.DataSource.OBJECT,
                                            alias: 'custom',
                                            data: result,
                                        },
                                    ],
                                };
                            }


                        } catch (error_result) {
                            log.audit({ title: 'error_result', details: error_result });
                        }
                        var banderaXML = true;
                        try {
                            var plantilla = render.create();

                            if (JSON.stringify(customJson) !== "{}") {
                                var alias = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].alias : "";
                                var format = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].format : "";
                                var data = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].data : "";
                                log.audit({ title: 'alias', details: JSON.stringify(alias) });
                                log.audit({ title: 'format', details: JSON.stringify(format) });
                                log.audit({ title: 'data', details: JSON.stringify(data) });



                                plantilla.addCustomDataSource({
                                    alias: alias,
                                    format: format,
                                    data: data
                                });
                            }

                            var resultDirecciones;

                            if (tipo_transaccion != 'customerpayment' && tipo_transaccion != 'itemfulfillment' && tipo_transaccion != 'vendbill') {
                                resultDirecciones = obtenerObjetoDirecciones(recordObjrecord, entityObj);
                                log.audit({ title: 'resultDirecciones', details: resultDirecciones });
                                var obj_direnvst = JSON.stringify(resultDirecciones.shipaddress);
                                var obj_direnv = JSON.parse(obj_direnvst);

                                if (obj_direnv["fields"]) {
                                    plantilla.addCustomDataSource({
                                        alias: 'shipaddress',
                                        format: render.DataSource.OBJECT,
                                        data: obj_direnv["fields"]
                                    });
                                }
                                var obj_dirbillst = JSON.stringify(resultDirecciones.billaddress);
                                var obj_dirbill = JSON.parse(obj_dirbillst);
                                if (obj_dirbill["fields"]) {
                                    plantilla.addCustomDataSource({
                                        alias: 'billaddress',
                                        format: render.DataSource.OBJECT,
                                        data: obj_dirbill["fields"]
                                    });
                                }
                            }

                            //var recordObjrecordtext = JSON.stringify(recordObjrecord);
                            //var recordObjrecordFinal = JSON.parse(recordObjrecordtext.replace(/"#"/gi,'"linenum"'));

                            /*   var fileresult_obj = file.create({
                                   name: 'Recordobj.json',
                                   fileType: file.Type.PLAINTEXT,
                                   contents: JSON.stringify(data),
                                   folder: 405703
                               });


                               fileresult_obj.save();*/



                            /*plantilla.addCustomDataSource({
                                alias: "transactiondos",
                                format: render.DataSource.OBJECT,
                                data: recordObjrecordFinal
                            });*/


                            plantilla.templateContent = template;
                            if (pagoCompensacion != 'T') {
                                plantilla.addRecord({
                                    templateName: 'transaction',
                                    record: recordObjrecord,
                                });
                            }
                            //plantilla.addRecord('transaction', recordObjrecord);
                            if (tipo_transaccion != 'itemfulfillment' && pagoCompensacion != 'T') {
                                //plantilla.addRecord(entityObj.type, entityObj);
                                plantilla.addRecord({
                                    templateName: entityObj.type,
                                    record: entityObj,
                                });
                                log.audit({ title: 'entityObj', details: JSON.stringify(entityObj) });
                            }
                            log.audit({ title: 'recordObjrecord', details: JSON.stringify(recordObjrecord) });



                            content = plantilla.renderAsString();

                            var validacion = validaXml(content, templateobj);

                            //var resultSctring = JSON.stringify(result).toString();
                            var foldersubsidiaria = '';
                            if (folderBaseSubsidiaria || folderBaseSubsidiaria == true || folderBaseSubsidiaria == 'true' || folderBaseSubsidiaria == 'T') {
                                if (subsidiaria) {
                                    foldersubsidiaria = createFolderSubsidiaria(folderBase, subsidiaria);
                                }
                            }

                            log.audit({ title: 'foldersubsidiaria', details: JSON.stringify(foldersubsidiaria) });
                            if (foldersubsidiaria) {

                                var idFolder = searchFolderByDay(foldersubsidiaria);
                            } else {
                                var idFolder = searchFolderByDay(folderBase);
                            }




                            if (tipo_cp) {

                                var fileXML = file.create({
                                    name: 'Factura' + '-' + id_transaccion + '_' + idtimbre + '.xml',
                                    fileType: file.Type.PLAINTEXT,
                                    contents: content,
                                    folder: idFolder
                                });
                            } else {
                                if (idCompensacion) {
                                    var fileXML = file.create({
                                        name: 'Factura' + '-' + idCompensacion + '.xml',
                                        fileType: file.Type.PLAINTEXT,
                                        contents: content,
                                        folder: idFolder
                                    });
                                } else {
                                    var fileXML = file.create({
                                        name: 'Factura' + '-' + id_transaccion + '.xml',
                                        fileType: file.Type.PLAINTEXT,
                                        contents: content,
                                        folder: idFolder
                                    });
                                }
                            }


                            fileXML.isOnline = true;

                            var fileXmlId = fileXML.save();

                            log.audit({ title: 'xml', details: content });
                            var errores_xml = '';
                            if (validacion.errores.length > 0) {
                                errores_xml = '\n Errores XML: ' + validacion.errores;
                            }

                            if (fileXmlId) {
                                var mensaje_generacion = 'XML generado con el id: ' + fileXmlId + errores_xml;
                                var log_record = record.create({
                                    type: 'customrecord_psg_ei_audit_trail',
                                    isDynamic: true
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_transaction',
                                    value: id_transaccion
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_entity',
                                    value: id_cliente_tran
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_event',
                                    value: 19
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_owner',
                                    value: idPropietario
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_details',
                                    value: mensaje_generacion
                                });

                                var log_id = log_record.save({
                                    enableSourcing: true,
                                    ignoreMandatoryFields: true
                                });
                                // recordobj.setValue({fieldId: 'custbody_psg_ei_generated_edoc',
                                //     value:'<a href="' + urlVal + '">preview ' + recordobj.type + '_' + fecha_documento + '.xml</a>&nbsp;&nbsp;<a href="' + downloadUrlVal + '">download</a>'});
                            }

                            if (content) {
                                //recordobj.setValue({fieldId: 'custbody_psg_ei_content', value: content});
                                try {
                                    if (tipo_transaccion_gbl) {
                                        record.submitFields({
                                            type: tipo_transaccion_gbl,
                                            id: id_transaccion,
                                            values: {
                                                custbody_psg_ei_content: content
                                            },
                                            options: {
                                                enableSourcing: false,
                                                ignoreMandatoryFields: true
                                            }
                                        });
                                    } else if (tipo_transaccion_cp) {
                                        // record.submitFields({
                                        //     type: tipo_transaccion_cp,
                                        //     id: id_transaccion,
                                        //     values: {
                                        //         custbody_psg_ei_content: content
                                        //     },
                                        //     options: {
                                        //         enableSourcing: false,
                                        //         ignoreMandatoryFields: true
                                        //     }
                                        // });
                                    } else {
                                        if (idCompensacion) {
                                            record.submitFields({
                                                type: 'customrecord_efx_pagos_compensacion',
                                                id: idCompensacion,
                                                values: {
                                                    custrecord_efx_compensacion_xml: fileXmlId
                                                },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                        } else {
                                            record.submitFields({
                                                type: tipo_transaccion,
                                                id: id_transaccion,
                                                values: {
                                                    custbody_psg_ei_content: content
                                                },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                        }
                                    }

                                } catch (errorsubmitcontent) {
                                    log.audit({ title: 'errorsubmitcontent', details: errorsubmitcontent });
                                    if (tipo_transaccion_gbl) {
                                        record.submitFields({
                                            type: tipo_transaccion_gbl,
                                            id: id_transaccion,
                                            values: {
                                                custbody_psg_ei_content: content
                                            },
                                            options: {
                                                enableSourcing: false,
                                                ignoreMandatoryFields: true
                                            }
                                        });
                                    } else if (tipo_transaccion_cp) {
                                        record.submitFields({
                                            type: tipo_transaccion_cp,
                                            id: id_transaccion,
                                            values: {
                                                custbody_psg_ei_content: content
                                            },
                                            options: {
                                                enableSourcing: false,
                                                ignoreMandatoryFields: true
                                            }
                                        });
                                    } else {
                                        if (idCompensacion) {
                                            record.submitFields({
                                                type: 'customrecord_efx_pagos_compensacion',
                                                id: idCompensacion,
                                                values: {
                                                    custrecord_efx_compensacion_xml: fileXmlId
                                                },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                        } else {
                                            record.submitFields({
                                                type: tipo_transaccion,
                                                id: id_transaccion,
                                                values: {
                                                    custbody_psg_ei_content: content
                                                },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                        }
                                    }

                                }
                            }
                            if (validacion.validado) {
                                var PAC_Service = scriptObj.getParameter({ name: 'custscript_fb_is_smarterweb' });
                                log.debug({ title: 'PAC_Service on request', details: PAC_Service });
                                var xmlResultData = timbraDocumento(content, id_transaccion, user_pac, url_pac, idCompensacion, PAC_Service, pass_pac);
                                log.audit({ title: 'xmlResultData', details: xmlResultData });
                                log.audit({ title: 'mensaje para el client', details: xmlResultData.mensaje });
                                if (xmlResultData.success == true) {
                                    var xmlDocument_receipt = xmlResultData.xmlDocument
                                } else {
                                    createErrorMsg(xmlResultData.error, id_transaccion, id_cliente_tran, idPropietario);
                                    banderaXML = false;
                                }
                                log.audit({ title: 'xmlDocument_receipt', details: xmlDocument_receipt });
                                if (PAC_Service == true) { // Es SmarterWeb
                                    var anyType = xmlDocument_receipt;
                                    log.audit({ title: 'anyType smarter', details: anyType });
                                } else { // Es profact
                                    //ruta de la información del cfdi timbrado dentro de la respuesta del pac
                                    var xpath = 'soap:Envelope//soap:Body//nlapi:TimbraCFDIResponse//nlapi:TimbraCFDIResult//nlapi:anyType';
                                    var anyType = xml.XPath.select({
                                        node: xmlDocument_receipt,
                                        xpath: xpath
                                    }); //se obtiene un arreglo con la informacion devuelta del pac
                                    log.audit({ title: 'anyType', details: anyType });
                                }

                                if (tipo_transaccion_gbl) {
                                    var objRespuesta = obtenCFDIDatos(anyType, id_transaccion, tipo_transaccion_gbl, cfdiversion, cfdiversionCustomer, PAC_Service);
                                } else {
                                    var objRespuesta = obtenCFDIDatos(anyType, id_transaccion, tipo_transaccion, cfdiversion, cfdiversionCustomer, PAC_Service);
                                }


                                var xmlTimbrado = '';
                                var fileXmlIdTimbrado = '';

                                log.audit({ title: 'objRespuesta.certData.existError', details: objRespuesta.certData.existError });
                                if (!objRespuesta.certData.existError) {
                                    log.audit({ title: 't1', details: 't1' });
                                    if (PAC_Service == true) { // Es smarterWeb
                                        var cfdiResult = anyType.cfdi;
                                        log.audit({ title: 'cfdiResult_2', details: cfdiResult });
                                        xmlTimbrado = encode.convert({
                                            string: cfdiResult,
                                            inputEncoding: encode.Encoding.BASE_64,
                                            outputEncoding: encode.Encoding.UTF_8
                                        });
                                        log.audit({ title: 'xmlTimbrado_transform', details: xmlTimbrado });
                                    } else { // Es profact
                                        xmlTimbrado = anyType[3].textContent;
                                    }

                                    var xmlObj = xml.Parser.fromString({
                                        text: xmlTimbrado
                                    });

                                    var objPDFjson = XmlToPdf.createPDF(xmlObj.documentElement, true);
                                    try {
                                        var objPDFtext = JSON.stringify(objPDFjson);
                                        //var objPDF = JSON.parse(objPDFtext.replace(/#text/gi,'texto'));
                                        var objPDFfirst = objPDFtext.replace(/#text/gi, 'texto');
                                        var objPDF = JSON.parse(objPDFfirst.replace(/&/gi, '&amp;'));
                                    } catch (errorObjpdf) {
                                        log.audit({ title: 'errorObjpdf', details: errorObjpdf })
                                    }
                                    objRespuesta.dataXML = objPDF;
                                    log.audit({ title: 'objPDF', details: objPDF });

                                    // datos necesarios para la consulta de estatus de facturas
                                    // mandar a llamar una funcion que parse los datos necesarios del objeto de datos de timbrado
                                    /* var monto_total_tran = record.getValue({fieldId:'total'});
                                    log.audit({title: 'monto total de la transaccion', details: monto_total_tran}); */
                                    var obj_data = {}
                                    var sello_cfd_completo = objRespuesta.dataXML.atributos.Sello;
                                    var caracteres = 8;
                                    var sello = sello_cfd_completo.substring(sello_cfd_completo.length - caracteres);
                                    var total_tran = objRespuesta.dataXML.atributos.Total;
                                    log.audit({ title: 'objeto de datos del XML: ', details: { sello: sello, total: total_tran } });
                                    log.audit({ title: 'tipo_transaccion ~ 807', details: tipo_transaccion });
                                    log.audit({ title: 'id_transaccion ~ 808', details: id_transaccion });
                                    obj_data = {
                                        sello: sello,
                                        total_xml: total_tran
                                    }
                                    // MOD: fallaba en factura global por querer cargar una factura con ese ID de transaccion pero el tipo de transacción no corresponde
                                    if (!tipo_transaccion_gbl) {

                                        record.submitFields({
                                            type: tipo_transaccion,
                                            id: id_transaccion,
                                            values: {
                                                custbody_fb_tp_xml_data: JSON.stringify(obj_data)
                                            },
                                        });
                                    } else {
                                        record.submitFields({
                                            type: tipo_transaccion_gbl,
                                            id: id_transaccion,
                                            values: {
                                                custbody_fb_tp_xml_data: JSON.stringify(obj_data)
                                            },
                                        });
                                    }
                                    var nombreXml = '';
                                    if (tipo_cp) {
                                        var fileXMLTimbrado = file.create({
                                            name: 'Traslado_timbrada' + '_' + tran_tranid + '_' + idtimbre + '.xml',
                                            fileType: file.Type.PLAINTEXT,
                                            contents: xmlTimbrado,
                                            folder: idFolder
                                        });
                                    } else {
                                        if (tipo_transaccion_cp) {
                                            var fileXMLTimbrado = file.create({
                                                name: 'Traslado_timbrada' + '_' + tran_tranid + '.xml',
                                                fileType: file.Type.PLAINTEXT,
                                                contents: xmlTimbrado,
                                                folder: idFolder
                                            });
                                        } else {
                                            if (tipo_transaccion == 'invoice') {
                                                nombreXml = 'Factura' + '_' + tran_tranid + '.xml';
                                            } else if (tipo_transaccion == 'cashsale') {
                                                nombreXml = 'VentaEfectivo' + '_' + tran_tranid + '.xml';
                                            } else if (tipo_transaccion == 'creditmemo') {
                                                nombreXml = 'NotaCredito' + '_' + tran_tranid + '.xml';
                                            } else if (tipo_transaccion == 'customerpayment') {
                                                if (idCompensacion) {
                                                    nombreXml = 'Pago' + '_' + idCompensacion + '.xml';
                                                } else {
                                                    nombreXml = 'Pago' + '_' + tran_tranid + '.xml';
                                                }
                                            } else if (tipo_transaccion == 'itemfulfillment') {
                                                nombreXml = 'EjecucionPedido' + '_' + tran_tranid + '.xml';
                                            } else if (tipo_transaccion == 'customsale_efx_fe_factura_global') {
                                                nombreXml = 'Global' + '_' + tran_tranid + '.xml';
                                            }
                                            var fileXMLTimbrado = file.create({
                                                name: nombreXml,
                                                fileType: file.Type.PLAINTEXT,
                                                contents: xmlTimbrado,
                                                folder: idFolder
                                            });
                                        }
                                    }



                                    fileXMLTimbrado.isOnline = true;
                                    fileXmlIdTimbrado = fileXMLTimbrado.save();
                                }
                                log.audit({ title: 't2', details: 't2' });

                                // var fileJSON = file.create({
                                //     name: 'Factura' + '-' + id_transaccion + '.json',
                                //     fileType: file.Type.PLAINTEXT,
                                //     contents: JSON.stringify(anyType),
                                //     folder: idFolder
                                // });
                                //
                                // var file_json = fileJSON.save();
                                log.audit({ title: 't3', details: 't3' });

                                log.audit({ title: 'objRespuesta', details: objRespuesta });

                                var pdf_tran_id = '';
                                log.audit({ title: 'error', details: 'test0' });
                                //var pdf_tran = generarPDF(parseInt(id_transaccion));
                                if (!objRespuesta.certData.existError) {
                                    try {
                                        log.audit({ title: 'error', details: 'test1' });

                                        if (tipo_transaccion_gbl) {
                                            pdf_tran_id = generarPDFTimbrado(recordObjrecord, entityObj, objRespuesta, template_invoice_pac, tax_id_pac, tran_tranid, tipo_transaccion_gbl, result, idFolder, '', '', resultDirecciones);
                                        } else if (idCompensacion) {
                                            pdf_tran_id = generarPDFTimbrado(recordObjrecord, entityObj, objRespuesta, template_invoice_pac, tax_id_pac, tran_tranid, tipo_transaccion, result, idFolder, tipo_cp, idtimbre, resultDirecciones, pagoCompensacion, idCompensacion, pagoCompensacionBody);
                                        } else {
                                            pdf_tran_id = generarPDFTimbrado(recordObjrecord, entityObj, objRespuesta, template_invoice_pac, tax_id_pac, tran_tranid, tipo_transaccion, result, idFolder, tipo_cp, idtimbre, resultDirecciones);
                                        }

                                        log.audit({ title: 'error', details: 'test2' });
                                    } catch (errorpdf) {
                                        log.audit({ title: 'errorpdf', details: errorpdf });
                                    }
                                }
                                log.audit({ title: 'pdf_tran_id', details: pdf_tran_id });


                                log.audit({ title: 'objRespuesta', details: objRespuesta.certData.existError });
                                if (!objRespuesta.certData.existError) {
                                    log.audit({ title: 'fileXmlIdTimbrado', details: fileXmlIdTimbrado });
                                    if (fileXmlIdTimbrado) {

                                        log.audit({ title: 'fileXmlIdTimbrado', details: fileXmlIdTimbrado });

                                        if (tipo_cp) {
                                            try {
                                                log.audit({ title: 'record', details: 'guarda con record' });
                                                recordCp.setValue({ fieldId: 'custrecord_efx_fe_cp_cxml', value: fileXmlIdTimbrado });
                                                recordCp.setValue({ fieldId: 'custrecord_efx_fe_cp_cuuid', value: objRespuesta.certData.custbody_mx_cfdi_uuid });
                                                recordCp.setValue({ fieldId: 'custrecord_efx_fe_cp_cqr', value: objRespuesta.certData.custbody_mx_cfdi_qr_code });
                                                recordCp.setValue({ fieldId: 'custrecord_efx_fe_cp_cpdf', value: pdf_tran_id });
                                                recordCp.save({ enableSourcing: true, ignoreMandatoryFields: true });
                                                // record.submitFields({
                                                //     type:'customrecord_efx_fe_cp_carta_porte',
                                                //     id:idtimbre,
                                                //     values: {
                                                //         custrecord_efx_fe_cp_cxml: fileXmlIdTimbrado,
                                                //         custrecord_efx_fe_cp_cuuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                //         custrecord_efx_fe_cp_cqr: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                //         custbody_edoc_generated_pdf:pdf_tran_id
                                                //     },
                                                //     options: {
                                                //         enableSourcing: true,
                                                //         ignoreMandatoryFields: true
                                                //     }
                                                // });

                                            } catch (error_guardadoXML) {
                                                log.audit({ title: 'error_guardadoXML', details: error_guardadoXML });
                                                record.submitFields({
                                                    type: 'customrecord_efx_fe_cp_carta_porte',
                                                    id: idtimbre,
                                                    values: {
                                                        custrecord_efx_fe_cp_cxml: fileXmlIdTimbrado,
                                                        custrecord_efx_fe_cp_cuuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                        custrecord_efx_fe_cp_cqr: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                        custrecord_efx_fe_cp_cpdf: pdf_tran_id
                                                    },
                                                    options: {
                                                        enableSourcing: true,
                                                        ignoreMandatoryFields: true
                                                    }
                                                });
                                            }
                                        } else {
                                            if (tipo_transaccion_gbl) {
                                                try {
                                                    record.submitFields({
                                                        type: tipo_transaccion_gbl,
                                                        id: id_transaccion,
                                                        values: {
                                                            custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                            custbody_psg_ei_status: 3,
                                                            custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                            custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                            custbody_efx_cfdi_sello: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                            custbody_efx_cfdi_sat_sello: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                            custbody_efx_cfdi_sat_serie: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                            custbody_efx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                            custbody_efx_cfdi_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                            custbody_efx_fe_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                            custbody_edoc_generated_pdf: pdf_tran_id
                                                        },
                                                        options: {
                                                            enableSourcing: false,
                                                            ignoreMandatoryFields: true
                                                        }
                                                    });

                                                } catch (error_guardadoXML) {
                                                    log.audit({ title: 'error_guardadoXML', details: error_guardadoXML });
                                                    record.submitFields({
                                                        type: tipo_transaccion_gbl,
                                                        id: id_transaccion,
                                                        values: {
                                                            custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                            custbody_psg_ei_status: 3,
                                                            custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                            custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                            custbody_efx_cfdi_sello: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                            custbody_efx_cfdi_sat_sello: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                            custbody_efx_cfdi_sat_serie: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                            custbody_efx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                            custbody_efx_cfdi_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                            custbody_efx_fe_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                            custbody_edoc_generated_pdf: pdf_tran_id
                                                        },
                                                        options: {
                                                            enableSourcing: false,
                                                            ignoreMandatoryFields: true
                                                        }
                                                    });
                                                }
                                            } else if (tipo_transaccion_cp) {
                                                try {
                                                    record.submitFields({
                                                        type: tipo_transaccion_cp,
                                                        id: id_transaccion,
                                                        values: {
                                                            custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                            custbody_psg_ei_status: 3,
                                                            custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                            custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                            custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                            custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                            custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                            custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                            custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                            custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                            custbody_edoc_generated_pdf: pdf_tran_id
                                                        },
                                                        options: {
                                                            enableSourcing: false,
                                                            ignoreMandatoryFields: true
                                                        }
                                                    });

                                                } catch (error_guardadoXML) {
                                                    log.audit({ title: 'error_guardadoXML', details: error_guardadoXML });
                                                    record.submitFields({
                                                        type: tipo_transaccion_cp,
                                                        id: id_transaccion,
                                                        values: {
                                                            custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                            custbody_psg_ei_status: 3,
                                                            custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                            custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                            custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                            custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                            custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                            custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                            custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                            custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                            custbody_edoc_generated_pdf: pdf_tran_id
                                                        },
                                                        options: {
                                                            enableSourcing: false,
                                                            ignoreMandatoryFields: true
                                                        }
                                                    });
                                                }
                                            } else {
                                                try {
                                                    if (idCompensacion) {
                                                        record.submitFields({
                                                            type: 'customrecord_efx_pagos_compensacion',
                                                            id: idCompensacion,
                                                            values: {
                                                                custrecord_efx_compensacion_cert: fileXmlIdTimbrado,
                                                                custrecord_efx_compensacion_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                                custrecord_efx_compensacion_precesado: true,
                                                                custrecord_efx_compensacion_pdf: pdf_tran_id,
                                                                custrecord_efx_compensacion_log: 'XML Timbrado con el UUID: ' + objRespuesta.certData.custbody_mx_cfdi_uuid
                                                            },
                                                            options: {
                                                                enableSourcing: false,
                                                                ignoreMandatoryFields: true
                                                            }
                                                        });
                                                    } else {
                                                        record.submitFields({
                                                            type: tipo_transaccion,
                                                            id: id_transaccion,
                                                            values: {
                                                                custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                                custbody_psg_ei_status: 3,
                                                                custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                                custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                                custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                                custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                                custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                                custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                                custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                                custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                                custbody_edoc_generated_pdf: pdf_tran_id
                                                            },
                                                            options: {
                                                                enableSourcing: false,
                                                                ignoreMandatoryFields: true
                                                            }
                                                        });
                                                    }
                                                } catch (error_guardadoXML) {
                                                    log.audit({ title: 'error_guardadoXML', details: error_guardadoXML });
                                                    if (idCompensacion) {
                                                        record.submitFields({
                                                            type: 'customrecord_efx_pagos_compensacion',
                                                            id: idCompensacion,
                                                            values: {
                                                                custrecord_efx_compensacion_cert: fileXmlIdTimbrado,
                                                                custrecord_efx_compensacion_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                                custrecord_efx_compensacion_precesado: true,
                                                                custrecord_efx_compensacion_pdf: pdf_tran_id,
                                                                custrecord_efx_compensacion_log: 'XML Timbrado con el UUID: ' + objRespuesta.certData.custbody_mx_cfdi_uuid
                                                            },
                                                            options: {
                                                                enableSourcing: false,
                                                                ignoreMandatoryFields: true
                                                            }
                                                        });
                                                    } else {
                                                        record.submitFields({
                                                            type: tipo_transaccion,
                                                            id: id_transaccion,
                                                            values: {
                                                                custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                                custbody_psg_ei_status: 3,
                                                                custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                                custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                                custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                                custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                                custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                                custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                                custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                                custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                                custbody_edoc_generated_pdf: pdf_tran_id
                                                            },
                                                            options: {
                                                                enableSourcing: false,
                                                                ignoreMandatoryFields: true
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                        }

                                        if (!idCompensacion) {
                                            log.audit({ title: 'fileXmlIdTimbrado', details: objRespuesta.certData.custbody_mx_cfdi_uuid });

                                            var mensaje_generacion = 'XML Timbrado con el UUID: ' + objRespuesta.certData.custbody_mx_cfdi_uuid;
                                            var log_record = record.create({
                                                type: 'customrecord_psg_ei_audit_trail',
                                                isDynamic: true
                                            });

                                            log_record.setValue({
                                                fieldId: 'custrecord_psg_ei_audit_transaction',
                                                value: id_transaccion
                                            });

                                            log_record.setValue({
                                                fieldId: 'custrecord_psg_ei_audit_entity',
                                                value: id_cliente_tran
                                            });

                                            log_record.setValue({
                                                fieldId: 'custrecord_psg_ei_audit_event',
                                                value: 3
                                            });

                                            log_record.setValue({
                                                fieldId: 'custrecord_psg_ei_audit_owner',
                                                value: idPropietario
                                            });

                                            log_record.setValue({
                                                fieldId: 'custrecord_psg_ei_audit_details',
                                                value: mensaje_generacion
                                            });

                                            var log_id = log_record.save({
                                                enableSourcing: true,
                                                ignoreMandatoryFields: true
                                            });
                                        }
                                    }
                                } else {
                                    if (!idCompensacion) {
                                        var mensaje_generacion = objRespuesta.certData.errorTitle + ': ' + objRespuesta.certData.errorDetails;
                                        var log_record = record.create({
                                            type: 'customrecord_psg_ei_audit_trail',
                                            isDynamic: true
                                        });

                                        log_record.setValue({
                                            fieldId: 'custrecord_psg_ei_audit_transaction',
                                            value: id_transaccion
                                        });

                                        log_record.setValue({
                                            fieldId: 'custrecord_psg_ei_audit_entity',
                                            value: id_cliente_tran
                                        });

                                        log_record.setValue({
                                            fieldId: 'custrecord_psg_ei_audit_event',
                                            value: 22
                                        });

                                        log_record.setValue({
                                            fieldId: 'custrecord_psg_ei_audit_owner',
                                            value: idPropietario
                                        });

                                        log_record.setValue({
                                            fieldId: 'custrecord_psg_ei_audit_details',
                                            value: mensaje_generacion
                                        });

                                        var log_id = log_record.save({
                                            enableSourcing: true,
                                            ignoreMandatoryFields: true
                                        });
                                    } else {
                                        var mensaje_generacion = objRespuesta.certData.errorTitle + ': ' + objRespuesta.certData.errorDetails;
                                        record.submitFields({
                                            type: 'customrecord_efx_pagos_compensacion',
                                            id: idCompensacion,
                                            values: {
                                                custrecord_efx_compensacion_log: mensaje_generacion
                                            },
                                            options: {
                                                enableSourcing: false,
                                                ignoreMandatoryFields: true
                                            }
                                        });
                                    }
                                }

                                log.audit({ title: 'validacion.validado', details: validacion.validado });
                            } else {
                                //recordobj.setValue({fieldId: 'custbody_psg_ei_status', value: 1});
                                if (tipo_transaccion_gbl) {
                                    try {
                                        record.submitFields({
                                            type: tipo_transaccion_gbl,
                                            id: id_transaccion,
                                            values: { custbody_psg_ei_status: '1' },
                                            options: {
                                                enableSourcing: false,
                                                ignoreMandatoryFields: true
                                            }
                                        });
                                    } catch (errorsubmituno) {
                                        log.audit({ title: 'errorsubmituno', details: errorsubmituno });
                                        record.submitFields({
                                            type: tipo_transaccion_gbl,
                                            id: id_transaccion,
                                            values: { custbody_psg_ei_status: '1' },
                                            options: {
                                                enableSourcing: false,
                                                ignoreMandatoryFields: true
                                            }
                                        });
                                    }
                                } else if (tipo_transaccion_cp) {
                                    try {
                                        record.submitFields({
                                            type: tipo_transaccion_cp,
                                            id: id_transaccion,
                                            values: { custbody_psg_ei_status: '1' },
                                            options: {
                                                enableSourcing: false,
                                                ignoreMandatoryFields: true
                                            }
                                        });
                                    } catch (errorsubmituno) {
                                        log.audit({ title: 'errorsubmituno', details: errorsubmituno });
                                        record.submitFields({
                                            type: tipo_transaccion_cp,
                                            id: id_transaccion,
                                            values: { custbody_psg_ei_status: '1' },
                                            options: {
                                                enableSourcing: false,
                                                ignoreMandatoryFields: true
                                            }
                                        });
                                    }
                                } else {
                                    if (!idCompensacion) {
                                        try {
                                            record.submitFields({
                                                type: tipo_transaccion,
                                                id: id_transaccion,
                                                values: { custbody_psg_ei_status: '1' },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                        } catch (errorsubmituno) {
                                            log.audit({ title: 'errorsubmituno', details: errorsubmituno });
                                            record.submitFields({
                                                type: tipo_transaccion,
                                                id: id_transaccion,
                                                values: { custbody_psg_ei_status: '1' },
                                                options: {
                                                    enableSourcing: false,
                                                    ignoreMandatoryFields: true
                                                }
                                            });
                                        }
                                    }
                                }


                                if (!idCompensacion) {
                                    var mensaje_generacion = 'Mensaje: ' + validacion.errores;
                                    var log_record = record.create({
                                        type: 'customrecord_psg_ei_audit_trail',
                                        isDynamic: true
                                    });

                                    log_record.setValue({
                                        fieldId: 'custrecord_psg_ei_audit_transaction',
                                        value: id_transaccion
                                    });

                                    log_record.setValue({
                                        fieldId: 'custrecord_psg_ei_audit_entity',
                                        value: id_cliente_tran
                                    });

                                    log_record.setValue({
                                        fieldId: 'custrecord_psg_ei_audit_event',
                                        value: 5
                                    });

                                    log_record.setValue({
                                        fieldId: 'custrecord_psg_ei_audit_owner',
                                        value: idPropietario
                                    });

                                    log_record.setValue({
                                        fieldId: 'custrecord_psg_ei_audit_details',
                                        value: mensaje_generacion
                                    });

                                    var log_id = log_record.save({
                                        enableSourcing: true,
                                        ignoreMandatoryFields: true
                                    });
                                }

                            }


                            // recordobj.save({
                            //     enableSourcing: true,
                            //     ignoreMandatoryFields: true
                            // });


                            // context.response.setHeader({
                            //     name: 'Content-Disposition',
                            //     value: 'attachment; filename="' + 'xml.xml' + '"'
                            // });
                            log.audit({ title: 'validacion.validado', details: validacion.validado });
                            if (validacion.validado) {

                                if (!objRespuesta.certData.existError) {
                                    respuesta.success = true;
                                    respuesta.xml_generated = fileXmlId;
                                    respuesta.xml_certified = fileXmlIdTimbrado;
                                    respuesta.pdf_generated = pdf_tran_id;
                                    respuesta.uuid = objRespuesta.certData.custbody_mx_cfdi_uuid;
                                    respuesta.tranid = id_transaccion;
                                    respuesta.trantype = tipo_transaccion;
                                    respuesta.error_details = '';
                                } else {
                                    respuesta.success = false;
                                    respuesta.xml_generated = '';
                                    respuesta.xml_certified = '';
                                    respuesta.pdf_generated = '';
                                    respuesta.tranid = id_transaccion;
                                    respuesta.trantype = tipo_transaccion;
                                    respuesta.error_details = objRespuesta.certData.errorTitle + ': ' + objRespuesta.certData.errorDetails;
                                    respuesta.error_texto = objRespuesta.certData.errorTitle;
                                    respuesta.error_objeto = objRespuesta.certData.errorDetails;
                                }

                                log.audit({ title: 'JSON.stringify(respuesta)', details: JSON.stringify(respuesta) });

                                context.response.setHeader({
                                    name: "Content-Type",
                                    value: "application/json"
                                });

                                context.response.write({
                                    output: JSON.stringify(respuesta)
                                });
                            } else {
                                context.response.setHeader({
                                    name: "Content-Type",
                                    value: "application/json"
                                });

                                context.response.write({
                                    output: JSON.stringify(validacion.errores)
                                });
                            }

                        } catch (error_servicio_automatico) {
                            log.audit({ title: 'error_servicio_automatico', details: error_servicio_automatico });

                            if (banderaXML == true) {
                                var mensaje_generacion = 'Mensaje: ' + error_servicio_automatico;
                                var log_record = record.create({
                                    type: 'customrecord_psg_ei_audit_trail',
                                    isDynamic: true
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_transaction',
                                    value: id_transaccion
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_entity',
                                    value: id_cliente_tran
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_event',
                                    value: 5
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_owner',
                                    value: idPropietario
                                });

                                log_record.setValue({
                                    fieldId: 'custrecord_psg_ei_audit_details',
                                    value: mensaje_generacion
                                });

                                var log_id = log_record.save({
                                    enableSourcing: true,
                                    ignoreMandatoryFields: true
                                });
                            }

                            respuesta.success = false;
                            respuesta.xml_generated = '';
                            respuesta.xml_certified = '';
                            respuesta.pdf_generated = '';
                            respuesta.tranid = id_transaccion;
                            respuesta.trantype = tipo_transaccion;
                            respuesta.error_details = error_servicio_automatico;
                            respuesta.error_texto = '';
                            respuesta.error_objeto = '';

                            context.response.setHeader({
                                name: "Content-Type",
                                value: "application/json"
                            });

                            context.response.write({
                                output: JSON.stringify(respuesta)
                            });

                        }

                    } else {

                        respuesta.success = false;
                        respuesta.xml_generated = '';
                        respuesta.xml_certified = tran_xml;
                        respuesta.pdf_generated = tran_pdf;
                        respuesta.tranid = id_transaccion;
                        respuesta.trantype = tipo_transaccion;
                        respuesta.error_details = 'Esta transaccion ya se encuentra timbrada con el UUID: ' + tran_uuid;
                        respuesta.error_texto = '';
                        respuesta.error_objeto = '';

                        context.response.write({
                            output: JSON.stringify(respuesta)
                        });
                    }

                } else {

                    respuesta.success = false;
                    respuesta.xml_generated = '';
                    respuesta.xml_certified = '';
                    respuesta.pdf_generated = '';
                    respuesta.tranid = id_transaccion;
                    respuesta.trantype = tipo_transaccion;

                    if (!tipo_transaccion && id_transaccion) {
                        respuesta.error_details = 'Por favor ingrese el parametro trantype en su petición.';
                        respuesta.error_texto = '';
                        respuesta.error_objeto = '';
                        context.response.write({
                            output: JSON.stringify(respuesta)
                        });
                    }

                    if (!id_transaccion && tipo_transaccion) {
                        respuesta.error_details = 'Por favor ingrese el parametro tranid en su petición.';
                        respuesta.error_texto = '';
                        respuesta.error_objeto = '';
                        context.response.write({
                            output: JSON.stringify(respuesta)
                        });
                    }

                    if (!id_transaccion && !tipo_transaccion) {
                        respuesta.error_details = 'Por favor ingrese los parametros tranid y trantype en su petición.';
                        respuesta.error_texto = '';
                        respuesta.error_objeto = '';
                        context.response.write({
                            output: JSON.stringify(respuesta)
                        });
                    }
                }

            } else {
                respuesta.success = false;
                respuesta.xml_generated = '';
                respuesta.xml_certified = '';
                respuesta.pdf_generated = '';
                respuesta.tranid = id_transaccion;
                respuesta.trantype = tipo_transaccion;
                respuesta.error_details = 'Su cuenta se encuentra sin acceso al producto de facturación, por favor contactar con el area comercial de Tekiio.';
                respuesta.error_texto = '';
                respuesta.error_objeto = '';
                context.response.write({
                    output: JSON.stringify(respuesta)
                });

                var mensaje_generacion = 'Mensaje: ' + respuesta.error_details;
                var log_record = record.create({
                    type: 'customrecord_psg_ei_audit_trail',
                    isDynamic: true
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_transaction',
                    value: id_transaccion
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_entity',
                    value: id_cliente_tran
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_event',
                    value: 6
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_owner',
                    value: idPropietario
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_details',
                    value: mensaje_generacion
                });

                var log_id = log_record.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

            }
        }

        function obtenercustomobject(recordObjrecord, recordsLoaded, tipo_transaccion, tipo_transaccion_gbl, tipo_cp, id_transaccion, pagoCompensacionBody, pagoCompensacion, tipo_transaccion_gbl_tipo) {

            var obj_main = {
                suiteTaxFeature: false,
                suiteTaxWithholdingTaxTypes: [],
                PagoCompensacionArray: {},
                multiCurrencyFeature: true,
                oneWorldFeature: true,
                items: [],
                cfdiRelations: {},
                companyInfo: {
                    rfc: ""
                },
                itemIdUnitTypeMap: {},
                firstRelatedCfdiTxn: {},
                relatedCfdis: {
                    types: [],
                    cfdis: {}
                },
                billaddr: {
                    countrycode: ""
                },
                loggedUserName: "",
                summary: {
                    totalWithHoldTaxAmt: 0,
                    totalNonWithHoldTaxAmt: 0,
                    totalTaxAmt: 0,
                    discountOnTotal: 0,
                    includeTransfers: false,
                    includeWithHolding: false,
                    bodyDiscount: 0,
                    subtotal: 0,
                    subtotalExcludeLineDiscount: 0,
                    transfersTaxExemptedAmount: 0,
                    totalAmount: 0,
                    totalDiscount: 0,
                    totalTaxSum: 0,
                    totalSum: 0,
                    whTaxes: [],
                    transferTaxes: []
                },
                satcodes: {
                    items: [],
                    paymentTermInvMap: {},
                    paymentMethodInvMap: {},
                    whTaxTypes: {},
                    taxTypes: {},
                    paymentTermSatCodes: {},
                    paymentMethodCodes: {},
                    industryType: "",
                    industryTypeName: "",
                    paymentTerm: "",
                    paymentTermName: "",
                    paymentMethod: "",
                    paymentMethodName: "",
                    cfdiUsage: "",
                    cfdiUsageName: "",
                    proofType: "",
                    taxFactorTypes: {},
                    unitCodes: {}
                }
            }

            var recordObj = recordObjrecord;

            var lineCount = recordObj.getLineCount({
                sublistId: 'item',
            });
            var importeotramoneda = recordObj.getValue({
                fieldId: 'custbody_efx_fe_importe',
            });

            obj_main.multiCurrencyFeature = runtime.isFeatureInEffect({ feature: 'multicurrency' });
            obj_main.oneWorldFeature = runtime.isFeatureInEffect({ feature: 'subsidiaries' });
            obj_main.suiteTaxFeature = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
            obj_main.loggedUserName = runtime.getCurrentUser().name;
            //pendiente, probar con suitetax
            if (obj_main.suiteTaxFeature) {
                obj_main.suiteTaxWithholdingTaxTypes = libCFDI.tiposImpuestosSuiteTax();
            }

            if (tipo_transaccion != 'customerpayment' && tipo_transaccion != 'itemfulfillment') {
                var subRecord_bill = recordObj.getSubrecord({
                    fieldId: 'billingaddress',
                });
                obj_main.billaddr.countrycode = subRecord_bill.getValue('country');
            }

            //company info
            var registroCompania;
            if (obj_main.suiteTaxFeature && obj_main.oneWorldFeature) {
                registroCompania = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: recordObj.getValue('subsidiary'),
                });
                var lineCount = registroCompania.getLineCount({
                    sublistId: 'taxregistration',
                });

                var pais = '';
                for (var i = 0; i < lineCount; i++) {
                    pais = registroCompania.getSublistValue({
                        sublistId: 'taxregistration',
                        fieldId: 'nexuscountry',
                        line: i,
                    });
                    if (pais === 'MX') {
                        obj_main.companyInfo.rfc = registroCompania.getSublistValue({
                            sublistId: 'taxregistration',
                            fieldId: 'taxregistrationnumber',
                            line: i,
                        });
                        break;
                    }
                }
            } else if (obj_main.suiteTaxFeature) {
                registroCompania = config.load({
                    type: config.Type.COMPANY_INFORMATION,
                });

                var lineCount = registroCompania.getLineCount({
                    sublistId: 'taxregistration',
                });
                var pais = '';
                for (var i = 0; i < lineCount; i++) {
                    pais = registroCompania.getSublistValue({
                        sublistId: 'taxregistration',
                        fieldId: 'nexuscountry',
                        line: i,
                    });
                    if (pais === 'MX') {
                        obj_main.companyInfo.rfc = registroCompania.getSublistValue({
                            sublistId: 'taxregistration',
                            fieldId: 'taxregistrationnumber',
                            line: i,
                        });
                        break;
                    }
                }
            } else if (obj_main.oneWorldFeature) {
                registroCompania = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: recordObj.getValue('subsidiary'),
                });
                obj_main.companyInfo.rfc = registroCompania.getValue('federalidnumber');
            } else {
                registroCompania = config.load({
                    type: config.Type.COMPANY_INFORMATION,
                });
                obj_main.companyInfo.rfc = registroCompania.getValue('employerid');
            }

            if (registroCompania) {
                var idIndustria = registroCompania.getValue('custrecord_mx_sat_industry_type');
                var campos = search.lookupFields({
                    id: idIndustria,
                    type: 'customrecord_mx_sat_industry_type',
                    columns: ['custrecord_mx_sat_it_code', 'name'],
                });

                var objIdT = {
                    code: campos['custrecord_mx_sat_it_code'],
                    name: campos.name,
                };
                obj_main.satcodes.industryType = objIdT.code;
                obj_main.satcodes.industryTypeName = objIdT.name;
            }


            //inicia cfdirelationtypeinfo

            var lineCount = recordObj.getLineCount({
                sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
            });

            var relacionCFDI = {};
            var internalId = '';
            var tipoRelacion = '';
            var textoRelT = '';
            var primerRelacionadoCFDI = '';
            var arrayTiporelacionId = new Array();
            var arrayTiporelacionData = new Array();

            if (pagoCompensacion != 'T') {
                for (var p = 0; p < lineCount; p++) {

                    var idOriginTran = recordObj.getSublistValue({
                        sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                        fieldId: 'custrecord_mx_rcs_rel_type',
                        line: p,
                    });
                    arrayTiporelacionId.push(idOriginTran);
                }

                log.audit({ title: 'arrayTiporelacionId', details: arrayTiporelacionId });

                if (arrayTiporelacionId.length > 0) {
                    var tipodeRelacionSearch = search.create({
                        type: 'customrecord_mx_sat_rel_type',
                        filters: [['internalid', search.Operator.ANYOF, arrayTiporelacionId]],
                        columns: [
                            search.createColumn({ name: 'internalid' }),
                            search.createColumn({ name: 'custrecord_mx_sat_rel_type_code' }),
                        ]
                    });
                    tipodeRelacionSearch.run().each(function (result) {
                        var obj_trelacion = {
                            id: '',
                            tiporelacion: ''
                        }
                        obj_trelacion.id = result.getValue({ name: 'internalid' });
                        obj_trelacion.tiporelacion = result.getValue({ name: 'custrecord_mx_sat_rel_type_code' });
                        log.audit({ title: 'obj_trelacion', details: obj_trelacion });
                        arrayTiporelacionData.push(obj_trelacion);
                        return true;
                    });

                }
                log.audit({ title: 'arrayTiporelacionData', details: arrayTiporelacionData });

                for (var p = 0; p < lineCount; p++) {
                    internalId = recordObj.getSublistValue({
                        sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                        fieldId: 'custrecord_mx_rcs_rel_cfdi',
                        line: p,
                    }) + '';
                    if (p == 0) {
                        primerRelacionadoCFDI = internalId;
                    }
                    var idOriginTran = recordObj.getSublistValue({
                        sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                        fieldId: 'custrecord_mx_rcs_rel_type',
                        line: p,
                    });

                    if (idOriginTran) {
                        for (var tr = 0; tr < arrayTiporelacionData.length; tr++) {
                            if (arrayTiporelacionData[tr].id == idOriginTran) {
                                tipoRelacion = arrayTiporelacionData[tr].tiporelacion;
                            }
                        }
                    }

                    textoRelT = relacionCFDI[tipoRelacion];
                    if (!textoRelT) {
                        obj_main.relatedCfdis.types.push(tipoRelacion);
                        obj_main.relatedCfdis.cfdis['k' + (obj_main.relatedCfdis.types.length - 1)] = [{ index: p }];
                        relacionCFDI[tipoRelacion] = obj_main.relatedCfdis.types.length;
                    } else {
                        obj_main.relatedCfdis.cfdis['k' + (textoRelT - 1)].push({ index: p });
                    }
                }


                var esCreditMemo = recordObj.type;

                if (esCreditMemo == 'creditmemo' && primerRelacionadoCFDI) {
                    var primerCFDIRelacionado = search.lookupFields({
                        type: 'transaction',
                        columns: ['custbody_mx_txn_sat_payment_method'],
                        id: primerRelacionadoCFDI,
                    });
                    var paymentMethod = primerCFDIRelacionado['custbody_mx_txn_sat_payment_method'];
                    if (paymentMethod && paymentMethod[0]) {
                        obj_main.firstRelatedCfdiTxn.paymentMethodId = paymentMethod[0].value;
                    }
                }

                var descuentototal = recordObj.getValue('discounttotal');

                if (descuentototal) {
                    obj_main.summary.bodyDiscount = Math.abs(descuentototal);
                } else {
                    obj_main.summary.bodyDiscount = 0.0;
                }

                log.audit({ title: 'objmain3', details: obj_main });

                var paymentTerm = recordObj.getValue('custbody_mx_txn_sat_payment_term');
                var paymentMethod = recordObj.getValue('custbody_mx_txn_sat_payment_method');

                var cfdiUsage = recordObj.getValue('custbody_mx_cfdi_usage');


                if (esCreditMemo == 'creditmemo') {
                    //var objPaymentMet = libCFDI.obtenMetodoPago(obj_main.firstRelatedCfdiTxn.paymentMethodId);
                    var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod);
                    if (objPaymentMet) {
                        obj_main.satcodes.paymentMethod = objPaymentMet.code;
                        obj_main.satcodes.paymentMethodName = objPaymentMet.name;
                    }
                    obj_main.satcodes.paymentTerm = 'PUE';
                    obj_main.satcodes.paymentTermName = 'PUE - Pago en una Sola Exhibición';
                } else {
                    var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod);
                    var objPaymentFor = libCFDI.obtenFormaPago(paymentTerm);
                    if (objPaymentMet) {
                        obj_main.satcodes.paymentMethod = objPaymentMet.code;
                        obj_main.satcodes.paymentMethodName = objPaymentMet.name;
                    }
                    if (objPaymentFor) {
                        obj_main.satcodes.paymentTerm = objPaymentFor.code;
                        obj_main.satcodes.paymentTermName = objPaymentFor.name;
                    }
                }

                var objUsoCfdi = libCFDI.obtenUsoCfdi(cfdiUsage);
                if (objUsoCfdi) {
                    obj_main.satcodes.cfdiUsage = objUsoCfdi.code;
                    obj_main.satcodes.cfdiUsageName = objUsoCfdi.name;
                }
                obj_main.satcodes.proofType = libCFDI.tipoCFDI(recordObj.type);


                var lineCount = recordObj.getLineCount({
                    sublistId: 'item',
                });

                obj_main = libCFDI.libreriaArticulos(obj_main, recordObj, lineCount, tipo_transaccion_gbl, tipo_transaccion_gbl_tipo);
                var articulosId = [];
                obj_main.items.map(function (articuloMap) {
                    articulosId.push(articuloMap.itemId);
                    articuloMap.parts.map(function (partes) {
                        articulosId.push(partes.itemId);
                    });
                });
                if (tipo_transaccion != 'customerpayment') {
                    var tipodeUnidad = search.create({
                        type: 'item',
                        filters: [['internalid', 'anyof', articulosId]],
                        columns: ['unitstype'],
                    });

                    tipodeUnidad.run().each(function (result) {
                        var unittypemap = result.getValue('unitstype');

                        obj_main.itemIdUnitTypeMap['k' + result.id] = result.getValue('unitstype');

                        return true;
                    });
                }


                //attatchsatmapping

                // var satCodesDao = obj_main.satCodesDao;
                var clavesdeUnidad = {};

                function detallesDeImpuesto(articulo) {
                    tieneItemParte(articulo);
                    if (tipo_transaccion == 'creditmemo' && articulo.custcol_efx_fe_gbl_originunits) {
                        clavesdeUnidad[articulo.custcol_efx_fe_gbl_originunits] = true;
                    } else {
                        if (articulo.custcol_efx_fe_gbl_originunitm) {
                            clavesdeUnidad[articulo.custcol_efx_fe_gbl_originunitm] = true;
                        } else {
                            clavesdeUnidad[articulo.units] = true;
                        }

                    }
                    // articulo.taxes.taxItems.map(function (taxLine) {
                    //     satCodesDao.pushForLineSatTaxCode(taxLine.taxType);
                    //     satCodesDao.pushForLineSatTaxFactorType(taxLine.taxCode);
                    //
                    // });
                    // articulo.taxes.whTaxItems.map(function (taxLine) {
                    //     satCodesDao.pushForLineSatTaxCode(taxLine.taxType,true);
                    // });
                }

                function tieneItemParte(articulo) {
                    if (articulo.parts) {
                        articulo.parts.map(function (parte) {
                            detallesDeImpuesto(parte);
                        });
                    }
                }

                function codigosSatArticulos(items, codigosSat, idUnidades) {
                    if (!items) {
                        return;
                    }
                    var objCodes;
                    items.map(function (articulos) {
                        codigosSatArticulos(articulos.parts, codigosSat, idUnidades);
                        log.audit({ title: 'idUnidades', details: idUnidades });
                        log.audit({ title: 'articulos.itemId', details: articulos.itemId });
                        log.audit({ title: 'articulos.units', details: articulos.units });
                        if (tipo_transaccion == 'creditmemo' && articulos.custcol_efx_fe_gbl_originunits) {
                            objCodes = codigosSat.unitCodes['k' + idUnidades['k' + articulos.itemId] + '_' + articulos.custcol_efx_fe_gbl_originunits];
                        } else {
                            objCodes = codigosSat.unitCodes['k' + idUnidades['k' + articulos.itemId] + '_' + articulos.units];
                            log.audit({ title: 'objCodes', details: objCodes });
                        }

                        articulos.satUnitCode = objCodes ? objCodes.code : '';
                        articulos.taxes.taxItems.map(function (lineaImpuesto) {
                            if (obj_main.suiteTaxFeature) {
                                objCodes = codigosSat.taxFactorTypes[lineaImpuesto.satTaxCodeKey];
                                lineaImpuesto.taxFactorType = objCodes ? objCodes.code : '';
                            } else {
                                lineaImpuesto.taxFactorType = lineaImpuesto.exempt ? 'Exento' : 'Tasa';
                            }

                            objCodes = codigosSat.taxTypes['k' + lineaImpuesto.taxType];
                            lineaImpuesto.satTaxCode = objCodes ? objCodes.code : '';
                        });
                        articulos.taxes.whTaxItems.map(function (lineaImpuesto) {
                            lineaImpuesto.taxFactorType = 'Tasa';
                            objCodes = codigosSat.whTaxTypes['k' + lineaImpuesto.taxType];
                            lineaImpuesto.satTaxCode = objCodes ? objCodes.code : '';
                        });
                    });
                }

                function obtieneUnidadesMedidaSAT(idUnidades) {
                    log.audit('idUnidades', idUnidades);
                    var filtrosArray = new Array();
                    var buscaUnidades = search.load({
                        id: 'customsearch_mx_mapping_search',
                    });
                    filtrosArray.push(['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[0]]);
                    for (var i = 1; i < idUnidades.length; i++) {
                        filtrosArray.push('OR', ['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[i]]);
                    }
                    log.audit('filtrosArray', filtrosArray);
                    if (filtrosArray.length === 0) {
                        return {};
                    }

                    buscaUnidades.filterExpression = [
                        [
                            'custrecord_mx_mapper_keyvalue_category.scriptid',
                            'is',
                            ['sat_unit_code'],
                        ],
                        'and',
                        ['custrecord_mx_mapper_keyvalue_rectype', 'is', ['unitstype']],
                        'and',
                        ['custrecord_mx_mapper_keyvalue_subrectype', 'is', ['uom']],
                        'and',
                        [filtrosArray],
                    ];
                    log.audit('buscaUnidades', buscaUnidades);
                    var ejecuta = buscaUnidades.run()

                    log.audit('ejecuta', ejecuta);

                    var data = {};
                    ejecuta.each(function (mapping) {
                        var detalle = {};
                        detalle.code = mapping.getValue({
                            name: 'custrecord_mx_mapper_value_inreport',
                            join: 'custrecord_mx_mapper_keyvalue_value',
                        });
                        detalle.name = mapping.getValue({
                            name: 'name',
                            join: 'custrecord_mx_mapper_keyvalue_value',
                        });
                        var key = mapping.getValue({
                            name: 'custrecord_mx_mapper_keyvalue_key',
                        });
                        var subkey = mapping.getValue({
                            name: 'custrecord_mx_mapper_keyvalue_subkey',
                        });
                        var claveid = 'k' + key;
                        if (subkey) {
                            claveid = claveid + '_' + subkey;
                        }
                        data[claveid] = detalle;
                        log.audit('data', data);
                        return true;
                    });

                    log.audit('data', data);
                    return data;


                }

                log.debug('obj_main preitems :', obj_main);
                obj_main.items.map(function (articulo) {
                    detallesDeImpuesto(articulo);
                });

                // satCodesDao.fetchSatTaxFactorTypeForAllPushed();
                // satCodesDao.fetchSatTaxCodesForAllPushed();
                //satCodesDao.fetchSatUnitCodesForAllPushed();
                if (tipo_transaccion != 'customerpayment') {
                    obj_main.satcodes.unitCodes = obtieneUnidadesMedidaSAT(Object.keys(clavesdeUnidad));

                    log.debug('obj_main result :', obj_main);
                    codigosSatArticulos(obj_main.items, obj_main.satcodes, obj_main.itemIdUnitTypeMap);

                }
                //fin attachmaping

                obj_main.summary = libCFDI.summaryData(obj_main);
                // this._attachSatMappingData(result);
                //new summaryCalc.TransactionSummary().summarize(obj_main);


                //result.satcodes = satCodesDao.getJson();
                //crear relacionado en el pago
            }
            if (tipo_transaccion == 'customerpayment') {
                // var payment = pagodata.obtenerDatos(recordObj, obj_main, obj_main.satCodesDao);
                // log.debug('payment: ',JSON.stringify(payment));
                if (pagoCompensacion != 'T') {
                    obj_main.appliedTxns = libCFDI.pagoData(recordObj, obj_main, 'apply', id_transaccion, importeotramoneda);
                    log.debug('result.appliedTxns: 🌵', JSON.stringify(obj_main.appliedTxns));
                    log.debug('typeof result.appliedTxns: 🌵', typeof obj_main.appliedTxns);
                    log.emergency('result.appliedTxns.exchangerate: 🌸', obj_main.appliedTxns[0].exchangerate);
                    log.emergency('result.appliedTxns.custbody_mx_cfdi_uuid: 🌸', obj_main.appliedTxns[0].custbody_mx_cfdi_uuid);
                    // MOD: 18/01/2024 se integra tener un campo que almacene un arreglo de objeto para pagos con el uuid y tipo de cambio de cada factura aplicada (lineas 2363-2396)
                    var arr_objInvoice_Info = [];
                    obj_main.appliedTxns.forEach(element_txns => {
                        log.emergency({title:'element_txns.exchangerate 🙀',details:element_txns.exchangerate});
                        log.emergency({title:'typeof element_txns.exchangerate 🙀',details:typeof element_txns.exchangerate});
                        arr_objInvoice_Info.push({ 
                            custbody_mx_cfdi_uuid: element_txns.custbody_mx_cfdi_uuid, 
                            exchangerate: element_txns.exchangerate
                        })
                    });
                    if (arr_objInvoice_Info.length > 0) {
                        try {
                            // 1. Carga record de factura
                            var invoice_rcrd = record.load({
                                type: tipo_transaccion,
                                id: id_transaccion,

                            });
                            // 2. setea valor
                            invoice_rcrd.setValue({
                                fieldId: 'custbody_mx_plus_tc_facturas',
                                value: JSON.stringify(arr_objInvoice_Info),
                                ignoreFieldChange: true
                            });
                            // 3. guarda registro
                            invoice_rcrd.save({
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            });
                        } catch (err) {
                            log.error({ title: 'Error occurred in setting custbody_mx_plus_tc_facturas', details: err });
                        }

                    }

                } else {
                    var valorP = 0;
                    for (var p = 0; p < pagoCompensacionBody.Pagos.length; p++) {
                        if (pagoCompensacionBody.Pagos[p].idPago == id_transaccion) {
                            valorP = p;
                            break;
                        }
                    }
                    pagoCompensacionBody.Pagos[valorP].appliedTxns = libCFDI.pagoData(recordObj, obj_main, 'apply', id_transaccion, importeotramoneda);
                    log.debug('result.appliedTxns: 🌵🌵', JSON.stringify(obj_main.appliedTxns));
                }
            }

            //
            obj_main.satCodesDao = null;
            log.debug('Custom Datasource result: ', JSON.stringify(obj_main));

            return obj_main;
        }

        function generarPDFTimbrado(recordObjrecord, entityObj, objRespuesta, template_invoice_pac, tax_id_pac, tran_tranid, tipo_transaccion, result, idFolder, tipo_cp, idtimbre, resultDirecciones, pagoCompensacion, idCompensacion, pagoCompensacionBody) {
            log.audit({ title: 'objRespuesta.dataXML', details: objRespuesta.dataXML });
            log.audit({ title: 'idFolder generarPDFTimbrado', details: idFolder });
            var scriptObj = runtime.getCurrentScript();


            var renderer = render.create();
            var txnRecord = recordObjrecord;
            var oldPdfFileId = txnRecord.getValue({ fieldId: 'custbody_edoc_generated_pdf' });

            var pdfTemplateScriptId = template_invoice_pac;
            var id_templatePDF = '';
            if (pagoCompensacion == 'T') {
                id_templatePDF = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_compensacion_template' });
                renderer.setTemplateById({
                    id: id_templatePDF,
                });
                pagoCompensacionBody.infoCFDI.custbody_mx_cfdi_signature = objRespuesta.certData.custbody_mx_cfdi_signature;
                pagoCompensacionBody.infoCFDI.custbody_mx_cfdi_sat_signature = objRespuesta.certData.custbody_mx_cfdi_sat_signature;
                pagoCompensacionBody.infoCFDI.custbody_mx_cfdi_cadena_original = objRespuesta.certData.custbody_mx_cfdi_cadena_original;
                pagoCompensacionBody.infoCFDI.custbody_mx_cfdi_uuid = objRespuesta.certData.custbody_mx_cfdi_uuid;
                pagoCompensacionBody.infoCFDI.custbody_mx_cfdi_qr_code = objRespuesta.certData.custbody_mx_cfdi_qr_code;
                var customData = pagoCompensacionBody;
                var datasource = {
                    format: render.DataSource.OBJECT,
                    alias: 'RECORD_PDF',
                    data: customData,
                };
                renderer.addCustomDataSource(datasource);
            } else {
                renderer.setTemplateById({
                    id: pdfTemplateScriptId,
                });
                renderer.addRecord({
                    templateName: 'record',
                    record: txnRecord,
                });

                if (entityObj) {
                    renderer.addRecord({
                        templateName: entityObj.type,
                        record: entityObj,
                    });
                }
                var customData = objRespuesta;
                //buscar en el record de Mexico Pac el TAX ID
                customData.pacRfc = tax_id_pac;
                for (var property in result) {
                    customData[property] = result[property];
                }
                var datasource = {
                    format: render.DataSource.OBJECT,
                    alias: 'custom',
                    data: customData,
                };


                //? se manda el objeto de customDatasources a la funcion XML_DATA para poder parsear los datos de timbrado del XML
                // pasarle el datasource mas el id de la transaccion y el tipo para poder hacer un submitfields
                /* var sello_cfd = datasource.certData.custbody_mx_cfdi_signature;
                log.audit({title: 'datos para la funcion', details: {sello_cfd: sello_cfd, tranid: tran_tranid, tipo: tipo_transaccion}});
                XML_DATA(sello_cfd, tran_tranid, tipo_transaccion); */

                var fileresult = file.create({
                    name: 'Results.json',
                    fileType: file.Type.PLAINTEXT,
                    contents: JSON.stringify(datasource),
                    // MOD: antes estaba harcodeado 11366 pero ese folder no existe en todas las instancias
                    folder: idFolder
                });
                var id_archivo_txt = fileresult.save();
                log.audit({ title: 'id_archivo', details: id_archivo_txt });

                renderer.addCustomDataSource(datasource);

                if (tipo_transaccion != 'customerpayment' && tipo_transaccion != 'itemfulfillment' && tipo_transaccion != 'vendbill') {
                    var obj_direnvst = JSON.stringify(resultDirecciones.shipaddress);
                    var obj_direnv = JSON.parse(obj_direnvst);

                    if (obj_direnv["fields"]) {
                        renderer.addCustomDataSource({
                            alias: 'shipaddress',
                            format: render.DataSource.OBJECT,
                            data: obj_direnv["fields"]
                        });
                    }
                    var obj_dirbillst = JSON.stringify(resultDirecciones.billaddress);
                    var obj_dirbill = JSON.parse(obj_dirbillst);
                    if (obj_dirbill["fields"]) {
                        renderer.addCustomDataSource({
                            alias: 'billaddress',
                            format: render.DataSource.OBJECT,
                            data: obj_dirbill["fields"]
                        });
                    }
                }
            }



            var pdfFileOutput;
            var pdfFileId;

            pdfFileOutput = renderer.renderAsPdf();
            if (tipo_cp) {
                if (tipo_transaccion == 'invoice') {
                    pdfFileOutput.name = 'Factura_' + tran_tranid + '_' + idtimbre + '.pdf';
                } else if (tipo_transaccion == 'cashsale') {
                    pdfFileOutput.name = 'VentaEfectivo_' + tran_tranid + '_' + idtimbre + '.pdf';
                } else if (tipo_transaccion == 'creditmemo') {
                    pdfFileOutput.name = 'NotaCredito_' + tran_tranid + '_' + idtimbre + '.pdf';
                } else if (tipo_transaccion == 'customerpayment') {
                    pdfFileOutput.name = 'Pago_' + tran_tranid + '_' + idtimbre + '.pdf';
                } else if (tipo_transaccion == 'itemfulfillment') {
                    pdfFileOutput.name = 'EjecucionPedido_' + tran_tranid + '_' + idtimbre + '.pdf';
                } else if (tipo_transaccion == 'customsale_efx_fe_factura_global') {
                    pdfFileOutput.name = 'Global_' + tran_tranid + '_' + idtimbre + '.pdf';
                }
            } else {
                if (tipo_transaccion == 'invoice') {
                    pdfFileOutput.name = 'Factura_' + tran_tranid + '.pdf';
                } else if (tipo_transaccion == 'cashsale') {
                    pdfFileOutput.name = 'VentaEfectivo_' + tran_tranid + '.pdf';
                } else if (tipo_transaccion == 'creditmemo') {
                    pdfFileOutput.name = 'NotaCredito_' + tran_tranid + '.pdf';
                } else if (tipo_transaccion == 'customerpayment') {
                    if (pagoCompensacion == 'T') {
                        pdfFileOutput.name = 'Pago_' + idCompensacion + '.pdf';
                    } else {
                        pdfFileOutput.name = 'Pago_' + tran_tranid + '.pdf';
                    }
                } else if (tipo_transaccion == 'itemfulfillment') {
                    pdfFileOutput.name = 'EjecucionPedido_' + tran_tranid + '.pdf';
                } else if (tipo_transaccion == 'customsale_efx_fe_factura_global') {
                    pdfFileOutput.name = 'Global_' + tran_tranid + '.pdf';
                }
            }

            pdfFileOutput.folder = idFolder;
            pdfFileOutput.isOnline = true;
            var pdfFileId = pdfFileOutput.save();
            return pdfFileId;
        }

        function validaXml(content, templateobj) {
            var validacionobj = {
                validado: true,
                errores: [],
            };
            var valido = true;

            try {
                log.audit({ title: 'templateobj', details: templateobj });
                var contentType = templateobj.getValue({ fieldId: 'custrecord_psg_file_content_type' });
                log.audit({ title: 'contenttype', details: contentType });


                if (contentType == 1) {
                    var validatorcount = templateobj.getLineCount({ sublistId: 'recmachcustrecord_psg_ei_temp_validator_parent' })
                    log.audit({ title: 'validatorcount', details: validatorcount });

                    var xpath;
                    var regex;
                    var nodes;
                    var failures = [];
                    var validator;
                    log.audit({ title: 'content', details: content });
                    // var xmldocumento = xml.Parser.toString({
                    //     document : content
                    // });
                    // log.audit({title:'xmldocumento',details:xmldocumento});
                    var eInvoice = xml.Parser.fromString({
                        text: content
                    });

                    /*** XSD validation ***/
                    log.audit({ title: 'eInvoice', details: eInvoice });
                    var xsdFileId = templateobj.getValue({ fieldId: 'custrecord_edoc_template_outbound_xsd' });
                    var xsdImportFolder = templateobj.getValue({ fieldId: 'custrecord_edoc_template_xsd_folder' });

                    if (xsdFileId) {
                        try {
                            xml.validate({
                                xml: eInvoice,
                                xsdFilePathOrId: xsdFileId,
                                importFolderPathOrId: xsdImportFolder
                            });
                        } catch (e) {
                            log.error(e.name, e.message);
                            var errorMessage = e;
                        }
                    }

                    /*** Regex Validation ***/
                    log.audit({ title: 'validatorcount', details: validatorcount });
                    for (var i = 0; i < validatorcount; i++) {
                        xpath = templateobj.getSublistValue({
                            sublistId: 'recmachcustrecord_psg_ei_temp_validator_parent',
                            fieldId: 'custrecord_psg_ei_temp_validator_xpath',
                            line: i

                        });
                        regex = templateobj.getSublistValue({
                            sublistId: 'recmachcustrecord_psg_ei_temp_validator_parent',
                            fieldId: 'custrecord_psg_ei_temp_validator_regex',
                            line: i

                        });
                        nodes = xml.XPath.select({
                            node: eInvoice,
                            xpath: xpath
                        });

                        log.audit({ title: 'nodes', details: nodes });


                        if (nodes.length === 0) {
                            failures.push([xpath, regex, "No existe el nodo"].join(" | "));
                        }

                        var node;
                        for (var j = 0; j < nodes.length; j++) {
                            node = nodes[j];

                            var childNodes = xml.XPath.select({
                                node: node,
                                xpath: "node()"
                            });
                            log.audit({ title: 'childNodes', details: childNodes });

                            var childNode;
                            var value = "";
                            for (var k = 0; k < childNodes.length; k++) {
                                childNode = childNodes[k];
                                if (childNode.nodeType === 'TEXT_NODE') {
                                    value = childNode.nodeValue || "";
                                    break;
                                }
                            }

                            var isMatched = isRegexMatched(value, regex);

                            if (!isMatched) {
                                failures.push([xpath, regex, value].join(" | "));
                            }
                        }
                    }
                    log.audit({ title: 'failures', details: failures });
                    if (failures.length > 0) {
                        var failureString = ["XPath | Regular Expression | Value\n", failures.join("\n")].join("");
                        var errorMessage = [failureString].join("");
                        valido = false;
                    }

                }
            } catch (e) {
                log.audit({ title: 'e', details: e });
            }

            log.audit({ title: 'valido', details: valido });
            validacionobj.validado = valido;
            validacionobj.errores = failures;
            return validacionobj;
        }

        function isRegexMatched(value, regex) {
            log.audit({ title: 'value', details: value });
            var isMatched = true;
            var pattern;
            var modifier = regex.split("/")[regex.split("/").length - 1];
            log.audit({ title: 'modifier', details: modifier });

            if (modifier) {
                var lastIndex = regex.lastIndexOf("/");
                log.audit({ title: 'lastIndex', details: lastIndex });
                pattern = regex.substring(0, lastIndex + 1); //retrieving something like "/[a-z]/"
                log.audit({ title: 'pattern1', details: pattern });
                pattern = formatRegexPattern(pattern);
                log.audit({ title: 'pattern', details: pattern });
            } else {
                pattern = formatRegexPattern(regex);
                log.audit({ title: 'pattern', details: pattern });
            }

            var matches = value.match(new RegExp(pattern, modifier)) || [];
            log.audit({ title: 'matches', details: matches });

            if (matches.length === 0) {
                isMatched = false;
            }

            return isMatched;
        }

        function formatRegexPattern(pattern) {
            var firstChar = pattern.charAt(0);
            var lastChar = pattern.charAt(pattern.length - 1);

            if (firstChar === "/" && lastChar === "/") {
                pattern = pattern.substring(1, pattern.length - 1);
            }

            return pattern;
        }

        function timbraDocumento(xmlDocument, id, user_pac, url_pac, idCompensacion, PAC_Service, pass_pac) {
            var dataReturn = { success: false, error: '', xmlDocument: '', mensaje: '' };
            try {
                log.audit({ title: 'PAC_Service timbra docu', details: PAC_Service });
                var xmlStrX64 = encode.convert({
                    string: xmlDocument,
                    inputEncoding: encode.Encoding.UTF_8,
                    outputEncoding: encode.Encoding.BASE_64
                }); // se convierte el xml en base 64 para mandarlo al pac
                log.audit({ title: 'xmlStrX64', details: xmlStrX64 });
                var url_pruebas = url_pac;
                var xmlDocument_receipt;
                if (PAC_Service == true) { // se utiliza SmarterWeb
                    var tokenResult = getTokenSW(user_pac, pass_pac, url_pac);
                    log.debug({ title: 'tokenResult', details: tokenResult });
                    if (tokenResult.success == false) {
                        throw 'Error getting token'
                    }
                    var tokentry = tokenResult.token;
                    log.debug({ title: 'tokentry', details: tokentry });
                    var headers = {
                        "Content-Type": 'application/json',
                        "Authorization": "Bearer " + tokentry.token
                    };
                    var cuerpo = { "data": xmlStrX64 };
                    var fecha_envio = new Date();
                    log.audit({ title: 'fecha_envio', details: fecha_envio });
                    log.audit({ title: 'headers', details: headers });
                    log.audit({ title: 'cuerpo', details: cuerpo });
                    url_pruebas = url_pruebas + '/cfdi33/issue/json/v4/b64';
                    log.audit({ title: 'url timbrado', details: url_pruebas });
                    var response = https.post({
                        url: url_pruebas,
                        headers: headers,
                        body: JSON.stringify(cuerpo)
                    });
                    // var response = {
                    //     "type": "http.ClientResponse",
                    //     "code": 200,
                    //     "headers": {
                    //     "Content-Type": "text/json; charset=utf-8",
                    //     "content-type": "text/json; charset=utf-8",
                    //     "Date": "Thu, 22 Jun 2023 22:06:27 GMT",
                    //     "date": "Thu, 22 Jun 2023 22:06:27 GMT",
                    //     "Request-Context": "appId=cid-v1:aa56c64f-d639-4232-87f9-f0d0b91b6d6a",
                    //     "request-context": "appId=cid-v1:aa56c64f-d639-4232-87f9-f0d0b91b6d6a",
                    //     "Transfer-Encoding": "chunked",
                    //     "transfer-encoding": "chunked",
                    //     "Vary": "Accept-Encoding",
                    //     "vary": "Accept-Encoding",
                    //     "Via": "1.1 mono003",
                    //     "via": "1.1 mono003",
                    //     "X-Azure-Ref": "04sWUZAAAAADEPbMWtKlRS4MDHMba7GSKU0pDMjExMDUxMjAxMDExADE3ZmQzMjdiLTA4YTktNGVhMy04NzdmLTczNmViZGI4M2UxNg==",
                    //     "x-azure-ref": "04sWUZAAAAADEPbMWtKlRS4MDHMba7GSKU0pDMjExMDUxMjAxMDExADE3ZmQzMjdiLTA4YTktNGVhMy04NzdmLTczNmViZGI4M2UxNg==",
                    //     "X-Cache": "CONFIG_NOCACHE",
                    //     "x-cache": "CONFIG_NOCACHE",
                    //     "X-Powered-By": "ASP.NET",
                    //     "x-powered-by": "ASP.NET"
                    //     },
                    //     "body": "{\"data\":{\"cadenaOriginalSAT\":\"||1.1|24ebfe7a-40d1-4c75-a7bb-36f4bc2cb2a9|2023-06-22T16:06:27|SPR190613I52|f/e8zGZRzz39H1YoyRzuoWClL6IW7KNuDjg8MmnFqW7bPVfp6cUUW/m+3erD8mHBbnMUz37OvnwPL5jhwlaW/MrOMkzktYtDv571yXNH14vT56yxfkG5MJvd6QrkIsb3avyErNFVrO4Z06KswWT9fFQ/shnSSf1/n2YwLnBmh6YWD3y90contxkgv3Q53qOU68BnGPIxNrvHF5EbT5qt9UBYaHXSk7Itz53pspnULw0w92e7dktiBeiiKChrz3fIvSI26nD0GdFmwo8cVA3mVuQ6DgZKuEw9G1ExI9tgLRtovpJTQpCtXCqTt7Jo7DYAeTpm0ujlOVAgt4zzoSYl0w==|30001000000400002495||\",\"noCertificadoSAT\":\"30001000000400002495\",\"noCertificadoCFDI\":\"00001000000514588133\",\"uuid\":\"24ebfe7a-40d1-4c75-a7bb-36f4bc2cb2a9\",\"selloSAT\":\"DVLA09PBUJmVukZ6M6EwtKUS4SUjq9TIXO1rpXkbu2Ob3wtf3TErEiUR1ZyZOU2LNEDO32H0015fqDjWzuU6Vc1vEPblUTOvpPPQ9vetf87dHKK4ieGwg689YSWNuNIR/WQACq4jKc71fxGI5tlBJn7lXcZtscIPZCGGnNNszAnX0MIar9HpBXY83YPlNbEKIMNVG6oKdElzMmEPgucsadEPPoCf5C+8NQgl26XZWz6M0uWQiG7PFveXAPO6GuzKPtUF1gtzUwLt6JSzsLYSxOHZxE6bP7m/dzdnvZjYx9emUATpYOovyBeX+YOX9nboT0YO+GXfbVD9u0b9zsF10g==\",\"selloCFDI\":\"f/e8zGZRzz39H1YoyRzuoWClL6IW7KNuDjg8MmnFqW7bPVfp6cUUW/m+3erD8mHBbnMUz37OvnwPL5jhwlaW/MrOMkzktYtDv571yXNH14vT56yxfkG5MJvd6QrkIsb3avyErNFVrO4Z06KswWT9fFQ/shnSSf1/n2YwLnBmh6YWD3y90contxkgv3Q53qOU68BnGPIxNrvHF5EbT5qt9UBYaHXSk7Itz53pspnULw0w92e7dktiBeiiKChrz3fIvSI26nD0GdFmwo8cVA3mVuQ6DgZKuEw9G1ExI9tgLRtovpJTQpCtXCqTt7Jo7DYAeTpm0ujlOVAgt4zzoSYl0w==\",\"fechaTimbrado\":\"2023-06-22T16:06:27\",\"qrCode\":\"iVBORw0KGgoAAAANSUhEUgAAAIwAAACMCAYAAACuwEE+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAxfSURBVHhe7ZLRigTJjkPn/396loQWiEOobGe5LsMSB/QgWeF2NfnPv5fLgPvBXEbcD+Yy4n4wlxH3g7mMuB/MZcT9YC4j7gdzGXE/mMuI+8FcRtwP5jLifjCXEfeDuYy4H8xlxP1gLiPuB3MZcT+Yy4iVD+aff/55pYrTm0ddqr7vdFWwl3wlUs0Fe11tsLLldFxHFac3j7pUfd/pqmAv+Uqkmgv2utpgZcv0IPan70V6p5zz5KlENRe+65MSVS/liWn/Eytbvv0B0/civVPOefJUopoL3/VJiaqX8sS0/4mVLTxInhLJMxfdecLfeu+tryToxdueYC5PCfpvWNmSDqRE8sxFd57wt9576ysJevG2J5jLU4L+G1a2pAMpMfUkzZV351IFe/72k8RpdpJ46ylB/w0rW9KBlJh6kubKu3Opgj1/+0niNDtJvPWUoP+GlS3pQErQk26/yqu58O43SqQecyrBub9xCfpvWNmSDqQEPen2q7yaC+9+o0TqMacSnPsbl6D/hpUt04NSXznnzClxmj2qqHrTPewn381JNSfT/idWtmz9AOWcM6fEafaooupN97CffDcn1ZxM+59Y2aKDphLXv/NTbbCy5XRcR+L6d36qDXa2fEn6QdUPreYJvqv2VH16oZxz5kn/Rf4TV6V/UPWPq+YJvqv2VH16oZxz5kn/RVaumv5A9uVTXuFvT/3pfCpxmrlIyoW/PYmcOo82Wdk2PYx9+ZRX+NtTfzqfSpxmLpJy4W9PIqfOo01WtvEwP/YkUuUUeTtnTiW6c0q8zYV3PCfV/A0r23iYfBKpcoq8nTOnEt05Jd7mwjuek2r+hpVtPEyeEt08iVTzLtV7zpNPEvRT0j7mv2BlOw/1412imyeRat6les958kmCfkrax/wXrG5PB/uP8Xk3l8Q0J5z7m095JUEvUi+pgr3uu29Y3Z4OVs55N5fENCec+5tPeSVBL1IvqYK97rtvWN2ugymRcsG5VFH1OE/+bZ4kpr6L3lGCfoPVbX60S6RccC5VVD3Ok3+bJ4mp76J3lKDfYHfbH368q+JXffYk0s27vQr25ZmLKuc85d+wswXwUKniV332JNLNu70K9uWZiyrnPOXfsLKFB1UHap5ETp1HosqJdydz+i7VHvqEeuwnz3yDlW08rDpU8yRy6jwSVU68O5nTd6n20CfUYz955husbOOBEnmbV3ORfJI4zVziNHtEUi668ySRfMo3WNniR7rI27yai+STxGnmEqfZI5Jy0Z0nieRTvsHKFj/SD2NOJVIveeaCc0lUuai8SL2UE+/6nJ6kPvMNVralA5lTidRLnrngXBJVLiovUi/lxLs+pyepz3yD3W1/8GCpgj1/e8qFd1ziNHNVnN48EvSJ1GMuz7xi2n/DT7b7j3VVsOdvT7nwjkucZq6K05tHgj6ReszlmVdM+29Y2c5Duz5JVHmimifSu2rf1pw9euJvXCTlb1jZwoO6PklUeaKaJ9K7at/WnD164m9cJOVv2NnyBw/rHqpekpjmhHN/47no5pVPqMc+c6mCve67Cavb3h6sXpKY5oRzf+O56OaVT6jHPnOpgr3uuwkr29KhlKhykXyVVxLJU6LyRHP2qlx45yRBT6r5hJUtPEieElUukq/ySiJ5SlSeaM5elQvvnCToSTWfsLJFB1Ek5YJz+Uqi8qLqyVdKbM0pcZo9EvSbrGz1o10k5YJz+Uqi8qLqyVdKbM0pcZo9EvSbrG5NhyqnRNdPc+GdU94lve9KVLnwzikX9L9k9a+kw5VTouunufDOKe+S3nclqlx455QL+l+y+leqH5I8c5Fy4jtcCc5TXznnyae8Ir2jSMpJt9dhZ8sfPKzrmYuUE9/hSnCe+so5Tz7lFekdRVJOur0OO1sAD5TviqR5lSdSvyvC3Lsucuq4xGl2Eqnmb9jZAnigH90RSfMqT6R+V4S5d13k1HGJ0+wkUs3fsLKFB1WeVH16UfXohXIqceq6BL3wrs/phXddiaqX8jesbOFBlSdVn15UPXqhnEqcui5BL7zrc3rhXVei6qX8DTtbAA/s+mle4W9P/TSvfEI99pNPIswr/0t+8leqH5T8NK/wt6d+mlc+oR77yScR5pX/JT/5K/oBVIJzf/Mmpwjz1BPdfpVznnzKE/7G9Qt+svV0/KME5/7mTU4R5qknuv0q5zz5lCf8jesXrGw9HfuNRMpFlVPk1PkkkXLCXpLo5l0J+m9Y2eJHbkikXFQ5RU6dTxIpJ+wliW7elaD/hp0tf1SHcS7PfEq1h7l3PRcpF5x3++wxpyq6/Wo+YWfLH9PD5ZlPqfYw967nIuWC826fPeZURbdfzSesbOkepF7qM/fuJ5EqT3pLes88eeaCuXddFd1eh5Ut08NTn7l3P4lUedJb0nvmyTMXzL3rquj2Oqxs8eNdU047HnXp9qd7Bd/Jp5x41+dVLrzjEvQi5W9Y2aKDqCmnHY+6dPvTvYLv5FNOvOvzKhfecQl6kfI37GwBOjAd2p2TlCemfcL38swFc++6Emnub08i1fwbdrf9UR3cnZOUJ6Z9wvfyzAVz77oSae5vTyLV/BtWtvFASdBXpPeVBH3C37rIqXOSmOaimhP2kzZZ2XY68pGgr0jvKwn6hL91kVPnJDHNRTUn7CdtsrItHfY2pwjz1BOaT3tUl9PbR6LyidRTzjn9Bivb0mFvc4owTz2h+bRHdTm9fSQqn0g95ZzTb7CyrXsYe/JJhHnVS3OSeszlU/4W3+l7qlzQ/5KVv9I9mD35JMK86qU5ST3m8il/i+/0PVUu6H/Jyl/RwZQ4zT6JMPeu54K5d08i3bnwrkukXDD37idVTPsdVrbwMEmcZp9EmHvXc8HcuyeR7lx41yVSLph795Mqpv0OK1vSYfQJf3uSSJ5KnLouQS+863N64d1Pc7Kdp/kbVrakw+gT/vYkkTyVOHVdgl541+f0wruf5mQ7T/M3rGxJBzGXr3LqLek9865POfHuG03hO9/l+QYr29JhzOWrnHpLes+861NOvPtGU/jOd3m+wcq27oFpzjz1RJorT/OK9L7yIuWC8+QrkVPnpA1WtnQPS3PmqSfSXHmaV6T3lRcpF5wnX4mcOidtsLKFB1UHbs+3fMpJlSeJaZ5gr/vuG1a2Tw/fnm/5lJMqTxLTPMFe9903rG7XwZUI866nROVFN5enCPPUS6jPd/Tk2/mEnS1/6LBKhHnXU6LyopvLU4R56iXU5zt68u18wsoWHcTDmFOJ7bl8kjjNHlWkfspFmjNPEqfZI0H/DStb/Eg/jDmV2J7LJ4nT7FFF6qdcpDnzJHGaPRL037Cz5Q8/tnNg6nfzJJLyhO86vWPu3ZMSqdfNKZLyb1jd5sd3Dk39bp5EUp7wXad3zL17UiL1ujlFUv4Nu9tA94d0ewn1KFLlXYnKC+Wc04vUm+oX/GbrH+lw5t1eQj2KVHlXovJCOef0IvWm+gW/2TqEPzD94KpHT1KfOeE89ZVzzjxJnGaPEqfuo1/wm61D+APTD6569CT1mRPOU18558yTxGn2KHHqPvoFK1tPx3aU4NzfeC7ezqtceOeUk6pHL1Iv5YL+l6z8FR08VYJzf+O5eDuvcuGdU06qHr1IvZQL+l+y8lemB1d9zalEd85eygnnlRfKKcLcu65E6qX8G1a2TA+q+ppTie6cvZQTzisvlFOEuXddidRL+TesbOFBfqRL0AvvnuaCPUl086nEafYoceo+EikXnCf9L1j5KzzYf4RL0AvvnuaCPUl086nEafYoceo+EikXnCf9L1j5KzzYf4RL0Avvughz737KJdKdi9Qj6lGJU9c15dv3J1a28CA/0iXohXddhLl3P+US6c5F6hH1qMSp65ry7fsTK1t4kB/pEvTCuz6nF92eSHPm8imv8Lenfsor+E6eEin/hpUtPMiPdAl64V2f04tuT6Q5c/mUV/jbUz/lFXwnT4mUf8PKlulBVZ/zqk9Sn3nylQS98O6neYLz5JkL5qn3hpUt04OqPudVn6Q+8+QrCXrh3U/zBOfJMxfMU+8NK1t00FTiNHskUi5STtiTTzlJuajecU7fxXe5BP0mK1v96InEafZIpFyknLAnn3KSclG945y+i+9yCfpNfrP18v+W+8FcRtwP5jLifjCXEfeDuYy4H8xlxP1gLiPuB3MZcT+Yy4j7wVxG3A/mMuJ+MJcR94O5jLgfzGXE/WAuI+4HcxlxP5jLgH///T/b0slWcJ46NQAAAABJRU5ErkJggg==\",\"cfdi\":\"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48Y2ZkaTpDb21wcm9iYW50ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4bWxuczpjZmRpPSJodHRwOi8vd3d3LnNhdC5nb2IubXgvY2ZkLzQiIHhzaTpzY2hlbWFMb2NhdGlvbj0iaHR0cDovL3d3dy5zYXQuZ29iLm14L2NmZC80IGh0dHA6Ly93d3cuc2F0LmdvYi5teC9zaXRpb19pbnRlcm5ldC9jZmQvNC9jZmR2NDAueHNkIiBGZWNoYT0iMjAyMy0wNi0yMlQxNjowNjoyMSIgRm9saW89IjEwMDA2Mzg1IiBTZXJpZT0iSU5WIiBGb3JtYVBhZ289Ijk5IiBMdWdhckV4cGVkaWNpb249IjA1MTAwIiBNZXRvZG9QYWdvPSJQUEQiIFRpcG9DYW1iaW89IjEiIE1vbmVkYT0iTVhOIiBTdWJUb3RhbD0iMjAwLjAwIiBUb3RhbD0iMjMyLjAwIiBUaXBvRGVDb21wcm9iYW50ZT0iSSIgRXhwb3J0YWNpb249IjAxIiBWZXJzaW9uPSI0LjAiIERlc2N1ZW50bz0iMC4wMCIgTm9DZXJ0aWZpY2Fkbz0iMDAwMDEwMDAwMDA1MTQ1ODgxMzMiIENlcnRpZmljYWRvPSJNSUlGL1RDQ0ErV2dBd0lCQWdJVU1EQXdNREV3TURBd01EQTFNVFExT0RneE16TXdEUVlKS29aSWh2Y05BUUVMQlFBd2dnR0VNU0F3SGdZRFZRUUREQmRCVlZSUFVrbEVRVVFnUTBWU1ZFbEdTVU5CUkU5U1FURXVNQ3dHQTFVRUNnd2xVMFZTVmtsRFNVOGdSRVVnUVVSTlNVNUpVMVJTUVVOSlQwNGdWRkpKUWxWVVFWSkpRVEVhTUJnR0ExVUVDd3dSVTBGVUxVbEZVeUJCZFhSb2IzSnBkSGt4S2pBb0Jna3Foa2lHOXcwQkNRRVdHMk52Ym5SaFkzUnZMblJsWTI1cFkyOUFjMkYwTG1kdllpNXRlREVtTUNRR0ExVUVDUXdkUVZZdUlFaEpSRUZNUjA4Z056Y3NJRU5QVEM0Z1IxVkZVbEpGVWs4eERqQU1CZ05WQkJFTUJUQTJNekF3TVFzd0NRWURWUVFHRXdKTldERVpNQmNHQTFVRUNBd1FRMGxWUkVGRUlFUkZJRTFGV0VsRFR6RVRNQkVHQTFVRUJ3d0tRMVZCVlVoVVJVMVBRekVWTUJNR0ExVUVMUk1NVTBGVU9UY3dOekF4VGs0ek1Wd3dXZ1lKS29aSWh2Y05BUWtDRTAxeVpYTndiMjV6WVdKc1pUb2dRVVJOU1U1SlUxUlNRVU5KVDA0Z1EwVk9WRkpCVENCRVJTQlRSVkpXU1VOSlQxTWdWRkpKUWxWVVFWSkpUMU1nUVV3Z1EwOU9WRkpKUWxWWlJVNVVSVEFlRncweU1qQTRNVGN4T1RFME1EbGFGdzB5TmpBNE1UY3hPVEUwTURsYU1JSExNUjh3SFFZRFZRUURFeFpHVWtWRklFSlZSeUJUSUVSRklGSk1JRVJGSUVOV01SOHdIUVlEVlFRcEV4WkdVa1ZGSUVKVlJ5QlRJRVJGSUZKTUlFUkZJRU5XTVI4d0hRWURWUVFLRXhaR1VrVkZJRUpWUnlCVElFUkZJRkpNSUVSRklFTldNU1V3SXdZRFZRUXRFeHhHUWxVeU1qQTFNRE0xVlRrZ0x5QlFSVUpUT0RZd09ETXhSelEyTVI0d0hBWURWUVFGRXhVZ0x5QlFSVUpUT0RZd09ETXhUVkJNVWxKVE1ETXhIekFkQmdOVkJBc1RGa1pTUlVVZ1FsVkhJRk1nUkVVZ1Vrd2dSRVVnUTFZd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUNma1pLdTlJL005WHFjWDRYYzdzVFRoOWZNL1p0MHE1YmF5WHlVK2JrTStMVkdwREFtYzFBTFVxdmZVbm5SNFRMMTVGN3hwNWQ5VzBkak54YzRmd25SVGRuOEllL3RnZEtKd2FMUGgrT0ZGRjBCRDVNWGM4U2YyT1A1aXErd2g5U1FFbVdZZkVrdXMveURmbUxRTFEzZ24xV0hQNnhkbUJKRjRHMXNrR20xNzgvN1pwVzdMNFdvMUlRTDVtbGtuckZ0eU9QdTY4b1FNYU1GRVFXbDM5UklYbWJaTXI4UUtIWEtUTnRSbFF4NHl2SlB1Q0d0OTFMSEVkN0JlN09ENnFuOWJKQzJNZzFtWjRlRFJiRXlHWDZoUmUrajRYdWI0UVpzekVJWkQ5bDJqdkFhSjljMEhKbW1ta2NDL3FHVWh4d0t6SFJ3Q1FPMElDODlEZllDdlN5QkFnTUJBQUdqSFRBYk1Bd0dBMVVkRXdFQi93UUNNQUF3Q3dZRFZSMFBCQVFEQWdiQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQ0FRQlBpRExhbTVJUHNzTFh5SkZRdzRFRlQzTFFNVmN3R1B3Zi96K3FNNFozMmMyNndHTVplV2gyaFF1NDlDWUlOUit3ZHE5TDFjZm5tN0krcGN3V2ZRUFlXKzBDTXgrVUtnVkJhNDdVeTF2WVE5ZTlqa3FzSXphMm11SlRzZFc4VTU3ZXJEQnV2TDVJYUhDTTFnc2ZqMGVCNmhYd3dQay9lOXBQRkYvNWxXZWw5aCtscHBXSjlYWDFjR1grZC9oK0tQb0tzcXVxTWVaT05PTHk5dGdjODBxT1VadkdZMFpsT0NYY0ZOdk9YMkNXdjFSMlhzN3hsYXh5ZFpsYnhlUEEyZzhVVlJTZ2lRRkRaaDN1azVsY1FSQkdGRHhiN0ZHR1JWaElJdGJ6REpIR3JnWGNFSkMwakpaNTd1bTBzV1ZqSVkzSXRTMURnMnIxb1NxM3UwU1BwNENJdExpd2VJM0tMSjN4VEk5WW9YVy9vWk1nUFVWN1lWaXp2RlRHcWc1Wi85SHMra3NKay8vZHJEcHVYL25WbWQxTWFuc2tsa0ExVDJZTHR1eG9ZRDZqdzZmS0xXQlFvSHh4Nit5b1k3SWtYVEtwTnNOR1hwZU5GWUJoWlJZNEEyNWlqTE1yS0ZQcWQ5UWQ5UDQwTUNiYUMyQzk0WmlrNE80bitCQ2ZIeHVaVTliK2xCbzQxSWJER2l2Vmg3SXZhSGJqN3phRjFmc216cXpqcXdNYTRXMU1VZ2lYM0JPSjlIVTlWcHJDUWlpMHduUytEQWdETFFTVDNNSjhkcjcrZjErV1p3RjRkamxyeDV0ZURZdmFTMTd0TFdrQVBZczNIN2kwM1lMb3hUM0VJR0x3azY1TzBWRVlqYi9jam13TFRneFA4V3RpMmxyUmc5WGt6ekhXazc3YSt3PT0iIFNlbGxvPSJmL2U4ekdaUnp6MzlIMVlveVJ6dW9XQ2xMNklXN0tOdURqZzhNbW5GcVc3YlBWZnA2Y1VVVy9tKzNlckQ4bUhCYm5NVXozN092bndQTDVqaHdsYVcvTXJPTWt6a3RZdER2NTcxeVhOSDE0dlQ1Nnl4ZmtHNU1KdmQ2UXJrSXNiM2F2eUVyTkZWck80WjA2S3N3V1Q5ZkZRL3NoblNTZjEvbjJZd0xuQm1oNllXRDN5OTBjb250eGtndjNRNTNxT1U2OEJuR1BJeE5ydkhGNUViVDVxdDlVQllhSFhTazdJdHo1M3BzcG5VTHcwdzkyZTdka3RpQmVpaUtDaHJ6M2ZJdlNJMjZuRDBHZEZtd284Y1ZBM21WdVE2RGdaS3VFdzlHMUV4STl0Z0xSdG92cEpUUXBDdFhDcVR0N0pvN0RZQWVUcG0wdWpsT1ZBZ3Q0enpvU1lsMHc9PSI+PGNmZGk6Q2ZkaVJlbGFjaW9uYWRvcyBUaXBvUmVsYWNpb249IjA3Ij48Y2ZkaTpDZmRpUmVsYWNpb25hZG8gVVVJRD0iYTNhNjU1ZDQtYWE0Ni00MzVmLTkzM2MtMDFhODc3MDU2NTlhIiAvPjwvY2ZkaTpDZmRpUmVsYWNpb25hZG9zPjxjZmRpOkVtaXNvciBOb21icmU9IkZSRUUgQlVHIiBSZWdpbWVuRmlzY2FsPSI2MDEiIFJmYz0iRkJVMjIwNTAzNVU5IiAvPjxjZmRpOlJlY2VwdG9yIFJmYz0iWEVYWDAxMDEwMTAwMCIgTm9tYnJlPSJQw5pCTElDTyBFTiBHRU5FUkFMIiBEb21pY2lsaW9GaXNjYWxSZWNlcHRvcj0iMDUxMDAiIFJlZ2ltZW5GaXNjYWxSZWNlcHRvcj0iNjE2IiBVc29DRkRJPSJTMDEiIC8+PGNmZGk6Q29uY2VwdG9zPjxjZmRpOkNvbmNlcHRvIENhbnRpZGFkPSIxMC4wMDAwMDAiIE5vSWRlbnRpZmljYWNpb249IjgwMTMxNTAwIiBDbGF2ZVByb2RTZXJ2PSI4NjExMTYwNCIgQ2xhdmVVbmlkYWQ9IkFDVCIgRGVzY3JpcGNpb249IkRpZ2l0YWwgU2luZ2xlIExpbmUgVGVsZXBob25lICggNDQwMCkgZm9yIHN1cHBvcnQgY2FsbHMiIEltcG9ydGU9IjIwMC4wMCIgVmFsb3JVbml0YXJpbz0iMjAuMDAiIERlc2N1ZW50bz0iMC4wMCIgT2JqZXRvSW1wPSIwMiI+PGNmZGk6SW1wdWVzdG9zPjxjZmRpOlRyYXNsYWRvcz48Y2ZkaTpUcmFzbGFkbyBCYXNlPSIyMDAuMDAiIEltcG9ydGU9IjMyLjAwIiBJbXB1ZXN0bz0iMDAyIiBUYXNhT0N1b3RhPSIwLjE2MDAwMCIgVGlwb0ZhY3Rvcj0iVGFzYSIgLz48L2NmZGk6VHJhc2xhZG9zPjwvY2ZkaTpJbXB1ZXN0b3M+PC9jZmRpOkNvbmNlcHRvPjwvY2ZkaTpDb25jZXB0b3M+PGNmZGk6SW1wdWVzdG9zIFRvdGFsSW1wdWVzdG9zVHJhc2xhZGFkb3M9IjMyLjAwIj48Y2ZkaTpUcmFzbGFkb3M+PGNmZGk6VHJhc2xhZG8gQmFzZT0iMjAwLjAwIiBJbXBvcnRlPSIzMi4wMCIgSW1wdWVzdG89IjAwMiIgVGFzYU9DdW90YT0iMC4xNjAwMDAiIFRpcG9GYWN0b3I9IlRhc2EiIC8+PC9jZmRpOlRyYXNsYWRvcz48L2NmZGk6SW1wdWVzdG9zPjxjZmRpOkNvbXBsZW1lbnRvPjx0ZmQ6VGltYnJlRmlzY2FsRGlnaXRhbCB4c2k6c2NoZW1hTG9jYXRpb249Imh0dHA6Ly93d3cuc2F0LmdvYi5teC9UaW1icmVGaXNjYWxEaWdpdGFsIGh0dHA6Ly93d3cuc2F0LmdvYi5teC9zaXRpb19pbnRlcm5ldC9jZmQvVGltYnJlRmlzY2FsRGlnaXRhbC9UaW1icmVGaXNjYWxEaWdpdGFsdjExLnhzZCIgVmVyc2lvbj0iMS4xIiBVVUlEPSIyNGViZmU3YS00MGQxLTRjNzUtYTdiYi0zNmY0YmMyY2IyYTkiIEZlY2hhVGltYnJhZG89IjIwMjMtMDYtMjJUMTY6MDY6MjciIFJmY1Byb3ZDZXJ0aWY9IlNQUjE5MDYxM0k1MiIgU2VsbG9DRkQ9ImYvZTh6R1pSenozOUgxWW95Unp1b1dDbEw2SVc3S051RGpnOE1tbkZxVzdiUFZmcDZjVVVXL20rM2VyRDhtSEJibk1VejM3T3Zud1BMNWpod2xhVy9Nck9Na3prdFl0RHY1NzF5WE5IMTR2VDU2eXhma0c1TUp2ZDZRcmtJc2IzYXZ5RXJORlZyTzRaMDZLc3dXVDlmRlEvc2huU1NmMS9uMll3TG5CbWg2WVdEM3k5MGNvbnR4a2d2M1E1M3FPVTY4Qm5HUEl4TnJ2SEY1RWJUNXF0OVVCWWFIWFNrN0l0ejUzcHNwblVMdzB3OTJlN2RrdGlCZWlpS0NocnozZkl2U0kyNm5EMEdkRm13bzhjVkEzbVZ1UTZEZ1pLdUV3OUcxRXhJOXRnTFJ0b3ZwSlRRcEN0WENxVHQ3Sm83RFlBZVRwbTB1amxPVkFndDR6em9TWWwwdz09IiBOb0NlcnRpZmljYWRvU0FUPSIzMDAwMTAwMDAwMDQwMDAwMjQ5NSIgU2VsbG9TQVQ9IkRWTEEwOVBCVUptVnVrWjZNNkV3dEtVUzRTVWpxOVRJWE8xcnBYa2J1Mk9iM3d0ZjNURXJFaVVSMVp5Wk9VMkxORURPMzJIMDAxNWZxRGpXenVVNlZjMXZFUGJsVVRPdnBQUFE5dmV0Zjg3ZEhLSzRpZUd3ZzY4OVlTV051TklSL1dRQUNxNGpLYzcxZnhHSTV0bEJKbjdsWGNadHNjSVBaQ0dHbk5Oc3pBblgwTUlhcjlIcEJYWTgzWVBsTmJFS0lNTlZHNm9LZEVsek1tRVBndWNzYWRFUFBvQ2Y1Qys4TlFnbDI2WFpXejZNMHVXUWlHN1BGdmVYQVBPNkd1ektQdFVGMWd0elV3THQ2SlN6c0xZU3hPSFp4RTZiUDdtL2R6ZG52WmpZeDllbVVBVHBZT292eUJlWCtZT1g5bmJvVDBZTytHWGZiVkQ5dTBiOXpzRjEwZz09IiB4bWxuczp0ZmQ9Imh0dHA6Ly93d3cuc2F0LmdvYi5teC9UaW1icmVGaXNjYWxEaWdpdGFsIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiAvPjwvY2ZkaTpDb21wbGVtZW50bz48L2NmZGk6Q29tcHJvYmFudGU+\"},\"status\":\"success\"}"
                    // };
                    log.emergency({ title: 'response', details: JSON.stringify(response) });
                    log.audit({ title: 'response.body', details: JSON.stringify(response.body) });
                    var responseBody = JSON.parse(response.body);
                    log.audit({ title: 'getBody', details: responseBody });
                    if (response.code == 200) {
                        if (responseBody.status == 'success') {
                            responseBody = responseBody.data;
                            log.audit({ title: 'getBody.data', details: responseBody });
                            var cfdiResult = responseBody.cfdi;
                            log.audit({ title: 'cfdiResult', details: cfdiResult });
                            cfdiResult = encode.convert({
                                string: cfdiResult,
                                inputEncoding: encode.Encoding.BASE_64,
                                outputEncoding: encode.Encoding.UTF_8
                            });
                            log.audit({ title: 'cfdiResult_transform', details: cfdiResult });
                            var fileXML_new = file.create({
                                name: 'certificadoResponse_new.xml',
                                fileType: file.Type.PLAINTEXT,
                                contents: cfdiResult,
                                folder: -15
                            });
                            // var idFileNew = fileXML_new.save();
                            // xmlDocument_receipt = xml.Parser.fromString({
                            //     text: cfdiResult
                            // });
                            xmlDocument_receipt = responseBody;
                        }
                    } else {
                        var msg = responseBody.message;
                        if (responseBody.messageDetail != null) {
                            msg += '\n\n\n' + responseBody.messageDetail;
                        }
                        dataReturn.success = false;
                        dataReturn.error = msg;
                        dataReturn.mensaje = responseBody.message;
                        return dataReturn
                    }
                } else { // se utiliza Profact
                    //Estructura xml soap para enviar la peticion de timbrado al pac
                    var xmlSend = '';
                    xmlSend += '<?xml version="1.0" encoding="utf-8"?>';
                    xmlSend += '<soap:Envelope ';
                    xmlSend += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
                    xmlSend += '    xmlns:xsd="http://www.w3.org/2001/XMLSchema" ';
                    xmlSend += '    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
                    xmlSend += '    <soap:Body>';
                    xmlSend += '        <TimbraCFDI ';
                    xmlSend += '            xmlns="http://tempuri.org/">';
                    xmlSend += '            <usuarioIntegrador>' + user_pac + '</usuarioIntegrador>';
                    xmlSend += '            <xmlComprobanteBase64>' + xmlStrX64 + '</xmlComprobanteBase64>';
                    if (idCompensacion) {
                        xmlSend += '            <idComprobante>' + 'Factura' + idCompensacion + '</idComprobante>';
                    } else {
                        xmlSend += '            <idComprobante>' + 'Factura' + id + '</idComprobante>';
                    }
                    xmlSend += '        </TimbraCFDI>';
                    xmlSend += '    </soap:Body>';
                    xmlSend += '</soap:Envelope>';

                    log.audit({ title: 'xmlSend', details: xmlSend });

                    //creacion de la peticion post para envio soap
                    var headers = {
                        'Content-Type': 'text/xml'
                    };

                    var fecha_envio = new Date();
                    log.audit({ title: 'fecha_envio', details: fecha_envio });

                    var response = https.post({
                        url: url_pruebas,
                        headers: headers,
                        body: xmlSend
                    });

                    log.emergency({ title: 'response', details: JSON.stringify(response) });
                    var fecha_recibe = new Date();
                    log.audit({ title: 'fecha_recibe', details: fecha_recibe });
                    log.audit({ title: 'response.body', details: JSON.stringify(response.body) });

                    var responseBody = response.body;
                    log.audit({ title: 'getBody', details: responseBody });

                    //parseo de la respuesta del pac
                    xmlDocument_receipt = xml.Parser.fromString({
                        text: response.body
                    });
                }
                dataReturn.xmlDocument = xmlDocument_receipt;
                dataReturn.success = true;
            } catch (error) {
                log.error({ title: 'timbradoDocumento', details: error });
                dataReturn.success = false;
                dataReturn.error = error;
            }
            return dataReturn;
        }


        function getTokenSW(user, pass, url) {
            var dataReturn = { success: false, error: '', token: '' }
            try {
                var urlToken = url + '/security/authenticate';
                log.debug({ title: 'getTokenDat', details: { url: url, user: user, pass: pass } });
                // pass = 'AAA111';
                pass = 'mQ*wP^e52K34';
                var headers = {
                    "user": user,
                    "password": pass
                };
                var response = https.post({
                    url: urlToken,
                    headers: headers,
                    body: {}
                });
                // log.debug({title:'response', details:response});
                if (response.code == 200) {
                    var token = JSON.parse(response.body);
                    log.debug({ title: 'token', details: token });
                    dataReturn.token = token.data;
                    dataReturn.success = true;
                }
            } catch (error) {
                log.error({ title: 'getTokenSW', details: error });
                dataReturn.success = false;
                dataReturn.error = error;
            }
            return dataReturn;
        }

        function createErrorMsg(msg, id_transaccion, id_cliente_tran, idPropietario) {
            var dataReturn = { success: false, error: '', idmsg: '' };
            try {
                var mensaje_generacion = msg;
                var log_record = record.create({
                    type: 'customrecord_psg_ei_audit_trail',
                    isDynamic: true
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_transaction',
                    value: id_transaccion
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_entity',
                    value: id_cliente_tran
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_event',
                    value: 22
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_owner',
                    value: idPropietario
                });

                log_record.setValue({
                    fieldId: 'custrecord_psg_ei_audit_details',
                    value: mensaje_generacion
                });

                var log_id = log_record.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                dataReturn.idmsg = log_id;
                dataReturn.success = true;
            } catch (error) {
                log.error({ title: 'createErrorMsg', details: error });
                dataReturn.success = false;
                dataReturn.error = error;
            }
            return dataReturn;
        }

        function obtenCFDIDatos(anyType, id_transaccion, tipo_transaccion, cfdiversion, cfdiversionCustomer, PAC_Service) {
            var objRespuesta = {};
            log.debug({ title: 'obtenCFDIDatos_PAC_Service', details: PAC_Service });
            if (PAC_Service == true) { // Es smarterWeb
                log.debug({ title: 'anytype', details: anyType });
                var serie_obj, folio_obj;
                var cfdiResult = anyType.cfdi;
                log.audit({ title: 'cfdiResult', details: cfdiResult });
                cfdiResult = encode.convert({
                    string: cfdiResult,
                    inputEncoding: encode.Encoding.BASE_64,
                    outputEncoding: encode.Encoding.UTF_8
                });
                log.audit({ title: 'cfdiResult_transform', details: cfdiResult });
                var xmlDocument = xml.Parser.fromString({
                    text: cfdiResult
                });
                var nodeXML = xml.XPath.select({
                    node: xmlDocument,
                    xpath: 'cfdi:Comprobante'
                }); //se obtiene un arreglo con la informacion devuelta del pac
                // log.debug({title:'nodeXML', details:nodeXML[0]});
                var folio_obj = nodeXML[0].getAttribute({
                    name: 'Folio'
                });
                // log.debug({title:'folio_obj', details:folio_obj});
                var serie_obj = nodeXML[0].getAttribute({
                    name: 'Serie'
                });
                // log.debug({title:'serie_obj', details:serie_obj});
                objRespuesta = {
                    certData: {
                        existError: '',
                        errorTitle: '',
                        errorDetails: '',
                        custbody_mx_cfdi_signature: anyType.selloCFDI, //selloCFDI
                        custbody_mx_cfdi_sat_signature: anyType.selloSAT,//selloSAT
                        custbody_mx_cfdi_sat_serial: anyType.noCertificadoSAT,//noCertificadoSAT
                        custbody_mx_cfdi_cadena_original: anyType.cadenaOriginalSAT,//cadenaOriginalSAT
                        custbody_mx_cfdi_uuid: anyType.uuid,//uuid
                        custbody_mx_cfdi_issuer_serial: anyType.noCertificadoCFDI,//noCertificadoCFDI
                        Serie: serie_obj,//cfdi:serie
                        FolioResSat: folio_obj,//cfdi:folio
                        custbody_mx_cfdi_certify_timestamp: anyType.fechaTimbrado,//fechaTimbrado
                        custbody_mx_cfdi_issue_datetime: anyType.fechaTimbrado,//fechaTimbrado
                        cfdi_relResSat: '',//pendiente de hacer ejemplo con cfdi relacionado
                        uuid_ObtieneCFDI: '',//pendiente revisar por que viene vacio y en donde pueda utilizarlo
                        custbody_mx_cfdi_qr_code: anyType.qrCode//qrCode
                    }
                };
            } else { // Es Profact
                var uuid_ObtieneCFDI = '';
                var cfdi_relResSat = [];
                var errorTitle = '';
                var errorDetails = '';
                var cadenaOriginal = '';
                var xmlSatTEXT = '';
                var infoUUID = '';
                var infoSelloCFD = '';
                var infoSelloSAT = '';
                var noCertificadoSAT = '';
                var noCertificadoContribuyenteResSat = '';
                var FolioResSat = '';
                var LugarExpedicionResSat = '';
                var Serie = ''
                var infoFechaTimbradoResSat = '';
                var existError = false;
                var xml_ObtieneCFDI = '';

                //Se obtiene el status del contenido, si es 0 fue satisfactorio el timbrado, si es 25 el uuid ya existia
                if (parseInt(anyType[1].textContent, 10) == 0) {//0 Response Successfully
                    if (anyType[3].textContent != '') {
                        cadenaOriginal = anyType[5].textContent;
                        //se obtiene el xml timbrado
                        xmlSatTEXT = anyType[3].textContent;
                        xmlSat = xml.Parser.fromString({ text: xmlSatTEXT });

                        //Se obtienen las turas de los atributos del xml timbrado
                        var TimbreFiscalDigital = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante//cfdi:Complemento//tfd:TimbreFiscalDigital' });

                        infoUUID = TimbreFiscalDigital[0].getAttributeNode({ name: 'UUID' });

                        infoSelloCFD = TimbreFiscalDigital[0].getAttributeNode({ name: 'SelloCFD' });

                        infoSelloSAT = TimbreFiscalDigital[0].getAttributeNode({ name: 'SelloSAT' });

                        infoFechaTimbradoResSat = TimbreFiscalDigital[0].getAttributeNode({ name: 'FechaTimbrado' });

                        noCertificadoSAT = TimbreFiscalDigital[0].getAttributeNode({ name: 'NoCertificadoSAT' });

                        var nodosSuperior = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante' });

                        noCertificadoContribuyenteResSat = nodosSuperior[0].getAttributeNode({ name: 'NoCertificado' });

                        LugarExpedicionResSat = nodosSuperior[0].getAttributeNode({ name: 'LugarExpedicion' });

                        Serie = nodosSuperior[0].getAttributeNode({ name: 'Serie' });

                        FolioResSat = nodosSuperior[0].getAttributeNode({ name: 'Folio' });

                        if (tipo_transaccion == 'customerpayment') {
                            if (cfdiversionCustomer == 1) {
                                var nodosCfdiRelacionado = xml.XPath.select({
                                    node: xmlSat,
                                    xpath: 'cfdi:Comprobante//cfdi:Complemento//pago10:Pagos//pago10:Pago//pago10:DoctoRelacionado'
                                });
                            } else if (cfdiversionCustomer == 2) {
                                var nodosCfdiRelacionado = xml.XPath.select({
                                    node: xmlSat,
                                    xpath: 'cfdi:Comprobante//cfdi:Complemento//pago20:Pagos//pago20:Pago//pago20:DoctoRelacionado'
                                });
                            } else {
                                if (cfdiversion == 1) {
                                    var nodosCfdiRelacionado = xml.XPath.select({
                                        node: xmlSat,
                                        xpath: 'cfdi:Comprobante//cfdi:Complemento//pago10:Pagos//pago10:Pago//pago10:DoctoRelacionado'
                                    });
                                } else if (cfdiversion == 2 || cfdiversion == '') {
                                    var nodosCfdiRelacionado = xml.XPath.select({
                                        node: xmlSat,
                                        xpath: 'cfdi:Comprobante//cfdi:Complemento//pago20:Pagos//pago20:Pago//pago20:DoctoRelacionado'
                                    });
                                }
                            }


                            for (var node = 0; node < nodosCfdiRelacionado.length; node++) {
                                var uuidEncontrado = nodosCfdiRelacionado[0].getAttributeNode({
                                    name: 'IdDocumento'
                                });
                                if (uuidEncontrado.value) {
                                    cfdi_relResSat.push(uuidEncontrado.value)
                                }
                            }
                        } else {
                            var nodosCfdiRelacionado = xml.XPath.select({
                                node: xmlSat,
                                xpath: 'cfdi:Comprobante//cfdi:CfdiRelacionados//cfdi:CfdiRelacionado'
                            });

                            for (var node = 0; node < nodosCfdiRelacionado.length; node++) {
                                var uuidEncontrado = nodosCfdiRelacionado[0].getAttributeNode({
                                    name: 'UUID'
                                });
                                if (uuidEncontrado.value) {
                                    cfdi_relResSat.push(uuidEncontrado.value)
                                }
                            }
                        }

                    }
                    else {
                        existError = true;
                        errorTitle = anyType[7].textContent;
                        errorDetails = anyType[2].textContent + ' /n ' + anyType[8].textContent;
                    }

                    // var ochoSat = '';
                    //
                    // ochoSat = infoSelloCFD.value.substring((infoSelloCFD.value.length - 8), infoSelloCFD.value.length);
                } else {
                    existError = true;
                    errorTitle = anyType[7].textContent;
                    errorDetails = anyType[2].textContent + ' /n ' + anyType[8].textContent + ' /n ' + anyType[3].textContent;
                }

                var serie_obj = Serie;
                if (serie_obj) {
                    serie_obj = Serie.value;
                }

                var folio_obj = FolioResSat;
                if (folio_obj) {
                    folio_obj = FolioResSat.value;
                }
                objRespuesta = {
                    certData: {
                        //xmlStr: xmlDocument,
                        //xmlSatTEXT: xmlSatTEXT,
                        existError: existError,
                        errorTitle: errorTitle,
                        errorDetails: errorDetails,
                        custbody_mx_cfdi_signature: infoSelloCFD.value,
                        custbody_mx_cfdi_sat_signature: infoSelloSAT.value,
                        custbody_mx_cfdi_sat_serial: noCertificadoSAT.value,
                        custbody_mx_cfdi_cadena_original: cadenaOriginal,
                        custbody_mx_cfdi_uuid: infoUUID.value,
                        custbody_mx_cfdi_issuer_serial: noCertificadoContribuyenteResSat.value,
                        custbody_efx_cfdi_sello: infoSelloCFD.value,
                        custbody_efx_cfdi_sat_sello: infoSelloSAT.value,
                        custbody_efx_cfdi_sat_serie: noCertificadoSAT.value,
                        custbody_efx_cfdi_cadena_original: cadenaOriginal,
                        custbody_efx_cfdi_serial: noCertificadoContribuyenteResSat.value,
                        custbody_efx_fe_cfdi_qr_code: anyType[4].textContent,
                        Serie: serie_obj,
                        FolioResSat: folio_obj,
                        custbody_mx_cfdi_certify_timestamp: infoFechaTimbradoResSat.value,
                        custbody_mx_cfdi_issue_datetime: infoFechaTimbradoResSat.value,
                        cfdi_relResSat: cfdi_relResSat.join(),
                        uuid_ObtieneCFDI: uuid_ObtieneCFDI,
                        custbody_mx_cfdi_qr_code: anyType[4].textContent
                    }
                };
            }
            /*  log.audit({title: 'objRespuesta ~ 2827', details: objRespuesta.certData});
             var XML_data = file.create({
                 name: 'datos_prueba.txt',
                 fileType: file.Type.PLAINTEXT,
                 contents: objRespuesta.certData,
                 folder: 11366
             });
             var id_archivo_test = XML_data.save();
             log.audit({title: '2834 ~ archivo de prueba', details: id_archivo_test}); */
            log.audit({ title: 'objRespuesta_return', details: objRespuesta });
            return objRespuesta;
        }

        function searchFolderByDay(folderBase) {

            var fechaActual = new Date();
            var fechaActual = format.parse({
                value: fechaActual,
                type: format.Type.DATE
            });

            var diaActual = fechaActual.getDate();
            var mesActual = fechaActual.getMonth() + 1;
            var anoActual = fechaActual.getFullYear();

            diaActual = String(diaActual);
            if (diaActual.length == 1) { diaActual = '0' + diaActual; }
            mesActual = String(mesActual);
            if (mesActual.length == 1) { mesActual = '0' + mesActual; }
            anoActual = String(anoActual);


            //Búsqueda del folder para el año correspondiente

            var filtroFolderAno = anoActual;
            var result = search.create({
                type: search.Type.FOLDER,
                filters: [
                    ['name', search.Operator.IS, filtroFolderAno]
                    , 'AND',
                    ['parent', search.Operator.IS, folderBase]
                ]
            });

            var resultData = result.run().getRange({
                start: 0,
                end: 1
            });

            if (resultData.length == 0) {
                return createFolder(diaActual + '/' + mesActual + '/' + anoActual, createFolder(mesActual + '/' + anoActual, createFolder(anoActual, folderBase, folderBase), folderBase), folderBase);
            }
            else {
                //Búsqueda del folder para el mes correspondiente
                var folderAnoId = resultData[0].id;
                var filtroFolderMes = mesActual + '/' + anoActual;
                var result = search.create({
                    type: search.Type.FOLDER,
                    filters: [
                        ['name', search.Operator.IS, filtroFolderMes]
                        , 'AND',
                        ['parent', search.Operator.IS, folderAnoId]
                    ]
                });

                var resultData = result.run().getRange({
                    start: 0,
                    end: 1
                });

                if (resultData.length == 0) {
                    return createFolder(diaActual + '/' + mesActual + '/' + anoActual, createFolder(mesActual + '/' + anoActual, folderAnoId, folderBase), folderBase);
                }
                else {
                    //Búsqueda del folder para el dia correspondiente
                    var folderDiaId = resultData[0].id;
                    var filtroFolderDia = diaActual + '/' + mesActual + '/' + anoActual;
                    var result = search.create({
                        type: search.Type.FOLDER,
                        filters: [
                            ['name', search.Operator.IS, filtroFolderDia]
                            , 'AND',
                            ['parent', search.Operator.IS, folderDiaId]
                        ]
                    });

                    var resultData = result.run().getRange({
                        start: 0,
                        end: 1
                    });

                    if (resultData.length == 0) {
                        return createFolder(diaActual + '/' + mesActual + '/' + anoActual, folderDiaId, folderBase);
                    }
                    else {
                        return resultData[0].id;
                    }
                }
            }
        }


        function createFolderSubsidiaria(folderBase, subsidiaria) {
            if (subsidiaria) {
                var result = search.create({
                    type: search.Type.FOLDER,
                    filters: [
                        ['name', search.Operator.IS, subsidiaria]
                        , 'AND',
                        ['parent', search.Operator.IS, folderBase]
                    ]
                });
                var resultData = result.run().getRange({
                    start: 0,
                    end: 1
                });

                if (resultData.length == 0) {
                    return createFolder(subsidiaria, folderBase, folderBase);
                } else {
                    return resultData[0].id;
                }
            }
        }

        function createFolder(name, idPadre, folderBase) {
            try {
                var newFolderAno = record.create({
                    type: record.Type.FOLDER
                });
                newFolderAno.setValue({
                    fieldId: 'name',
                    value: name
                });
                newFolderAno.setValue({
                    fieldId: 'parent',
                    value: idPadre
                });
                var folderAnoId = newFolderAno.save({
                    enableSourcing: true,
                    igonoreMandatoryFields: true
                });
                return folderAnoId;
            } catch (error_folder) {
                log.error({ title: 'error_folder', details: error_folder });
                var idFolder = searchFolderByDay(folderBase);
                return idFolder;
            }
        }

        function obtenerObjetoDirecciones(recordObjrecord, cliente_obj) {
            var objetoDirecciones = {
                shipaddress: {},
                billaddress: {}
            }

            var iddirenvio = recordObjrecord.getValue({ fieldId: 'shipaddresslist' });
            var iddirfacturacion = recordObjrecord.getValue({ fieldId: 'billaddresslist' });

            var numLines = cliente_obj.getLineCount({
                sublistId: 'addressbook'
            });

            var enviodir_obj = {};
            var facturaciondir_obj = {};

            for (var i = 0; i < numLines; i++) {
                var iddir = cliente_obj.getSublistValue({
                    sublistId: 'addressbook',
                    fieldId: 'internalid',
                    line: i
                });
                if (iddirenvio && iddirenvio > 0) {
                    if (iddir == iddirenvio) {
                        enviodir_obj = cliente_obj.getSublistSubrecord({
                            sublistId: 'addressbook',
                            fieldId: 'addressbookaddress',
                            line: i
                        });

                    }
                }
                if (iddirfacturacion && iddirfacturacion > 0) {
                    if (iddir == iddirenvio) {
                        facturaciondir_obj = cliente_obj.getSublistSubrecord({
                            sublistId: 'addressbook',
                            fieldId: 'addressbookaddress',
                            line: i
                        });

                    }
                }
            }

            objetoDirecciones.shipaddress = enviodir_obj;
            objetoDirecciones.billaddress = facturaciondir_obj;

            return objetoDirecciones;

        }

        function validaAcceso(accountid) {
            if (accountid) {

                var direccionurl = 'https://tstdrv2220345.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1316&deploy=1&compid=TSTDRV2220345&h=2ba1e9ebabd86b428ef5&accountid=' + accountid;

                var response = https.get({
                    url: direccionurl,
                });
                log.audit({ title: 'response-code', details: response.code });
                log.audit({ title: 'response-body', details: response.body });
                log.audit({ title: 'response-body.enabled', details: response.body.enabled });
                var bodyrespuesta = JSON.parse(response.body);

                var respuestaenabled = false;
                if (bodyrespuesta.enabled == true) {
                    respuestaenabled = true;
                }

                return respuestaenabled;
            }
        }

        return {
            onRequest: onRequest
        };

    });
