/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @name FB_FE_Cancelacion_SL
 * @version 1.0
 * @author Dylan Mendoza <dylan.mendoza@freebug.mx>
 * @summary Script encargado de cancelar facturas
 * @copyright Tekiio México 2023
 *
 * Client              -> Tekiio
 * Last modification   -> 17/07/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> Registro en Netsuite <ID del registro>
 */
define(['N/log', 'N/ui/serverWidget', 'N/record', 'N/runtime', 'N/http', 'N/config', 'N/search', 'N/xml', 'N/file', 'N/render', 'N/format', 'N/url', 'N/redirect', 'N/transaction', 'N/https', 'N/task'],
    function (log, ui, record, runtime, http, config, search, xml, file, render, format, urlmod, redirect, transaction, https, task) {
        function cancel_cfdi(context) {
            var scriptObj = runtime.getCurrentScript();
            try {
                if (context.request.method === 'POST') {
                    // log.audit({title:'context.request.parameters',details:context.request.parameters});
                    var response = context.response;
                    var tranid = context.request.parameters.custparam_tranid || '';
                    var trantype = context.request.parameters.custparam_trantype || '';
                    var sustituir = context.request.parameters.custparam_sutituye || '';
                    var solosustituir = context.request.parameters.custparam_solosutituye || '';
                    var cancelacionAutomatica = context.request.parameters.custparam_pa == 'T';
                    var motivoCancelacion = context.request.parameters.custparam_motivocancelacion || '';
                    var uuid_sustitucion = context.request.parameters.custparam_uuidrelacionado || '';
                    log.audit({title: 'uuid_sustitucion', details: uuid_sustitucion});
                    var searchTypeTran = '';
                    switch (trantype) {
                        case 'invoice':
                            searchTypeTran = search.Type.INVOICE;
                            break;
                        case 'itemfulfillment':
                            searchTypeTran = search.Type.ITEM_FULFILLMENT;
                            break;
                        case 'cashsale':
                            searchTypeTran = search.Type.CASH_SALE;
                            break;
                        case 'creditmemo':
                            searchTypeTran = search.Type.CREDIT_MEMO;
                            break;
                        case 'customerpayment':
                            searchTypeTran = search.Type.CUSTOMER_PAYMENT;
                            break;
                        default:
                            searchTypeTran = trantype;
                            break;
                    }
                    var resultCancel = dataProcess(tranid, trantype, searchTypeTran, cancelacionAutomatica, sustituir, solosustituir, motivoCancelacion, uuid_sustitucion);
                    log.debug({ title: 'resultCancel', details: resultCancel });
                    var resultData = { success: false, error: '' };
                    if (resultCancel.success == false) {
                        resultData.success = false;
                        resultData.error = resultCancel.error;
                    } else {
                        resultData.success = true;
                    }
                    response.writeLine({ output: JSON.stringify(resultData) });
                }
            }
            catch (err) {
                log.error({ title: 'cancel_dfdi', details: err });
                throw err;
            }
        }

        function dataProcess(tranid, trantype, searchTypeTran, cancelacionAutomatica, sustituir, solosustituir, motivoCancelacion, uuid_sustitucion) {
            const response = { success: false, error: '', datos: {} };
            try {
                // log.debug({title:'Params_getNetsuiteData', details:{tranid: tranid, trantype: trantype, searchTypeTran: searchTypeTran, cancelacionAutomatica: cancelacionAutomatica, sustituir: sustituir, solosustituir: solosustituir, motivoCancelacion: motivoCancelacion, uuidaCancelar: uuidaCancelar}});
                var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
                var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
                log.debug({ title: 'clientType', details: { multipleSubsi: JSON.stringify(SUBSIDIARIES), isSuiteTax: existeSuiteTax } });
                var rfcEmisor = '';
                var uuid = '';
                var cfdiversionCustomer = '';
                var subsidiary = '';
                if (searchTypeTran == 'customrecord_efx_pagos_compensacion') { // TODO ejemplo para este escenario.
                    var columns = ['custrecord_efx_compensacion_uuid'];
                } else if (searchTypeTran == 'customrecord_efx_fe_cp_carta_porte') { // TODO ejemplo para este escenario.
                    var columns = ['custrecord_efx_fe_cp_cuuid'];
                } else {
                    var columns = ['custbody_mx_cfdi_uuid', 'entity', 'customer.custentity_efx_fe_version'];
                    if (SUBSIDIARIES) {
                        columns.push('subsidiary')
                    }
                }
                var lookData = search.lookupFields({
                    type: searchTypeTran,
                    id: tranid,
                    columns: columns
                });
                // log.debug({title:'lookData', details:lookData});
                if (searchTypeTran == 'customrecord_efx_pagos_compensacion') { // TODO ejemplo para este escenario.
                    uuid = lookData.custrecord_efx_compensacion_uuid;
                } else if (searchTypeTran == 'customrecord_efx_fe_cp_carta_porte') { // TODO ejemplo para este escenario.
                    uuid = lookData.custrecord_efx_fe_cp_cuuid;
                } else {
                    uuid = lookData.custbody_mx_cfdi_uuid;
                    // MOD
                    // cfdiversionCustomer = lookData['customer.custentity_efx_fe_version'][0].value;
                    if (SUBSIDIARIES) {
                        subsidiary = lookData.subsidiary[0].value;
                    }
                }
                if (!SUBSIDIARIES) {
                    var configRecObj = config.load({
                        type: config.Type.COMPANY_INFORMATION
                    });
                    rfcEmisor = configRecObj.getValue({ fieldId: 'employerid' });
                } else if (SUBSIDIARIES && subsidiary) {
                    var resultSub = record.load({
                        type: search.Type.SUBSIDIARY,
                        id: subsidiary,
                    });
                    if (existeSuiteTax) {
                        rfcEmisor = resultSub.getSublistValue({ sublistId: 'taxregistration', fieldId: 'taxregistrationnumber', line: 0 });
                    } else {
                        rfcEmisor = resultSub.getValue({ fieldId: "federalidnumber" });
                    }
                }
                log.debug({ title: 'DataFound', details: { uuid: uuid,  subsidiary: subsidiary, rfcEmisor: rfcEmisor } });
                // log.debug({ title: 'DataFound', details: { uuid: uuid, cfdiversionCustomer: cfdiversionCustomer, subsidiary: subsidiary, rfcEmisor: rfcEmisor } });
                var dataConectionPac = getPacConection();
                log.debug({ title: 'dataconectionPac', details: dataConectionPac });
                var url_pac = '';
                var usuario_integrador = '';
                if (dataConectionPac.pruebas) {
                    rfcEmisor = dataConectionPac.emisorPrueba;
                    usuario_integrador = dataConectionPac.userPrueba;
                    url_pac = dataConectionPac.urlPrueba;
                } else {
                    usuario_integrador = dataConectionPac.user;
                    url_pac = dataConectionPac.url;
                }
                log.audit({title: 'datos para el token: ', details: {user: usuario_integrador, url_pac: url_pac}});
                var token = getTokenSW(usuario_integrador, '', url_pac);
                log.debug({ title: 'tokenResult', details: token });
                if (token.success == false) {
                    throw token.error;
                }
                var tokentry = token.token;
                var cancelResponse = cancelUUID(tokentry, motivoCancelacion, url_pac, rfcEmisor, uuid, uuid_sustitucion);
                log.debug({ title: 'cancelResponse', details: cancelResponse });
                if (cancelResponse.success == false) {
                    throw cancelResponse.error;
                }
                var fillResult = fillCancelFields(tranid, trantype, cancelResponse.data);
                log.debug({ title: 'fillResult', details: fillResult });
                if (fillResult.success == false) {
                    throw fillResult.error;
                }
                response.success = true;
            } catch (error) {
                log.error({ title: 'dataProcess', details: error });
                response.success = false;
                response.error = error;
            }
            return response;
        }

        function getTokenSW(user, pass, url) {
            var dataReturn = { success: false, error: '', token: '' }
            try {
                var urlToken = url + '/security/authenticate';
                // log.debug({title:'getTokenDat', details:{url: url, user: user, pass: pass}});
                // pass = 'AAA111';
                pass = 'mQ*wP^e52K34';
                var headers = {
                    "user": user,
                    "password": pass
                };
                var response = https.post({
                    url: urlToken,
                    headers: headers,
                    body: {}
                });
                // log.debug({title:'response', details:response});
                if (response.code == 200) {
                    var token = JSON.parse(response.body);
                    // log.debug({title:'token', details:token});
                    dataReturn.token = token.data;
                    dataReturn.success = true;
                } else {
                    dataReturn.error = 'Error getting token';
                    dataReturn.success = false;
                }
            } catch (error) {
                log.error({ title: 'getTokenSW', details: error });
                dataReturn.success = false;
                dataReturn.error = error;
            }
            return dataReturn;
        }

        function cancelUUID(tokentry, motivoCancelacion, url_pac, rfcEmisor, uuid, uuid_sustitucion) {
            const response = { success: false, error: '', data: '' };
            try {
                // log.debug({title:'tokentry', details:tokentry});
                var headersPos = {
                    "Authorization": "Bearer " + tokentry.token
                };
                var motivoCancelacionArray = motivoCancelacion.split(',')
                url_pac = url_pac + '/cfdi33/cancel/' + rfcEmisor + '/' + uuid + '/' + motivoCancelacionArray[0] + '/' + uuid_sustitucion|| ''
                log.audit({ title: 'url_pac', details: url_pac });
                var responsePAC = https.post({
                    url: url_pac,
                    headers: headersPos,
                    body: {}
                });
                // log.audit({ title: 'response ', details: responsePAC });
                var responseBody = JSON.parse(responsePAC.body);
                // log.audit({ title: 'responseBody', details: responseBody });
                if (responsePAC.code == 200) {
                    // log.debug({title:'Se cancelo', details:'Se cancelo'});
                    response.data = responseBody.data;
                    response.success = true;
                } else {
                    var msgDetail = 'No fue posible cancelar su UUID';
                    if (responseBody.messageDetail) {
                        msgDetail = responseBody.message + ': ' + responseBody.messageDetail;
                    }
                    log.error({ title: 'No fue posible cancelar el UUID', details: msgDetail });
                    response.success = false;
                    response.error = msgDetail;
                }
            } catch (error) {
                log.error({ title: 'cancelUUID', details: error });
                response.success = false;
                response.error = error;
            }
            return response;
        }

        function fillCancelFields(tranid, trantype, data) {
            const response = { success: false, error: '', data: '' };
            try {
                log.debug({ title: 'Datos param', details: { tranid: tranid, trantype: trantype, data: data } });
                let uuidKey = Object.keys(data.uuid);
                let uuidAcuse = data.uuid[uuidKey[0]];
                log.debug({ title: 'uuidAcuse', details: uuidAcuse });
                let responseCode = getAcuseCode(uuidAcuse);
                log.debug({ title: 'responseCode', details: responseCode });
                log.audit({title: 'tranype 244', details: trantype});
                log.audit({title: 'responseCode.result 245', details: responseCode.result});
                if (trantype == 'customrecord_efx_fe_cp_carta_porte') {
                    var rec = record.submitFields({
                        type: trantype,
                        id: tranid,
                        values: {
                            'custrecord_efx_fe_cp_ccancel': true,
                            'custrecord_efx_fe_cp_cacuse': responseCode.result
                        }
                    });
                } else {
                    var rec = record.submitFields({
                        type: trantype,
                        id: tranid,
                        values: {
                            'custbody_efx_fe_cfdi_cancelled': true,
                            'custbody_efx_fe_acuse_cancel': responseCode.result
                        }
                    });
                }
                response.success = true;
                response.data = rec;
            } catch (error) {
                log.error({ title: 'fillCancelFields', details: error });
                response.success = false;
                response.error = error
            }
            return response;
        }

        function getPacConection() {
            var objPacConection = {
                url: '',
                user: '',
                mailuser: '',
                https: '',
                pruebas: '',
                emisorPrueba: '',
                urlPrueba: '',
                userPrueba: '',
                urlValidador: '',
                userValidador: ''
            }
            var idConection = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_connect_pac_data' });
            var conectionObj = record.load({
                type: 'customrecord_efx_fe_mtd_envio',
                id: idConection
            });
            objPacConection.url = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_url' });
            objPacConection.user = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_user' });
            objPacConection.mailuser = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_user_email' });
            objPacConection.https = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_https' });
            objPacConection.pruebas = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_test' });
            objPacConection.emisorPrueba = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_emisor_pb' });
            objPacConection.urlPrueba = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_urltest' });
            objPacConection.userPrueba = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_usertest' });
            objPacConection.urlValidador = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_urlvalid' });
            objPacConection.userValidador = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_uservalid' });

            return objPacConection;
        }

        function getAcuseCode(code) {
            const response = { success: false, error: '', result: '' };
            try {
                // Lista de codigos de respuesta de cancelación del PAC SW https://developers.sw.com.mx/knowledge-base/cancelacion-cfdi/
                const codesPAC = [
                    {
                        'code': '201',
                        'message': 'Solicitud de cancelación exitosa',
                        'description': 'Se considera una solicitud de cancelación exitosa, sin embargo esto no asegura su cancelación'
                    },
                    {
                        'code': '202',
                        'message': 'Folio Fiscal Previamente Cancelado',
                        'description': 'Se considera solicitud de cancelación previamente enviada. Estatus Cancelado ante el SAT.'
                    },
                    {
                        'code': '203',
                        'message': 'Folio Fiscal No Correspondiente al Emisor',
                        'description': ''
                    },
                    {
                        'code': '204',
                        'message': 'Folio Fiscal No Aplicable a Cancelación',
                        'description': ''
                    },
                    {
                        'code': '205',
                        'message': 'Folio Fiscal No Aplicable a Cancelación',
                        'description': 'El sat da una prorroga de 48 hrs para que el comprobante aparezca con estatus Vigente posterior al envió por parte del Proveedor de Certificación de CFDI. Puede que algunos comprobantes no aparezcan al momento, es necesario esperar por lo menos 48 hrs.'
                    },
                    {
                        'code': '206',
                        'message': 'UUID no corresponde a un CFDI del Sector Primario',
                        'description': ''
                    },
                    {
                        'code': '207',
                        'message': 'No se especificó el motivo de cancelación o el motivo no es valido',
                        'description': 'El UUID sustitución no existe, está cancelado o tiene una fecha de emisión anterior a la fecha de emisión del comprobante original.'
                    },
                    {
                        'code': '208',
                        'message': 'Folio Sustitución invalido',
                        'description': ''
                    },
                    {
                        'code': '209',
                        'message': 'Folio Sustitución no requerido',
                        'description': ''
                    },
                    {
                        'code': '210',
                        'message': 'La fecha de solicitud de cancelación es mayor a la fecha de declaración',
                        'description': ''
                    },
                    {
                        'code': '211',
                        'message': 'La fecha de solicitud de cancelación límite para factura global',
                        'description': ''
                    },
                    {
                        'code': '212',
                        'message': 'Relación no valida o inexistente',
                        'description': ''
                    },
                    {
                        'code': '300',
                        'message': 'Usuario No Válido',
                        'description': ''
                    },
                    {
                        'code': '301',
                        'message': 'XML Mal Formado',
                        'description': 'Este código de error se regresa cuando el request posee información invalida, ejemplo: un RFC de receptor no válido.'
                    },
                    {
                        'code': '302',
                        'message': 'Sello Mal Formado',
                        'description': ''
                    },
                    {
                        'code': '304',
                        'message': 'Certificado Revocado o Caduco',
                        'description': 'El certificado puede ser inválido por múltiples razones como son el tipo, la vigencia, etc.'
                    },
                    {
                        'code': '305',
                        'message': 'Certificado Inválido',
                        'description': 'El certificado puede ser inválido por múltiples razones como son el tipo, la vigencia, etc.'
                    },
                    {
                        'code': '309',
                        'message': 'Certificado Inválido',
                        'description': 'El certificado puede ser inválido por múltiples razones como son el tipo, la vigencia, etc.'
                    },
                    {
                        'code': '310',
                        'message': 'CSD Inválido',
                        'description': 'El certificado puede ser inválido por múltiples razones como son el tipo, la vigencia, etc.'
                    }
                ];
                let msgResult = codesPAC.find(element => { return element.code == code });
                if (msgResult) {
                    response.success = true;
                    response.result = msgResult.message;
                }
            } catch (error) {
                log.error({ title: 'getAcuseCode', details: error });
                response.success = false;
                response.error = error;
            }
            return response;
        }

        return {
            onRequest: cancel_cfdi
        };
    });