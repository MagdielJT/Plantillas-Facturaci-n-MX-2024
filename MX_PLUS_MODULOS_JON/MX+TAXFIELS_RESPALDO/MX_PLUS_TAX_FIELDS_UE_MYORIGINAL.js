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
                    isDynamic: true
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
                var descuento_cabecera_text = record_transaccion.getText({ fieldId: 'discountrate' });
                var descuento_cabecera_value = record_transaccion.getValue({ fieldId: 'discountrate' });
                log.audit({ title: 'descuento_cabecera_text 🦖🦖', details: descuento_cabecera_text });
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
                    // log.audit({title:'linea de articulo:',details:index});
                    // Tipo de artículo si es articulo de descuento o si es un articulo de ajuste de timbrado
                    // Articulo de ajuste de timbrado queda PENDIENTE
                    var tipo_articulo = record_transaccion.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype',
                    });
                    log.audit({ title: 'tipo_articulo', details: tipo_articulo });
                    // Considerar cuando el articulo tiene impuesto Local lineas 323-330 PENDIENTE
                    // Entra caso de articulo que es descuento
                    var linea_monto_descuento = 0;
                    var linea_monto_sin_impuesto = 0;
                    if (tipo_articulo == 'Discount') {
                        linea_monto_descuento += record_transaccion.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'grossamt',
                        });
                        linea_monto_sin_impuesto += record_transaccion.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',

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
                    obj_Json_Tax.descuentoSinImpuesto = linea_monto_sin_impuesto.toFixed(2);
                    // OBTENCION DE MONTO LINEA
                    obj_Json_Tax.montoLinea = importe_amount+'';
                    // OBTENCION DE IMPUESTOLINEA
                    obj_Json_Tax.impuestoLinea = tax_amount+'';
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
                        obj_Json_Tax.iva.name=tax_name;
                        obj_Json_Tax.iva.id=tax_id;
                        obj_Json_Tax.iva.rate=parseFloat(tax_rate);
                        obj_Json_Tax.iva.base=tax_base;
                        obj_Json_Tax.iva.base_importe=parseFloat((obj_Json_Tax.montoLinea-obj_Json_Tax.descuentoSinImpuesto).toFixed(2))+'';
                        obj_Json_Tax.iva.rate_div=obj_Json_Tax.iva.rate/100;
                        obj_Json_Tax.iva.importe=parseFloat((obj_Json_Tax.iva.rate_div*obj_Json_Tax.iva.base_importe).toFixed(2))+'';
                        obj_Json_Tax.iva.descuento=obj_Json_Tax.descuentoSinImpuesto+'';
    
                        log.audit({ title: 'obj_Json_Tax 🪼🪼', details: obj_Json_Tax });
                    }
                    


                }
                log.audit({ title: 'total_descuento_linea_sin_impuesto 🦀', details: total_descuento_linea_sin_impuesto });
                log.audit({ title: 'total_descuento_linea_sin_impuesto 🦀🦀', details: total_descuento_linea_sin_impuesto.toFixed(2) });
            }
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

        return { afterSubmit }

    });