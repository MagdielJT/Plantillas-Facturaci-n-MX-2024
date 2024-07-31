/**
 * @NApiVersion 2.1
 */
define([],

    () => {

        const SCRIPTS = {}
        SCRIPTS.CORE_SERVICE = {
            scriptId: 'customscript_mx_plus_service_core_sl',
            deploymentId: 'customdeploy_mx_plus_serv_core_des_sl'
        }

        const dictionary = [
            {
                id: "Version",
                msg: "Falta el campo 'Version'"
            },
            {
                id: "FormaPago",
                msg: "Falta el campo de'Forma de Pago'"
            },
            {
                id: "Serie",
                msg: "Falta el campo de 'Serie'"
            },
            {
                id: "Folio",
                msg: "Falta el campo de 'Folio'"
            },
            {
                id: "Fecha",
                msg: "Falta el campo de 'Fecha'"
            },
            {
                id: "MetodoPago",
                msg: "Falta el campo de 'Metodo de Pago'"
            },
            {
                id: "Moneda",
                msg: "Falta el campo de 'Tipo de Moneda'"
            },
            {
                id: "TipoCambio",
                msg: "Falta el campo de 'Tipo de Cambio'"
            },
            {
                id: "TipoDeComprobante",
                msg: "Falta el campo de 'Tipo de Comprobante'"
            },
            {
                id: "Exportacion",
                msg: "Falta el campo de 'Exportación'"
            },
            {
                id: "LugarExpedicion",
                msg: "Falta el campo de 'CP de Lugar de Expedicion'"
            },
            {
                id: "Emisor",
                msg: "Falta completar todos los campos de 'Emisor'"
            },
            {
                id: "Receptor",
                msg: "Falta completar todos los campos de 'Receptor'"
            },
            {
                id: "SubTotal",
                msg: "Falta el campo de 'Subtotal'"
            },
            {
                id: "Total",
                msg: "Falta el campo de 'Total'"
            },
            {
                id: "Conceptos",
                msg: "Falta completar todos los campos de 'Conceptos'"
            },
            ,
            {
                id: "Impuestos",
                msg: "Falta completar todos los campos de 'Impuestos Finales'"
            }
        ]
        
        const conceptDictionary = [
            {
                id: "ClaveProdServ",
                msg: "Falta el campo de 'Clave de Producto SAT'"
            },
            {
                id: "NoIdentificacion",
                msg: "Falta el campo de 'Número de identificación del Producto',puede ser UPC code, número SCIS o nombre de artículo "
            },
            {
                id: "Cantidad",
                msg: "Falta el campo de 'Cantidad de Producto'"
            },
            {
                id: "ClaveUnidad",
                msg: "Falta el campo de 'Clave del Producto'"
            },
            
            {
                id: "Descripcion",
                msg: "Falta el campo de 'Descripción del Producto'"
            },
            {
                id: "ValorUnitario",
                msg: "Falta el campo del 'Valor Unitario del Producto' que es la Tasa"
            },
            {
                id: "Importe",
                msg: "Falta el campo de 'Importe del Producto'"
            },
            {
                id: "ObjetoImp",
                msg: "Falta el campo de 'Objeto de Impuesto'"
            },
            {
                id: "Impuestos",
                msg: "Falta completar todos los campos de 'Impuestos'"
            }
        ]
        
        const emisorDictionary = [
            {
                id: "Rfc",
                msg: "Falta completar el campo 'RFC' del emisor"
            },
            {
                id: "Nombre",
                msg: "Falta completar el campo 'Nombre' del emisor"
            },
            {
                id: "RegimenFiscal",
                msg: "Falta completar el campo 'Regimen Fiscal' del emisor"
            }
        ]
        
        const receptDictionary = [
            {
                id: "Rfc",
                msg: "Falta completar el campo 'RFC' del receptor"
            },
            {
                id: "Nombre",
                msg: "Falta completar el campo 'Nombre' del receptor"
            },
            {
                id: "DomicilioFiscalReceptor",
                msg: "Falta completar el campo 'Domicilio Fiscal' del receptor"
            }
            ,
            {
                id: "RegimenFiscalReceptor",
                msg: "Falta completar el campo 'Regimen Fiscal' del receptor"
            },
            {
                id: "UsoCFDI",
                msg: "Falta completar el campo 'CFDI' del receptor"
            }
        
        ]
        return { SCRIPTS, dictionary, emisorDictionary, receptDictionary, conceptDictionary }

    });
