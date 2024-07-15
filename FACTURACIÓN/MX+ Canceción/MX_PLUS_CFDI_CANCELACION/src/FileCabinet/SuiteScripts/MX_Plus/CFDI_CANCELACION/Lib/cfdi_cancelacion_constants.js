/**
 * @NApiVersion 2.1
 */
define([],
    () => {
        const SERVICE_CP = {};
        SERVICE_CP.SCRIPTID = 'customscript_mx_plus_service_core_sl';
        SERVICE_CP.DEPLOYID = 'customdeploy_mx_plus_serv_core_des_sl';

        const OPTCANCEL = {}
        OPTCANCEL['01'] = 'Comprobante emitido con errores con relación.'
        OPTCANCEL['02'] = 'Comprobante emitido con errores sin relación.'
        OPTCANCEL['03'] = 'No se llevó a cabo la operación.'
        OPTCANCEL['04'] = 'Operación nominativa relacionada en una factura global.'
        return { SERVICE_CP, OPTCANCEL };
    })