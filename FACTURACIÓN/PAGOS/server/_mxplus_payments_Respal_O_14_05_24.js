/**
 * @NApiVersion 2.1
 */
define(['N/file', 'N/https', 'N/log', 'N/record', 'N/query', 'N/search', '../Pagos/lib/constants', '../lib/access_pac', '../lib/functions_gbl', '../lib/moment'], /**
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
 */ (file, https, log, record, query, search, constants, access_pac, functions, moment) => {
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
  const generateJSON = (recordId, recordType) => {
    log.debug({ title: 'recordId 💀', details: recordId })
    let dataGenerate = {}
    try {
      const { BASE, EMISOR, RECEPTOR, CONCEPTO, COMPLEMENTO, PAGOS, PAGO, DOC_REL, IMPUESTOS } = JSON_EXAMPLE
      const { PAYMENT, CUSTOMER, INVOICE } = RECORDS
      const {FACTORAJE} = PAYMENT
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
      const basePmt = getPaymentInformation(recordId)
      log.debug('generateJSON ~ basePmt:', basePmt)
      const receFactoraje = dataFactoraje(recordId)
      log.debug({ title: 'receFactoraje', details: receFactoraje })
      if (Object.keys(basePmt).length) {
        dataGenerate[BASE.Serie] = basePmt[PAYMENT.FIELDS.FOLIO].value.slice(0, 3)
        dataGenerate[BASE.Folio] = basePmt[PAYMENT.FIELDS.FOLIO].value.slice(4, basePmt[PAYMENT.FIELDS.FOLIO].value.length)
        // Do not use the date of transaction, use the current date
        const currentDate = new Date()
        const offset = -6 // Mexico City timezone offset from UTC in hours<
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
        dataGenerate[BASE.Emisor] = {}
        if (isOW) {
          dataGenerate[BASE.Emisor][EMISOR.Rfc] = emisor[functions.SUBSIDIARY.FIELDS.RFC]
          dataGenerate[BASE.Emisor][EMISOR.Nombre] = emisor[functions.SUBSIDIARY.FIELDS.LEGAL_NAME]
          dataGenerate[BASE.Emisor][EMISOR.RegimenFiscal] = Number(emisor[functions.SUBSIDIARY.FIELDS.REG_FIS])
          dataGenerate[BASE.LugarExpedicion] = emisor[functions.SUBSIDIARY.FIELDS.ZIP]
        } else {
          dataGenerate[BASE.Emisor][EMISOR.Rfc] = emisor[functions.COMPANY.FIELDS.RFC]
          dataGenerate[BASE.Emisor][EMISOR.Nombre] = emisor[functions.COMPANY.FIELDS.LEGAL_NAME]
          dataGenerate[BASE.Emisor][EMISOR.RegimenFiscal] = Number(emisor[functions.COMPANY.FIELDS.REG_FIS])
          dataGenerate[BASE.LugarExpedicion] = emisor[functions.COMPANY.FIELDS.ZIP]
        }
        /** Receptor */
        const receptor = getCustomerInformation(receFactoraje[FACTORAJE.CHECK_FAC].value != true ? basePmt[PAYMENT.FIELDS.CUSTOMER].value : receFactoraje[FACTORAJE.CLIENT].value)
        dataGenerate[BASE.Receptor] = {}
        dataGenerate[BASE.Receptor][RECEPTOR.Rfc] = receptor[CUSTOMER.FIELDS.RFC]
        dataGenerate[BASE.Receptor][RECEPTOR.Nombre] = receptor[CUSTOMER.FIELDS.RFC] == 'XAXX010101000' ? 'PUBLICO GENERAL' : receptor[CUSTOMER.FIELDS.LEGAL_NAME]
        dataGenerate[BASE.Receptor][RECEPTOR.DomicilioFiscalReceptor] = receptor[CUSTOMER.FIELDS.RFC] == 'XAXX010101000' ? dataGenerate[BASE.LugarExpedicion] : receptor[CUSTOMER.FIELDS.ZIP]
        dataGenerate[BASE.Receptor][RECEPTOR.RegimenFiscalReceptor] = receptor[CUSTOMER.FIELDS.REG_FIS]
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
        paymentDetails.forEach(invoice => {
          const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
          auxImpT = receFactoraje[FACTORAJE.CHECK_FAC].value == true ? Number(invoice[INVOICE.FIELDS.AMOUNT_PAID].value) - invoice[INVOICE.FIELDS.FACTORAJE].value : invoice[INVOICE.FIELDS.AMOUNT_PAID].value
          if (Object.keys(tax_json).length) {
            if (Object.keys(tax_json.rates_iva).length) {
              Object.keys(tax_json.bases_iva).forEach((key) => {
                switch (key) {
                  case '16':
                      totalTB = 'TotalTrasladosBaseIVA16'
                      totalTI = 'TotalTrasladosImpuestoIVA16'
                    break;
                  case '8':
                      totalTB = 'TotalTrasladosBaseIVA8'
                      totalTI = 'TotalTrasladosImpuestoIVA8'
                    break;
                  case '0':
                      totalTB = 'TotalTrasladosBaseIVA0'
                      totalTI = 'TotalTrasladosImpuestoIVA0'
                    break;
                  default:
                    log.debug({title:'Error in case total tax',details:'Error in case total tax'});
                    break;
                }
              })
            } else {
              log.debug({title:'Error in selec tax',details:'Error in selec tax'});
            }
          }
          pagos[COMPLEMENTO.Pago20][PAGOS.Totales] = {
            [PAGOS[totalTB]]: 0,
            [PAGOS[totalTI]]: 0,
            [PAGOS.MontoTotalPagos]: 0
          }
        })
        pagos[COMPLEMENTO.Pago20][PAGOS.Pagos] = []
        log.debug({title:'recordId',details:recordId});
        const pago = {}
        let arrPagos = []
        pago[PAGO.FechaPago] = dataGenerate[BASE.Fecha].split('+')[0]
        // pago[PAGO.FechaPago] = dataGenerate[BASE.Fecha]
        pago[PAGO.FormaDePagoP] = functions.getPaymentMethod(basePmt[PAYMENT.FIELDS.PMT_METHOD].value)
        if (basePmt[PAYMENT.FIELDS.CURRENCY].text == 'Pesos') {
          pago[PAGO.MonedaP] = 'MXN'
        } else {
          pago[PAGO.MonedaP] = basePmt[PAYMENT.FIELDS.CURRENCY].text
        }
        pago[PAGO.TipoCambioP] = Number(basePmt[PAYMENT.FIELDS.EXCHANGE_RATE].value).toFixed(pago[PAGO.MonedaP] !== 'MXN' ? 4 : 0)
        // pago[PAGO.TipoCambioP] = '1' // Number(basePmt[PAYMENT.FIELDS.EXCHANGE_RATE].value).toFixed(pago[PAGO.MonedaP] !== 'MXN' ? 4 : 0)
        pago[PAGO.Monto] = Number(auxImpT).toFixed(2) 
        // pago[PAGO.Monto] = receFactoraje[FACTORAJE.CHECK_FAC].value != true ? Number(basePmt[PAYMENT.FIELDS.TOTAL].value).toFixed(2) : Number(auxImpT).toFixed(2) 
        paymentDetails.forEach(invoice => {
          const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
          log.debug('generateJSON ~ tax_json:', tax_json)
          if (Object.keys(tax_json).length) {
            if (Object.keys(tax_json.rates_iva).length) {
              Object.keys(tax_json.bases_iva).forEach((key) => {
                pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS[totalTB]] += pago[PAGO.MonedaP] !== 'MXN' ? Number(tax_json.bases_iva[key]) * pago[PAGO.TipoCambioP] : Number(tax_json.bases_iva[key])
                // pago[PAGO.MonedaP] !== 'MXN' ? Number(tax_json.bases_iva['16']) * pago[PAGO.TipoCambioP] : Number(tax_json.bases_iva['16'])
                pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS[totalTI]] += pago[PAGO.MonedaP] !== 'MXN' ? Number(tax_json.rates_iva_data[key]) * pago[PAGO.TipoCambioP] : Number(tax_json.rates_iva_data[key])
                pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] +=  pago[PAGO.MonedaP] !== 'MXN' ? Number(invoice[INVOICE.FIELDS.AMOUNT_PAID].value * pago[PAGO.TipoCambioP]) : Number(invoice[INVOICE.FIELDS.TOTAL].value)
                // pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] +=  pago[PAGO.MonedaP] !== 'MXN' ? Number(invoice[INVOICE.FIELDS.AMOUNT_PAID].value) : Number(invoice[INVOICE.FIELDS.APPLY_AMOUNT].value)
                // pago[PAGO.MonedaP] !== 'MXN' ? Number(invoice[INVOICE.FIELDS.APPLY_AMOUNT].value / pago[PAGO.TipoCambioP]) : Number(invoice[INVOICE.FIELDS.APPLY_AMOUNT].value)
              })
            } else {
              log.debug({title:'Error in assing value tax',details:'Error in assing value tax'});
            }
          }
        })
        pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS[totalTB]] = Number(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS[totalTB]]).toFixed(2)
        pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS[totalTI]] = Number(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS[totalTI]]).toFixed(2)
        pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos] = Number(pagos[COMPLEMENTO.Pago20][PAGOS.Totales][PAGOS.MontoTotalPagos]).toFixed(2)
        /*if (pago[PAGO.MonedaP] !== 'MXN') {
            // delete pagos[COMPLEMENTO.Pago20][PAGOS.Totales]
            pago[PAGO.Monto] = Number(pago[PAGO.Monto] * pago[PAGO.TipoCambioP]).toFixed(2)
          }*/
        let auxBaseP = 0
        let auxImpP = 0
        pago[PAGO.DoctoRelacionado] = []
        paymentDetails.forEach(invoice => {
          const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
          const partiality = basePmt[PAYMENT.FIELDS.PARTIALITY].value.find(fact => fact.facturaId == invoice[INVOICE.FIELDS.ID].value)
          const lineInv = {}
          lineInv[DOC_REL.IdDocumento] = invoice[INVOICE.FIELDS.UUID].value
          lineInv[DOC_REL.Serie] = invoice[INVOICE.FIELDS.DOC_NUM].value.slice(0, 3)
          lineInv[DOC_REL.Folio] = invoice[INVOICE.FIELDS.DOC_NUM].value.slice(4, invoice[INVOICE.FIELDS.DOC_NUM].value.length)
          if (invoice[INVOICE.FIELDS.CURRENCY].text == 'Pesos') {
            lineInv[DOC_REL.MonedaDR] = 'MXN'
          } else {
            lineInv[DOC_REL.MonedaDR] = invoice[INVOICE.FIELDS.CURRENCY].text
          }
          lineInv[DOC_REL.EquivalenciaDR] = '1' // Number(invoice[INVOICE.FIELDS.EXCHANGE_RATE].value).toFixed(pago[PAGO.MonedaP] !== 'MXN' ? 4 : 0)
          // lineInv[DOC_REL.EquivalenciaDR] = lineInv[DOC_REL.EquivalenciaDR] == pago[PAGO.TipoCambioP] ? '1' : lineInv[DOC_REL.EquivalenciaDR]
          lineInv[DOC_REL.NumParcialidad] = Number(partiality?.parcialidad ?? 1).toFixed(0)
          lineInv[DOC_REL.ImpSaldoAnt] = receFactoraje[FACTORAJE.CHECK_FAC].value != true ? Number(invoice[INVOICE.FIELDS.TOTAL].value).toFixed(2) : Number(invoice[INVOICE.FIELDS.AMOUNT_PAID].value - invoice[INVOICE.FIELDS.FACTORAJE].value).toFixed(2)
          lineInv[DOC_REL.ImpPagado] = receFactoraje[FACTORAJE.CHECK_FAC].value != true ? Number(invoice[INVOICE.FIELDS.AMOUNT_PAID].value).toFixed(2) : Number(invoice[INVOICE.FIELDS.AMOUNT_PAID].value - invoice[INVOICE.FIELDS.FACTORAJE].value).toFixed(2)
          lineInv[DOC_REL.ImpSaldoInsoluto] = Number(invoice[INVOICE.FIELDS.AMOUNT_REMAINING].value).toFixed(2)
          // RECALCULATE: recalculate "ImpPagado" and "ImpSaldoInsoluto"
          // Conditions:
          // ImpPagado <= Monto //check for multiple invoices
          // ImpSaldoInsoluto = ImpSaldoAnt - ImpPagado
          let recalcImports4Invoice = recalculateImports4Invoice(pago[PAGO.Monto], lineInv[DOC_REL.ImpSaldoAnt])
          lineInv[DOC_REL.ImpPagado] = recalcImports4Invoice.ImpPagado
          lineInv[DOC_REL.ImpSaldoInsoluto] = recalcImports4Invoice.ImpSaldoInsoluto
          // if (pago[PAGO.MonedaP] !== 'MXN') {
          //   lineInv[DOC_REL.ImpSaldoAnt] = Number(lineInv[DOC_REL.ImpSaldoAnt] * pago[PAGO.TipoCambioP]).toFixed(2)
          //   lineInv[DOC_REL.ImpPagado] = Number(lineInv[DOC_REL.ImpPagado] * pago[PAGO.TipoCambioP]).toFixed(2)
          //   lineInv[DOC_REL.ImpSaldoInsoluto] = Number(lineInv[DOC_REL.ImpSaldoInsoluto] * pago[PAGO.TipoCambioP]).toFixed(2)
          // }
          if (Object.keys(tax_json).length) {
            if (Object.keys(tax_json.rates_iva).length) {
              lineInv[DOC_REL.ObjetoImpDR] = '02'
            }
          }
          lineInv[DOC_REL.ImpuestosDR] = {}
          lineInv[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR] = []
          if (Object.keys(tax_json).length) {
            if (Object.keys(tax_json.rates_iva).length) {
              Object.entries(tax_json.bases_iva).forEach(([key, value]) => {
                const trasladoDR = {}
                let tax = key / 100
                let auxBaseDR = receFactoraje[FACTORAJE.CHECK_FAC].value != true ? value : (invoice[INVOICE.FIELDS.AMOUNT_PAID].value - invoice[INVOICE.FIELDS.FACTORAJE].value) / (1 + tax)
                let auxImpDR = receFactoraje[FACTORAJE.CHECK_FAC].value != true ? tax_json.rates_iva_data[key] : auxBaseDR * tax
                trasladoDR[DOC_REL.BaseDR] = Number(auxBaseDR).toFixed(6)
                // trasladoDR[DOC_REL.BaseDR] = Number(value).toFixed(6)
                trasladoDR[DOC_REL.ImpuestoDR] = '002'
                trasladoDR[DOC_REL.TipoFactorDR] = 'Tasa'
                trasladoDR[DOC_REL.TasaOCuotaDR] = Number(key / 100).toFixed(6)
                trasladoDR[DOC_REL.ImporteDR] = Number(auxImpDR).toFixed(6)
                // trasladoDR[DOC_REL.ImporteDR] = Number(tax_json.rates_iva_data[key]).toFixed(6)
                auxBaseP = receFactoraje[FACTORAJE.CHECK_FAC].value == true ? auxBaseP + auxBaseDR : 0
                auxImpP = receFactoraje[FACTORAJE.CHECK_FAC].value == true ? auxImpP + auxImpDR : 0
                lineInv[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR].push(trasladoDR)
              })
            } else {
              log.debug({title:'Error in ImpuestosDR',details: 'Error in ImpuestosDR'});
            }
            
          }
          pago[PAGO.DoctoRelacionado].push(lineInv)
        })
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
                // let rate = key / 100
                let baseP = receFactoraje[FACTORAJE.CHECK_FAC].value != true ? value : auxBaseP
                let impP = receFactoraje[FACTORAJE.CHECK_FAC].value != true ? tax_json.rates_iva_data[key] : auxImpP
                impuestoAux[key][IMPUESTOS.BaseP] += Number(baseP)
                impuestoAux[key][IMPUESTOS.ImpuestoP] = '002'
                impuestoAux[key][IMPUESTOS.TipoFactorP] = 'Tasa'
                impuestoAux[key][IMPUESTOS.TasaOCuotaP] += Number(key / 100)
                impuestoAux[key][IMPUESTOS.ImporteP] += Number(impP)
              })
            } else {
              log.debug({title:'Error in ImpuestosP',details: 'Error in ImpuestosP'});
            }
          }
        })
        Object.values(impuestoAux).forEach(impuesto => pago[PAGO.ImpuestosP][PAGO.TrasladosP].push(impuesto))
        pago[PAGO.ImpuestosP][PAGO.TrasladosP].forEach(p => {
          p[IMPUESTOS.BaseP] = Number(p[IMPUESTOS.BaseP]).toFixed(6)
          p[IMPUESTOS.TasaOCuotaP] = Number(p[IMPUESTOS.TasaOCuotaP]).toFixed(6)
          p[IMPUESTOS.ImporteP] = Number(p[IMPUESTOS.ImporteP]).toFixed(6)
        })
        arrPagos.push(pago)
        if (receFactoraje[FACTORAJE.CHECK_FAC].value == true) {
          // Factoraje
          let sumBasep = 0
          let sumImp = 0
          const objFact = {}
          objFact[PAGO.FechaPago] = dataGenerate[BASE.Fecha].split('+')[0]
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
            linFact[DOC_REL.Serie] = invoice[INVOICE.FIELDS.DOC_NUM].value.slice(0, 3)
            linFact[DOC_REL.Folio] = invoice[INVOICE.FIELDS.DOC_NUM].value.slice(4, invoice[INVOICE.FIELDS.DOC_NUM].value.length)
            if (invoice[INVOICE.FIELDS.CURRENCY].text == 'Pesos') {
              linFact[DOC_REL.MonedaDR] = 'MXN'
            } else {
              linFact[DOC_REL.MonedaDR] = invoice[INVOICE.FIELDS.CURRENCY].text
            }
            linFact[DOC_REL.EquivalenciaDR] = '1' // Number(invoice[INVOICE.FIELDS.EXCHANGE_RATE].value).toFixed(pago[PAGO.MonedaP] !== 'MXN' ? 4 : 0)
            // lineInv[DOC_REL.EquivalenciaDR] = lineInv[DOC_REL.EquivalenciaDR] == pago[PAGO.TipoCambioP] ? '1' : lineInv[DOC_REL.EquivalenciaDR]
            linFact[DOC_REL.NumParcialidad] = Number(1).toFixed(0)
            linFact[DOC_REL.ImpSaldoAnt] = Number(invoice[INVOICE.FIELDS.FACTORAJE].value).toFixed(2)
            linFact[DOC_REL.ImpPagado] = Number(invoice[INVOICE.FIELDS.FACTORAJE].value).toFixed(2)
            linFact[DOC_REL.ImpSaldoInsoluto] = Number(invoice[INVOICE.FIELDS.AMOUNT_REMAINING].value).toFixed(2)
            let recalcImports4Invoice = recalculateImports4Invoice(objFact[PAGO.Monto], linFact[DOC_REL.ImpSaldoAnt])
            linFact[DOC_REL.ImpPagado] = recalcImports4Invoice.ImpPagado
            linFact[DOC_REL.ImpSaldoInsoluto] = recalcImports4Invoice.ImpSaldoInsoluto
            if (Object.keys(tax_json).length) {
              if (Object.keys(tax_json.rates_iva).length) {
                linFact[DOC_REL.ObjetoImpDR] = '02'
              }
            }
            linFact[DOC_REL.ImpuestosDR] = {}
            linFact[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR] = []
            if (Object.keys(tax_json).length) {
              if (Object.keys(tax_json.rates_iva).length) {
                Object.entries(tax_json.bases_iva).forEach(([key, value]) => {
                  const trasDRFac = {}
                  let tax = key/100
                  trasDRFac[DOC_REL.BaseDR] = Number(invoice[INVOICE.FIELDS.FACTORAJE].value/(tax+1)).toFixed(6)
                  sumBasep = sumBasep + Number(trasDRFac[DOC_REL.BaseDR])
                  trasDRFac[DOC_REL.ImpuestoDR] = '002'
                  trasDRFac[DOC_REL.TipoFactorDR] = 'Tasa'
                  trasDRFac[DOC_REL.TasaOCuotaDR] = Number(key / 100).toFixed(6)
                  trasDRFac[DOC_REL.ImporteDR] = (Number(invoice[INVOICE.FIELDS.FACTORAJE].value/(tax+1)) * Number(key / 100)).toFixed(6)
                  sumImp = sumImp + Number(trasDRFac[DOC_REL.ImporteDR])
                  linFact[DOC_REL.ImpuestosDR][DOC_REL.TrasladosDR].push(trasDRFac)
                })
              } else {
                log.debug({title:'Error in ImpuestosDR factoraje',details: 'Error in ImpuestosDR factoraje'});
              }
            }
            objFact[PAGO.DoctoRelacionado].push(linFact)
          })
          objFact[PAGO.ImpuestosP] = {}
          objFact[PAGO.ImpuestosP][PAGO.TrasladosP] = []
          const taxAux = {}
          paymentDetails.forEach(invoice => {
            const tax_json = invoice[INVOICE.FIELDS.TAX_JSON].value
            if (Object.keys(tax_json).length) {
              if (Object.keys(tax_json.rates_iva).length) {
                Object.entries(tax_json.bases_iva).forEach(([key, value]) => {
                  if (!taxAux?.[key]) {
                    taxAux[key] = {}
                    Object.keys(IMPUESTOS).forEach(entry => (taxAux[key][entry] = 0))
                  }
                  taxAux[key][IMPUESTOS.BaseP] += sumBasep
                  taxAux[key][IMPUESTOS.ImpuestoP] = '002'
                  taxAux[key][IMPUESTOS.TipoFactorP] = 'Tasa'
                  taxAux[key][IMPUESTOS.TasaOCuotaP] += Number(key / 100)
                  taxAux[key][IMPUESTOS.ImporteP] += sumImp
                })
              } else {
                log.debug({title:'Error in ImpuestosP factoraje',details: 'Error in ImpuestosP factoraje'});
              }
            }
          })
          Object.values(taxAux).forEach(impuesto => objFact[PAGO.ImpuestosP][PAGO.TrasladosP].push(impuesto))
          objFact[PAGO.ImpuestosP][PAGO.TrasladosP].forEach(p => {
            p[IMPUESTOS.BaseP] = Number(p[IMPUESTOS.BaseP]).toFixed(6)
            p[IMPUESTOS.TasaOCuotaP] = Number(p[IMPUESTOS.TasaOCuotaP]).toFixed(6)
            p[IMPUESTOS.ImporteP] = Number(p[IMPUESTOS.ImporteP]).toFixed(6)
          })
          arrPagos.push(objFact)
        }
        pagos[COMPLEMENTO.Pago20][PAGOS.Pagos] = arrPagos
        // pagos[COMPLEMENTO.Pago20][PAGOS.Pagos].push(pago)
        dataGenerate[BASE.Complemento][COMPLEMENTO.Any].push(pagos)
      }
      // log.debug('generateJSON ~ dataGenerate:', dataGenerate)
    } catch (error) {
      log.error('Error on generateJSON', error)
    }
    return dataGenerate
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
      const { PAYMENT } = constants.RECORDS
      const isOW = functions.checkOWAccount()
      const basePmt = getPaymentInformation(recordId)
      const emisor = isOW ? functions.getSubsidiaryInformation(basePmt[PAYMENT.FIELDS.SUBSIDIARY].value) : functions.getCompanyInformation()
      const { MX_PLUS_CONFIG } = functions
      const allConfig = functions.getConfig()
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
  const getPaymentInformation = id => {
    const data = {}
    try {
      moment.locale('es-mx')
      const localFormat = functions.getGeneralPreferences()['DATEFORMAT']
      const { PAYMENT } = RECORDS
      const filters = [[PAYMENT.FIELDS.ID, search.Operator.IS, id], 'AND', ['mainline', search.Operator.IS, 'T']]
      const columns = Object.values(PAYMENT.FIELDS).map(f => ({ name: f }))
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
        columns,
        settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }]
      })
      const countResults = objSearch.runPaged().count ?? 0
      log.debug({title:'countResults',details:countResults});
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
          data.push(line)
          return true
        })
      }
    } catch (error) {
      log.error('Error on getPaymentApply', error)
    }
    return data
  }
  
  function limites(jsonLinea) {
    try {
      var montoDeAjuste = 0;
      if (jsonLinea.iva.name != '' && jsonLinea.iva.rate_div > 0) {
          montoDeAjuste = 0;
          var limiteInferior = 0;
          var limiteSuperior = 0;
          var tasaOcuotaNum = (jsonLinea.iva.rate_div).toFixed(6);
          limiteInferior = (parseFloat(jsonLinea.iva.base_importe) - ((Math.pow(10, -2)) / 2)) * parseFloat(tasaOcuotaNum);
          limiteInferior = trunc(limiteInferior, 2);
          // limiteSuperior = (parseFloat(jsonLinea.iva.base_importe) + (Math.pow(10, -2)) / 2 - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum);
          limiteSuperior = Math.ceil((parseFloat(jsonLinea.iva.base_importe) + Math.pow(10, -2) / 2 - Math.pow(10, -12)) * parseFloat(tasaOcuotaNum) * 100) / 100;
          limiteSuperior = parseFloat(limiteSuperior.toFixed(2));
          jsonLinea.iva.limiteInferior = limiteInferior;
          jsonLinea.iva.limiteSuperior = limiteSuperior;
          if (jsonLinea.iva.importe < limiteSuperior) {
              log.emergency({ title: 'candidato a que se le agregue un centavo', details: 'TRUE' });
              // candidato a que se le agregue un centavo
              jsonLinea.iva.ajuste_centavos = true;
          }
      }
      return jsonLinea;
    } catch (err) {
        log.error({ title: 'Error occurred in esta_dentro_limite', details: err });
    }
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
        name: `${tranid}_${moment(timestamp).format('DD/MM/YYYY HH:mm:ss')}.xml`,
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
