/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['../server/mx_plus_cancelacion_cfdi', '../server/_mxplus_payments', '../server/_mxplus_invoice', '../lib/functions_gbl','../server/_mxplus_itemfulfillment','../Adendas/lib_adendas/adendas_functions'], (cancel_cfdi, stampPayment, invoice, functionsGBL,itemfulfillment,adendas) => {
  const onRequest = scriptContext => {
    try {
      const { request, response } = scriptContext
      const { actionMode, recordId, recordType, motCancel, uuidRela, reprocessedGBL, idFolder } = request.parameters
      let result = { success: false, data: [], endpoint: '', details: '' }
      if (actionMode) {
        result.endpoint = actionMode
        switch (actionMode) {
          case 'stamp_itemfulfillment':
            let responseFromItemFulfillment = itemfulfillment.stampItemFulfillment(recordId, recordType);
            result.success = responseFromItemFulfillment.success;
            result.details = responseFromItemFulfillment.msg;
            break
          case 'stamp_invoice':
            let responseFromInvoice = invoice.stampInv(recordId, recordType, reprocessedGBL)
            result.success = responseFromInvoice.success;
            result.details = responseFromInvoice.msg
            result.data.push(responseFromInvoice.data)
            break
          case 'generate_pdf':
            let responseFromPDFGeneration = invoice.generatePDF(recordId, recordType)
            result.success = responseFromPDFGeneration.success;
            result.details = responseFromPDFGeneration.msg
            break
          case 'cancelar_cfdi':
            // result.success = result.data.length > 0
            let responseFromCancel = cancel_cfdi.consulData(recordId, recordType, motCancel, uuidRela)
            result.success = responseFromCancel.success;
            result.details = responseFromCancel.msg
            break
          case 'stamp_payment':
            const JSON_STRUCTURE = stampPayment.generateJSON(recordId, recordType)
            if (JSON_STRUCTURE) {
              log.audit({ title: 'JSON_STRUCTURE', details: JSON_STRUCTURE });
              const isSend = stampPayment.sendPAC(JSON_STRUCTURE, recordId)
              log.debug('onRequest ~ isSend:', isSend)
              // Store the generated JSON
              let idParentFolder = functionsGBL.getFolderTimb();
              // Parameters: prefix,extension,tranid,content,folder
              let idFileJSONGenerated = functionsGBL.createFile('PAGO_', '.txt', recordId, JSON.stringify(JSON_STRUCTURE), idParentFolder);
              if (isSend.status == 'error') {
                result.success = false
                result.details = isSend.message +' - ' + isSend.messageDetail 
                // result.details = isSend.message + isSend.messageDetail != null ? isSend.messageDetail : ''
                result.data = isSend.data
                if (result.data) {
                  stampPayment.updatePayment(recordId, result.data, idFileJSONGenerated)
                } else {
                  stampPayment.updatePayment(recordId, '', idFileJSONGenerated)

                }
              } else {
                result.success = true
                result.data = isSend.data
                stampPayment.updatePayment(recordId, result.data, idFileJSONGenerated)
              }

            }
            break
          case 'create_adenda':
            const adenda_XML = adendas.getAdendaXML(recordId, recordType, false);
            if (adenda_XML) {
              // convert to JSON
              result.success = adenda_XML.success;
              result.details = adenda_XML.msg;
            }
            break;
          case 'regenerate_adenda':
            log.debug({ title: 'idFolder - regenerate_adenda', details: idFolder });
            const adenda_XMLRegenerada = adendas.regenerateAdendaXML(recordId, recordType, idFolder);
            if (adenda_XMLRegenerada) {
              // convert to JSON
              result.success = adenda_XMLRegenerada.success;
              result.details = adenda_XMLRegenerada.msg;
            }
            break;
        }
      } else {
        result.details = 'No se ha definido una acción'
      }
      response.write({ output: JSON.stringify(result) })
    } catch (err) {
      log.error({ title: 'Error occurred in ', details: err })
    }
  }
  return { onRequest }
})
