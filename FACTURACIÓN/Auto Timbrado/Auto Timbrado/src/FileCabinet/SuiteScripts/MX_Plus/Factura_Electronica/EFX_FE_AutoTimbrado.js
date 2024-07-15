/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect','N/https','N/runtime', 'N/search','N/url','N/file','N/render','N/xml','N/encode','N/http'],

    function(record, redirect,https,runtime, search,urlMod,file,render,xmls,encode,http) {

        /**
         * Marks the beginning of the Map/Reduce process and generates input data.
         *
         * @typedef {Object} ObjectRef
         * @property {number} id - Internal ID of the record instance
         * @property {string} type - Record type id
         *
         * @return {Array|Object|Search|RecordRef} inputSummary
         * @since 2015.1
         */
        function getInputData() {

            //agregar

            ///
            var scriptObj = runtime.getCurrentScript();
            var idbusqueda = scriptObj.getParameter({ name: 'custscript_efx_fe_autotimbrado_bg' });
            try {
                // if(runtime.envType != 'PRODUCTION') {
                //     log.debug({title:'Script detenido - Env: ' + runtime.envType});
                //     return null;
                // }

                log.audit({title: 'idbusqueda', details: idbusqueda});
                var busqueda_facturas = search.load({ id: idbusqueda });

                var ejecutar = busqueda_facturas.run();
                var resultado = ejecutar.getRange(0, 100);
                var ejecutarNumeros = busqueda_facturas.runPaged();
                var numTickets = ejecutarNumeros.count;

                log.audit({title: 'numTickets', details: numTickets});
                log.audit({title: 'resultado', details: resultado});
                log.audit({title: 'busqueda_facturas', details: busqueda_facturas});
                return busqueda_facturas;

            }catch(error_busqueda){
                log.audit({title: 'error_busqueda', details: error_busqueda});
            }

        }

        /**
         * Executes when the map entry point is triggered and applies to each key/value pair.
         *
         * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
         * @since 2015.1
         */
        function map(context) {
            try{
                log.audit({title:'map',details:JSON.parse(context.value)});
                var datos = JSON.parse(context.value);


                log.audit({title:'map - values',details:datos.values});
                var peticion = datos.id;
                context.write({
                    key: peticion,
                    value: datos.values
                });
            }catch(error){
                log.error({title:'map - error',details:error});
            }
        }

        /**
         * Executes when the reduce entry point is triggered and applies to each group.
         *
         * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
         * @since 2015.1
         */
        function reduce(context) {

            try {
                log.audit({title: 'reduce-context', details: context});
                var data_reduce = JSON.parse(context.values[0]);
                var id = JSON.parse(context.key);

                log.audit({title: 'data_reduce', details: data_reduce});
                log.audit({title: 'id', details: id});


                log.audit({title: 'data_reduce.custbody_psg_ei_content', details: data_reduce.custbody_psg_ei_content});
                log.audit({title: 'data_reduce.type', details: data_reduce.type});

                var uuidtransaccion = data_reduce.custbody_mx_cfdi_uuid;
                log.audit({title: 'uuidtransaccion', details: uuidtransaccion});

                if(!uuidtransaccion) {
                    var tipo_transaccion = '';
                    var entidad = '';
                    var ejecuta = false;
                    if (data_reduce.type.value == 'CustInvc') {
                        tipo_transaccion = record.Type.INVOICE;
                        ejecuta = true;
                    }
                    if (data_reduce.type.value == 'CustPymt') {
                        tipo_transaccion = record.Type.CUSTOMER_PAYMENT;
                        ejecuta = true;
                    }

                    if (data_reduce.type.value == 'CashSale') {
                        tipo_transaccion = record.Type.CASH_SALE;
                        ejecuta = true;

                    }
                    if (data_reduce.type.value == 'ItemShip') {
                        tipo_transaccion = record.Type.ITEM_FULFILLMENT;
                        ejecuta = true;

                    }

                    if (data_reduce.type.value == 'CustCred') {
                        tipo_transaccion = record.Type.CREDIT_MEMO;
                    }


                    // record.submitFields({
                    //     type: tipo_transaccion,
                    //     id: id,
                    //     values: {
                    //         custbody_efx_fe_autocertify: true,
                    //     },
                    //     options: {
                    //         enableSourcing: false,
                    //         ignoreMandatoryFields: true
                    //     }
                    // });

                    var idrelacion = '';
                    log.audit({title: 'data_reduce.type.value', details: data_reduce.type.value});
                    if (data_reduce.type.value == 'CustCred') {
                        try {
                            log.audit({title: 'entra', details: 'entra'});
                            tipo_transaccion = record.Type.CREDIT_MEMO;
                            var uuid_factura = data_reduce['custbody_mx_cfdi_uuid.appliedToTransaction'];
                            log.audit({title: 'uuid_factura', details: uuid_factura});
                            //var id_factura = data_reduce.appliedtotransaction.internalid.value;
                            var tipo_relacion_tran = data_reduce['type.createdFrom'].value;
                            var idrelacionada = data_reduce.createdfrom.value;


                            log.audit({title: 'tipo_relacion_tran', details: tipo_relacion_tran});
                            log.audit({title: 'idrelacionada', details: idrelacionada});

                            idrelacion = relacionaNC(id, data_reduce.appliedtotransaction.value, uuid_factura, data_reduce.custbody_efx_nota_cre_tipo.value, tipo_relacion_tran, idrelacionada, data_reduce.custbody_efx_fe_invoice_related.value,tipo_transaccion);
                            log.audit({title: 'idrelacion', details: idrelacion});
                            if (idrelacion) {
                                ejecuta = true;
                            }
                        } catch (errorNC) {
                            log.audit({title: 'errorNC', details: errorNC});
                        }
                    }

                    if (ejecuta) {

                        //solo para nota de credito

                        try {
                            if (data_reduce.type.value == 'CustCred') {

                                if (data_reduce.custbody_efx_nota_cre_tipo.value) {
                                    var buscaTipoNC = search.create({
                                        type: 'customrecord_efx_fe_related_nc',
                                        filters: [
                                            ['isinactive', search.Operator.IS, 'F']
                                            , 'AND',
                                            ['custrecord_efx_fe_nc_type', search.Operator.ANYOF, data_reduce.custbody_efx_nota_cre_tipo.value]
                                        ],
                                        columns: [
                                            search.createColumn({name: 'custrecord_efx_fe_nc_type'}),
                                            search.createColumn({name: 'custrecord_efx_fe_relatedtype_nc'}),
                                            search.createColumn({name: 'custrecord_efx_fe_cfdiusage_related'}),
                                            search.createColumn({name: 'custrecord_efx_fe_payform_rel'}),
                                            search.createColumn({name: 'custrecord_efx_fe_metothpay_rel'}),
                                        ]
                                    });

                                    var ejecutar = buscaTipoNC.run();
                                    var resultado = ejecutar.getRange(0, 100);

                                    log.audit({title: 'resultado', details: resultado});

                                    if (resultado.length > 0) {
                                        var cfdiusage = resultado[0].getValue({name: 'custrecord_efx_fe_cfdiusage_related'}) || '';
                                        var formapago = resultado[0].getValue({name: 'custrecord_efx_fe_payform_rel'}) || '';
                                        var metodopago = resultado[0].getValue({name: 'custrecord_efx_fe_metothpay_rel'}) || '';

                                        var valoresCFDI = {};

                                        if (formapago) {
                                            log.audit({title: 'formapago', details: formapago});
                                            // record_tipo_cfdi.setValue({
                                            //     fieldId: 'custbody_efx_fe_forma_pago',
                                            //     value: formapago
                                            // });
                                            valoresCFDI.custbody_efx_fe_forma_pago = formapago;
                                        }

                                        if (cfdiusage) {
                                            log.audit({title: 'cfdiusage', details: cfdiusage});
                                            // record_tipo_cfdi.setValue({
                                            //     fieldId: 'custbody_mx_cfdi_usage',
                                            //     value: cfdiusage
                                            // });
                                            valoresCFDI.custbody_mx_cfdi_usage = cfdiusage;
                                        }

                                        if (metodopago) {
                                            log.audit({title: 'metodopago', details: metodopago});
                                            // record_tipo_cfdi.setValue({
                                            //     fieldId: 'custbody_efx_fe_metodo_pago',
                                            //     value: metodopago
                                            // });
                                            valoresCFDI.custbody_efx_fe_metodo_pago = metodopago;
                                        }

                                        valoresCFDI.custbody_efx_fe_autocertify = true;
                                        log.audit({title: 'valoresCFDI', details: valoresCFDI});

                                        // record.submitFields({
                                        //     type: tipo_transaccion,
                                        //     id: id,
                                        //     values: valoresCFDI,
                                        //     options: {
                                        //         enableSourcing: false,
                                        //         ignoreMandatoryFields: true
                                        //     }
                                        // });

                                        // record_tipo_cfdi.save({ignoreMandatoryFields: true, enableSourcing: false});
                                    }
                                }

                            }

                            //
                        } catch (error_ejecutaNC) {
                            log.audit({title: 'error_ejecutaNC', details: error_ejecutaNC});
                        }

                        var record_tipo_cfdi = record.load({
                            type: tipo_transaccion,
                            id: id,
                            isDynamic: true,
                        });
                        log.audit({title: 'tipo_transaccion', details: tipo_transaccion});
                        log.audit({title: 'id', details: id});
                        log.audit({title: 'segundo guardado', details: ''});

                        record_tipo_cfdi.save({enableSourcing:false, ignoreMandatoryFields:true});

                        // var record_tipo_cfdi = record.load({
                        //     type: tipo_transaccion,
                        //     id: id,
                        //     isDynamic: true,
                        // });

                        var creadoXMLT = crearXML(id, record_tipo_cfdi.type);

                        log.audit({title: 'creadoXMLT', details: creadoXMLT});
                        var xmlfinobj = JSON.parse(creadoXMLT);
                        if(xmlfinobj.success==true){
                            sendToMail(id, record_tipo_cfdi.type);
                        }

                    }

                    //certificarXML(id,record_tipo.type);
                }

            }catch(procesatimbrado){
                log.audit({title: 'procesatimbrado', details: procesatimbrado});
            }

        }


        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {

        }


        function crearXML(tranid, trantype) {
            try{
                log.audit({title:'tranid',details:tranid});
                log.audit({title:'trantype',details:trantype});
                var scheme = 'https://';
                var host = urlMod.resolveDomain({
                    hostType: urlMod.HostType.APPLICATION
                });
                log.audit({title:'HOST',details: host});
                /*var SLURL = urlMod.resolveScript({
                    scriptId: 'customscript_efx_fe_xml_generator',
                    deploymentId: 'customdeploy_efx_fe_xml_generator',
                    returnExternalUrl: true,
                    params: {
                        trantype: trantype,
                        tranid: tranid
                    }
                });*/
                var SLURL = urlMod.resolveScript({
                    deploymentId: 'customdeploy_mx_plus_serv_core_des_sl',
                    scriptId: 'customscript_mx_plus_service_core_sl',
                    returnExternalUrl: true,
                    params: {}
                });
                log.audit({title:' SERVI 👻',details:SLURL});
                const headers = {
                    // 'Content-Type': 'plain/text'
                    'Content-Type': 'aplication/json'
                };
                log.audit({title:'headers 🦀',details: headers});
                // let respons = '';
                // trantype === 'itemfulfillment'?'stamp_itemfulfillment':
                https.post.promise({
                    url: SLURL,
                    body: JSON.stringify({
                        actionMode:'stamp_invoice',
                        recordId: tranid,
                        recordType: trantype,
                        reprocessedGBL: false
                    }),
                    headers
                })
                .then(response => response.body)
                .then(res => {
                    resp = JSON.parse(res)
                    log.debug({title:'res ☠️',details:res});
                    if (resp.success == false) {
                        log.debug({title:'NO SE PUDO COMPLETAR EL TIMBRADO 💀',details:['NO SE PUDO COMPLETAR EL TIMBRADO', resp.details]});
                    } else {
                        log.debug({title:'SI SE PUDO COMPLETAR EL TIMBRADO 💀💀',details:'NO SE PUDO COMPLETAR EL TIMBRADO'});
                        generaPDF(tranid, trantype)
                        // window.location.reload();
                    }
                    return res;
                })
                .catch(reason => {
                    log.error('Reason to fail toStampGlobal', reason)
                    // console.error('Reason to fail toStampGlobal', reason)
                })
                /*var response = https.get({
                    url: SLURL,
                });
                log.audit({title:'response-code',details:response.code});
                log.audit({title:'response-body',details:response.body});*/
                // return response.body;
            }catch(err){
            log.error({title:'Error occurred in ',details:err});
            }
        }

        function generaPDF(tranid, trantype) {
            // if(typeof window != 'undefined' && window.document){
            //     window.document.querySelector('#custpage_btn_regeneraPDF').disabled = true; // id from add button call in user event script
            // }
            if (tranid == null || tranid == undefined || tranid == '' || trantype == null || trantype == undefined || trantype == '') {
                const objRcrd = currentRecord.get();
                tranid = objRcrd.id;
                trantype = objRcrd.type;
            }
            log.debug({title:'GENERANDO PDF',details:'GENERANDO PDF'});
            var url_Script = urlMod.resolveScript({
                scriptId: 'customscript_mx_plus_service_core_sl',
                deploymentId: 'customdeploy_mx_plus_serv_core_des_sl',
                params: {},
            });
            var headers = {
                "Content-Type": "application/json",
            };
            https.request
                .promise({
                    method: https.Method.POST,
                    url: url_Script,
                    body: {
                        actionMode: 'generate_pdf',
                        recordId: tranid,
                        recordType: trantype
                    },
                    headers: headers,
                })
                .then(function (response) {
                    log.debug({
                        title: "Response",
                        details: response,
                    });
                    if (response.code == 200) {
                        var bodyrespuesta = JSON.parse(response.body);
                        if (bodyrespuesta) {
                            if (bodyrespuesta.success) {
                                log.audit({title:'SE A GENERADO EL PDF',details:'SE A GENERADO EL PDF'});
                            } else {
                                log.audit({title:'NO SE A GENERADO EL PDF',details:'NO SE A GENERADO EL PDF'});
                            }
                        }
                    } else if (response.code == 500) {
                        log.audit({title:'ERROR EN CONEXION',details:'ERROR EN CONEXION'});
                    } else {
                        log.debug({title:'Ocurrio un error, verifique si el xml timbrado es correcto',details:'Ocurrio un error, verifique si el xml timbrado es correcto'});
                    }
                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: "Invalid Request: ",
                        details: reason,
                    });
                });
            return true
        }

        function certificarXML(tranid,trantype){

            log.audit({title:'tranid',details:tranid});
            log.audit({title:'trantype',details:trantype});


            var scheme = 'https://';
            var host = urlMod.resolveDomain({
                hostType: urlMod.HostType.APPLICATION
            });

            var SLURL = scheme + host + urlMod.resolveScript({
                scriptId: 'customscript_su_send_e_invoice',
                deploymentId: 'customdeploy_su_send_e_invoice',
                returnExternalUrl: false,
                params: {
                    transId: tranid,
                    transType: trantype,
                    certSendingMethodId: 5,
                }
            });

            log.audit({title:'SLURL',details:SLURL});


            var headers = {
                'Authorization': 'NLAuth nlauth_account=TSTDRV2220309, nlauth_email=jose.cruz@efficientix.com, nlauth_signature=JC12345678., nlauth_role=3',
                "Content-Type": "application/json"
            };
            var response = https.post({
                url: SLURL,
                headers: headers
            });
        }

        function relacionaNC(id,factura,uuid_factura,tiponc,tipo_relacion_tran,idrelacionada,fact_kiosko,tipo_transaccion){

            try {
                var buscarelaciones = search.create({
                    type: 'customrecord_mx_related_cfdi_subl',
                    filters: [
                        ['isinactive', search.Operator.IS, 'F']
                        , 'AND',
                        ['custrecord_mx_rcs_orig_trans', search.Operator.ANYOF, id]
                    ],
                    columns: [
                        search.createColumn({name: 'custrecord_mx_rcs_orig_trans'}),
                        search.createColumn({name: 'internalid'}),
                    ]
                });

                var ejecutar_rl = buscarelaciones.run();
                var numRelaciones = buscarelaciones.runPaged().count;
                var resultado_rl = ejecutar_rl.getRange(0, 100);

                log.audit({title: 'numRelaciones', details: numRelaciones});
                log.audit({title: 'resultado_rl', details: resultado_rl});

                if (tiponc) {
                    if (numRelaciones > 0) {
                        for (var i = 0; i < resultado_rl.length; i++) {
                            var id_relateds = resultado_rl[i].getValue({name: 'internalid'});
                            log.audit({title: 'id_relateds', details: id_relateds});
                            try {
                                var relacionBorra = record.delete({
                                    type: 'customrecord_mx_related_cfdi_subl',
                                    id: id_relateds,
                                });

                                log.audit({title: 'relacionBorra', details: relacionBorra});
                            } catch (borrarecordrelated) {
                                log.audit({title: 'borrarecordrelated', details: borrarecordrelated});
                            }

                        }
                    }
                }else{
                    if (numRelaciones > 0) {
                        var id_relateds = resultado_rl[0].getValue({name: 'internalid'});
                        log.audit({title: 'id_relateds', details: id_relateds});
                        return id_relateds;
                    }
                }
            }catch(busquedarelaciones){
                log.audit({title: 'busquedarelaciones', details: busquedarelaciones});
            }

                if (tiponc) {
                    var buscaTipoNC = search.create({
                        type: 'customrecord_efx_fe_related_nc',
                        filters: [
                            ['isinactive', search.Operator.IS, 'F']
                            , 'AND',
                            ['custrecord_efx_fe_nc_type', search.Operator.ANYOF, tiponc]
                        ],
                        columns: [
                            search.createColumn({name: 'custrecord_efx_fe_nc_type'}),
                            search.createColumn({name: 'custrecord_efx_fe_relatedtype_nc'}),
                            search.createColumn({name: 'custrecord_efx_fe_cfdiusage_related'}),
                            search.createColumn({name: 'custrecord_efx_fe_payform_rel'}),
                            search.createColumn({name: 'custrecord_efx_fe_metothpay_rel'}),
                        ]
                    });

                    var ejecutar = buscaTipoNC.run();
                    var resultado = ejecutar.getRange(0, 100);

                    log.audit({title: 'resultado', details: resultado});

                    var typoNCrel = resultado[0].getValue({name: 'custrecord_efx_fe_relatedtype_nc'});

                    if (typoNCrel) {
                        var related_cfdi = record.create({
                            type: 'customrecord_mx_related_cfdi_subl',
                            isDynamic: true
                        });

                        related_cfdi.setValue({
                            fieldId: 'custrecord_mx_rcs_rel_type',
                            value: typoNCrel
                        });

                        related_cfdi.setValue({
                            fieldId: 'custrecord_mx_rcs_orig_trans',
                            value: id
                        });

                        var factGBLrelated = '';
                        var desglosaieps = false;

                        if(tipo_relacion_tran=='CustInvc'){
                            if(fact_kiosko){
                            var lookupfact = search.lookupFields({
                                type : search.Type.INVOICE,
                                columns : ['internalid','custbody_mx_cfdi_uuid','custbody_efx_fe_gbl_related','custbody_efx_fe_desglosaieps'],
                                id : fact_kiosko,
                            });
                            log.audit({title: 'lookupfact', details: lookupfact});

                            var idfactKiosko = lookupfact['internalid'][0].value;
                            var uuidfactKiosko = lookupfact['custbody_mx_cfdi_uuid'];
                            factGBLrelated = lookupfact['custbody_efx_fe_gbl_related'][0].value;
                            desglosaieps = lookupfact['custbody_efx_fe_desglosaieps'];


                                related_cfdi.setValue({
                                    fieldId: 'custrecord_mx_rcs_rel_cfdi',
                                    value: idfactKiosko
                                });

                                related_cfdi.setValue({
                                    fieldId: 'custrecord_mx_rcs_uuid',
                                    value: uuidfactKiosko
                                });
                            }else {

                                var lookupfact = search.lookupFields({
                                    type : search.Type.INVOICE,
                                    columns : ['internalid','custbody_mx_cfdi_uuid','custbody_efx_fe_gbl_related','custbody_efx_fe_desglosaieps'],
                                    id : idrelacionada,
                                });

                                factGBLrelated = lookupfact['custbody_efx_fe_gbl_related'][0].value;
                                desglosaieps = lookupfact['custbody_efx_fe_desglosaieps'];

                                related_cfdi.setValue({
                                    fieldId: 'custrecord_mx_rcs_rel_cfdi',
                                    value: factura
                                });

                                related_cfdi.setValue({
                                    fieldId: 'custrecord_mx_rcs_uuid',
                                    value: uuid_factura
                                });
                            }

                            log.audit({title:'factGBLrelated',details:factGBLrelated});
                            log.audit({title:'desglosaieps',details:desglosaieps});
                            if(factGBLrelated){
                                record.submitFields({
                                    type: tipo_transaccion,
                                    id: id,
                                    values:{custbody_efx_fe_desglosaieps:true},
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields : true
                                    }
                                });
                            }else{
                                if(desglosaieps){
                                    record.submitFields({
                                        type: tipo_transaccion,
                                        id: id,
                                        values:{custbody_efx_fe_desglosaieps:desglosaieps},
                                        options: {
                                            enableSourcing: false,
                                            ignoreMandatoryFields : true
                                        }
                                    });
                                }
                            }


                        }else{
                            var objRelacionada = buscaTranRelated(idrelacionada,tipo_relacion_tran,factGBLrelated,id,tipo_transaccion);
                            log.audit({title:'objRelacionada',details:objRelacionada});

                            related_cfdi.setValue({
                                fieldId: 'custrecord_mx_rcs_rel_cfdi',
                                value: objRelacionada.id
                            });

                            related_cfdi.setValue({
                                fieldId: 'custrecord_mx_rcs_uuid',
                                value: objRelacionada.uuid
                            });
                        }


                        var id_related = related_cfdi.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });

                        return id_related;
                    }
                }

        }

        function buscaTranRelated(idrelacionada,tipo_relacion_tran,factGBLrelated,id,tipo_transaccion){

            if(tipo_relacion_tran=='RtnAuth'){
                tipo_relacion_tran = search.Type.RETURN_AUTHORIZATION;
            }

            log.audit({title: 'idrelacionada', details: idrelacionada});
            log.audit({title: 'tipo_relacion_tran', details: tipo_relacion_tran});

            var lookupdevo = search.lookupFields({
                type : tipo_relacion_tran,
                columns : ['createdfrom'],
                id : idrelacionada,
            });
            log.audit({title: 'lookupdevo', details: lookupdevo});


            var idcashsale = lookupdevo['createdfrom'][0].value;

            var lookupcash = search.lookupFields({
                type : search.Type.CASH_SALE,
                columns : ['custbody_efx_fe_invoice_related','internalid','custbody_mx_cfdi_uuid','custbody_efx_fe_gbl_related','custbody_efx_fe_desglosaieps'],
                id : idcashsale,
            });
            log.audit({title: 'lookupcash', details: lookupcash});
            try{
                var idfactKiosko = lookupcash['custbody_efx_fe_invoice_related'][0].value;
            }catch(error_cashsale){
                log.error({title: 'error_cashsale', details: error_cashsale});
                var lookupcash = search.lookupFields({
                    type : search.Type.INVOICE,
                    columns : ['custbody_efx_fe_invoice_related','internalid','custbody_mx_cfdi_uuid','custbody_efx_fe_gbl_related','custbody_efx_fe_desglosaieps'],
                    id : idcashsale,
                });
                log.audit({title: 'lookupcash', details: lookupcash});
                var idfactKiosko = lookupcash['custbody_efx_fe_invoice_related'][0].value;
            }
            

            
            var desglosaieps = false;

            if(idfactKiosko) {
                var lookfactKiosko = search.lookupFields({
                    type: search.Type.INVOICE,
                    columns: ['internalid', 'custbody_mx_cfdi_uuid','custbody_efx_fe_gbl_related','custbody_efx_fe_desglosaieps'],
                    id: idfactKiosko,
                });
                log.audit({title: 'lookfactKiosko', details: lookfactKiosko});

                var idfacturakiosko = lookfactKiosko['internalid'][0].value;
                var uuidkiosko = lookfactKiosko['custbody_mx_cfdi_uuid'];
                factGBLrelated = lookfactKiosko['custbody_efx_fe_gbl_related'][0].value;
                desglosaieps = lookfactKiosko['custbody_efx_fe_desglosaieps'];

                var objcash = {
                    id: '',
                    uuid: '',
                    global:'',
                    desglosaieps:''
                }

                objcash.id = idfacturakiosko;
                objcash.uuid = uuidkiosko;
                objcash.global = factGBLrelated;
                objcash.desglosaieps = desglosaieps;
            }else{
                var idfacturakiosko = lookupcash['internalid'][0].value;
                var uuidkiosko = lookupcash['custbody_mx_cfdi_uuid'];
                factGBLrelated = lookupcash['custbody_efx_fe_gbl_related'][0].value;
                desglosaieps = lookupcash['custbody_efx_fe_desglosaieps'];

                var objcash = {
                    id: '',
                    uuid: '',
                    global:'',
                    desglosaieps:''
                }

                objcash.id = idfacturakiosko;
                objcash.uuid = uuidkiosko;
                objcash.global = factGBLrelated;
                objcash.desglosaieps = desglosaieps;
            }

            log.audit({title:'factGBLrelated',details:factGBLrelated});
            log.audit({title:'desglosaieps',details:desglosaieps});
            if(factGBLrelated){
                record.submitFields({
                    type: tipo_transaccion,
                    id: id,
                    values:{custbody_efx_fe_desglosaieps:true},
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });
            }else{
                if(desglosaieps){
                    record.submitFields({
                        type: tipo_transaccion,
                        id: id,
                        values:{custbody_efx_fe_desglosaieps:desglosaieps},
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields : true
                        }
                    });
                }
            }

            return objcash;


        }

        function sendToMail(tranid,trantype){
            // var scheme = 'https://';
            // var host = urlMod.resolveDomain({
            //     hostType: urlMod.HostType.APPLICATION
            // });

            try{
                log.audit({title:'tranid',details:tranid});
                log.audit({title:'trantype',details:trantype});
                var SLURL = urlMod.resolveScript({
                    scriptId: 'customscript_efx_fe_mail_sender_sl',
                    deploymentId: 'customdeploy_efx_fe_mail_sender_sl',
                    returnExternalUrl: true,
                    params: {
                        trantype: trantype,
                        tranid: tranid
                    }
                });


                log.audit({title:'SLURL',details:SLURL});

                var response = https.get({
                    url: SLURL,
                });

                log.audit({title:'response-code_mail',details:response.code});
                log.audit({title:'response-body_mail',details:response.body});

                return response;

            }catch(errormail){
                log.error({title:'errormail',details:errormail});
            }

        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });
