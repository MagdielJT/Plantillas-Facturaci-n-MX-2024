/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/https', 'N/log','N/url', 'N/record', 'N/format', 'N/search', 'N/currency', 'N/config', 'N/runtime', 'SuiteBundles/Bundle 342702/MX+ 2024/Utilities/EFX_FE_Lib', 'N/crypto/random', '../Lib/constants.js'],

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
                objForm.addButton({
                    id: 'custpage_suiteletbutton',
                    label: 'Open Suitelet',
                    functionName: 'bottonCartaporte',
                });
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
        //     const afterSubmit = (scriptContext) => {
        //         // Ejemplo de carta porte timbrada SAR279941
        //         var record_actual = scriptContext.newRecord;
        //         var record_Tipo = record_actual.type;
        //         var record_transaccion = record.load({
        //             type: record_Tipo,
        //             id: record_actual.id,
        //             isDynamic: true
        //         });
        //         // Se extre una parte del folio 
        //         var Serie_json = (record_transaccion.getValue({fieldId:'tranid'})).substring(0,3);
        //         log.audit({ title: 'Serie🛹', details: Serie_json });
        //         // Se crea objeto que guarda los codigos de impuesto del sat
        //         var items_custom_object=obtenercustomobject(record_transaccion,record_Tipo,'','',record_actual.id);
        //         log.emergency({title:'items_custom_object 🐝',details:items_custom_object});
        //         // Se GENERA EL IdCCP
        //         var IdCCP = generaIdccp();
        //         var obj_json_cp ={
        //             "Version": "4.0",
        //             "Serie": "",
        //             "Folio": "",
        //             "Fecha": "",
        //             "SubTotal": "0",
        //             "Moneda": "",
        //             "Total": "0",
        //             "TipoDeComprobante": "T",
        //             "Exportacion": "01",
        //             "LugarExpedicion": "",
        //             "Emisor": {
        //                 "Rfc": "",
        //                 "Nombre": "",
        //                 "RegimenFiscal": "601"
        //             },
        //             "Receptor": {
        //                 "Rfc": "",
        //                 "Nombre": "",
        //                 "DomicilioFiscalReceptor": "",
        //                 "RegimenFiscalReceptor": "",
        //                 "UsoCFDI": ""
        //             },
        //             "Conceptos": [],
        //             "Complemento": {
        //                 "Any": [
        //                     {
        //                         "cartaporte30:CartaPorte": {
        //                             "Version": "3.0",
        //                             "IdCCP": IdCCP,
        //                             "TranspInternac": "No",
        //                             "TotalDistRec": "1",
        //                             "Ubicaciones": [
        //                                 {
        //                                     "TipoUbicacion": "Origen",
        //                                     "IDUbicacion": "OR000001",
        //                                     "RFCRemitenteDestinatario": "",
        //                                     "NombreRemitenteDestinatario": "",
        //                                     "FechaHoraSalidaLlegada": "",
        //                                     "Domicilio": {
        //                                         "Calle": "",
        //                                         "NumeroExterior": "",
        //                                         "NumeroInterior": "",
        //                                         "Colonia": "",
        //                                         "Localidad": "",
        //                                         "Referencia": "",
        //                                         "Municipio": "",
        //                                         "Estado": "",
        //                                         "Pais": "",
        //                                         "CodigoPostal": ""
        //                                     }
        //                                 },
        //                                 {
        //                                     "TipoUbicacion": "Destino",
        //                                     "IDUbicacion": "DE000001",
        //                                     "RFCRemitenteDestinatario": "",
        //                                     "NombreRemitenteDestinatario": "",
        //                                     "FechaHoraSalidaLlegada": "2023-08-01T00:00:",
        //                                     "DistanciaRecorrida": "",
        //                                     "Domicilio": {
        //                                         "Calle": "",
        //                                         "NumeroExterior": "",
        //                                         "NumeroInterior": "",
        //                                         "Colonia": "",
        //                                         "Localidad": "",
        //                                         "Referencia": "",
        //                                         "Municipio": "",
        //                                         "Estado": "",
        //                                         "Pais": "",
        //                                         "CodigoPostal": ""
        //                                     }
        //                                 }
        //                             ],
        //                             "Mercancias": {},
        //                             "FiguraTransporte": [
        //                                 {
        //                                     "TipoFigura": "01",
        //                                     "NombreFigura": "NombreFigura",
        //                                     "RFCFigura": "CACX7605101P8",
        //                                     "NumLicencia": "a234567890"
        //                                 }
        //                             ]
        //                         }
        //                     }
        //                 ]
        //             }
        //         }
        //         // ==============DATOS DE CABECERA==============
        //         // Se coloca la serie
        //         obj_json_cp.Serie = Serie_json;
        //         // Se coloca el folio
        //         obj_json_cp.Folio = (record_transaccion.getValue({fieldId:'tranid'})).substring(3);
        //         // Se crea una fecha y hora y se le da formato
        //         var FechaCabecera = new Date();
        //         var formattedDate = format.format({
        //             value: FechaCabecera,
        //             type: format.Type.DATE,
        //         });
        //         var customFormat = formattedDate.split('/');
        //         var fechaHora = customFormat[2] + '-' + customFormat[1]+ '-' + customFormat[0]+ 'T' + record_transaccion.getValue({fieldId:'custbody_efx_fe_actual_hour'});
        //         obj_json_cp.Fecha = fechaHora;
        //         log.audit({ title: 'hora🦀', details: fechaHora });
        //         // Se coloca la moneda
        //         obj_json_cp.Moneda = record_transaccion.getValue({fieldId:'currencycode'});
        //         // Se extraen los datos de la subsidiaria
        //         // REV PARA CUANDO SEA ONEWORD
        //         subsidiaries_id = record_transaccion.getValue({fieldId: 'subsidiary'});
        //         var obj_subsidiaria = record.load({
        //             type: record.Type.SUBSIDIARY,
        //             id: subsidiaries_id,
        //         });
        //         var subsi_direcc = obj_subsidiaria.getSubrecord({fieldId:'mainaddress'}) 
        //         var zipsubsidiary = subsi_direcc.getValue({fieldId:'zip'});
        //         log.audit({ title: 'zip', details: zipsubsidiary });
        //         // Se coloca el Codigo Postal 
        //         obj_json_cp.LugarExpedicion = zipsubsidiary;
        //         // ===============DATOS DE EMISOR==============
        //         // Se coloca el RFC
        //         var rfcEmisor = obj_subsidiaria.getValue({fieldId:'federalidnumber'})
        //         log.audit({ title: 'rfcEmisor', details: rfcEmisor });
        //         obj_json_cp.Emisor.Rfc = rfcEmisor;
        //         // Se coloca el nombre
        //         obj_json_cp.Emisor.Nombre = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_registered_name'});
        //         var regFisEmi_id = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_industry_type'});
        //         if(regFisEmi_id) {
        //             var regfiscalObj = record.load({
        //                     type: 'customrecord_mx_sat_industry_type',
        //                     id: regFisEmi_id
        //             });
        //             obj_json_cp.Emisor.RegimenFiscal = regfiscalObj.getValue({fieldId: 'custrecord_mx_sat_it_code'});
        //         }
        //         log.audit({ title: 'nombreEmisor🦀', details: obj_json_cp.Emisor.RegimenFiscal });
        //         // ==============DATOS DE RESEPTOR==============
        //         if (record_transaccion.getValue({fieldId:'ordertype'}) == 'SalesOrd' || record_transaccion.getValue({fieldId:'ordertype'})) {
        //             obj_json_cp.Receptor.Rfc = obj_subsidiaria.getValue({fieldId:'federalidnumber'});
        //             log.audit({title:'RFC reseptor 👌',details:obj_json_cp.Receptor.Rfc});
        //             obj_json_cp.Receptor.Nombre = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_registered_name'});
        //             log.audit({title:'NombreResep 🎶',details:obj_json_cp.Receptor.Nombre});
        //             obj_json_cp.Receptor.DomicilioFiscalReceptor = subsi_direcc.getValue({fieldId:'zip'});
        //             log.audit({title:'DomiFisResep ♣️',details:obj_json_cp.Receptor.DomicilioFiscalReceptor});
        //             if(regFisEmi_id) {
        //                 obj_json_cp.Receptor.RegimenFiscalReceptor = regfiscalObj.getValue({fieldId: 'custrecord_mx_sat_it_code'});
        //             }
        //             log.audit({title:'RegfisResep ♣️♣️',details:obj_json_cp.Receptor.RegimenFiscalReceptor});
        //             obj_json_cp.Receptor.UsoCFDI = record_transaccion.getText({fieldId:'custbody_mx_cfdi_usage'}).substring(0,4);
        //             log.audit({title:'UsoCfdiResep ♣️♣️♣️',details:obj_json_cp.Receptor.UsoCFDI});
        //         } else {
        //             log.audit({title:'fallo👌👌',details:'Juas juas'});
        //         }
        //         // ================== Datos de conceptos ==================
        //         var line_count = record_transaccion.getLineCount({ sublistId: 'item' });
        //         log.audit({title:'line_count 💀💀',details:line_count});
        //         for (let i = 0; i < line_count; i++) {
        //             // se crea un arreglo para guardar los datos de cada concepto del item
        //             var obj_data_conceptos = {
        //                 ClaveProdServ:'',
        //                 NoIdentificacion:'',
        //                 Cantidad:'',
        //                 ClaveUnidad:'',
        //                 Unidad:'',
        //                 Descripcion:'',
        //                 ValorUnitario:'',
        //                 Importe:'',
        //                 ObjetoImp:''
        //             };
        //             // Se busca el articulo para extraer la clave de de producto de servicio
        //             var articulo_id = record_transaccion.getSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'item',
        //                 line: i,
        //             });
        //             var articulo = record.load({
        //                 type: record.Type.INVENTORY_ITEM,
        //                 id: articulo_id
        //             });
        //             var claveProducto_id = articulo.getValue({fieldId:'custitem_mx_txn_item_sat_item_code'});
        //             var claveProducto=fetchClaveProdServ(claveProducto_id);
        //             obj_data_conceptos.ClaveProdServ = claveProducto;
        //             // Se busca el numero de identificación desde el articulo
        //             var noIden = articulo.getValue({
        //                 fieldId: 'upccode',
        //                 line: i,
        //             });
        //             obj_data_conceptos.NoIdentificacion = noIden;
        //             // Se coloca la cantidad
        //             var qty = record_transaccion.getSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'quantity',
        //                 line:i,
        //             })
        //             obj_data_conceptos.Cantidad = qty;
        //             // Se coloca clave de unidad
        //             claveUnidad=items_custom_object[i].satUnitCode;
        //             obj_data_conceptos.ClaveUnidad = claveUnidad;
        //             // Se coloca la unidad del articulo
        //             obj_data_conceptos.Unidad = articulo.getValue({fieldId:'unitstype'});
        //             // Se colocan los datos de descripcion del articulo
        //             obj_data_conceptos.Descripcion = record_transaccion.getValue({fieldId:'description'});
        //             // Se coloca el valor unitario 
        //             obj_data_conceptos.ValorUnitario = "0.00";
        //             // Se coloca el importe
        //             obj_data_conceptos.Importe = "0.00";
        //             // Se coloca el objeto de impuesto 01 por que no tiene impuestos
        //             obj_data_conceptos.ObjetoImp = "01";
        //             obj_json_cp.Conceptos.push(obj_data_conceptos)
        //         }
        //         // log.audit({ title: 'Conceptos ☠️☠️☠️☠️', obj_data_conceptos });
        //         // ========================== DATOS COMPLEMENTO CARTA PORTE ==========================
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].RFCRemitenteDestinatario = obj_subsidiaria.getValue({fieldId:'federalidnumber'});
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].NombreRemitenteDestinatario = obj_subsidiaria.getValue({fieldId:'custrecord_mx_sat_registered_name'});
        //         // REV SE COLOCA LA FECHA Y HORA DE ENVIO
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].FechaHoraSalidaLlegada = record_transaccion.getValue({fieldId:'custbody_mx_plus_fechahorasalida_cp'});
        //         // Se coloca la calle
        //         var JsonDirecciones = record_transaccion.getValue({fieldId:'custbody_ex_fe_cp_json_dir'}) || '';
        //         var JsonDirecciones_Parse =JSON.parse(JsonDirecciones);
        //         log.audit({title:'Jso🦀',details:JsonDirecciones});
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.Calle = JsonDirecciones_Parse.emisor.Calle;
        //         // Se coloca el numero NumeroExterior
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.NumeroExterior = JsonDirecciones_Parse.emisor.NumeroExterior;
        //         // Se coloca el numero NumeroInterior
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.NumeroInterior = JsonDirecciones_Parse.emisor.NumeroInterior;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.Colonia = JsonDirecciones_Parse.emisor.Colonia;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.Localidad = JsonDirecciones_Parse.emisor.Localidad;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.Referencia = JsonDirecciones_Parse.emisor.Referencia;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.Municipio = JsonDirecciones_Parse.emisor.Municipio;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.Estado = JsonDirecciones_Parse.emisor.Estado;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.Pais = JsonDirecciones_Parse.emisor.Pais;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[0].Domicilio.CodigoPostal = JsonDirecciones_Parse.emisor.CodigoPostal;
        //         // ========================== datos receptor ==========================
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].RFCRemitenteDestinatario = JsonDirecciones_Parse.receptor.Rfc;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].NombreRemitenteDestinatario = JsonDirecciones_Parse.receptor.Nombre;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].FechaHoraSalidaLlegada = record_transaccion.getValue({fieldId:'custbody_mx_plus_fechahorallegada_cp'});
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].DistanciaRecorrida = record_transaccion.getValue({fieldId:'custbody_mx_plus_distanciarecorrida_cp'});
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.Calle = JsonDirecciones_Parse.receptor.Calle;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.NumeroExterior = JsonDirecciones_Parse.receptor.NumeroExterior;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.NumeroInterior = JsonDirecciones_Parse.receptor.NumeroInterior;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.Colonia = JsonDirecciones_Parse.receptor.Colonia;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.Localidad = JsonDirecciones_Parse.receptor.Localidad;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.Referencia = JsonDirecciones_Parse.receptor.Referencia;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.Municipio = JsonDirecciones_Parse.receptor.Municipio;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.Estado = JsonDirecciones_Parse.receptor.Estado;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.Pais = JsonDirecciones_Parse.receptor.Pais;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].Ubicaciones[1].Domicilio.CodigoPostal = JsonDirecciones_Parse.receptor.CodigoPostal;
        //         // ========================== FIGURA TRANSPORTE ==========================
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].FiguraTransporte[0].TipoFigura = JsonDirecciones_Parse.CPFiguraTransporte[0].TipoFigura;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].FiguraTransporte[0].NombreFigura = JsonDirecciones_Parse.CPFiguraTransporte[0].NombreFigura;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].FiguraTransporte[0].RFCFigura = JsonDirecciones_Parse.CPFiguraTransporte[0].RFCFigura;
        //         obj_json_cp.Complemento.Any[0]["cartaporte30:CartaPorte"].FiguraTransporte[0].NumLicencia = JsonDirecciones_Parse.CPFiguraTransporte[0].NumLicencia;
        //         log.audit({ title: 'JSON LIMPIO 🛹🛹🛹', details: obj_json_cp });
        // }
        // const fetchClaveProdServ=(itemCode)=>{
        //     try{
        //         var record_claveProdServ = record.load({
        //             type: 'customrecord_mx_sat_item_code_mirror',
        //             id: itemCode,
        //         });
        //         var value = record_claveProdServ.getValue({
        //             fieldId: 'custrecord_mx_ic_mr_code'
        //         });
        //         return value;
        //     }catch(err){
        //     log.error({title:'Error occurred in fetchClaveProdServ',details:err});
        //     }
        // }
        // function obtenercustomobject(recordObjrecord,tipo_transaccion,tipo_transaccion_gbl,tipo_cp,id_transaccion){

        //     var obj_main = {
        //         suiteTaxFeature: false,
        //         suiteTaxWithholdingTaxTypes: [],
        //         multiCurrencyFeature: true,
        //         oneWorldFeature: true,
        //         items: [],
        //         cfdiRelations: {},
        //         companyInfo: {
        //             rfc: ""
        //         },
        //         itemIdUnitTypeMap: {},
        //         firstRelatedCfdiTxn: {},
        //         relatedCfdis: {
        //             types: [],
        //             cfdis: {}
        //         },
        //         billaddr: {
        //             countrycode: ""
        //         },
        //         loggedUserName: "",
        //         summary: {
        //             totalWithHoldTaxAmt: 0,
        //             totalNonWithHoldTaxAmt: 0,
        //             totalTaxAmt: 0,
        //             discountOnTotal: 0,
        //             includeTransfers: false,
        //             includeWithHolding: false,
        //             bodyDiscount: 0,
        //             subtotal: 0,
        //             subtotalExcludeLineDiscount: 0,
        //             transfersTaxExemptedAmount: 0,
        //             totalAmount: 0,
        //             totalDiscount: 0,
        //             totalTaxSum: 0,
        //             totalSum: 0,
        //             whTaxes: [],
        //             transferTaxes: []
        //         },
        //         satcodes: {
        //             items: [],
        //             paymentTermInvMap: {},
        //             paymentMethodInvMap: {},
        //             whTaxTypes: {},
        //             taxTypes: {},
        //             paymentTermSatCodes: {},
        //             paymentMethodCodes: {},
        //             industryType: "",
        //             industryTypeName: "",
        //             paymentTerm: "",
        //             paymentTermName: "",
        //             paymentMethod: "",
        //             paymentMethodName: "",
        //             cfdiUsage: "",
        //             cfdiUsageName: "",
        //             proofType: "",
        //             taxFactorTypes: {},
        //             unitCodes: {}
        //         }
        //     }

        //     var recordObj = recordObjrecord;

        //     var lineCount = recordObj.getLineCount({
        //         sublistId: 'item',
        //     });
        //     var importeotramoneda = recordObj.getValue({
        //         fieldId: 'custbody_efx_fe_importe',
        //     });

        //     obj_main.multiCurrencyFeature = runtime.isFeatureInEffect({ feature: 'multicurrency' });
        //     obj_main.oneWorldFeature = runtime.isFeatureInEffect({ feature: 'subsidiaries' });
        //     obj_main.suiteTaxFeature = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
        //     obj_main.loggedUserName = runtime.getCurrentUser().name;
        //     //pendiente, probar con suitetax
        //     if (obj_main.suiteTaxFeature) {
        //         obj_main.suiteTaxWithholdingTaxTypes = libCFDI.tiposImpuestosSuiteTax();
        //     }

        //     if(tipo_transaccion!='customerpayment' && tipo_transaccion!='itemfulfillment') {
        //         var subRecord_bill = recordObj.getSubrecord({
        //             fieldId: 'billingaddress',
        //         });
        //         obj_main.billaddr.countrycode = subRecord_bill.getValue('country');
        //     }

        //     //company info
        //     var registroCompania;
        //     if (obj_main.suiteTaxFeature && obj_main.oneWorldFeature) {
        //         registroCompania = record.load({
        //             type : record.Type.SUBSIDIARY,
        //             id : recordObj.getValue('subsidiary'),
        //         });
        //         var lineCount = registroCompania.getLineCount({
        //             sublistId : 'taxregistration',
        //         });

        //         var pais = '';
        //         for (var i=0; i<lineCount; i++) {
        //             pais = registroCompania.getSublistValue({
        //                 sublistId: 'taxregistration',
        //                 fieldId : 'nexuscountry',
        //                 line : i,
        //             });
        //             if (pais === 'MX') {
        //                 obj_main.companyInfo.rfc = registroCompania.getSublistValue({
        //                     sublistId: 'taxregistration',
        //                     fieldId: 'taxregistrationnumber',
        //                     line : i,
        //                 });
        //                 break;
        //             }
        //         }
        //     } else if (obj_main.suiteTaxFeature) {
        //         registroCompania = config.load({
        //             type : config.Type.COMPANY_INFORMATION,
        //         });

        //         var lineCount = registroCompania.getLineCount({
        //             sublistId : 'taxregistration',
        //         });
        //         var pais = '';
        //         for (var i=0; i<lineCount; i++) {
        //             pais = registroCompania.getSublistValue({
        //                 sublistId: 'taxregistration',
        //                 fieldId : 'nexuscountry',
        //                 line : i,
        //             });
        //             if (pais === 'MX') {
        //                 obj_main.companyInfo.rfc = registroCompania.getSublistValue({
        //                     sublistId: 'taxregistration',
        //                     fieldId: 'taxregistrationnumber',
        //                     line : i,
        //                 });
        //                 break;
        //             }
        //         }
        //     } else if (obj_main.oneWorldFeature) {
        //         registroCompania = record.load({
        //             type : record.Type.SUBSIDIARY,
        //             id : recordObj.getValue('subsidiary'),
        //         });
        //         obj_main.companyInfo.rfc = registroCompania.getValue('federalidnumber');
        //     } else {
        //         registroCompania = config.load({
        //             type : config.Type.COMPANY_INFORMATION,
        //         });
        //         obj_main.companyInfo.rfc = registroCompania.getValue('employerid');
        //     }

        //     if (registroCompania) {
        //         var idIndustria = registroCompania.getValue('custrecord_mx_sat_industry_type');
        //         var campos = search.lookupFields({
        //             id: idIndustria,
        //             type: 'customrecord_mx_sat_industry_type',
        //             columns: ['custrecord_mx_sat_it_code', 'name'],
        //         });

        //         var objIdT = {
        //             code: campos['custrecord_mx_sat_it_code'],
        //             name: campos.name,
        //         };
        //         obj_main.satcodes.industryType =  objIdT.code;
        //         obj_main.satcodes.industryTypeName = objIdT.name;
        //     }


        //     //inicia cfdirelationtypeinfo

        //     var lineCount = recordObj.getLineCount({
        //         sublistId:'recmachcustrecord_mx_rcs_orig_trans',
        //     });

        //     var relacionCFDI = {};
        //     var internalId = '';
        //     var tipoRelacion = '';
        //     var textoRelT = '';
        //     var primerRelacionadoCFDI = '';
        //     var arrayTiporelacionId = new Array();
        //     var arrayTiporelacionData = new Array();

        //     for (var p = 0; p < lineCount; p++) {

        //         var idOriginTran = recordObj.getSublistValue({
        //             sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
        //             fieldId: 'custrecord_mx_rcs_rel_type',
        //             line: p,
        //         });
        //         arrayTiporelacionId.push(idOriginTran);
        //     }

        //     log.audit({title:'arrayTiporelacionId',details:arrayTiporelacionId});

        //     if(arrayTiporelacionId.length > 0){
        //         var tipodeRelacionSearch = search.create({
        //             type: 'customrecord_mx_sat_rel_type',
        //             filters: [['internalid',search.Operator.ANYOF,arrayTiporelacionId]],
        //             columns: [
        //                 search.createColumn({name:'internalid'}),
        //                 search.createColumn({name:'custrecord_mx_sat_rel_type_code'}),
        //             ]
        //         });
        //         tipodeRelacionSearch.run().each(function (result){
        //             var obj_trelacion = {
        //                 id:'',
        //                 tiporelacion:''
        //             }
        //             obj_trelacion.id = result.getValue({name: 'internalid'});
        //             obj_trelacion.tiporelacion = result.getValue({name:'custrecord_mx_sat_rel_type_code'});
        //             log.audit({title:'obj_trelacion',details:obj_trelacion});
        //             arrayTiporelacionData.push(obj_trelacion);
        //             return true;
        //         });

        //     }
        //     log.audit({title:'arrayTiporelacionData',details:arrayTiporelacionData});

        //     for (var p = 0; p < lineCount; p++) {
        //         internalId = recordObj.getSublistValue({
        //             sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
        //             fieldId: 'custrecord_mx_rcs_rel_cfdi',
        //             line: p,
        //         })+'';
        //         if (p==0) {
        //             primerRelacionadoCFDI = internalId;
        //         }
        //         var idOriginTran = recordObj.getSublistValue({
        //             sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
        //             fieldId: 'custrecord_mx_rcs_rel_type',
        //             line: p,
        //         });

        //         if(idOriginTran){
        //             for(var tr = 0;tr<arrayTiporelacionData.length;tr++){
        //                 if(arrayTiporelacionData[tr].id==idOriginTran){
        //                     tipoRelacion = arrayTiporelacionData[tr].tiporelacion;
        //                 }
        //             }
        //         }

        //         textoRelT = relacionCFDI[tipoRelacion];
        //         if (!textoRelT) {
        //             obj_main.relatedCfdis.types.push(tipoRelacion);
        //             obj_main.relatedCfdis.cfdis['k'+(obj_main.relatedCfdis.types.length-1)] = [{index : p}];
        //             relacionCFDI[tipoRelacion] = obj_main.relatedCfdis.types.length;
        //         } else {
        //             obj_main.relatedCfdis.cfdis['k'+(textoRelT-1)].push({index: p});
        //         }
        //     }
        //     var esCreditMemo = recordObj.type;

        //     if (esCreditMemo=='creditmemo' && primerRelacionadoCFDI) {
        //         var primerCFDIRelacionado = search.lookupFields({
        //             type : 'transaction',
        //             columns : ['custbody_mx_txn_sat_payment_method'],
        //             id : primerRelacionadoCFDI,
        //         });
        //         var paymentMethod = primerCFDIRelacionado['custbody_mx_txn_sat_payment_method'];
        //         if (paymentMethod && paymentMethod[0]) {
        //             obj_main.firstRelatedCfdiTxn.paymentMethodId = paymentMethod[0].value;
        //         }
        //     }

        //     var descuentototal = recordObj.getValue('discounttotal');

        //     if(descuentototal){
        //         obj_main.summary.bodyDiscount = Math.abs(descuentototal);
        //     }else{
        //         obj_main.summary.bodyDiscount = 0.0;
        //     }

        //     log.audit({title:'objmain3',details:obj_main});

        //     var paymentTerm = recordObj.getValue('custbody_mx_txn_sat_payment_term');
        //     var paymentMethod = recordObj.getValue('custbody_mx_txn_sat_payment_method');

        //     var cfdiUsage = recordObj.getValue('custbody_mx_cfdi_usage');


        //     if (esCreditMemo=='creditmemo') {
        //         //var objPaymentMet = libCFDI.obtenMetodoPago(obj_main.firstRelatedCfdiTxn.paymentMethodId);
        //         var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod);
        //         if(objPaymentMet){
        //             obj_main.satcodes.paymentMethod = objPaymentMet.code;
        //             obj_main.satcodes.paymentMethodName = objPaymentMet.name;
        //         }
        //         obj_main.satcodes.paymentTerm = 'PUE';
        //         obj_main.satcodes.paymentTermName = 'PUE - Pago en una Sola Exhibición';
        //     } else {
        //         var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod);
        //         var objPaymentFor = libCFDI.obtenFormaPago(paymentTerm);
        //         if(objPaymentMet){
        //             obj_main.satcodes.paymentMethod = objPaymentMet.code;
        //             obj_main.satcodes.paymentMethodName = objPaymentMet.name;
        //         }
        //         if(objPaymentFor){
        //             obj_main.satcodes.paymentTerm = objPaymentFor.code;
        //             obj_main.satcodes.paymentTermName = objPaymentFor.name;
        //         }
        //     }

        //     var objUsoCfdi = libCFDI.obtenUsoCfdi(cfdiUsage);
        //     if(objUsoCfdi){
        //         obj_main.satcodes.cfdiUsage = objUsoCfdi.code;
        //         obj_main.satcodes.cfdiUsageName = objUsoCfdi.name;
        //     }
        //     obj_main.satcodes.proofType = libCFDI.tipoCFDI(recordObj.type);

        //     var lineCount = recordObj.getLineCount({
        //         sublistId: 'item',
        //     });

        //     obj_main = libCFDI.libreriaArticulos(obj_main,recordObj,lineCount,tipo_transaccion_gbl);
        //     var articulosId = [];
        //     obj_main.items.map(function (articuloMap) {
        //         articulosId.push(articuloMap.itemId);
        //         articuloMap.parts.map(function (partes) {
        //             articulosId.push(partes.itemId);
        //         });
        //     });
        //     if(tipo_transaccion!='customerpayment') {
        //         var tipodeUnidad = search.create({
        //             type: 'item',
        //             filters: [['internalid', 'anyof', articulosId]],
        //             columns: ['unitstype'],
        //         });

        //         tipodeUnidad.run().each(function (result) {
        //             var unittypemap = result.getValue('unitstype');

        //                 obj_main.itemIdUnitTypeMap['k' + result.id] = result.getValue('unitstype');

        //             return true;
        //         });
        //     }

        //     //attatchsatmapping

        //     // var satCodesDao = obj_main.satCodesDao;
        //     var clavesdeUnidad = {};

        //     function detallesDeImpuesto (articulo) {
        //         tieneItemParte(articulo);
        //         if(tipo_transaccion=='creditmemo' && articulo.custcol_efx_fe_gbl_originunits){
        //             clavesdeUnidad[articulo.custcol_efx_fe_gbl_originunits] = true;
        //         }else{
        //             clavesdeUnidad[articulo.units] = true;
        //         }
        //         // articulo.taxes.taxItems.map(function (taxLine) {
        //         //     satCodesDao.pushForLineSatTaxCode(taxLine.taxType);
        //         //     satCodesDao.pushForLineSatTaxFactorType(taxLine.taxCode);
        //         //
        //         // });
        //         // articulo.taxes.whTaxItems.map(function (taxLine) {
        //         //     satCodesDao.pushForLineSatTaxCode(taxLine.taxType,true);
        //         // });
        //     }

        //     function tieneItemParte (articulo) {
        //         if (articulo.parts) {
        //             articulo.parts.map(function (parte) {
        //                 detallesDeImpuesto(parte);
        //             });
        //         }
        //     }

        //     function codigosSatArticulos (items,codigosSat,idUnidades) {
        //         if (!items) {
        //             return;
        //         }
        //         var objCodes;
        //         items.map(function (articulos) {
        //             codigosSatArticulos(articulos.parts,codigosSat,idUnidades);
        //             log.audit({title:'idUnidades',details:idUnidades});
        //             log.audit({title:'articulos.itemId',details:articulos.itemId});
        //             log.audit({title:'articulos.units',details:articulos.units});
        //             if(tipo_transaccion=='creditmemo' && articulos.custcol_efx_fe_gbl_originunits){
        //                 objCodes = codigosSat.unitCodes['k'+idUnidades['k'+articulos.itemId]+'_'+articulos.custcol_efx_fe_gbl_originunits];
        //             }else{
        //                 objCodes = codigosSat.unitCodes['k'+idUnidades['k'+articulos.itemId]+'_'+articulos.units];
        //             }

        //             articulos.satUnitCode = objCodes?objCodes.code:'';
        //             articulos.taxes.taxItems.map(function (lineaImpuesto) {
        //                 if (obj_main.suiteTaxFeature) {
        //                     objCodes = codigosSat.taxFactorTypes[lineaImpuesto.satTaxCodeKey];
        //                     lineaImpuesto.taxFactorType = objCodes?objCodes.code:'';
        //                 } else {
        //                     lineaImpuesto.taxFactorType = lineaImpuesto.exempt? 'Exento' : 'Tasa';
        //                 }

        //                 objCodes = codigosSat.taxTypes['k'+lineaImpuesto.taxType];
        //                 lineaImpuesto.satTaxCode = objCodes?objCodes.code:'';
        //             });
        //             articulos.taxes.whTaxItems.map(function (lineaImpuesto) {
        //                 lineaImpuesto.taxFactorType = 'Tasa';
        //                 objCodes = codigosSat.whTaxTypes['k'+lineaImpuesto.taxType];
        //                 lineaImpuesto.satTaxCode = objCodes?objCodes.code:'';
        //             });
        //         });
        //     }

        //     function obtieneUnidadesMedidaSAT(idUnidades){
        //         log.audit('idUnidades',idUnidades);
        //         var filtrosArray = new Array();
        //         var buscaUnidades = search.load({
        //             id: 'customsearch_mx_mapping_search',
        //         });
        //         filtrosArray.push(['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[0]]);
        //         for (var i = 1; i < idUnidades.length; i++) {
        //             filtrosArray.push('OR', ['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[i]]);
        //         }
        //         log.audit('filtrosArray',filtrosArray);
        //         if (filtrosArray.length === 0) {
        //             return {};
        //         }

        //         buscaUnidades.filterExpression = [
        //             [
        //                 'custrecord_mx_mapper_keyvalue_category.scriptid',
        //                 'is',
        //                 ['sat_unit_code'],
        //             ],
        //             'and',
        //             ['custrecord_mx_mapper_keyvalue_rectype', 'is', ['unitstype']],
        //             'and',
        //             ['custrecord_mx_mapper_keyvalue_subrectype', 'is', ['uom']],
        //             'and',
        //             [filtrosArray],
        //         ];
        //         log.audit('buscaUnidades',buscaUnidades);
        //         var ejecuta = buscaUnidades.run()

        //         log.audit('ejecuta',ejecuta);

        //         var data = {};
        //         ejecuta.each(function (mapping) {
        //             var detalle = {};
        //             detalle.code = mapping.getValue({
        //                 name: 'custrecord_mx_mapper_value_inreport',
        //                 join: 'custrecord_mx_mapper_keyvalue_value',
        //             });
        //             detalle.name = mapping.getValue({
        //                 name: 'name',
        //                 join: 'custrecord_mx_mapper_keyvalue_value',
        //             });
        //             var key = mapping.getValue({
        //                 name: 'custrecord_mx_mapper_keyvalue_key',
        //             });
        //             var subkey = mapping.getValue({
        //                 name: 'custrecord_mx_mapper_keyvalue_subkey',
        //             });
        //             var claveid = 'k'+key;
        //             if (subkey) {
        //                 claveid = claveid + '_' + subkey;
        //             }
        //             data[claveid] = detalle;
        //             log.audit('data',data);
        //             return true;
        //         });

        //         log.audit('data',data);
        //         return data;


        //     }

        //     log.debug('obj_main preitems :', obj_main);
        //     obj_main.items.map(function (articulo) {
        //         detallesDeImpuesto(articulo);
        //     });

        //     // satCodesDao.fetchSatTaxFactorTypeForAllPushed();
        //     // satCodesDao.fetchSatTaxCodesForAllPushed();
        //     //satCodesDao.fetchSatUnitCodesForAllPushed();
        //     if(tipo_transaccion!='customerpayment') {
        //         obj_main.satcodes.unitCodes = obtieneUnidadesMedidaSAT(Object.keys(clavesdeUnidad));

        //         log.debug('obj_main result :', obj_main);
        //         codigosSatArticulos(obj_main.items, obj_main.satcodes, obj_main.itemIdUnitTypeMap);

        //     }
        //     //fin attachmaping

        //     obj_main.summary = libCFDI.summaryData(obj_main);
        //     // this._attachSatMappingData(result);
        //     //new summaryCalc.TransactionSummary().summarize(obj_main);


        //     //result.satcodes = satCodesDao.getJson();
        //     //crear relacionado en el pago
        //     if(tipo_transaccion=='customerpayment') {
        //         // var payment = pagodata.obtenerDatos(recordObj, obj_main, obj_main.satCodesDao);
        //         // log.debug('payment: ',JSON.stringify(payment));
        //         obj_main.appliedTxns = libCFDI.pagoData(recordObj, obj_main,'apply',id_transaccion,importeotramoneda);
        //         log.debug('result.appliedTxns: ',JSON.stringify(obj_main.appliedTxns));
        //     }

        //     //
        //     obj_main.satCodesDao = null;
        //     log.debug('Custom Datasource result: ',JSON.stringify(obj_main));

        //     return obj_main.items;
        // }
        // function generaIdccp (){
        //     try{
        //         var UUID = crypto.generateUUID();
        //         var string = UUID.replace(/^.{3}/g, 'CCC');
        //         log.audit({title:'UUID ☠️',details: string});
        //         return string
        //     }catch(err){
        //         log.error({title:'Error occurred in ',details:err});
        //     }
        // }
        return { beforeLoad: beforeLoad }
        // return {beforeLoad, afterSubmit}
        // return {beforeLoad, beforeSubmit, afterSubmit}

    });