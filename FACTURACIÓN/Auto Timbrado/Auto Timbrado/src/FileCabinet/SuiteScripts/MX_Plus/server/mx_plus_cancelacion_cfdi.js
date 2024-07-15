/**
 * @NApiVersion 2.1
 */
define(['N/file', 'N/record', 'N/https', 'N/log', 'N/search', 'N/query', '../lib/access_pac', '../lib/functions_gbl', '../CFDI_CANCELACION/Lib/cfdi_cancelacion_constants'],
    /**
 * @param{log} log
 */
    (file, record, https, log, search, query, access_pac, functions_gbl, cfdi_cancelacion_constants) => {
        const getEmisorRFC = (idSubsidiary) => {
            try {
                const subsidiarySearchFilters = [
                    ['isinactive', search.Operator.IS, 'F'],
                    'AND',
                    ['internalid', search.Operator.IS, idSubsidiary],
                ];

                const subsidiarySearchColNmeroDeRegistroFiscal = search.createColumn({ name: 'taxregistrationnumber' });

                const subsidiarySearch = search.create({
                    type: 'subsidiary',
                    filters: subsidiarySearchFilters,
                    columns: [

                        subsidiarySearchColNmeroDeRegistroFiscal,
                    ],
                });
                let data2Return = ''
                const subsidiarySearchPagedData = subsidiarySearch.runPaged({ pageSize: 2 });
                for (let i = 0; i < subsidiarySearchPagedData.pageRanges.length; i++) {
                    const subsidiarySearchPage = subsidiarySearchPagedData.fetch({ index: i });
                    subsidiarySearchPage.data.forEach((result) => {

                        data2Return = result.getValue(subsidiarySearchColNmeroDeRegistroFiscal);
                    });
                }
                return data2Return

            } catch (err) {
                log.emergency({ title: 'Error occurred in getEmisorRFC', details: err });
                let registroCompania = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: idSubsidiary,
                });
                data2Return = registroCompania.getValue('federalidnumber');
                log.debug({ title: 'data2Return getEmisorRFC', details: data2Return });
                return data2Return
            }
        }
        const authenticationCredentials = (record_trans) => {
            const isOW = functions_gbl.checkOWAccount()
            const emisor = isOW ? functions_gbl.getSubsidiaryInformation(record_trans.getValue({ fieldId: 'subsidiary' })) : functions_gbl.getCompanyInformation()
            const { MX_PLUS_CONFIG } = functions_gbl
            const allConfig = functions_gbl.getConfig()
            let services;
            if (allConfig[MX_PLUS_CONFIG.FIELDS.TEST_MODE] == true) {
                services = access_pac.testURL.services
            } else {
                services = access_pac.prodURL.services
            }
            let email = isOW ? emisor[functions_gbl.SUBSIDIARY.FIELDS.EMAIL] : emisor[functions_gbl.COMPANY.FIELDS.EMAIL]

            let authentication_data = {
                url: services,
                user_email: email,
                user_password: access_pac.pwd
            }
            return authentication_data;
        }
        const consulData = (ID, TYPE, MOTCANCEL, UUIDREL) => {
            try {
                // fac prueba INV10006426 y INV10006430
                let fielsColums = { RFC: 'federalidnumber', EMAIL: 'custrecord_mxplus_pac_email' }
                let data_to_return = {
                    success: false,
                    msg: ''
                }
                let data = []
                log.audit({ title: 'OBTENCION DE DATOS', details: data });
                const isOW = functions_gbl.checkOWAccount();
                let subsidiary_id = 0;
                let obj_search = search.lookupFields({
                    type: TYPE,
                    id: ID,
                    columns: ['custbody_mx_cfdi_uuid']
                });

                // Coloca el Campo de Email en Query
                // let scriptSQL = `SELECT ${fielsColums.RFC}, ${fielsColums.EMAIL} FROM subsidiary WHERE id = ${subsidiary_id}`
                // const results = query.runSuiteQL(scriptSQL)
                // results.results.forEach(result => {
                //     log.audit({ title: 'result', details: result })
                //     const line = {}
                //     Object.values(fielsColums).forEach((field, i) => {
                //         line[field] = result.values[i]
                //     })
                //     data.push(line)
                // })
                let searchId = ''
                if (UUIDREL.length > 0) {
                    let typeRecordStr = '';
                    switch (TYPE) {
                        case 'invoice': typeRecordStr = 'CustInvc'; break;
                        case 'customerpayment': typeRecordStr = 'CustPymt'; break;
                        case 'creditmemo': typeRecordStr = 'CustCred'; break;
                        case 'cashsale': typeRecordStr = 'CashSale'; break;
                    }
                    searchId = buscaID(typeRecordStr, UUIDREL, TYPE)
                    log.audit({
                        title: 'id factura',
                        details: searchId
                    })
                }
                let services, apis
                const allConfig = functions_gbl.getConfig()
                log.audit({ title: 'allConfig', details: allConfig });
                if (allConfig.custrecord_mxplus_config_test_mode == true) {
                    services = access_pac.testURL.services
                    apis = access_pac.testURL.apis
                } else {
                    services = access_pac.prodURL.services
                    apis = access_pac.prodURL.apis
                }
                // Se asigna el Token
                let rcrd_obj=record.load({ type: TYPE, id: ID });
                let authCred=authenticationCredentials(rcrd_obj);
                let token = access_pac.getTokenAccess(access_pac.resolveURL(services, access_pac.accessPoints.authentication), authCred.user_email)
                log.audit({ title: 'token', details: token.data.token });
                // get the RFC
                let rfc=''
                log.debug({title:'isOW',details:isOW});
                if(isOW && isOW == true){
                    log.debug({title:'si es OW',details:'true'});
                    rfc=getEmisorRFC(rcrd_obj.getValue({ fieldId: 'subsidiary' }));
                }else{
                    log.debug({title:'No es OW',details:'true'});
                    rfc=functions_gbl.getCompanyInformation()
                    log.debug({title:'rfc',details:rfc});
                    rfc=rfc.employerid
                }
                log.audit({ title: 'data', details: rfc });
                // se hace el objeto para cancelar en SW
                let acces_point = access_pac.accessPoints.cancel_cfdi
                if (UUIDREL) {
                    var metod = services + acces_point + rfc + '/' + obj_search.custbody_mx_cfdi_uuid + '/' + MOTCANCEL + '/' + UUIDREL
                } else {
                    var metod = services + acces_point + rfc + '/' + obj_search.custbody_mx_cfdi_uuid + '/' + MOTCANCEL
                }
                //TODO: Hacer condicición para cuando se tiene un folio de sustitución.
                log.audit({ title: 'metod', details: metod });
                try {
                    var headers = {
                        "Authorization": "Bearer " + token.data.token
                    };
                    var response_stamp = https.post({
                        url: metod,
                        headers: headers
                    });
                    if (response_stamp.code == 200) {
                        let json_responseSW = JSON.parse(response_stamp.body)
                        log.audit({ title: 'response_stamp.body', details: JSON.parse(response_stamp.body) });
                        let status = (JSON.parse(response_stamp.body)).status
                        log.audit({ title: 'status', details: status });
                        if (status == 'success') {
                            saveCancel(response_stamp.body, MOTCANCEL, searchId, TYPE, ID, status)
                            data_to_return.success = true;
                            data_to_return.msg = 'Se ha cancelado su CFDI con éxito.'
                        } else {

                            saveCancel(response_stamp.body, MOTCANCEL, searchId, TYPE, ID, status)
                            data_to_return.success = false;
                            data_to_return.msg = 'Error al cancelar el cfdi:' + json_responseSW.message + ' - ' + json_responseSW.messageDetail
                        }
                    } else {
                        if (response_stamp.body) {
                            let json_responseSW = JSON.parse(response_stamp.body)
                            log.debug({ title: 'response_stamp', details: response_stamp });
                            let str_error = ''
                            if (json_responseSW.message) { str_error += json_responseSW.message + ' ' }
                            if (json_responseSW.messageDetail) { str_error += json_responseSW.messageDetail + ' ' }
                            data_to_return.success = false;
                            data_to_return.msg = 'Ocurrió un error en cancelación:' + str_error;

                        } else {
                            data_to_return.success = false;
                            data_to_return.msg = 'Ocurrió un error en cancelación. Favor de intentar más tarde';

                        }
                    }
                } catch (err) {
                    data_to_return.success = false;
                    data_to_return.msg = 'Ocurrió un error en cancelación:' + err;
                    log.error({ title: 'Error occurred in CANCELLATION', details: err });
                }
                return data_to_return
                // return data
            } catch (err) {
                log.error({ title: 'Error occurred in ', details: err });
            }
        }
        // Hacer para todo tipo de transaccion
        function buscaID(Type, uuidRela, recordType) {
            let idToReturn = ''
            log.audit({ title: 'BUSQUEDA', details: Type });
            log.audit({ title: 'BUSQUEDA', details: uuidRela });
            log.audit({ title: 'BUSQUEDA', details: recordType });
            const invoiceSearchFilters = [
                ['type', search.Operator.ANYOF, Type],
                'AND',
                ['mainline', search.Operator.IS, 'T'],
                'AND',
                ['custbody_mx_cfdi_uuid', search.Operator.STARTSWITH, uuidRela],
            ];
            log.audit({ title: 'invoiceSearchFilters', details: invoiceSearchFilters });
            log.audit({ title: 'typeof invoiceSearchFilters', details: typeof invoiceSearchFilters });
            const invoiceSearchColInternalId = search.createColumn({ name: 'internalid' });
            const invoiceSearch = search.create({
                type: recordType,
                filters: invoiceSearchFilters,
                columns: [
                    invoiceSearchColInternalId,
                ],
            });
            const invoiceSearchPagedData = invoiceSearch.runPaged({ pageSize: 1 });
            for (let i = 0; i < invoiceSearchPagedData.pageRanges.length; i++) {
                const invoiceSearchPage = invoiceSearchPagedData.fetch({ index: i });
                invoiceSearchPage.data.forEach((result) => {
                    const internalId = result.getValue(invoiceSearchColInternalId);
                    idToReturn = internalId
                });
            }
            return idToReturn
        }
        function saveCancel(body, MOTCANCEL, idSusti, Type, Id, isSuccess) {
            let searFile = functions_gbl.getFolderTimb()
            try {
                var motiText
                var jsonBody = JSON.parse(body)
                let fileObj = file.create({
                    name: 'ACUSE_CANCELACION_' + Id + '.xml',
                    fileType: file.Type.PLAINTEXT,
                    contents: jsonBody.data.acuse,
                    encoding: file.Encoding.UTF8,
                    folder: searFile,
                    isOnline: true
                });
                let id_file = fileObj.save();
                const { OPTCANCEL } = cfdi_cancelacion_constants;
                motiText = OPTCANCEL[MOTCANCEL]
                let obj_datatostore = {
                    custbody_mxplus_acuse_cancel: isSuccess == 'success' ? id_file : '',
                    custbody_efx_fe_cfdi_cancelled: isSuccess == 'success' ? true : false,
                    custbody_efx_fe_cancelreason: isSuccess == 'success' ? motiText : 'Error al cancelar',
                    custbody_efx_fe_sustitucion: ''
                }
                if (idSusti.length > 0) {
                    obj_datatostore.custbody_efx_fe_sustitucion = isSuccess == 'success' ? idSusti : '';
                } else {
                    delete obj_datatostore.custbody_efx_fe_sustitucion;
                }
                log.audit({
                    title: 'obj_saveCancel',
                    details: obj_datatostore
                })
                record.submitFields({
                    type: Type,
                    id: Id,
                    values: obj_datatostore,
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });
                log.audit({
                    title: 'SE GUARDO LA INFORMACIÓN', details: id_file
                })
            } catch (err) {
                log.error({ title: 'Error occurred in saveCancel', details: err });
            }
        }
        // const getConfig = () => {
        //     let data = { }
        //     try {
        //         const obj_Search = search.create({
        //             type: 'custrecord_mxplus_config_rcd_config',
        //             filters: [['isinactive', search.Operator.IS, 'F']],
        //             columns: [{name: 'custrecord_mxplus_config_test_mode' }]
        //         })
        //         obj_Search.run().getRange({
        //             start: 0,
        //             end: 1
        //         }).forEach(result => {
        //             Object.values(obj_Search.columns).forEach(column => {
        //                 data[column.name] = result.getValue(column)
        //             })
        //         })
        //     } catch (err) {
        //         log.error({title: 'Error occurred in getConfig ', details: err });
        //     }
        //     return data
        // }
        // const getConnectionToken = (url_service, email) => {
        //     try {
        //         log.debug('getConnectionToken ~ email:', email)
        //         log.debug('getConnectionToken ~ url_service:', url_service)
        //         const req = https.request({
        //             method: https.Method.POST,
        //             url: `${url_service}${access_pac.accessPoints.authentication}`,
        //             body: { },
        //             headers: {user: email, password: access_pac.pwd }
        //         })
        //         return req.body ? JSON.parse(req.body) : req.body
        //     } catch (error) {
        //         log.error('Error on getConnectionToken', error)
        //     }
        // }
        return { consulData }

    });