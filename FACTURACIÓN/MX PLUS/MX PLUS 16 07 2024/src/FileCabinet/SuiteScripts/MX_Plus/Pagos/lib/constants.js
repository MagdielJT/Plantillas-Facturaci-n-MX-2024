/**
 * @NApiVersion 2.1
 */
define([], () => {
  const RECORDS = {}
  RECORDS.CUSTOMER = {
    FIELDS: {
      RFC: 'custentity_mx_rfc',
      REG_FIS: 'custentity_mx_sat_industry_type',
      USO_CFDI: 'custentity_efx_mx_cfdi_usage',
      LEGAL_NAME: 'custentity_mx_sat_registered_name',
      ZIP: 'billzipcode'
    }
  }
  RECORDS.PAYMENT = {
    FIELDS: {
      ID: 'internalid',
      TYPE_RECORD: 'recordType',
      FOLIO: 'tranid',
      LOCATION: 'location',
      DATE: 'trandate',
      CUSTOMER: 'entity',
      SUBSIDIARY: 'subsidiary',
      TOTAL: 'fxamount',
      // TOTAL: 'total',
      CURRENCY: 'currency',
      EXCHANGE_RATE: 'exchangerate',
      PMT_METHOD: 'custbody_mx_txn_sat_payment_method',
      PARTIALITY: 'custbody_efx_fe_parcialidad',
      E_DOC: 'custbody_psg_ei_certified_edoc',
      UUID: 'custbody_mx_cfdi_uuid',
      TIMESTAMP: 'custbody_mx_cfdi_certify_timestamp',
      DOC_ORG: 'custbody_mx_cfdi_cadena_original',
      SAT_SIGNATURE: 'custbody_mx_cfdi_issuer_serial',
      SAT_QR: 'custbody_mx_cfdi_qr_code',
      SAT_SERIAL: 'custbody_mx_cfdi_sat_serial',
      SAT_STAMP: 'custbody_mx_cfdi_sat_signature',
      SIGNATURE: 'custbody_mx_cfdi_signature',
      MXPLUS_CERTIFIED: 'custbody_mx_plus_xml_certificado',
      MXPLUS_JSON: 'custbody_mx_plus_xml_generado',
      AMOUNT: 'amount'
    },
    APPLY: {
      ID: 'apply',
      FIELDS: {
        APPLY: 'apply',
        AMOUNT: 'amount',
        DOC: 'doc',
        INTERNALID: 'internalid',
        DUE: 'due',
        TOTAL: 'total',
        REFNUM: 'refnum'
      }
    },
    FACTORAJE: {
      CHECK_FAC: 'custbody_efx_fe_chbx_factorage',
      CLIENT: 'custbody_efx_fe_entity_timbra',
      NAME_RECEP: 'custbody_efx_fe_factoraje_receptor',
      RFC_RECEP: 'custbody_efx_fe_factoraje_rfc',
      // CP_RECEP: 'custbody_efx_fe_factoraje_zip',
      DIRECC: 'custbody_efx_fe_factoraje_dir',
      T_FACT: 'custbody_efx_total_factoraje'
    }
  }
  RECORDS.INVOICE = {
    FIELDS: {
      ID: 'internalid',
      CURRENCY: 'currency',
      RECORD_TYPE: 'recordType',
      EXCHANGE_RATE: 'exchangerate',
      DOC_NUM: 'tranid',
      UUID: 'custbody_mx_cfdi_uuid',
      APPLY_TRAN: 'applyingtransaction',
      // APPLY_AMOUNT: 'applyinglinkamount',
      TAX_JSON: 'custbody_efx_fe_tax_json',
      TOTAL: 'fxamount',
      // TOTAL: 'total',
      AMOUNT_PAID: 'fxamountpaid',
      // AMOUNT_PAID: 'amountpaid',
      AMOUNT_REMAINING: 'amountremaining',
      FACTORAJE: 'custbody_efx_fe_comision_factor',
      JSON_GENERADO: 'custbody_mx_plus_xml_generado',
    }
  }
  RECORDS.SUBSIDIARY = {
    FIELDS: {
      RFC: 'federalidnumber',
      REG_FIS: 'custrecord_mx_sat_industry_type',
      NAME: 'name',
      LEGAL_NAME: 'custrecord_mx_sat_registered_name'
    }
  }
  const SCRIPTS = {}
  SCRIPTS.CORE_SERVICE = {
    scriptId: 'customscript_mx_plus_service_core_sl',
    deploymentId: 'customdeploy_mx_plus_serv_core_des_sl'
  }
  const JSON_EXAMPLE = {}
  JSON_EXAMPLE.BASE = {
    Version: 'Version',
    Serie: 'Serie',
    Folio: 'Folio',
    Fecha: 'Fecha',
    SubTotal: 'SubTotal',
    Moneda: 'Moneda',
    Total: 'Total',
    TipoDeComprobante: 'TipoDeComprobante',
    Exportacion: 'Exportacion',
    LugarExpedicion: 'LugarExpedicion',
    Emisor: 'Emisor',
    Receptor: 'Receptor',
    Conceptos: 'Conceptos',
    Complemento: 'Complemento'
  }
  JSON_EXAMPLE.EMISOR = {
    Rfc: 'Rfc',
    Nombre: 'Nombre',
    RegimenFiscal: 'RegimenFiscal'
  }
  JSON_EXAMPLE.RECEPTOR = {
    Rfc: 'Rfc',
    Nombre: 'Nombre',
    DomicilioFiscalReceptor: 'DomicilioFiscalReceptor',
    RegimenFiscalReceptor: 'RegimenFiscalReceptor',
    UsoCFDI: 'UsoCFDI'
  }
  JSON_EXAMPLE.CONCEPTO = {
    ClaveProdServ: 'ClaveProdServ',
    Cantidad: 'Cantidad',
    ClaveUnidad: 'ClaveUnidad',
    Descripcion: 'Descripcion',
    ValorUnitario: 'ValorUnitario',
    Importe: 'Importe',
    ObjetoImp: 'ObjetoImp'
  }
  JSON_EXAMPLE.COMPLEMENTO = {
    Any: 'Any',
    Pago20: 'Pago20:Pagos'
  }
  JSON_EXAMPLE.PAGOS = {
    Version: 'Version',
    Totales: 'Totales',
    TotalTrasladosBaseIVA16: 'TotalTrasladosBaseIVA16',
    TotalTrasladosImpuestoIVA16: 'TotalTrasladosImpuestoIVA16',
    TotalTrasladosBaseIVA8: 'TotalTrasladosBaseIVA8',
    TotalTrasladosImpuestoIVA8: 'TotalTrasladosImpuestoIVA8',
    TotalTrasladosBaseIVA0: 'TotalTrasladosBaseIVA0',
    TotalTrasladosImpuestoIVA0: 'TotalTrasladosImpuestoIVA0',
    MontoTotalPagos: 'MontoTotalPagos',
    Pagos: 'Pago'
  }
  JSON_EXAMPLE.PAGO = {
    FechaPago: 'FechaPago',
    FormaDePagoP: 'FormaDePagoP',
    MonedaP: 'MonedaP',
    TipoCambioP: 'TipoCambioP',
    Monto: 'Monto',
    DoctoRelacionado: 'DoctoRelacionado',
    ImpuestosP: 'ImpuestosP',
    TrasladosP: 'TrasladosP'
  }

  JSON_EXAMPLE.DOC_REL = {
    IdDocumento: 'IdDocumento',
    Serie: 'Serie',
    Folio: 'Folio',
    MonedaDR: 'MonedaDR',
    EquivalenciaDR: 'EquivalenciaDR',
    NumParcialidad: 'NumParcialidad',
    ImpSaldoAnt: 'ImpSaldoAnt',
    ImpPagado: 'ImpPagado',
    ImpSaldoInsoluto: 'ImpSaldoInsoluto',
    ObjetoImpDR: 'ObjetoImpDR',
    ImpuestosDR: 'ImpuestosDR',
    TrasladosDR: 'TrasladosDR',
    BaseDR: 'BaseDR',
    ImpuestoDR: 'ImpuestoDR',
    TipoFactorDR: 'TipoFactorDR',
    TasaOCuotaDR: 'TasaOCuotaDR',
    ImporteDR: 'ImporteDR'
  }
  JSON_EXAMPLE.IMPUESTOS = {
    BaseP: 'BaseP',
    ImpuestoP: 'ImpuestoP',
    TipoFactorP: 'TipoFactorP',
    TasaOCuotaP: 'TasaOCuotaP',
    ImporteP: 'ImporteP'
  }
  const STRUCTURE = {
    Version: '4.0',
    NoCertificado: '',
    Certificado: '',
    Fecha: '2024-03-19T00:00:55',
    SubTotal: 0,
    Moneda: 'XXX',
    Total: 0,
    TipoDeComprobante: 'P',
    Exportacion: '01',
    LugarExpedicion: '75700',
    Emisor: {
      Rfc: 'EKU9003173C9',
      Nombre: 'ESCUELA KEMPER URGATE',
      RegimenFiscal: 601
    },
    Receptor: {
      Rfc: 'XAXX010101000',
      Nombre: 'PUBLICO GENERAL',
      DomicilioFiscalReceptor: '757100',
      RegimenFiscalReceptor: '616',
      UsoCFDI: 'CP01'
    },
    Conceptos: [
      {
        ClaveProdServ: '84111506',
        Cantidad: 1,
        ClaveUnidad: 'ACT',
        Descripcion: 'Pago',
        ValorUnitario: 0,
        Importe: 0,
        ObjetoImp: '01'
      }
    ],
    Complemento: {
      Any: [
        {
          'Pago20:Pagos': {
            Version: '2.0',
            Totales: {
              MontoTotalPagos: '1.00'
            },
            Pago: [
              {
                FechaPago: '2022-02-19T00:00:00',
                FormaDePagoP: '01',
                MonedaP: 'MXN',
                Monto: '1.00',
                TipoCambioP: '1',
                DoctoRelacionado: [
                  /* {
                    IdDocumento: '',
                    Serie: '00',
                    Folio: '2200004',
                    MonedaDR: 'MXN',
                    MetodoDePagoDR: 'PUE',
                    NumParcialidad: '1',
                    ImpSaldoAnt: '500.00',
                    ImpPagado: '1.00',
                    ImpSaldoInsoluto: '499.00',
                    EquivalenciaDR: '1',
                    ObjetoImpDR: '01'
                  } */
                ]
              }
            ]
          }
        }
      ]
    }
  }

  return { SCRIPTS, STRUCTURE, RECORDS, JSON_EXAMPLE }
})
