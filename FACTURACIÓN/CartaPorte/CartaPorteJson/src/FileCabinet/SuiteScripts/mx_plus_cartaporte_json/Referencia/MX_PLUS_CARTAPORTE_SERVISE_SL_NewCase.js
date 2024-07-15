/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
  'N/https',
  'N/log',
  'N/record',
  'N/format',
  'N/search',
  'N/currency',
  'N/config',
  'N/runtime',
  '../../Utilities/EFX_FE_Lib',
  'N/crypto/random',
  '../Lib/mx_plus_cartaporte_lib',
  'N/xml',
  'N/file'
], /**
 * @param{log} log
 */
(https, log, record, format, search, modcurrency, config, runtime, libCFDI, crypto, cartaporte_lib, xml, file) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  function convertToMexicoCityTime(date) {
    // Adjust the date to Mexico City timezone (UTC-5 for Central Daylight Time)
    var mexicoCityOffset = -5 * 60 // Mexico City is UTC-5
    var localOffset = date.getTimezoneOffset()
    var targetOffset = mexicoCityOffset - localOffset
    var targetTime = date.getTime() + targetOffset * 60 * 1000

    // Create a new Date object with the converted time
    var mexicoCityDate = new Date(targetTime)

    return mexicoCityDate
  }
  const onRequest = scriptContext => {
    try {
      var request = scriptContext.request
      var params = request.parameters
      var id_transaccion = params.id
      log.audit({ title: 'params', details: params })
      log.audit({ title: 'typeof params', details: typeof params })
      log.audit({ title: 'params.record_Tipo', details: params.record_Tipo })
      var record_transaccion = record.load({
        type: params.record_Tipo,
        id: params.id,
        isDynamic: true
      })
      var campos_llenos = cartaporte_lib.validateFields(record_transaccion)
      if (!campos_llenos.success) {
        scriptContext.response.write({ output: JSON.stringify(campos_llenos) })
        return
      }
      // Se extre una parte del folio
      var Serie_json = record_transaccion.getValue({ fieldId: 'tranid' }).substring(0, 3)
      log.audit({ title: 'Serie🛹', details: Serie_json })
      // Se crea objeto que guarda los codigos de impuesto del sat
      var items_custom_object = obtenercustomobject(record_transaccion, params.record_Tipo, '', '', record_transaccion.id)
      log.emergency({ title: 'items_custom_object 🐝', details: items_custom_object })
      // Se GENERA EL IdCCP
      var IdCCP = generaIdccp()
      var obj_json_cp = {
        Version: '4.0',
        Serie: '',
        Folio: '',
        Fecha: '',
        SubTotal: '0',
        Moneda: '',
        Total: '0',
        TipoDeComprobante: 'T',
        Exportacion: '01',
        LugarExpedicion: '',
        Emisor: {
          Rfc: '',
          Nombre: '',
          RegimenFiscal: '601'
        },
        Receptor: {
          Rfc: '',
          Nombre: '',
          DomicilioFiscalReceptor: '',
          RegimenFiscalReceptor: '',
          UsoCFDI: ''
        },
        Conceptos: [],
        Complemento: {
          Any: [
            {
              'cartaporte30:CartaPorte': {
                Version: '3.0',
                IdCCP: IdCCP,
                TranspInternac: 'No',
                TotalDistRec: '',
                Ubicaciones: [
                  {
                    TipoUbicacion: 'Origen',
                    IDUbicacion: 'OR000001',
                    RFCRemitenteDestinatario: '',
                    NombreRemitenteDestinatario: '',
                    FechaHoraSalidaLlegada: '',
                    Domicilio: {
                      Calle: '',
                      NumeroExterior: '',
                      NumeroInterior: '',
                      Colonia: '',
                      Localidad: '',
                      Referencia: '',
                      Municipio: '',
                      Estado: '',
                      Pais: '',
                      CodigoPostal: ''
                    }
                  },
                  {
                    TipoUbicacion: 'Destino',
                    IDUbicacion: 'DE000001',
                    RFCRemitenteDestinatario: '',
                    NombreRemitenteDestinatario: '',
                    FechaHoraSalidaLlegada: '2023-08-01T00:00:',
                    DistanciaRecorrida: '',
                    Domicilio: {
                      Calle: '',
                      NumeroExterior: '',
                      NumeroInterior: '',
                      Colonia: '',
                      Localidad: '',
                      Referencia: '',
                      Municipio: '',
                      Estado: '',
                      Pais: '',
                      CodigoPostal: ''
                    }
                  }
                ],
                Mercancias: {},
                FiguraTransporte: [
                  {
                    TipoFigura: '',
                    NombreFigura: '',
                    RFCFigura: '',
                    NumLicencia: ''
                  }
                ]
              }
            }
          ]
        }
      }
      // ==============DATOS DE CABECERA==============
      // Se coloca la serie
      obj_json_cp.Serie = Serie_json
      // Se coloca el folio
      obj_json_cp.Folio = record_transaccion.getValue({ fieldId: 'tranid' }).substring(3)
      // Se crea una fecha y hora y se le da formato
      // var FechaCabecera = new Date();
      // var formattedDate = format.format({
      //     value: FechaCabecera,
      //     type: format.Type.DATE,
      // });
      // var customFormat = formattedDate.split('/');
      // var fechaHora = customFormat[2] + '-' + customFormat[1] + '-' + customFormat[0] + 'T' + record_transaccion.getValue({ fieldId: 'custbody_efx_fe_actual_hour' });
      // obj_json_cp.Fecha = fechaHora;

      const currentDate = new Date()
      const offset = -6 // Mexico City timezone offset from UTC in hours
      const offsetSign = offset > 0 ? '-' : '+'
      const absOffset = Math.abs(offset)
      const offsetHours = String(Math.floor(absOffset)).padStart(2, '0')
      const offsetMinutes = String((absOffset % 1) * 60).padStart(2, '0')
      const timezone = `${offsetSign}${offsetHours}:${offsetMinutes}`

      const formattedDate2 = currentDate.toISOString().slice(0, 19) + timezone
      obj_json_cp.Fecha = formattedDate2
      // log.emergency({ title: 'hora🦀', details: fechaHora });
      // Se coloca la moneda
      obj_json_cp.Moneda = record_transaccion.getValue({ fieldId: 'currencycode' })
      if (obj_json_cp.Moneda === 'MXN') {
        obj_json_cp.Moneda = 'XXX'
      }
      // Se extraen los datos de la subsidiaria
      // TODO:REV PARA CUANDO SEA ONEWORD
      subsidiaries_id = record_transaccion.getValue({ fieldId: 'subsidiary' })
      var obj_subsidiaria = record.load({
        type: record.Type.SUBSIDIARY,
        id: subsidiaries_id
      })
      var subsi_direcc = obj_subsidiaria.getSubrecord({ fieldId: 'mainaddress' })
      var zipsubsidiary = subsi_direcc.getValue({ fieldId: 'zip' })
      log.audit({ title: 'zip', details: zipsubsidiary })
      // Se coloca el Codigo Postal
      obj_json_cp.LugarExpedicion = zipsubsidiary
      // ===============DATOS DE EMISOR==============
      // Se coloca el RFC
      var rfcEmisor = obj_subsidiaria.getValue({ fieldId: 'federalidnumber' })
      log.audit({ title: 'rfcEmisor', details: rfcEmisor })
      obj_json_cp.Emisor.Rfc = rfcEmisor
      // Se coloca el nombre
      obj_json_cp.Emisor.Nombre = obj_subsidiaria.getValue({ fieldId: 'custrecord_mx_sat_registered_name' })
      var regFisEmi_id = obj_subsidiaria.getValue({ fieldId: 'custrecord_mx_sat_industry_type' })
      if (regFisEmi_id) {
        var regfiscalObj = record.load({
          type: 'customrecord_mx_sat_industry_type',
          id: regFisEmi_id
        })
        obj_json_cp.Emisor.RegimenFiscal = regfiscalObj.getValue({ fieldId: 'custrecord_mx_sat_it_code' })
      }
      log.audit({ title: 'nombreEmisor🦀', details: obj_json_cp.Emisor.RegimenFiscal })
      // ==============DATOS DE RESEPTOR==============
      if (record_transaccion.getValue({ fieldId: 'ordertype' }) == 'SalesOrd' || record_transaccion.getValue({ fieldId: 'ordertype' })) {
        obj_json_cp.Receptor.Rfc = obj_subsidiaria.getValue({ fieldId: 'federalidnumber' })
        log.audit({ title: 'RFC reseptor 👌', details: obj_json_cp.Receptor.Rfc })
        obj_json_cp.Receptor.Nombre = obj_subsidiaria.getValue({ fieldId: 'custrecord_mx_sat_registered_name' })
        log.audit({ title: 'NombreResep 🎶', details: obj_json_cp.Receptor.Nombre })
        obj_json_cp.Receptor.DomicilioFiscalReceptor = subsi_direcc.getValue({ fieldId: 'zip' })
        log.audit({ title: 'DomiFisResep ♣️', details: obj_json_cp.Receptor.DomicilioFiscalReceptor })
        // Es de pruebas
        if (obj_json_cp.Receptor.Rfc === 'EKU9003173C9') {
          obj_json_cp.Receptor.DomicilioFiscalReceptor = '42501'
        }
        if (regFisEmi_id) {
          obj_json_cp.Receptor.RegimenFiscalReceptor = regfiscalObj.getValue({ fieldId: 'custrecord_mx_sat_it_code' })
        }
        log.audit({ title: 'RegfisResep ♣️♣️', details: obj_json_cp.Receptor.RegimenFiscalReceptor })
        obj_json_cp.Receptor.UsoCFDI = record_transaccion.getText({ fieldId: 'custbody_mx_cfdi_usage' }).substring(0, 4).trim()
        log.audit({ title: 'UsoCfdiResep ♣️♣️♣️', details: obj_json_cp.Receptor.UsoCFDI })
      } else {
        log.audit({ title: 'fallo👌👌', details: 'Juas juas' })
      }
      // ================== Datos de conceptos ==================
      var line_count = record_transaccion.getLineCount({ sublistId: 'item' })
      log.audit({ title: 'line_count 💀💀', details: line_count })

      for (let i = 0; i < line_count; i++) {
        // se crea un arreglo para guardar los datos de cada concepto del item
        var obj_data_conceptos = {
          ClaveProdServ: '',
          NoIdentificacion: '',
          Cantidad: '',
          ClaveUnidad: '',
          Unidad: '',
          Descripcion: '',
          ValorUnitario: '',
          Importe: '',
          ObjetoImp: ''
        }
        // Se busca el articulo para extraer la clave de de producto de servicio
        var articulo_id = record_transaccion.getSublistValue({
          sublistId: 'item',
          fieldId: 'item',
          line: i
        })
        // Se usa un try para condición, se usa para saber si es un INVENTORY_ITEM o un ASSEMBLY_ITEM
        try {
          var articulo = record.load({
            // type: 'lotnumberedassemblyitem',
            type: record.Type.INVENTORY_ITEM,
            id: articulo_id
          })
        } catch (err) {
          log.debug({ title: 'Assembly item', details: err })
          var articulo = record.load({
            type: record.Type.ASSEMBLY_ITEM,
            id: articulo_id
          })
        }
        var claveProducto_id = articulo.getValue({ fieldId: 'custitem_mx_txn_item_sat_item_code' })
        log.audit({
          title: 'PRUEBA DE ERROR☠️☠️',
          details: claveProducto_id
        })
        var claveProducto = fetchClaveProdServ(claveProducto_id)
        obj_data_conceptos.ClaveProdServ = claveProducto
        // Se busca el numero de identificación desde el articulo
        var noIden = articulo.getValue({
          fieldId: 'upccode',
          line: i
        })
        obj_data_conceptos.NoIdentificacion = noIden
        // Se coloca la cantidad
        var qty = record_transaccion.getSublistValue({
          sublistId: 'item',
          fieldId: 'quantity',
          line: i
        })
        obj_data_conceptos.Descripcion = record_transaccion.getSublistValue({
          sublistId: 'item',
          fieldId: 'description',
          line: i
        })
        obj_data_conceptos.Cantidad = qty + ''
        // Se coloca clave de unidad
        claveUnidad = items_custom_object[i].satUnitCode
        obj_data_conceptos.ClaveUnidad = claveUnidad
        // Se coloca la unidad del articulo
        obj_data_conceptos.Unidad = articulo.getValue({ fieldId: 'unitstype' })
        // Se colocan los datos de descripcion del articulo
        // obj_data_conceptos.Descripcion = record_transaccion.getValue({ fieldId: 'description' });
        // Se coloca el valor unitario
        obj_data_conceptos.ValorUnitario = '0.00'
        // Se coloca el importe
        obj_data_conceptos.Importe = '0.00'
        // Se coloca el objeto de impuesto 01 por que no tiene impuestos
        obj_data_conceptos.ObjetoImp = '01'
        obj_json_cp.Conceptos.push(obj_data_conceptos)
      }
      // log.audit({ title: 'Conceptos ☠️☠️☠️☠️', obj_data_conceptos });
      // ========================== DATOS COMPLEMENTO CARTA PORTE ==========================
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].RFCRemitenteDestinatario = obj_subsidiaria.getValue({ fieldId: 'federalidnumber' })
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].NombreRemitenteDestinatario = obj_subsidiaria.getValue({
        fieldId: 'custrecord_mx_sat_registered_name'
      })
      // REV SE COLOCA LA FECHA Y HORA DE ENVIO
      var fecha_hora_salida = record_transaccion.getValue({ fieldId: 'custbody_mx_plus_fechahorasalida_cp' })
      var date_salida = new Date(fecha_hora_salida)
      var mexico_city_date_salida = convertToMexicoCityTime(date_salida)
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].FechaHoraSalidaLlegada = mexico_city_date_salida.toISOString().slice(0, 16)
      // Se coloca la calle
      var JsonDirecciones = record_transaccion.getValue({ fieldId: 'custbody_ex_fe_cp_json_dir' }) || ''
      var JsonDirecciones_Parse = JSON.parse(JsonDirecciones)
      log.audit({ title: 'Jso🦀', details: JsonDirecciones })
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.Calle = JsonDirecciones_Parse.emisor.Calle
      // Se coloca el numero NumeroExterior
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.NumeroExterior = JsonDirecciones_Parse.emisor.NumeroExterior
      // Se coloca el numero NumeroInterior
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.NumeroInterior = JsonDirecciones_Parse.emisor.NumeroInterior
      if (Object.keys(obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.NumeroInterior).length === 0) {
        delete obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.NumeroInterior
      }
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.Colonia = JsonDirecciones_Parse.emisor.Colonia
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.Localidad = JsonDirecciones_Parse.emisor.Localidad
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.Referencia = JsonDirecciones_Parse.emisor.Referencia
      if (Object.keys(obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.Referencia).length === 0) {
        delete obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.Referencia
      }
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.Municipio = JsonDirecciones_Parse.emisor.Municipio
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.Estado = JsonDirecciones_Parse.emisor.Estado
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.Pais = JsonDirecciones_Parse.emisor.Pais
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[0].Domicilio.CodigoPostal = JsonDirecciones_Parse.emisor.CodigoPostal
      // ========================== datos receptor ==========================
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].RFCRemitenteDestinatario = JsonDirecciones_Parse.receptor.Rfc
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].NombreRemitenteDestinatario = JsonDirecciones_Parse.receptor.Nombre
      var fecha_hora_llegada = record_transaccion.getValue({ fieldId: 'custbody_mx_plus_fechahorallegada_cp' })
      var date = new Date(fecha_hora_llegada)
      var mexico_city_date = convertToMexicoCityTime(date)
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].FechaHoraSalidaLlegada = mexico_city_date.toISOString().slice(0, 16)
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].DistanciaRecorrida = record_transaccion.getValue({
        fieldId: 'custbody_mx_plus_distanciarecorrida_cp'
      })
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].TotalDistRec = obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].DistanciaRecorrida
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.Calle = JsonDirecciones_Parse.receptor.Calle
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.NumeroExterior = JsonDirecciones_Parse.receptor.NumeroExterior
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.NumeroInterior = JsonDirecciones_Parse.receptor.NumeroInterior
      if (Object.keys(obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.NumeroInterior).length === 0) {
        delete obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.NumeroInterior
      }
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.Colonia = JsonDirecciones_Parse.receptor.Colonia
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.Localidad = JsonDirecciones_Parse.receptor.Localidad
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.Referencia = JsonDirecciones_Parse.receptor.Referencia
      if (Object.keys(obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.Referencia).length === 0) {
        delete obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.Referencia
      }
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.Municipio = JsonDirecciones_Parse.receptor.Municipio
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.Estado = JsonDirecciones_Parse.receptor.Estado
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.Pais = JsonDirecciones_Parse.receptor.Pais
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Ubicaciones[1].Domicilio.CodigoPostal = JsonDirecciones_Parse.receptor.CodigoPostal
      // ========================== MERCANCIAS ==========================
      // log.audit({ title: 'cartaporte_lib.getMercancias(params.id)', details: cartaporte_lib.getMercancias(params.id) });
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].Mercancias = cartaporte_lib.getMercancias(params.id)
      // ========================== FIGURA TRANSPORTE ==========================
      var id_figura_transporte = record_transaccion.getValue({
        fieldId: 'custbody_mx_plus_chofer_cp'
      })
      var datos_chofer = cartaporte_lib.fetchFiguraTransporte(id_figura_transporte)
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].FiguraTransporte[0].TipoFigura = '01'
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].FiguraTransporte[0].NombreFigura = datos_chofer.NombreFigura
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].FiguraTransporte[0].RFCFigura = datos_chofer.RFCFigura
      obj_json_cp.Complemento.Any[0]['cartaporte30:CartaPorte'].FiguraTransporte[0].NumLicencia = datos_chofer.NumLicencia
      log.audit({ title: 'JSON LIMPIO 🛹🛹🛹', details: JSON.stringify(obj_json_cp) })
      var datosPac = dataPac(obj_json_cp, id_transaccion, record_transaccion.getValue({ fieldId: 'tranid' }))
      log.audit({ title: 'datosPac 🐣🐣', details: datosPac })
      scriptContext.response.write({ output: JSON.stringify(datosPac) })
    } catch (err) {
      log.emergency({ title: 'Error occurred in onRequest', details: err })
    }

    // var scriptObj = runtime.getCurrentScript();
  }

  const fetchClaveProdServ = itemCode => {
    try {
      var record_claveProdServ = record.load({
        type: 'customrecord_mx_sat_item_code_mirror',
        id: itemCode
      })
      var value = record_claveProdServ.getValue({
        fieldId: 'custrecord_mx_ic_mr_code'
      })
      return value
    } catch (err) {
      log.error({ title: 'Error occurred in fetchClaveProdServ', details: err })
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
        rfc: ''
      },
      itemIdUnitTypeMap: {},
      firstRelatedCfdiTxn: {},
      relatedCfdis: {
        types: [],
        cfdis: {}
      },
      billaddr: {
        countrycode: ''
      },
      loggedUserName: '',
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
        industryType: '',
        industryTypeName: '',
        paymentTerm: '',
        paymentTermName: '',
        paymentMethod: '',
        paymentMethodName: '',
        cfdiUsage: '',
        cfdiUsageName: '',
        proofType: '',
        taxFactorTypes: {},
        unitCodes: {}
      }
    }

    var recordObj = recordObjrecord

    var lineCount = recordObj.getLineCount({
      sublistId: 'item'
    })
    var importeotramoneda = recordObj.getValue({
      fieldId: 'custbody_efx_fe_importe'
    })

    obj_main.multiCurrencyFeature = runtime.isFeatureInEffect({ feature: 'multicurrency' })
    obj_main.oneWorldFeature = runtime.isFeatureInEffect({ feature: 'subsidiaries' })
    obj_main.suiteTaxFeature = runtime.isFeatureInEffect({ feature: 'tax_overhauling' })
    obj_main.loggedUserName = runtime.getCurrentUser().name
    //pendiente, probar con suitetax
    if (obj_main.suiteTaxFeature) {
      obj_main.suiteTaxWithholdingTaxTypes = libCFDI.tiposImpuestosSuiteTax()
    }

    if (tipo_transaccion != 'customerpayment' && tipo_transaccion != 'itemfulfillment') {
      var subRecord_bill = recordObj.getSubrecord({
        fieldId: 'billingaddress'
      })
      obj_main.billaddr.countrycode = subRecord_bill.getValue('country')
    }

    //company info
    var registroCompania
    if (obj_main.suiteTaxFeature && obj_main.oneWorldFeature) {
      registroCompania = record.load({
        type: record.Type.SUBSIDIARY,
        id: recordObj.getValue('subsidiary')
      })
      var lineCount = registroCompania.getLineCount({
        sublistId: 'taxregistration'
      })

      var pais = ''
      for (var i = 0; i < lineCount; i++) {
        pais = registroCompania.getSublistValue({
          sublistId: 'taxregistration',
          fieldId: 'nexuscountry',
          line: i
        })
        if (pais === 'MX') {
          obj_main.companyInfo.rfc = registroCompania.getSublistValue({
            sublistId: 'taxregistration',
            fieldId: 'taxregistrationnumber',
            line: i
          })
          break
        }
      }
    } else if (obj_main.suiteTaxFeature) {
      registroCompania = config.load({
        type: config.Type.COMPANY_INFORMATION
      })

      var lineCount = registroCompania.getLineCount({
        sublistId: 'taxregistration'
      })
      var pais = ''
      for (var i = 0; i < lineCount; i++) {
        pais = registroCompania.getSublistValue({
          sublistId: 'taxregistration',
          fieldId: 'nexuscountry',
          line: i
        })
        if (pais === 'MX') {
          obj_main.companyInfo.rfc = registroCompania.getSublistValue({
            sublistId: 'taxregistration',
            fieldId: 'taxregistrationnumber',
            line: i
          })
          break
        }
      }
    } else if (obj_main.oneWorldFeature) {
      registroCompania = record.load({
        type: record.Type.SUBSIDIARY,
        id: recordObj.getValue('subsidiary')
      })
      obj_main.companyInfo.rfc = registroCompania.getValue('federalidnumber')
    } else {
      registroCompania = config.load({
        type: config.Type.COMPANY_INFORMATION
      })
      obj_main.companyInfo.rfc = registroCompania.getValue('employerid')
    }

    if (registroCompania) {
      var idIndustria = registroCompania.getValue('custrecord_mx_sat_industry_type')
      var campos = search.lookupFields({
        id: idIndustria,
        type: 'customrecord_mx_sat_industry_type',
        columns: ['custrecord_mx_sat_it_code', 'name']
      })

      var objIdT = {
        code: campos['custrecord_mx_sat_it_code'],
        name: campos.name
      }
      obj_main.satcodes.industryType = objIdT.code
      obj_main.satcodes.industryTypeName = objIdT.name
    }

    //inicia cfdirelationtypeinfo

    var lineCount = recordObj.getLineCount({
      sublistId: 'recmachcustrecord_mx_rcs_orig_trans'
    })

    var relacionCFDI = {}
    var internalId = ''
    var tipoRelacion = ''
    var textoRelT = ''
    var primerRelacionadoCFDI = ''
    var arrayTiporelacionId = new Array()
    var arrayTiporelacionData = new Array()

    for (var p = 0; p < lineCount; p++) {
      var idOriginTran = recordObj.getSublistValue({
        sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
        fieldId: 'custrecord_mx_rcs_rel_type',
        line: p
      })
      arrayTiporelacionId.push(idOriginTran)
    }

    log.audit({ title: 'arrayTiporelacionId', details: arrayTiporelacionId })

    if (arrayTiporelacionId.length > 0) {
      var tipodeRelacionSearch = search.create({
        type: 'customrecord_mx_sat_rel_type',
        filters: [['internalid', search.Operator.ANYOF, arrayTiporelacionId]],
        columns: [search.createColumn({ name: 'internalid' }), search.createColumn({ name: 'custrecord_mx_sat_rel_type_code' })]
      })
      tipodeRelacionSearch.run().each(function (result) {
        var obj_trelacion = {
          id: '',
          tiporelacion: ''
        }
        obj_trelacion.id = result.getValue({ name: 'internalid' })
        obj_trelacion.tiporelacion = result.getValue({ name: 'custrecord_mx_sat_rel_type_code' })
        log.audit({ title: 'obj_trelacion', details: obj_trelacion })
        arrayTiporelacionData.push(obj_trelacion)
        return true
      })
    }
    log.audit({ title: 'arrayTiporelacionData', details: arrayTiporelacionData })

    for (var p = 0; p < lineCount; p++) {
      internalId =
        recordObj.getSublistValue({
          sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
          fieldId: 'custrecord_mx_rcs_rel_cfdi',
          line: p
        }) + ''
      if (p == 0) {
        primerRelacionadoCFDI = internalId
      }
      var idOriginTran = recordObj.getSublistValue({
        sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
        fieldId: 'custrecord_mx_rcs_rel_type',
        line: p
      })

      if (idOriginTran) {
        for (var tr = 0; tr < arrayTiporelacionData.length; tr++) {
          if (arrayTiporelacionData[tr].id == idOriginTran) {
            tipoRelacion = arrayTiporelacionData[tr].tiporelacion
          }
        }
      }

      textoRelT = relacionCFDI[tipoRelacion]
      if (!textoRelT) {
        obj_main.relatedCfdis.types.push(tipoRelacion)
        obj_main.relatedCfdis.cfdis['k' + (obj_main.relatedCfdis.types.length - 1)] = [{ index: p }]
        relacionCFDI[tipoRelacion] = obj_main.relatedCfdis.types.length
      } else {
        obj_main.relatedCfdis.cfdis['k' + (textoRelT - 1)].push({ index: p })
      }
    }
    var esCreditMemo = recordObj.type

    if (esCreditMemo == 'creditmemo' && primerRelacionadoCFDI) {
      var primerCFDIRelacionado = search.lookupFields({
        type: 'transaction',
        columns: ['custbody_mx_txn_sat_payment_method'],
        id: primerRelacionadoCFDI
      })
      var paymentMethod = primerCFDIRelacionado['custbody_mx_txn_sat_payment_method']
      if (paymentMethod && paymentMethod[0]) {
        obj_main.firstRelatedCfdiTxn.paymentMethodId = paymentMethod[0].value
      }
    }

    var descuentototal = recordObj.getValue('discounttotal')

    if (descuentototal) {
      obj_main.summary.bodyDiscount = Math.abs(descuentototal)
    } else {
      obj_main.summary.bodyDiscount = 0.0
    }

    log.audit({ title: 'objmain3', details: obj_main })

    var paymentTerm = recordObj.getValue('custbody_mx_txn_sat_payment_term')
    var paymentMethod = recordObj.getValue('custbody_mx_txn_sat_payment_method')

    var cfdiUsage = recordObj.getValue('custbody_mx_cfdi_usage')

    if (esCreditMemo == 'creditmemo') {
      //var objPaymentMet = libCFDI.obtenMetodoPago(obj_main.firstRelatedCfdiTxn.paymentMethodId);
      var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod)
      if (objPaymentMet) {
        obj_main.satcodes.paymentMethod = objPaymentMet.code
        obj_main.satcodes.paymentMethodName = objPaymentMet.name
      }
      obj_main.satcodes.paymentTerm = 'PUE'
      obj_main.satcodes.paymentTermName = 'PUE - Pago en una Sola Exhibición'
    } else {
      var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod)
      var objPaymentFor = libCFDI.obtenFormaPago(paymentTerm)
      if (objPaymentMet) {
        obj_main.satcodes.paymentMethod = objPaymentMet.code
        obj_main.satcodes.paymentMethodName = objPaymentMet.name
      }
      if (objPaymentFor) {
        obj_main.satcodes.paymentTerm = objPaymentFor.code
        obj_main.satcodes.paymentTermName = objPaymentFor.name
      }
    }

    var objUsoCfdi = libCFDI.obtenUsoCfdi(cfdiUsage)
    if (objUsoCfdi) {
      obj_main.satcodes.cfdiUsage = objUsoCfdi.code
      obj_main.satcodes.cfdiUsageName = objUsoCfdi.name
    }
    obj_main.satcodes.proofType = libCFDI.tipoCFDI(recordObj.type)

    var lineCount = recordObj.getLineCount({
      sublistId: 'item'
    })

    obj_main = libCFDI.libreriaArticulos(obj_main, recordObj, lineCount, tipo_transaccion_gbl)
    var articulosId = []
    obj_main.items.map(function (articuloMap) {
      articulosId.push(articuloMap.itemId)
      articuloMap.parts.map(function (partes) {
        articulosId.push(partes.itemId)
      })
    })
    if (tipo_transaccion != 'customerpayment') {
      var tipodeUnidad = search.create({
        type: 'item',
        filters: [['internalid', 'anyof', articulosId]],
        columns: ['unitstype']
      })

      tipodeUnidad.run().each(function (result) {
        var unittypemap = result.getValue('unitstype')

        obj_main.itemIdUnitTypeMap['k' + result.id] = result.getValue('unitstype')

        return true
      })
    }

    //attatchsatmapping

    // var satCodesDao = obj_main.satCodesDao;
    var clavesdeUnidad = {}

    function detallesDeImpuesto(articulo) {
      tieneItemParte(articulo)
      if (tipo_transaccion == 'creditmemo' && articulo.custcol_efx_fe_gbl_originunits) {
        clavesdeUnidad[articulo.custcol_efx_fe_gbl_originunits] = true
      } else {
        clavesdeUnidad[articulo.units] = true
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
          detallesDeImpuesto(parte)
        })
      }
    }

    function codigosSatArticulos(items, codigosSat, idUnidades) {
      if (!items) {
        return
      }
      var objCodes
      items.map(function (articulos) {
        codigosSatArticulos(articulos.parts, codigosSat, idUnidades)
        log.audit({ title: 'idUnidades', details: idUnidades })
        log.audit({ title: 'articulos.itemId', details: articulos.itemId })
        log.audit({ title: 'articulos.units', details: articulos.units })
        if (tipo_transaccion == 'creditmemo' && articulos.custcol_efx_fe_gbl_originunits) {
          objCodes = codigosSat.unitCodes['k' + idUnidades['k' + articulos.itemId] + '_' + articulos.custcol_efx_fe_gbl_originunits]
        } else {
          objCodes = codigosSat.unitCodes['k' + idUnidades['k' + articulos.itemId] + '_' + articulos.units]
        }

        articulos.satUnitCode = objCodes ? objCodes.code : ''
        articulos.taxes.taxItems.map(function (lineaImpuesto) {
          if (obj_main.suiteTaxFeature) {
            objCodes = codigosSat.taxFactorTypes[lineaImpuesto.satTaxCodeKey]
            lineaImpuesto.taxFactorType = objCodes ? objCodes.code : ''
          } else {
            lineaImpuesto.taxFactorType = lineaImpuesto.exempt ? 'Exento' : 'Tasa'
          }

          objCodes = codigosSat.taxTypes['k' + lineaImpuesto.taxType]
          lineaImpuesto.satTaxCode = objCodes ? objCodes.code : ''
        })
        articulos.taxes.whTaxItems.map(function (lineaImpuesto) {
          lineaImpuesto.taxFactorType = 'Tasa'
          objCodes = codigosSat.whTaxTypes['k' + lineaImpuesto.taxType]
          lineaImpuesto.satTaxCode = objCodes ? objCodes.code : ''
        })
      })
    }

    function obtieneUnidadesMedidaSAT(idUnidades) {
      log.audit('idUnidades', idUnidades)
      var filtrosArray = new Array()
      var buscaUnidades = search.load({
        id: 'customsearch_mx_mapping_search'
      })
      filtrosArray.push(['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[0]])
      for (var i = 1; i < idUnidades.length; i++) {
        filtrosArray.push('OR', ['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[i]])
      }
      log.audit('filtrosArray', filtrosArray)
      if (filtrosArray.length === 0) {
        return {}
      }

      buscaUnidades.filterExpression = [
        ['custrecord_mx_mapper_keyvalue_category.scriptid', 'is', ['sat_unit_code']],
        'and',
        ['custrecord_mx_mapper_keyvalue_rectype', 'is', ['unitstype']],
        'and',
        ['custrecord_mx_mapper_keyvalue_subrectype', 'is', ['uom']],
        'and',
        [filtrosArray]
      ]
      log.audit('buscaUnidades', buscaUnidades)
      var ejecuta = buscaUnidades.run()

      log.audit('ejecuta', ejecuta)

      var data = {}
      ejecuta.each(function (mapping) {
        var detalle = {}
        detalle.code = mapping.getValue({
          name: 'custrecord_mx_mapper_value_inreport',
          join: 'custrecord_mx_mapper_keyvalue_value'
        })
        detalle.name = mapping.getValue({
          name: 'name',
          join: 'custrecord_mx_mapper_keyvalue_value'
        })
        var key = mapping.getValue({
          name: 'custrecord_mx_mapper_keyvalue_key'
        })
        var subkey = mapping.getValue({
          name: 'custrecord_mx_mapper_keyvalue_subkey'
        })
        var claveid = 'k' + key
        if (subkey) {
          claveid = claveid + '_' + subkey
        }
        data[claveid] = detalle
        log.audit('data', data)
        return true
      })

      log.audit('data', data)
      return data
    }

    log.debug('obj_main preitems :', obj_main)
    obj_main.items.map(function (articulo) {
      detallesDeImpuesto(articulo)
    })

    // satCodesDao.fetchSatTaxFactorTypeForAllPushed();
    // satCodesDao.fetchSatTaxCodesForAllPushed();
    //satCodesDao.fetchSatUnitCodesForAllPushed();
    if (tipo_transaccion != 'customerpayment') {
      obj_main.satcodes.unitCodes = obtieneUnidadesMedidaSAT(Object.keys(clavesdeUnidad))

      log.debug('obj_main result :', obj_main)
      codigosSatArticulos(obj_main.items, obj_main.satcodes, obj_main.itemIdUnitTypeMap)
    }
    //fin attachmaping

    obj_main.summary = libCFDI.summaryData(obj_main)
    // this._attachSatMappingData(result);
    //new summaryCalc.TransactionSummary().summarize(obj_main);

    //result.satcodes = satCodesDao.getJson();
    //crear relacionado en el pago
    if (tipo_transaccion == 'customerpayment') {
      // var payment = pagodata.obtenerDatos(recordObj, obj_main, obj_main.satCodesDao);
      // log.debug('payment: ',JSON.stringify(payment));
      obj_main.appliedTxns = libCFDI.pagoData(recordObj, obj_main, 'apply', id_transaccion, importeotramoneda)
      log.debug('result.appliedTxns: ', JSON.stringify(obj_main.appliedTxns))
    }

    //
    obj_main.satCodesDao = null
    log.debug('Custom Datasource result: ', JSON.stringify(obj_main))

    return obj_main.items
  }
  function generaIdccp() {
    try {
      var UUID = crypto.generateUUID()
      var string = UUID.replace(/^.{3}/g, 'CCC')
      log.audit({ title: 'UUID ☠️', details: string })
      return string
    } catch (err) {
      log.error({ title: 'Error occurred in ', details: err })
    }
  }
  function dataPac(obj_json_cp, id_transaccion, tranid_text) {
    // var recordobj = record_transaccion;
    // var generar_pdf = recordobj.getValue({ fieldId: 'custbody_edoc_gen_trans_pdf' });
    // var tran_tranid = recordobj.getValue({ fieldId: 'tranid' });
    // var idtimbre = scriptContext.request.parameters.idtimbre || '';
    // var recordCp = record.load({
    //     type: 'customrecord_efx_fe_cp_carta_porte',
    //     id: idtimbre
    // });
    // var id_template = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_ctempxml' });
    // var tran_sendingmethod = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_cmetpxml' });
    // var tran_uuid = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_cuuid' });
    // var tran_xml = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_cxml' });
    // var tran_pdf = recordCp.getValue({ fieldId: 'custrecord_efx_fe_cp_cpdf' });

    var filtros_Array_pac = new Array()
    filtros_Array_pac.push(['custrecord_mx_pacinfo_enable', search.Operator.IS, 'T'])

    // // REV revisar caso cuando no tiernen subsudiaria
    // var subsidiaria_id =subsidiaries_id;
    // filtros_Array_pac.push('and');
    // filtros_Array_pac.push(['custrecord_mx_pacinfo_subsidiary', search.Operator.ANYOF, subsidiaria_id]);

    var search_pacinfo = search.create({
      type: 'customrecord_mx_pac_connect_info',
      filters: filtros_Array_pac,
      columns: [
        search.createColumn({ name: 'custrecord_mx_pacinfo_username' }),
        search.createColumn({ name: 'custrecord_mx_pacinfo_url' }),
        search.createColumn({ name: 'custrecord_mx_pacinfo_taxid' })
      ]
    })
    var ejecutar = search_pacinfo.run()
    var resultado = ejecutar.getRange(0, 100)
    log.audit({ title: 'resultado', details: resultado })
    var tax_id_pac = resultado[0].getValue({ name: 'custrecord_mx_pacinfo_taxid' })
    log.audit({ title: 'tax_id_pac', details: tax_id_pac })
    var user_pac = resultado[0].getValue({ name: 'custrecord_mx_pacinfo_username' })
    log.audit({ title: 'user_pac', details: user_pac })
    var url_pac = resultado[0].getValue({ name: 'custrecord_mx_pacinfo_url' })
    log.audit({ title: 'url_pac', details: url_pac })
    // var pass_pac = resultado[0].getValue({ name: 'custrecord_mx_pacinfo_password' });
    // log.audit({ title: 'pass_pac', details: pass_pac });
    var data_token = getTokenSW(user_pac, url_pac)
    if (data_token.success) {
      response_to_send = 'Credenciales correctas!'
      log.audit({ title: 'data_token.token', details: data_token.token })

      var headers = {
        'Content-Type': 'application/jsontoxml',
        Authorization: 'Bearer ' + data_token.token.token
      }

      var response_stamp = https.post({
        // hardcodeado ⛳
        url: 'https://services.test.sw.com.mx/v3/cfdi33/issue/json/v4',
        headers: headers,
        body: JSON.stringify(obj_json_cp)
      })
      log.emergency({ title: 'response_stamp', details: JSON.stringify(response_stamp) })
      if (response_stamp.code == 200) {
        log.audit({ title: 'response_stamp.body', details: JSON.stringify(response_stamp.body) })
        var response_json_stamp = JSON.parse(response_stamp.body)
        log.audit({ title: 'response_json_stamp 🌟🌟🌟', details: response_json_stamp })
        if (response_json_stamp.data) {
          // It is stamped and there is the XML file but as string, just parse it
          if (Object.keys(response_json_stamp.data.cfdi).length !== 0) {
            var file_id_saved = save_xml_file(response_json_stamp.data.cfdi, id_transaccion, tranid_text)
            var file_id_generated = save_json_file(JSON.stringify(obj_json_cp), id_transaccion, tranid_text, 'txt')
            var save_stamp_information = save_stamp_info(response_json_stamp.data, id_transaccion)
            if (file_id_saved && file_id_generated && save_stamp_information) {
              return { msg: 'Su carta porte ha sido timbrada con éxito', success: true, fileID: file_id_saved }
            } else {
              return { msg: 'Error al guardar el archivo', success: false, fileID: 0 }
            }
          } else {
            // var file_id_generated = save_json_file(response_json_stamp.data.cfdi, id_transaccion, tranid_text,'xml');
            return { msg: 'Error al timbrar carta porte: ' + response_json_stamp.messageDetail, success: false, fileID: 0 }
          }
        }
      } else {
        var obj_response_stamp = JSON.parse(response_stamp.body)
        log.audit({ title: 'obj_response_stamp', details: obj_response_stamp })
        save_json_file(JSON.stringify(obj_json_cp), id_transaccion, tranid_text, 'txt')
        if (obj_response_stamp.messageDetail == null) {
          return { msg: 'Error al timbrar carta porte: ' + obj_response_stamp.message, success: false, fileID: 0 }
        }
        return { msg: 'Error al timbrar carta porte: ' + obj_response_stamp.message + ' detalle:' + obj_response_stamp.messageDetail, success: false, fileID: 0 }
      }
    }
  }
  function save_stamp_info(data, id_transaccion) {
    try {
      record.submitFields({
        type: record.Type.ITEM_FULFILLMENT,
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
      })
      return true
    } catch (err) {
      log.error({ title: 'Error occurred in save_stamp_info', details: err })
      return false
    }
  }
  function save_json_file(data, id_transaccion, tranid_text, extension) {
    try {
      var fileObj = file.create({
        name: 'CARTA_PORTE_' + tranid_text + '.' + extension,
        fileType: file.Type.PLAINTEXT,
        contents: data,
        encoding: file.Encoding.UTF8,
        folder: 1108,
        isOnline: true
      })
      var fileId_generated = fileObj.save()
      // Save the file in document field of MX+ XML Certificado
      record.submitFields({
        type: record.Type.ITEM_FULFILLMENT,
        id: id_transaccion,
        values: {
          custbody_mx_plus_xml_generado: fileId_generated,
          custbody_psg_ei_generated_edoc: fileId_generated
        },
        options: {
          enableSourcing: true,
          ignoreMandatoryFields: true
        }
      })
      return fileId_generated
    } catch (err) {
      log.error({ title: 'Error occurred in save_json_file', details: err })
    }
  }
  function save_xml_file(data, id_transaccion, tranid_text) {
    try {
      var fileObj = file.create({
        name: 'CARTA_PORTE_' + tranid_text + '.xml',
        fileType: file.Type.PLAINTEXT,
        contents: data,
        encoding: file.Encoding.UTF8,
        folder: 1108,
        isOnline: true
      })
      var fileId_stamped = fileObj.save()
      // Save the file in document field of MX+ XML Certificado
      record.submitFields({
        type: record.Type.ITEM_FULFILLMENT,
        id: id_transaccion,
        values: {
          custbody_mx_plus_xml_certificado: fileId_stamped,
          custbody_psg_ei_certified_edoc: fileId_stamped
        },
        options: {
          enableSourcing: true,
          ignoreMandatoryFields: true
        }
      })
      return fileId_stamped
    } catch (err) {
      log.error({ title: 'Error occurred in save_xml_file', details: err })
      return 0
    }
  }
  function getTokenSW(user_pac, url_pac) {
    var dataReturn = { success: false, error: '', token: '' }
    try {
      var urlToken = url_pac + '/security/authenticate'
      // log.debug({ title: 'getTokenDat', details: { url: url, user: user, pass: pass } });
      // pass = 'AAA111';
      pass = 'mQ*wP^e52K34'
      var headers = {
        user: user_pac,
        password: pass
      }
      var response = https.post({
        url: urlToken,
        headers: headers,
        body: {}
      })
      // log.debug({title:'response', details:response});
      if (response.code == 200) {
        var token = JSON.parse(response.body)
        log.debug({ title: 'token', details: token })
        dataReturn.token = token.data
        dataReturn.success = true
      }
    } catch (error) {
      log.error({ title: 'getTokenSW', details: error })
      dataReturn.success = false
      dataReturn.error = error
    }
    log.audit({ title: 'dataReturn', details: dataReturn })
    return dataReturn
  }

  // function timbraDocumento(obj_json_cp, id, user_pac, url_pac, idCompensacion, PAC_Service, pass_pac) {
  //     var dataReturn = { success: false, error: '', xmlDocument: '', mensaje: '' };
  //     try {
  //         log.audit({ title: 'PAC_Service timbra docu', details: PAC_Service });
  //         var xmlStrX64 = encode.convert({
  //             string: xmlDocument,
  //             inputEncoding: encode.Encoding.UTF_8,
  //             outputEncoding: encode.Encoding.BASE_64
  //         }); // se convierte el xml en base 64 para mandarlo al pac
  //         log.audit({ title: 'xmlStrX64', details: xmlStrX64 });
  //         var url_pruebas = url_pac;
  //         var xmlDocument_receipt;
  //         if (PAC_Service == true) { // se utiliza SmarterWeb
  //             var tokenResult = getTokenSW(user_pac, pass_pac, url_pac);
  //             log.debug({ title: 'tokenResult', details: tokenResult });
  //             if (tokenResult.success == false) {
  //                 throw 'Error getting token'
  //             }
  //             var tokentry = tokenResult.token;
  //             log.debug({ title: 'tokentry', details: tokentry });
  //             var headers = {
  //                 "Content-Type": 'application/json',
  //                 "Authorization": "Bearer " + tokentry.token
  //             };
  //             var cuerpo = { "data": xmlStrX64 };
  //             var fecha_envio = new Date();
  //             log.audit({ title: 'fecha_envio', details: fecha_envio });
  //             log.audit({ title: 'headers', details: headers });
  //             log.audit({ title: 'cuerpo', details: cuerpo });
  //             url_pruebas = url_pruebas + '/cfdi33/issue/json/v4/b64';
  //             log.audit({ title: 'url timbrado', details: url_pruebas });
  //             var response = https.post({
  //                 url: url_pruebas,
  //                 headers: headers,
  //                 body: JSON.stringify(cuerpo)
  //             });
  //             // var response = {
  //             //     "type": "http.ClientResponse",
  //             //     "code": 200,
  //             //     "headers": {
  //             //     "Content-Type": "text/json; charset=utf-8",
  //             //     "content-type": "text/json; charset=utf-8",
  //             //     "Date": "Thu, 22 Jun 2023 22:06:27 GMT",
  //             //     "date": "Thu, 22 Jun 2023 22:06:27 GMT",
  //             //     "Request-Context": "appId=cid-v1:aa56c64f-d639-4232-87f9-f0d0b91b6d6a",
  //             //     "request-context": "appId=cid-v1:aa56c64f-d639-4232-87f9-f0d0b91b6d6a",
  //             //     "Transfer-Encoding": "chunked",
  //             //     "transfer-encoding": "chunked",
  //             //     "Vary": "Accept-Encoding",
  //             //     "vary": "Accept-Encoding",
  //             //     "Via": "1.1 mono003",
  //             //     "via": "1.1 mono003",
  //             //     "X-Azure-Ref": "04sWUZAAAAADEPbMWtKlRS4MDHMba7GSKU0pDMjExMDUxMjAxMDExADE3ZmQzMjdiLTA4YTktNGVhMy04NzdmLTczNmViZGI4M2UxNg==",
  //             //     "x-azure-ref": "04sWUZAAAAADEPbMWtKlRS4MDHMba7GSKU0pDMjExMDUxMjAxMDExADE3ZmQzMjdiLTA4YTktNGVhMy04NzdmLTczNmViZGI4M2UxNg==",
  //             //     "X-Cache": "CONFIG_NOCACHE",
  //             //     "x-cache": "CONFIG_NOCACHE",
  //             //     "X-Powered-By": "ASP.NET",
  //             //     "x-powered-by": "ASP.NET"
  //             //     },
  //             //     "body": "{\"data\":{\"cadenaOriginalSAT\":\"||1.1|24ebfe7a-40d1-4c75-a7bb-36f4bc2cb2a9|2023-06-22T16:06:27|SPR190613I52|f/e8zGZRzz39H1YoyRzuoWClL6IW7KNuDjg8MmnFqW7bPVfp6cUUW/m+3erD8mHBbnMUz37OvnwPL5jhwlaW/MrOMkzktYtDv571yXNH14vT56yxfkG5MJvd6QrkIsb3avyErNFVrO4Z06KswWT9fFQ/shnSSf1/n2YwLnBmh6YWD3y90contxkgv3Q53qOU68BnGPIxNrvHF5EbT5qt9UBYaHXSk7Itz53pspnULw0w92e7dktiBeiiKChrz3fIvSI26nD0GdFmwo8cVA3mVuQ6DgZKuEw9G1ExI9tgLRtovpJTQpCtXCqTt7Jo7DYAeTpm0ujlOVAgt4zzoSYl0w==|30001000000400002495||\",\"noCertificadoSAT\":\"30001000000400002495\",\"noCertificadoCFDI\":\"00001000000514588133\",\"uuid\":\"24ebfe7a-40d1-4c75-a7bb-36f4bc2cb2a9\",\"selloSAT\":\"DVLA09PBUJmVukZ6M6EwtKUS4SUjq9TIXO1rpXkbu2Ob3wtf3TErEiUR1ZyZOU2LNEDO32H0015fqDjWzuU6Vc1vEPblUTOvpPPQ9vetf87dHKK4ieGwg689YSWNuNIR/WQACq4jKc71fxGI5tlBJn7lXcZtscIPZCGGnNNszAnX0MIar9HpBXY83YPlNbEKIMNVG6oKdElzMmEPgucsadEPPoCf5C+8NQgl26XZWz6M0uWQiG7PFveXAPO6GuzKPtUF1gtzUwLt6JSzsLYSxOHZxE6bP7m/dzdnvZjYx9emUATpYOovyBeX+YOX9nboT0YO+GXfbVD9u0b9zsF10g==\",\"selloCFDI\":\"f/e8zGZRzz39H1YoyRzuoWClL6IW7KNuDjg8MmnFqW7bPVfp6cUUW/m+3erD8mHBbnMUz37OvnwPL5jhwlaW/MrOMkzktYtDv571yXNH14vT56yxfkG5MJvd6QrkIsb3avyErNFVrO4Z06KswWT9fFQ/shnSSf1/n2YwLnBmh6YWD3y90contxkgv3Q53qOU68BnGPIxNrvHF5EbT5qt9UBYaHXSk7Itz53pspnULw0w92e7dktiBeiiKChrz3fIvSI26nD0GdFmwo8cVA3mVuQ6DgZKuEw9G1ExI9tgLRtovpJTQpCtXCqTt7Jo7DYAeTpm0ujlOVAgt4zzoSYl0w==\",\"fechaTimbrado\":\"2023-06-22T16:06:27\",\"qrCode\":\"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\",\"cfdi\":\"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48Y2ZkaTpDb21wcm9iYW50ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4bWxuczpjZmRpPSJodHRwOi8vd3d3LnNhdC5nb2IubXgvY2ZkLzQiIHhzaTpzY2hlbWFMb2NhdGlvbj0iaHR0cDovL3d3dy5zYXQuZ29iLm14L2NmZC80IGh0dHA6Ly93d3cuc2F0LmdvYi5teC9zaXRpb19pbnRlcm5ldC9jZmQvNC9jZmR2NDAueHNkIiBGZWNoYT0iMjAyMy0wNi0yMlQxNjowNjoyMSIgRm9saW89IjEwMDA2Mzg1IiBTZXJpZT0iSU5WIiBGb3JtYVBhZ289Ijk5IiBMdWdhckV4cGVkaWNpb249IjA1MTAwIiBNZXRvZG9QYWdvPSJQUEQiIFRpcG9DYW1iaW89IjEiIE1vbmVkYT0iTVhOIiBTdWJUb3RhbD0iMjAwLjAwIiBUb3RhbD0iMjMyLjAwIiBUaXBvRGVDb21wcm9iYW50ZT0iSSIgRXhwb3J0YWNpb249IjAxIiBWZXJzaW9uPSI0LjAiIERlc2N1ZW50bz0iMC4wMCIgTm9DZXJ0aWZpY2Fkbz0iMDAwMDEwMDAwMDA1MTQ1ODgxMzMiIENlcnRpZmljYWRvPSJNSUlGL1RDQ0ErV2dBd0lCQWdJVU1EQXdNREV3TURBd01EQTFNVFExT0RneE16TXdEUVlKS29aSWh2Y05BUUVMQlFBd2dnR0VNU0F3SGdZRFZRUUREQmRCVlZSUFVrbEVRVVFnUTBWU1ZFbEdTVU5CUkU5U1FURXVNQ3dHQTFVRUNnd2xVMFZTVmtsRFNVOGdSRVVnUVVSTlNVNUpVMVJTUVVOSlQwNGdWRkpKUWxWVVFWSkpRVEVhTUJnR0ExVUVDd3dSVTBGVUxVbEZVeUJCZFhSb2IzSnBkSGt4S2pBb0Jna3Foa2lHOXcwQkNRRVdHMk52Ym5SaFkzUnZMblJsWTI1cFkyOUFjMkYwTG1kdllpNXRlREVtTUNRR0ExVUVDUXdkUVZZdUlFaEpSRUZNUjA4Z056Y3NJRU5QVEM0Z1IxVkZVbEpGVWs4eERqQU1CZ05WQkJFTUJUQTJNekF3TVFzd0NRWURWUVFHRXdKTldERVpNQmNHQTFVRUNBd1FRMGxWUkVGRUlFUkZJRTFGV0VsRFR6RVRNQkVHQTFVRUJ3d0tRMVZCVlVoVVJVMVBRekVWTUJNR0ExVUVMUk1NVTBGVU9UY3dOekF4VGs0ek1Wd3dXZ1lKS29aSWh2Y05BUWtDRTAxeVpYTndiMjV6WVdKc1pUb2dRVVJOU1U1SlUxUlNRVU5KVDA0Z1EwVk9WRkpCVENCRVJTQlRSVkpXU1VOSlQxTWdWRkpKUWxWVVFWSkpUMU1nUVV3Z1EwOU9WRkpKUWxWWlJVNVVSVEFlRncweU1qQTRNVGN4T1RFME1EbGFGdzB5TmpBNE1UY3hPVEUwTURsYU1JSExNUjh3SFFZRFZRUURFeFpHVWtWRklFSlZSeUJUSUVSRklGSk1JRVJGSUVOV01SOHdIUVlEVlFRcEV4WkdVa1ZGSUVKVlJ5QlRJRVJGSUZKTUlFUkZJRU5XTVI4d0hRWURWUVFLRXhaR1VrVkZJRUpWUnlCVElFUkZJRkpNSUVSRklFTldNU1V3SXdZRFZRUXRFeHhHUWxVeU1qQTFNRE0xVlRrZ0x5QlFSVUpUT0RZd09ETXhSelEyTVI0d0hBWURWUVFGRXhVZ0x5QlFSVUpUT0RZd09ETXhUVkJNVWxKVE1ETXhIekFkQmdOVkJBc1RGa1pTUlVVZ1FsVkhJRk1nUkVVZ1Vrd2dSRVVnUTFZd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUNma1pLdTlJL005WHFjWDRYYzdzVFRoOWZNL1p0MHE1YmF5WHlVK2JrTStMVkdwREFtYzFBTFVxdmZVbm5SNFRMMTVGN3hwNWQ5VzBkak54YzRmd25SVGRuOEllL3RnZEtKd2FMUGgrT0ZGRjBCRDVNWGM4U2YyT1A1aXErd2g5U1FFbVdZZkVrdXMveURmbUxRTFEzZ24xV0hQNnhkbUJKRjRHMXNrR20xNzgvN1pwVzdMNFdvMUlRTDVtbGtuckZ0eU9QdTY4b1FNYU1GRVFXbDM5UklYbWJaTXI4UUtIWEtUTnRSbFF4NHl2SlB1Q0d0OTFMSEVkN0JlN09ENnFuOWJKQzJNZzFtWjRlRFJiRXlHWDZoUmUrajRYdWI0UVpzekVJWkQ5bDJqdkFhSjljMEhKbW1ta2NDL3FHVWh4d0t6SFJ3Q1FPMElDODlEZllDdlN5QkFnTUJBQUdqSFRBYk1Bd0dBMVVkRXdFQi93UUNNQUF3Q3dZRFZSMFBCQVFEQWdiQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQ0FRQlBpRExhbTVJUHNzTFh5SkZRdzRFRlQzTFFNVmN3R1B3Zi96K3FNNFozMmMyNndHTVplV2gyaFF1NDlDWUlOUit3ZHE5TDFjZm5tN0krcGN3V2ZRUFlXKzBDTXgrVUtnVkJhNDdVeTF2WVE5ZTlqa3FzSXphMm11SlRzZFc4VTU3ZXJEQnV2TDVJYUhDTTFnc2ZqMGVCNmhYd3dQay9lOXBQRkYvNWxXZWw5aCtscHBXSjlYWDFjR1grZC9oK0tQb0tzcXVxTWVaT05PTHk5dGdjODBxT1VadkdZMFpsT0NYY0ZOdk9YMkNXdjFSMlhzN3hsYXh5ZFpsYnhlUEEyZzhVVlJTZ2lRRkRaaDN1azVsY1FSQkdGRHhiN0ZHR1JWaElJdGJ6REpIR3JnWGNFSkMwakpaNTd1bTBzV1ZqSVkzSXRTMURnMnIxb1NxM3UwU1BwNENJdExpd2VJM0tMSjN4VEk5WW9YVy9vWk1nUFVWN1lWaXp2RlRHcWc1Wi85SHMra3NKay8vZHJEcHVYL25WbWQxTWFuc2tsa0ExVDJZTHR1eG9ZRDZqdzZmS0xXQlFvSHh4Nit5b1k3SWtYVEtwTnNOR1hwZU5GWUJoWlJZNEEyNWlqTE1yS0ZQcWQ5UWQ5UDQwTUNiYUMyQzk0WmlrNE80bitCQ2ZIeHVaVTliK2xCbzQxSWJER2l2Vmg3SXZhSGJqN3phRjFmc216cXpqcXdNYTRXMU1VZ2lYM0JPSjlIVTlWcHJDUWlpMHduUytEQWdETFFTVDNNSjhkcjcrZjErV1p3RjRkamxyeDV0ZURZdmFTMTd0TFdrQVBZczNIN2kwM1lMb3hUM0VJR0x3azY1TzBWRVlqYi9jam13TFRneFA4V3RpMmxyUmc5WGt6ekhXazc3YSt3PT0iIFNlbGxvPSJmL2U4ekdaUnp6MzlIMVlveVJ6dW9XQ2xMNklXN0tOdURqZzhNbW5GcVc3YlBWZnA2Y1VVVy9tKzNlckQ4bUhCYm5NVXozN092bndQTDVqaHdsYVcvTXJPTWt6a3RZdER2NTcxeVhOSDE0dlQ1Nnl4ZmtHNU1KdmQ2UXJrSXNiM2F2eUVyTkZWck80WjA2S3N3V1Q5ZkZRL3NoblNTZjEvbjJZd0xuQm1oNllXRDN5OTBjb250eGtndjNRNTNxT1U2OEJuR1BJeE5ydkhGNUViVDVxdDlVQllhSFhTazdJdHo1M3BzcG5VTHcwdzkyZTdka3RpQmVpaUtDaHJ6M2ZJdlNJMjZuRDBHZEZtd284Y1ZBM21WdVE2RGdaS3VFdzlHMUV4STl0Z0xSdG92cEpUUXBDdFhDcVR0N0pvN0RZQWVUcG0wdWpsT1ZBZ3Q0enpvU1lsMHc9PSI+PGNmZGk6Q2ZkaVJlbGFjaW9uYWRvcyBUaXBvUmVsYWNpb249IjA3Ij48Y2ZkaTpDZmRpUmVsYWNpb25hZG8gVVVJRD0iYTNhNjU1ZDQtYWE0Ni00MzVmLTkzM2MtMDFhODc3MDU2NTlhIiAvPjwvY2ZkaTpDZmRpUmVsYWNpb25hZG9zPjxjZmRpOkVtaXNvciBOb21icmU9IkZSRUUgQlVHIiBSZWdpbWVuRmlzY2FsPSI2MDEiIFJmYz0iRkJVMjIwNTAzNVU5IiAvPjxjZmRpOlJlY2VwdG9yIFJmYz0iWEVYWDAxMDEwMTAwMCIgTm9tYnJlPSJQw5pCTElDTyBFTiBHRU5FUkFMIiBEb21pY2lsaW9GaXNjYWxSZWNlcHRvcj0iMDUxMDAiIFJlZ2ltZW5GaXNjYWxSZWNlcHRvcj0iNjE2IiBVc29DRkRJPSJTMDEiIC8+PGNmZGk6Q29uY2VwdG9zPjxjZmRpOkNvbmNlcHRvIENhbnRpZGFkPSIxMC4wMDAwMDAiIE5vSWRlbnRpZmljYWNpb249IjgwMTMxNTAwIiBDbGF2ZVByb2RTZXJ2PSI4NjExMTYwNCIgQ2xhdmVVbmlkYWQ9IkFDVCIgRGVzY3JpcGNpb249IkRpZ2l0YWwgU2luZ2xlIExpbmUgVGVsZXBob25lICggNDQwMCkgZm9yIHN1cHBvcnQgY2FsbHMiIEltcG9ydGU9IjIwMC4wMCIgVmFsb3JVbml0YXJpbz0iMjAuMDAiIERlc2N1ZW50bz0iMC4wMCIgT2JqZXRvSW1wPSIwMiI+PGNmZGk6SW1wdWVzdG9zPjxjZmRpOlRyYXNsYWRvcz48Y2ZkaTpUcmFzbGFkbyBCYXNlPSIyMDAuMDAiIEltcG9ydGU9IjMyLjAwIiBJbXB1ZXN0bz0iMDAyIiBUYXNhT0N1b3RhPSIwLjE2MDAwMCIgVGlwb0ZhY3Rvcj0iVGFzYSIgLz48L2NmZGk6VHJhc2xhZG9zPjwvY2ZkaTpJbXB1ZXN0b3M+PC9jZmRpOkNvbmNlcHRvPjwvY2ZkaTpDb25jZXB0b3M+PGNmZGk6SW1wdWVzdG9zIFRvdGFsSW1wdWVzdG9zVHJhc2xhZGFkb3M9IjMyLjAwIj48Y2ZkaTpUcmFzbGFkb3M+PGNmZGk6VHJhc2xhZG8gQmFzZT0iMjAwLjAwIiBJbXBvcnRlPSIzMi4wMCIgSW1wdWVzdG89IjAwMiIgVGFzYU9DdW90YT0iMC4xNjAwMDAiIFRpcG9GYWN0b3I9IlRhc2EiIC8+PC9jZmRpOlRyYXNsYWRvcz48L2NmZGk6SW1wdWVzdG9zPjxjZmRpOkNvbXBsZW1lbnRvPjx0ZmQ6VGltYnJlRmlzY2FsRGlnaXRhbCB4c2k6c2NoZW1hTG9jYXRpb249Imh0dHA6Ly93d3cuc2F0LmdvYi5teC9UaW1icmVGaXNjYWxEaWdpdGFsIGh0dHA6Ly93d3cuc2F0LmdvYi5teC9zaXRpb19pbnRlcm5ldC9jZmQvVGltYnJlRmlzY2FsRGlnaXRhbC9UaW1icmVGaXNjYWxEaWdpdGFsdjExLnhzZCIgVmVyc2lvbj0iMS4xIiBVVUlEPSIyNGViZmU3YS00MGQxLTRjNzUtYTdiYi0zNmY0YmMyY2IyYTkiIEZlY2hhVGltYnJhZG89IjIwMjMtMDYtMjJUMTY6MDY6MjciIFJmY1Byb3ZDZXJ0aWY9IlNQUjE5MDYxM0k1MiIgU2VsbG9DRkQ9ImYvZTh6R1pSenozOUgxWW95Unp1b1dDbEw2SVc3S051RGpnOE1tbkZxVzdiUFZmcDZjVVVXL20rM2VyRDhtSEJibk1VejM3T3Zud1BMNWpod2xhVy9Nck9Na3prdFl0RHY1NzF5WE5IMTR2VDU2eXhma0c1TUp2ZDZRcmtJc2IzYXZ5RXJORlZyTzRaMDZLc3dXVDlmRlEvc2huU1NmMS9uMll3TG5CbWg2WVdEM3k5MGNvbnR4a2d2M1E1M3FPVTY4Qm5HUEl4TnJ2SEY1RWJUNXF0OVVCWWFIWFNrN0l0ejUzcHNwblVMdzB3OTJlN2RrdGlCZWlpS0NocnozZkl2U0kyNm5EMEdkRm13bzhjVkEzbVZ1UTZEZ1pLdUV3OUcxRXhJOXRnTFJ0b3ZwSlRRcEN0WENxVHQ3Sm83RFlBZVRwbTB1amxPVkFndDR6em9TWWwwdz09IiBOb0NlcnRpZmljYWRvU0FUPSIzMDAwMTAwMDAwMDQwMDAwMjQ5NSIgU2VsbG9TQVQ9IkRWTEEwOVBCVUptVnVrWjZNNkV3dEtVUzRTVWpxOVRJWE8xcnBYa2J1Mk9iM3d0ZjNURXJFaVVSMVp5Wk9VMkxORURPMzJIMDAxNWZxRGpXenVVNlZjMXZFUGJsVVRPdnBQUFE5dmV0Zjg3ZEhLSzRpZUd3ZzY4OVlTV051TklSL1dRQUNxNGpLYzcxZnhHSTV0bEJKbjdsWGNadHNjSVBaQ0dHbk5Oc3pBblgwTUlhcjlIcEJYWTgzWVBsTmJFS0lNTlZHNm9LZEVsek1tRVBndWNzYWRFUFBvQ2Y1Qys4TlFnbDI2WFpXejZNMHVXUWlHN1BGdmVYQVBPNkd1ektQdFVGMWd0elV3THQ2SlN6c0xZU3hPSFp4RTZiUDdtL2R6ZG52WmpZeDllbVVBVHBZT292eUJlWCtZT1g5bmJvVDBZTytHWGZiVkQ5dTBiOXpzRjEwZz09IiB4bWxuczp0ZmQ9Imh0dHA6Ly93d3cuc2F0LmdvYi5teC9UaW1icmVGaXNjYWxEaWdpdGFsIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiAvPjwvY2ZkaTpDb21wbGVtZW50bz48L2NmZGk6Q29tcHJvYmFudGU+\"},\"status\":\"success\"}"
  //             // };
  //             log.emergency({ title: 'response', details: JSON.stringify(response) });
  //             log.audit({ title: 'response.body', details: JSON.stringify(response.body) });
  //             var responseBody = JSON.parse(response.body);
  //             log.audit({ title: 'getBody', details: responseBody });
  //             if (response.code == 200) {
  //                 if (responseBody.status == 'success') {
  //                     responseBody = responseBody.data;
  //                     log.audit({ title: 'getBody.data', details: responseBody });
  //                     var cfdiResult = responseBody.cfdi;
  //                     log.audit({ title: 'cfdiResult', details: cfdiResult });
  //                     cfdiResult = encode.convert({
  //                         string: cfdiResult,
  //                         inputEncoding: encode.Encoding.BASE_64,
  //                         outputEncoding: encode.Encoding.UTF_8
  //                     });
  //                     log.audit({ title: 'cfdiResult_transform', details: cfdiResult });
  //                     var fileXML_new = file.create({
  //                         name: 'certificadoResponse_new.xml',
  //                         fileType: file.Type.PLAINTEXT,
  //                         contents: cfdiResult,
  //                         folder: -15
  //                     });
  //                     // var idFileNew = fileXML_new.save();
  //                     // xmlDocument_receipt = xml.Parser.fromString({
  //                     //     text: cfdiResult
  //                     // });
  //                     xmlDocument_receipt = responseBody;
  //                 }
  //             } else {
  //                 var msg = responseBody.message;
  //                 if (responseBody.messageDetail != null) {
  //                     msg += '\n\n\n' + responseBody.messageDetail;
  //                 }
  //                 dataReturn.success = false;
  //                 dataReturn.error = msg;
  //                 dataReturn.mensaje = responseBody.message;
  //                 return dataReturn
  //             }
  //         } else { // se utiliza Profact
  //             //Estructura xml soap para enviar la peticion de timbrado al pac
  //             var xmlSend = '';
  //             xmlSend += '<?xml version="1.0" encoding="utf-8"?>';
  //             xmlSend += '<soap:Envelope ';
  //             xmlSend += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
  //             xmlSend += '    xmlns:xsd="http://www.w3.org/2001/XMLSchema" ';
  //             xmlSend += '    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
  //             xmlSend += '    <soap:Body>';
  //             xmlSend += '        <TimbraCFDI ';
  //             xmlSend += '            xmlns="http://tempuri.org/">';
  //             xmlSend += '            <usuarioIntegrador>' + user_pac + '</usuarioIntegrador>';
  //             xmlSend += '            <xmlComprobanteBase64>' + xmlStrX64 + '</xmlComprobanteBase64>';
  //             if (idCompensacion) {
  //                 xmlSend += '            <idComprobante>' + 'Factura' + idCompensacion + '</idComprobante>';
  //             } else {
  //                 xmlSend += '            <idComprobante>' + 'Factura' + id + '</idComprobante>';
  //             }
  //             xmlSend += '        </TimbraCFDI>';
  //             xmlSend += '    </soap:Body>';
  //             xmlSend += '</soap:Envelope>';

  //             log.audit({ title: 'xmlSend', details: xmlSend });

  //             //creacion de la peticion post para envio soap
  //             var headers = {
  //                 'Content-Type': 'text/xml'
  //             };

  //             var fecha_envio = new Date();
  //             log.audit({ title: 'fecha_envio', details: fecha_envio });

  //             var response = https.post({
  //                 url: url_pruebas,
  //                 headers: headers,
  //                 body: xmlSend
  //             });

  //             log.emergency({ title: 'response', details: JSON.stringify(response) });
  //             var fecha_recibe = new Date();
  //             log.audit({ title: 'fecha_recibe', details: fecha_recibe });
  //             log.audit({ title: 'response.body', details: JSON.stringify(response.body) });

  //             var responseBody = response.body;
  //             log.audit({ title: 'getBody', details: responseBody });

  //             //parseo de la respuesta del pac
  //             xmlDocument_receipt = xml.Parser.fromString({
  //                 text: response.body
  //             });
  //         }
  //         dataReturn.xmlDocument = xmlDocument_receipt;
  //         dataReturn.success = true;
  //     } catch (error) {
  //         log.error({ title: 'timbradoDocumento', details: error });
  //         dataReturn.success = false;
  //         dataReturn.error = error;
  //     }
  //     return dataReturn;
  // }

  return { onRequest }
})
