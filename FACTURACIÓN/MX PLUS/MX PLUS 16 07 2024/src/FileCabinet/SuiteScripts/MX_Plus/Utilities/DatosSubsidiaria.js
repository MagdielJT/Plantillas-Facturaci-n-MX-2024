/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/record', 'N/file', 'N/runtime', 'N/format', 'N/xml', 'N/search', 'N/config', './moment.js', 'N/ui/serverWidget', 'N/ui/message', 'N/url', 'N/https','N/log'],

    function (record, file, runtime, format, xml, search, config, moment, serverWidget, message, url, https,log) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        /**
         * The function is called before the record is loaded. It checks if the record is being edited
         * and if it is, it checks if the record has a value in the field
         * custbody_psg_ei_certified_edoc. If it does, it removes the delete button from the form
         * @param context - The context object contains information about the current user and the
         * current record.
         */
        var accountid = '', messageDetail = '', showMessage = false, habilitado = false;
        function beforeLoad(context) {
            var record_now = context.newRecord;
            
            var recType = record_now.type;
            //var recType = record_now.type;
            if (context.type == context.UserEventType.EDIT) {
                var docCertificado = record_now.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
                var canceladocheck = record_now.getValue({ fieldId: 'custbody_efx_fe_cfdi_cancelled' });
                log.audit({ title: 'canceladocheck', details: canceladocheck });
                if (docCertificado && !canceladocheck) {
                    // var formaTran = context.form;
                    // formaTran.removeButton({
                    //     id: 'void'
                    // });
                }
                if (docCertificado && !canceladocheck) {
                    var formaTran = context.form;
                    formaTran.removeButton({
                        id: 'delete'
                    });
                }
            }
            if (context.type == context.UserEventType.VIEW) {

                var formaTran = context.form;
                var uuidFactura = record_now.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });
                var gblrecord = record_now.getValue({ fieldId: 'custbody_efx_fe_gbl_related' });

                controlMensajesAccesoFacturacion(context, formaTran);
                if (uuidFactura && recType != 'customsale_efx_fe_factura_global' && gblrecord) {
                    var button_cancel = formaTran.getButton({
                        id: 'custpage_btn_cancel_cfdi'
                    });
                    var button_cancel_s = formaTran.getButton({
                        id: 'custpage_btn_cancel_s_cfdi'
                    });

                    if (button_cancel) {
                        button_cancel.isHidden = true;
                    }
                    if (button_cancel_s) {
                        button_cancel_s.isHidden = true;
                    }
                }

                var cancelhrs = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_cancel_hrs_hide' });
                if (cancelhrs) {
                    if (uuidFactura && recType != 'customsale_efx_fe_factura_global') {
                        var form = context.form;
                        var button_cancel = form.getButton({
                            id: 'custpage_btn_cancel_cfdi'
                        });
                        var button_cancel_s = form.getButton({
                            id: 'custpage_btn_cancel_s_cfdi'
                        });


                        var timestamptimbre = record_now.getValue({ fieldId: 'custbody_mx_cfdi_certify_timestamp' });

                        ocultaBotonCancela(button_cancel, button_cancel_s, timestamptimbre);
                    }
                }



                if (recType == record.Type.INVOICE || recType == record.Type.CASH_SALE || recType == record.Type.CREDIT_MEMO || recType == record.Type.CUSTOMER_PAYMENT || recType == record.Type.ITEM_FULFILLMENT || recType == record.Type.TRANSFER_ORDER || recType == 'customsale_efx_fe_factura_global' || recType == record.Type.PURCHASE_ORDER || recType == record.Type.ITEM_RECEIPT) {
                    //Envio de correos
                    var pagot = '';
                    var cartaportecheck = false;
                    if (recType == record.Type.CUSTOMER_PAYMENT) {
                        pagot = 'pago';
                    }
                    if (recType == 'customsale_efx_fe_factura_global') {
                        pagot = 'gbl';
                    }
                    // if(recType == record.Type.PURCHASE_ORDER || recType == record.Type.ITEM_RECEIPT){
                    //     pagot='cartaPorteOC';
                    //     cartaportecheck = record_now.getValue({fieldId: 'custbody_efx_fe_carta_porte'});
                    // }

                    var ocultagenerarcert = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_gencertificar' });
                    log.audit({title: 'ocultagenerarcert', details: ocultagenerarcert});
                    sendMail(context, record_now, recType, pagot, cartaportecheck, ocultagenerarcert, uuidFactura);
                    var regenerarpdf = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_regenerar_pdf' });
                    log.audit({ title: 'regenerarpdf', details: regenerarpdf });

                    if (regenerarpdf) {
                        regeneraPDF(context, record_now, recType);
                    }

                }

                var custscript_efx_fe_anticipo = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_anticipo' });
                var custscript_efx_fe_item_ap = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_item_ap' });
                var custscript_efx_fe_item_ap_ex = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_item_ap_ex' });

                if (custscript_efx_fe_anticipo && !uuidFactura && (recType == record.Type.INVOICE || recType == record.Type.CASH_SALE)) {
                    var lineCountItem = record_now.getLineCount({ sublistId: 'item' });
                    var articuloanticipo = '';
                    if (lineCountItem == 1) {
                        for (var a = 0; a < lineCountItem; a++) {
                            articuloanticipo = record_now.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: a
                            });
                        }

                        if (articuloanticipo == custscript_efx_fe_item_ap || articuloanticipo == custscript_efx_fe_item_ap_ex) {
                            var customerId = record_now.getValue({
                                fieldId: 'entity'
                            });
                            log.debug({title:'customerId',details:customerId});
                            generaAnticipos(context, record_now, recType,customerId);
                        }
                    }

                    var articuloaplicaranticipo = '';
                    var aplicaAnticiposBoton = false;
                    for (var a = 0; a < lineCountItem; a++) {
                        articuloaplicaranticipo = record_now.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: a
                        });
                        if (articuloaplicaranticipo != custscript_efx_fe_item_ap && articuloaplicaranticipo != custscript_efx_fe_item_ap_ex) {
                            aplicaAnticiposBoton = true;
                        }
                    }

                    if (aplicaAnticiposBoton) {
                        aplicarAnticipos(context, record_now, recType);
                    }
                }
            }

            try {
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {

                    if (recType == record.Type.INVOICE || recType == record.Type.CASH_SALE || recType == record.Type.CREDIT_MEMO || recType == record.Type.ITEM_FULFILLMENT || recType == record.Type.TRANSFER_ORDER || recType == 'customsale_efx_fe_factura_global') {
                        var fechaActualP = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_date_invoice' });
                        var desglosagrupoarticulos = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_desglosaart' });
                    }
                    if (recType == record.Type.CUSTOMER_PAYMENT) {
                        var fechaActualP = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_date_payment' });
                    }

                    log.audit({ title: 'checkfecha', details: fechaActualP });
                    log.audit({ title: 'fechaActualP', details: fechaActualP });

                    if (desglosagrupoarticulos) {
                        if(recType!==record.Type.ITEM_FULFILLMENT){
                            record_now.setValue({
                                fieldId: 'custbody_efx_fe_desglosa_ga',
                                value: true,
    
                            });
                        }
                    }


                    if (fechaActualP && recType != 'customsale_efx_fe_factura_global') {

                        record_now.setValue({
                            fieldId: 'custbody_efx_fe_actual_date',
                            value: true,

                        });
                        var test = record_now.getValue({ fieldId: 'custbody_efx_fe_actual_date' });
                        log.audit({ title: 'testf', details: test });
                    }
                }

                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                    var campo_hora = record_now.getValue({ fieldId: 'custbody_efx_fe_actual_hour' });
                    log.audit({ title: 'campo_hora', details: campo_hora })
                    if (campo_hora == '') {
                        var fechaActual = new Date();


                        log.audit({ title: 'fechaActual', details: moment().zone("-06:00").format('HH:mm:ss') });
                        var hora = fechaActual.getHours();
                        var minutos = fechaActual.getMinutes();
                        var segundos = fechaActual.getSeconds();

                        if (hora < 10) {
                            hora = '0' + hora;
                        }
                        if (minutos < 10) {
                            minutos = '0' + minutos;
                        }
                        if (segundos < 10) {
                            segundos = '0' + segundos;
                        }
                        var hora_actual = hora + ':' + minutos + ':' + segundos;
                        log.audit({ title: 'hora_actual1', details: hora_actual });

                        record_now.setValue({
                            fieldId: 'custbody_efx_fe_actual_hour',
                            value: moment().zone("-06:00").format('HH:mm:ss'),

                        });
                        var test = record_now.getValue({ fieldId: 'custbody_efx_fe_actual_hour' });
                        log.audit({ title: 'tests', details: test });
                    }
                }
            } catch (error_bfload) {
                log.error({ title: 'error_bfload', details: error_bfload });
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
        function beforeSubmit(context) {
            log.audit({ title: 'bef', details: 'bef' });
            var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
            var record_now = context.newRecord;
            var recType = record_now.type;
            var recordnowid = record_now.id;
            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {

                if (recType == record.Type.CUSTOMER_PAYMENT) {

                    var campoJsonParcialidad = record_now.getValue({ fieldId: 'custbody_efx_fe_parcialidad' });

                    var arrayParcialidad = new Array();
                    var facturasAplicadasCount = record_now.getLineCount({ sublistId: 'apply' });

                    if (campoJsonParcialidad) {
                        var JsonParcialidad = JSON.parse(campoJsonParcialidad);
                    }


                    if (!campoJsonParcialidad) {
                        var arraynuevo = new Array();
                        for (var i = 0; i < facturasAplicadasCount; i++) {
                            var objParcialidad = {
                                facturaId: '',
                                facturaRef: '',
                                parcialidad: '',
                                imp: ''
                            };
                            var factura_aplicada = record_now.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                line: i
                            });
                            if (factura_aplicada) {
                                var factura_id = record_now.getSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'internalid',
                                    line: i
                                });

                                var factura_ref = record_now.getSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'refnum',
                                    line: i
                                });

                                var factura_montoAnt = record_now.getSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'due',
                                    line: i
                                });

                                var parcialidad = calculaParcialidad(factura_id, recordnowid);

                                objParcialidad.facturaId = factura_id;
                                objParcialidad.facturaRef = factura_ref;
                                objParcialidad.parcialidad = parcialidad;
                                objParcialidad.imp = factura_montoAnt;
                                arrayParcialidad.push(objParcialidad);
                            }
                        }
                        var arraynuevo = arrayParcialidad;

                    } else {
                        for (var i = 0; i < facturasAplicadasCount; i++) {
                            var objParcialidad = {
                                facturaId: '',
                                facturaRef: '',
                                parcialidad: '',
                                imp: ''
                            };

                            var factura_aplicada = record_now.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                line: i
                            });
                            if (factura_aplicada) {
                                var factura_id = record_now.getSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'internalid',
                                    line: i
                                });

                                var factura_ref = record_now.getSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'refnum',
                                    line: i
                                });

                                var factura_montoAnt = record_now.getSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'due',
                                    line: i
                                });

                                var parcialidad = calculaParcialidad(factura_id, recordnowid);

                                objParcialidad.facturaId = factura_id;
                                objParcialidad.facturaRef = factura_ref;
                                objParcialidad.parcialidad = parcialidad;
                                objParcialidad.imp = factura_montoAnt;
                                arrayParcialidad.push(objParcialidad);
                            }
                        }
                        var arraynuevo = new Array();

                        for (var i = 0; i < arrayParcialidad.length; i++) {
                            var contar = 0;
                            for (var x = 0; x < JsonParcialidad.length; x++) {
                                if (arrayParcialidad[i].facturaId == JsonParcialidad[x].facturaId) {
                                    arraynuevo.push(JsonParcialidad[x]);
                                    contar++;
                                }
                            }
                            if (contar == 0) {
                                arraynuevo.push(arrayParcialidad[i]);
                            }
                        }

                    }
                    record_now.setValue({
                        fieldId: 'custbody_efx_fe_parcialidad',
                        value: JSON.stringify(arraynuevo),
                        ignoreFieldChange: true
                    });


                }

                // if (recType == record.Type.CREDIT_MEMO || recType == record.Type.INVOICE || recType == record.Type.CUSTOMER_PAYMENT) {

                //     if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE) {
                //         var relacionados_count = record_now.getLineCount({ sublistId: 'recmachcustrecord_mx_rcs_orig_trans' });
                //         log.audit({ title: 'relacionados_count', details: relacionados_count });
                //         var relacionados = new Array();
                //         for (var rel = 0; rel < relacionados_count; rel++) {
                //             var relacionados_obj = {
                //                 fol: '',
                //                 type: '',
                //                 uuid: ''
                //             };
                //             var factura_rel = record_now.getSublistText({
                //                 sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                //                 fieldId: 'custrecord_mx_rcs_rel_cfdi',
                //                 line: rel
                //             });

                //             var uuid_rel = record_now.getSublistValue({
                //                 sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                //                 fieldId: 'custrecord_mx_rcs_uuid',
                //                 line: rel
                //             });
                //             var tipo_rel = record_now.getSublistText({
                //                 sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                //                 fieldId: 'custrecord_mx_rcs_rel_type',
                //                 line: rel
                //             });
                //             relacionados_obj.fol = factura_rel;
                //             relacionados_obj.uuid = uuid_rel;
                //             relacionados_obj.type = tipo_rel;

                //             relacionados.push(relacionados_obj);
                //         }

                //         // relacionados = relacionados+factura_rel+': '+uuid_rel+'\n';

                //         log.audit({ title: 'relacionados', details: relacionados });
                //         record_now.setValue({
                //             fieldId: 'custbody_efx_fe_related_cfdi_json',
                //             value: JSON.stringify(relacionados),
                //             ignoreFieldChange: true
                //         });
                //     }
                // }
                if (recType == record.Type.INVOICE || recType == record.Type.CASH_SALE || recType == record.Type.CREDIT_MEMO || recType == record.Type.CUSTOMER_PAYMENT || recType == record.Type.SALES_ORDER || recType == record.Type.ITEM_FULFILLMENT || recType == record.Type.TRANSFER_ORDER || recType == record.Type.PURCHASE_ORDER || recType == record.Type.ITEM_RECEIPT || recType == 'customsale_efx_fe_factura_global') {

                    try {
                        var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
                        var subsidiaria = record_now.getValue({ fieldId: 'subsidiary' });
                        var pruebaenvio = record_now.getValue({ fieldId: 'shippingcost' });
                        var location = '';
                        if (recType == record.Type.ITEM_FULFILLMENT) {
                            location = record_now.getSublistValue({ sublistId: 'item', fieldId: 'location', line: 0 });
                        } else {
                            location = record_now.getValue({ fieldId: 'location' });
                        }
                        log.audit({ title: 'location', details: location });
                        log.audit({ title: 'pruebaenvio', details: pruebaenvio });
                        if (SUBSIDIARIES && subsidiaria) {
                            var subsidiary_record = record.load(
                                { type: record.Type.SUBSIDIARY, id: subsidiaria, isDynamic: true }
                            );
                            direccion = subsidiary_record.getValue({ fieldId: 'mainaddress_text' });
                            id_logo = subsidiary_record.getValue({ fieldId: 'logo' });
                            if (existeSuiteTax) {
                                rfc_sub = subsidiary_record.getSublistValue({ sublistId: 'taxregistration', fieldId: 'taxregistrationnumber', line: 0 });
                            } else {
                                rfc_sub = subsidiary_record.getValue({ fieldId: 'federalidnumber' });
                            }
                        } else {
                            var configRecObj = config.load({
                                type: config.Type.COMPANY_INFORMATION
                            });

                            direccion = configRecObj.getValue({ fieldId: 'mainaddress_text' });
                            id_logo = configRecObj.getValue({ fieldId: 'formlogo' });
                            rfc_sub = configRecObj.getValue({ fieldId: 'employerid' });
                        }

                        var zonahoraria = '';
                        if (location) {
                            var location_record = record.load(
                                { type: record.Type.LOCATION, id: location, isDynamic: true }
                            );
                            direccion_loc = location_record.getValue({ fieldId: 'mainaddress_text' });
                            id_logo_loc = location_record.getValue({ fieldId: 'logo' });
                            rfc_sub_loc = location_record.getValue({ fieldId: 'custrecord_efx_fe_ce_rfc' });
                            var zonahorariavalue = location_record.getValue({ fieldId: 'custrecord_efx_fe_time_zone' });
                            if (zonahorariavalue) {
                                zonahoraria = location_record.getText({ fieldId: 'custrecord_efx_fe_time_zone' });
                            }
                            log.audit({ title: 'direccion_loc', details: direccion_loc });
                            log.audit({ title: 'id_logo_loc', details: id_logo_loc });
                            log.audit({ title: 'rfc_sub_loc', details: rfc_sub_loc });
                            record_now.setValue({
                                fieldId: 'custbody_efx_fe_zona_horaria',
                                value: zonahoraria,
                                ignoreFieldChange: true
                            });
                        }



                        log.audit({ title: 'direccion', details: direccion });
                        log.audit({ title: 'id_logo', details: id_logo });
                        log.audit({ title: 'rfc_sub', details: rfc_sub });

                        var urlLogo = '';
                        var urlLogo_loc = '';
                        if (id_logo) {
                            var logoAttachment = file.load({
                                id: id_logo
                            });
                            urlLogo = logoAttachment.url;
                        }

                        log.audit({ title: 'urlLogo', details: urlLogo });
                        if (location) {
                            if (id_logo_loc) {
                                var logoAttachment = file.load({
                                    id: id_logo_loc
                                });
                                urlLogo_loc = logoAttachment.url;
                                log.audit({ title: 'urlLogo_loc', details: urlLogo_loc });
                            }
                        }


                            record_now.setValue({
                                fieldId: 'custbody_efx_fe_logosub',
                                value: urlLogo,
                                ignoreFieldChange: true
                            });
    
                            var dir_full = '';
                            dir_full = direccion + '\n' + rfc_sub;
                            record_now.setValue({
                                fieldId: 'custbody_efx_fe_dirsubs',
                                value: dir_full,
                                ignoreFieldChange: true
                            });
                        

                        if (location) {
                            record_now.setValue({
                                fieldId: 'custbody_efx_fe_logoloc',
                                value: urlLogo_loc,
                                ignoreFieldChange: true
                            });

                            var dir_full_loc = '';
                            dir_full_loc = direccion_loc + '\n' + rfc_sub_loc;
                            record_now.setValue({
                                fieldId: 'custbody_efx_fe_dirloc',
                                value: dir_full_loc,
                                ignoreFieldChange: true
                            });
                        }
                    } catch (errorlogo) {
                        log.audit({ title: 'errorlogo', details: errorlogo })
                    }
                }

                var campo_hora = record_now.getValue({ fieldId: 'custbody_efx_fe_actual_hour' });
                log.audit({ title: 'campo_hora', details: campo_hora })
                if (campo_hora == '') {

                    var fechaActual = new Date();

                    log.audit({ title: 'fechaActual', details: moment().zone("-06:00").format('HH:mm:ss') });




                    //var fechaActual = new Date();

                    var hora = fechaActual.getHours();
                    var minutos = fechaActual.getMinutes();
                    var segundos = fechaActual.getSeconds();
                    if (hora < 10) {
                        hora = '0' + hora;
                    }
                    if (minutos < 10) {
                        minutos = '0' + minutos;
                    }
                    if (segundos < 10) {
                        segundos = '0' + segundos;
                    }
                    var hora_actual = hora + ':' + minutos + ':' + segundos;
                    log.audit({ title: 'hora_actual1', details: hora_actual });

                    record_now.setValue({
                        fieldId: 'custbody_efx_fe_actual_hour',
                        value: moment().zone("-06:00").format('HH:mm:ss'),
                        ignoreFieldChange: true
                    });
                    var test = record_now.getValue({ fieldId: 'custbody_efx_fe_actual_hour' });
                    log.audit({ title: 'tests', details: test });
                }

            }


            //fecha actual

            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                var recType = record_now.type;
                if (recType == record.Type.INVOICE || recType == record.Type.CASH_SALE || recType == record.Type.CREDIT_MEMO || recType == record.Type.ITEM_FULFILLMENT || recType == record.Type.TRANSFER_ORDER || recType == 'customsale_efx_fe_factura_global') {
                    var fechaActualP = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_date_invoice' });
                    var desglosagrupoarticulos = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_desglosaart' });
                    log.audit({title:'desglosagrupoarticulos🦀',details:desglosagrupoarticulos});
                }
                if (recType == record.Type.CUSTOMER_PAYMENT) {
                    var fechaActualP = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_date_payment' });
                }

                log.audit({ title: 'checkfecha', details: fechaActualP });
                log.audit({ title: 'fechaActualP', details: fechaActualP });

                if (desglosagrupoarticulos) {
                    record_now.setValue({
                        fieldId: 'custbody_efx_fe_desglosa_ga',
                        value: true,
                    });
                }

                if (fechaActualP && recType != 'customsale_efx_fe_factura_global') {

                    record_now.setValue({
                        fieldId: 'custbody_efx_fe_actual_date',
                        value: true,

                    });
                    var test = record_now.getValue({ fieldId: 'custbody_efx_fe_actual_date' });
                    log.audit({ title: 'testf', details: test });
                }
            }

            //impuestos locales

            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                if (recType == record.Type.INVOICE || recType == record.Type.CASH_SALE || recType == record.Type.CREDIT_MEMO) {
                    try {
                        // 8333310 ID para portlan solo caso de articulo de ensamblaje
                        if (runtime.accountId.includes('8333310')) {
                            log.audit({title:'dentro de la busqueda',details:'dentro de la busqueda'});
                            let posi = record_now.getLineCount({ sublistId: 'item' });
                            for (var p = 0; p < posi; p++) {
                                let tipoArticle = record_now.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemtype',
                                    line: p,
                                });
                                if (tipoArticle === 'Assembly') {
                                    let articleId = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        line: p,
                                    });
                                    var getDataArticle = record.load({
                                        type: record.Type.ASSEMBLY_ITEM,
                                        id: articleId
                                    });
                                    var ensamble = getDataArticle.getValue({ fieldId: 'custitem_mx_txn_item_sat_item_code' });
                                    log.audit({title:'ensamble',details:ensamble});
                                    record_now.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_mx_txn_line_sat_item_code',
                                        line: p,
                                        value: ensamble
                                    });
                                }
                            }
                        }
                        if (!desglosagrupoarticulos) {
                            var linecountgart = record_now.getLineCount({ sublistId: 'item' });
                            for (var x = 0; x < linecountgart; x++) {
                                var tipogrupo = record_now.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemtype',
                                    line: x,
                                });
                                log.audit({title:'tipogrupo 💀',details:tipogrupo});
                                if (tipogrupo == "Group") {
                                    var iditemgrupo = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        line: x,
                                    });
                                    var objitemgroup = record.load({
                                        type: record.Type.ITEM_GROUP,
                                        id: iditemgrupo
                                    });
                                    var prodservgroup = objitemgroup.getValue({ fieldId: 'custitem_efx_fe_clave_prod_group' });
                                    record_now.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_mx_txn_line_sat_item_code',
                                        line: x,
                                        value: prodservgroup
                                    });
                                }
                            }
                        }
                        log.audit({ title: 'impuestoslocales', details: 'Impuestos locales' });
                        // custbody_efx_fe_detalle_imp_loc custbody_efx_fe_select_ret_loc
                        var custbody_efx_fe_select_ret_loc = record_now.getValue({ fieldId: 'custbody_efx_fe_select_ret_loc' }) || '';
                        log.audit({ title: 'custbody_efx_fe_select_ret_loc', details: custbody_efx_fe_select_ret_loc });
                        if (custbody_efx_fe_select_ret_loc && custbody_efx_fe_select_ret_loc[0]) {
                            var dataImpuestosLocales = searchLocalTax(custbody_efx_fe_select_ret_loc);
                            if (dataImpuestosLocales && dataImpuestosLocales.array && dataImpuestosLocales.total) {
                                record_now.setValue({ fieldId: 'custbody_efx_fe_detalle_imp_loc', value: JSON.stringify(dataImpuestosLocales.array) });
                                record_now.setValue({ fieldId: 'custbody_efx_fe_total_impuesto_local', value: dataImpuestosLocales.total });
                            }
                            if (dataImpuestosLocales.total) {
                                var totalimplocal = parseFloat(dataImpuestosLocales.total);
                                if (totalimplocal > 0) {
                                    totalimplocal = totalimplocal * -1;
                                }
                                var scriptObj = runtime.getCurrentScript();
                                var custscript_efx_fe_item_imp_loc = scriptObj.getParameter({ name: 'custscript_efx_fe_item_imp_loc' }) || '';
                                var linecount = record_now.getLineCount({ sublistId: 'item' });

                                if (custscript_efx_fe_item_imp_loc) {
                                    var existeItemLocales = 0;
                                    for (var i = 0; i < linecount; i++) {
                                        var itemlinea = record_now.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'item',
                                            line: i
                                        });
                                        if (itemlinea == custscript_efx_fe_item_imp_loc) {
                                            existeItemLocales++;
                                            break;
                                        }
                                    }
                                    if (existeItemLocales == 0) {
                                        record_now.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'item',
                                            line: linecount,
                                            value: custscript_efx_fe_item_imp_loc
                                        });
                                        record_now.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'price',
                                            line: linecount,
                                            value: -1
                                        });
                                        record_now.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'rate',
                                            line: linecount,
                                            value: totalimplocal
                                        });
                                        record_now.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'grossamt',
                                            line: linecount,
                                            value: totalimplocal
                                        });
                                    }
                                }
                            }
                        }
                    } catch (error_impuestolocal) {
                        log.audit({ title: 'error Impuestos locales', details: JSON.stringify(error_impuestolocal) });
                    }

                }
            }
            // MOD
            if (context.type == context.UserEventType.CREATE && recType != record.Type.SALES_ORDER && recType != record.Type.ITEM_FULFILLMENT && recType!==record.Type.ITEM_RECEIPT) {
                if (recType != record.Type.PURCHASE_ORDER && recType != 'customsale_efx_fe_factura_global') {
                    var cliente;
                    if (recType == record.Type.CUSTOMER_PAYMENT) {
                        var id = record_now.getValue('customer');
                        log.audit({title: '~719~customer: ', details: id});
                        cliente=record.load({
                            type: record.Type.CUSTOMER,
                            id: id,
                        });
                        
                    } else {
                        var id = record_now.getValue('entity');
                        // MOD
                        if(recType==record.Type.INVOICE || recType==record.Type.CREDIT_MEMO){
                            log.audit({title:'record.Type.CUSTOMER',details:record.Type.CUSTOMER});
                            cliente=record.load({
                                type: record.Type.CUSTOMER,
                                id: id,
                            });
                        }
                    }

                }
            }
            


        }


        function agregaPlantillas(context, record_now, recType) {
            try {
                log.audit({title:'context agregaPlantillas',details:context});
                log.audit({title:'record_now agregaPlantillas',details:record_now});
                log.audit({title:'recType agregaPlantillas',details:recType});
                
                var idrecdyn = record_now.id;
                log.debug({title:'idrecdyn',details:idrecdyn});
                var recobjdyn = record.load({
                    type: recType,
                    id: idrecdyn,
                    isDynamic: true
                });
                var plantillaOptions = recobjdyn.getField({ fieldId: 'custbody_psg_ei_template' });
                var metodoOptions = recobjdyn.getField({ fieldId: 'custbody_psg_ei_sending_method' });

                log.audit({ title: 'seloptions', details: plantillaOptions.getSelectOptions().length });
                var datosPlantilla = false;
                var datosMetodo = false;
                if (plantillaOptions.getSelectOptions().length > 0) {
                    datosPlantilla = true;
                }
                if (metodoOptions.getSelectOptions().length > 0) {
                    datosMetodo = true;
                }
                var cfdiversion = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_version' });
                if ((context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) && recType!==record.Type.ITEM_FULFILLMENT) {

                    if (recType == record.Type.CUSTOMER_PAYMENT) {
                        var idCliente = record_now.getValue('customer');
                        log.audit({title: '~804~customer: ', details: idCliente});
                    } else {
                        var idCliente = record_now.getValue('entity');
                    }

                    var clienteObj = record.load({
                        type: record.Type.CUSTOMER,
                        id: idCliente,
                    });

                    if (recType == record.Type.CUSTOMER_PAYMENT) {
                        var dir_cliente = clienteObj.getValue({ fieldId: 'defaultaddress' });

                        try {
                            record_now.setValue({
                                fieldId: 'custbody_tko_dir_cliente',
                                value: dir_cliente,
                            });
                            log.audit({ title: 'dir_cliente', details: dir_cliente });
                        } catch (error) {
                            log.error({ title: 'error al poner direccion de cliente', details: 'probablemente el campo custbody_tko_dir_cliente no existe, favor de crearlo' })
                        }

                    }

                    var paqueteDCliente = clienteObj.getValue({ fieldId: 'custentity_psg_ei_entity_edoc_standard' });
                    var cfdiversionCustomer = clienteObj.getValue({ fieldId: 'custentity_efx_fe_version' });

                    if (paqueteDCliente) {
                        var buscaPlantillas = search.create({
                            type: 'customrecord_psg_ei_template',
                            filters: [
                                ['isinactive', search.Operator.IS, 'F']
                                , 'AND',
                                ['custrecord_psg_ei_template_edoc_standard', search.Operator.ANYOF, paqueteDCliente]
                            ],
                            columns: [
                                search.createColumn({ name: 'internalid' }),
                                search.createColumn({ name: 'name' }),
                                search.createColumn({ name: 'custrecord_psg_ei_template_edoc_standard' }),
                            ]
                        });
                        buscaPlantillas.run().each(function (result) {

                            var idPlantilla = result.getValue({ name: 'internalid' });
                            var nombrePlantilla = result.getValue({ name: 'name' });
                            var paquetePlantilla = result.getValue({ name: 'custrecord_psg_ei_template_edoc_standard' });

                            var invoice40 = nombrePlantilla.indexOf("invoice template 4.0") !== -1;
                            var invoice30 = nombrePlantilla.indexOf("invoice template 3.3") !== -1;
                            var nc40 = nombrePlantilla.indexOf("credit memo template 4.0") !== -1;
                            var nc30 = nombrePlantilla.indexOf("credit memo template 3.3") !== -1;
                            var cashsale40 = nombrePlantilla.indexOf("cash sale template 4.0") !== -1;
                            var cashsale30 = nombrePlantilla.indexOf("cash sale template 3.3") !== -1;
                            var payment40 = nombrePlantilla.indexOf("customer payment template 4.0") !== -1;
                            var payment30 = nombrePlantilla.indexOf("customer payment template 3.3") !== -1;


                            if (cfdiversion == '' || !cfdiversion) {
                                if (recType == record.Type.INVOICE && invoice40 && cfdiversionCustomer == 2) {
                                    if (datosPlantilla) {
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                        log.audit({ title: 'idPlantilla 906', details: idPlantilla });
                                    } else {
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }
                                } else if (recType == record.Type.INVOICE && invoice30 && (cfdiversionCustomer == 1 || cfdiversionCustomer == '')) {
                                    if (datosPlantilla) {
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                        log.audit({ title: 'idPlantilla 921', details: idPlantilla });
                                    } else {
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                        log.audit({title: 'idPlantilla 893', details: idPlantilla});
                                    }
                                }

                                if (recType == record.Type.CASH_SALE && cashsale40 && cfdiversionCustomer == 2) {
                                    if (datosPlantilla) {
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                        log.audit({ title: 'idPlantilla 938', details: idPlantilla });
                                    } else {
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }
                                } else if (recType == record.Type.CASH_SALE && cashsale30 && (cfdiversionCustomer == 1 || cfdiversionCustomer == '')) {
                                    if (datosPlantilla) {
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                        log.audit({ title: 'idPlantilla 953', details: idPlantilla });
                                    } else {
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }
                                }

                                if (recType == record.Type.CREDIT_MEMO && nc40 && cfdiversionCustomer == 2) {
                                    if (datosPlantilla) {
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                        log.audit({ title: 'idPlantilla 970', details: idPlantilla });
                                    } else {
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }
                                } else if (recType == record.Type.CREDIT_MEMO && nc30 && (cfdiversionCustomer == 1 || cfdiversionCustomer == '')) {
                                    if (datosPlantilla) {
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                        log.audit({ title: 'idPlantilla 985', details: idPlantilla });
                                    } else {
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }
                                }

                                if (recType == record.Type.CUSTOMER_PAYMENT && payment40 && cfdiversionCustomer == 2) {
                                    if (datosPlantilla) {
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                        log.audit({ title: 'idPlantilla 1002', details: idPlantilla });
                                    } else {
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }
                                } else if (recType == record.Type.CUSTOMER_PAYMENT && payment30 && (cfdiversionCustomer == 1 || cfdiversionCustomer == '')) {
                                    if (datosPlantilla) {
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                        log.audit({ title: 'idPlantilla 1017', details: idPlantilla });
                                    } else {
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }
                                }
                            } else {
                                if (cfdiversion == 1) {
                                    if (recType == record.Type.INVOICE && invoice30) {
                                        if (datosPlantilla) {
                                            record_now.setValue({
                                                fieldId: 'custbody_psg_ei_template',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                            log.audit({ title: 'idPlantilla 1035', details: idPlantilla });
                                        } else {
                                            record_now.setValue({
                                                fieldId: 'custbody_efx_fe_plantilla_docel',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                        }
                                    }
                                    if (recType == record.Type.CASH_SALE && cashsale30) {
                                        if (datosPlantilla) {
                                            record_now.setValue({
                                                fieldId: 'custbody_psg_ei_template',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                            log.audit({ title: 'idPlantilla 1051', details: idPlantilla });
                                        } else {
                                            record_now.setValue({
                                                fieldId: 'custbody_efx_fe_plantilla_docel',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                        }
                                    }
                                    if (recType == record.Type.CREDIT_MEMO && nc30) {
                                        if (datosPlantilla) {
                                            record_now.setValue({
                                                fieldId: 'custbody_psg_ei_template',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                            log.audit({ title: 'idPlantilla 1067', details: idPlantilla });
                                        } else {
                                            record_now.setValue({
                                                fieldId: 'custbody_efx_fe_plantilla_docel',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                        }
                                    }
                                    if (recType == record.Type.CUSTOMER_PAYMENT && payment30) {
                                        if (datosPlantilla) {
                                            record_now.setValue({
                                                fieldId: 'custbody_psg_ei_template',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                            log.audit({ title: 'idPlantilla 1083', details: idPlantilla });
                                        } else {
                                            record_now.setValue({
                                                fieldId: 'custbody_efx_fe_plantilla_docel',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                        }
                                    }
                                }
                                if (cfdiversion == 2) {
                                    if (recType == record.Type.INVOICE && invoice40) {
                                        if (datosPlantilla) {
                                            record_now.setValue({
                                                fieldId: 'custbody_psg_ei_template',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                            log.audit({ title: 'idPlantilla 1101', details: idPlantilla });
                                        } else {
                                            record_now.setValue({
                                                fieldId: 'custbody_efx_fe_plantilla_docel',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                        }
                                    }
                                    if (recType == record.Type.CASH_SALE && cashsale40) {
                                        if (datosPlantilla) {
                                            record_now.setValue({
                                                fieldId: 'custbody_psg_ei_template',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                            log.audit({ title: 'idPlantilla 1117', details: idPlantilla });
                                        } else {
                                            record_now.setValue({
                                                fieldId: 'custbody_efx_fe_plantilla_docel',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                        }
                                    }
                                    if (recType == record.Type.CREDIT_MEMO && nc40) {
                                        if (datosPlantilla) {
                                            record_now.setValue({
                                                fieldId: 'custbody_psg_ei_template',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                            log.audit({ title: 'idPlantilla 1133', details: idPlantilla });
                                        } else {
                                            record_now.setValue({
                                                fieldId: 'custbody_efx_fe_plantilla_docel',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                        }
                                    }
                                    if (recType == record.Type.CUSTOMER_PAYMENT && payment40) {
                                        if (datosPlantilla) {
                                            record_now.setValue({
                                                fieldId: 'custbody_psg_ei_template',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                            log.audit({ title: 'idPlantilla 1149', details: idPlantilla });
                                        } else {
                                            record_now.setValue({
                                                fieldId: 'custbody_efx_fe_plantilla_docel',
                                                value: idPlantilla,
                                                ignoreFieldChange: true
                                            });
                                        }
                                    }
                                }

                            }

                            return true;
                        });

                        var buscaMetodos = search.create({
                            type: 'customrecord_ei_sending_method',
                            filters: [
                                ['isinactive', search.Operator.IS, 'F']
                                , 'AND',
                                ['custrecord_psg_ei_edoc_standard', search.Operator.ANYOF, paqueteDCliente]
                            ],
                            columns: [
                                search.createColumn({ name: 'internalid' }),
                            ]
                        });
                        buscaMetodos.run().each(function (result) {

                            var metodo = result.getValue({ name: 'internalid' });

                            if (metodo) {
                                if (datosMetodo) {
                                    record_now.setValue({
                                        fieldId: 'custbody_psg_ei_sending_method',
                                        value: metodo,
                                        ignoreFieldChange: true
                                    });
                                } else {
                                    record_now.setValue({
                                        fieldId: 'custbody_efx_fe_metodo_docel',
                                        value: metodo,
                                        ignoreFieldChange: true
                                    });
                                }
                            }


                            return true;
                        });
                    }
                }
            } catch (errorAgregaPlantillas) {
                log.error({ title: 'errorAgregaPlantillas', details: errorAgregaPlantillas });
            }

        }

        function sendMail(context, record_now, recType, pagot, cartaportecheck, ocultagenerarcert, uuidFactura) {
            var cfdiversion = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_version' });
            var status_cfdi = record_now.getValue({ fieldId: 'custbody_psg_ei_status' });
            var enviar_correos = record_now.getValue({ fieldId: 'custbody_efx_fe_send_cert_docs' });
            var destinatarios = record_now.getValue({ fieldId: 'custbody_efx_fe_mail_to' });
            var certificado = record_now.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
            var certificado_status = record_now.getValue({ fieldId: 'custbody_psg_ei_status' });
            if (recType == "customerpayment") {
                var cliente = record_now.getValue({ fieldId: 'customer' });
            }else{
                var cliente = record_now.getValue({ fieldId: 'entity' });
            }

            log.audit({ title: 'cfdiversion', details: cfdiversion });
            log.audit({ title: 'status_cfdi', details: status_cfdi });
            log.audit({ title: 'enviar_correos', details: enviar_correos });
            log.audit({ title: 'destinatarios', details: destinatarios });
            var xml_timbrado = record_now.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
            var pdf_timbrado = record_now.getValue({ fieldId: 'custbody_edoc_generated_pdf' });

            var form = context.form;
            form.clientScriptModulePath = "./EFX_FE_Send_To_Mail_CS.js";
            var tranData = {
                tranid: record_now.id,
                trantype: recType,
                cliente: cliente
            };
            if (enviar_correos && destinatarios && recType != record.Type.PURCHASE_ORDER) {
                if (destinatarios.length > 0) {

                    // form.addButton({
                    //     id: "custpage_btn_sent_mail",
                    //     label: "Envio de Correo Electrónico",
                    //     functionName: "sendToMail(" + JSON.stringify(tranData) + ")"
                    // });
                }
            }
            log.audit({ title: 'pagot', details: pagot });
            if (pagot == 'pago') {
                if (ocultagenerarcert) {
                    var button_send = form.getButton({
                        id: 'custpage_send_ei_button'
                    });
                    if (button_send) {
                        button_send.isHidden = true;
                    }

                    var button_gen = form.getButton({
                        id: 'custpage_generate_ei_button'
                    });
                    if (button_gen) {
                        button_gen.isHidden = true;
                    }

                    var button_cert = form.getButton({
                        id: 'custpage_send_certify_ei_button'
                    });
                    if (button_cert) {
                        button_cert.isHidden = true;
                    }
                }

                var monto_no_app = record_now.getValue({ fieldId: 'unapplied' });
                log.audit({ title: 'monto_no_app', details: monto_no_app });
                // if(monto_no_app==0) {
                log.audit({title: 'ocultagenerarcert ~ 1226', details: ocultagenerarcert});
                if (ocultagenerarcert) {
                    log.audit({title: 'uuidFactura', details: uuidFactura});
                    if (!uuidFactura) {
                        log.audit({title: 'status_cfdi', details: status_cfdi});
                        if ((status_cfdi != 3 && status_cfdi != 7) || (!certificado && certificado_status)) {
                            log.audit({title: 'habilitado', details: habilitado});
                            if (habilitado) {
                                if (cfdiversion == 1) {
                                    // form.addButton({
                                    //     id: "custpage_btn_timbrar",
                                    //     label: "Generar y Certificar",
                                    //     functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                                    // });
                                } else if (cfdiversion == 2 || cfdiversion == '' || !cfdiversion) {
                                    // form.addButton({
                                    //     id: "custpage_btn_timbrar",
                                    //     label: "Generar y Certificar",
                                    //     functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                                    // });
                                }
                            }
                        }
                    }
                }
                // }
            } else if (pagot == 'gbl') {
                if (!certificado) {
                    if ((status_cfdi != 3 && status_cfdi != 7) || (!certificado && certificado_status)) {
                        if (habilitado) {
                            // form.addButton({
                            //     id: "custpage_btn_timbrar_gbl",
                            //     label: "Generar y Certificar GBL",
                            //     functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                            // });
                        }
                    }
                }
            } else if (pagot == 'cartaPorteOC' && cartaportecheck) {

                var button_send = form.getButton({
                    id: 'custpage_send_ei_button'
                });
                if (button_send) {
                    button_send.isHidden = true;
                }

                var button_gen = form.getButton({
                    id: 'custpage_generate_ei_button'
                });
                if (button_gen) {
                    button_gen.isHidden = true;
                }

                var button_cert = form.getButton({
                    id: 'custpage_send_certify_ei_button'
                });
                if (button_cert) {
                    button_cert.isHidden = true;
                }

                if (!certificado) {
                    if ((status_cfdi != 3 && status_cfdi != 7) || (!certificado && certificado_status)) {

                        /*form.addButton({
                            id: "custpage_btn_timbrar_gbl",
                            label: "Generar Carta Porte",
                            functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                        });*/
                    }
                }
            } else {
                if (ocultagenerarcert) {
                    log.audit({ title: 'ocultagenerarcert', details: ocultagenerarcert });
                    var button_send = form.getButton({
                        id: 'custpage_send_ei_button'
                    });
                    if (button_send) {
                        button_send.isHidden = true;
                    }

                    var button_gen = form.getButton({
                        id: 'custpage_generate_ei_button'
                    });
                    if (button_gen) {
                        button_gen.isHidden = true;
                    }

                    var button_cert = form.getButton({
                        id: 'custpage_send_certify_ei_button'
                    });
                    if (button_cert) {
                        button_cert.isHidden = true;
                    }
                }
                log.audit({title: 'certificado', details: certificado});
                if (!certificado) {
                    log.audit({title: 'ocultagenerarcert & recType', details:ocultagenerarcert +' & ' + recType});
                    if (ocultagenerarcert && recType != record.Type.PURCHASE_ORDER) {
                        log.audit({title: 'uuidFactura', details: uuidFactura});
                        if (!uuidFactura) {
                            log.audit({title: 'status_cfdi', details: status_cfdi});
                            if ((status_cfdi != 3 && status_cfdi != 7) || (!certificado && certificado_status)) {
                                log.audit({title: '~1334~ habilitado', details: habilitado});
                                if (habilitado) {
                                    log.audit({title: 'cfdiversion', details: cfdiversion});
                                    if (cfdiversion == 1) {
                                        // form.addButton({
                                        //     id: "custpage_btn_timbrar",
                                        //     label: "Generar y Certificar",
                                        //     functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                                        // });
                                    } else if (cfdiversion == 2 || cfdiversion == '' || !cfdiversion) {
                                        // var domain =url.resolveDomain({
                                        //     hostType: url.HostType.APPLICATION
                                        // });
                                
                                        // log.emergency('Domain Name 🐣🐣🐣:', domain);
                                        // var containsSubstring = domain.includes("6212323");

                                        // if(containsSubstring && recType==record.Type.INVOICE){
                                        //     form.addButton({
                                        //         id: "custpage_btn_stamp_new",
                                        //         label: "Generar y Certificar",
                                        //         functionName: "invoice_stamp(" + JSON.stringify(tranData) + ")"
                                        //     });
                                        // }else{
                                        //     form.addButton({
                                        //         id: "custpage_btn_timbrar",
                                        //         label: "Generar y Certificar",
                                        //         functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                                        //     });

                                        // }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


        function calculaParcialidad(factura_id, recordnowid) {
            var filtrosparcialidad = new Array();
            filtrosparcialidad.push(['type', 'anyof', 'CustPymt']);
            filtrosparcialidad.push('AND');
            filtrosparcialidad.push(['appliedtotransaction.internalid', 'anyof', factura_id]);
            if (recordnowid) {
                filtrosparcialidad.push('AND');
                filtrosparcialidad.push(['internalid', 'noneof', recordnowid]);
            }
            var customerpaymentSearchObj = search.create({
                type: search.Type.CUSTOMER_PAYMENT,
                filters: filtrosparcialidad,
            });
            var searchResultCount = customerpaymentSearchObj.runPaged().count;
            var nextSequenceNumber = searchResultCount + 1;
            return nextSequenceNumber;
        }

        function ocultaBotonCancela(button_cancel, button_cancel_s, timestamptimbre) {

            log.audit({ title: 'timestamptimbre', details: timestamptimbre });
            log.audit({ title: 'button_cancel', details: button_cancel });
            log.audit({ title: 'button_cancel_s', details: button_cancel_s });
            if (timestamptimbre) {
                var fechafin = timestamptimbre.split('T');
                var fechafinText = fechafin[0] + ' ' + fechafin[1];
                var now = moment(new Date()); //todays date
                var end = moment(fechafinText, "YYYY-MM-DD HH:mm:ss"); // another date
                var duration = moment.duration(now.diff(end));
                var horasdiff = duration.asHours();

                log.audit({ title: 'horasdiff', details: horasdiff });

                if (horasdiff > 72) {
                    log.audit({ title: 'horasdiff', details: horasdiff });
                    if (button_cancel) {
                        button_cancel.isHidden = true;
                    }
                    if (button_cancel_s) {
                        button_cancel_s.isHidden = true;
                    }
                }

            }


        }

        function searchLocalTax(arrayTax) {

            var objRespuesta = {
                array: [],
                total: 0
            };
            log.audit({ title: 'arrayTax', details: arrayTax });
            try {
                if (arrayTax && arrayTax[0]) {
                    var filtersSearch = [
                        ['isinactive', search.Operator.IS, 'F']
                    ];
                    var lengtArrayTax = 0;
                    lengtArrayTax = arrayTax.length;

                    log.audit({ title: 'lengtArrayTax', details: JSON.stringify(lengtArrayTax) });
                    var idRecordFilter = [];
                    idRecordFilter.push([
                        'internalid', search.Operator.IS, arrayTax[0]
                    ]);

                    for (var i = 1; i < lengtArrayTax; i++) {
                        idRecordFilter.push('or');
                        idRecordFilter.push([
                            'internalid', search.Operator.IS, arrayTax[i]
                        ]);
                    }

                    log.audit({ title: 'idRecordFilter', details: JSON.stringify(idRecordFilter) });

                    filtersSearch.push('and');
                    filtersSearch.push(idRecordFilter);

                    log.audit({ title: 'filtersSearch', details: JSON.stringify(filtersSearch) });
                    var result = search.create({
                        type: 'customrecord_efx_fe_impuestos_locales',
                        filters: filtersSearch,
                        columns: [
                            {
                                name: 'custrecord_efx_fe_il_tasa_retencion'
                            }, {
                                name: 'custrecord_efx_fe_il_importe'
                            }, {
                                name: 'custrecord_efx_fe_il_imp_loc_ret'
                            },
                            // { join: '', name: '' }
                        ]
                    });
                    var resultData = result.run();
                    var start = 0;
                    do {
                        var resultSet = resultData.getRange(start, start + 1000);
                        if (resultSet && resultSet.length > 0) {
                            for (var i = 0; i < resultSet.length; i++) {
                                log.audit({
                                    title: 'resultSet[' + i + ']',
                                    details: JSON.stringify(resultSet[i])
                                });
                                var id = resultSet[i].id;
                                var tasa_retencion = resultSet[i].getValue({ name: 'custrecord_efx_fe_il_tasa_retencion' }) || '';
                                var importe = resultSet[i].getValue({ name: 'custrecord_efx_fe_il_importe' }) || 0;
                                var imp_loc_ret = resultSet[i].getValue({ name: 'custrecord_efx_fe_il_imp_loc_ret' }) || '';
                                if (importe) {
                                    importe = parseFloat(importe);
                                    importe = importe.toFixed(6) || 0;
                                    objRespuesta.total = parseFloat(objRespuesta.total) + parseFloat(importe);
                                }
                                var porcentaje = tasa_retencion;
                                if (tasa_retencion) {
                                    tasa_retencion = tasa_retencion.replace(/%/g, '');
                                    tasa_retencion = parseFloat(tasa_retencion);
                                    tasa_retencion = tasa_retencion / 100;
                                    tasa_retencion = tasa_retencion.toFixed(6);
                                    log.audit({ title: 'tasa_retencion', details: JSON.stringify(tasa_retencion) });
                                }
                                objRespuesta.array.push({ id: id, impLocRetenido: imp_loc_ret, importe: importe, tasadeRetencion: tasa_retencion, porcentaje: porcentaje });
                            }
                        }
                        start += 1000;
                    } while (resultSet && resultSet.length == 1000);
                    objRespuesta.total = parseFloat(objRespuesta.total).toFixed(6);
                }
            } catch (error) {
                log.audit({ title: 'error buscar impuestos locales', details: JSON.stringify(error) });
            }
            log.audit({ title: 'objRespuesta', details: objRespuesta });
            return objRespuesta;
        }

        function regeneraPDF(context, record_now, recType) {

            var certificado = record_now.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });

            var form = context.form;
            form.clientScriptModulePath = "./EFX_FE_Send_To_Mail_CS.js";
            var tranData = {
                tranid: record_now.id,
                trantype: recType
            };
            if (certificado) {
                // form.addButton({
                //     id: "custpage_btn_gen_pdf",
                //     label: "Regenerar PDF SAT",
                //     functionName: "regeneraPDF(" + JSON.stringify(tranData) + ")"
                // });
            }

        }

        function generaAnticipos(context, record_now, recType,cliente) {

            var form = context.form;
            form.clientScriptModulePath = "./EFX_FE_Send_To_Mail_CS.js";
            var tranData = {
                tranid: record_now.id,
                trantype: recType,
                anticipo: true,
                cliente:cliente
            };

            form.addButton({
                id: "custpage_btn_anticipo",
                label: "Certificar Anticipo",
                functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
            });

        }

        function aplicarAnticipos(context, record_now, recType) {
            var form = context.form;
            form.clientScriptModulePath = "./EFX_FE_Send_To_Mail_CS.js";
            var tranData = {
                tranid: record_now.id,
                trantype: recType,
                anticipo: true,
                entity: '',
                location: '',
                total: '',
            };


            tranData.entity = record_now.getValue({ fieldId: 'entity' });
            tranData.location = record_now.getValue({ fieldId: 'location' });
            tranData.total = record_now.getValue({ fieldId: 'total' });
            form.addButton({
                id: "custpage_btn_aplicar_ap",
                label: "Aplicar Anticipo",
                functionName: "openSL_Anticipo(" + JSON.stringify(tranData) + ")"
            });
        }
        function controlMensajesAccesoFacturacion(context, form) {
            try {
                //if (context.type == context.UserEventType.EDIT && context.type == context.UserEventType.VIEW) {
                //Se obtienen la información de la compañia
                var conpanyinformationObj = config.load({
                    type: config.Type.COMPANY_INFORMATION
                });
                //ID de la compañia
                accountid = conpanyinformationObj.getValue('companyid');
                log.emergency({title:'accountid',details:accountid});
                //Consumo del servicio
                var direccionurl = 'https://tstdrv2220345.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1316&deploy=1&compid=TSTDRV2220345&h=2ba1e9ebabd86b428ef5&accountid=' + accountid;

                var response = https.get({
                    url: direccionurl,
                });
                
                //Parametros obtenidos para validacion del acceso
                log.audit({title:'response.code',details:response.code});
                if(response.code==200){
                    var respuesta = JSON.parse(response.body);

                    habilitado = respuesta.enabled;
                    showMessage = respuesta.showMessage;
                    messageDetail = respuesta.messageDetail;
                    isBloqued = respuesta.isBloqued;
                    log.audit({ title: 'Respuesta:', details: respuesta });
                }else{
                    //MOD: 26/01/2024 en caso de no tener una respuesta de deployment, siga habilitado facturación por el caso de que se cae la instancia de deployment
                    habilitado = true;
                    showMessage = false;
                    messageDetail = '';
                    isBloqued = false;
                    
                }
                if (!habilitado ) {
                    form.removeButton({ id: 'submitter' });
                    form.removeButton({ id: 'saveemail' });
                    form.removeButton({ id: 'submitnew' });
                    form.removeButton({ id: 'saveprint' });
                    form.removeButton({ id: 'edit' });

                }
                if (showMessage && messageDetail != "" && !isBloqued) {
                    var form = context.form;
                    form.addPageInitMessage({
                        type: message.Type.WARNING,
                        message: messageDetail,

                    });
                    context.form = form
                }else{
                    if (isBloqued && messageDetail != "") {
                        var form = context.form;
                        form.addPageInitMessage({
                            type: message.Type.ERROR,
                            message: messageDetail,
                        });
                        context.form = form
                    }
                }

            } catch (e) {
                log.error({ title: 'Error controlMensajesAccesoFacturacion:', details: e });
            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,


        };

    });
