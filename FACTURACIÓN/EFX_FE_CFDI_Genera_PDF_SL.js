/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/render', 'N/search','N/runtime','N/file','N/xml','N/encode','N/https','N/http','N/email','./XmlToPdf','N/format'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{search} search
     */
    function(record, render, search,runtime,file,xml,encode,https,http,email,XmlToPdf,format) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            var respuesta = {
                success: false,
                idPdf:''
            };
            var objRespuesta = new Object();

            try {
                var tipotran = context.request.parameters.trantype || '';
                var idtran = context.request.parameters.tranid || '';

                log.audit({title:'context.request.parameters',details:context.request.parameters});
                log.audit({title:'tipotran',details:tipotran});
                log.audit({title:'idtran',details:idtran});

                var scriptObj = runtime.getCurrentScript();
                var folderBase = scriptObj.getParameter({ name: 'custscript_efx_fe_folder_certify' });
                var folderBaseSubsidiaria = scriptObj.getParameter({ name: 'custscript_efx_fe_folder_subsidiary' });
                var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'subsidiaries' });

                var recordObj = record.load({
                    type: tipotran,
                    id: idtran
                });


                if(tipotran=='customsale_efx_fe_factura_global'){
                    var tran_sendingmethod = recordObj.getValue({fieldId: 'custbody_efx_fe_gbl_envio'});
                }else{
                    var tran_sendingmethod = recordObj.getValue({fieldId: 'custbody_psg_ei_sending_method'});
                }
                if(!tran_sendingmethod){
                    tran_sendingmethod = recordObj.getValue({fieldId: 'custbody_efx_fe_metodo_docel'});
                }

                var send_method_obj = search.lookupFields({
                    type : 'customrecord_ei_sending_method',
                    columns : ['custrecord_psg_ei_edoc_standard'],
                    id : tran_sendingmethod,
                });
                log.audit({title:'send_method_obj',details:send_method_obj});

                var send_method_e_package = send_method_obj['custrecord_psg_ei_edoc_standard'][0].value;
                var e_package_obj = search.lookupFields({
                    type : 'customrecord_psg_ei_standards',
                    columns : ['name'],
                    id : send_method_e_package,
                });


                var e_package_name = e_package_obj['name'];

                log.audit({title: 'e_package_name', details: e_package_name});
                var filtros_Array_pac = new Array();
                filtros_Array_pac.push(['custrecord_mx_edoc_package_name', search.Operator.IS, e_package_name]);
                filtros_Array_pac.push('and');
                filtros_Array_pac.push(['custrecord_mx_pacinfo_enable', search.Operator.IS, 'T']);
                if(SUBSIDIARIES){

                    var subsidiaria_id = recordObj.getValue({fieldId: 'subsidiary'});
                    filtros_Array_pac.push('and');
                    filtros_Array_pac.push(['custrecord_mx_pacinfo_subsidiary', search.Operator.ANYOF, subsidiaria_id]);
                }

                var search_pacinfo = search.create({
                    type: 'customrecord_mx_pac_connect_info',
                    filters: filtros_Array_pac,
                    columns: [
                        search.createColumn({name: 'custrecord_mx_pacinfo_username'}),
                        search.createColumn({name: 'custrecord_mx_pacinfo_url'}),
                        search.createColumn({name: 'custrecord_mx_pacinfo_taxid'}),
                        search.createColumn({name: 'custrecord_mx_invoice_pdf_tmpl'}),
                        search.createColumn({name: 'custrecord_mx_cash_sale_pdf_tmpl'}),
                        search.createColumn({name: 'custrecord_mx_credit_memo_pdf_tmpl'}),
                        search.createColumn({name: 'custrecord_mx_item_fulfillment_pdf_tmpl'}),
                        search.createColumn({name: 'custrecord_mx_customer_payment_pdf_tmpl'}),
                    ]
                });

                var ejecutar = search_pacinfo.run();
                var resultado = ejecutar.getRange(0, 100);

                var tipo_transaccion = tipotran;

                var template_invoice_pac = '';

                if (tipo_transaccion == 'invoice' || tipo_transaccion == 'customsale_efx_fe_factura_global') {
                    log.audit({title: 'resultado', details: resultado});
                    template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_invoice_pdf_tmpl'});
                    log.audit({title: 'template_invoice_pac', details: template_invoice_pac});
                }else if(tipo_transaccion == 'cashsale'){
                    template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_cash_sale_pdf_tmpl'});
                }else if(tipo_transaccion == 'creditmemo'){
                    template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_credit_memo_pdf_tmpl'});
                }else if(tipo_transaccion == 'customerpayment'){
                    template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_customer_payment_pdf_tmpl'});
                }else if(tipo_transaccion == 'itemfulfillment'){
                    template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_item_fulfillment_pdf_tmpl'});
                }


                var xmlarchivo = recordObj.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
                if(tipo_transaccion == 'customerpayment'){
                    var entityid = recordObj.getValue({fieldId:'customer'});
                }else{
                    var entityid = recordObj.getValue({fieldId:'entity'});
                }
            
                var tranid_data = recordObj.getValue({fieldId:'tranid'});

                if(tipo_transaccion == 'customsale_efx_fe_factura_global'){
                    var objRespuesta = {
                        certData: {
                            custbody_mx_cfdi_signature: recordObj.getValue({fieldId:'custbody_efx_cfdi_sello'}),
                            custbody_mx_cfdi_sat_signature: recordObj.getValue({fieldId:'custbody_efx_cfdi_sat_sello'}),
                            custbody_mx_cfdi_sat_serial: recordObj.getValue({fieldId:'custbody_efx_cfdi_sat_serie'}),
                            custbody_mx_cfdi_cadena_original: recordObj.getValue({fieldId:'custbody_efx_cfdi_cadena_original'}),
                            custbody_mx_cfdi_uuid: recordObj.getValue({fieldId:'custbody_mx_cfdi_uuid'}),
                            custbody_mx_cfdi_issuer_serial: recordObj.getValue({fieldId:'custbody_efx_cfdi_serial'}),
                            Serie: tranid_data,
                            FolioResSat: tranid_data,
                            custbody_mx_cfdi_certify_timestamp: recordObj.getValue({fieldId:'custbody_mx_cfdi_certify_timestamp'}),
                            custbody_mx_cfdi_issue_datetime: recordObj.getValue({fieldId:'custbody_mx_cfdi_issue_datetime'}),
                            cfdi_relResSat: '',
                            uuid_ObtieneCFDI: recordObj.getValue({fieldId:'custbody_mx_cfdi_uuid'}),
                            custbody_mx_cfdi_qr_code: recordObj.getValue({fieldId:'custbody_efx_fe_cfdi_qr_code'})
                        }
                    }
                }else{
                    var objRespuesta = {
                        certData: {
                            custbody_mx_cfdi_signature: recordObj.getValue({fieldId:'custbody_mx_cfdi_signature'}),
                            custbody_mx_cfdi_sat_signature: recordObj.getValue({fieldId:'custbody_mx_cfdi_sat_signature'}),
                            custbody_mx_cfdi_sat_serial: recordObj.getValue({fieldId:'custbody_mx_cfdi_sat_serial'}),
                            custbody_mx_cfdi_cadena_original: recordObj.getValue({fieldId:'custbody_mx_cfdi_cadena_original'}),
                            custbody_mx_cfdi_uuid: recordObj.getValue({fieldId:'custbody_mx_cfdi_uuid'}),
                            custbody_mx_cfdi_issuer_serial: recordObj.getValue({fieldId:'custbody_mx_cfdi_issuer_serial'}),
                            Serie: tranid_data,
                            FolioResSat: tranid_data,
                            custbody_mx_cfdi_certify_timestamp: recordObj.getValue({fieldId:'custbody_mx_cfdi_certify_timestamp'}),
                            custbody_mx_cfdi_issue_datetime: recordObj.getValue({fieldId:'custbody_mx_cfdi_issue_datetime'}),
                            cfdi_relResSat: '',
                            uuid_ObtieneCFDI: recordObj.getValue({fieldId:'custbody_mx_cfdi_uuid'}),
                            custbody_mx_cfdi_qr_code: recordObj.getValue({fieldId:'custbody_mx_cfdi_qr_code'})
                        }
                    }
                }
                
                var subsidiaria = '';
                if (folderBaseSubsidiaria || folderBaseSubsidiaria == true || folderBaseSubsidiaria == 'true' || folderBaseSubsidiaria == 'T') {
                    if(SUBSIDIARIES){

                        var subsidiaria_id = recordObj.getValue({fieldId: 'subsidiary'});
                        var subsidiary_info = search.lookupFields({
                            type: search.Type.SUBSIDIARY,
                            id: subsidiaria_id,
                            columns: ['name']
                        });

                        log.audit({title: 'subsidiary_info.name: ', details: subsidiary_info.name});
                        
                        subsidiaria = subsidiary_info.name;
                    }
                }

                var entityObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: entityid
                });

                var fileObj = file.load({
                    id: xmlarchivo
                });

                var xmlTimbrado = fileObj.getContents();

                // var xmlObjfirst = xml.Parser.fromString({
                //     text: xmlTimbrado
                // });

                // var removeNode = xml.XPath.select({
                //     node : xmlObjfirst,
                //     xpath : '//cfdi:Comprobante//cfdi:Addenda'
                // });
                // log.audit({title:'xmlObjfirst',details:xmlObjfirst});
                // log.audit({title:'removeNode',details:removeNode});
                // if(removeNode){
                //     var xmlObj = xmlObjfirst.removeChild({
                //         oldChild : removeNode[0]
                //     });

                    // var xmlAdd = xml.Parser.fromString({
                    //     text: '<Addenda></Addenda>'
                    // });
                    //
                    // var xmlObj = xmlObjfirst.replaceChild({
                    //     newChild : xmlAdd,
                    //     oldChild : removeNode[0]
                    // });
                //     var objPDF = XmlToPdf.createPDF(xmlObj,true);
                // }else{
                    var xmlObj = xml.Parser.fromString({
                        text: xmlTimbrado
                    });
                    var objPDFjson = XmlToPdf.createPDF(xmlObj.documentElement,true);
                // }

                try{
                    var objPDFtext = JSON.stringify(objPDFjson);
                    var objPDFfirst = objPDFtext.replace(/#text/gi,'texto');
                    var objPDF = JSON.parse(objPDFfirst.replace(/&/gi,'&amp;'));
                }catch(errorObjpdf){
                    log.audit({title:'errorObjpdf',details:errorObjpdf})
                }

                objRespuesta.dataXML = objPDF;
                log.audit({title:'objRespuesta',details:objRespuesta});

                var foldersubsidiaria = '';
                if (folderBaseSubsidiaria || folderBaseSubsidiaria == true || folderBaseSubsidiaria == 'true' || folderBaseSubsidiaria == 'T') {
                    if(subsidiaria){
                        foldersubsidiaria = createFolderSubsidiaria(folderBase,subsidiaria);
                    }
                }

                log.audit({title: 'foldersubsidiaria', details: JSON.stringify(foldersubsidiaria)});
                if(foldersubsidiaria){
                    
                    var idFolder = searchFolderByDay(foldersubsidiaria);
                }else{
                    var idFolder = searchFolderByDay(folderBase);
                }

                var idpdf = renderizaPDF(objRespuesta,recordObj,entityObj,tranid_data,xmlarchivo,idFolder,template_invoice_pac,tipo_transaccion);

                log.audit({title:'idpdf',details:idpdf});
                if(idpdf){
                    log.debug({title:'recordObj.isDynamic',details:recordObj.isDynamic});
                    recordObj.setValue({fieldId:'custbody_edoc_generated_pdf',value:idpdf,ignoreFieldChange:true});
                    log.audit({title:'record set',details:true});
                    recordObj.save({enableSourcing: false, ignoreMandatoryFields: true});
                    log.audit({title:'record save',details:true});
                    respuesta.success = true;
                    respuesta.idPdf = idpdf;
                    log.audit({title:'respuesta',details:respuesta});
                }


            }catch(error_send_mail){
                respuesta.success = false;
                log.error({title:'error_send_mail',details:error_send_mail});
            }

            context.response.setHeader({
                name: "Content-Type",
                value: "application/json"
            });

            context.response.write({
                output: JSON.stringify(respuesta)
            });

        }

        function renderizaPDF(objRespuesta,recordObj,entityObj,tran_tranid,idtimbre,idFolder,template_invoice_pac,tipo_transaccion){

            log.audit({title:'template_invoice_pac',details:template_invoice_pac});
            log.audit({title:'recordObj',details:recordObj});
            log.audit({title:'entityObj',details:entityObj});
            log.audit({title:'objRespuesta',details:objRespuesta});

            var renderer = render.create();
            renderer.setTemplateById({
                id: template_invoice_pac,
            });

            renderer.addRecord({
                templateName: 'record',
                record: recordObj,
            });

            if(entityObj){
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

            log.audit({title:'datasource',details:datasource});
            log.audit({title:'objRespuesta',details:objRespuesta});

            try{
                var fileObj = file.create({
                    name: 'test.json',
                    fileType: file.Type.PLAINTEXT,
                    contents: JSON.stringify(datasource),
                    folder: idFolder,
                    isOnline: true
                });

                var idArchivo = fileObj.save();
                log.audit({title: 'idArchivo', details: idArchivo});

            }catch(creajson){
                log.error({title:'creajson',details:creajson});
            }

          renderer.addCustomDataSource(datasource);

            var pdfFileOutput = renderer.renderAsPdf();
            if (tipo_transaccion == 'invoice') {
                pdfFileOutput.name = 'Factura_' + tran_tranid + '.pdf';
                // pdfFileOutput.name = 'Factura_' + tran_tranid +'_'+idtimbre+ '.pdf';
            }else if(tipo_transaccion == 'cashsale'){
                pdfFileOutput.name = 'VentaEfectivo_' + tran_tranid +'_'+idtimbre+ '.pdf';
            }else if(tipo_transaccion == 'creditmemo'){
                pdfFileOutput.name = 'NotaCredito' + tran_tranid +'_'+idtimbre+ '.pdf';
            }else if(tipo_transaccion == 'customerpayment'){
                pdfFileOutput.name = 'Pago_' + tran_tranid +'_'+idtimbre+ '.pdf';
            }else if(tipo_transaccion == 'itemfulfillment'){
                pdfFileOutput.name = 'EjecucionPedido' + tran_tranid +'_'+idtimbre+ '.pdf';
            }else if(tipo_transaccion == 'customsale_efx_fe_factura_global'){
                pdfFileOutput.name = 'Global_' + tran_tranid +'_'+idtimbre+ '.pdf';
            }
            pdfFileOutput.folder = idFolder;
            pdfFileOutput.isOnline = true;
            var pdfFileId = pdfFileOutput.save();

            return pdfFileId;
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
                    ,'AND',
                    ['parent', search.Operator.IS, folderBase]
                ]
            });

            var resultData = result.run().getRange({
                start: 0,
                end: 1
            });

            if (resultData.length == 0) {
                return createFolder(diaActual + '/' + mesActual + '/' + anoActual, createFolder(mesActual + '/' + anoActual, createFolder(anoActual, folderBase)));
            }
            else {
                //Búsqueda del folder para el mes correspondiente
                var folderAnoId = resultData[0].id;
                var filtroFolderMes = mesActual + '/' + anoActual;
                var result = search.create({
                    type: search.Type.FOLDER,
                    filters: [
                        ['name', search.Operator.IS, filtroFolderMes]
                        ,'AND',
                        ['parent', search.Operator.IS, folderAnoId]
                    ]
                });

                var resultData = result.run().getRange({
                    start: 0,
                    end: 1
                });

                if (resultData.length == 0) {
                    return createFolder(diaActual + '/' + mesActual + '/' + anoActual, createFolder(mesActual + '/' + anoActual, folderAnoId));
                }
                else {
                    //Búsqueda del folder para el dia correspondiente
                    var folderDiaId = resultData[0].id;
                    var filtroFolderDia = diaActual + '/' + mesActual + '/' + anoActual;
                    var result = search.create({
                        type: search.Type.FOLDER,
                        filters: [
                            ['name', search.Operator.IS, filtroFolderDia]
                            ,'AND',
                            ['parent', search.Operator.IS, folderDiaId]
                        ]
                    });

                    var resultData = result.run().getRange({
                        start: 0,
                        end: 1
                    });

                    if (resultData.length == 0) {
                        return createFolder(diaActual + '/' + mesActual + '/' + anoActual, folderDiaId);
                    }
                    else {
                        return resultData[0].id;
                    }
                }
            }
        }

        function createFolder(name, idPadre,folderBase) {
            try{
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
            }catch(error_folder){
                log.error({title:'error_folder',details:error_folder});
                var idFolder = searchFolderByDay(folderBase);
                return idFolder;
            }
        }

        function createFolderSubsidiaria(folderBase,subsidiaria){
            if(subsidiaria){
                var result = search.create({
                    type: search.Type.FOLDER,
                    filters: [
                        ['name', search.Operator.IS, subsidiaria]
                        ,'AND',
                        ['parent', search.Operator.IS, folderBase]
                    ]
                });
                var resultData = result.run().getRange({
                    start: 0,
                    end: 1
                });

                if(resultData.length == 0){
                    return createFolder(subsidiaria,folderBase,folderBase);
                }else{
                    return resultData[0].id;
                }
            }
        }

        return {
            onRequest: onRequest
        };

    });
