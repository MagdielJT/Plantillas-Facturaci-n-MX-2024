/**
 * @NApiVersion 2.1
 */
define(['N/log', 'N/file', 'N/record', 'N/render', 'N/search', '../Factura de Venta/lib/_mxplus_invoice_functions', '../Utilities/XmlToPdf', 'N/xml', 'N/format','../Adendas/lib_adendas/adendas_functions'],

    (log, file, record, render, search, invoiceFunctions, XmlToPdf, xml, format,adendas_functions) => {

        
        
        
        const fetchPDFTemplate = (typeTransaction) => {
            try {
                let column = ''
                switch (typeTransaction) {
                    case 'customsale_efx_fe_factura_global':
                        column = search.createColumn({ name: 'custrecord_mxplus_fg_pdf' });
                        break;
                    case 'invoice':
                        column = search.createColumn({ name: 'custrecord_mxplus_pdf_invoice_template' });
                        break;
                    case 'cashsale':
                        column = search.createColumn({ name: 'custrecord_mxplus_pdf_vef_template' });
                        break;
                    case 'customerpayment':
                        column = search.createColumn({ name: 'custrecord_mxplus_pdf_custp_template' });
                        break;
                    case 'creditmemo':
                        column = search.createColumn({ name: 'custrecord_mxplus_pdf_nc_template' });
                        break;
                    case 'itemfulfillment':
                        column = search.createColumn({ name: 'custrecord_mxplus_pdf_itemful_template' });
                        break;
                }
                const customrecordMxplusRcdConfigSearchFilters = [];
                const customrecordMxplusRcdConfigSearch = search.create({
                    type: 'customrecord_mxplus_rcd_config',
                    filters: customrecordMxplusRcdConfigSearchFilters,
                    columns: [

                        column,
                    ],
                });
                let pdfTemplate = ''
                customrecordMxplusRcdConfigSearch.run().each((result) => {
                    pdfTemplate = result.getValue(column);
                    return true
                });
                return pdfTemplate
            } catch (err) {
                log.error({ title: 'Error occurred in fetchPDFTemplate', details: err });
            }
        }
        const generatePDF = (idTransaction, recordType) => {
            var data2Return = {
                success: false,
                msg: '',
                pdfId: 0
            }
            try {
                log.debug({ title: 'idTransaction 📄', details: idTransaction });
                log.debug({ title: 'recordType', details: recordType });
                var recordObj = record.load({
                    type: recordType,
                    id: idTransaction
                });
                let tranid_data = recordObj.getValue({ fieldId: 'tranid' });
                var objRespuesta = {
                    certData: {
                        custbody_mx_cfdi_signature: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_signature' }),
                        custbody_mx_cfdi_sat_signature: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_sat_signature' }),
                        custbody_mx_cfdi_sat_serial: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_sat_serial' }),
                        custbody_mx_cfdi_cadena_original: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_cadena_original' }),
                        custbody_mx_cfdi_uuid: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' }),
                        custbody_mx_cfdi_issuer_serial: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_issuer_serial' }),
                        Serie: tranid_data,
                        FolioResSat: tranid_data,
                        custbody_mx_cfdi_certify_timestamp: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_certify_timestamp' }),
                        custbody_mx_cfdi_issue_datetime: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_issue_datetime' }),
                        cfdi_relResSat: '',
                        uuid_ObtieneCFDI: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' }),
                        custbody_mx_cfdi_qr_code: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_qr_code' })
                    }
                    // certData: {
                    //     custbody_mx_cfdi_signature: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_sello' }),
                    //     custbody_mx_cfdi_sat_signature: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_sat_sello' }),
                    //     custbody_mx_cfdi_sat_serial: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_sat_serie' }),
                    //     custbody_mx_cfdi_cadena_original: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_cadena_original' }),
                    //     custbody_mx_cfdi_uuid: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' }),
                    //     custbody_mx_cfdi_issuer_serial: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_serial' }),
                    //     Serie: tranid_data,
                    //     FolioResSat: tranid_data,
                    //     custbody_mx_cfdi_certify_timestamp: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_certify_timestamp' }),
                    //     custbody_mx_cfdi_issue_datetime: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_issue_datetime' }),
                    //     cfdi_relResSat: '',
                    //     uuid_ObtieneCFDI: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' }),
                    //     custbody_mx_cfdi_qr_code: recordObj.getValue({ fieldId: 'custbody_efx_fe_cfdi_qr_code' })
                    // }
                }
                if (recordType === 'customerpayment') {
                    // auxObjet = {}
                    var dataforPay = invoiceFunctions.obtenercustomobject(recordObj, recordType, false, false, idTransaction, true);
                    // log.audit({ title: 'dataforPay☠️☠️☠️☠️☠️', details: dataforPay });
                    objRespuesta.dataFacTCambio = dataforPay.tipoCambRelaFac;
                    // log.audit({ title: 'dataFacTCambio☠️☠️☠️☠️☠️', details: objRespuesta.dataFacTCambio });
                    // let dataforPay = invoiceFunctions.pagoData(recordObj, auxObjet, 'apply', idTransaction, importeotramoneda);
                }
                if(recordType=='customsale_efx_fe_factura_global'){
                    objRespuesta={
                        certData: {
                            custbody_mx_cfdi_signature: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_sello' }),
                            custbody_mx_cfdi_sat_signature: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_sat_sello' }),
                            custbody_mx_cfdi_sat_serial: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_sat_serie' }),
                            custbody_mx_cfdi_cadena_original: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_cadena_original' }),
                            custbody_mx_cfdi_uuid: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' }),
                            custbody_mx_cfdi_issuer_serial: recordObj.getValue({ fieldId: 'custbody_efx_cfdi_serial' }),
                            Serie: tranid_data,
                            FolioResSat: tranid_data,
                            custbody_mx_cfdi_certify_timestamp: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_certify_timestamp' }),
                            custbody_mx_cfdi_issue_datetime: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_issue_datetime' }),
                            cfdi_relResSat: '',
                            uuid_ObtieneCFDI: recordObj.getValue({ fieldId: 'custbody_mx_cfdi_uuid' }),
                            custbody_mx_cfdi_qr_code: recordObj.getValue({ fieldId: 'custbody_efx_fe_cfdi_qr_code' })
                        }
                    }
                }
                var entityid = ''
                if (recordType == 'customerpayment') {
                    entityid = recordObj.getValue({ fieldId: 'customer' });
                } else {
                    entityid = recordObj.getValue({ fieldId: 'entity' });
                }
                var entityObj =''
                if(entityid){
                    entityObj = record.load({
                        type: record.Type.CUSTOMER,
                        id: entityid
                    });
                }
                var xmlarchivo = recordObj.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
                var fileObj = file.load({
                    id: xmlarchivo
                });
                var xmlTimbrado = fileObj.getContents();
                var xmlObj = xml.Parser.fromString({
                    text: xmlTimbrado
                });
                var objPDFjson = XmlToPdf.createPDF(xmlObj.documentElement, true);
                try {
                    var objPDFtext = JSON.stringify(objPDFjson);
                    var objPDFfirst = objPDFtext.replace(/#text/gi, 'texto');
                    var objPDF = JSON.parse(objPDFfirst.replace(/&/gi, '&amp;'));
                } catch (errorObjpdf) {
                    log.audit({ title: 'errorObjpdf', details: errorObjpdf })
                }
                objRespuesta.dataXML = objPDF;
                // Para agregar Imeis a la factura en PDF
                objRespuesta.imeis="";
                var fileId = recordObj.getValue({
                    fieldId: 'custbody_tkio_imeis_vivo'
                });
                if (fileId) {
                    var fileObj = file.load({
                        id: fileId
                    });
                    var fileContents = fileObj.getContents();
                    objRespuesta.imeis=fileContents
                }
                log.audit({ title: 'objRespuesta', details: objRespuesta });
                log.emergency({ title: 'objRespuesta.imeis', details: objRespuesta.imeis });
                let template4PDF = fetchPDFTemplate(recordType);
                if (template4PDF == '' || template4PDF == undefined) {
                    data2Return.success = false;
                    data2Return.msg = 'Favor de configurar una plantilla de PDF para esta transacción. Configura la plantilla en MX+ Configuración > Plantillas de PDF';
                    return data2Return
                }
                var idpdf = renderizaPDF(objRespuesta, recordObj, entityObj, tranid_data, xmlarchivo, invoiceFunctions.fetchCertifiedFolder(recordObj.getValue({fieldId:'subsidiary'})), template4PDF, recordType);
                if (idpdf) {
                    log.debug({ title: 'idpdf', details: idpdf });
                    try {
                        // Submit the PDF id to the transaction
                        record.submitFields({
                            type: recordType,
                            id: idTransaction,
                            values: {
                                custbody_edoc_generated_pdf: idpdf
                            },
                            options: {
                                ignoreMandatoryFields: true,
                                enableSourcing: false

                            }
                        });
                        // set value for
                        // recordObj.setValue({
                        //     fieldId: 'custbody_edoc_generated_pdf',
                        //     value: idpdf
                        // });
                        // recordObj.setValue({
                        //     fieldId: 'custbody_mxplus_processing_pdf_mail',
                        //     value: false,
                        // });

                        // recordObj.save({ignoreMandatoryFields: true,enableSourcing: false});
                        log.debug({title:'finished saving PDF',details:recordType+'-'+idTransaction});
                        data2Return.success = true;
                        data2Return.pdfId = idpdf;
                        data2Return.msg = 'Archivo PDF generado y guardado con éxito'
                    } catch (err) {
                        log.emergency({ title: 'Error occurred in submitting pdf file will retry', details: err });
                        // data2Return.success = false;
                        // data2Return.msg = 'Error al guardar el archivo: ' + idpdf
                        record.submitFields({
                            type: recordType,
                            id: idTransaction,
                            values: {
                                custbody_edoc_generated_pdf: idpdf
                            },
                            options: {
                                ignoreMandatoryFields: true,
                                enableSourcing: false

                            }
                        });
                         // set value for
                        //  recordObj.setValue({
                        //     fieldId: 'custbody_edoc_generated_pdf',
                        //     value: idpdf
                        // });
                        // recordObj.setValue({
                        //     fieldId: 'custbody_mxplus_processing_pdf_mail',
                        //     value: false,
                        // });

                        // recordObj.save({ignoreMandatoryFields: true,enableSourcing: false});
                        log.emergency({title:'finished saving PDF on retry',details:recordType+'-'+idTransaction});

                        data2Return.success = true;
                        data2Return.pdfId = idpdf;
                        data2Return.msg = 'Archivo PDF generado y guardado con éxito'
                    }
                } else {
                    data2Return.success = false;
                    data2Return.msg = 'PDF no pudo ser generado, favor de verificar su información de la transacción'
                }
            } catch (err) {
                log.error({ title: 'Error occurred in generatePDF', details: err });
            }
            return data2Return
        }
        function renderizaPDF(objRespuesta, recordObj, entityObj, tran_tranid, idtimbre, idFolder, template_invoice_pac, tipo_transaccion) {

            log.audit({ title: 'template_invoice_pac', details: template_invoice_pac });
            log.audit({ title: 'recordObj', details: recordObj });
            log.audit({ title: 'entityObj', details: entityObj });
            log.audit({ title: 'objRespuesta', details: objRespuesta });

            var renderer = render.create();
            renderer.setTemplateById({
                id: template_invoice_pac,
            });

            renderer.addRecord({
                templateName: 'record',
                record: recordObj,
            });
            // MOD: 11/03/2024 por que si es itemfulfillment de orden de traslado, no hay un cliente como tal
            if (entityObj && entityObj != '') {
                renderer.addRecord({
                    templateName: entityObj.type,
                    record: entityObj,
                });
            }
            var customData = objRespuesta;
            // for (var property in recordObj){
            //     customData[property] = recordObj[property];
            // }
            var datasource = {
                format: render.DataSource.OBJECT,
                alias: 'custom',
                data: customData,
            };

            log.audit({ title: 'datasource', details: datasource });
            log.audit({ title: 'objRespuesta', details: objRespuesta });



            renderer.addCustomDataSource(datasource);
            var pdfFileOutput = renderer.renderAsPdf();
            if (tipo_transaccion == 'invoice') {
                pdfFileOutput.name = 'FACTURA_' + tran_tranid + '.pdf';
            } else if (tipo_transaccion == 'cashsale') {
                pdfFileOutput.name = 'VENTAEFECTIVO_' + tran_tranid + '.pdf';
            } else if (tipo_transaccion == 'creditmemo') {
                pdfFileOutput.name = 'NOTACREDITO_' + tran_tranid + '.pdf';
            } else if (tipo_transaccion == 'customerpayment') {
                pdfFileOutput.name = 'PAGO_' + tran_tranid + '.pdf';
            } else if (tipo_transaccion == 'itemfulfillment') {
                pdfFileOutput.name = 'EJECUCIONPEDIDO_' + tran_tranid + '.pdf';
            } else if (tipo_transaccion == 'customsale_efx_fe_factura_global') {
                pdfFileOutput.name = 'GLOBAL_' + tran_tranid + '.pdf';
            }
            pdfFileOutput.folder = idFolder;
            pdfFileOutput.isOnline = true;
            var pdfFileId = pdfFileOutput.save();

            return pdfFileId;
        }
        const stampInv = (idTransaction, recordType, reprocessedGBL) => {
            var data_to_return = {
                success: true,
                msg: '',
                schedulePDFrender: false,
                xmlId: 0
            }
            log.debug({ title: 'recordType stampInv', details: recordType });
            let transactionAdenda = ''
            if (recordType == 'invoice' || recordType == 'customsale_efx_fe_factura_global' || recordType == 'cashsale') {

                transactionAdenda = adendas_functions.getAdendaXML(idTransaction, recordType, true);
            }
            log.audit({ title: 'typeof transactionAdenda.content 🕯️🕯️🕯️', details: typeof transactionAdenda.content });
            let body2Send = {
                transactionAdenda: transactionAdenda
            }
            try {
                // tranid, type, adendaText, reprocessedGBL
                let stampResponse = invoiceFunctions.execute_invoiceStamp(idTransaction, recordType, body2Send, reprocessedGBL);
                if (stampResponse.success == true) {
                    data_to_return.success = true;
                    data_to_return.msg = stampResponse.msg
                    data_to_return.schedulePDFrender = stampResponse.schedulePDFrender;
                    data_to_return.xmlId = stampResponse.xmlId;
                } else {
                    data_to_return.success = false;
                    data_to_return.msg = stampResponse.msg;
                }
                if (transactionAdenda.content) {
                    if (transactionAdenda.content.length > 0) {
                        // Save the addenda xml
                        let fileIdOfGeneratedAdenda = adendas_functions.createFileOfAdenda(transactionAdenda.content, idTransaction);

                        let objValues2Store = {
                            custbody_mxplus_generated_adenda_file: fileIdOfGeneratedAdenda.idFileAdendaGenerated
                        }
                        let submittedFields = adendas_functions.submitFields2Transaction(objValues2Store, recordType, idTransaction);
                        log.debug({ title: 'submittedFields of saving addenda file', details: submittedFields });
                    }
                }

            } catch (err) {
                log.error({ title: 'Error occurred in stampInv', details: err });
            }
            return data_to_return
        }
        
        
        
        

        return { stampInv, generatePDF }

    });
