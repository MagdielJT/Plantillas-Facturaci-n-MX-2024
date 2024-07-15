/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/search', 'N/url', 'N/https', '../Lib/cfdi_cancelacion_constants.js', 'N/ui/dialog', 'N/ui/message'],
    /**
     * @param{log} log
     */
    function (currentRecord, search, url, https, cfdi_cancelacion_constants, dialog, message) {
        const { SERVICE_CP, OPTCANCEL } = cfdi_cancelacion_constants;
        var idItemSelected
        var idRempUUI
        // var facId
        var objRecord
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
            try { objRecord = currentRecord.get() } catch (err) { log.error('e', err) }
        }
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

            selectidItemSelected.addEventListener('change', atrapar,false);

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
                    console.log({contentDiv})
                    /*let newLabel = document.createElement('label')
                    newLabel.id = 'invoiceRel'
                    newLabel.textContent = 'Seleccione la factura relacionada'
                    contentDiv.appendChild(newLabel)
                    contentDiv.appendChild(document.createElement('input', { type: 'text', id: 'fsusti' }))*/

                    var newDiv = document.createElement('div')
                    // var newDiv = document.createElement('div')
                    newDiv.className = 'opFac'
                    console.log({newDiv})
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
                    body: ''
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
                                duration: 30000
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
                    duration:30000
                });
                mensajeError.show();
        }
        return {
            pageInit: pageInit,
            bottonCancelarCFDI: bottonCancelarCFDI
        };

    });
