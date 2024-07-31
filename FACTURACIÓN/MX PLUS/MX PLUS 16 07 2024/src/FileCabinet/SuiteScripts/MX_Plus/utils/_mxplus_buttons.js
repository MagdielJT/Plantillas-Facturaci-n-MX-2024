/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/config', 'N/https'], /**
 * @param{log} log
 * @param{record} record
 */ (log, record, config, https) => {
    /**
     * Defines the function definition that is executed before record is loaded.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @param {Form} scriptContext.form - Current form
     * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
     * @since 2015.2
     */
    const beforeLoad = scriptContext => {
      try {
        const { type, form, newRecord } = scriptContext
        if (type == scriptContext.UserEventType.VIEW) {
          var conpanyinformationObj = config.load({
            type: config.Type.COMPANY_INFORMATION
          });
          let accountid = conpanyinformationObj.getValue('companyid');
          let access_data = hasAccessToNewFunctionalities(accountid);
          log.debug({title:'access_data',details:access_data});
          log.debug({
            title: 'newRecord.type',
            details: newRecord.type
          })
          const uuid = newRecord.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });
          // Intento de ocultar boton de generar documento electrónico
          form.removeButton('custpage_generate_ei_button');

          switch (newRecord.type) {
            case record.Type.CUSTOMER_PAYMENT:
              if (!uuid) {
                form.clientScriptModulePath = '../Pagos/Client/_mxplus_cust_pmt_actions.js'
                form.addButton({
                  id: 'custpage_btn_genera_certifica',
                  label: 'Generar y Certificar',
                  functionName: 'toSendData'
                })
                form.removeButton('custpage_btn_timbrar');  
              } else {
                form.clientScriptModulePath = '../Factura de Venta/Client/_mxplus_invoice_actions.js'
                form.addButton({
                  id: 'custpage_btn_regeneraPDF',
                  label: 'Regenerar PDF',
                  functionName: 'generaPDF'
                });
                form.addButton({
                  id: 'custpage_btn_enviaremail',
                  label: 'Enviar Docs Electrónicos',
                  functionName: 'enviarEmail'
                });
                form.removeButton('custpage_btn_gen_pdf');
              }
              break
            case 'customsale_efx_fe_factura_global':
              form.clientScriptModulePath = '../Factura de Venta/Client/_mxplus_invoice_actions.js'
              if (!uuid) {
                form.addButton({
                  id: 'custpage_btn_gbl_new',
                  label: 'MX+ Timbrar GBL',
                  functionName: 'toStampGlobal'
                });
                form.removeButton('custpage_btn_timbrar_gbl');
              } else {
                form.addButton({
                  id: 'custpage_btn_gbl_new',
                  label: 'MX+ Regenerar Adenda',
                  functionName: 'toRegenerateAdenda'
                });
                form.addButton({
                  id: 'custpage_btn_regeneraPDF',
                  label: 'Regenerar PDF',
                  functionName: 'generaPDF'
                });
                form.removeButton('custpage_btn_gen_pdf');
              }
              break
            case record.Type.INVOICE:
              form.removeButton('custpage_btn_create_addenda'); //botón de adenda antiguo
              if (!uuid) {

                // if (access_data.hasGeneralAccess == true && access_data.hasInvoice == true) {
                form.clientScriptModulePath = '../Factura de Venta/Client/_mxplus_invoice_actions.js'
                form.addButton({
                  id: 'custpage_btn_invoice_new',
                  label: 'Generar y Certificar',
                  functionName: 'toStampInvoice'
                });
                form.removeButton('custpage_btn_timbrar');
                // }
              } else {
                form.clientScriptModulePath = '../Factura de Venta/Client/_mxplus_invoice_actions.js'
                // Adendas
                form.addButton({
                  id: 'custpage_btn_gbl_new2',
                  label: 'MX+ Regenerar Adenda',
                  functionName: 'toRegenerateAdenda'
                });
                form.addButton({
                  id: 'custpage_btn_enviaremail',
                  label: 'Enviar Docs Electrónicos',
                  functionName: 'enviarEmail'
                });
                // Generacion de PDF
                form.addButton({
                  id: 'custpage_btn_regeneraPDF',
                  label: 'Regenerar PDF',
                  functionName: 'generaPDF'
                });
                form.removeButton('custpage_btn_gen_pdf');
                if (newRecord.getValue({ fieldId: 'custbody_efx_fe_cfdi_cancelled' }) == 'F' || newRecord.getValue({ fieldId: 'custbody_efx_fe_cfdi_cancelled' }) == false) {
                  // if (access_data.hasGeneralAccess == true && access_data.hasCancelacion == true) {

                  //   form.clientScriptModulePath = '../CFDI_CANCELACION/Client/mx_plus_cfdi_cancelacion_cl.js'
                    // form.addButton({
                    //   id: 'custpage_cancelacion_new',
                    //   label: 'Cancelar CFDI',
                    //   functionName: 'bottonCancelarCFDI'
                    // });
                    // form.removeButton('custpage_btn_cancel_cfdi');

                  // }
                }
              }
              break;
              case record.Type.CASH_SALE:

                if (!uuid) {
                  form.clientScriptModulePath = '../Factura de Venta/Client/_mxplus_invoice_actions.js'
                  form.addButton({
                    id: 'custpage_btn_cashsale_new',
                    label: 'Generar y Certificar',
                    functionName: 'toStampInvoice'
                  });
                  form.removeButton('custpage_btn_timbrar');
                } else {
                  form.clientScriptModulePath = '../Factura de Venta/Client/_mxplus_invoice_actions.js'
                  form.addButton({
                    id: 'custpage_btn_regeneraPDF',
                    label: 'Regenerar PDF',
                    functionName: 'generaPDF'
                  });
                  form.addButton({
                    id: 'custpage_btn_enviaremail',
                    label: 'Enviar Docs Electrónicos',
                    functionName: 'enviarEmail'
                  });
                  form.removeButton('custpage_btn_gen_pdf');
                  form.addButton({
                    id: 'custpage_btn_gbl_new2',
                    label: 'MX+ Regenerar Adenda',
                    functionName: 'toRegenerateAdenda'
                  });
                }
                break;
                case record.Type.CREDIT_MEMO:

                if (!uuid) {
                  form.clientScriptModulePath = '../Factura de Venta/Client/_mxplus_invoice_actions.js'
                  form.addButton({
                    id: 'custpage_btn_credit_new',
                    label: 'Generar y Certificar',
                    functionName: 'toStampInvoice'
                  });
                  form.removeButton('custpage_btn_timbrar');
                } else {
                  form.clientScriptModulePath = '../Factura de Venta/Client/_mxplus_invoice_actions.js'
                  form.addButton({
                    id: 'custpage_btn_regeneraPDF',
                    label: 'Regenerar PDF',
                    functionName: 'generaPDF'
                  });
                  form.addButton({
                    id: 'custpage_btn_enviaremail',
                    label: 'Enviar Docs Electrónicos',
                    functionName: 'enviarEmail'
                  });
                  form.removeButton('custpage_btn_gen_pdf');
                }
                break;
                case record.Type.ITEM_FULFILLMENT:
                  if (!uuid) {
                    form.clientScriptModulePath = '../CFDI Traslado/Client/_mxplus_itemfulfillment_actions.js'
                    form.addButton({
                      id: 'custpage_btn_fulfillment_new',
                      label: 'CFDI de Traslado',
                      functionName: 'toCFDIFulfillment'
                    });
                    form.removeButton('custpage_btn_timbrar');
                  } else {
                    form.clientScriptModulePath = '../Factura de Venta/Client/_mxplus_invoice_actions.js'
                    form.addButton({
                      id: 'custpage_btn_regeneraPDF',
                      label: 'Regenerar PDF',
                      functionName: 'generaPDF'
                    });
                    form.addButton({
                      id: 'custpage_btn_enviaremail',
                      label: 'Enviar Docs Electrónicos',
                      functionName: 'enviarEmail'
                    });
                    form.removeButton('custpage_btn_pdf_template');
                    form.removeButton('custpage_btn_gen_pdf');
                    form.removeButton('custpage_pdfcartaportebtn');
                  }
                  break;
                }
              }
              form.removeButton('custpage_btn_pdf_template');
      } catch (error) {
        log.error('Error on load', error)
      }
    }
    const hasAccessToNewFunctionalities = (accountid) => {
      if (accountid) {
        let data_to_return = {
          hasGeneralAccess: false,
          // hasAdenda: false,
          // hasCancelacion: false,
          // hasInvoice: false
        }

        var direccionurl = 'https://tstdrv2220345.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1316&deploy=1&compid=TSTDRV2220345&h=2ba1e9ebabd86b428ef5&accountid=' + accountid;

        var response = https.get({
          url: direccionurl,
        });
        log.audit({ title: 'response-code', details: response.code });

        if (response.code == 200) {
          log.audit({ title: 'response-body', details: response.body });
          var bodyrespuesta = JSON.parse(response.body);

          if (bodyrespuesta.enabled == true) {
            data_to_return.hasGeneralAccess = true;
            // data_to_return.hasAdenda = bodyrespuesta.has_newAdenda;
            // data_to_return.hasCancelacion = bodyrespuesta.has_newCancelacion;
            // data_to_return.hasInvoice = bodyrespuesta.has_newInvoice;
          }else{
            data_to_return.hasGeneralAccess = false;
          }
        }else{
          // deployment caido
          data_to_return.hasGeneralAccess = true;
        }
        return data_to_return
      }
    }

    /**
     * Defines the function definition that is executed before record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     */
    const beforeSubmit = scriptContext => { }

    /**
     * Defines the function definition that is executed after record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     */
    const afterSubmit = scriptContext => { }

    return { beforeLoad, beforeSubmit, afterSubmit }
  })
