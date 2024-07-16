/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
 define(['N/record','N/search','N/runtime','./EFX_FE_Importe_en_Letra_ST','N/record','N/currency', 'N/config','./moment.js','N/query','N/file','N/format','N/ui/serverWidget', 'N/ui/message', 'N/url', 'N/https'],
 /**
  * @param{record} record
  */
 function(record,search,runtime,mod_monto_letra,modRecord,modcurrency, config,moment,query,file,format,serverWidget, message, url, https) {

         /**
          * Function definition to be triggered before record is loaded.
          *
          * @param {Object} scriptContext
          * @param {Record} scriptContext.newRecord - New record
          * @param {Record} scriptContext.oldRecord - Old record
          * @param {string} scriptContext.type - Trigger type
          * @Since 2015.2
          */

          var accountid = '', messageDetail = '', showMessage = false, isBloqued = false;
         function beforeLoad(context) {
                 var newRec = context.newRecord;
                 var recType = newRec.type;
                 var form = context.form;
                 form.clientScriptModulePath = "./EFX_FE_Facturacion_CS.js";
                 controlMensajesAccesoFacturacion(context, form);
                 log.audit({ title: 'ID de la compañia:', details: accountid });
                
                 //script de cancelacion
                     cancelacioncfdi(context,form);
                 //script de status cfdi
                 statuscfdi(context,form);
                 
                 if(recType != 'customsale_efx_fe_factura_global' && recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion') {
                         //carta porte beforeloan
                         cartaporteBeforeLoad(context,form);
                 }

                 if(recType == record.Type.INVOICE || recType == record.Type.CASH_SALE) {
                    //script de addendas
                    try{
                       addendizador(context,form);
                    }catch(erroraddendizador){
                       log.error({title:'erroraddendizador',details:'No tiene instalado el addendizador'});
                    }
                }
                 
                 if(recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion') {
                     scriptdatossubsidiariabeforeload(context,form);
                 }
                 
         }

         function beforeSubmit(context) {
                 var newRec = context.newRecord;
                 var recType = newRec.type;

                 var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
                 var clienteKiosko = newRec.getValue('custbody_efx_fe_kiosko_customer');

                     if (recType == record.Type.CUSTOMER_PAYMENT) {
                         var clienteid = newRec.getValue('customer');
                     } else {
                         var clienteid = newRec.getValue('entity');
                     }

                     if(clienteKiosko){
                         var clienteid = clienteKiosko;
                     }

                     log.audit({title:'newRec',details:newRec});
                     log.audit({title:'recType',details:recType});
                     log.audit({title:'clienteid',details:clienteid});
                     var clienteObj = '';
                     if(clienteid){
                         if(recType != record.Type.PURCHASE_ORDER && recType != record.Type.ITEM_RECEIPT && recType != record.Type.ITEM_FULFILLMENT && recType != record.Type.VENDOR_BILL && recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion') {
                             clienteObj = record.load({
                                 type:record.Type.CUSTOMER,
                                 id:clienteid
                             });
                         }
                         }
                 //script de CFDI_Information

                 if(recType != record.Type.PURCHASE_ORDER && recType != record.Type.ITEM_FULFILLMENT && recType != record.Type.ITEM_RECEIPT && recType != record.Type.VENDOR_BILL && recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion') {
                         cfdiinformation(context,clienteid,clienteObj);
                 }

                 if(recType != 'customsale_efx_fe_factura_global' && recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion') {
                         //script comercio exterior
                         if((recType == record.Type.INVOICE || recType == record.Type.ITEM_FULFILLMENT || recType == record.Type.CASH_SALE)){
                             comercioexteriorbeforeSubmit(context,clienteObj);
                         }

                         if((recType == record.Type.CUSTOMER_PAYMENT)){
                             dataFactorajebeforeSubmit(context,clienteObj);
                         }
                 }

                 //informacion de cfdi y botones
                 if(recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion') {
                     scriptdatossubsidiariabeforesubmit(context,clienteObj,existeSuiteTax);
                 }
         }

         function afterSubmit(context){
                 var newRec = context.newRecord;
                 var recType = newRec.type;
                 var recID = newRec.id;
                 if(context.type != context.UserEventType.DELETE){


                     var record_now = modRecord.load({
                         type: recType,
                         id: recID,
                         isDynamic:false
                     });

                     if (recType == modRecord.Type.CUSTOMER_PAYMENT) {
                        var clienteid = record_now.getValue('customer');
                    } else {
                        var clienteid = record_now.getValue('entity');
                    }

                    if(clienteid){
                        if(recType != modRecord.Type.PURCHASE_ORDER && recType != modRecord.Type.ITEM_RECEIPT && recType != modRecord.Type.ITEM_FULFILLMENT && recType != modRecord.Type.VENDOR_BILL && recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion') {
                            clienteObj = modRecord.load({
                                type:modRecord.Type.CUSTOMER,
                                id:clienteid
                            });
                        }
                        }
                     //script de Monto en letra
                     if(recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion' && recType != record.Type.ITEM_FULFILLMENT && recType !=record.Type.ITEM_RECEIPT) {
                         record_now = obtenMontoLetra(context,record_now);
                     }

                     if(recType != 'customsale_efx_fe_factura_global' && recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion' && recType !=record.Type.ITEM_RECEIPT && recType !=record.Type.PURCHASE_ORDER){
                         //carta porte aftersubmit
                         var custbody_efx_fe_carta_porte = record_now.getValue({ fieldId: 'custbody_efx_fe_carta_porte' });
                         if(custbody_efx_fe_carta_porte && (recType == record.Type.INVOICE || recType == record.Type.ITEM_FULFILLMENT || recType == record.Type.SALES_ORDER || recType == record.Type.PURCHASE_ORDER || recType == record.Type.ITEM_RECEIPT || recType == record.Type.CASH_SALE)){
                                 record_now = cartaporteAfterSubmit(context,record_now);
                         }

                         //script de taxJSON
                         /* The above code is calling the function calcularTaxJson(context) when the record is
                         saved. */
                         if(recType == record.Type.INVOICE || recType == record.Type.SALES_ORDER || recType == record.Type.CASH_SALE || recType == record.Type.PURCHASE_ORDER || recType == record.Type.CREDIT_MEMO){
                            log.audit({title: 'json', details: ''});
                         record_now = calcularTaxJson(context,record_now);
                         }
                         if(recType == record.Type.CREDIT_MEMO){
                                 record_now = creditMemoCheckUE(context,record_now);
                         }
                     }

                     if(recType != record.Type.PURCHASE_ORDER && recType != record.Type.ITEM_FULFILLMENT && recType != record.Type.ITEM_RECEIPT && recType != record.Type.VENDOR_BILL && recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion') {
                        cfdiinformationafters(context,clienteid,clienteObj);
                }

                     

                     record_now.save({enableSourcing: false, ignoreMandatoryFields: true});
             }
         }

         //DatosSubsidiaria.js
         function scriptdatossubsidiariabeforeload(context,form){
             log.audit({title: 'DatosSubsidiaria.js beforeload', details: ''});
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
                 if (docCertificado) {
                     //var formaTran = context.form;
                     form.removeButton({
                         id: 'delete'
                     });
                 }
             }
             if (context.type == context.UserEventType.VIEW) {

                 //var formaTran = context.form;
                 var uuidFactura = record_now.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });
                 var gblrecord = record_now.getValue({ fieldId: 'custbody_efx_fe_gbl_related' });

                 if (uuidFactura && recType != 'customsale_efx_fe_factura_global' && gblrecord) {
                     var button_cancel = form.getButton({
                         id: 'custpage_btn_cancel_cfdi'
                     });
                     var button_cancel_s = form.getButton({
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
                         //var form = context.form;
                         var button_cancel = form.getButton({
                             id: 'custpage_btn_cancel_cfdi'
                         });
                         var button_cancel_s = form.getButton({
                             id: 'custpage_btn_cancel_s_cfdi'
                         });


                         var timestamptimbre = record_now.getValue({ fieldId: 'custbody_mx_cfdi_certify_timestamp' });

                         ocultaBotonCancela(button_cancel, button_cancel_s, timestamptimbre,form);
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
                     sendMail(context, record_now, recType, pagot, cartaportecheck, ocultagenerarcert,form);
                     var regenerarpdf = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_regenerar_pdf' });
                     log.audit({ title: 'regenerarpdf', details: regenerarpdf });

                     if (regenerarpdf) {
                         regeneraPDF(context, record_now, recType,form);
                     }

                 }

                 var custscript_efx_fe_anticipo = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_anticipo' });
                 var custscript_efx_fe_item_ap = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_item_ap' });
                 var custscript_efx_fe_item_ap_ex = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_item_ap_ex' });
                 
                 if (custscript_efx_fe_anticipo && !uuidFactura && (recType == record.Type.INVOICE || recType == record.Type.CASH_SALE)) {
                     var lineCountItem = record_now.getLineCount({ sublistId: 'item' });
                     var articuloanticipo = '';
                     if(lineCountItem==1){
                         for(var a=0;a<lineCountItem;a++){
                             articuloanticipo = record_now.getSublistValue({
                                 sublistId: 'item',
                                 fieldId: 'item',
                                 line: a
                             });
                         }
 
                         if(articuloanticipo==custscript_efx_fe_item_ap || articuloanticipo==custscript_efx_fe_item_ap_ex){
                             generaAnticipos(context, record_now, recType);
                         }
                     }

                     var articuloaplicaranticipo = '';
                     var aplicaAnticiposBoton = false;
                     for(var a=0;a<lineCountItem;a++){
                        articuloaplicaranticipo = record_now.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: a
                        });
                        if(articuloaplicaranticipo!=custscript_efx_fe_item_ap && articuloaplicaranticipo!=custscript_efx_fe_item_ap_ex){
                            aplicaAnticiposBoton = true;
                        }
                    }

                    if(aplicaAnticiposBoton){
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
                         var fechaActualP = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_date_payment_2' });
                     }

                     log.audit({ title: 'checkfecha', details: fechaActualP });
                     log.audit({ title: 'fechaActualP', details: fechaActualP });

                     if (desglosagrupoarticulos && recType != record.Type.ITEM_FULFILLMENT && recType != record.Type.TRANSFER_ORDER && recType != record.Type.PURCHASE_ORDER && recType != record.Type.ITEM_RECEIPT  && recType != 'customsale_efx_fe_factura_global' && recType !='customrecord_efx_fe_cp_carta_porte' && recType !='customrecord_efx_pagos_compensacion') {
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

         //DatosSubsidiaria.js
         function scriptdatossubsidiariabeforesubmit(context,clienteObjparam,existeSuiteTax){
             log.audit({title: 'DatosSubsidiaria.js beforesubmit', details: ''});
             log.audit({ title: 'bef', details: 'bef' });
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

                     if (recType == record.Type.CREDIT_MEMO || recType == record.Type.INVOICE || recType == record.Type.CUSTOMER_PAYMENT) {

                     if (context.type == context.UserEventType.EDIT) {
                             var relacionados_count = record_now.getLineCount({ sublistId: 'recmachcustrecord_mx_rcs_orig_trans' });
                             log.audit({ title: 'relacionados_count', details: relacionados_count });
                             var relacionados = new Array();
                             for (var rel = 0; rel < relacionados_count; rel++) {
                             var relacionados_obj = {
                                     fol: '',
                                     type: '',
                                     uuid: ''
                             };
                             var factura_rel = record_now.getSublistText({
                                     sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                                     fieldId: 'custrecord_mx_rcs_rel_cfdi',
                                     line: rel
                             });

                             var uuid_rel = record_now.getSublistValue({
                                     sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                                     fieldId: 'custrecord_mx_rcs_uuid',
                                     line: rel
                             });
                             var tipo_rel = record_now.getSublistText({
                                     sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                                     fieldId: 'custrecord_mx_rcs_rel_type',
                                     line: rel
                             });
                             relacionados_obj.fol = factura_rel;
                             relacionados_obj.uuid = uuid_rel;
                             relacionados_obj.type = tipo_rel;

                             relacionados.push(relacionados_obj);
                             }

                             // relacionados = relacionados+factura_rel+': '+uuid_rel+'\n';

                             log.audit({ title: 'relacionados', details: relacionados });
                             record_now.setValue({
                             fieldId: 'custbody_efx_fe_related_cfdi_json',
                             value: JSON.stringify(relacionados),
                             ignoreFieldChange: true
                             });
                     }
                     }
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
                             
                             if(existeSuiteTax){                                
                                rfc_sub = subsidiary_record.getSublistValue({ sublistId: 'taxregistration', fieldId: 'taxregistrationnumber', line: 0 });
                             }else{
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
                             if(zonahorariavalue){
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
                     }
                     if (recType == record.Type.CUSTOMER_PAYMENT) {
                     var fechaActualP = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_date_payment_2' });
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


                             if (!desglosagrupoarticulos) {
                             var linecountgart = record_now.getLineCount({ sublistId: 'item' });
                             for (var x = 0; x < linecountgart; x++) {
                                     var tipogrupo = record_now.getSublistValue({
                                     sublistId: 'item',
                                     fieldId: 'itemtype',
                                     line: x,
                                     });

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

             if (recType == record.Type.INVOICE || recType == record.Type.CASH_SALE || recType == record.Type.CREDIT_MEMO || recType == record.Type.CUSTOMER_PAYMENT || recType == record.Type.ITEM_FULFILLMENT || recType == record.Type.TRANSFER_ORDER) {
                 
                     agregaPlantillas(context,record_now,recType,clienteObjparam);
             }

         }

         //EFX_FE_Addendizador_UE.js
         function addendizador(context,form){
             log.audit({title: 'EFX_FE_Addendizador_UE.js', details: ''});
             if (context.type == context.UserEventType.VIEW) {
                     var record_context = context.newRecord || '';
                     var idRecord = record_context.id || '';
                     var typeRecord = record_context.type || '';
                     log.audit({ title: 'idRecord', details: JSON.stringify(idRecord) });
                     log.audit({ title: 'typeRecord', details: JSON.stringify(typeRecord) });

                     var entity = record_context.getValue({ fieldId: 'entity' }) || '';
                     var addenda = record_context.getValue({ fieldId: 'custbody_mx_cfdi_sat_addendum' }) || '';


                     var xml_Addenda = '';
                     var xml_Addenda_name = '';
                     if (entity) {
                         var LookupField = search.lookupFields({
                             type: record.Type.CUSTOMER,
                             id: entity,
                             columns: ['custentity_efx_fe_default_addenda','custentity_efx_fe_default_addenda.custrecord_efx_fe_a_xml']
                         }) || '';
                         log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) });
                         if (LookupField != '' && LookupField.custentity_efx_fe_default_addenda.length > 0) {
                             xml_Addenda = LookupField["custentity_efx_fe_default_addenda.custrecord_efx_fe_a_xml"];
                             xml_Addenda_name = LookupField["custentity_efx_fe_default_addenda"];
                         }
                     }

                     log.audit({ title: 'xml_Addenda', details: JSON.stringify(xml_Addenda) });
                     log.audit({ title: 'xml_Addenda_name', details: JSON.stringify(xml_Addenda_name) });

                     if (xml_Addenda_name /*&& !addenda*/) {

                         var objParam = {
                             tranid: idRecord,
                             trantype: typeRecord,
                             addenda: xml_Addenda,
                             addenda_name: xml_Addenda_name[0].text
                         };
                         log.audit({ title: 'objParam', details: JSON.stringify(objParam) });
                         form.addButton({
                             id: "custpage_btn_create_addenda",
                             label: "Crear Addenda",
                             functionName: "create_addenda(" + JSON.stringify(objParam) + ")"
                         });

                     }
                 }
         }

         //EFX_FE_CE_UE.js
         function comercioexteriorbeforeSubmit(context,clienteObjparam){
             log.audit({title: 'EFX_FE_CE_UE.js', details: ''});
             try {
                     var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
                     var record = context.newRecord;
                     var recID = record.id;
                     var recType = record.type;

                     if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                         var record = context.newRecord;

                         var custbody_efx_fe_comercio_exterior = record.getValue({ fieldId: 'custbody_efx_fe_comercio_exterior' });


                         //Comercio Exterior
                         var exchange = '';
                         var datae=1;
                         if (custbody_efx_fe_comercio_exterior) {
                             if(recType == modRecord.Type.ITEM_FULFILLMENT){
                                 var creadodeff = record.getValue({fieldId:'createdfrom'});
                                 try{
                                     var creadodeffReco = modRecord.load({
                                        type: modRecord.Type.SALES_ORDER,
                                        id: creadodeff
                                     });
                                     var tipoTransaccionff = creadodeffReco.type;
                                     log.audit({
                                         title: 'tipoTransaccionff',
                                         details: tipoTransaccionff
                                     });
                                 }catch(errortransaccionff){
                                     log.audit({
                                         title: 'errortransaccionff',
                                         details: errortransaccionff
                                     });
                                     var creadodeffReco = modRecord.load({
                                         type: modRecord.Type.TRANSFER_ORDER,
                                         id: creadodeff
                                     });
                                     var tipoTransaccionff = creadodeffReco.type;
                                     log.audit({
                                         title: 'tipoTransaccionff',
                                         details: tipoTransaccionff
                                     });
                                 }
                             }

                             var cliente_id = record.getValue({fieldId: 'entity'});
                             var destinatario_id = record.getValue({fieldId: 'custbody_efx_fe_ce_destinatario_name'});
                             var subsidiaries_id = '';
                             if (SUBSIDIARIES) {
                                 subsidiaries_id = record.getValue({fieldId: 'subsidiary'});
                             }

                             var obj_direccion = {
                                 emisor: {
                                     Nombre:'',
                                     Calle: '',
                                     NumeroExterior: '',
                                     NumeroInterior: '',
                                     Colonia: '',
                                     Localidad: '',
                                     Referencia: '',
                                     Municipio: '',
                                     Estado: '',
                                     Pais: '',
                                     CodigoPostal: '',
                                     RegimenFiscal:'',
                                     Rfc:''
                                 },
                                 receptor: {
                                     Nombre:'',
                                     Calle: '',
                                     NumeroExterior: '',
                                     NumeroInterior: '',
                                     Colonia: '',
                                     Localidad: '',
                                     Referencia: '',
                                     Municipio: '',
                                     Estado: '',
                                     Pais: '',
                                     CodigoPostal: '',
                                     Destinatario: '',
                                     Rfc:'',
                                     UsoCFDI:''
                                 },
                                 destinatario: {
                                     Calle: '',
                                     NumeroExterior: '',
                                     NumeroInterior: '',
                                     Colonia: '',
                                     Localidad: '',
                                     Municipio: '',
                                     Estado: '',
                                     Pais: '',
                                     CodigoPostal: '',

                                 },
                                 articulos:[],
                                 cfdi:{
                                     TipoCambio:'',
                                     LugarExpedicion:'',

                                 }
                             }

                             var json_direccion = buscarDirecciones(cliente_id, subsidiaries_id, obj_direccion, SUBSIDIARIES, destinatario_id,creadodeffReco,creadodeff,tipoTransaccionff,clienteObjparam);

                             var objRecIF = '';
                             var moneda_id = '';
                             if(recType == modRecord.Type.ITEM_FULFILLMENT) {

                                 var idRelacionado = record.getValue('createdfrom');
                                 moneda_id = record.getValue({fieldId: 'custbody_efx_fe_ce_currency_des'});

                                 objRecIF = modRecord.load({
                                     type: tipoTransaccionff,
                                     id: creadodeff
                                 });
                             }else{
                                 moneda_id = record.getValue({fieldId: 'currency'});
                             }
                             //}else{

                             if(!moneda_id){
                                 var moneda = record.getValue('currencycode');
                             }else{
                                 var moneda_record = modRecord.load({
                                     type: modRecord.Type.CURRENCY,
                                     id: moneda_id,
                                     isDynamic: true,
                                 });
                                 var moneda = moneda_record.getValue('symbol');
                             }

                             //}

                             log.audit({
                                 title: 'custbody_efx_fe_comercio_exterior',
                                 details: custbody_efx_fe_comercio_exterior
                             });
                             log.audit({title: 'moneda', details: moneda});

                             var noDollar = moneda != 'USD';
                             log.audit({title: 'noDollar', details: JSON.stringify(noDollar)});

                             if (noDollar) {

                                 var configRecObj = config.load({
                                     type: config.Type.COMPANY_INFORMATION
                                 });

                                 var config_currency = '';
                                 var local_currency = '';

                                 if(recType == modRecord.Type.ITEM_FULFILLMENT) {
                                     var moneda_id_des = record.getValue({fieldId: 'custbody_efx_fe_ce_currency'});
                                     var moneda_record_des = modRecord.load({
                                         type: modRecord.Type.CURRENCY,
                                         id: moneda_id_des,
                                         isDynamic: true,
                                     });
                                     local_currency = moneda_record_des.getValue('symbol');
                                 }else{
                                     if (SUBSIDIARIES) {
                                         var subsidiaria_id = record.getValue({fieldId: 'subsidiary'});
                                         var subsidiary_info = search.lookupFields({
                                             type: search.Type.SUBSIDIARY,
                                             id: subsidiaria_id,
                                             columns: ['currency']
                                         });

                                         log.audit({title: 'subsidiary_info.currency: ', details: subsidiary_info.currency});
                                         local_currency = search.lookupFields({
                                             type: search.Type.CURRENCY,
                                             id: subsidiary_info.currency[0].value,
                                             columns: ['symbol']
                                         });

                                     } else {
                                         config_currency = configRecObj.getValue({
                                             fieldId: 'basecurrency'
                                         });

                                         local_currency = search.lookupFields({
                                             type: search.Type.CURRENCY,
                                             id: config_currency,
                                             columns: ['symbol']
                                         });
                                     }
                                 }

                                 log.audit({title: 'local_currency: ', details: local_currency});
                                 if(moneda!='USD' && moneda!='MXN'){
                                     exchange = modcurrency.exchangeRate({
                                         source: 'USD',
                                         target: local_currency.symbol,
                                         //target: 'MXN',
                                         date: record.getValue({fieldId: 'trandate'})
                                     }) || 0;
                                     log.audit({title: 'exchange: ', details: exchange});
                                 }else{
                                     exchange = modcurrency.exchangeRate({
                                         source: moneda,
                                         target: local_currency.symbol,
                                         //target: 'MXN',
                                         date: record.getValue({fieldId: 'trandate'})
                                     }) || 0;
                                     log.audit({title: 'exchange: ', details: exchange});
                                 }


                                 datae = exchange;


                             } else {
                                 if(recType == modRecord.Type.ITEM_FULFILLMENT) {

                                     var configRecObj = config.load({
                                         type: config.Type.COMPANY_INFORMATION
                                     });

                                     var config_currency = '';
                                     var local_currency = '';

                                     if (SUBSIDIARIES) {
                                         var subsidiaria_id = record.getValue({fieldId: 'subsidiary'});
                                         var subsidiary_info = search.lookupFields({
                                             type: search.Type.SUBSIDIARY,
                                             id: subsidiaria_id,
                                             columns: ['currency']
                                         });

                                         log.audit({title: 'subsidiary_info.currency: ', details: subsidiary_info.currency});
                                         local_currency = search.lookupFields({
                                             type: search.Type.CURRENCY,
                                             id: subsidiary_info.currency[0].value,
                                             columns: ['symbol']
                                         });

                                     } else {
                                         config_currency = configRecObj.getValue({
                                             fieldId: 'basecurrency'
                                         });

                                         local_currency = search.lookupFields({
                                             type: search.Type.CURRENCY,
                                             id: config_currency,
                                             columns: ['symbol']
                                         });
                                     }


                                     log.audit({title: 'local_currency: ', details: local_currency});
                                     exchange = modcurrency.exchangeRate({
                                         source: moneda,
                                         target: local_currency.symbol,
                                         //target: 'MXN',
                                         date: record.getValue({fieldId: 'trandate'})
                                     }) || 0;
                                     log.audit({title: 'exchange: ', details: exchange});

                                     datae = 1;

                                 }else {
                                     //exchange = record.getValue({fieldId: 'exchangerate'});
                                var config_currency = '';
                                var local_currency = '';

                                if (SUBSIDIARIES) {
                                    var subsidiaria_id = record.getValue({fieldId: 'subsidiary'});
                                    var subsidiary_info = search.lookupFields({
                                        type: search.Type.SUBSIDIARY,
                                        id: subsidiaria_id,
                                        columns: ['currency']
                                    });

                                    log.audit({title: 'subsidiary_info.currency: ', details: subsidiary_info.currency});
                                    local_currency = search.lookupFields({
                                        type: search.Type.CURRENCY,
                                        id: subsidiary_info.currency[0].value,
                                        columns: ['symbol']
                                    });

                                } else {
                                    config_currency = configRecObj.getValue({
                                        fieldId: 'basecurrency'
                                    });

                                    local_currency = search.lookupFields({
                                        type: search.Type.CURRENCY,
                                        id: config_currency,
                                        columns: ['symbol']
                                    });
                                }
                                log.audit({title: 'local_currency: ', details: local_currency});
                                
                                //exchange = record.getValue({fieldId: 'exchangerate'});
                                datae = 1;
                                var sql = "SELECT TOP 3 ";
                               sql+=" cr.id, b.symbol as basecurrency, c.symbol as transactioncurrency,  cr.effectivedate, cr.exchangerate";
                               sql+=" FROM ";
                               sql+="  currencyrate as cr, currency as c, currency b where c.id = transactioncurrency and c.symbol = '"+moneda+"' and b.id = basecurrency and b.symbol = '"+local_currency['symbol']+"'";                               
                               sql+=" ORDER BY ";
                               sql+=" cr.id DESC";
                   

                               var results = query.runSuiteQL({
                                   query: sql
                               }).asMappedResults();

                               log.audit({title: 'results: ', details: results});
                               var fechahoy = record.getValue({fieldId: 'trandate'});
                               var parsedDateHoy= format.parse({
                                   value: fechahoy,
                                   type: format.Type.DATE
                            });
                            
                               var fechaahora = new Date();                                    
                               if(fechaahora.getDate()==parsedDateHoy.getDate() && fechaahora.getMonth()==parsedDateHoy.getMonth() && fechaahora.getFullYear()==parsedDateHoy.getFullYear()){
                                   exchange = results[0].exchangerate;
                               }else{
                                   exchange = results[1].exchangerate;
                               }

                                 }
                             }

                             log.audit({title: 'exchange: ', details: exchange});
                            

                             //record.setValue({fieldId: 'custbody_efx_fe_ce_exchage', value: exchange});


                             var numLines = record.getLineCount({sublistId: 'item'});
                             log.audit({title: 'Item numLines: ', details: numLines});

                             var totalValorDolares = 0;
                             for (var l = 0; l < numLines; l++) {
                                 try {
                                     var item = record.getSublistValue({sublistId: 'item', fieldId: 'item', line: l}) || '';
                                     var itemtype = record.getSublistValue({
                                         sublistId: 'item',
                                         fieldId: 'itemtype',
                                         line: l
                                     }) || '';

                                     log.audit({title: 'item', details: item});
                                     log.audit({title: 'itemtype', details: itemtype});

                                     //Comercio Exterior
                                     if (custbody_efx_fe_comercio_exterior && (itemtype!='Group' && itemtype!='EndGroup')) {
                                         var quantity = record.getSublistValue({
                                             sublistId: 'item',
                                             fieldId: 'quantity',
                                             line: l
                                         }) || '';
                                         var formula = record.getSublistValue({
                                             sublistId: 'item',
                                             fieldId: 'custcol_efx_fe_ce_formula',
                                             line: l
                                         }) || '';

                                         if(objRecIF){
                                             var unit_price = objRecIF.getSublistValue({
                                                 sublistId: 'item',
                                                 fieldId: 'rate',
                                                 line: l
                                             }) || '';
                                             var total_item_price = objRecIF.getSublistValue({
                                                 sublistId: 'item',
                                                 fieldId: 'amount',
                                                 line: l
                                             }) || '';
                                         }else{
                                             var unit_price = record.getSublistValue({
                                                 sublistId: 'item',
                                                 fieldId: 'rate',
                                                 line: l
                                             }) || '';
                                             var total_item_price = record.getSublistValue({
                                                 sublistId: 'item',
                                                 fieldId: 'amount',
                                                 line: l
                                             }) || '';
                                         }

                                         var result = quantity;

                                         log.audit({title: 'quantity', details: quantity});
                                         log.audit({title: 'formula', details: formula});
                                         log.audit({title: 'unit_price', details: unit_price});
                                         log.audit({title: 'total_item_price', details: total_item_price});
                                         log.audit({title: 'result', details: result});
                                         if(recType == modRecord.Type.ITEM_FULFILLMENT) {
                                             if (quantity && formula) {
                                                 var formula_t = formula.replace('*','')
                                                 formula = quantity + formula;
                                                 log.audit({
                                                     title: 'Item formula: ' + l,
                                                     details: formula
                                                 });
                                                 result = eval(formula);
                                                 result = quantity/formula_t;

                                                 log.audit({
                                                     title: 'Item result: ' + l,
                                                     details: result
                                                 });
                                                 var resultup = unit_price*formula_t;
                                             }
                                             if (result) {
                                                 result = result.toFixed(3);
                                                 record.setSublistValue({
                                                     sublistId: 'item',
                                                     fieldId: 'custcol_efx_fe_ce_cant_aduana',
                                                     value: result,
                                                     line: l
                                                 });
                                             }
                                         }else {
                                             if (quantity && formula) {
                                                 var formula_t = formula.replace('*','')
                                                 formula = quantity + formula;
                                                 log.audit({
                                                     title: 'Item formula: ' + l,
                                                     details: formula
                                                 });
                                                 result = eval(formula);


                                                 log.audit({
                                                     title: 'Item result: ' + l,
                                                     details: result
                                                 });
                                             }
                                             if (result) {
                                                 result = result.toFixed(3);
                                                 record.setSublistValue({
                                                     sublistId: 'item',
                                                     fieldId: 'custcol_efx_fe_ce_cant_aduana',
                                                     value: result,
                                                     line: l
                                                 });
                                             }

                                         }
                                         if(recType == modRecord.Type.ITEM_FULFILLMENT) {
                                             var t_cambio = exchange;
                                         }else{
                                             var t_cambio = record.getValue({fieldId: 'exchangerate'});
                                         }
                                         //

                                         log.audit({title: 'unit_price', details: unit_price});
                                         log.audit({title: 't_cambio', details: t_cambio});
                                         log.audit({title: 'datae', details: datae});
                                         if(moneda!='USD' && moneda!='MXN'){

                                             var diftipcamb = t_cambio/datae;
                                             var unitAduana = (unit_price *  diftipcamb)/formula_t;
                                         }else{
                                             var unitAduana = unit_price * (t_cambio / datae);
                                         }


                                         if (!noDollar) {

                                             log.audit({title: 'formula_t', details: formula_t});
                                             if(recType == modRecord.Type.ITEM_FULFILLMENT) {
                                                 var unitAduana = unit_price / datae;
                                             }else{
                                                 var unitAduana = unit_price / formula_t;
                                             }

                                         }
                                         log.audit({title: 'unitAduana', details: unitAduana});
                                         if(recType == modRecord.Type.ITEM_FULFILLMENT) {
                                             var unitAduana=resultup;
                                         }

                                         var valAduana = runtime.getCurrentScript().getParameter({ name: 'custscript_tko_calc_val_aduana' });
                                         log.audit({title: 'valAduana', details: valAduana});

                                         if (valAduana || valAduana == true || valAduana == 'true' || valAduana == 'T') {
                                             if (unitAduana) {
                                                unitAduana = unitAduana.toFixed(2);
                                                 record.setSublistValue({
                                                     sublistId: 'item',
                                                     fieldId: 'custcol_efx_fe_ce_val_uni_aduana',
                                                     value: unitAduana,
                                                     line: l
                                                 });
                                             }
                                         } else {
                                             log.audit({title: 'valAduana (ELSE)', details: valAduana});
                                         }

                                         var valordedolares = 0;
                                         log.audit({title: 'moneda-valordolares', details: moneda});
                                         if (moneda!='USD' && moneda!='MXN') {
                                             valordedolares = (total_item_price * t_cambio) / datae;
                                             log.audit({title: 'valordedolares-eur', details: valordedolares});
                                         } else {
                                             valordedolares = total_item_price / datae;
                                             log.audit({title: 'valordedolares-noeur', details: valordedolares});
                                         }

                                         valordedolares = valordedolares.toFixed(2);
                                         valordedolares = parseFloat(valordedolares);

                                         if (noDollar) {
                                             totalValorDolares = totalValorDolares + valordedolares;
                                         } else {
                                             totalValorDolares = totalValorDolares + total_item_price;
                                         }
                                         record.setSublistValue({
                                             sublistId: 'item',
                                             fieldId: 'custcol_efx_fe_ce_val_dolares',
                                             value: valordedolares,
                                             line: l
                                         });


                                     }

                                     //rec.commitLine({ sublistId: 'item' });

                                 } catch (error) {
                                     log.audit({title: 'error', detail: JSON.stringify(error)});
                                 }
                             }
                             totalValorDolares = totalValorDolares.toFixed(2);
                             record.setValue({fieldId: 'custbody_efx_fe_ce_totalusd', value: totalValorDolares});
                             record.setValue({
                                 fieldId: 'custbody_efx_fe_dirjson_emisor',
                                 value: JSON.stringify(json_direccion)
                             });
                             // record.setValue({
                             //     fieldId: 'custbody_efx_fe_ce_destinatario_name',
                             //     value: json_direccion.receptor.Destinatario
                             // });
                         }
                     }

                 } catch (afterSubmitCFDIError) {
                     log.audit(
                         { title: 'afterSubmitCFDIError', details: JSON.stringify(afterSubmitCFDIError) }
                     );
                 }
         }

         //EFX_FE_CFDIStatus_UE.js
         function statuscfdi(context,form){
             log.audit({title: 'EFX_FE_CFDIStatus_UE.js', details: ''});
             var newRec = context.newRecord;
             var recType = newRec.type;
             if (context.type == context.UserEventType.VIEW) {

                 var record_cancel = context.newRecord;

                 var uuid = record_cancel.getValue({fieldId: 'custbody_mx_cfdi_uuid'}) || '';
                 log.audit({title: 'uuid', details: JSON.stringify(uuid)});


                 if ((recType == record.Type.CASH_SALE || recType == record.Type.INVOICE || recType == record.Type.CUSTOMER_PAYMENT || recType == record.Type.CREDIT_MEMO || recType == 'customsale_efx_fe_factura_global') && uuid) {
                     var tranData = {
                         tranid: record_cancel.id,
                         trantype: record_cancel.type,
                         uuid: uuid
                     };
                     form.addButton({
                         id: "custpage_btn_consulta_estatus_sat",
                         label: "Consulta Estatus SAT",
                         functionName: "ConsultaEstatusSat(" + JSON.stringify(tranData) + ")"
                     });
                 }

             }
         }

         //EFX_FE_Carta_Porte_UE.js
         function cartaporteBeforeLoad(context,form){
             log.audit({title: 'EFX_FE_Carta_Porte_UE.js beforeload', details: ''});
             var record_now = context.newRecord;
             var recType = record_now.type;

             if (context.type == context.UserEventType.VIEW) {
                     if(recType == modRecord.Type.CASH_SALE || recType == modRecord.Type.ITEM_FULFILLMENT  || recType == modRecord.Type.TRANSFER_ORDER || recType == modRecord.Type.PURCHASE_ORDER || recType == modRecord.Type.ITEM_RECEIPT || recType == modRecord.Type.SALES_ORDER) {

                             var tranData = {
                                     tranid: record_now.id,
                                     trantype: recType,
                                     tipo:'',
                                     idtimbre:''
                             };

                             var idsCPRel = record_now.getValue({fieldId:'custbody_efx_fe_cp_gencp'});
                             var custbody_efx_fe_carta_porte = record_now.getValue({ fieldId: 'custbody_efx_fe_carta_porte' });
                             log.audit({title:'custbody_efx_fe_carta_porte',details:custbody_efx_fe_carta_porte});
                             log.audit({title:'idsCPRel',details:idsCPRel});
                             log.audit({title:'idsCPRellength',details:idsCPRel.length});

                             var cuentanoCreadas = 0;
                             var idatimbrar='';
                             var recID = record_now.id;
                             if(custbody_efx_fe_carta_porte){
                             if(idsCPRel.length > 0){
                                     var buscacps = search.create({
                                             type: 'customrecord_efx_fe_cp_carta_porte',
                                             filters:[
                                                 ['isinactive',search.Operator.IS,'F']
                                                 ,'AND',
                                                 ['internalid',search.Operator.ANYOF,idsCPRel]
                                                 ,'AND',
                                                 ['custrecord_efx_fe_cp_ctransccion',search.Operator.ANYOF,recID]
                                                 ,'AND',
                                                 ['custrecord_efx_fe_cp_cuuid',search.Operator.ISNOTEMPTY,'']
                                             ],
                                             columns: [
                                                     search.createColumn({name: 'internalid'}),
                                             ]
                                     });
                                     cuentanoCreadas = buscacps.runPaged().count;
                                     log.audit({title:'cuentanoCreadas',details:cuentanoCreadas});

                                     var buscacpstimbre = search.create({
                                             type: 'customrecord_efx_fe_cp_carta_porte',
                                             filters:[
                                                     ['isinactive',search.Operator.IS,'F']
                                                     ,'AND',
                                                     ['internalid',search.Operator.ANYOF,idsCPRel]
                                                     ,'AND',
                                                     ['custrecord_efx_fe_cp_ctransccion',search.Operator.ANYOF,recID]
                                                     ,'AND',
                                                     ['custrecord_efx_fe_cp_cuuid',search.Operator.ISEMPTY,'']
                                             ],
                                             columns: [
                                                     search.createColumn({name: 'internalid'}),
                                             ]
                                     });
                                     buscacpstimbre.run().each(function(result) {
                                             idatimbrar = result.getValue({name: 'internalid'}) || 0;
                                             log.audit({title:'idatimbrar',details:idatimbrar});
                                             return true;
                                     });
                             }

                             if(cuentanoCreadas==idsCPRel.length || idsCPRel.length==0){
                                     form.addButton({
                                             id: "custpage_btn_newcp",
                                             label: "Nueva Carta Porte",
                                             functionName: "creaCP(" + JSON.stringify(tranData) + ")"
                                     });
                             }else{
                                     tranData.tipo='multiple';
                                     tranData.idtimbre=idatimbrar;
                                     log.audit({title:'idatimbrar',details:idatimbrar});
                                     log.audit({title:'tranData',details:tranData});
                                     form.addButton({
                                             id: "custpage_btn_timbrar_cp",
                                             label: "Generar Carta Porte",
                                             functionName: "generaCertificaGBLCP(" + JSON.stringify(tranData) + ")"
                                     });
                             }
                     }

                     }
             }
         }

         //EFX_FE_Carta_Porte_UE.js
         function cartaporteAfterSubmit(context,record_now_param){
             log.audit({title: 'EFX_FE_Carta_Porte_UE.js Aftersubmit', details: ''});
                 var record_now = context.newRecord;
                 try {
                         var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
                         var recID = record_now.id;
                         var recType = record_now.type;
                         var record = record_now_param;

                         if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                                 // var record = context.newRecord;

                                 var custbody_efx_fe_carta_porte = record.getValue({ fieldId: 'custbody_efx_fe_carta_porte' });
                                 log.audit({title:'custbody_efx_fe_carta_porte',details:custbody_efx_fe_carta_porte});

                                 //Comercio Exterior
                                 var exchange = '';
                                 var datae=1;
                                 if (custbody_efx_fe_carta_porte) {
                                         if(recType == modRecord.Type.ITEM_FULFILLMENT){
                                                 var creadodeff = record.getValue({fieldId:'createdfrom'});
                                                 var usocfdiIFF = record.getValue({fieldId:'custbody_mx_cfdi_usage'});
                                                 log.audit({title:'creadodeff1',details:creadodeff});
                                                 try{
                                                         var creadodeffReco = modRecord.load({
                                                                 type: modRecord.Type.SALES_ORDER,
                                                                 id: creadodeff
                                                         });
                                                         var tipoTransaccionff = creadodeffReco.type;
                                                         log.audit({
                                                                 title: 'tipoTransaccionff',
                                                                 details: tipoTransaccionff
                                                         });
                                                 }catch(errortransaccionff){
                                                         log.audit({
                                                                 title: 'errortransaccionff',
                                                                 details: errortransaccionff
                                                         });
                                                         var creadodeffReco = modRecord.load({
                                                                 type: modRecord.Type.TRANSFER_ORDER,
                                                                 id: creadodeff
                                                         });
                                                         var tipoTransaccionff = creadodeffReco.type;
                                                         log.audit({
                                                                 title: 'tipoTransaccionff',
                                                                 details: tipoTransaccionff
                                                         });
                                                 }
                                         }else{
                                                 var creadodeff = recID;
                                                 var usocfdiIFF = record.getValue({fieldId:'custbody_mx_cfdi_usage'});

                                                 if(recType == modRecord.Type.PURCHASE_ORDER){
                                                         var creadodeffReco = modRecord.load({
                                                                 type: modRecord.Type.PURCHASE_ORDER,
                                                                 id: recID
                                                         });
                                                         var tipoTransaccionff = 'purchaseorder';

                                                 }else if(recType == modRecord.Type.ITEM_RECEIPT){
                                                         var creadodeffReco = modRecord.load({
                                                                 type: modRecord.Type.ITEM_RECEIPT,
                                                                 id: recID
                                                         });
                                                         var tipoTransaccionff = 'itemreceipt';
                                                 }else if(recType == modRecord.Type.CASH_SALE){
                                                         var creadodeffReco = modRecord.load({
                                                                 type: modRecord.Type.CASH_SALE,
                                                                 id: recID
                                                         });
                                                         var tipoTransaccionff = 'cashsale';
                                                 }else if(recType == modRecord.Type.SALES_ORDER){
                                                         var creadodeffReco = modRecord.load({
                                                                 type: modRecord.Type.SALES_ORDER,
                                                                 id: recID
                                                         });
                                                         var tipoTransaccionff = 'salesorder';
                                                 }else{
                                                         var creadodeffReco = modRecord.load({
                                                                 type: modRecord.Type.INVOICE,
                                                                 id: recID
                                                         });
                                                         var tipoTransaccionff = 'invoice';
                                                 }



                                         }

                                         var cliente_id = record.getValue({fieldId: 'entity'});
                                         var subsidiaries_id = '';
                                         if (SUBSIDIARIES) {
                                                 subsidiaries_id = record.getValue({fieldId: 'subsidiary'});
                                         }
                                         log.audit({title:'cliente_id',details:cliente_id});

                                         var obj_direccion = {
                                                 emisor: {
                                                         Nombre:'',
                                                         Calle: '',
                                                         NumeroExterior: '',
                                                         NumeroInterior: '',
                                                         Colonia: '',
                                                         Localidad: '',
                                                         Referencia: '',
                                                         Municipio: '',
                                                         Estado: '',
                                                         Pais: '',
                                                         CodigoPostal: '',
                                                         RegimenFiscal:'',
                                                         Rfc:''
                                                 },
                                                 receptor: {
                                                         Nombre:'',
                                                         Calle: '',
                                                         NumeroExterior: '',
                                                         NumeroInterior: '',
                                                         Colonia: '',
                                                         Localidad: '',
                                                         Referencia: '',
                                                         Municipio: '',
                                                         Estado: '',
                                                         Pais: '',
                                                         CodigoPostal: '',
                                                         Destinatario: '',
                                                         Rfc:'',
                                                         UsoCFDI:''
                                                 },
                                                 destinatario: {
                                                         Calle: '',
                                                         NumeroExterior: '',
                                                         NumeroInterior: '',
                                                         Colonia: '',
                                                         Localidad: '',
                                                         Municipio: '',
                                                         Estado: '',
                                                         Pais: '',
                                                         CodigoPostal: '',

                                                 },
                                                 articulos:[],
                                                 cfdi:{
                                                         TipoCambio:'',
                                                         LugarExpedicion:'',

                                                 },
                                                 IDOrigen:'',
                                                 IDDestino:'',
                                                 CPUbicaciones:[],
                                                 CPFiguraTransporte:[],
                                                 CPAutoTransporte:{},

                                         }

                                         var json_direccion = buscarDireccionesCP(cliente_id, subsidiaries_id, obj_direccion, SUBSIDIARIES,creadodeffReco,creadodeff,tipoTransaccionff,usocfdiIFF);

                                         json_direccion = datosCP(json_direccion,record,recID,recType);

                                         record.setValue({
                                                 fieldId: 'custbody_ex_fe_cp_json_dir',
                                                 value: JSON.stringify(json_direccion)
                                         });

                                 }
                         }
                         return record;

                         //record.save({enableSourcing: true,
                             //ignoreMandatoryFields: true});
                 } catch (afterSubmitCFDIError) {
                         log.audit(
                             { title: 'afterSubmitCFDIError', details: JSON.stringify(afterSubmitCFDIError) }
                         );
                 }
         }

         //EFX_FE_Cancelacion_UE.js
         function cancelacioncfdi(context,form){
             log.audit({title: 'EFX_FE_Cancelacion_UE.js', details: ''});
             var newRec = context.newRecord;
             var recType = newRec.type;
             if (context.type == context.UserEventType.VIEW || (context.type == context.UserEventType.EDIT && recType == 'customrecord_efx_fe_cp_carta_porte')) {

                 var record_cancel = context.newRecord;

                 var status = record_cancel.getValue({fieldId: 'approvalstatus'}) || '';
                 var APPROVALSTATUS = (status == 2 || status == '');

                 var uuid = record_cancel.getValue({fieldId: 'custbody_mx_cfdi_uuid'}) || '';
                 log.audit({title: 'uuid', details: JSON.stringify(uuid)});

                 var custbody_efx_fe_cancelled = record_cancel.getValue(
                     {fieldId: 'custbody_efx_fe_cfdi_cancelled'}
                 );

                 var statuscancelled = record_cancel.getValue(
                     {fieldId: 'custbody_efx_fe_cfdistatus'}
                 );
                 var transustitucion = record_cancel.getValue(
                     {fieldId: 'custbody_efx_fe_sustitucion'}
                 );

                 if(statuscancelled){
                     var canceladosat = statuscancelled.indexOf("Estado Sat: Cancelado");
                     var canceladocomprobante = statuscancelled.indexOf("Estado de Comprobante: Cancelado");
                 }


                 if(recType == 'customrecord_efx_pagos_compensacion'){
                     uuid = record_cancel.getValue({fieldId: 'custrecord_efx_compensacion_uuid'}) || '';
                     custbody_efx_fe_cancelled = record_cancel.getValue(
                         {fieldId: 'custrecord_efx_compensacion_cancel'}
                     );
                 }

                 if(recType == 'customrecord_efx_fe_cp_carta_porte'){
                     uuid = record_cancel.getValue({fieldId: 'custrecord_efx_fe_cp_cuuid'}) || '';
                     custbody_efx_fe_cancelled = record_cancel.getValue(
                         {fieldId: 'custrecord_efx_fe_cp_ccancel'}
                     );
                 }


                 if (recType == record.Type.INVOICE || recType == record.Type.CREDIT_MEMO || recType == record.Type.CUSTOMER_PAYMENT || recType == record.Type.CASH_SALE || recType == record.Type.ITEM_FULFILLMENT || recType == 'customsale_efx_fe_factura_global' || recType == 'customrecord_efx_pagos_compensacion' || recType == 'customrecord_efx_fe_cp_carta_porte') {

                     if ((!custbody_efx_fe_cancelled && uuid)) {

                         var entidad = record_cancel.getValue(
                             {fieldId: 'entity'}
                         );
                         var fechatransaccion = record_cancel.getValue(
                            {fieldId: 'trandate'}
                        );
                        
                        
                         var tranData = {
                             tranid: record_cancel.id,
                             trantype: record_cancel.type,
                             entityid:entidad,
                             trandate:fechatransaccion
                         };

                         log.audit({title: 'tranData', details: JSON.stringify(tranData)});
                         form.addButton({
                             id: "custpage_btn_cancel_cfdi",
                             label: "Cancelar CFDI",
                             functionName: "cancel_CFDI(" + JSON.stringify(tranData) + ")"
                         });

                         if(recType != 'customsale_efx_fe_factura_global' && recType != 'customrecord_efx_pagos_compensacion' && recType != 'customrecord_efx_fe_cp_carta_porte' && recType != record.Type.CUSTOMER_PAYMENT && recType != record.Type.CREDIT_MEMO && recType != record.Type.ITEM_FULFILLMENT) {
                             /*form.addButton({
                                 id: "custpage_btn_cancel_s_cfdi",
                                 label: "Cancelar/Sustituir CFDI",
                                 functionName: "cancel_subs_CFDI(" + JSON.stringify(tranData) + ")"
                             });*/
                         }

                     }
                     log.audit({title: 'canceladosat', details: JSON.stringify(canceladosat)});
                     log.audit({title: 'canceladocomprobante', details: JSON.stringify(canceladocomprobante)});
                     log.audit({title: 'transustitucion', details: JSON.stringify(transustitucion)});

                     if(canceladosat > 0 && canceladocomprobante > 0 && !transustitucion){
                         log.audit({title: 'recType', details: JSON.stringify(recType)});
                         var entidad = record_cancel.getValue(
                             {fieldId: 'entity'}
                         );
                         var fechatransaccion = record_cancel.getValue(
                            {fieldId: 'trandate'}
                        );
                       
                         var tranData = {
                             tranid: record_cancel.id,
                             trantype: record_cancel.type,
                             solosustituye:'T',
                             entityid:entidad,
                             trandate:fechatransaccion
                         };
                         if(recType != 'customsale_efx_fe_factura_global' && recType != 'customrecord_efx_pagos_compensacion' && recType != 'customrecord_efx_fe_cp_carta_porte' && recType != record.Type.CUSTOMER_PAYMENT && recType != record.Type.CREDIT_MEMO) {
                             log.audit({title: 'transustitucion', details: JSON.stringify(transustitucion)});
                             form.addButton({
                                 id: "custpage_btn_cancel_solo_cfdi",
                                 label: "Sustituir",
                                 functionName: "cancel_subs_CFDI(" + JSON.stringify(tranData) + ")"
                             });
                         }
                     }

                 }


             }

         }

         //EFX_FE_CFDI_Information.js
         function cfdiinformation(scriptContext,clienteid,clienteObjparam){
             log.audit({title: 'EFX_FE_CFDI_Information.js', details: ''});
             if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
                     var record_noww = scriptContext.newRecord;
                     var recType = record_noww.type;

                     if(clienteid){
                         log.audit({title:'record_noww.id',details:record_noww.id});
                         var clienteObj = clienteObjparam;

                         if(clienteObj){
                             var usoCFDI = clienteObj.getValue({fieldId:'custentity_efx_mx_cfdi_usage'});
                             var metodoPago = clienteObj.getValue({fieldId:'custentity_efx_mx_payment_term'});
                             var formaPago = clienteObj.getValue({fieldId:'custentity_efx_mx_payment_method'});
                         }
                         

                         log.audit({title:'usoCFDI',details:usoCFDI});
                         log.audit({title:'metodoPago',details:metodoPago});
                         log.audit({title:'formaPago',details:formaPago});

                         var usoCFDI_record = record_noww.getValue({fieldId:'custbody_mx_cfdi_usage'});
                         var formaPago_record = record_noww.getValue({fieldId:'custbody_mx_txn_sat_payment_method'});
                         var metodoPago_record = record_noww.getValue({fieldId:'custbody_mx_txn_sat_payment_term'});

                         if(!usoCFDI_record){
                             record_noww.setValue({fieldId:'custbody_mx_cfdi_usage',value:usoCFDI});
                         }
                         if(!metodoPago_record){
                             record_noww.setValue({fieldId:'custbody_mx_txn_sat_payment_term',value:metodoPago});
                         }
                         if(!formaPago_record){
                             record_noww.setValue({fieldId:'custbody_mx_txn_sat_payment_method',value:formaPago});
                         }


                     }


                 }
         }

         //EFX_FE_Monto_Letra_UE.js
         function obtenMontoLetra(context,record_now_param){
             log.audit({title: 'EFX_FE_Monto_Letra_UE.js', details: ''});
             log.audit({title: 'context', details: context});
             log.audit({title: 'record_now_param', details: record_now_param});
                 if (context.type == context.UserEventType.CREATE) {
                         try {
                                 var record_noww = context.newRecord;
                                 var recType = record_noww.type;
                                 var record_now = record_now_param;



                                 var currency = record_now.getValue({fieldId: 'currency'}) || '';
                                 var total = record_now.getValue({fieldId: 'total'}) || '';
                                 var diferenciaTimbrado = record_now.getValue({fieldId: 'custbody_efx_fe_diftimbrado'}) || '';

                                 if(recType=='customsale_efx_fe_factura_global'){
                                    var subt=record_now.getValue({fieldId: 'custbody_efx_fe_gbl_subtotal'}) || '0';
                                    var taxt=record_now.getValue({fieldId: 'custbody_efx_fe_gbl_totaltax'}) || '0';
                                    total = parseFloat(subt)+parseFloat(taxt);
                                }

                                 log.audit({title: 'currency', details: currency});
                                 log.audit({title: 'total', details: total});

                                 var moneda_record = record.load({
                                         type: record.Type.CURRENCY,
                                         id: currency,
                                         isDynamic: true,
                                 });

                                 var moneda = moneda_record.getValue('symbol');

                                 if(diferenciaTimbrado && recType != record.Type.CREDIT_MEMO) {
                                         montoLetraField = mod_monto_letra.importeLetra(parseFloat((total+diferenciaTimbrado).toFixed(2)), 'spanish', moneda);
                                 }else if(recType=='customsale_efx_fe_factura_global'){
                                        montoLetraField = mod_monto_letra.importeLetra(total, 'spanish', moneda);
                                }else{
                                         montoLetraField = mod_monto_letra.importeLetra(total, 'spanish', moneda);
                                 }

                                 log.audit({title: 'montoLetraField', details: montoLetraField});

                                 record_now.setValue({
                                         fieldId: 'custbody_efx_fe_total_text',
                                         value: montoLetraField,
                                         ignoreFieldChange: true
                                 });
                                 /*record_now.save({
                                         enableSourcing: false,
                                         ignoreMandatoryFields: true
                                 });*/
                                 return record_now;
                         }catch(error_new){
                                 log.audit({title: 'error_new', details: error_new});
                                 return record_now;
                         }
                 }else if (context.type == context.UserEventType.EDIT) {
                         var record_noww = context.newRecord;
                         var recType = record_noww.type;
                         var record_now = record_now_param;
                         try {
                                 var currency = record_now.getValue({fieldId: 'currency'}) || '';
                                 var total = record_now.getValue({fieldId: 'total'}) || '';
                                 var diferenciaTimbrado = record_now.getValue({fieldId: 'custbody_efx_fe_diftimbrado'}) || '';
                                 if(recType=='customsale_efx_fe_factura_global'){
                                    var subt=record_now.getValue({fieldId: 'custbody_efx_fe_gbl_subtotal'}) || '0';
                                    var taxt=record_now.getValue({fieldId: 'custbody_efx_fe_gbl_totaltax'}) || '0';
                                    total = parseFloat(subt)+parseFloat(taxt);
                                }

                                 log.audit({title: 'currency_old', details: currency});
                                 log.audit({title: 'total_old', details: total});

                                 var moneda_record = record.load({
                                         type: record.Type.CURRENCY,
                                         id: currency,
                                         isDynamic: true,
                                 });

                                 var moneda = moneda_record.getValue('symbol');

                                 if(diferenciaTimbrado && recType != record.Type.CREDIT_MEMO) {
                                         montoLetraField = mod_monto_letra.importeLetra(parseFloat((total+diferenciaTimbrado).toFixed(2)), 'spanish', moneda);
                                 }else if(recType=='customsale_efx_fe_factura_global'){
                                        montoLetraField = mod_monto_letra.importeLetra(total, 'spanish', moneda);
                                }else{
                                         montoLetraField = mod_monto_letra.importeLetra(total, 'spanish', moneda);
                                 }
                                 log.audit({title: 'montoLetraField', details: montoLetraField});

                                 record_now.setValue({
                                         fieldId: 'custbody_efx_fe_total_text',
                                         value: montoLetraField,
                                         ignoreFieldChange: true
                                 });

                                 /*record_now.save({
                                         enableSourcing: false,
                                         ignoreMandatoryFields: true
                                 });*/
                                 return record_now;
                         }catch(error_old){
                                 log.audit({title: 'error_old', details: error_old});
                                 return record_now;
                         }
                 }else{
                     return record_now_param;
                 }
         }

         //Sección taxJSON EFX_FE_Tax_Fields_UE.js
         function calcularTaxJson(context,record_now_param){
             log.audit({title: 'EFX_FE_Tax_Fields_UE.js', details: ''});
             var obj_Json_Tax_totales = new Object();

             //objeto de totales de impuestos(cabecera)
             obj_Json_Tax_totales = {
                 ieps_total: 0,
                 iva_total: 0,
                 retencion_total: 0,
                 local_total: 0,
                 exento_total: 0,
                 ieps_total_gbl: 0,
                 iva_total_gbl: 0,
                 retencion_total_gbl: 0,
                 local_total_gbl: 0,
                 exento_total_gbl: 0,
                 rates_ieps:{},
                 rates_ieps_data:{},
                 bases_ieps:{},
                 rates_iva:{},
                 rates_iva_data:{},
                 bases_iva:{},
                 rates_retencion:{},
                 rates_retencion_data:{},
                 bases_retencion:{},
                 rates_local:{},
                 rates_local_data:{},
                 bases_local:{},
                 rates_exento:{},
                 rates_exento_data:{},
                 bases_exento:{},
                 monto_ieps_gbl:{},
                 monto_iva_gbl:{},
                 monto_ret_gbl:{},
                 monto_local_gbl:{},
                 monto_exento_gbl:{},
                 descuentoConImpuesto:0,
                 descuentoSinImpuesto:0,
                 totalImpuestos:0,
                 subtotal:0,
                 total:0,
                 totalTraslados:0,
                 totalRetenciones:0,
                 diferenciaTotales:0,
                 totalImpuestos_gbl:0,
                 subtotal_gbl:0,
                 total_gbl:0,
                 totalTraslados_gbl:0,
                 totalRetenciones_gbl:0,
             }

             var obj_diferencias = new Object();


             try {
                 if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                     var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
                     var record_noww = context.newRecord;
                     var recType = record_noww.type;
                     if(recType == record.Type.CREDIT_MEMO && existeSuiteTax){
                             record_now_param.save({enableSourcing: false, ignoreMandatoryFields: true});
                         var record_now = record.load({
                             type: recType,
                             id: record_noww.id,
                             isDynamic:true
                         });

                     }else{
                         var record_now = record_now_param;
                     }
                     if(existeSuiteTax){
                         var record_now_nodymamic = record.load({
                             type: recType,
                             id: record_noww.id,
                             isDynamic:false

                         });
                         var countimpuesto = record_now.getLineCount({sublistId:'taxdetails'});
                     }

                    var tienecuenta = record_now.getValue({fieldId: 'account'});
                    var concuenta = false;
                    if(tienecuenta && recType == record.Type.CASH_SALE){
                        concuenta=true;
                    }
                    if(recType != record.Type.CASH_SALE){
                        concuenta=true;
                    }
                    if(concuenta){
                        var imlocaltotallinea = 0;
                        var factEspejo = record_now.getValue({fieldId: 'custbody_efx_fe_gbl_ismirror'});
                        var desglosagrupoarticulos = record_now.getValue({fieldId: 'custbody_efx_fe_desglosa_ga'});
                        var tipogbl = record_now.getValue({fieldId: 'custbody_efx_fe_gbl_type'});
                        var descuentoglobal = record_now.getValue({fieldId: 'discounttotal'});
                        //var articuloajusteTimbrado = record_now.getValue({fieldId: 'custbody_efx_fe_item_adjust'});
                        var enviototalimporte = record_now.getValue({fieldId: 'shippingcost'}) || 0;
                        var enviototalimpuesto = record_now.getValue({fieldId: 'shippingtax1amt'}) || 0;
                        var scriptObj = runtime.getCurrentScript();
                        var custscript_efx_fe_item_imp_loc = scriptObj.getParameter({ name: 'custscript_efx_fe_item_imp_loc' }) || '';
                        var articuloajusteTimbrado = scriptObj.getParameter({ name: 'custscript_efx_fe_adjust_cert' }) || '';
                        var diftimbrado=0;
                        descuentoglobal = parseFloat(descuentoglobal)* -1;

                        log.audit({title: 'factEspejo', details: factEspejo});
                        if (factEspejo != true || (factEspejo == true && tipogbl==2)) {
                            var line_count_expense = record_now.getLineCount({sublistId: 'expense'});
                            var subtotalTran = record_now.getValue({fieldId: 'subtotal'});
                            var totalTran = record_now.getValue({fieldId: 'total'});
                            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
                            var subsidiariaTransaccion = '';
                            var nexo = '';
                            if(SUBSIDIARIES){
                                subsidiariaTransaccion = record_now.getValue({fieldId: 'subsidiary'});
                                nexo = record_now.getValue({fieldId: 'nexus_country'});
                            }

                            var obj_Json_Tax = new Object();
                            var rate_desccabecera = 0;

                            if(descuentoglobal){
                                rate_desccabecera = ((descuentoglobal*100)/subtotalTran).toFixed(2);
                                rate_desccabecera = parseFloat(rate_desccabecera)/100;
                            }

                            //busqueda de configuración de impuestos
                            var desglose_config = search.create({
                                type: 'customrecord_efx_fe_desglose_tax',
                                filters: ['isinactive', search.Operator.IS, 'F'],
                                columns: [
                                    search.createColumn({name: 'custrecord_efx_fe_desglose_ieps'}),
                                    search.createColumn({name: 'custrecord_efx_fe_desglose_ret'}),
                                    search.createColumn({name: 'custrecord_efx_fe_desglose_locales'}),
                                    search.createColumn({name: 'custrecord_efx_fe_desglose_iva'}),
                                    search.createColumn({name: 'custrecord_efx_fe_desglose_exento'}),
                                ]
                            });

                            var ejecutar = desglose_config.run();
                            var resultado = ejecutar.getRange(0, 100);

                            var config_ieps = new Array();
                            var config_retencion = new Array();
                            var config_local = new Array();
                            var config_iva = new Array();
                            var config_exento = new Array();

                            //se guarda la configuración de los tipos diferentes de impuesto en variables
                            config_ieps = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_ieps'})).split(',');
                            config_retencion = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_ret'})).split(',');
                            config_local = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_locales'})).split(',');
                            config_iva = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_iva'})).split(',');
                            config_exento = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_exento'})).split(',');

                            log.audit({title: 'config_ieps', details: config_ieps});
                            log.audit({title: 'config_retencion', details: config_retencion});
                            log.audit({title: 'config_local', details: config_local});
                            log.audit({title: 'config_iva', details: config_iva});

                            var importe_retencion = 0;
                            var importe_iva = 0;
                            var importe_exento = 0;
                            var importe_ieps = 0;
                            var importe_ieps_nf = 0;
                            var importe_local = 0;
                            var subtotalTransaccion = 0;
                            var impuestosTransaccion = 0;
                            var impuestosCalculados = 0;
                            var totalTraslados = 0;
                            var totalRetenciones = 0;
                            var line_count = record_now.getLineCount({sublistId: 'item'});

                            //recorrido de linea de articulos
                            var ieps_baseveintiseis = 0;
                            var ieps_basedieciseis = 0;

                            if(!existeSuiteTax){
                                var objImpuestos = obtenObjImpuesto(subsidiariaTransaccion,nexo);
                            }

                            var arrayJson = new Array();

                            for (var i = 0; i < line_count; i++) {
                                log.audit({title: 'inicio linea', details: i});
                                var objJsonLine = {
                                    line:'',
                                    json:{}
                                };
                                //objeto de tipos de impuesto por linea
                                obj_Json_Tax = {
                                    ieps: {
                                        name: "",
                                        id: "",
                                        factor: "003",
                                        rate: 0,
                                        base: 0,
                                        base_importe: 0,
                                        importe: '',
                                        rate_div: 0,
                                        descuento: 0
                                    },
                                    locales: {
                                        name: "",
                                        id: "",
                                        factor: "002",
                                        rate: 0,
                                        base: 0,
                                        base_importe: 0,
                                        importe: '',
                                        rate_div: 0,
                                        descuento: 0
                                    },
                                    retenciones: {
                                        name: "",
                                        id: "",
                                        factor: "002",
                                        rate: 0,
                                        base: 0,
                                        base_importe: 0,
                                        importe: '',
                                        rate_div: 0,
                                        descuento: 0
                                    },
                                    iva: {
                                        name: "",
                                        id: "",
                                        factor: "002",
                                        rate: 0,
                                        base: 0,
                                        base_importe: 0,
                                        importe: '',
                                        rate_div: 0,
                                        descuento: 0
                                    },
                                    exento: {
                                        name: "",
                                        id: "",
                                        factor: "002",
                                        rate: 0,
                                        base: 0,
                                        base_importe: 0,
                                        importe: '',
                                        rate_div: 0,
                                        descuento: 0
                                    },
                                    descuentoConImpuesto: 0,
                                    descuentoSinImpuesto: 0,
                                    montoLinea: 0,
                                    impuestoLinea: 0,
                                    impuestoLineaCalculados: 0
                                }
                                //validacion si existe alguna linea de descuento (la linea de descuento es la siguiente a la de
                                // articulo)
                                var descuento_linea = 0;
                                var descuento_linea_sin = 0;
                                var impuesto_descuento = 0;
                                var descuento_notax = 0;
                                var descuento_sitax = 0;
                                var linea_descuentos_monto = 0;
                                if(recType == record.Type.CREDIT_MEMO && existeSuiteTax){
                                    var lineNum = record_now.selectLine({
                                        sublistId: 'item',
                                        line:i
                                    });
                                    var tipo_articulo = record_now.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemtype',

                                    });var nombre_articulo = record_now.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',

                                    });
                                    log.audit({title: 'tipo_articulo', details: tipo_articulo});
                                    if (tipo_articulo == 'Discount' || nombre_articulo==articuloajusteTimbrado) {
                                        if(nombre_articulo==articuloajusteTimbrado){
                                            diftimbrado=diftimbrado+record_now.getCurrentSublistValue({sublistId: 'item', fieldId: 'amount',});
                                        }
                                        continue;
                                    }

                                    if (i < (line_count - 1)) {
                                        var lineNum = record_now.selectLine({
                                            sublistId: 'item',
                                            line:i+1
                                        });
                                        var tipo_articulo = record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'itemtype',

                                        });

                                        var nombre_articulo = record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'item',

                                        });
                                        var tieneimlocal = 0;
                                        if(nombre_articulo==custscript_efx_fe_item_imp_loc){
                                            tieneimlocal++;
                                            var a_amount_imloc = record_now.getCurrentSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'amount',

                                            });
                                            imlocaltotallinea = imlocaltotallinea + parseFloat(a_amount_imloc);
                                        }
                                        if(nombre_articulo!=articuloajusteTimbrado){
                                            if (tipo_articulo == 'Discount' && tieneimlocal==0) {
                                                linea_descuentos_monto = record_now.getCurrentSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'grossamt',

                                                });

                                                var a_rate = record_now.getCurrentSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'rate',

                                                });


                                                var a_amount = record_now.getCurrentSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'amount',

                                                });

                                                var a_quantity = record_now.getCurrentSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'quantity',

                                                });


                                                if (existeSuiteTax) {
                                                    impuesto_descuento = record_now.getCurrentSublistValue({
                                                        sublistId: 'item',
                                                        fieldId: 'taxamount',

                                                    });
                                                } else {
                                                    impuesto_descuento = record_now.getCurrentSublistValue({
                                                        sublistId: 'item',
                                                        fieldId: 'tax1amt',

                                                    });
                                                }

                                                if (!a_quantity) {
                                                    a_quantity = 1;
                                                }

                                                var a_rate_abs = a_rate * -1;
                                                var a_amount_abs = a_amount * -1;


                                                descuento_notax = record_now.getCurrentSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'amount',

                                                });
                                                descuento_sitax = record_now.getCurrentSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'grossamt',

                                                });
                                            }
                                        }

                                        descuento_linea = linea_descuentos_monto * (-1);
                                        descuento_linea_sin = descuento_notax * (-1);

                                        obj_Json_Tax_totales.descuentoConImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoConImpuesto) + descuento_linea).toFixed(2);
                                        obj_Json_Tax_totales.descuentoSinImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto) + descuento_linea_sin).toFixed(2);


                                        //almacena el impuesto con y sin impuesto en atributos del objeto de la linea de impuestos
                                        obj_Json_Tax.descuentoConImpuesto = descuento_linea.toFixed(2);
                                        obj_Json_Tax.descuentoSinImpuesto = descuento_linea_sin.toFixed(2);
                                    }
                                    var lineNum = record_now.selectLine({
                                        sublistId: 'item',
                                        line:i
                                    });
                                }else{
                                var tipo_articulo = record_now.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemtype',
                                    line: i
                                });var nombre_articulo = record_now.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    line: i
                                });
                                log.audit({title: 'tipo_articulo', details: tipo_articulo});
                                if (tipo_articulo == 'Discount' || tipo_articulo == 'Group' || tipo_articulo == 'Description' || tipo_articulo == 'EndGroup' || tipo_articulo == 'Subtotal' || nombre_articulo==articuloajusteTimbrado) {
                                    if(nombre_articulo==articuloajusteTimbrado){
                                        diftimbrado=diftimbrado+record_now.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
                                    }
                                    continue;
                                }
                                    var descuento_conteo = 1;

                                do{

                                    log.audit({title: 'iniciadescuentosuma', details: ''});
                                    var impuesto_descuento = 0;

                                if (i < (line_count - descuento_conteo)) {
                                    var descuento_notax = 0;
                                    descuento_linea=0;
                                    descuento_linea_sin=0;
                                    var tipo_articulo = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemtype',
                                        line: i + descuento_conteo
                                    });
                                    var nombre_articulo = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        line: i + descuento_conteo

                                    });
                                    var tieneimlocal = 0;
                                    var linea_descuentos_monto = 0;
                                    if(nombre_articulo==custscript_efx_fe_item_imp_loc){
                                        tieneimlocal++;
                                        var a_amount_imloc = record_now.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'amount',
                                            line: i + descuento_conteo
                                        });
                                        imlocaltotallinea = imlocaltotallinea + parseFloat(a_amount_imloc);
                                    }
                                    log.audit({title: 'nombre_articulo', details: nombre_articulo});
                                    log.audit({title: 'articuloajusteTimbrado', details: articuloajusteTimbrado});
                                    if(nombre_articulo!=articuloajusteTimbrado){
                                        if (tipo_articulo == 'Discount' && tieneimlocal==0) {
                                            linea_descuentos_monto = record_now.getSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'grossamt',
                                                line: i + descuento_conteo
                                            });

                                            var a_rate = record_now.getSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'rate',
                                                line: i + descuento_conteo
                                            });


                                            var a_amount = record_now.getSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'amount',
                                                line: i + descuento_conteo
                                            });

                                            var a_quantity = record_now.getSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'quantity',
                                                line: i + descuento_conteo
                                            });


                                            if (existeSuiteTax) {
                                                impuesto_descuento = record_now.getSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'taxamount',
                                                    line: i + descuento_conteo
                                                });
                                            } else {
                                                impuesto_descuento = record_now.getSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'tax1amt',
                                                    line: i + descuento_conteo
                                                });
                                            }

                                            if (!a_quantity) {
                                                a_quantity = 1;
                                            }

                                            var a_rate_abs = a_rate * -1;
                                            var a_amount_abs = a_amount * -1;


                                            descuento_notax = record_now.getSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'amount',
                                                line: i + descuento_conteo
                                            });
                                            descuento_sitax = record_now.getSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'grossamt',
                                                line: i + descuento_conteo
                                            });
                                        }
                                    }

                                        descuento_linea = linea_descuentos_monto * (-1);
                                        descuento_linea_sin = descuento_notax * (-1);
                                    log.audit({title: 'descuento_linea', details: descuento_linea});
                                    log.audit({title: 'descuento_linea_sin', details: descuento_linea_sin});

                                        obj_Json_Tax_totales.descuentoConImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoConImpuesto) + descuento_linea).toFixed(2);
                                        obj_Json_Tax_totales.descuentoSinImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto) + descuento_linea_sin).toFixed(2);


                                        //almacena el impuesto con y sin impuesto en atributos del objeto de la linea de impuestos
                                        obj_Json_Tax.descuentoConImpuesto = (parseFloat(obj_Json_Tax.descuentoConImpuesto) + descuento_linea).toFixed(2);
                                        obj_Json_Tax.descuentoSinImpuesto = (parseFloat(obj_Json_Tax.descuentoSinImpuesto) + descuento_linea_sin).toFixed(2);
                                    log.audit({title: 'obj_Json_Tax.descuentoConImpuesto', details: obj_Json_Tax.descuentoConImpuesto});
                                    log.audit({title: 'obj_Json_Tax.descuentoSinImpuesto', details: obj_Json_Tax.descuentoSinImpuesto});
                                    if ((tipo_articulo == 'Discount') && tieneimlocal==0 || tipo_articulo == 'Subtotal' && tieneimlocal==0){
                                        descuento_conteo++;
                                        log.audit({title:'descuento_conteo',details:descuento_conteo});
                                        if (i < (line_count - descuento_conteo)) {
                                            tipo_articulo = record_now.getSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'itemtype',
                                                line: i + descuento_conteo
                                            });
                                        }else{
                                            tipo_articulo='';
                                        }

                                    }
                                    if(nombre_articulo==custscript_efx_fe_item_imp_loc){
                                        tipo_articulo='';
                                    }

                                    }
                                    }while((tipo_articulo=='Discount' || tipo_articulo=='Subtotal'));
                                    //se obtiene el descuento en una variable para usarlo posteriormente
                                }

                                //obtiene información de campos de la linea
                                if(recType == record.Type.CREDIT_MEMO && existeSuiteTax){
                                    log.audit({title:'nc y suitetax',details:''});
                                    var base_rate = record_now.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'rate',

                                    });
                                    var base_quantity = record_now.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',

                                    });
                                    if (!base_rate) {
                                        var importe_amount = record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'amount',

                                        });
                                        base_rate = importe_amount / base_quantity;
                                    }
                                    if (!existeSuiteTax) {
                                        var tax_code = record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxcode',

                                        });
                                    }
                                    var importe_base = record_now.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'amount',

                                    });
                                }else {
                                    log.audit({title:'nc y suitetax else',details:''});

                                    var base_rate = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'rate',
                                        line: i
                                    });
                                    var base_quantity = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        line: i
                                    });
                                    if (!base_rate) {
                                        var importe_amount = record_now.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'amount',
                                            line: i
                                        });
                                        base_rate = importe_amount / base_quantity;
                                    }
                                    if (!existeSuiteTax) {
                                        var tax_code = record_now.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxcode',
                                            line: i
                                        });
                                    }
                                    var importe_base = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'amount',
                                        line: i
                                    });
                                    log.audit({title:'importe_base',details:importe_base});
                                }

                                if(descuentoglobal){
                                    descuento_notax = (importe_base*rate_desccabecera)* -1;
                                }else{
                                    descuento_notax = parseFloat(obj_Json_Tax.descuentoSinImpuesto) * -1;
                                    descuento_sitax = parseFloat(obj_Json_Tax.descuentoConImpuesto) * -1;
                                }
                                log.audit({title:'descuento_sitax',details:descuento_sitax});
                                log.audit({title:'subtotalTransaccion',details:subtotalTransaccion});
                                log.audit({title:'importe_base',details:importe_base});


                                //var importe_base = parseFloat(base_rate) * parseFloat(base_quantity);
                                subtotalTransaccion = subtotalTransaccion + parseFloat(importe_base.toFixed(2));
                                obj_Json_Tax.montoLinea = importe_base.toFixed(2);
                                if(descuentoglobal && rate_desccabecera){
                                    obj_Json_Tax.descuentoConImpuesto = (importe_base*rate_desccabecera).toFixed(2);
                                    obj_Json_Tax.descuentoSinImpuesto = (importe_base*rate_desccabecera).toFixed(2);
                                }

                                //obtiene monto de impuesto en linea
                                if(existeSuiteTax){
                                    if(recType == record.Type.CREDIT_MEMO && existeSuiteTax){
                                        var total_linea = parseFloat(record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxamount',
                                        }));
                                    }else {
                                        var total_linea = parseFloat(record_now.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxamount',
                                            line: i
                                        }));
                                    }
                                }else{
                                    var total_linea = parseFloat(record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'tax1amt',
                                        line: i
                                    }));
                                }


                                obj_Json_Tax.impuestoLinea = total_linea.toFixed(2);
                                impuestosTransaccion = impuestosTransaccion + total_linea;

                                var suma_linea = 0;
                                var suma_linea_tax = 0;
                                var suma_linea_tax_desc = 0;


                                var grupo_impuestos = true;
                                //Diferencia si se utiliza codigo o grupo de impuestos
                                if(existeSuiteTax){
                                    if(recType == record.Type.CREDIT_MEMO && existeSuiteTax){
                                        var taxref_linea = record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxdetailsreference',
                                        });
                                        var quantity_st = record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantity',
                                        });
                                    }else{
                                        var taxref_linea = record_now.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxdetailsreference',
                                            line: i
                                        });
                                        var quantity_st = record_now.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantity',
                                            line: i
                                        });
                                    }

                                    var objSuiteTax = obtieneSuiteTaxInfo(record_now,taxref_linea,countimpuesto,record_now_nodymamic);
                                    var tax_lines_count = objSuiteTax[taxref_linea].length;
                                }else{
                                    if(objImpuestos.TaxGroup.hasOwnProperty(tax_code)){
                                        grupo_impuestos = true;
                                        var tax_lines_count = objImpuestos.TaxGroup[tax_code].length;
                                    }else if(objImpuestos.TaxCodes.hasOwnProperty(tax_code)){
                                        grupo_impuestos = false;
                                        var tax_lines_count = 1;
                                    }
                                }


                                var contadorLineas = 0;
                                var tiene_ieps = 0;
                                var importeConImpuesto = parseFloat(record_now.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'grossamt',
                                    line: i
                                }));
                                var importeSinImpuesto = parseFloat(record_now.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    line: i
                                }));

                                if(existeSuiteTax){
                                    var importeDeImpuesto = parseFloat(record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'taxamount',
                                        line: i
                                    }));
                                }else{
                                    var importeDeImpuesto = parseFloat(record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'tax1amt',
                                        line: i
                                    }));
                                    
                                }

                                var baseIeps = parseFloat(record_now.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    line: i
                                }));


                                //recorrido de los diferentes impuestos que conforman la linea de articulos

                                var montoIvas = 0;
                                var montoIeps = 0;
                                var montoLocales = 0;

                                log.audit({title: 'tax_lines_count', details:tax_lines_count});

                                //Ivas para calcular ieps
                                var hayieps = 0;
                                var baseiepsmonto = 0;
                                var hayret = 0;
                                var baseiepssuitetax = '';
                                for (var x = 0; x < tax_lines_count; x++) {
                                    if(existeSuiteTax){
                                        var tax_name = objSuiteTax[taxref_linea][x].nombre;

                                        var tax_id = objSuiteTax[taxref_linea][x].taxcode;

                                        var tax_rate = objSuiteTax[taxref_linea][x].rate;

                                        var tax_base = parseFloat(objSuiteTax[taxref_linea][x].base);

                                    }else{
                                        if (grupo_impuestos) {
                                            var tax_name = objImpuestos.TaxGroup[tax_code][x].taxname2;
                                            var tax_id = objImpuestos.TaxGroup[tax_code][x].taxname;
                                            var tax_rate = objImpuestos.TaxGroup[tax_code][x].rate;
                                            var tax_base = objImpuestos.TaxGroup[tax_code][x].basis;
                                            var tax_tipo = objImpuestos.TaxGroup[tax_code][x].taxtype;
                                        } else {
                                            var tax_name = objImpuestos.TaxCodes[tax_code][x].itemid;
                                            var tax_id = objImpuestos.TaxCodes[tax_code][x].id;
                                            var tax_rate = objImpuestos.TaxCodes[tax_code][x].rate;
                                            var tax_base = '100';
                                            var tax_tipo = objImpuestos.TaxCodes[tax_code][x].taxtype;
                                        }
                                    }

                                    //var rate_replace = tax_rate.replace("%", "");
                                    var rate_number = parseFloat(tax_rate);
                                    for (var loc = 0; loc < config_local.length; loc++) {
                                        if (tax_id == config_local[loc]) {
                                            var base_calc = parseFloat(tax_base) / 100;
                                            var rate_div = rate_number / 100;
                                            montoLocales = (rate_div * parseFloat(importe_base)) * base_calc;
                                        }
                                    }

                                    for (var ret = 0; ret < config_retencion.length; ret++) {
                                        if (tax_id == config_retencion[ret]) {
                                            hayret++;
                                        }
                                    }



                                    for(var iep=0;iep<config_ieps.length;iep++){
                                        if (tax_id == config_ieps[iep]) {

                                            var baseiepsmonto = baseIeps + descuento_notax;
                                            var base_calc = parseFloat(tax_base) / 100;
                                            var rate_div = rate_number / 100;

                                            var tax_importe = (rate_div * parseFloat(baseIeps + descuento_notax)) * base_calc;
                                            montoIeps=parseFloat(tax_importe.toFixed(2));
                                            hayieps++;
                                            baseiepssuitetax=rate_number;
                                        }
                                    }

                                    for (var iva = 0; iva < config_iva.length; iva++) {
                                        var importeImpuestoCalc = 0;
                                        var importeImpuestoTotalLinea = 0;
                                        if (tax_id == config_iva[iva]) {
                                            var rate_div = rate_number / 100;

                                            importeImpuestoCalc = (((importeConImpuesto - montoLocales) + descuento_sitax) / (rate_div + 1));
                                            importeImpuestoTotalLinea = ((importeConImpuesto - montoLocales) + descuento_sitax) - importeImpuestoCalc;
                                            if(hayret>0) {
                                                var base_imp = importeSinImpuesto;
                                                montoIvas = (parseFloat(rate_div) * parseFloat(base_imp));

                                            }else{
                                                montoIvas = importeImpuestoTotalLinea;
                                            }
                                        }
                                    }

                                }
                                log.audit({title: 'hayret', details:hayret});
                                var numdeImpuestos = 0;
                                var ivaceros = 0;
                                for (var x = 0; x < tax_lines_count; x++) {

                                    var montoRetencion = 0;
                                    //lee campos dependiendo si es grupo o codigo de impuestos
                                    if(existeSuiteTax){
                                        var tax_name = objSuiteTax[taxref_linea][x].nombre;

                                        var tax_id = objSuiteTax[taxref_linea][x].taxcode;

                                        var tax_rate = objSuiteTax[taxref_linea][x].rate;

                                        var tax_base = parseFloat(objSuiteTax[taxref_linea][x].base);

                                    }else{
                                        if (grupo_impuestos) {
                                            var tax_name = objImpuestos.TaxGroup[tax_code][x].taxname2;
                                            var tax_id = objImpuestos.TaxGroup[tax_code][x].taxname;
                                            var tax_rate = objImpuestos.TaxGroup[tax_code][x].rate;
                                            var tax_base = objImpuestos.TaxGroup[tax_code][x].basis;
                                            var tax_tipo = objImpuestos.TaxGroup[tax_code][x].taxtype;
                                        } else {
                                            var tax_name = objImpuestos.TaxCodes[tax_code][x].itemid;
                                            var tax_id = objImpuestos.TaxCodes[tax_code][x].id;
                                            var tax_rate = objImpuestos.TaxCodes[tax_code][x].rate;
                                            var tax_base = '100';
                                            var tax_tipo = objImpuestos.TaxCodes[tax_code][x].taxtype;
                                        }
                                    }

                                    //var rate_replace = tax_rate.replace("%", "");
                                    var rate_number = parseFloat(tax_rate);

                                    //En los siguientes for se almacenan dentro del objeto la informacion de impuestos dentro
                                    // de cada atributo por tipo de impuesto
                                    //definir ieps

                                    for (var iep = 0; iep < config_ieps.length; iep++) {
                                        var importeImpuestoCalc = 0;
                                        var importeImpuestoTotalLinea = 0;
                                        if (tax_id == config_ieps[iep]) {
                                            baseiepssuitetax=rate_number;
                                            if (descuento_notax != 0) {
                                                tiene_ieps++;
                                            }


                                            obj_Json_Tax.ieps.rate = rate_number;
                                            obj_Json_Tax.ieps.id = tax_id;
                                            obj_Json_Tax.ieps.base = tax_base;
                                            obj_Json_Tax.ieps.name = tax_name;
                                            obj_Json_Tax.ieps.descuento = (descuento_notax * (-1)).toFixed(2);
                                            var base_imp = baseIeps + descuento_notax;
                                            obj_Json_Tax.ieps.base_importe = base_imp.toFixed(2);
                                            var base_calc = parseFloat(tax_base) / 100;
                                            var rate_div = rate_number / 100;
                                            obj_Json_Tax.ieps.rate_div = rate_div;

                                            if(montoIvas>0){
                                                if(existeSuiteTax){
                                                    var tax_importe = (rate_div * parseFloat(baseIeps)) * base_calc;
                                                }else{
                                                    var tax_importe = (rate_div * parseFloat(baseIeps + descuento_notax)) * base_calc;
                                                }

                                                var truncar = redondeotrucar(tax_importe)
                                                if(truncar){
                                                    tax_importe = trunc(tax_importe,2);
                                                }
                                            }else{
                                                if(existeSuiteTax){
                                                    var tax_importe = importeDeImpuesto+impuesto_descuento;
                                                }else{
                                                    if(rate_number != 8){
                                                        var tax_importe = importeDeImpuesto;
                                                    }else{
                                                        var tax_importe = importeDeImpuesto+impuesto_descuento;
                                                    }
                                                }
                                            }



                                            obj_Json_Tax.ieps.importe = tax_importe.toFixed(2);
                                            montoIeps=parseFloat(tax_importe.toFixed(2));
                                            var descuentoDeImpuesto = descuento_sitax-descuento_notax;

                                            log.audit({title:'importeDeImpuesto',details:importeDeImpuesto});
                                            log.audit({title:'descuentoDeImpuesto',details:descuentoDeImpuesto});
                                            log.audit({title:'montoIvas',details:montoIvas});
                                            log.audit({title:'montoLocales',details:montoLocales});
                                            //var tax_importe = parseFloat(importeDeImpuesto+descuentoDeImpuesto)-montoIvas-montoLocales;
                                            // var tax_importe = importeImpuestoTotalLinea;
                                            //obj_Json_Tax.ieps.importe = tax_importe.toFixed(2);
                                            // importe_ieps_nf = parseFloat(importe_ieps_nf) + parseFloat(tax_importe);
                                            // importe_ieps  = importe_ieps_nf;

                                            totalTraslados = totalTraslados + parseFloat(tax_importe.toFixed(2));

                                            //tax_importe = parseFloat(tax_importe.toFixed(2));
                                            //importe_ieps = parseFloat(importe_ieps) + parseFloat(tax_importe.toFixed(2));


                                            //suma para comparar diferencia de centavos

                                            var tax_importe_sumas = (rate_div * parseFloat(importe_base)) * base_calc;
                                            //tax_importe_sumas = tax_importe_sumas.toFixed(2)
                                            suma_linea = suma_linea + parseFloat(tax_importe_sumas);
                                            if (descuento_notax == 0) {
                                                suma_linea_tax = suma_linea_tax + parseFloat(tax_importe.toFixed(2));
                                            }
                                            suma_linea_tax_desc = suma_linea_tax_desc + parseFloat(tax_importe.toFixed(2));

                                            //

                                            /*var cadena = 'IEPS ';
                                            var cadena_rate = cadena + rate_number + '%';
                                            var tam_rates_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                                            if (tam_rates_ieps > 0) {
                                                for (var t = 0; t < tam_rates_ieps; t++) {

                                                    if (Object.keys(obj_Json_Tax_totales.rates_ieps)[t] == cadena_rate) {
                                                        var importe_obj = obj_Json_Tax_totales.rates_ieps[cadena_rate];
                                                        var base_ieps_total = obj_Json_Tax_totales.bases_ieps[rate_number];
                                                        var obj_ieps_total_base = parseFloat(base_ieps_total) + parseFloat(base_imp);
                                                        var obj_ieps_total = parseFloat(importe_obj) + parseFloat(tax_importe.toFixed(2));

                                                        obj_Json_Tax_totales.rates_ieps[cadena_rate] = obj_ieps_total.toFixed(2);
                                                        obj_Json_Tax_totales.rates_ieps_data[rate_number] = obj_ieps_total.toFixed(2);
                                                        obj_Json_Tax_totales.bases_ieps[rate_number] = obj_ieps_total_base;
                                                        if (rate_div == 0.265) {
                                                            ieps_baseveintiseis = obj_ieps_total_base;
                                                        }

                                                    } else {
                                                        if (!obj_Json_Tax_totales.rates_ieps[cadena_rate]) {
                                                            obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                            obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                            obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp;
                                                            if (rate_div == 0.265) {
                                                                ieps_baseveintiseis = base_imp;
                                                            }

                                                        }
                                                    }
                                                }
                                            } else {
                                                obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp;
                                                if (rate_div == 0.265) {
                                                    ieps_baseveintiseis = base_imp;
                                                }

                                            }*/
                                        }
                                        numdeImpuestos++;

                                    }



                                    //definir ivas

                                    for (var iva = 0; iva < config_iva.length; iva++) {
                                        var importeImpuestoCalc = 0;
                                        var importeImpuestoTotalLinea = 0;

                                        if (tax_id == config_iva[iva]) {
                                            obj_Json_Tax.iva.rate = rate_number;
                                            obj_Json_Tax.iva.id = tax_id;
                                            obj_Json_Tax.iva.base = tax_base+baseiepssuitetax;
                                            obj_Json_Tax.iva.name = tax_name;
                                            var importe_base_des = 0;

                                            obj_Json_Tax.iva.descuento = (descuento_notax * (-1)).toFixed(2);
                                            if(!baseiepssuitetax){
                                                baseiepssuitetax=0;
                                            }


                                            var base_calc = parseFloat(tax_base+baseiepssuitetax) / 100;
                                            var rate_div = rate_number / 100;
                                            if(rate_div==0){
                                                ivaceros++;
                                            }
                                            obj_Json_Tax.iva.rate_div = rate_div;
                                            log.audit({title:'montoRetencion',details:montoRetencion});

                                            var importeimpuestodescuentoline = 0;
                                            if(tax_lines_count==1){
                                                log.audit({title:'tax_lines_count',details:tax_lines_count});
                                                if (i < (line_count - 1)) {
                                                    var tipo_articulo_desc = record_now.getSublistValue({
                                                        sublistId: 'item',
                                                        fieldId: 'itemtype',
                                                        line: i+1
                                                    });

                                                    log.audit({title:'tipo_articulo_desc',details:tipo_articulo_desc});
                                                    if(tipo_articulo_desc=='Discount'){
                                                        var importedescuentoLine = record_now.getSublistValue({
                                                            sublistId: 'item',
                                                            fieldId: 'amount',
                                                            line: i+1
                                                        });
                                                        var importeimpuestodescuentoline = record_now.getSublistValue({
                                                            sublistId: 'item',
                                                            fieldId: 'grossamt',
                                                            line: i+1
                                                        });
                                                        importeImpuestoCalc = baseIeps+importedescuentoLine;
                                                    }else{
                                                        log.audit({title:'baseIeps',details:baseIeps});
                                                            importeImpuestoCalc = baseIeps;

                                                    }
                                                }else{

                                                        //importeImpuestoCalc = (((importeConImpuesto - montoLocales) + descuento_sitax + montoRetencion) / (rate_div + 1));
                                                        importeImpuestoCalc = baseIeps;

                                                }

                                            }else{


                                                    importeImpuestoCalc = (((importeConImpuesto - montoLocales) + descuento_sitax + montoRetencion) / (rate_div + 1)); //626.137931

                                                    importeImpuestoCalc = parseFloat(importeImpuestoCalc.toFixed(2));



                                                log.audit({title:'importeImpuestoCalc',details:importeImpuestoCalc});
                                            }
                                            // importeImpuestoCalc = (importeConImpuesto+montoRetencion)/(rate_div+1);




                                            if(hayieps>0){
                                                log.audit({title:'importeDeImpuesto',details:importeDeImpuesto});
                                                log.audit({title:'montoIeps',details:montoIeps});
                                                log.audit({title:'descuento_sitax',details:descuento_sitax});
                                                log.audit({title:'descuento_notax',details:descuento_notax});
                                                if(rate_div>0){
                                                    importeImpuestoTotalLinea = importeDeImpuesto+(descuento_sitax-descuento_notax) - montoIeps;
                                                }else{
                                                    importeImpuestoTotalLinea = 0;
                                                }

                                            }else{
                                                log.audit({title:'importeConImpuesto',details:importeConImpuesto});
                                                log.audit({title:'importeimpuestodescuentoline',details:importeimpuestodescuentoline});
                                                log.audit({title:'importeImpuestoCalc',details:importeImpuestoCalc});
                                                importeImpuestoTotalLinea = importeConImpuesto + importeimpuestodescuentoline - importeImpuestoCalc;
                                            }

                                            log.audit({title:'importeImpuestoTotalLinea',details:importeImpuestoTotalLinea});



                                            // var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100) + descuento_notax;

                                            var importe_base_des = 0;
                                            if(!baseiepssuitetax || baseiepssuitetax==''){
                                                baseiepssuitetax=0;
                                            }
                                            if(hayieps>0){
                                                importe_base_des = importe_base;
                                                importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                                if(!importe_base){
                                                    importe_base= baseiepsmonto;
                                                }

                                                var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)+parseFloat(baseiepssuitetax)) / 100)
                                            } else {
                                                var base_imp = ((parseFloat(importe_base) * (parseFloat(tax_base)+parseFloat(baseiepssuitetax))) / 100) + descuento_notax;
                                                obj_Json_Tax.iva.descuento = (descuento_notax * (-1)).toFixed(2);
                                            }


                                            obj_Json_Tax.iva.base_importe = base_imp.toFixed(2);
                                            // var rate_div_f = rate_div.toFixed(2);
                                            // var importe_base_f = importe_base.toFixed(2);
                                            // var base_calc_f = base_calc.toFixed(2);
                                            log.audit({title: 'hayret', details:hayret});
                                            if(hayret>0){
                                                if(rate_desccabecera){
                                                    var importetax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                                    var importecondescuento = (rate_desccabecera*importetax_importe);
                                                    montoIvas = importetax_importe-importecondescuento;
                                                    var tax_importe = importetax_importe-importecondescuento;
                                                }else{
                                                    montoIvas = (parseFloat(rate_div) * parseFloat(base_imp));
                                                    var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                                }
                                            }else{


                                                if(descuentoglobal){
                                                    var importecondescuento = (rate_desccabecera*importeImpuestoTotalLinea);
                                                    montoIvas = importeImpuestoTotalLinea-importecondescuento;
                                                    if(existeSuiteTax){
                                                        var tax_importe = importeImpuestoTotalLinea;
                                                    }else{
                                                        var tax_importe = importeImpuestoTotalLinea-importecondescuento;
                                                    }                                                 
                                                }else{
                                                    montoIvas = importeImpuestoTotalLinea;
                                                    var tax_importe = importeImpuestoTotalLinea;
                                                    log.audit({title:'tax_importe',details:tax_importe});
                                                }

                                                    if(hayieps>0 && rate_div>0){
                                                        log.audit({title:'tax_importehayieps',details:tax_importe});
                                                        var tax_importeredondear = (parseFloat(rate_div) * parseFloat(base_imp));
                                                        var importetruncado = trunc(tax_importeredondear,2);
                                                        if((tax_importe-importetruncado)>0.01){
                                                            tax_importe = tax_importe-0.01;
                                                            montoIvas=tax_importe;
                                                            var importeiepsredondeo = parseFloat(obj_Json_Tax.ieps.importe)+0.01;
                                                            obj_Json_Tax.ieps.importe = importeiepsredondeo.toFixed(2);


                                                            /*obj_Json_Tax.ieps.rate
                                                            var stringposicionieps = "IEPS "+obj_Json_Tax.ieps.rate+"%";
                                                            obj_Json_Tax_totales.rates_ieps[stringposicionieps] = (parseFloat(obj_Json_Tax_totales.rates_ieps[stringposicionieps])+0.01).toFixed(2);
                                                            obj_Json_Tax_totales.rates_ieps_data[obj_Json_Tax.ieps.rate] = (parseFloat(obj_Json_Tax_totales.rates_ieps_data[obj_Json_Tax.ieps.rate])+0.01).toFixed(2);*/
                                                            totalTraslados = totalTraslados+0.01;
                                                            //importe_ieps = (parseFloat(importe_ieps)+0.01);

                                                        }
                                                    }

                                            }


                                            log.audit({title:'tax_importe',details:tax_importe});

                                            totalTraslados = totalTraslados + parseFloat(tax_importe.toFixed(2));

                                            if(montoLocales!=0){
                                                tax_importe = tax_importe-montoLocales;
                                            }

                                            obj_Json_Tax.iva.importe = tax_importe.toFixed(2);
                                            //tax_importe = parseFloat(tax_importe.toFixed(2));
                                            //importe_iva = parseFloat(importe_iva) + parseFloat(tax_importe.toFixed(2));
                                            //suma para comparar diferencia de centavos

                                            var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base_des)) * parseFloat(base_calc);
                                                //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                            suma_linea = suma_linea + parseFloat(tax_importe_sumas);
                                            if (descuento_notax == 0) {
                                                suma_linea_tax = suma_linea_tax + parseFloat(tax_importe.toFixed(2));
                                            }
                                            suma_linea_tax_desc = suma_linea_tax_desc + parseFloat(tax_importe.toFixed(2));

                                            //

                                            /*var cadena = 'IVA ';
                                            var cadena_rate = cadena + rate_number + '%';

                                            var tam_rates_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;

                                            if (tam_rates_iva > 0) {
                                                for (var t = 0; t < tam_rates_iva; t++) {
                                                    if (Object.keys(obj_Json_Tax_totales.rates_iva)[t] == cadena_rate) {


                                                        var importe_obj = obj_Json_Tax_totales.rates_iva[cadena_rate];
                                                        var base_iva_total = obj_Json_Tax_totales.bases_iva[rate_number];
                                                        var obj_iva_total_base = parseFloat(base_iva_total) + parseFloat(base_imp);
                                                        var obj_iva_total = parseFloat(importe_obj) + parseFloat(tax_importe.toFixed(2));


                                                        obj_Json_Tax_totales.rates_iva[cadena_rate] = obj_iva_total.toFixed(2);
                                                        obj_Json_Tax_totales.rates_iva_data[rate_number] = obj_iva_total.toFixed(2);

                                                        obj_Json_Tax_totales.bases_iva[rate_number] = obj_iva_total_base || 0;
                                                        if (rate_div == 0.16) {

                                                            ieps_basedieciseis = obj_iva_total_base;
                                                        }

                                                    } else {
                                                        if (!obj_Json_Tax_totales.rates_iva[cadena_rate]) {

                                                            obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                                            obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);

                                                            obj_Json_Tax_totales.bases_iva[rate_number] = base_imp || '0.00';
                                                            if (rate_div == 0.16) {

                                                                ieps_basedieciseis = base_imp;
                                                            }

                                                        }

                                                    }
                                                }
                                            } else {
                                                obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);

                                                obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);

                                                obj_Json_Tax_totales.bases_iva[rate_number] = base_imp || '0.00';
                                                if (rate_div == 0.16) {

                                                    ieps_basedieciseis = base_imp;
                                                }

                                            }*/

                                        }
                                        numdeImpuestos++;
                                    }

                                    //definir retenciones

                                    for (var ret = 0; ret < config_retencion.length; ret++) {
                                        var importeImpuestoCalc = 0;
                                        var importeImpuestoTotalLinea = 0;
                                        //se compara el codigo de impuesto de la linea con el de la configuración de retenciones
                                        if (tax_id == config_retencion[ret]) {
                                            //almacena la información del codigo de impuesto
                                            if(existeSuiteTax){
                                                obj_Json_Tax.retenciones.rate = rate_number;
                                            }else{
                                                obj_Json_Tax.retenciones.rate = rate_number * (-1);
                                            }

                                            obj_Json_Tax.retenciones.id = tax_id;
                                            obj_Json_Tax.retenciones.base = tax_base;
                                            obj_Json_Tax.retenciones.name = tax_name;
                                            //calcula el importe base con la base del impuesto y el importe de la linea
                                            // monto de la linea (amount) por la base de impuesto entre 100
                                            if(hayieps==0) {
                                                var base_imp = (parseFloat(importe_base) * parseFloat(tax_base)) / 100;
                                                obj_Json_Tax.retenciones.base_importe = base_imp.toFixed(2);
                                            }
                                            //se multiplica el rate number por -1 porque el impuesto de retencion se configura
                                            //en negativo la base
                                            if(existeSuiteTax){
                                                var rate_num = rate_number;
                                            }else{
                                                var rate_num = rate_number * (-1);
                                            }

                                            //se obtiene la base en decimales
                                            var base_calc = parseFloat(tax_base) / 100;
                                            //se obtiene el rate del impuesto en decimales
                                            var rate_div = rate_num / 100;
                                            obj_Json_Tax.retenciones.rate_div = rate_div;
                                            if(hayieps==0) {
                                                if(montoIvas>0){
                                                    log.audit({title:'montoIvas',details:montoIvas})
                                                    var tax_importe = montoIvas-importeDeImpuesto;
                                                }else{
                                                    var tax_importe = (rate_div * parseFloat(importe_base)) * base_calc;
                                                }

                                            }
                                            if(hayieps>0){
                                                importeImpuestoCalc = importeConImpuesto/(rate_div+1);
                                                importeImpuestoTotalLinea = importeConImpuesto-importeImpuestoCalc;
                                                var base_imp = importeImpuestoCalc;
                                                obj_Json_Tax.retenciones.base_importe = base_imp.toFixed(2);

                                                //el importe de impuesto se obtiene multiplicando el rate de impuesto en decimales
                                                //por el importe por la base
                                                montoRetencion = importeImpuestoTotalLinea;
                                                var tax_importe = importeImpuestoTotalLinea;
                                            }else{
                                                montoRetencion = tax_importe;
                                            }

                                            montoRetencion=montoRetencion* -1;

                                            totalRetenciones = totalRetenciones + parseFloat(tax_importe.toFixed(2));

                                            //se pone a 2 decimales el importe de impuesto
                                            obj_Json_Tax.retenciones.importe = tax_importe.toFixed(2);
                                            //tax_importe = parseFloat(tax_importe.toFixed(2));

                                            //sumatoria de las retenciones para obtener total de retenciones
                                            //importe_retencion = parseFloat(importe_retencion) + parseFloat(tax_importe.toFixed(2));
                                            //suma para comparar diferencia de centavos, se suman todos los impuestos de este tipo
                                            suma_linea = suma_linea - parseFloat(tax_importe);
                                            if (descuento_notax == 0) {
                                                suma_linea_tax = suma_linea_tax - parseFloat(tax_importe.toFixed(2));
                                            }

                                            suma_linea_tax_desc = suma_linea_tax_desc - parseFloat(tax_importe.toFixed(2));

                                            //se genera descripcion por tipo de impuesto y porcentaje
                                            var cadena = 'Retencion ';
                                            var cadena_rate = cadena + rate_num + '%';
                                            //se obtiene numero de atributos dentro del objeto de totales en retenciones
                                            var tam_rates_ret = Object.keys(obj_Json_Tax_totales.rates_retencion).length;

                                            //solo se ejecuta si ya existe un atributo
                                            if (tam_rates_ret > 0) {
                                                //recorrido de atributos de objeto de totales
                                                for (var t = 0; t < tam_rates_ret; t++) {
                                                    //compara el rate dentro del objeto con el de la linea
                                                    if (Object.keys(obj_Json_Tax_totales.rates_retencion)[t] == cadena_rate) {
                                                        //obtiene los datos ya existentes en el atributo
                                                        var importe_obj = obj_Json_Tax_totales.rates_retencion[cadena_rate];
                                                        var base_ret_total = obj_Json_Tax_totales.bases_retencion[rate_num];
                                                        //hace sumatoria con los datos existentes en la linea y con los del atributo
                                                        var obj_ret_total_base = parseFloat(base_ret_total) + parseFloat(base_imp);
                                                        var obj_ret_total = parseFloat(importe_obj) + parseFloat(tax_importe);

                                                        //reemplaza datos ya sumarizados
                                                        obj_Json_Tax_totales.rates_retencion[cadena_rate] = obj_ret_total.toFixed(2);
                                                        obj_Json_Tax_totales.rates_retencion_data[rate_num] = obj_ret_total.toFixed(2);
                                                        obj_Json_Tax_totales.bases_retencion[rate_num] = obj_ret_total_base;
                                                    } else {
                                                        //si no existe el rate y pertenece a retención, se agrega un atributo nuevo
                                                        if (!obj_Json_Tax_totales.rates_retencion[cadena_rate]) {
                                                            //llena el importe y el importe base en los atributos del objeto de totales
                                                            obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                            obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                            obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp;
                                                        }
                                                    }
                                                }
                                                //se ejecuta si no existe ningun atributo
                                            } else {
                                                //llena el importe y el importe base en los atributos del objeto de totales
                                                obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                            }

                                        }
                                        numdeImpuestos++;
                                    }

                                    //definir locales

                                    for (var loc = 0; loc < config_local.length; loc++) {
                                        if (tax_id == config_local[loc]) {
                                            obj_Json_Tax.locales.rate = rate_number;
                                            obj_Json_Tax.locales.id = tax_id;
                                            obj_Json_Tax.locales.base = tax_base;
                                            obj_Json_Tax.locales.name = tax_name;
                                            var base_imp = (parseFloat(importe_base) * parseFloat(tax_base)) / 100;
                                            obj_Json_Tax.locales.base_importe = base_imp.toFixed(2);
                                            var rate_num = rate_number * (-1);
                                            var base_calc = parseFloat(tax_base) / 100;
                                            var rate_div = rate_number / 100;
                                            obj_Json_Tax.locales.rate_div = rate_div;
                                            var tax_importe = (rate_div * parseFloat(importe_base)) * base_calc;
                                            //var localesfixed = tax_importe.toFixed(2);
                                            //montoLocales = parseFloat(localesfixed);
                                            totalTraslados = totalTraslados + parseFloat(tax_importe.toFixed(2));
                                            obj_Json_Tax.locales.importe = tax_importe.toFixed(2);
                                            //tax_importe = parseFloat(tax_importe.toFixed(2));
                                            importe_local = parseFloat(importe_local) + parseFloat(tax_importe.toFixed(2));
                                            //suma para comparar diferencia de centavos

                                            suma_linea = suma_linea + parseFloat(tax_importe);
                                            if (descuento_notax == 0) {
                                                suma_linea_tax = suma_linea_tax + parseFloat(tax_importe.toFixed(2));
                                            }
                                            suma_linea_tax_desc = suma_linea_tax_desc + parseFloat(tax_importe.toFixed(2));
                                            //

                                            var cadena = 'Local ';
                                            var cadena_rate = cadena + rate_number + '%';
                                            var tam_rates_locales = Object.keys(obj_Json_Tax_totales.rates_local).length;
                                            var objlocal_data = {
                                                monto: '',
                                                nombre: ''
                                            }
                                            if (tam_rates_locales > 0) {
                                                for (var t = 0; t < tam_rates_locales; t++) {

                                                    objlocal_data.nombre = tax_name;
                                                    if (Object.keys(obj_Json_Tax_totales.rates_local)[t] == cadena_rate) {
                                                        var importe_obj = obj_Json_Tax_totales.rates_local[cadena_rate];
                                                        var base_local_total = obj_Json_Tax_totales.bases_local[rate_number];
                                                        var obj_local_total_base = parseFloat(base_local_total) + parseFloat(base_imp);
                                                        var obj_loc_total = parseFloat(importe_obj) + parseFloat(tax_importe);

                                                        obj_Json_Tax_totales.rates_local[cadena_rate] = obj_loc_total.toFixed(2);
                                                        objlocal_data.monto = obj_loc_total.toFixed(2);
                                                        obj_Json_Tax_totales.rates_local_data[rate_number] = objlocal_data;
                                                        obj_Json_Tax_totales.bases_local[rate_number] = obj_local_total_base;
                                                    } else {
                                                        if (!obj_Json_Tax_totales.rates_local[cadena_rate]) {
                                                            obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                            objlocal_data.monto = tax_importe.toFixed(2);
                                                            obj_Json_Tax_totales.rates_local_data[rate_number] = objlocal_data;
                                                            obj_Json_Tax_totales.bases_local[rate_number] = base_imp;
                                                        }
                                                    }
                                                }
                                            } else {
                                                objlocal_data.nombre = tax_name;
                                                obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                objlocal_data.monto = tax_importe.toFixed(2);
                                                obj_Json_Tax_totales.rates_local_data[rate_number] = objlocal_data;
                                                obj_Json_Tax_totales.bases_local[rate_number] = base_imp;
                                            }
                                        }
                                        numdeImpuestos++;
                                    }


                                    //definir exentos

                                    for (var ex = 0; ex < config_exento.length; ex++) {
                                        var importeImpuestoCalc = 0;
                                        var importeImpuestoTotalLinea = 0;
                                        if (tax_id == config_exento[ex]) {
                                            obj_Json_Tax.exento.rate = rate_number;
                                            obj_Json_Tax.exento.id = tax_id;
                                            obj_Json_Tax.exento.base = tax_base;
                                            obj_Json_Tax.exento.name = tax_name;
                                            var importe_base_des = 0;
                                            // if (tiene_ieps > 0) {
                                            //     importe_base_des = importe_base;
                                            //     importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                            //     var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)
                                            // } else {
                                            //     var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100) + descuento_notax;
                                            //     obj_Json_Tax.exento.descuento = (descuento_notax * (-1)).toFixed(2);
                                            // }

                                            var base_calc = parseFloat(tax_base) / 100;
                                            var rate_div = rate_number / 100;
                                            obj_Json_Tax.exento.rate_div = rate_div;
                                            importeImpuestoCalc = importeConImpuesto/(rate_div+1);
                                            importeImpuestoTotalLinea = importeConImpuesto-importeImpuestoCalc;
                                            var base_imp = importeImpuestoCalc;
                                            obj_Json_Tax.exento.base_importe = base_imp.toFixed(2);
                                            // var rate_div_f = rate_div.toFixed(2);
                                            // var importe_base_f = importe_base.toFixed(2);
                                            // var base_calc_f = base_calc.toFixed(2);
                                            if (tiene_ieps <= 0) {
                                                if(existeSuiteTax){
                                                    var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                                }else{
                                                    var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base + descuento_notax)) * parseFloat(base_calc);
                                                }
                                            } else {
                                                var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                            }
                                            obj_Json_Tax.exento.importe = tax_importe.toFixed(2);
                                            //tax_importe = parseFloat(tax_importe.toFixed(2));
                                            importe_exento = parseFloat(importe_exento) + parseFloat(tax_importe);
                                            //suma para comparar diferencia de centavos
                                            if (tiene_ieps <= 0) {
                                                var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                                //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                            } else {
                                                var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base_des)) * parseFloat(base_calc);
                                                //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                            }
                                            suma_linea = suma_linea + parseFloat(tax_importe_sumas);
                                            if (descuento_notax == 0) {
                                                suma_linea_tax = suma_linea_tax + parseFloat(tax_importe.toFixed(2));
                                            }
                                            suma_linea_tax_desc = suma_linea_tax_desc + parseFloat(tax_importe.toFixed(2));


                                            //

                                            var cadena = 'EXENTO ';
                                            var cadena_rate = cadena + rate_number + '%';

                                            var tam_rates_ex = Object.keys(obj_Json_Tax_totales.rates_exento).length;

                                            if (tam_rates_ex > 0) {
                                                for (var t = 0; t < tam_rates_ex; t++) {
                                                    if (Object.keys(obj_Json_Tax_totales.rates_exento)[t] == cadena_rate) {


                                                        var importe_obj = obj_Json_Tax_totales.rates_exento[cadena_rate];
                                                        var base_ex_total = obj_Json_Tax_totales.bases_exento[rate_number];
                                                        var obj_ex_total_base = parseFloat(base_ex_total) + parseFloat(base_imp);
                                                        var obj_ex_total = parseFloat(importe_obj) + parseFloat(tax_importe);

                                                        obj_Json_Tax_totales.rates_exento[cadena_rate] = obj_ex_total.toFixed(2);
                                                        obj_Json_Tax_totales.rates_exento_data[rate_number] = obj_ex_total.toFixed(2);

                                                        obj_Json_Tax_totales.bases_exento[rate_number] = obj_ex_total_base.toFixed(2) || 0;

                                                    } else {
                                                        if (!obj_Json_Tax_totales.rates_exento[cadena_rate]) {

                                                            obj_Json_Tax_totales.rates_exento[cadena_rate] = tax_importe.toFixed(2);
                                                            obj_Json_Tax_totales.rates_exento_data[rate_number] = tax_importe.toFixed(2);

                                                            obj_Json_Tax_totales.bases_exento[rate_number] = base_imp.toFixed(2) || '0.00';

                                                        }

                                                    }
                                                }
                                            } else {
                                                obj_Json_Tax_totales.rates_exento[cadena_rate] = tax_importe.toFixed(2);

                                                obj_Json_Tax_totales.rates_exento_data[rate_number] = tax_importe.toFixed(2);

                                                obj_Json_Tax_totales.bases_exento[rate_number] = base_imp.toFixed(2) || '0.00';

                                            }

                                        }
                                        numdeImpuestos++;
                                    }

                                    contadorLineas++;
                                }


                                log.audit({title:'obj_Json_Tax',details:obj_Json_Tax});
                                log.audit({title:'numdeImpuestos',details:numdeImpuestos});
                                log.audit({title:'tax_lines_count',details:tax_lines_count});
                                    if(tax_lines_count>1 && ivaceros==0){
                                    var obj_Json_Tax_Limites = validaLimites(obj_Json_Tax);
                                    }else{
                                        var obj_Json_Tax_Limites = obj_Json_Tax;
                                    }

                                    if(obj_Json_Tax.ieps.name!=''){

                                            importe_ieps = importe_ieps+parseFloat(obj_Json_Tax_Limites.ieps.importe);

                                    }
                                    if(obj_Json_Tax.iva.name!='' && obj_Json_Tax.iva.rate_div>0){
                                        log.audit({title:'obj_Json_Tax',details:obj_Json_Tax});
                                        //var ajusteTotalesLimites = 0;
                                        //ajusteTotalesLimites = parseFloat(obj_Json_Tax_Limites.iva.importe)-parseFloat(obj_Json_Tax.iva.importe);
                                            importe_iva = importe_iva+parseFloat(obj_Json_Tax_Limites.iva.importe);
                                    }
                                    if(obj_Json_Tax.retenciones.name!=''){
                                        //var ajusteTotalesLimites = parseFloat(obj_Json_Tax_Limites.retenciones.importe)-parseFloat(obj_Json_Tax.retenciones.importe);
                                            importe_retencion = importe_retencion+parseFloat(obj_Json_Tax_Limites.retenciones.importe);
                                    }
                                    if(tax_lines_count>1){
                                    obj_Json_Tax = obj_Json_Tax_Limites;
                                }

                                if(obj_Json_Tax.ieps.name!=''){
                                    var cadena = 'IEPS ';
                                    var cadena_rate = cadena + obj_Json_Tax.ieps.rate + '%';
                                    var tam_rates_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                                    if (tam_rates_ieps > 0) {
                                        for (var t = 0; t < tam_rates_ieps; t++) {

                                            if (Object.keys(obj_Json_Tax_totales.rates_ieps)[t] == cadena_rate) {
                                                var importe_obj = obj_Json_Tax_totales.rates_ieps[cadena_rate];
                                                var base_ieps_total = obj_Json_Tax_totales.bases_ieps[obj_Json_Tax.ieps.rate];

                                                var obj_ieps_total_base = parseFloat(base_ieps_total) + parseFloat(obj_Json_Tax.ieps.base_importe);
                                                var obj_ieps_total = parseFloat(importe_obj) + parseFloat(obj_Json_Tax.ieps.importe);


                                                obj_Json_Tax_totales.rates_ieps[cadena_rate] = obj_ieps_total.toFixed(2);
                                                obj_Json_Tax_totales.rates_ieps_data[obj_Json_Tax.ieps.rate] = obj_ieps_total.toFixed(2);
                                                obj_Json_Tax_totales.bases_ieps[obj_Json_Tax.ieps.rate] = obj_ieps_total_base;
                                                if (obj_Json_Tax.ieps.rate_div == 0.265) {
                                                    ieps_baseveintiseis = obj_ieps_total_base;
                                                }

                                            } else {
                                                if (!obj_Json_Tax_totales.rates_ieps[cadena_rate]) {

                                                    obj_Json_Tax_totales.rates_ieps[cadena_rate] = obj_Json_Tax.ieps.importe;
                                                    obj_Json_Tax_totales.rates_ieps_data[obj_Json_Tax.ieps.rate] = obj_Json_Tax.ieps.importe;
                                                    obj_Json_Tax_totales.bases_ieps[obj_Json_Tax.ieps.rate] = parseFloat(obj_Json_Tax.ieps.base_importe);
                                                    if (obj_Json_Tax.ieps.rate_div == 0.265) {
                                                        ieps_baseveintiseis = parseFloat(obj_Json_Tax.ieps.base_importe);
                                                    }

                                                }
                                            }
                                        }
                                    } else {
                                        obj_Json_Tax_totales.rates_ieps[cadena_rate] = obj_Json_Tax.ieps.importe;
                                        obj_Json_Tax_totales.rates_ieps_data[obj_Json_Tax.ieps.rate] = obj_Json_Tax.ieps.importe;
                                        obj_Json_Tax_totales.bases_ieps[obj_Json_Tax.ieps.rate] = parseFloat(obj_Json_Tax.ieps.base_importe);
                                        if (obj_Json_Tax.ieps.rate_div == 0.265) {
                                            ieps_baseveintiseis = parseFloat(obj_Json_Tax.ieps.base_importe);
                                        }

                                    }
                                }


                                if(obj_Json_Tax.iva.name!=''){
                                    var cadena = 'IVA ';
                                    var cadena_rate = cadena + obj_Json_Tax.iva.rate + '%';

                                    var tam_rates_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;

                                    if (tam_rates_iva > 0) {
                                        for (var t = 0; t < tam_rates_iva; t++) {
                                            if (Object.keys(obj_Json_Tax_totales.rates_iva)[t] == cadena_rate) {


                                                var importe_obj = obj_Json_Tax_totales.rates_iva[cadena_rate];
                                                var base_iva_total = obj_Json_Tax_totales.bases_iva[obj_Json_Tax.iva.rate];
                                                var obj_iva_total_base = parseFloat(base_iva_total) + parseFloat(obj_Json_Tax.iva.base_importe);
                                                var obj_iva_total = parseFloat(importe_obj) + parseFloat(obj_Json_Tax.iva.importe);


                                                obj_Json_Tax_totales.rates_iva[cadena_rate] = obj_iva_total.toFixed(2);
                                                obj_Json_Tax_totales.rates_iva_data[obj_Json_Tax.iva.rate] = obj_iva_total.toFixed(2);

                                                obj_Json_Tax_totales.bases_iva[obj_Json_Tax.iva.rate] = obj_iva_total_base || 0;
                                                if (obj_Json_Tax.iva.rate_div == 0.16) {

                                                    ieps_basedieciseis = obj_iva_total_base;
                                                }

                                            } else {
                                                if (!obj_Json_Tax_totales.rates_iva[cadena_rate]) {

                                                    obj_Json_Tax_totales.rates_iva[cadena_rate] = obj_Json_Tax.iva.importe;
                                                    obj_Json_Tax_totales.rates_iva_data[obj_Json_Tax.iva.rate] = obj_Json_Tax.iva.importe;

                                                    obj_Json_Tax_totales.bases_iva[obj_Json_Tax.iva.rate] = parseFloat(obj_Json_Tax.iva.base_importe) || '0.00';
                                                    if (obj_Json_Tax.iva.rate_div == 0.16) {

                                                        ieps_basedieciseis = parseFloat(obj_Json_Tax.iva.base_importe);
                                                    }

                                                }

                                            }
                                        }
                                    } else {
                                        obj_Json_Tax_totales.rates_iva[cadena_rate] = obj_Json_Tax.iva.importe;

                                        obj_Json_Tax_totales.rates_iva_data[obj_Json_Tax.iva.rate] = obj_Json_Tax.iva.importe;

                                        obj_Json_Tax_totales.bases_iva[obj_Json_Tax.iva.rate] = parseFloat(obj_Json_Tax.iva.base_importe) || '0.00';
                                        if (obj_Json_Tax.iva.rate_div == 0.16) {

                                            ieps_basedieciseis = parseFloat(obj_Json_Tax.iva.base_importe);
                                        }

                                    }
                                }


                                impuestosCalculados = impuestosCalculados + parseFloat(suma_linea_tax);

                                if (descuento_notax == 0) {
                                    obj_Json_Tax.impuestoLineaCalculados = suma_linea_tax.toFixed(2);
                                } else {
                                    obj_Json_Tax.impuestoLineaCalculados = suma_linea_tax_desc.toFixed(2);
                                }
                                //termina el recorrido por codigo de impuesto



                                //se guarda el json en la linea de articulos


                                if(recType == record.Type.CREDIT_MEMO && existeSuiteTax){
                                    objJsonLine.line = i;
                                    objJsonLine.json = obj_Json_Tax;
                                    arrayJson.push(objJsonLine);
                                }else{
                                    record_now.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_efx_fe_tax_json',
                                        line: i,
                                        value: JSON.stringify(obj_Json_Tax),
                                    });
                                }



                                log.audit({title: 'obj_Json_Tax', details: obj_Json_Tax});
                                log.audit({title: 'fin linea', details: i});
                            }

                            if(recType == record.Type.CREDIT_MEMO && existeSuiteTax){
                                for(var a=0;a<arrayJson.length;a++){
                                    var lineNum = record_now.selectLine({
                                        sublistId: 'item',
                                        line:arrayJson[a].line
                                    });
                                    record_now.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_efx_fe_tax_json',
                                        value: JSON.stringify(arrayJson[a].json),
                                    });
                                    record_now.commitLine({
                                        sublistId: 'item'
                                    });
                                }
                            }

                            obj_Json_Tax_totales.subtotal = subtotalTransaccion.toFixed(2);
                            var desctraslados =0;
                            var descret =0;
                            var descivatot =0;
                            var desciepstot =0;
                            if(descuentoglobal){
                                // desctraslados = totalTraslados*rate_desccabecera;
                                // descret = totalRetenciones*rate_desccabecera;
                                // descivatot = importe_iva*rate_desccabecera;
                                // desciepstot = importe_ieps*rate_desccabecera;
                                obj_Json_Tax_totales.total = (subtotalTransaccion + parseFloat(totalTraslados - totalRetenciones)  - parseFloat(descuentoglobal) - parseFloat(desctraslados) - parseFloat(descret) + (imlocaltotallinea*-1)).toFixed(2);
                                obj_Json_Tax_totales.descuentoConImpuesto = parseFloat(descuentoglobal).toFixed(2);
                                obj_Json_Tax_totales.descuentoSinImpuesto = parseFloat(descuentoglobal).toFixed(2);
                            }else{
                                //obj_Json_Tax_totales.total = (subtotalTransaccion + parseFloat(totalTraslados - totalRetenciones) - parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto)).toFixed(2);
                                obj_Json_Tax_totales.total = (parseFloat(totalTran)+(imlocaltotallinea*-1)).toFixed(2);
                            }



                            obj_Json_Tax_totales.totalImpuestos = parseFloat(totalTraslados - totalRetenciones - desctraslados-descret).toFixed(2);
                            obj_Json_Tax_totales.totalTraslados = (totalTraslados-desctraslados).toFixed(2);
                            obj_Json_Tax_totales.totalRetenciones = (totalRetenciones-descret).toFixed(2);

                            log.audit({title: 'obj_diferencias', details: obj_diferencias});
                            log.audit({title: 'importe_retencion', details: importe_retencion});
                            log.audit({title: 'importe_iva', details: importe_iva.toFixed(2)});
                            log.audit({title: 'importe_exento', details: importe_exento.toFixed(2)});
                            log.audit({title: 'importe_ieps', details: importe_ieps});
                            log.audit({title: 'importe_local', details: importe_local});


                            log.audit({title: 'record_now.id', details: record_now.id});
                            log.audit({title: 'record_now.type', details: record_now.type});


                            //se llena el objeto con los totales de impuestos por tipo
                            obj_Json_Tax_totales.retencion_total = parseFloat(importe_retencion-descret).toFixed(2) || '0.00';
                            obj_Json_Tax_totales.iva_total = parseFloat(importe_iva-descivatot).toFixed(2) || '0.00';
                            obj_Json_Tax_totales.exento_total = parseFloat(importe_exento).toFixed(2) || '0.00';
                            obj_Json_Tax_totales.ieps_total = parseFloat(importe_ieps-desciepstot).toFixed(2) || '0.00';
                            obj_Json_Tax_totales.local_total = parseFloat(importe_local).toFixed(2) || '0.00';


                            //validar que la suma de desglose coincida con el total
                            log.audit({title: 'objivas', details: Object.keys(obj_Json_Tax_totales.rates_iva)});
                            log.audit({title: 'objivas', details: Object.keys(obj_Json_Tax_totales.rates_iva_data)});

                            log.audit({title: 'obj_Json_Tax_totales', details: obj_Json_Tax_totales});
                            log.audit({title: 'obj_Json_Tax_totales.total', details: obj_Json_Tax_totales.total});
                            log.audit({title: 'totalTran', details: totalTran});
                            var totalcostosenvio = parseFloat(enviototalimporte)+parseFloat(enviototalimpuesto);
                            log.audit({title: 'totalcostosenvio', details: totalcostosenvio});
                            var diferenciaTotales = ((parseFloat(obj_Json_Tax_totales.total)+totalcostosenvio - totalTran)).toFixed(2);
                            log.audit({title: 'diferenciaTotales', details: diferenciaTotales});
                            if(parseFloat(diferenciaTotales)==0){
                                diferenciaTotales=diftimbrado;
                            }
                            record_now.setValue({
                                fieldId: 'custbody_efx_fe_diftimbrado',
                                value: parseFloat(diferenciaTotales),
                                ignoreFieldChange: true
                            });


                            obj_Json_Tax_totales.diferenciaTotales = diferenciaTotales;



                            var tam_obj_ieps = Object.keys(obj_Json_Tax_totales.bases_ieps).length;
                            var tam_obj_iva = Object.keys(obj_Json_Tax_totales.bases_iva).length;
                            var tam_obj_ret = Object.keys(obj_Json_Tax_totales.bases_retencion).length;
                            var tam_obj_local = Object.keys(obj_Json_Tax_totales.bases_local).length;

                            var totalTraslados_gbl = 0;
                            var totalRetenciones_gbl = 0;
                            var totalImpuestos_gbl = 0;
                            var ieps_total_gbl = 0;
                            var iva_total_gbl = 0;
                            var retencion_total_gbl = 0;
                            var local_total_gbl = 0;



                            for (var iep = 0; iep < tam_obj_ieps; iep++) {
                                obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]] = parseFloat(obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]]).toFixed(2);

                                var rate_gbl = parseFloat(Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]);
                                var rate_gblB = rate_gbl / 100;
                                var monto_gbl = parseFloat(obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]]);
                                obj_Json_Tax_totales.monto_ieps_gbl[Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]] = (monto_gbl * rate_gblB).toFixed(2);
                                var totImpu = parseFloat((monto_gbl * rate_gblB).toFixed(2));
                                totalImpuestos_gbl = totalImpuestos_gbl + totImpu;
                                totalTraslados_gbl = totalTraslados_gbl + totImpu;
                                ieps_total_gbl = ieps_total_gbl + totImpu;

                            }

                            for (var iv = 0; iv < tam_obj_iva; iv++) {
                                obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]] = parseFloat(obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]]).toFixed(2);

                                var tambasivas = Object.keys(obj_Json_Tax_totales.bases_iva).length;
                                var tambasret = Object.keys(obj_Json_Tax_totales.bases_retencion).length;
                                var tambasieps = Object.keys(obj_Json_Tax_totales.bases_ieps).length;

                                var rate_gbl = parseFloat(Object.keys(obj_Json_Tax_totales.bases_iva)[iv]);
                                var rate_gblB = rate_gbl / 100;
                                var monto_gbl = parseFloat(obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]]);
                                log.audit({title:'tambasivas',details:tambasivas});
                                log.audit({title:'tambasieps',details:tambasieps});
                                log.audit({title:'tambasret',details:tambasret});
                                if(tambasivas>0 || tambasivas>0 && tambasieps>0 || tambasivas>0 && tambasret>0){
                                    log.audit({title:'monto_gbl',details:monto_gbl});
                                    log.audit({title:'rate_gblB',details:rate_gblB});
                                    log.audit({title:'(monto_gbl * rate_gblB).toFixed(2);',details:(monto_gbl * rate_gblB).toFixed(2)});
                                    obj_Json_Tax_totales.monto_iva_gbl[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]] = (monto_gbl * rate_gblB).toFixed(2);
                                }else{
                                    obj_Json_Tax_totales.monto_iva_gbl[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]] = (obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]]);
                                }
                                var totImpu = parseFloat((monto_gbl * rate_gblB).toFixed(2));
                                totalImpuestos_gbl = totalImpuestos_gbl + totImpu;
                                totalTraslados_gbl = totalTraslados_gbl + totImpu;
                                iva_total_gbl = iva_total_gbl + totImpu;
                                log.audit({title:'iva_total_gbl',details:iva_total_gbl});
                            }

                            for (var loc = 0; loc < tam_obj_local; loc++) {
                                obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]] = parseFloat(obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]]).toFixed(2);

                                var rate_gbl = parseFloat(Object.keys(obj_Json_Tax_totales.bases_local)[loc]);
                                var rate_gblB = rate_gbl / 100;
                                var monto_gbl = parseFloat(obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]]);
                                obj_Json_Tax_totales.monto_local_gbl[Object.keys(obj_Json_Tax_totales.bases_local)[loc]] = (monto_gbl * rate_gblB).toFixed(2);
                                var totImpu = parseFloat((monto_gbl * rate_gblB).toFixed(2));
                                totalImpuestos_gbl = totalImpuestos_gbl + totImpu;
                                totalTraslados_gbl = totalTraslados_gbl + totImpu;
                                local_total_gbl = local_total_gbl + totImpu;
                            }

                            for (var ret = 0; ret < tam_obj_ret; ret++) {
                                obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]] = parseFloat(obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]]).toFixed(2);

                                var rate_gbl = parseFloat(Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]);
                                var rate_gblB = rate_gbl / 100;
                                var monto_gbl = parseFloat(obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]]);
                                obj_Json_Tax_totales.monto_ret_gbl[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]] = (monto_gbl * rate_gblB).toFixed(2);
                                var totImpu = parseFloat((monto_gbl * rate_gblB).toFixed(2)) * (-1);
                                totalImpuestos_gbl = totalImpuestos_gbl + totImpu;
                                totalRetenciones_gbl = totalRetenciones_gbl + totImpu;
                                retencion_total_gbl = retencion_total_gbl + totImpu;
                            }


                            obj_Json_Tax_totales.totalImpuestos_gbl = totalImpuestos_gbl.toFixed(2);
                            obj_Json_Tax_totales.subtotal_gbl = subtotalTransaccion.toFixed(2);
                            obj_Json_Tax_totales.total_gbl = (subtotalTransaccion + totalImpuestos_gbl - parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto)).toFixed(2);
                            obj_Json_Tax_totales.totalTraslados_gbl = totalTraslados_gbl.toFixed(2);
                            obj_Json_Tax_totales.totalRetenciones_gbl = totalRetenciones_gbl.toFixed(2);
                            obj_Json_Tax_totales.ieps_total_gbl = ieps_total_gbl.toFixed(2);
                            obj_Json_Tax_totales.iva_total_gbl = iva_total_gbl.toFixed(2);
                            obj_Json_Tax_totales.retencion_total_gbl = retencion_total_gbl.toFixed(2);
                            obj_Json_Tax_totales.local_total_gbl = local_total_gbl.toFixed(2);
                            log.audit({title:'obj_Json_Tax_totales',details:obj_Json_Tax_totales});

                            record_now.setValue({
                                fieldId: 'custbody_efx_fe_tax_json',
                                value: JSON.stringify(obj_Json_Tax_totales),
                                ignoreFieldChange: true
                            });

                            if(recType == record.Type.CREDIT_MEMO && existeSuiteTax){
                                var macros = record_now.getMacros();

                                // execute the macro
                                if ('calculateTax' in macros)
                                {
                                    macros.calculateTax(); // For promise version use: macros.calculateTax.promise()
                                }
                            }
                            // if(recType == record.Type.CREDIT_MEMO){
                            //     record_now.executeMacro({ id: record.Macro.CALCULATE_TAX });
                            //
                            //
                            // }


                            log.audit({title:'antes de guardar',details:''});


                            //record_now.save({enableSourcing: false, ignoreMandatoryFields: true});
                            log.audit({title:'despues de guardar',details:''});

                            return record_now;
                        }
                     }
                 }else{
                     return record_now_param;
                 }
             }catch (error) {
                 log.audit({title:'error',details:error});
                 var recordobj = record.load({
                     type: record_now.type,
                     id: record_now.id
                 });
                 recordobj.setValue({
                     fieldId: 'custbody_efx_fe_tax_json',
                     value: JSON.stringify(obj_Json_Tax_totales),
                     ignoreFieldChange: true
                 });
                 recordobj.save({enableSourcing:false, ignoreMandatoryFields:true});
             }
             if(recType == record.Type.PURCHASE_ORDER && line_count_expense>0){
                 impuestosExpenses(context);
             }
         }

         //EFX_FE_Tax_Fields_UE.js
         function impuestosExpenses(context){
             var obj_Json_Tax_totales = new Object();

             obj_Json_Tax_totales = {
                 ieps_total: 0,
                 iva_total: 0,
                 retencion_total: 0,
                 local_total: 0,
                 rates_ieps:{},
                 rates_ieps_data:{},
                 bases_ieps:{},
                 rates_iva:{},
                 rates_iva_data:{},
                 bases_iva:{},
                 rates_retencion:{},
                 rates_retencion_data:{},
                 bases_retencion:{},
                 rates_local:{},
                 rates_local_data:{},
                 bases_local:{},
                 descuentoConImpuesto:0,
                 descuentoSinImpuesto:0
             }
             var record_noww = context.newRecord;
             var recType = record_noww.type;
             var record_now = record.load({
                 type: recType,
                 id: record_noww.id
             });


             try {

                 if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                     var obj_Json_Tax = new Object();


                     var desglose_config = search.create({
                         type: 'customrecord_efx_fe_desglose_tax',
                         filters: ['isinactive',search.Operator.IS,'F'],
                         columns: [
                             search.createColumn({name: 'custrecord_efx_fe_desglose_ieps'}),
                             search.createColumn({name: 'custrecord_efx_fe_desglose_ret'}),
                             search.createColumn({name: 'custrecord_efx_fe_desglose_locales'}),
                             search.createColumn({name: 'custrecord_efx_fe_desglose_iva'}),
                         ]
                     });

                     var ejecutar = desglose_config.run();
                     var resultado = ejecutar.getRange(0, 100);

                     var config_ieps = new Array();
                     var config_retencion = new Array();
                     var config_local = new Array();
                     var config_iva = new Array();

                     config_ieps = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_ieps'})).split(',');
                     config_retencion = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_ret'})).split(',');
                     config_local = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_locales'})).split(',');
                     config_iva = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_iva'})).split(',');

                     log.audit({title:'config_ieps',details:config_ieps});
                     log.audit({title:'config_retencion',details:config_retencion});
                     log.audit({title:'config_local',details:config_local});
                     log.audit({title:'config_iva',details:config_iva});

                     var importe_retencion = 0;
                     var importe_iva = 0;
                     var importe_ieps = 0;
                     var importe_local = 0;
                     var line_count = record_now.getLineCount({sublistId: 'expense'});
                     for (var i = 0; i < line_count; i++) {
                         log.audit({title:'linea',details:i});
                         obj_Json_Tax = {
                             ieps: {
                                 name: "",
                                 id: "",
                                 factor:"003",
                                 rate: 0,
                                 base: 0,
                                 base_importe: 0,
                                 importe: '',
                                 rate_div:0,
                                 descuento:0
                             },
                             locales: {
                                 name: "",
                                 id: "",
                                 factor:"002",
                                 rate: 0,
                                 base: 0,
                                 base_importe: 0,
                                 importe: '',
                                 rate_div:0,
                                 descuento:0
                             },
                             retenciones: {
                                 name: "",
                                 id: "",
                                 factor:"002",
                                 rate: 0,
                                 base: 0,
                                 base_importe: 0,
                                 importe: '',
                                 rate_div:0,
                                 descuento:0
                             },
                             iva: {
                                 name: "",
                                 id: "",
                                 factor:"002",
                                 rate: 0,
                                 base: 0,
                                 base_importe: 0,
                                 importe: '',
                                 rate_div:0,
                                 descuento:0
                             },
                             descuentoConImpuesto:0,
                             descuentoSinImpuesto:0
                         }
                         var descuento_linea = 0;
                         var descuento_linea_sin = 0;
                         var tipo_articulo = record_now.getSublistValue({sublistId: 'expense', fieldId: 'itemtype', line: i});
                         log.audit({title:'tipo_articulo',details:tipo_articulo});
                         if(tipo_articulo=='Discount'){
                             continue;
                         }
                         var descuento_notax =0;
                         if(i<(line_count-1)){
                             var tipo_articulo = record_now.getSublistValue({sublistId: 'expense', fieldId: 'itemtype', line: i+1});
                             if(tipo_articulo=='Discount') {
                                 var linea_descuentos_monto = record_now.getSublistValue({
                                     sublistId: 'expense',
                                     fieldId: 'grossamt',
                                     line: i + 1
                                 });

                                 var a_rate = record_now.getSublistValue({
                                     sublistId: 'item',
                                     fieldId: 'rate',
                                     line: i + 1
                                 });
                                 var a_quantity = record_now.getSublistValue({
                                     sublistId: 'item',
                                     fieldId: 'quantity',
                                     line: i + 1
                                 });
                                 if(!a_quantity){
                                     a_quantity=1;
                                 }

                                 descuento_notax = parseFloat(a_rate)*parseFloat(a_quantity);

                                 // descuento_notax = record_now.getSublistValue({
                                 //     sublistId: 'expense',
                                 //     fieldId: 'amount',
                                 //     line: i + 1
                                 // });
                                 descuento_linea = linea_descuentos_monto*(-1);
                                 descuento_linea_sin = descuento_notax*(-1);
                                 obj_Json_Tax_totales.descuentoConImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoConImpuesto)+descuento_linea).toFixed(2);
                                 obj_Json_Tax_totales.descuentoSinImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto)+descuento_linea_sin).toFixed(2);
                                 obj_Json_Tax.descuentoConImpuesto = descuento_linea.toFixed(2);
                                 obj_Json_Tax.descuentoSinImpuesto = descuento_linea_sin.toFixed(2);
                             }
                         }

                         var base_rate = record_now.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
                         var base_quantity = record_now.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                         var tax_code = record_now.getSublistValue({sublistId: 'item', fieldId: 'taxcode', line: i});
                         // var importe_base = record_now.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
                         var importe_base = parseFloat(base_rate)*parseFloat(base_quantity);
                         var total_linea = parseFloat(record_now.getSublistValue({sublistId: 'expense', fieldId: 'tax1amt', line: i}));

                         var suma_linea = 0;
                         var suma_linea_tax = 0;

                         var grupo_impuestos = true;
                         try{
                             var info_tax_rec = record.load({
                                 type: record.Type.TAX_GROUP,
                                 id: tax_code,
                                 isDynamic: true
                             });

                             var tax_lines_count = info_tax_rec.getLineCount({sublistId: 'taxitem'});
                             log.audit({title:'tax_lines_count',details:tax_lines_count});
                             grupo_impuestos=true;

                         }catch(error_grup){
                             var info_tax_rec = record.load({
                                 type: record.Type.SALES_TAX_ITEM,
                                 id: tax_code,
                                 isDynamic: true
                             });

                             var tax_lines_count = 1;
                             log.audit({title:'tax_lines_count',details:tax_lines_count});

                             grupo_impuestos=false;
                         }

                         var contadorLineas = 0;
                         var tiene_ieps = 0;
                         for (var x = 0; x < tax_lines_count; x++) {
                             if(grupo_impuestos) {
                                 var tax_name = info_tax_rec.getSublistValue({
                                     sublistId: 'taxitem',
                                     fieldId: 'taxname2',
                                     line: x
                                 });
                                 var tax_id = info_tax_rec.getSublistValue({
                                     sublistId: 'taxitem',
                                     fieldId: 'taxname',
                                     line: x
                                 });
                                 var tax_rate = info_tax_rec.getSublistValue({
                                     sublistId: 'taxitem',
                                     fieldId: 'rate',
                                     line: x
                                 });
                                 var tax_base = info_tax_rec.getSublistValue({
                                     sublistId: 'taxitem',
                                     fieldId: 'basis',
                                     line: x
                                 });
                                 var tax_tipo = info_tax_rec.getSublistValue({
                                     sublistId: 'taxitem',
                                     fieldId: 'taxtype',
                                     line: x
                                 });
                             }else{
                                 var tax_name = info_tax_rec.getValue({
                                     fieldId: 'itemid',
                                 });
                                 var tax_id = info_tax_rec.getValue({
                                     fieldId: 'id',
                                 });
                                 var tax_rate = info_tax_rec.getValue({
                                     fieldId: 'rate',
                                 });
                                 var tax_base = '100';

                                 var tax_tipo = info_tax_rec.getText({
                                     fieldId: 'taxtype',
                                 });
                             }



                             log.audit({title:'tax_rate',details:tax_rate});
                             //var rate_replace = tax_rate.replace("%", "");
                             var rate_number = parseFloat(tax_rate);

                             //definir retenciones
                             for(var ret =0; ret<config_retencion.length;ret++){
                                 if(tax_id==config_retencion[ret]){
                                     obj_Json_Tax.retenciones.rate = rate_number * (-1);
                                     obj_Json_Tax.retenciones.id = tax_id;
                                     obj_Json_Tax.retenciones.base = tax_base;
                                     obj_Json_Tax.retenciones.name = tax_name;
                                     var base_imp = (parseFloat(importe_base)*parseFloat(tax_base))/100;
                                     obj_Json_Tax.retenciones.base_importe = base_imp.toFixed(2);
                                     var rate_num = rate_number * (-1);
                                     var base_calc= parseFloat(tax_base)/100;
                                     var rate_div = rate_num / 100;
                                     obj_Json_Tax.retenciones.rate_div = rate_div;

                                     var tax_importe = (rate_div * parseFloat(importe_base))*base_calc;

                                     obj_Json_Tax.retenciones.importe = tax_importe.toFixed(2);
                                     tax_importe = parseFloat(tax_importe.toFixed(2));
                                     importe_retencion = parseFloat(importe_retencion) + parseFloat(tax_importe);
                                     //suma para comparar diferencia de centavos
                                     suma_linea = suma_linea-parseFloat(tax_importe);
                                     suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                     //
                                     var cadena = 'Retencion ';
                                     var cadena_rate = cadena+rate_num+'%';
                                     var tam_rates_ret = Object.keys(obj_Json_Tax_totales.rates_retencion).length;
                                     if(tam_rates_ret>0){
                                         for(var t=0;t<tam_rates_ret;t++){
                                             if(Object.keys(obj_Json_Tax_totales.rates_retencion)[t]==cadena_rate){
                                                 var importe_obj = obj_Json_Tax_totales.rates_retencion[cadena_rate];
                                                 var base_ret_total = obj_Json_Tax_totales.bases_retencion[rate_num];
                                                 var obj_ret_total_base = parseFloat(base_ret_total)+parseFloat(base_imp);
                                                 var obj_ret_total = parseFloat(importe_obj)+parseFloat(tax_importe.toFixed(2));

                                                 obj_Json_Tax_totales.rates_retencion[cadena_rate] = obj_ret_total.toFixed(2);
                                                 obj_Json_Tax_totales.rates_retencion_data[rate_num] = obj_ret_total.toFixed(2);
                                                 obj_Json_Tax_totales.bases_retencion[rate_num] = obj_ret_total_base.toFixed(2);
                                             }else{
                                                 if(!obj_Json_Tax_totales.rates_retencion[cadena_rate]){
                                                     obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                     obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                     obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                                 }
                                             }
                                         }
                                     }else{
                                         obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                         obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                         obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                     }
                                 }
                             }


                             //definir locales

                             for(var loc =0; loc<config_local.length;loc++){
                                 if(tax_id==config_local[loc]){
                                     obj_Json_Tax.locales.rate = rate_number;
                                     obj_Json_Tax.locales.id = tax_id;
                                     obj_Json_Tax.locales.base = tax_base;
                                     obj_Json_Tax.locales.name = tax_name;
                                     var base_imp = (parseFloat(importe_base)*parseFloat(tax_base))/100;
                                     obj_Json_Tax.locales.base_importe = base_imp.toFixed(2);
                                     var rate_num = rate_number * (-1);
                                     var base_calc= parseFloat(tax_base)/100;
                                     var rate_div = rate_number / 100;
                                     obj_Json_Tax.locales.rate_div = rate_div;
                                     var tax_importe = (rate_div * parseFloat(importe_base))*base_calc;
                                     obj_Json_Tax.locales.importe = tax_importe.toFixed(2);
                                     tax_importe = parseFloat(tax_importe.toFixed(2));
                                     importe_local = parseFloat(importe_local) + parseFloat(tax_importe);
                                     //suma para comparar diferencia de centavos

                                     suma_linea = suma_linea+parseFloat(tax_importe);
                                     suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                     //

                                     var cadena = 'Local ';
                                     var cadena_rate = cadena+rate_number+'%';
                                     var tam_rates_locales = Object.keys(obj_Json_Tax_totales.rates_local).length;

                                     if(tam_rates_locales>0){
                                         for(var t=0;t<tam_rates_locales;t++){
                                             if(Object.keys(obj_Json_Tax_totales.rates_local)[t]==cadena_rate){
                                                 var importe_obj = obj_Json_Tax_totales.rates_local[cadena_rate];
                                                 var base_local_total = obj_Json_Tax_totales.bases_local[rate_number];
                                                 var obj_local_total_base = parseFloat(base_local_total)+parseFloat(base_imp);
                                                 var obj_loc_total = parseFloat(importe_obj)+parseFloat(tax_importe.toFixed(2));

                                                 obj_Json_Tax_totales.rates_local[cadena_rate] = obj_loc_total.toFixed(2);
                                                 obj_Json_Tax_totales.rates_local_data[rate_number] = obj_loc_total.toFixed(2);
                                                 obj_Json_Tax_totales.bases_local[rate_number] = obj_local_total_base.toFixed(2);
                                             }else{
                                                 if(!obj_Json_Tax_totales.rates_local[cadena_rate]){
                                                     obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                     obj_Json_Tax_totales.rates_local_data[rate_number] = tax_importe.toFixed(2);
                                                     obj_Json_Tax_totales.bases_local[rate_number] = base_imp.toFixed(2);
                                                 }
                                             }
                                         }
                                     }else{
                                         obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                         obj_Json_Tax_totales.rates_local_data[rate_number] = tax_importe.toFixed(2);
                                         obj_Json_Tax_totales.bases_local[rate_number] = base_imp.toFixed(2);
                                     }
                                 }
                             }

                             //definir ieps

                             for(var iep =0; iep<config_ieps.length;iep++){
                                 if(tax_id==config_ieps[iep]){
                                     if(descuento_notax!=0){
                                         tiene_ieps++;
                                     }

                                     obj_Json_Tax.ieps.rate = rate_number;
                                     obj_Json_Tax.ieps.id = tax_id;
                                     obj_Json_Tax.ieps.base = tax_base;
                                     obj_Json_Tax.ieps.name = tax_name;
                                     obj_Json_Tax.ieps.descuento = (descuento_notax*(-1)).toFixed(2);
                                     var base_imp = ((parseFloat(importe_base)*parseFloat(tax_base))/100)+descuento_notax;
                                     obj_Json_Tax.ieps.base_importe = base_imp.toFixed(2);
                                     var base_calc= parseFloat(tax_base)/100;
                                     var rate_div = rate_number / 100;
                                     obj_Json_Tax.ieps.rate_div = rate_div;
                                     var tax_importe = (rate_div * parseFloat(importe_base+descuento_notax))*base_calc;
                                     obj_Json_Tax.ieps.importe = tax_importe.toFixed(2);
                                     tax_importe = parseFloat(tax_importe.toFixed(2));
                                     log.audit({title:'importe_ieps',details:importe_ieps});
                                     log.audit({title:'tax_importe',details:tax_importe});
                                     importe_ieps = parseFloat(importe_ieps) + parseFloat(tax_importe);
                                     log.audit({title:'importe_ieps_suma',details:importe_ieps});
                                     //suma para comparar diferencia de centavos
                                     var tax_importe_sumas = (rate_div * parseFloat(importe_base))*base_calc;
                                     //tax_importe_sumas = tax_importe_sumas.toFixed(2)
                                     suma_linea = suma_linea+parseFloat(tax_importe_sumas);
                                     suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                     //

                                     var cadena = 'IEPS ';
                                     var cadena_rate = cadena+rate_number+'%';
                                     log.audit({title:'cadena_rate_ieps',details:cadena_rate});
                                     var tam_rates_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                                     if(tam_rates_ieps>0){
                                         for(var t=0;t<tam_rates_ieps;t++){
                                             log.audit({title:'obj_Json_Tax_totales.rates_ieps)[t]',details:Object.keys(obj_Json_Tax_totales.rates_ieps)[t]});
                                             log.audit({title:'cadena_rate',details:cadena_rate});
                                             if(Object.keys(obj_Json_Tax_totales.rates_ieps)[t]==cadena_rate){
                                                 var importe_obj = obj_Json_Tax_totales.rates_ieps[cadena_rate];
                                                 log.audit({title:'importe_obj',details:importe_obj});
                                                 var base_ieps_total = obj_Json_Tax_totales.bases_ieps[rate_number];
                                                 var obj_ieps_total_base = parseFloat(base_ieps_total)+parseFloat(base_imp);
                                                 var obj_ieps_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                 obj_Json_Tax_totales.rates_ieps[cadena_rate] = obj_ieps_total.toFixed(2);
                                                 obj_Json_Tax_totales.rates_ieps_data[rate_number] = obj_ieps_total.toFixed(2);
                                                 obj_Json_Tax_totales.bases_ieps[rate_number] = obj_ieps_total_base.toFixed(2);
                                             }else{
                                                 if(!obj_Json_Tax_totales.rates_ieps[cadena_rate]){
                                                     obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                     obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                     obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp.toFixed(2);
                                                 }
                                             }
                                         }
                                     }else{
                                         obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                         obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                         obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp.toFixed(2);
                                     }
                                     log.audit({title:'obj_Json_Tax_totales_ieps',details:obj_Json_Tax_totales});
                                 }

                             }

                             //definir ivas

                             for(var iva=0; iva<config_iva.length;iva++){
                                 if(tax_id==config_iva[iva]){
                                     obj_Json_Tax.iva.rate = rate_number;
                                     obj_Json_Tax.iva.id = tax_id;
                                     obj_Json_Tax.iva.base = tax_base;
                                     obj_Json_Tax.iva.name = tax_name;
                                     log.audit({title:'tiene_ieps',details:tiene_ieps});
                                     var importe_base_des = 0;
                                     if(tiene_ieps>0) {
                                         importe_base_des =importe_base;
                                         importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                         var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)
                                     }else{
                                         var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)+descuento_notax;
                                         obj_Json_Tax.iva.descuento = (descuento_notax*(-1)).toFixed(2);
                                     }
                                     obj_Json_Tax.iva.base_importe = base_imp.toFixed(2);
                                     var base_calc= parseFloat(tax_base)/100;
                                     var rate_div = rate_number / 100;
                                     obj_Json_Tax.iva.rate_div = rate_div;
                                     // var rate_div_f = rate_div.toFixed(2);
                                     // var importe_base_f = importe_base.toFixed(2);
                                     // var base_calc_f = base_calc.toFixed(2);
                                     if(tiene_ieps<=0) {
                                         var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base+descuento_notax))*parseFloat(base_calc);
                                     }else{
                                         log.audit({title:'rate_div',details:rate_div});
                                         log.audit({title:'base_imp',details:base_imp});
                                         log.audit({title:'base_calc',details:base_calc});
                                         var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                     }
                                     log.audit({title:'tax_importe_iva_nof',details:tax_importe});
                                     obj_Json_Tax.iva.importe = tax_importe.toFixed(2);
                                     tax_importe = parseFloat(tax_importe.toFixed(2));
                                     importe_iva = parseFloat(importe_iva) + parseFloat(tax_importe);
                                     //suma para comparar diferencia de centavos
                                     if(tiene_ieps<=0) {
                                         var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                         //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                     }else {
                                         var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base_des)) * parseFloat(base_calc);
                                         //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                     }
                                     suma_linea = suma_linea+parseFloat(tax_importe_sumas);
                                     suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                     log.audit({title:'suma_linea_iva',details:suma_linea});
                                     log.audit({title:'tax_importe_iva',details:tax_importe});
                                     //

                                     var cadena = 'IVA ';
                                     var cadena_rate = cadena+rate_number+'%';
                                     log.audit({title:'cadena_rate_iva',details:cadena_rate});
                                     var tam_rates_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;
                                     log.audit({title:'base_imp',details:base_imp});
                                     if(tam_rates_iva>0){
                                         for(var t=0;t<tam_rates_iva;t++){
                                             if(Object.keys(obj_Json_Tax_totales.rates_iva)[t]==cadena_rate){

                                                 log.audit({title:'tax_importe_ivif',details:tax_importe});
                                                 var importe_obj = obj_Json_Tax_totales.rates_iva[cadena_rate];
                                                 var base_iva_total = obj_Json_Tax_totales.bases_iva[rate_number];
                                                 var obj_iva_total_base = parseFloat(base_iva_total)+parseFloat(base_imp);
                                                 var obj_iva_total = parseFloat(importe_obj)+parseFloat(tax_importe.toFixed(2));

                                                 obj_Json_Tax_totales.rates_iva[cadena_rate] = obj_iva_total.toFixed(2);
                                                 obj_Json_Tax_totales.rates_iva_data[rate_number] = obj_iva_total.toFixed(2);
                                                 log.audit({title:'obj_iva_total_base',details:obj_iva_total_base});
                                                 obj_Json_Tax_totales.bases_iva[rate_number] = obj_iva_total_base.toFixed(2) || 0;
                                                 log.audit({title:'obj_Json_Tax_totales.bases_iva[rate_number]',details:obj_Json_Tax_totales.bases_iva[rate_number]});
                                             }else{
                                                 if(!obj_Json_Tax_totales.rates_iva[cadena_rate]){
                                                     log.audit({title:'tax_importe_iv0_else',details:tax_importe});
                                                     obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                                     obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                                     log.audit({title:'base_imp_else',details:base_imp});
                                                     obj_Json_Tax_totales.bases_iva[rate_number] = base_imp.toFixed(2) || '0.00';
                                                     log.audit({title:'obj_Json_Tax_totales.bases_iva[rate_number]',details:obj_Json_Tax_totales.bases_iva[rate_number]});
                                                 }

                                             }
                                         }
                                     }else{
                                         obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                         log.audit({title:'tax_importe_iv0',details:tax_importe});
                                         obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                         log.audit({title:'base_imp_else2',details:base_imp});
                                         obj_Json_Tax_totales.bases_iva[rate_number] = base_imp.toFixed(2) || '0.00';
                                         log.audit({title:'obj_Json_Tax_totales.bases_iva[rate_number]',details:obj_Json_Tax_totales.bases_iva[rate_number]});
                                     }
                                     log.audit({title:'obj_Json_Tax_totales_iva',details:obj_Json_Tax_totales});
                                 }

                             }


                             contadorLineas++;
                         }


                         log.audit({title:'total_linea',details:total_linea});
                         log.audit({title:'suma_linea',details:suma_linea});
                         suma_linea=suma_linea.toFixed(2);
                         log.audit({title:'suma_linea',details:suma_linea});

                         var diferencia_centavos = parseFloat(total_linea)-parseFloat(suma_linea);
                         diferencia_centavos= diferencia_centavos.toFixed(2);
                         diferencia_centavos = parseFloat(diferencia_centavos);

                         if(diferencia_centavos<0){
                             diferencia_centavos = diferencia_centavos*(1);
                         }

                         if(diferencia_centavos>0){
                             diferencia_centavos = diferencia_centavos*(1);
                         }



                         log.audit({title:'diferencia_centavos',details:diferencia_centavos});
                         log.audit({title:'importe_retencion',details:importe_retencion});
                         log.audit({title:'importe_iva',details:importe_iva});
                         log.audit({title:'importe_local',details:importe_local});
                         log.audit({title:'importe_ieps',details:importe_ieps});

                         if(diferencia_centavos!=0){

                             if(obj_Json_Tax.retenciones.importe){
                                 var nuevo_importe = parseFloat(obj_Json_Tax.retenciones.importe)+parseFloat(diferencia_centavos);
                                 obj_Json_Tax.retenciones.importe = nuevo_importe;
                                 importe_retencion = parseFloat(importe_retencion)+parseFloat(diferencia_centavos);
                                 log.audit({title:'importe_retencion',details:importe_retencion});

                             }else if(obj_Json_Tax.iva.importe){

                                 var nuevo_importe = parseFloat(obj_Json_Tax.iva.importe)+parseFloat(diferencia_centavos);
                                 obj_Json_Tax.iva.importe = nuevo_importe.toFixed(2);
                                 importe_iva = parseFloat(importe_iva)+parseFloat(diferencia_centavos);
                                 log.audit({title:'importe_iva',details:importe_iva});
                                 log.audit({title:'diferencia_centavos_iva',details:diferencia_centavos});

                             }else if(obj_Json_Tax.locales.importe){

                                 var nuevo_importe = parseFloat(obj_Json_Tax.locales.importe)+parseFloat(diferencia_centavos);
                                 obj_Json_Tax.locales.importe = nuevo_importe;
                                 importe_local = parseFloat(importe_local)+parseFloat(diferencia_centavos);
                                 log.audit({title:'importe_local',details:importe_local});

                             }else if(obj_Json_Tax.ieps.importe){

                                 var nuevo_importe = parseFloat(obj_Json_Tax.ieps.importe)+parseFloat(diferencia_centavos);
                                 obj_Json_Tax.ieps.importe = nuevo_importe;
                                 importe_ieps = parseFloat(importe_ieps)+parseFloat(diferencia_centavos);
                                 log.audit({title:'importe_ieps_difcentavos',details:importe_ieps});

                             }
                         }

                         record_now.setSublistValue({
                             sublistId: 'expense',
                             fieldId: 'custcol_efx_fe_tax_json',
                             line: i,
                             value: JSON.stringify(obj_Json_Tax),
                         });


                     }

                     log.audit({title:'importe_retencion',details:importe_retencion});
                     log.audit({title:'importe_iva',details:importe_iva.toFixed(2)});
                     log.audit({title:'importe_ieps',details:importe_ieps});
                     log.audit({title:'importe_local',details:importe_local});



                     obj_Json_Tax_totales.retencion_total = parseFloat(importe_retencion).toFixed(2) || '0.00';
                     obj_Json_Tax_totales.iva_total = parseFloat(importe_iva).toFixed(2) || '0.00';
                     obj_Json_Tax_totales.ieps_total = parseFloat(importe_ieps).toFixed(2) || '0.00';
                     obj_Json_Tax_totales.local_total = parseFloat(importe_local).toFixed(2) || '0.00';


                     //validar que la suma de desglose coincida con el total
                     log.audit({title:'objivas',details:Object.keys(obj_Json_Tax_totales.rates_iva)});
                     log.audit({title:'objivas',details:Object.keys(obj_Json_Tax_totales.rates_iva_data)});
                     //log.audit({title:'objivas',details:Object.values(obj_Json_Tax_totales.rates_iva)});
                     var tam_obj_totales_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;
                     var sumas_ivas = 0;
                     if(tam_obj_totales_iva>0) {
                         for (var iva = 0; iva < tam_obj_totales_iva; iva++) {

                             sumas_ivas = sumas_ivas + parseFloat(obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]);
                         }
                         for (var iva = 0; iva < tam_obj_totales_iva; iva++) {
                             if (parseFloat(obj_Json_Tax_totales.iva_total) != sumas_ivas) {

                                 var diferencia_imp = parseFloat(obj_Json_Tax_totales.iva_total)-sumas_ivas;

                                 diferencia_imp = diferencia_imp.toFixed(2);
                                 diferencia_imp = parseFloat(diferencia_imp);


                                 if(Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva] == 0) {
                                     obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]] = 0;
                                     obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]] = 0;

                                 }else{
                                     var ttt = Object.keys(obj_Json_Tax_totales.rates_iva);
                                     obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]] = parseFloat(obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]) + diferencia_imp;
                                     log.audit({title:'diferencia_imp',details:obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]});
                                     obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]] = parseFloat(obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]]) + diferencia_imp;
                                 }
                                 obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iva]] = parseFloat(obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iva]]) + diferencia_imp || 0;

                             }
                         }


                     }

                     var tam_obj_totales_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                     var sumas_ieps = 0;
                     if(tam_obj_totales_ieps>0) {
                         for (var ieps = 0; ieps < tam_obj_totales_ieps; ieps++) {
                             sumas_ieps = sumas_ieps + parseFloat(obj_Json_Tax_totales.rates_ieps[Object.keys(obj_Json_Tax_totales.rates_ieps)[ieps]]);

                         }

                         for (var ieps = 0; ieps < tam_obj_totales_ieps; ieps++) {
                             if (parseFloat(obj_Json_Tax_totales.ieps_total) != sumas_ieps) {

                                 var diferencia_imp = parseFloat(obj_Json_Tax_totales.ieps_total) - sumas_ieps;
                                 obj_Json_Tax_totales.rates_ieps[Object.keys(obj_Json_Tax_totales.rates_ieps)[ieps]] = (parseFloat(obj_Json_Tax_totales.rates_ieps[Object.keys(obj_Json_Tax_totales.rates_ieps)[ieps]]) + diferencia_imp).toFixed(2);
                                 obj_Json_Tax_totales.rates_ieps_data[Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]] = (parseFloat(obj_Json_Tax_totales.rates_ieps_data[Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]]) + diferencia_imp).toFixed(2);
                                 obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[ieps]] = (parseFloat(obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[ieps]]) + diferencia_imp).toFixed(2);

                             }
                         }
                     }

                     var tam_obj_totales_local = Object.keys(obj_Json_Tax_totales.rates_local).length;

                     var sumas_locales = 0;
                     if(tam_obj_totales_local>0) {
                         for (var loc = 0; loc < tam_obj_totales_local; loc++) {
                             sumas_locales = sumas_locales + parseFloat(obj_Json_Tax_totales.rates_local[Object.keys(obj_Json_Tax_totales.rates_local)[loc]]);
                         }
                         for (var loc = 0; loc < tam_obj_totales_local; loc++) {
                             if (parseFloat(obj_Json_Tax_totales.local_total) != sumas_locales) {

                                 var diferencia_imp = parseFloat(obj_Json_Tax_totales.local_total) - sumas_locales;
                                 obj_Json_Tax_totales.rates_local[Object.keys(obj_Json_Tax_totales.rates_local)[loc]] = parseFloat(obj_Json_Tax_totales.rates_local[Object.keys(obj_Json_Tax_totales.rates_local)[loc]]) + diferencia_imp;
                                 obj_Json_Tax_totales.rates_local_data[Object.keys(obj_Json_Tax_totales.rates_local_data)[loc]] = parseFloat(obj_Json_Tax_totales.rates_local_data[Object.keys(obj_Json_Tax_totales.rates_local_data)[loc]]) + diferencia_imp;
                                 obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]] = parseFloat(obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]]) + diferencia_imp;

                             }
                         }
                     }

                     var tam_obj_totales_ret = Object.keys(obj_Json_Tax_totales.rates_retencion).length;
                     log.audit({title:'tam_obj_totales_ret',details:tam_obj_totales_ret});
                     var sumas_ret = 0;
                     if(tam_obj_totales_ret>0) {
                         for (var ret = 0; ret < tam_obj_totales_ret; ret++) {
                             sumas_ret = sumas_ret + parseFloat(obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]]);


                             log.audit({title: 'sumas_ret', details: sumas_ret});
                             log.audit({
                                 title: 'obj_Json_Tax_totales.retencion_total',
                                 details: obj_Json_Tax_totales.retencion_total
                             });
                         }
                         for (var ret = 0; ret < tam_obj_totales_ret; ret++) {
                             if (parseFloat(obj_Json_Tax_totales.retencion_total) != sumas_ret) {

                                 var diferencia_imp = parseFloat(obj_Json_Tax_totales.retencion_total) - sumas_ret;
                                 log.audit({title: 'diferencia_imp', details: diferencia_imp});
                                 obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]] = parseFloat(obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]]) + diferencia_imp;
                                 obj_Json_Tax_totales.rates_retencion_data[Object.keys(obj_Json_Tax_totales.rates_retencion_data)[ret]] = parseFloat(obj_Json_Tax_totales.rates_retencion_data[Object.keys(obj_Json_Tax_totales.rates_retencion_data)[ret]]) + diferencia_imp;
                                 obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]] = parseFloat(obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]]) + diferencia_imp;

                             }
                         }
                     }



                     record_now.setValue({
                         fieldId: 'custbody_efx_fe_tax_json',
                         value: JSON.stringify(obj_Json_Tax_totales),
                         ignoreFieldChange: true
                     });
                     record_now.save({enableSourcing:true, ignoreMandatoryFields:true});
                 }
             }catch (error) {
                 log.audit({title:'error',details:error});

             }
         }

         //EFX_FE_Tax_Fields_UE.js
         function obtieneSuiteTaxInfo(record_now,taxref_linea,countimpuesto,record_now_nodymamic){
             //var countimpuesto = record_now.getLineCount({sublistId:'taxdetails'});
             var objST = {}

             log.audit({title:'countimpuesto',details:countimpuesto});
             log.audit({title:'taxref_linea',details:taxref_linea});
             for(var st=0;st<countimpuesto;st++){
                 var taxref_imp = record_now_nodymamic.getSublistValue({
                     sublistId:'taxdetails',
                     fieldId:'taxdetailsreference',
                     line:st
                 });
                 log.audit({title:'taxref_imp',details:taxref_imp});
                 if(taxref_imp==taxref_linea){
                     if(objST.hasOwnProperty(taxref_imp)){
                         var objLineaSt = {
                             base:'',
                             taxcode:'',
                             rate:'',
                             nombre:''
                         }
                         // objLineaSt.base = record_now.getSublistValue({sublistId:'taxdetails',fieldId:'taxbasis',line:st});
                         objLineaSt.base = 100;
                         objLineaSt.taxcode = record_now_nodymamic.getSublistValue({sublistId:'taxdetails',fieldId:'taxcode',line:st});
                         objLineaSt.rate = record_now_nodymamic.getSublistValue({sublistId:'taxdetails',fieldId:'taxrate',line:st});
                         objLineaSt.nombre = record_now_nodymamic.getSublistValue({sublistId:'taxdetails',fieldId:'taxcode_display',line:st});
                         objST[taxref_imp].push(objLineaSt);
                     }else{
                         var objLineaSt = {
                             base:'',
                             taxcode:'',
                             rate:'',
                             nombre:''
                         }
                         // objLineaSt.base = record_now.getSublistValue({sublistId:'taxdetails',fieldId:'taxbasis',line:st});
                         objLineaSt.base = 100;
                         objLineaSt.taxcode = record_now_nodymamic.getSublistValue({sublistId:'taxdetails',fieldId:'taxcode',line:st});
                         objLineaSt.rate = record_now_nodymamic.getSublistValue({sublistId:'taxdetails',fieldId:'taxrate',line:st});
                         objLineaSt.nombre = record_now_nodymamic.getSublistValue({sublistId:'taxdetails',fieldId:'taxcode_display',line:st});
                         objST[taxref_imp] = new Array();
                         objST[taxref_imp].push(objLineaSt);
                     }
                 }
                 log.audit({title:'objST',details:objST});

             }
             log.audit({title:'objST',details:objST});
             return objST;
         }

         //EFX_FE_Tax_Fields_UE.js
         function obtenObjImpuesto(subsidiariaTransaccion,nexo){
             var objcodigosMainFull = {};
             var objcodigosMain = {};
             var objcodigosMainCodes = {};
             var arrayobjcodigos = new Array();

             var arraybusquedagroup = new Array();
             var arraybusquedacode = new Array();
             arraybusquedagroup.push(["isinactive",search.Operator.IS,"F"]);
             arraybusquedacode.push(["isinactive",search.Operator.IS,"F"]);

             if(subsidiariaTransaccion){
                 arraybusquedagroup.push("AND");
                 arraybusquedacode.push("AND");
                 arraybusquedagroup.push(["subsidiary",search.Operator.ANYOF,subsidiariaTransaccion]);
                 arraybusquedacode.push(["subsidiary",search.Operator.ANYOF,subsidiariaTransaccion]);
                 arraybusquedagroup.push("AND");
                 arraybusquedagroup.push(["country",search.Operator.ANYOF,nexo]);
                 arraybusquedacode.push("AND");
                arraybusquedacode.push(["country",search.Operator.ANYOF,nexo]);
             }
             log.audit({title:'arraybusquedagroup',details:arraybusquedagroup});
             log.audit({title:'arraybusquedacode',details:arraybusquedacode});

                     //busca grupos de impuestos
             var taxgroupSearchObj = search.create({
                 type: search.Type.TAX_GROUP,
                 filters:arraybusquedagroup,
                 columns:
                     [
                         search.createColumn({name: "itemid",}),
                         search.createColumn({name: "rate", label: "Tasa"}),
                         search.createColumn({name: "country", label: "País"}),
                         search.createColumn({name: "internalid", label: "ID interno"})
                     ]
             });
             var ejecutar = taxgroupSearchObj.run();
             var resultado = ejecutar.getRange(0, 900);

             for(var i=0;i<resultado.length;i++){
                 var tax_code = resultado[i].getValue({name: "internalid"});

                 var info_tax_rec = record.load({
                     type: record.Type.TAX_GROUP,
                     id: tax_code,
                     isDynamic: true
                 });
                 objcodigosMain[tax_code] = new Array();

                 var tax_lines_count = info_tax_rec.getLineCount({sublistId: 'taxitem'});
                 for(var x=0;x<tax_lines_count;x++) {
                     var objcodigos={
                         taxname2:'',
                         taxname:'',
                         rate:'',
                         basis:'',
                         taxtype:'',
                     }
                     objcodigos.taxname2 = info_tax_rec.getSublistValue({
                         sublistId: 'taxitem',
                         fieldId: 'taxname2',
                         line: x
                     });
                     objcodigos.taxname = info_tax_rec.getSublistValue({
                         sublistId: 'taxitem',
                         fieldId: 'taxname',
                         line: x
                     });
                     objcodigos.rate = info_tax_rec.getSublistValue({
                         sublistId: 'taxitem',
                         fieldId: 'rate',
                         line: x
                     });
                     objcodigos.basis = info_tax_rec.getSublistValue({
                         sublistId: 'taxitem',
                         fieldId: 'basis',
                         line: x
                     });
                     objcodigos.taxtype = info_tax_rec.getSublistValue({
                         sublistId: 'taxitem',
                         fieldId: 'taxtype',
                         line: x
                     });
                     objcodigosMain[tax_code].push(objcodigos);
                 }
             }


             //busca codigos de impuestos

             var salestaxitemSearchObj = search.create({
                 type: search.Type.SALES_TAX_ITEM,
                 filters: arraybusquedacode,
                 columns: [
                     search.createColumn({name: "name",}),
                     search.createColumn({name: "itemid", label: "ID de artículo"}),
                     search.createColumn({name: "rate", label: "Tasa"}),
                     search.createColumn({name: "country", label: "País"}),
                     //search.createColumn({name: "custrecord_4110_category", label: "Categoría"}),
                     search.createColumn({name: "internalid", label: "ID interno"}),
                     search.createColumn({name: "taxtype", label: "Tipo Impuesto"})
                 ]
             });

             var ejecutar = salestaxitemSearchObj.run();
             var resultado = ejecutar.getRange(0, 900);


             //objcodigosMainCodes.codigos = new Array();
             for(i=0;i<resultado.length;i++){

                 var tax_code = resultado[i].getValue({name: "internalid"});


                 objcodigosMainCodes[tax_code] = new Array();

                 var objcodigos={
                     itemid:'',
                     id:'',
                     rate:'',
                     basis:'100',
                     taxtype:'',
                 }

                 objcodigos.itemid = resultado[i].getValue({name: "itemid"});
                 objcodigos.id = resultado[i].getValue({name: "internalid"});
                 var ratecode = (resultado[i].getValue({name: "rate"})).replace('%','');
                 objcodigos.rate = parseFloat(ratecode);
                 objcodigos.basis = '100';

                 objcodigos.taxtype = resultado[i].getText({name: "taxtype"});
                 objcodigosMainCodes[tax_code].push(objcodigos);

             }

             objcodigosMainFull.TaxGroup = objcodigosMain;
             objcodigosMainFull.TaxCodes = objcodigosMainCodes;

             log.audit({title:'objcodigosMainFull',details:objcodigosMainFull});

             return objcodigosMainFull;

         }

         //EFX_FE_Tax_Fields_UE.js
         function redondeotrucar(num){

             if(typeof num == 'number'){
                 var numfixed = num.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0];
                 var numsplit = numfixed.split('.');
                 if(numsplit.length > 1){
                     if(numsplit[1].length>2){
                         var ultimodecimal = parseInt(numsplit[1].charAt(2));
                         var numerofinal = 0;
                         if(ultimodecimal>4){
                             return true;

                         }else{
                             return false;
                         }
                     }else{return false}
                 }else{
                     return false
                 }
             }else{
                 return false
             }
         }

         //EFX_FE_Tax_Fields_UE.js
         function trunc (x, posiciones) {
             var s = x.toString();
             var l = s.length;
             var decimalLength = s.indexOf('.') + 1;
             var numStr = s.substr(0, decimalLength + posiciones);
             return parseFloat(numStr);
         }

         //EFX_FE_Tax_Fields_UE.js
         function validaLimites(jsonLinea){
             var montoDeAjuste=0;

             if(jsonLinea.ieps.name!=''){
                     var limiteInferior=0;
                     var limiteSuperior=0;
                     var tasaOcuotaNum = (jsonLinea.ieps.rate_div).toFixed(6);
                     limiteInferior = (parseFloat(jsonLinea.ieps.base_importe)-((Math.pow(10, -2))/2))*parseFloat(tasaOcuotaNum);
                     limiteInferior = trunc(limiteInferior,2);
                     limiteSuperior = (parseFloat(jsonLinea.ieps.base_importe)+((Math.pow(10, -2))/2)-Math.pow(10, -12))*parseFloat(tasaOcuotaNum);
                     limiteSuperior = parseFloat(limiteSuperior.toFixed(2));

                     if(parseFloat(jsonLinea.ieps.importe)<limiteInferior){
                     montoDeAjuste = parseFloat(jsonLinea.ieps.importe)-limiteInferior;
                     jsonLinea.ieps.importe = limiteInferior.toFixed(2);
                     }else if(parseFloat(jsonLinea.ieps.importe)>limiteSuperior){
                     montoDeAjuste = parseFloat(jsonLinea.ieps.importe)-limiteSuperior;
                     jsonLinea.ieps.importe = limiteSuperior.toFixed(2);
                     }

                     if(jsonLinea.iva.name!='' && jsonLinea.iva.rate_div > 0){
                     jsonLinea.iva.importe = (parseFloat(jsonLinea.iva.importe)+montoDeAjuste).toFixed(2);
                     }else if(jsonLinea.retenciones.name!=''){
                     jsonLinea.retenciones.importe = (parseFloat(jsonLinea.retenciones.importe)+montoDeAjuste).toFixed(2);
                     }

             }

             if(jsonLinea.retenciones.name!=''){

                     var limiteInferior=0;
                     var limiteSuperior=0;
                     var tasaOcuotaNum = (jsonLinea.retenciones.rate_div).toFixed(6);
                     limiteInferior = (parseFloat(jsonLinea.retenciones.base_importe)-((Math.pow(10, -2))/2))*parseFloat(tasaOcuotaNum);
                     limiteInferior = trunc(limiteInferior,2);
                     limiteSuperior = (parseFloat(jsonLinea.retenciones.base_importe)+((Math.pow(10, -2))/2)-Math.pow(10, -12))*parseFloat(tasaOcuotaNum);
                     limiteSuperior = parseFloat(limiteSuperior.toFixed(2));

                     if(parseFloat(jsonLinea.retenciones.importe)<limiteInferior){
                     montoDeAjuste = parseFloat(jsonLinea.retenciones.importe)-limiteInferior;
                     jsonLinea.retenciones.importe = limiteInferior.toFixed(2);
                     }else if(parseFloat(jsonLinea.retenciones.importe)>limiteSuperior){
                     montoDeAjuste = parseFloat(jsonLinea.retenciones.importe)-limiteSuperior;
                     jsonLinea.retenciones.importe = limiteSuperior.toFixed(2);
                     }

                     if(jsonLinea.iva.name!='' && jsonLinea.iva.rate_div > 0){
                     jsonLinea.iva.importe = (parseFloat(jsonLinea.iva.importe)+montoDeAjuste).toFixed(2);
                     }else if(jsonLinea.retenciones.name!=''){
                     jsonLinea.retenciones.importe = (parseFloat(jsonLinea.retenciones.importe)+montoDeAjuste).toFixed(2);
                     }

             }
             if(jsonLinea.iva.name!='' && jsonLinea.iva.rate_div > 0){
                     montoDeAjuste=0;
                     var limiteInferior=0;
                     var limiteSuperior=0;
                     var tasaOcuotaNum = (jsonLinea.iva.rate_div).toFixed(6);

                     limiteInferior = (parseFloat(jsonLinea.iva.base_importe)-((Math.pow(10, -2))/2))*parseFloat(tasaOcuotaNum);
                     limiteInferior = trunc(limiteInferior,2);
                     limiteSuperior = (parseFloat(jsonLinea.iva.base_importe)+((Math.pow(10, -2))/2)-Math.pow(10, -12))*parseFloat(tasaOcuotaNum);
                     limiteSuperior = parseFloat(limiteSuperior.toFixed(2));

                     if(parseFloat(jsonLinea.iva.importe)<limiteInferior){
                     montoDeAjuste = parseFloat(jsonLinea.iva.importe)-limiteInferior;
                     jsonLinea.iva.importe = limiteInferior.toFixed(2);
                     }else if(parseFloat(jsonLinea.iva.importe)>limiteSuperior){
                     montoDeAjuste = parseFloat(jsonLinea.iva.importe)-limiteSuperior;
                     jsonLinea.iva.importe = limiteSuperior.toFixed(2);
                     }

                     if(jsonLinea.ieps.name!=''){
                     jsonLinea.ieps.importe = (parseFloat(jsonLinea.ieps.importe)+montoDeAjuste).toFixed(2);
                     }else if(jsonLinea.retenciones.name!=''){
                     jsonLinea.retenciones.importe = (parseFloat(jsonLinea.retenciones.importe)+montoDeAjuste).toFixed(2);
                     }

             }
             return jsonLinea;

         }
         //Fin sección TAXJson

         //EFX_FE_Carta_Porte_UE.js
         function buscarDireccionesCP(id_cliente,id_subsidiaria,obj_direccion,SUBSIDIARIES,creadodeff,creadodeffid,tipoTransaccionff,usocfdiIFF){

             log.audit({title:'id_cliente',details:id_cliente});
             log.audit({title:'tipoTransaccionff',details:tipoTransaccionff});
             if(tipoTransaccionff == 'transferorder'){

                     var rfiscal='';
                     var usocfdi='';
                     var usocfdiid = creadodeff.getValue({fieldId:'custbody_mx_cfdi_usage'});
                     var tipocambiocab = creadodeff.getValue({fieldId:'exchangerate'});
                     obj_direccion.cfdi.TipoCambio = tipocambiocab;

                     if(usocfdiid){
                             var usocfdiobj = modRecord.load({
                                     type:'customrecord_mx_sat_cfdi_usage',
                                     id:usocfdiid
                             });
                             usocfdi = usocfdiobj.getValue({fieldId:'custrecord_mx_sat_cfdi_code'});
                             obj_direccion.receptor.UsoCFDI = usocfdi;
                     }

                     log.audit({title:'id_subsidiaria',details:id_subsidiaria});
                     if(SUBSIDIARIES){
                             var obj_subsidiaria = modRecord.load({
                                     type: modRecord.Type.SUBSIDIARY,
                                     id: id_subsidiaria,
                             });
                             var rfiscalid = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_industry_type'});
                             log.audit({title:'rfiscalid',details:rfiscalid});
                             if(rfiscalid) {
                                     var regfiscalObj = modRecord.load({
                                             type: 'customrecord_mx_sat_industry_type',
                                             id: rfiscalid
                                     });

                                     rfiscal = regfiscalObj.getValue({fieldId: 'custrecord_mx_sat_it_code'});
                                     log.audit({title:'rfiscal',details:rfiscal});
                             }
                     }else {
                             var obj_subsidiaria = config.load({
                                     type: config.Type.COMPANY_INFORMATION
                             });

                             var rfiscalid = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_industry_type'});
                             if(rfiscalid) {
                                     var regfiscalObj = modRecord.load({
                                             type: 'customrecord_mx_sat_industry_type',
                                             id: rfiscalid
                                     });

                                     rfiscal = regfiscalObj.getValue({fieldId: 'custrecord_mx_sat_it_code'});
                             }
                     }
                     obj_direccion.emisor.RegimenFiscal = rfiscal;

                     var ubicacionOrigen = creadodeff.getValue({fieldId: 'location'});
                     var ubicacionDestino = creadodeff.getValue({fieldId: 'transferlocation'});

                     try {

                             var ubicacionOrigenRec = modRecord.load({
                                     type: modRecord.Type.LOCATION,
                                     id: ubicacionOrigen
                             });

                             obj_direccion.emisor.Rfc = ubicacionOrigenRec.getValue({fieldId: 'custrecord_efx_fe_ce_rfc'});
                             obj_direccion.emisor.Nombre = ubicacionOrigenRec.getValue({fieldId: 'name'});

                             var subrec_dir_sub = ubicacionOrigenRec.getSubrecord({
                                     fieldId: 'mainaddress'
                             });

                             //obj_direccion.emisor.Nombre = subrec_dir_sub.getValue({fieldId: 'addressee'});
                             obj_direccion.emisor.Calle = subrec_dir_sub.getValue({fieldId: 'custrecord_streetname'});
                             obj_direccion.emisor.NumeroExterior = subrec_dir_sub.getValue({fieldId: 'custrecord_streetnum'});
                             obj_direccion.emisor.NumeroInterior = subrec_dir_sub.getValue({fieldId: 'custrecord_unit'});
                             //obj_direccion.IDOrigen = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_cp_idorigen'});

                             //cargar colonia
                             var emisor_colonia_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_colonia'});
                             if (emisor_colonia_id) {
                                     var obj_colonia = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_colonia',
                                             id: emisor_colonia_id,
                                     });
                                     obj_direccion.emisor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                             }

                             //cargar localidad
                             var emisor_localidad_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_localidad'});
                             if (emisor_localidad_id) {
                                     var obj_localidad = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_localidad',
                                             id: emisor_localidad_id,
                                     });
                                     obj_direccion.emisor.Localidad = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                             }
                             obj_direccion.emisor.Referencia = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_ref_dir'});
                             //cargar municipio
                             var emisor_municipio_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_municipio'});
                             if (emisor_municipio_id) {
                                     var obj_municipio = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_municipio',
                                             id: emisor_municipio_id,
                                     });
                                     obj_direccion.emisor.Municipio = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                             }
                             //cargar estado
                             var emisor_estado_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_estado'});
                             if (emisor_estado_id) {
                                     var obj_estado = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_estado',
                                             id: emisor_estado_id,
                                     });
                                     obj_direccion.emisor.Estado = obj_estado.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                             }

                             //cargar pais
                             var emisor_pais_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_pais'});
                             if (emisor_pais_id) {
                                     var obj_pais = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_pais',
                                             id: emisor_pais_id,
                                     });
                                     obj_direccion.emisor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                             }
                             obj_direccion.emisor.CodigoPostal = subrec_dir_sub.getValue({fieldId: 'zip'});
                             obj_direccion.cfdi.LugarExpedicion = subrec_dir_sub.getValue({fieldId: 'zip'});

                     }catch(ubicacionOrigenLog){
                             log.audit({ title: 'ubicacionOrigenLog', details: JSON.stringify(ubicacionOrigenLog) });
                     }

                     try {
                             var obj_cliente = modRecord.load({
                                     type: modRecord.Type.LOCATION,
                                     id: ubicacionDestino,

                             });

                             obj_direccion.receptor.Rfc = obj_cliente.getValue({fieldId: 'custrecord_efx_fe_ce_rfc'});

                             obj_direccion.receptor.Nombre = obj_cliente.getValue({fieldId: 'name'});

                             var subrec = obj_cliente.getSubrecord({
                                     fieldId: 'mainaddress'
                             });

                             obj_direccion.receptor.Calle = subrec.getValue({fieldId:'custrecord_streetname'});
                             obj_direccion.receptor.NumeroExterior = subrec.getValue({fieldId:'custrecord_streetnum'});
                             obj_direccion.receptor.NumeroInterior = subrec.getValue({fieldId:'custrecord_unit'});
                             //obj_direccion.IDDestino = subrec.getValue({fieldId:'custrecord_efx_fe_cp_iddestino'});
                             //cargar colonia
                             var receptor_colonia_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_colonia'});
                             if(receptor_colonia_id) {
                                     var obj_colonia = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_colonia',
                                             id: receptor_colonia_id,
                                     });
                                     var col_receptor = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                     if (col_receptor) {
                                             obj_direccion.receptor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                     } else {
                                             obj_direccion.receptor.Colonia = obj_colonia.getValue({fieldId: 'name'});
                                     }
                             }

                             //cargar localidad
                             var receptor_localidad_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_localidad'});
                             if(receptor_localidad_id) {
                                     var obj_localidad = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_localidad',
                                             id: receptor_localidad_id,
                                     });
                                     var lc_receptor = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                                     if (lc_receptor) {
                                             obj_direccion.receptor.Localidad = lc_receptor;
                                     } else {
                                             obj_direccion.receptor.Localidad = obj_localidad.getValue({fieldId: 'name'});
                                     }
                             }

                             obj_direccion.receptor.Referencia = subrec.getValue({fieldId:'custrecord_efx_fe_ce_ref_dir'});

                             //cargar municipío
                             var receptor_municipio_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_municipio'});
                             if(receptor_municipio_id) {
                                     var obj_municipio = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_municipio',
                                             id: receptor_municipio_id,
                                     });
                                     var mpio_receptor = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                                     if (mpio_receptor) {
                                             obj_direccion.receptor.Municipio = mpio_receptor;
                                     } else {
                                             obj_direccion.receptor.Municipio = obj_municipio.getValue({fieldId: 'name'});
                                     }
                             }
                             //cargar estado
                             var receptor_estado_id = subrec.getValue({fieldId: 'custrecord_efx_fe_ce_estado'});
                             if(receptor_estado_id) {
                                     var obj_estado = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_estado',
                                             id: receptor_estado_id,
                                     });
                                     var edo_receptor = obj_estado.getValue({fieldId:'custrecord_efx_fe_se_cod_sat'});
                                     if (edo_receptor) {
                                             obj_direccion.receptor.Estado = edo_receptor;
                                     } else {
                                             obj_direccion.receptor.Estado = obj_estado.getValue({fieldId: 'name'});
                                     }
                             }

                             //cargar pais
                             var receptor_pais_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_pais'});
                             if(receptor_pais_id) {
                                     var obj_pais = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_pais',
                                             id: receptor_pais_id,
                                     });
                                     obj_direccion.receptor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                             }
                             obj_direccion.receptor.CodigoPostal = subrec.getValue({fieldId:'zip'});
                             obj_direccion.receptor.Destinatario = subrec.getValue({fieldId:'custrecord_efx_fe_ce_destinatario'});

                     }catch(error_buscadireccion_receptor){
                             log.audit({ title: 'error_buscadireccion_receptor', details: JSON.stringify(error_buscadireccion_receptor) });
                     }

                     log.audit({ title: 'obj_direccion', details: JSON.stringify(obj_direccion) });


             }else{

                     if(usocfdiIFF){
                             var usocfdiobj = modRecord.load({
                                     type:'customrecord_mx_sat_cfdi_usage',
                                     id:usocfdiIFF
                             });
                             usocfdi = usocfdiobj.getValue({fieldId:'custrecord_mx_sat_cfdi_code'});
                             obj_direccion.receptor.UsoCFDI = usocfdi;
                     }
                     log.audit({title:'id_cliente',details:id_cliente});
                     if(tipoTransaccionff=='itemreceipt' || tipoTransaccionff=='purchaseorder'){
                             var obj_cliente = modRecord.load({
                                     type: modRecord.Type.VENDOR,
                                     id: id_cliente,

                             });
                     }else{
                             var obj_cliente = modRecord.load({
                                     type: modRecord.Type.CUSTOMER,
                                     id: id_cliente,

                             });
                     }


                     obj_direccion.receptor.Rfc = obj_cliente.getValue({fieldId: 'custentity_mx_rfc'});
                     var tipocliente = obj_cliente.getValue({fieldId:'isperson'});
                     log.audit({title:'tipocliente',details:tipocliente});
                     if(tipocliente==true || tipocliente=='T'){
                             var nombrecliente = obj_cliente.getValue({fieldId:'firstname'});
                             var apellidocliente = obj_cliente.getValue({fieldId:'lastname'});
                             var nombrecompleto = nombrecliente+' '+apellidocliente;
                             if(nombrecompleto){
                                     obj_direccion.receptor.Nombre = nombrecompleto;
                             }else{
                                     obj_direccion.receptor.Nombre = obj_cliente.getValue({fieldId: 'companyname'});
                             }

                     }else{
                             obj_direccion.receptor.Nombre = obj_cliente.getValue({fieldId: 'companyname'});
                     }

                     if(SUBSIDIARIES){
                             try{

                                     var obj_subsidiaria = modRecord.load({
                                             type: modRecord.Type.SUBSIDIARY,
                                             id: id_subsidiaria,
                                     });

                                     var direccion_sub = obj_subsidiaria.getValue({fieldId:'mainaddress_text'})

                                     var subrec_dir_sub = obj_subsidiaria.getSubrecord({
                                             fieldId: 'mainaddress'
                                     });

                                     obj_direccion.emisor.Calle = subrec_dir_sub.getValue({fieldId:'custrecord_streetname'});
                                     obj_direccion.emisor.NumeroExterior = subrec_dir_sub.getValue({fieldId:'custrecord_streetnum'});
                                     obj_direccion.emisor.NumeroInterior = subrec_dir_sub.getValue({fieldId:'custrecord_unit'});
                                     //obj_direccion.IDOrigen = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_cp_idorigen'});

                                     var rfiscalid = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_industry_type'});
                                     obj_direccion.emisor.Nombre = obj_subsidiaria.getValue({fieldId:'legalname'});
                                     obj_direccion.emisor.Rfc = obj_subsidiaria.getValue({fieldId:'federalidnumber'});
                                     log.audit({title:'rfiscalid',details:rfiscalid});
                                     if(rfiscalid) {
                                             var regfiscalObj = modRecord.load({
                                                     type: 'customrecord_mx_sat_industry_type',
                                                     id: rfiscalid
                                             });

                                             rfiscal = regfiscalObj.getValue({fieldId: 'custrecord_mx_sat_it_code'});
                                             log.audit({title:'rfiscal',details:rfiscal});
                                     }
                                     obj_direccion.emisor.RegimenFiscal = rfiscal;

                                     //cargar colonia
                                     var emisor_colonia_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_colonia'});
                                     if(emisor_colonia_id) {
                                             var obj_colonia = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_colonia',
                                                     id: emisor_colonia_id,
                                             });
                                             obj_direccion.emisor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                     }

                                     //cargar localidad
                                     var emisor_localidad_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_localidad'});
                                     if(emisor_localidad_id) {
                                             var obj_localidad = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_localidad',
                                                     id: emisor_localidad_id,
                                             });
                                             obj_direccion.emisor.Localidad = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                                     }
                                     obj_direccion.emisor.Referencia = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_ref_dir'});
                                     //cargar municipio
                                     var emisor_municipio_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_municipio'});
                                     if(emisor_municipio_id) {
                                             var obj_municipio = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_municipio',
                                                     id: emisor_municipio_id,
                                             });
                                             obj_direccion.emisor.Municipio = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                                     }
                                     //cargar estado
                                     var emisor_estado_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_estado'});
                                     if(emisor_estado_id) {
                                             var obj_estado = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_estado',
                                                     id: emisor_estado_id,
                                             });
                                             obj_direccion.emisor.Estado = obj_estado.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                                     }
                                     //cargar pais
                                     var emisor_pais_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_pais'});
                                     if(emisor_pais_id) {
                                             var obj_pais = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_pais',
                                                     id: emisor_pais_id,
                                             });
                                             obj_direccion.emisor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                                     }
                                     obj_direccion.emisor.CodigoPostal = subrec_dir_sub.getValue({fieldId:'zip'});


                             }catch(error_subsidirias){
                                     log.audit({ title: 'error_subsidirias', details: JSON.stringify(error_subsidirias) });
                             }
                     }else{
                             try{
                                     var obj_subsidiaria = config.load({
                                             type: config.Type.COMPANY_INFORMATION
                                     });

                                     var direccion_sub = obj_subsidiaria.getValue({fieldId:'mainaddress_text'})

                                     var subrec_dir_sub = obj_subsidiaria.getSubrecord({
                                             fieldId: 'mainaddress'
                                     });

                                     obj_direccion.emisor.Nombre = obj_subsidiaria.getValue({fieldId:'legalname'});
                                     obj_direccion.emisor.Rfc = obj_subsidiaria.getValue({fieldId:'federalidnumber'});
                                     obj_direccion.emisor.Calle = subrec_dir_sub.getValue({fieldId:'custrecord_streetname'});
                                     obj_direccion.emisor.NumeroExterior = subrec_dir_sub.getValue({fieldId:'custrecord_streetnum'});
                                     obj_direccion.emisor.NumeroInterior = subrec_dir_sub.getValue({fieldId:'custrecord_unit'});
                                     //obj_direccion.IDOrigen = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_cp_idorigen'});
                                     //cargar colonia
                                     var emisor_colonia_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_colonia'});
                                     if(emisor_colonia_id) {
                                             var obj_colonia = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_colonia',
                                                     id: emisor_colonia_id,
                                             });
                                             obj_direccion.emisor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                     }

                                     var rfiscalid = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_industry_type'});
                                     log.audit({title:'rfiscalid',details:rfiscalid});
                                     if(rfiscalid) {
                                             log.audit({title:'rfiscalid',details:rfiscalid});
                                             var regfiscalObj = modRecord.load({
                                                     type: 'customrecord_mx_sat_industry_type',
                                                     id: rfiscalid
                                             });

                                             rfiscal = regfiscalObj.getValue({fieldId: 'custrecord_mx_sat_it_code'});
                                             rfiscal = regfiscalObj.getValue({fieldId: 'name'});
                                             log.audit({title:'rfiscal',details:rfiscal});
                                     }
                                     log.audit({title:'rfiscal',details:rfiscal});
                             obj_direccion.emisor.RegimenFiscal = rfiscal;

                                     //cargar localidad
                                     var emisor_localidad_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_localidad'});
                                     if(emisor_localidad_id) {
                                             var obj_localidad = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_localidad',
                                                     id: emisor_localidad_id,
                                             });
                                             obj_direccion.emisor.Localidad = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                                     }
                                     obj_direccion.emisor.Referencia = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_ref_dir'});
                                     //cargar municipio
                                     var emisor_municipio_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_municipio'});
                                     if(emisor_municipio_id) {
                                             var obj_municipio = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_municipio',
                                                     id: emisor_municipio_id,
                                             });
                                             obj_direccion.emisor.Municipio = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                                     }
                                     //cargar estado
                                     var emisor_estado_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_estado'});
                                     if(emisor_estado_id) {
                                             var obj_estado = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_estado',
                                                     id: emisor_estado_id,
                                             });
                                             obj_direccion.emisor.Estado = obj_estado.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                                     }
                                     //cargar pais
                                     var emisor_pais_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_pais'});
                                     if(emisor_pais_id) {
                                             var obj_pais = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_pais',
                                                     id: emisor_pais_id,
                                             });
                                             obj_direccion.emisor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                                     }
                                     obj_direccion.emisor.CodigoPostal = subrec_dir_sub.getValue({fieldId:'zip'});


                             }catch(error_subsidirias){
                                     log.audit({ title: 'error_subsidirias', details: JSON.stringify(error_subsidirias) });
                             }
                     }
                     var ubicacionOrigen = creadodeff.getValue({fieldId: 'location'});
                     if(ubicacionOrigen) {
                             var ubicacionOrigenRec = modRecord.load({
                                     type: modRecord.Type.LOCATION,
                                     id: ubicacionOrigen
                             });

                             obj_direccion.emisor.Rfc = ubicacionOrigenRec.getValue({fieldId: 'custrecord_efx_fe_ce_rfc'});
                             obj_direccion.emisor.Nombre = ubicacionOrigenRec.getValue({fieldId: 'name'});
                     }

                     try {


                             var count = obj_cliente.getLineCount({sublistId: 'addressbook'});
                             log.audit({ title: 'count', details: JSON.stringify(count) });

                             for (var i = 0; i < count; i++) {
                                     var billing = obj_cliente.getSublistValue({
                                             sublistId: 'addressbook',
                                             fieldId: 'defaultbilling',
                                             line: i
                                     });
                                     log.audit({ title: 'billing', details: JSON.stringify(billing) });
                                     if (billing) {
                                             var subrec = obj_cliente.getSublistSubrecord({
                                                     sublistId: 'addressbook',
                                                     fieldId: 'addressbookaddress',
                                                     line: i
                                             });


                                             obj_direccion.receptor.Calle = subrec.getValue({fieldId:'custrecord_streetname'});
                                             obj_direccion.receptor.NumeroExterior = subrec.getValue({fieldId:'custrecord_streetnum'});
                                             obj_direccion.receptor.NumeroInterior = subrec.getValue({fieldId:'custrecord_unit'});
                                             //obj_direccion.IDDestino = subrec.getValue({fieldId:'custrecord_efx_fe_cp_iddestino'});
                                             //cargar colonia
                                             var receptor_colonia_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_colonia'});
                                             if(receptor_colonia_id) {
                                                     var obj_colonia = modRecord.load({
                                                             type: 'customrecord_efx_fe_sat_colonia',
                                                             id: receptor_colonia_id,
                                                     });
                                                     var col_receptor = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                                     if (col_receptor) {
                                                             obj_direccion.receptor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                                     } else {
                                                             obj_direccion.receptor.Colonia = obj_colonia.getValue({fieldId: 'name'});
                                                     }
                                             }

                                             //cargar localidad
                                             var receptor_localidad_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_localidad'});
                                             if(receptor_localidad_id) {
                                                     var obj_localidad = modRecord.load({
                                                             type: 'customrecord_efx_fe_sat_localidad',
                                                             id: receptor_localidad_id,
                                                     });
                                                     var lc_receptor = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                                                     if (lc_receptor) {
                                                             obj_direccion.receptor.Localidad = lc_receptor;
                                                     } else {
                                                             obj_direccion.receptor.Localidad = obj_localidad.getValue({fieldId: 'name'});
                                                     }
                                             }

                                             obj_direccion.receptor.Referencia = subrec.getValue({fieldId:'custrecord_efx_fe_ce_ref_dir'});

                                             //cargar municipío
                                             var receptor_municipio_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_municipio'});
                                             if(receptor_municipio_id) {
                                                     var obj_municipio = modRecord.load({
                                                             type: 'customrecord_efx_fe_sat_municipio',
                                                             id: receptor_municipio_id,
                                                     });
                                                     var mpio_receptor = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                                                     if (mpio_receptor) {
                                                             obj_direccion.receptor.Municipio = mpio_receptor;
                                                     } else {
                                                             obj_direccion.receptor.Municipio = obj_municipio.getValue({fieldId: 'name'});
                                                     }
                                             }
                                             //cargar estado
                                             var receptor_estado_id = subrec.getValue({fieldId: 'custrecord_efx_fe_ce_estado'});
                                             if(receptor_estado_id) {
                                                     var obj_estado = modRecord.load({
                                                             type: 'customrecord_efx_fe_sat_estado',
                                                             id: receptor_estado_id,
                                                     });
                                                     var edo_receptor = obj_estado.getValue({fieldId:'custrecord_efx_fe_se_cod_sat'});
                                                     if (edo_receptor) {
                                                             obj_direccion.receptor.Estado = edo_receptor;
                                                     } else {
                                                             obj_direccion.receptor.Estado = obj_estado.getValue({fieldId: 'name'});
                                                     }
                                             }

                                             //cargar pais
                                             var receptor_pais_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_pais'});
                                             if(receptor_pais_id) {
                                                     var obj_pais = modRecord.load({
                                                             type: 'customrecord_efx_fe_sat_pais',
                                                             id: receptor_pais_id,
                                                     });
                                                     obj_direccion.receptor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                                             }
                                             obj_direccion.receptor.CodigoPostal = subrec.getValue({fieldId:'zip'});
                                             obj_direccion.receptor.Destinatario = subrec.getValue({fieldId:'custrecord_efx_fe_ce_destinatario'});

                                     }
                             }
                     }catch(error_buscadireccion_receptor){
                             log.audit({ title: 'error_buscadireccion_receptor', details: JSON.stringify(error_buscadireccion_receptor) });
                     }


                     log.audit({ title: 'obj_direccion', details: JSON.stringify(obj_direccion) });
             }



             return obj_direccion;

         }

         //EFX_FE_Carta_Porte_UE.js
         function datosCP(json_direccion,record,recID,recType){
             var ubicaciones_count = record.getLineCount({sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones'});
             var figuratransporte_count = record.getLineCount({sublistId: 'recmachcustrecord_efx_fe_cp_figuratransporter'});
             var autotransporte_count = record.getLineCount({sublistId: 'recmachcustrecord_efx_fe_cp_autotransporte'});

             log.audit({title:'ubicaciones_count',details:ubicaciones_count});
             log.audit({title:'figuratransporte_count',details:figuratransporte_count});
             log.audit({title:'autotransporte_count',details:autotransporte_count});

             for (var ub = 0; ub < ubicaciones_count; ub++) {
                     var dircli = '';
                     var dircli_subrecid = '';
                     var dirloc = '';
                     var ubicaciones_obj = {
                             TipoUbicacion: '',
                             IDUbicacion: '',
                             DistanciaRecorrida: '',
                             FechaHoraSalidaLlegada: '',
                             Nombre:'',
                             RFC:'',
                             Domicilio:{
                                     id:'',
                                     Calle: '',
                                     NumeroExterior: '',
                                     NumeroInterior: '',
                                     Colonia: '',
                                     Localidad: '',
                                     Referencia: '',
                                     Municipio: '',
                                     Estado: '',
                                     Pais: '',
                                     CodigoPostal: ''
                             }
                     };
                     ubicaciones_obj.TipoUbicacion = record.getSublistText({
                             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
                             fieldId: 'custrecord_efx_cp_tipoubicacion',
                             line: ub
                     });

                     ubicaciones_obj.IDUbicacion = record.getSublistValue({
                             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
                             fieldId: 'custrecord_efx_fe_cp_idubicacion',
                             line: ub
                     });


                     ubicaciones_obj.DistanciaRecorrida = record.getSublistValue({
                             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
                             fieldId: 'custrecord_efx_cp_distanciarecorrida',
                             line: ub
                     });
                     ubicaciones_obj.FechaHoraSalidaLlegada = record.getSublistValue({
                             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
                             fieldId: 'custrecord_efx_fe_cp_fechahora',
                             line: ub
                     });
                     log.audit({title:'ubicaciones_obj',details:ubicaciones_obj});

                     dircli = record.getSublistValue({
                             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
                             fieldId: 'custrecord_efx_fe_cp_cli_dir',
                             line: ub
                     });
                     dircli_subrecid = record.getSublistValue({
                             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
                             fieldId: 'custrecord_efx_fe_cp_dirorigen',
                             line: ub
                     });
                     dirloc = record.getSublistValue({
                             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
                             fieldId: 'custrecord_efx_fe_cp_locorigen',
                             line: ub
                     });


                     // if(ub==0 && !dirloc){
                     //         ubicaciones_obj.Domicilio.id = "emisor";
                     //         ubicaciones_obj.Domicilio.Calle = json_direccion.emisor.Calle;
                     //         ubicaciones_obj.Domicilio.NumeroExterior = json_direccion.emisor.NumeroExterior;
                     //         ubicaciones_obj.Domicilio.NumeroInterior = json_direccion.emisor.NumeroInterior;
                     //         ubicaciones_obj.Domicilio.Colonia = json_direccion.emisor.Colonia;
                     //         ubicaciones_obj.Domicilio.Localidad = json_direccion.emisor.Localidad;
                     //         ubicaciones_obj.Domicilio.Referencia = json_direccion.emisor.Referencia;
                     //         ubicaciones_obj.Domicilio.Municipio = json_direccion.emisor.Municipio;
                     //         ubicaciones_obj.Domicilio.Estado = json_direccion.emisor.Estado;
                     //         ubicaciones_obj.Domicilio.Pais = json_direccion.emisor.Pais;
                     //         ubicaciones_obj.Domicilio.CodigoPostal = json_direccion.emisor.CodigoPostal;

                     //}else{
                             ubicaciones_obj = ubicacionDirecciones(dircli,dirloc,ubicaciones_obj,dircli_subrecid,recType,ub);
                     //}

                     json_direccion.CPUbicaciones.push(ubicaciones_obj);

             }

             for (var ft = 0; ft < figuratransporte_count; ft++) {
                     var figuratransporte_obj = {
                             TipoFigura: '',
                             RFCFigura: '',
                             NumLicencia: '',
                             NombreFigura: '',
                             NumRegIdTribFigura: '',
                             ResidenciaFiscalFigura: '',
                     };
                     figuratransporte_obj.TipoFigura = record.getSublistText({
                             sublistId: 'recmachcustrecord_efx_fe_cp_figuratransporter',
                             fieldId: 'custrecord_efx_fe_cp_tipofigura',
                             line: ft
                     });

                     figuratransporte_obj.RFCFigura = record.getSublistValue({
                             sublistId: 'recmachcustrecord_efx_fe_cp_figuratransporter',
                             fieldId: 'custrecord_efx_fe_cp_rfcfigura',
                             line: ft
                     });
                     figuratransporte_obj.NumLicencia = record.getSublistText({
                             sublistId: 'recmachcustrecord_efx_fe_cp_figuratransporter',
                             fieldId: 'custrecord_efx_fe_cp_numlicencia',
                             line: ft
                     });
                     figuratransporte_obj.NombreFigura = record.getSublistText({
                             sublistId: 'recmachcustrecord_efx_fe_cp_figuratransporter',
                             fieldId: 'custrecord_efx_fe_cp_nombrefigura',
                             line: ft
                     });
                     figuratransporte_obj.NumRegIdTribFigura = record.getSublistText({
                             sublistId: 'recmachcustrecord_efx_fe_cp_figuratransporter',
                             fieldId: 'custrecord_efx_fe_cp_numregtribfig',
                             line: ft
                     });
                     figuratransporte_obj.ResidenciaFiscalFigura = record.getSublistText({
                             sublistId: 'recmachcustrecord_efx_fe_cp_figuratransporter',
                             fieldId: 'custrecord_efx_fe_cp_recfiscalfigura',
                             line: ft
                     });

                     log.audit({title:'figuratransporte_obj',details:figuratransporte_obj});


                     json_direccion.CPFiguraTransporte.push(figuratransporte_obj);
             }

             if(autotransporte_count>0){
                     var buscaautotransporte = search.create({
                             type:'customrecord_efx_fe_cp_autotransporte',
                             filters:[
                                 ['custrecord_efx_fe_cp_autotransporte',search.Operator.ANYOF,recID]
                             ],
                             columns:[
                                     search.createColumn({name: "custrecord_efx_fe_cp_vehiculo", label: "Vehiculo"}),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_permsct",
                                             join: "CUSTRECORD_EFX_FE_CP_VEHICULO",
                                             label: "Permiso SCT"
                                     }),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_numpermisosct",
                                             join: "CUSTRECORD_EFX_FE_CP_VEHICULO",
                                             label: "Numero de Permiso SCT"
                                     }),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_configvehicular",
                                             join: "CUSTRECORD_EFX_FE_CP_VEHICULO",
                                             label: "Configuración Vehicular"
                                     }),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_placavm",
                                             join: "CUSTRECORD_EFX_FE_CP_VEHICULO",
                                             label: "Placa"
                                     }),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_aniomodelovm",
                                             join: "CUSTRECORD_EFX_FE_CP_VEHICULO",
                                             label: "Año o Modelo"
                                     }),
                                     search.createColumn({name: "custrecord_efx_fe_cp_remolqueuno", label: "Primer Remolque"}),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_subtiporem",
                                             join: "CUSTRECORD_EFX_FE_CP_REMOLQUEUNO",
                                             label: "Subtipo de Remolque"
                                     }),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_placavm",
                                             join: "CUSTRECORD_EFX_FE_CP_REMOLQUEUNO",
                                             label: "Placa"
                                     }),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_aniomodelovm",
                                             join: "CUSTRECORD_EFX_FE_CP_REMOLQUEUNO",
                                             label: "Año o Modelo"
                                     }),
                                     search.createColumn({name: "custrecord_efx_fe_cp_remolquedos", label: "Segundo Remolque"}),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_subtiporem",
                                             join: "CUSTRECORD_EFX_FE_CP_REMOLQUEDOS",
                                             label: "Subtipo de Remolque"
                                     }),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_placavm",
                                             join: "CUSTRECORD_EFX_FE_CP_REMOLQUEDOS",
                                             label: "Placa"
                                     }),
                                     search.createColumn({
                                             name: "custrecord_efx_fe_cp_aniomodelovm",
                                             join: "CUSTRECORD_EFX_FE_CP_REMOLQUEDOS",
                                             label: "Año o Modelo"
                                     })
                             ]
                     });

                     buscaautotransporte.run().each(function(result) {
                             var objAutotransporte = {
                                     Vehiculo:{},
                                     Remolqueuno:{},
                                     Remolquedos:{}
                             }
                             objAutotransporte.Vehiculo.Vehiculo = result.getText({name: "custrecord_efx_fe_cp_vehiculo"});
                             var permsct = result.getText({name: "custrecord_efx_fe_cp_permsct", join: "CUSTRECORD_EFX_FE_CP_VEHICULO"});
                             var permsctdiv = '';
                             if(permsct){
                                     permsctdiv = permsct.split('-');
                                     permsctdiv = permsctdiv[0];
                             }
                             objAutotransporte.Vehiculo.PermSCT = permsctdiv;
                             objAutotransporte.Vehiculo.NumPermisoSCT = result.getValue({name: "custrecord_efx_fe_cp_numpermisosct", join: "CUSTRECORD_EFX_FE_CP_VEHICULO"});
                             var confve = result.getText({name: "custrecord_efx_fe_cp_configvehicular", join: "CUSTRECORD_EFX_FE_CP_VEHICULO"});
                             var confvediv = '';
                             if(confve){
                                     confvediv = confve.split('-');
                                     confvediv = confvediv[0];
                             }
                             objAutotransporte.Vehiculo.ConfigVehicular = confvediv;
                             objAutotransporte.Vehiculo.PlacaVM = result.getValue({name: "custrecord_efx_fe_cp_placavm", join: "CUSTRECORD_EFX_FE_CP_VEHICULO"});
                             objAutotransporte.Vehiculo.AnioModeloVM = result.getValue({name: "custrecord_efx_fe_cp_aniomodelovm", join: "CUSTRECORD_EFX_FE_CP_VEHICULO"});

                             objAutotransporte.Remolqueuno.Remolqueuno = result.getText({name: "custrecord_efx_fe_cp_remolqueuno"});
                             var subtiprem = result.getText({name: "custrecord_efx_fe_cp_subtiporem", join: "CUSTRECORD_EFX_FE_CP_REMOLQUEUNO"});
                             var subtipremdiv = '';
                             if(subtiprem){
                                     subtipremdiv = subtiprem.split('-');
                                     subtipremdiv = subtipremdiv[0];
                             }
                             objAutotransporte.Remolqueuno.SubTipoRem = subtipremdiv;
                             objAutotransporte.Remolqueuno.Placa = result.getValue({name: "custrecord_efx_fe_cp_placavm", join: "CUSTRECORD_EFX_FE_CP_REMOLQUEUNO"});
                             objAutotransporte.Remolqueuno.AnioModeloVM = result.getValue({name: "custrecord_efx_fe_cp_aniomodelovm", join: "CUSTRECORD_EFX_FE_CP_REMOLQUEUNO"});

                             objAutotransporte.Remolquedos.Remolquedos = result.getText({name: "custrecord_efx_fe_cp_remolquedos"});
                             var subtiprem = result.getText({name: "custrecord_efx_fe_cp_subtiporem", join: "CUSTRECORD_EFX_FE_CP_REMOLQUEDOS"});
                             var subtipremdiv = '';
                             if(subtiprem){
                                     subtipremdiv = subtiprem.split('-');
                                     subtipremdiv = subtipremdiv[0];
                             }
                             objAutotransporte.Remolquedos.SubTipoRem = subtipremdiv;
                             objAutotransporte.Remolquedos.Placa = result.getValue({name: "custrecord_efx_fe_cp_placavm", join: "CUSTRECORD_EFX_FE_CP_REMOLQUEDOS"});
                             objAutotransporte.Remolquedos.AnioModeloVM = result.getValue({name: "custrecord_efx_fe_cp_aniomodelovm", join: "CUSTRECORD_EFX_FE_CP_REMOLQUEDOS"});

                             log.audit({title:'objAutotransporte',details:objAutotransporte});
                             json_direccion.CPAutoTransporte = objAutotransporte;

                             return true;
                     });

             }

             return json_direccion;

         }

         //EFX_FE_Carta_Porte_UE.js
         function ubicacionDirecciones(dircli,dirloc,ubicaciones_obj,recType,ub){

             if(dircli){
                     var idinternocliente='';

                     log.audit({title:'dircli',details:dircli});
                             var buscadireccionUbicacion = search.create({
                                     type: search.Type.CUSTOMER,
                                     filters:
                                         [
                                                 ["entityid",search.Operator.IS,dircli]
                                         ],
                                     columns:
                                         [
                                                 search.createColumn({
                                                         name: "internalid",
                                                         label: "id interno"
                                                 }),
                                         ]
                             });

                     var ejecutarConteo = buscadireccionUbicacion.runPaged();
                     var conteoSearch = ejecutarConteo.count;
                     var esVendor = false;
                     if(conteoSearch>0){
                             buscadireccionUbicacion.run().each(function(result) {
                                     idinternocliente = result.getValue({name: "internalid"});
                                     log.audit({title:'idinternocliente',details:idinternocliente});
                                     return true;
                             });
                     }else{
                             esVendor = true;
                             var buscadireccionUbicacion = search.create({
                                     type: search.Type.VENDOR,
                                     filters:
                                         [
                                                 ["entityid",search.Operator.IS,dircli]
                                         ],
                                     columns:
                                         [
                                                 search.createColumn({
                                                         name: "internalid",
                                                         label: "id interno"
                                                 }),
                                         ]
                             });
                             buscadireccionUbicacion.run().each(function(result) {
                                     idinternocliente = result.getValue({name: "internalid"});
                                     log.audit({title:'idinternocliente',details:idinternocliente});
                                     return true;
                             });
                     }


                     log.audit({title:'idinternocliente',details:idinternocliente});

                     if(esVendor){
                             var rec_cliente = modRecord.load({
                             type: modRecord.Type.VENDOR,
                             id:idinternocliente
                     });
                     }else{
                             var rec_cliente = modRecord.load({
                             type: modRecord.Type.CUSTOMER,
                             id:idinternocliente
                     });
                     }


                     var numLines = rec_cliente.getLineCount({
                             sublistId: 'addressbook'
                     });

                     for(var i=0;i<numLines;i++) {
                             var iddir = rec_cliente.getSublistValue({
                                     sublistId: 'addressbook',
                                     fieldId: 'internalid',
                                     line: i
                             });

                             if (iddir==dircli_subrecid) {
                                     var rec_subrec = rec_cliente.getSublistSubrecord({
                                             sublistId: 'addressbook',
                                             fieldId: 'addressbookaddress',
                                             line: i
                                     });


                                     ubicaciones_obj.Domicilio.Calle = rec_subrec.getValue({fieldId: "custrecord_streetname"});
                                     ubicaciones_obj.Domicilio.NumeroExterior = rec_subrec.getValue({fieldId: "custrecord_streetnum"});
                                     ubicaciones_obj.Domicilio.NumeroInterior = rec_subrec.getValue({fieldId: "custrecord_unit"});

                                     var dircolonia = rec_subrec.getValue({fieldId: "custrecord_efx_fe_ce_colonia"});
                                     if(dircolonia) {
                                             var obj_pais = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_colonia',
                                                     id: dircolonia,
                                             });
                                             ubicaciones_obj.Domicilio.Colonia  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                     }
                                     var dirlocalidad = rec_subrec.getValue({fieldId: "custrecord_efx_fe_ce_localidad"});
                                     if(dirlocalidad) {
                                             var obj_pais = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_localidad',
                                                     id: dirlocalidad,
                                             });
                                             ubicaciones_obj.Domicilio.Localidad  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                                     }
                                     ubicaciones_obj.Domicilio.Referencia = rec_subrec.getValue({fieldId: "custrecord_efx_fe_ce_ref_dir"});
                                     var dirmunicipio = rec_subrec.getValue({fieldId: "custrecord_efx_fe_ce_municipio"});
                                     if(dirmunicipio) {
                                             var obj_pais = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_municipio',
                                                     id: dirmunicipio,
                                             });
                                             ubicaciones_obj.Domicilio.Municipio  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                                     }
                                     var direstado = rec_subrec.getValue({fieldId: "custrecord_efx_fe_ce_estado"});
                                     if(direstado) {
                                             var obj_pais = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_estado',
                                                     id: direstado,
                                             });
                                             ubicaciones_obj.Domicilio.Estado  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                                     }
                                     var dirpais = rec_subrec.getValue({fieldId: "custrecord_efx_fe_ce_pais"});
                                     if(dirpais) {
                                             var obj_pais = modRecord.load({
                                                     type: 'customrecord_efx_fe_sat_pais',
                                                     id: dirpais,
                                             });
                                             ubicaciones_obj.Domicilio.Pais  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                                     }
                                     ubicaciones_obj.Domicilio.CodigoPostal = rec_subrec.getValue({fieldId: "zip"});

                             }
                     }


                     if(ub==0){
                             ubicaciones_obj.Domicilio.id = 'emisor';
                     }else{
                             ubicaciones_obj.Domicilio.id = rec_cliente.getValue({fieldId: "entityid"});
                     }
                     log.audit({title:'rec_cliente',details:rec_cliente});
                     log.audit({title:'cli',details:rec_cliente.getValue({fieldId: "altname"})});
                     log.audit({title:'rfc',details:rec_cliente.getValue({fieldId: "custentity_mx_rfc"})});
                     if(rec_cliente.getValue({fieldId: "altname"})){
                         ubicaciones_obj.Nombre = rec_cliente.getValue({fieldId: "altname"});
                     }else if(rec_cliente.getValue({fieldId: "companyname"})){
                         ubicaciones_obj.Nombre = rec_cliente.getValue({fieldId: "companyname"});
                     }else if(rec_cliente.getValue({fieldId: "legalname"})){
                             ubicaciones_obj.Nombre = rec_cliente.getValue({fieldId: "legalname"});
                     }else{
                             ubicaciones_obj.Nombre = rec_cliente.getValue({fieldId: "entityid"});
                     }

                             ubicaciones_obj.RFC = rec_cliente.getValue({fieldId: "custentity_mx_rfc"});


             }else if(dirloc){
                     var buscadireccionUbicacion = search.create({
                             type: search.Type.LOCATION,
                             filters:
                                 [
                                         ["internalid",search.Operator.IS,dirloc]
                                 ],
                             columns:
                                 [
                                         search.createColumn({
                                                 name: "name",
                                                 sort: search.Sort.ASC,
                                                 label: "Nombre"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_efx_fe_ce_rfc",
                                                 label: "RFC"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_streetname",
                                                 join: "Address",
                                                 label: "Calle"
                                         }),
                                         search.createColumn({
                                                 name: "addressee",
                                                 join: "Address",
                                                 label: "Destinatario"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_streetnum",
                                                 join: "Address",
                                                 label: "Número de Calle (Número Exterior)"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_unit",
                                                 join: "Address",
                                                 label: "Apartamento (Número Interior)"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_efx_fe_ce_colonia",
                                                 join: "Address",
                                                 label: "EFX FE - CE Colonia"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_efx_fe_ce_localidad",
                                                 join: "Address",
                                                 label: "EFX FE - CE Localidad"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_efx_fe_ce_ref_dir",
                                                 join: "Address",
                                                 label: "EFX FE - CE Referencia"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_efx_fe_ce_municipio",
                                                 join: "Address",
                                                 label: "EFX FE - CE Municipio"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_efx_fe_ce_estado",
                                                 join: "Address",
                                                 label: "EFX FE - CE Estado"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_efx_fe_ce_pais",
                                                 join: "Address",
                                                 label: "EFX FE - CE Pais"
                                         }),
                                         search.createColumn({
                                                 name: "custrecord_efx_fe_ce_pais",
                                                 join: "Address",
                                                 label: "EFX FE - CE Pais"
                                         }),
                                         search.createColumn({
                                                 name: "zip",
                                                 join: "Address",
                                                 label: "Código postal"
                                         })
                                 ]
                     });




                     buscadireccionUbicacion.run().each(function(result) {
                             //ubicaciones_obj.Nombre = result.getValue({name: "name"});
                             ubicaciones_obj.Nombre = result.getValue({name: "addressee", join: "Address",});
                             ubicaciones_obj.RFC = result.getValue({name: "custrecord_efx_fe_ce_rfc"});
                             if(ub==0){
                                     ubicaciones_obj.Domicilio.id = 'emisor';
                             }else{
                                     //ubicaciones_obj.Domicilio.id = result.getValue({name: "name"});
                                     ubicaciones_obj.Domicilio.id = result.getValue({name: "addressee", join: "Address",});

                             }

                             ubicaciones_obj.Domicilio.Calle = result.getValue({name: "custrecord_streetname", join: "Address",});
                             ubicaciones_obj.Domicilio.NumeroExterior = result.getValue({name: "custrecord_streetnum", join: "Address",});
                             ubicaciones_obj.Domicilio.NumeroInterior = result.getValue({name: "custrecord_unit", join: "Address",});
                             var dircolonia = result.getValue({name: "custrecord_efx_fe_ce_colonia", join: "Address",});
                             if(dircolonia) {
                                     var obj_pais = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_colonia',
                                             id: dircolonia,
                                     });
                                     ubicaciones_obj.Domicilio.Colonia  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                             }
                             var dirlocalidad = result.getValue({name: "custrecord_efx_fe_ce_localidad", join: "Address",});
                             if(dirlocalidad) {
                                     var obj_pais = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_localidad',
                                             id: dirlocalidad,
                                     });
                                     ubicaciones_obj.Domicilio.Localidad  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                             }
                             ubicaciones_obj.Domicilio.Referencia = result.getValue({name: "custrecord_efx_fe_ce_ref_dir", join: "Address",});
                             var dirmunicipio = result.getValue({name: "custrecord_efx_fe_ce_municipio", join: "Address",});
                             if(dirmunicipio) {
                                     var obj_pais = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_municipio',
                                             id: dirmunicipio,
                                     });
                                     ubicaciones_obj.Domicilio.Municipio  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                             }
                             var direstado = result.getValue({name: "custrecord_efx_fe_ce_estado", join: "Address",});
                             if(direstado) {
                                     var obj_pais = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_estado',
                                             id: direstado,
                                     });
                                     ubicaciones_obj.Domicilio.Estado  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                             }
                             var dirpais = result.getValue({name: "custrecord_efx_fe_ce_pais", join: "Address",});
                             if(dirpais) {
                                     var obj_pais = modRecord.load({
                                             type: 'customrecord_efx_fe_sat_pais',
                                             id: dirpais,
                                     });
                                     ubicaciones_obj.Domicilio.Pais  = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                             }
                             ubicaciones_obj.Domicilio.CodigoPostal = result.getValue({name: "zip", join: "Address",});
                             log.audit({title:'ubicaciones_objfor',details:ubicaciones_obj});
                             return true;
                     });
             }

             return ubicaciones_obj;

         }

         //EFX_FE_CE_UE.js
         function buscarDirecciones(id_cliente,id_subsidiaria,obj_direccion,SUBSIDIARIES,destinatario_id,creadodeff,creadodeffid,tipoTransaccionff,clienteObjparam){

             if(tipoTransaccionff == 'transferorder'){

                     var rfiscal='';
                     var usocfdi='';
                     var usocfdiid = creadodeff.getValue({fieldId:'custbody_mx_cfdi_usage'});
                     var motivotraslado = creadodeff.getValue({fieldId:'custbody_efx_fe_ce_motivo_traslado'});
                     var tipocambiocab = creadodeff.getValue({fieldId:'exchangerate'});
                     obj_direccion.cfdi.TipoCambio = tipocambiocab;

                     if(usocfdiid){
                         var usocfdiobj = modRecord.load({
                             type:'customrecord_mx_sat_cfdi_usage',
                             id:usocfdiid
                         });
                         usocfdi = usocfdiobj.getValue({fieldId:'custrecord_mx_sat_cfdi_code'});
                         obj_direccion.receptor.UsoCFDI = usocfdi;
                     }

                     log.audit({title:'id_subsidiaria',details:id_subsidiaria});
                     if(SUBSIDIARIES){
                         var obj_subsidiaria = modRecord.load({
                             type: modRecord.Type.SUBSIDIARY,
                             id: id_subsidiaria,
                         });
                         var rfiscalid = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_industry_type'});
                         log.audit({title:'rfiscalid',details:rfiscalid});
                         if(rfiscalid) {
                             var regfiscalObj = modRecord.load({
                                 type: 'customrecord_mx_sat_industry_type',
                                 id: rfiscalid
                             });

                             rfiscal = regfiscalObj.getValue({fieldId: 'custrecord_mx_sat_it_code'});
                             log.audit({title:'rfiscal',details:rfiscal});
                         }
                     }else {
                         var obj_subsidiaria = config.load({
                             type: config.Type.COMPANY_INFORMATION
                         });

                         var rfiscalid = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_industry_type'});
                         if(rfiscalid) {
                             var regfiscalObj = modRecord.load({
                                 type: 'customrecord_mx_sat_industry_type',
                                 id: rfiscalid
                             });

                             rfiscal = regfiscalObj.getValue({fieldId: 'custrecord_mx_sat_it_code'});
                         }
                     }
                     obj_direccion.emisor.RegimenFiscal = rfiscal;

                     var ubicacionOrigen = creadodeff.getValue({fieldId: 'location'});
                     var ubicacionDestino = creadodeff.getValue({fieldId: 'transferlocation'});

                     try {

                         var ubicacionOrigenRec = modRecord.load({
                             type: modRecord.Type.LOCATION,
                             id: ubicacionOrigen
                         });

                         obj_direccion.emisor.Rfc = ubicacionOrigenRec.getValue({fieldId: 'custrecord_efx_fe_ce_rfc'});
                         obj_direccion.emisor.Nombre = ubicacionOrigenRec.getValue({fieldId: 'name'});

                         var subrec_dir_sub = ubicacionOrigenRec.getSubrecord({
                             fieldId: 'mainaddress'
                         });

                         obj_direccion.emisor.Calle = subrec_dir_sub.getValue({fieldId: 'custrecord_streetname'});
                         obj_direccion.emisor.NumeroExterior = subrec_dir_sub.getValue({fieldId: 'custrecord_streetnum'});
                         obj_direccion.emisor.NumeroInterior = subrec_dir_sub.getValue({fieldId: 'custrecord_unit'});

                         //cargar colonia
                         var emisor_colonia_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_colonia'});
                         if (emisor_colonia_id) {
                             var obj_colonia = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_colonia',
                                 id: emisor_colonia_id,
                             });
                             obj_direccion.emisor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                         }

                         //cargar localidad
                         var emisor_localidad_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_localidad'});
                         if (emisor_localidad_id) {
                             var obj_localidad = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_localidad',
                                 id: emisor_localidad_id,
                             });
                             obj_direccion.emisor.Localidad = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                         }
                         obj_direccion.emisor.Referencia = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_ref_dir'});
                         //cargar municipio
                         var emisor_municipio_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_municipio'});
                         if (emisor_municipio_id) {
                             var obj_municipio = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_municipio',
                                 id: emisor_municipio_id,
                             });
                             obj_direccion.emisor.Municipio = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                         }
                         //cargar estado
                         var emisor_estado_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_estado'});
                         if (emisor_estado_id) {
                             var obj_estado = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_estado',
                                 id: emisor_estado_id,
                             });
                             obj_direccion.emisor.Estado = obj_estado.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                         }

                         //cargar pais
                         var emisor_pais_id = subrec_dir_sub.getValue({fieldId: 'custrecord_efx_fe_ce_pais'});
                         if (emisor_pais_id) {
                             var obj_pais = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_pais',
                                 id: emisor_pais_id,
                             });
                             obj_direccion.emisor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                         }
                         obj_direccion.emisor.CodigoPostal = subrec_dir_sub.getValue({fieldId: 'zip'});
                         obj_direccion.cfdi.LugarExpedicion = subrec_dir_sub.getValue({fieldId: 'zip'});

                     }catch(ubicacionOrigenLog){
                         log.audit({ title: 'ubicacionOrigenLog', details: JSON.stringify(ubicacionOrigenLog) });
                     }

                     try {
                         var obj_cliente = modRecord.load({
                             type: modRecord.Type.LOCATION,
                             id: ubicacionDestino,

                         });

                         if(motivotraslado=='02'){
                             obj_direccion.receptor.Rfc = obj_cliente.getValue({fieldId: 'custrecord_efx_fe_ce_rfc'});
                         }else{
                             obj_direccion.receptor.Rfc = 'XEXX010101000';
                         }
                         obj_direccion.receptor.Nombre = obj_cliente.getValue({fieldId: 'name'});

                         var subrec = obj_cliente.getSubrecord({
                             fieldId: 'mainaddress'
                         });

                         obj_direccion.receptor.Calle = subrec.getValue({fieldId:'custrecord_streetname'});
                         obj_direccion.receptor.NumeroExterior = subrec.getValue({fieldId:'custrecord_streetnum'});
                         obj_direccion.receptor.NumeroInterior = subrec.getValue({fieldId:'custrecord_unit'});
                         //cargar colonia
                         var receptor_colonia_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_colonia'});
                         if(receptor_colonia_id) {
                             var obj_colonia = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_colonia',
                                 id: receptor_colonia_id,
                             });
                             var col_receptor = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                             if (col_receptor) {
                                 obj_direccion.receptor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                             } else {
                                 obj_direccion.receptor.Colonia = obj_colonia.getValue({fieldId: 'name'});
                             }
                         }

                         //cargar localidad
                         var receptor_localidad_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_localidad'});
                         if(receptor_localidad_id) {
                             var obj_localidad = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_localidad',
                                 id: receptor_localidad_id,
                             });
                             var lc_receptor = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                             if (lc_receptor) {
                                 obj_direccion.receptor.Localidad = lc_receptor;
                             } else {
                                 obj_direccion.receptor.Localidad = obj_localidad.getValue({fieldId: 'name'});
                             }
                         }

                         obj_direccion.receptor.Referencia = subrec.getValue({fieldId:'custrecord_efx_fe_ce_ref_dir'});

                         //cargar municipío
                         var receptor_municipio_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_municipio'});
                         if(receptor_municipio_id) {
                             var obj_municipio = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_municipio',
                                 id: receptor_municipio_id,
                             });
                             var mpio_receptor = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                             if (mpio_receptor) {
                                 obj_direccion.receptor.Municipio = mpio_receptor;
                             } else {
                                 obj_direccion.receptor.Municipio = obj_municipio.getValue({fieldId: 'name'});
                             }
                         }
                         //cargar estado
                         var receptor_estado_id = subrec.getValue({fieldId: 'custrecord_efx_fe_ce_estado'});
                         if(receptor_estado_id) {
                             var obj_estado = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_estado',
                                 id: receptor_estado_id,
                             });
                             var edo_receptor = obj_estado.getValue({fieldId:'custrecord_efx_fe_se_cod_sat'});
                             if (edo_receptor) {
                                 obj_direccion.receptor.Estado = edo_receptor;
                             } else {
                                 obj_direccion.receptor.Estado = obj_estado.getValue({fieldId: 'name'});
                             }
                         }

                         //cargar pais
                         var receptor_pais_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_pais'});
                         if(receptor_pais_id) {
                             var obj_pais = modRecord.load({
                                 type: 'customrecord_efx_fe_sat_pais',
                                 id: receptor_pais_id,
                             });
                             obj_direccion.receptor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                         }
                         obj_direccion.receptor.CodigoPostal = subrec.getValue({fieldId:'zip'});
                         obj_direccion.receptor.Destinatario = subrec.getValue({fieldId:'custrecord_efx_fe_ce_destinatario'});

                     }catch(error_buscadireccion_receptor){
                         log.audit({ title: 'error_buscadireccion_receptor', details: JSON.stringify(error_buscadireccion_receptor) });
                     }

                     if(destinatario_id) {
                         try {
                             var obj_destinatario = modRecord.load({
                                 type: 'customrecord_efx_fe_ce_addres_destinatar',
                                 id: destinatario_id,

                             });

                             obj_direccion.destinatario.Calle = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_calle'});
                             obj_direccion.destinatario.NumeroExterior = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_numero_exterior'});
                             obj_direccion.destinatario.NumeroInterior = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_numero_interior'});

                             //caragar colonia
                             var destinatario_colonia_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_colonia'});
                             if(destinatario_colonia_id) {
                                 var obj_colonia = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_colonia',
                                     id: destinatario_colonia_id,
                                 });
                                 var col_receptor = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                 if (col_receptor) {
                                     obj_direccion.destinatario.Colonia = col_receptor;
                                 } else {
                                     obj_direccion.destinatario.Colonia = obj_colonia.getValue({fieldId: 'name'});
                                 }
                             }

                             //cargar localidad
                             var destinatario_localidad_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_localidad'});
                             if(destinatario_localidad_id) {
                                 var obj_localidad = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_localidad',
                                     id: destinatario_localidad_id,
                                 });
                                 var lc_receptor = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                                 if (lc_receptor) {
                                     obj_direccion.destinatario.Localidad = lc_receptor;
                                 } else {
                                     obj_direccion.destinatario.Localidad = obj_localidad.getValue({fieldId: 'name'});
                                 }
                             }

                             //cargar municipio
                             var destinatario_municipio_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_municipio'});
                             if(destinatario_municipio_id) {
                                 var obj_municipio = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_municipio',
                                     id: destinatario_municipio_id,
                                 });
                                 var mpio_receptor = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                                 if (mpio_receptor) {
                                     obj_direccion.destinatario.Municipio = mpio_receptor;
                                 } else {
                                     obj_direccion.destinatario.Municipio = obj_municipio.getValue({fieldId: 'name'});
                                 }
                             }

                             //cargar estado
                             var destinatario_estado_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_estado'});
                             if(destinatario_estado_id) {
                                 var obj_estado = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_estado',
                                     id: destinatario_estado_id,
                                 });
                                 var edo_receptor = obj_estado.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                                 if (edo_receptor) {
                                     obj_direccion.destinatario.Estado = edo_receptor;
                                 } else {
                                     obj_direccion.destinatario.Estado = obj_estado.getValue({fieldId: 'name'});
                                 }
                             }
                             //cargar pais

                             var destinatario_pais_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_pais'});
                             if(destinatario_pais_id) {
                                 var obj_pais = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_pais',
                                     id: destinatario_pais_id,
                                 });
                                 obj_direccion.destinatario.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                             }
                             obj_direccion.destinatario.CodigoPostal = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_codigo_postal'});


                         } catch (error_buscadireccion_destinatario) {
                             log.audit({
                                 title: 'error_buscadireccion_destinatario',
                                 details: JSON.stringify(error_buscadireccion_destinatario)
                             });
                         }
                     }

                     //obtener claveprodserv y unitsat

                     // try{
                     //
                     //     var arrayLinea = new Array();
                     //     var arrayunitsat = new Array();
                     //     var clavesprod = new Array();
                     //     var claveunidad = new Array();
                     //     var conteoLineas = creadodeff.getLineCount({sublistId:'item'});
                     //
                     //     //obtiene claveprodserv y unidad de lineas
                     //     for(var i=0;i<conteoLineas;i++){
                     //         var idclave = creadodeff.getSublistValue({
                     //             sublistId:'item',
                     //             fieldId:'custcol_mx_txn_line_sat_item_code',
                     //             line:i
                     //         });
                     //
                     //         // var idclaveunits = creadodeff.getSublistValue({
                     //         //     sublistId:'item',
                     //         //     fieldId:'units',
                     //         //     line:i
                     //         // });
                     //         clavesprod.push(idclave);
                     //         // claveunidad.push(idclaveunits);
                     //     }
                     //
                     //     //busqueda de claves del sat
                     //     if(clavesprod.length>0) {
                     //         var buscaClaves = search.create({
                     //             type: 'customrecord_mx_sat_item_code',
                     //             filters: [
                     //                 ['isinactive', search.Operator.IS, 'F']
                     //                 , 'AND',
                     //                 ['internalid', search.Operator.ANYOF, clavesprod]
                     //             ],
                     //             columns: [
                     //                 search.createColumn({name: 'custrecord_mx_ic_code'}),
                     //                 search.createColumn({name: 'internalid'}),
                     //
                     //             ]
                     //         });
                     //         var ejecutar = buscaClaves.run();
                     //         var resultado = ejecutar.getRange(0, 100);
                     //
                     //         for (var i = 0; i < conteoLineas; i++) {
                     //             var unitsLine = creadodeff.getSublistValue({
                     //                 sublistId: 'item',
                     //                 fieldId: 'units',
                     //                 line: i
                     //             });
                     //             for (var x = 0; x < resultado.length; x++) {
                     //                 var objitems = {
                     //                     claveprodserv: '',
                     //                     claveunidad: '',
                     //                     claveunidadNetsuite: '',
                     //                 }
                     //                 var idclavepr = resultado[x].getValue({name: 'internalid'});
                     //                 var clavepr = resultado[x].getValue({name: 'custrecord_mx_ic_code'});
                     //                 if (clavesprod[i] == idclavepr) {
                     //                     objitems.claveprodserv = clavepr;
                     //                     objitems.claveunidadNetsuite = unitsLine;
                     //                     arrayLinea.push(objitems);
                     //                 }
                     //             }
                     //         }
                     //     }
                     //
                     //     log.audit({title:'arrayLinea',details:arrayLinea});
                     //     // log.audit({title:'claveunidad',details:claveunidad});
                     //
                     //     //busqueda de unidades
                     //
                     //     // if(claveunidad.length>0) {
                     //     //     var filtrounits = new Array();
                     //     //     var count = 0;
                     //     //     for (var i = 0; i < claveunidad.length; i++) {
                     //     //         count++;
                     //     //         filtrounits.push(['custrecord_mx_mapper_keyvalue_subkey', search.Operator.IS, claveunidad[i]]);
                     //     //         if (count < claveunidad.length) {
                     //     //             filtrounits.push('OR');
                     //     //
                     //     //         }
                     //     //     }
                     //     //
                     //     //     log.audit({title: 'filtrounits', details: filtrounits});
                     //     //     var buscamapeo = search.create({
                     //     //         type: 'customrecord_mx_mapper_keyvalue',
                     //     //         filters: [
                     //     //             ['isinactive', search.Operator.IS, 'F']
                     //     //             , 'AND',
                     //     //             ['custrecord_mx_mapper_keyvalue_category', search.Operator.ANYOF, 10]
                     //     //             , 'AND',
                     //     //             filtrounits
                     //     //         ],
                     //     //         columns: [
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_keyvalue_category'}),
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_keyvalue_value'}),
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_keyvalue_key'}),
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_keyvalue_inputvalue'}),
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_keyvalue_rectype'}),
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_keyvalue_subkey'}),
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_keyvalue_subrectype'}),
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_keyvalue_sublst_id'}),
                     //     //
                     //     //         ]
                     //     //     });
                     //     //     var ejecutarMapeo = buscamapeo.run();
                     //     //     var resultadoMapeo = ejecutarMapeo.getRange(0, 100);
                     //     //     log.audit({title: 'resultadoMapeo', details: resultadoMapeo});
                     //     //
                     //     //     for (var i = 0; i < resultadoMapeo.length; i++) {
                     //     //         var unidadesobj = {
                     //     //             idnetsuite: '',
                     //     //             idmex: '',
                     //     //             text: '',
                     //     //         }
                     //     //         unidadesobj.idnetsuite = resultadoMapeo[i].getValue({name: 'custrecord_mx_mapper_keyvalue_subkey'});
                     //     //         unidadesobj.idmex = resultadoMapeo[i].getValue({name: 'custrecord_mx_mapper_keyvalue_value'});
                     //     //         arrayunitsat.push(unidadesobj);
                     //     //     }
                     //     //     log.audit({title: 'arrayunitsat', details: arrayunitsat});
                     //     //
                     //     //     var buscaUnits = search.create({
                     //     //         type: 'customrecord_mx_mapper_values',
                     //     //         filters: [
                     //     //             ['isinactive', search.Operator.IS, 'F']
                     //     //             , 'AND',
                     //     //             ['custrecord_mx_mapper_value_category', search.Operator.ANYOF, 10]
                     //     //         ],
                     //     //         columns: [
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_value_category'}),
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_value_inreport'}),
                     //     //             search.createColumn({name: 'custrecord_mx_mapper_value_isdefault'}),
                     //     //             search.createColumn({name: 'internalid'}),
                     //     //
                     //     //         ]
                     //     //     });
                     //     //     var ejecutarUnits = buscaUnits.run();
                     //     //     var resultadoUnits = ejecutarUnits.getRange(0, 100);
                     //     //     log.audit({title: 'resultadoUnits', details: resultadoUnits});
                     //     //
                     //     //     for (var x = 0; x < arrayunitsat.length; x++) {
                     //     //         log.audit({title: 'arrayunitsat[x].idmex', details: arrayunitsat[x].idmex});
                     //     //         for (var i = 0; i < resultadoUnits.length; i++) {
                     //     //             var idmapeo = resultadoUnits[i].getValue({name: 'internalid'});
                     //     //             log.audit({title: 'idmapeo', details: idmapeo});
                     //     //             if (idmapeo == arrayunitsat[x].idmex) {
                     //     //                 log.audit({title: 'entra', details: 'entra'});
                     //     //                 arrayunitsat[x].text = resultadoUnits[i].getValue({name: 'custrecord_mx_mapper_value_inreport'});
                     //     //                 log.audit({title: 'arrayunitsat[x].text', details: arrayunitsat[x].text});
                     //     //                 log.audit({title: 'arrayunitsat[x].text', details: arrayunitsat});
                     //     //             }
                     //     //         }
                     //     //     }
                     //     //
                     //     // }
                     //
                     //     //agregar unidades de medida a array principal
                     //     // for(var i=0;i<arrayLinea.length;i++){
                     //     //     for(var x=0;x<arrayunitsat.length;x++){
                     //     //         if(arrayLinea[i].claveunidadNetsuite==arrayunitsat[x].idnetsuite){
                     //     //             arrayLinea[i].claveunidad=arrayunitsat[x].text;
                     //     //         }
                     //     //     }
                     //     // }
                     //
                     //
                     // }catch(error_articulos){
                     //     log.audit({title:'error_articulos',details:error_articulos});
                     // }
                     // log.audit({title:'arrayunitsat[x].text',details:arrayunitsat});
                     // log.audit({title:'arrayLinea',details:arrayLinea});
                     //
                     // obj_direccion.articulos = arrayLinea;

                     log.audit({ title: 'obj_direccion', details: JSON.stringify(obj_direccion) });


                 }else{
                     if(SUBSIDIARIES){
                         try{

                             var obj_subsidiaria = modRecord.load({
                                 type: modRecord.Type.SUBSIDIARY,
                                 id: id_subsidiaria,
                             });

                             var direccion_sub = obj_subsidiaria.getValue({fieldId:'mainaddress_text'})

                             var subrec_dir_sub = obj_subsidiaria.getSubrecord({
                                 fieldId: 'mainaddress'
                             });

                             obj_direccion.emisor.Calle = subrec_dir_sub.getValue({fieldId:'custrecord_streetname'});
                             obj_direccion.emisor.NumeroExterior = subrec_dir_sub.getValue({fieldId:'custrecord_streetnum'});
                             obj_direccion.emisor.NumeroInterior = subrec_dir_sub.getValue({fieldId:'custrecord_unit'});
                             //cargar colonia
                             var emisor_colonia_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_colonia'});
                             if(emisor_colonia_id) {
                                 var obj_colonia = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_colonia',
                                     id: emisor_colonia_id,
                                 });
                                 obj_direccion.emisor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                             }

                             //cargar localidad
                             var emisor_localidad_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_localidad'});
                             if(emisor_localidad_id) {
                                 var obj_localidad = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_localidad',
                                     id: emisor_localidad_id,
                                 });
                                 obj_direccion.emisor.Localidad = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                             }
                             obj_direccion.emisor.Referencia = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_ref_dir'});
                             //cargar municipio
                             var emisor_municipio_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_municipio'});
                             if(emisor_municipio_id) {
                                 var obj_municipio = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_municipio',
                                     id: emisor_municipio_id,
                                 });
                                 obj_direccion.emisor.Municipio = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                             }
                             //cargar estado
                             var emisor_estado_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_estado'});
                             if(emisor_estado_id) {
                                 var obj_estado = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_estado',
                                     id: emisor_estado_id,
                                 });
                                 obj_direccion.emisor.Estado = obj_estado.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                             }
                             //cargar pais
                             var emisor_pais_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_pais'});
                             if(emisor_pais_id) {
                                 var obj_pais = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_pais',
                                     id: emisor_pais_id,
                                 });
                                 obj_direccion.emisor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                             }
                             obj_direccion.emisor.CodigoPostal = subrec_dir_sub.getValue({fieldId:'zip'});


                         }catch(error_subsidirias){
                             log.audit({ title: 'error_subsidirias', details: JSON.stringify(error_subsidirias) });
                         }
                     }else{
                         try{
                             var obj_subsidiaria = config.load({
                                 type: config.Type.COMPANY_INFORMATION
                             });

                             var direccion_sub = obj_subsidiaria.getValue({fieldId:'mainaddress_text'})

                             var subrec_dir_sub = obj_subsidiaria.getSubrecord({
                                 fieldId: 'mainaddress'
                             });

                             obj_direccion.emisor.Calle = subrec_dir_sub.getValue({fieldId:'custrecord_streetname'});
                             obj_direccion.emisor.NumeroExterior = subrec_dir_sub.getValue({fieldId:'custrecord_streetnum'});
                             obj_direccion.emisor.NumeroInterior = subrec_dir_sub.getValue({fieldId:'custrecord_unit'});
                             //cargar colonia
                             var emisor_colonia_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_colonia'});
                             if(emisor_colonia_id) {
                                 var obj_colonia = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_colonia',
                                     id: emisor_colonia_id,
                                 });
                                 obj_direccion.emisor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                             }

                             //cargar localidad
                             var emisor_localidad_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_localidad'});
                             if(emisor_localidad_id) {
                                 var obj_localidad = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_localidad',
                                     id: emisor_localidad_id,
                                 });
                                 obj_direccion.emisor.Localidad = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                             }
                             obj_direccion.emisor.Referencia = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_ref_dir'});
                             //cargar municipio
                             var emisor_municipio_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_municipio'});
                             if(emisor_municipio_id) {
                                 var obj_municipio = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_municipio',
                                     id: emisor_municipio_id,
                                 });
                                 obj_direccion.emisor.Municipio = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                             }
                             //cargar estado
                             var emisor_estado_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_estado'});
                             if(emisor_estado_id) {
                                 var obj_estado = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_estado',
                                     id: emisor_estado_id,
                                 });
                                 obj_direccion.emisor.Estado = obj_estado.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                             }
                             //cargar pais
                             var emisor_pais_id = subrec_dir_sub.getValue({fieldId:'custrecord_efx_fe_ce_pais'});
                             if(emisor_pais_id) {
                                 var obj_pais = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_pais',
                                     id: emisor_pais_id,
                                 });
                                 obj_direccion.emisor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                             }
                             obj_direccion.emisor.CodigoPostal = subrec_dir_sub.getValue({fieldId:'zip'});


                         }catch(error_subsidirias){
                             log.audit({ title: 'error_subsidirias', details: JSON.stringify(error_subsidirias) });
                         }
                     }

                     try {
                         var obj_cliente = modRecord.load({
                             type: modRecord.Type.CUSTOMER,
                             id: id_cliente,

                         });

                         var count = obj_cliente.getLineCount({sublistId: 'addressbook'});
                         log.audit({ title: 'count', details: JSON.stringify(count) });

                         for (var i = 0; i < count; i++) {
                             var billing = obj_cliente.getSublistValue({
                                 sublistId: 'addressbook',
                                 fieldId: 'defaultbilling',
                                 line: i
                             });
                             log.audit({ title: 'billing', details: JSON.stringify(billing) });
                             if (billing) {
                                 var subrec = obj_cliente.getSublistSubrecord({
                                     sublistId: 'addressbook',
                                     fieldId: 'addressbookaddress',
                                     line: i
                                 });


                                 obj_direccion.receptor.Calle = subrec.getValue({fieldId:'custrecord_streetname'});
                                 obj_direccion.receptor.NumeroExterior = subrec.getValue({fieldId:'custrecord_streetnum'});
                                 obj_direccion.receptor.NumeroInterior = subrec.getValue({fieldId:'custrecord_unit'});
                                 //cargar colonia
                                 var receptor_colonia_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_colonia'});
                                 if(receptor_colonia_id) {
                                     var obj_colonia = modRecord.load({
                                         type: 'customrecord_efx_fe_sat_colonia',
                                         id: receptor_colonia_id,
                                     });
                                     var col_receptor = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                     if (col_receptor) {
                                         obj_direccion.receptor.Colonia = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                     } else {
                                         obj_direccion.receptor.Colonia = obj_colonia.getValue({fieldId: 'name'});
                                     }
                                 }

                                 //cargar localidad
                                 var receptor_localidad_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_localidad'});
                                 if(receptor_localidad_id) {
                                     var obj_localidad = modRecord.load({
                                         type: 'customrecord_efx_fe_sat_localidad',
                                         id: receptor_localidad_id,
                                     });
                                     var lc_receptor = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                                     if (lc_receptor) {
                                         obj_direccion.receptor.Localidad = lc_receptor;
                                     } else {
                                         obj_direccion.receptor.Localidad = obj_localidad.getValue({fieldId: 'name'});
                                     }
                                 }

                                 obj_direccion.receptor.Referencia = subrec.getValue({fieldId:'custrecord_efx_fe_ce_ref_dir'});

                                 //cargar municipío
                                 var receptor_municipio_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_municipio'});
                                 if(receptor_municipio_id) {
                                     var obj_municipio = modRecord.load({
                                         type: 'customrecord_efx_fe_sat_municipio',
                                         id: receptor_municipio_id,
                                     });
                                     var mpio_receptor = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                                     if (mpio_receptor) {
                                         obj_direccion.receptor.Municipio = mpio_receptor;
                                     } else {
                                         obj_direccion.receptor.Municipio = obj_municipio.getValue({fieldId: 'name'});
                                     }
                                 }
                                 //cargar estado
                                 var receptor_estado_id = subrec.getValue({fieldId: 'custrecord_efx_fe_ce_estado'});
                                 if(receptor_estado_id) {
                                     var obj_estado = modRecord.load({
                                         type: 'customrecord_efx_fe_sat_estado',
                                         id: receptor_estado_id,
                                     });
                                     var edo_receptor = obj_estado.getValue({fieldId:'custrecord_efx_fe_se_cod_sat'});
                                     if (edo_receptor) {
                                         obj_direccion.receptor.Estado = edo_receptor;
                                     } else {
                                         obj_direccion.receptor.Estado = obj_estado.getValue({fieldId: 'name'});
                                     }
                                 }

                                 //cargar pais
                                 var receptor_pais_id = subrec.getValue({fieldId:'custrecord_efx_fe_ce_pais'});
                                 if(receptor_pais_id) {
                                     var obj_pais = modRecord.load({
                                         type: 'customrecord_efx_fe_sat_pais',
                                         id: receptor_pais_id,
                                     });
                                     obj_direccion.receptor.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                                 }
                                 obj_direccion.receptor.CodigoPostal = subrec.getValue({fieldId:'zip'});
                                 obj_direccion.receptor.Destinatario = subrec.getValue({fieldId:'custrecord_efx_fe_ce_destinatario'});

                             }
                         }
                     }catch(error_buscadireccion_receptor){
                         log.audit({ title: 'error_buscadireccion_receptor', details: JSON.stringify(error_buscadireccion_receptor) });
                     }

                     if(destinatario_id) {
                         try {
                             var obj_destinatario = modRecord.load({
                                 type: 'customrecord_efx_fe_ce_addres_destinatar',
                                 id: destinatario_id,

                             });

                             obj_direccion.destinatario.Calle = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_calle'});
                             obj_direccion.destinatario.NumeroExterior = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_numero_exterior'});
                             obj_direccion.destinatario.NumeroInterior = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_numero_interior'});

                             //caragar colonia
                             var destinatario_colonia_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_colonia'});
                             if(destinatario_colonia_id) {
                                 var obj_colonia = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_colonia',
                                     id: destinatario_colonia_id,
                                 });
                                 var col_receptor = obj_colonia.getValue({fieldId: 'custrecord_efx_fe_sc_cod_sat'});
                                 if (col_receptor) {
                                     obj_direccion.destinatario.Colonia = col_receptor;
                                 } else {
                                     obj_direccion.destinatario.Colonia = obj_colonia.getValue({fieldId: 'name'});
                                 }
                             }

                             //cargar localidad
                             var destinatario_localidad_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_localidad'});
                             if(destinatario_localidad_id) {
                                 var obj_localidad = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_localidad',
                                     id: destinatario_localidad_id,
                                 });
                                 var lc_receptor = obj_localidad.getValue({fieldId: 'custrecord_efx_fe_sl_cod_sat'});
                                 if (lc_receptor) {
                                     obj_direccion.destinatario.Localidad = lc_receptor;
                                 } else {
                                     obj_direccion.destinatario.Localidad = obj_localidad.getValue({fieldId: 'name'});
                                 }
                             }

                             //cargar municipio
                             var destinatario_municipio_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_municipio'});
                             if(destinatario_municipio_id) {
                                 var obj_municipio = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_municipio',
                                     id: destinatario_municipio_id,
                                 });
                                 var mpio_receptor = obj_municipio.getValue({fieldId: 'custrecord_efx_fe_csm_cod_sat'});
                                 if (mpio_receptor) {
                                     obj_direccion.destinatario.Municipio = mpio_receptor;
                                 } else {
                                     obj_direccion.destinatario.Municipio = obj_municipio.getValue({fieldId: 'name'});
                                 }
                             }

                             //cargar estado
                             var destinatario_estado_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_estado'});
                             if(destinatario_estado_id) {
                                 var obj_estado = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_estado',
                                     id: destinatario_estado_id,
                                 });
                                 var edo_receptor = obj_estado.getValue({fieldId: 'custrecord_efx_fe_se_cod_sat'});
                                 if (edo_receptor) {
                                     obj_direccion.destinatario.Estado = edo_receptor;
                                 } else {
                                     obj_direccion.destinatario.Estado = obj_estado.getValue({fieldId: 'name'});
                                 }
                             }
                             //cargar pais

                             var destinatario_pais_id = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_pais'});
                             if(destinatario_pais_id) {
                                 var obj_pais = modRecord.load({
                                     type: 'customrecord_efx_fe_sat_pais',
                                     id: destinatario_pais_id,
                                 });
                                 obj_direccion.destinatario.Pais = obj_pais.getValue({fieldId: 'custrecord_efx_fe_sp_cod_sat'});
                             }
                             obj_direccion.destinatario.CodigoPostal = obj_destinatario.getValue({fieldId: 'custrecord_efx_fe_cedd_codigo_postal'});


                         } catch (error_buscadireccion_destinatario) {
                             log.audit({
                                 title: 'error_buscadireccion_destinatario',
                                 details: JSON.stringify(error_buscadireccion_destinatario)
                             });
                         }
                     }

                     log.audit({ title: 'obj_direccion', details: JSON.stringify(obj_direccion) });
                 }



                 return obj_direccion;

         }

         //DatosSubsidiaria.js
         function sendMail(context,record_now,recType,pagot,cartaportecheck,ocultagenerarcert,form){
             var cfdiversion = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_version' });
         var status_cfdi = record_now.getValue({ fieldId: 'custbody_psg_ei_status' });
         var enviar_correos = record_now.getValue({ fieldId: 'custbody_efx_fe_send_cert_docs' });
         var destinatarios = record_now.getValue({ fieldId: 'custbody_efx_fe_mail_to' });
         var certificado = record_now.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
         var certificado_status = record_now.getValue({ fieldId: 'custbody_psg_ei_status' });

         log.audit({ title: 'cfdiversion', details: cfdiversion });
         log.audit({ title: 'status_cfdi', details: status_cfdi });
         log.audit({ title: 'enviar_correos', details: enviar_correos });
         log.audit({ title: 'destinatarios', details: destinatarios });
         var xml_timbrado = record_now.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });
         var pdf_timbrado = record_now.getValue({ fieldId: 'custbody_edoc_generated_pdf' });


         var tranData = {
             tranid: record_now.id,
             trantype: recType
         };
         if (enviar_correos && destinatarios && recType != record.Type.PURCHASE_ORDER) {
             if (destinatarios.length > 0) {

                 form.addButton({
                     id: "custpage_btn_sent_mail",
                     label: "Envio de Correo Electrónico",
                     functionName: "sendToMail(" + JSON.stringify(tranData) + ")"
                 });
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
             if (ocultagenerarcert) {
                 if ((status_cfdi != 3 && status_cfdi != 7) || (!certificado && certificado_status)) {

                    if (!isBloqued) {
                     if(cfdiversion==1){
                         form.addButton({
                             id: "custpage_btn_timbrar",
                             label: "Generar y Certificar",
                             functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                         });
                     }else if(cfdiversion==2 || cfdiversion=='' || !cfdiversion){
                         form.addButton({
                             id: "custpage_btn_timbrar",
                             label: "Generar y Certificar",
                             functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                         });
                     }
                    }
                 }
             }
             // }
         } else if (pagot == 'gbl') {
             if (!certificado) {
                 if ((status_cfdi != 3 && status_cfdi != 7) || (!certificado && certificado_status)) {

                    if (!isBloqued) {
                     form.addButton({
                         id: "custpage_btn_timbrar_gbl",
                         label: "Generar y Certificar GBL",
                         functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                     });
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

                     form.addButton({
                         id: "custpage_btn_timbrar_gbl",
                         label: "Generar Carta Porte",
                         functionName: "generaCertificaGBLCP(" + JSON.stringify(tranData) + ")"
                     });
                 }
             }
         } else {
             if (ocultagenerarcert) {
                 log.audit({title:'ocultagenerarcert',details:ocultagenerarcert});
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
             if (!certificado) {
                 if (ocultagenerarcert && recType != record.Type.PURCHASE_ORDER) {
                     if ((status_cfdi != 3 && status_cfdi != 7) || (!certificado && certificado_status)) {
                        if (!isBloqued) {
                         if(cfdiversion==1){
                             form.addButton({
                                 id: "custpage_btn_timbrar",
                                 label: "Generar y Certificar",
                                 functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                             });
                         }else if(cfdiversion==2 || cfdiversion=='' || !cfdiversion){
                             form.addButton({
                                 id: "custpage_btn_timbrar",
                                 label: "Generar y Certificar",
                                 functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
                             });
                         }
                     }
                    }
                 }
             }
         }
         }

         //DatosSubsidiaria.js
         function calculaParcialidad(factura_id,recordnowid){
                 var filtrosparcialidad = new Array();
                 filtrosparcialidad.push(['type', 'anyof', 'CustPymt']);
                 filtrosparcialidad.push('AND');
                 filtrosparcialidad.push(['appliedtotransaction.internalid', 'anyof', factura_id]);
                 if(recordnowid){
                         filtrosparcialidad.push('AND');
                         filtrosparcialidad.push(['internalid', 'noneof', recordnowid]);
                 }
                 var customerpaymentSearchObj = search.create({
                         type: search.Type.CUSTOMER_PAYMENT,
                         filters: filtrosparcialidad,
                 });
                 var searchResultCount = customerpaymentSearchObj.runPaged().count;
                 var nextSequenceNumber = searchResultCount+1;
                 return nextSequenceNumber;
         }

         //DatosSubsidiaria.js
         function ocultaBotonCancela(button_cancel,button_cancel_s,timestamptimbre,form){

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

         //DatosSubsidiaria.js
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

         //DatosSubsidiaria.js
         function agregaPlantillas(context,record_now,recType,clienteObjparam){
             try{
                var idrecdyn = record_now.id;
                var recobjdyn = record.load({
                    type:recType,
                    id:idrecdyn,
                    isDynamic:true
                });
                var plantillaOptions = recobjdyn.getField({fieldId:'custbody_psg_ei_template'});
                var metodoOptions = recobjdyn.getField({fieldId:'custbody_psg_ei_sending_method'});
                
                log.audit({title:'seloptions',details:plantillaOptions.getSelectOptions().length});
                var datosPlantilla = false;
                var datosMetodo = false;
                if(plantillaOptions.getSelectOptions().length > 0){
                    datosPlantilla = true;
                }
                if(metodoOptions.getSelectOptions().length > 0){
                    datosMetodo = true;
                }
                
                var cfdiversion = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_version' });
                 if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT || context.type == context.UserEventType.XEDIT) {

                     var clienteObj = clienteObjparam;

                     if(clienteObj){
                         var paqueteDCliente = clienteObj.getValue({fieldId:'custentity_psg_ei_entity_edoc_standard'});
                         var cfdiversionCustomer = clienteObj.getValue({fieldId:'custentity_efx_fe_version'});
                     }
                     
                     if(paqueteDCliente){
                         var buscaPlantillas = search.create({
                             type:'customrecord_psg_ei_template',
                             filters:[
                                 ['isinactive',search.Operator.IS,'F']
                                 ,'AND',
                                 ['custrecord_psg_ei_template_edoc_standard',search.Operator.ANYOF,paqueteDCliente]
                             ],
                             columns:[
                                 search.createColumn({name:'internalid'}),
                                 search.createColumn({name:'name'}),
                                 search.createColumn({name:'custrecord_psg_ei_template_edoc_standard'}),
                             ]
                         });
                         buscaPlantillas.run().each(function (result){

                             var idPlantilla = result.getValue({name: 'internalid'});
                             var nombrePlantilla = result.getValue({name: 'name'});
                             var paquetePlantilla = result.getValue({name: 'custrecord_psg_ei_template_edoc_standard'});
                             
                             var invoice40=nombrePlantilla.indexOf("invoice template 4.0") !== -1;
                             var invoice30=nombrePlantilla.indexOf("invoice template 3.3") !== -1;
                             var nc40=nombrePlantilla.indexOf("credit memo template 4.0") !== -1;
                             var nc30=nombrePlantilla.indexOf("credit memo template 3.3") !== -1;
                             var cashsale40=nombrePlantilla.indexOf("cash sale template 4.0") !== -1;
                             var cashsale30=nombrePlantilla.indexOf("cash sale template 3.3") !== -1;
                             var payment40=nombrePlantilla.indexOf("customer payment template 4.0") !== -1;
                             var payment30=nombrePlantilla.indexOf("customer payment template 3.3") !== -1;

                             
                             if(cfdiversion=='' || !cfdiversion){                                
                                if(recType == record.Type.INVOICE && invoice40 && cfdiversionCustomer==2){
                                    if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }                                    
                                }else if(recType == record.Type.INVOICE && invoice30 && (cfdiversionCustomer==1 || cfdiversionCustomer=='')){
                                    if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                }
   
                                if(recType == record.Type.CASH_SALE && cashsale40 && cfdiversionCustomer==2){
                                    if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                }else if(recType == record.Type.CASH_SALE && cashsale30 && (cfdiversionCustomer==1 || cfdiversionCustomer=='')){
                                    if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                }
   
                                if(recType == record.Type.CREDIT_MEMO && nc40 && cfdiversionCustomer==2){
                                    if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                }else if(recType == record.Type.CREDIT_MEMO && nc30 && (cfdiversionCustomer==1 || cfdiversionCustomer=='')){
                                    if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                }
   
                                if(recType == record.Type.CUSTOMER_PAYMENT && payment40 && cfdiversionCustomer==2){
                                    if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                }else if(recType == record.Type.CUSTOMER_PAYMENT && payment30 && (cfdiversionCustomer==1 || cfdiversionCustomer=='')){
                                    if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                }
                             }else{
                                if(cfdiversion==1){
                                    if(recType == record.Type.INVOICE && invoice30){
                                        if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                    }
                                    if(recType == record.Type.CASH_SALE && cashsale30){
                                        if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                    }
                                    if(recType == record.Type.CREDIT_MEMO && nc30){
                                        if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                    }
                                    if(recType == record.Type.CUSTOMER_PAYMENT && payment30){
                                        if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                    }
                                }
                                if(cfdiversion==2){
                                    if(recType == record.Type.INVOICE && invoice40){
                                       if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                    }
                                    if(recType == record.Type.CASH_SALE && cashsale40){
                                        if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                    }
                                    if(recType == record.Type.CREDIT_MEMO && nc40){
                                        if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
                                        record_now.setValue({
                                            fieldId: 'custbody_efx_fe_plantilla_docel',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }  
                                    }
                                    if(recType == record.Type.CUSTOMER_PAYMENT && payment40){
                                        if(datosPlantilla){
                                        record_now.setValue({
                                            fieldId: 'custbody_psg_ei_template',
                                            value: idPlantilla,
                                            ignoreFieldChange: true
                                        });
                                    }else{
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

                         //log.audit({title:'idplantila',details:idPlantilla});

                         var buscaMetodos = search.create({
                             type:'customrecord_ei_sending_method',
                             filters:[
                                 ['isinactive',search.Operator.IS,'F']
                                 ,'AND',
                                 ['custrecord_psg_ei_edoc_standard',search.Operator.ANYOF,paqueteDCliente]
                             ],
                             columns:[
                                 search.createColumn({name:'internalid'}),
                             ]
                         });
                         buscaMetodos.run().each(function (result){

                             var metodo = result.getValue({name: 'internalid'});

                             if(datosMetodo){
                                record_now.setValue({
                                    fieldId: 'custbody_psg_ei_sending_method',
                                    value: metodo,
                                    ignoreFieldChange: true
                                });
                             }else{
                                record_now.setValue({
                                    fieldId: 'custbody_efx_fe_metodo_docel',
                                    value: metodo,
                                    ignoreFieldChange: true
                                });
                             }
                             


                             return true;
                         });

                         //log.audit({title:'metodo',details:metodo});
                     }
                 }
             }catch(errorAgregaPlantillas){
                 log.error({title:'errorAgregaPlantillas',details:errorAgregaPlantillas});
             }

         }

         //DatosSubsidiaria.js
         function regeneraPDF(context, record_now, recType,form) {

             var certificado = record_now.getValue({ fieldId: 'custbody_psg_ei_certified_edoc' });


             var tranData = {
                 tranid: record_now.id,
                 trantype: recType
             };
             if (certificado) {
                 form.addButton({
                     id: "custpage_btn_gen_pdf",
                     label: "Regenerar PDF SAT",
                     functionName: "regeneraPDF(" + JSON.stringify(tranData) + ")"
                 });
             }

         }

         //efx_fe_credit_memo_ckeck_ue.js
         function creditMemoCheckUE(scriptContext,record_now){
             log.audit({title: 'efx_fe_credit_memo_ckeck_ue.js', details: ''});
             try {
                     log.audit({title:'type context', details: scriptContext.type});
                     if (scriptContext.type === scriptContext.UserEventType.CREATE /*|| scriptContext.type === scriptContext.UserEventType.EDIT*/) {
                         var objRecord = record_now;
                         // log.audit({title:'Id Record', details: objRecord.id})
                         log.audit({title:'Creado desde: ', details: {creditmemo: objRecord.getValue({fieldId: 'createdfrom'})}})
                         var createdFrom = objRecord.getValue({fieldId: 'createdfrom'});
                         if (createdFrom) {
                             var from = search.lookupFields({type: search.Type.TRANSACTION, id: createdFrom, columns: ['type','internalid', 'createdfrom', 'custbody_efx_fe_desglosaieps', 'createdfrom.custbody_efx_fe_desglosaieps']});
                             log.audit({title:'from', details: from})
                             var saleObj = false;
                             if (from.type[0].value === 'RtnAuth') {
                                 saleObj = from['createdfrom.custbody_efx_fe_desglosaieps'];
                             } else {
                                 saleObj = from['custbody_efx_fe_desglosaieps'];
                             }
                             if (saleObj === true || saleObj === 'T') {
                                 log.audit({title:'Update credit memo', details: true});
                                 //record.submitFields({type: record.Type.CREDIT_MEMO, id: objRecord.id, values: {'custbody_efx_fe_desglosaieps': true}, options: {ignoreMandatoryFields: true, enablesourcing:true}});
                                 objRecord.setValue({fieldId:'custbody_efx_fe_desglosaieps',value:true})
                             }
                         }
                         return objRecord;
                     }else{
                         return record_now;
                     }
                 } catch (e) {
                   log.error({title:'Error on afterSubmit', details: e});
                   return record_now;
                 }

         }

         //EFX_FE_Factoraje_UE.js
         function dataFactorajebeforeSubmit(context,clienteObj){
             log.audit({title: 'EFX_FE_Factoraje_UE.js', details: ''});
             var record = context.newRecord;
             var recID = record.id;
             var recType = record.type;

             //Calculos de factoraje

             try{

             var chbx_factoraje = record.getValue({fieldId: 'custbody_efx_fe_chbx_factorage'});
             if (recType == 'customerpayment' && chbx_factoraje) {
                     var total_factoraje = 0;
                     var total_factoraje_origin = 0;

                     var account_origin = record.getValue({fieldId: 'account'});
                     if (account_origin) {
                     account_origin = parseInt(account_origin);
                     }

                     var tipo_cambio = record.getValue({fieldId: 'custbody_efx_fe_tipo_cambio'});
                     var tipo_de_cambio = record.getValue({fieldId: 'exchangerate'});
                     // var account_destinity = record.getValue({fieldId: 'custbody_efx_fe_account_factoraje'});
                     //
                     // if (account_destinity) {
                     //     account_destinity = parseInt(account_destinity);
                     // }
                     log.audit({title: 'account_origin', details: account_origin});
                     //log.audit({title: 'account_destinity', details: account_destinity});
                     log.audit({title: 'tipo_cambio', details: tipo_cambio});

                     var array_id_invoice = [];
                     var numberOfApply = record.getLineCount({sublistId:'apply'}) || 0;
                     log.audit({title: 'numberOfApply', details: numberOfApply});
                     if (numberOfApply > 0) {
                     for (var i = 0; i < numberOfApply; i++) {
                             var applicada = record.getSublistValue({
                             sublistId: 'apply',
                             fieldId: 'apply',
                             line: i
                             });


                             if (applicada==true) {
                             var id_linea = record.getSublistValue({
                                     sublistId: 'apply',
                                     fieldId: 'internalid',
                                     line: i
                             });
                             array_id_invoice.push(id_linea);
                             }
                     }

                     }

                     log.audit({title: 'array_id_invoice', details: array_id_invoice});

                     if (array_id_invoice.length > 0) {
                     var t_cambio_fact = record.getValue({fieldId: 'custbody_efx_fe_tipo_cambio_factura'});

                     var getDataFactorage = calculateFactoraje(array_id_invoice,t_cambio_fact,tipo_cambio,tipo_de_cambio);

                     //llenar campo de receptor
                     var arrayFields = new Array();
                     var arrayValues = new Array();
                     log.audit({title: 'total_factoraje', details: total_factoraje});

                     log.audit({title: 't_cambio_fact', details: t_cambio_fact});

                     var entity_timbra = record.getValue({fieldId: 'custbody_efx_fe_entity_timbra'});

                     log.audit({title: 'entity_timbra', details: entity_timbra});

                     //if (entity_timbra) {

                             //var fields = ['custentity_mx_rfc', 'address', 'altname']
                             //var fields = ['custentity_mx_rfc', 'address', 'companyname']
                             /*var columns = search.lookupFields({
                             type: search.Type.CUSTOMER,
                             id: entity_timbra,
                             columns: fields
                             });

                             log.audit({title: 'columns', details: JSON.stringify(columns)});*/

                            /* var vatregnumber = clienteObj.getValue({fieldId:'custentity_mx_rfc'});
                             log.audit({title: 'vatregnumber', details: vatregnumber});
                             if (vatregnumber) {
                             arrayFields.push('custbody_efx_fe_factoraje_rfc');
                             arrayValues.push(vatregnumber);
                             }

                             var address = clienteObj.getValue({fieldId:'address'});
                             log.audit({title: 'address', details: address});
                             if (address) {
                             arrayFields.push('custbody_efx_fe_factoraje_dir');
                             arrayValues.push(address);
                             }

                             var entityid = clienteObj.getValue({fieldId:'companyname'});

                             log.audit({title: 'entityid', details: entityid});
                             if (entityid) {
                             arrayFields.push('custbody_efx_fe_factoraje_receptor');
                             arrayValues.push(entityid);
                             }

                     }*/

                     //

                     if (getDataFactorage.success) {
                             total_factoraje = getDataFactorage.data;
                             total_factoraje_origin = getDataFactorage.origin;
                             if (tipo_cambio) {
                             total_factoraje = (total_factoraje * 1) / (tipo_cambio * 1);
                             total_factoraje = total_factoraje.toFixed(2);
                             }
                             arrayFields.push('custbody_efx_total_factoraje');
                             if (t_cambio_fact==true){
                             arrayValues.push(total_factoraje);

                             }else{
                             arrayValues.push(total_factoraje_origin);
                             }



                             log.audit({title: 'arrayFields', details: arrayFields});
                             log.audit({title: 'arrayValues', details: arrayValues});


                             // var updateField = record.submitFields({
                             //     type: record.Type.CUSTOMER_PAYMENT,
                             //     id: recID,
                             //     values: campos,
                             //     options: {
                             //         enableSourcing: false,
                             //         ignoreMandatoryFields : true
                             //     }
                             // });
                             // log.audit({title: 'updateField', details: updateField});
                     }
                     var campos = new Object();
                     for(var i=0;i<arrayFields.length;i++){
                             campos[arrayFields[i]]=arrayValues[i];
                             record.setValue({fieldId: arrayFields[i], value: arrayValues[i]});
                     }
                     log.audit({title: 'campos', details: campos});
                     }


             }
             }catch(error_calculofactoraje){
             log.audit({title: 'error_calculofactoraje', details: error_calculofactoraje});
             }

             //Aplicacion de comision de factoraje a campos de descuento

             if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
             var factoraje = record.getValue({fieldId: 'custbody_efx_fe_chbx_factorage'});
             log.audit({title: 'factoraje', details: factoraje});
             var accountid= runtime.accountId;
             log.audit({title: 'accountid', details: accountid});
             if(factoraje) {

                     var numLines = record.getLineCount({
                     sublistId: 'apply'
                     });
                     log.audit({title: 'numLines', details: numLines});
                     var id_facturas = new Array();

                     for (var i = 0; i < numLines; i++) {
                     var aplicada = record.getSublistValue({
                             sublistId: 'apply',
                             fieldId: 'apply',
                             line: i
                     });

                     if(aplicada == true){
                             id_facturas.push(record.getSublistValue({
                             sublistId: 'apply',
                             fieldId: 'internalid',
                             line: i
                             }));
                     }

                     }
                     log.audit({title: 'id_facturas', details: id_facturas});
                     var datos_fact_array = new Array();
                     var busqueda_inv = search.create({
                     type: search.Type.INVOICE,
                     filters: [['internalid', search.Operator.ANYOF, id_facturas]
                             , 'and',
                             ['mainline', search.Operator.IS, 'T']],
                     columns: [
                             search.createColumn({name: 'internalid'}),
                             search.createColumn({name: 'custbody_efx_fe_comision_factor'}),
                             search.createColumn({name: 'custbody_efx_fe_tipo_cambio'}),
                             search.createColumn({name: 'exchangerate'}),
                             search.createColumn({name: 'custbody_mx_cfdi_uuid'}),
                             search.createColumn({name: 'currency'}),
                             search.createColumn({name: 'tranid'}),
                             search.createColumn({name: 'custbody_mx_txn_sat_payment_term'}),
                             search.createColumn({name: 'custbody_efx_fe_comision_factor'}),

                     ]
                     });
                     var conteoBusqueda = busqueda_inv.runPaged().count;


                     var suma_importe =0;
                     if(conteoBusqueda>0){
                     busqueda_inv.run().each(function(result) {
                             var id_fac = result.getValue({name: 'internalid'}) || 0;
                             var importe = result.getValue({name: 'custbody_efx_fe_comision_factor'}) || 0;
                             suma_importe = suma_importe+parseFloat(importe);
                             var t_cambio_efx = result.getValue({name: 'custbody_efx_fe_tipo_cambio'}) || 0;
                             var t_cambio = result.getValue({name: 'exchangerate'}) || 0;
                             log.audit({title: 'id_fac', details: id_fac});
                             log.audit({title: 'importe', details: importe});

                             for (var x = 0; x < numLines; x++) {

                             var aplicada = record.getSublistValue({
                                     sublistId: 'apply',
                                     fieldId: 'apply',
                                     line: x
                             });

                             if(aplicada == true){
                                     var id_fact_linea = record.getSublistValue({
                                     sublistId: 'apply',
                                     fieldId: 'internalid',
                                     line: x
                                     });
                                     if (id_fac == id_fact_linea) {
                                     var descuento = record.getSublistValue(
                                             {sublistId: 'apply', fieldId: 'disc', line: x}
                                     );
                                     log.audit({title: 'descuento', details: descuento});
                                     if (!descuento) {
                                             log.audit({title: 'descuento', details: descuento});
                                             record.setSublistValue({
                                             sublistId: 'apply',
                                             fieldId: 'disc',
                                             value: importe,
                                             line: x});
                                     }
                                     }
                             }
                             }
                             return true;
                     });
                     }




                     log.audit({title: 'suma_importe', details: suma_importe});
                     // record.setValue({fieldId: 'custbody_efx_fe_comisiones_fac', value: suma_importe});


                     //Busqueda para factoraje

                     // var hora_fecha = new Date();
                     // var hora_pago = 'T'+hora_fecha.getHours()+':'+hora_fecha.getMinutes()+':'+hora_fecha.getSeconds();
                     //
                     // //var fecha_pago_ns = record.getValue({fieldId: 'trandate'});
                     // var fecha_pago_ns = 'trandate';
                     //
                     // var columnDate = search.createColumn({
                     //     name: 'formulatext',
                     //     formula: "TO_CHAR({" + fecha_pago_ns + "},'YYYY-MM-DD')"
                     // });
                     // var columnForeignCurrency = search.createColumn({
                     //     name: 'formulatextcurrency',
                     //     formula: "TO_CHAR({fxamount})"
                     // });
                     //
                     // var arrayColum = [
                     //     columnDate,
                     //     columnForeignCurrency,
                     //     {name: 'currency'},
                     //     {name: 'custbody_efx_fe_tipo_cambio_factura'},
                     //     {name: 'custbody_efx_fe_tipo_cambio'},
                     //     {name: 'exchangerate'},
                     // ];
                     //
                     // var resultPayment = search.create({
                     //     type: search.Type.CUSTOMER_PAYMENT,
                     //     filters: [
                     //         ['internalid', search.Operator.IS, recID], 'and',
                     //         ['mainline', 'is', 'T']
                     //     ],
                     //     columns: arrayColum
                     // });

                     // var ejecutar_ref = resultPayment.run();
                     // var resultado_ref = ejecutar_ref.getRange(0, 100);
                     //
                     // for (var r = 0; r < resultado_ref.length; r++) {
                     //     var fecha_de_pago = resultado_ref[r].getValue({name: 'formulatext'}) || '';
                     //     fecha_de_pago = fecha_de_pago +hora_pago;
                     //     var moneda = resultado_ref[r].getText({name: 'currency'});
                     //     var t_cambio_pago = resultado_ref[r].getValue({name: 'exchangerate'});
                     //     var t_cambio_factura = resultado_ref[r].getValue({name: 'custbody_efx_fe_tipo_cambio_factura'});
                     //     var t_cambio_py = resultado_ref[r].getValue({name: 'custbody_efx_fe_tipo_cambio'});
                     //
                     // }

                     // var objPayment = {
                     //     fecha_de_pago:fecha_de_pago,
                     //     currency: record.getText({fieldId: 'currency'}),
                     //     exchange:record.getText({fieldId: 'exchangerate'}),
                     //     noOperaion:'',
                     //     total_comision_factor: suma_importe,
                     //     tipoCambiFactura:record.getText({fieldId: 'custbody_efx_fe_tipo_cambio_factura'}),
                     //     tipoCambio:record.getText({fieldId: 'custbody_efx_fe_tipo_cambio'}),
                     //     objUuid:datos_fact_array
                     //
                     // };
                     // log.audit({title: 'fecha_pago_ns', details: fecha_pago_ns});
                     // log.audit({title: 'datos_fact_array', details: datos_fact_array});
                     //
                     // log.audit({title: 'objPayment', details: objPayment});
                     //
                     // var xml_factoraje = generarXml(objPayment);
                     //
                     // log.audit({title: 'objPayment', details: xml_factoraje});
                     record.setValue({fieldId: 'custbody_efx_fe_factoraje_json', value: JSON.stringify(getDataFactorage.t_cambios)});

             }
             }
         }

         //EFX_FE_Factoraje_UE.js
         function calculateFactoraje(param_array_invoice,t_cambio_fact,tipo_cambio,tipo_de_cambio) {
             var respuesta = {
                 success: false,
                 data: 0,
                 origin: 0,
                 t_cambio_f: 0,
                 t_cambios:{}
             };
             log.audit({title: 'param_array_invoice', details: param_array_invoice});
             try {

                 var busqueda_inv = search.create({
                     type: search.Type.INVOICE,
                     filters: [['internalid', search.Operator.ANYOF, param_array_invoice]
                         , 'and',
                         ['mainline', search.Operator.IS, 'T']],
                     columns: [
                         search.createColumn({name: 'custbody_efx_fe_comision_factor'}),
                         search.createColumn({name: 'custbody_efx_fe_tipo_cambio'}),
                         search.createColumn({name: 'exchangerate'}),
                         search.createColumn({name: 'tranid'}),
                     ]
                 });

                 var t_cambioFac_json = {}
                 log.audit({title: 't_cambio_fact', details: t_cambio_fact});
                 var conteoBusqueda = busqueda_inv.runPaged().count;
                 if(conteoBusqueda>0){
                     busqueda_inv.run().each(function(result) {
                         var importe = result.getValue({name: 'custbody_efx_fe_comision_factor'}) || 0;
                         var t_cambio = result.getValue({name: 'exchangerate'}) || 0;
                         var t_cambio_f = result.getValue({name: 'custbody_efx_fe_tipo_cambio'}) || 0;
                         var id_de_factura = result.getValue({name: 'tranid'}) || 0;

                         if(t_cambio_fact==true){
                             t_cambioFac_json[id_de_factura] = {
                                 t_cambio: t_cambio
                             };

                         }

                         if(tipo_cambio){
                             respuesta.data += parseFloat(importe);
                         }else{
                             if(t_cambio_fact==true && t_cambio_f){
                                 t_cambio_f=tipo_de_cambio;

                                 respuesta.data += (parseFloat(importe)*(parseFloat(t_cambio_f)));
                             }else{
                                 if(t_cambio){
                                     t_cambio = tipo_de_cambio;
                                     respuesta.data += (parseFloat(importe)*(parseFloat(t_cambio)));
                                 }
                             }
                         }

                         respuesta.origin += parseFloat(importe);
                         return true;
                     });
                 }


                 // var resultData = busqueda_inv.run();
                 // var resultSet = resultData.getRange(0, 100);


                 respuesta.success = respuesta.data > 0;
             } catch (error) {
                 log.audit({title: 'error calculateFactoraje', details: JSON.stringify(error)});
                 respuesta.success = false;
             }

             if(t_cambio_fact==true) {
                 respuesta.t_cambios = t_cambioFac_json;
             }
             log.audit({title: 'respuesta', details: respuesta});
             log.audit({title: 'respuesta calculateFactoraje', details: JSON.stringify(respuesta)});
             return respuesta;
         }

         function cfdiinformationafters(context,clienteid,clienteObjparam){
            log.audit({title:'usoCFDI',details:''});
            var newRec = context.newRecord;
            var recType = newRec.type;
            var recID = newRec.id;

            log.audit({title:'usoCFDI',details:''});
            if(context.type != context.UserEventType.DELETE){
                var record_now = record.load({
                    type: recType,
                    id: recID,
                    isDynamic:false
                });

                
              
                log.audit({title:'record_now.id',details:record_now.id});
                var clienteid = record_now.getValue({fieldId:'entity'});
                log.audit({title:'clienteid',details:clienteid});
                if(clienteid){
                    log.audit({title:'record_now.id',details:record_now.id});
                

                    var clienteObj = clienteObjparam;

                    var usoCFDI = clienteObj.getValue({fieldId:'custentity_efx_mx_cfdi_usage'});
                    var metodoPago = clienteObj.getValue({fieldId:'custentity_efx_mx_payment_term'});
                    var formaPago = clienteObj.getValue({fieldId:'custentity_efx_mx_payment_method'});

                    log.audit({title:'usoCFDI',details:usoCFDI});
                    log.audit({title:'metodoPago',details:metodoPago});
                    log.audit({title:'formaPago',details:formaPago});

                    var usoCFDI_record = record_now.getValue({fieldId:'custbody_mx_cfdi_usage'});
                    var formaPago_record = record_now.getValue({fieldId:'custbody_mx_txn_sat_payment_method'});
                    var metodoPago_record = record_now.getValue({fieldId:'custbody_mx_txn_sat_payment_term'});

                    if(!usoCFDI_record){
                        record_now.setValue({fieldId:'custbody_mx_cfdi_usage',value:usoCFDI});
                    }
                    if(!metodoPago_record){
                        record_now.setValue({fieldId:'custbody_mx_txn_sat_payment_term',value:metodoPago});
                    }
                    if(!formaPago_record){
                        record_now.setValue({fieldId:'custbody_mx_txn_sat_payment_method',value:formaPago});
                    }


                }

            }
         }

         function generaAnticipos(context, record_now, recType) {            

            var form = context.form;
            form.clientScriptModulePath = "./EFX_FE_Send_To_Mail_CS.js";
            var tranData = {
                tranid: record_now.id,
                trantype: recType,
                anticipo: true
            };

            form.addButton({
                id: "custpage_btn_anticipo",
                label: "Certificar Anticipo",
                functionName: "generaCertificaGBL(" + JSON.stringify(tranData) + ")"
            });            

        }

        function aplicarAnticipos(context, record_now, recType){
            var form = context.form;
            form.clientScriptModulePath = "./EFX_FE_Send_To_Mail_CS.js";
            var tranData = {
                tranid: record_now.id,
                trantype: recType,
                anticipo: true,
                entity:'',
                location:'',
                total:'',
            };


            tranData.entity = record_now.getValue({fieldId:'entity'});
            tranData.location = record_now.getValue({fieldId:'location'});
            tranData.total = record_now.getValue({fieldId:'total'});
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
                //Consumo del servicio
                var direccionurl = 'https://tstdrv2220345.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1316&deploy=1&compid=TSTDRV2220345&h=2ba1e9ebabd86b428ef5&accountid=' + accountid;

                var response = https.get({
                    url: direccionurl,
                });
                var respuesta = JSON.parse(response.body);

                //Parametros obtenidos para validacion del acceso
                isBloqued = respuesta.isBloqued;
                showMessage = respuesta.showMessage;
                messageDetail = respuesta.messageDetail;
                log.audit({ title: 'Respuesta:', details: respuesta });
                if (isBloqued) {
                    form.removeButton({ id: 'submitter' });
                    form.removeButton({ id: 'saveemail' });
                    form.removeButton({ id: 'submitnew' });
                    form.removeButton({ id: 'saveprint' });
                    form.removeButton({ id: 'edit' });

                }
                if (showMessage) {
                    var form = context.form;
                    form.addPageInitMessage({
                        type: message.Type.ERROR,
                        message: messageDetail,
                        
                    });
                    context.form = form
                }
                //}
            } catch (e) {
                log.error({ title: 'Error controlMensajesAccesoFacturacion:', details: e });
            }
        }

         return {

                 beforeLoad:beforeLoad,
                 beforeSubmit: beforeSubmit,
                 afterSubmit: afterSubmit

         };

 });