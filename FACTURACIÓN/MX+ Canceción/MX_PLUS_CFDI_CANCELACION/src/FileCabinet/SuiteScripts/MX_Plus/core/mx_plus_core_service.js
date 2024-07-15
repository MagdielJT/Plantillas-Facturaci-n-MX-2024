/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['../server/mx_plus_cancelacion_cfdi', '../server/_mxplus_payments'], (cancel_cfdi, stampPayment) => {
    const onRequest = scriptContext => {
        try {
            const { request, response } = scriptContext
            const { actionMode, recordId, recordType, motCancel, uuidRela } = request.parameters
            let result = { success: false, data: [], endpoint: '', details: '' }
            if (actionMode) {
                result.endpoint = actionMode
                switch (actionMode) {
                    case 'cancelar_cfdi':
                        // result.success = result.data.length > 0
                        let responseFromCancel = cancel_cfdi.consulData(recordId, recordType, motCancel, uuidRela)
                        result.success = responseFromCancel.success;
                        result.details = responseFromCancel.msg
                        break
                    case 'stamp_payment':
                        const JSON_STRUCTURE = stampPayment.generateJSON(recordId, recordType)
                        if (JSON_STRUCTURE) {
                            const isSend = stampPayment.sendPAC(JSON_STRUCTURE, recordId)
                            log.debug('onRequest ~ isSend:', isSend)
                            if (isSend.status == 'error') {
                                result.success = false
                                result.details = isSend.message
                                result.data = isSend.data
                                if (result.data) {
                                    stampPayment.updatePayment(recordId, result.data)
                                }
                            } else {
                                result.success = true
                                result.data = isSend.data
                                stampPayment.updatePayment(recordId, result.data)
                            }
                        }
                        break
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
