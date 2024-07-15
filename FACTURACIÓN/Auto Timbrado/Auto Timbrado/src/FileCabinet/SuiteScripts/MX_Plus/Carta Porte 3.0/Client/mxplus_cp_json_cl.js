/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/https', '../Lib/constants.js', 'N/ui/message'],
    function (currentRecord, url, https, constants, message) {
        const { SERVICE_CP } = constants;
        var processing_msg = message.create({
            title: "MX+ | Generando Carta Porte",
            message: "Se está generando su carta porte 3.0",
            type: message.Type.INFORMATION
        });


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
        function botonPDFCartaPorte() {
            try {
                var tran = currentRecord.get();
                var tranData={
                    tranid:tran.id,
                    trantype:tran.type
                }

                var myMsg_create = message.create({
                    title: "MX+ | Generar PDF",
                    message: "Se está generando el PDF desde su XML Certificado...",
                    type: message.Type.INFORMATION,
                });
                myMsg_create.show();
                var tranid = tranData.tranid || "";
                var trantype = tranData.trantype || "";
                console.log("tranid en regeneraPDF", tranid)
                console.log("tranid en regeneraPDF", trantype)

                var url_Script = url.resolveScript({
                    scriptId: "customscript_efx_fe_cfdi_genera_pdf_sl",
                    deploymentId: "customdeploy_efx_fe_cfdi_genera_pdf_sl",
                    params: {
                        trantype: trantype,
                        tranid: tranid,
                    },
                });

                var headers = {
                    "Content-Type": "application/json",
                };

                https.request
                    .promise({
                        method: https.Method.GET,
                        url: url_Script,
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
                                console.log("idpdf: ", bodyrespuesta.idPdf);
                                if (bodyrespuesta.idPdf) {
                                    myMsg_create.hide();
                                    var myMsg = message.create({
                                        title: "Regenerar PDF",
                                        message: "Se ha generado su archivo pdf...",
                                        type: message.Type.CONFIRMATION,
                                    });
                                    myMsg.show({ duration: 5500 });

                                    console.log("respuesta");
                                    location.reload();

                                } else {
                                    myMsg_create.hide();
                                    var myMsg = message.create({
                                        title: "Regenerar PDF",
                                        message:
                                            "No se pudo generar su pdf, valide la configuración...",
                                        type: message.Type.ERROR,
                                    });
                                    myMsg.show();
                                    // myMsg.show({ duration: 5500 });

                                    console.log("respuesta");

                                    // location.reload();

                                }
                            }
                        } else if (response.code == 500) {
                            myMsg_create.hide();
                            var myMsg = message.create({
                                title: "Regenerar PDF",
                                message: "Ocurrio un error, verifique su conexión.",
                                type: message.Type.ERROR,
                            });
                            myMsg.show();
                        } else {
                            myMsg_create.hide();
                            var myMsg = message.create({
                                title: "Regenerar PDF",
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
            } catch (err) {
                console.error({ title: 'Error occurred in botonPDFCartaPorte', details: err });
            }
        }
        function bottonCartaporte() {
            var cur_record = currentRecord.get()
            var output = url.resolveScript({
                scriptId: SERVICE_CP.SCRIPTID,
                deploymentId: SERVICE_CP.DEPLOYID,
                returnExternalUrl: false,
                params: {
                    id: cur_record.id,
                    record_Tipo: cur_record.type
                }
            });
            console.log('Se inicia carta porte');
            processing_msg.show();
            https.post.promise({
                url: output,
                body: ''
            })
                .then(function (response) {
                    console.log({
                        title: 'Response 🕸️',
                        details: response
                    });
                    var body_response = JSON.parse(response.body)
                    processing_msg.hide();
                    if (body_response.msg && body_response.success == true) {

                        var success_msg = message.create({
                            title: "MX+ | Carta Porte Generada",
                            message: body_response.msg,
                            type: message.Type.CONFIRMATION,
                            duration: 3000
                        });
                        success_msg.show();
                        window.location.reload();
                    } else {

                        var error_msg = message.create({
                            title: "MX+ | Error al generar Carta Porte",
                            message: body_response.msg,
                            type: message.Type.ERROR
                        });


                        error_msg.show();
                    }
                })
                .catch(function onRejected(reason) {
                    console.log({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                    processing_msg.hide();
                    var error_msg = message.create({
                        title: "MX+ | Error al generar Carta Porte",
                        message: JSON.stringify(reason),
                        type: message.Type.ERROR
                    });
                    error_msg.show();
                })
        }

        return {
            pageInit: pageInit,
            bottonCartaporte: bottonCartaporte,
            botonPDFCartaPorte: botonPDFCartaPorte
        };

    });
