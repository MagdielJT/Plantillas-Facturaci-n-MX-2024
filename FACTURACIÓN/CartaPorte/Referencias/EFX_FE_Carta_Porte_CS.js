/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/http', 'N/https', 'N/record','N/url','N/ui/message','N/search','N/runtime'],
/**
 * @param{serverWidget} serverWidget
 */
function(currentRecord,http, https, record,url,mensajes,search,runtime) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    var enEjecucion = false;
    function pageInit(scriptContext) {
        var recObj = currentRecord.get();

        if(recObj.type == 'customrecord_efx_fe_cp_ubicaciones'){
            var dircli = recObj.getValue({fieldId:'custrecord_efx_fe_cp_dirorigen'});
            var dirloc = recObj.getValue({fieldId:'custrecord_efx_fe_cp_locorigen'});
            if(dircli && !dirloc){
                recObj.getField({
                    fieldId: 'custrecord_efx_fe_cp_locorigen'
                }).isDisabled = true;
            }

            if(!dircli && dirloc){
                recObj.getField({
                    fieldId: 'custrecord_efx_fe_cp_dirorigen'
                }).isDisabled = true;
            }


        }else if(recObj.type == 'customrecord_efx_fe_cp_infovehiculo'){
            var tipoveh = recObj.getValue({fieldId:'custrecord_efx_fe_cp_tipveh'});

            if (tipoveh == 1) {
                recObj.getField({
                    fieldId: 'custrecord_efx_fe_cp_subtiporem'
                }).isDisplay = false;
            }

            if (tipoveh == 2) {
                recObj.getField({
                    fieldId: 'custrecord_efx_fe_cp_permsct'
                }).isDisplay = false;
                recObj.getField({
                    fieldId: 'custrecord_efx_fe_cp_numpermisosct'
                }).isDisplay = false;
                recObj.getField({
                    fieldId: 'custrecord_efx_fe_cp_configvehicular'
                }).isDisplay = false;
                recObj.getField({
                    fieldId: 'custrecord_efx_fe_cp_aniomodelovm'
                }).isDisplay = false;
            }
        }else {
            var transporteInternac = recObj.getValue({fieldId:'custbody_efx_fe_transpinternac'});

            if (transporteInternac == 2 || !transporteInternac) {
                recObj.getField({
                    fieldId: 'custbody_efx_fe_cp_entradasalidamerc'
                }).isDisplay = false;

                recObj.getField({
                    fieldId: 'custbody_efx_fe_cp_viaentradasalida'
                }).isDisplay = false;
            }

        }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var recObj = currentRecord.get();

        if(recObj.type == 'customrecord_efx_fe_cp_ubicaciones'){

            if (scriptContext.fieldId == 'custrecord_efx_fe_cp_dirorigen') {
                var dircli = recObj.getValue({fieldId:'custrecord_efx_fe_cp_dirorigen'});
                if(dircli){
                    recObj.getField({
                        fieldId: 'custrecord_efx_fe_cp_locorigen'
                    }).isDisabled = true;
                }else{
                    recObj.getField({
                        fieldId: 'custrecord_efx_fe_cp_locorigen'
                    }).isDisabled = false;
                }
            }

            if (scriptContext.fieldId == 'custrecord_efx_fe_cp_locorigen') {
                var dirloc = recObj.getValue({fieldId:'custrecord_efx_fe_cp_locorigen'});
                if(dirloc){
                    recObj.getField({
                        fieldId: 'custrecord_efx_fe_cp_dirorigen'
                    }).isDisabled = true;
                }else{
                    recObj.getField({
                        fieldId: 'custrecord_efx_fe_cp_dirorigen'
                    }).isDisabled = false;
                }
            }



        }else if(recObj.type == 'customrecord_efx_fe_cp_infovehiculo'){

            if (scriptContext.fieldId == 'custrecord_efx_fe_cp_tipveh') {
                var tipoveh = recObj.getValue({fieldId:'custrecord_efx_fe_cp_tipveh'});

                if(tipoveh){
                    if (tipoveh == 1) {
                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_subtiporem'
                        }).isDisplay = false;

                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_permsct'
                        }).isDisplay = true;
                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_numpermisosct'
                        }).isDisplay = true;
                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_configvehicular'
                        }).isDisplay = true;
                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_aniomodelovm'
                        }).isDisplay = true;
                    }

                    if (tipoveh == 2) {
                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_permsct'
                        }).isDisplay = false;
                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_numpermisosct'
                        }).isDisplay = false;
                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_configvehicular'
                        }).isDisplay = false;
                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_subtiporem'
                        }).isDisplay = true;
                        recObj.getField({
                            fieldId: 'custrecord_efx_fe_cp_aniomodelovm'
                        }).isDisplay = false;
                    }
                }else{
                    recObj.getField({
                        fieldId: 'custrecord_efx_fe_cp_subtiporem'
                    }).isDisplay = true;
                    recObj.getField({
                        fieldId: 'custrecord_efx_fe_cp_permsct'
                    }).isDisplay = true;
                    recObj.getField({
                        fieldId: 'custrecord_efx_fe_cp_numpermisosct'
                    }).isDisplay = true;
                    recObj.getField({
                        fieldId: 'custrecord_efx_fe_cp_configvehicular'
                    }).isDisplay = true;
                    recObj.getField({
                        fieldId: 'custrecord_efx_fe_cp_aniomodelovm'
                    }).isDisplay = true;
                }
            }

        }else {

            if (scriptContext.fieldId == 'custbody_efx_fe_transpinternac') {
                var transporteInternac = recObj.getValue({fieldId: 'custbody_efx_fe_transpinternac'});
                console.log(transporteInternac);
                if (transporteInternac == 2 || !transporteInternac) {
                    recObj.getField({
                        fieldId: 'custbody_efx_fe_cp_entradasalidamerc'
                    }).isDisplay = false;

                    recObj.getField({
                        fieldId: 'custbody_efx_fe_cp_viaentradasalida'
                    }).isDisplay = false;

                } else if (transporteInternac == 1) {
                    recObj.getField({
                        fieldId: 'custbody_efx_fe_cp_entradasalidamerc'
                    }).isDisplay = true;

                    recObj.getField({
                        fieldId: 'custbody_efx_fe_cp_viaentradasalida'
                    }).isDisplay = true;

                }

            }
            if (scriptContext.fieldId == 'custbody_efx_fe_transporte') {
                var tipoTransporte = recObj.getValue({fieldId: 'custbody_efx_fe_transporte'});
                if (!tipoTransporte || tipoTransporte != 1) {
                    recObj.getField({
                        fieldId: 'custbody_efx_fe_cp_autotrandetail'
                    }).isDisplay = false;
                } else if (tipoTransporte == 1) {
                    recObj.getField({
                        fieldId: 'custbody_efx_fe_cp_autotrandetail'
                    }).isDisplay = true;
                }
            }



            // if (scriptContext.fieldId == 'custrecord_efx_fe_cp_dirorigen') {
            //
            //     var dirloc = recObj.getCurrentSublistValue({
            //         sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
            //         fieldId: 'custrecord_efx_fe_cp_dirorigen'
            //     });
            //
            //     var dirlocline = recObj.getCurrentSublistIndex({
            //         sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones'
            //     });
            //     console.log('dirloc: ',dirloc);
            //     console.log('dirlocline: ',dirlocline);
            //
            //     if(dirloc){
            //
            //         recObj.getCurrentSublistField({
            //             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
            //             fieldId: 'custrecord_efx_fe_cp_locorigen',
            //
            //         }).isDisabled = true;
            //     }else{
            //
            //         recObj.getCurrentSublistField({
            //             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
            //             fieldId: 'custrecord_efx_fe_cp_locorigen',
            //
            //         }).isDisabled = false;
            //     }
            //
            //
            // }
            //
            // if (scriptContext.fieldId == 'custrecord_efx_fe_cp_locorigen') {
            //     var dirloc = recObj.getCurrentSublistValue({
            //         sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
            //         fieldId: 'custrecord_efx_fe_cp_locorigen'
            //     });
            //
            //     var dirlocline = recObj.getCurrentSublistIndex({
            //         sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones'
            //     });
            //     console.log('dirloc: ',dirloc);
            //     console.log('dirlocline: ',dirlocline);
            //
            //     if(dirloc){
            //
            //         recObj.getCurrentSublistField({
            //             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
            //             fieldId: 'custrecord_efx_fe_cp_dirorigen',
            //
            //         }).isDisabled = true;
            //     }else{
            //
            //         recObj.getCurrentSublistField({
            //             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
            //             fieldId: 'custrecord_efx_fe_cp_dirorigen',
            //
            //         }).isDisabled = false;
            //     }
            // }


        }
    }


        function creaCP(tranData){
                var myMsg_create = mensajes.create({
                    title: "Generación",
                    message: "Se está generando un registro de carta Porte...",
                    type: mensajes.Type.INFORMATION
                });
                myMsg_create.show();

                console.log('trandata: ',tranData);
                var tranid = tranData.tranid || '';
                var trantype = tranData.trantype || '';
                //GENERAR DOCUMENTO

                var suiteletURL = url.resolveScript({
                    scriptId: "customscript_efx_fe_carta_porte_sl",
                    deploymentId: "customdeploy_efx_fe_carta_porte_sl",
                    params: {
                        tranid: tranid,
                        trantype: trantype,
                        //certSendingMethodId: certId*1
                    }
                });
                console.log(suiteletURL);


                https.request.promise({
                    method: https.Method.GET,
                    url: suiteletURL
                })
                    .then(function (response) {

                        var body = JSON.parse(response.body)
                        console.log(body);

                        console.log('success ', body.success);

                        if (body.success) {
                            try {
                                console.log('success entra ', body.success);
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Generación",
                                    message: "Se creó un registro de carta porte.",
                                    type: mensajes.Type.CONFIRMATION
                                });
                                myMsg.show({duration: 5500});

                                console.log('respuesta');
                                location.reload();
                            } catch (error) {
                                console.log(error);
                            }

                        }

                    })
                    .catch(function onRejected(reason) {
                        log.debug({
                            title: 'Invalid Request: ',
                            details: reason
                        });
                        var myMsg = mensajes.create({
                            title: "Error",
                            message: reason,
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show({duration: 5500});
                        location.reload();
                    });



        }

    function generaCertificaGBLCP(tranData){
        console.log('En ejecucion',enEjecucion);
        if(enEjecucion==false) {
            enEjecucion=true;
            
            var envia_correo_auto = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_autosendmail'});
            var myMsg_create = mensajes.create({
                title: "Generación",
                message: "Se está generando y certificando su CFDI...",
                type: mensajes.Type.INFORMATION
            });
            myMsg_create.show();

            var tranid = tranData.tranid || '';
            var trantype = tranData.trantype || '';
            var tipocp = tranData.tipo || '';
            var idtimbre = tranData.idtimbre || '';
            //GENERAR DOCUMENTO
            console.log('En tipocp',tipocp);
            console.log('En idtimbre',idtimbre);

            var suiteletURL = url.resolveScript({
                scriptId: "customscript_efx_fe_xml_generator",
                deploymentId: "customdeploy_efx_fe_xml_generator",
                params: {
                    tranid: tranid,
                    trantype: trantype,
                    tipo:tipocp,
                    idtimbre:idtimbre
                    //certSendingMethodId: certId*1
                }
            });
            console.log(suiteletURL);


            https.request.promise({
                method: https.Method.GET,
                url: suiteletURL
            })
                .then(function (response) {

                    var body = JSON.parse(response.body)
                    console.log(body);

                    console.log('success ', body.success);

                    if (body.success) {
                        try {
                            console.log('success entra ', body.success);
                            myMsg_create.hide();
                            var myMsg = mensajes.create({
                                title: "Generación",
                                message: "Se generó su documento electrónico.",
                                type: mensajes.Type.CONFIRMATION
                            });
                            myMsg.show({duration: 5500});

                            console.log('respuesta');
                            var myMsg_cert = mensajes.create({
                                title: "Certificación",
                                message: "Se está certificando su CFDI...",
                                type: mensajes.Type.INFORMATION
                            });
                            myMsg_cert.show();
                            myMsg.hide();
                        } catch (error) {
                            console.log(error);
                        }
                        if (body.success) {

                            var uuid_record = body.uuid;
                            var xml_record = body.xml_certified;
                            console.log('uuid: ', uuid_record);
                            console.log('xml: ', xml_record);

                            if (uuid_record) {
                                myMsg_cert.hide();
                                var myMsg_certd = mensajes.create({
                                    title: "Certificación",
                                    message: "Se Certificó su documento electrónico.",
                                    type: mensajes.Type.CONFIRMATION
                                });
                                myMsg_certd.show({duration: 5500});
                                if(envia_correo_auto){
                                    try {
                                        myMsg_certd.hide();

                                        var myMsg_mail = mensajes.create({
                                            title: "Envio de Correo",
                                            message: "Enviando documentos por correo electrónico...",
                                            type: mensajes.Type.INFORMATION
                                        });
                                        myMsg_mail.show();
                                        myMsg_certd.hide();
                                    } catch (error) {
                                        console.log(error);
                                    }

                                    //Envio de correo
                                    var suiteletURL = url.resolveScript({
                                        scriptId: "customscript_efx_fe_mail_sender_sl",
                                        deploymentId: "customdeploy_efx_fe_mail_sender_sl",
                                        params: {
                                            tranid: tranid,
                                            trantype: trantype,
                                        }
                                    });
                                    console.log(suiteletURL);


                                    https.request.promise({
                                        method: https.Method.GET,
                                        url: suiteletURL
                                    })
                                        .then(function (response) {
                                            log.debug({
                                                title: 'Response',
                                                details: response
                                            });

                                        }).catch(function onRejected(reason) {
                                        log.debug({
                                            title: 'Invalid Request Mail: ',
                                            details: reason
                                        });
                                    });
                                }


                            } else {
                                myMsg_cert.hide();
                                var myMsg = mensajes.create({
                                    title: "Certificación",
                                    message: "Ocurrio un error durante su certificacion",
                                    type: mensajes.Type.ERROR
                                });
                                myMsg.show();
                            }


                            console.log('respuesta');
                            location.reload();

                        } else {
                            myMsg_cert.hide();
                            var myMsg = mensajes.create({
                                title: "Certificación",
                                message: "Ocurrio un error durante su certificacion",
                                type: mensajes.Type.ERROR
                            });
                            myMsg.show();
                        }
                    } else {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Generación",
                            message: "Ocurrio un error durante su generación",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }

                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                });

        }

    }

    function sendToMail(tranData) {
        var myMsg_create = mensajes.create({
            title: "Envio de Documentos Electrónicos",
            message: "Sus documentos se están enviando por correo...",
            type: mensajes.Type.INFORMATION
        });
        myMsg_create.show();
        var tranid = tranData.tranid || '';
        var trantype = tranData.trantype || '';

        var url_Script = url.resolveScript({
            scriptId: 'customscript_efx_fe_mail_sender_sl',
            deploymentId: 'customdeploy_efx_fe_mail_sender_sl',
            params: {
                trantype: trantype,
                tranid: tranid
            }
        });

        var headers = {
            "Content-Type": "application/json"
        };

        https.request.promise({
            method: https.Method.GET,
            url: url_Script,
            headers: headers
        })
            .then(function(response){
                log.debug({
                    title: 'Response',
                    details: response
                });

                if(response.code==200){
                    myMsg_create.hide();
                    var myMsg = mensajes.create({
                        title: "Envio de Documentos Electrónicos",
                        message: "Sus documentos se han enviado por correo electrónico...",
                        type: mensajes.Type.CONFIRMATION
                    });
                    myMsg.show({ duration : 5500 });

                    console.log('respuesta');

                    location.reload();
                }else if(response.code==500){
                    myMsg_create.hide();
                    var myMsg = mensajes.create({
                        title: "Envio de Documentos Electrónicos",
                        message: "Ocurrio un error, verifique su conexión.",
                        type: mensajes.Type.ERROR
                    });
                    myMsg.show();
                }else {
                    myMsg_create.hide();
                    var myMsg = mensajes.create({
                        title: "Envio de Documentos Electrónicos",
                        message: "Ocurrio un error, verifique si sus datos de correo",
                        type: mensajes.Type.ERROR
                    });
                    myMsg.show();
                }

            })
            .catch(function onRejected(reason) {
                log.debug({
                    title: 'Invalid Request: ',
                    details: reason
                });
            });

    }

    function regeneraPDF(tranData) {
        var myMsg_create = mensajes.create({
            title: "Regenerar PDF",
            message: "Se está generando el PDF desde su XML Certificado...",
            type: mensajes.Type.INFORMATION
        });
        myMsg_create.show();
        var tranid = tranData.tranid || '';
        var trantype = tranData.trantype || '';

        var url_Script = url.resolveScript({
            scriptId: 'customscript_efx_fe_cfdi_genera_pdf_sl',
            deploymentId: 'customdeploy_efx_fe_cfdi_genera_pdf_sl',
            params: {
                trantype: trantype,
                tranid: tranid
            }
        });

        var headers = {
            "Content-Type": "application/json"
        };

        https.request.promise({
            method: https.Method.GET,
            url: url_Script,
            headers: headers
        })
            .then(function(response){
                log.debug({
                    title: 'Response',
                    details: response
                });

                if(response.code==200){
                    console.log('respuestabody: ',response.body);
                    var bodyrespuesta = JSON.parse(response.body);
                    if(bodyrespuesta){
                        console.log('idpdf: ',bodyrespuesta.idPdf);
                        if(bodyrespuesta.idPdf){
                            myMsg_create.hide();
                            var myMsg = mensajes.create({
                                title: "Regenerar PDF",
                                message: "Se ha generado su archivo pdf...",
                                type: mensajes.Type.CONFIRMATION
                            });
                            myMsg.show({ duration : 5500 });

                            console.log('respuesta');

                            location.reload();
                        }else{
                            myMsg_create.hide();
                            var myMsg = mensajes.create({
                                title: "Regenerar PDF",
                                message: "No se pudo generar su pdf, valide la configuración...",
                                type: mensajes.Type.ERROR
                            });
                            myMsg.show({ duration : 5500 });

                            console.log('respuesta');

                            location.reload();
                        }
                    }

                }else if(response.code==500){
                    myMsg_create.hide();
                    var myMsg = mensajes.create({
                        title: "Regenerar PDF",
                        message: "Ocurrio un error, verifique su conexión.",
                        type: mensajes.Type.ERROR
                    });
                    myMsg.show();
                }else {
                    myMsg_create.hide();
                    var myMsg = mensajes.create({
                        title: "Regenerar PDF",
                        message: "Ocurrio un error, verifique si el xml timbrado es correcto",
                        type: mensajes.Type.ERROR
                    });
                    myMsg.show();
                }

            })
            .catch(function onRejected(reason) {
                log.debug({
                    title: 'Invalid Request: ',
                    details: reason
                });
            });

    }

    function generaCertifica(tranData){
        console.log('En ejecucion',enEjecucion);
        if(enEjecucion==false) {
            enEjecucion=true;
            console.log('En ejecucion',enEjecucion);
            var envia_correo_auto = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_autosendmail'});
            var myMsg_create = mensajes.create({
                title: "Generación",
                message: "Se está generando su CFDI...",
                type: mensajes.Type.INFORMATION
            });
            myMsg_create.show();

            var tranid = tranData.tranid || '';
            var trantype = tranData.trantype || '';
            //GENERAR DOCUMENTO
            var suiteletURL = url.resolveScript({
                scriptId: "customscript_ei_generation_service_su",
                deploymentId: "customdeploy_ei_generation_service_su",
                params: {
                    transId: tranid,
                    transType: trantype,
                    //certSendingMethodId: certId*1
                }
            });
            console.log(suiteletURL);


            https.request.promise({
                method: https.Method.GET,
                url: suiteletURL
            })
                .then(function (response) {

                    var body = JSON.parse(response.body)
                    console.log(body);

                    console.log('success ', body.success);

                    if (body.success) {
                        try {
                            console.log('success entra ', body.success);
                            myMsg_create.hide();
                            var myMsg = mensajes.create({
                                title: "Generación",
                                message: "Se generó su documento electrónico.",
                                type: mensajes.Type.CONFIRMATION
                            });
                            myMsg.show({duration: 5500});

                            console.log('respuesta');
                            var myMsg_cert = mensajes.create({
                                title: "Certificación",
                                message: "Se está certificando su CFDI...",
                                type: mensajes.Type.INFORMATION
                            });
                            myMsg_cert.show();
                            myMsg.hide();
                        } catch (error) {
                            console.log(error);
                        }

                        //TIMBRAR DOCUMENTO
                        var suiteletURL = url.resolveScript({
                            scriptId: "customscript_su_send_e_invoice",
                            deploymentId: "customdeploy_su_send_e_invoice",
                            params: {
                                transId: tranid,
                                transType: trantype,
                                //certSendingMethodId: certId*1
                            }
                        });
                        console.log(suiteletURL);


                        https.request.promise({
                            method: https.Method.GET,
                            url: suiteletURL
                        })
                            .then(function (response) {
                                log.debug({
                                    title: 'Response',
                                    details: response
                                });

                                var body = JSON.parse(response.body)

                                if (body.success) {

                                    var fieldLookUp = search.lookupFields({
                                        type: trantype,
                                        id: tranid,
                                        columns: ['custbody_mx_cfdi_uuid', 'custbody_psg_ei_certified_edoc']
                                    });

                                    var uuid_record = fieldLookUp['custbody_mx_cfdi_uuid'];
                                    var xml_record = fieldLookUp['custbody_psg_ei_certified_edoc'];
                                    console.log('fieldLookUp: ', fieldLookUp);
                                    console.log('uuid: ', uuid_record);
                                    console.log('xml: ', xml_record);

                                    if (uuid_record) {
                                        myMsg_cert.hide();
                                        var myMsg_certd = mensajes.create({
                                            title: "Certificación",
                                            message: "Se Certificó su documento electrónico.",
                                            type: mensajes.Type.CONFIRMATION
                                        });
                                        myMsg_certd.show({duration: 5500});
                                        if(envia_correo_auto){
                                            try {
                                                myMsg_certd.hide();

                                                var myMsg_mail = mensajes.create({
                                                    title: "Envio de Correo",
                                                    message: "Enviando documentos por correo electrónico...",
                                                    type: mensajes.Type.INFORMATION
                                                });
                                                myMsg_mail.show();
                                                myMsg_certd.hide();
                                            } catch (error) {
                                                console.log(error);
                                            }

                                            //Envio de correo
                                            var suiteletURL = url.resolveScript({
                                                scriptId: "customscript_efx_fe_mail_sender_sl",
                                                deploymentId: "customdeploy_efx_fe_mail_sender_sl",
                                                params: {
                                                    tranid: tranid,
                                                    trantype: trantype,
                                                }
                                            });
                                            console.log(suiteletURL);


                                            https.request.promise({
                                                method: https.Method.GET,
                                                url: suiteletURL
                                            })
                                                .then(function (response) {
                                                    log.debug({
                                                        title: 'Response',
                                                        details: response
                                                    });

                                                }).catch(function onRejected(reason) {
                                                log.debug({
                                                    title: 'Invalid Request Mail: ',
                                                    details: reason
                                                });
                                            });
                                        }


                                    } else {
                                        myMsg_cert.hide();
                                        var myMsg = mensajes.create({
                                            title: "Certificación",
                                            message: "Ocurrio un error durante su certificacion",
                                            type: mensajes.Type.ERROR
                                        });
                                        myMsg.show();
                                    }


                                    console.log('respuesta');
                                    location.reload();

                                } else {
                                    myMsg_cert.hide();
                                    var myMsg = mensajes.create({
                                        title: "Certificación",
                                        message: "Ocurrio un error durante su certificacion",
                                        type: mensajes.Type.ERROR
                                    });
                                    myMsg.show();
                                }

                            })
                            .catch(function onRejected(reason) {
                                log.debug({
                                    title: 'Invalid Request: ',
                                    details: reason
                                });
                            });


                    } else {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Generación",
                            message: "Ocurrio un error durante su generación",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }

                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                });

        }

    }

    function generaCertificaGBL(tranData){
        console.log('En ejecucion',enEjecucion);
        if(enEjecucion==false) {
            enEjecucion=true;
            console.log('En ejecucion',enEjecucion);
            var envia_correo_auto = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_autosendmail'});
            var myMsg_create = mensajes.create({
                title: "Generación",
                message: "Se está generando y certificando su CFDI...",
                type: mensajes.Type.INFORMATION
            });
            myMsg_create.show();

            var tranid = tranData.tranid || '';
            var trantype = tranData.trantype || '';
            //GENERAR DOCUMENTO

            var suiteletURL = url.resolveScript({
                scriptId: "customscript_efx_fe_xml_generator",
                deploymentId: "customdeploy_efx_fe_xml_generator",
                params: {
                    tranid: tranid,
                    trantype: trantype,
                    //certSendingMethodId: certId*1
                }
            });
            console.log(suiteletURL);


            https.request.promise({
                method: https.Method.GET,
                url: suiteletURL
            })
                .then(function (response) {

                    var body = JSON.parse(response.body)
                    console.log(body);

                    console.log('success ', body.success);

                    if (body.success) {
                        try {
                            console.log('success entra ', body.success);
                            myMsg_create.hide();
                            var myMsg = mensajes.create({
                                title: "Generación",
                                message: "Se generó su documento electrónico.",
                                type: mensajes.Type.CONFIRMATION
                            });
                            myMsg.show({duration: 5500});

                            console.log('respuesta');
                            var myMsg_cert = mensajes.create({
                                title: "Certificación",
                                message: "Se está certificando su CFDI...",
                                type: mensajes.Type.INFORMATION
                            });
                            myMsg_cert.show();
                            myMsg.hide();
                        } catch (error) {
                            console.log(error);
                        }
                                if (body.success) {

                                    var fieldLookUp = search.lookupFields({
                                        type: trantype,
                                        id: tranid,
                                        columns: ['custbody_mx_cfdi_uuid', 'custbody_psg_ei_certified_edoc']
                                    });

                                    var uuid_record = fieldLookUp['custbody_mx_cfdi_uuid'];
                                    var xml_record = fieldLookUp['custbody_psg_ei_certified_edoc'];
                                    console.log('fieldLookUp: ', fieldLookUp);
                                    console.log('uuid: ', uuid_record);
                                    console.log('xml: ', xml_record);

                                    if (uuid_record) {
                                        myMsg_cert.hide();
                                        var myMsg_certd = mensajes.create({
                                            title: "Certificación",
                                            message: "Se Certificó su documento electrónico.",
                                            type: mensajes.Type.CONFIRMATION
                                        });
                                        myMsg_certd.show({duration: 5500});
                                        if(envia_correo_auto){
                                            try {
                                                myMsg_certd.hide();

                                                var myMsg_mail = mensajes.create({
                                                    title: "Envio de Correo",
                                                    message: "Enviando documentos por correo electrónico...",
                                                    type: mensajes.Type.INFORMATION
                                                });
                                                myMsg_mail.show();
                                                myMsg_certd.hide();
                                            } catch (error) {
                                                console.log(error);
                                            }

                                            //Envio de correo
                                            var suiteletURL = url.resolveScript({
                                                scriptId: "customscript_efx_fe_mail_sender_sl",
                                                deploymentId: "customdeploy_efx_fe_mail_sender_sl",
                                                params: {
                                                    tranid: tranid,
                                                    trantype: trantype,
                                                }
                                            });
                                            console.log(suiteletURL);


                                            https.request.promise({
                                                method: https.Method.GET,
                                                url: suiteletURL
                                            })
                                                .then(function (response) {
                                                    log.debug({
                                                        title: 'Response',
                                                        details: response
                                                    });

                                                }).catch(function onRejected(reason) {
                                                log.debug({
                                                    title: 'Invalid Request Mail: ',
                                                    details: reason
                                                });
                                            });
                                        }


                                    } else {
                                        myMsg_cert.hide();
                                        var myMsg = mensajes.create({
                                            title: "Certificación",
                                            message: "Ocurrio un error durante su certificacion",
                                            type: mensajes.Type.ERROR
                                        });
                                        myMsg.show();
                                    }


                                    console.log('respuesta');
                                    location.reload();

                                } else {
                                    myMsg_cert.hide();
                                    var myMsg = mensajes.create({
                                        title: "Certificación",
                                        message: "Ocurrio un error durante su certificacion",
                                        type: mensajes.Type.ERROR
                                    });
                                    myMsg.show();
                                }
                        } else {
                            myMsg_create.hide();
                            var myMsg = mensajes.create({
                                title: "Generación",
                                message: "Ocurrio un error durante su generación",
                                type: mensajes.Type.ERROR
                            });
                            myMsg.show();
                        }

                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                });

        }

    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        creaCP:creaCP,
        generaCertificaGBLCP:generaCertificaGBLCP,
        sendToMail:sendToMail,
        generaCertifica:generaCertifica,
        generaCertificaGBL:generaCertificaGBL,
        regeneraPDF:regeneraPDF,

    };
    
});
