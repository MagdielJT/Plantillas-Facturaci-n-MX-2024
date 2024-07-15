/**
 * @NApiVersion 2.x
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
            var scriptObj = runtime.getCurrentScript();
            var idbusqueda = scriptObj.getParameter({ name: 'custscript_efx_fe_autotimbrado_bg' });
            try {
                /* var busqueda_facturas = search.create({
                     type: search.Type.INVOICE,
                     filters: [
                         ['custbody_psg_ei_status', search.Operator.IS, 19]
                         , 'and',
                         ['custbody_psg_ei_content', search.Operator.ISNOTEMPTY,'']
                         , 'and',
                         ['internalid', search.Operator.IS, '7784']
                         // ,'and',
                         // ['trandate',search.Operator.ONORBEFORE,'tendaysago']
                     ],
                     columns: [
                         search.createColumn({name: 'internalid'}),
                         search.createColumn({name: 'custbody_psg_ei_content'}),
                         search.createColumn({name: 'custbody_psg_ei_generated_edoc'}),

                     ]
                 });*/
                var busqueda_facturas = search.load({ id: idbusqueda });


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

            log.audit({title:'reduce-context',details:context});
            var data_reduce = JSON.parse(context.values[0]);
            var id = JSON.parse(context.key);

            log.audit({title:'data_reduce',details:data_reduce});
            log.audit({title:'id',details:id});

            log.audit({title:'data_reduce.custbody_psg_ei_content',details:data_reduce.custbody_psg_ei_content});
            log.audit({title:'data_reduce.type',details:data_reduce.type});

            var tipo_transaccion = '';
            var entidad = '';
            if(data_reduce.type.value=='CustInvc'){
                tipo_transaccion = record.Type.INVOICE;

            }
            if(data_reduce.type.value=='CustPymt'){
                tipo_transaccion = record.Type.CUSTOMER_PAYMENT;

            }

            var record_tipo = record.load({
                type: tipo_transaccion,
                id: id,
                isDynamic: true,
            });



            crearXML(id,record_tipo.type);

            //certificarXML(id,record_tipo.type);


        }


        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {

        }


        function crearXML(tranid,trantype){
            log.audit({title:'tranid',details:tranid});
            log.audit({title:'trantype',details:trantype});

            var scheme = 'https://';
            var host = urlMod.resolveDomain({
                hostType: urlMod.HostType.APPLICATION
            });


            var SLURL = urlMod.resolveScript({
                scriptId: 'customscript_efx_fe_xml_generator',
                deploymentId: 'customdeploy_efx_fe_xml_generator',
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
            log.audit({title:'response-code',details:response.code});
            log.audit({title:'response-body',details:response.body});

            return response.body;

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


        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });
