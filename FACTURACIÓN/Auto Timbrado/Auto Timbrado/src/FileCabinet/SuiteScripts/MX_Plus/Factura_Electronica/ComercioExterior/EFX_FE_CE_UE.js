/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
// PURCHASE_REQUISITION
define(['N/log', 'N/record', 'N/search', 'N/currency', 'N/config', 'N/runtime', 'N/query', 'N/format', '../../Utilities/moment.js', 'N/https'],
    function (log, modRecord, search, modcurrency, config, runtime, query, format, moment, https) {
        function beforeSubmit(context) {
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
                    var datae = 1;
                    if (custbody_efx_fe_comercio_exterior) {
                        if (recType == modRecord.Type.ITEM_FULFILLMENT) {
                            var creadodeff = record.getValue({ fieldId: 'createdfrom' });
                            try {
                                var creadodeffReco = modRecord.load({
                                    type: modRecord.Type.SALES_ORDER,
                                    id: creadodeff
                                });
                                var tipoTransaccionff = creadodeffReco.type;
                                log.audit({
                                    title: 'tipoTransaccionff',
                                    details: tipoTransaccionff
                                });
                            } catch (errortransaccionff) {
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
                        var cliente_id = record.getValue({ fieldId: 'entity' });
                        var destinatario_id = record.getValue({ fieldId: 'custbody_efx_fe_ce_destinatario_name' });
                        var subsidiaries_id = '';
                        if (SUBSIDIARIES) {
                            subsidiaries_id = record.getValue({ fieldId: 'subsidiary' });
                        }
                        var obj_direccion = {
                            emisor: {
                                Nombre: '',
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
                                RegimenFiscal: '',
                                Rfc: ''
                            },
                            receptor: {
                                Nombre: '',
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
                                Rfc: '',
                                UsoCFDI: ''
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
                            articulos: [],
                            cfdi: {
                                TipoCambio: '',
                                LugarExpedicion: '',

                            }
                        }

                        var json_direccion = buscarDirecciones(cliente_id, subsidiaries_id, obj_direccion, SUBSIDIARIES, destinatario_id, creadodeffReco, creadodeff, tipoTransaccionff);

                        var objRecIF = '';
                        var moneda_id = '';
                        if (recType == modRecord.Type.ITEM_FULFILLMENT) {

                            var idRelacionado = record.getValue('createdfrom');
                            moneda_id = record.getValue({ fieldId: 'custbody_efx_fe_ce_currency_des' });

                            objRecIF = modRecord.load({
                                type: tipoTransaccionff,
                                id: creadodeff
                            });
                        } else {
                            moneda_id = record.getValue({ fieldId: 'currency' });
                        }
                        //}else{

                        if (!moneda_id) {
                            var moneda = record.getValue('currencycode');
                        } else {
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
                        log.audit({ title: 'moneda', details: moneda });

                        var noDollar = moneda != 'USD';
                        log.audit({ title: 'noDollar', details: JSON.stringify(noDollar) });

                        if (noDollar) {

                            var configRecObj = config.load({
                                type: config.Type.COMPANY_INFORMATION
                            });

                            var config_currency = '';
                            var local_currency = '';
                            // MOD: en factura de venta no cambia tipo de cambio al seleccionar otro
                            if (recType == modRecord.Type.ITEM_FULFILLMENT || recType == modRecord.Type.INVOICE) {
                                var moneda_id_des = record.getValue({ fieldId: 'custbody_efx_fe_ce_currency' });
                                var moneda_record_des = modRecord.load({
                                    type: modRecord.Type.CURRENCY,
                                    id: moneda_id_des,
                                    isDynamic: true,
                                });
                                local_currency = moneda_record_des.getValue('symbol');
                            } else {
                                if (SUBSIDIARIES) {
                                    var subsidiaria_id = record.getValue({ fieldId: 'subsidiary' });
                                    var subsidiary_info = search.lookupFields({
                                        type: search.Type.SUBSIDIARY,
                                        id: subsidiaria_id,
                                        columns: ['currency']
                                    });

                                    log.audit({ title: 'subsidiary_info.currency: ', details: subsidiary_info.currency });
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

                            log.audit({ title: 'local_currency: ', details: local_currency });
                            if (moneda != 'USD' && moneda != 'MXN') {
                                exchange = modcurrency.exchangeRate({
                                    source: 'USD',
                                    target: 'MXN',
                                    // target: local_currency.symbol,
                                    date: record.getValue({ fieldId: 'trandate' })
                                }) || 0;
                                log.audit({ title: 'exchange: ', details: exchange });
                            } else {
                                exchange = modcurrency.exchangeRate({
                                    // MOD: local_currency.symbol no existe y el source y target estaban invertidos
                                    source: local_currency,
                                    target: moneda,
                                    //target: 'MXN',
                                    date: record.getValue({ fieldId: 'trandate' })
                                }) || 0;
                                log.audit({ title: 'exchange: ', details: exchange });
                            }

                            datae = exchange;

                        } else {
                            if (recType == modRecord.Type.ITEM_FULFILLMENT) {
                                var configRecObj = config.load({
                                    type: config.Type.COMPANY_INFORMATION
                                });
                                var config_currency = '';
                                var local_currency = '';
                                if (SUBSIDIARIES) {
                                    var subsidiaria_id = record.getValue({ fieldId: 'subsidiary' });
                                    var subsidiary_info = search.lookupFields({
                                        type: search.Type.SUBSIDIARY,
                                        id: subsidiaria_id,
                                        columns: ['currency']
                                    });
                                    log.audit({ title: 'subsidiary_info.currency: ', details: subsidiary_info.currency });
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

                                log.audit({ title: 'local_currency: ', details: local_currency });
                                exchange = modcurrency.exchangeRate({
                                    source: moneda,
                                    target: local_currency.symbol,
                                    //target: 'MXN',
                                    date: record.getValue({ fieldId: 'trandate' })
                                }) || 0;
                                log.audit({ title: 'exchange: ', details: exchange });
                                datae = 1;
                            } else {
                                //exchange = record.getValue({fieldId: 'exchangerate'});
                                var config_currency = '';
                                var local_currency = '';
                                if (SUBSIDIARIES) {
                                    var subsidiaria_id = record.getValue({ fieldId: 'subsidiary' });
                                    var subsidiary_info = search.lookupFields({
                                        type: search.Type.SUBSIDIARY,
                                        id: subsidiaria_id,
                                        columns: ['currency']
                                    });
                                    log.audit({ title: 'subsidiary_info.currency: ', details: subsidiary_info.currency });
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
                                log.audit({ title: 'local_currency: ', details: local_currency });
                                var querystr = "SELECT BaseCurrency.Symbol AS BaseSymbol, " +
                                    "TansactionCurrency.Symbol AS TransactionSymbol, " +
                                    "CurrencyRate.ExchangeRate, " +
                                    "CurrencyRate.EffectiveDate, " +
                                    "CurrencyRate.LastModifiedDate " +
                                    "FROM CurrencyRate, Currency AS BaseCurrency, Currency AS TansactionCurrency " +
                                    "WHERE ( BaseCurrency.ID = CurrencyRate.BaseCurrency ) " +
                                    "AND ( TansactionCurrency.ID = CurrencyRate.TransactionCurrency ) " +
                                    "AND ( CurrencyRate.EffectiveDate = ? ) " +
                                    "AND ( BaseCurrency.Symbol = ? ) " +
                                    "AND ( TansactionCurrency.Symbol = ? ) " +
                                    "ORDER BY CurrencyRate.id DESC";
                                var fecha_actual = record.getValue({ fieldId: 'custbody_efx_fe_actual_date' });
                                log.audit({ title: 'fecha_actual', details: fecha_actual });
                                var fecha_tran = record.getValue({ fieldId: 'trandate' });
                                log.audit({ title: 'fecha_tran', details: fecha_tran });
                                if (fecha_actual) {
                                    log.debug({ title: 'onRequest querystr si fecha actual es true', details: querystr });
                                    var hoy = new Date();
                                    log.audit({ title: 'hoy', details: hoy });
                                    var DIA_EN_MILISEGUNDOS = 24 * 60 * 60 * 1000;
                                    var ayer = new Date(hoy.getTime() - DIA_EN_MILISEGUNDOS);
                                    log.audit({ title: 'ayer', details: ayer });
                                    var configRecObj = config.load({
                                        type: config.Type.USER_PREFERENCES
                                    });
                                    var dateFormat = configRecObj.getValue({
                                        fieldId: 'DATEFORMAT'
                                    });
                                    var objDate = moment(ayer).format(dateFormat);
                                    log.audit({ title: 'objDate', details: objDate });
                                } else {
                                    log.debug({ title: 'onRequest querystr si fecha actual es false', details: querystr });
                                    var hoy = fecha_tran;
                                    log.audit({ title: 'hoy', details: hoy });
                                    var DIA_EN_MILISEGUNDOS = 24 * 60 * 60 * 1000;
                                    var ayer = new Date(hoy.getTime() - DIA_EN_MILISEGUNDOS);
                                    log.audit({ title: 'ayer', details: ayer });
                                    var configRecObj = config.load({
                                        type: config.Type.USER_PREFERENCES
                                    });
                                    var dateFormat = configRecObj.getValue({
                                        fieldId: 'DATEFORMAT'
                                    });
                                    var objDate = moment(ayer).format(dateFormat);
                                    log.audit({ title: 'objDate', details: objDate });
                                }
                                var results = query.runSuiteQL({
                                    query: querystr,
                                    params: [objDate, "MXN", "USD"],
                                    customScriptId: 'customscript_fb_query_sl'
                                }).asMappedResults();
                                log.debug({ title: 'onRequest columns', details: results.columns });
                                log.debug({ title: 'onRequest types', details: results.types });
                                log.audit({ title: 'results: ', details: results });
                                if (results[0]) {
                                    exchange = results[0].exchangerate;
                                }
                                /* var fechahoy = record.getValue({ fieldId: 'trandate' });
                                var parsedDateHoy = format.parse({
                                    value: fechahoy,
                                    type: format.Type.DATE
                                });
                                var fechaahora = new Date();
                                if (fechaahora.getDate() == parsedDateHoy.getDate() && fechaahora.getMonth() == parsedDateHoy.getMonth() && fechaahora.getFullYear() == parsedDateHoy.getFullYear()) {
                                    exchange = results[0].exchangerate;
                                } else {
                                    exchange = results[1].exchangerate;
                                } */
                            }
                        }
                        log.audit({ title: 'exchange: ', details: exchange });
                        var check_tc_manual = record.getValue({
                            fieldId: "custbody_mx_plus_tc_manual"
                        });
                        // MOD: 22/01/2024 Si usuario quiso poner el tipo de cambio manual, entonces exchange hay que igualarlo con el valor que tenga en CE tipo de cambio
                        if (check_tc_manual == 'T' || check_tc_manual == true) {
                            log.debug({ title: 'Usa tipo de cambio 💡', details: 'manual' });
                            exchange = record.getValue({
                                fieldId: "custbody_efx_fe_ce_exchage"
                            });
                        }
                        else {
                            var mexicoCityTimeZone = 'America/Mexico_City';
                            var hoy2 = new Date();
                            var hoy3 = hoy2.toLocaleString('en-US', {
                                timeZone: mexicoCityTimeZone,
                            }).split(' ');
                            // hoy3[1]
                            var dia_sinComa = hoy3[1].split(',')[0];
                            var formattedDate = hoy2.toISOString().split('T')[0];
                            var partes = formattedDate.split('-');
                            var n_fecha = partes[0] + '-' + partes[1] + '-' + dia_sinComa;
                            log.audit({
                                title: 'hoy3', details: hoy3
                            });
                            log.audit({
                                title: 'formattedDate', details: formattedDate
                            });
                            log.audit({
                                title: 'n_fecha', details: n_fecha
                            });
                            var headerObj = {
                                "Bmx-Token": '719812e675973d9981caa204d30fff65feaddc8d7bd95dac465edcb53a1fd984',
                                'Accept': 'application/json'
                            };
                            var response = https.get({
                                url: 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF60653/datos/' + formattedDate + '/' + formattedDate,
                                headers: headerObj
                            });
                            log.audit({ title: 'response-code', details: response.code });
                            log.audit({ title: 'response-body', details: response.body });
                            if (response.code == 200) {
                                var response_body = JSON.parse(response.body)
                                log.audit({ title: 'response_body', details: response_body.bmx.series[0].datos[0].dato });
                                exchange = response_body.bmx.series[0].datos[0].dato;
                                datae = exchange;
                            }
                        }
                        if (exchange) {
                            record.setValue({ fieldId: 'custbody_efx_fe_ce_exchage', value: exchange });
                            // MOD 26/02/2024
                            datae = exchange;
                        }
                        var numLines = record.getLineCount({ sublistId: 'item' });
                        log.audit({ title: 'Item numLines: ', details: numLines });
                        var totalValorDolares = 0;
                        for (var l = 0; l < numLines; l++) {
                            try {
                                var item = record.getSublistValue({ sublistId: 'item', fieldId: 'item', line: l }) || '';
                                var itemtype = record.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemtype',
                                    line: l
                                }) || '';
                                log.audit({ title: 'item', details: item });
                                log.audit({ title: 'itemtype', details: itemtype });
                                //Comercio Exterior
                                if (custbody_efx_fe_comercio_exterior && (itemtype != 'Group' && itemtype != 'EndGroup')) {
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
                                    if (itemtype === 'Assembly') {
                                        var dataArticle = getDataArticle(item);
                                        log.audit({ title: 'dataArticle 👻👻👻', details: dataArticle });
                                        record.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_efx_fe_ce_frac_arancelaria',
                                            // fieldId: 'custcol_efx_fe_ce_farancel_code',
                                            value: dataArticle.fraccionArancelariaCE,
                                            line: l
                                        });
                                        record.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_efx_fe_ce_uni_aduana',
                                            value: dataArticle.unidadAduanaCE,
                                            line: l
                                        });
                                    }
                                    if (objRecIF) {
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
                                    } else {
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

                                    log.audit({ title: 'quantity', details: quantity });
                                    log.audit({ title: 'formula', details: formula });
                                    log.audit({ title: 'unit_price', details: unit_price });
                                    log.audit({ title: 'total_item_price', details: total_item_price });
                                    log.audit({ title: 'result', details: result });
                                    if (recType == modRecord.Type.ITEM_FULFILLMENT) {
                                        if (quantity && formula) {
                                            var formula_t = formula.replace('*', '')
                                            formula = quantity + formula;
                                            log.audit({
                                                title: 'Item formula: ' + l,
                                                details: formula
                                            });
                                            result = eval(formula);
                                            result = quantity / formula_t;

                                            log.audit({
                                                title: 'Item result: ' + l,
                                                details: result
                                            });
                                            var resultup = unit_price * formula_t;
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
                                    } else {
                                        if (quantity && formula) {
                                            var formula_t = formula.replace('*', '')
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
                                    if (recType == modRecord.Type.ITEM_FULFILLMENT) {
                                        var t_cambio = exchange;
                                    } else {
                                        var t_cambio = record.getValue({ fieldId: 'exchangerate' });
                                    }
                                    //

                                    log.audit({ title: 'unit_price', details: unit_price });
                                    log.audit({ title: 't_cambio', details: t_cambio });
                                    log.audit({ title: 'datae', details: datae });
                                    if (moneda != 'USD' && moneda != 'MXN') {

                                        var diftipcamb = t_cambio / datae;
                                        var unitAduana = (unit_price * diftipcamb) / formula_t;
                                    } else {
                                        // MOD
                                        // if(moneda=='MXN'){

                                        //     var unitAduana = unit_price * (t_cambio * datae);
                                        // }else{

                                        var unitAduana = unit_price * (t_cambio / datae);
                                        // }
                                    }

                                    var valordedolares = 0;
                                    log.audit({ title: 'moneda-valordolares', details: moneda });
                                    if (moneda != 'USD' && moneda != 'MXN') {
                                        valordedolares = (total_item_price * t_cambio) / datae;

                                        log.audit({ title: 'valordedolares-eur', details: valordedolares });
                                    } else {
                                        // MOD: moneda nacional debería de multiplicar por el tipo de cambio
                                        // lineas 563,567 y 570 (solo se agregó condición)
                                        // if(moneda=='MXN'){

                                        // valordedolares = total_item_price * datae;
                                        // }else{

                                        if(moneda == 'MXN') {
                                          valordedolares = total_item_price / datae;
                                        }
                                      else{
                                        valordedolares=total_item_price;
                                      }
                                        // }
                                        log.audit({ title: 'valordedolares-noeur', details: valordedolares });
                                    }

                                    valordedolares = valordedolares.toFixed(2);
                                    valordedolares = parseFloat(valordedolares);

                                    if (!noDollar) {

                                        log.audit({ title: 'formula_t', details: formula_t });
                                        if (recType == modRecord.Type.ITEM_FULFILLMENT) {
                                            var unitAduana = unit_price / datae;
                                        } else {
                                            log.audit({ title: 'valordedolares', details: valordedolares });
                                            log.audit({ title: 'result🐛🐛', details: result });
                                            var unitAduana = valordedolares / result;
                                            // var unitAduana = unit_price / formula_t;
                                        }

                                    }
                                    log.audit({ title: 'unitAduana 🦋', details: unitAduana });
                                    if (recType == modRecord.Type.ITEM_FULFILLMENT) {
                                        var unitAduana = resultup;
                                    }

                                    var valAduana = runtime.getCurrentScript().getParameter({ name: 'custscript_tko_calc_val_aduana' });
                                    log.audit({ title: 'valAduana', details: valAduana });

                                    if (valAduana || valAduana == true || valAduana == 'true' || valAduana == 'T') {
                                        if (unitAduana) {
                                            // unitAduana = unitAduana.toFixed(2);
                                            record.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'custcol_efx_fe_ce_val_uni_aduana',
                                                value: unitAduana,
                                                line: l
                                            });
                                        }
                                    } else {
                                        log.audit({ title: 'valAduana (ELSE)', details: valAduana });
                                    }


                                    // MOD: CHEK
                                    // if (noDollar) {
                                    totalValorDolares = totalValorDolares + parseFloat(valordedolares.toFixed(2));
                                    // } else {
                                    //     totalValorDolares = totalValorDolares + total_item_price;
                                    // }
                                    record.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_efx_fe_ce_val_dolares',
                                        value: valordedolares,
                                        line: l
                                    });


                                }

                                //rec.commitLine({ sublistId: 'item' });

                            } catch (error) {
                                log.audit({ title: 'error', detail: JSON.stringify(error) });
                            }
                        }
                        log.audit({ title: 'totalValorDolares ****', details: totalValorDolares });
                        log.audit({ title: 'noDollar ****', details: noDollar });

                        totalValorDolares = totalValorDolares.toFixed(2);
                        record.setValue({ fieldId: 'custbody_efx_fe_ce_totalusd', value: totalValorDolares });
                        record.setValue({
                            fieldId: 'custbody_efx_fe_dirjson_emisor',
                            value: JSON.stringify(json_direccion)
                        });
                        record.commitLine({
                            sublistId: 'item'
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
        function getDataArticle(itemId) {
            /*onst assemblyItemSearchFilters = [
                ['type', 'anyof', 'Assembly'],
                'AND',
                ['internalid', 'anyof', itemId],
            ];
            
            const fraccionArancelaria = search.createColumn({ name: 'custitem_efx_fe_ce_fracc_arancelaria'});
            const unidadAduana = search.createColumn({ name: 'custitem_efx_fe_ce_uni_aduana' });
            // const assemblyItemSearchColTipo = search.createColumn({ name: 'type' });
            // const assemblyItemSearchColSalesDescription = search.createColumn({ name: 'salesdescription' });
            const assemblyItemSearch = search.create({
                type: 'assemblyitem',
                filters: assemblyItemSearchFilters,
                columns: [
                    fraccionArancelaria,
                    unidadAduana,
                    // assemblyItemSearchColTipo,
                    // assemblyItemSearchColSalesDescription,
                ],
            });
            const assemblyItemSearchPagedData = assemblyItemSearch.runPaged({ pageSize: 1000 });
            for (var i = 0; i < assemblyItemSearchPagedData.pageRanges.length; i++) { 
                const assemblyItemSearchPage = assemblyItemSearchPagedData.fetch({ index: i });
                log.audit({title:'assemblyItemSearchPage 👻👻👻👻',details:assemblyItemSearchPage});
                assemblyItemSearchPage.data.forEach((result) => {
                })
            }*/
            let objGetData = {
                fraccionArancelariaCE: '',
                unidadAduanaCE: ''
            };
            try {
                log.audit({title:'itemId',details:itemId});
                let dataEssamblyItem = modRecord.load({
                    type: 'lotnumberedassemblyitem',
                    id: itemId
                });
                objGetData['fraccionArancelariaCE'] = dataEssamblyItem.getValue({ fieldId: 'custitem_efx_fe_ce_fracc_arancelaria' }) || '';
                objGetData['unidadAduanaCE'] = dataEssamblyItem.getValue({ fieldId: 'custitem_efx_fe_ce_uni_aduana' }) || '';
                return objGetData
            }catch(err){
            log.error({title:'Error occurred in getDataArticle',details:err});
            }
        }
        function buscarDirecciones(id_cliente, id_subsidiaria, obj_direccion, SUBSIDIARIES, destinatario_id, creadodeff, creadodeffid, tipoTransaccionff) {

            if (tipoTransaccionff == 'transferorder') {

                var rfiscal = '';
                var usocfdi = '';
                var usocfdiid = creadodeff.getValue({ fieldId: 'custbody_mx_cfdi_usage' });
                var motivotraslado = creadodeff.getValue({ fieldId: 'custbody_efx_fe_ce_motivo_traslado' });
                var tipocambiocab = creadodeff.getValue({ fieldId: 'exchangerate' });
                obj_direccion.cfdi.TipoCambio = tipocambiocab;

                if (usocfdiid) {
                    var usocfdiobj = modRecord.load({
                        type: 'customrecord_mx_sat_cfdi_usage',
                        id: usocfdiid
                    });
                    usocfdi = usocfdiobj.getValue({ fieldId: 'custrecord_mx_sat_cfdi_code' });
                    obj_direccion.receptor.UsoCFDI = usocfdi;
                }

                log.audit({ title: 'id_subsidiaria', details: id_subsidiaria });
                if (SUBSIDIARIES) {
                    var obj_subsidiaria = modRecord.load({
                        type: modRecord.Type.SUBSIDIARY,
                        id: id_subsidiaria,
                    });
                    var rfiscalid = obj_subsidiaria.getValue({ fieldId: 'custrecord_mx_sat_industry_type' });
                    log.audit({ title: 'rfiscalid', details: rfiscalid });
                    if (rfiscalid) {
                        var regfiscalObj = modRecord.load({
                            type: 'customrecord_mx_sat_industry_type',
                            id: rfiscalid
                        });

                        rfiscal = regfiscalObj.getValue({ fieldId: 'custrecord_mx_sat_it_code' });
                        log.audit({ title: 'rfiscal', details: rfiscal });
                    }
                } else {
                    var obj_subsidiaria = config.load({
                        type: config.Type.COMPANY_INFORMATION
                    });

                    var rfiscalid = obj_subsidiaria.getValue({ fieldId: 'custrecord_mx_sat_industry_type' });
                    if (rfiscalid) {
                        var regfiscalObj = modRecord.load({
                            type: 'customrecord_mx_sat_industry_type',
                            id: rfiscalid
                        });

                        rfiscal = regfiscalObj.getValue({ fieldId: 'custrecord_mx_sat_it_code' });
                    }
                }
                obj_direccion.emisor.RegimenFiscal = rfiscal;

                var ubicacionOrigen = creadodeff.getValue({ fieldId: 'location' });
                var ubicacionDestino = creadodeff.getValue({ fieldId: 'transferlocation' });

                try {

                    var ubicacionOrigenRec = modRecord.load({
                        type: modRecord.Type.LOCATION,
                        id: ubicacionOrigen
                    });

                    obj_direccion.emisor.Rfc = ubicacionOrigenRec.getValue({ fieldId: 'custrecord_efx_fe_ce_rfc' });
                    obj_direccion.emisor.Nombre = ubicacionOrigenRec.getValue({ fieldId: 'name' });

                    var subrec_dir_sub = ubicacionOrigenRec.getSubrecord({
                        fieldId: 'mainaddress'
                    });

                    obj_direccion.emisor.Calle = subrec_dir_sub.getValue({ fieldId: 'custrecord_streetname' });
                    obj_direccion.emisor.NumeroExterior = subrec_dir_sub.getValue({ fieldId: 'custrecord_streetnum' });
                    obj_direccion.emisor.NumeroInterior = subrec_dir_sub.getValue({ fieldId: 'custrecord_unit' });

                    //cargar colonia
                    var emisor_colonia_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_colonia' });
                    if (emisor_colonia_id) {
                        var obj_colonia = modRecord.load({
                            type: 'customrecord_efx_fe_sat_colonia',
                            id: emisor_colonia_id,
                        });
                        obj_direccion.emisor.Colonia = obj_colonia.getValue({ fieldId: 'custrecord_efx_fe_sc_cod_sat' });
                    }

                    //cargar localidad
                    var emisor_localidad_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_localidad' });
                    if (emisor_localidad_id) {
                        var obj_localidad = modRecord.load({
                            type: 'customrecord_efx_fe_sat_localidad',
                            id: emisor_localidad_id,
                        });
                        obj_direccion.emisor.Localidad = obj_localidad.getValue({ fieldId: 'custrecord_efx_fe_sl_cod_sat' });
                    }
                    obj_direccion.emisor.Referencia = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_ref_dir' });
                    //cargar municipio
                    var emisor_municipio_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_municipio' });
                    if (emisor_municipio_id) {
                        var obj_municipio = modRecord.load({
                            type: 'customrecord_efx_fe_sat_municipio',
                            id: emisor_municipio_id,
                        });
                        obj_direccion.emisor.Municipio = obj_municipio.getValue({ fieldId: 'custrecord_efx_fe_csm_cod_sat' });
                    }
                    //cargar estado
                    var emisor_estado_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_estado' });
                    if (emisor_estado_id) {
                        var obj_estado = modRecord.load({
                            type: 'customrecord_efx_fe_sat_estado',
                            id: emisor_estado_id,
                        });
                        obj_direccion.emisor.Estado = obj_estado.getValue({ fieldId: 'custrecord_efx_fe_se_cod_sat' });
                    }

                    //cargar pais
                    var emisor_pais_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_pais' });
                    if (emisor_pais_id) {
                        var obj_pais = modRecord.load({
                            type: 'customrecord_efx_fe_sat_pais',
                            id: emisor_pais_id,
                        });
                        obj_direccion.emisor.Pais = obj_pais.getValue({ fieldId: 'custrecord_efx_fe_sp_cod_sat' });
                    }
                    obj_direccion.emisor.CodigoPostal = subrec_dir_sub.getValue({ fieldId: 'zip' });
                    obj_direccion.cfdi.LugarExpedicion = subrec_dir_sub.getValue({ fieldId: 'zip' });

                } catch (ubicacionOrigenLog) {
                    log.audit({ title: 'ubicacionOrigenLog', details: JSON.stringify(ubicacionOrigenLog) });
                }

                try {
                    var obj_cliente = modRecord.load({
                        type: modRecord.Type.LOCATION,
                        id: ubicacionDestino,

                    });

                    if (motivotraslado == '02') {
                        obj_direccion.receptor.Rfc = obj_cliente.getValue({ fieldId: 'custrecord_efx_fe_ce_rfc' });
                    } else {
                        obj_direccion.receptor.Rfc = 'XEXX010101000';
                    }
                    obj_direccion.receptor.Nombre = obj_cliente.getValue({ fieldId: 'name' });

                    var subrec = obj_cliente.getSubrecord({
                        fieldId: 'mainaddress'
                    });

                    obj_direccion.receptor.Calle = subrec.getValue({ fieldId: 'custrecord_streetname' });
                    obj_direccion.receptor.NumeroExterior = subrec.getValue({ fieldId: 'custrecord_streetnum' });
                    obj_direccion.receptor.NumeroInterior = subrec.getValue({ fieldId: 'custrecord_unit' });
                    //cargar colonia
                    var receptor_colonia_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_colonia' });
                    if (receptor_colonia_id) {
                        var obj_colonia = modRecord.load({
                            type: 'customrecord_efx_fe_sat_colonia',
                            id: receptor_colonia_id,
                        });
                        var col_receptor = obj_colonia.getValue({ fieldId: 'custrecord_efx_fe_sc_cod_sat' });
                        if (col_receptor) {
                            obj_direccion.receptor.Colonia = obj_colonia.getValue({ fieldId: 'custrecord_efx_fe_sc_cod_sat' });
                        } else {
                            obj_direccion.receptor.Colonia = obj_colonia.getValue({ fieldId: 'name' });
                        }
                    }

                    //cargar localidad
                    var receptor_localidad_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_localidad' });
                    if (receptor_localidad_id) {
                        var obj_localidad = modRecord.load({
                            type: 'customrecord_efx_fe_sat_localidad',
                            id: receptor_localidad_id,
                        });
                        var lc_receptor = obj_localidad.getValue({ fieldId: 'custrecord_efx_fe_sl_cod_sat' });
                        if (lc_receptor) {
                            obj_direccion.receptor.Localidad = lc_receptor;
                        } else {
                            obj_direccion.receptor.Localidad = obj_localidad.getValue({ fieldId: 'name' });
                        }
                    }

                    obj_direccion.receptor.Referencia = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_ref_dir' });

                    //cargar municipío
                    var receptor_municipio_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_municipio' });
                    if (receptor_municipio_id) {
                        var obj_municipio = modRecord.load({
                            type: 'customrecord_efx_fe_sat_municipio',
                            id: receptor_municipio_id,
                        });
                        var mpio_receptor = obj_municipio.getValue({ fieldId: 'custrecord_efx_fe_csm_cod_sat' });
                        if (mpio_receptor) {
                            obj_direccion.receptor.Municipio = mpio_receptor;
                        } else {
                            obj_direccion.receptor.Municipio = obj_municipio.getValue({ fieldId: 'name' });
                        }
                    }
                    //cargar estado
                    var receptor_estado_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_estado' });
                    if (receptor_estado_id) {
                        var obj_estado = modRecord.load({
                            type: 'customrecord_efx_fe_sat_estado',
                            id: receptor_estado_id,
                        });
                        var edo_receptor = obj_estado.getValue({ fieldId: 'custrecord_efx_fe_se_cod_sat' });
                        if (edo_receptor) {
                            obj_direccion.receptor.Estado = edo_receptor;
                        } else {
                            obj_direccion.receptor.Estado = obj_estado.getValue({ fieldId: 'name' });
                        }
                    }

                    //cargar pais
                    var receptor_pais_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_pais' });
                    if (receptor_pais_id) {
                        var obj_pais = modRecord.load({
                            type: 'customrecord_efx_fe_sat_pais',
                            id: receptor_pais_id,
                        });
                        obj_direccion.receptor.Pais = obj_pais.getValue({ fieldId: 'custrecord_efx_fe_sp_cod_sat' });
                    }
                    obj_direccion.receptor.CodigoPostal = subrec.getValue({ fieldId: 'zip' });
                    obj_direccion.receptor.Destinatario = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_destinatario' });

                } catch (error_buscadireccion_receptor) {
                    log.audit({ title: 'error_buscadireccion_receptor', details: JSON.stringify(error_buscadireccion_receptor) });
                }

                if (destinatario_id) {
                    try {
                        var obj_destinatario = modRecord.load({
                            type: 'customrecord_efx_fe_ce_addres_destinatar',
                            id: destinatario_id,

                        });

                        obj_direccion.destinatario.Calle = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_calle' });
                        obj_direccion.destinatario.NumeroExterior = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_numero_exterior' });
                        obj_direccion.destinatario.NumeroInterior = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_numero_interior' });

                        //caragar colonia
                        var destinatario_colonia_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_colonia' });
                        if (destinatario_colonia_id) {
                            var obj_colonia = modRecord.load({
                                type: 'customrecord_efx_fe_sat_colonia',
                                id: destinatario_colonia_id,
                            });
                            var col_receptor = obj_colonia.getValue({ fieldId: 'custrecord_efx_fe_sc_cod_sat' });
                            if (col_receptor) {
                                obj_direccion.destinatario.Colonia = col_receptor;
                            } else {
                                obj_direccion.destinatario.Colonia = obj_colonia.getValue({ fieldId: 'name' });
                            }
                        }

                        //cargar localidad
                        var destinatario_localidad_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_localidad' });
                        if (destinatario_localidad_id) {
                            var obj_localidad = modRecord.load({
                                type: 'customrecord_efx_fe_sat_localidad',
                                id: destinatario_localidad_id,
                            });
                            var lc_receptor = obj_localidad.getValue({ fieldId: 'custrecord_efx_fe_sl_cod_sat' });
                            if (lc_receptor) {
                                obj_direccion.destinatario.Localidad = lc_receptor;
                            } else {
                                obj_direccion.destinatario.Localidad = obj_localidad.getValue({ fieldId: 'name' });
                            }
                        }

                        //cargar municipio
                        var destinatario_municipio_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_municipio' });
                        if (destinatario_municipio_id) {
                            var obj_municipio = modRecord.load({
                                type: 'customrecord_efx_fe_sat_municipio',
                                id: destinatario_municipio_id,
                            });
                            var mpio_receptor = obj_municipio.getValue({ fieldId: 'custrecord_efx_fe_csm_cod_sat' });
                            if (mpio_receptor) {
                                obj_direccion.destinatario.Municipio = mpio_receptor;
                            } else {
                                obj_direccion.destinatario.Municipio = obj_municipio.getValue({ fieldId: 'name' });
                            }
                        }

                        //cargar estado
                        var destinatario_estado_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_estado' });
                        if (destinatario_estado_id) {
                            var obj_estado = modRecord.load({
                                type: 'customrecord_efx_fe_sat_estado',
                                id: destinatario_estado_id,
                            });
                            var edo_receptor = obj_estado.getValue({ fieldId: 'custrecord_efx_fe_se_cod_sat' });
                            if (edo_receptor) {
                                obj_direccion.destinatario.Estado = edo_receptor;
                            } else {
                                obj_direccion.destinatario.Estado = obj_estado.getValue({ fieldId: 'name' });
                            }
                        }
                        //cargar pais

                        var destinatario_pais_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_pais' });
                        if (destinatario_pais_id) {
                            var obj_pais = modRecord.load({
                                type: 'customrecord_efx_fe_sat_pais',
                                id: destinatario_pais_id,
                            });
                            obj_direccion.destinatario.Pais = obj_pais.getValue({ fieldId: 'custrecord_efx_fe_sp_cod_sat' });
                        }
                        obj_direccion.destinatario.CodigoPostal = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_codigo_postal' });


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


            } else {
                if (SUBSIDIARIES) {
                    try {

                        var obj_subsidiaria = modRecord.load({
                            type: modRecord.Type.SUBSIDIARY,
                            id: id_subsidiaria,
                        });

                        var direccion_sub = obj_subsidiaria.getValue({ fieldId: 'mainaddress_text' })

                        var subrec_dir_sub = obj_subsidiaria.getSubrecord({
                            fieldId: 'mainaddress'
                        });

                        obj_direccion.emisor.Calle = subrec_dir_sub.getValue({ fieldId: 'custrecord_streetname' });
                        obj_direccion.emisor.NumeroExterior = subrec_dir_sub.getValue({ fieldId: 'custrecord_streetnum' });
                        obj_direccion.emisor.NumeroInterior = subrec_dir_sub.getValue({ fieldId: 'custrecord_unit' });
                        //cargar colonia
                        var emisor_colonia_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_colonia' });
                        if (emisor_colonia_id) {
                            var obj_colonia = modRecord.load({
                                type: 'customrecord_efx_fe_sat_colonia',
                                id: emisor_colonia_id,
                            });
                            obj_direccion.emisor.Colonia = obj_colonia.getValue({ fieldId: 'custrecord_efx_fe_sc_cod_sat' });
                        }

                        //cargar localidad
                        var emisor_localidad_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_localidad' });
                        if (emisor_localidad_id) {
                            var obj_localidad = modRecord.load({
                                type: 'customrecord_efx_fe_sat_localidad',
                                id: emisor_localidad_id,
                            });
                            obj_direccion.emisor.Localidad = obj_localidad.getValue({ fieldId: 'custrecord_efx_fe_sl_cod_sat' });
                        }
                        obj_direccion.emisor.Referencia = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_ref_dir' });
                        //cargar municipio
                        var emisor_municipio_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_municipio' });
                        if (emisor_municipio_id) {
                            var obj_municipio = modRecord.load({
                                type: 'customrecord_efx_fe_sat_municipio',
                                id: emisor_municipio_id,
                            });
                            obj_direccion.emisor.Municipio = obj_municipio.getValue({ fieldId: 'custrecord_efx_fe_csm_cod_sat' });
                        }
                        //cargar estado
                        var emisor_estado_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_estado' });
                        if (emisor_estado_id) {
                            var obj_estado = modRecord.load({
                                type: 'customrecord_efx_fe_sat_estado',
                                id: emisor_estado_id,
                            });
                            obj_direccion.emisor.Estado = obj_estado.getValue({ fieldId: 'custrecord_efx_fe_se_cod_sat' });
                        }
                        //cargar pais
                        var emisor_pais_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_pais' });
                        if (emisor_pais_id) {
                            var obj_pais = modRecord.load({
                                type: 'customrecord_efx_fe_sat_pais',
                                id: emisor_pais_id,
                            });
                            obj_direccion.emisor.Pais = obj_pais.getValue({ fieldId: 'custrecord_efx_fe_sp_cod_sat' });
                        }
                        obj_direccion.emisor.CodigoPostal = subrec_dir_sub.getValue({ fieldId: 'zip' });


                    } catch (error_subsidirias) {
                        log.audit({ title: 'error_subsidirias', details: JSON.stringify(error_subsidirias) });
                    }
                } else {
                    try {
                        var obj_subsidiaria = config.load({
                            type: config.Type.COMPANY_INFORMATION
                        });

                        var direccion_sub = obj_subsidiaria.getValue({ fieldId: 'mainaddress_text' })

                        var subrec_dir_sub = obj_subsidiaria.getSubrecord({
                            fieldId: 'mainaddress'
                        });

                        obj_direccion.emisor.Calle = subrec_dir_sub.getValue({ fieldId: 'custrecord_streetname' });
                        obj_direccion.emisor.NumeroExterior = subrec_dir_sub.getValue({ fieldId: 'custrecord_streetnum' });
                        obj_direccion.emisor.NumeroInterior = subrec_dir_sub.getValue({ fieldId: 'custrecord_unit' });
                        //cargar colonia
                        var emisor_colonia_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_colonia' });
                        if (emisor_colonia_id) {
                            var obj_colonia = modRecord.load({
                                type: 'customrecord_efx_fe_sat_colonia',
                                id: emisor_colonia_id,
                            });
                            obj_direccion.emisor.Colonia = obj_colonia.getValue({ fieldId: 'custrecord_efx_fe_sc_cod_sat' });
                        }

                        //cargar localidad
                        var emisor_localidad_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_localidad' });
                        if (emisor_localidad_id) {
                            var obj_localidad = modRecord.load({
                                type: 'customrecord_efx_fe_sat_localidad',
                                id: emisor_localidad_id,
                            });
                            obj_direccion.emisor.Localidad = obj_localidad.getValue({ fieldId: 'custrecord_efx_fe_sl_cod_sat' });
                        }
                        obj_direccion.emisor.Referencia = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_ref_dir' });
                        //cargar municipio
                        var emisor_municipio_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_municipio' });
                        if (emisor_municipio_id) {
                            var obj_municipio = modRecord.load({
                                type: 'customrecord_efx_fe_sat_municipio',
                                id: emisor_municipio_id,
                            });
                            obj_direccion.emisor.Municipio = obj_municipio.getValue({ fieldId: 'custrecord_efx_fe_csm_cod_sat' });
                        }
                        //cargar estado
                        var emisor_estado_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_estado' });
                        if (emisor_estado_id) {
                            var obj_estado = modRecord.load({
                                type: 'customrecord_efx_fe_sat_estado',
                                id: emisor_estado_id,
                            });
                            obj_direccion.emisor.Estado = obj_estado.getValue({ fieldId: 'custrecord_efx_fe_se_cod_sat' });
                        }
                        //cargar pais
                        var emisor_pais_id = subrec_dir_sub.getValue({ fieldId: 'custrecord_efx_fe_ce_pais' });
                        if (emisor_pais_id) {
                            var obj_pais = modRecord.load({
                                type: 'customrecord_efx_fe_sat_pais',
                                id: emisor_pais_id,
                            });
                            obj_direccion.emisor.Pais = obj_pais.getValue({ fieldId: 'custrecord_efx_fe_sp_cod_sat' });
                        }
                        obj_direccion.emisor.CodigoPostal = subrec_dir_sub.getValue({ fieldId: 'zip' });


                    } catch (error_subsidirias) {
                        log.audit({ title: 'error_subsidirias', details: JSON.stringify(error_subsidirias) });
                    }
                }

                try {
                    var obj_cliente = modRecord.load({
                        type: modRecord.Type.CUSTOMER,
                        id: id_cliente,

                    });

                    var count = obj_cliente.getLineCount({ sublistId: 'addressbook' });
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


                            obj_direccion.receptor.Calle = subrec.getValue({ fieldId: 'custrecord_streetname' });
                            obj_direccion.receptor.NumeroExterior = subrec.getValue({ fieldId: 'custrecord_streetnum' });
                            obj_direccion.receptor.NumeroInterior = subrec.getValue({ fieldId: 'custrecord_unit' });
                            //cargar colonia
                            var receptor_colonia_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_colonia' });
                            if (receptor_colonia_id) {
                                var obj_colonia = modRecord.load({
                                    type: 'customrecord_efx_fe_sat_colonia',
                                    id: receptor_colonia_id,
                                });
                                var col_receptor = obj_colonia.getValue({ fieldId: 'custrecord_efx_fe_sc_cod_sat' });
                                if (col_receptor) {
                                    obj_direccion.receptor.Colonia = obj_colonia.getValue({ fieldId: 'custrecord_efx_fe_sc_cod_sat' });
                                } else {
                                    obj_direccion.receptor.Colonia = obj_colonia.getValue({ fieldId: 'name' });
                                }
                            }

                            //cargar localidad
                            var receptor_localidad_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_localidad' });
                            if (receptor_localidad_id) {
                                var obj_localidad = modRecord.load({
                                    type: 'customrecord_efx_fe_sat_localidad',
                                    id: receptor_localidad_id,
                                });
                                var lc_receptor = obj_localidad.getValue({ fieldId: 'custrecord_efx_fe_sl_cod_sat' });
                                if (lc_receptor) {
                                    obj_direccion.receptor.Localidad = lc_receptor;
                                } else {
                                    obj_direccion.receptor.Localidad = obj_localidad.getValue({ fieldId: 'name' });
                                }
                            }

                            obj_direccion.receptor.Referencia = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_ref_dir' });

                            //cargar municipío
                            var receptor_municipio_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_municipio' });
                            if (receptor_municipio_id) {
                                var obj_municipio = modRecord.load({
                                    type: 'customrecord_efx_fe_sat_municipio',
                                    id: receptor_municipio_id,
                                });
                                var mpio_receptor = obj_municipio.getValue({ fieldId: 'custrecord_efx_fe_csm_cod_sat' });
                                if (mpio_receptor) {
                                    obj_direccion.receptor.Municipio = mpio_receptor;
                                } else {
                                    obj_direccion.receptor.Municipio = obj_municipio.getValue({ fieldId: 'name' });
                                }
                            }
                            //cargar estado
                            var receptor_estado_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_estado' });
                            if (receptor_estado_id) {
                                var obj_estado = modRecord.load({
                                    type: 'customrecord_efx_fe_sat_estado',
                                    id: receptor_estado_id,
                                });
                                var edo_receptor = obj_estado.getValue({ fieldId: 'custrecord_efx_fe_se_cod_sat' });
                                if (edo_receptor) {
                                    obj_direccion.receptor.Estado = edo_receptor;
                                } else {
                                    obj_direccion.receptor.Estado = obj_estado.getValue({ fieldId: 'name' });
                                }
                            }

                            //cargar pais
                            var receptor_pais_id = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_pais' });
                            if (receptor_pais_id) {
                                var obj_pais = modRecord.load({
                                    type: 'customrecord_efx_fe_sat_pais',
                                    id: receptor_pais_id,
                                });
                                obj_direccion.receptor.Pais = obj_pais.getValue({ fieldId: 'custrecord_efx_fe_sp_cod_sat' });
                            }
                            obj_direccion.receptor.CodigoPostal = subrec.getValue({ fieldId: 'zip' });
                            obj_direccion.receptor.Destinatario = subrec.getValue({ fieldId: 'custrecord_efx_fe_ce_destinatario' });

                        }
                    }
                } catch (error_buscadireccion_receptor) {
                    log.audit({ title: 'error_buscadireccion_receptor', details: JSON.stringify(error_buscadireccion_receptor) });
                }

                if (destinatario_id) {
                    try {
                        var obj_destinatario = modRecord.load({
                            type: 'customrecord_efx_fe_ce_addres_destinatar',
                            id: destinatario_id,

                        });

                        obj_direccion.destinatario.Calle = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_calle' });
                        obj_direccion.destinatario.NumeroExterior = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_numero_exterior' });
                        obj_direccion.destinatario.NumeroInterior = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_numero_interior' });

                        //caragar colonia
                        var destinatario_colonia_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_colonia' });
                        if (destinatario_colonia_id) {
                            var obj_colonia = modRecord.load({
                                type: 'customrecord_efx_fe_sat_colonia',
                                id: destinatario_colonia_id,
                            });
                            var col_receptor = obj_colonia.getValue({ fieldId: 'custrecord_efx_fe_sc_cod_sat' });
                            if (col_receptor) {
                                obj_direccion.destinatario.Colonia = col_receptor;
                            } else {
                                obj_direccion.destinatario.Colonia = obj_colonia.getValue({ fieldId: 'name' });
                            }
                        }

                        //cargar localidad
                        var destinatario_localidad_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_localidad' });
                        if (destinatario_localidad_id) {
                            var obj_localidad = modRecord.load({
                                type: 'customrecord_efx_fe_sat_localidad',
                                id: destinatario_localidad_id,
                            });
                            var lc_receptor = obj_localidad.getValue({ fieldId: 'custrecord_efx_fe_sl_cod_sat' });
                            if (lc_receptor) {
                                obj_direccion.destinatario.Localidad = lc_receptor;
                            } else {
                                obj_direccion.destinatario.Localidad = obj_localidad.getValue({ fieldId: 'name' });
                            }
                        }

                        //cargar municipio
                        var destinatario_municipio_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_municipio' });
                        if (destinatario_municipio_id) {
                            var obj_municipio = modRecord.load({
                                type: 'customrecord_efx_fe_sat_municipio',
                                id: destinatario_municipio_id,
                            });
                            var mpio_receptor = obj_municipio.getValue({ fieldId: 'custrecord_efx_fe_csm_cod_sat' });
                            if (mpio_receptor) {
                                obj_direccion.destinatario.Municipio = mpio_receptor;
                            } else {
                                obj_direccion.destinatario.Municipio = obj_municipio.getValue({ fieldId: 'name' });
                            }
                        }

                        //cargar estado
                        var destinatario_estado_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_estado' });
                        if (destinatario_estado_id) {
                            var obj_estado = modRecord.load({
                                type: 'customrecord_efx_fe_sat_estado',
                                id: destinatario_estado_id,
                            });
                            var edo_receptor = obj_estado.getValue({ fieldId: 'custrecord_efx_fe_se_cod_sat' });
                            if (edo_receptor) {
                                obj_direccion.destinatario.Estado = edo_receptor;
                            } else {
                                obj_direccion.destinatario.Estado = obj_estado.getValue({ fieldId: 'name' });
                            }
                        }
                        //cargar pais

                        var destinatario_pais_id = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_pais' });
                        if (destinatario_pais_id) {
                            var obj_pais = modRecord.load({
                                type: 'customrecord_efx_fe_sat_pais',
                                id: destinatario_pais_id,
                            });
                            obj_direccion.destinatario.Pais = obj_pais.getValue({ fieldId: 'custrecord_efx_fe_sp_cod_sat' });
                        }
                        obj_direccion.destinatario.CodigoPostal = obj_destinatario.getValue({ fieldId: 'custrecord_efx_fe_cedd_codigo_postal' });


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
        return {
            beforeSubmit: beforeSubmit
        }

    }
);
