/**
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/log'],
    /**
     * @param{record} record
     */
    function (record,log) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(context) {
            var newRec = context.newRecord;
            var recType = newRec.type;
            if (context.type == context.UserEventType.VIEW || (context.type == context.UserEventType.EDIT && recType == 'customrecord_efx_fe_cp_carta_porte')) {
                var form = context.form;
                form.clientScriptModulePath = "./EFX_FE_Cancelacion_CS.js";
                var record_cancel = context.newRecord;

                var status = record_cancel.getValue({ fieldId: 'approvalstatus' }) || '';
                var APPROVALSTATUS = (status == 2 || status == '');

                var uuid = record_cancel.getValue({ fieldId: 'custbody_mx_cfdi_uuid' }) || '';
                log.audit({ title: 'uuid', details: JSON.stringify(uuid) });

                var custbody_efx_fe_cancelled = record_cancel.getValue(
                    { fieldId: 'custbody_efx_fe_cfdi_cancelled' }
                );

                var statuscancelled = record_cancel.getValue(
                    { fieldId: 'custbody_efx_fe_cfdistatus' }
                );
                var transustitucion = record_cancel.getValue(
                    { fieldId: 'custbody_efx_fe_sustitucion' }
                );

                if (statuscancelled) {
                    var canceladosat = statuscancelled.indexOf("Estado Sat: Cancelado");
                    var canceladocomprobante = statuscancelled.indexOf("Estado de Comprobante: Cancelado");
                }


                if (recType == 'customrecord_efx_pagos_compensacion') {
                    uuid = record_cancel.getValue({ fieldId: 'custrecord_efx_compensacion_uuid' }) || '';
                    custbody_efx_fe_cancelled = record_cancel.getValue(
                        { fieldId: 'custrecord_efx_compensacion_cancel' }
                    );
                }

                if (recType == 'customrecord_efx_fe_cp_carta_porte') {
                    uuid = record_cancel.getValue({ fieldId: 'custrecord_efx_fe_cp_cuuid' }) || '';
                    custbody_efx_fe_cancelled = record_cancel.getValue(
                        { fieldId: 'custrecord_efx_fe_cp_ccancel' }
                    );
                }


                if (recType == record.Type.INVOICE || recType == record.Type.CREDIT_MEMO || recType == record.Type.CUSTOMER_PAYMENT || recType == record.Type.CASH_SALE || recType == record.Type.ITEM_FULFILLMENT || recType == 'customsale_efx_fe_factura_global' || recType == 'customrecord_efx_pagos_compensacion' || recType == 'customrecord_efx_fe_cp_carta_porte') {

                    if ((!custbody_efx_fe_cancelled && uuid)) {

                        if (record_cancel.type == 'customerpayment') {
                            var entidad = record_cancel.getValue(
                                { fieldId: 'customer' }
                            );
                            log.audit({ title: 'entidad', details: entidad });
                        } else {
                            var entidad = record_cancel.getValue(
                                { fieldId: 'entity' }
                            );
                            log.audit({ title: 'entidad', details: entidad });
                        }

                        var fechatransaccion = record_cancel.getValue(
                            { fieldId: 'trandate' }
                        );
                        log.audit({ title: 'fecha', details: fechatransaccion });
                        var tranData = {
                            tranid: record_cancel.id,
                            trantype: record_cancel.type,
                            entityid: entidad,
                            trandate: fechatransaccion
                        };
                        log.audit({ title: 'tranData', details: JSON.stringify(tranData) });

                        form.addButton({
                            id: "custpage_btn_cancel_cfdi",
                            label: "Cancelar CFDI",
                            functionName: "cancel_CFDI(" + JSON.stringify(tranData) + ")"
                        });

                        if (recType != 'customsale_efx_fe_factura_global' && recType != 'customrecord_efx_pagos_compensacion' && recType != 'customrecord_efx_fe_cp_carta_porte' && recType != record.Type.CUSTOMER_PAYMENT && recType != record.Type.CREDIT_MEMO && recType != record.Type.ITEM_FULFILLMENT) {
                            /*form.addButton({
                                id: "custpage_btn_cancel_s_cfdi",
                                label: "Cancelar/Sustituir CFDI",
                                functionName: "cancel_subs_CFDI(" + JSON.stringify(tranData) + ")"
                            });*/
                        }

                    }
                    log.audit({ title: 'canceladosat', details: JSON.stringify(canceladosat) });
                    log.audit({ title: 'canceladocomprobante', details: JSON.stringify(canceladocomprobante) });
                    log.audit({ title: 'transustitucion', details: JSON.stringify(transustitucion) });

                    if (canceladosat > 0 && canceladocomprobante > 0 && !transustitucion) {
                        log.audit({ title: 'recType', details: JSON.stringify(recType) });
                        if (record_cancel.type == 'customerpayment') {
                            var entidad = record_cancel.getValue(
                                { fieldId: 'customer' }
                            );
                        } else {
                            var entidad = record_cancel.getValue(
                                { fieldId: 'entity' }
                            );
                        }
                        var fechatransaccion = record_cancel.getValue(
                            { fieldId: 'trandate' }
                        );
                        var tranData = {
                            tranid: record_cancel.id,
                            trantype: record_cancel.type,
                            solosustituye: 'T',
                            entityid: entidad,
                            trandate: fechatransaccion
                        };
                        if (recType != 'customsale_efx_fe_factura_global' && recType != 'customrecord_efx_pagos_compensacion' && recType != 'customrecord_efx_fe_cp_carta_porte' && recType != record.Type.CUSTOMER_PAYMENT && recType != record.Type.CREDIT_MEMO) {
                            log.audit({ title: 'transustitucion', details: JSON.stringify(transustitucion) });
                            form.addButton({
                                id: "custpage_btn_cancel_solo_cfdi",
                                label: "Sustituir",
                                functionName: "cancel_subs_CFDI(" + JSON.stringify(tranData) + ")"
                            });
                        }
                    }

                }


            }

        }



        return {
            beforeLoad: beforeLoad,

        };

    });