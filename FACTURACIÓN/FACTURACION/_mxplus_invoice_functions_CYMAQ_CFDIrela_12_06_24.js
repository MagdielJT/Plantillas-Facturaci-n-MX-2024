/**
 * @NApiVersion 2.1
 */
define(['N/https', 'N/log', 'N/record', 'N/search', 'N/runtime', 'N/file', 'N/task', '../../lib/functions_gbl', '../../Pagos/lib/constants', '../../lib/access_pac', 'N/config'],

    (https, log, record, search, runtime, file, task, functions, constants, access_pac, config) => {
        const { RECORDS } = constants


        const authenticationCredentials = (record_trans) => {
            const isOW = functions.checkOWAccount()
            const emisor = isOW ? functions.getSubsidiaryInformation(record_trans.getValue({ fieldId: 'subsidiary' })) : functions.getCompanyInformation()
            const { MX_PLUS_CONFIG } = functions
            const allConfig = functions.getConfig()
            let services;
            if (allConfig[MX_PLUS_CONFIG.FIELDS.TEST_MODE] == true) {
                services = access_pac.testURL.services
            } else {
                services = access_pac.prodURL.services
            }
            let email = isOW ? emisor[functions.SUBSIDIARY.FIELDS.EMAIL] : emisor[functions.COMPANY.FIELDS.EMAIL]

            let authentication_data = {
                url: services,
                user_email: email,
                user_password: access_pac.pwd
            }
            return authentication_data;
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
                    // log.audit({ title: 'idUnidades', details: idUnidades });
                    // log.audit({ title: 'articulos.itemId', details: articulos.itemId });
                    // log.audit({ title: 'articulos.units', details: articulos.units });
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
                // log.audit('idUnidades', idUnidades);
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
                    TotalImpuestosRetenidos: tax_json_transaccion.totalRetenciones ? (tax_json_transaccion.totalRetenciones) * (-1) : '',
                    Retenciones: [],
                    Traslados: []
                }
                if (Object.keys(tax_json_transaccion.rates_retencion_data).length > 0) {
                    let importeAmount = ''
                    Object.entries(tax_json_transaccion.rates_retencion_data).forEach(([key, value]) => {
                        importeAmount = (value) * (-1)
                    })
                    data_to_return.Retenciones.push({
                        Importe: importeAmount,
                        Impuesto: '002'
                    });
                } else {

                    // delete the property of retenidos in case it's not needed
                    delete data_to_return.TotalImpuestosRetenidos;
                    delete data_to_return.Retenciones;
                }

                if (tax_json_transaccion.rates_iva_data != {}) {
                    var data_to_push_bases_iva = [];
                    var data_to_push_rates_iva = [];
                    var data_to_push_tasaoCuota = [];
                    for (let key in tax_json_transaccion.bases_iva) {
                        data_to_push_bases_iva.push(tax_json_transaccion.bases_iva[key]);
                        if (key == 0 || key == '0') {
                            data_to_push_tasaoCuota.push('00')
                        } else {
                            data_to_push_tasaoCuota.push(key)
                        }
                    }
                    for (let key in tax_json_transaccion.rates_iva_data) {
                        data_to_push_rates_iva.push(tax_json_transaccion.rates_iva_data[key])
                    }
                    data_to_push_bases_iva.forEach((element, index) => {

                        data_to_return.Traslados.push({
                            Base: element || '',
                            // Base: tax_json_transaccion.rates_iva_data.Iva_bases || '',
                            // Base: tax_json_transaccion.rates_iva_data.Iva_rate,
                            Importe: data_to_push_rates_iva[index] || '',
                            // Importe: tax_json_transaccion.rates_iva_data.Iva_total || '',
                            Impuesto: '002',
                            TasaOCuota: '0.' + data_to_push_tasaoCuota[index] + '0000',
                            // TasaOCuota: '0.160000',
                            TipoFactor: 'Tasa'
                        });
                    })

                }
                if (tax_json_transaccion.rates_ieps_data != {}) {
                    var data_to_push_bases_ieps = [];
                    var data_to_push_rates_ieps = [];
                    var data_to_push_tasaoCuota_ieps = [];
                    for (let key in tax_json_transaccion.bases_ieps) {
                        data_to_push_bases_ieps.push(tax_json_transaccion.bases_ieps[key]);
                        data_to_push_tasaoCuota_ieps.push(key)
                    }
                    for (let key in tax_json_transaccion.rates_ieps_data) {
                        data_to_push_rates_ieps.push(tax_json_transaccion.rates_ieps_data[key])
                    }
                    data_to_push_bases_ieps.forEach((element, index) => {
                        data_to_return.Traslados.push({
                            Base: element || '',
                            Importe: data_to_push_rates_ieps[index] || '',
                            Impuesto: '003',
                            TasaOCuota: '0.' + data_to_push_tasaoCuota_ieps[index] + '0000',
                            TipoFactor: 'Tasa'
                        });
                    });

                }
                log.audit({ title: 'data_to_return fetchTotalImpuestos 🐢', details: data_to_return });
                return data_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in fetchTotalImpuestos', details: err });
            }
        }
        const fetchImpuestos = (tax_json) => {
            try {

                var data_to_return = { Traslados: [], Retenciones: [], bases: 0 };
                var obj_data = {}
                // TRASLADOS = iva, ieps y exentos
                if (tax_json.iva.name) {

                    // const shiftedNumber = tax_json.iva.rate_div / 100; // This will result in 0.1066

                    // Format the number to ensure it has 6 decimal places
                    const formattedNumber = tax_json.iva.rate_div.toFixed(6);
                    let obj_data_iva = {}
                    obj_data_iva.Base = tax_json.iva.base_importe;
                    obj_data.Base = tax_json.iva.base_importe;
                    obj_data_iva.Importe = tax_json.iva.importe;
                    obj_data_iva.Impuesto = tax_json.iva.factor;
                    obj_data_iva.TasaOCuota = formattedNumber;
                    obj_data_iva.TipoFactor = 'Tasa';
                    // log.emergency({ title: 'tax_json.iva.importe', details: tax_json.iva.importe });
                    // log.emergency({ title: 'obj_data_iva BEFORE', details: obj_data_iva });
                    data_to_return.Traslados.push(obj_data_iva)
                    // log.emergency({ title: 'data_to_return BEFORE', details: data_to_return });
                }
                if (tax_json.ieps.name) {
                    let obj_data_ieps = {}
                    obj_data_ieps.Base = tax_json.ieps.base_importe;
                    obj_data.Base = tax_json.ieps.base_importe;
                    obj_data_ieps.Importe = tax_json.ieps.importe;
                    obj_data_ieps.Impuesto = tax_json.ieps.factor;
                    obj_data_ieps.TasaOCuota = tax_json.ieps.rate_div.toFixed(6);
                    obj_data_ieps.TipoFactor = 'Tasa';

                    data_to_return.Traslados.push(obj_data_ieps)
                }
                if (tax_json.exento.name) {
                    let obj_data_exento = {};
                    obj_data_exento.Base = tax_json.exento.base_importe;
                    obj_data.Base = tax_json.exento.base_importe;
                    obj_data_exento.Importe = tax_json.exento.importe;
                    obj_data_exento.Impuesto = tax_json.exento.factor;
                    obj_data_exento.TasaOCuota = '0.000000';
                    obj_data_exento.TipoFactor = 'Tasa';

                    data_to_return.Traslados.push(obj_data_exento)
                }
                // RETENCIONES = retenciones
                if (tax_json.retenciones.length > 0) {
                    tax_json.retenciones.forEach(element => {

                        // Format the number to ensure it has 6 decimal places
                        const formattedNumber = element.rate_div.toFixed(6);
                        let obj_dataRetenciones = {};
                        obj_dataRetenciones.Base = element.base_importe;
                        obj_dataRetenciones.Importe = element.importe > 0 ? element.importe : (element.importe) * (-1);
                        obj_dataRetenciones.Impuesto = element.factor;
                        obj_dataRetenciones.TasaOCuota = formattedNumber;
                        obj_dataRetenciones.TipoFactor = 'Tasa';

                        data_to_return.Retenciones.push(obj_dataRetenciones)
                    })
                } else {
                    delete data_to_return.Retenciones;
                }
                // log.emergency({ title: 'obj_data', details: obj_data });
                // log.emergency({ title: 'data_to_return', details: data_to_return });
                data_to_return.bases = parseFloat(data_to_return.bases) + parseFloat(obj_data.Base)
                return data_to_return;

            } catch (err) {
                log.error({ title: 'Error occurred in fetchImpuesto', details: err });
            }
        }
        const sacaCalculosTotales = (recordTrans, cantidadLineas) => {
            try {
                var data_to_return = {
                    total_transaccion: 0,
                    TotalImpuestosTrasladados: 0,
                    TotalImpuestosRetenidos: 0,
                    descuentos: 0,
                    subtotal: 0,
                    arrImpuesto: []
                }
                for (let i = 0; i < cantidadLineas; i++) {
                    var item_tax_json = recordTrans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_tax_json',
                        line: i,
                    });
                    if (item_tax_json != '') {
                        let parsed_value = JSON.parse(item_tax_json);
                        if (parsed_value.iva.name) {
                            const formattedNumber = parsed_value.iva.rate_div.toFixed(6);

                            data_to_return.arrImpuesto.push(formattedNumber)
                        }
                        if (parsed_value.ieps.name) {
                            let formattedIepsRate = parsed_value.ieps.rate_div.toFixed(6);
                            data_to_return.arrImpuesto.push(formattedIepsRate)
                        }
                        if (parsed_value.exento.name) {
                            data_to_return.arrImpuesto.push(parsed_value.exento.rate)
                        }
                        if (parsed_value.locales.name) {
                            data_to_return.arrImpuesto.push(parsed_value.locales.rate)
                        }

                        var impuestos = fetchImpuestos(parsed_value);
                        // log.audit({title:'impuestos SACATOTALES',details:impuestos});
                        let traslados_array = impuestos.Traslados;
                        let retenciones_array = impuestos.Retenciones;
                        // TotalImpuestos => suma de los importes
                        traslados_array.forEach((singleTraslado) => {
                            data_to_return.total_transaccion += parseFloat(singleTraslado.Base) + parseFloat(singleTraslado.Importe);
                            data_to_return.TotalImpuestosTrasladados += parseFloat(singleTraslado.Importe);
                        })
                        // Calculo de totales de retenciones
                        if (retenciones_array) {

                            retenciones_array.forEach((singleRetencion) => {
                                data_to_return.total_transaccion += parseFloat(singleRetencion.Base) + parseFloat(singleRetencion.Importe);
                                data_to_return.TotalImpuestosRetenidos += parseFloat(singleRetencion.Importe);
                            })
                        }
                        data_to_return.descuentos = parseFloat(data_to_return.descuentos) + parseFloat(parsed_value.descuentoSinImpuesto)
                        data_to_return.subtotal = parseFloat(data_to_return.subtotal) + parseFloat(parsed_value.montoLinea)
                    }
                }
                // log.audit({ title: 'data_to_return.descuentos 🕯️🕯️', details: data_to_return.descuentos });
                // log.audit({ title: 'data_to_return.subtotal 🕯️🕯️🕯️', details: data_to_return.subtotal });
                data_to_return.total_transaccion = parseFloat(data_to_return.subtotal) + parseFloat(data_to_return.TotalImpuestosTrasladados) - parseFloat(data_to_return.descuentos) - parseFloat(data_to_return.TotalImpuestosRetenidos)
                data_to_return.total_transaccion = parseFloat(data_to_return.total_transaccion).toFixed(2);
                data_to_return.TotalImpuestosTrasladados = parseFloat(data_to_return.TotalImpuestosTrasladados).toFixed(2);
                log.audit({ title: 'data_to_return - sacaCalculosTotales', details: data_to_return });
                return data_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in sacaCalculosTotales', details: err });
            }
        }
        const isNumeric = (character) => {
            try {
                return isNaN(character)
            } catch (err) {
                log.error({ title: 'Error occurred in isNumeric', details: err });
            }
        }
        const fetchBasicInfo = (record_trans) => {
            try {
                let info2Return = {
                    FormaPago: '', Serie: '', Folio: '', MetodoPago: '', Exportacion: ''
                }
                info2Return.FormaPago = (record_trans.getText({ fieldId: 'custbody_mx_txn_sat_payment_method' }))
                if (info2Return.FormaPago != '' && info2Return.FormaPago != null && info2Return.FormaPago != undefined) {
                    info2Return.FormaPago = info2Return.FormaPago.split(' -')[0];
                }
                let textTranid = record_trans.getValue({ fieldId: 'tranid' }).split('-');
                info2Return.MetodoPago = (record_trans.getText({ fieldId: 'custbody_mx_txn_sat_payment_term' }));
                if (info2Return.MetodoPago != '' && info2Return.MetodoPago != null && info2Return.MetodoPago != undefined) {
                    info2Return.MetodoPago = info2Return.MetodoPago.split(' -')[0];
                }
                let exportType = record_trans.getValue({ fieldId: 'custbody_mx_cfdi_sat_export_type' });
                if (exportType != '' && exportType && exportType != null && exportType != undefined) {
                    info2Return.Exportacion = (record_trans.getText({ fieldId: 'custbody_mx_cfdi_sat_export_type' }));
                    if (info2Return.Exportacion != '' && info2Return.Exportacion != null && info2Return.Exportacion != undefined) {
                        info2Return.Exportacion = info2Return.Exportacion.split(' -')[0];
                    }
                    else {
                        info2Return.Exportacion = (record_trans.getText({ fieldId: 'custbody_tkio_tipo_exportacion' }))
                        if (info2Return.Exportacion != '' && info2Return.Exportacion != null && info2Return.Exportacion != undefined) {
                            info2Return.Exportacion = info2Return.Exportacion.split(' -')[0];
                        }

                    }
                }
                if (textTranid.length > 1) {
                    log.debug({ title: 'has separated serie and folio', details: textTranid[0] + '-' + textTranid[1] });
                    info2Return.Serie = textTranid[0];
                    info2Return.Folio = textTranid[1];
                } else {
                    // no hyphen found in tranid text
                    // Get the last letter found in text
                    let savePosition = 0;
                    for (let i = 0; i < textTranid[0].length; i++) {
                        log.audit({ title: 'textTranid[0]', details: textTranid[0] });
                        log.emergency({ title: 'textTranid[0].charAt(i)', details: textTranid[0].charAt(i) });
                        let isNotANum = isNumeric(textTranid[0].charAt(i));
                        if (isNotANum == false) {
                            savePosition = i;
                            break;
                        }
                    }
                    log.debug({ title: 'second way of getting the serie and folio', details: 'position:' + savePosition });
                    info2Return.Serie = textTranid[0].substring(0, savePosition);
                    info2Return.Folio = textTranid[0].substring(savePosition);
                }
                if (info2Return.Folio == '' && info2Return.Serie != '') {
                    info2Return.Folio = info2Return.Serie;
                }
                if (info2Return.Serie == '' && info2Return.Folio != '') {
                    info2Return.Serie = info2Return.Folio
                }
                return info2Return;
            } catch (err) {
                log.error({ title: 'Error occurred in fetchBasicInfo', details: err });
            }
        }
        const getCustomerBasicInformation = (idCliente, record_trans) => {
            try {
                let data2Return = {
                    regFiscal: '',
                    UsoCFDI: '',
                    NombreSAT: '',
                    DomicilioFiscalReceptor: ''
                }
                const filters = [
                    ['internalid', search.Operator.ANYOF, idCliente],

                ];

                const columnRegFiscal = search.createColumn({ name: 'custentity_mx_sat_industry_type' });
                const columnSATName = search.createColumn({ name: 'custentity_mx_sat_registered_name' });
                data2Return.UsoCFDI = record_trans.getText({ fieldId: 'custbody_mx_cfdi_usage' }).split(' -')[0]

                const createdSearch = search.create({
                    type: 'customer',
                    filters,
                    columns: [

                        columnRegFiscal,
                        columnSATName
                    ],
                });
                createdSearch.run().each((result) => {
                    data2Return.regFiscal = result.getText(columnRegFiscal).split(' -')[0];
                    data2Return.NombreSAT = result.getValue(columnSATName);
                    return true
                });
                var obj_cliente = record.load({
                    type: record.Type.CUSTOMER,
                    id: idCliente,

                });
                var count = obj_cliente.getLineCount({ sublistId: 'addressbook' });
                for (var i = 0; i < count; i++) {

                    var billing = obj_cliente.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'defaultbilling',
                        line: i
                    });
                    if (billing) {
                        var subrec = obj_cliente.getSublistSubrecord({
                            sublistId: 'addressbook',
                            fieldId: 'addressbookaddress',
                            line: i
                        });
                        data2Return.DomicilioFiscalReceptor = subrec.getValue({ fieldId: 'zip' });
                    }
                }
                return data2Return
            } catch (err) {
                log.error({ title: 'Error occurred in getCustomerBasicInformation', details: err });
            }
        }
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
        const fetchCOMEXBasicInformation = (record) => {
            let data2Return = { success: false, msg: '', data: {} };

            try {

                // Nodo: CCE20:ComercioExterior
                let headerInformation = {
                    "CertificadoOrigen": record.getValue({ fieldId: 'custbody_efx_fe_ce_certificado_origen' }),
                    "ClaveDePedimento": record.getValue({ fieldId: 'custbody_efx_fe_ce_clavepedimento' }),
                    "Incoterm": record.getText({ fieldId: 'custbody_efx_fe_ce_incoterm' }).split(' -')[0],
                    "TipoCambioUSD": record.getValue({ fieldId: 'custbody_efx_fe_ce_exchage' }),
                    "TotalUSD": record.getValue({ fieldId: 'custbody_efx_fe_ce_totalusd' }),
                    "Version": "2.0",

                }
                let jsonDireccion = record.getValue({ fieldId: 'custbody_efx_fe_dirjson_emisor' });
                jsonDireccion = JSON.parse(jsonDireccion);
                let EmisorCOMEX = {
                    "Domicilio": {
                        "Calle": jsonDireccion.emisor.Calle,
                        "CodigoPostal": jsonDireccion.emisor.CodigoPostal,
                        "Colonia": jsonDireccion.emisor.Colonia,
                        "Estado": jsonDireccion.emisor.Estado,
                        "Localidad": jsonDireccion.emisor.Localidad,
                        "Municipio": jsonDireccion.emisor.Municipio,
                        "Pais": jsonDireccion.emisor.Pais
                    }
                }
                if (EmisorCOMEX.Domicilio.Localidad == '') {
                    delete EmisorCOMEX.Domicilio.Localidad
                }
                // NODO: Receptor COMEX
                let ReceptorCOMEX = {
                    "NumRegIdTrib": record.getValue({ fieldId: 'custbody_efx_fe_ce_propietario_numreg' }),
                    "Domicilio": {
                        "Calle": jsonDireccion.receptor.Calle,
                        "CodigoPostal": jsonDireccion.receptor.CodigoPostal,
                        "Estado": jsonDireccion.receptor.Estado,
                        "Pais": jsonDireccion.receptor.Pais
                    }
                }

                var number_items = record.getLineCount({
                    sublistId: 'item'
                });
                data2Return.data = { headerInformation, EmisorCOMEX, ReceptorCOMEX };

                data2Return.data.Mercancias = []
                for (var i = 0; i < number_items; i++) {
                    var obj_data_conceptos_comex = {};
                    // extract tax json from item
                    var CantidadAduana = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_ce_cant_aduana',
                        line: i,
                    });
                    var ValorUnitarioAduana = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_ce_val_uni_aduana',
                        line: i,
                    });
                    ValorUnitarioAduana = ValorUnitarioAduana.toFixed(3);
                    var ValorDolares = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_ce_val_dolares',
                        line: i,
                    });
                    var FraccionArancelaria = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_ce_farancel_code',
                        line: i,
                    });
                    var NoIdentificacion = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_upc_code',
                        line: i,
                    });
                    if (NoIdentificacion.length == 0 || NoIdentificacion == null) {
                        NoIdentificacion = record.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item_display',
                            line: i,
                        });
                    }
                    var UnidadAduana = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_unit_code_ce',
                        line: i,
                    });
                    obj_data_conceptos_comex = { CantidadAduana, ValorUnitarioAduana, UnidadAduana, ValorDolares, FraccionArancelaria, NoIdentificacion }
                    data2Return.data.Mercancias.push(obj_data_conceptos_comex);
                }
                data2Return.success = true;

            } catch (err) {
                log.error({ title: 'Error occurred in fetchCOMEXBasicInformation', details: err });
            }
            return data2Return
        }
        const fetchConceptos = (record_trans, id_transaccion, typeOfRecord) => {
            try {
                var data_to_return = {
                    "Version": "4.0",
                    "FormaPago": "01",
                    "Serie": "",
                    "Folio": "",
                    "Fecha": "",
                    "MetodoPago": "",
                    "Sello": "",
                    "NoCertificado": "",
                    "Certificado": "",
                    "Moneda": "",
                    "TipoCambio": "",
                    "TipoDeComprobante": "",
                    "Exportacion": "",
                    "LugarExpedicion": "",
                    "CfdiRelacionados": [],
                    "Emisor": {
                        "Rfc": "",
                        "Nombre": "",
                        "RegimenFiscal": ""
                    },
                    "Receptor": {
                        "Rfc": "",
                        "Nombre": "",
                        "DomicilioFiscalReceptor": "",
                        "RegimenFiscalReceptor": "",
                        "UsoCFDI": "",
                        "ResidenciaFiscal": "",
                        "NumRegIdTrib": ""
                    },
                    "SubTotal": "",
                    "Total": "",
                    "Descuento": "",
                    "Conceptos": [],
                    "Complemento": {
                        "Any": [
                            {
                                "CCE20:ComercioExterior": {
                                    "CertificadoOrigen": "",
                                    "ClaveDePedimento": "",
                                    "Incoterm": "",
                                    "TipoCambioUSD": "",
                                    "TotalUSD": "",
                                    "Version": "2.0",
                                    "Emisor": {

                                    },
                                    "Receptor": {

                                    },
                                    "Mercancias": [

                                    ]
                                }
                            },
                            {
                                "leyendasFisc:LeyendasFiscales": {
                                    "@xmlns:leyendasFisc": "http://www.sat.gob.mx/leyendasFiscales",
                                    "@version": "1.0",
                                    "leyendasFisc:Leyenda": {
                                        "@disposicionFiscal": "",
                                        "@norma": "",
                                        "@textoLeyenda": ""
                                    }
                                }
                            }
                        ]
                    }
                }
                // Check if transaction has comercio exterior
                if (record_trans.getValue({ fieldId: 'custbody_efx_fe_dirjson_emisor' }) != '') {
                    // Has comercio exterior
                    let dataCOMEX = fetchCOMEXBasicInformation(record_trans);
                    log.debug({ title: 'dataCOMEX 🗺️', details: dataCOMEX });
                    if (dataCOMEX.success == true) {
                        data_to_return.Complemento.Any[0]["CCE20:ComercioExterior"].CertificadoOrigen = dataCOMEX.data.headerInformation.CertificadoOrigen;
                        data_to_return.Complemento.Any[0]["CCE20:ComercioExterior"].ClaveDePedimento = dataCOMEX.data.headerInformation.ClaveDePedimento;
                        data_to_return.Complemento.Any[0]["CCE20:ComercioExterior"].Incoterm = dataCOMEX.data.headerInformation.Incoterm;
                        data_to_return.Complemento.Any[0]["CCE20:ComercioExterior"].TipoCambioUSD = dataCOMEX.data.headerInformation.TipoCambioUSD;
                        data_to_return.Complemento.Any[0]["CCE20:ComercioExterior"].TotalUSD = dataCOMEX.data.headerInformation.TotalUSD;
                        data_to_return.Complemento.Any[0]["CCE20:ComercioExterior"].Emisor = dataCOMEX.data.EmisorCOMEX;
                        data_to_return.Complemento.Any[0]["CCE20:ComercioExterior"].Receptor = dataCOMEX.data.ReceptorCOMEX;
                        data_to_return.Complemento.Any[0]["CCE20:ComercioExterior"].Mercancias = dataCOMEX.data.Mercancias;
                        if (dataCOMEX.data.ReceptorCOMEX.NumRegIdTrib.length == 0 || dataCOMEX.data.ReceptorCOMEX.NumRegIdTrib == null) {
                            delete data_to_return.Receptor.ResidenciaFiscal;
                            delete data_to_return.Receptor.NumRegIdTrib;
                        } else {
                            data_to_return.Receptor.ResidenciaFiscal = record_trans.getValue({ fieldId: 'custbody_efx_fe_ce_rec_residenciaf' })
                            data_to_return.Receptor.NumRegIdTrib = dataCOMEX.data.ReceptorCOMEX.NumRegIdTrib
                        }

                    }
                } else {
                    delete data_to_return.Complemento.Any[0];
                }
                const leyenFisc = record_trans.getValue({ fieldId: 'custbody_efx_fe_leyendafiscal_detail' });
                if (leyenFisc !== null && leyenFisc !== '' && leyenFisc !== undefined) {
                    let FiscLeyen = search.lookupFields({
                        type: 'customrecord_efx_fe_leyendafiscal',
                        id: leyenFisc,
                        columns: 'custrecord_efx_fe_leyf_textoleyenda'
                    });
                    data_to_return.Complemento.Any[1]["leyendasFisc:LeyendasFiscales"]["leyendasFisc:Leyenda"]["@textoLeyenda"] = FiscLeyen.custrecord_efx_fe_leyf_textoleyenda;
                    Object.keys(data_to_return.Complemento.Any[1]["leyendasFisc:LeyendasFiscales"]["leyendasFisc:Leyenda"]).forEach((key) => {
                        if (!data_to_return.Complemento.Any[1]["leyendasFisc:LeyendasFiscales"]["leyendasFisc:Leyenda"][key]) {
                            delete data_to_return.Complemento.Any[1]["leyendasFisc:LeyendasFiscales"]["leyendasFisc:Leyenda"][key];
                        }
                    });
                    data_to_return.Complemento.Any = data_to_return.Complemento.Any.filter((item) => item !== null);
                } else {
                    delete data_to_return.Complemento.Any[1];
                    data_to_return.Complemento.Any = data_to_return.Complemento.Any.filter((item) => item !== null);
                }
                log.debug({ title: 'data_to_return.Complemento.Any[1]', details: data_to_return.Complemento.Any[1] });
                if (typeOfRecord == 'creditmemo') {
                    data_to_return.TipoDeComprobante = 'E';
                } else {
                    data_to_return.TipoDeComprobante = 'I';
                }
                // data_to_return.CfdiRelacionados = [];
                let dataCFDIs = fetchRelatedCFDIs(record_trans);
                log.debug({ title: 'dataCFDIs 🌟🌟🌟🌟🌟🌟', details: dataCFDIs });
                if (!dataCFDIs.length > 0) {
                    delete data_to_return.CfdiRelacionados
                    // data_to_return = data_to_return.filter((item) => item !== null);
                } else {
                    data_to_return.CfdiRelacionados = dataCFDIs;
                }
                data_to_return.Moneda = record_trans.getText({ fieldId: 'currency' });
                if (data_to_return.Moneda == 'Pesos' || data_to_return.Moneda == 'MEX') {
                    data_to_return.Moneda = 'MXN';
                }
                data_to_return.TipoCambio = record_trans.getValue({ fieldId: 'exchangerate' });
                // Setting the current date in Mexico City timezone
                const currentDate = new Date();
                let offset = -6; // Mexico City timezone offset from UTC in hours
                if (record_trans.getValue({ fieldId: 'custbody_efx_fe_zona_horaria' }) != '' && record_trans.getValue({ fieldId: 'custbody_efx_fe_zona_horaria' }) == 'America/Tijuana') {
                    offset = -7;
                }
                const offsetSign = offset > 0 ? '-' : '+';
                const absOffset = Math.abs(offset);
                const offsetHours = String(Math.floor(absOffset)).padStart(2, '0');
                const offsetMinutes = String((absOffset % 1) * 60).padStart(2, '0');
                const timezone = `${offsetSign}${offsetHours}:${offsetMinutes}`;

                const formattedDate2 = currentDate.toISOString().slice(0, 19) + timezone;
                data_to_return.Fecha = formattedDate2;

                // ********Basic Information fill out***********
                let basicInfo = fetchBasicInfo(record_trans);
                data_to_return.Exportacion = basicInfo.Exportacion;
                data_to_return.Serie = basicInfo.Serie;
                data_to_return.Folio = basicInfo.Folio;
                data_to_return.MetodoPago = basicInfo.MetodoPago;
                data_to_return.FormaPago = basicInfo.FormaPago;
                // ********************************
                const { CUSTOMER } = RECORDS

                const isOW = functions.checkOWAccount()
                const emisor = isOW ? functions.getSubsidiaryInformation(record_trans.getValue({ fieldId: 'subsidiary' })) : functions.getCompanyInformation()
                if (isOW) {
                    log.debug({ title: 'emisor OW', details: emisor });
                    let rfcEmisorAux = ''
                    // if (emisor[functions.SUBSIDIARY.FIELDS.RFC] == null) {
                    rfcEmisorAux = getEmisorRFC(record_trans.getValue({ fieldId: 'subsidiary' }));
                    // }
                    log.debug({ title: 'rfcEmisorAux', details: rfcEmisorAux });
                    log.debug({ title: ' emisor[functions.SUBSIDIARY.FIELDS.RFC]', details: emisor[functions.SUBSIDIARY.FIELDS.RFC] });
                    data_to_return.Emisor.Rfc = rfcEmisorAux
                    data_to_return.Emisor.Nombre = emisor[functions.SUBSIDIARY.FIELDS.LEGAL_NAME]
                    data_to_return.Emisor.RegimenFiscal = Number(emisor[functions.SUBSIDIARY.FIELDS.REG_FIS])
                    data_to_return.LugarExpedicion = emisor[functions.SUBSIDIARY.FIELDS.ZIP]

                } else {
                    log.debug({ title: 'emisor NO OW', details: emisor });
                    data_to_return.Emisor.Rfc = emisor[functions.COMPANY.FIELDS.RFC]
                    data_to_return.Emisor.Nombre = emisor[functions.COMPANY.FIELDS.LEGAL_NAME]
                    data_to_return.Emisor.RegimenFiscal = Number(emisor[functions.COMPANY.FIELDS.REG_FIS])
                    data_to_return.LugarExpedicion = emisor.zip
                    // data_to_return.LugarExpedicion = emisor[functions.COMPANY.FIELDS.ZIP]

                }
                if (record_trans.getValue({ fieldId: 'custbody_efx_fe_lugar_expedicion' }) != '') {
                    data_to_return.LugarExpedicion = record_trans.getValue({ fieldId: 'custbody_efx_fe_lugar_expedicion' })
                }
                /** Receptor */
                // verify if customer is from Kiosko
                let isKiosko = record_trans.getValue({ fieldId: 'custbody_efx_fe_kiosko_customer' });
                log.audit({ title: 'isKiosko', details: isKiosko });

                const receptor = getCustomerInformation(record_trans.getValue({ fieldId: 'entity' }))
                data_to_return.Receptor.Rfc = isKiosko != null && isKiosko != undefined && isKiosko != '' ? record_trans.getValue({ fieldId: 'custbody_efx_fe_kiosko_rfc' }) : receptor[CUSTOMER.FIELDS.RFC]
                let otherCustomerInformation = getCustomerBasicInformation(record_trans.getValue({ fieldId: 'entity' }), record_trans)
                data_to_return.Receptor.DomicilioFiscalReceptor = isKiosko != null && isKiosko != undefined && isKiosko != '' ? record_trans.getValue({ fieldId: 'custbody_efx_fe_kiosko_zip' }) : (receptor[CUSTOMER.FIELDS.RFC] == 'XAXX010101000' || receptor[CUSTOMER.FIELDS.RFC] == 'XEXX010101000' ? data_to_return.LugarExpedicion : otherCustomerInformation.DomicilioFiscalReceptor)
                data_to_return.Receptor.Nombre = isKiosko != null && isKiosko != undefined && isKiosko != '' ? record_trans.getValue({ fieldId: 'custbody_efx_fe_kiosko_rsocial' }) : (receptor[CUSTOMER.FIELDS.RFC] == 'XAXX010101000' ? 'PUBLICO GENERAL' : otherCustomerInformation.NombreSAT)
                data_to_return.Receptor.RegimenFiscalReceptor = isKiosko != null && isKiosko != undefined && isKiosko != '' ? record_trans.getText({ fieldId: 'custbody_efx_fe_kiosko_regfiscal' }).split(' -')[0] : otherCustomerInformation.regFiscal;
                data_to_return.Receptor.UsoCFDI = otherCustomerInformation.UsoCFDI;
                if (data_to_return.Receptor.NumRegIdTrib == '') {
                    delete data_to_return.Receptor.NumRegIdTrib
                    delete data_to_return.Receptor.ResidenciaFiscal
                }
                // ********************************
                log.audit({ title: 'record_trans', details: record_trans });
                var items_custom_object = obtenercustomobject(record_trans, typeOfRecord, typeOfRecord, '', id_transaccion);
                // log.emergency({ title: 'items_custom_object 🐝', details: items_custom_object });
                // log.emergency({ title: 'items_custom_object.length 🐝', details: items_custom_object.length });
                var number_items = record_trans.getLineCount({
                    sublistId: 'item'
                });
                var tax_json_transaccion = record_trans.getValue({
                    fieldId: 'custbody_efx_fe_tax_json'
                });
                // log.audit({ title: 'tax_json_transaccion 🦎', details: tax_json_transaccion });
                // Trae valores de subtotal,total,descuento
                var totales_transaccion = fetchTotales(JSON.parse(tax_json_transaccion));
                // Asignacion descuento
                data_to_return.SubTotal = totales_transaccion.SubTotal;
                // data_to_return.SubTotal = totales_transaccion.SubTotal;
                data_to_return.Descuento = totales_transaccion.Descuento;
                // Trae el objeto de impuestos para mandar a timbrado
                var impuestos_global = fetchTotalImpuestos(JSON.parse(tax_json_transaccion))
                let totalesCalculados = sacaCalculosTotales(record_trans, number_items);
                data_to_return.Total = parseFloat(totalesCalculados.total_transaccion).toFixed(2);
                log.debug({ title: 'totalesCalculados 🧀🐢', details: totalesCalculados });
                // Trae objeto de conceptos con sus impuestos
                var other_index = 0; //Sometimes the indexes are not accurate specially when the transaction has discount items
                let totalBasesTraslados = 0;
                let hasExento = false;
                for (var i = 0; i < number_items; i++) {
                    // declare obj to push in data to return
                    var obj_data_conceptos = {};
                    // extract tax json from item
                    var item_tax_json = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_tax_json',
                        line: i,
                    });
                    if (item_tax_json != '') {
                        // extract default info of item
                        var claveProdServ_id = record_trans.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_mx_txn_line_sat_item_code_display',
                            // fieldId: 'custcol_mx_txn_line_sat_item_code',
                            line: i,
                        });
                        if (claveProdServ_id == undefined) {
                            claveProdServ_id = record_trans.getSublistText({
                                sublistId: 'item',
                                fieldId: 'custcol_mx_txn_line_sat_item_code',
                                line: i,
                            });
                        }
                        var claveProdServ = (claveProdServ_id).split(' - ')[0];
                        var noIdentificacion = record_trans.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_upc_code',
                            line: i,
                        });
                        // log.emergency({ title: 'noIdentificacion BF UPC', details: noIdentificacion });
                        // log.emergency({ title: 'noIdentificacion BF UPC TYPE', details: typeof noIdentificacion });
                        if (typeof noIdentificacion == undefined || noIdentificacion == null || noIdentificacion == '') {
                            // log.debug({ title: 'is empty NOIdentificacion', details: '' });
                            noIdentificacion = record_trans.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item_display',
                                line: i,
                            });
                        }

                        var cantidad = record_trans.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: i,
                        });

                        claveUnidad = items_custom_object[other_index].satUnitCode;
                        other_index++;
                        // claveUnidad = items_custom_object[i].satUnitCode;
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
                        obj_data_conceptos.ValorUnitario = parseFloat(valorUnitario);
                        obj_data_conceptos.Importe = parseFloat(importe).toFixed(2);
                        obj_data_conceptos.Descuento = descuento;
                        obj_data_conceptos.ObjetoImp = objetoImp;
                        totalBasesTraslados = parseFloat(totalBasesTraslados) + parseFloat(impuestos.bases);

                        if (objetoImp != '01') {
                            delete impuestos.bases;
                            obj_data_conceptos.Impuestos = impuestos;
                            hasExento = false;
                        } else {
                            // no es objeto de impuestos y el nodo de impuestos no debe de existir
                            delete obj_data_conceptos.Impuestos
                            hasExento = true;
                        }
                        data_to_return.Conceptos.push(obj_data_conceptos)

                    }



                }
                // Si tiene COSTO DE ENVIO, AGREGALO COMO CONCEPTO
                let totalShippingCost = 0;
                let shippingCost = record_trans.getValue({ fieldId: 'altshippingcost' });
                let shippingHandling = record_trans.getValue({ fieldId: 'althandlingcost' });
                // log.debug({ title: 'shippingCost', details: shippingCost });
                if (shippingHandling || shippingCost) {
                    if (shippingHandling != '' && shippingHandling != 0 && shippingHandling != undefined) {

                        totalShippingCost += parseFloat(shippingCost) + parseFloat(shippingHandling);
                    } else {

                        totalShippingCost += parseFloat(shippingCost);
                    }
                    var claveProd = record_trans.getValue({ fieldId: 'custbody_efx_fe_sat_cps_envio' })
                    var shipmethod = record_trans.getValue({ fieldId: 'shipmethod' });
                    var shippingTax = record_trans.getValue({ fieldId: 'shippingtaxamount' });
                    var shippingHandlingTax = record_trans.getValue({ fieldId: 'handlingtaxamount' });
                    let totalShippingTax = 0;
                    let shipping_tax_rate = 0;
                    // shippingtax1amt:"91.09"
                    // shippingtax1rate:"16"
                    if (shippingTax == undefined) {
                        shippingTax = record_trans.getValue({ fieldId: 'shippingtax1amt' });
                    }
                    totalShippingTax += parseFloat(shippingTax);
                    if (shippingHandlingTax) {
                        totalShippingTax += parseFloat(shippingHandlingTax);
                    }
                    log.audit({ title: 'shippingCost', details: shippingCost });
                    log.debug({ title: 'totalShippingCost', details: totalShippingCost });
                    // calculate the rate of the shipping tax
                    shipping_tax_rate = ((parseFloat(totalShippingTax) * 100) / parseFloat(totalShippingCost)).toFixed(2)
                    var obj_data_shipping = {
                        Cantidad: 1,
                        ClaveProdServ: claveProd,
                        ClaveUnidad: 'E48',
                        Descripcion: shipmethod,
                        Importe: totalShippingCost,
                        ValorUnitario: totalShippingCost,
                        Descuento: '0.00',
                        ObjetoImp: '02',
                        Impuestos: { Traslados: [] }
                    }
                    obj_data_shipping.Impuestos.Traslados.push({
                        Base: totalShippingCost,
                        Importe: totalShippingTax,
                        Impuesto: shipping_tax_rate == 0 ? '001' : '002',
                        TasaOCuota: (parseFloat(shipping_tax_rate) / 100).toFixed(6),
                        TipoFactor: 'Tasa'
                    });
                    log.debug({ title: 'pushed for shipping 🚗', details: obj_data_shipping });
                    data_to_return.Conceptos.push(obj_data_shipping);
                    // totalesCalculados_AUX = reajustaTotalesCalculados(obj_data_shipping.Impuestos.Traslados, totalesCalculados);
                    // totalesCalculados = totalesCalculados_AUX;
                }
                // NOTE: RECALCULATION
                let recalculateConceptos = execute_RecalculateConceptos(data_to_return.Conceptos, totalesCalculados.arrImpuesto);
                data_to_return.SubTotal = recalculateConceptos.subtotal;
                data_to_return.Total = recalculateConceptos.total;

                data_to_return.Impuestos = { Retenciones: [], Traslados: [] }
                data_to_return.Impuestos.TotalImpuestosTrasladados = recalculateConceptos.totalTraslados;
                data_to_return.Impuestos.TotalImpuestosRetenidos = recalculateConceptos.totalRetenciones;

                data_to_return.Impuestos.Retenciones = recalculateConceptos.Retenciones;
                data_to_return.Impuestos.Traslados = recalculateConceptos.Traslados;
                if (hasExento == true) {
                    delete data_to_return.Impuestos.Traslados;
                    delete data_to_return.Impuestos.TotalImpuestosTrasladados;
                }
                // Delete Retenciones if not used
                if (parseFloat(data_to_return.Impuestos.TotalImpuestosRetenidos) == 0) {
                    delete data_to_return.Impuestos.Retenciones;
                    delete data_to_return.Impuestos.TotalImpuestosRetenidos;
                }
                // Quita cantidades en cero de conceptos
                data_to_return.Conceptos = data_to_return.Conceptos.filter(function (concepto) {
                    return concepto.Cantidad !== 0;
                });
                log.audit({ title: 'data_to_return 🦀🦀', details: JSON.stringify(data_to_return) });
                return data_to_return;

            } catch (err) {
                log.error({ title: 'Error occurred in fetchConceptos', details: err });
            }
        }
       
        const fetchRelatedCFDIs = (record_trans) => {
            // [
            //     {
            //         "fol": "Factura de venta #A09",
            //         "type": "03 - Devolución de Mercancía sobre Facturas o Traslados Previos",
            //         "uuid": "8e9ebe55-fa4c-451d-a972-e92d05f03932"
            //     }
            // ]
            try {
                let data2return = [];
                let relatedCFDIs = record_trans.getValue({ fieldId: 'custbody_efx_fe_related_cfdi_json' });
                if (relatedCFDIs != '' && relatedCFDIs != null && relatedCFDIs != undefined) {
                    relatedCFDIs = JSON.parse(relatedCFDIs);
                    relatedCFDIs.forEach((element) => {
                        let tipoRel = element.type.split(' -')[0];
                        let objRelRetur = {
                            TipoRelacion: tipoRel,
                            CfdiRelacionado: [{ uuid: element.uuid }]
                        };
                        data2return.push(objRelRetur);
                        log.debug({ title: 'data2return', details: data2return });
                    });
                }
                return data2return;
            } catch (err) {
                log.error({ title: 'Error occurred in fetchRelatedCFDIs', details: err });
            }
        }
        const execute_RecalculateConceptos = (arrayConceptos, arrImpuestos) => {
            try {
                let totalTraslados = 0;
                let totalRetenciones = 0;
                // reset subtotal
                let subtotal = 0;
                let obj2Return = { descuento: 0, subtotal: 0, total: 0, Traslados: [], descuentoOriginal: 0, totalTraslados: 0, totalRetenciones: 0, Retenciones: [] }
                // Look for discounts that should not be happening
                // Example: a discount in line has a greater value than the previous item, therefore the import prints as negative
                arrayConceptos.forEach((concepto) => {
                    obj2Return.descuento += parseFloat(concepto.Descuento)
                    obj2Return.descuentoOriginal += parseFloat(concepto.Descuento)
                    // Vacía los conceptos de descuento
                    concepto.Descuento = 0;
                });
                // Solution to what to do with the inconsistent discounts
                log.debug({ title: 'TOTAL DESCUENTO CALCULADO - obj2Return.descuento', details: obj2Return.descuento });
                let objTrasladosTotales = [];
                let sumaBase = [];
                let sumaImporte = [];
                let objRetencionesTotales = {
                    Importe: 0, Impuesto: '002'
                }
                arrayConceptos.forEach((concepto) => {
                    // If discount exists, redistribute within the concepts
                    if (obj2Return.descuento > 0) {
                        if (obj2Return.descuento > parseFloat(concepto.Importe)) {
                            // apply discount as half of the Import
                            concepto.Descuento = parseFloat(concepto.Importe) / 2;
                            obj2Return.descuento -= parseFloat(concepto.Descuento);
                        } else {
                            // remaining discount amount
                            concepto.Descuento = obj2Return.descuento
                            obj2Return.descuento = 0;
                        }
                        // adjust Traslados from Impuestos
                        // readjust the first position of traslados
                    }
                    if (concepto.Impuestos) {
                        if (concepto.Impuestos.Traslados) {
                            // log.emergency({ title: 'concepto.Impuestos.Traslados[0].Base', details: concepto.Impuestos.Traslados[0].Base });

                            concepto.Impuestos.Traslados[0].Base = (parseFloat(concepto.Importe) - parseFloat(concepto.Descuento)).toFixed(2);
                            concepto.Descuento = parseFloat(concepto.Descuento).toFixed(2);
                            // concepto.Impuestos.Traslados[0].Base = (parseFloat(concepto.Impuestos.Traslados[0].Base) - parseFloat(concepto.Descuento)).toFixed(2);
                            concepto.Impuestos.Traslados[0].Base = parseFloat(concepto.Impuestos.Traslados[0].Base).toFixed(2)
                            concepto.Impuestos.Traslados[0].Importe = (parseFloat(concepto.Impuestos.Traslados[0].Base) * parseFloat(concepto.Impuestos.Traslados[0].TasaOCuota)).toFixed(2);
                            concepto.Impuestos.Traslados[0].Importe = parseFloat(concepto.Impuestos.Traslados[0].Importe).toFixed(2)
                            concepto.Impuestos.Traslados.forEach((traslado, index) => {
                                if (arrImpuestos[index] == traslado.TasaOCuota) {
                                    // log.emergency({ title: 'index', details: index });
                                    // log.emergency({ title: 'traslado', details: traslado });
                                    totalTraslados += parseFloat(traslado.Importe);
                                    sumaBase[index] = (sumaBase[index] == undefined || sumaBase[index] == null ? sumaBase[index] = 0 : parseFloat(sumaBase[index])) + parseFloat(traslado.Base);
                                    sumaImporte[index] = (sumaImporte[index] == undefined || sumaImporte[index] == null ? sumaImporte[index] = 0 : parseFloat(sumaImporte[index])) + parseFloat(traslado.Importe);
                                    objTrasladosTotales[index] = {
                                        Base: 0,
                                        Importe: 0,
                                        Impuesto: '',
                                        TasaOcuota: '',
                                        TipoFactor: 'Tasa'
                                    }
                                    objTrasladosTotales[index].Base = sumaBase[index].toFixed(2);
                                    objTrasladosTotales[index].Impuesto = traslado.Impuesto;
                                    objTrasladosTotales[index].Importe = sumaImporte[index].toFixed(2);
                                    objTrasladosTotales[index].TasaOcuota = arrImpuestos[index];
                                }
                            });

                        }
                        if (concepto.Impuestos.Retenciones) {
                            concepto.Impuestos.Retenciones.forEach((retencion) => {
                                totalRetenciones += parseFloat(retencion.Importe);
                                objRetencionesTotales.Importe += parseFloat(retencion.Importe);
                            })
                        }


                    }
                    subtotal += parseFloat(concepto.Importe);
                });
                // Traslados and Retenciones array of object
                // objTrasladosTotales.Base = parseFloat(objTrasladosTotales.Base).toFixed(2);
                // objTrasladosTotales.Importe = parseFloat(objTrasladosTotales.Importe).toFixed(2);
                obj2Return.Traslados = objTrasladosTotales;
                obj2Return.Retenciones.push(objRetencionesTotales);

                subtotal = subtotal.toFixed(2);
                obj2Return.subtotal = subtotal;
                obj2Return.totalRetenciones = totalRetenciones.toFixed(2);
                obj2Return.totalTraslados = totalTraslados.toFixed(2);
                obj2Return.total = parseFloat(subtotal) + parseFloat(totalTraslados) - parseFloat(obj2Return.descuentoOriginal) - parseFloat(totalRetenciones)
                obj2Return.total = obj2Return.total.toFixed(2);

                log.emergency({ title: 'obj2Return ✅', details: obj2Return });
                return obj2Return
            } catch (err) {
                log.error({ title: 'Error occurred in execute_RecalculateConceptos', details: err });
            }
        }
        const reajustaTotalesCalculados = (objData, totCalc) => {
            try {
                let totalesCalculados = {
                    total_transaccion: totCalc.total_transaccion,
                    TotalImpuestosTrasladados: totCalc.TotalImpuestosTrasladados,
                    TotalImpuestosRetenidos: totCalc.TotalImpuestosRetenidos,
                    descuentos: totCalc.descuentos,
                    subtotal: totCalc.subtotal,
                    arrImpuesto: totCalc.arrImpuesto
                }
                totalesCalculados.subtotal += parseFloat(objData[0].Base);
                totalesCalculados.TotalImpuestosRetenidos += parseFloat(objData[0].Importe);
                totalesCalculados.total_transaccion = parseFloat(totalesCalculados.subtotal) + parseFloat(totalesCalculados.TotalImpuestosTrasladados) - parseFloat(totalesCalculados.descuentos) - parseFloat(totalesCalculados.TotalImpuestosRetenidos)
                totalesCalculados.total_transaccion = parseFloat(totalesCalculados.total_transaccion).toFixed(2);
                log.emergency({ title: 'totalesCalculados - reajustaTotalesCalculados', details: totalesCalculados });
                return totalesCalculados;
            } catch (err) {
                log.error({ title: 'Error occurred in reajustaTotalesCalculados', details: err });
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
        const concatAdenda2XML = (contentAdenda, stampedXML) => {
            let data_to_return = {
                success: false,
                newXMLContent: ''
            }
            try {
                const indexOfNodeEnd = stampedXML.indexOf('</cfdi:Complemento>');
                const indexOfNodeEndComprobante = stampedXML.indexOf('</cfdi:Comprobante>');

                if (indexOfNodeEnd === -1) {
                    // Node not found, return the original XML string
                    return data_to_return;
                }

                // Split the XML string into two parts at the insertion point
                const part1 = stampedXML.substring(0, indexOfNodeEnd); // Before </cfdi:Complemento>
                let part2 = ''

                // Concatenate the new string in between
                let modifiedXmlString = ''
                if (contentAdenda.includes('<cfdi:Addenda')) {
                    part2 = stampedXML.substring(indexOfNodeEnd, indexOfNodeEndComprobante);     // Including </cfdi:Complemento>
                    // Place at the end of complemento
                    modifiedXmlString = part1 + part2 + contentAdenda + '</cfdi:Comprobante>';
                } else {
                    part2 = stampedXML.substring(indexOfNodeEnd);     // Including </cfdi:Complemento>
                    modifiedXmlString = part1 + contentAdenda + part2;

                }
                data_to_return.success = true;
                data_to_return.newXMLContent = modifiedXmlString;

            } catch (err) {
                log.error({ title: 'Error occurred in concatAdenda2XML', details: err });
            }
            return data_to_return
        }
        const fetchCertifiedFolder = () => {
            try {
                const customrecordMxplusRcdConfigSearchFilters = [];

                const folderCertified = search.createColumn({ name: 'custrecord_mxplus_folder_xml' });

                const customrecordMxplusRcdConfigSearch = search.create({
                    type: 'customrecord_mxplus_rcd_config',
                    filters: customrecordMxplusRcdConfigSearchFilters,
                    columns: [

                        folderCertified,
                    ],
                });
                let folder = ''
                customrecordMxplusRcdConfigSearch.run().each((result) => {
                    folder = result.getValue(folderCertified);
                    return true
                });
                return folder

            } catch (err) {
                log.error({ title: 'Error occurred in fetchCertifiedFolder', details: err });
            }
        }
        function save_json_file(data, tranid_text, extension, type, record_trans) {
            try {
                var fileObj = file.create({
                    name: 'FACTURA_' + tranid_text + '.' + extension,
                    fileType: file.Type.PLAINTEXT,
                    contents: data,
                    encoding: file.Encoding.UTF8,
                    folder: fetchCertifiedFolder(),
                    isOnline: true
                });
                var fileId_generated = fileObj.save();
                // Save the file in document field of MX+ XML Certificado
                log.debug({ title: 'type save_json_file', details: type });
                record_trans.setValue({ fieldId: 'custbody_mx_plus_xml_generado', value: fileId_generated });
                record_trans.save({ enableSourcing: false, ignoreMandatoryFields: true });
                // record.submitFields({
                //     type: type,
                //     id: id_transaccion,
                //     values: {
                //         custbody_mx_plus_xml_generado: fileId_generated,
                //         // custbody_psg_ei_generated_edoc: fileId_generated
                //     },
                //     options: {
                //         enableSourcing: true,
                //         ignoreMandatoryFields: true
                //     }
                // });
                return fileId_generated
            } catch (err) {
                log.error({ title: 'Error occurred in save_json_file', details: err });
            }
        }
        function saveAllCertifiedInformation_MR(xml_file, data, id_transaccion, tranid, type, json_file) {
            try {
                log.debug({ title: 'saving transaction: ' + tranid, details: 'processing' });

                // Convert type of transaction
                let typeGBL = type;
                if (type == 'CustInvc') {
                    typeGBL = 'invoice'
                }
                if (typeGBL != 'customsale_efx_fe_factura_global') {

                    record.submitFields({
                        type: typeGBL,
                        id: id_transaccion,
                        values: {
                            custbody_mx_plus_xml_generado: json_file,
                            custbody_mx_plus_xml_certificado: xml_file,
                            custbody_psg_ei_certified_edoc: xml_file,
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
                } else {

                    record.submitFields({
                        type: typeGBL,
                        id: id_transaccion,
                        values: {
                            custbody_mx_plus_xml_generado: json_file,
                            custbody_mx_plus_xml_certificado: xml_file,
                            custbody_psg_ei_certified_edoc: xml_file,
                            custbody_efx_fe_cfdi_qr_code: data.qrCode,
                            custbody_mx_cfdi_uuid: data.uuid,
                            custbody_efx_cfdi_sat_serie: data.noCertificadoSAT,
                            custbody_efx_cfdi_sat_sello: data.selloSAT,
                            custbody_efx_cfdi_sello: data.selloCFDI,
                            custbody_efx_cfdi_cadena_original: data.cadenaOriginalSAT,
                            custbody_mx_cfdi_certify_timestamp: data.fechaTimbrado,
                            custbody_efx_cfdi_serial: data.noCertificadoCFDI,
                            custbody_mx_cfdi_issue_datetime: data.fechaTimbrado
                        },
                        options: {
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        }
                    });
                }
                log.debug({ title: 'saving transaction: ' + id_transaccion, details: 'finished' });

                return true
            } catch (err) {
                log.error({ title: 'Error occurred in saveAllCertifiedInformation_MR', details: err });
                return false
            }
        }
        function saveAllCertifiedInformation(dataXML, data, id_transaccion, tranid, type, dataJSON, record_trans) {
            var data2return = {
                jsonFileId: '',
                xmlFileId: ''
            }
            try {
                log.debug({ title: 'saving transaction: ' + tranid, details: 'processing' });
                var fileObj = file.create({
                    name: 'FACTURA_' + tranid + '.xml',
                    fileType: file.Type.PLAINTEXT,
                    contents: dataXML,
                    encoding: file.Encoding.UTF8,
                    folder: fetchCertifiedFolder(),
                    isOnline: true
                });
                var fileId_stamped = fileObj.save();
                data2return.xmlFileId = fileId_stamped;
                // Save the file in document field of MX+ XML Certificado
                var fileObjJSON = file.create({
                    name: 'FACTURA_' + tranid + '.txt',
                    fileType: file.Type.PLAINTEXT,
                    contents: dataJSON,
                    encoding: file.Encoding.UTF8,
                    folder: fetchCertifiedFolder(),
                    isOnline: true
                });
                var fileId_generatedJSON = fileObjJSON.save();
                data2return.jsonFileId = fileId_generatedJSON;
                // Convert type of transaction
                let typeGBL = type;
                if (type == 'CustInvc') {
                    typeGBL = 'invoice'
                }
                try {
                    record_trans.setValue({ fieldId: 'custbody_mx_plus_xml_generado', value: fileId_generatedJSON });
                    record_trans.setValue({ fieldId: 'custbody_mx_plus_xml_certificado', value: fileId_stamped });
                    record_trans.setValue({ fieldId: 'custbody_psg_ei_certified_edoc', value: fileId_stamped });
                    record_trans.setValue({ fieldId: 'custbody_mx_cfdi_qr_code', value: data.qrCode });
                    record_trans.setValue({ fieldId: 'custbody_mx_cfdi_uuid', value: data.uuid });
                    record_trans.setValue({ fieldId: 'custbody_mx_cfdi_sat_serial', value: data.noCertificadoSAT });
                    record_trans.setValue({ fieldId: 'custbody_mx_cfdi_sat_signature', value: data.selloSAT });
                    record_trans.setValue({ fieldId: 'custbody_mx_cfdi_signature', value: data.selloCFDI });
                    record_trans.setValue({ fieldId: 'custbody_mx_cfdi_cadena_original', value: data.cadenaOriginalSAT });
                    record_trans.setValue({ fieldId: 'custbody_mx_cfdi_certify_timestamp', value: data.fechaTimbrado });
                    record_trans.setValue({ fieldId: 'custbody_mx_cfdi_issuer_serial', value: data.noCertificadoCFDI });
                    record_trans.save({ enableSourcing: false, ignoreMandatoryFields: true });
                    // record.submitFields({
                    //     type: typeGBL,
                    //     id: id_transaccion,
                    //     values: {
                    //         custbody_mx_plus_xml_generado: fileId_generatedJSON || '',
                    //         custbody_mx_plus_xml_certificado: fileId_stamped || '',
                    //         custbody_psg_ei_certified_edoc: fileId_stamped || '',
                    //         custbody_mx_cfdi_qr_code: data.qrCode || '',
                    //         custbody_mx_cfdi_uuid: data.uuid || '',
                    //         custbody_mx_cfdi_sat_serial: data.noCertificadoSAT || '',
                    //         custbody_mx_cfdi_sat_signature: data.selloSAT || '',
                    //         custbody_mx_cfdi_signature: data.selloCFDI || '',
                    //         custbody_mx_cfdi_cadena_original: data.cadenaOriginalSAT || '',
                    //         custbody_mx_cfdi_certify_timestamp: data.fechaTimbrado || '',
                    //         custbody_mx_cfdi_issuer_serial: data.noCertificadoCFDI || ''
                    //     },
                    //     options: {
                    //         enableSourcing: true,
                    //         ignoreMandatoryFields: true
                    //     }
                    // });
                    log.debug({ title: 'saving transaction: ' + id_transaccion, details: 'finished' });
                } catch (err) {
                    log.error({ title: 'Error occurred in submitting saveAllCertifiedInformation', details: err });
                }


                return data2return
            } catch (err) {
                log.error({ title: 'Error occurred in saveAllCertifiedInformation', details: err });
                return data2return
            }
        }
        function save_xml_file(data, id_transaccion, tranid_text, type) {
            try {

                var fileObj = file.create({
                    name: 'FACTURA_' + tranid_text + '.xml',
                    fileType: file.Type.PLAINTEXT,
                    contents: data,
                    encoding: file.Encoding.UTF8,
                    folder: fetchCertifiedFolder(),
                    isOnline: true
                });
                var fileId_stamped = fileObj.save();
                // Save the file in document field of MX+ XML Certificado
                record.submitFields({
                    type: type,
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
        function save_stamp_info(data, id_transaccion, type) {
            try {
                record.submitFields({
                    type: type,
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
                    url: url_str + "/security/authenticate",
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

        const fetchGBLTransactionsInfo = (arrayOfTransactions) => {
            try {
                let data2Return = [];
                log.debug({ title: 'arrayOfTransactions PARAMETERS', details: arrayOfTransactions });
                arrayOfTransactions.forEach(element => {
                    let dataObj = {
                        tranid: '', type: '', id: ''
                    }
                    const filtersGBLTransactions = [
                        ['internalid', search.Operator.ANYOF, element],
                        "AND",
                        ["mainline", search.Operator.IS, "T"],
                    ];

                    const tranidOfTransaction = search.createColumn({ name: 'tranid' });
                    const typeOfTransaction = search.createColumn({ name: 'type' });

                    const customrecordEfxFeAdendizadorSearch = search.create({
                        type: search.Type.TRANSACTION,
                        filters: filtersGBLTransactions,
                        columns: [
                            tranidOfTransaction,
                            typeOfTransaction,
                        ],
                    });

                    const searchPagedOfTransactions = customrecordEfxFeAdendizadorSearch.runPaged({ pageSize: 1000 });

                    for (let i = 0; i < searchPagedOfTransactions.pageRanges.length; i++) {
                        const gblTransactionsPage = searchPagedOfTransactions.fetch({ index: i });
                        gblTransactionsPage.data.forEach((result) => {

                            dataObj.tranid = result.getValue(tranidOfTransaction);
                            dataObj.type = result.getValue(typeOfTransaction);
                            dataObj.id = element;
                            data2Return.push(dataObj);
                        });
                    }
                });
                log.debug({ title: 'data2Return', details: data2Return });
                return data2Return
            } catch (err) {
                log.error({ title: 'Error occurred in fetchGBLTransactionsInfo', details: err });
            }
        }
        const getCustomerInformation = id => {
            const data = {}
            try {
                const { CUSTOMER } = constants.RECORDS
                const columns = Object.values(CUSTOMER.FIELDS)
                const objSearch = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id,
                    columns
                })
                columns.forEach(column => {
                    if (typeof objSearch[column] == 'object') {
                        data[column] = objSearch[column][0].value
                    } else {
                        data[column] = objSearch[column]
                    }
                })
                if (data[CUSTOMER.FIELDS.REG_FIS]) {
                    data[CUSTOMER.FIELDS.REG_FIS] = functions.getRegFiscal(data[CUSTOMER.FIELDS.REG_FIS])
                }
                if (data[CUSTOMER.FIELDS.USO_CFDI]) {
                    data[CUSTOMER.FIELDS.USO_CFDI] = functions.getUsoCFDI(data[CUSTOMER.FIELDS.USO_CFDI])
                }
            } catch (error) {
                log.error('Error on getCustomerInformation', error)
            }
            return data
        }
        const fetchConceptosGlobal = (record_trans, id_transaccion, typeOfRecord) => {
            try {
                var data_to_return = {
                    "Version": "4.0",
                    "FormaPago": "01",
                    "Serie": "",
                    "Folio": "",
                    "Fecha": "",
                    "MetodoPago": "",
                    "Sello": "",
                    "NoCertificado": "",
                    "Certificado": "",
                    "Moneda": "",
                    "TipoCambio": "",
                    "TipoDeComprobante": "I",
                    "Exportacion": "01",
                    "LugarExpedicion": "",
                    "Emisor": {
                        "Rfc": "",
                        // "Rfc": "EKU9003173C9",
                        "Nombre": "",
                        // "Nombre": "ESCUELA KEMPER URGATE",
                        "RegimenFiscal": ""
                        // "RegimenFiscal": "603"
                    },
                    "Receptor": {
                        "Rfc": "",
                        // "Rfc": "EKU9003173C9",
                        "Nombre": "",
                        // "Nombre": "ESCUELA KEMPER URGATE",
                        "DomicilioFiscalReceptor": "",
                        // "DomicilioFiscalReceptor": "42501",
                        "RegimenFiscalReceptor": "",
                        // "RegimenFiscalReceptor": "601",
                        "UsoCFDI": ""
                        // "UsoCFDI": "CP01"
                    },
                    "SubTotal": "",
                    "Total": "",
                    "Descuento": "",
                    "Conceptos": [],
                    "arr_GBLTransactions": []


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
                data_to_return.Moneda = record_trans.getText({ fieldId: 'currency' });
                if (data_to_return.Moneda == 'Pesos' || data_to_return.Moneda == 'MEX') {
                    data_to_return.Moneda = 'MXN';
                }

                log.audit({ title: 'record_trans GLOBAL', details: record_trans });
                var items_custom_object = obtenercustomobject(record_trans, typeOfRecord, typeOfRecord, '', id_transaccion);
                log.emergency({ title: 'items_custom_object 🐝 GLOBAL', details: items_custom_object });
                log.emergency({ title: 'items_custom_object.length 🐝 GLOBAL', details: items_custom_object.length });
                var number_items = record_trans.getLineCount({
                    sublistId: 'item'
                });
                data_to_return.TipoCambio = record_trans.getValue({ fieldId: 'exchangerate' });
                // ********Basic Information fill out***********
                let basicInfo = fetchBasicInfo(record_trans);
                data_to_return.Serie = basicInfo.Serie;
                data_to_return.Folio = basicInfo.Folio;
                data_to_return.MetodoPago = basicInfo.MetodoPago;
                data_to_return.FormaPago = basicInfo.FormaPago;
                // ********************************
                const { CUSTOMER } = RECORDS

                const isOW = functions.checkOWAccount()
                const emisor = isOW ? functions.getSubsidiaryInformation(record_trans.getValue({ fieldId: 'subsidiary' })) : functions.getCompanyInformation()
                if (isOW) {
                    log.debug({ title: 'emisor OW GBL', details: emisor });
                    let rfcEmisorAux = ''
                    if (emisor[functions.SUBSIDIARY.FIELDS.RFC] == null) {
                        rfcEmisorAux = getEmisorRFC(record_trans.getValue({ fieldId: 'subsidiary' }));
                    }
                    data_to_return.Emisor.Rfc = emisor[functions.SUBSIDIARY.FIELDS.RFC] == null ? rfcEmisorAux : emisor[functions.SUBSIDIARY.FIELDS.RFC]
                    data_to_return.Emisor.Nombre = emisor[functions.SUBSIDIARY.FIELDS.LEGAL_NAME]
                    data_to_return.Emisor.RegimenFiscal = Number(emisor[functions.SUBSIDIARY.FIELDS.REG_FIS])
                    data_to_return.LugarExpedicion = emisor[functions.SUBSIDIARY.FIELDS.ZIP]

                } else {
                    log.debug({ title: 'emisor NO OW GBL', details: emisor });
                    data_to_return.Emisor.Rfc = emisor[functions.COMPANY.FIELDS.RFC]
                    data_to_return.Emisor.Nombre = emisor[functions.COMPANY.FIELDS.LEGAL_NAME]
                    data_to_return.Emisor.RegimenFiscal = Number(emisor[functions.COMPANY.FIELDS.REG_FIS])
                    data_to_return.LugarExpedicion = emisor.zip
                    // data_to_return.LugarExpedicion = emisor[functions.COMPANY.FIELDS.ZIP]

                }
                /** Receptor */
                // verify if customer is from Kiosko

                const receptor = getCustomerInformation(record_trans.getValue({ fieldId: 'custbody_efx_fe_gbl_clientesucursal' }))
                data_to_return.Receptor.Rfc = receptor[CUSTOMER.FIELDS.RFC]
                let otherCustomerInformation = getCustomerBasicInformation(record_trans.getValue({ fieldId: 'custbody_efx_fe_gbl_clientesucursal' }), record_trans)
                data_to_return.Receptor.DomicilioFiscalReceptor = (receptor[CUSTOMER.FIELDS.RFC] == 'XAXX010101000' || receptor[CUSTOMER.FIELDS.RFC] == 'XEXX010101000' ? data_to_return.LugarExpedicion : otherCustomerInformation.DomicilioFiscalReceptor)
                data_to_return.Receptor.Nombre = (receptor[CUSTOMER.FIELDS.RFC] == 'XAXX010101000' ? 'PUBLICO GENERAL' : otherCustomerInformation.NombreSAT)
                data_to_return.Receptor.RegimenFiscalReceptor = otherCustomerInformation.regFiscal;
                data_to_return.Receptor.UsoCFDI = otherCustomerInformation.UsoCFDI;
                if (data_to_return.Receptor.NumRegIdTrib == '') {
                    delete data_to_return.Receptor.NumRegIdTrib
                    delete data_to_return.Receptor.ResidenciaFiscal
                }

                data_to_return.arr_GBLTransactions = fetchGBLTransactionsInfo(record_trans.getValue({ fieldId: 'custbody_efx_fe_gbl_transactions' }))
                log.audit({ title: 'number_items GLOBAL', details: number_items });
                let totalesCalculados = sacaCalculosTotales(record_trans, number_items);
                data_to_return.Total = parseFloat(totalesCalculados.total_transaccion).toFixed(2);
                data_to_return.SubTotal = parseFloat(totalesCalculados.subtotal).toFixed(2);
                data_to_return.Descuento = parseFloat(totalesCalculados.descuentos).toFixed(2);
                log.debug({ title: 'totalesCalculados 🧀🐢 GLOBAL', details: totalesCalculados });


                // Trae objeto de conceptos con sus impuestos
                var other_index = 0; //Sometimes the indexes are not accurate specially when the transaction has discount items
                let totalBasesTraslados = 0;
                let hasExento = false;
                for (var i = 0; i < number_items; i++) {
                    // declare obj to push in data to return
                    var obj_data_conceptos = {};
                    // extract tax json from item
                    var item_tax_json = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_tax_json',
                        line: i,
                    });
                    if (item_tax_json != '') {
                        // extract default info of item
                        var claveProdServ = '01010101';
                        var noIdentificacion = record_trans.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_upc_code',
                            line: i,
                        });
                        if (typeof noIdentificacion == undefined || noIdentificacion == null || noIdentificacion == '') {
                            log.debug({ title: 'is empty NOIdentificacion', details: '' });
                            noIdentificacion = record_trans.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item_display',
                                line: i,
                            });
                        }
                        var cantidad = record_trans.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: i,
                        });

                        claveUnidad = items_custom_object[other_index].satUnitCode;
                        other_index++;
                        // claveUnidad = items_custom_object[i].satUnitCode;
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
                        obj_data_conceptos.ClaveProdServ = claveProdServ;
                        obj_data_conceptos.NoIdentificacion = noIdentificacion;
                        obj_data_conceptos.Cantidad = cantidad;
                        obj_data_conceptos.ClaveUnidad = claveUnidad;
                        obj_data_conceptos.Unidad = unidad;
                        obj_data_conceptos.Descripcion = descripcion;
                        obj_data_conceptos.ValorUnitario = parseFloat(valorUnitario).toFixed(2);
                        obj_data_conceptos.Importe = parseFloat(importe).toFixed(2);
                        obj_data_conceptos.Descuento = descuento;
                        obj_data_conceptos.ObjetoImp = objetoImp;
                        totalBasesTraslados = parseFloat(totalBasesTraslados) + parseFloat(impuestos.bases);

                        if (objetoImp != '01') {

                            delete impuestos.bases;
                            obj_data_conceptos.Impuestos = impuestos;
                            hasExento = false;
                        } else {
                            // no es objeto de impuestos y el nodo de impuestos no debe de existir
                            delete obj_data_conceptos.Impuestos
                            hasExento = true;
                        }
                        data_to_return.Conceptos.push(obj_data_conceptos)
                    }



                }
                // Si tiene COSTO DE ENVIO, AGREGALO COMO CONCEPTO
                let totalShippingCost = 0;
                let shippingCost = record_trans.getValue({ fieldId: 'altshippingcost' });
                let shippingHandling = record_trans.getValue({ fieldId: 'althandlingcost' });
                // log.debug({ title: 'shippingCost', details: shippingCost });
                if (shippingHandling || shippingCost) {
                    if (shippingHandling != '' && shippingHandling != 0 && shippingHandling != undefined) {

                        totalShippingCost += parseFloat(shippingCost) + parseFloat(shippingHandling);
                    } else {

                        totalShippingCost += parseFloat(shippingCost);
                    }
                    var shipmethod = record_trans.getValue({ fieldId: 'shipmethod' });
                    var shippingTax = record_trans.getValue({ fieldId: 'shippingtaxamount' });
                    var shippingHandlingTax = record_trans.getValue({ fieldId: 'handlingtaxamount' });
                    let totalShippingTax = 0;
                    let shipping_tax_rate = 0;
                    // shippingtax1amt:"91.09"
                    // shippingtax1rate:"16"
                    if (shippingTax == undefined) {
                        shippingTax = record_trans.getValue({ fieldId: 'shippingtax1amt' });
                    }
                    totalShippingTax += parseFloat(shippingTax);
                    if (shippingHandlingTax) {
                        totalShippingTax += parseFloat(shippingHandlingTax);
                    }
                    log.audit({ title: 'shippingCost', details: shippingCost });
                    log.debug({ title: 'totalShippingCost', details: totalShippingCost });
                    // calculate the rate of the shipping tax
                    shipping_tax_rate = ((parseFloat(totalShippingTax) * 100) / parseFloat(totalShippingCost)).toFixed(2)
                    var obj_data_shipping = {
                        Cantidad: 1,
                        ClaveProdServ: '01010101',
                        ClaveUnidad: 'E48',
                        Descripcion: shipmethod,
                        Importe: totalShippingCost,
                        ValorUnitario: totalShippingCost,
                        Descuento: '0.00',
                        ObjetoImp: '02',
                        Impuestos: { Traslados: [] }
                    }
                    obj_data_shipping.Impuestos.Traslados.push({
                        Base: totalShippingCost,
                        Importe: totalShippingTax,
                        Impuesto: shipping_tax_rate == 0 ? '001' : '002',
                        TasaOCuota: (parseFloat(shipping_tax_rate) / 100).toFixed(6),
                        TipoFactor: 'Tasa'
                    });
                    log.debug({ title: 'pushed for shipping 🚗', details: obj_data_shipping });
                    data_to_return.Conceptos.push(obj_data_shipping);
                    // totalesCalculados_AUX = reajustaTotalesCalculados(obj_data_shipping.Impuestos.Traslados, totalesCalculados);
                    // totalesCalculados = totalesCalculados_AUX;
                }
                // NOTE: RECALCULATION
                let recalculateConceptos = execute_RecalculateConceptos(data_to_return.Conceptos, totalesCalculados.arrImpuesto);
                data_to_return.SubTotal = recalculateConceptos.subtotal;
                data_to_return.Total = recalculateConceptos.total;

                data_to_return.Impuestos = { Retenciones: [], Traslados: [] }
                data_to_return.Impuestos.TotalImpuestosTrasladados = recalculateConceptos.totalTraslados;
                data_to_return.Impuestos.TotalImpuestosRetenidos = recalculateConceptos.totalRetenciones;

                data_to_return.Impuestos.Retenciones = recalculateConceptos.Retenciones;
                data_to_return.Impuestos.Traslados = recalculateConceptos.Traslados;
                if (hasExento == true) {
                    delete data_to_return.Impuestos.Traslados;
                    delete data_to_return.Impuestos.TotalImpuestosTrasladados;
                }
                // Delete Retenciones if not used
                if (parseFloat(data_to_return.Impuestos.TotalImpuestosRetenidos) == 0) {
                    delete data_to_return.Impuestos.Retenciones;
                    delete data_to_return.Impuestos.TotalImpuestosRetenidos;
                }
                // Quita cantidades en cero de conceptos
                data_to_return.Conceptos = data_to_return.Conceptos.filter(function (concepto) {
                    return concepto.Cantidad !== 0;
                });

                log.audit({ title: 'data_to_return GBL🦀🦀', details: JSON.stringify(data_to_return) });
                return data_to_return;

            } catch (err) {
                log.error({ title: 'Error occurred in fetchConceptosGlobal', details: err });
            }
        }

        const execute_invoiceStamp = (tranid, type, adendaText, reprocessedGBL) => {
            var response_to_send = { success: false, msg: '', schedulePDFrender: false, xmlId: 0 };

            try {
                var record_trans = record.load({
                    type: type,
                    id: tranid,
                    isDynamic: false,
                });
                let authentication_data = authenticationCredentials(record_trans);
                // log.emergency({ title: 'authentication_data', details: authentication_data });
                var bearer_token = getAuthenticationToken(
                    authentication_data.url,
                    authentication_data.user_email,
                    authentication_data.user_password
                );
                // log.debug({ title: 'type execute_invoiceStamp', details: type });
                log.audit({ title: "bearer_token", details: bearer_token });
                if (bearer_token.successful) {

                    log.audit({ title: "bearer_token.token", details: bearer_token.token });
                    var data_to_stamp = {}
                    if (type == 'invoice' || type == 'cashsale' || type == 'creditmemo') {
                        data_to_stamp = fetchConceptos(record_trans, tranid, type);

                    } else {
                        // Case for factura global
                        data_to_stamp = fetchConceptosGlobal(record_trans, tranid, type);

                    }
                    // If it has more than 200 items, create PDF and send email using map-reduce
                    // else: try to render PDF and send emails
                    if (data_to_stamp.Conceptos.length >= 1) {
                        response_to_send.schedulePDFrender = true;
                    }
                    let arrayGBLTransactions = data_to_stamp.arr_GBLTransactions;
                    log.audit({ title: ' data_to_stamp.arr_GBLTransactions', details: data_to_stamp.arr_GBLTransactions });

                    log.debug({ title: 'arrayGBLTransactions BEFORE', details: arrayGBLTransactions });
                    if (data_to_stamp.arr_GBLTransactions) {
                        delete data_to_stamp.arr_GBLTransactions;
                    }
                    var headers = {
                        "Content-Type": 'application/jsontoxml',
                        "Authorization": "Bearer " + bearer_token.token
                    };
                    var response_stamp = https.post({
                        url: authentication_data.url + '/v3/cfdi33/issue/json/v4',
                        headers: headers,
                        body: JSON.stringify(data_to_stamp)

                    });
                    log.emergency({ title: 'response_stamp', details: JSON.stringify(response_stamp) });
                    if (response_stamp.code == 200) {

                        log.audit({ title: 'response_stamp.body', details: JSON.stringify(response_stamp.body) });
                        var response_json_stamp = JSON.parse(response_stamp.body);
                        log.audit({ title: 'response_json_stamp 🌟🌟🌟', details: response_json_stamp });
                        if (response_json_stamp.data) {
                            var tranid_text = record_trans.getValue({ fieldId: 'tranid' });
                            // It is stamped and there is the XML file but as string, just parse it
                            if (Object.keys(response_json_stamp.data.cfdi).length !== 0) {
                                let xml_toSave = response_json_stamp.data.cfdi;

                                let stamped_xml_w_adenda = {
                                    success: false,
                                    newXMLContent: ''
                                }
                                if (adendaText.transactionAdenda.success == true) {

                                    stamped_xml_w_adenda = concatAdenda2XML(adendaText.transactionAdenda.content.replaceAll('<?xml version="1.0" encoding="utf-8"?>', ''), response_json_stamp.data.cfdi);
                                    if (stamped_xml_w_adenda.success == true) {
                                        xml_toSave = stamped_xml_w_adenda.newXMLContent
                                    } else {
                                        response_to_send.success = false;
                                        response_to_send.msg = 'Error en la adenda, favor de validar contenido';
                                    }
                                }

                                // var file_id_saved = save_xml_file(xml_toSave, tranid, tranid_text, type);
                                // var file_id_generated = save_json_file(JSON.stringify(data_to_stamp), tranid, tranid_text, 'txt', type);
                                // var save_stamp_information = save_stamp_info(response_json_stamp.data, tranid, type);
                                var resp_saveAllStampInfo = saveAllCertifiedInformation(xml_toSave, response_json_stamp.data, tranid, tranid_text, type, JSON.stringify(data_to_stamp), record_trans)
                                if (resp_saveAllStampInfo) {
                                    // if (file_id_saved && file_id_generated && save_stamp_information) {
                                    response_to_send.success = true;
                                    response_to_send.xmlId = resp_saveAllStampInfo.xmlFileId
                                    response_to_send.msg = 'Se ha generado y certificado con éxito';
                                    if (stamped_xml_w_adenda.success == true) {
                                        response_to_send.msg = 'Se ha generado y certificado con éxito con adenda';

                                    }


                                } else {
                                    response_to_send.success = false;
                                    response_to_send.msg = 'Error al guardar el archivo';
                                }
                                // }
                                log.audit({ title: 'reprocessedGBL 🐧', details: reprocessedGBL });
                                log.audit({ title: 'typeof reprocessedGBL 🐧', details: typeof reprocessedGBL });
                                if (reprocessedGBL === true || reprocessedGBL == 'true') {
                                    log.debug({ title: 'arrayGBLTransactions 🕯️', details: arrayGBLTransactions });
                                    // Execute map-reduce for updating the stamped information

                                    if (arrayGBLTransactions.length > 0) {
                                        for (let i = 1; i <= 10; i++) {
                                            let scriptdeployment_id = 'customdeploy_mxplus_updaterelatedtrans' + i;
                                            var fg_task = task.create({ taskType: task.TaskType.MAP_REDUCE });
                                            fg_task.scriptId = 'customscript_mxplus_updaterelatedtransac';
                                            fg_task.deploymentId = scriptdeployment_id;
                                            let dataOBJStamp = response_json_stamp.data;
                                            // Delete the CFDI XML because it's a lot of information to pass as parameter inside a field of NS
                                            delete dataOBJStamp.cfdi
                                            fg_task.params = { custscript_mxplus_transinfo: JSON.stringify(arrayGBLTransactions), custscript_mxplus_xmlfile: resp_saveAllStampInfo.xmlFileId, custscript_mxplus_jsonfile: resp_saveAllStampInfo.jsonFileId, custscript_mxplus_objdata: JSON.stringify(dataOBJStamp) };

                                            try {
                                                var fg_taskID = fg_task.submit();
                                                log.debug("scriptTaskId - FG update related transactions", fg_taskID);
                                                break;
                                            }
                                            catch (e) {
                                                log.debug({ title: "error", details: e });
                                                log.emergency("summarize", "Aún esta corriendo el deployment: " + scriptdeployment_id);
                                            }
                                        }

                                    } else {
                                        log.debug({ title: 'No related transactions were found', details: 'no transactions in GBL' });
                                    }
                                } else {
                                    log.audit({ title: 'reprocessedGBL did not reprocess', details: false });

                                }

                            } else {
                                var file_id_generated = save_json_file(JSON.stringify(data_to_stamp), tranid_text, 'txt', type, record_trans);
                                response_to_send.success = false;
                                response_to_send.msg = 'Error al timbrar la transacción: ' + response_json_stamp.messageDetail;
                            }
                        }
                    } else {
                        if (response_stamp.body) {
                            var file_id_generated = save_json_file(JSON.stringify(data_to_stamp), tranid, 'txt', type, record_trans);

                            var body_obj = JSON.parse(response_stamp.body)
                            response_to_send.success = false;
                            response_to_send.msg = body_obj.message + ' - ' + body_obj.messageDetail;
                        }
                    }
                } else {
                    response_to_send.success = false;
                    response_to_send.msg = 'Credenciales incorrectas, favor de contactar a soporte';
                }
            } catch (err) {
                log.error({ title: 'Error occurred in execute_invoiceStamp', details: err });
            }
            return response_to_send
        }
        function removeDetallista(xmlString) {
            var regex = /<detallista:detallista.*>(.|\s)*<\/detallista:detallista>/g;
            var regex2 = /<cfdi:Addenda.*>(.|\s)*<\/cfdi:Addenda>/g;

            // Replace all matches with an empty string
            var cleanedXml = xmlString.replace(regex, '');
            cleanedXml = cleanedXml.replace(regex2, '');

            return cleanedXml;
        }

        return { execute_invoiceStamp, saveAllCertifiedInformation_MR, concatAdenda2XML, removeDetallista, fetchCertifiedFolder,obtenercustomobject }

    });