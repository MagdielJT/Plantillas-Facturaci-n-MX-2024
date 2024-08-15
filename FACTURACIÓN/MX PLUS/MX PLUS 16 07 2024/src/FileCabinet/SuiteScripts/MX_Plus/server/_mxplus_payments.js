/**
 * @NApiVersion 2.1
 */
define(['N/file', 'N/https', 'N/log', 'N/record', 'N/query', 'N/search', '../Pagos/lib/constants', '../lib/access_pac', '../lib/functions_gbl', '../lib/moment', 'N/runtime'], /**
  * @param {file} file
  * @param {https} https
  * @param {log} log
  * @param {record} record
  * @param {query} query
  * @param {search} search
  * @param {constants} constants
  * @param {access_pac} access_pac
  * @param {functions} functions
  * @param {moment} moment
  */ (file, https, log, record, query, search, constants, access_pac, functions, moment, runtime) => {
    const { JSON_EXAMPLE, RECORDS } = constants
    /**
     * La función `generateJSON` crea un objeto JSON basado en información de registro de entrada y
     * diversa lógica de procesamiento de datos.
     * @param recordId - Parece que el fragmento de código que proporcionó es una función llamada
     * "generateJSON" que genera un objeto JSON basado en ciertos parámetros de entrada y datos
     * recuperados de varias fuentes. La función parece manejar información relacionada con pagos y
     * facturas para construir la estructura JSON.
     * @param recordType - Parece que el parámetro `recordType` se usa en su función `generateJSON` para
     * determinar el tipo de registro que se está procesando. Esta información es crucial para generar
     * correctamente la estructura de datos JSON según el tipo de registro proporcionado.
     * @returns La función `generateJSON` devuelve el objeto `dataGenerate` que contiene los datos JSON
     * generados en función de la entrada `recordId` y `recordType`.
     */
    const getCustomerBasicInformationPMT = idCliente => {
      try {
        let data2Return = {
          regFiscal: '',
          NombreSAT: '',
          DomicilioFiscalReceptor: ''
        }
        const filters = [['internalid', search.Operator.ANYOF, idCliente]]
        const columnRegFiscal = search.createColumn({ name: 'custentity_mx_sat_industry_type' })
        const columnSATName = search.createColumn({ name: 'custentity_mx_sat_registered_name' })
        const createdSearch = search.create({
          type: 'customer',
          filters,
          columns: [columnRegFiscal, columnSATName]
        })
        createdSearch.run().each(result => {
          data2Return.regFiscal = result.getText(columnRegFiscal).split(' -')[0]
          data2Return.NombreSAT = result.getValue(columnSATName)
          return true
        })
        var obj_cliente = record.load({
          type: record.Type.CUSTOMER,
          id: idCliente
        })
        var count = obj_cliente.getLineCount({ sublistId: 'addressbook' })
        for (var i = 0; i < count; i++) {
          var billing = obj_cliente.getSublistValue({
            sublistId: 'addressbook',
            fieldId: 'defaultbilling',
            line: i
          })
          if (billing) {
            var subrec = obj_cliente.getSublistSubrecord({
              sublistId: 'addressbook',
              fieldId: 'addressbookaddress',
              line: i
            })
            data2Return.DomicilioFiscalReceptor = subrec.getValue({ fieldId: 'zip' })
          }
        }
        return data2Return
      } catch (err) {
        log.error({ title: 'Error occurred in getCustomerBasicInformationPMT', details: err })
      }
    }
    const getEmisorRFC = idSubsidiary => {
      try {
        const subsidiarySearchFilters = [['isinactive', search.Operator.IS, 'F'], 'AND', ['internalid', search.Operator.IS, idSubsidiary]]
        const subsidiarySearchColNmeroDeRegistroFiscal = search.createColumn({ name: 'taxregistrationnumber' })
        const subsidiarySearch = search.create({
          type: 'subsidiary',
          filters: subsidiarySearchFilters,
          columns: [subsidiarySearchColNmeroDeRegistroFiscal]
        })
        let data2Return = ''
        const subsidiarySearchPagedData = subsidiarySearch.runPaged({ pageSize: 2 })
        for (let i = 0; i < subsidiarySearchPagedData.pageRanges.length; i++) {
          const subsidiarySearchPage = subsidiarySearchPagedData.fetch({ index: i })
          subsidiarySearchPage.data.forEach(result => {
            data2Return = result.getValue(subsidiarySearchColNmeroDeRegistroFiscal)
          })
        }
        return data2Return
      } catch (err) {
        log.emergency({ title: 'Error occurred in getEmisorRFCpmt', details: err });
        let registroCompania = record.load({
          type: record.Type.SUBSIDIARY,
          id: idSubsidiary,
        });
        data2Return = registroCompania.getValue('federalidnumber');
        log.debug({ title: 'data2Return getEmisorRFC', details: data2Return });
        return data2Return
      }
    }
    const fetchSaldosAnteriores_y_Pagados = (idPago, idInvoice) => {
      try {
        let data2Return = {}
        const customerPaymentSearchFilters = [
          ['type', search.Operator.ANYOF, 'CustPymt'],
          'AND',
          ['internalid', search.Operator.ANYOF, idPago],
          'AND',
          ['appliedtotransaction.internalid', search.Operator.ANYOF, idInvoice]
        ]
        const customerPaymentSearchColUbicacin = search.createColumn({ name: 'location' })
        const customerPaymentSearchColImportePagado = search.createColumn({ name: 'amountpaid' })
        const customerPaymentSearchColAppliedToTransactionImportePagado = search.createColumn({ name: 'paidamount', join: 'appliedtotransaction' })
        const customerPaymentSearchColAplicadoALaTransaccin = search.createColumn({ name: 'appliedtotransaction' })
        const customerPaymentSearchColAppliedToTransactionImporte = search.createColumn({ name: 'fxamount', join: 'appliedtotransaction' })
        const customerPaymentSearchColAppliedToTransactionImporteAPagar = search.createColumn({ name: 'fxamountpaid', join: 'appliedtotransaction' })
        // const customerPaymentSearchColAppliedToTransactionImporteAPagar = search.createColumn({ name: 'payingamount', join: 'appliedtotransaction' });
        const customerPaymentSearch = search.create({
          type: 'customerpayment',
          filters: customerPaymentSearchFilters,
          columns: [
            customerPaymentSearchColUbicacin,
            customerPaymentSearchColImportePagado,
            customerPaymentSearchColAppliedToTransactionImportePagado,
            customerPaymentSearchColAplicadoALaTransaccin,
            customerPaymentSearchColAppliedToTransactionImporte,
            customerPaymentSearchColAppliedToTransactionImporteAPagar
          ]
        })

        const customerPaymentSearchPagedData = customerPaymentSearch.runPaged({ pageSize: 1000 })
        for (let i = 0; i < customerPaymentSearchPagedData.pageRanges.length; i++) {
          const customerPaymentSearchPage = customerPaymentSearchPagedData.fetch({ index: i })
          customerPaymentSearchPage.data.forEach(result => {
            const ubicacin = result.getValue(customerPaymentSearchColUbicacin)
            const appliedToTransactionImportePagado = result.getValue(customerPaymentSearchColAppliedToTransactionImportePagado)
            const aplicadoALaTransaccin = result.getValue(customerPaymentSearchColAplicadoALaTransaccin)
            const importeOriginal = result.getValue(customerPaymentSearchColAppliedToTransactionImporte)
            const importePagado = result.getValue(customerPaymentSearchColAppliedToTransactionImporteAPagar)
            data2Return = { importeOriginal, importePagado }
          })
        }
        return data2Return
      } catch (err) {
        log.error({ title: 'Error occurred in fetchSaldosAnteriores_y_Pagados', details: err })
      }
    }
    const generateJSON = (recordId, recordType) => {
      log.debug({ title: 'recordId 💀', details: recordId })
      let dataGenerate = {}
      try {
        const { BASE, EMISOR, RECEPTOR, CONCEPTO, COMPLEMENTO, PAGOS, PAGO, DOC_REL, IMPUESTOS } = JSON_EXAMPLE
        const { PAYMENT, CUSTOMER, INVOICE } = RECORDS
        const { FACTORAJE } = PAYMENT
        /* La función `functions.checkOWAccount()` verifica si la
              cuenta actual es una cuenta "OW". */
        const isOW = functions.checkOWAccount()
        /**
         * Init Data
         */
        dataGenerate[BASE.Version] = '4.0'
        dataGenerate[BASE.SubTotal] = 0
        dataGenerate[BASE.Moneda] = 'XXX'
        dataGenerate[BASE.Total] = 0
        dataGenerate[BASE.TipoDeComprobante] = 'P'
        dataGenerate[BASE.Exportacion] = '01'
        /* La línea `const basePmt = getPaymentInformation(recordId)` llama a la función
              `getPaymentInformation` con el parámetro `recordId` y almacena el resultado en la constante
              `basePmt`. Esta función es responsable de recuperar información de pago basada en el "recordId"
              proporcionado. Los datos devueltos luego se utilizan en la lógica posterior para generar datos
             JSON. */
        const basePmt = getPaymentInformation(recordId, isOW)
        log.debug('generateJSON ~ basePmt:', basePmt)
        const dataApply = getDataApply(recordId)
        log.debug('generateJSON ~ dataApply', dataApply)
        const receFactoraje = dataFactoraje(recordId)
        log.debug({ title: 'receFactoraje', details: receFactoraje })
        if (Object.keys(basePmt).length) {
          // MOD: Se cambia la forma de obtener la serie y el folio porque se comia un caracter numerico
          if (runtime.accountId.includes('5907646') == false) {
          let serieT = basePmt[PAYMENT.FIELDS.FOLIO].value.match(/[a-zA-Z]+/g);
          dataGenerate[BASE.Serie] = serieT ? (serieT).toString() : '';
          let folioT = basePmt[PAYMENT.FIELDS.FOLIO].value.match(/\d+/g);
          dataGenerate[BASE.Folio] = folioT ? (folioT).toString() : '';
          }
          // dataGenerate[BASE.Serie] = basePmt[PAYMENT.FIELDS.FOLIO].value.slice(0, 3)
          // dataGenerate[BASE.Folio] = basePmt[PAYMENT.FIELDS.FOLIO].value.slice(4, basePmt[PAYMENT.FIELDS.FOLIO].value.length)
          if (dataGenerate[BASE.Folio] === '' && dataGenerate[BASE.Serie] !== '') {
            dataGenerate[BASE.Folio] = dataGenerate[BASE.Serie]
          }
          if (dataGenerate[BASE.Serie] === '' && dataGenerate[BASE.Folio] !== '') {
            dataGenerate[BASE.Serie] = dataGenerate[BASE.Folio]
          }
          let hadHyphen = basePmt[PAYMENT.FIELDS.FOLIO].value.indexOf('-');
          if (hadHyphen != -1 && runtime.accountId.includes('5907646') == true) {
            dataGenerate[BASE.Serie] = basePmt[PAYMENT.FIELDS.FOLIO].value.split('-')[0];
            dataGenerate[BASE.Folio] = basePmt[PAYMENT.FIELDS.FOLIO].value.split('-')[1];
          }
          // Do not use the date of transaction, use the current date
          const currentDate = new Date()
          let offset = -6 // Mexico City timezone offset from UTC in hours<
          // ZAHORI TIMBRA COMO SI FUERA DE TIJUANA
          if (runtime.accountId.includes('5610235')) {
            offset = -7;
          }
          const offsetSign = offset > 0 ? '-' : '+'
          const absOffset = Math.abs(offset)
          const offsetHours = String(Math.floor(absOffset)).padStart(2, '0')
          const offsetMinutes = String((absOffset % 1) * 60).padStart(2, '0')
          const timezone = `${offsetSign}${offsetHours}:${offsetMinutes}`
          const formattedDate2 = currentDate.toISOString().slice(0, 19) + timezone
          dataGenerate[BASE.Fecha] = formattedDate2
          // dataGenerate[BASE.Fecha] = basePmt[PAYMENT.FIELDS.DATE].value
          // dataGenerate[BASE.LugarExpedicion] = getLocationZip(basePmt[PAYMENT.FIELDS.LOCATION].value)
          /** Emisor */
          const emisor = isOW ? functions.getSubsidiaryInformation(basePmt[PAYMENT.FIELDS.SUBSIDIARY].value) : functions.getCompanyInformation()
          log.debug('generateJSON ~ emisor:', emisor)
          let auxRfc = ''
          if (isOW) {
            let registroCompania = record.load({
              type: record.Type.SUBSIDIARY,
              id: basePmt[PAYMENT.FIELDS.SUBSIDIARY].value
            })
            let lineCount = registroCompania.getLineCount({
              sublistId: 'taxregistration'
            })
            let pais = ''
            for (let i = 0; i < lineCount; i++) {
              pais = registroCompania.getSublistValue({
                sublistId: 'taxregistration',
                fieldId: 'nexuscountry',
                line: i
              })
              if (pais === 'MX') {
                auxRfc = registroCompania.getSublistValue({
                  sublistId: 'taxregistration',
                  fieldId: 'taxregistrationnumber',
                  line: i
                })
                break
              }
            }
          } else {
            //TODO:AGREGAR SEGUNDO CASO PARA RFC DE SUBSIDIARIA.
          }
          log.debug({ title: 'auxRfc', details: auxRfc })
          dataGenerate[BASE.Emisor] = {}
          if (isOW) {
            let rfcEmisorAux = ''
            // if (emisor[functions.SUBSIDIARY.FIELDS.RFC] == null) {
            rfcEmisorAux = getEmisorRFC(basePmt[PAYMENT.FIELDS.SUBSIDIARY].value)
            // }
            // dataGenerate[BASE.Emisor][EMISOR.Rfc] = emisor[functions.SUBSIDIARY.FIELDS.RFC] == null ? rfcEmisorAux : emisor[functions.SUBSIDIARY.FIELDS.RFC]
            dataGenerate[BASE.Emisor][EMISOR.Rfc] = rfcEmisorAux
            dataGenerate[BASE.Emisor][EMISOR.Nombre] = emisor[functions.SUBSIDIARY.FIELDS.LEGAL_NAME]
            dataGenerate[BASE.Emisor][EMISOR.RegimenFiscal] = Number(emisor[functions.SUBSIDIARY.FIELDS.REG_FIS])
            dataGenerate[BASE.LugarExpedicion] = emisor[functions.SUBSIDIARY.FIELDS.ZIP]
          } else {
            log.emergency({ title: 'emisor NOT OW', details: emisor })
            dataGenerate[BASE.Emisor][EMISOR.Rfc] = emisor[functions.COMPANY.FIELDS.RFC]
            dataGenerate[BASE.Emisor][EMISOR.Nombre] = emisor[functions.COMPANY.FIELDS.LEGAL_NAME]
            dataGenerate[BASE.Emisor][EMISOR.RegimenFiscal] = Number(emisor[functions.COMPANY.FIELDS.REG_FIS])
            dataGenerate[BASE.LugarExpedicion] = emisor.zip
          }
          /** Receptor */
          const receptor = getCustomerInformation(
            receFactoraje[FACTORAJE.CHECK_FAC].value != true ? basePmt[PAYMENT.FIELDS.CUSTOMER].value : receFactoraje[FACTORAJE.CLIENT].value
          )
          dataGenerate[BASE.Receptor] = {}
          dataGenerate[BASE.Receptor][RECEPTOR.Rfc] = receptor[CUSTOMER.FIELDS.RFC]
          // AQUI se llena informacion faltante
          let otherCustomerInformation = getCustomerBasicInformationPMT(
            receFactoraje[FACTORAJE.CHECK_FAC].value != true ? basePmt[PAYMENT.FIELDS.CUSTOMER].value : receFactoraje[FACTORAJE.CLIENT].value
          )
          dataGenerate[BASE.Receptor][RECEPTOR.Nombre] = otherCustomerInformation.NombreSAT;
          dataGenerate[BASE.Receptor][RECEPTOR.DomicilioFiscalReceptor] =
            receptor[CUSTOMER.FIELDS.RFC] == 'XAXX010101000' || receptor[CUSTOMER.FIELDS.RFC] == 'XEXX010101000'
              ? dataGenerate[BASE.LugarExpedicion]
              : otherCustomerInformation.DomicilioFiscalReceptor
          dataGenerate[BASE.Receptor][RECEPTOR.RegimenFiscalReceptor] = otherCustomerInformation.regFiscal
          //TODO:Agregar UsoCFDI dinamico de acuerdo al Pago. Por confimar.
          dataGenerate[BASE.Receptor][RECEPTOR.UsoCFDI] = 'CP01'
          // It should not use the customer's uso de cfdi because a payment must have CP01 ALWAYS
          // dataGenerate[BASE.Receptor][RECEPTOR.UsoCFDI] = receptor[CUSTOMER.FIELDS.USO_CFDI]
          /** Conceptos */
          dataGenerate[BASE.Conceptos] = []
          dataGenerate[BASE.Conceptos].push({
            [CONCEPTO.ClaveProdServ]: '84111506',
            [CONCEPTO.Cantidad]: 1,
            [CONCEPTO.ClaveUnidad]: 'ACT',
            [CONCEPTO.Descripcion]: 'Pago',
            [CONCEPTO.ValorUnitario]: 0,
            [CONCEPTO.Importe]: 0,
            [CONCEPTO.ObjetoImp]: '01'
          })
          /** Complemento */
          const paymentDetails = getPaymentApply(recordId)
          log.debug('generateJSON ~ paymentDetails:', paymentDetails)
          dataGenerate[BASE.Complemento] = {}
          dataGenerate[BASE.Complemento][COMPLEMENTO.Any] = []
          const pagos = {}
          pagos[COMPLEMENTO.Pago20] = {}
          pagos[COMPLEMENTO.Pago20][PAGOS.Version] = '2.0'
          let totalTB = ''
          let totalTI = ''
          let auxImpT = 0
          let auxTotal = {}
          paymentDetails.forEach(invoice => {
            const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
            const objApply = dataApply.find((numRef) => numRef.refnum === invoice[INVOICE.FIELDS.DOC_NUM].value)
            auxImpT = auxImpT + Number(objApply.amount)
            // auxImpT = receFactoraje[FACTORAJE.CHECK_FAC].value == true ? Number(invoice[INVOICE.FIELDS.AMOUNT_PAID].value) - invoice[INVOICE.FIELDS.FACTORAJE].value : invoice[INVOICE.FIELDS.AMOUNT_PAID].value
            if (Object.keys(tax_json).length) {
              if (Object.keys(tax_json.rates_iva).length) {
                Object.keys(tax_json.bases_iva).forEach(key => {
                  let tax = (key / 100).toFixed(6)
                  switch (key) {
                    case '16':
                      totalTB = 'TotalTrasladosBaseIVA16'
                      totalTI = 'TotalTrasladosImpuestoIVA16'
                      break
                    case '8':
                      totalTB = 'TotalTrasladosBaseIVA8'
                      totalTI = 'TotalTrasladosImpuestoIVA8'
                      break
                    case '0':
                      totalTB = 'TotalTrasladosBaseIVA0'
                      totalTI = 'TotalTrasladosImpuestoIVA0'
                      break
                    default:
                      log.debug({ title: 'Error in case total tax', details: 'Error in case total tax' })
                      break
                  }
                  auxTotal[tax] = {
                    totalTB,
                    totalTI
                  }
                })
              } else {
                log.debug({ title: 'Error in selec tax', details: 'Error in selec tax' })
              }
            }
            // (Object.keys(tax_json.rates_exento).length !== 0) || (Object.keys(tax_json.rates_ieps_data).length !== 0) && (Object.keys(tax_json.rates_iva).length === 0)
            // if (Object.keys(tax_json.rates_exento).length) {
            if ((Object.keys(tax_json.rates_exento).length !== 0) || (Object.keys(tax_json.rates_ieps_data).length !== 0) && (Object.keys(tax_json.rates_iva).length === 0)) {
              pagos[COMPLEMENTO.Pago20][PAGOS.Totales] = {
                [PAGOS.MontoTotalPagos]: 0
              }
            } else {
              Object.values(auxTotal).forEach(value => {
                if (!pagos[COMPLEMENTO.Pago20][PAGOS.Totales]) {
                  pagos[COMPLEMENTO.Pago20][PAGOS.Totales] = {}
                }
                pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTB] = 0
                pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTI] = 0
              })
              pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] = 0
            }
          })
          log.audit({title:'pagos[COMPLEMENTO.Pago20][PAGOS.Totales]',details:pagos[COMPLEMENTO.Pago20][PAGOS.Totales]});
          log.debug({ title: 'auxTotal', details: auxTotal })
          pagos[COMPLEMENTO.Pago20][PAGOS.Pagos] = []
          log.debug({ title: 'recordId', details: recordId })
          const pago = {}
          let arrPagos = []
          pago[PAGO.FechaPago] = basePmt[PAYMENT.FIELDS.DATE].value
          if (runtime.accountId.includes('6212323')) {
            const objSearchDate = search.lookupFields({
              type: search.Type.CUSTOMER_PAYMENT,
              id: recordId,
              columns: ['custbody_efx_fe_fechadepago']
            })
            let dateComver = JSON.stringify(objSearchDate)
            let forDate = JSON.parse(dateComver)
            forDate = forDate.custbody_efx_fe_fechadepago.split('/')
            let forTime = currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds()
            let dateFormVNA = forDate[2] + '-' + forDate[1] + '-' + forDate[0] + 'T' + forTime
            log.audit({ title: 'ObjSearchDate💀💀💀', details: [typeof dateFormVNA, dateFormVNA] });
            pago[PAGO.FechaPago] = dateFormVNA
          }
          // pago[PAGO.FechaPago] = dataGenerate[BASE.Fecha]
          pago[PAGO.FormaDePagoP] = functions.getPaymentMethod(basePmt[PAYMENT.FIELDS.PMT_METHOD].value)
          if (basePmt[PAYMENT.FIELDS.CURRENCY].text === 'Pesos' || basePmt[PAYMENT.FIELDS.CURRENCY].text === 'Peso' || basePmt[PAYMENT.FIELDS.CURRENCY].text === 'MEX' || basePmt[PAYMENT.FIELDS.CURRENCY].text === 'MXN') {
            pago[PAGO.MonedaP] = 'MXN'
          } else {
            pago[PAGO.MonedaP] = basePmt[PAYMENT.FIELDS.CURRENCY].text
          }
          pago[PAGO.TipoCambioP] = Number(basePmt[PAYMENT.FIELDS.EXCHANGE_RATE].value).toFixed(pago[PAGO.MonedaP] !== 'MXN' ? 4 : 0)
          // pago[PAGO.TipoCambioP] = '1' // Number(basePmt[PAYMENT.FIELDS.EXCHANGE_RATE].value).toFixed(pago[PAGO.MonedaP] !== 'MXN' ? 4 : 0)
          pago[PAGO.Monto] = Number(auxImpT).toFixed(2);
          let recordPayment = record.load({
            type: record.Type.CUSTOMER_PAYMENT,
            id: recordId
          });
          if (recordPayment.getValue('custbody_mx_cfdi_payment_id') != null && recordPayment.getValue('custbody_mx_cfdi_payment_id') != '' && recordPayment.getValue('custbody_mx_cfdi_payment_id') != undefined) {
            pago.NumOperacion = recordPayment.getValue('custbody_mx_cfdi_payment_id');
          }
          // pago[PAGO.Monto] = receFactoraje[FACTORAJE.CHECK_FAC].value != true ? Number(basePmt[PAYMENT.FIELDS.TOTAL].value).toFixed(2) : Number(auxImpT).toFixed(2)
          //TODO: BORRAR COMENTARIOS
          /*paymentDetails.forEach(invoice => {
            const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
            if (Object.keys(tax_json).length) {
              if (Object.keys(tax_json.rates_iva).length) {
                Object.keys(tax_json.bases_iva).forEach(key => {*/
          // pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS[totalTB]] += pago[PAGO.MonedaP] !== 'MXN' ? Number(tax_json.bases_iva[key]) * pago[PAGO.TipoCambioP] : Number(tax_json.bases_iva[key])
          // pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS[totalTI]] += Number(tax_json.rates_iva_data[key])
          pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] = parseFloat(pago[PAGO.Monto])
          // pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] = roundHalfUpSix(parseFloat(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos])).toFixed(2)*/
          /*})
              } else {
                log.debug({ title: 'Error in assing value tax', details: 'Error in assing value tax' })
              }
            }
          })*/
          const typePay = Object.keys(pagos[COMPLEMENTO.Pago20][PAGOS.Totales]).length
          if (typePay === 1) {
            var caseExento = true
          }
          log.debug({ title: 'caseExento', details: caseExento })
          let arraySumP = {}
          pago[PAGO.DoctoRelacionado] = [];
          var arr_agrupadoPorImpuestoIEPS = [];
          paymentDetails.forEach(invoice => {
            const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
            const objApply = dataApply.find((numRef) => numRef.refnum === invoice[INVOICE.FIELDS.DOC_NUM].value)
            const partiality = basePmt[PAYMENT.FIELDS.PARTIALITY].value.find(fact => fact.facturaId == invoice[INVOICE.FIELDS.ID].value)
            const lineInv = {}
            lineInv[DOC_REL.IdDocumento] = invoice[INVOICE.FIELDS.UUID].value
            // MOD: serie y folio descuadrado
            lineInv[DOC_REL.Folio] = (invoice[INVOICE.FIELDS.DOC_NUM].value.match(/\d+/g)).toString();
            lineInv[DOC_REL.Serie] = ((invoice[INVOICE.FIELDS.DOC_NUM].value.match(/[a-zA-Z]+/g)) != null ? (invoice[INVOICE.FIELDS.DOC_NUM].value.match(/[a-zA-Z]+/g)) : lineInv[DOC_REL.Folio]).toString();
            // MOD:folio a veces no alcanza a tener todos los numeros, entonces has que sea igual a la serie
            if (lineInv[DOC_REL.Folio] == '') {
              lineInv[DOC_REL.Folio] = lineInv[DOC_REL.Serie]
            }
            let hadHyphen = invoice[INVOICE.FIELDS.DOC_NUM].value.indexOf('-');
            if (hadHyphen != -1 && runtime.accountId.includes('5907646') == true) {
              lineInv[DOC_REL.Serie] = invoice[INVOICE.FIELDS.DOC_NUM].value.split('-')[0];
              lineInv[DOC_REL.Folio] = invoice[INVOICE.FIELDS.DOC_NUM].value.split('-')[1];
            }
            if (invoice[INVOICE.FIELDS.CURRENCY].text === 'Pesos' || invoice[INVOICE.FIELDS.CURRENCY].text === 'MEX') {
              lineInv[DOC_REL.MonedaDR] = 'MXN'
            } else {
              lineInv[DOC_REL.MonedaDR] = invoice[INVOICE.FIELDS.CURRENCY].text
            }
            lineInv[DOC_REL.EquivalenciaDR] = '1' // Number(invoice[INVOICE.FIELDS.EXCHANGE_RATE].value).toFixed(pago[PAGO.MonedaP] !== 'MXN' ? 4 : 0)
            // lineInv[DOC_REL.EquivalenciaDR] = lineInv[DOC_REL.EquivalenciaDR] == pago[PAGO.TipoCambioP] ? '1' : lineInv[DOC_REL.EquivalenciaDR]
            lineInv[DOC_REL.NumParcialidad] = Number(partiality?.parcialidad ?? 1).toFixed(0)
            lineInv[DOC_REL.ImpSaldoAnt] = Number(partiality?.imp ?? invoice[INVOICE.FIELDS.TOTAL].value).toFixed(2)
            lineInv[DOC_REL.ImpPagado] = Number(objApply.amount).toFixed(2) //Number(invoice[INVOICE.FIELDS.AMOUNT_PAID].value).toFixed(2)
            lineInv[DOC_REL.ImpSaldoInsoluto] = parseFloat(lineInv[DOC_REL.ImpSaldoAnt]) - parseFloat(lineInv[DOC_REL.ImpPagado])
            lineInv[DOC_REL.ImpSaldoInsoluto] = parseFloat(lineInv[DOC_REL.ImpSaldoInsoluto]).toFixed(2)
            if (Object.keys(tax_json).length) {
              if (Object.keys(tax_json.rates_iva).length || Object.keys(tax_json.rates_ieps_data).length) {
                lineInv[DOC_REL.ObjetoImpDR] = '02'
              } else if (Object.keys(tax_json.rates_exento).length) {
                lineInv[DOC_REL.ObjetoImpDR] = '01'
              }
            }
            log.audit({title:'lineInv ☠️',details:lineInv});
            if (!Object.keys(tax_json.rates_exento).length) {
              lineInv[DOC_REL.ImpuestosDR] = {}
              lineInv[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR] = []
              if (Object.keys(tax_json).length) {
                if (Object.keys(tax_json.rates_iva).length) {
                  Object.entries(tax_json.bases_iva).forEach(([key, value]) => {
                    const trasladoDR = {}
                    let tax = key / 100
                    let auxBaseDR = receFactoraje[FACTORAJE.CHECK_FAC].value != true ? objApply.amount / (1 + tax) : (invoice[INVOICE.FIELDS.TOTAL].value - invoice[INVOICE.FIELDS.FACTORAJE].value) / (1 + tax)
                    trasladoDR[DOC_REL.BaseDR] = Number(auxBaseDR).toFixed(6)
                    trasladoDR[DOC_REL.ImpuestoDR] = '002'
                    trasladoDR[DOC_REL.TipoFactorDR] = 'Tasa'
                    trasladoDR[DOC_REL.TasaOCuotaDR] = Number(key / 100).toFixed(6)
                    let auxImp = parseFloat(trasladoDR[DOC_REL.TasaOCuotaDR]) * parseFloat(trasladoDR[DOC_REL.BaseDR])
                    trasladoDR[DOC_REL.ImporteDR] = parseFloat(auxImp).toFixed(6)
                    lineInv[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR].push(trasladoDR)
                    lineInv[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR].forEach(obj => {
                      if (!arraySumP[obj[DOC_REL.TasaOCuotaDR]]) {
                        arraySumP[obj[DOC_REL.TasaOCuotaDR]] = {
                          [DOC_REL.BaseDR]: 0,
                          [DOC_REL.ImporteDR]: 0
                        }
                      }
                      if (obj[DOC_REL.TasaOCuotaDR] === trasladoDR[DOC_REL.TasaOCuotaDR]) {
                        arraySumP[obj[DOC_REL.TasaOCuotaDR]][DOC_REL.BaseDR] += Number(obj[DOC_REL.BaseDR])
                        arraySumP[obj[DOC_REL.TasaOCuotaDR]][DOC_REL.ImporteDR] += Number(obj[DOC_REL.ImporteDR])
                      }
                    })
                  })
                } else {
                  log.debug({ title: 'Error in ImpuestosDR', details: 'Error in ImpuestosDR' })
                }
              }
            }
            log.audit({title: 'lineInv ☠️☠️', details: lineInv})
            // MOD: verifica si tiene desglose de IEPS en Facturas
            if (invoice[INVOICE.FIELDS.JSON_GENERADO].value) {
              // Carga el archivo de JSON Generado
              let archivoIDJSON_Generado = invoice[INVOICE.FIELDS.JSON_GENERADO].value;
              let archivoJSON_Generado = file.load({
                id: archivoIDJSON_Generado
              });
              let contenidoJSON_Generado = archivoJSON_Generado.getContents();
              let jsonGenerado = JSON.parse(contenidoJSON_Generado);
              // Carga los totales de impuestos si tiene IEPS
              if (jsonGenerado.Impuestos && jsonGenerado.Impuestos.Traslados) {
                jsonGenerado.Impuestos.Traslados.forEach(ieps => {
                  if (ieps.Impuesto == '003') {
                    let trasladoDR = {};
                    trasladoDR[DOC_REL.BaseDR] = ieps.Base;
                    trasladoDR[DOC_REL.ImpuestoDR] = '003';
                    trasladoDR[DOC_REL.TipoFactorDR] = 'Tasa';
                    trasladoDR[DOC_REL.TasaOCuotaDR] = ieps.TasaOcuota;
                    trasladoDR[DOC_REL.ImporteDR] = ieps.Importe;
                    let trasladoP_IEPS = {};
                    trasladoP_IEPS[IMPUESTOS.BaseP] = ieps.Base;
                    trasladoP_IEPS[IMPUESTOS.ImpuestoP] = '003';
                    trasladoP_IEPS[IMPUESTOS.TipoFactorP] = 'Tasa';
                    trasladoP_IEPS[IMPUESTOS.TasaOCuotaP] = ieps.TasaOcuota;
                    trasladoP_IEPS[IMPUESTOS.ImporteP] = ieps.Importe;

                    arr_agrupadoPorImpuestoIEPS.push(trasladoP_IEPS);
                    lineInv[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR].push(trasladoDR);
                    log.audit({ title: 'trasladoDR👽👽👽', details: trasladoDR });
                  }
                });
              }
            }
            pago[PAGO.DoctoRelacionado].push(lineInv)
          })
          log.audit({title:'arr_agrupadoPorImpuestoIEPS',details:arr_agrupadoPorImpuestoIEPS});
          log.debug({ title: 'arraySumP', details: arraySumP })
          if (caseExento !== true || arr_agrupadoPorImpuestoIEPS.length > 0) {
            pago[PAGO.ImpuestosP] = {}
            pago[PAGO.ImpuestosP][PAGO.TrasladosP] = []
            const impuestoAux = {}
            paymentDetails.forEach(invoice => {
              const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
              if (Object.keys(tax_json).length) {
                if (Object.keys(tax_json.rates_iva).length) {
                  Object.entries(tax_json.bases_iva).forEach(([key, value]) => {
                    if (!impuestoAux?.[key]) {
                      impuestoAux[key] = {}
                      Object.keys(IMPUESTOS).forEach(entry => (impuestoAux[key][entry] = 0))
                    }
                    let tax = (key / 100).toFixed(6)
                    Object.entries(arraySumP).forEach(([tasa, val]) => {
                      if (tasa === tax) {
                        impuestoAux[key][IMPUESTOS.BaseP] = val[DOC_REL.BaseDR]
                        impuestoAux[key][IMPUESTOS.ImporteP] = val[DOC_REL.ImporteDR]
                      }
                      Object.entries(auxTotal).forEach(([taxt, valu]) => {
                        if (taxt === tasa) {
                          pagos[COMPLEMENTO.Pago20][PAGOS.Totales][valu.totalTB] = val[DOC_REL.BaseDR]
                          log.debug({ title: 'totalTB', details: [pagos[COMPLEMENTO.Pago20][PAGOS.Totales][valu.totalTB], pago[PAGO.TipoCambioP], val[DOC_REL.BaseDR] * Number(pago[PAGO.TipoCambioP])] })
                          pagos[COMPLEMENTO.Pago20][PAGOS.Totales][valu.totalTI] = val[DOC_REL.ImporteDR]
                        }
                      })
                    })
                    impuestoAux[key][IMPUESTOS.ImpuestoP] = '002'
                    impuestoAux[key][IMPUESTOS.TipoFactorP] = 'Tasa'
                    impuestoAux[key][IMPUESTOS.TasaOCuotaP] = Number(key / 100)
                  })
                } else {
                  log.debug({ title: 'Error in ImpuestosP', details: 'Error in ImpuestosP' })
                }
              }
            })
            Object.values(impuestoAux).forEach(impuesto => pago[PAGO.ImpuestosP][PAGO.TrasladosP].push(impuesto))
            pago[PAGO.ImpuestosP][PAGO.TrasladosP].forEach(p => {
              p[IMPUESTOS.BaseP] = Number(p[IMPUESTOS.BaseP]).toFixed(6)
              p[IMPUESTOS.TasaOCuotaP] = Number(p[IMPUESTOS.TasaOCuotaP]).toFixed(6)
              p[IMPUESTOS.ImporteP] = Number(p[IMPUESTOS.ImporteP]).toFixed(6)
            });
            // Add the ones from IEPS
            if (arr_agrupadoPorImpuestoIEPS.length > 0) {
              arr_agrupadoPorImpuestoIEPS.forEach(ieps => {
                pago[PAGO.ImpuestosP][PAGO.TrasladosP].push(ieps);
              });
              let groupedTrasladosP = {};
              pago[PAGO.ImpuestosP][PAGO.TrasladosP].forEach(item => {
                let tasa = item.TasaOCuotaP;
                if (!groupedTrasladosP[tasa]) {
                  groupedTrasladosP[tasa] = { ...item, BaseP: 0, ImporteP: 0 };
                }
                groupedTrasladosP[tasa].BaseP = (parseFloat(groupedTrasladosP[tasa].BaseP) + parseFloat(item.BaseP)).toFixed(6);
                groupedTrasladosP[tasa].ImporteP = (parseFloat(groupedTrasladosP[tasa].ImporteP) + parseFloat(item.ImporteP)).toFixed(6);
              });
              pago[PAGO.ImpuestosP][PAGO.TrasladosP] = Object.values(groupedTrasladosP);
            }
          }
          arrPagos.push(pago)
          if (receFactoraje[FACTORAJE.CHECK_FAC].value == true) {
            // Factoraje
            let objSumFacP = {}
            const objFact = {}
            objFact[PAGO.FechaPago] = basePmt[PAYMENT.FIELDS.DATE].value
            //  objFact[PAGO.FechaPago] = dataGenerate[BASE.Fecha].split('+')[0]
            objFact[PAGO.FormaDePagoP] = functions.getPaymentMethod(basePmt[PAYMENT.FIELDS.PMT_METHOD].value)
            if (basePmt[PAYMENT.FIELDS.CURRENCY].text == 'Pesos') {
              objFact[PAGO.MonedaP] = 'MXN'
            } else {
              objFact[PAGO.MonedaP] = basePmt[PAYMENT.FIELDS.CURRENCY].text
            }
            objFact[PAGO.TipoCambioP] = Number(basePmt[PAYMENT.FIELDS.EXCHANGE_RATE].value).toFixed(pago[PAGO.MonedaP] !== 'MXN' ? 4 : 0)
            objFact[PAGO.Monto] = Number(receFactoraje[FACTORAJE.T_FACT].value).toFixed(2)
            objFact[PAGO.DoctoRelacionado] = []
            paymentDetails.forEach(invoice => {
              const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
              // const partiality = basePmt[PAYMENT.FIELDS.PARTIALITY].value.find(fact => fact.facturaId == invoice[INVOICE.FIELDS.ID].value)
              const linFact = {}
              linFact[DOC_REL.IdDocumento] = invoice[INVOICE.FIELDS.UUID].value
              // linFact[DOC_REL.Serie] = invoice[INVOICE.FIELDS.DOC_NUM].value.slice(0, 3)
              // linFact[DOC_REL.Folio] = invoice[INVOICE.FIELDS.DOC_NUM].value.slice(4, invoice[INVOICE.FIELDS.DOC_NUM].value.length)
              // MOD: serie y folio descuadrado
              linFact[DOC_REL.Folio] = (invoice[INVOICE.FIELDS.DOC_NUM].value.match(/\d+/g)).toString();
              linFact[DOC_REL.Serie] = ((invoice[INVOICE.FIELDS.DOC_NUM].value.match(/[a-zA-Z]+/g)) != null ? (invoice[INVOICE.FIELDS.DOC_NUM].value.match(/[a-zA-Z]+/g)) : linFact[DOC_REL.Folio]).toString();
              let hadHyphen = invoice[INVOICE.FIELDS.DOC_NUM].value.indexOf('-');
              if (hadHyphen != -1 && runtime.accountId.includes('5907646') == true) {
                linFact[DOC_REL.Serie] = invoice[INVOICE.FIELDS.DOC_NUM].value.split('-')[0];
                linFact[DOC_REL.Folio] = invoice[INVOICE.FIELDS.DOC_NUM].value.split('-')[1];
              }
              if (invoice[INVOICE.FIELDS.CURRENCY].text === 'Pesos' || invoice[INVOICE.FIELDS.CURRENCY].text === 'MEX') {
                linFact[DOC_REL.MonedaDR] = 'MXN'
              } else {
                linFact[DOC_REL.MonedaDR] = invoice[INVOICE.FIELDS.CURRENCY].text
              }
              linFact[DOC_REL.EquivalenciaDR] = '1' // Number(invoice[INVOICE.FIELDS.EXCHANGE_RATE].value).toFixed(pago[PAGO.MonedaP] !== 'MXN' ? 4 : 0)
              // lineInv[DOC_REL.EquivalenciaDR] = lineInv[DOC_REL.EquivalenciaDR] == pago[PAGO.TipoCambioP] ? '1' : lineInv[DOC_REL.EquivalenciaDR]
              linFact[DOC_REL.NumParcialidad] = Number(1).toFixed(0)
              linFact[DOC_REL.ImpSaldoAnt] = Number(invoice[INVOICE.FIELDS.FACTORAJE].value).toFixed(2)
              linFact[DOC_REL.ImpPagado] = Number(invoice[INVOICE.FIELDS.FACTORAJE].value).toFixed(2)
              linFact[DOC_REL.ImpSaldoInsoluto] = Number(parseFloat(linFact[DOC_REL.ImpSaldoAnt]) - parseFloat(linFact[DOC_REL.ImpPagado])).toFixed(2)
              // linFact[DOC_REL.ImpSaldoInsoluto] = Number(invoice[INVOICE.FIELDS.AMOUNT_REMAINING].value).toFixed(2)
              if (Object.keys(tax_json).length) {
                // TODO: CAMBIAR LA FORMA EN LA QUE SE OBTIENE EL OBJETO DE IMPUESTO CON O SIN FACTORAJE
                if (Object.keys(tax_json.rates_iva).length) {
                  linFact[DOC_REL.ObjetoImpDR] = '02'
                }
              }
              linFact[DOC_REL.ImpuestosDR] = {}
              linFact[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR] = []
              if (Object.keys(tax_json).length) {
                if (!Object.keys(tax_json.rates_exento).length) {
                  if (Object.keys(tax_json.rates_iva).length) {
                    Object.entries(tax_json.bases_iva).forEach(([key, value]) => {
                      const trasDRFac = {}
                      let tax = key / 100
                      trasDRFac[DOC_REL.BaseDR] = Number(invoice[INVOICE.FIELDS.FACTORAJE].value / (tax + 1)).toFixed(6)
                      // sumBasep = sumBasep + Number(trasDRFac[DOC_REL.BaseDR])
                      trasDRFac[DOC_REL.ImpuestoDR] = '002'
                      trasDRFac[DOC_REL.TipoFactorDR] = 'Tasa'
                      trasDRFac[DOC_REL.TasaOCuotaDR] = Number(key / 100).toFixed(6)
                      trasDRFac[DOC_REL.ImporteDR] = (Number(invoice[INVOICE.FIELDS.FACTORAJE].value / (tax + 1)) * Number(key / 100)).toFixed(6)
                      // sumImp = sumImp + Number(trasDRFac[DOC_REL.ImporteDR])
                      linFact[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR].push(trasDRFac)
                      linFact[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR].forEach(obj => {
                        if (!objSumFacP[obj[DOC_REL.TasaOCuotaDR]]) {
                          objSumFacP[obj[DOC_REL.TasaOCuotaDR]] = {
                            [DOC_REL.BaseDR]: 0,
                            [DOC_REL.ImporteDR]: 0
                          }
                        }
                        if (obj[DOC_REL.TasaOCuotaDR] === trasDRFac[DOC_REL.TasaOCuotaDR]) {
                          objSumFacP[obj[DOC_REL.TasaOCuotaDR]][DOC_REL.BaseDR] += Number(obj[DOC_REL.BaseDR])
                          objSumFacP[obj[DOC_REL.TasaOCuotaDR]][DOC_REL.ImporteDR] += Number(obj[DOC_REL.ImporteDR])
                        }
                      })
                    })
                  } else {
                    log.debug({ title: 'Error in ImpuestosDR factoraje', details: 'Error in ImpuestosDR factoraje' })
                  }
                }
              }
              objFact[PAGO.DoctoRelacionado].push(linFact)
            })
            log.debug({ title: 'objSumFacP', details: objSumFacP })
            if (caseExento !== true) {
              objFact[PAGO.ImpuestosP] = {}
              objFact[PAGO.ImpuestosP][PAGO.TrasladosP] = []
              const taxAux = {}
              let payTotal = {}
              payTotal[COMPLEMENTO.Pago20] = {}
              paymentDetails.forEach(invoice => {
                const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
                if (Object.keys(tax_json).length) {
                  Object.values(auxTotal).forEach(value => {
                    if (!payTotal[COMPLEMENTO.Pago20][PAGOS.Totales]) {
                      payTotal[COMPLEMENTO.Pago20][PAGOS.Totales] = {}
                    }
                    payTotal[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTB] = 0
                    payTotal[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTI] = 0
                  })
                  if (Object.keys(tax_json.rates_iva).length) {
                    Object.entries(tax_json.bases_iva).forEach(([key, value]) => {
                      if (!taxAux?.[key]) {
                        taxAux[key] = {}
                        Object.keys(IMPUESTOS).forEach(entry => (taxAux[key][entry] = 0))
                      }
                      let tax = (key / 100).toFixed(6)
                      Object.entries(objSumFacP).forEach(([tasa, val]) => {
                        if (tasa === tax) {
                          taxAux[key][IMPUESTOS.BaseP] = val[DOC_REL.BaseDR]
                          taxAux[key][IMPUESTOS.ImporteP] = val[DOC_REL.ImporteDR]
                        }
                        Object.entries(auxTotal).forEach(([taxt, valu]) => {
                          if (taxt === tasa) {
                            // log.audit({title:'pagos[COMPLEMENTO.Pago20][PAGOS.Totales][valu.totalTB]',details: [typeof pagos[COMPLEMENTO.Pago20][PAGOS.Totales][valu.totalTB], pagos[COMPLEMENTO.Pago20][PAGOS.Totales][valu.totalTB]]});
                            payTotal[COMPLEMENTO.Pago20][PAGOS.Totales][valu.totalTB] = val[DOC_REL.BaseDR]
                            payTotal[COMPLEMENTO.Pago20][PAGOS.Totales][valu.totalTI] = val[DOC_REL.ImporteDR]
                          }
                        })
                      })
                      /*taxAux[key][IMPUESTOS.BaseP] += sumBasep
                      taxAux[key][IMPUESTOS.ImporteP] += sumImp*/
                      taxAux[key][IMPUESTOS.ImpuestoP] = '002'
                      taxAux[key][IMPUESTOS.TipoFactorP] = 'Tasa'
                      taxAux[key][IMPUESTOS.TasaOCuotaP] = Number(key / 100)
                    })
                  } else {
                    log.debug({ title: 'Error in ImpuestosP factoraje', details: 'Error in ImpuestosP factoraje' })
                  }
                }
              })
              log.audit({ title: 'payTotal 👻', details: payTotal });
              Object.values(taxAux).forEach(impuesto => objFact[PAGO.ImpuestosP][PAGO.TrasladosP].push(impuesto))
              objFact[PAGO.ImpuestosP][PAGO.TrasladosP].forEach(p => {
                p[IMPUESTOS.BaseP] = Number(p[IMPUESTOS.BaseP]).toFixed(6)
                p[IMPUESTOS.TasaOCuotaP] = Number(p[IMPUESTOS.TasaOCuotaP]).toFixed(6)
                p[IMPUESTOS.ImporteP] = Number(p[IMPUESTOS.ImporteP]).toFixed(6)
              })
              Object.entries(payTotal[COMPLEMENTO.Pago20][PAGOS.Totales]).forEach(([key, value]) => {
                Object.entries(pagos[COMPLEMENTO.Pago20][PAGOS.Totales]).forEach(([keyP, valueP]) => {
                  if (key === keyP) {
                    pagos[COMPLEMENTO.Pago20][PAGOS.Totales][key] = value + valueP
                  }
                })
              })
            }
            pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] = pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] + parseFloat(objFact[PAGO.Monto])
            arrPagos.push(objFact)
          }
          pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] = (pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] * parseFloat(pago[PAGO.TipoCambioP])).toFixed(2)
          // pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] = roundHalfUpTree(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] * parseFloat(pago[PAGO.TipoCambioP])).toFixed(2)
          if (caseExento !== true) {
            log.audit({ title: 'Detail Total', details: [typeof pagos[COMPLEMENTO.Pago20][PAGOS.Totales][totalTB], pagos[COMPLEMENTO.Pago20][PAGOS.Totales][totalTB], { typeof: typeof pago[PAGO.TipoCambioP], pago: pago[PAGO.TipoCambioP] }] });
            Object.entries(auxTotal).forEach(([key, value]) => {
              Object.keys(arraySumP).forEach((ke) => {
                if (key === ke) {
                  pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTB] = roundHalfUpSix(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTB] * parseFloat(pago[PAGO.TipoCambioP]))
                  pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTB] = roundHalfUpTree(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTB]).toFixed(2);
                  pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTI] = roundHalfUpSix(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTI] * parseFloat(pago[PAGO.TipoCambioP]))
                  pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTI] = parseFloat(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTI]).toFixed(2);
                  // pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTI] = roundHalfUpTree(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][value.totalTI])
                }
              })
            })
            
          }
          pagos[COMPLEMENTO.Pago20][PAGOS.Pagos] = arrPagos
          // pagos[COMPLEMENTO.Pago20][PAGOS.Pagos].push(pago)
          dataGenerate[BASE.Complemento][COMPLEMENTO.Any].push(pagos)
          
          // MOD: usa alternativa de cambiar el tipo de cambio 01/08/2024
          log.debug({ title: 'recordPayment.getValue("custbody_efx_fe_moneda")', details: recordPayment.getValue("custbody_efx_fe_moneda") != '' });
          if (recordPayment.getValue('custbody_efx_fe_moneda') != '') {
            dataGenerate.Complemento.Any[0]['Pago20:Pagos'].Pago[0].MonedaP = recordPayment.getText('custbody_efx_fe_moneda');
            let tipoCambioOriginal = parseFloat(dataGenerate.Complemento.Any[0]['Pago20:Pagos'].Pago[0].TipoCambioP);
            dataGenerate.Complemento.Any[0]['Pago20:Pagos'].Pago[0].TipoCambioP = '1';
            dataGenerate.Complemento.Any[0]['Pago20:Pagos'].Pago[0].Monto = dataGenerate.Complemento.Any[0]['Pago20:Pagos'].Totales.MontoTotalPagos;
            let sumatoriaBasesDR = 0;
            let copiaEquivalencia = 0;
            dataGenerate.Complemento.Any[0]['Pago20:Pagos'].Pago[0].DoctoRelacionado.forEach((docRel, index) => {
              docRel.EquivalenciaDR = 1 / tipoCambioOriginal;
              docRel.EquivalenciaDR = parseFloat(docRel.EquivalenciaDR).toFixed(10);
              copiaEquivalencia = docRel.EquivalenciaDR;
              docRel.ImpuestosDR.TrasladosDR.forEach((tras, index) => {
                sumatoriaBasesDR += parseFloat(tras.BaseDR);
              });
            });
            dataGenerate.Complemento.Any[0]['Pago20:Pagos'].Pago[0].ImpuestosP.TrasladosP.forEach((tras, index) => {
              log.emergency({ title: 'sumatoriaBasesDR', details: sumatoriaBasesDR + '-' + copiaEquivalencia });
              tras.BaseP = sumatoriaBasesDR / copiaEquivalencia;
              tras.BaseP = parseFloat(tras.BaseP).toFixed(6);
              tras.ImporteP = parseFloat(tras.ImporteP) / copiaEquivalencia;
              tras.ImporteP = parseFloat(tras.ImporteP).toFixed(6);
            });
          }
        }
        // log.debug('generateJSON ~ dataGenerate:', dataGenerate)
      } catch (error) {
        log.error('Error on generateJSON', error)
      }
      log.emergency({ title: 'dataGenerate', details: dataGenerate });
      
      return dataGenerate
    }
    function esTercerDecimalMayorOIgualA5(numero) {
      const tercerDecimal = Math.floor(numero * 1000) % 10;
      
      return tercerDecimal >= 5;
    }
    // function roundHalfUpTree(number) {
    //   log.debug({title:'number 💕',details:number})
    //   return Math.round(number * 100) / 100;
    // }
    function roundHalfUpTree(number) {
      log.debug({ title: 'number 💕', details: number })
      const roundedNumber = Math.round((number + Number.EPSILON) * 100) / 100;
      log.debug({ title: 'roundedNumber', details: roundedNumber });
      return roundedNumber;
    }    // Multiply by 100, round, and then divide by 100
    // function roundHalfUpTree(num) {
    //   var multiplier = 100 // for three decimal places
    //   var adjustedNum = num * multiplier
    //   var rounded = Math.round(adjustedNum)
    //   return rounded / multiplier
    // }
    function roundHalfUpSix(num) {
      var multiplier = 100000 // for three decimal places
      var adjustedNum = num * multiplier
      var rounded = Math.round(adjustedNum)
      return rounded / multiplier
    }
    const recalculateImports4Invoice = (montoPago, saldoInvoiceAnterior) => {
      let data_to_return = {
        ImpPagado: 0,
        ImpSaldoInsoluto: 0
      }
      try {
        data_to_return.ImpPagado = montoPago
        data_to_return.ImpSaldoInsoluto = parseFloat(saldoInvoiceAnterior) - parseFloat(montoPago)
        data_to_return.ImpSaldoInsoluto = data_to_return.ImpSaldoInsoluto.toFixed(2)
      } catch (err) {
        log.error({ title: 'Error occurred in recalculateImports4Invoice', details: err })
      }
      return data_to_return
    }
    /**
     * The function `sendPAC` sends data to a PAC (Proveedor Autorizado de Certificación) service for
     * electronic invoicing.
     * @returns La función `sendPAC` devuelve el objeto `responseData`, que puede contener los datos de
     * respuesta del servicio PAC (Proveedor Autorizado de Certificación) luego de enviar una solicitud
     * con los datos proporcionados. Si ocurre un error durante el proceso, la función detecta el error y
     * lo registra antes de devolver un objeto vacío.
     */
    const sendPAC = (data, recordId) => {
      let responseData = {}
      try {
        log.debug({ title: 'inicia sendPAC', details: 'true' })
        const { PAYMENT } = constants.RECORDS
        const isOW = functions.checkOWAccount()
        const basePmt = getPaymentInformation(recordId)
        log.debug({ title: 'inicia sendPAC 2', details: 'true' })
        const emisor = isOW ? functions.getSubsidiaryInformation(basePmt[PAYMENT.FIELDS.SUBSIDIARY].value) : functions.getCompanyInformation()
        log.debug({ title: 'emisor', details: emisor })
        const { MX_PLUS_CONFIG } = functions
        const allConfig = functions.getConfig()
        log.audit({ title: 'allConfig', details: allConfig })
        let services, apis
        if (allConfig[MX_PLUS_CONFIG.FIELDS.TEST_MODE] == true) {
          services = access_pac.testURL.services
          apis = access_pac.testURL.apis
        } else {
          services = access_pac.prodURL.services
          apis = access_pac.prodURL.apis
        }
        const urlToken = access_pac.resolveURL(services, access_pac.accessPoints.authentication)
        let email = isOW ? emisor[functions.SUBSIDIARY.FIELDS.EMAIL] : emisor[functions.COMPANY.FIELDS.EMAIL]
        log.debug('sendPAC ~ email:', email)
        const tokenAuth = access_pac.getTokenAccess(urlToken, email)
        const headers = {
          Authorization: `Bearer ${tokenAuth.data.token}`,
          'Content-Type': 'application/jsontoxml'
        }
        const urlSend = access_pac.resolveURL(services, access_pac.accessPoints.stamps)
        const response = https.request({
          method: https.Method.POST,
          url: urlSend,
          body: JSON.stringify(data),
          headers
        })
        let jsonAux = JSON.parse(response.body)
        responseData = jsonAux
      } catch (error) {
        log.error('Error on sendPAC', error)
      }
      return responseData ?? {}
    }

    /**
     * La función `getPaymentInformation` recupera información de pago basada en una ID determinada y
     * formatea el valor de la fecha.
     * @returns La función "getPaymentInformation" devuelve información de pago basada en el "id"
     * proporcionado. La función recupera datos de pago de los registros, formatea el campo de fecha y
     * devuelve el objeto de información de pago. Si ocurre un error durante el proceso, se registra.
     */
    const getPaymentInformation = (id, isOW) => {
      const data = {}
      try {
        moment.locale('es-mx')
        const localFormat = functions.getGeneralPreferences()['DATEFORMAT']
        let { PAYMENT } = RECORDS
        log.audit({ title: 'isOW', details: isOW })
        if (isOW == false) {
          delete PAYMENT.FIELDS.SUBSIDIARY
        }
        const filters = [[PAYMENT.FIELDS.ID, search.Operator.IS, id], 'AND', ['mainline', search.Operator.IS, 'T']]
        let columns = Object.values(PAYMENT.FIELDS).map(f => ({ name: f }));
        if (isOW == false) {
          columns = columns.filter(column => column.name !== 'subsidiary')
        }
        if (runtime.isFeatureInEffect({ feature: 'LOCATIONS' }) == false) {
          columns = columns.filter(column => column.name !== 'location')
        }
        const objSearch = search.create({
          type: search.Type.CUSTOMER_PAYMENT,
          filters,
          columns
        })
        const countResults = objSearch.runPaged().count ?? 0
        if (countResults) {
          objSearch.run().each(result => {
            columns.forEach(column => {
              data[column.name] = { value: result.getValue(column), text: result.getText(column) }
            })
            return true
          })
        }
        if (data[PAYMENT.FIELDS.DATE].value) {
          data[PAYMENT.FIELDS.DATE].value = moment(data[PAYMENT.FIELDS.DATE].value, localFormat).format('YYYY-MM-DDTHH:mm:ss')
        }
        if (data[PAYMENT.FIELDS.PARTIALITY].value) {
          data[PAYMENT.FIELDS.PARTIALITY].value = JSON.parse(data[PAYMENT.FIELDS.PARTIALITY].value)
        } else {
          data[PAYMENT.FIELDS.PARTIALITY].value = {}
        }
      } catch (error) {
        log.error('Error on getPaymentInformation', error)
      }
      return data
    }

    const getDataApply = id => {
      const dataApply = []
      try {
        const { PAYMENT } = RECORDS
        let recordPay = record.load({
          type: record.Type.CUSTOMER_PAYMENT,
          id: id,
          isDynamic: true
        })
        let count = recordPay.getLineCount({ sublistId: 'apply' })
        for (let index = 0; index < count; index++) {
          let dataApplyind = {}
          let apply = recordPay.getSublistValue({
            sublistId: PAYMENT.APPLY.ID,
            fieldId: PAYMENT.APPLY.FIELDS.APPLY,
            line: index
          })
          if (apply === true || apply === 'T') {
            let amount = recordPay.getSublistValue({
              sublistId: PAYMENT.APPLY.ID,
              fieldId: PAYMENT.APPLY.FIELDS.AMOUNT,
              line: index
            })
            let refNum = recordPay.getSublistValue({
              sublistId: PAYMENT.APPLY.ID,
              fieldId: PAYMENT.APPLY.FIELDS.REFNUM,
              line: index
            })
            dataApplyind[PAYMENT.APPLY.FIELDS.AMOUNT] = amount
            dataApplyind[PAYMENT.APPLY.FIELDS.REFNUM] = refNum
            dataApply.push(dataApplyind)
          }
        }
      } catch (err) {
        log.error({ title: 'Error occurred in getDataApply', details: err })
      }
      return dataApply
    }

    const dataFactoraje = id => {
      const info = {}
      try {
        const { PAYMENT } = RECORDS
        const filters = [[PAYMENT.FIELDS.ID, search.Operator.IS, id], 'AND', ['mainline', search.Operator.IS, 'T']]
        const columns = Object.values(PAYMENT.FACTORAJE).map(f => ({ name: f }))
        const getObjFact = search.create({
          type: search.Type.CUSTOMER_PAYMENT,
          filters,
          columns
        })
        const index = getObjFact.runPaged().count ?? 0
        if (index) {
          getObjFact.run().each(result => {
            columns.forEach(column => {
              info[column.name] = { value: result.getValue(column), text: result.getText(column) }
            })
            return true
          })
        }
      } catch (err) {
        log.error({ title: 'Error occurred in dataFactoraje', details: err })
      }
      return info
    }

    /**
     * La función `getPaymentApply` recupera solicitudes de pago para un ID de factura específico en
     * NetSuite.
     * @returns La función `getPaymentApply` devuelve una matriz de objetos que contienen datos de
     * aplicación de pago de registros basados en el `id` proporcionado. Si se produce un error durante el
     * proceso, se detectará y registrará, y se devolverá una matriz vacía.
     */
    const getPaymentApply = id => {
      const data = []
      try {
        const { INVOICE } = RECORDS
        const filters = [
          [INVOICE.FIELDS.APPLY_TRAN, search.Operator.ANYOF, id],
          'AND',
          ['type', search.Operator.ANYOF, 'CustInvc'],
          'AND',
          ['mainline', search.Operator.IS, 'T']
        ]
        
        const columns = Object.values(INVOICE.FIELDS).map(f => ({ name: f }))
        const objSearch = search.create({
          type: search.Type.TRANSACTION,
          filters,
          columns
          // settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }]
        })
        const countResults = objSearch.runPaged().count ?? 0
        log.debug({ title: 'countResults', details: countResults })
        if (countResults) {
          objSearch.run().each(result => {
            const line = {}
            columns.forEach(column => {
              line[column.name] = { value: result.getValue(column), text: result.getText(column) }
            })
            // log.debug('objSearch.run ~ line[INVOICE.FIELDS.TAX_JSON]:', line[INVOICE.FIELDS.TAX_JSON])
            if (line[INVOICE.FIELDS.TAX_JSON]?.value) {
              line[INVOICE.FIELDS.TAX_JSON].value = JSON.parse(line[INVOICE.FIELDS.TAX_JSON].value)
            } else {
              line[INVOICE.FIELDS.TAX_JSON].value = {}
            }
            /*let record_transaccion = record.load({
                  type: line[INVOICE.FIELDS.RECORD_TYPE].value,
                  id: line[INVOICE.FIELDS.ID].value,
                  isDynamic: true
                })
                let art_taxjson
                let line_count = record_transaccion.getLineCount({ sublistId: 'item' })
                log.audit({ title: 'line_count 💀💀', details: line_count })
                var taxjson_art = {}
                for (let i = 0; i < line_count; i++) {
                  art_taxjson = record_transaccion.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_efx_fe_tax_json',
                    line: i
                  })
                  taxjson_art[i] = art_taxjson
                }
                log.audit({ title: 'taxjson_art ☠️☠️', details: taxjson_art })*/
            log.debug({ title: 'line 🦕', details: line })
            data.push(line)
            return true
          })
        }
      } catch (error) {
        log.error('Error on getPaymentApply', error)
      }
      return data
    }

    function limites(tax, base, baseC) {
      var montoDeAjuste = false
      try {
        // if (jsonLinea.iva.name != '' && jsonLinea.iva.rate_div > 0) {
        // montoDeAjuste = 0
        var limiteInferior = 0
        var limiteSuperior = 0
        var tasaOcuotaNum = tax
        limiteInferior = (parseFloat(base) - Math.pow(10, -2) / 2) * parseFloat(tasaOcuotaNum)
        limiteInferior = trunc(limiteInferior, 2)
        // limiteSuperior = (parseFloat(jsonLinea.iva.base_importe) + (Math.pow(10, -2)) / 2 - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum);
        limiteSuperior = Math.ceil((parseFloat(base) + Math.pow(10, -2) / 2 - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum) * 100) / 100
        limiteSuperior = parseFloat(limiteSuperior.toFixed(2))
        // jsonLinea.iva.limiteInferior = limiteInferior
        // jsonLinea.iva.limiteSuperior = limiteSuperior
        log.debug({ title: 'limite', details: [limiteSuperior, limiteInferior] })
        if (baseC < limiteSuperior) {
          log.emergency({ title: 'candidato a que se le agregue un centavo', details: 'TRUE' })
          // candidato a que se le agregue un centavo
          montoDeAjuste = true
        }
        // }
        return montoDeAjuste
      } catch (err) {
        log.error({ title: 'Error occurred in esta_dentro_limite', details: err })
      }
    }

    function trunc(x, posiciones) {
      var s = x.toString()
      var l = s.length
      var decimalLength = s.indexOf('.') + 1
      var numStr = s.substr(0, decimalLength + posiciones)
      return parseFloat(numStr)
    }

    /**
     * La función `getLocationZip` recupera el código postal de una ubicación en función de su ID.
     * @returns La función `getLocationZip` devuelve el código postal de una ubicación según el `id`
     * proporcionado. Si se produce un error durante la búsqueda, se detectará y registrará, y se
     * devolverá una cadena vacía.
     */
    const getLocationZip = id => {
      try {
        const columns = ['zip']
        const objSearch = search.lookupFields({
          type: search.Type.LOCATION,
          id,
          columns
        })
        return objSearch[columns[0]] ?? ''
      } catch (error) {
        log.error('Error on getLocationZip', error)
      }
    }

    /**
     * La función "getCustomerInformation" recupera y procesa información del cliente en función de la
     * identificación proporcionada.
     * @returns La función "getCustomerInformation" devuelve información del cliente según el ID del
     * cliente proporcionado. La función recupera datos de una búsqueda utilizando el ID del cliente y
     * columnas específicas definidas en el registro "CLIENTE". Luego procesa los datos recuperados,
     * incluida la conversión de ciertos campos utilizando las funciones auxiliares `getRegFiscal` y
     * `getUsoCFDI`, antes de devolver el objeto de información final del cliente.
     */
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

    /**
     * La función `updatePayment` actualiza un registro de pago de un cliente con datos relacionados a
     * una factura CFDI.
     * @param id - El parámetro "id" en la función "updatePayment" se utiliza para identificar el
     * registro de pago del cliente específico que debe actualizarse. Probablemente sea un identificador
     * único para el registro de pago dentro del sistema, como un ID de transacción o un ID de registro.
     * @param data - Parece que estaba a punto de proporcionar información sobre el parámetro "datos" en
     * la función "actualizarPago", pero falta el contenido. ¿Podría proporcionarnos los detalles o
     * decirme cómo puedo ayudarle más con este fragmento de código?
     * @returns La función `updatePayment` devuelve el `recordId` del registro de pago del cliente
     * actualizado si el archivo se creó correctamente y el registro de pago se actualizó con los datos
     * proporcionados. Si se produce algún error durante el proceso, la función detecta el error y lo
     * registra, pero en ese caso no se proporciona ningún valor de retorno específico.
     */
    const updatePayment = (id, data, jsonGenerado) => {
      try {
        const objSearch = search.lookupFields({ type: search.Type.CUSTOMER_PAYMENT, id, columns: 'tranid' })
        const { PAYMENT } = RECORDS
        if (data !== '') {
          const fileId = createFile(data.cfdi, objSearch['tranid'], data.fechaTimbrado)
          if (fileId) {
            const values = {
              [PAYMENT.FIELDS.E_DOC]: fileId,
              [PAYMENT.FIELDS.UUID]: data.uuid,
              [PAYMENT.FIELDS.TIMESTAMP]: data.fechaTimbrado,
              [PAYMENT.FIELDS.DOC_ORG]: data.cadenaOriginalSAT,
              [PAYMENT.FIELDS.SAT_SIGNATURE]: data.noCertificadoCFDI,
              [PAYMENT.FIELDS.SAT_QR]: data.qrCode,
              [PAYMENT.FIELDS.SAT_SERIAL]: data.noCertificadoSAT,
              [PAYMENT.FIELDS.SAT_STAMP]: data.selloSAT,
              [PAYMENT.FIELDS.SIGNATURE]: data.selloCFDI,
              [PAYMENT.FIELDS.MXPLUS_CERTIFIED]: fileId,
              [PAYMENT.FIELDS.MXPLUS_JSON]: jsonGenerado
            }
            const recordId = record.submitFields({
              type: record.Type.CUSTOMER_PAYMENT,
              id,
              values,
              options: {
                enablesourcing: true,
                ignoreMandatoryFields: true
              }
            })
            return recordId
          }
        } else {
          const values = {
            [PAYMENT.FIELDS.MXPLUS_JSON]: jsonGenerado
          }
          const recordId = record.submitFields({
            type: record.Type.CUSTOMER_PAYMENT,
            id,
            values,
            options: {
              enablesourcing: true,
              ignoreMandatoryFields: true
            }
          })
          return recordId
        }
      } catch (error) {
        log.error('Error on updatePayment', error)
      }
    }

    /**
     * La función `createFile` crea un archivo XML con los datos de pago del cliente y lo guarda en una
     * carpeta específica.
     * @returns La función `createFile` devuelve el resultado de `objFile.save()` o una cadena vacía si
     * el resultado es falso.
     */
    const createFile = (data, tranid, timestamp) => {
      try {
        const allConfig = functions.getConfig()
        const objFile = file.create({
          name: 'PAGO_' + tranid + '.xml',
          //  name: `${tranid}_${moment(timestamp).format('DD/MM/YYYY HH:mm:ss')}.xml`,
          fileType: file.Type.XMLDOC,
          contents: data,
          description: '',
          folder: allConfig[functions.MX_PLUS_CONFIG.FIELDS.FOLDER],
          encoding: file.Encoding.UTF_8,
          isInactive: false,
          isOnline: true
        })
        return objFile.save() ?? ''
      } catch (error) {
        log.error('Error on createFile', error)
      }
    }

    return { generateJSON, sendPAC, updatePayment }
  })