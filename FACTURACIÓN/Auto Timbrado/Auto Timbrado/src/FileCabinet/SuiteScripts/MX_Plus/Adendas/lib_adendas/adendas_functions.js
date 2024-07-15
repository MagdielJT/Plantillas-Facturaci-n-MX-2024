/**
 * @NApiVersion 2.1
 */
define(['N/log', 'N/file', 'N/record', 'N/render', 'N/search', 'N/runtime', '../../Factura de Venta/lib/_mxplus_invoice_functions', 'N/format'],
    /**
 * @param{log} log
 */
    (log, file, record, render, search, runtime, invoiceFunctions, format) => {
        const getAdenda = (adendaId) => {
            var data_to_return = {
                success: false,
                msg: '',
                idFileOfAdenda: '',
                nameOfAdenda: ''
            }
            try {
                if (!adendaId) {
                    data_to_return.success = false;
                    data_to_return.msg = 'Cliente sin adenda, favor de configurar el campo de "Adenda" en el registro de su cliente';
                    return data_to_return
                }
                const customrecordEfxFeAdendizadorSearchFilters = [
                    ['internalid', search.Operator.ANYOF, adendaId],
                ];

                const customrecordEfxFeAdendizadorSearchColName = search.createColumn({ name: 'name', sort: search.Sort.ASC });
                const customrecordEfxFeAdendizadorSearchColArchivoDeAdendaPersonalizada = search.createColumn({ name: 'custrecord_mx_plus_doc_adendizador' });

                const customrecordEfxFeAdendizadorSearch = search.create({
                    type: 'customrecord_efx_fe_adendizador',
                    filters: customrecordEfxFeAdendizadorSearchFilters,
                    columns: [
                        customrecordEfxFeAdendizadorSearchColName,
                        customrecordEfxFeAdendizadorSearchColArchivoDeAdendaPersonalizada,
                    ],
                });

                const customrecordEfxFeAdendizadorSearchPagedData = customrecordEfxFeAdendizadorSearch.runPaged({ pageSize: 1000 });
                if (customrecordEfxFeAdendizadorSearchPagedData.pageRanges.length == 0) {
                    data_to_return.success = false;
                    data_to_return.msg = 'Adenda no encontrada. Favor de configurar correctamente';

                }
                for (let i = 0; i < customrecordEfxFeAdendizadorSearchPagedData.pageRanges.length; i++) {
                    const customrecordEfxFeAdendizadorSearchPage = customrecordEfxFeAdendizadorSearchPagedData.fetch({ index: i });
                    customrecordEfxFeAdendizadorSearchPage.data.forEach((result) => {
                        const name = result.getValue(customrecordEfxFeAdendizadorSearchColName);
                        const archivoDeAdendaPersonalizada = result.getValue(customrecordEfxFeAdendizadorSearchColArchivoDeAdendaPersonalizada);
                        data_to_return.success = true;
                        data_to_return.idFileOfAdenda = archivoDeAdendaPersonalizada;
                        data_to_return.nameOfAdenda = name;
                    });
                }


            } catch (err) {
                log.error({ title: 'Error occurred in getAdenda', details: err });
            }
            return data_to_return
        }
        const obtenerObjetoDirecciones = (recordObjrecord, cliente_obj) => {
            try {
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
            } catch (err) {
                log.error({ title: 'Error occurred in obtenerObjetoDirecciones', details: err });
            }
        }
        function getTransactionField(objTransaction) {
            var respuesta = {
                succes: false,
                data: {
                    bodyFieldValue: {},
                    bodyFieldText: {},
                    lineField: {},
                }
            };
            log.audit({ title: 'objTransaction', details: JSON.stringify(objTransaction) });
            try {

                var transactionLoad = record.load({
                    id: objTransaction.id,
                    type: objTransaction.type,
                });
                var objValueField = {};
                var objTextField = {};
                var objLineField = {};


                if (objTransaction.bodyFieldValue) {

                    for (var bfv = 0; bfv < objTransaction.bodyFieldValue.length; bfv++) {
                        log.audit({
                            title: 'objTransaction.bodyFieldValue[bfv]',
                            details: JSON.stringify(objTransaction.bodyFieldValue[bfv])
                        });
                        objValueField[objTransaction.bodyFieldValue[bfv]] = transactionLoad.getValue({ fieldId: objTransaction.bodyFieldValue[bfv] }) || '';
                    }
                }

                if (objTransaction.bodyFieldText) {
                    for (var vft = 0; vft < objTransaction.bodyFieldText.length; vft++) {
                        log.audit({
                            title: 'objTransaction.bodyFieldText[vft]',
                            details: JSON.stringify(objTransaction.bodyFieldText[vft])
                        });
                        objTextField[objTransaction.bodyFieldText[vft]] = transactionLoad.getText({ fieldId: objTransaction.bodyFieldText[vft] }) || '';
                    }
                }

                if (objTransaction.sublist && objTransaction.lineField) {
                    var numeroLineas = transactionLoad.getLineCount({ sublistId: objTransaction.sublist });
                    for (var renglon = 0; renglon < numeroLineas; renglon++) {
                        var objRenglonAux = {};
                        for (var slf = 0; slf < objTransaction.lineField.length; slf++) {
                            log.audit({
                                title: 'sublista ' + objTransaction.sublist,
                                details: 'renglon: ' + renglon + ' campo: ' + objTransaction.lineField[slf]
                            });
                            var isText = false;
                            var dValue = objTransaction.lineField[slf];
                            if (dValue.indexOf('TEXT') != -1) {
                                isText = true;
                                dValue = dValue.replace(/TEXT/g, '');
                            }

                            var currentValue = '';
                            if (isText) {
                                currentValue = transactionLoad.getSublistText({
                                    sublistId: objTransaction.sublist,
                                    fieldId: dValue,
                                    line: renglon
                                }) || '';
                            } else {
                                currentValue = transactionLoad.getSublistValue({
                                    sublistId: objTransaction.sublist,
                                    fieldId: dValue,
                                    line: renglon
                                }) || '';
                            }
                            log.audit({ title: 'currentValue', details: JSON.stringify(currentValue) });
                            objRenglonAux[objTransaction.lineField[slf]] = currentValue;
                        }
                        objLineField[renglon] = objRenglonAux;
                    }
                }
                respuesta.data.bodyFieldValue = objValueField;
                respuesta.data.bodyFieldText = objTextField;
                respuesta.data.lineField = objLineField;
                respuesta.succes = true;

            } catch (error) {
                log.error({ title: 'error getTransactionField', details: JSON.stringify(error) });
                respuesta.succes = false;
            }
            log.audit({ title: 'respuesta getTransactionField', details: JSON.stringify(respuesta) });
            return respuesta;
        }
        function getTaxDetails(TranId, TranType) {
            try {
                let ArrTaxDetails = [];
                let getTaxDetails = record.load({
                    id: TranId,
                    type: TranType
                });
                let lineNum = getTaxDetails.getLineCount({ sublistId: 'taxdetails' });
                log.audit({ title: 'lineNum 👽', details: lineNum });
                for (let i = 0; i < lineNum; i++) {
                    let objTaxDetails = {};
                    let getTaxCode = getTaxDetails.getSublistValue({
                        sublistId: 'taxdetails',
                        fieldId: 'taxrate',
                        line: i
                    });
                    objTaxDetails.taxType = getTaxCode;
                    ArrTaxDetails.push(objTaxDetails);
                }
                return ArrTaxDetails;
            }catch(err){
            log.error({title:'Error occurred in getTaxDetails',details:err});
            }
        }
        function getDataSabritas(param_id, param_type) {
            var respuesta = {
                succes: false,
                data: {
                    tipo: '',
                    idPedido: '',
                    tipoDoc: '1',
                    idProveedor: '',
                    recepcion: []

                }
            };
            try {
                var arrayColumn = [
                    'custbody_efx_sabritas_tipo',
                    'custbody_efx_sabritas_pedido',
                    'customer.custentity_efx_sabritas_proveedor',
                    'custbody_efx_sabritas_recepcion'
                ];

                var LookupField = search.lookupFields({
                    type: search.Type.TRANSACTION,
                    id: param_id,
                    columns: arrayColumn
                });

                log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) });


                respuesta.data.tipo = LookupField['custbody_efx_sabritas_tipo'] || '';
                respuesta.data.idPedido = LookupField['custbody_efx_sabritas_pedido'] || '';
                respuesta.data.idProveedor = LookupField['customer.custentity_efx_sabritas_proveedor'] || '';


                var objParametro = {
                    id: param_id,
                    type: param_type,
                    sublist: 'item',
                    bodyFieldValue: [],
                    bodyFieldText: [],
                    lineField: [
                        'itemtype',
                        'item',
                        'units',
                        // 'itemTEXT',
                        'quantity',
                        'rate',
                        'amount',
                        'grossamt',
                        'description',
                        'custcol_efx_fe_unidad_medida_sat'
                    ],
                };
                var idNameItemTex = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_id_name_item' }) || '';
                log.audit({ title: 'idNameItemTex', details: JSON.stringify(idNameItemTex) });
                var idName = '';
                if (idNameItemTex) {
                    idName = idNameItemTex;
                } else {
                    idName = 'itemTEXT';
                }
                log.audit({ title: 'idName', details: JSON.stringify(idName) });
                objParametro.lineField.push(idName);

                var transactionField = getTransactionField(objParametro);
                if (transactionField.succes) {
                    var unidadesMed = new Array();

                    for (var ir in transactionField.data.lineField) {
                        if (transactionField.data.lineField[ir].units) {
                            unidadesMed.push(transactionField.data.lineField[ir].units);
                        }
                    }

                    if (unidadesMed.length > 0) {

                        var filtrounits = new Array();
                        var arrayunitsat = new Array();
                        var arrayLinea = new Array();
                        var clavesprod = new Array();

                        var count = 0;
                        for (var i = 0; i < unidadesMed.length; i++) {
                            count++;
                            filtrounits.push(['custrecord_mx_mapper_keyvalue_subkey', search.Operator.IS, unidadesMed[i]]);
                            if (count < unidadesMed.length) {
                                filtrounits.push('OR');

                            }
                        }
                        log.audit({ title: 'filtrounits', details: filtrounits });

                        log.audit({ title: 'unidadesMed', details: unidadesMed });

                        for (var ir in transactionField.data.lineField) {
                            if (transactionField.data.lineField[ir].units) {
                                var unitsLine = transactionField.data.lineField[ir].units;
                                var objitems = {
                                    claveprodserv: '',
                                    claveunidad: '',
                                    claveunidadNetsuite: '',
                                }
                                objitems.claveunidadNetsuite = unitsLine;
                                arrayLinea.push(objitems);

                            }
                        }

                        log.audit({ title: 'arrayLinea', details: arrayLinea });
                        log.audit({ title: 'unidadesMed', details: unidadesMed });


                        log.audit({ title: 'filtrounits', details: filtrounits });
                        var buscamapeo = search.create({
                            type: 'customrecord_mx_mapper_keyvalue',
                            filters: [
                                ['isinactive', search.Operator.IS, 'F']
                                , 'AND',
                                ['custrecord_mx_mapper_keyvalue_category', search.Operator.ANYOF, 10]
                                , 'AND',
                                filtrounits
                            ],
                            columns: [
                                search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_category' }),
                                search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_value' }),
                                search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_key' }),
                                search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_inputvalue' }),
                                search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_rectype' }),
                                search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_subkey' }),
                                search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_subrectype' }),
                                search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_sublst_id' }),

                            ]
                        });

                        buscamapeo.run().each(function (result) {
                            var unidadesobj = {
                                idnetsuite: '',
                                idmex: '',
                                text: '',
                            }
                            unidadesobj.idnetsuite = result.getValue({ name: 'custrecord_mx_mapper_keyvalue_subkey' });
                            unidadesobj.idmex = result.getValue({ name: 'custrecord_mx_mapper_keyvalue_value' });
                            arrayunitsat.push(unidadesobj);
                            return true;
                        });
                        log.audit({ title: 'arrayunitsat', details: arrayunitsat });

                        var buscaUnits = search.create({
                            type: 'customrecord_mx_mapper_values',
                            filters: [
                                ['isinactive', search.Operator.IS, 'F']
                                , 'AND',
                                ['custrecord_mx_mapper_value_category', search.Operator.ANYOF, 10]
                            ],
                            columns: [
                                search.createColumn({ name: 'custrecord_mx_mapper_value_category' }),
                                search.createColumn({ name: 'custrecord_mx_mapper_value_inreport' }),
                                search.createColumn({ name: 'custrecord_mx_mapper_value_isdefault' }),
                                search.createColumn({ name: 'internalid' }),

                            ]
                        });

                        for (var x = 0; x < arrayunitsat.length; x++) {
                            buscaUnits.run().each(function (result) {
                                var idmapeo = result.getValue({ name: 'internalid' });
                                if (idmapeo == arrayunitsat[x].idmex) {
                                    arrayunitsat[x].text = result.getValue({ name: 'custrecord_mx_mapper_value_inreport' });
                                }
                                return true;
                            });
                        }

                        for (var i = 0; i < arrayLinea.length; i++) {
                            for (var x = 0; x < arrayunitsat.length; x++) {
                                if (arrayLinea[i].claveunidadNetsuite == arrayunitsat[x].idnetsuite) {
                                    arrayLinea[i].claveunidad = arrayunitsat[x].text;
                                }
                            }
                        }

                        log.audit({ title: 'arrayunitsat', details: arrayunitsat });
                        log.audit({ title: 'arrayLinea', details: arrayLinea });

                    }

                    for (var ir in transactionField.data.lineField) {
                        if (
                            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
                            transactionField.data.lineField[ir].itemtype == 'Service' ||
                            transactionField.data.lineField[ir].itemtype == 'Kit' ||
                            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
                            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
                            transactionField.data.lineField[ir].itemtype == 'Markup'
                        ) {
                            var quantity = transactionField.data.lineField[ir].quantity || 0;
                            var quantityType = (parseFloat(quantity)).toFixed(2) || 0;

                            log.audit({ title: 'ir', details: ir });

                            respuesta.data.recepcion.push({
                                idRecepcion: LookupField['custbody_efx_sabritas_recepcion'] || '',
                                importe: transactionField.data.lineField[ir].amount || '',
                                valorUnitario: transactionField.data.lineField[ir].rate || '',
                                cantidad: quantityType,
                                descripcion: transactionField.data.lineField[ir].description || '',
                                unidad: arrayLinea[ir].claveunidad || ''
                            });

                        }
                    }
                    respuesta.succes = true;
                }
            } catch (error) {
                log.error({ title: 'error getDataSabritas', details: JSON.stringify(error) });
                respuesta.succes = false;
            }
            log.audit({ title: 'respuesta getDataSabritas', details: JSON.stringify(respuesta) });
            return respuesta;
        }
        const submitFields2Transaction = (objValues, recordType, recordId) => {
            var data_to_return = {
                success: false,
                msg: '',
                idParentRecord: ''
            }
            try {
                log.debug({ title: 'objValues', details: objValues });
                data_to_return.success = true;

                data_to_return.idParentRecord = record.submitFields({
                    type: recordType,
                    id: recordId,
                    values: objValues,
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });
            } catch (err) {
                log.error({ title: 'Error occurred in submitFields2Transaction', details: err });
                data_to_return.success = false;
                data_to_return.msg = 'Ocurrió error al guardar adenda en la transacción: ' + err
            }
            return data_to_return
        }
        const regenerateAdendaXML = (idTransaction, recordType, idFolder) => {
            var data_to_return = {
                success: true,
                msg: ''
            }
            try {
                log.debug({ title: 'idFolder - regenerateAdendaXML', details: idFolder });
                let resp_regen_adenda = getAdendaXML(idTransaction, recordType, false, idFolder);
                data_to_return.success = resp_regen_adenda.success;
                data_to_return.msg = resp_regen_adenda.msg;
            } catch (err) {
                log.error({ title: 'Error occurred in regenerateAdendaXML', details: err });
            }
            return data_to_return;
        }
        const getAdendaIdFromClient = (idTransaction, recordType) => {
            var data_to_return = {
                success: false,
                msg: '',
                idAdenda: '',
                idCliente: ''
            }
            try {
                let idCliente = '';
                const invoiceSearchFilters = [
                    ['internalid', search.Operator.ANYOF, idTransaction],
                    'AND',
                    ['mainline', search.Operator.IS, 'T'],
                ];
                let invoiceSearchColEntity;
                if (recordType != 'invoice') {
                    // search cliente sucursal for factura global
                    invoiceSearchColEntity = search.createColumn({ name: 'custbody_efx_fe_gbl_clientesucursal' });
                } else {
                    invoiceSearchColEntity = search.createColumn({ name: 'entity' });
                }
                const invoiceSearch = search.create({
                    type: recordType,
                    filters: invoiceSearchFilters,
                    columns: [
                        invoiceSearchColEntity,
                    ],
                });
                const invoiceSearchPagedData = invoiceSearch.runPaged({ pageSize: 1000 });
                for (let i = 0; i < invoiceSearchPagedData.pageRanges.length; i++) {
                    const invoiceSearchPage = invoiceSearchPagedData.fetch({ index: i });
                    invoiceSearchPage.data.forEach((result) => {
                        const entity = result.getValue(invoiceSearchColEntity);
                        idCliente = entity;
                    });
                }
                // Retrive adenda from customer
                const customerSearchFilters = [
                    ['internalid', search.Operator.ANYOF, idCliente],
                ];
                const customerSearchColAddendaDelCliente = search.createColumn({ name: 'custentity_efx_fe_default_addenda' });
                const customerSearch = search.create({
                    type: 'customer',
                    filters: customerSearchFilters,
                    columns: [
                        customerSearchColAddendaDelCliente,
                    ],
                });
                const customerSearchPagedData = customerSearch.runPaged({ pageSize: 1000 });
                if (customerSearchPagedData.pageRanges.length == 0) {
                    data_to_return.success = false;
                    data_to_return.msg = 'Cliente no existe'
                    return data_to_return
                }
                for (let i = 0; i < customerSearchPagedData.pageRanges.length; i++) {
                    const customerSearchPage = customerSearchPagedData.fetch({ index: i });
                    customerSearchPage.data.forEach((result) => {
                        const addendaDelCliente = result.getValue(customerSearchColAddendaDelCliente);
                        data_to_return.success = true;
                        data_to_return.idAdenda = addendaDelCliente;
                        data_to_return.idCliente = idCliente;
                    });
                }
                let currentAccountID = runtime.accountId;
                if (currentAccountID.includes('6212323') && data_to_return.idAdenda=='') {
                    data_to_return.success = true;
                    data_to_return.idAdenda = 16;
                    data_to_return.idCliente = idCliente;
                }
            } catch (err) {
                data_to_return.success = false;
                data_to_return.msg = 'err';
                log.error({ title: 'Error occurred in getAdendaIdFromClient', details: err });
            }
            return data_to_return;
        }
        const getAdendaXML = (recordId, recordType, onlyReturnContent, idFolder) => {
            var data_to_return = {
                success: false,
                msg: '',
                content: ''
            }
            try {
                let adendaId = getAdendaIdFromClient(recordId, recordType);
                log.audit({title:'adendaId 👻',details:adendaId});
                if (adendaId.success == true) {
                    let adenda = getAdenda(adendaId.idAdenda);
                    log.audit({title:'adenda 🍕',details:adenda});
                    if (adenda.success == true) {
                        // load client and transaction record
                        let entityRecord = record.load({
                            type: 'customer',
                            id: adendaId.idCliente
                        });
                        let transactionRecord = record.load({
                            type: recordType,
                            id: recordId,
                            isDynamic: true
                        });
                        let transaction2CreateAdenda = new Array();
                        if (recordType !== 'invoice') {
                            let transactionsGBL = transactionRecord.getValue({ fieldId: 'custbody_efx_fe_gbl_transactions' });
                            transactionsGBL.forEach((x) => {
                                let transactionRecord = record.load({
                                    type: 'invoice',
                                    id: x,
                                    isDynamic: true
                                });
                                transaction2CreateAdenda.push({ transactionRecord })
                            })
                        } else {
                            transaction2CreateAdenda.push({ transactionRecord })
                        }
                        let tranid = transactionRecord.getValue({
                            fieldId: 'tranid'
                        });
                        // if (!adenda.idFileOfAdenda) {
                        //     data_to_return.success = false;
                        //     data_to_return.msg = 'La adenda no tiene cargado un archivo estructura. Favor de ir al registro MX+ Adendizador, seleccionar su adenda y cargar un archivo estructura';
                        //     return data_to_return
                        // }
                        let adenda_contents = '';
                        transaction2CreateAdenda.forEach((trans) => {
                            adenda_contents += getAdendaContents(adenda.nameOfAdenda, adenda.idFileOfAdenda, trans.transactionRecord, entityRecord);
                        })
                        log.debug({ title: 'adenda_contents 📄', details: adenda_contents });
                        if (onlyReturnContent == true) {
                            data_to_return.content = adenda_contents;

                            data_to_return.success = true;
                            return data_to_return
                        }
                        // Save the contents into a txt file in a new field of Addenda
                        let fileIdOfGeneratedAdenda = createFileOfAdenda(adenda_contents, tranid);
                        if (fileIdOfGeneratedAdenda.success == true) {
                            // Load XML certified/stamped file
                            let xmlFileID = transactionRecord.getValue({
                                fieldId: 'custbody_psg_ei_certified_edoc'
                            });
                            let fileXMLObj = file.load({
                                id: xmlFileID
                            });
                            // menor a 10MB el archivo certificado
                            if (fileXMLObj.size < 10485760) {
                                let xml_contents = fileXMLObj.getContents();
                                xml_contents = invoiceFunctions.removeDetallista(xml_contents);

                                let newXMLStamped_w_adenda = invoiceFunctions.concatAdenda2XML(adenda_contents, xml_contents);
                                let adendaClean = newXMLStamped_w_adenda.newXMLContent.replaceAll('<?xml version="1.0" encoding="utf-8"?>', '');
                                log.debug({ title: 'adendaClean', details: adendaClean });
                                log.debug({ title: 'newXMLStamped_w_adenda', details: newXMLStamped_w_adenda });
                                log.audit({ title: 'xml_contents', details: xml_contents });
                                log.debug({ title: 'idFolder - getAdendaXML', details: idFolder });
                                var fileObjNXML = file.create({
                                    name: 'FACTURA_' + tranid + '.xml',
                                    fileType: file.Type.PLAINTEXT,
                                    contents: '<?xml version="1.0" encoding="utf-8"?>' + adendaClean,
                                    encoding: file.Encoding.UTF8,
                                    folder: idFolder,
                                    isOnline: true
                                });
                                var fileId_stamped = fileObjNXML.save();
                                let objValues2Store = {
                                    custbody_mxplus_generated_adenda_file: fileIdOfGeneratedAdenda.idFileAdendaGenerated,
                                    custbody_psg_ei_certified_edoc: fileId_stamped,
                                    custbody_mx_plus_xml_certificado: fileId_stamped

                                }
                                let submittedFields = submitFields2Transaction(objValues2Store, recordType, recordId);
                                log.debug({ title: 'submittedFields', details: submittedFields });
                                if (submittedFields.success == true) {
                                    data_to_return.success = true;
                                    data_to_return.msg = 'Se ha guardado su adenda con éxito. La puedes consultar en la transacción en MX+ > Datos de Timbrado > Adenda Generada';
                                } else {
                                    data_to_return.success = false;
                                    data_to_return.msg = submittedFields.msg
                                }
                            } else {
                                data_to_return.success = false;
                                data_to_return.msg = 'Archivo certificado ha superado los 10MB permitidos'
                            }


                        } else {
                            data_to_return.success = false;
                            data_to_return.msg = fileIdOfGeneratedAdenda.msg;
                        }
                    } else {
                        data_to_return.success = false;
                        data_to_return.msg = adenda.msg;
                    }
                } else {
                    data_to_return.success = adendaId.success;
                    data_to_return.msg = adendaId.msg;
                    return data_to_return
                }
            } catch (err) {
                log.error({ title: 'Error occurred in getAdendaXML', details: err });
                data_to_return.success = false;
                data_to_return.msg = err;
            }
            return data_to_return;
        }
        function getxmlSabritas(param_obj_sabritas) {
            var respuesta = {
                succes: false,
                data: '',
                xmlns: '',
                message: [],
            };
            try {


                respuesta.xmlns = ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
                respuesta.xmlns += 'xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd ';
                respuesta.xmlns += 'http://www.sat.gob.mx/detallista http://www.sat.gob.mx/sitio_internet/cfd/detallista/detallista.xsd';
                respuesta.xmlns += '"';

                respuesta.xmlns += ' xmlns:xs="http://www.w3.org/2001/XMLSchema" ';
                respuesta.xmlns += ' xmlns:detallista="http://www.sat.gob.mx/detallista" ';


                var xmlSabritas = '';

                xmlSabritas += ' <cfdi:Addenda>';
                xmlSabritas += ' <RequestCFD tipo="' + param_obj_sabritas.tipo + '" version="2.0" idPedido="' + param_obj_sabritas.idPedido + '"><Documento tipoDoc="' + param_obj_sabritas.tipoDoc + '"/><Proveedor idProveedor="' + param_obj_sabritas.idProveedor + '"/>';
                xmlSabritas += ' <Recepciones>';

                for (var i in param_obj_sabritas.recepcion) {
                    xmlSabritas += ' <Recepcion idRecepcion="' + param_obj_sabritas.recepcion[i].idRecepcion + '"><Concepto';
                    xmlSabritas += ' importe="' + param_obj_sabritas.recepcion[i].importe + '"';
                    xmlSabritas += ' valorUnitario="' + param_obj_sabritas.recepcion[i].valorUnitario + '"';
                    xmlSabritas += ' cantidad="' + param_obj_sabritas.recepcion[i].cantidad + '"';
                    xmlSabritas += ' descripcion="' + param_obj_sabritas.recepcion[i].descripcion + '"';
                    xmlSabritas += ' unidad="' + param_obj_sabritas.recepcion[i].unidad + '"/></Recepcion>';
                }

                xmlSabritas += ' </Recepciones>';
                xmlSabritas += ' </RequestCFD>';
                xmlSabritas += ' </cfdi:Addenda>';

                respuesta.data = xmlSabritas;
                respuesta.succes = respuesta.message.length == 0;

            } catch (error) {
                log.error({ title: 'error getxmlSabritas', details: JSON.stringify(error) });
                respuesta.succes = false;
            }
            log.audit({ title: 'respuesta getxmlSabritas', details: JSON.stringify(respuesta) });
            return respuesta;
        }
        function fechaSplit(param_fecha, separador_origen, separador_destino, lugar_año, luigar_mes, lugar_dia, hora) {
            var respuesta = '';
            try {
                /*
                var objDate = param_fecha.split(separador_origen);
                var año = objDate[2];
                var mes = objDate[1] < 10 ? '0' + objDate[1] : objDate[1];
                var dia = objDate[0] < 10 ? '0' + objDate[0] : objDate[0];
                */
                var objDate = format.parse({
                    value: param_fecha,
                    type: format.Type.DATE
                });

                var año = objDate.getFullYear() || '';
                var mes = objDate.getMonth() || '';
                var dia = objDate.getDate() || '';
                var arrayFecha = [
                    '',
                    '',
                    '',
                ];
                arrayFecha[lugar_año] = año;
                arrayFecha[luigar_mes] = mes * 1 + 1 < 10 ? '0' + (mes * 1 + 1) : mes * 1 + 1;
                arrayFecha[lugar_dia] = dia < 10 ? '0' + dia : dia;

                log.audit({
                    title: 'fecha1', details:
                        ' objDate ' + objDate +
                        ' año ' + año +
                        ' mes ' + mes +
                        ' dia ' + dia
                });
                respuesta = arrayFecha[0] + separador_destino + arrayFecha[1] + separador_destino + arrayFecha[2] + hora;
            } catch (error) {
                log.error({ title: 'error fechaSplit', details: JSON.stringify(error) });
                respuesta = '';
            }
            log.audit({ title: 'respuesta fechaSplit', details: JSON.stringify(respuesta) });
            return respuesta;
        }
        function getDataHDepot(param_id, param_type) {
            var respuesta = {
                succes: false,
                data: {
                    currency: {
                        currencyISOCode: '',
                        rateOfChange: ''
                    },
                    specialInstruction: {
                        code: '',
                        text: '',
                    },
                    headerInformation: {
                        DeliveryDate: ''
                    },
                    requestForPaymentIdentification: {
                        uniqueCreatorIdentification: ''
                    },
                    orderIdentification: {
                        referenceIdentification: '',
                        ReferenceDate: '',
                    },
                    AdditionalInformation: {
                        referenceIdentification: ''
                    },
                    buyer: {
                        gln: '',
                        text: '',
                    },
                    seller: {
                        gln: '',
                        alternatePartyIdentification: '',
                    },
                    DeliveryNote: {
                        referenceIdentification: '',
                        ReferenceDate: '',
                    },

                    shipTo: {
                        gln: '',
                        streetAddressOne: '',
                        city: '',
                        postalCode: '',
                    },
                    totalAmount: '',
                    discount: '',
                    subtotal: '',
                    specialServicesType: '',
                    Amount: '',
                    Tax_total: '',
                    Tax_percent: '',
                    item: [
                        /*  {
                             sku: '',
                             name: '',
                             unitOfMeasure: 'PCE',
                             rate: '',
                             discount: '',
                             Amount: '',
                             taxTypeDescription: '',
                             taxPercentage: '',
                             taxAmount: '',
    
                         } */
                    ],
                },
            };
            try {
                var arrayColumn = [
                    'tranid',
                    'total',
                    'netamountnotax',
                    'trandate',
                    'taxtotal',
                    'discountamount',
                    'currency',
                    'exchangerate',
                    'custbody_efx_fe_total_text',
                    'custbody_efx_fe_add_num_pedido',
                    'custbody_efx_fe_add_ref_ad',
                    'custbody_efx_fe_add_hd_seller',

                    'customer.custentity_efx_fe_add_bgln_hd',
                    'customer.custentity_efx_fe_add_sgln_hd',
                    'customer.custentity_efx_fe_add_intnum_hd',
                    'custbody_efx_fe_tax_json',
                    // 'shippingaddress.custrecord_efx_fe_buyer_gln',


                ];

                var LookupField = search.lookupFields({
                    type: search.Type.TRANSACTION,
                    id: param_id,
                    columns: arrayColumn
                });

                log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) });

                //Estructura por nodos

                //requestForPayment
                if (LookupField['trandate']) {
                    var DeliveryDate = fechaSplit(LookupField['trandate'], '.', '-', 0, 1, 2, '');
                    respuesta.data.headerInformation.DeliveryDate = DeliveryDate;
                }
                //requestForPaymentIdentification
                respuesta.data.requestForPaymentIdentification.uniqueCreatorIdentification = LookupField['tranid'] || '';
                //orderIdentification Type=ON
                respuesta.data.orderIdentification.referenceIdentification = LookupField['custbody_efx_fe_add_num_pedido'] || '';
                //AdditionalInformation Type=ON
                respuesta.data.AdditionalInformation.referenceIdentification = LookupField['custbody_efx_fe_add_ref_ad'] || '';
                //buyer

                if (LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || '') {
                    respuesta.data.buyer.gln = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || '';
                } else {
                    respuesta.data.buyer.gln = LookupField['customer.custentity_efx_fe_add_bgln_hd'] || '';
                }

                //seller
                var sellerglnHD = LookupField['custbody_efx_fe_add_hd_seller'] || '';
                if (sellerglnHD) {
                    respuesta.data.seller.gln = sellerglnHD[0].text;
                } else {
                    var sellerCustomer = LookupField['customer.custentity_efx_fe_add_sgln_hd'] || '';
                    respuesta.data.seller.gln = sellerCustomer[0].text;
                }
                respuesta.data.seller.alternatePartyIdentification = LookupField['customer.custentity_efx_fe_add_intnum_hd'] || '';
                //currency
                var idMoneda = LookupField['currency'] || '';
                var symbol_currency = search.lookupFields({
                    type: search.Type.CURRENCY,
                    id: idMoneda[0].value,
                    columns: ['symbol']
                });
                respuesta.data.currency.rateOfChange = LookupField['exchangerate'] || '';
                respuesta.data.currency.currencyISOCode = symbol_currency['symbol'];
                //TotalAllowanceCharge
                respuesta.data.discount = LookupField['discountamount'];
                //baseAmount
                respuesta.data.subtotal = LookupField['netamountnotax'];
                //payableAmount
                respuesta.data.totalAmount = LookupField['total'];
                //Tax
                var tax_total = LookupField['custbody_efx_fe_tax_json'];
                var json_tax_head = JSON.parse(tax_total);
                respuesta.data.Tax_total = json_tax_head.iva_total;
                try {
                    log.audit({ title: 'tax_total', details: tax_total });
                    log.audit({ title: 'respuesta.data.subtotal', details: respuesta.data.subtotal });
                    var porcentajeTax = (parseFloat(json_tax_head.iva_total) * 100) / parseFloat(respuesta.data.subtotal);
                    log.audit({ title: 'porcentajeTax', details: porcentajeTax });
                    respuesta.data.Tax_percent = porcentajeTax.toFixed(2);
                } catch (e) {
                    respuesta.data.Tax_percent = '16.00';
                }



                respuesta.data.specialServicesType = 'DI';
                respuesta.data.Amount = '0.00';
                respuesta.data.exhrate = LookupField['exchangerate'];


                var objParametro = {
                    id: param_id,
                    type: param_type,
                    sublist: 'item',
                    bodyFieldValue: [],
                    bodyFieldText: [],
                    lineField: [
                        'itemtype',
                        'item',
                        'quantity',
                        'rate',
                        'custcol_efx_fe_upc_code',
                        'custcol_efx_descripcionempaquetado',
                        'custcol_efx_empaquetado',
                        'amount',
                        'tax1amt',
                        'grossamt',
                        'unitsTEXT'
                    ],
                };
                var idNameItemTex = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_id_name_item' }) || '';
                log.audit({ title: 'idNameItemTex', details: JSON.stringify(idNameItemTex) });
                var idName = '';
                if (idNameItemTex) {
                    idName = idNameItemTex;
                } else {
                    idName = 'itemTEXT';
                }
                log.audit({ title: 'idName', details: JSON.stringify(idName) });
                objParametro.lineField.push(idName);

                var transactionField = getTransactionField(objParametro);
                if (transactionField.succes) {
                    var descuento_total_lineas = 0;
                    for (var ir in transactionField.data.lineField) {
                        //buscar descuentos
                        var descuento_linea = 0;
                        var linea_disc = parseInt(ir) + 1;
                        var tamano_linefield = Object.keys(transactionField.data.lineField).length;
                        log.audit({ title: 'linea_disc', details: linea_disc });
                        log.audit({ title: 'tamano_linefield', details: tamano_linefield });
                        if (linea_disc < tamano_linefield) {
                            if (transactionField.data.lineField[linea_disc].itemtype == 'Discount') {
                                descuento_linea = transactionField.data.lineField[ir].amount;
                                if (descuento_linea < 0) {
                                    descuento_linea = descuento_linea * (-1);
                                }
                            }
                        }
                        //fin de buscar descuentos
                        if (
                            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
                            transactionField.data.lineField[ir].itemtype == 'Service' ||
                            transactionField.data.lineField[ir].itemtype == 'Kit' ||
                            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
                            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
                            transactionField.data.lineField[ir].itemtype == 'Markup'
                        ) {

                            var rec_transaction = record.load({
                                type: param_type,
                                id: param_id,
                                isDynamic: true,
                            });

                            var json_col = rec_transaction.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_efx_fe_tax_json',
                                line: ir
                            });
                            var json_tax_col = JSON.parse(json_col);

                            var quantity = transactionField.data.lineField[ir].quantity || 0;
                            var quantityType = (parseFloat(quantity)).toFixed(2) || 0;
                            descuento_total_lineas = descuento_total_lineas + descuento_linea;
                            respuesta.data.item.push({
                                //tradeItemIdentification.gtin//sku code
                                gtin: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
                                //tradeItemDescriptionInformation.longText
                                longText: transactionField.data.lineField[ir][idName] || '',
                                //invoicedQuantity
                                unitOfMeasure: transactionField.data.lineField[ir].unitsTEXT || '',
                                invoicedQuantity: quantityType,
                                //palletInformation - en espera de la info
                                palletdescription: transactionField.data.lineField[ir].custcol_efx_descripcionempaquetado || '',
                                palletQuantity: transactionField.data.lineField[ir].custcol_efx_empaquetado || '',
                                //tradeItemTaxInformation
                                taxTypeDescription: 'VAT',
                                //tradeItemTaxAmount
                                iva_rate: (json_tax_col.iva.rate).toFixed(2),
                                iva_importe: (json_tax_col.iva.importe),
                                //totalLineAmount
                                rate: transactionField.data.lineField[ir].rate || '',
                                amount: transactionField.data.lineField[ir].amount || '',
                                grossamt: transactionField.data.lineField[ir].grossamt || '',
                                Amount: transactionField.data.lineField[ir].amount || '',
                                ieps_rate: (json_tax_col.ieps.rate).toFixed(4),
                                ieps_importe: (json_tax_col.ieps.importe),
                                discount: descuento_linea,


                            });

                        }
                    }
                    if (transactionField.data.bodyFieldValue.discounttotal) {
                        respuesta.data.descuentototal = transactionField.data.bodyFieldValue.discounttotal;
                    } else {
                        respuesta.data.descuentototal = descuento_total_lineas.toFixed(2);
                    }
                    respuesta.succes = true;
                }
            } catch (error) {
                log.error({ title: 'error getDataHDepot', details: JSON.stringify(error) });
                respuesta.succes = false;
            }
            log.audit({ title: 'respuesta getDataHdepot', details: JSON.stringify(respuesta) });
            return respuesta;
        }
        function getXmlHDepot(param_obj_HDepot) {
            var respuesta = {
                succes: false,
                data: '',
                xmlns: '',
            };
            try {

                var xmlHDepot = '';



                xmlHDepot += '<cfdi:Addenda>';
                xmlHDepot += '    <requestForPayment';
                xmlHDepot += '        type = "SimpleInvoiceType"';
                xmlHDepot += '        contentVersion = "1.3.1"';
                xmlHDepot += '        documentStructureVersion = "AMC7.1"';
                xmlHDepot += '        documentStatus = "ORIGINAL"';
                xmlHDepot += '        DeliveryDate = "' + param_obj_HDepot.headerInformation.DeliveryDate + '">';
                xmlHDepot += '        <requestForPaymentIdentification>';
                xmlHDepot += '            <entityType>INVOICE</entityType>';
                xmlHDepot += '            <uniqueCreatorIdentification>' + param_obj_HDepot.requestForPaymentIdentification.uniqueCreatorIdentification + '</uniqueCreatorIdentification>';
                xmlHDepot += '        </requestForPaymentIdentification>';
                xmlHDepot += '        <orderIdentification>';
                xmlHDepot += '            <referenceIdentification type = "ON">' + param_obj_HDepot.orderIdentification.referenceIdentification + '</referenceIdentification>';
                xmlHDepot += '        </orderIdentification>';
                xmlHDepot += '        <AdditionalInformation>';
                if (param_obj_HDepot.AdditionalInformation.referenceIdentification) {
                    xmlHDepot += '            <referenceIdentification type = "IV">' + param_obj_HDepot.AdditionalInformation.referenceIdentification + '</referenceIdentification>';
                } else {
                    xmlHDepot += '            <referenceIdentification type = "IV">' + param_obj_HDepot.orderIdentification.referenceIdentification + '</referenceIdentification>';
                }
                xmlHDepot += '        </AdditionalInformation>';
                xmlHDepot += '        <buyer>';
                xmlHDepot += '            <gln>' + param_obj_HDepot.buyer.gln + '</gln>';
                xmlHDepot += '        </buyer>';
                xmlHDepot += '        <seller>';
                xmlHDepot += '            <gln>' + param_obj_HDepot.seller.gln + '</gln>';
                xmlHDepot += '            <alternatePartyIdentification type = "SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' + param_obj_HDepot.seller.alternatePartyIdentification + '</alternatePartyIdentification>';
                xmlHDepot += '        </seller>';
                xmlHDepot += '        <currency currencyISOCode = "' + param_obj_HDepot.currency.currencyISOCode + '">';
                xmlHDepot += '            <currencyFunction>BILLING_CURRENCY</currencyFunction>';
                xmlHDepot += '            <rateOfChange>' + param_obj_HDepot.currency.rateOfChange + '</rateOfChange>';
                xmlHDepot += '        </currency>';
                var lineItem = 0;
                for (var itemLine in param_obj_HDepot.item) {
                    lineItem++;
                    xmlHDepot += '        <lineItem number = "' + lineItem + '" type = "SimpleInvoiceLineItemType">';
                    xmlHDepot += '            <tradeItemIdentification>';
                    xmlHDepot += '                <gtin>' + param_obj_HDepot.item[itemLine].gtin + '</gtin>';
                    xmlHDepot += '            </tradeItemIdentification>';
                    xmlHDepot += '            <alternateTradeItemIdentification type = "BUYER_ASSIGNED">' + param_obj_HDepot.item[itemLine].gtin + '</alternateTradeItemIdentification>';
                    xmlHDepot += '            <tradeItemDescriptionInformation language = "ES">';
                    xmlHDepot += '                <longText>' + param_obj_HDepot.item[itemLine].longText + '</longText>';
                    xmlHDepot += '            </tradeItemDescriptionInformation>';
                    xmlHDepot += '            <invoicedQuantity unitOfMeasure = "' + param_obj_HDepot.item[itemLine].unitOfMeasure + '">' + param_obj_HDepot.item[itemLine].invoicedQuantity + '</invoicedQuantity>';
                    xmlHDepot += '            <grossPrice>';
                    xmlHDepot += '                <Amount>' + param_obj_HDepot.item[itemLine].rate.toFixed(2) + '</Amount>';
                    xmlHDepot += '            </grossPrice>';
                    xmlHDepot += '            <palletInformation>';
                    xmlHDepot += '                <palletQuantity>' + param_obj_HDepot.item[itemLine].palletQuantity + '</palletQuantity>';
                    xmlHDepot += '                <description type = "EXCHANGE_PALLETS">' + param_obj_HDepot.item[itemLine].palletdescription + '</description>';
                    xmlHDepot += '                <transport>';
                    xmlHDepot += '                    <methodOfPayment>PREPAID_BY_SELLER</methodOfPayment>';
                    xmlHDepot += '                </transport>';
                    xmlHDepot += '            </palletInformation>';
                    xmlHDepot += '            <tradeItemTaxInformation>';
                    xmlHDepot += '                <taxTypeDescription>' + param_obj_HDepot.item[itemLine].taxTypeDescription + '</taxTypeDescription>';
                    xmlHDepot += '                <tradeItemTaxAmount>';
                    xmlHDepot += '                    <taxPercentage>' + param_obj_HDepot.item[itemLine].iva_rate + '</taxPercentage>';
                    xmlHDepot += '                    <taxAmount>' + param_obj_HDepot.item[itemLine].iva_importe + '</taxAmount>';
                    xmlHDepot += '                </tradeItemTaxAmount>';
                    xmlHDepot += '            </tradeItemTaxInformation>';
                    xmlHDepot += '            <totalLineAmount>';
                    xmlHDepot += '                <netAmount>';
                    xmlHDepot += '                    <Amount>' + param_obj_HDepot.item[itemLine].amount.toFixed(2) + '</Amount>';
                    xmlHDepot += '                </netAmount>';
                    xmlHDepot += '            </totalLineAmount>';
                    xmlHDepot += '        </lineItem>';
                }
                xmlHDepot += '        <totalAmount><Amount>' + param_obj_HDepot.subtotal + '</Amount></totalAmount>';
                xmlHDepot += '        <TotalAllowanceCharge allowanceOrChargeType = "ALLOWANCE">';
                xmlHDepot += '            <Amount>' + param_obj_HDepot.descuentototal + '</Amount>';
                xmlHDepot += '        </TotalAllowanceCharge>';
                xmlHDepot += '        <baseAmount>';
                xmlHDepot += '            <Amount>' + param_obj_HDepot.subtotal + '</Amount>';
                xmlHDepot += '        </baseAmount>';
                xmlHDepot += '        <tax type = "VAT">';
                xmlHDepot += '            <taxPercentage>' + param_obj_HDepot.Tax_percent + '</taxPercentage>';
                xmlHDepot += '            <taxAmount>' + param_obj_HDepot.Tax_total + '</taxAmount>';
                xmlHDepot += '            <taxCategory>TRANSFERIDO</taxCategory>';
                xmlHDepot += '        </tax>';
                xmlHDepot += '        <payableAmount>';
                xmlHDepot += '            <Amount>' + param_obj_HDepot.totalAmount + '</Amount>';
                xmlHDepot += '        </payableAmount>';
                xmlHDepot += '    </requestForPayment>';
                xmlHDepot += '</cfdi:Addenda>';


                respuesta.data = xmlHDepot;
                respuesta.succes = true;

            } catch (error) {
                log.error({ title: 'error getXmlHeb', details: JSON.stringify(error) });
                respuesta.succes = false;
            }
            log.audit({ title: 'respuesta getXmlHeb', details: JSON.stringify(respuesta) });
            return respuesta;
        }
        function getDataChedrahui(param_id, param_type) {
            var respuesta = {
                succes: false,
                data: {
                    serie: '',
                    folio: '',
                    date:'',
                    montoTexto: '',
                    specialInstructioncode: 'ZZZ',
                    orderIdentification: '',
                    ReferenceDate: '',
                    id_proveedor: '',
                    identificador_chedrahui: '',
                    vatregnumber: '',
                    addresType: '',
                    name: '',
                    addres1: '',
                    city: '',
                    zipcode: '',
                    currencyISOCode: 'MXN',
                    rateOfChange: '1.000000',
                    item: [
                    ],
                    total: '',
                    subtotal: '',
                    taxPercentage: '0.00',
                    taxtotal: '',
                    discount: '',
                    refId: '',
                    refDate: '',
                }
            };
            try {
                var arrayColumn = [
                    'tranid',
                    'trandate',
                    'total',
                    'taxtotal',
                    'custbody_efx_fe_total_text',
                    'otherrefnum',
                    'custbody_efx_fe_add_ched_foc',
                    'billingaddress.addressee',
                    'billingaddress.custrecord_streetname',
                    'billingaddress.custrecord_streetnum',
                    'billingaddress.custrecord_colonia',
                    'billingaddress.custrecord_village',
                    'billingaddress.state',
                    'billingaddress.zip',
                    'billingaddress.country',
                    'shippingaddress.addressee',
                    'shippingaddress.custrecord_streettype',
                    'shippingaddress.custrecord_streetname',
                    'shippingaddress.custrecord_streetnum',
                    'shippingaddress.custrecord_colonia',
                    'shippingaddress.custrecord_village',
                    'shippingaddress.state',
                    'shippingaddress.zip',
                    'shippingaddress.country',
                    'shippingaddress.custrecord_efx_fe_lugar_gln',
                    'billingaddress.custrecord_efx_fe_lugar_gln',
                    'shippingaddress.custrecord_efx_fe_buyer_gln',
                    'terms',
                    'custbody_efx_fe_reference_date',
                    //'custbody_efx_fe_reference_id',
                    'customer.custentity_efx_fe_add_ched_exgln',
                    'customer.custentity_efx_fe_add_ched_entgln',
                ]
                var SUBSIDIARIES = runtime.isFeatureInEffect({feature: "SUBSIDIARIES"});
                if (SUBSIDIARIES) {
                    arrayColumn.push('subsidiary');
                }
                var LookupField = search.lookupFields({
                    type: search.Type.TRANSACTION,
                    id: param_id,
                    columns: arrayColumn
                });
                log.audit({title: 'LookupField', details: JSON.stringify(LookupField)});
                {
                    if (SUBSIDIARIES && LookupField.subsidiary) {
                        var resultSub = record.load({
                            type: search.Type.SUBSIDIARY,
                            id: LookupField.subsidiary[0].value,
                        });
                        respuesta.data.vatregnumber = resultSub.getValue({fieldId: "federalidnumber"}) || '';// 'NFM0910317L6',
                        respuesta.data.name = resultSub.getValue({fieldId: "legalname"}) || '';// 'NUTRITION FACT DE MEXICO SA DE CV',
                        var mainaddressOBJ = resultSub.getSubrecord({fieldId: 'mainaddress'});
                        respuesta.data.addres1 = mainaddressOBJ.getValue({fieldId: 'custrecord_streetname'}) || '';// 'HACIENDA DEL ROSARIO 195 PRADOS DEL ROSARIO',
                        respuesta.data.city = mainaddressOBJ.getText({fieldId: 'city'}) || '';// 'AZCAPOTZALCO',
                        respuesta.data.zipcode = mainaddressOBJ.getValue({fieldId: 'zip'}) || '';// '02410',
                        respuesta.data.state = mainaddressOBJ.getValue({fieldId: 'state'}) || '';// '02410',
                        respuesta.data.country = mainaddressOBJ.getValue({fieldId: 'country'}) || '';// '02410',
                        respuesta.data.numextsub = mainaddressOBJ.getValue({fieldId: 'custrecord_streetnum'}) || '';// '02410',
                        respuesta.data.coloniasub = mainaddressOBJ.getValue({fieldId: 'custrecord_colonia'}) || '';// '02410',
                    } else if (!SUBSIDIARIES) {
                        var configRecObj = config.load({
                            type: config.Type.COMPANY_INFORMATION
                        });
                        respuesta.data.vatregnumber = configRecObj.getValue({fieldId: 'employerid'}) || '';
                        respuesta.data.name = configRecObj.getValue({fieldId: 'legalname'}) || '';
                        var mainaddressOBJ = configRecObj.getSubrecord({fieldId: 'mainaddress'});
                        // respuesta.data.addresType = mainaddressOBJ.getText({fieldId: 'custrecord_streettype'}) || '';
                        respuesta.data.addres1 = mainaddressOBJ.getValue({fieldId: 'custrecord_streetname'}) || '';
                        respuesta.data.city = mainaddressOBJ.getText({fieldId: 'city'}) || '';
                        respuesta.data.zipcode = mainaddressOBJ.getValue({fieldId: 'zip'}) || '';
                        respuesta.data.state = mainaddressOBJ.getValue({fieldId: 'state'}) || '';// '02410',
                        respuesta.data.country = mainaddressOBJ.getValue({fieldId: 'country'}) || '';// '02410',
                        respuesta.data.numextsub = mainaddressOBJ.getValue({fieldId: 'custrecord_streetnum'}) || '';// '02410',
                        respuesta.data.coloniasub = mainaddressOBJ.getValue({fieldId: 'custrecord_colonia'}) || '';// '02410',
                    }
                }
                respuesta.data.serie = LookupField['tranid'] || '';
                respuesta.data.folio = LookupField['tranid'] || '';
                var Date = LookupField['trandate'] || '';
                var formatDate = formatFecha(Date);
                log.audit({title:'formatDate ☠️',details:formatDate});
                respuesta.data.date = formatDate;
                // respuesta.data.date = LookupField['trandate'] || '';
      
                // try {
                //     respuesta.data.refId = LookupField['custbody_efx_fe_reference_id'] || '';
                //     if (LookupField['custbody_efx_fe_reference_date']) {
                //         respuesta.data.refDate = fechaSplit(LookupField['custbody_efx_fe_reference_date'], '/', '-', 0, 1, 2, '');
                //     }
                // } catch (error_MV) {
                //     respuesta.data.ReferenceDate = '0000000';
                //     respuesta.data.refId = '1';
                // }
                respuesta.data.Nombre = LookupField['billingaddress.addressee'] || '';
                respuesta.data.Calle = LookupField['billingaddress.custrecord_streetname'] || '';
                respuesta.data.NumeroExt = LookupField['billingaddress.custrecord_streetnum'] || '';
                respuesta.data.Colonia = LookupField['billingaddress.custrecord_colonia'] || '';
                respuesta.data.Municipio = LookupField['billingaddress.custrecord_village'] || '';
                respuesta.data.Estado = LookupField['billingaddress.state'] || '';
                respuesta.data.CodigoPostal = LookupField['billingaddress.zip'] || '';
                respuesta.data.Pais = LookupField['billingaddress.country'] || '';
                respuesta.data.Nombre_envio = LookupField['shippingaddress.addressee'] || '';
                respuesta.data.addresType = LookupField['shippingaddress.custrecord_streettype'] || '';
                respuesta.data.Calle_envio = LookupField['shippingaddress.custrecord_streetname'] || '';
                respuesta.data.NumeroExt_envio = LookupField['shippingaddress.custrecord_streetnum'] || '';
                respuesta.data.Colonia_envio = LookupField['shippingaddress.custrecord_colonia'] || '';
                respuesta.data.Municipio_envio = LookupField['shippingaddress.custrecord_village'] || '';
                respuesta.data.Estado_envio = LookupField['shippingaddress.state'] == 'CDMX' ? 'Ciudad de México' : LookupField['shippingaddress.state'] || '';
                respuesta.data.CodigoPostal_envio = LookupField['shippingaddress.zip'] || '';
                respuesta.data.Pais_envio = LookupField['shippingaddress.country'] || '';
                respuesta.data.terminos = LookupField['terms'] || '';
                try{
                if(respuesta.data.terminos){
                    var terminos_obj = record.load({
                        type: record.Type.TERM,
                        id: respuesta.data.terminos[0].value
                    });
                    respuesta.data.terminos = terminos_obj.getValue({fieldId:'daysuntilnetdue'});
                }
                }catch(error_terms){
                    respuesta.data.terminos  = '';
                }
              //   if (LookupField['custbody_efx_fe_add_ched_foc']) {
                  //   var horaMexico = horaActual();
                    respuesta.data.ReferenceDate = formatFecha(LookupField['custbody_efx_fe_reference_date']);
                  //   respuesta.data.ReferenceDate = fechaSplit(LookupField['custbody_efx_fe_add_ched_foc'], '/', '-', 0, 1, 2, 'T' + horaMexico);
              //   }
                respuesta.data.montoTexto = LookupField['custbody_efx_fe_total_text'] || '';
                respuesta.data.orderIdentification = LookupField['otherrefnum'] || '';
                if(LookupField['shippingaddress.custrecord_efx_fe_buyer_gln']){
                    respuesta.data.id_proveedor = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || '';
                }else{
                    respuesta.data.id_proveedor = LookupField['customer.custentity_efx_fe_add_ched_exgln'] || '';
                }
                if(LookupField['shippingaddress.custrecord_efx_fe_lugar_gln']){
                    respuesta.data.identificador_chedrahui = LookupField['shippingaddress.custrecord_efx_fe_lugar_gln'] || '';
                }else if(LookupField['billingaddress.custrecord_efx_fe_lugar_gln']){
                    respuesta.data.identificador_chedrahui = LookupField['billingaddress.custrecord_efx_fe_lugar_gln'] || '';
                }else{
                    respuesta.data.identificador_chedrahui = LookupField['customer.custentity_efx_fe_add_ched_entgln'] || '';
                }
                respuesta.data.total = LookupField['total'] || 0;
                respuesta.data.subtotal = LookupField['total'] || 0;
                respuesta.data.taxtotal = LookupField['taxtotal'] || 0;
                respuesta.data.discount = LookupField['discounttotal'] || 0;
                respuesta.data.taxPercentage = '16.00';

                var taxTyp = getTaxDetails(param_id, param_type);
                log.audit({ title: 'taxTyp 👽👽', details: taxTyp });
                
                var objParametro = {
                    id: param_id,
                    type: param_type,
                    sublist: 'item',
                    bodyFieldValue: [],
                    bodyFieldText: [],
                    lineField: [
                        'itemtype',
                        'item',
                        'itemTEXT',
                        'quantity',
                        'rate',
                        'custcol_efx_fe_upc_code',
                        'amount',
                        'tax1amt',
                        'grossamt',
                    ],
                };
                var transactionField = getTransactionField(objParametro);
                if (transactionField.succes) {
                    for (var ir in transactionField.data.lineField) {
                        if (
                            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
                            transactionField.data.lineField[ir].itemtype == 'Service' ||
                            transactionField.data.lineField[ir].itemtype == 'Kit' ||
                            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
                            transactionField.data.lineField[ir].itemtype == 'Markup' ||
                            transactionField.data.lineField[ir].itemtype == 'Assembly'
                        ) {
                            var quantity = transactionField.data.lineField[ir].quantity || 0;
                            var quantityType = (parseFloat(quantity)).toFixed(2) || 0;
                            respuesta.data.item.push({
                                sku: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
                                quantity: quantity,
                                QuantityType: quantityType || '',
                                name: transactionField.data.lineField[ir].itemTEXT || '',
                                rate: transactionField.data.lineField[ir].rate || '',
                                unitOfMeasure: 'CA',
                                amount: transactionField.data.lineField[ir].amount || 0.00,
                                taxAmount: parseFloat(transactionField.data.lineField[ir].tax1amt).toFixed(2) || '0.00',
                                grossAmount: transactionField.data.lineField[ir].grossamt || 0.00,
                                netAmount: transactionField.data.lineField[ir].grossamt || 0.00,
                                taxPercentage: taxTyp[ir].taxType || '0.00',
                            });
                        }
                    }
                    respuesta.succes = true;
                }
            } catch (error) {
                log.error({title: 'error getDataChedrahui', details: JSON.stringify(error)});
                respuesta.succes = false;
            }
            log.audit({title: 'respuesta getDataChedrahui', details: JSON.stringify(respuesta)});
            return respuesta;
        }
        function getXmlChedrahui(param_obj_Chedrahui) {
            var respuesta = {
                succes: false,
                data: '',
                xmlns: '',
            };
            try {
                respuesta.xmlns = ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" ';
                respuesta.xmlns += ' xmlns:xs="http://www.w3.org/2001/XMLSchema" ';
                respuesta.xmlns += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
                log.audit({title:'respuesta.xmlns',details:respuesta.xmlns});
                var xmlChedrahui = '';
                xmlChedrahui += '   <cfdi:Addenda>';
                xmlChedrahui += '       <requestForPayment';
                xmlChedrahui += '           type="SimpleInvoiceType"';
                xmlChedrahui += '           contentVersion="1.3.1"';
                xmlChedrahui += '           documentStructureVersion="AMC7.1"';
                xmlChedrahui += '           documentStatus="ORIGINAL"';
                xmlChedrahui += '           DeliveryDate="'+param_obj_Chedrahui.date+'">';
                xmlChedrahui += '           <requestForPaymentIdentification>';
                xmlChedrahui += '               <entityType>INVOICE</entityType>';
                xmlChedrahui += '               <uniqueCreatorIdentification>"' + param_obj_Chedrahui.serie + '"</uniqueCreatorIdentification>';
                xmlChedrahui += '           </requestForPaymentIdentification>';
                xmlChedrahui += '           <specialInstruction code="' + param_obj_Chedrahui.specialInstructioncode + '">';
                xmlChedrahui += '               <text>' + param_obj_Chedrahui.montoTexto + '</text>';
                xmlChedrahui += '           </specialInstruction>';
                xmlChedrahui += '           <orderIdentification>';
                xmlChedrahui += '               <referenceIdentification type="ON">' + param_obj_Chedrahui.orderIdentification + '</referenceIdentification>';
                xmlChedrahui += '               <ReferenceDate>' + param_obj_Chedrahui.ReferenceDate + '</ReferenceDate>';
                xmlChedrahui += '           </orderIdentification>';
                xmlChedrahui += '           <AdditionalInformation>';
                xmlChedrahui += '               <referenceIdentification type="ON">' + param_obj_Chedrahui.orderIdentification + '</referenceIdentification>';
                xmlChedrahui += '           </AdditionalInformation>';
                xmlChedrahui += '           <ReferenceDate>' + param_obj_Chedrahui.date + '</ReferenceDate>';
                /*xmlChedrahui += '           <DeliveryNote>';
                xmlChedrahui += '               <referenceIdentification>' + param_obj_Chedrahui.refId +'</referenceIdentification>';
                xmlChedrahui += '               <ReferenceDate>' + param_obj_Chedrahui.ReferenceDate +'</ReferenceDate>';
              //   xmlChedrahui += '               <ReferenceDate>' + param_obj_Chedrahui.refDate +'</ReferenceDate>';
                xmlChedrahui += '           </DeliveryNote>';*/
                if (param_obj_Chedrahui.refId && param_obj_Chedrahui.refDate) {
                    xmlChedrahui += '           <DeliveryNote>';
                    xmlChedrahui += '               <referenceIdentification>' + param_obj_Chedrahui.refId +'</referenceIdentification>';
                    xmlChedrahui += '               <ReferenceDate>' + param_obj_Chedrahui.refDate +'</ReferenceDate>';
                    xmlChedrahui += '           </DeliveryNote>';
                }
                xmlChedrahui += '           <buyer>';
                xmlChedrahui += '               <gln>' + param_obj_Chedrahui.id_proveedor + '</gln>';
                xmlChedrahui += '               <contactInformation>';
                xmlChedrahui += '                   <personOrDepartmentName>';
                xmlChedrahui += '                       <text>0</text>';
                xmlChedrahui += '                   </personOrDepartmentName>';
                xmlChedrahui += '               </contactInformation>';
                xmlChedrahui += '           </buyer>';
                xmlChedrahui += '           <seller>';
                xmlChedrahui += '               <gln>' + param_obj_Chedrahui.id_proveedor + '</gln>';
                xmlChedrahui += '               <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' + param_obj_Chedrahui.identificador_chedrahui + '</alternatePartyIdentification>';
                xmlChedrahui += '           </seller>';
                xmlChedrahui += '           <shipTo>';
                xmlChedrahui += '               <gln>' + param_obj_Chedrahui.id_proveedor + '</gln>';
                xmlChedrahui += '               <nameAndAddress>';
                xmlChedrahui += '                   <name>'+ param_obj_Chedrahui.Nombre_envio +'</name>';
                xmlChedrahui += '                   <streetAddressOne>'+ param_obj_Chedrahui.addresType[0].text + ' ' + param_obj_Chedrahui.Calle_envio + ' ' + Number(param_obj_Chedrahui.NumeroExt_envio) +'</streetAddressOne>';
                xmlChedrahui += '                   <city>'+ param_obj_Chedrahui.Estado_envio +'</city>';
                xmlChedrahui += '                   <postalCode>'+ param_obj_Chedrahui.CodigoPostal_envio +'</postalCode>';
                xmlChedrahui += '               </nameAndAddress>';
                xmlChedrahui += '           </shipTo>';
                xmlChedrahui += '           <InvoiceCreator>';
                xmlChedrahui += '               <gln>' + param_obj_Chedrahui.id_proveedor + '</gln>';
                xmlChedrahui += '               <alternatePartyIdentification type="VA">' + param_obj_Chedrahui.id_proveedor + '</alternatePartyIdentification>';
                // xmlChedrahui += '               <alternatePartyIdentification type="VA">' + param_obj_Chedrahui.vatregnumber + '</alternatePartyIdentification>';
                xmlChedrahui += '               <nameAndAddress>';
                xmlChedrahui += '                   <name>' + param_obj_Chedrahui.name + '</name>';
                xmlChedrahui += '                   <streetAddressOne>' + param_obj_Chedrahui.addres1 + '</streetAddressOne>';
                xmlChedrahui += '                   <city>' + param_obj_Chedrahui.city + '</city>';
                xmlChedrahui += '                   <postalCode>' + param_obj_Chedrahui.zipcode + '</postalCode>';
                xmlChedrahui += '               </nameAndAddress>';
                xmlChedrahui += '           </InvoiceCreator>';
                xmlChedrahui += '           <currency currencyISOCode="' + param_obj_Chedrahui.currencyISOCode + '">';
                xmlChedrahui += '               <currencyFunction>BILLING_CURRENCY</currencyFunction>';
                xmlChedrahui += '               <rateOfChange>' + param_obj_Chedrahui.rateOfChange + '</rateOfChange>';
                xmlChedrahui += '           </currency>';
                xmlChedrahui += '           <paymentTerms';
                xmlChedrahui += '               paymentTermsEvent="DATE_OF_INVOICE"';
                xmlChedrahui += '               PaymentTermsRelationTime="REFERENCE_AFTER">';
                xmlChedrahui += '               <netPayment netPaymentTermsType="BASIC_NET">';
                xmlChedrahui += '                   <paymentTimePeriod>';
                xmlChedrahui += '                       <timePeriodDue timePeriod="DAYS">';
                xmlChedrahui += '                           <value>' + param_obj_Chedrahui.terminos + '</value>';
                xmlChedrahui += '                       </timePeriodDue>';
                xmlChedrahui += '                   </paymentTimePeriod>';
                xmlChedrahui += '               </netPayment>';
                xmlChedrahui += '           </paymentTerms>';
                for (var lineitem in param_obj_Chedrahui.item) {
                    xmlChedrahui += '           <lineItem type="SimpleInvoiceLineItemType" number="'+ (parseFloat(lineitem)+1) +'">';
                    xmlChedrahui += '               <tradeItemIdentification>';
                    xmlChedrahui += '                   <gtin>' + param_obj_Chedrahui.item[lineitem].sku + '</gtin>';
                    xmlChedrahui += '               </tradeItemIdentification>';
                    xmlChedrahui += '               <alternateTradeItemIdentification type="BUYER_ASSIGNED">' + param_obj_Chedrahui.item[lineitem].sku + '</alternateTradeItemIdentification>';
                    xmlChedrahui += '               <tradeItemDescriptionInformation>';
                    // xmlChedrahui += '               <tradeItemDescriptionInformation language="ES">';
                    xmlChedrahui += '                   <longText>' + escapeXml(param_obj_Chedrahui.item[lineitem].name) + '</longText>';
                    // xmlChedrahui += '                   <longText>' + (xml.escape({xmlText: param_obj_Chedrahui.item[lineitem].name})) + '</longText>';
                    xmlChedrahui += '               </tradeItemDescriptionInformation>';
                    xmlChedrahui += '               <invoicedQuantity unitOfMeasure="CA">' + param_obj_Chedrahui.item[lineitem].QuantityType + '</invoicedQuantity>';
                    xmlChedrahui += '               <aditionalQuantity QuantityType="NUM_CONSUMER_UNITS">' + param_obj_Chedrahui.item[lineitem].quantity + '</aditionalQuantity>';
                    xmlChedrahui += '               <grossPrice>';
                    xmlChedrahui += '                   <Amount>' + param_obj_Chedrahui.item[lineitem].rate + '</Amount>';
                    xmlChedrahui += '               </grossPrice>';
                    xmlChedrahui += '               <netPrice>';
                    xmlChedrahui += '                   <Amount>' + param_obj_Chedrahui.item[lineitem].amount + '</Amount>';
                    xmlChedrahui += '               </netPrice>';
                    // xmlChedrahui += '               <AdditionalInformation>';
                    // xmlChedrahui += '                   <referenceIdentification type="ON"></referenceIdentification>';
                    // xmlChedrahui += '               </AdditionalInformation>';
                    
                    xmlChedrahui += '               <tradeItemTaxInformation>';
                    xmlChedrahui += '                   <taxTypeDescription>VAT</taxTypeDescription>';
                    xmlChedrahui += '                   <referenceNumber>' + param_obj_Chedrahui.item[lineitem].taxPercentage + '</referenceNumber>';
                    xmlChedrahui += '                   <tradeItemTaxAmount>';
                    xmlChedrahui += '                       <taxPercentage>' + (param_obj_Chedrahui.item[lineitem].taxPercentage).toFixed(2) + '</taxPercentage>';
                    var taxTypePor = (param_obj_Chedrahui.item[lineitem].taxPercentage).toFixed(2);
                    xmlChedrahui += '                       <taxAmount>' + param_obj_Chedrahui.item[lineitem].netAmount + '</taxAmount>';
                    // xmlChedrahui += '                       <taxAmount>' + param_obj_Chedrahui.item[lineitem].taxAmount + '</taxAmount>';
                    xmlChedrahui += '                   </tradeItemTaxAmount>';
                    xmlChedrahui += '               </tradeItemTaxInformation>';
                    xmlChedrahui += '               <totalLineAmount>';
                    xmlChedrahui += '                   <grossAmount>';
                    xmlChedrahui += '                       <Amount>' + param_obj_Chedrahui.item[lineitem].amount + '</Amount>';
                    // xmlChedrahui += '                       <Amount>' + param_obj_Chedrahui.item[lineitem].grossAmount + '</Amount>';
                    xmlChedrahui += '                   </grossAmount>';
                    xmlChedrahui += '                   <netAmount>';
                    xmlChedrahui += '                       <Amount>' + param_obj_Chedrahui.item[lineitem].amount + '</Amount>';
                    // xmlChedrahui += '                       <Amount>' + param_obj_Chedrahui.item[lineitem].netAmount + '</Amount>';
                    xmlChedrahui += '                   </netAmount>';
                    xmlChedrahui += '               </totalLineAmount>';
                    xmlChedrahui += '           </lineItem>';
                }
                
                xmlChedrahui += '           <totalAmount>';
                xmlChedrahui += '               <Amount>' + param_obj_Chedrahui.total + '</Amount>';
                xmlChedrahui += '           </totalAmount>';
                // xmlChedrahui += '               <Amount>' + param_obj_Chedrahui.total + '</Amount>';
                xmlChedrahui += '           <TotalAllowanceCharge allowanceOrChargeType="">';
                xmlChedrahui += '               <Amount>' + '0.00' + '</Amount>';
                xmlChedrahui += '           </TotalAllowanceCharget>';
                xmlChedrahui += '           <baseAmount>';
                xmlChedrahui += '               <Amount>' + param_obj_Chedrahui.subtotal + '</Amount>';
                xmlChedrahui += '           </baseAmount>';
                xmlChedrahui += '           <tax type="VAT">';
                xmlChedrahui += '               <taxPercentage>' + taxTypePor + '</taxPercentage>';
                // xmlChedrahui += '               <taxPercentage>' + param_obj_Chedrahui.taxPercentage + '</taxPercentage>';
                xmlChedrahui += '               <taxAmount>' + param_obj_Chedrahui.taxtotal + '</taxAmount>';
                // xmlChedrahui += '               <taxCategory>TRANSFERIDO</taxCategory>';
                xmlChedrahui += '           </tax>';
                xmlChedrahui += '           <payableAmount>';
                xmlChedrahui += '               <Amount>' + param_obj_Chedrahui.total + '</Amount>';
                xmlChedrahui += '           </payableAmount>';
                xmlChedrahui += '       </requestForPayment>';
                xmlChedrahui += '   </cfdi:Addenda>';
                // if(ChedrahuiMySuite){
                //     respuesta.data = JSON.stringify(param_obj_Chedrahui);
                
                // }else{
                    respuesta.data = xmlChedrahui;
                // }
                respuesta.succes = true;
            } catch (error) {
                log.error({title: 'error getXmlChedrahui', details: JSON.stringify(error)});
                respuesta.succes = false;
            }
            log.audit({title: 'respuesta getXmlChedrahui', details: JSON.stringify(respuesta)});
            return respuesta;
        }
        function escapeXml(unsafe) {
            return unsafe.replace(/[<>&'"]/g, function (c) {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                }
            });
        }
        function formatFecha(date) {
            try{
                var objDate = format.parse({
                    value: date,
                    type: format.Type.DATE
                });
                var anio = objDate.getFullYear() || '';
                var mes = objDate.getMonth() || '';
                var dia = objDate.getDate() || '';
                var arrayFecha = [];
                var lugar_anio = anio;
                var lugar_mes = mes * 1 + 1 < 10 ? '0' + (mes * 1 + 1) : mes * 1 + 1;
                var lugar_dia = dia < 10 ? '0' + dia : dia;
                arrayFecha.push(lugar_anio);
                arrayFecha.push(lugar_mes);
                arrayFecha.push(lugar_dia);
                var dateFormat = arrayFecha[0] + '-' + arrayFecha[1] + '-' + arrayFecha[2];
                return dateFormat
            }catch(err){
            log.error({title:'Error occurred in formatDate',details:err});
            }
        }
        const getAdendaContents = (adendaName, adendaFileId, recordObj, entityObj) => {
            try {
                var fileObj = ''
                if (adendaFileId) { fileObj = file.load({ id: adendaFileId }) }
                let strContents = ''
                let content = ''
                log.debug({ title: 'entra a adendas 🌟🌟', details: 'true' });
                if (fileObj.size < 10485760) { strContents = fileObj.getContents(); }
                switch (adendaName) {
                    case 'Sabritas':
                        var objReturn = {
                            error: [],
                            xml: '',
                            schema: '',
                            obj: {
                                succes: false,
                            },
                            input: {
                                custparam_tranid: recordObj.id,
                                custparam_trantype: recordObj.type,
                                custparam_mode: adendaName,
                            }
                        };
                        objReturn.obj = getDataSabritas(recordObj.id, recordObj.type);
                        if (objReturn.obj.succes) {
                            xmlAddenda = getxmlSabritas(objReturn.obj.data);
                            log.emergency({ title: 'xmlAddenda SABRITAS', details: xmlAddenda });
                            return xmlAddenda.data
                        }
                        break
                    case 'HomeDepot':
                        var objReturn = {
                            error: [],
                            xml: '',
                            schema: '',
                            obj: {
                                succes: false,
                            },
                            input: {
                                custparam_tranid: recordObj.id,
                                custparam_trantype: recordObj.type,
                                custparam_mode: adendaName,
                            }
                        };
                        objReturn.obj = getDataHDepot(recordObj.id, recordObj.type);
                        if (objReturn.obj.succes) {
                            xmlAddenda = getXmlHDepot(objReturn.obj.data);
                            log.emergency({ title: 'xmlAddenda HOMEDEPOT', details: xmlAddenda });
                            return xmlAddenda.data
                        }
                        break
                    case 'Chedrahui':
                        var objReturn = {
                            error: [],
                            xml: '',
                            schema: '',
                            obj: {
                                succes: false,
                            },
                            input: {
                                custparam_tranid: recordObj.id,
                                custparam_trantype: recordObj.type,
                                custparam_mode: adendaName,
                            }
                        };
                        objReturn.obj = getDataChedrahui(recordObj.id, recordObj.type);
                        if (objReturn.obj.succes) {
                            xmlAddenda = getXmlChedrahui(objReturn.obj.data);
                            log.emergency({ title: 'xmlAddenda Chedrahui', details: xmlAddenda });
                            return xmlAddenda.data
                        }
                        break
                    case 'VNA':
                        var plantilla = render.create();
                        // recordObjrecord, tipo_transaccion, tipo_transaccion_gbl, tipo_cp, id_transaccion,esAdenda
                        var result =invoiceFunctions.obtenercustomobject(recordObj, recordObj.type, recordObj.type,'', recordObj.id,true);
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
                        if (JSON.stringify(customJson) !== "{}") {
                            var alias = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].alias : "";
                            var format = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].format : "";
                            var data = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].data : "";
                            log.audit({ title: 'alias', details: JSON.stringify(alias) });
                            log.audit({ title: 'format', details: JSON.stringify(format) });
                            log.audit({ title: 'data', details: JSON.stringify(data) });
                            plantilla.addCustomDataSource({
                                alias: alias,
                                format:format,
                                data: data
                            });
                        }
                        plantilla.addRecord({
                            templateName: entityObj.type,
                            record: entityObj,
                        });
                        plantilla.addRecord({
                            templateName: 'transaction',
                            record: recordObj,
                        });
                        plantilla.templateContent = strContents;
                        content = plantilla.renderAsString();
                        break
                    default:
                        var plantilla = render.create();
                        let resultDirecciones = obtenerObjetoDirecciones(recordObj, entityObj);
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
                        plantilla.addRecord({
                            templateName: entityObj.type,
                            record: entityObj,
                        });
                        plantilla.addRecord({
                            templateName: 'transaction',
                            record: recordObj,
                        });
                        // VNA detalle de inventario
                        if(runtime.accountId.includes('6212323')){
                            let obtenerObjs = obtenObjs(recordObj.id, recordObj.type);
                            log.audit({ title: 'obtenerObjs.obj_detalleinv', details: obtenerObjs.obj_detalleinv });
                            var obj_detinvst = JSON.stringify(obtenerObjs.obj_detalleinv);
                            var obj_detinv = JSON.parse(obj_detinvst);
                            if (obj_detinv) {
                                plantilla.addCustomDataSource({
                                    alias: 'detalleInventario',
                                    format: render.DataSource.OBJECT,
                                    data: obtenerObjs.obj_detalleinv
                                });
                            }
                        }
                        if (recordObj.getValue({ fieldId: 'subsidiary' }) !== '' && recordObj.getValue({ fieldId: 'subsidiary' }) !== null && typeof recordObj.getValue({ fieldId: 'subsidiary' }) !== undefined) {
                            var subsidiaria = record.load({
                                type: record.Type.SUBSIDIARY,
                                id: recordObj.getValue({ fieldId: 'subsidiary' })
                            });
                            plantilla.addRecord({
                                templateName: 'subsidiary',
                                record: subsidiaria,
                            });
                        }
                        plantilla.templateContent = strContents;
                        content = plantilla.renderAsString();
                }
                return content;
            } catch (err) {
                log.error({ title: 'Error occurred in getAdendaContents', details: err });
            }
        }
        function obtenObjs(tranid, trantype) {
            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
            var objetoData = {
                obj_cliente: {},
                obj_transaccion: {},
                obj_terminos: {},
                obj_subsidiaria: {},
                obj_subsidiaria_dir: {},
                obj_enviodir: {},
                obj_facturaciondir: {},
                obj_detalleinv: {},
                obj_pedimento: {},
            }
            var record_obj = record.load({
                type: trantype,
                id: tranid
            });
            var idcliente = record_obj.getValue({ fieldId: 'entity' });
            var iddirenvio = record_obj.getValue({ fieldId: 'shipaddresslist' });
            var iddirfacturacion = record_obj.getValue({ fieldId: 'billaddresslist' });
            var idterms = record_obj.getValue({ fieldId: 'terms' });
            var terms_obj = {};
            if (idterms) {
                terms_obj = record.load({
                    type: record.Type.TERM,
                    id: idterms
                });
            }
            var cliente_obj = record.load({
                type: 'customer',
                id: idcliente
            });

            if (SUBSIDIARIES) {
                var idsubsidiaria = record_obj.getValue({ fieldId: 'subsidiary' });
                var subsidiaria_obj = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: idsubsidiaria
                });
            } else {

                var subsidiaria_obj = config.load({
                    type: config.Type.COMPANY_INFORMATION
                });
            }

            var subrec_dir_sub = subsidiaria_obj.getSubrecord({
                fieldId: 'mainaddress'
            });


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

            //busca detalle inv

            try {
                var arrayDetalleInventario = new Array();
                var arrayInventario = new Array();
                var arrayNumerosdePedimento = new Array();
                var arrayPedimento = new Array();
                var objetoDetalleInventario = new Object();
                var arrayinventarioObj = new Array();

                var buscaFacdetalleinv = search.create({
                    type: search.Type.INVOICE,
                    filters: [
                        ['mainline', search.Operator.IS, 'F']
                        , 'AND',
                        ['internalid', search.Operator.ANYOF, tranid]
                        , 'AND',
                        ['cogs', search.Operator.IS, 'F']
                        , 'AND',
                        ['taxline', search.Operator.IS, 'F']
                    ],
                    columns: [
                        search.createColumn({
                            name: 'inventorynumber',
                            join: 'inventoryDetail',
                            label: ' Number'
                        })
                    ]
                });

                buscaFacdetalleinv.run().each(function (result) {

                    arrayInventario.push(result.getValue({
                        name: 'inventorynumber',
                        join: 'inventoryDetail'
                    }));

                    return true;
                });


                search.create({
                    type: search.Type.INVENTORY_DETAIL,
                    filters: [
                        ['inventorynumber', search.Operator.ANYOF, arrayInventario]
                    ],
                    columns: [
                        search.createColumn({
                            name: 'inventorynumber',
                            sort: search.Sort.ASC,
                            label: ' Number'
                        }),
                        search.createColumn({
                            name: 'custitemnumber_bit_pedimento',
                            join: 'inventoryNumber',
                            label: 'Pedimento Number'
                        })
                    ]
                }).run().each(function (result) {
                    var id = result.getValue({
                        name: 'custitemnumber_bit_pedimento',
                        join: 'inventoryNumber'
                    });

                    var serial = result.getText({ name: 'inventorynumber' });

                    if (!objetoDetalleInventario[serial]) {
                        objetoDetalleInventario[serial] = {
                            id: id,
                            serial: '',
                            dueDate: '',
                            color: '',
                            cc: '',
                            mark: '',
                            year: ''
                        }

                        if (arrayPedimento.indexOf(id) == -1) {
                            arrayPedimento.push(id);
                        }
                    }

                    return true;
                });

                if (arrayPedimento.length > 0) {
                    search.create({
                        type: 'customrecord_bit_pedimento',
                        filters: [
                            ['internalid', 'anyof', arrayPedimento]
                        ],
                        columns: [
                            search.createColumn({ name: 'name', label: 'Name' }),
                            search.createColumn({
                                name: 'custrecord_bit_fecha_entrega',
                                label: 'Fecha de Entrega'
                            }),
                            search.createColumn({ name: 'custrecord_bit_color', label: 'Color' }),
                            search.createColumn({ name: 'custrecord_bit_cilindraje', label: 'Cilindraje' }),
                            search.createColumn({ name: 'custrecord_bit_marca', label: 'Marca' }),
                            search.createColumn({ name: 'custrecord_bit_anio', label: 'Año' })
                        ]
                    }).run().each(function (result) {

                        var id = result.id;

                        for (key in objetoDetalleInventario) {
                            if (objetoDetalleInventario[key].id == id) {
                                objetoDetalleInventario[key].serial = key;
                                objetoDetalleInventario[key].dueDate = result.getValue({ name: 'custrecord_bit_fecha_entrega' });
                                objetoDetalleInventario[key].color = result.getText({ name: 'custrecord_bit_color' });
                                objetoDetalleInventario[key].cc = result.getText({ name: 'custrecord_bit_cilindraje' });
                                objetoDetalleInventario[key].mark = result.getText({ name: 'custrecord_bit_marca' });
                                objetoDetalleInventario[key].year = result.getText({ name: 'custrecord_bit_anio' });

                                arrayinventarioObj.push(objetoDetalleInventario[key]);
                                objetoDetalleInventario[key] = JSON.stringify(objetoDetalleInventario[key]);



                            }
                        }

                        return true;
                    });
                }

                log.audit({ title: 'arrayinventarioObj', details: arrayinventarioObj });
                log.audit({ title: 'objetoDetalleInventario', details: objetoDetalleInventario });

            } catch (error_detalle_inventario) {
                log.error({ title: 'error_detalle_inventario', details: error_detalle_inventario });
            }
            var objdetalle = {
                "DetalleInv": arrayinventarioObj
            }

            objetoData.obj_transaccion = record_obj;
            objetoData.obj_terminos = terms_obj;
            objetoData.obj_cliente = cliente_obj;
            objetoData.obj_subsidiaria = subsidiaria_obj;
            objetoData.obj_subsidiaria_dir = subrec_dir_sub;
            objetoData.obj_enviodir = enviodir_obj;
            objetoData.obj_facturaciondir = facturaciondir_obj;
            objetoData.obj_detalleinv = objdetalle;

            return objetoData;
        }
        const createFileOfAdenda = (fileContentAdenda, tranid) => {
            var data_to_return = {
                success: false,
                msg: '',
                idFileAdendaGenerated: ''
            }
            try {
                var idFolder = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_folder_certify' }) || '';
                if (idFolder != '') {
                    var fileObj = file.create({
                        name: 'Adenda_' + tranid + '.txt',
                        fileType: file.Type.PLAINTEXT,
                        contents: fileContentAdenda,
                        encoding: file.Encoding.UTF8,
                        folder: idFolder,
                        isOnline: true
                    });
                    data_to_return.success = true;
                    data_to_return.idFileAdendaGenerated = fileObj.save();
                } else {
                    data_to_return.success = false;
                    data_to_return.msg = 'Folder de timbrado no configurado. Favor de llenar campo en Configuración > Empresa > Preferencias Generales > Preferencias Personalizadas'
                }
            } catch (err) {
                log.error({ title: 'Error occurred in createFileOfAdenda', details: err });
                data_to_return.success = false;
                data_to_return.msg = 'Ocurrió un error al crear el archivo de la adenda:' + err
            }
            return data_to_return;
        }

        return { getDataSabritas, getxmlSabritas, fechaSplit, getDataHDepot, getXmlHDepot, getAdendaContents, createFileOfAdenda, getAdendaXML, submitFields2Transaction, regenerateAdendaXML }

    });
