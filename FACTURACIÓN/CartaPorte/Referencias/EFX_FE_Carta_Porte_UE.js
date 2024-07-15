/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
// PURCHASE_REQUISITION
define(['N/log', 'N/record', 'N/search', 'N/currency', 'N/config','N/runtime'],
    function (log, modRecord, search, modcurrency, config,runtime) {
        function beforeLoad(context){
                var record_now = context.newRecord;
                var recType = record_now.type;

                if (context.type == context.UserEventType.VIEW) {
                        if(recType == modRecord.Type.CASH_SALE || recType == modRecord.Type.ITEM_FULFILLMENT  || recType == modRecord.Type.TRANSFER_ORDER || recType == modRecord.Type.PURCHASE_ORDER || recType == modRecord.Type.ITEM_RECEIPT || recType == modRecord.Type.SALES_ORDER) {
                                var form = context.form;
                                form.clientScriptModulePath = "./EFX_FE_Carta_Porte_CS.js";
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

            function afterSubmit(context) {
                    var record_now = context.newRecord;
                    try {
                            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
                            var recID = record_now.id;
                            var recType = record_now.type;
                            var record = modRecord.load({
                                    type:recType,
                                    id:recID
                            });

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

                                            var json_direccion = buscarDirecciones(cliente_id, subsidiaries_id, obj_direccion, SUBSIDIARIES,creadodeffReco,creadodeff,tipoTransaccionff,usocfdiIFF);

                                            json_direccion = datosCP(json_direccion,record,recID,recType);

                                            record.setValue({
                                                    fieldId: 'custbody_ex_fe_cp_json_dir',
                                                    value: JSON.stringify(json_direccion)
                                            });

                                    }
                            }

                            record.save({enableSourcing: true,
                                    ignoreMandatoryFields: true});
                    } catch (afterSubmitCFDIError) {
                            log.audit(
                                { title: 'afterSubmitCFDIError', details: JSON.stringify(afterSubmitCFDIError) }
                            );
                    }
            }

            function buscarDirecciones(id_cliente,id_subsidiaria,obj_direccion,SUBSIDIARIES,creadodeff,creadodeffid,tipoTransaccionff,usocfdiIFF){

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

            function ubicacionDirecciones(dircli,dirloc,ubicaciones_obj,dircli_subrecid,recType,ub){

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

            return {
                    afterSubmit:afterSubmit,
                    beforeLoad:beforeLoad
            }

    }
);
