/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/http', 'N/https', 'N/record', 'N/url', 'N/ui/message', 'N/currentRecord', 'N/ui/dialog', 'N/search', '../../Utilities/moment.js'],
    /**
     * @param{http} http
     * @param{https} https
     * @param{record} record
     */
    function (http, https, record, url, mensajes, currentRecord, dialog, search, moment) {

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

        function cancel_CFDI(tranData) {
            var motivoCancel = new Array();
            var buscaMotivo = search.create({
                type: 'customrecord_efx_fe_motivocancelacion',
                filters: [
                    ['isinactive', search.Operator.IS, 'F']
                ],
                columns: [
                    search.createColumn({ name: 'internalid' }),
                    search.createColumn({ name: 'name' }),
                ]
            });
            buscaMotivo.run().each(function (result) {
                motivoCancel.push(result.getValue({ name: 'name' }) || 0);
                return true;
            });


            var data = document.createElement('cancel-screen');

            var message = '';
            message += '<select id="cancelar">';
            message += '    <option value="0" disabled selected hidden>Seleccione una opción.</option>';
            for (var i = 0; i < motivoCancel.length; i++) {
                message += '    <option value="' + (i + 1) + '">' + motivoCancel[i] + '</option>';
            }
            message += '</select>';


            // Inner HTML
            // Estilos del mensaje + divs del mensaje completo
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
                'width: 30%;' +//alto
                'overflow: hidden;' +
                'filter: drop-shadow(0 0 0.1rem black);' +
                'height: 30%;' +//ancho
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
                "<p>Por favor selecciona un motivo de cancelación.</p>" +
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

            document.body.appendChild(data);
            document.getElementById('enviar').addEventListener('click', good, false);
            document.getElementById('cancel').addEventListener('click', fail, false);

            //intento de ver dato
            document.getElementById('cancelar').addEventListener('click', test, false);
            var flag = false;


            function good() {
                console.log('entra a función para cancelación');

                state = false; //bandera
                var canselReasonText = document.getElementById('cancelar');
                var uuid_sustitucion = '';
                if (document.getElementById('cancelar').value == 1) {
                    cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                    uuid_sustitucion = document.getElementById('listFact').value; //! cambiar para que se almacene el uuid de la factura que se seleccione
                    console.log(cancelReason);
                    console.log('uudi de sustitucion: ',uuid_sustitucion);
                    state = true;
                } else if (document.getElementById('cancelar').value == 2) {
                    cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                    console.log(cancelReason);
                    console.log(uuid_sustitucion);
                    state = true;
                } else if (document.getElementById('cancelar').value == 3) {
                    cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                    console.log(cancelReason);
                    state = true;
                } else if (document.getElementById('cancelar').value == 4) {
                    cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                    console.log(cancelReason);
                    state = true;
                } else {
                    console.log('no trae valor shido')
                    cancelReason = "";
                    data.innerHTML = "";
                    var mensaje = mensajes.create({
                        title: "Error",
                        message: "Debe seleccionar un motivo de cancelación, Intente de nuevo...",
                        type: mensajes.Type.ERROR
                    });
                    mensaje.show();
                    // location.reload();
                }

                if (state && cancelReason) {//document.getElementById('cancelar').value != 0
                    data.innerHTML = "";
                    var cR = currentRecord.get();

                    try {
                        var id = record.submitFields({
                            type: cR.type,//cambiarlo por cR.type
                            id: cR.id,
                            values: {
                                custbody_efx_fe_cancelreason: cancelReason
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    } catch (error_motivo) {
                        console.log('error_motivo', error_motivo);
                    }
                    var myMsg_create = mensajes.create({
                        title: "Cancelacion",
                        message: "Se está cancelando su CFDI...",
                        type: mensajes.Type.INFORMATION
                    });
                    myMsg_create.show();
                    var tranid = tranData.tranid;
                    var trantype = tranData.trantype;
                    var idGlb = false;
                    /* try {

                        var rec = record.load({
                            type: trantype,
                            id: tranid
                        });

                        //idGlb = rec.getValue({ fieldId: 'custbody_efx_fe_factura_global' }) || '';
                    } catch (error) {
                        log.error({ title: 'error', details: JSON.stringify(error) });
                    } */
                    var respuesta = true;

                    if (idGlb) {
                        respuesta = confirm("Desea cancelar una factura global?");
                    }

                    if (respuesta == true && state == true) {//aqui se puede detener la cancelacion

                        var codigoCancelacion = cancelReason.split('-');
                        var url_Script = url.resolveScript({
                            scriptId: 'customscript_efx_fe_cancelacion_sl',
                            deploymentId: 'customdeploy_efx_fe_cancelacion_sl',
                            returnExternalUrl: true
                        });

                        url_Script += '&custparam_tranid=' + tranid;
                        url_Script += '&custparam_trantype=' + trantype;
                        url_Script += '&custparam_sutituye=' + 'F';
                        url_Script += '&custparam_motivocancelacion=' + codigoCancelacion; //custbody_efx_fe_cancelreason
                        url_Script += '&custparam_uuidrelacionado=' + uuid_sustitucion; //custbody_efx_fe_cancelreason

                        var headers = {
                            "Content-Type": "application/json"
                        };
                        console.log('url_script', url_Script);
                        https.request.promise({
                            method: https.Method.POST,
                            url: url_Script,
                            headers: headers,
                            body: {}
                        }).then(function (response) {
                            console.log({
                                title: 'Response',
                                details: response
                            });
                            var myresponse_body = JSON.parse(response.body)
                            console.log('body: ', myresponse_body);
                            console.log('respuesta: ', response);

                            if (response.code == 200) {
                                myMsg_create.hide();
                                if (myresponse_body.success == false) {
                                    var myMsg = mensajes.create({
                                        title: "Cancelacion",
                                        message: "Ocurrio un error: " + myresponse_body.error,
                                        type: mensajes.Type.ERROR
                                    });
                                    myMsg.show();
                                } else {
                                    var myMsg = mensajes.create({
                                        title: "Cancelacion",
                                        message: "El proceso de cancelación concluyó, revise el acuse de cancelación en la subpestaña de CFDI Infomation",
                                        type: mensajes.Type.CONFIRMATION
                                    });
                                    myMsg.show({ duration: 5500 });
                                    console.log('respuesta');

                                    location.reload();
                                }
                            } else if (response.code == 500) {
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Cancelacion",
                                    message: "Ocurrio un error, verifique su conexión.",
                                    type: mensajes.Type.ERROR
                                });
                                myMsg.show();
                            } else {
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Cancelacion",
                                    message: "Ocurrio un error, verifique si su CFDI puede cancelarse.",
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
            }

            function test() {
                var dato = document.getElementById('cancelar').value;
                var div = document.getElementById('option');//se apunta al mensaje de arriba
                var update = document.createElement('div');//se crea lo que se necesita

                var rawDateString = (tranData.trandate).split('T');
                var fechafinText = rawDateString[0];
                var responseDate = moment(fechafinText).format('DD/MM/YYYY');
                console.log('responseDate: ', responseDate);

                //? Escenario de sustitucion
                if (dato == 1 && !flag) {
                    var facturasArray = new Array();
                    if (tranData.trantype == 'customerpayment') {
                        console.log('tranData.trantype: ', tranData.trantype);
                        console.log('tranData.entityid: ', tranData.entityid);
                        var buscaFactura = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['mainline', search.Operator.IS, 'T']
                                , 'AND',
                                ['type', search.Operator.ANYOF, 'CustPymt']
                                , 'AND',
                                ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                                , 'AND',
                                ['entity', search.Operator.ANYOF, tranData.entityid]
                                , 'AND',
                                ["trandate", search.Operator.ONORAFTER, responseDate]
                            ],
                            columns: [
                                search.createColumn({ name: 'internalid' }),
                                search.createColumn({ name: 'tranid' }),
                                search.createColumn({ name: 'custbody_mx_cfdi_uuid' }),
                            ]
                        });
                        console.log('pasasearch ');
                    } else if (tranData.trantype == 'creditmemo') {
                        var buscaFactura = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['mainline', search.Operator.IS, 'T']
                                , 'AND',
                                ['type', search.Operator.ANYOF, 'CustCred']
                                , 'AND',
                                ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                                , 'AND',
                                ['entity', search.Operator.ANYOF, tranData.entityid]
                                , 'AND',
                                ["trandate", search.Operator.ONORAFTER, responseDate]
                            ],
                            columns: [
                                search.createColumn({ name: 'internalid' }),
                                search.createColumn({ name: 'tranid' }),
                                search.createColumn({ name: 'custbody_mx_cfdi_uuid' }),
                            ]
                        });
                    } else if (tranData.trantype == 'itemfulfillment') {
                        var buscaFactura = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['mainline', search.Operator.IS, 'T']
                                , 'AND',
                                ['type', search.Operator.ANYOF, 'CustInvc', 'CashSale']
                                , 'AND',
                                ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                                , 'AND',
                                ['entity', search.Operator.ANYOF, tranData.entityid]
                                , 'AND',
                                ["trandate", search.Operator.ONORAFTER, responseDate]
                            ],
                            columns: [
                                search.createColumn({ name: 'internalid' }),
                                search.createColumn({ name: 'tranid' }),
                                search.createColumn({ name: 'custbody_mx_cfdi_uuid' }),
                            ]
                        });
                    } else {
                        var buscaFactura = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['mainline', search.Operator.IS, 'T']
                                , 'AND',
                                ['type', search.Operator.ANYOF, 'CustInvc', 'CashSale']
                                , 'AND',
                                ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                                , 'AND',
                                ['entity', search.Operator.ANYOF, tranData.entityid]
                                , 'AND',
                                ["trandate", search.Operator.ONORAFTER, responseDate]
                            ],
                            columns: [
                                search.createColumn({ name: 'internalid' }),
                                search.createColumn({ name: 'tranid' }),
                                search.createColumn({ name: 'custbody_mx_cfdi_uuid' }),
                            ]
                        });
                    }

                    try {
                        buscaFactura.run().each(function (result) {
                            var objFacturas = {
                                uuid: "",
                                numero: "",
                                id: ""
                            };
                            objFacturas.uuid = result.getValue({ name: 'custbody_mx_cfdi_uuid' }) || 0;
                            objFacturas.numero = result.getValue({ name: 'tranid' }) || 0;
                            objFacturas.id = result.getValue({ name: 'internalid' }) || 0;
                            // console.log(objFacturas);
                            facturasArray.push(objFacturas);
                            return true;
                        });
                    } catch (error_busqueda) {
                        console.log('error_busqueda: ', error_busqueda);
                    }
                    var facturasString = "";
                    var tranid = tranData.tranid;
                    for (var x = 0; x < facturasArray.length; x++) {
                        // console.log('validacion', facturasArray[x].id + '!=' + tranid);
                        if (facturasArray[x].id != tranid) {
                            facturasString += '<option value="' + facturasArray[x].uuid + '" >' + facturasArray[x].numero + '</option>'
                        }
                    }
                    flag = true;
                    // console.log('el dato es: ', dato);
                    // console.log('aqui debe de hacer que aparezca lo que se pide')
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
                        ".mensajito{" +
                        'height: 40%;' +
                        "}" +
                        "</style>" +
                        "<p id='title'>Por favor selecciona la factura: </p>" +
                        "<select id='listFact'>" +
                        '<option value="0" disabled selected hidden>Seleccione una opción.</option>' +
                        facturasString +
                        "</select>";

                    div.appendChild(update);//se agrega al mensaje
                    //console.log(update);
                } else if (dato == 2) {
                    flag = false;
                    console.log('el dato es: ', dato);
                    update.innerHTML =
                        "<style>" +
                        ".mensajito{" +
                        'height: 30%;' +
                        "}" +
                        "</style>";

                    div.appendChild(update);
                    document.getElementById('option').innerHTML = "";
                } else if (dato == 3) {
                    flag = false;
                    console.log('el dato es: ', dato);
                    update.innerHTML =
                        "<style>" +
                        ".mensajito{" +
                        'height: 30%;' +
                        "}" +
                        "</style>";

                    div.appendChild(update);
                    document.getElementById('option').innerHTML = "";
                } else if (dato == 4) {
                    flag = false;
                    console.log('el dato es: ', dato);
                    update.innerHTML =
                        "<style>" +
                        ".mensajito{" +
                        'height: 30%;' +
                        "}" +
                        "</style>";

                    div.appendChild(update);
                    document.getElementById('option').innerHTML = "";
                }

            }

            function fail() {
                console.log('se canceló la operación')
                data.innerHTML = "";
                var mensajeError = mensajes.create({
                    title: "Atención.",
                    message: "Se ha cancelado la operación...",
                    type: mensajes.Type.INFORMATION
                });
                mensajeError.show();
                // location.reload();
            }
        }

        return {
            pageInit: pageInit,
            // fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord,
            cancel_CFDI: cancel_CFDI,
        };

    });