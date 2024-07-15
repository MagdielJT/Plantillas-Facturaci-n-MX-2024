/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/https', 'N/log', 'N/record', 'N/search', 'N/runtime', 'N/file', 'N/xml'],
    /**
  * @param{https} https
  * @param{log} log
  * @param{record} record
  * @param{search} search
  */
    (https, log, record, search, runtime, file, xml) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function libreriaArticulos(obj_main, recordObj, lineCount, tipo_transaccion_gbl, tipo_transaccion_gbl_tipo) {

            var articuloGrupo;
            var arrayItemCodeIds = new Array();
            var arrayItemCode = new Array();

            for (var g = 0; g < lineCount; g++) {
                var tipoArticulo = recordObj.getSublistValue({
                    fieldId: 'itemtype',
                    sublistId: 'item',
                    line: g,
                });

                if (tipoArticulo === 'Subtotal') {
                    continue;
                }
                if (tipoArticulo === 'EndGroup') {

                    continue;
                }
                if (tipoArticulo === 'Discount') {
                    continue;
                }

                var itemCodeInArray = recordObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_mx_txn_line_sat_item_code',
                    line: g,
                });
                if (itemCodeInArray) {
                    arrayItemCodeIds.push(itemCodeInArray);
                }


            }
            log.audit({ title: 'arrayItemCodeIds', details: arrayItemCodeIds });


            if (arrayItemCodeIds.length > 0) {
                var buscaCodigosSat = search.create({
                    type: 'customrecord_mx_sat_item_code_mirror',
                    filters: [['internalid', search.Operator.ANYOF, arrayItemCodeIds]],
                    columns: [
                        search.createColumn({ name: 'custrecord_mx_ic_mr_code' }),
                        search.createColumn({ name: 'internalid' }),
                    ]
                });
                buscaCodigosSat.run().each(function (result) {
                    var objetolinea = {
                        internalid: '',
                        custrecord_mx_ic_mr_code: '',
                    }
                    objetolinea.internalid = result.getValue({ name: 'internalid' }) || '';
                    objetolinea.custrecord_mx_ic_mr_code = result.getValue({ name: 'custrecord_mx_ic_mr_code' }) || '';
                    log.audit({ title: 'objetolinea', details: objetolinea });
                    arrayItemCode.push(objetolinea);
                    return true;
                });
                log.audit({ title: 'arrayItemCode', details: arrayItemCode });

            }
            for (var a = 0; a < lineCount; a++) {
                var codigoArt = {
                    itemCode: ""
                };
                var tipoArticulo = recordObj.getSublistValue({
                    fieldId: 'itemtype',
                    sublistId: 'item',
                    line: a,
                });

                var objItem = {
                    line: 0,
                    discount: 0.0,
                    taxDiscount: 0.0,
                    whDiscountBaseAmount: 0.0,
                    whDiscountTaxAmount: 0.0,
                    taxes: {
                        taxItems: [],
                        whTaxItems: [],
                    },
                    parts: [],
                    totalDiscount: 0.0,
                    amtExcludeLineDiscount: 0.0,
                };

                objItem.line = a;
                objItem.type = tipoArticulo;
                var tienetaxret = recordObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_4601_witaxapplies',
                    line: a,
                });
                objItem.isWhtaxApplied = tienetaxret;

                if (recordObj.type == 'itemfulfillment') {
                    objItem.amount = 0.0;
                    objItem.rate = 0.0;
                    objItem.quantity = 0.0;
                    objItem.unitsText = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'unitsdisplay',
                        line: a,
                    });
                } else {
                    objItem.amount = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: a,
                    });
                    objItem.rate = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: a,
                    });
                    objItem.quantity = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: a,
                    });
                }

                if (tipo_transaccion_gbl && tipo_transaccion_gbl_tipo == 2) {
                    objItem.itemId = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_gbl_originitem',
                        line: a,
                    });
                    objItem.units = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_gbl_originunitm',
                        line: a,
                    });
                } else {
                    objItem.itemId = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: a,
                    });
                    objItem.units = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: a,
                    });
                }



                if (tipoArticulo === 'Subtotal') {
                    continue;
                }
                if (tipoArticulo === 'EndGroup') {

                    articuloGrupo.amount = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: a,
                    });

                    obj_main.items.push(articuloGrupo);
                    articuloGrupo = null;
                    continue;
                }

                if (tipoArticulo === 'Group') {
                    articuloGrupo = objItem;

                    var codigoitem = recordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_mx_txn_line_sat_item_code',
                        line: a,
                    })

                    for (var ac = 0; ac < arrayItemCode.length; ac++) {
                        if (codigoitem == arrayItemCode[ac].internalid) {
                            var campos = arrayItemCode[ac].custrecord_mx_ic_mr_code;
                            codigoArt.itemCode = campos;
                        }
                    }


                    obj_main.satcodes.items[a] = codigoArt;


                    continue;
                }
                //
                if (tipoArticulo === 'Discount') {
                    continue;
                }

                var descuetoAplicado = 0;
                if (recordObj.type != 'itemfulfillment') {
                    for (var i = a + 1; i < lineCount; i++) {
                        var tipoArticulo = recordObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemtype',
                            line: i,
                        });
                        if (tipoArticulo !== 'Discount') {
                            break;
                        }

                        if (obj_main.isWhtaxApplied) {
                            var descuentobaseWH = recordObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_4601_witaxbaseamount',
                                line: i,
                            });
                            descuentobaseWH = descuentobaseWH || 0.0;
                            var montoDescuento = recordObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: i,
                            });

                            objItem.whDiscountBaseAmount = objItem.whDiscountBaseAmount + Math.abs(descuentobaseWH);
                            objItem.discount = objItem.discount + Math.abs(montoDescuento);
                            objItem.taxDiscount = 0;
                        } else if (!obj_main.suiteTaxFeature) {
                            var montoDescuento = recordObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: i,
                            });
                            var descuentoTax = recordObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'tax1amt',
                                line: i,
                            });
                            objItem.discount = objItem.discount + Math.abs(montoDescuento);
                            objItem.taxDiscount = objItem.taxDiscount + Math.abs(descuentoTax);
                        }
                        descuetoAplicado++;
                    }
                }

                if (articuloGrupo) {
                    articuloGrupo.parts.push(objItem);
                } else {
                    obj_main.items.push(objItem);

                }

                var codigoitem = recordObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_mx_txn_line_sat_item_code',
                    line: a,
                })

                // var campos = search.lookupFields({
                //     id: codigoitem,
                //     type: 'customrecord_mx_sat_item_code_mirror',
                //     columns: ['custrecord_mx_ic_mr_code'],
                // });
                for (var ac = 0; ac < arrayItemCode.length; ac++) {
                    if (codigoitem == arrayItemCode[ac].internalid) {
                        var campos = arrayItemCode[ac].custrecord_mx_ic_mr_code;
                        codigoArt.itemCode = campos;
                    }
                }

                // codigoArt.itemCode = campos['custrecord_mx_ic_mr_code'];
                obj_main.satcodes.items[a] = codigoArt;
                a = a + descuetoAplicado;
            }
            return obj_main;
        }

        function tipoCFDI(tipo) {
            var tipoCFDI = {
                customsale_efx_fe_factura_global: 'I',
                invoice: 'I',
                cashsale: 'I',
                creditmemo: 'E',
                itemfulfillment: 'T',
            };
            return tipoCFDI[tipo]
        }

        function tiposImpuestosSuiteTax() {
            var filters = [];
            var columns = [];

            filters.push({
                name: 'doesnotaddtototal',
                operator: search.Operator.IS,
                values: 'T',
            });

            filters.push({
                name: 'country',
                operator: search.Operator.IS,
                values: 'MX',
            });

            columns.push({ name: 'internalid' });

            var transactionSearch = search.create({
                type: 'taxtype',
                columns: columns,
                filters: filters,
            });

            var taxcodeIDs = [];
            try {
                transactionSearch.run().each(function (result) {
                    taxcodeIDs.push(result.getValue({
                        name: 'internalid',
                    }));
                    return true;
                });
            } catch (e) {
                if (e.name === 'SSS_INVALID_SRCH_FILTER') {
                    log.debug('getSuiteTaxWithholdingTaxTypes', 'Old SuiteTax version. Not support Withholding Taxes.');
                } else {
                    throw e;
                }
            }

            return taxcodeIDs;
        }

        // function tipoRelacionCFDI (id) {
        //
        //     var fields = search.lookupFields({
        //         id: id,
        //         type: 'customrecord_mx_sat_rel_type',
        //         columns: ['custrecord_mx_sat_rel_type_code'],
        //     });
        //
        //
        //     return fields['custrecord_mx_sat_rel_type_code'];
        // }

        function obtenMetodoPago(id) {
            if (!id) {
                return;
            }

            var campos = search.lookupFields({
                id: id,
                type: 'customrecord_mx_mapper_values',
                columns: ['custrecord_mx_mapper_value_inreport', 'name'],
            });

            var objeto = {
                code: campos['custrecord_mx_mapper_value_inreport'],
                name: campos.name,
            };
            return objeto;
        }

        function obtenFormaPago(id) {
            if (!id) {
                return;
            }
            var campos = search.lookupFields({
                id: id,
                type: 'customrecord_mx_sat_payment_term',
                columns: ['custrecord_mx_sat_pt_code', 'name'],
            });

            var objeto = {
                code: campos['custrecord_mx_sat_pt_code'],
                name: campos.name,
            };

            return objeto;

        }

        function obtenUsoCfdi(id) {
            if (!id) {
                return;
            }
            var campos = search.lookupFields({
                id: id,
                type: 'customrecord_mx_sat_cfdi_usage',
                columns: ['custrecord_mx_sat_cfdi_code', 'name'],
            });

            var objeto = {
                code: campos['custrecord_mx_sat_cfdi_code'],
                name: campos.name,
            };
            return objeto;

        }

        function pagoData(recordObj, obj_main, sublista, id_transaccion, importeotramoneda) {
            var applyCount = recordObj.getLineCount({
                sublistId: sublista,
            });

            log.debug('applyCount: ', applyCount);

            var applyData = [];
            var columnas;
            var idpag;
            var formaPago;
            var aplicado = false;

            var multi = runtime.isFeatureInEffect({ feature: 'multicurrency' });
            var campoMontoId = '';
            if (multi) {
                campoMontoId = 'fx' + 'amountremaining';
            } else {
                campoMontoId = 'amountremaining';
            }

            if (sublista == 'apply') {
                columnas = [
                    'custbody_mx_cfdi_uuid',
                    'custbody_mx_cfdi_serie',
                    'custbody_mx_cfdi_folio',
                    'internalid',
                    'custbody_mx_txn_sat_payment_term',
                    'custbody_efx_fe_tax_json',
                    'exchangerate',
                    campoMontoId,
                ];
            }
            var divisas = false;
            if (multi) {
                columnas.push('currency');
                divisas = true;
            }

            var idfacturaslinea = new Array();
            var datafacturaslinea = new Array();

            for (var i = 0; i < applyCount; i++) {
                aplicado = recordObj.getSublistValue({
                    fieldId: 'apply',
                    sublistId: sublista,
                    line: i,
                });

                if (!aplicado) {
                    continue;
                }
                var poliza = recordObj.getSublistValue({
                    fieldId: 'type',
                    sublistId: sublista,
                    line: i,
                });
                if (poliza == "Journal") {
                    continue;
                }
                idfacturaslinea.push(recordObj.getSublistValue({
                    fieldId: 'internalid',
                    sublistId: sublista,
                    line: i,
                }));
            }

            log.audit({ title: 'idfacturaslinea', details: idfacturaslinea });

            var buscalineasfacturas = search.create({
                type: search.Type.TRANSACTION,
                filters: [['internalid', search.Operator.ANYOF, idfacturaslinea], 'AND', ['mainline', search.Operator.IS, 'T']],
                columns: columnas,
            });

            var fomapagoArrayIds = new Array();
            var fomapagoArray = new Array();
            var monedaArrayIds = new Array();
            var monedaArray = new Array();

            buscalineasfacturas.run().each(function (result) {
                var objetolinea = {
                    custbody_mx_cfdi_uuid: '',
                    custbody_mx_cfdi_serie: '',
                    custbody_mx_cfdi_folio: '',
                    internalid: '',
                    custbody_mx_txn_sat_payment_term: '',
                    currency: '',
                    custbody_efx_fe_tax_json: '',
                    exchangerate: ''
                }
                objetolinea.custbody_mx_cfdi_uuid = result.getValue({ name: 'custbody_mx_cfdi_uuid' }) || '';
                objetolinea.custbody_mx_cfdi_serie = result.getValue({ name: 'custbody_mx_cfdi_serie' }) || '';
                objetolinea.custbody_mx_cfdi_folio = result.getValue({ name: 'custbody_mx_cfdi_folio' }) || '';
                objetolinea.internalid = result.getValue({ name: 'internalid' }) || '';
                objetolinea.custbody_mx_txn_sat_payment_term = result.getValue({ name: 'custbody_mx_txn_sat_payment_term' }) || '';
                objetolinea.custbody_efx_fe_tax_json = result.getValue({ name: 'custbody_efx_fe_tax_json' }) || '';
                objetolinea.exchangerate = result.getValue({ name: 'exchangerate' }) || '';
                if (multi) {
                    objetolinea.currency = result.getValue({ name: 'currency' }) || '';
                }
                objetolinea[campoMontoId] = result.getValue({ name: campoMontoId }) || 0;
                if (objetolinea[campoMontoId] == '.00') {
                    objetolinea[campoMontoId] = 0;
                }
                datafacturaslinea.push(objetolinea);

                if (objetolinea.custbody_mx_txn_sat_payment_term) {
                    fomapagoArrayIds.push(objetolinea.custbody_mx_txn_sat_payment_term);
                }
                if (objetolinea.currency) {
                    monedaArrayIds.push(objetolinea.currency);
                }
                return true;
            });

            log.audit({ title: 'fomapagoArrayIds', details: fomapagoArrayIds });
            var columnasFormaPago = [
                'custrecord_mx_sat_pt_code',
                'name',
                'internalid'
            ];
            var buscaformasPago = search.create({
                type: 'customrecord_mx_sat_payment_term',
                filters: [['internalid', search.Operator.ANYOF, fomapagoArrayIds]],
                columns: columnasFormaPago,
            });

            buscaformasPago.run().each(function (result) {
                var objetolineaFpago = {
                    custrecord_mx_sat_pt_code: '',
                    name: '',
                    internalid: ''
                }
                objetolineaFpago.custrecord_mx_sat_pt_code = result.getValue({ name: 'custrecord_mx_sat_pt_code' }) || '';
                objetolineaFpago.name = result.getValue({ name: 'name' }) || '';
                objetolineaFpago.internalid = result.getValue({ name: 'internalid' }) || '';
                fomapagoArray.push(objetolineaFpago);
                return true;
            });
            var buscaMonedas = search.create({
                type: 'currency',
                filters: [['internalid', search.Operator.ANYOF, monedaArrayIds]],
                columns: ['symbol', 'internalid'],
            });

            buscaMonedas.run().each(function (result) {
                var objMoneda = {
                    internalid: '',
                    symbol: ''
                }
                objMoneda.internalid = result.getValue({ name: 'internalid' });
                objMoneda.symbol = result.getValue({ name: 'symbol' });

                monedaArray.push(objMoneda);
                return true;
            });
            log.audit({ title: 'monedaArray', details: monedaArray });
            log.audit({ title: 'fomapagoArray', details: fomapagoArray });
            log.audit({ title: 'datafacturaslinea', details: datafacturaslinea });

            for (var x = 0; x < applyCount; x++) {

                aplicado = recordObj.getSublistValue({
                    fieldId: 'apply',
                    sublistId: sublista,
                    line: x,
                });

                if (!aplicado) {
                    continue;
                }
                log.audit({ title: 'aplicado', details: aplicado });
                var idfact = recordObj.getSublistValue({
                    fieldId: 'internalid',
                    sublistId: sublista,
                    line: x,
                });

                log.audit({ title: 'idfact', details: idfact });
                for (var d = 0; d < datafacturaslinea.length; d++) {
                    if (idfact == datafacturaslinea[d].internalid) {
                        idpag = datafacturaslinea[d];

                        if (!idpag['custbody_mx_cfdi_folio']) {
                            delete idpag['custbody_mx_cfdi_folio'];
                        }
                        if (!idpag['custbody_mx_cfdi_serie']) {
                            delete idpag['custbody_mx_cfdi_serie'];
                        }

                        idpag.id = idpag.internalid;
                        formaPago = idpag['custbody_mx_txn_sat_payment_term'] ? idpag['custbody_mx_txn_sat_payment_term'] : null;

                        var obj_pay = { code: '', name: '' };
                        for (var fp = 0; fp < fomapagoArray.length; fp++) {
                            if (fomapagoArray[fp].internalid == formaPago) {
                                obj_pay = {
                                    code: fomapagoArray[fp].custrecord_mx_sat_pt_code,
                                    name: fomapagoArray[fp].name,
                                };
                            }
                        }
                        // var campos = search.lookupFields({
                        //     id: formaPago,
                        //     type: 'customrecord_mx_sat_payment_term',
                        //     columns: ['custrecord_mx_sat_pt_code','name'],
                        // });


                        log.audit({ title: 'obj_pay', details: obj_pay });

                        var code = obj_pay.code;

                        if (idpag.internalid) {
                            obj_main.satcodes.paymentTermInvMap['d' + idpag.internalid] = code;
                        }

                        obj_main.satcodes.paymentTerm = code;
                        obj_main.satcodes.paymentTermName = obj_pay.name;


                        if (idpag.currency) {

                            for (var m = 0; m < monedaArray.length; m++) {
                                if (monedaArray[m].internalid == idpag.currency) {
                                    idpag.currencysymbol = idpag.currency ? monedaArray[m].symbol : null;
                                }
                            }


                        }
                        idpag.line = x;
                        idpag.sublistId = sublista;

                        idpag.order = '';
                        idpag.amountdue = idpag[campoMontoId] ? parseFloat(idpag[campoMontoId]) : 0.0;

                        applyData.push(idpag);

                    }
                }

            }
            log.audit({ title: 'applyData', details: applyData });
            applyData = infoPayment(applyData, id_transaccion, importeotramoneda, multi);

            return applyData;

        }

        function infoPayment(applyData, id_transaccion, importeotramoneda, multi) {
            var idFacturas = new Array();

            var aplfilter = ["appliedtotransaction", "anyof"];
            for (var i = 0; i < applyData.length; i++) {
                idFacturas.push(applyData[i].internalid);
                aplfilter.push(applyData[i].internalid);
            }

            var customerpaymentSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["type", "anyof", "CustPymt", "CustCred"],
                        "AND",
                        aplfilter,
                        "AND",
                        ["appliedtotransaction", "noneof", "@NONE@"]

                    ],
                columns:
                    [
                        search.createColumn({ name: "ordertype", label: "Tipo de orden de compra" }),
                        search.createColumn({ name: "mainline", label: "*" }),
                        search.createColumn({ name: "trandate", label: "Fecha" }),
                        search.createColumn({ name: "asofdate", label: "Fecha inicial" }),
                        search.createColumn({ name: "postingperiod", label: "Período" }),
                        search.createColumn({ name: "taxperiod", label: "Período fiscal" }),
                        search.createColumn({ name: "type", label: "Tipo" }),
                        search.createColumn({ name: "appliedtotransaction", sort: search.Sort.ASC, label: "Aplicado a la transacción" }),
                        search.createColumn({ name: "trandate", sort: search.Sort.ASC, label: "Número de documento" }),
                        search.createColumn({ name: "internalid", label: "Número de documento" }),
                        search.createColumn({ name: "tranid", join: "appliedtotransaction", label: "Aplicado a la transacción" }),
                        search.createColumn({ name: "tranid", label: "Número de documento" }),
                        search.createColumn({ name: "amount", join: "appliedtotransaction", label: "Aplicado a la transacción" }),
                        search.createColumn({ name: "fxamount", join: "appliedtotransaction", label: "Aplicado a la transacción FX" }),
                        search.createColumn({ name: "amount", label: "Importe" }),
                        search.createColumn({ name: "appliedtolinkamount", label: "Aplicado al importe de vínculo" }),
                        search.createColumn({ name: "appliedtoforeignamount", label: "Aplicado al importe de vínculo FX" }),

                    ]
            });

            var srchPaged = customerpaymentSearchObj.runPaged({ pageSize: 1000 });
            var jsontransactions = {};
            srchPaged.pageRanges.forEach(function (pageRange) {
                var myPage = srchPaged.fetch({ index: pageRange.index });
                myPage.data.forEach(function (result) {
                    var invoiceid = result.getValue({ name: "appliedtotransaction", sort: search.Sort.ASC, label: "Aplicado a la transacción" }) * 1;
                    var paymenttranid = result.getValue({ name: "tranid", label: "Número de documento" });
                    var type = result.getValue({ name: "type", label: "Tipo" });
                    log.debug("type " + paymenttranid, type);

                    if (multi) {
                        var invoiceamount = result.getValue({ name: "fxamount", join: "appliedtotransaction", label: "Aplicado a la transacción" });
                    } else {
                        var invoiceamount = result.getValue({ name: "amount", join: "appliedtotransaction", label: "Aplicado a la transacción" });
                    }


                    if (multi) {
                        var amount = result.getValue({ name: "appliedtoforeignamount", label: "Aplicado al importe de vínculo" });
                    } else {
                        var amount = result.getValue({ name: "appliedtolinkamount", label: "Aplicado al importe de vínculo" });
                    }
                    var paymentid = result.id;
                    var paymenttext = result.getText({ name: "appliedtotransaction", sort: search.Sort.ASC, label: "Aplicado a la transacción" });


                    if (!jsontransactions[invoiceid]) {
                        jsontransactions[invoiceid] = { "payments": {} };
                        jsontransactions[invoiceid]["consecutive"] = 0;
                        jsontransactions[invoiceid]["amount"] = invoiceamount;
                        jsontransactions[invoiceid]["aplicadoaFactura"] = amount;
                        jsontransactions[invoiceid]["insoluteamount"] = invoiceamount;
                        jsontransactions[invoiceid]["insoluteamount"] = invoiceamount;
                    }

                    jsontransactions[invoiceid]["id"] = invoiceid;
                    if (type == 'CustPymt') {
                        jsontransactions[invoiceid]["consecutive"]++;

                        if (!jsontransactions[invoiceid]["payments"][paymentid]) {
                            var insolute = Math.round(jsontransactions[invoiceid]["insoluteamount"] * 100) / 100;
                            jsontransactions[invoiceid]["payments"][paymentid] = { "paymenttranid": paymenttranid, "paymentid": paymentid, "paymenttext": paymenttext, "consecutive": jsontransactions[invoiceid]["consecutive"], "amount": amount, "insoluteamount": insolute };
                        }
                    }


                    jsontransactions[invoiceid]["insoluteamount"] -= (amount * 1 < 0) ? amount * -1 : amount * 1;

                    return true;
                });
                return true;
            });

            log.debug("reduce jsontransactions", jsontransactions);
            var paymentarray = [];
            var key = (id_transaccion + "");
            log.debug("reduce reduceContext.key", id_transaccion);

            for (var i in jsontransactions) {
                //log.debug("reduce i", i);
                var invoicedata = jsontransactions[(i + "")];
                //log.debug("reduce invoicedata", invoicedata);


                var paymentdata = invoicedata.payments[key];
                //log.debug("reduce paymentdata", paymentdata);
                var paymentdatasplit = paymentdata.paymenttext.split("#");
                // log.debug("reduce paymentdatasplit", paymentdatasplit);
                var reference = paymentdatasplit[1];
                paymentarray.push({ "facturaId": invoicedata.id, "facturaRef": reference, "parcialidad": paymentdata.consecutive * 1, "imp": paymentdata.insoluteamount * 1 });
                for (var x = 0; x < applyData.length; x++) {
                    if (applyData[x].internalid == invoicedata.id) {
                        applyData[x].facturaId = invoicedata.id;
                        applyData[x].facturaRef = reference;
                        applyData[x].parcialidad = paymentdata.consecutive * 1;
                        applyData[x].imp = paymentdata.insoluteamount * 1;
                        applyData[x].montoFactura = invoicedata.amount;
                        applyData[x].montoAplicadoFactura = paymentdata.amount;
                    }
                }
            }
            return applyData;
        }

        function summaryData(obj_main) {
            var subtotalSummary = 0;
            var totalDiscountSummary = 0;
            obj_main.items.map(function (item) {
                if (item.amount) {
                    subtotalSummary = subtotalSummary + item.amount
                }
                if (item.totalDiscount) {
                    totalDiscountSummary = totalDiscountSummary + item.totalDiscount;
                }

            });
            obj_main.summary.subtotal = subtotalSummary;
            obj_main.summary.totalDiscount = totalDiscountSummary;

            return obj_main.summary;
        }
        const onRequest = (scriptContext) => {
            // Get ID of Transaction to test
            // var scriptObj = runtime.getCurrentScript();
            // var id_transaccion_test = scriptObj.getParameter({ name: 'custscript_mx_plus_test_invoice' });
            // log.emergency({ title: 'id_transaccion_test', details: id_transaccion_test });

            // VARIABLES DE PRUEBA, NO DEJAR HARDCODEADO 
            // hardcodeado ⛳
            var url_str = "https://services.test.sw.com.mx/";
            // Usuario es Buena Prensa
            // hardcodeado ⛳
            var user_email = "ONB-ONB520707VD0@tekiio.mx";
            // hardcodeado ⛳
            var user_password = "mQ*wP^e52K34";
            try {
                var request = scriptContext.request;
                var parameters = request.parameters;
                var response = scriptContext.response;
                var response_to_send = { success: false, msg: '' };
                // Get authentication from user in SW
                var bearer_token = getAuthenticationToken(
                    url_str,
                    user_email,
                    user_password
                );
                log.audit({ title: "bearer_token", details: bearer_token });
                if (bearer_token.successful) {

                    log.audit({ title: "bearer_token.token", details: bearer_token.token });
                    // hardcodeado ⛳
                    var data_to_stamp = fetchConceptos(parameters.tranid);
                    // var data_to_stamp = fetchConceptos(parameters.tranid);
                    var headers = {
                        "Content-Type": 'application/jsontoxml',
                        "Authorization": "Bearer " + bearer_token.token
                    };
                    var response_stamp = https.post({
                        // hardcodeado ⛳
                        url: 'https://services.test.sw.com.mx/v3/cfdi33/issue/json/v4',
                        headers: headers,
                        body: JSON.stringify(data_to_stamp)

                    });
                    log.emergency({ title: 'response_stamp', details: JSON.stringify(response_stamp) });
                    if (response_stamp.code == 200) {

                        log.audit({ title: 'response_stamp.body', details: JSON.stringify(response_stamp.body) });
                        var response_json_stamp = JSON.parse(response_stamp.body);
                        log.audit({ title: 'response_json_stamp 🌟🌟🌟', details: response_json_stamp });
                        if (response_json_stamp.data) {
                            var tranid_text = parameters.tranid;
                            // It is stamped and there is the XML file but as string, just parse it
                            if (Object.keys(response_json_stamp.data.cfdi).length !== 0) {
                                // DO NOT LEAVE COMMENTED
                                // var file_id_saved = save_xml_file(response_json_stamp.data.cfdi, parameters.tranid, tranid_text);
                                // var file_id_generated = save_json_file(JSON.stringify(data_to_stamp), parameters.tranid, tranid_text, 'txt');
                                // var save_stamp_information = save_stamp_info(response_json_stamp.data, parameters.tranid);
                                // if (file_id_saved && file_id_generated && save_stamp_information) {
                                //     response_to_send.success = true;
                                //     response_to_send.msg = 'Se ha generado y certificado con éxito';
                                // } else {
                                //     response_to_send.success = false;
                                //     response_to_send.msg = 'Error al guardar el archivo';

                                // }
                            } else {
                                // DO NOT LEAVE COMMENTED
                                // var file_id_generated = save_json_file(JSON.stringify(data_to_stamp), parameters.tranid, tranid_text, 'txt');
                                response_to_send.success = false;
                                response_to_send.msg = 'Error al timbrar factura de venta: ' + response_json_stamp.messageDetail;
                            }
                        }
                    } else {
                        if (response_stamp.body) {
                            // DO NOT LEAVE COMMENTED
                            // var file_id_generated = save_json_file(JSON.stringify(data_to_stamp), parameters.tranid, parameters.tranid, 'txt');

                            var body_obj = JSON.parse(response_stamp.body)
                            response_to_send.success = false;
                            response_to_send.msg = body_obj.message + ' - ' + body_obj.messageDetail;
                        }
                    }
                } else {
                    response_to_send.success = false;
                    response_to_send.msg = 'Credenciales incorrectas, favor de contactar a soporte';
                }

                log.audit({ title: 'response_to_send', details: response_to_send });
                response.write({
                    output: JSON.stringify(response_to_send),
                });
            } catch (err) {
                log.error({ title: 'Error occurred in onRequest', details: err });
            }
        }
        function save_json_file(data, id_transaccion, tranid_text, extension) {
            try {
                var fileObj = file.create({
                    name: 'FACTURA_' + tranid_text + '.' + extension,
                    fileType: file.Type.PLAINTEXT,
                    contents: data,
                    encoding: file.Encoding.UTF8,
                    folder: 360480,
                    isOnline: true
                });
                var fileId_generated = fileObj.save();
                // Save the file in document field of MX+ XML Certificado
                record.submitFields({
                    type: record.Type.INVOICE,
                    id: id_transaccion,
                    values: {
                        custbody_mx_plus_xml_generado: fileId_generated,
                        custbody_psg_ei_generated_edoc: fileId_generated
                    },
                    options: {
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    }
                });
                return fileId_generated
            } catch (err) {
                log.error({ title: 'Error occurred in save_json_file', details: err });
            }
        }
        function save_xml_file(data, id_transaccion, tranid_text) {
            try {

                var fileObj = file.create({
                    name: 'FACTURA_' + tranid_text + '.xml',
                    fileType: file.Type.PLAINTEXT,
                    contents: data,
                    encoding: file.Encoding.UTF8,
                    folder: 360480,
                    isOnline: true
                });
                var fileId_stamped = fileObj.save();
                // Save the file in document field of MX+ XML Certificado
                record.submitFields({
                    type: record.Type.INVOICE,
                    id: id_transaccion,
                    values: {
                        custbody_mx_plus_xml_certificado: fileId_stamped,
                        custbody_psg_ei_certified_edoc: fileId_stamped

                    },
                    options: {
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    }
                });
                return fileId_stamped

            } catch (err) {
                log.error({ title: 'Error occurred in save_xml_file', details: err });
                return 0;
            }
        }
        function save_stamp_info(data, id_transaccion) {
            try {
                record.submitFields({
                    type: record.Type.INVOICE,
                    id: id_transaccion,
                    values: {
                        custbody_mx_cfdi_qr_code: data.qrCode,
                        custbody_mx_cfdi_uuid: data.uuid,
                        custbody_mx_cfdi_sat_serial: data.noCertificadoSAT,
                        custbody_mx_cfdi_sat_signature: data.selloSAT,
                        custbody_mx_cfdi_signature: data.selloCFDI,
                        custbody_mx_cfdi_cadena_original: data.cadenaOriginalSAT,
                        custbody_mx_cfdi_certify_timestamp: data.fechaTimbrado,
                        custbody_mx_cfdi_issuer_serial: data.noCertificadoCFDI
                    },
                    options: {
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    }
                });
                return true
            } catch (err) {
                log.error({ title: 'Error occurred in save_stamp_info', details: err });
                return false
            }
        }
        const fetchConceptos = (id_transaccion) => {
            try {
                var data_to_return = {
                    "Version": "4.0",
                    "FormaPago": "01",
                    "Serie": "SW",
                    "Folio": "123456",
                    "Fecha": "",
                    "MetodoPago": "PUE",
                    "Sello": "",
                    "NoCertificado": "",
                    "Certificado": "",
                    "CondicionesDePago": "CondicionesDePago",
                    "Moneda": "MXN",
                    "TipoCambio": "1",
                    "TipoDeComprobante": "I",
                    "Exportacion": "01",
                    "LugarExpedicion": "45610",
                    "Emisor": {
                        "Rfc": "EKU9003173C9",
                        "Nombre": "ESCUELA KEMPER URGATE",
                        "RegimenFiscal": "603"
                    },
                    "Receptor": {
                        "Rfc": "EKU9003173C9",
                        "Nombre": "ESCUELA KEMPER URGATE",
                        "DomicilioFiscalReceptor": "42501",
                        "RegimenFiscalReceptor": "601",
                        "UsoCFDI": "CP01"
                    },
                    "SubTotal": "",
                    "Total": "",
                    "Descuento": "",
                    "Conceptos": [],



                };
                // Setting the current date in Mexico City timezone
                const currentDate = new Date();
                const offset = -6; // Mexico City timezone offset from UTC in hours
                const offsetSign = offset > 0 ? '-' : '+';
                const absOffset = Math.abs(offset);
                const offsetHours = String(Math.floor(absOffset)).padStart(2, '0');
                const offsetMinutes = String((absOffset % 1) * 60).padStart(2, '0');
                const timezone = `${offsetSign}${offsetHours}:${offsetMinutes}`;

                const formattedDate2 = currentDate.toISOString().slice(0, 19) + timezone;
                data_to_return.Fecha = formattedDate2;
                var record_trans = record.load({
                    type: "invoice",
                    id: id_transaccion,
                    isDynamic: false,
                });
                log.audit({ title: 'record_trans', details: record_trans });
                var items_custom_object = obtenercustomobject(record_trans, 'invoice', 'invoice', '', id_transaccion);
                log.emergency({ title: 'items_custom_object 🐝', details: items_custom_object });
                var number_items = record_trans.getLineCount({
                    sublistId: 'item'
                });
                var tax_json_transaccion = record_trans.getValue({
                    fieldId: 'custbody_efx_fe_tax_json'
                });
                log.audit({ title: 'tax_json_transaccion 🦎', details: tax_json_transaccion });
                // Trae valores de subtotal,total,descuento
                var totales_transaccion = fetchTotales(JSON.parse(tax_json_transaccion));
                // Asignacion de subtotal, total y descuento
                data_to_return.SubTotal = totales_transaccion.SubTotal;
                // data_to_return.SubTotal = totales_transaccion.SubTotal;
                data_to_return.Descuento = totales_transaccion.Descuento;
                data_to_return.Total = totales_transaccion.Total;
                // Trae el objeto de impuestos para mandar a timbrado
                var impuestos_global = fetchTotalImpuestos(JSON.parse(tax_json_transaccion))
                log.audit({ title: 'number_items', details: number_items });
                let totalesCalculados = sacaCalculosTotales(record_trans, number_items);
                log.debug({ title: 'totalesCalculados 🧀🐢', details: totalesCalculados });
                // Trae objeto de conceptos con sus impuestos
                for (var i = 0; i < number_items; i++) {
                    // declare obj to push in data to return
                    var obj_data_conceptos = {};
                    // extract tax json from item
                    var item_tax_json = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_tax_json',
                        line: i,
                    });
                    // extract default info of item
                    var claveProdServ_id = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_mx_txn_line_sat_item_code_display',
                        // fieldId: 'custcol_mx_txn_line_sat_item_code',
                        line: i,
                    });

                    var claveProdServ = (claveProdServ_id).split(' - ')[0];
                    // var claveProdServ = fetchClaveProdServ(claveProdServ_id);
                    var noIdentificacion = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item_display',
                        line: i,
                    });
                    var cantidad = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i,
                    });
                    // Clave unidad trae el id de la lista, hay que ir a buscar el valor real
                    // var claveUnidad_id = record_trans.getSublistValue({
                    //   sublistId: 'item',
                    //   fieldId: 'custcol_bit_fact_e_clave_unidad',
                    //   line: i,
                    // });
                    // // busca en lista el valor que le corresponde
                    // var claveUnidad = fetchClaveUnidad(claveUnidad_id);
                    claveUnidad = items_custom_object[i].satUnitCode;
                    var unidad = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'units_display',
                        line: i,
                    });
                    var descripcion = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: i,
                    });
                    var valorUnitario = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i,
                    });
                    var importe = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: i,
                    });
                    item_tax_json = JSON.parse(item_tax_json);
                    var descuento = parseFloat(item_tax_json.descuentoSinImpuesto).toFixed(2);
                    var objetoImp_singleNumber = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_mx_txn_line_sat_tax_object',
                        line: i,
                    });
                    var objetoImp = convertObjetoImp(objetoImp_singleNumber);

                    var impuestos = fetchImpuestos(item_tax_json);
                    // log.audit({ title: 'impuestos 🌟', details: impuestos });
                    obj_data_conceptos.ClaveProdServ = claveProdServ;
                    obj_data_conceptos.NoIdentificacion = noIdentificacion;
                    obj_data_conceptos.Cantidad = cantidad;
                    obj_data_conceptos.ClaveUnidad = claveUnidad;
                    obj_data_conceptos.Unidad = unidad;
                    obj_data_conceptos.Descripcion = descripcion;
                    obj_data_conceptos.ValorUnitario = valorUnitario.toFixed(2);
                    obj_data_conceptos.Importe = importe.toFixed(2);
                    obj_data_conceptos.Descuento = descuento;
                    obj_data_conceptos.ObjetoImp = objetoImp;
                    obj_data_conceptos.Impuestos = impuestos;
                    // obj_data_conceptos.Impuestos = JSON.stringify(impuestos);
                    data_to_return.Conceptos.push(obj_data_conceptos)
                    // log.audit({title:'claveUnidad',details:claveUnidad});

                    // log.audit({title:'item_tax_json',details:item_tax_json});


                }
                // Si tiene COSTO DE ENVIO, AGREGALO COMO CONCEPTO
                var objTaxJsonTrans = JSON.parse(tax_json_transaccion);
                // if (objTaxJsonTrans.shipping_cost !== '' && objTaxJsonTrans.shipping_cost !== 0) {
                //     var claveProd = record_trans.getValue({ fieldId: 'custbody_efx_fe_sat_cps_envio' })
                //     var shipmethod = record_trans.getValue({ fieldId: 'shipmethod' })
                //     var obj_data_shipping = {
                //         Cantidad: 1,
                //         ClaveProdServ: claveProd,
                //         ClaveUnidad: 'E48',
                //         Descripcion: shipmethod,
                //         Importe: objTaxJsonTrans.shipping_cost,
                //         ValorUnitario: objTaxJsonTrans.shipping_cost,
                //         Descuento: '0.00',
                //         ObjetoImp: '02',
                //         Impuestos: { Traslados: [] }
                //     }

                //         obj_data_shipping.Impuestos.Traslados.push({
                //             Base: objTaxJsonTrans.shipping_cost,
                //             Importe: objTaxJsonTrans.shipping_tax,
                //             Impuesto:objTaxJsonTrans.shipping_tax_rate==0?'001': '002',
                //             TasaOCuota: '0.' + objTaxJsonTrans.shipping_tax_rate + '0000',
                //             TipoFactor: 'Tasa'
                //         });
                //     data_to_return.Conceptos.push(obj_data_shipping);
                // }

                data_to_return.Impuestos = {}
                data_to_return.Impuestos.TotalImpuestosTrasladados = totalesCalculados.TotalImpuestosTrasladados;
                // data_to_return.Impuestos.TotalImpuestosTrasladados = impuestos_global.TotalImpuestosTrasladados;
                data_to_return.Impuestos.TotalImpuestosRetenidos = impuestos_global.TotalImpuestosRetenidos;
                data_to_return.Impuestos.Retenciones = impuestos_global.Retenciones;
                data_to_return.Impuestos.Traslados = impuestos_global.Traslados;
                if (record_trans.getValue({ fieldId: 'custbody_mxplus_generated_adenda_file' }) != '') {
                    // log.debug({ title: 'has adenda', details: 'true' });
                    // var adenda_json = parseXML(record_trans.getValue({ fieldId: 'custbody_mxplus_generated_adenda_file' }));
                    // log.audit({ title: 'adenda_json', details: adenda_json });
                    // data_to_return.Addenda = {}
                }
                // data_to_return.Conceptos=JSON.stringify(data_to_return.Conceptos);

                log.audit({ title: 'data_to_return 🦀🦀', details: JSON.stringify(data_to_return) });
                return data_to_return;

            } catch (err) {
                log.error({ title: 'Error occurred in fetchConceptos', details: err });
            }
        }
        const sacaCalculosTotales = (recordTrans, cantidadLineas) => {
            try {
                var data_to_return = {
                    total_transaccion: 0,
                    TotalImpuestosTrasladados: 0
                }
                for (let i = 0; i < cantidadLineas; i++) {
                    var item_tax_json = recordTrans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_tax_json',
                        line: i,
                    });
                    log.debug({ title: 'item_tax_json sacaCalculosTotales', details: item_tax_json });
                    var impuestos = fetchImpuestos(JSON.parse(item_tax_json));
                    let traslados_array = impuestos.Traslados;
                    // TotalImpuestos => suma de los importes
                    //Total => base + importe
                    traslados_array.forEach((singleTraslado) => {
                        data_to_return.total_transaccion += parseFloat(singleTraslado.Base) + parseFloat(singleTraslado.Importe);
                        data_to_return.TotalImpuestosTrasladados += parseFloat(singleTraslado.Importe);
                    })
                    // log.debug({ title: 'impuestos sacaCalculosTotales', details: impuestos });
                }
                return data_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in sacaCalculosTotales', details: err });
            }
        }
        const parseXML = (fileId, content, prefixDelete) => {
            const objData = {}
            try {
                /* This part of the code is checking if the `fileId` parameter is provided. If `fileId` has a
                truthy value (meaning it is not null, undefined, 0, false, or an empty string), then it loads
                the file content using the `file.load({ id: fileId }).getContents()` method and parses it as
                XML using `xml.Parser.fromString()`. The resulting XML content is then assigned to the
                `content` variable for further processing in the `parseXML` function. */
                if (fileId) {
                    content = xml.Parser.fromString({
                        text: file.load({ id: fileId }).getContents()
                    })
                }
                /* The code snippet `if (typeof content === 'string) { content = xml.Parser.fromString({ text:
                content }) }` is checking if the `content` variable is of type string. If `content` is a
                string, it is being parsed as XML using the `xml.Parser.fromString()` method. This step
                ensures that even if the initial `content` was provided as a string, it is converted into an
                XML object for further processing in the `parseXML` function. */
                if (typeof content === 'string') {
                    content = xml.Parser.fromString({
                        text: content
                    })
                }
                /* This `switch` statement in the `parseXML` function is determining the type of the XML node
                being processed and handling it accordingly. Here's a breakdown of what each case is doing: */
                switch (content.nodeType) {
                    /* This part of the code is handling the case where the XML node type is an element node. */
                    case xml.NodeType.ELEMENT_NODE:
                        if (content.hasAttributes()) {
                            objData['attributes'] = {}
                            Object.keys(content.attributes).forEach(attr => {
                                if (content.hasAttribute({ name: attr })) {
                                    objData['attributes'][attr] = content.getAttribute({
                                        name: attr
                                    })
                                }
                            })
                        }
                        break
                    /* This part of the code is handling the case where the XML node type is a TEXT_NODE. */
                    case xml.NodeType.TEXT_NODE:
                        if (prefixDelete) {
                            const prefix = content.prefix
                            objData = content.nodeValue.replace(prefix, '')
                        } else {
                            objData = content.nodeValue
                        }
                        break
                }
                /* This part of the code is checking if the current XML node (`content`) has child nodes. If it
                does have child nodes, it iterates over each child node and processes them. Here's a breakdown
                of what the code is doing inside the `if (content.hasChildNodes()) { ... }` block: */
                if (content.hasChildNodes()) {
                    content.childNodes.forEach(child => {
                        let nodeName = ''
                        if (prefixDelete) {
                            const prefix = child.prefix + ':'
                            nodeName = child.nodeName.replace(prefix, '')
                        } else {
                            nodeName = child.nodeName
                        }
                        if (objData?.[nodeName]) {
                            if (Array.isArray(value)) {
                                objData[nodeName] = [objData[nodeName]]
                            }
                            objData[nodeName].push(parseXML(null, child, prefixDelete))
                        } else {
                            objData[nodeName] = parseXML(null, child, prefixDelete)
                        }
                    })
                }
            } catch (error) {
                log.error('Error on parseXML', error)
            }
            return objData
        }
        function obtenercustomobject(recordObjrecord, tipo_transaccion, tipo_transaccion_gbl, tipo_cp, id_transaccion) {

            var obj_main = {
                suiteTaxFeature: false,
                suiteTaxWithholdingTaxTypes: [],
                multiCurrencyFeature: true,
                oneWorldFeature: true,
                items: [],
                cfdiRelations: {},
                companyInfo: {
                    rfc: ""
                },
                itemIdUnitTypeMap: {},
                firstRelatedCfdiTxn: {},
                relatedCfdis: {
                    types: [],
                    cfdis: {}
                },
                billaddr: {
                    countrycode: ""
                },
                loggedUserName: "",
                summary: {
                    totalWithHoldTaxAmt: 0,
                    totalNonWithHoldTaxAmt: 0,
                    totalTaxAmt: 0,
                    discountOnTotal: 0,
                    includeTransfers: false,
                    includeWithHolding: false,
                    bodyDiscount: 0,
                    subtotal: 0,
                    subtotalExcludeLineDiscount: 0,
                    transfersTaxExemptedAmount: 0,
                    totalAmount: 0,
                    totalDiscount: 0,
                    totalTaxSum: 0,
                    totalSum: 0,
                    whTaxes: [],
                    transferTaxes: []
                },
                satcodes: {
                    items: [],
                    paymentTermInvMap: {},
                    paymentMethodInvMap: {},
                    whTaxTypes: {},
                    taxTypes: {},
                    paymentTermSatCodes: {},
                    paymentMethodCodes: {},
                    industryType: "",
                    industryTypeName: "",
                    paymentTerm: "",
                    paymentTermName: "",
                    paymentMethod: "",
                    paymentMethodName: "",
                    cfdiUsage: "",
                    cfdiUsageName: "",
                    proofType: "",
                    taxFactorTypes: {},
                    unitCodes: {}
                }
            }

            var recordObj = recordObjrecord;

            var lineCount = recordObj.getLineCount({
                sublistId: 'item',
            });
            var importeotramoneda = recordObj.getValue({
                fieldId: 'custbody_efx_fe_importe',
            });

            obj_main.multiCurrencyFeature = runtime.isFeatureInEffect({ feature: 'multicurrency' });
            obj_main.oneWorldFeature = runtime.isFeatureInEffect({ feature: 'subsidiaries' });
            obj_main.suiteTaxFeature = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
            obj_main.loggedUserName = runtime.getCurrentUser().name;
            //pendiente, probar con suitetax
            if (obj_main.suiteTaxFeature) {
                obj_main.suiteTaxWithholdingTaxTypes = tiposImpuestosSuiteTax();
            }

            if (tipo_transaccion != 'customerpayment' && tipo_transaccion != 'itemfulfillment') {
                var subRecord_bill = recordObj.getSubrecord({
                    fieldId: 'billingaddress',
                });
                obj_main.billaddr.countrycode = subRecord_bill.getValue('country');
            }

            //company info
            var registroCompania;
            if (obj_main.suiteTaxFeature && obj_main.oneWorldFeature) {
                registroCompania = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: recordObj.getValue('subsidiary'),
                });
                var lineCount = registroCompania.getLineCount({
                    sublistId: 'taxregistration',
                });

                var pais = '';
                for (var i = 0; i < lineCount; i++) {
                    pais = registroCompania.getSublistValue({
                        sublistId: 'taxregistration',
                        fieldId: 'nexuscountry',
                        line: i,
                    });
                    if (pais === 'MX') {
                        obj_main.companyInfo.rfc = registroCompania.getSublistValue({
                            sublistId: 'taxregistration',
                            fieldId: 'taxregistrationnumber',
                            line: i,
                        });
                        break;
                    }
                }
            } else if (obj_main.suiteTaxFeature) {
                registroCompania = config.load({
                    type: config.Type.COMPANY_INFORMATION,
                });

                var lineCount = registroCompania.getLineCount({
                    sublistId: 'taxregistration',
                });
                var pais = '';
                for (var i = 0; i < lineCount; i++) {
                    pais = registroCompania.getSublistValue({
                        sublistId: 'taxregistration',
                        fieldId: 'nexuscountry',
                        line: i,
                    });
                    if (pais === 'MX') {
                        obj_main.companyInfo.rfc = registroCompania.getSublistValue({
                            sublistId: 'taxregistration',
                            fieldId: 'taxregistrationnumber',
                            line: i,
                        });
                        break;
                    }
                }
            } else if (obj_main.oneWorldFeature) {
                registroCompania = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: recordObj.getValue('subsidiary'),
                });
                obj_main.companyInfo.rfc = registroCompania.getValue('federalidnumber');
            } else {
                registroCompania = config.load({
                    type: config.Type.COMPANY_INFORMATION,
                });
                obj_main.companyInfo.rfc = registroCompania.getValue('employerid');
            }

            if (registroCompania) {
                var idIndustria = registroCompania.getValue('custrecord_mx_sat_industry_type');
                var campos = search.lookupFields({
                    id: idIndustria,
                    type: 'customrecord_mx_sat_industry_type',
                    columns: ['custrecord_mx_sat_it_code', 'name'],
                });

                var objIdT = {
                    code: campos['custrecord_mx_sat_it_code'],
                    name: campos.name,
                };
                obj_main.satcodes.industryType = objIdT.code;
                obj_main.satcodes.industryTypeName = objIdT.name;
            }


            //inicia cfdirelationtypeinfo

            var lineCount = recordObj.getLineCount({
                sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
            });

            var relacionCFDI = {};
            var internalId = '';
            var tipoRelacion = '';
            var textoRelT = '';
            var primerRelacionadoCFDI = '';
            var arrayTiporelacionId = new Array();
            var arrayTiporelacionData = new Array();

            for (var p = 0; p < lineCount; p++) {

                var idOriginTran = recordObj.getSublistValue({
                    sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                    fieldId: 'custrecord_mx_rcs_rel_type',
                    line: p,
                });
                arrayTiporelacionId.push(idOriginTran);
            }

            log.audit({ title: 'arrayTiporelacionId', details: arrayTiporelacionId });

            if (arrayTiporelacionId.length > 0) {
                var tipodeRelacionSearch = search.create({
                    type: 'customrecord_mx_sat_rel_type',
                    filters: [['internalid', search.Operator.ANYOF, arrayTiporelacionId]],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: 'custrecord_mx_sat_rel_type_code' }),
                    ]
                });
                tipodeRelacionSearch.run().each(function (result) {
                    var obj_trelacion = {
                        id: '',
                        tiporelacion: ''
                    }
                    obj_trelacion.id = result.getValue({ name: 'internalid' });
                    obj_trelacion.tiporelacion = result.getValue({ name: 'custrecord_mx_sat_rel_type_code' });
                    log.audit({ title: 'obj_trelacion', details: obj_trelacion });
                    arrayTiporelacionData.push(obj_trelacion);
                    return true;
                });

            }
            log.audit({ title: 'arrayTiporelacionData', details: arrayTiporelacionData });

            for (var p = 0; p < lineCount; p++) {
                internalId = recordObj.getSublistValue({
                    sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                    fieldId: 'custrecord_mx_rcs_rel_cfdi',
                    line: p,
                }) + '';
                if (p == 0) {
                    primerRelacionadoCFDI = internalId;
                }
                var idOriginTran = recordObj.getSublistValue({
                    sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                    fieldId: 'custrecord_mx_rcs_rel_type',
                    line: p,
                });

                if (idOriginTran) {
                    for (var tr = 0; tr < arrayTiporelacionData.length; tr++) {
                        if (arrayTiporelacionData[tr].id == idOriginTran) {
                            tipoRelacion = arrayTiporelacionData[tr].tiporelacion;
                        }
                    }
                }

                textoRelT = relacionCFDI[tipoRelacion];
                if (!textoRelT) {
                    obj_main.relatedCfdis.types.push(tipoRelacion);
                    obj_main.relatedCfdis.cfdis['k' + (obj_main.relatedCfdis.types.length - 1)] = [{ index: p }];
                    relacionCFDI[tipoRelacion] = obj_main.relatedCfdis.types.length;
                } else {
                    obj_main.relatedCfdis.cfdis['k' + (textoRelT - 1)].push({ index: p });
                }
            }
            var esCreditMemo = recordObj.type;

            if (esCreditMemo == 'creditmemo' && primerRelacionadoCFDI) {
                var primerCFDIRelacionado = search.lookupFields({
                    type: 'transaction',
                    columns: ['custbody_mx_txn_sat_payment_method'],
                    id: primerRelacionadoCFDI,
                });
                var paymentMethod = primerCFDIRelacionado['custbody_mx_txn_sat_payment_method'];
                if (paymentMethod && paymentMethod[0]) {
                    obj_main.firstRelatedCfdiTxn.paymentMethodId = paymentMethod[0].value;
                }
            }

            var descuentototal = recordObj.getValue('discounttotal');

            if (descuentototal) {
                obj_main.summary.bodyDiscount = Math.abs(descuentototal);
            } else {
                obj_main.summary.bodyDiscount = 0.0;
            }

            log.audit({ title: 'objmain3', details: obj_main });

            var paymentTerm = recordObj.getValue('custbody_mx_txn_sat_payment_term');
            var paymentMethod = recordObj.getValue('custbody_mx_txn_sat_payment_method');

            var cfdiUsage = recordObj.getValue('custbody_mx_cfdi_usage');


            if (esCreditMemo == 'creditmemo') {
                //var objPaymentMet = libCFDI.obtenMetodoPago(obj_main.firstRelatedCfdiTxn.paymentMethodId);
                var objPaymentMet = obtenMetodoPago(paymentMethod);
                if (objPaymentMet) {
                    obj_main.satcodes.paymentMethod = objPaymentMet.code;
                    obj_main.satcodes.paymentMethodName = objPaymentMet.name;
                }
                obj_main.satcodes.paymentTerm = 'PUE';
                obj_main.satcodes.paymentTermName = 'PUE - Pago en una Sola Exhibición';
            } else {
                var objPaymentMet = obtenMetodoPago(paymentMethod);
                var objPaymentFor = obtenFormaPago(paymentTerm);
                if (objPaymentMet) {
                    obj_main.satcodes.paymentMethod = objPaymentMet.code;
                    obj_main.satcodes.paymentMethodName = objPaymentMet.name;
                }
                if (objPaymentFor) {
                    obj_main.satcodes.paymentTerm = objPaymentFor.code;
                    obj_main.satcodes.paymentTermName = objPaymentFor.name;
                }
            }

            var objUsoCfdi = obtenUsoCfdi(cfdiUsage);
            if (objUsoCfdi) {
                obj_main.satcodes.cfdiUsage = objUsoCfdi.code;
                obj_main.satcodes.cfdiUsageName = objUsoCfdi.name;
            }
            obj_main.satcodes.proofType = tipoCFDI(recordObj.type);

            var lineCount = recordObj.getLineCount({
                sublistId: 'item',
            });

            obj_main = libreriaArticulos(obj_main, recordObj, lineCount, tipo_transaccion_gbl);
            var articulosId = [];
            obj_main.items.map(function (articuloMap) {
                articulosId.push(articuloMap.itemId);
                articuloMap.parts.map(function (partes) {
                    articulosId.push(partes.itemId);
                });
            });
            if (tipo_transaccion != 'customerpayment') {
                var tipodeUnidad = search.create({
                    type: 'item',
                    filters: [['internalid', 'anyof', articulosId]],
                    columns: ['unitstype'],
                });

                tipodeUnidad.run().each(function (result) {
                    var unittypemap = result.getValue('unitstype');

                    obj_main.itemIdUnitTypeMap['k' + result.id] = result.getValue('unitstype');

                    return true;
                });
            }

            //attatchsatmapping

            // var satCodesDao = obj_main.satCodesDao;
            var clavesdeUnidad = {};

            function detallesDeImpuesto(articulo) {
                tieneItemParte(articulo);
                if (tipo_transaccion == 'creditmemo' && articulo.custcol_efx_fe_gbl_originunits) {
                    clavesdeUnidad[articulo.custcol_efx_fe_gbl_originunits] = true;
                } else {
                    clavesdeUnidad[articulo.units] = true;
                }
                // articulo.taxes.taxItems.map(function (taxLine) {
                //     satCodesDao.pushForLineSatTaxCode(taxLine.taxType);
                //     satCodesDao.pushForLineSatTaxFactorType(taxLine.taxCode);
                //
                // });
                // articulo.taxes.whTaxItems.map(function (taxLine) {
                //     satCodesDao.pushForLineSatTaxCode(taxLine.taxType,true);
                // });
            }

            function tieneItemParte(articulo) {
                if (articulo.parts) {
                    articulo.parts.map(function (parte) {
                        detallesDeImpuesto(parte);
                    });
                }
            }

            function codigosSatArticulos(items, codigosSat, idUnidades) {
                if (!items) {
                    return;
                }
                var objCodes;
                items.map(function (articulos) {
                    codigosSatArticulos(articulos.parts, codigosSat, idUnidades);
                    log.audit({ title: 'idUnidades', details: idUnidades });
                    log.audit({ title: 'articulos.itemId', details: articulos.itemId });
                    log.audit({ title: 'articulos.units', details: articulos.units });
                    if (tipo_transaccion == 'creditmemo' && articulos.custcol_efx_fe_gbl_originunits) {
                        objCodes = codigosSat.unitCodes['k' + idUnidades['k' + articulos.itemId] + '_' + articulos.custcol_efx_fe_gbl_originunits];
                    } else {
                        objCodes = codigosSat.unitCodes['k' + idUnidades['k' + articulos.itemId] + '_' + articulos.units];
                    }

                    articulos.satUnitCode = objCodes ? objCodes.code : '';
                    articulos.taxes.taxItems.map(function (lineaImpuesto) {
                        if (obj_main.suiteTaxFeature) {
                            objCodes = codigosSat.taxFactorTypes[lineaImpuesto.satTaxCodeKey];
                            lineaImpuesto.taxFactorType = objCodes ? objCodes.code : '';
                        } else {
                            lineaImpuesto.taxFactorType = lineaImpuesto.exempt ? 'Exento' : 'Tasa';
                        }

                        objCodes = codigosSat.taxTypes['k' + lineaImpuesto.taxType];
                        lineaImpuesto.satTaxCode = objCodes ? objCodes.code : '';
                    });
                    articulos.taxes.whTaxItems.map(function (lineaImpuesto) {
                        lineaImpuesto.taxFactorType = 'Tasa';
                        objCodes = codigosSat.whTaxTypes['k' + lineaImpuesto.taxType];
                        lineaImpuesto.satTaxCode = objCodes ? objCodes.code : '';
                    });
                });
            }

            function obtieneUnidadesMedidaSAT(idUnidades) {
                log.audit('idUnidades', idUnidades);
                var filtrosArray = new Array();
                var buscaUnidades = search.load({
                    id: 'customsearch_mx_mapping_search',
                });
                filtrosArray.push(['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[0]]);
                for (var i = 1; i < idUnidades.length; i++) {
                    filtrosArray.push('OR', ['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[i]]);
                }
                log.audit('filtrosArray', filtrosArray);
                if (filtrosArray.length === 0) {
                    return {};
                }

                buscaUnidades.filterExpression = [
                    [
                        'custrecord_mx_mapper_keyvalue_category.scriptid',
                        'is',
                        ['sat_unit_code'],
                    ],
                    'and',
                    ['custrecord_mx_mapper_keyvalue_rectype', 'is', ['unitstype']],
                    'and',
                    ['custrecord_mx_mapper_keyvalue_subrectype', 'is', ['uom']],
                    'and',
                    [filtrosArray],
                ];
                log.audit('buscaUnidades', buscaUnidades);
                var ejecuta = buscaUnidades.run()

                log.audit('ejecuta', ejecuta);

                var data = {};
                ejecuta.each(function (mapping) {
                    var detalle = {};
                    detalle.code = mapping.getValue({
                        name: 'custrecord_mx_mapper_value_inreport',
                        join: 'custrecord_mx_mapper_keyvalue_value',
                    });
                    detalle.name = mapping.getValue({
                        name: 'name',
                        join: 'custrecord_mx_mapper_keyvalue_value',
                    });
                    var key = mapping.getValue({
                        name: 'custrecord_mx_mapper_keyvalue_key',
                    });
                    var subkey = mapping.getValue({
                        name: 'custrecord_mx_mapper_keyvalue_subkey',
                    });
                    var claveid = 'k' + key;
                    if (subkey) {
                        claveid = claveid + '_' + subkey;
                    }
                    data[claveid] = detalle;
                    log.audit('data', data);
                    return true;
                });

                log.audit('data', data);
                return data;


            }

            log.debug('obj_main preitems :', obj_main);
            obj_main.items.map(function (articulo) {
                detallesDeImpuesto(articulo);
            });

            // satCodesDao.fetchSatTaxFactorTypeForAllPushed();
            // satCodesDao.fetchSatTaxCodesForAllPushed();
            //satCodesDao.fetchSatUnitCodesForAllPushed();
            if (tipo_transaccion != 'customerpayment') {
                obj_main.satcodes.unitCodes = obtieneUnidadesMedidaSAT(Object.keys(clavesdeUnidad));

                log.debug('obj_main result :', obj_main);
                codigosSatArticulos(obj_main.items, obj_main.satcodes, obj_main.itemIdUnitTypeMap);

            }
            //fin attachmaping

            obj_main.summary = summaryData(obj_main);
            // this._attachSatMappingData(result);
            //new summaryCalc.TransactionSummary().summarize(obj_main);


            //result.satcodes = satCodesDao.getJson();
            //crear relacionado en el pago
            if (tipo_transaccion == 'customerpayment') {
                // var payment = pagodata.obtenerDatos(recordObj, obj_main, obj_main.satCodesDao);
                // log.debug('payment: ',JSON.stringify(payment));
                obj_main.appliedTxns = pagoData(recordObj, obj_main, 'apply', id_transaccion, importeotramoneda);
                log.debug('result.appliedTxns: ', JSON.stringify(obj_main.appliedTxns));
            }

            //
            obj_main.satCodesDao = null;
            log.debug('Custom Datasource result: ', JSON.stringify(obj_main));

            return obj_main.items;
        }
        const fetchClaveProdServ = (itemCode) => {
            try {
                var record_claveProdServ = record.load({
                    type: 'customrecord_mx_sat_item_code',
                    id: itemCode,

                });
                var value = record_claveProdServ.getValue({
                    fieldId: 'custrecord_mx_ic_code'
                });
                return value;
            } catch (err) {
                log.error({ title: 'Error occurred in fetchClaveProdServ', details: err });
            }
        }
        const convertObjetoImp = (impuesto) => {
            try {
                var objetoImp_toreturn = '';
                if (impuesto == 2) {
                    objetoImp_toreturn = '02'
                } else if (impuesto == 3) {
                    objetoImp_toreturn = '03'
                } else {
                    objetoImp_toreturn = '01'

                }
                return objetoImp_toreturn
            } catch (err) {
                log.error({ title: 'Error occurred in convertObjetoImp', details: err });
            }
        }
        const fetchTotales = (tax_json_transaccion) => {
            try {
                var data_to_return = {
                    SubTotal: tax_json_transaccion.subtotal_gbl,
                    Descuento: tax_json_transaccion.descuentoSinImpuesto,
                    // Descuento: tax_json_transaccion.descuento,
                    Total: tax_json_transaccion.total_gbl
                    // Total: tax_json_transaccion.total_netsuite
                }
                // log.debug({ title: 'data_to_return fetchTotales', details: data_to_return });
                return data_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in fetchTotales', details: err });
            }
        }
        const fetchTotalImpuestos = (tax_json_transaccion) => {
            try {
                var data_to_return = {
                    TotalImpuestosTrasladados: tax_json_transaccion.totalTraslados ? tax_json_transaccion.totalTraslados : '',
                    TotalImpuestosRetenidos: tax_json_transaccion.totalRetenciones ? tax_json_transaccion.totalRetenciones : '',
                    Retenciones: [],
                    Traslados: []
                }
                if (tax_json_transaccion.rates_retencion_data != {}) {
                    data_to_return.Retenciones.push({
                        Importe: tax_json_transaccion.rates_retencion_data.ret_total,
                        Impuesto: '002'
                    });
                }
                // delete the property of retenidos in case it's not needed
                delete data_to_return.TotalImpuestosRetenidos;
                delete data_to_return.Retenciones;

                if (tax_json_transaccion.rates_iva_data != {}) {
                    var data_to_push_bases_iva = [];
                    var data_to_push_rates_iva = [];
                    var data_to_push_tasaoCuota = [];
                    for (let key in tax_json_transaccion.bases_iva) {
                        data_to_push_bases_iva.push(tax_json_transaccion.bases_iva[key]);
                        if(key==0 || key=='0'){
                            data_to_push_tasaoCuota.push('00')
                        }else{
                            data_to_push_tasaoCuota.push(key)
                        }
                    }
                    for (let key in tax_json_transaccion.rates_iva_data) {
                        data_to_push_rates_iva.push(tax_json_transaccion.rates_iva_data[key])
                    }
                    data_to_push_bases_iva.forEach((element,index)=>{

                        data_to_return.Traslados.push({
                            Base: element|| '',
                            // Base: tax_json_transaccion.rates_iva_data.Iva_bases || '',
                            // Base: tax_json_transaccion.rates_iva_data.Iva_rate,
                            Importe: data_to_push_rates_iva[index] || '',
                            // Importe: tax_json_transaccion.rates_iva_data.Iva_total || '',
                            Impuesto: '002',
                            TasaOCuota: '0.'+data_to_push_tasaoCuota[index]+'0000',
                            // TasaOCuota: '0.160000',
                            TipoFactor: 'Tasa'
                        });
                    })

                }
                if (tax_json_transaccion.rates_ieps_data != {}) {
                    // data_to_return.Traslados.push({
                    //   Base: tax_json_transaccion.rates_ieps_data.Ieps_rate,
                    //   Importe: tax_json_transaccion.rates_ieps_data.Ieps_total,
                    //   Impuesto: '002',
                    //   TasaOCuota: tax_json_transaccion.rates_ieps_data.Ieps_rate,
                    //   TipoFactor: 'Tasa'
                    // })
                }
                log.audit({ title: 'data_to_return fetchTotalImpuestos 🐢', details: data_to_return });
                return data_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in fetchTotalImpuestos', details: err });
            }
        }
        const fetchImpuestos = (tax_json) => {
            try {

                var data_to_return = { Traslados: [], Retenciones: [] };
                var obj_data = {}
                // TRASLADOS = iva, ieps y exentos
                if (tax_json.iva.name) {
                    let rateStr = '';
                    if (tax_json.iva.rate_div == 0) {
                        rateStr = '0.00'
                    } else {
                        rateStr = tax_json.iva.rate_div
                    }
                    obj_data.Base = tax_json.iva.base_importe;
                    obj_data.Importe = tax_json.iva.importe;
                    obj_data.Impuesto = tax_json.iva.factor;
                    obj_data.TasaOCuota = rateStr + '0000';
                    obj_data.TipoFactor = 'Tasa';

                    data_to_return.Traslados.push(obj_data)
                }
                if (tax_json.ieps.name) {
                    obj_data.Base = tax_json.ieps.base_importe;
                    obj_data.Importe = tax_json.ieps.importe;
                    obj_data.Impuesto = tax_json.ieps.factor;
                    obj_data.TasaOCuota = tax_json.ieps.rate_div + '0000';
                    obj_data.TipoFactor = 'Tasa';

                    data_to_return.Traslados.push(obj_data)
                }
                if (tax_json.exento.name) {
                    obj_data.Base = tax_json.exento.base_importe;
                    obj_data.Importe = tax_json.exento.importe;
                    obj_data.Impuesto = tax_json.exento.factor;
                    obj_data.TasaOCuota = tax_json.exento.rate_div + '0000';
                    obj_data.TipoFactor = 'Tasa';

                    data_to_return.Traslados.push(obj_data)
                }
                // RETENCIONES = retenciones
                if (tax_json.retenciones.name) {
                    obj_data.Base = tax_json.retenciones.base_importe;
                    obj_data.Importe = tax_json.retenciones.importe;
                    obj_data.Impuesto = tax_json.retenciones.factor;
                    obj_data.TasaOCuota = tax_json.retenciones.rate_div + '0000';
                    obj_data.TipoFactor = 'Tasa';

                    data_to_return.Retenciones.push(obj_data)
                } else {
                    delete data_to_return.Retenciones;
                }
                log.audit({ title: 'data_to_return', details: data_to_return });
                return data_to_return;

            } catch (err) {
                log.error({ title: 'Error occurred in fetchImpuesto', details: err });
            }
        }
        const fetchClaveUnidad = (id) => {
            try {
                var record_claves_unidad = record.load({
                    type: 'customrecord_bit_fact_e_claveunidad',
                    id: id,

                });
                var value = record_claves_unidad.getValue({
                    fieldId: 'custrecord_bit_fact_e_claveunidad_clave'
                });
                return value;

            } catch (err) {
                log.error({ title: 'Error occurred in fetchClaveUnidad', details: err });
            }
        }

        const getAuthenticationToken = (url_str, user_email, user_password) => {
            var data_to_return = {
                successful: false,
                token: "",
                message: "",
            };
            try {
                var headers = {
                    password: user_password,
                    user: user_email,
                };
                var response = https.post({
                    url: url_str + "security/authenticate",
                    headers: headers,
                });
                if (response.code === 200) {
                    data_to_return.successful = true;
                    data_to_return.token = JSON.parse(response.body).data.token;
                } else {
                    data_to_return.message = response.body;
                }
                return data_to_return;
            } catch (err) {
                log.error({
                    title: "Error occurred in getAuthenticationToken",
                    details: err,
                });
                return data_to_return;
            }
        };

        return { onRequest }

    });