/**
 * @NApiVersion 2.1
 */
define(['N/currentRecord', 'N/log', 'N/https', 'N/url', '../lib/constants', 'N/ui/message'], /**
 * @param {currentRecord} currentRecord
 * @param {log} log
 * @param {https} https
 * @param {url} url
 * @param {constants} constants
 * @param {message} message
 */ (currentRecord, log, https, url, constants, message) => {
  const pageInit = scriptContext => {}
  const toSendData = () => {
    try {
      let box_certificar=window.document.querySelector('#tbl_custpage_btn_genera_certifica');
      let button_certificar=window.document.querySelector('#custpage_btn_genera_certifica');
      if(box_certificar && button_certificar){

        button_certificar.disabled = true;
        box_certificar.disabled = true;
        box_certificar.style.visibility = 'hidden';
    }
      const objRecord = currentRecord.get()
      console.log([objRecord.type, objRecord.id])
      const { deploymentId, scriptId } = constants.SCRIPTS.CORE_SERVICE
      let data = {}
      const waitMsg = message.create({
        type: message.Type.INFORMATION,
        title: 'MX+ | Se está generando y certificando',
        message: 'Se esta procesando su petición, aguarde un momento.',
      })
      waitMsg.show()
      const resolveURL = url.resolveScript({
        deploymentId,
        scriptId,
        params: {},
        returnExternalUrl: false
      })
      const headers = {
        'Content-Type': 'plain/text'
      }
      https.post
        .promise({
          url: resolveURL,
          body: {
            actionMode: 'stamp_payment',
            recordId: objRecord.id,
            recordType: objRecord.type
          },
          headers
        })
        .then(response => response.body)
        .then(res => {
          res = JSON.parse(res)
          console.log('Response service', res)
          waitMsg.hide()
          let responseMsg
          if (res.success == false) {
            responseMsg = message.create({
              type: message.Type.ERROR,
              title: 'MX+ | Error al generar y certificar',
              message: res.details,
              duration: 30000
            })
          } else {
            responseMsg = message.create({
              type: message.Type.CONFIRMATION,
              title: 'MX+ | Generar y Certificar',
              message: 'La operación concluyo exitosamente',
              duration: 30000
            });
            execute_generatePDF(resolveURL,objRecord,headers);

          }
          if (responseMsg) {
            responseMsg.show()
          }
        })
        .catch(reason => {
          log.error('Reason to fail', reason)
          console.error('Reason to fail', reason)
        })
    } catch (error) {
      log.error('Error on toSendData', error)
    }
  }
  const execute_generatePDF = (urlScript,objRcrd,headers) => {
    try {
        const process_msg = message.create({
            type: message.Type.INFORMATION,
            title: 'MX+| Generación de PDF',
            message: 'Se está generando su PDF a partir de su XML certificado',
        });
        process_msg.show();
        https.post
            .promise({
                url: urlScript,
                body: {
                    actionMode: 'generate_pdf',
                    recordId: objRcrd.id,
                    recordType: objRcrd.type
                },
                headers
            })
            .then(response => response.body)
            .then(res => {
                res = JSON.parse(res)
                console.log('Response execute_generatePDF: ', res)
                process_msg.hide()
                let responseMsg
                if (res.success == false) {
                    responseMsg = message.create({
                        type: message.Type.ERROR,
                        title: 'MX+| Error al Generar PDF',
                        message: res.details,
                    })
                } else {
                    responseMsg = message.create({
                        type: message.Type.CONFIRMATION,
                        title: 'MX+| Generación de PDF',
                        message: res.details,
                        duration: 30000
                    });
                    window.location.reload();
                }
                if (responseMsg) {
                    responseMsg.show()
                }
            })
            .catch(reason => {
                log.error('Reason to fail execute_generatePDF', reason)
                console.error('Reason to fail execute_generatePDF', reason)
            })
    } catch (err) {
        log.error({ title: 'Error occurred in execute_generatePDF', details: err });
    }
}

  return { pageInit, toSendData }
})
