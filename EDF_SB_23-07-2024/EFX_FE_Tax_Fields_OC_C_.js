/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/file'],
    /**
     * @param{record} record
     */
    function (record, search, runtime, file) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */


        function afterSubmit(context) {
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
                rates_ieps: {},
                rates_ieps_data: {},
                bases_ieps: {},
                rates_iva: {},
                rates_iva_data: {},
                bases_iva: {},
                rates_retencion: {},
                rates_retencion_data: {},
                bases_retencion: {},
                rates_local: {},
                rates_local_data: {},
                bases_local: {},
                rates_exento: {},
                rates_exento_data: {},
                bases_exento: {},
                monto_ieps_gbl: {},
                monto_iva_gbl: {},
                monto_ret_gbl: {},
                monto_local_gbl: {},
                monto_exento_gbl: {},
                descuentoConImpuesto: 0,
                descuentoSinImpuesto: 0,
                totalImpuestos: 0,
                subtotal: 0,
                total: 0,
                totalTraslados: 0,
                totalRetenciones: 0,
                diferenciaTotales: 0,
                totalImpuestos_gbl: 0,
                subtotal_gbl: 0,
                total_gbl: 0,
                totalTraslados_gbl: 0,
                totalRetenciones_gbl: 0,
            }

            var obj_diferencias = new Object();


            try {
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                    var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
                    var record_noww = context.newRecord;
                    var recType = record_noww.type;
                    if (recType == record.Type.CREDIT_MEMO && existeSuiteTax) {
                        var record_now = record.load({
                            type: recType,
                            id: record_noww.id,
                            isDynamic: true
                        });

                    } else {
                        var record_now = record.load({
                            type: recType,
                            id: record_noww.id,
                            isDynamic: false

                        });
                    }
                    if (existeSuiteTax) {
                        var record_now_nodymamic = record.load({
                            type: recType,
                            id: record_noww.id,
                            isDynamic: false

                        });
                        var countimpuesto = record_now.getLineCount({ sublistId: 'taxdetails' });
                    }

                    var tienecuenta = record_now.getValue({ fieldId: 'account' });
                    var concuenta = false;
                    if (tienecuenta && recType == record.Type.CASH_SALE) {
                        concuenta = true;
                    }
                    if (recType != record.Type.CASH_SALE) {
                        concuenta = true;
                    }
                    if (concuenta) {
                        var imlocaltotallinea = 0;
                        var factEspejo = record_now.getValue({ fieldId: 'custbody_efx_fe_gbl_ismirror' });
                        var desglosagrupoarticulos = record_now.getValue({ fieldId: 'custbody_efx_fe_desglosa_ga' });
                        var tipogbl = record_now.getValue({ fieldId: 'custbody_efx_fe_gbl_type' });
                        var descuentoglobal = record_now.getValue({ fieldId: 'discounttotal' });
                        //var articuloajusteTimbrado = record_now.getValue({fieldId: 'custbody_efx_fe_item_adjust'});
                        var enviototalimporte = record_now.getValue({ fieldId: 'shippingcost' }) || 0;
                        var enviototalimpuesto = record_now.getValue({ fieldId: 'shippingtax1amt' }) || 0;
                        var scriptObj = runtime.getCurrentScript();
                        var custscript_efx_fe_item_imp_loc = scriptObj.getParameter({ name: 'custscript_efx_fe_item_imp_loc' }) || '';
                        var articuloajusteTimbrado = scriptObj.getParameter({ name: 'custscript_efx_fe_adjust_cert' }) || '';
                        var diftimbrado = 0;
                        descuentoglobal = parseFloat(descuentoglobal) * -1;

                        log.audit({ title: 'factEspejo', details: factEspejo });
                        if (factEspejo != true || (factEspejo == true && tipogbl == 2)) {
                            var line_count_expense = record_now.getLineCount({ sublistId: 'expense' });
                            var subtotalTran = record_now.getValue({ fieldId: 'subtotal' });
                            var totalTran = record_now.getValue({ fieldId: 'total' });
                            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
                            var subsidiariaTransaccion = '';
                            var nexo = '';
                            if (SUBSIDIARIES) {
                                subsidiariaTransaccion = record_now.getValue({ fieldId: 'subsidiary' });
                                nexo = record_now.getValue({ fieldId: 'nexus_country' });
                            }

                            var obj_Json_Tax = new Object();
                            var rate_desccabecera = 0;

                            if (descuentoglobal) {
                                rate_desccabecera = ((descuentoglobal * 100) / subtotalTran).toFixed(2);
                                rate_desccabecera = parseFloat(rate_desccabecera) / 100;
                            }

                            //busqueda de configuración de impuestos
                            var desglose_config = search.create({
                                type: 'customrecord_efx_fe_desglose_tax',
                                filters: ['isinactive', search.Operator.IS, 'F'],
                                columns: [
                                    search.createColumn({ name: 'custrecord_efx_fe_desglose_ieps' }),
                                    search.createColumn({ name: 'custrecord_efx_fe_desglose_ret' }),
                                    search.createColumn({ name: 'custrecord_efx_fe_desglose_locales' }),
                                    search.createColumn({ name: 'custrecord_efx_fe_desglose_iva' }),
                                    search.createColumn({ name: 'custrecord_efx_fe_desglose_exento' }),
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
                            config_ieps = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_ieps' })).split(',');
                            config_retencion = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_ret' })).split(',');
                            config_local = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_locales' })).split(',');
                            config_iva = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_iva' })).split(',');
                            config_exento = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_exento' })).split(',');

                            log.audit({ title: 'config_ieps', details: config_ieps });
                            log.audit({ title: 'config_retencion', details: config_retencion });
                            log.audit({ title: 'config_local', details: config_local });
                            log.audit({ title: 'config_iva', details: config_iva });

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
                            var line_count = record_now.getLineCount({ sublistId: 'item' });

                            //recorrido de linea de articulos
                            var ieps_baseveintiseis = 0;
                            var ieps_basedieciseis = 0;

                            if (!existeSuiteTax) {
                                var objImpuestos = obtenObjImpuesto(subsidiariaTransaccion, nexo);
                            }

                            var arrayJson = new Array();

                            for (var i = 0; i < line_count; i++) {
                                log.audit({ title: 'inicio linea', details: i });
                                var objJsonLine = {
                                    line: '',
                                    json: {}
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
                                if (recType == record.Type.CREDIT_MEMO && existeSuiteTax) {
                                    var lineNum = record_now.selectLine({
                                        sublistId: 'item',
                                        line: i
                                    });
                                    var tipo_articulo = record_now.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemtype',

                                    }); var nombre_articulo = record_now.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',

                                    });
                                    log.audit({ title: 'tipo_articulo', details: tipo_articulo });
                                    if (tipo_articulo == 'Discount' || nombre_articulo == articuloajusteTimbrado) {
                                        if (nombre_articulo == articuloajusteTimbrado) {
                                            diftimbrado = diftimbrado + record_now.getCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', });
                                        }
                                        continue;
                                    }

                                    if (i < (line_count - 1)) {
                                        var lineNum = record_now.selectLine({
                                            sublistId: 'item',
                                            line: i + 1
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
                                        if (nombre_articulo == custscript_efx_fe_item_imp_loc) {
                                            tieneimlocal++;
                                            var a_amount_imloc = record_now.getCurrentSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'amount',

                                            });
                                            imlocaltotallinea = imlocaltotallinea + parseFloat(a_amount_imloc);
                                        }
                                        if (nombre_articulo != articuloajusteTimbrado) {
                                            if (tipo_articulo == 'Discount' && tieneimlocal == 0) {
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
                                        line: i
                                    });
                                } else {
                                    var tipo_articulo = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemtype',
                                        line: i
                                    }); var nombre_articulo = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        line: i
                                    });
                                    log.audit({ title: 'tipo_articulo', details: tipo_articulo });
                                    if (tipo_articulo == 'Discount' || tipo_articulo == 'Group' || tipo_articulo == 'Description' || tipo_articulo == 'EndGroup' || tipo_articulo == 'Subtotal' || nombre_articulo == articuloajusteTimbrado) {
                                        if (nombre_articulo == articuloajusteTimbrado) {
                                            diftimbrado = diftimbrado + record_now.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i });
                                        }
                                        continue;
                                    }
                                    var descuento_conteo = 1;

                                    do {

                                        log.audit({ title: 'iniciadescuentosuma', details: '' });
                                        var impuesto_descuento = 0;

                                        if (i < (line_count - descuento_conteo)) {
                                            var descuento_notax = 0;
                                            descuento_linea = 0;
                                            descuento_linea_sin = 0;
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
                                            if (nombre_articulo == custscript_efx_fe_item_imp_loc) {
                                                tieneimlocal++;
                                                var a_amount_imloc = record_now.getSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'amount',
                                                    line: i + descuento_conteo
                                                });
                                                imlocaltotallinea = imlocaltotallinea + parseFloat(a_amount_imloc);
                                            }
                                            log.audit({ title: 'nombre_articulo', details: nombre_articulo });
                                            log.audit({ title: 'articuloajusteTimbrado', details: articuloajusteTimbrado });
                                            if (nombre_articulo != articuloajusteTimbrado) {
                                                if (tipo_articulo == 'Discount' && tieneimlocal == 0) {
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
                                            log.audit({ title: 'descuento_linea', details: descuento_linea });
                                            log.audit({ title: 'descuento_linea_sin', details: descuento_linea_sin });

                                            obj_Json_Tax_totales.descuentoConImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoConImpuesto) + descuento_linea).toFixed(2);
                                            obj_Json_Tax_totales.descuentoSinImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto) + descuento_linea_sin).toFixed(2);


                                            //almacena el impuesto con y sin impuesto en atributos del objeto de la linea de impuestos
                                            obj_Json_Tax.descuentoConImpuesto = (parseFloat(obj_Json_Tax.descuentoConImpuesto) + descuento_linea).toFixed(2);
                                            obj_Json_Tax.descuentoSinImpuesto = (parseFloat(obj_Json_Tax.descuentoSinImpuesto) + descuento_linea_sin).toFixed(2);
                                            log.audit({ title: 'obj_Json_Tax.descuentoConImpuesto', details: obj_Json_Tax.descuentoConImpuesto });
                                            log.audit({ title: 'obj_Json_Tax.descuentoSinImpuesto', details: obj_Json_Tax.descuentoSinImpuesto });
                                            if ((tipo_articulo == 'Discount') && tieneimlocal == 0 || tipo_articulo == 'Subtotal' && tieneimlocal == 0) {
                                                descuento_conteo++;
                                                log.audit({ title: 'descuento_conteo', details: descuento_conteo });
                                                if (i < (line_count - descuento_conteo)) {
                                                    tipo_articulo = record_now.getSublistValue({
                                                        sublistId: 'item',
                                                        fieldId: 'itemtype',
                                                        line: i + descuento_conteo
                                                    });
                                                } else {
                                                    tipo_articulo = '';
                                                }

                                            }
                                            if (nombre_articulo == custscript_efx_fe_item_imp_loc) {
                                                tipo_articulo = '';
                                            }
                                        }
                                    } while (tipo_articulo == 'Discount' || tipo_articulo == 'Subtotal');
                                    //se obtiene el descuento en una variable para usarlo posteriormente
                                }

                                //obtiene información de campos de la linea
                                if (recType == record.Type.CREDIT_MEMO && existeSuiteTax) {
                                    log.audit({ title: 'nc y tiene suitetax', details: '' });
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
                                } else {
                                    log.audit({ title: 'nc y no tiene suitetax', details: '' });

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
                                    log.audit({ title: 'importe_base', details: importe_base });
                                }

                                if (descuentoglobal) {
                                    descuento_notax = (importe_base * rate_desccabecera) * -1;
                                } else {
                                    descuento_notax = parseFloat(obj_Json_Tax.descuentoSinImpuesto) * -1;
                                    descuento_sitax = parseFloat(obj_Json_Tax.descuentoConImpuesto) * -1;
                                }
                                log.audit({ title: 'descuento_sitax', details: descuento_sitax });
                                log.audit({ title: 'importe_base', details: importe_base });
                                
                                //var importe_base = parseFloat(base_rate) * parseFloat(base_quantity);
                                subtotalTransaccion = subtotalTransaccion + parseFloat(importe_base.toFixed(2));
                                log.audit({ title: 'subtotalTransaccion', details: subtotalTransaccion });
                                obj_Json_Tax.montoLinea = importe_base.toFixed(2);
                                if (descuentoglobal && rate_desccabecera) {
                                    obj_Json_Tax.descuentoConImpuesto = (importe_base * rate_desccabecera).toFixed(2);
                                    obj_Json_Tax.descuentoSinImpuesto = (importe_base * rate_desccabecera).toFixed(2);
                                }

                                //obtiene monto de impuesto en linea
                                if (existeSuiteTax) {
                                    if (recType == record.Type.CREDIT_MEMO && existeSuiteTax) {
                                        var total_linea = parseFloat(record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxamount',
                                        }));
                                    } else {
                                        var total_linea = parseFloat(record_now.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxamount',
                                            line: i
                                        }));
                                    }
                                } else {
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
                                if (existeSuiteTax) {
                                    if (recType == record.Type.CREDIT_MEMO && existeSuiteTax) {
                                        var taxref_linea = record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxdetailsreference',
                                        });
                                        var quantity_st = record_now.getCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantity',
                                        });
                                    } else {
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

                                    var objSuiteTax = obtieneSuiteTaxInfo(record_now, taxref_linea, countimpuesto, record_now_nodymamic);
                                    var tax_lines_count = objSuiteTax[taxref_linea].length;
                                } else {
                                    log.audit({ title: 'objImpuestos.TaxGroup[tax_code]', details: objImpuestos.TaxGroup[tax_code] });
                                    log.audit({ title: 'objImpuestos.TaxCodes[tax_code]', details: objImpuestos.TaxCodes[tax_code] });
                                    log.audit({ title: 'tax_code', details: tax_code });
                                    if (objImpuestos.TaxGroup.hasOwnProperty(tax_code)) {
                                        grupo_impuestos = true;
                                        var tax_lines_count = objImpuestos.TaxGroup[tax_code].length;
                                    } else if (objImpuestos.TaxCodes.hasOwnProperty(tax_code)) {
                                        log.audit({ title: 'objImpuestos.TaxCodes[tax_code]', details: objImpuestos.TaxCodes[tax_code] });
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


                                if (existeSuiteTax) {
                                    var importeDeImpuesto = parseFloat(record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'taxamount',
                                        line: i
                                    }));
                                } else {
                                    var importeDeImpuesto = parseFloat(record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'tax1amt',
                                        line: i
                                    }));

                                }
                                log.audit({ title: 'importeDeImpuesto', details: importeDeImpuesto });

                                var baseIeps = parseFloat(record_now.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    line: i
                                }));


                                //recorrido de los diferentes impuestos que conforman la linea de articulos

                                var montoIvas = 0;
                                var montoIeps = 0;
                                var montoLocales = 0;

                                log.audit({ title: 'tax_lines_count', details: tax_lines_count });

                                //Ivas para calcular ieps
                                var hayieps = 0;
                                var baseiepsmonto = 0;
                                var hayret = 0;
                                var baseiepssuitetax = '';
                                for (var x = 0; x < tax_lines_count; x++) {
                                    if (existeSuiteTax) {
                                        var tax_name = objSuiteTax[taxref_linea][x].nombre;

                                        var tax_id = objSuiteTax[taxref_linea][x].taxcode;

                                        var tax_rate = objSuiteTax[taxref_linea][x].rate;

                                        var tax_base = parseFloat(objSuiteTax[taxref_linea][x].base);

                                    } else {
                                        if (grupo_impuestos) {
                                            log.audit({ title: 'primero', details: '' });
                                            log.audit({ title: 'tax_code', details: tax_code });
                                            log.audit({ title: 'x', details: x });
                                            log.audit({ title: 'objImpuestos', details: objImpuestos });
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
                                    log.audit({ title: 'tax_base11', details: tax_base });


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


                                    for (var iep = 0; iep < config_ieps.length; iep++) {
                                        if (tax_id == config_ieps[iep]) {

                                            var baseiepsmonto = baseIeps + descuento_notax;
                                            var base_calc = parseFloat(tax_base) / 100;
                                            var rate_div = rate_number / 100;

                                            var tax_importe = (rate_div * parseFloat(baseIeps + descuento_notax)) * base_calc;
                                            montoIeps = parseFloat(tax_importe.toFixed(2));
                                            hayieps++;
                                            if (existeSuiteTax) {
                                                baseiepssuitetax = rate_number;
                                            }
                                        }
                                    }


                                    for (var iva = 0; iva < config_iva.length; iva++) {
                                        var importeImpuestoCalc = 0;
                                        var importeImpuestoTotalLinea = 0;
                                        if (tax_id == config_iva[iva]) {
                                            var rate_div = rate_number / 100;

                                            importeImpuestoCalc = (((importeConImpuesto - montoLocales) + descuento_sitax) / (rate_div + 1));
                                            importeImpuestoTotalLinea = ((importeConImpuesto - montoLocales) + descuento_sitax) - importeImpuestoCalc;
                                            if (hayret > 0) {
                                                var base_imp = importeSinImpuesto;
                                                montoIvas = (parseFloat(rate_div) * parseFloat(base_imp));

                                            } else {
                                                montoIvas = importeImpuestoTotalLinea;
                                            }
                                        }
                                    }

                                }
                                log.audit({ title: 'hayret', details: hayret });
                                var numdeImpuestos = 0;
                                var ivaceros = 0;
                                for (var x = 0; x < tax_lines_count; x++) {

                                    var montoRetencion = 0;
                                    //lee campos dependiendo si es grupo o codigo de impuestos
                                    if (existeSuiteTax) {
                                        var tax_name = objSuiteTax[taxref_linea][x].nombre;

                                        var tax_id = objSuiteTax[taxref_linea][x].taxcode;

                                        var tax_rate = objSuiteTax[taxref_linea][x].rate;

                                        var tax_base = parseFloat(objSuiteTax[taxref_linea][x].base);

                                    } else {
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
                                            if (existeSuiteTax) {
                                                baseiepssuitetax = rate_number;
                                            }
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

                                            if (montoIvas > 0) {
                                                if (existeSuiteTax) {
                                                    var tax_importe = (rate_div * parseFloat(baseIeps)) * base_calc;
                                                } else {
                                                    var tax_importe = (rate_div * parseFloat(baseIeps + descuento_notax)) * base_calc;
                                                }

                                                var truncar = redondeotrucar(tax_importe)
                                                if (truncar) {
                                                    tax_importe = trunc(tax_importe, 2);
                                                }
                                            } else {
                                                if (existeSuiteTax) {
                                                    var tax_importe = importeDeImpuesto + impuesto_descuento;
                                                } else {
                                                    if (rate_number != 8) {
                                                        var tax_importe = importeDeImpuesto;
                                                    } else {
                                                        var tax_importe = importeDeImpuesto + impuesto_descuento;
                                                    }

                                                }
                                            }



                                            obj_Json_Tax.ieps.importe = tax_importe.toFixed(2);
                                            montoIeps = parseFloat(tax_importe.toFixed(2));
                                            var descuentoDeImpuesto = descuento_sitax - descuento_notax;

                                            log.audit({ title: 'importeDeImpuesto', details: importeDeImpuesto });
                                            log.audit({ title: 'descuentoDeImpuesto', details: descuentoDeImpuesto });
                                            log.audit({ title: 'montoIvas', details: montoIvas });
                                            log.audit({ title: 'montoLocales', details: montoLocales });
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
                                            log.audit({ title: 'tax_base1', details: tax_base });
                                            log.audit({ title: 'baseiepssuitetax1', details: baseiepssuitetax });
                                            if (existeSuiteTax) {
                                                obj_Json_Tax.iva.base = tax_base + baseiepssuitetax;
                                            } else {
                                                obj_Json_Tax.iva.base = tax_base;
                                            }


                                            obj_Json_Tax.iva.name = tax_name;
                                            var importe_base_des = 0;

                                            obj_Json_Tax.iva.descuento = (descuento_notax * (-1)).toFixed(2);


                                            if (!baseiepssuitetax) {
                                                baseiepssuitetax = 0;
                                            }
                                            if (existeSuiteTax) {
                                                var base_calc = parseFloat(tax_base + baseiepssuitetax) / 100;
                                            } else {
                                                var base_calc = parseFloat(tax_base) / 100;
                                            }
                                            var rate_div = rate_number / 100;
                                            if (rate_div == 0) {
                                                ivaceros++;
                                            }
                                            obj_Json_Tax.iva.rate_div = rate_div;
                                            log.audit({ title: 'montoRetencion', details: montoRetencion });

                                            var importeimpuestodescuentoline = 0;
                                            if (tax_lines_count == 1) {
                                                log.audit({ title: 'tax_lines_count', details: tax_lines_count });
                                                if (i < (line_count - 1)) {
                                                    var tipo_articulo_desc = record_now.getSublistValue({
                                                        sublistId: 'item',
                                                        fieldId: 'itemtype',
                                                        line: i + 1
                                                    });

                                                    log.audit({ title: 'tipo_articulo_desc', details: tipo_articulo_desc });
                                                    if (tipo_articulo_desc == 'Discount') {
                                                        var importedescuentoLine = record_now.getSublistValue({
                                                            sublistId: 'item',
                                                            fieldId: 'amount',
                                                            line: i + 1
                                                        });
                                                        var importeimpuestodescuentoline = record_now.getSublistValue({
                                                            sublistId: 'item',
                                                            fieldId: 'grossamt',
                                                            line: i + 1
                                                        });
                                                        importeImpuestoCalc = baseIeps + importedescuentoLine;
                                                    } else {
                                                        log.audit({ title: 'baseIeps', details: baseIeps });
                                                        importeImpuestoCalc = baseIeps;

                                                    }
                                                } else {

                                                    //importeImpuestoCalc = (((importeConImpuesto - montoLocales) + descuento_sitax + montoRetencion) / (rate_div + 1));
                                                    importeImpuestoCalc = baseIeps;

                                                }

                                            } else {


                                                importeImpuestoCalc = (((importeConImpuesto - montoLocales) + descuento_sitax + montoRetencion) / (rate_div + 1)); //626.137931
                                                importeImpuestoCalc = parseFloat(importeImpuestoCalc.toFixed(2));




                                                log.audit({ title: 'importeImpuestoCalc', details: importeImpuestoCalc });
                                            }
                                            // importeImpuestoCalc = (importeConImpuesto+montoRetencion)/(rate_div+1);




                                            if (hayieps > 0) {
                                                log.audit({ title: 'importeDeImpuesto', details: importeDeImpuesto });
                                                log.audit({ title: 'montoIeps', details: montoIeps });
                                                log.audit({ title: 'descuento_sitax', details: descuento_sitax });
                                                log.audit({ title: 'descuento_notax', details: descuento_notax });
                                                if (rate_div > 0) {
                                                    importeImpuestoTotalLinea = importeDeImpuesto + (descuento_sitax - descuento_notax) - montoIeps;
                                                } else {
                                                    importeImpuestoTotalLinea = 0;
                                                }

                                            } else if (montoLocales > 0 || montoLocales < 0) {
                                                log.audit({ title: 'importeDeImpuesto', details: importeDeImpuesto });
                                                log.audit({ title: 'montoLocales', details: montoLocales });
                                                log.audit({ title: 'descuento_sitax', details: descuento_sitax });
                                                log.audit({ title: 'descuento_notax', details: descuento_notax });
                                                log.audit({ title: 'rate_div', details: rate_div });
                                                if (rate_div > 0) {
                                                    importeImpuestoTotalLinea = importeDeImpuesto + (descuento_sitax - descuento_notax) - montoLocales;
                                                } else {
                                                    importeImpuestoTotalLinea = 0;
                                                }
                                            } else {
                                                log.audit({ title: 'importeConImpuesto', details: importeConImpuesto });
                                                log.audit({ title: 'importeimpuestodescuentoline', details: importeimpuestodescuentoline });
                                                log.audit({ title: 'importeImpuestoCalc', details: importeImpuestoCalc });
                                                importeImpuestoTotalLinea = importeConImpuesto + importeimpuestodescuentoline - importeImpuestoCalc;
                                            }

                                            log.audit({ title: 'importeImpuestoTotalLinea', details: importeImpuestoTotalLinea });



                                            // var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100) + descuento_notax;

                                            var importe_base_des = 0;
                                            if (!baseiepssuitetax || baseiepssuitetax == '') {
                                                baseiepssuitetax = 0;
                                            }
                                            if (hayieps > 0) {
                                                importe_base_des = importe_base;
                                                importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                                if (!importe_base) {
                                                    importe_base = baseiepsmonto;
                                                }

                                                if (existeSuiteTax) {
                                                    var base_imp = parseFloat(importe_base) * ((parseFloat(tax_base) + parseFloat(baseiepssuitetax)) / 100);
                                                } else {
                                                    var base_imp = parseFloat(importe_base) * ((parseFloat(tax_base)) / 100);
                                                }
                                            } else {
                                                log.audit({ title: 'importe_base1', details: importe_base });
                                                log.audit({ title: 'tax_base1', details: tax_base });
                                                log.audit({ title: 'baseiepssuitetax1', details: baseiepssuitetax });
                                                if (existeSuiteTax) {
                                                    var base_imp = ((parseFloat(importe_base) * (parseFloat(tax_base) + parseFloat(baseiepssuitetax))) / 100) + descuento_notax;
                                                } else {
                                                    var base_imp = ((parseFloat(importe_base) * (parseFloat(tax_base))) / 100) + descuento_notax;
                                                }
                                                obj_Json_Tax.iva.descuento = (descuento_notax * (-1)).toFixed(2);
                                            }


                                            obj_Json_Tax.iva.base_importe = base_imp.toFixed(2);
                                            // var rate_div_f = rate_div.toFixed(2);
                                            // var importe_base_f = importe_base.toFixed(2);
                                            // var base_calc_f = base_calc.toFixed(2);
                                            log.audit({ title: 'hayret', details: hayret });
                                            if (hayret > 0) {
                                                if (rate_desccabecera) {
                                                    var importetax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                                    var importecondescuento = (rate_desccabecera * importetax_importe);
                                                    montoIvas = importetax_importe - importecondescuento;
                                                    var tax_importe = importetax_importe - importecondescuento;
                                                } else {
                                                    montoIvas = (parseFloat(rate_div) * parseFloat(base_imp));
                                                    var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                                }
                                            } else {


                                                if (descuentoglobal) {
                                                    var importecondescuento = (rate_desccabecera * importeImpuestoTotalLinea);
                                                    montoIvas = importeImpuestoTotalLinea - importecondescuento;
                                                    if (existeSuiteTax) {
                                                        var tax_importe = importeImpuestoTotalLinea;
                                                    } else {
                                                        var tax_importe = importeImpuestoTotalLinea - importecondescuento;
                                                    }
                                                } else {
                                                    montoIvas = importeImpuestoTotalLinea;
                                                    var tax_importe = importeImpuestoTotalLinea;
                                                    log.audit({ title: 'tax_importe', details: tax_importe });
                                                }

                                                if (hayieps > 0 && rate_div > 0) {
                                                    log.audit({ title: 'tax_importehayieps', details: tax_importe });
                                                    var tax_importeredondear = (parseFloat(rate_div) * parseFloat(base_imp));
                                                    var importetruncado = trunc(tax_importeredondear, 2);
                                                    if ((tax_importe - importetruncado) > 0.01) {
                                                        tax_importe = tax_importe - 0.01;
                                                        montoIvas = tax_importe;
                                                        var importeiepsredondeo = parseFloat(obj_Json_Tax.ieps.importe) + 0.01;
                                                        obj_Json_Tax.ieps.importe = importeiepsredondeo.toFixed(2);


                                                        /*obj_Json_Tax.ieps.rate
                                                        var stringposicionieps = "IEPS "+obj_Json_Tax.ieps.rate+"%";
                                                        obj_Json_Tax_totales.rates_ieps[stringposicionieps] = (parseFloat(obj_Json_Tax_totales.rates_ieps[stringposicionieps])+0.01).toFixed(2);
                                                        obj_Json_Tax_totales.rates_ieps_data[obj_Json_Tax.ieps.rate] = (parseFloat(obj_Json_Tax_totales.rates_ieps_data[obj_Json_Tax.ieps.rate])+0.01).toFixed(2);*/
                                                        totalTraslados = totalTraslados + 0.01;
                                                        //importe_ieps = (parseFloat(importe_ieps)+0.01);

                                                    }
                                                }

                                            }


                                            log.audit({ title: 'tax_importe', details: tax_importe });

                                            totalTraslados = totalTraslados + parseFloat(tax_importe.toFixed(2));

                                            /*if(montoLocales!=0){
                                                tax_importe = tax_importe-montoLocales;
                                            }*/
                                            log.audit({ title: 'montoLocales', details: montoLocales });
                                            log.audit({ title: 'tax_importe', details: tax_importe });
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
                                            if (existeSuiteTax) {
                                                obj_Json_Tax.retenciones.rate = rate_number;
                                            } else {
                                                obj_Json_Tax.retenciones.rate = rate_number * (-1);
                                            }

                                            obj_Json_Tax.retenciones.id = tax_id;
                                            obj_Json_Tax.retenciones.base = tax_base;
                                            obj_Json_Tax.retenciones.name = tax_name;
                                            //calcula el importe base con la base del impuesto y el importe de la linea
                                            // monto de la linea (amount) por la base de impuesto entre 100
                                            if (hayieps == 0) {
                                                var base_imp = (parseFloat(importe_base) * parseFloat(tax_base)) / 100;
                                                obj_Json_Tax.retenciones.base_importe = base_imp.toFixed(2);
                                            }
                                            //se multiplica el rate number por -1 porque el impuesto de retencion se configura
                                            //en negativo la base
                                            if (existeSuiteTax) {
                                                var rate_num = rate_number;
                                            } else {
                                                var rate_num = rate_number * (-1);
                                            }

                                            //se obtiene la base en decimales
                                            var base_calc = parseFloat(tax_base) / 100;
                                            //se obtiene el rate del impuesto en decimales
                                            var rate_div = rate_num / 100;
                                            obj_Json_Tax.retenciones.rate_div = rate_div;
                                            if (hayieps == 0) {
                                                if (montoIvas > 0) {
                                                    log.audit({ title: 'montoIvas', details: montoIvas })
                                                    var tax_importe = montoIvas - importeDeImpuesto;
                                                } else {
                                                    var tax_importe = (rate_div * parseFloat(importe_base)) * base_calc;
                                                }

                                            }
                                            if (hayieps > 0) {
                                                importeImpuestoCalc = importeConImpuesto / (rate_div + 1);
                                                importeImpuestoTotalLinea = importeConImpuesto - importeImpuestoCalc;
                                                var base_imp = importeImpuestoCalc;
                                                obj_Json_Tax.retenciones.base_importe = base_imp.toFixed(2);

                                                //el importe de impuesto se obtiene multiplicando el rate de impuesto en decimales
                                                //por el importe por la base
                                                montoRetencion = importeImpuestoTotalLinea;
                                                var tax_importe = importeImpuestoTotalLinea;
                                            } else {
                                                montoRetencion = tax_importe;
                                            }

                                            montoRetencion = montoRetencion * -1;

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
                                            importeImpuestoCalc = importeConImpuesto / (rate_div + 1);
                                            importeImpuestoTotalLinea = importeConImpuesto - importeImpuestoCalc;
                                            var base_imp = importeImpuestoCalc;
                                            obj_Json_Tax.exento.base_importe = base_imp.toFixed(2);
                                            // var rate_div_f = rate_div.toFixed(2);
                                            // var importe_base_f = importe_base.toFixed(2);
                                            // var base_calc_f = base_calc.toFixed(2);
                                            if (tiene_ieps <= 0) {
                                                if (existeSuiteTax) {
                                                    var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                                } else {
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


                                log.audit({ title: 'obj_Json_Tax', details: obj_Json_Tax });
                                log.audit({ title: 'numdeImpuestos', details: numdeImpuestos });
                                log.audit({ title: 'tax_lines_count', details: tax_lines_count });
                                log.audit({ title: 'ivaceros', details: ivaceros });
                                if (tax_lines_count > 1 && ivaceros == 0) {
                                    var obj_Json_Tax_Limites = validaLimites(obj_Json_Tax);
                                } else {
                                    var obj_Json_Tax_Limites = obj_Json_Tax;
                                }

                                if (obj_Json_Tax.ieps.name != '') {

                                    importe_ieps = importe_ieps + parseFloat(obj_Json_Tax_Limites.ieps.importe);

                                }
                                if (obj_Json_Tax.iva.name != '' && obj_Json_Tax.iva.rate_div > 0) {
                                    log.audit({ title: 'obj_Json_Tax', details: obj_Json_Tax });
                                    //var ajusteTotalesLimites = 0;
                                    //ajusteTotalesLimites = parseFloat(obj_Json_Tax_Limites.iva.importe)-parseFloat(obj_Json_Tax.iva.importe);
                                    importe_iva = importe_iva + parseFloat(obj_Json_Tax_Limites.iva.importe);
                                }
                                if (obj_Json_Tax.retenciones.name != '') {
                                    //var ajusteTotalesLimites = parseFloat(obj_Json_Tax_Limites.retenciones.importe)-parseFloat(obj_Json_Tax.retenciones.importe);
                                    importe_retencion = importe_retencion + parseFloat(obj_Json_Tax_Limites.retenciones.importe);
                                }
                                if (tax_lines_count > 1) {
                                    obj_Json_Tax = obj_Json_Tax_Limites;
                                }

                                if (obj_Json_Tax.ieps.name != '') {
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


                                if (obj_Json_Tax.iva.name != '') {
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


                                if (recType == record.Type.CREDIT_MEMO && existeSuiteTax) {
                                    objJsonLine.line = i;
                                    objJsonLine.json = obj_Json_Tax;
                                    arrayJson.push(objJsonLine);

                                } else {
                                    record_now.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_efx_fe_tax_json',
                                        line: i,
                                        value: JSON.stringify(obj_Json_Tax),
                                    });
                                }



                                log.audit({ title: 'obj_Json_Tax', details: obj_Json_Tax });
                                log.audit({ title: 'fin linea', details: i });
                            }

                            if (recType == record.Type.CREDIT_MEMO && existeSuiteTax) {
                                for (var a = 0; a < arrayJson.length; a++) {
                                    var lineNum = record_now.selectLine({
                                        sublistId: 'item',
                                        line: arrayJson[a].line
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
                            var desctraslados = 0;
                            var descret = 0;
                            var descivatot = 0;
                            var desciepstot = 0;
                            if (descuentoglobal) {
                                // desctraslados = totalTraslados*rate_desccabecera;
                                // descret = totalRetenciones*rate_desccabecera;
                                // descivatot = importe_iva*rate_desccabecera;
                                // desciepstot = importe_ieps*rate_desccabecera;
                                obj_Json_Tax_totales.total = (subtotalTransaccion + parseFloat(totalTraslados - totalRetenciones) - parseFloat(descuentoglobal) - parseFloat(desctraslados) - parseFloat(descret) + (imlocaltotallinea * -1)).toFixed(2);
                                obj_Json_Tax_totales.descuentoConImpuesto = parseFloat(descuentoglobal).toFixed(2);
                                obj_Json_Tax_totales.descuentoSinImpuesto = parseFloat(descuentoglobal).toFixed(2);
                            } else {
                                //obj_Json_Tax_totales.total = (subtotalTransaccion + parseFloat(totalTraslados - totalRetenciones) - parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto)).toFixed(2);
                                obj_Json_Tax_totales.total = (parseFloat(totalTran) + (imlocaltotallinea * -1)).toFixed(2);
                            }



                            obj_Json_Tax_totales.totalImpuestos = parseFloat(totalTraslados - totalRetenciones - desctraslados - descret).toFixed(2);
                            obj_Json_Tax_totales.totalTraslados = (totalTraslados - desctraslados).toFixed(2);
                            obj_Json_Tax_totales.totalRetenciones = (totalRetenciones - descret).toFixed(2);

                            log.audit({ title: 'obj_diferencias', details: obj_diferencias });
                            log.audit({ title: 'importe_retencion', details: importe_retencion });
                            log.audit({ title: 'importe_iva', details: importe_iva.toFixed(2) });
                            log.audit({ title: 'importe_exento', details: importe_exento.toFixed(2) });
                            log.audit({ title: 'importe_ieps', details: importe_ieps });
                            log.audit({ title: 'importe_local', details: importe_local });


                            log.audit({ title: 'record_now.id', details: record_now.id });
                            log.audit({ title: 'record_now.type', details: record_now.type });


                            //se llena el objeto con los totales de impuestos por tipo
                            obj_Json_Tax_totales.retencion_total = parseFloat(importe_retencion - descret).toFixed(2) || '0.00';
                            obj_Json_Tax_totales.iva_total = parseFloat(importe_iva - descivatot).toFixed(2) || '0.00';
                            obj_Json_Tax_totales.exento_total = parseFloat(importe_exento).toFixed(2) || '0.00';
                            obj_Json_Tax_totales.ieps_total = parseFloat(importe_ieps - desciepstot).toFixed(2) || '0.00';
                            obj_Json_Tax_totales.local_total = parseFloat(importe_local).toFixed(2) || '0.00';


                            //validar que la suma de desglose coincida con el total
                            log.audit({ title: 'objivas', details: Object.keys(obj_Json_Tax_totales.rates_iva) });
                            log.audit({ title: 'objivas', details: Object.keys(obj_Json_Tax_totales.rates_iva_data) });

                            log.audit({ title: 'obj_Json_Tax_totales', details: obj_Json_Tax_totales });
                            log.audit({ title: 'obj_Json_Tax_totales.total', details: obj_Json_Tax_totales.total });
                            log.audit({ title: 'totalTran', details: totalTran });
                            var totalcostosenvio = parseFloat(enviototalimporte) + parseFloat(enviototalimpuesto);
                            log.audit({ title: 'totalcostosenvio', details: totalcostosenvio });
                            var diferenciaTotales = ((parseFloat(obj_Json_Tax_totales.total) + totalcostosenvio - totalTran)).toFixed(2);
                            log.audit({ title: 'diferenciaTotales', details: diferenciaTotales });
                            if (parseFloat(diferenciaTotales) == 0) {
                                diferenciaTotales = diftimbrado;
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
                                log.audit({ title: 'tambasivas', details: tambasivas });
                                log.audit({ title: 'tambasieps', details: tambasieps });
                                log.audit({ title: 'tambasret', details: tambasret });
                                if (tambasivas > 0 || tambasivas > 0 && tambasieps > 0 || tambasivas > 0 && tambasret > 0) {
                                    log.audit({ title: 'monto_gbl', details: monto_gbl });
                                    log.audit({ title: 'rate_gblB', details: rate_gblB });
                                    log.audit({ title: '(monto_gbl * rate_gblB).toFixed(2);', details: (monto_gbl * rate_gblB).toFixed(2) });
                                    obj_Json_Tax_totales.monto_iva_gbl[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]] = (monto_gbl * rate_gblB).toFixed(2);
                                } else {
                                    obj_Json_Tax_totales.monto_iva_gbl[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]] = (obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]]);
                                }
                                var totImpu = parseFloat((monto_gbl * rate_gblB).toFixed(2));
                                totalImpuestos_gbl = totalImpuestos_gbl + totImpu;
                                totalTraslados_gbl = totalTraslados_gbl + totImpu;
                                iva_total_gbl = iva_total_gbl + totImpu;
                                log.audit({ title: 'iva_total_gbl', details: iva_total_gbl });
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
                            log.audit({ title: 'obj_Json_Tax_totales', details: obj_Json_Tax_totales });

                            record_now.setValue({
                                fieldId: 'custbody_efx_fe_tax_json',
                                value: JSON.stringify(obj_Json_Tax_totales),
                                ignoreFieldChange: true
                            });

                            if (recType == record.Type.CREDIT_MEMO && existeSuiteTax) {
                                var macros = record_now.getMacros();

                                // execute the macro
                                if ('calculateTax' in macros) {
                                    macros.calculateTax(); // For promise version use: macros.calculateTax.promise()
                                }
                            }
                            // if(recType == record.Type.CREDIT_MEMO){
                            //     record_now.executeMacro({ id: record.Macro.CALCULATE_TAX });
                            //
                            //
                            // }


                            log.audit({ title: 'antes de guardar', details: '' });


                            record_now.save({ enableSourcing: false, ignoreMandatoryFields: true });
                            log.audit({ title: 'despues de guardar', details: '' });


                        }
                    }
                }
            } catch (error) {
                log.audit({ title: 'error', details: error });
                var recordobj = record.load({
                    type: record_now.type,
                    id: record_now.id
                });
                recordobj.setValue({
                    fieldId: 'custbody_efx_fe_tax_json',
                    value: JSON.stringify(obj_Json_Tax_totales),
                    ignoreFieldChange: true
                });
                recordobj.save({ enableSourcing: false, ignoreMandatoryFields: true });
            }
            if (recType == record.Type.PURCHASE_ORDER && line_count_expense > 0) {
                impuestosExpenses(context);
            }
        }

        function impuestosExpenses(context) {
            var obj_Json_Tax_totales = new Object();

            obj_Json_Tax_totales = {
                ieps_total: 0,
                iva_total: 0,
                retencion_total: 0,
                local_total: 0,
                rates_ieps: {},
                rates_ieps_data: {},
                bases_ieps: {},
                rates_iva: {},
                rates_iva_data: {},
                bases_iva: {},
                rates_retencion: {},
                rates_retencion_data: {},
                bases_retencion: {},
                rates_local: {},
                rates_local_data: {},
                bases_local: {},
                descuentoConImpuesto: 0,
                descuentoSinImpuesto: 0
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
                        filters: ['isinactive', search.Operator.IS, 'F'],
                        columns: [
                            search.createColumn({ name: 'custrecord_efx_fe_desglose_ieps' }),
                            search.createColumn({ name: 'custrecord_efx_fe_desglose_ret' }),
                            search.createColumn({ name: 'custrecord_efx_fe_desglose_locales' }),
                            search.createColumn({ name: 'custrecord_efx_fe_desglose_iva' }),
                        ]
                    });

                    var ejecutar = desglose_config.run();
                    var resultado = ejecutar.getRange(0, 100);

                    var config_ieps = new Array();
                    var config_retencion = new Array();
                    var config_local = new Array();
                    var config_iva = new Array();

                    config_ieps = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_ieps' })).split(',');
                    config_retencion = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_ret' })).split(',');
                    config_local = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_locales' })).split(',');
                    config_iva = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_iva' })).split(',');

                    log.audit({ title: 'config_ieps', details: config_ieps });
                    log.audit({ title: 'config_retencion', details: config_retencion });
                    log.audit({ title: 'config_local', details: config_local });
                    log.audit({ title: 'config_iva', details: config_iva });

                    var importe_retencion = 0;
                    var importe_iva = 0;
                    var importe_ieps = 0;
                    var importe_local = 0;
                    var line_count = record_now.getLineCount({ sublistId: 'expense' });
                    for (var i = 0; i < line_count; i++) {
                        log.audit({ title: 'linea', details: i });
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
                            descuentoConImpuesto: 0,
                            descuentoSinImpuesto: 0
                        }
                        var descuento_linea = 0;
                        var descuento_linea_sin = 0;
                        var tipo_articulo = record_now.getSublistValue({ sublistId: 'expense', fieldId: 'itemtype', line: i });
                        log.audit({ title: 'tipo_articulo', details: tipo_articulo });
                        if (tipo_articulo == 'Discount') {
                            continue;
                        }
                        var descuento_notax = 0;
                        if (i < (line_count - 1)) {
                            var tipo_articulo = record_now.getSublistValue({ sublistId: 'expense', fieldId: 'itemtype', line: i + 1 });
                            if (tipo_articulo == 'Discount') {
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
                                if (!a_quantity) {
                                    a_quantity = 1;
                                }

                                descuento_notax = parseFloat(a_rate) * parseFloat(a_quantity);

                                // descuento_notax = record_now.getSublistValue({
                                //     sublistId: 'expense',
                                //     fieldId: 'amount',
                                //     line: i + 1
                                // });
                                descuento_linea = linea_descuentos_monto * (-1);
                                descuento_linea_sin = descuento_notax * (-1);
                                obj_Json_Tax_totales.descuentoConImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoConImpuesto) + descuento_linea).toFixed(2);
                                obj_Json_Tax_totales.descuentoSinImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto) + descuento_linea_sin).toFixed(2);
                                obj_Json_Tax.descuentoConImpuesto = descuento_linea.toFixed(2);
                                obj_Json_Tax.descuentoSinImpuesto = descuento_linea_sin.toFixed(2);
                            }
                        }

                        var base_rate = record_now.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i });
                        var base_quantity = record_now.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
                        var tax_code = record_now.getSublistValue({ sublistId: 'item', fieldId: 'taxcode', line: i });
                        // var importe_base = record_now.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
                        var importe_base = parseFloat(base_rate) * parseFloat(base_quantity);
                        var total_linea = parseFloat(record_now.getSublistValue({ sublistId: 'expense', fieldId: 'tax1amt', line: i }));

                        var suma_linea = 0;
                        var suma_linea_tax = 0;

                        var grupo_impuestos = true;
                        try {
                            var info_tax_rec = record.load({
                                type: record.Type.TAX_GROUP,
                                id: tax_code,
                                isDynamic: true
                            });

                            var tax_lines_count = info_tax_rec.getLineCount({ sublistId: 'taxitem' });
                            log.audit({ title: 'tax_lines_count', details: tax_lines_count });
                            grupo_impuestos = true;

                        } catch (error_grup) {
                            var info_tax_rec = record.load({
                                type: record.Type.SALES_TAX_ITEM,
                                id: tax_code,
                                isDynamic: true
                            });

                            var tax_lines_count = 1;
                            log.audit({ title: 'tax_lines_count', details: tax_lines_count });

                            grupo_impuestos = false;
                        }

                        var contadorLineas = 0;
                        var tiene_ieps = 0;
                        for (var x = 0; x < tax_lines_count; x++) {
                            if (grupo_impuestos) {
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
                            } else {
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



                            log.audit({ title: 'tax_rate', details: tax_rate });
                            //var rate_replace = tax_rate.replace("%", "");
                            var rate_number = parseFloat(tax_rate);

                            //definir retenciones
                            for (var ret = 0; ret < config_retencion.length; ret++) {
                                if (tax_id == config_retencion[ret]) {
                                    obj_Json_Tax.retenciones.rate = rate_number * (-1);
                                    obj_Json_Tax.retenciones.id = tax_id;
                                    obj_Json_Tax.retenciones.base = tax_base;
                                    obj_Json_Tax.retenciones.name = tax_name;
                                    var base_imp = (parseFloat(importe_base) * parseFloat(tax_base)) / 100;
                                    obj_Json_Tax.retenciones.base_importe = base_imp.toFixed(2);
                                    var rate_num = rate_number * (-1);
                                    var base_calc = parseFloat(tax_base) / 100;
                                    var rate_div = rate_num / 100;
                                    obj_Json_Tax.retenciones.rate_div = rate_div;

                                    var tax_importe = (rate_div * parseFloat(importe_base)) * base_calc;

                                    obj_Json_Tax.retenciones.importe = tax_importe.toFixed(2);
                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                    importe_retencion = parseFloat(importe_retencion) + parseFloat(tax_importe);
                                    //suma para comparar diferencia de centavos
                                    suma_linea = suma_linea - parseFloat(tax_importe);
                                    suma_linea_tax = suma_linea_tax + parseFloat(tax_importe);
                                    //
                                    var cadena = 'Retencion ';
                                    var cadena_rate = cadena + rate_num + '%';
                                    var tam_rates_ret = Object.keys(obj_Json_Tax_totales.rates_retencion).length;
                                    if (tam_rates_ret > 0) {
                                        for (var t = 0; t < tam_rates_ret; t++) {
                                            if (Object.keys(obj_Json_Tax_totales.rates_retencion)[t] == cadena_rate) {
                                                var importe_obj = obj_Json_Tax_totales.rates_retencion[cadena_rate];
                                                var base_ret_total = obj_Json_Tax_totales.bases_retencion[rate_num];
                                                var obj_ret_total_base = parseFloat(base_ret_total) + parseFloat(base_imp);
                                                var obj_ret_total = parseFloat(importe_obj) + parseFloat(tax_importe.toFixed(2));

                                                obj_Json_Tax_totales.rates_retencion[cadena_rate] = obj_ret_total.toFixed(2);
                                                obj_Json_Tax_totales.rates_retencion_data[rate_num] = obj_ret_total.toFixed(2);
                                                obj_Json_Tax_totales.bases_retencion[rate_num] = obj_ret_total_base.toFixed(2);
                                            } else {
                                                if (!obj_Json_Tax_totales.rates_retencion[cadena_rate]) {
                                                    obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                    obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                    obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                                }
                                            }
                                        }
                                    } else {
                                        obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                        obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                        obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                    }
                                }
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
                                    obj_Json_Tax.locales.importe = tax_importe.toFixed(2);
                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                    importe_local = parseFloat(importe_local) + parseFloat(tax_importe);
                                    //suma para comparar diferencia de centavos

                                    suma_linea = suma_linea + parseFloat(tax_importe);
                                    suma_linea_tax = suma_linea_tax + parseFloat(tax_importe);
                                    //

                                    var cadena = 'Local ';
                                    var cadena_rate = cadena + rate_number + '%';
                                    var tam_rates_locales = Object.keys(obj_Json_Tax_totales.rates_local).length;

                                    if (tam_rates_locales > 0) {
                                        for (var t = 0; t < tam_rates_locales; t++) {
                                            if (Object.keys(obj_Json_Tax_totales.rates_local)[t] == cadena_rate) {
                                                var importe_obj = obj_Json_Tax_totales.rates_local[cadena_rate];
                                                var base_local_total = obj_Json_Tax_totales.bases_local[rate_number];
                                                var obj_local_total_base = parseFloat(base_local_total) + parseFloat(base_imp);
                                                var obj_loc_total = parseFloat(importe_obj) + parseFloat(tax_importe.toFixed(2));

                                                obj_Json_Tax_totales.rates_local[cadena_rate] = obj_loc_total.toFixed(2);
                                                obj_Json_Tax_totales.rates_local_data[rate_number] = obj_loc_total.toFixed(2);
                                                obj_Json_Tax_totales.bases_local[rate_number] = obj_local_total_base.toFixed(2);
                                            } else {
                                                if (!obj_Json_Tax_totales.rates_local[cadena_rate]) {
                                                    obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                    obj_Json_Tax_totales.rates_local_data[rate_number] = tax_importe.toFixed(2);
                                                    obj_Json_Tax_totales.bases_local[rate_number] = base_imp.toFixed(2);
                                                }
                                            }
                                        }
                                    } else {
                                        obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                        obj_Json_Tax_totales.rates_local_data[rate_number] = tax_importe.toFixed(2);
                                        obj_Json_Tax_totales.bases_local[rate_number] = base_imp.toFixed(2);
                                    }
                                }
                            }

                            //definir ieps

                            for (var iep = 0; iep < config_ieps.length; iep++) {
                                if (tax_id == config_ieps[iep]) {
                                    if (descuento_notax != 0) {
                                        tiene_ieps++;
                                    }

                                    obj_Json_Tax.ieps.rate = rate_number;
                                    obj_Json_Tax.ieps.id = tax_id;
                                    obj_Json_Tax.ieps.base = tax_base;
                                    obj_Json_Tax.ieps.name = tax_name;
                                    obj_Json_Tax.ieps.descuento = (descuento_notax * (-1)).toFixed(2);
                                    var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100) + descuento_notax;
                                    obj_Json_Tax.ieps.base_importe = base_imp.toFixed(2);
                                    var base_calc = parseFloat(tax_base) / 100;
                                    var rate_div = rate_number / 100;
                                    obj_Json_Tax.ieps.rate_div = rate_div;
                                    var tax_importe = (rate_div * parseFloat(importe_base + descuento_notax)) * base_calc;
                                    obj_Json_Tax.ieps.importe = tax_importe.toFixed(2);
                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                    log.audit({ title: 'importe_ieps', details: importe_ieps });
                                    log.audit({ title: 'tax_importe', details: tax_importe });
                                    importe_ieps = parseFloat(importe_ieps) + parseFloat(tax_importe);
                                    log.audit({ title: 'importe_ieps_suma', details: importe_ieps });
                                    //suma para comparar diferencia de centavos
                                    var tax_importe_sumas = (rate_div * parseFloat(importe_base)) * base_calc;
                                    //tax_importe_sumas = tax_importe_sumas.toFixed(2)
                                    suma_linea = suma_linea + parseFloat(tax_importe_sumas);
                                    suma_linea_tax = suma_linea_tax + parseFloat(tax_importe);
                                    //

                                    var cadena = 'IEPS ';
                                    var cadena_rate = cadena + rate_number + '%';
                                    log.audit({ title: 'cadena_rate_ieps', details: cadena_rate });
                                    var tam_rates_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                                    if (tam_rates_ieps > 0) {
                                        for (var t = 0; t < tam_rates_ieps; t++) {
                                            log.audit({ title: 'obj_Json_Tax_totales.rates_ieps)[t]', details: Object.keys(obj_Json_Tax_totales.rates_ieps)[t] });
                                            log.audit({ title: 'cadena_rate', details: cadena_rate });
                                            if (Object.keys(obj_Json_Tax_totales.rates_ieps)[t] == cadena_rate) {
                                                var importe_obj = obj_Json_Tax_totales.rates_ieps[cadena_rate];
                                                log.audit({ title: 'importe_obj', details: importe_obj });
                                                var base_ieps_total = obj_Json_Tax_totales.bases_ieps[rate_number];
                                                var obj_ieps_total_base = parseFloat(base_ieps_total) + parseFloat(base_imp);
                                                var obj_ieps_total = parseFloat(importe_obj) + parseFloat(tax_importe);

                                                obj_Json_Tax_totales.rates_ieps[cadena_rate] = obj_ieps_total.toFixed(2);
                                                obj_Json_Tax_totales.rates_ieps_data[rate_number] = obj_ieps_total.toFixed(2);
                                                obj_Json_Tax_totales.bases_ieps[rate_number] = obj_ieps_total_base.toFixed(2);
                                            } else {
                                                if (!obj_Json_Tax_totales.rates_ieps[cadena_rate]) {
                                                    obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                    obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                    obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp.toFixed(2);
                                                }
                                            }
                                        }
                                    } else {
                                        obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                        obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                        obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp.toFixed(2);
                                    }
                                    log.audit({ title: 'obj_Json_Tax_totales_ieps', details: obj_Json_Tax_totales });
                                }

                            }

                            //definir ivas

                            for (var iva = 0; iva < config_iva.length; iva++) {
                                if (tax_id == config_iva[iva]) {
                                    obj_Json_Tax.iva.rate = rate_number;
                                    obj_Json_Tax.iva.id = tax_id;
                                    obj_Json_Tax.iva.base = tax_base;
                                    obj_Json_Tax.iva.name = tax_name;
                                    log.audit({ title: 'tiene_ieps', details: tiene_ieps });
                                    var importe_base_des = 0;
                                    if (tiene_ieps > 0) {
                                        importe_base_des = importe_base;
                                        importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                        var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)
                                    } else {
                                        var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100) + descuento_notax;
                                        obj_Json_Tax.iva.descuento = (descuento_notax * (-1)).toFixed(2);
                                    }
                                    obj_Json_Tax.iva.base_importe = base_imp.toFixed(2);
                                    var base_calc = parseFloat(tax_base) / 100;
                                    var rate_div = rate_number / 100;
                                    obj_Json_Tax.iva.rate_div = rate_div;
                                    // var rate_div_f = rate_div.toFixed(2);
                                    // var importe_base_f = importe_base.toFixed(2);
                                    // var base_calc_f = base_calc.toFixed(2);
                                    if (tiene_ieps <= 0) {
                                        var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base + descuento_notax)) * parseFloat(base_calc);
                                    } else {
                                        log.audit({ title: 'rate_div', details: rate_div });
                                        log.audit({ title: 'base_imp', details: base_imp });
                                        log.audit({ title: 'base_calc', details: base_calc });
                                        var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                    }
                                    log.audit({ title: 'tax_importe_iva_nof', details: tax_importe });
                                    obj_Json_Tax.iva.importe = tax_importe.toFixed(2);
                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                    importe_iva = parseFloat(importe_iva) + parseFloat(tax_importe);
                                    //suma para comparar diferencia de centavos
                                    if (tiene_ieps <= 0) {
                                        var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                        //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                    } else {
                                        var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base_des)) * parseFloat(base_calc);
                                        //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                    }
                                    suma_linea = suma_linea + parseFloat(tax_importe_sumas);
                                    suma_linea_tax = suma_linea_tax + parseFloat(tax_importe);
                                    log.audit({ title: 'suma_linea_iva', details: suma_linea });
                                    log.audit({ title: 'tax_importe_iva', details: tax_importe });
                                    //

                                    var cadena = 'IVA ';
                                    var cadena_rate = cadena + rate_number + '%';
                                    log.audit({ title: 'cadena_rate_iva', details: cadena_rate });
                                    var tam_rates_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;
                                    log.audit({ title: 'base_imp', details: base_imp });
                                    if (tam_rates_iva > 0) {
                                        for (var t = 0; t < tam_rates_iva; t++) {
                                            if (Object.keys(obj_Json_Tax_totales.rates_iva)[t] == cadena_rate) {

                                                log.audit({ title: 'tax_importe_ivif', details: tax_importe });
                                                var importe_obj = obj_Json_Tax_totales.rates_iva[cadena_rate];
                                                var base_iva_total = obj_Json_Tax_totales.bases_iva[rate_number];
                                                var obj_iva_total_base = parseFloat(base_iva_total) + parseFloat(base_imp);
                                                var obj_iva_total = parseFloat(importe_obj) + parseFloat(tax_importe.toFixed(2));

                                                obj_Json_Tax_totales.rates_iva[cadena_rate] = obj_iva_total.toFixed(2);
                                                obj_Json_Tax_totales.rates_iva_data[rate_number] = obj_iva_total.toFixed(2);
                                                log.audit({ title: 'obj_iva_total_base', details: obj_iva_total_base });
                                                obj_Json_Tax_totales.bases_iva[rate_number] = obj_iva_total_base.toFixed(2) || 0;
                                                log.audit({ title: 'obj_Json_Tax_totales.bases_iva[rate_number]', details: obj_Json_Tax_totales.bases_iva[rate_number] });
                                            } else {
                                                if (!obj_Json_Tax_totales.rates_iva[cadena_rate]) {
                                                    log.audit({ title: 'tax_importe_iv0_else', details: tax_importe });
                                                    obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                                    obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                                    log.audit({ title: 'base_imp_else', details: base_imp });
                                                    obj_Json_Tax_totales.bases_iva[rate_number] = base_imp.toFixed(2) || '0.00';
                                                    log.audit({ title: 'obj_Json_Tax_totales.bases_iva[rate_number]', details: obj_Json_Tax_totales.bases_iva[rate_number] });
                                                }

                                            }
                                        }
                                    } else {
                                        obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                        log.audit({ title: 'tax_importe_iv0', details: tax_importe });
                                        obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                        log.audit({ title: 'base_imp_else2', details: base_imp });
                                        obj_Json_Tax_totales.bases_iva[rate_number] = base_imp.toFixed(2) || '0.00';
                                        log.audit({ title: 'obj_Json_Tax_totales.bases_iva[rate_number]', details: obj_Json_Tax_totales.bases_iva[rate_number] });
                                    }
                                    log.audit({ title: 'obj_Json_Tax_totales_iva', details: obj_Json_Tax_totales });
                                }

                            }


                            contadorLineas++;
                        }


                        log.audit({ title: 'total_linea', details: total_linea });
                        log.audit({ title: 'suma_linea', details: suma_linea });
                        suma_linea = suma_linea.toFixed(2);
                        log.audit({ title: 'suma_linea', details: suma_linea });

                        var diferencia_centavos = parseFloat(total_linea) - parseFloat(suma_linea);
                        diferencia_centavos = diferencia_centavos.toFixed(2);
                        diferencia_centavos = parseFloat(diferencia_centavos);

                        if (diferencia_centavos < 0) {
                            diferencia_centavos = diferencia_centavos * (1);
                        }

                        if (diferencia_centavos > 0) {
                            diferencia_centavos = diferencia_centavos * (1);
                        }



                        log.audit({ title: 'diferencia_centavos', details: diferencia_centavos });
                        log.audit({ title: 'importe_retencion', details: importe_retencion });
                        log.audit({ title: 'importe_iva', details: importe_iva });
                        log.audit({ title: 'importe_local', details: importe_local });
                        log.audit({ title: 'importe_ieps', details: importe_ieps });

                        if (diferencia_centavos != 0) {

                            if (obj_Json_Tax.retenciones.importe) {
                                var nuevo_importe = parseFloat(obj_Json_Tax.retenciones.importe) + parseFloat(diferencia_centavos);
                                obj_Json_Tax.retenciones.importe = nuevo_importe;
                                importe_retencion = parseFloat(importe_retencion) + parseFloat(diferencia_centavos);
                                log.audit({ title: 'importe_retencion', details: importe_retencion });

                            } else if (obj_Json_Tax.iva.importe) {

                                var nuevo_importe = parseFloat(obj_Json_Tax.iva.importe) + parseFloat(diferencia_centavos);
                                obj_Json_Tax.iva.importe = nuevo_importe.toFixed(2);
                                importe_iva = parseFloat(importe_iva) + parseFloat(diferencia_centavos);
                                log.audit({ title: 'importe_iva', details: importe_iva });
                                log.audit({ title: 'diferencia_centavos_iva', details: diferencia_centavos });

                            } else if (obj_Json_Tax.locales.importe) {

                                var nuevo_importe = parseFloat(obj_Json_Tax.locales.importe) + parseFloat(diferencia_centavos);
                                obj_Json_Tax.locales.importe = nuevo_importe;
                                importe_local = parseFloat(importe_local) + parseFloat(diferencia_centavos);
                                log.audit({ title: 'importe_local', details: importe_local });

                            } else if (obj_Json_Tax.ieps.importe) {

                                var nuevo_importe = parseFloat(obj_Json_Tax.ieps.importe) + parseFloat(diferencia_centavos);
                                obj_Json_Tax.ieps.importe = nuevo_importe;
                                importe_ieps = parseFloat(importe_ieps) + parseFloat(diferencia_centavos);
                                log.audit({ title: 'importe_ieps_difcentavos', details: importe_ieps });

                            }
                        }

                        record_now.setSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcol_efx_fe_tax_json',
                            line: i,
                            value: JSON.stringify(obj_Json_Tax),
                        });


                    }

                    log.audit({ title: 'importe_retencion', details: importe_retencion });
                    log.audit({ title: 'importe_iva', details: importe_iva.toFixed(2) });
                    log.audit({ title: 'importe_ieps', details: importe_ieps });
                    log.audit({ title: 'importe_local', details: importe_local });



                    obj_Json_Tax_totales.retencion_total = parseFloat(importe_retencion).toFixed(2) || '0.00';
                    obj_Json_Tax_totales.iva_total = parseFloat(importe_iva).toFixed(2) || '0.00';
                    obj_Json_Tax_totales.ieps_total = parseFloat(importe_ieps).toFixed(2) || '0.00';
                    obj_Json_Tax_totales.local_total = parseFloat(importe_local).toFixed(2) || '0.00';


                    //validar que la suma de desglose coincida con el total
                    log.audit({ title: 'objivas', details: Object.keys(obj_Json_Tax_totales.rates_iva) });
                    log.audit({ title: 'objivas', details: Object.keys(obj_Json_Tax_totales.rates_iva_data) });
                    //log.audit({title:'objivas',details:Object.values(obj_Json_Tax_totales.rates_iva)});
                    var tam_obj_totales_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;
                    var sumas_ivas = 0;
                    if (tam_obj_totales_iva > 0) {
                        for (var iva = 0; iva < tam_obj_totales_iva; iva++) {

                            sumas_ivas = sumas_ivas + parseFloat(obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]);
                        }
                        for (var iva = 0; iva < tam_obj_totales_iva; iva++) {
                            if (parseFloat(obj_Json_Tax_totales.iva_total) != sumas_ivas) {

                                var diferencia_imp = parseFloat(obj_Json_Tax_totales.iva_total) - sumas_ivas;

                                diferencia_imp = diferencia_imp.toFixed(2);
                                diferencia_imp = parseFloat(diferencia_imp);


                                if (Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva] == 0) {
                                    obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]] = 0;
                                    obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]] = 0;

                                } else {
                                    var ttt = Object.keys(obj_Json_Tax_totales.rates_iva);
                                    obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]] = parseFloat(obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]) + diferencia_imp;
                                    log.audit({ title: 'diferencia_imp', details: obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]] });
                                    obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]] = parseFloat(obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]]) + diferencia_imp;
                                }
                                obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iva]] = parseFloat(obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iva]]) + diferencia_imp || 0;

                            }
                        }


                    }

                    var tam_obj_totales_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                    var sumas_ieps = 0;
                    if (tam_obj_totales_ieps > 0) {
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
                    if (tam_obj_totales_local > 0) {
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
                    log.audit({ title: 'tam_obj_totales_ret', details: tam_obj_totales_ret });
                    var sumas_ret = 0;
                    if (tam_obj_totales_ret > 0) {
                        for (var ret = 0; ret < tam_obj_totales_ret; ret++) {
                            sumas_ret = sumas_ret + parseFloat(obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]]);


                            log.audit({ title: 'sumas_ret', details: sumas_ret });
                            log.audit({
                                title: 'obj_Json_Tax_totales.retencion_total',
                                details: obj_Json_Tax_totales.retencion_total
                            });
                        }
                        for (var ret = 0; ret < tam_obj_totales_ret; ret++) {
                            if (parseFloat(obj_Json_Tax_totales.retencion_total) != sumas_ret) {

                                var diferencia_imp = parseFloat(obj_Json_Tax_totales.retencion_total) - sumas_ret;
                                log.audit({ title: 'diferencia_imp', details: diferencia_imp });
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
                    record_now.save({ enableSourcing: true, ignoreMandatoryFields: true });
                }
            } catch (error) {
                log.audit({ title: 'error', details: error });

            }
        }


        function calculaTotales(idrecord, tipos, config_ieps, config_retencion, config_local, config_iva, config_exento, obj_Json_Tax_totales, subtotalTran, ieps_baseveintiseis, ieps_basedieciseis) {
            log.audit({ title: 'idrecord', details: idrecord });
            log.audit({ title: 'tipos', details: tipos });
            try {

                var obj_J_totales = {
                    ieps_total: 0,
                    iva_total: 0,
                    retencion_total: 0,
                    local_total: 0,
                    exento_total: 0,
                    ieps_total_ex: 0,
                    iva_total_ex: 0,
                    retencion_total_ex: 0,
                    local_total_ex: 0,
                    exento_total_ex: 0,
                    rates_ieps: {},
                    rates_ieps_data: {},
                    bases_ieps: {},
                    rates_iva: {},
                    rates_iva_data: {},
                    bases_iva: {},
                    rates_retencion: {},
                    rates_retencion_data: {},
                    bases_retencion: {},
                    rates_local: {},
                    rates_local_data: {},
                    bases_local: {},
                    rates_exento: {},
                    rates_exento_data: {},
                    bases_exento: {},
                    descuentoConImpuesto: 0,
                    descuentoSinImpuesto: 0
                }

                var multiplica = 1;
                if (tipos == 'invoice') {
                    tipos = 'CustInvc';
                }
                if (tipos == 'cashsale') {
                    tipos = 'CashSale';
                } if (tipos == 'creditmemo') {
                    tipos = 'CustCred';
                    multiplica = -1;
                } if (tipos == 'customerpayment') {
                    tipos = 'CustPymt';
                } if (tipos == 'vendorbill') {
                    tipos = 'VendBill';
                } if (tipos == 'purchaseorder') {
                    tipos = 'PurchOrd';
                } if (tipos == 'salesorder') {
                    tipos = 'SalesOrd';
                }


                var busquedaTotales = search.create({
                    type: search.Type.TRANSACTION,
                    filters: [
                        ['type', search.Operator.ANYOF, tipos]
                        , 'AND',
                        ['internalid', search.Operator.ANYOF, idrecord]
                        , 'AND',
                        ['taxline', search.Operator.IS, 'T']
                    ],
                    columns: [
                        search.createColumn({ name: 'taxcode' }),
                        search.createColumn({ name: 'netamountnotax' }),
                        search.createColumn({ name: 'fxamount' }),
                        search.createColumn({ name: 'rate', join: 'taxItem' }),

                    ]
                });
                var ejecutar = busquedaTotales.run();
                var resultado = ejecutar.getRange(0, 100);

                log.audit({ title: 'resultado', details: resultado });

                var array_totales = new Array();

                //recalcular para el ieps 26.5
                var recalcula = 0;
                for (var i = 0; i < resultado.length; i++) {
                    var rate = resultado[i].getValue({ name: 'rate', join: 'taxItem' });
                    rate = rate.replace('%', '');
                    if (rate == "26.50") {
                        recalcula++;
                    }
                }
                log.audit({ title: 'recalcula', details: recalcula });
                for (var i = 0; i < resultado.length; i++) {
                    var json_totales = {
                        nombre: '',
                        id: '',
                        monto: '',
                        monto_ex: '',
                        rate: ''
                    }
                    json_totales.nombre = resultado[i].getText({ name: 'taxcode' });
                    json_totales.id = resultado[i].getValue({ name: 'taxcode' });
                    var monto = resultado[i].getValue({ name: 'fxamount' });
                    var montoExtrangero = resultado[i].getValue({ name: 'fxamount' });
                    if (monto == '.00') {
                        monto = '0.00';
                    }
                    if (montoExtrangero == '.00') {
                        montoExtrangero = '0.00';
                    }

                    var rate = resultado[i].getValue({ name: 'rate', join: 'taxItem' });
                    rate = rate.replace('%', '');
                    json_totales.rate = parseFloat(rate);
                    log.audit({ title: 'ieps_baseveintiseis', details: ieps_baseveintiseis });
                    log.audit({ title: 'ieps_basedieciseis', details: ieps_basedieciseis });
                    if (recalcula > 0 && rate == "26.50") {
                        monto = parseFloat(ieps_baseveintiseis) * 0.265;
                        montoExtrangero = parseFloat(ieps_baseveintiseis) * 0.265;
                        json_totales.monto = monto.toFixed(2);
                        json_totales.monto_ex = montoExtrangero.toFixed(2);
                    } else if (recalcula > 0 && rate == "16.00") {
                        monto = parseFloat(ieps_basedieciseis) * 0.16;
                        montoExtrangero = parseFloat(ieps_basedieciseis) * 0.16;
                        json_totales.monto = monto.toFixed(2);
                        json_totales.monto_ex = montoExtrangero.toFixed(2);
                    } else {
                        json_totales.monto = monto;
                        json_totales.monto_ex = montoExtrangero;
                    }

                    array_totales.push(json_totales);
                }

                log.audit({ title: 'array_totales', details: array_totales });

                var ieps_total = 0;
                var iva_total = 0;
                var retencion_total = 0;
                var local_total = 0;
                var exento_total = 0;
                var ieps_total_ex = 0;
                var iva_total_ex = 0;
                var retencion_total_ex = 0;
                var local_total_ex = 0;
                var exento_total_ex = 0;

                for (var iep = 0; iep < config_ieps.length; iep++) {
                    for (var x = 0; x < array_totales.length; x++) {
                        if (array_totales[x].id == config_ieps[iep]) {
                            ieps_total = ieps_total + parseFloat(array_totales[x].monto);
                            ieps_total_ex = ieps_total_ex + parseFloat(array_totales[x].monto_ex);
                            var rate_p = array_totales[x].nombre + '%';
                            obj_J_totales.rates_ieps[rate_p] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                            obj_J_totales.rates_ieps_data[array_totales[x].rate] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                        }
                    }
                }
                ieps_total = ieps_total * multiplica;
                ieps_total_ex = ieps_total_ex * multiplica;
                obj_J_totales.ieps_total = ieps_total.toFixed(2);
                obj_J_totales.ieps_total_ex = ieps_total_ex.toFixed(2);

                for (var ret = 0; ret < config_retencion.length; ret++) {
                    for (var x = 0; x < array_totales.length; x++) {
                        if (array_totales[x].id == config_retencion[ret]) {
                            retencion_total = retencion_total + parseFloat(array_totales[x].monto);
                            retencion_total_ex = retencion_total_ex + parseFloat(array_totales[x].monto_ex);
                            var rate_p = array_totales[x].nombre + '%';
                            obj_J_totales.rates_retencion[rate_p] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                            obj_J_totales.rates_retencion_data[array_totales[x].rate] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                        }
                    }
                }

                retencion_total = retencion_total * multiplica;
                retencion_total_ex = retencion_total_ex * multiplica;
                obj_J_totales.retencion_total = retencion_total.toFixed(2);
                obj_J_totales.retencion_total_ex = retencion_total_ex.toFixed(2);

                for (var loc = 0; loc < config_local.length; loc++) {
                    for (var x = 0; x < array_totales.length; x++) {
                        if (array_totales[x].id == config_local[loc]) {
                            local_total = local_total + parseFloat(array_totales[x].monto);
                            local_total_ex = local_total_ex + parseFloat(array_totales[x].monto_ex);
                            var rate_p = array_totales[x].nombre + '%';
                            obj_J_totales.rates_local[rate_p] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                            obj_J_totales.rates_local_data[array_totales[x].rate] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                        }
                    }
                }

                local_total = local_total * multiplica;
                local_total_ex = local_total_ex * multiplica;
                obj_J_totales.local_total = local_total.toFixed(2);
                obj_J_totales.local_total_ex = local_total_ex.toFixed(2);

                for (var iva = 0; iva < config_iva.length; iva++) {
                    for (var x = 0; x < array_totales.length; x++) {
                        if (array_totales[x].id == config_iva[iva]) {
                            iva_total = iva_total + parseFloat(array_totales[x].monto);
                            iva_total_ex = iva_total_ex + parseFloat(array_totales[x].monto_ex);
                            var rate_p = array_totales[x].nombre + '%';
                            obj_J_totales.rates_iva[rate_p] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                            obj_J_totales.rates_iva_data[array_totales[x].rate] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                        }
                    }
                }

                iva_total = iva_total * multiplica;
                iva_total_ex = iva_total_ex * multiplica;
                obj_J_totales.iva_total = iva_total.toFixed(2);
                obj_J_totales.iva_total_ex = iva_total_ex.toFixed(2);

                for (var ex = 0; ex < config_exento.length; ex++) {
                    for (var x = 0; x < array_totales.length; x++) {
                        if (array_totales[x].id == config_exento[ex]) {
                            exento_total = exento_total + parseFloat(array_totales[x].monto);
                            exento_total_ex = exento_total_ex + parseFloat(array_totales[x].monto_ex);
                            var rate_p = array_totales[x].nombre + '%';
                            obj_J_totales.rates_exento[rate_p] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                            obj_J_totales.rates_exento_data[array_totales[x].rate] = (parseFloat(array_totales[x].monto) * multiplica).toFixed(2);
                        }
                    }
                }

                exento_total = exento_total * multiplica;
                exento_total_ex = exento_total_ex * multiplica;
                obj_J_totales.exento_total = exento_total.toFixed(2);
                obj_J_totales.exento_total_ex = exento_total_ex.toFixed(2);


                obj_J_totales.bases_ieps = obj_Json_Tax_totales.bases_ieps;
                obj_J_totales.bases_iva = obj_Json_Tax_totales.bases_iva;
                obj_J_totales.bases_retencion = obj_Json_Tax_totales.bases_retencion;
                obj_J_totales.bases_local = obj_Json_Tax_totales.bases_local;
                obj_J_totales.bases_exento = obj_Json_Tax_totales.bases_exento;
                obj_J_totales.descuentoConImpuesto = obj_Json_Tax_totales.descuentoConImpuesto;
                obj_J_totales.descuentoSinImpuesto = obj_Json_Tax_totales.descuentoSinImpuesto;
                log.audit({ title: 'obj_J_totales', details: obj_J_totales });

                return obj_J_totales;


            } catch (calculat) {
                log.error({ title: 'calculat', details: calculat });
            }

        }

        function calculaDiferencias(recordid, recordtype, obj_Json_Tax_totales, objFinalTotal, obj_diferencias) {
            var recordobj = record.load({
                type: recordtype,
                id: recordid
            });

            var sumatoria_ivas = 0;
            var sumatoria_ret = 0;
            var sumatoria_loc = 0;
            var sumatoria_ex = 0;
            var sumatoria_ieps = 0;
            var numlines = recordobj.getLineCount({ sublistId: 'item' });
            var tam_obj_diferencias = Object.keys(obj_diferencias).length;
            log.audit({ title: 'tam_obj_diferencias', details: tam_obj_diferencias });
            for (var i = 0; i < numlines; i++) {

                var tipo_articulo = recordobj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: i
                });
                log.audit({ title: 'tipo_articulo', details: tipo_articulo });
                if (tipo_articulo == 'Discount') {
                    continue;
                }

                var objLinea_np = recordobj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_efx_fe_tax_json',
                    line: i,
                });

                var objLinea = JSON.parse(objLinea_np);

                for (var x = 0; x < tam_obj_diferencias; x++) {
                    log.audit({ title: 'i', details: i });
                    log.audit({ title: 'Object.keys(obj_diferencias)[x]', details: Object.keys(obj_diferencias)[x] });
                    if (i == parseInt(Object.keys(obj_diferencias)[x])) {
                        log.audit({ title: 'obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia', details: obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia });
                        if (obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia != 0) {

                            var tam_obj_totales_iva = Object.keys(obj_Json_Tax_totales.rates_iva_data).length;
                            var tam_obj_totales_iva_final = Object.keys(objFinalTotal.rates_iva_data).length;
                            log.audit({ title: 'tam_obj_totales_iva', details: tam_obj_totales_iva });

                            if (tam_obj_totales_iva > 0) {
                                for (var iva = 0; iva < tam_obj_totales_iva; iva++) {
                                    var ratesIva = parseFloat(obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]]);
                                    var ratesIvaFinal = parseFloat(objFinalTotal.rates_iva_data[Object.keys(objFinalTotal.rates_iva_data)[iva]]);
                                    log.audit({ title: 'ratesIva', details: ratesIva.toFixed(2) });
                                    log.audit({ title: 'ratesIvaFinal', details: ratesIvaFinal.toFixed(2) });
                                    if (ratesIva.toFixed(2) != ratesIvaFinal.toFixed(2)) {
                                        var importeRateL = objLinea.iva.rate;
                                        if (importeRateL == Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]) {
                                            var importeImpuestoL = objLinea.iva.importe;
                                            var baseImpuestoL = objLinea.iva.base_importe;

                                            objLinea.iva.importe = parseFloat(importeImpuestoL) + obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia;


                                            //objLinea.iva.base_importe = parseFloat(baseImpuestoL) + obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia;
                                            obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]] = parseFloat(ratesIva) + parseFloat(obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia);
                                            obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia = 0;
                                        }
                                    }
                                }

                            }

                            var tam_obj_totales_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps_data).length;
                            var tam_obj_totales_ieps_final = Object.keys(objFinalTotal.rates_ieps_data).length;
                            log.audit({ title: 'tam_obj_totales_ieps', details: tam_obj_totales_ieps });
                            if (tam_obj_totales_ieps > 0) {
                                for (var ieps = 0; ieps < tam_obj_totales_ieps; ieps++) {
                                    var ratesieps = parseFloat(obj_Json_Tax_totales.rates_ieps_data[Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]]);
                                    var ratesiepsFinal = parseFloat(objFinalTotal.rates_ieps_data[Object.keys(objFinalTotal.rates_ieps_data)[ieps]]);
                                    log.audit({ title: 'ratesieps', details: ratesieps.toFixed(2) });
                                    log.audit({ title: 'ratesiepsFinal', details: ratesiepsFinal.toFixed(2) });
                                    if (ratesieps.toFixed(2) != ratesiepsFinal.toFixed(2)) {
                                        var importeRateL = objLinea.ieps.rate;
                                        log.audit({ title: 'importeRateL', details: importeRateL });
                                        log.audit({ title: 'Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]', details: Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps] });
                                        if (importeRateL == Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]) {
                                            var importeImpuestoL = objLinea.ieps.importe;
                                            var baseImpuestoL = objLinea.ieps.base_importe;
                                            //nuevo 28-04-2021
                                            // var diferenciaieps = parseFloat(ratesiepsFinal) - parseFloat(ratesieps);
                                            // if(obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia==0 && diferenciaieps!=0){
                                            //     obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia = diferenciaieps;
                                            // }

                                            //

                                            objLinea.ieps.importe = parseFloat(importeImpuestoL) + obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia;



                                            //objLinea.ieps.base_importe = parseFloat(baseImpuestoL)+obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia;
                                            log.audit({ title: 'importeImpuestoL', details: importeImpuestoL });
                                            log.audit({ title: 'obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia', details: obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia });
                                            log.audit({ title: 'objLinea.ieps.importe', details: objLinea.ieps.importe });
                                            obj_Json_Tax_totales.rates_ieps_data[Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]] = parseFloat(ratesieps) + parseFloat(obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia);
                                            obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia = 0;
                                        }
                                    }
                                }

                            }

                            var tam_obj_totales_retencion = Object.keys(obj_Json_Tax_totales.rates_retencion_data).length;
                            var tam_obj_totales_retencion_final = Object.keys(objFinalTotal.rates_retencion_data).length;
                            log.audit({ title: 'tam_obj_totales_retencion', details: tam_obj_totales_retencion });
                            if (tam_obj_totales_retencion > 0) {
                                for (var retencion = 0; retencion < tam_obj_totales_retencion; retencion++) {
                                    var ratesretencion = obj_Json_Tax_totales.rates_retencion_data[Object.keys(obj_Json_Tax_totales.rates_retencion_data)[retencion]];
                                    var ratesretencionFinal = objFinalTotal.rates_retencion_data[Object.keys(objFinalTotal.rates_retencion_data)[retencion]];
                                    log.audit({ title: 'ratesretencion', details: ratesretencion });
                                    log.audit({ title: 'ratesretencionFinal', details: ratesretencionFinal });
                                    if (ratesretencion != ratesretencionFinal) {
                                        var importeRateL = objLinea.retenciones.rate;
                                        if (importeRateL == Object.keys(obj_Json_Tax_totales.rates_retencion_data)[retencion]) {
                                            var importeImpuestoL = objLinea.retenciones.importe;
                                            var baseImpuestoL = objLinea.retenciones.base_importe;

                                            objLinea.retenciones.importe = parseFloat(importeImpuestoL) + obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia;



                                            //objLinea.retenciones.base_importe = parseFloat(baseImpuestoL)+obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia;
                                            obj_Json_Tax_totales.rates_retencion_data[Object.keys(obj_Json_Tax_totales.rates_retencion_data)[retencion]] = parseFloat(ratesretencion) + parseFloat(obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia);
                                            obj_diferencias[Object.keys(obj_diferencias)[x]].diferencia = 0;
                                        }
                                    }
                                }

                            }

                        }

                        log.audit({ title: 'objLinea', details: objLinea });
                        recordobj.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_tax_json',
                            line: i,
                            value: JSON.stringify(objLinea)
                        });
                    }
                }
                if (numlines == 1) {
                    if (objFinalTotal.iva_total != '0.00') {
                        objLinea.iva.importe = objFinalTotal.iva_total;
                    }
                    if (objFinalTotal.ieps_total != '0.00') {
                        objLinea.ieps.importe = objFinalTotal.ieps_total;
                    }
                    if (objFinalTotal.retencion_total != '0.00') {
                        objLinea.retenciones.importe = objFinalTotal.retencion_total;
                    }
                    if (objFinalTotal.local_total != '0.00') {
                        objLinea.locales.importe = objFinalTotal.local_total;
                    }
                    if (objFinalTotal.exento_total != '0.00') {
                        objLinea.exento.importe = objFinalTotal.exento_total;
                    }


                    log.audit({ title: 'objLinea', details: objLinea });
                    recordobj.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_tax_json',
                        line: i,
                        value: JSON.stringify(objLinea)
                    });
                }

            }
            recordobj.save({ enableSourcing: true, ignoreMandatoryFields: true });

        }

        function obtieneSuiteTaxInfo(record_now, taxref_linea, countimpuesto, record_now_nodymamic) {
            //var countimpuesto = record_now.getLineCount({sublistId:'taxdetails'});
            var objST = {}

            log.audit({ title: 'countimpuesto', details: countimpuesto });
            log.audit({ title: 'taxref_linea', details: taxref_linea });
            for (var st = 0; st < countimpuesto; st++) {
                var taxref_imp = record_now_nodymamic.getSublistValue({
                    sublistId: 'taxdetails',
                    fieldId: 'taxdetailsreference',
                    line: st
                });
                log.audit({ title: 'taxref_imp', details: taxref_imp });
                if (taxref_imp == taxref_linea) {
                    if (objST.hasOwnProperty(taxref_imp)) {
                        var objLineaSt = {
                            base: '',
                            taxcode: '',
                            rate: '',
                            nombre: ''
                        }
                        // objLineaSt.base = record_now.getSublistValue({sublistId:'taxdetails',fieldId:'taxbasis',line:st});
                        objLineaSt.base = 100;
                        objLineaSt.taxcode = record_now_nodymamic.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxcode', line: st });
                        objLineaSt.rate = record_now_nodymamic.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxrate', line: st });
                        objLineaSt.nombre = record_now_nodymamic.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxcode_display', line: st });
                        objST[taxref_imp].push(objLineaSt);
                    } else {
                        var objLineaSt = {
                            base: '',
                            taxcode: '',
                            rate: '',
                            nombre: ''
                        }
                        // objLineaSt.base = record_now.getSublistValue({sublistId:'taxdetails',fieldId:'taxbasis',line:st});
                        objLineaSt.base = 100;
                        objLineaSt.taxcode = record_now_nodymamic.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxcode', line: st });
                        objLineaSt.rate = record_now_nodymamic.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxrate', line: st });
                        objLineaSt.nombre = record_now_nodymamic.getSublistValue({ sublistId: 'taxdetails', fieldId: 'taxcode_display', line: st });
                        objST[taxref_imp] = new Array();
                        objST[taxref_imp].push(objLineaSt);
                    }
                }
                log.audit({ title: 'objST', details: objST });

            }
            log.audit({ title: 'objST', details: objST });
            return objST;
        }

        function obtenObjImpuesto(subsidiariaTransaccion, nexo) {
            var objcodigosMainFull = {};
            var objcodigosMain = {};
            var objcodigosMainCodes = {};
            var arrayobjcodigos = new Array();

            var arraybusquedagroup = new Array();
            var arraybusquedacode = new Array();
            arraybusquedagroup.push(["isinactive", search.Operator.IS, "F"]);
            arraybusquedacode.push(["isinactive", search.Operator.IS, "F"]);

            if (subsidiariaTransaccion) {
                arraybusquedagroup.push("AND");
                arraybusquedacode.push("AND");
                arraybusquedagroup.push(["subsidiary", search.Operator.ANYOF, subsidiariaTransaccion]);
                arraybusquedacode.push(["subsidiary", search.Operator.ANYOF, subsidiariaTransaccion]);
                arraybusquedagroup.push("AND");
                arraybusquedagroup.push(["country", search.Operator.ANYOF, nexo]);
                arraybusquedacode.push("AND");
                arraybusquedacode.push(["country", search.Operator.ANYOF, nexo]);
            }
            log.audit({ title: 'arraybusquedagroup', details: arraybusquedagroup });
            log.audit({ title: 'arraybusquedacode', details: arraybusquedacode });

            //busca grupos de impuestos
            var taxgroupSearchObj = search.create({
                type: search.Type.TAX_GROUP,
                filters: arraybusquedagroup,
                columns:
                    [
                        search.createColumn({ name: "itemid", }),
                        search.createColumn({ name: "rate", label: "Tasa" }),
                        search.createColumn({ name: "country", label: "País" }),
                        search.createColumn({ name: "internalid", label: "ID interno" })
                    ]
            });
            var ejecutar = taxgroupSearchObj.run();
            var resultado = ejecutar.getRange(0, 900);

            for (var i = 0; i < resultado.length; i++) {
                var tax_code = resultado[i].getValue({ name: "internalid" });

                var info_tax_rec = record.load({
                    type: record.Type.TAX_GROUP,
                    id: tax_code,
                    isDynamic: true
                });
                objcodigosMain[tax_code] = new Array();

                var tax_lines_count = info_tax_rec.getLineCount({ sublistId: 'taxitem' });
                for (var x = 0; x < tax_lines_count; x++) {
                    var objcodigos = {
                        taxname2: '',
                        taxname: '',
                        rate: '',
                        basis: '',
                        taxtype: '',
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
            // =============Grupo de impuesto================
            
            //busca codigos de impuestos
            
            var salestaxitemSearchObj = search.create({
                type: search.Type.SALES_TAX_ITEM,
                filters: arraybusquedacode,
                columns: [
                    search.createColumn({ name: "name", }),
                    search.createColumn({ name: "itemid", label: "ID de artículo" }),
                    search.createColumn({ name: "rate", label: "Tasa" }),
                    search.createColumn({ name: "country", label: "País" }),
                    //search.createColumn({name: "custrecord_4110_category", label: "Categoría"}),
                    search.createColumn({ name: "internalid", label: "ID interno" }),
                    search.createColumn({ name: "taxtype", label: "Tipo Impuesto" })
                ]
            });

            var ejecutar = salestaxitemSearchObj.run();
            var resultado = ejecutar.getRange(0, 900);
            
            
            //objcodigosMainCodes.codigos = new Array();
            for (i = 0; i < resultado.length; i++) {
                
                var tax_code = resultado[i].getValue({ name: "internalid" });
                
                
                objcodigosMainCodes[tax_code] = new Array();
                
                var objcodigos = {
                    itemid: '',
                    id: '',
                    rate: '',
                    basis: '100',
                    taxtype: '',
                }
                
                objcodigos.itemid = resultado[i].getValue({ name: "itemid" });
                objcodigos.id = resultado[i].getValue({ name: "internalid" });
                var ratecode = (resultado[i].getValue({ name: "rate" })).replace('%', '');
                objcodigos.rate = parseFloat(ratecode);
                objcodigos.basis = '100';
                
                objcodigos.taxtype = resultado[i].getText({ name: "taxtype" });
                objcodigosMainCodes[tax_code].push(objcodigos);
                
            }
            // =============Código de impuesto================
            
            objcodigosMainFull.TaxGroup = objcodigosMain;
            objcodigosMainFull.TaxCodes = objcodigosMainCodes;
            
            log.audit({ title: 'objcodigosMainFull', details: objcodigosMainFull });

            return objcodigosMainFull;

        }

        function redondeo(num) {

            if (typeof num == 'number') {
                var numfixed = num.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0];
                var numsplit = numfixed.split('.');
                if (numsplit.length > 1) {
                    if (numsplit[1].length > 2) {
                        var ultimodecimal = parseInt(numsplit[1].charAt(2));
                        var numerofinal = 0;
                        if (ultimodecimal > 5) {
                            numerofinal = num.toFixed(2);
                        } else {
                            numerofinal = num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
                        }
                        return parseFloat(numerofinal);
                    } else {
                        return num;
                    }
                } else {
                    return num;
                }
            } else {
                return num;
            }
        }

        function redondeotrucar(num) {

            if (typeof num == 'number') {
                var numfixed = num.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0];
                var numsplit = numfixed.split('.');
                if (numsplit.length > 1) {
                    if (numsplit[1].length > 2) {
                        var ultimodecimal = parseInt(numsplit[1].charAt(2));
                        var numerofinal = 0;
                        if (ultimodecimal > 4) {
                            return true;

                        } else {
                            return false;
                        }
                    } else { return false }
                } else {
                    return false
                }
            } else {
                return false
            }
        }


        function trunc(x, posiciones) {
            var s = x.toString();
            var l = s.length;
            var decimalLength = s.indexOf('.') + 1;
            var numStr = s.substr(0, decimalLength + posiciones);
            return parseFloat(numStr);
        }


        function validaLimites(jsonLinea) {
            var montoDeAjuste = 0;

            if (jsonLinea.ieps.name != '') {
                var limiteInferior = 0;
                var limiteSuperior = 0;
                var tasaOcuotaNum = (jsonLinea.ieps.rate_div).toFixed(6);
                limiteInferior = (parseFloat(jsonLinea.ieps.base_importe) - ((Math.pow(10, -2)) / 2)) * parseFloat(tasaOcuotaNum);
                limiteInferior = trunc(limiteInferior, 2);
                limiteSuperior = (parseFloat(jsonLinea.ieps.base_importe) + ((Math.pow(10, -2)) / 2) - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum);
                limiteSuperior = parseFloat(limiteSuperior.toFixed(2));

                if (parseFloat(jsonLinea.ieps.importe) < limiteInferior) {
                    montoDeAjuste = parseFloat(jsonLinea.ieps.importe) - limiteInferior;
                    jsonLinea.ieps.importe = limiteInferior.toFixed(2);
                } else if (parseFloat(jsonLinea.ieps.importe) > limiteSuperior) {
                    montoDeAjuste = parseFloat(jsonLinea.ieps.importe) - limiteSuperior;
                    jsonLinea.ieps.importe = limiteSuperior.toFixed(2);
                }

                if (jsonLinea.iva.name != '' && jsonLinea.iva.rate_div > 0) {
                    jsonLinea.iva.importe = (parseFloat(jsonLinea.iva.importe) + montoDeAjuste).toFixed(2);
                } else if (jsonLinea.retenciones.name != '') {
                    jsonLinea.retenciones.importe = (parseFloat(jsonLinea.retenciones.importe) + montoDeAjuste).toFixed(2);
                }

            }

            if (jsonLinea.retenciones.name != '') {

                var limiteInferior = 0;
                var limiteSuperior = 0;
                var tasaOcuotaNum = (jsonLinea.retenciones.rate_div).toFixed(6);
                limiteInferior = (parseFloat(jsonLinea.retenciones.base_importe) - ((Math.pow(10, -2)) / 2)) * parseFloat(tasaOcuotaNum);
                limiteInferior = trunc(limiteInferior, 2);
                limiteSuperior = (parseFloat(jsonLinea.retenciones.base_importe) + ((Math.pow(10, -2)) / 2) - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum);
                limiteSuperior = parseFloat(limiteSuperior.toFixed(2));

                if (parseFloat(jsonLinea.retenciones.importe) < limiteInferior) {
                    montoDeAjuste = parseFloat(jsonLinea.retenciones.importe) - limiteInferior;
                    jsonLinea.retenciones.importe = limiteInferior.toFixed(2);
                } else if (parseFloat(jsonLinea.retenciones.importe) > limiteSuperior) {
                    montoDeAjuste = parseFloat(jsonLinea.retenciones.importe) - limiteSuperior;
                    jsonLinea.retenciones.importe = limiteSuperior.toFixed(2);
                }

                if (jsonLinea.iva.name != '' && jsonLinea.iva.rate_div > 0) {
                    jsonLinea.iva.importe = (parseFloat(jsonLinea.iva.importe) + montoDeAjuste).toFixed(2);
                } else if (jsonLinea.retenciones.name != '') {
                    jsonLinea.retenciones.importe = (parseFloat(jsonLinea.retenciones.importe) + montoDeAjuste).toFixed(2);
                }

            }
            if (jsonLinea.iva.name != '' && jsonLinea.iva.rate_div > 0) {
                montoDeAjuste = 0;
                var limiteInferior = 0;
                var limiteSuperior = 0;
                var tasaOcuotaNum = (jsonLinea.iva.rate_div).toFixed(6);

                limiteInferior = (parseFloat(jsonLinea.iva.base_importe) - ((Math.pow(10, -2)) / 2)) * parseFloat(tasaOcuotaNum);
                limiteInferior = trunc(limiteInferior, 2);
                limiteSuperior = (parseFloat(jsonLinea.iva.base_importe) + ((Math.pow(10, -2)) / 2) - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum);
                limiteSuperior = parseFloat(limiteSuperior.toFixed(2));

                if (parseFloat(jsonLinea.iva.importe) < limiteInferior) {
                    montoDeAjuste = parseFloat(jsonLinea.iva.importe) - limiteInferior;
                    jsonLinea.iva.importe = limiteInferior.toFixed(2);
                } else if (parseFloat(jsonLinea.iva.importe) > limiteSuperior) {
                    montoDeAjuste = parseFloat(jsonLinea.iva.importe) - limiteSuperior;
                    jsonLinea.iva.importe = limiteSuperior.toFixed(2);
                }

                if (jsonLinea.ieps.name != '') {
                    jsonLinea.ieps.importe = (parseFloat(jsonLinea.ieps.importe) + montoDeAjuste).toFixed(2);
                } else if (jsonLinea.retenciones.name != '') {
                    jsonLinea.retenciones.importe = (parseFloat(jsonLinea.retenciones.importe) + montoDeAjuste).toFixed(2);
                }

            }
            return jsonLinea;

        }


        return {

            //beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit

        };

    });