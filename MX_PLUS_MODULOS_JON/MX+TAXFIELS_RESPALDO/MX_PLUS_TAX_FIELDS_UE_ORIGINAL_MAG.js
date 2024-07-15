/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/log'],
    /**
 * @param{log} log
 */
    (record, search, runtime, log) => {

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            var record_actual = scriptContext.newRecord;
            var record_Tipo = record_actual.type;
            var subsidiariaTransaccion = '';
            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
            var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });

            var nexo = '';

            if (record_Tipo == 'invoice') {
                var record_transaccion = record.load({
                    type: record_Tipo,
                    id: record_actual.id,
                    isDynamic: false
                });
                if (SUBSIDIARIES) {
                    subsidiariaTransaccion = record_transaccion.getValue({ fieldId: 'subsidiary' });
                    nexo = record_transaccion.getValue({ fieldId: 'nexus_country' });
                }
                var desglose_config = busca_desglose_impuestos();
                if (!existeSuiteTax) {
                    var objImpuestos = obtenObjImpuesto(subsidiariaTransaccion, nexo);
                }
                log.audit({ title: 'Desglose Impuestos', details: desglose_config });
                // Inicia conteo de articulos
                var conteo_lineas = record_transaccion.getLineCount({ sublistId: 'item' });

                var total_descuento_linea = 0;
                var total_descuento_cabecera = 0;
                var total_descuento_linea_sin_impuesto = 0;
                var descuento_cabecera = record_transaccion.getValue({ fieldId: 'discounttotal' });
                var total_transaccion = record_transaccion.getValue({ fieldId: 'total' });
                var total_costo_envio = record_transaccion.getValue({ fieldId: 'altshippingcost' });
                var descuento_cabecera_text = record_transaccion.getText({ fieldId: 'discountrate' });
                var descuento_cabecera_value = record_transaccion.getValue({ fieldId: 'discountrate' });
                log.audit({ title: 'descuento_cabecera_text 🦖🦖', details: descuento_cabecera_text });
                var global_centavos_pendientes = 0;
                var arr_items = [];
                var obj_tax_transaccion = {
                    total_netsuite: 0,
                    agregar_centavos: 0,
                    importe_traslados: 0,
                    base_traslados: 0,
                    shipping_cost: 0,
                    shipping_tax: 0,
                    shipping_tax_rate: 0,
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
                    descuento: 0
                }
                var articulo_descuento_pendiente = 0;
                log.audit({ title: 'conteo_lineas 🐧🐧🐧', details: conteo_lineas });

                for (let index = 0; index < conteo_lineas; index++) {
                    var obj_Json_Tax = {
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
                            base_importe_aux: 0,
                            importe: 0,
                            importe_aux: 0,
                            rate_div: 0,
                            descuento: 0,
                            limiteInferior: 0,
                            limiteSuperior: 0,
                            ajuste_centavos: false
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
                        impuestoLineaCalculados: 0,
                        centavos_pendientes: 0
                    }
                    // log.audit({title:'linea de articulo:',details:index});
                    // Tipo de artículo si es articulo de descuento o si es un articulo de ajuste de timbrado
                    // Articulo de ajuste de timbrado queda PENDIENTE
                    var tipo_articulo = record_transaccion.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype',
                        line: index
                    });
                    log.audit({ title: 'tipo_articulo', details: tipo_articulo });
                    // Considerar cuando el articulo tiene impuesto Local lineas 323-330 PENDIENTE
                    // Entra caso de articulo que es descuento
                    var linea_monto_descuento = 0;
                    var linea_monto_sin_impuesto = 0;
                    if (tipo_articulo == 'Discount') {
                        linea_monto_descuento += record_transaccion.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'grossamt',
                            line: index
                        });
                        linea_monto_sin_impuesto += record_transaccion.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: index

                        });
                    }

                    // Empieza obtencion de cantidades con y sin impuesto
                    var importe_amount = record_transaccion.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: index
                    });

                    var tax_amount = record_transaccion.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        line: index
                    });
                    if (!existeSuiteTax) {
                        var tax_code = record_transaccion.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'taxcode',
                            line: index
                        });
                    }
                    log.audit({ title: 'importe_amount', details: importe_amount });
                    log.audit({ title: 'descuento_cabecera', details: descuento_cabecera });
                    log.audit({ title: 'descuento_cabecera_value 🕸️🕸️🕸️', details: descuento_cabecera_value });
                    var es_desc_porcentaje = descuento_cabecera_text.includes('%');
                    // Si es descuento de cabecera de porcentaje --> se aplica ese descuento a todos los articulos de la transaccion
                    if (descuento_cabecera_text.includes('%')) {

                        linea_monto_sin_impuesto += parseFloat((((descuento_cabecera_value * (-1)) * importe_amount) / 100).toFixed(4));



                    } else {
                        // Si es descuento de cabecera de monto --> se aplica solo al primer artículo
                        if (index == 0) {
                            // Se suma porque el valor de descuento ya tiene el negativo
                            linea_monto_sin_impuesto += parseFloat(importe_amount + descuento_cabecera_value)
                        }
                    }
                    total_descuento_linea += (linea_monto_descuento);
                    total_descuento_linea_sin_impuesto += (linea_monto_sin_impuesto);
                    obj_Json_Tax.descuentoConImpuesto = linea_monto_descuento;
                    obj_Json_Tax.descuentoSinImpuesto = linea_monto_sin_impuesto;

                    // obj_Json_Tax.descuentoSinImpuesto = linea_monto_sin_impuesto.toFixed(2);
                    // OBTENCION DE MONTO LINEA
                    obj_Json_Tax.montoLinea = importe_amount + '';

                    obj_tax_transaccion.subtotal += importe_amount;
                    if (importe_amount > 0) {
                        obj_tax_transaccion.subtotal_gbl += importe_amount;
                    }

                    var grupo_impuestos = true;
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
                    // INICIA CALCULO DE IVA POR ARTICULO
                    for (var x = 0; x < tax_lines_count; x++) {
                        if (existeSuiteTax) {
                            // FALTA CASO DE SUITETAX DECLARAR ESTA VARIABLE
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
                            } else {
                                var tax_name = objImpuestos.TaxCodes[tax_code][x].itemid;
                                var tax_id = objImpuestos.TaxCodes[tax_code][x].id;
                                var tax_rate = objImpuestos.TaxCodes[tax_code][x].rate;
                                var tax_base = '100';
                            }
                        }
                        obj_Json_Tax.iva.name = tax_name;
                        obj_Json_Tax.iva.id = tax_id;
                        obj_Json_Tax.iva.rate = parseFloat(tax_rate);
                        obj_Json_Tax.iva.base = tax_base;
                        if (!es_desc_porcentaje) {
                            if (index > 0) {

                                obj_Json_Tax.iva.base_importe = importe_amount + '';
                            } else {

                                obj_Json_Tax.iva.base_importe = obj_Json_Tax.descuentoSinImpuesto + '';
                                obj_Json_Tax.iva.descuento = parseFloat((obj_Json_Tax.montoLinea - obj_Json_Tax.descuentoSinImpuesto).toFixed(2)) + '';
                            }
                        } else {
                            log.audit({ title: 'obj_Json_Tax.montoLinea', details: obj_Json_Tax.montoLinea });
                            log.audit({ title: 'obj_Json_Tax.descuentoSinImpuesto', details: obj_Json_Tax.descuentoSinImpuesto });
                            // obj_Json_Tax.iva.base_importe = parseFloat((obj_Json_Tax.montoLinea - obj_Json_Tax.descuentoSinImpuesto)) + '';
                            // OLD VERSION worked by 0.1 difference

                            obj_Json_Tax.iva.base_importe = parseFloat((obj_Json_Tax.montoLinea - obj_Json_Tax.descuentoSinImpuesto).toFixed(2)) + '';
                            obj_Json_Tax.iva.base_importe_aux = parseFloat((obj_Json_Tax.montoLinea - obj_Json_Tax.descuentoSinImpuesto)) + '';

                            obj_Json_Tax.iva.descuento = obj_Json_Tax.descuentoSinImpuesto.toFixed(2) + '';

                        }
                        obj_Json_Tax.iva.rate_div = obj_Json_Tax.iva.rate / 100;
                        log.audit({ title: 'linea_monto_sin_impuesto', details: linea_monto_sin_impuesto });
                        // if(!es_desc_porcentaje){

                        obj_Json_Tax.iva.importe = parseFloat((obj_Json_Tax.iva.rate_div * parseFloat(obj_Json_Tax.iva.base_importe)).toFixed(2));
                        obj_Json_Tax.iva.importe_aux = parseFloat((obj_Json_Tax.iva.rate_div * parseFloat(obj_Json_Tax.iva.base_importe_aux)));
                        // obj_Json_Tax.iva.importe = obj_Json_Tax.iva.rate_div * parseFloat(obj_Json_Tax.iva.base_importe);
                        // obj_tax_transaccion.importe_traslados += parseFloat(obj_Json_Tax.iva.importe);
                        obj_tax_transaccion.importe_traslados += parseFloat(obj_Json_Tax.iva.importe_aux);

                        // }else{
                        //     log.audit({title:'obj_Json_Tax.iva.base_importe',details:obj_Json_Tax.iva.base_importe});

                        //     obj_Json_Tax.iva.importe =parseFloat((obj_Json_Tax.iva.rate_div * parseFloat(obj_Json_Tax.iva.base_importe)).toFixed(3)).toFixed(2) + '';
                        // }
                        obj_tax_transaccion.base_traslados += parseFloat(obj_Json_Tax.iva.base_importe);
                        // OBTENCION DE IMPUESTOLINEA
                        obj_Json_Tax.impuestoLinea = Math.floor((parseFloat(obj_Json_Tax.descuentoSinImpuesto) + parseFloat(obj_Json_Tax.iva.importe)) * 100) / 100;
                        // Seteo de obj tax json global para descuentos
                        obj_tax_transaccion.descuento += parseFloat(obj_Json_Tax.iva.descuento);
                        // AJUSTE DE DECIMALES PARA TOTAL DEBE SER A 2 DECIMALES PARA NETSUITE
                        // obj_Json_Tax.iva.importe=parseFloat(obj_Json_Tax.iva.importe.toFixed(2));
                        // obj_Json_Tax.iva.base_importe=parseFloat(parseFloat(obj_Json_Tax.iva.base_importe).toFixed(2));

                        obj_tax_transaccion.total += parseFloat(obj_Json_Tax.iva.base_importe) + parseFloat(obj_Json_Tax.iva.importe)
                        // ultima iteracion
                        if (index == conteo_lineas - 1) {
                            if (total_costo_envio > 0) {
                                obj_tax_transaccion.total += total_costo_envio;
                                obj_tax_transaccion.shipping_cost = total_costo_envio;
                                obj_tax_transaccion.shipping_tax = record_transaccion.getValue({ fieldId: 'shippingtax1amt' });
                                obj_tax_transaccion.shipping_tax_rate = record_transaccion.getValue({ fieldId: 'shippingtax1rate' });
                                obj_tax_transaccion.total += parseFloat(obj_tax_transaccion.shipping_tax);
                                obj_tax_transaccion.subtotal_gbl += parseFloat(obj_tax_transaccion.shipping_cost);
                                if (obj_tax_transaccion.shipping_tax_rate != '0') {

                                    obj_tax_transaccion.base_traslados += parseFloat(obj_tax_transaccion.shipping_cost);
                                }
                                obj_tax_transaccion.importe_traslados += parseFloat(obj_tax_transaccion.shipping_tax);

                            }
                            // log.audit({title:'typeof obj_tax_transaccion.total ⛳🐧',details:typeof obj_tax_transaccion.total});
                            // if(typeof obj_tax_transaccion.total!='string'){

                            obj_tax_transaccion.total = parseFloat(obj_tax_transaccion.total.toFixed(2));
                            // }
                            obj_tax_transaccion.subtotal_gbl = parseFloat(obj_tax_transaccion.subtotal_gbl.toFixed(2));
                            if (obj_tax_transaccion.descuento > 0) {
                                obj_tax_transaccion.descuento = parseFloat(obj_tax_transaccion.descuento.toFixed(2));
                                log.audit({ title: 'total_descuento_linea_sin_impuesto ultima iteración de articulo🐋', details: total_descuento_linea_sin_impuesto.toFixed(2) });
                                var descuento_netsuite = parseFloat(total_descuento_linea_sin_impuesto.toFixed(2));

                                if (descuento_netsuite !== obj_tax_transaccion.descuento) {
                                    log.debug({ title: 'Entra a ajuste de centavos de descuento en ultimo articulo', details: 'true' });
                                    // Aquí el descuento total de netsuite y el calculado no cuadran, por lo que al ultimo artículo se le agregará la diferencia de centavos
                                    var descuentos_a_agregar = parseFloat((descuento_netsuite - obj_tax_transaccion.descuento).toFixed(2));
                                    log.audit({ title: 'descuentos_a_agregar', details: descuentos_a_agregar });
                                    if (descuentos_a_agregar > 0) {

                                        // porque puede haber una linea con articulo de descuento
                                        obj_Json_Tax.descuentoSinImpuesto += descuentos_a_agregar;
                                        obj_Json_Tax.iva.descuento = parseFloat((parseFloat(obj_Json_Tax.iva.descuento) + descuentos_a_agregar).toFixed(2));
                                        obj_Json_Tax.iva.base_importe -= descuentos_a_agregar;
                                        var aux_iva_importe = parseFloat((obj_Json_Tax.iva.rate_div * parseFloat(obj_Json_Tax.iva.base_importe)).toFixed(2));
                                        // Agrega solo diferencia de centavos
                                        var old_impuestos_traslados = parseFloat(obj_tax_transaccion.importe_traslados.toFixed(2));
                                        log.audit({ title: 'obj_tax_transaccion.importe_traslados ❇️❇️antes', details: old_impuestos_traslados });
                                        obj_tax_transaccion.importe_traslados = parseFloat(obj_tax_transaccion.importe_traslados.toFixed(2)) + parseFloat(parseFloat(obj_Json_Tax.iva.importe.toFixed(2)) - parseFloat(aux_iva_importe.toFixed(2)));
                                        log.audit({ title: 'obj_tax_transaccion.importe_traslados ❇️después', details: obj_tax_transaccion.importe_traslados });
                                        obj_Json_Tax.iva.importe = parseFloat((obj_Json_Tax.iva.rate_div * parseFloat(obj_Json_Tax.iva.base_importe)).toFixed(2));
                                        log.audit({ title: 'obj_Json_Tax.iva.importe', details: obj_Json_Tax.iva.importe });

                                        obj_tax_transaccion.base_traslados -= descuentos_a_agregar;
                                        obj_tax_transaccion.descuento += descuentos_a_agregar;
                                        obj_tax_transaccion.descuento = parseFloat(obj_tax_transaccion.descuento.toFixed(2));
                                    } else {
                                        articulo_descuento_pendiente = descuentos_a_agregar;
                                    }





                                }
                            }
                            obj_tax_transaccion.total_netsuite = total_transaccion;
                            log.audit({ title: 'total_transaccion', details: total_transaccion });
                            log.audit({ title: 'obj_tax_transaccion.total', details: obj_tax_transaccion.total });


                            if (total_transaccion != obj_tax_transaccion.total) {
                                if (total_transaccion > obj_tax_transaccion.total) {
                                    var dentro_limites = esta_dentro_limite(obj_Json_Tax);
                                    log.emergency({ title: 'dentro_limites', details: dentro_limites });
                                    if (dentro_limites) {
                                        log.debug({ title: 'entran a ajuste de decimales', details: 'ajuste' });

                                        // agrega un decimal a total y a algun importe de impuestos de traslados
                                        obj_tax_transaccion.total += 0.01;
                                        obj_tax_transaccion.importe_traslados += 0.01;
                                        obj_Json_Tax.iva.importe += 0.01;
                                    }
                                    if (old_impuestos_traslados) {
                                        if (old_impuestos_traslados < obj_tax_transaccion.importe_traslados) {
                                            var agrega_centavos = parseFloat((obj_tax_transaccion.importe_traslados - old_impuestos_traslados).toFixed(2));
                                            // Cuantos centavos le faltan al impuesto para cuadrarse
                                            log.audit({ title: 'agrega_centavos 🚩', details: agrega_centavos });
                                            obj_tax_transaccion.agregar_centavos = agrega_centavos;
                                            global_centavos_pendientes = agrega_centavos;
                                        }
                                    }

                                } else if (total_transaccion < obj_tax_transaccion.total) {
                                    obj_tax_transaccion.total -= 0.01;
                                    obj_Json_Tax.iva.importe -= 0.01;
                                    obj_tax_transaccion.importe_traslados -= 0.01;

                                }

                            }


                            log.audit({ title: 'obj_tax_transaccion.importe_traslados 🦀🦀', details: obj_tax_transaccion.importe_traslados });
                            log.audit({ title: 'obj_tax_transaccion.total 🦖', details: obj_tax_transaccion.total });
                            log.audit({ title: 'obj_tax_transaccion.subtotal 🦖', details: obj_tax_transaccion.subtotal });
                            log.audit({ title: 'obj_tax_transaccion.descuento 🦖', details: obj_tax_transaccion.descuento });
                            log.audit({ title: 'obj_tax_transaccion.shipping_cost 🦖', details: obj_tax_transaccion.shipping_cost });
                            obj_tax_transaccion.totalTraslados += parseFloat(((obj_tax_transaccion.total_netsuite - obj_tax_transaccion.subtotal) + obj_tax_transaccion.descuento - obj_tax_transaccion.shipping_cost).toFixed(2));
                            log.audit({ title: 'obj_tax_transaccion.totalTraslados 🌟', details: obj_tax_transaccion.totalTraslados });
                        }
                        obj_Json_Tax = validaLimites(obj_Json_Tax);
                        arr_items.push(obj_Json_Tax);
                        log.audit({ title: 'global_centavos_pendientes', details: global_centavos_pendientes });

                        log.audit({ title: 'obj_Json_Tax 🪼🪼', details: obj_Json_Tax });
                        // record_transaccion.setSublistValue({
                        //     sublistId: 'item',
                        //     fieldId: 'custcol_efx_fe_tax_json',
                        //     line: index,
                        //     value: JSON.stringify(obj_Json_Tax),
                        // });
                    }



                }
                var tiene_ajuste = false;
                var sumatoria_importes = 0;
                if (arr_items.length > 0) {
                    arr_items.forEach((item, index_arr) => {
                        if (global_centavos_pendientes > 0) {
                            if (item.iva.ajuste_centavos == true) {
                                log.emergency({ title: 'agregaaaa centavoooos', details: item.iva });
                                item.iva.importe += 0.01;
                                log.emergency({ title: 'agregaaaa centavoooos despues', details: item.iva });
                                item.iva.ajuste_centavos = false;
                                global_centavos_pendientes -= 0.01;
                                tiene_ajuste = true;

                            }
                        }
                        sumatoria_importes = parseFloat(sumatoria_importes.toFixed(2)) + parseFloat(item.iva.importe.toFixed(2));
                        record_transaccion.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_tax_json',
                            line: index_arr,
                            value: JSON.stringify(item),
                        });
                    })
                }
                sumatoria_importes += parseFloat(parseFloat(obj_tax_transaccion.shipping_tax).toFixed(2));
                log.audit({ title: 'sumatoria_importes 🐧', details: sumatoria_importes });
                if (sumatoria_importes < obj_tax_transaccion.totalTraslados) {
                    var centavos_restantes = parseFloat(obj_tax_transaccion.totalTraslados.toFixed(2)) - parseFloat(sumatoria_importes.toFixed(2));
                    log.audit({ title: 'centavos_restantes 🐧🐧', details: centavos_restantes });
                    if (arr_items.length > 0) {
                        arr_items.forEach((item, index_arr) => {
                            if (parseFloat(centavos_restantes.toFixed(2)) > 0) {
                                if (item.iva.ajuste_centavos == true) {
                                    log.emergency({ title: 'agregaaaa centavoooos segundo recorrido', details: item.iva });
                                    item.iva.importe += 0.01;
                                    item.iva.ajuste_centavos = false;
                                    log.emergency({ title: 'agregaaaa centavoooos despues en segundo recorrido', details: item.iva });
                                    centavos_restantes = parseFloat(centavos_restantes.toFixed(2)) - 0.01;
                                    log.audit({ title: 'centavos_restantes después de -0.01 🐧🐧', details: centavos_restantes });
                                    tiene_ajuste = true;
                                }
                            }
                            sumatoria_importes += parseFloat(item.iva.importe.toFixed(2));
                            record_transaccion.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_efx_fe_tax_json',
                                line: index_arr,
                                value: JSON.stringify(item),
                            });
                        })
                    }
                }
                if (!tiene_ajuste) {
                    record_transaccion.setValue({
                        fieldId: 'custbody_mx_plus_articulo_ajuste',
                        value: 'Requiere agregar un artículo de descuento de: $' + agrega_centavos,
                        ignoreFieldChange: false
                    });
                } else {
                    record_transaccion.setValue({
                        fieldId: 'custbody_mx_plus_articulo_ajuste',
                        value: '',
                        ignoreFieldChange: false
                    });
                }
                log.audit({ title: 'total_descuento_linea_sin_impuesto 🦀', details: total_descuento_linea_sin_impuesto });
                log.audit({ title: 'total_descuento_linea_sin_impuesto 🦀🦀', details: total_descuento_linea_sin_impuesto.toFixed(2) });

                obj_tax_transaccion.importe_traslados = parseFloat(obj_tax_transaccion.importe_traslados.toFixed(2));
                obj_tax_transaccion.total_gbl = (obj_tax_transaccion.subtotal_gbl - obj_tax_transaccion.descuento + obj_tax_transaccion.importe_traslados).toFixed(2);
                obj_tax_transaccion.total = obj_tax_transaccion.total.toFixed(2);
                obj_tax_transaccion.base_traslados = obj_tax_transaccion.base_traslados.toFixed(2);
                log.audit({ title: 'TAX JSON GLOBAL', details: obj_tax_transaccion });
                record_transaccion.setValue({
                    fieldId: 'custbody_efx_fe_tax_json',
                    value: JSON.stringify(obj_tax_transaccion),
                    ignoreFieldChange: true
                });
                record_transaccion.save({ enableSourcing: false, ignoreMandatoryFields: true });

            }
        }
        function esta_dentro_limite(jsonLinea) {
            try {
                if (jsonLinea.iva.name != '' && jsonLinea.iva.rate_div > 0) {
                    var limiteInferior = 0;
                    var limiteSuperior = 0;
                    var tasaOcuotaNum = (jsonLinea.iva.rate_div).toFixed(6);

                    limiteInferior = (parseFloat(jsonLinea.iva.base_importe) - ((Math.pow(10, -2)) / 2)) * parseFloat(tasaOcuotaNum);
                    limiteInferior = trunc(limiteInferior, 2);
                    limiteSuperior = (parseFloat(jsonLinea.iva.base_importe) + (Math.pow(10, -2)) / 2 - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum);
                    limiteSuperior = parseFloat(limiteSuperior.toFixed(2));
                    jsonLinea.iva.limiteInferior = limiteInferior;
                    jsonLinea.iva.limiteSuperior = limiteSuperior;

                    if (jsonLinea.iva.importe < limiteSuperior) {
                        log.emergency({ title: 'candidato a que se le agregue un centavo', details: 'TRUE' });
                        // candidato a que se le agregue un centavo
                        return true;
                    }
                    return false;


                }

            } catch (err) {
                log.error({ title: 'Error occurred in esta_dentro_limite', details: err });
            }
        }
        function validaLimites(jsonLinea) {
            var montoDeAjuste = 0;

            // if (jsonLinea.ieps.name != '') {
            //     var limiteInferior = 0;
            //     var limiteSuperior = 0;
            //     var tasaOcuotaNum = (jsonLinea.ieps.rate_div).toFixed(6);
            //     limiteInferior = (parseFloat(jsonLinea.ieps.base_importe) - ((Math.pow(10, -2)) / 2)) * parseFloat(tasaOcuotaNum);
            //     limiteInferior = trunc(limiteInferior, 2);
            //     limiteSuperior = (parseFloat(jsonLinea.ieps.base_importe) + ((Math.pow(10, -2)) / 2) - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum);
            //     limiteSuperior = parseFloat(limiteSuperior.toFixed(2));

            //     if (parseFloat(jsonLinea.ieps.importe) < limiteInferior) {
            //         montoDeAjuste = parseFloat(jsonLinea.ieps.importe) - limiteInferior;
            //         jsonLinea.ieps.importe = limiteInferior.toFixed(2);
            //     } else if (parseFloat(jsonLinea.ieps.importe) > limiteSuperior) {
            //         montoDeAjuste = parseFloat(jsonLinea.ieps.importe) - limiteSuperior;
            //         jsonLinea.ieps.importe = limiteSuperior.toFixed(2);
            //     }

            //     if (jsonLinea.iva.name != '' && jsonLinea.iva.rate_div > 0) {
            //         jsonLinea.iva.importe = (parseFloat(jsonLinea.iva.importe) + montoDeAjuste).toFixed(2);
            //     } else if (jsonLinea.retenciones.name != '') {
            //         jsonLinea.retenciones.importe = (parseFloat(jsonLinea.retenciones.importe) + montoDeAjuste).toFixed(2);
            //     }

            // }

            // if (jsonLinea.retenciones.name != '') {

            //     var limiteInferior = 0;
            //     var limiteSuperior = 0;
            //     var tasaOcuotaNum = (jsonLinea.retenciones.rate_div).toFixed(6);
            //     limiteInferior = (parseFloat(jsonLinea.retenciones.base_importe) - ((Math.pow(10, -2)) / 2)) * parseFloat(tasaOcuotaNum);
            //     limiteInferior = trunc(limiteInferior, 2);
            //     limiteSuperior = (parseFloat(jsonLinea.retenciones.base_importe) + ((Math.pow(10, -2)) / 2) - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum);
            //     limiteSuperior = parseFloat(limiteSuperior.toFixed(2));

            //     if (parseFloat(jsonLinea.retenciones.importe) < limiteInferior) {
            //         montoDeAjuste = parseFloat(jsonLinea.retenciones.importe) - limiteInferior;
            //         jsonLinea.retenciones.importe = limiteInferior.toFixed(2);
            //     } else if (parseFloat(jsonLinea.retenciones.importe) > limiteSuperior) {
            //         montoDeAjuste = parseFloat(jsonLinea.retenciones.importe) - limiteSuperior;
            //         jsonLinea.retenciones.importe = limiteSuperior.toFixed(2);
            //     }

            //     if (jsonLinea.iva.name != '' && jsonLinea.iva.rate_div > 0) {
            //         jsonLinea.iva.importe = (parseFloat(jsonLinea.iva.importe) + montoDeAjuste).toFixed(2);
            //     } else if (jsonLinea.retenciones.name != '') {
            //         jsonLinea.retenciones.importe = (parseFloat(jsonLinea.retenciones.importe) + montoDeAjuste).toFixed(2);
            //     }

            // }
            if (jsonLinea.iva.name != '' && jsonLinea.iva.rate_div > 0) {
                montoDeAjuste = 0;
                var limiteInferior = 0;
                var limiteSuperior = 0;
                var tasaOcuotaNum = (jsonLinea.iva.rate_div).toFixed(6);

                limiteInferior = (parseFloat(jsonLinea.iva.base_importe) - ((Math.pow(10, -2)) / 2)) * parseFloat(tasaOcuotaNum);
                limiteInferior = trunc(limiteInferior, 2);
                limiteSuperior = (parseFloat(jsonLinea.iva.base_importe) + (Math.pow(10, -2)) / 2 - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum);
                limiteSuperior = parseFloat(limiteSuperior.toFixed(2));
                jsonLinea.iva.limiteInferior = limiteInferior;
                jsonLinea.iva.limiteSuperior = limiteSuperior;

                if (jsonLinea.iva.importe < limiteSuperior) {
                    log.emergency({ title: 'candidato a que se le agregue un centavo', details: 'TRUE' });
                    // candidato a que se le agregue un centavo
                    jsonLinea.iva.ajuste_centavos = true;
                }

                // if (parseFloat(jsonLinea.iva.importe) < limiteInferior) {
                //     montoDeAjuste = parseFloat(jsonLinea.iva.importe) - limiteInferior;
                //     jsonLinea.iva.importe = limiteInferior.toFixed(2);
                // } else if (parseFloat(jsonLinea.iva.importe) > limiteSuperior) {
                //     montoDeAjuste = parseFloat(jsonLinea.iva.importe) - limiteSuperior;
                //     jsonLinea.iva.importe = limiteSuperior.toFixed(2);
                // }

                // if (jsonLinea.ieps.name != '') {
                //     jsonLinea.ieps.importe = (parseFloat(jsonLinea.ieps.importe) + montoDeAjuste).toFixed(2);
                // } else if (jsonLinea.retenciones.name != '') {
                //     jsonLinea.retenciones.importe = (parseFloat(jsonLinea.retenciones.importe) + montoDeAjuste).toFixed(2);
                // }

            }
            return jsonLinea;

        }
        const obtenObjImpuesto = (subsidiariaTransaccion, nexo) => {
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

            objcodigosMainFull.TaxGroup = objcodigosMain;
            objcodigosMainFull.TaxCodes = objcodigosMainCodes;

            log.audit({ title: 'objcodigosMainFull', details: objcodigosMainFull });

            return objcodigosMainFull;
        }
        const busca_desglose_impuestos = () => {
            var dataToReturn = {
                config_ieps: '',
                config_retencion: '',
                config_local: '',
                config_iva: '',
                config_exento: ''
            }

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

            dataToReturn.config_ieps = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_ieps' })).split(',');
            dataToReturn.config_retencion = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_ret' })).split(',');
            dataToReturn.config_local = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_locales' })).split(',');
            dataToReturn.config_iva = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_iva' })).split(',');
            dataToReturn.config_exento = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_exento' })).split(',');
            return dataToReturn
        }
        function trunc(x, posiciones) {
            var s = x.toString();
            var l = s.length;
            var decimalLength = s.indexOf('.') + 1;
            var numStr = s.substr(0, decimalLength + posiciones);
            return parseFloat(numStr);
        }
        return { afterSubmit }

    });
