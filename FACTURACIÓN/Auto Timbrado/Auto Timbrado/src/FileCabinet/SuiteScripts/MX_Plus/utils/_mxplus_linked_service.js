/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/redirect', 'N/runtime', 'N/search'], /**
 * @param {log} log
 * @param {redirect} redirect
 * @param {runtime} runtime
 * @param {search} search
 */ (log, redirect, runtime, search) => {
  const onRequest = scriptContext => {
    try {
      const { request, response } = scriptContext
      const [recordType, recordId] = ['custscript_record_id_access', 'custscript_internal_id_access']
      const objScript = runtime.getCurrentScript()
      const records = {
        id: objScript.getParameter({ name: recordId }),
        type: objScript.getParameter({ name: recordType })
      }
      const recordTypeID = search.lookupFields({
        type: 'customrecordtype',
        id: records.type,
        columns: ['scriptid']
      })
      log.debug('onRequest ~ recordTypeID:', recordTypeID)
      redirect.toRecord({
        id: records.id,
        type: recordTypeID.scriptid,
        isEditMode: false,
        parameters: {}
      })
    } catch (error) {
      log.error('Error on onRequest', error)
    }
  }
  return { onRequest }
})
