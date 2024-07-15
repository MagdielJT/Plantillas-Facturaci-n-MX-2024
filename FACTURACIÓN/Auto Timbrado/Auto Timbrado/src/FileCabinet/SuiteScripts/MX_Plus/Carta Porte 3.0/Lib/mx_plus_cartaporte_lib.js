/**
 * @NApiVersion 2.1
 */
define(['N/log', 'N/record', 'N/search', '../../Utilities/EFX_FE_Lib', 'N/runtime', 'N/config'],
    /**
 * @param{log} log
 */
    (log, record, search, libCFDI, runtime, config) => {
        function addMercanciaInternacionalInfo(record_transaccion,pais_cve) {
            var data_to_return = {
                RegimenAduanero: '',
                EntradaSalidMerc: 'Salida',
                PaisOrigenDestino: '',
                ViaEntradaSalida: '01' //Este es autotransporte por eso esta hardcodeado
            }
            try {
                let reg_aduanero_str=record_transaccion.getText({
                    fieldId: "custbody_mx_plus_reg_aduanero"
                });
                data_to_return.RegimenAduanero=reg_aduanero_str.split(' - ')[0];
                data_to_return.PaisOrigenDestino=pais_cve;

                return data_to_return;

            } catch (err) {
                log.error({ title: 'Error occurred in addMercanciaInternacionalInfo', details: err });
                return data_to_return;
            }
        }
        function getFolderTimb() {
            try {
                let currenScript = runtime.getCurrentScript()
                let idFolder = currenScript.getParameter({
                    name: 'custscript_efx_fe_folder_certify'
                })
                return idFolder
            } catch (err) {
                log.error({ title: 'Error occurred in getFolderTimb', details: err });
            }
        }
        function validarObjeto(objeto) {
            for (const atributo in objeto) {
                if (!objeto[atributo]) {
                    return { success: false, msg: `El campo '${atributo}' está vacío. Favor de llenar en la pestaña de MX+ > Carta Porte` };
                }
            }
            return { success: true, msg: '' };
        }
        function isMexicanCompany() {
            try {
                var info = config.load({ type: config.Type.COMPANY_INFORMATION });
                var company_inactive = info.getValue({ fieldId: 'isinactive' });
                var company_country = info.getValue({ fieldId: 'country' });
                if (company_country == 'MX' && company_inactive == false) {
                    return true
                }

                return false

            } catch (err) {
                log.error({ title: 'Error occurred in isMexicanCompany', details: err });
            }
            return false;
        }

        function isMexicanSubsidiary(transaction_subsidiary) {
            try {
                const subsidiarySearchFilters = [
                    ['country', 'anyof', 'MX'],

                    'AND',
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['iselimination', 'is', 'F'],
                    'AND',
                    ['internalid', 'is', transaction_subsidiary],
                ];

                const subsidiarySearchColName = search.createColumn({ name: 'name', sort: search.Sort.ASC });
                const subsidiarySearchColCity = search.createColumn({ name: 'city' });
                const subsidiarySearchColState = search.createColumn({ name: 'state' });
                const subsidiarySearchColCountry = search.createColumn({ name: 'country' });
                const subsidiarySearchColCurrency = search.createColumn({ name: 'currency' });

                const subsidiarySearch = search.create({
                    type: 'subsidiary',
                    filters: subsidiarySearchFilters,
                    columns: [
                        subsidiarySearchColName,
                        subsidiarySearchColCity,
                        subsidiarySearchColState,
                        subsidiarySearchColCountry,
                        subsidiarySearchColCurrency,
                    ],
                });


                const subsidiarySearchPagedData = subsidiarySearch.runPaged({ pageSize: 1000 });
                if (subsidiarySearchPagedData.pageRanges.length > 0) {
                    return true
                }
                return false

            } catch (err) {
                log.error({ title: 'Error occurred in isMexicanSubsidiary', details: err });
                return false;
            }
        }
        function validateFields(transaction) {
            try {

                var data_fields = {
                    direccion: '',
                    distanciaRecorrida: '',
                    seguros: '',
                    unidadPeso: '',
                    vehiculo: '',
                    chofer: '',
                    FechaYHoraSalida: '',
                    FechaYHoraLlegada: '',
                }
                data_fields.direccion = transaction.getValue({
                    fieldId: 'custbody_ex_fe_cp_json_dir'
                });
                data_fields.unidadPeso = transaction.getValue({
                    fieldId: 'custbody_efx_fe_cp_unidadpeso'
                });
                data_fields.distanciaRecorrida = transaction.getValue({
                    fieldId: 'custbody_mx_plus_distanciarecorrida_cp'
                });
                data_fields.seguros = transaction.getValue({
                    fieldId: 'custbody_efx_fe_cp_seguros'
                });
                data_fields.vehiculo = transaction.getValue({
                    fieldId: 'custbody_mx_plus_autotransporte_cp'
                });
                data_fields.chofer = transaction.getValue({
                    fieldId: 'custbody_mx_plus_chofer_cp'
                });
                data_fields.FechaYHoraSalida = transaction.getValue({
                    fieldId: 'custbody_mx_plus_fechahorasalida_cp'
                });
                data_fields.FechaYHoraLlegada = transaction.getValue({
                    fieldId: 'custbody_mx_plus_fechahorallegada_cp'
                });

                var obj_valido = validarObjeto(data_fields)

                return obj_valido;


            } catch (err) {
                log.error({ title: 'Error occurred in validateFields', details: err });
            }
        }
        function fetchFiguraTransporte(id_chofer) {
            try {
                var data_return = {
                    NombreFigura: '',
                    RFCFigura: '',
                    NumLicencia: ''
                }
                var chofer_rcrd = record.load({
                    type: 'customrecord_efx_fe_cp_figuratransporte',
                    id: id_chofer,

                });
                data_return.NombreFigura = chofer_rcrd.getValue({
                    fieldId: 'name'
                });
                data_return.RFCFigura = chofer_rcrd.getValue({
                    fieldId: 'custrecord_efx_fe_cp_rfcfigura'
                });
                data_return.NumLicencia = chofer_rcrd.getValue({
                    fieldId: 'custrecord_efx_fe_cp_numlicencia'
                });

                return data_return;
            } catch (err) {
                log.error({ title: 'Error occurred in fetchFiguraTransporte', details: err });
            }
        }

        const getMercancias = (id_transaccion, es_Internacional) => {
            var data_to_return = {
                PesoBrutoTotal: 0,
                UnidadPeso: '',
                NumTotalMercancias: '',
                Mercancia: [],
                Autotransporte: {}
            };
            var record_transaccion = record.load({
                type: "itemfulfillment",
                id: id_transaccion,
                isDynamic: true,
            });
            var items_custom_object = obtenercustomobject(record_transaccion, 'itemfulfillment', '', '', id_transaccion);
            log.emergency({ title: 'items_custom_object 🐧🐧', details: items_custom_object });

            var numLinesItems = record_transaccion.getLineCount({
                sublistId: "item"
            });
            var items_id = []
            var items_quantities = []
            var peso_neto = 0
            for (let i = 0; i < numLinesItems; i++) {
                // PesoBrutoTotal= per item get peso bruto * quantity of item
                var item_quantity = record_transaccion.getSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    line: i
                });
                items_quantities.push(item_quantity);
                var item_id = record_transaccion.getSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: i
                });
                items_id.push(item_id);

            }
            // Obtiene informacion de Mercancia --> items
            var unidadPesoId = record_transaccion.getValue({
                fieldId: 'custbody_efx_fe_cp_unidadpeso'
            });
            data_to_return.UnidadPeso = getUnidadPesoConverted(unidadPesoId) + '';
            data_to_return.NumTotalMercancias = numLinesItems + '';

            log.audit({ title: 'items_id', details: items_id });
            var partialMercanciaInfo = getItemCP_Information(items_id, items_custom_object,es_Internacional);
            var contiene_materialPeligroso = false
            partialMercanciaInfo.forEach((item, index) => {
                if (item.MaterialPeligroso == 'Sí') {
                    contiene_materialPeligroso = true;
                }
                item.Cantidad = items_quantities[index] + '';
                item.CantidadTransporta = [
                    {
                        "Cantidad": items_quantities[index] + '',
                        "IDOrigen": "OR000001",
                        "IDDestino": "DE000001"
                    }
                ]
                var peso = item.PesoEnKg * item.Cantidad;
                peso_neto = parseFloat(peso_neto) + peso;
                data_to_return.PesoBrutoTotal = parseFloat(data_to_return.PesoBrutoTotal) + parseFloat(item.PesoEnKg);
            });
            data_to_return.Mercancia = partialMercanciaInfo;
            // Obtiene información de Autotransporte
            var cartaporte_json = record_transaccion.getValue({
                fieldId: 'custbody_ex_fe_cp_json_dir'
            });
            var seguro_id = record_transaccion.getValue({
                fieldId: 'custbody_efx_fe_cp_seguros'
            });
            var seguro = fetchSeguro(seguro_id);
            var autotransporte_id = record_transaccion.getValue({
                fieldId: 'custbody_mx_plus_autotransporte_cp'
            });
            var remolque_principal_id = record_transaccion.getValue({
                fieldId: 'custbody_mx_plus_remolque_principal_cp'
            });
            var remolque_secundario_id = record_transaccion.getValue({
                fieldId: 'custbody_mx_plus_remolquesecundario_cp'
            });
            var autotransporte = getAutoTransporte(cartaporte_json, peso_neto, seguro.aseguroarespcivil, seguro.polizarespcivil, autotransporte_id, remolque_principal_id, remolque_secundario_id, contiene_materialPeligroso);
            // log.audit({title:'autotransporte 🚩',details:autotransporte});
            data_to_return.Autotransporte = autotransporte;
            data_to_return.PesoBrutoTotal = parseFloat(data_to_return.PesoBrutoTotal).toFixed(2) + ''

            log.debug({ title: 'prueba de getMercancias', details: data_to_return });
            return data_to_return
        }
        const fetchSeguro = (id_seguro) => {
            try {
                var seguro_rcrd = record.load({
                    type: 'customrecord_efx_fe_cp_seguros',
                    id: id_seguro,

                });
                var aseguroarespcivil = seguro_rcrd.getValue({
                    fieldId: 'custrecord_efx_fe_cp_asegurarespcivil'
                });
                var polizarespcivil = seguro_rcrd.getValue({
                    fieldId: 'custrecord_efx_fe_cp_polizarespcivil'
                });

                return { aseguroarespcivil, polizarespcivil };

            } catch (err) {
                log.error({ title: 'Error occurred in fetchSeguro', details: err });
            }
        }
        const fetchVehiculo = (id_vehiculo, pesoVehicular) => {
            var data_to_return = {
                "PermSCT": '',
                "NumPermisoSCT": '',
                "IdentificacionVehicular": {
                    "ConfigVehicular": '',
                    "PesoBrutoVehicular": parseFloat(pesoVehicular).toFixed(2) + '',
                    "PlacaVM": '',
                    "AnioModeloVM": ''
                }

            }
            try {
                var vehiculo_rcrd = record.load({
                    type: 'customrecord_efx_fe_cp_infovehiculo',
                    id: id_vehiculo,

                });
                data_to_return.PermSCT = vehiculo_rcrd.getText({
                    fieldId: 'custrecord_efx_fe_cp_permsct'
                }).split('-')[0];
                data_to_return.NumPermisoSCT = vehiculo_rcrd.getValue({
                    fieldId: 'custrecord_efx_fe_cp_numpermisosct'
                });
                data_to_return.IdentificacionVehicular.ConfigVehicular = vehiculo_rcrd.getText({
                    fieldId: 'custrecord_efx_fe_cp_configvehicular'
                }).split('-')[0];
                data_to_return.IdentificacionVehicular.PlacaVM = vehiculo_rcrd.getValue({
                    fieldId: 'custrecord_efx_fe_cp_placavm'
                });
                data_to_return.IdentificacionVehicular.AnioModeloVM = vehiculo_rcrd.getValue({
                    fieldId: 'custrecord_efx_fe_cp_aniomodelovm'
                });

                return data_to_return;

            } catch (err) {
                log.error({ title: 'Error occurred in fetchVehiculo', details: err });
            }
        }
        const getAutoTransporte = (cartaporte_json, pesoVehicular, aseguroarespcivil, polizarespcivil, id_vehiculo, id_remolque_principal, id_remolque_secundario, contiene_materialPeligroso) => {
            try {
                var vehiculo_obj = fetchVehiculo(id_vehiculo, pesoVehicular);
                cartaporte_json = JSON.parse(cartaporte_json);
                log.emergency({ title: 'cartaporte_json ⛳', details: cartaporte_json });
                var data_to_return = {
                    "PermSCT": vehiculo_obj.PermSCT,
                    "NumPermisoSCT": vehiculo_obj.NumPermisoSCT,
                    "IdentificacionVehicular": {
                        "ConfigVehicular": vehiculo_obj.IdentificacionVehicular.ConfigVehicular,
                        "PesoBrutoVehicular": parseFloat(vehiculo_obj.IdentificacionVehicular.PesoBrutoVehicular).toFixed(2),
                        "PlacaVM": vehiculo_obj.IdentificacionVehicular.PlacaVM,
                        "AnioModeloVM": vehiculo_obj.IdentificacionVehicular.AnioModeloVM
                    },
                    "Seguros": {
                        "AseguraRespCivil": aseguroarespcivil,
                        "PolizaRespCivil": polizarespcivil,
                        "AseguraMedAmbiente": aseguroarespcivil,
                        "PolizaMedAmbiente": polizarespcivil
                    },
                    "Remolques": []
                }
                if (contiene_materialPeligroso == false) {
                    delete data_to_return.Seguros.AseguraMedAmbiente;
                    delete data_to_return.Seguros.PolizaMedAmbiente;
                }
                if (id_remolque_principal.length == 0) {
                    delete data_to_return.Remolques;
                } else {
                    var remolquePrincipal = fetchRemolque(id_remolque_principal);
                    data_to_return.Remolques[0] = remolquePrincipal;
                    log.audit({ title: 'id_remolque_secundario.length 🪼🪼🪼🪼', details: id_remolque_secundario.length });
                    if (id_remolque_secundario.length > 0) {
                        var remolque_secundario = fetchRemolque(id_remolque_secundario);
                        data_to_return.Remolques.push(remolque_secundario);
                    }

                }
                log.audit({ title: 'data_to_return.Remolques 🪼🪼', details: data_to_return.Remolques });
                // if (Object.keys(cartaporte_json.CPAutoTransporte.Remolqueuno.Remolqueuno).length === 0) {
                //     // attribute is an empty object
                // } else {
                //     var data_obj = {
                //         SubTipoRem: cartaporte_json.CPAutoTransporte.Remolqueuno.Remolqueuno.SubTipoRem,
                //         Placa: cartaporte_json.CPAutoTransporte.Remolqueuno.Remolqueuno.Placa
                //     }
                //     data_to_return.Remolques.push(data_obj)
                //     // Existe remolque 2
                //     if (Object.keys(cartaporte_json.CPAutoTransporte.Remolquedos.Remolquedos).length !== 0) {
                //         data_obj = {
                //             SubTipoRem: cartaporte_json.CPAutoTransporte.Remolquedos.Remolquedos.SubTipoRem,
                //             Placa: cartaporte_json.CPAutoTransporte.Remolquedos.Remolquedos.Placa
                //         }
                //         data_to_return.Remolques.push(data_obj)

                //     }
                // }

                return data_to_return
            } catch (err) {
                log.error({ title: 'Error occurred in getAutoTransporte', details: err });
            }
        }
        const fetchRemolque = (id_remolque) => {
            try {
                var data_to_return = {
                    SubTipoRem: '',
                    Placa: ''
                }
                var remolque_rcrd = record.load({
                    type: 'customrecord_tk_cp_remolque',
                    id: id_remolque,

                });
                data_to_return.SubTipoRem = remolque_rcrd.getText({
                    fieldId: 'custrecord_tk_cp_clave_tipo_remolque'
                }).split('-')[0];
                data_to_return.Placa = remolque_rcrd.getValue({
                    fieldId: 'custrecord_mx_plus_placas_remolque'
                });


                return data_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in fetchRemolque', details: err });
            }
        }

        const getItemCP_Information = (item_ids, arrItemCustomObject, es_Internacional) => {
            try {
                var data_to_return = [];
                var arr_items_info = [];
                const itemSearchFilters = [
                    ['internalid', search.Operator.ANYOF, item_ids],
                ];

                const itemSearchColItemId = search.createColumn({ name: 'itemid', sort: search.Sort.ASC });
                const itemSearchColInternalId = search.createColumn({ name: 'internalid' });
                const itemSearchColDisplayName = search.createColumn({ name: 'displayname' });
                const itemSearchColSalesDescription = search.createColumn({ name: 'salesdescription' });
                const itemSearchColCPUnidadDePeso = search.createColumn({ name: 'custitem_efx_fe_cp_wunit' });
                const itemSearchColCPPESOENKG = search.createColumn({ name: 'custitem_efx_fe_cp_pesokg' });
                const itemSearchColCPMaterialPeligroso = search.createColumn({ name: 'custitem_efx_fe_cp_materialpeligro' });
                const itemSearchColSATItemCode = search.createColumn({ name: 'custitem_mx_txn_item_sat_item_code' });
                const itemSearchColCustitemEfxFeCpEmbalajeClaveDeDesignacin = search.createColumn({ name: 'custrecord_efx_fe_cp_claveembalaje', join: 'custitem_efx_fe_cp_embalaje' });
                const itemSearchColCustitemEfxFeCpCvematpeligroClaveMaterialPeligroso = search.createColumn({ name: 'custrecord_efx_fe_cp_clavemat', join: 'custitem_efx_fe_cp_cvematpeligro' });
                const itemSearchColCustitemEfxFeCpTipoMateria = search.createColumn({ name: 'custrecord_mx_plus_clave_sat_tipomateria', join: 'custitem_mx_plus_tipo_materia' });
                const itemSearchColCustitemEfxFeFraccionArancelaria = search.createColumn({ name: 'custitem_efx_fe_ce_fracc_arancelaria'});


                const itemSearch = search.create({
                    type: 'item',
                    filters: itemSearchFilters,
                    columns: [
                        itemSearchColInternalId,
                        itemSearchColItemId,
                        itemSearchColDisplayName,
                        itemSearchColSalesDescription,
                        itemSearchColCPUnidadDePeso,
                        itemSearchColCPPESOENKG,
                        itemSearchColCPMaterialPeligroso,
                        itemSearchColSATItemCode,
                        itemSearchColCustitemEfxFeCpEmbalajeClaveDeDesignacin,
                        itemSearchColCustitemEfxFeCpCvematpeligroClaveMaterialPeligroso,
                        itemSearchColCustitemEfxFeCpTipoMateria,
                        itemSearchColCustitemEfxFeFraccionArancelaria
                    ],
                });


                const itemSearchPagedData = itemSearch.runPaged({ pageSize: 1000 });
                for (let i = 0; i < itemSearchPagedData.pageRanges.length; i++) {
                    const itemSearchPage = itemSearchPagedData.fetch({ index: i });
                    itemSearchPage.data.forEach((result) => {
                        const internalId = result.getValue(itemSearchColInternalId);
                        const itemId = result.getValue(itemSearchColItemId);
                        const displayName = result.getValue(itemSearchColDisplayName);
                        const salesDescription = result.getValue(itemSearchColSalesDescription);
                        const cpUnidadDePeso = result.getValue(itemSearchColCPUnidadDePeso);
                        const cppesoenkg = result.getValue(itemSearchColCPPESOENKG);
                        const cpMaterialPeligroso = result.getText(itemSearchColCPMaterialPeligroso);
                        const satItemCode = result.getText(itemSearchColSATItemCode).split(' - ')[0];
                        const cveMatPeligroso = result.getValue(itemSearchColCustitemEfxFeCpCvematpeligroClaveMaterialPeligroso);
                        const codigoEmbalaje = result.getValue(itemSearchColCustitemEfxFeCpEmbalajeClaveDeDesignacin);
                        const tipoMateria=result.getValue(itemSearchColCustitemEfxFeCpTipoMateria);
                        const fraccionArancelaria=result.getText(itemSearchColCustitemEfxFeFraccionArancelaria);

                        var data = { internalId, itemId, displayName, salesDescription, cpUnidadDePeso, cppesoenkg, cpMaterialPeligroso, satItemCode, cveMatPeligroso, codigoEmbalaje,tipoMateria ,fraccionArancelaria};
                        arr_items_info.push(data)
                    });
                }


                // Create a map to keep track of internalIds and their corresponding objects
                const idMap = new Map();

                // Populate the map with internalIds and corresponding objects
                arr_items_info.forEach(obj => {
                    idMap.set(obj.internalId, obj);
                });

                // Create a new array of objects based on the comparison array
                const newArray = item_ids.map(id => {
                    // Retrieve the corresponding object from the map
                    const obj = idMap.get(id);
                    // If object exists, return a new object with the same properties
                    if (obj) {
                        return { ...obj };
                    }
                    // If object doesn't exist, return null or handle as desired
                    return null; // or handle differently
                });
                newArray.forEach((item, index) => {
                    item.cpUnidadDePeso = arrItemCustomObject[index].satUnitCode;
                    var dataMercancia = {
                        BienesTransp: '', //Item SAT code
                        Descripcion: '',
                        ClaveUnidad: '',
                        MaterialPeligroso: '',
                        CveMaterialPeligroso: '',
                        Embalaje: '',
                        PesoEnKg: '',
                        FraccionArancelaria:'',
                        TipoMateria:''

                    }
                    dataMercancia.BienesTransp = item.satItemCode;
                    if(es_Internacional==true || es_Internacional=='T'){
                        // Si es internacional,es este valor de Bienes
                        dataMercancia.BienesTransp = '01010101';
                        dataMercancia.FraccionArancelaria=item.fraccionArancelaria;
                        dataMercancia.TipoMateria=item.tipoMateria
                    }else{
                        delete dataMercancia.FraccionArancelaria;
                        delete dataMercancia.TipoMateria;
                    }
                    dataMercancia.Descripcion = item.displayName;
                    dataMercancia.ClaveUnidad = item.cpUnidadDePeso;
                    dataMercancia.MaterialPeligroso = item.cpMaterialPeligroso;
                    if (item.cpMaterialPeligroso == 'Sí') {
                        dataMercancia.CveMaterialPeligroso = item.cveMatPeligroso;
                        dataMercancia.Embalaje = item.codigoEmbalaje
                    } else {
                        dataMercancia.BienesTransp = '01010101';
                        delete dataMercancia.CveMaterialPeligroso
                        delete dataMercancia.Embalaje
                    }
                    if (item.cppesoenkg) {

                        dataMercancia.PesoEnKg = parseFloat(parseFloat(item.cppesoenkg).toFixed(2));
                    }

                    data_to_return.push(dataMercancia)
                });
                return data_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in getItemCP_Information', details: err });
            }
        }
        const getUnidadPesoConverted = (data) => {
            try {
                var data_to_return = [];
                const customrecordEfxFeCpClaveunidadpesoSearchFilters = [
                    ['internalid', search.Operator.ANYOF, data],
                ];

                const customrecordEfxFeCpClaveunidadpesoSearchColName = search.createColumn({ name: 'name', sort: search.Sort.ASC });
                const customrecordEfxFeCpClaveunidadpesoSearchColClaveSAT = search.createColumn({ name: 'custrecord_efx_fe_cp_cup_sat' });

                const customrecordEfxFeCpClaveunidadpesoSearch = search.create({
                    type: 'customrecord_efx_fe_cp_claveunidadpeso',
                    filters: customrecordEfxFeCpClaveunidadpesoSearchFilters,
                    columns: [
                        customrecordEfxFeCpClaveunidadpesoSearchColName,
                        customrecordEfxFeCpClaveunidadpesoSearchColClaveSAT,
                    ],
                });


                const customrecordEfxFeCpClaveunidadpesoSearchPagedData = customrecordEfxFeCpClaveunidadpesoSearch.runPaged({ pageSize: 1000 });
                for (let i = 0; i < customrecordEfxFeCpClaveunidadpesoSearchPagedData.pageRanges.length; i++) {
                    const customrecordEfxFeCpClaveunidadpesoSearchPage = customrecordEfxFeCpClaveunidadpesoSearchPagedData.fetch({ index: i });
                    customrecordEfxFeCpClaveunidadpesoSearchPage.data.forEach((result) => {
                        const name = result.getValue(customrecordEfxFeCpClaveunidadpesoSearchColName);
                        const claveSAT = result.getValue(customrecordEfxFeCpClaveunidadpesoSearchColClaveSAT);
                        data_to_return.push(claveSAT)

                    });
                }
                return data_to_return;


            } catch (err) {
                log.error({ title: 'Error occurred in getUnidadPesoConverted', details: err });
            }
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
                obj_main.suiteTaxWithholdingTaxTypes = libCFDI.tiposImpuestosSuiteTax();
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

            // log.audit({title: 'arrayTiporelacionId', details: arrayTiporelacionId });

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
                    // log.audit({title: 'obj_trelacion', details: obj_trelacion });
                    arrayTiporelacionData.push(obj_trelacion);
                    return true;
                });

            }
            // log.audit({title: 'arrayTiporelacionData', details: arrayTiporelacionData });

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

            // log.audit({title: 'objmain3', details: obj_main });

            var paymentTerm = recordObj.getValue('custbody_mx_txn_sat_payment_term');
            var paymentMethod = recordObj.getValue('custbody_mx_txn_sat_payment_method');

            var cfdiUsage = recordObj.getValue('custbody_mx_cfdi_usage');


            if (esCreditMemo == 'creditmemo') {
                //var objPaymentMet = libCFDI.obtenMetodoPago(obj_main.firstRelatedCfdiTxn.paymentMethodId);
                var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod);
                if (objPaymentMet) {
                    obj_main.satcodes.paymentMethod = objPaymentMet.code;
                    obj_main.satcodes.paymentMethodName = objPaymentMet.name;
                }
                obj_main.satcodes.paymentTerm = 'PUE';
                obj_main.satcodes.paymentTermName = 'PUE - Pago en una Sola Exhibición';
            } else {
                var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod);
                var objPaymentFor = libCFDI.obtenFormaPago(paymentTerm);
                if (objPaymentMet) {
                    obj_main.satcodes.paymentMethod = objPaymentMet.code;
                    obj_main.satcodes.paymentMethodName = objPaymentMet.name;
                }
                if (objPaymentFor) {
                    obj_main.satcodes.paymentTerm = objPaymentFor.code;
                    obj_main.satcodes.paymentTermName = objPaymentFor.name;
                }
            }

            var objUsoCfdi = libCFDI.obtenUsoCfdi(cfdiUsage);
            if (objUsoCfdi) {
                obj_main.satcodes.cfdiUsage = objUsoCfdi.code;
                obj_main.satcodes.cfdiUsageName = objUsoCfdi.name;
            }
            obj_main.satcodes.proofType = libCFDI.tipoCFDI(recordObj.type);

            var lineCount = recordObj.getLineCount({
                sublistId: 'item',
            });

            obj_main = libCFDI.libreriaArticulos(obj_main, recordObj, lineCount, tipo_transaccion_gbl);
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
                    // log.audit({title: 'idUnidades', details: idUnidades });
                    // log.audit({title: 'articulos.itemId', details: articulos.itemId });
                    // log.audit({title: 'articulos.units', details: articulos.units });
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
                // log.audit('filtrosArray', filtrosArray);
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
                // log.audit('buscaUnidades', buscaUnidades);
                var ejecuta = buscaUnidades.run()

                // log.audit('ejecuta', ejecuta);

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
                    // log.audit('data', data);
                    return true;
                });

                // log.audit('data', data);
                return data;


            }

            // log.debug('obj_main preitems :', obj_main);
            obj_main.items.map(function (articulo) {
                detallesDeImpuesto(articulo);
            });

            // satCodesDao.fetchSatTaxFactorTypeForAllPushed();
            // satCodesDao.fetchSatTaxCodesForAllPushed();
            //satCodesDao.fetchSatUnitCodesForAllPushed();
            if (tipo_transaccion != 'customerpayment') {
                obj_main.satcodes.unitCodes = obtieneUnidadesMedidaSAT(Object.keys(clavesdeUnidad));

                // log.debug('obj_main result :', obj_main);
                codigosSatArticulos(obj_main.items, obj_main.satcodes, obj_main.itemIdUnitTypeMap);

            }
            //fin attachmaping

            obj_main.summary = libCFDI.summaryData(obj_main);
            // this._attachSatMappingData(result);
            //new summaryCalc.TransactionSummary().summarize(obj_main);


            //result.satcodes = satCodesDao.getJson();
            //crear relacionado en el pago
            if (tipo_transaccion == 'customerpayment') {
                // var payment = pagodata.obtenerDatos(recordObj, obj_main, obj_main.satCodesDao);
                // log.debug('payment: ',JSON.stringify(payment));
                obj_main.appliedTxns = libCFDI.pagoData(recordObj, obj_main, 'apply', id_transaccion, importeotramoneda);
                // log.debug('result.appliedTxns: ', JSON.stringify(obj_main.appliedTxns));
            }

            //
            obj_main.satCodesDao = null;
            // log.debug('Custom Datasource result: ', JSON.stringify(obj_main));

            return obj_main.items;
        }

        return { addMercanciaInternacionalInfo,getFolderTimb, getMercancias, fetchFiguraTransporte, validateFields, isMexicanSubsidiary, isMexicanCompany }

    });