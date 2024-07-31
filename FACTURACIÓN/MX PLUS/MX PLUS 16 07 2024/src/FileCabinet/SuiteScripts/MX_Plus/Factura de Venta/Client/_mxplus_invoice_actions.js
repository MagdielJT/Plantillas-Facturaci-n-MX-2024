/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/currentRecord', 'N/https', 'N/url', '../lib/constants_invoice', 'N/ui/message', 'N/search'],
    /**
     * @param{log} log
     */
    function (log, currentRecord, https, url, invoice_constants, message, search) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

        }
        function generaPDF(tranid, trantype) {
            // if(typeof window != 'undefined' && window.document){
            //     window.document.querySelector('#custpage_btn_regeneraPDF').disabled = true; // id from add button call in user event script
            // }
            if (tranid == null || tranid == undefined || tranid == '' || trantype == null || trantype == undefined || trantype == '') {
                const objRcrd = currentRecord.get();
                tranid = objRcrd.id;
                trantype = objRcrd.type;

            }
            var myMsg_create = message.create({
                title: "MX+ | Generar PDF",
                message: "Se está generando el PDF desde su XML Certificado...",
                type: message.Type.INFORMATION,
            });
            myMsg_create.show();

            console.log("tranid en generaPDF", tranid)
            console.log("trantype en generaPDF", trantype)
            const { deploymentId, scriptId } = invoice_constants.SCRIPTS.CORE_SERVICE;

            var url_Script = url.resolveScript({
                scriptId,
                deploymentId,
                params: {},
            });

            var headers = {
                "Content-Type": "application/json",
            };

            https.request
                .promise({
                    method: https.Method.POST,
                    url: url_Script,
                    body: JSON.stringify({
                        actionMode: 'generate_pdf',
                        recordId: tranid,
                        recordType: trantype
                    }),
                    headers: headers,
                })
                .then(function (response) {
                    log.debug({
                        title: "Response",
                        details: response,
                    });

                    if (response.code == 200) {
                        console.log("respuestabody: ", response.body);
                        var bodyrespuesta = JSON.parse(response.body);
                        if (bodyrespuesta) {
                            console.log({ bodyrespuesta })
                            if (bodyrespuesta.success) {
                                myMsg_create.hide();
                                var myMsg = message.create({
                                    title: "MX+ | Generar PDF",
                                    message: "Se ha generado su archivo pdf...",
                                    type: message.Type.CONFIRMATION,
                                });
                                myMsg.show({ duration: 5500 });

                                location.reload();
                            } else {
                                myMsg_create.hide();
                                var myMsg = message.create({
                                    title: "MX+ | Error al Generar PDF",
                                    message:
                                        "No se pudo generar su pdf, valide la configuración. " + bodyrespuesta.details,
                                    type: message.Type.ERROR,
                                });

                                console.log("respuesta");


                            }
                        }
                    } else if (response.code == 500) {
                        myMsg_create.hide();
                        var myMsg = message.create({
                            title: "MX+ | Error al Generar PDF",
                            message: "Ocurrio un error, verifique su conexión.",
                            type: message.Type.ERROR,
                        });
                        myMsg.show();
                    } else {
                        myMsg_create.hide();
                        var myMsg = message.create({
                            title: "MX+ | Error al Generar PDF",
                            message:
                                "Ocurrio un error, verifique si el xml timbrado es correcto",
                            type: message.Type.ERROR,
                        });
                        myMsg.show();
                    }
                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: "Invalid Request: ",
                        details: reason,
                    });
                });
            return true
        }

        const getConfig = () => {
            const data = {}
            let MX_PLUS_CONFIG = {
                ID: 'customrecord_mxplus_rcd_config',
                FIELDS: {
                    TEST_MODE: 'custrecord_mxplus_config_test_mode',
                    NOTIFY_AT: 'custrecord_mxplus_timb_adv',
                    INACTIVE: 'isinactive',
                    ID: 'internalid',
                    FOLDER: 'custrecord_mxplus_folder_xml'
                }
            }
            console.log('before try')
            try {
                const filters = [[MX_PLUS_CONFIG.FIELDS.INACTIVE, search.Operator.IS, 'F']]
                const columns = Object.values(MX_PLUS_CONFIG.FIELDS).map(f => ({ name: f }))
                const objSearch = search.create({ type: MX_PLUS_CONFIG.ID, filters, columns })
                const countResults = objSearch.runPaged().count
                console.log({ countResults })
                console.log({ columns })
                if (countResults) {
                    const results = objSearch.run().getRange({ start: 0, end: 1 })
                    console.log({ results })
                    columns.forEach(column => {
                        data[column.name] = results[0].getValue(column)
                    })
                }
            } catch (error) {
                log.error('Error on getConfig', error)
            }
            console.log(data);
            return data
        }
        const toRegenerateAdenda = () => {
            try {
                const objRcrd = currentRecord.get();
                const { deploymentId, scriptId } = invoice_constants.SCRIPTS.CORE_SERVICE;
                const process_msg = message.create({
                    type: message.Type.INFORMATION,
                    title: 'MX+| Regenerando Adenda',
                    message: 'Se está regenerando la adenda en su XML certificado',
                });
                process_msg.show();
                const urlScript = url.resolveScript({
                    deploymentId,
                    scriptId,
                    params: {},
                    returnExternalUrl: false
                });
                const headers = {
                    'Content-Type': 'plain/text'
                }

                console.log('pre execute')
                const allConfig = getConfig();
                console.log(allConfig)
                console.log('trying to send execute core service')
                https.post
                    .promise({
                        url: urlScript,
                        body: JSON.stringify({
                            actionMode: 'regenerate_adenda',
                            recordId: objRcrd.id,
                            recordType: objRcrd.type,
                            idFolder: allConfig.custrecord_mxplus_folder_xml
                        }),
                        headers
                    })
                    .then(response => response.body)
                    .then(res => {
                        res = JSON.parse(res)
                        console.log('Response toRegenerateAdenda: ', res)
                        process_msg.hide()
                        let responseMsg
                        if (res.success == false) {
                            responseMsg = message.create({
                                type: message.Type.ERROR,
                                title: 'MX+| Error al Regenerar Adenda',
                                message: res.details
                            })
                        } else {
                            responseMsg = message.create({
                                type: message.Type.CONFIRMATION,
                                title: 'MX+| Adenda Regenerada con Éxito',
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
                        log.error('Reason to fail toRegenerateAdenda', reason)
                        console.error('Reason to fail toRegenerateAdenda', reason)
                    })
            } catch (err) {
                log.error({ title: 'Error occurred in toRegenerateAdenda', details: err });
            }
        }
        const toStampGlobal = () => {
            try {
                const objRcrd = currentRecord.get();
                const { deploymentId, scriptId } = invoice_constants.SCRIPTS.CORE_SERVICE;
                const process_msg = message.create({
                    type: message.Type.INFORMATION,
                    title: 'MX+| Generación y Certificación de Global',
                    message: 'Se está generando y certificando su transacción',
                });
                process_msg.show();
                const urlScript = url.resolveScript({
                    deploymentId,
                    scriptId,
                    params: {},
                    returnExternalUrl: false
                });
                const headers = {
                    'Content-Type': 'plain/text'
                }
                https.post
                    .promise({
                        url: urlScript,
                        body: JSON.stringify({
                            actionMode: 'stamp_invoice',
                            recordId: objRcrd.id,
                            recordType: objRcrd.type,
                            reprocessedGBL: true
                        }),
                        headers
                    })
                    .then(response => response.body)
                    .then(res => {
                        res = JSON.parse(res)
                        console.log('Response toStampGlobal: ', res)
                        process_msg.hide()
                        let responseMsg
                        if (res.success == false) {
                            responseMsg = message.create({
                                type: message.Type.ERROR,
                                title: 'MX+| Generación y Certificación de Global',
                                message: res.details
                            })
                        } else {
                            responseMsg = message.create({
                                type: message.Type.CONFIRMATION,
                                title: 'MX+| Generación y Certificación de Global',
                                message: res.details,
                                duration: 30000
                            });
                            generaPDF(objRcrd.id, objRcrd.type)
                            // window.location.reload();
                        }
                        if (responseMsg) {
                            responseMsg.show()
                        }
                    })
                    .catch(reason => {
                        log.error('Reason to fail toStampGlobal', reason)
                        console.error('Reason to fail toStampGlobal', reason)
                    })
            } catch (err) {
                log.error({ title: 'Error occurred in toStampGlobal', details: err });
            }
        }
        const sendEmails = (tranid, trantype, headers) => {
            try {
                const process_msg = message.create({
                    type: message.Type.INFORMATION,
                    title: 'MX+| Envío de Correo',
                    message: 'Se está enviando el PDF y XML adjuntos al correo del cliente.',
                });
                process_msg.show();
                var SLURL = url.resolveScript({
                    scriptId: 'customscript_efx_fe_mail_sender_sl',
                    deploymentId: 'customdeploy_efx_fe_mail_sender_sl',
                    returnExternalUrl: true,
                    params: {
                        trantype: trantype,
                        tranid: tranid,
                    }
                });

                log.audit({ title: 'SLURL sending emails', details: SLURL });

                https.get.promise({
                    url: SLURL,
                    headers: headers
                }).then(response => response.body)
                    .then(res => {
                        res = JSON.parse(res)
                        console.log('Response sendEmails: ', res)
                        process_msg.hide()
                        let responseMsg
                        if (res.success == false) {
                            responseMsg = message.create({
                                type: message.Type.ERROR,
                                title: 'MX+| Error al Enviar Correo',
                                message: res.details,
                                duration: 30000
                            });
                        } else {
                            responseMsg = message.create({
                                type: message.Type.CONFIRMATION,
                                title: 'MX+| Envío de Correo',
                                message: res.details,
                                duration: 30000
                            });
                        }
                        window.location.reload();
                        if (responseMsg) {
                            responseMsg.show()
                        }
                    })
                    .catch(reason => {
                        log.error('Reason to fail sendEmails', reason)
                        console.error('Reason to fail sendEmails', reason)
                        window.location.reload();

                    })


            } catch (err) {
                log.error({ title: 'Error occurred in sendEmails', details: err });
            }
        }
        const execute_generatePDF = (urlScript, objRcrd, headers) => {
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
                        body: JSON.stringify({
                            actionMode: 'generate_pdf',
                            recordId: objRcrd.id,
                            recordType: objRcrd.type
                        }),
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
                            sendEmails(objRcrd.id, objRcrd.type, headers);
                            // window.location.reload();
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
        const enviarEmail = () => {
            try {
                const objRcrd = currentRecord.get();
                const process_msg = message.create({
                    type: message.Type.INFORMATION,
                    title: 'MX+| Envío de Correo',
                    message: 'Se está enviando por correo el XML y PDF.',
                });
                process_msg.show();
                const urlScript = url.resolveScript({
                    deploymentId:'customdeploy_efx_fe_mail_sender_sl',
                    scriptId:'customscript_efx_fe_mail_sender_sl',
                    params: {
                        trantype: objRcrd.type,
                        tranid: objRcrd.id,
                    },
                    returnExternalUrl: true
                });
                const headers = {
                    'Content-Type': 'plain/text'
                }
                https.get
                    .promise({
                        url: urlScript,
                        
                        headers
                    })
                    .then(response => response.body)
                    .then(res => {
                        res = JSON.parse(res)
                        console.log('Response envioEmail: ', res)
                        process_msg.hide()
                        let responseMsg
                        if (res.success == false) {
                            responseMsg = message.create({
                                type: message.Type.ERROR,
                                title: 'MX+| Envío de Correo',
                                message: res.details
                            })
                        } else {
                            responseMsg = message.create({
                                type: message.Type.CONFIRMATION,
                                title: 'MX+| Envío de Correo',
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
                        log.error('Reason to fail enviarEmail', reason)
                        console.error('Reason to fail enviarEmail', reason)
                    })

            } catch (err) {
                console.error({ title: 'Error occurred in enviarEmail', details: err });
            }
        }
        const toStampInvoice = () => {
            try {
                console.log('triggered for stamping');
                let box_certificar = window.document.querySelector('#tbl_custpage_btn_invoice_new');
                let button_certificar = window.document.querySelector('#custpage_btn_invoice_new');
                // CASHSALE
                let box_certificar_CASH = window.document.querySelector('#tbl_custpage_btn_cashsale_new');
                let button_certificar_CASH = window.document.querySelector('#custpage_btn_cashsale_new');
                // CREDITMEMO
                let box_certificar_NC = window.document.querySelector('#tbl_custpage_btn_credit_new');
                let button_certificar_NC = window.document.querySelector('#custpage_btn_credit_new');
                // FACTURA GLOBAL
                let box_certificar_FG = window.document.querySelector('#tbl_custpage_btn_gbl_new');
                let button_certificar_FG = window.document.querySelector('#custpage_btn_gbl_new');
                if (box_certificar && button_certificar) {

                    button_certificar.disabled = true;
                    box_certificar.disabled = true;
                    box_certificar.style.visibility = 'hidden';
                }
                if (box_certificar_CASH && button_certificar_CASH) {

                    button_certificar_CASH.disabled = true;
                    box_certificar_CASH.disabled = true;
                    box_certificar_CASH.style.visibility = 'hidden';
                }
                if (box_certificar_NC && button_certificar_NC) {

                    button_certificar_NC.disabled = true;
                    box_certificar_NC.disabled = true;
                    box_certificar_NC.style.visibility = 'hidden';
                }
                if (box_certificar_FG && button_certificar_FG) {

                    button_certificar_FG.disabled = true;
                    box_certificar_FG.disabled = true;
                    box_certificar_FG.style.visibility = 'hidden';
                }
                const objRcrd = currentRecord.get();
                const { deploymentId, scriptId } = invoice_constants.SCRIPTS.CORE_SERVICE;
                const process_msg = message.create({
                    type: message.Type.INFORMATION,
                    title: 'MX+| Generación y Certificación',
                    message: 'Se está generando y certificando. Favor de no refrescar la página.',
                });
                process_msg.show();
                const urlScript = url.resolveScript({
                    deploymentId,
                    scriptId,
                    params: {},
                    returnExternalUrl: false
                });
                const headers = {
                    'Content-Type': 'plain/text'
                }
                https.post
                    .promise({
                        url: urlScript,
                        body: JSON.stringify({
                            actionMode: 'stamp_invoice',
                            recordId: objRcrd.id,
                            recordType: objRcrd.type
                        }),
                        headers
                    })
                    .then(response => response.body)
                    .then(res => {
                        res = JSON.parse(res)
                        console.log('Response toStampInvoice: ', res)
                        process_msg.hide()
                        let responseMsg
                        if (res.success == false) {
                            responseMsg = message.create({
                                type: message.Type.ERROR,
                                title: 'MX+| Generación y Certificación',
                                message: res.details
                            })
                        } else {
                            responseMsg = message.create({
                                type: message.Type.CONFIRMATION,
                                title: 'MX+| Generación y Certificación',
                                message: res.details,
                                duration: 30000
                            });
                            execute_generatePDF(urlScript, objRcrd, headers);
                        }
                        if (responseMsg) {
                            responseMsg.show()
                        }
                    })
                    .catch(reason => {
                        log.error('Reason to fail toStampInvoice', reason)
                        console.error('Reason to fail toStampInvoice', reason)
                    })

            } catch (err) {
                log.error({ title: 'Error occurred in toStampInvoice', details: err });
            }
        }
        const toCreateAdenda = () => {
            try {
                const objRcrd = currentRecord.get();
                const { deploymentId, scriptId } = invoice_constants.SCRIPTS.CORE_SERVICE;
                const process_msg = message.create({
                    type: message.Type.INFORMATION,
                    title: 'MX+| Generando Adenda',
                    message: 'Se está generando la adenda.',
                });
                process_msg.show();
                const urlScript = url.resolveScript({
                    deploymentId,
                    scriptId,
                    params: {},
                    returnExternalUrl: false
                });
                const headers = {
                    'Content-Type': 'plain/text'
                }
                https.post
                    .promise({
                        url: urlScript,
                        body: JSON.stringify({
                            actionMode: 'create_adenda',
                            recordId: objRcrd.id,
                            recordType: objRcrd.type
                        }),
                        headers
                    })
                    .then(response => response.body)
                    .then(res => {
                        res = JSON.parse(res)
                        console.log('Response toCreateAdenda: ', res)
                        process_msg.hide()
                        let responseMsg
                        if (res.success == false) {
                            responseMsg = message.create({
                                type: message.Type.ERROR,
                                title: 'MX+| Error al generar Adenda',
                                message: res.details
                            })
                        } else {
                            responseMsg = message.create({
                                type: message.Type.CONFIRMATION,
                                title: 'MX+| Adenda Generada con Éxito',
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
                        log.error('Reason to fail toCreateAdenda', reason)
                        console.error('Reason to fail toCreateAdenda', reason)
                    })


            } catch (err) {
                log.error({ title: 'Error occurred in toCreateAdenda', details: err });
            }
        }
        // FUNCIONES DE CANCELACIÓN
        function bottonCancelarCFDI() {
            var data = document.createElement('cancel-screen');//*

            // var htmlList = '<label>Seleccione el motivo de su cancelación</label><br><br>'
            // htmlList += '<select name="cfdi" id="select_cfdi">'
            // htmlList = htmlList + `<option value="0">Motivos de cancelación</option>`
            // Object.keys(OPTCANCEL).forEach((key) => {
            //     htmlList = htmlList + `<option value="${key}">${key} - ${OPTCANCEL[key]}</option>`
            // })
            // htmlList = htmlList + '</select> <br><br> <div class="addons"></div>';
            // htmlList+="<div class='botones'>" +
            // "<input id='enviar' type='button' class='btn1' value='Ok'></input>" +//mandar dato
            // "<input id='cancel' type='button' class='btn2' value='Cancel'></input>" +
            // "</div>" 
            // htmlList += `
            //     <script>
            //         document.getElementById("select_cfdi").addEventListener("change", dialogResponse);
            //         function dialogResponse(e) {console.log("Value",e.target.value)}

            //     </script>`;
            //     data.innerHTML=htmlList;//*
            var message = '';
            message += '<select id="select_cfdi">';
            message += '    <option value="0" disabled selected hidden>Motivos de cancelación</option>';
            Object.keys(OPTCANCEL).forEach((key) => {
                message = message + `<option value="${key}">${key} - ${OPTCANCEL[key]}</option>`
            })
            message += '</select> <br><br> <div id="addons"></div>';
            data.innerHTML =
                '<style media=all type=text/css>' +
                '#fondo {' +
                'background-color: rgba(230,230,230,0.4);' +
                'height: 100%;' +
                'width:  100%;' +
                'display: flex;' +
                'justify-content: center;' +
                'align-items: center;' +
                'position: fixed;' +
                'margin: auto;' +
                'z-index: 999;' +
                'top: 0;' +
                '} ' +
                '.mensajito {' +
                'z-index: 1000;' +
                'font-family: Myriad Pro,Helvetica,sans-serif;' +
                'background-color: white;' +
                'width: 25%;' +//alto
                'overflow: hidden;' +
                'filter: drop-shadow(0 0 0.1rem black);' +
                'height: 25%;' +//ancho
                'position: fixed;' +
                //'border-radius: 2px;' +
                'top: 40%;' +
                '} ' +
                '.cabecera {' +
                'font-family: Myriad Pro,Helvetica,sans-serif;' +
                'background-color: #607799;' +
                'color: white;' +
                'padding: 4px 6px;' +
                'font-weight: bold;' +
                'font-size: 15px;' +
                '} ' +
                '.contenido {' +
                'padding: 10px;' +
                '} ' +
                'p {' +
                'font-size: 14px;' +
                'color: #616161;' +
                '} ' +
                '.botones {' +
                'font-family: Myriad Pro,Helvetica,sans-serif;' +
                'display: flex;' +
                'justify-content: space-around;' +
                //'margin-top: 20%;'+
                '} ' +
                '.btn1 {' +
                'font-weight: bold;' +
                'background-color: #E9E9E9;' +
                'color: black;' +
                'min-height: 28px;' +
                'text-align: center;' +
                'padding: 0px 13px;' +
                'font-size: 14px;' +
                //'border: 2px solid #008CBA;'+
                'border-radius: 3px;' +
                'cursor: pointer;' +
                '} ' +
                '.btn1:hover {' +
                'background-color: #D8D8D8;' +
                '} ' +
                '.btn2 {' +
                'font-weight: bold;' +
                'background-color: #E9E9E9;' +
                'color: black;' +
                'min-height: 28px;' +
                'text-align: center;' +
                'padding: 0px 13px;' +
                'font-size: 14px;' +
                //'border: 2px solid #008CBA;'+
                'border-radius: 3px;' +
                'cursor: pointer;' +
                '} ' +
                '.btn2:hover {' +
                'background-color: #D8D8D8;' +
                '} ' +
                '</style>' +
                "<div id='fondo'>" + //fondo
                "<div class='mensajito'>" +
                "<div class='cabecera'>" +
                "Motivo de Cancelación" +
                "</div>" +
                "<div class='contenido'>" +
                "<p>Selecciona motivo de cancelación</p>" +
                "<br>" +
                message +
                "<br>" +
                "</div>" +
                "<br>" +
                "<div id='option'>" +
                "" +
                "</div>" +
                "<br>" +
                "<div class='botones'>" +
                "<input id='enviar' type='button' class='btn1' value='Ok'></input>" +//mandar dato
                "<input id='cancel' type='button' class='btn2' value='Cancel'></input>" +
                "</div>" +
                "</div>" +
                "</div>";
            document.body.appendChild(data); //*
            document.getElementById('enviar').addEventListener('click', success, false);
            document.getElementById('cancel').addEventListener('click', errorDialog, false);

            // dialog.confirm({
            //     title: 'Cancelación de CFDI',
            //     message: htmlList
            // }).then(success).catch(errorDialog);


            var selectidItemSelected = document.getElementById("select_cfdi");

            selectidItemSelected.addEventListener('change', atrapar, false);

        }
        function atrapar() {
            var selectidItemSelected = document.getElementById("select_cfdi");
            if (selectidItemSelected) {
                idItemSelected = selectidItemSelected.value;
            }
            console.log({ title: 'atrapar idItemSelected', details: idItemSelected });
            if (idItemSelected == '01') {
                console.log('ENTRO A LA VALIDACION');
                try {
                    let contentDiv = document.getElementById('addons')
                    console.log({ contentDiv })
                    /*let newLabel = document.createElement('label')
                    newLabel.id = 'invoiceRel'
                    newLabel.textContent = 'Seleccione la factura relacionada'
                    contentDiv.appendChild(newLabel)
                    contentDiv.appendChild(document.createElement('input', { type: 'text', id: 'fsusti' }))*/

                    var newDiv = document.createElement('div')
                    // var newDiv = document.createElement('div')
                    newDiv.className = 'opFac'
                    console.log({ newDiv })
                    contentDiv.appendChild(newDiv)
                    selectidItemSelected.addEventListener('click', tranRelac, false)
                } catch (err) {
                    log.error({ title: 'Error occurred in case 01', details: err });
                }
            } else {
                console.log('Error occurred in case 01');
            }
            /*var idItemCamp = document.getElementById("fsusti");
            if (idItemCamp) {
                idRempUUI = idItemCamp.value;
            }
            console.log({ title: 'atrapar idItemSelected', details: idRempUUI });*/
        }
        const fetchSavedSearch4Transaction = (typeOfTransaction, objSearch, trandate) => {
            try {
                let ss_to_return
                ss_to_return = search.create({
                    type: search.Type.TRANSACTION,
                    filters: [
                        ['mainline', search.Operator.IS, 'T']
                        , 'AND',
                        ['type', search.Operator.ANYOF, typeOfTransaction]
                        , 'AND',
                        ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['entity', search.Operator.ANYOF, objSearch['entity'][0].value]
                        , 'AND',
                        ["trandate", search.Operator.ONORAFTER, trandate]
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: 'tranid' }),
                        search.createColumn({ name: 'custbody_mx_cfdi_uuid' }),
                    ]
                });
                return ss_to_return;
            } catch (err) {
                log.error({ title: 'Error occurred in fetchSavedSearch4Transaction', details: err });
            }
        }
        function tranRelac() {
            try {
                console.log('ENTRO EN LA FUNCIÓN', objRecord.id);
                var objSearch = search.lookupFields({ type: objRecord.type, id: objRecord.id, columns: ['trandate', 'entity'] })
                console.log('objSearch', objSearch)
                var trandate = objSearch?.['trandate'] ?? new Date()
                console.log('responseDate: ', trandate);
                var buscaFactura
                console.log('objRecord.type', objRecord.type)
                switch (objRecord.type) {
                    case 'invoice':
                        buscaFactura = fetchSavedSearch4Transaction('CustInvc', objSearch, trandate);
                        // buscaFactura = search.create({
                        //     type: search.Type.TRANSACTION,
                        //     filters: [
                        //         ['mainline', search.Operator.IS, 'T']
                        //         , 'AND',
                        //         ['type', search.Operator.ANYOF, ['CustInvc', 'CashSale']]
                        //         , 'AND',
                        //         ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                        //         , 'AND',
                        //         ['entity', search.Operator.ANYOF, objSearch['entity'][0].value]
                        //         , 'AND',
                        //         ["trandate", search.Operator.ONORAFTER, trandate],
                        //         /* 'AND',
                        //         ['internalid', search.Type.NONEOF, objRecord.id] */
                        //     ],
                        //     columns: [
                        //         search.createColumn({ name: 'internalid' }),
                        //         search.createColumn({ name: 'tranid' }),
                        //         search.createColumn({ name: 'custbody_mx_cfdi_uuid' }),
                        //     ]
                        // });
                        break
                    case 'customerpayment':
                        buscaFactura = fetchSavedSearch4Transaction('CustPymt', objSearch, trandate)
                        break;
                    case 'creditmemo':
                        buscaFactura = fetchSavedSearch4Transaction('CustCred', objSearch, trandate)
                        break;
                    case 'cashsale':
                        buscaFactura = fetchSavedSearch4Transaction('CashSale', objSearch, trandate);
                        break;
                }
                console.log('buscaFactura', buscaFactura)
                if (buscaFactura !== null) {
                    console.log([buscaFactura.runPaged().count, buscaFactura.filters]);
                    var facturasArray = []
                    buscaFactura.run().each(function (result) {
                        var objFacturas = {};
                        console.log(objFacturas);
                        objFacturas.uuid = result.getValue({ name: 'custbody_mx_cfdi_uuid' }) || 0;
                        objFacturas.numero = result.getValue({ name: 'tranid' }) || 0;
                        objFacturas.id = result.getValue({ name: 'internalid' }) || 0;
                        facturasArray.push(objFacturas);
                        return true;
                    });
                    let facturasString = "";
                    // FacPrueba INV10006430 FacRempla INV10006433
                    for (var x = 0; x < facturasArray.length; x++) {
                        if (facturasArray[x].id != objRecord.id) {
                            console.log('Hace la busqueda');
                            facturasString += '<option value="' + facturasArray[x].uuid + '" >' + facturasArray[x].numero + '</option>'
                        }
                    }
                    let facDiv = document.getElementsByClassName('opFac')[0]
                    var update = document.createElement('div')
                    update.innerHTML = //se agrega a la variable lo de abajo
                        "<style>" +
                        "#option{" +
                        'background-color: white;' +
                        'padding: 10px;' +
                        "}" +
                        "#title{" +
                        'font-family: Myriad Pro,Helvetica,sans-serif;' +
                        'font-size: 14px;' +
                        'color: #616161;' +
                        "}" +
                        // ".mensajito{" +
                        // 'height: 40%;' +
                        // "}" +
                        "</style>" +
                        "<p id='title'>Selecciona la transacción</p>" +
                        "<select id='listFact'>" +
                        '<option value="">Seleccione una opción.</option>' +
                        facturasString +
                        "</select>";
                    facDiv.appendChild(update);
                    var selectidItemFac = document.getElementById('listFact');
                    if (selectidItemFac) {
                        selectidItemFac.addEventListener('change', savedUUIDRel)
                    }
                }
            } catch (err) {
                log.error({ title: 'Error occurred in tranRelac', details: err });
            }
        }
        function savedUUIDRel() {
            var selectidItemFac = document.getElementById('listFact');
            if (selectidItemFac) {
                idRempUUI = selectidItemFac.value;
            } else {
                idRempUUI = ''
            }
            console.log({ title: 'selectidItemFac', details: idRempUUI })
        }
        const disableOkButton = () => {
            try {
                const buttons = document.querySelectorAll('.uir-message-buttons button');
                // Loop through each button
                buttons.forEach(button => {
                    // Check the value attribute of the button
                    const valueAttribute = button.getAttribute('value');
                    // If value attribute is 'true', disable the button
                    if (valueAttribute === 'true') {
                        button.disabled = true;
                    }
                });
            } catch (err) {
                console.error('Error occurred in disableOkButton', err);
            }
        }
        function success(result) {
            console.log('Enviado para cancelación');
            // Función que deshabilita el botón de "ok" al momento de cancelar para evitar una doble cancelación
            // if (result == true) {
            disableOkButton();
            console.log({ idItemSelected })
            var cur_record = currentRecord.get()
            console.log({ title: 'Data transacction', details: cur_record.type })
            var output = url.resolveScript({
                scriptId: SERVICE_CP.SCRIPTID,
                deploymentId: SERVICE_CP.DEPLOYID,
                returnExternalUrl: false,
                params: {
                    recordId: cur_record.id,
                    recordType: cur_record.type,
                    motCancel: idItemSelected,
                    uuidRela: idRempUUI,
                    actionMode: "cancelar_cfdi"
                }
            });
            console.log('Se inicia cancelacion de CFDI');
            // Despliegue de mensaje de proceso
            let data = document.querySelector('cancel-screen');

            data.innerHTML = "";
            const process_msg = message.create({
                type: message.Type.INFORMATION,
                title: 'MX+| Procesando Cancelación de CFDI',
                message: 'Se está procesando su cancelación de CFDI.',

            });
            process_msg.show();
            https.post.promise({
                url: output,
                body: JSON.stringify({}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {
                    var response = JSON.parse(response.body)
                    let responseMsg
                    if (response.success == false) {
                        process_msg.hide();
                        responseMsg = message.create({
                            type: message.Type.ERROR,
                            title: 'MX+| Error al cancelar CFDI',
                            message: response.details,
                        })
                    } else {
                        process_msg.hide();
                        responseMsg = message.create({
                            type: message.Type.CONFIRMATION,
                            title: 'MX+| Cancelación de CFDI con éxito',
                            message: response.details,
                            duration: 30000
                        });
                        window.location.reload();
                    }
                    if (responseMsg) {
                        responseMsg.show()
                    }
                    console.log({
                        title: 'Response of client',
                        details: response
                    });
                })
                .catch(function onRejected(reason) {
                    console.log({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                })
            // } else {
            //     console.log('Error in result')
            // }
        }
        function errorDialog() {
            console.log('no se hizo la operación')
            let data = document.querySelector('cancel-screen');

            data.innerHTML = "";
            var mensajeError = message.create({
                title: "MX+| Cancelación de CFDI",
                message: "Se ha cancelado la operación...",
                type: message.Type.INFORMATION,
                duration: 30000
            });
            mensajeError.show();
        }


        return {
            pageInit,
            toCreateAdenda,
            toStampInvoice,
            toStampGlobal,
            toRegenerateAdenda,
            generaPDF,
            bottonCancelarCFDI,
            enviarEmail,
            execute_generatePDF
        };

    });
