/**
 * @NApiVersion 2.1
 */
define(['N/config', 'N/query', 'N/runtime', 'N/search'], (config, query, runtime, search) => {
  /* El objeto `const MX_PLUS_CONFIG` define una configuración para un tipo de registro específico en
  NetSuite. Contiene el ID del tipo de registro (`customrecord_mxplus_rcd_config`) y los campos
  asociados con ese tipo de registro. Cada campo se asigna a su correspondiente ID interno en
  NetSuite. Esta configuración se utilizará en el script para realizar operaciones relacionadas con
  este tipo de registro específico, como recuperar datos basados en estos campos. */
  const MX_PLUS_CONFIG = {
    ID: 'customrecord_mxplus_rcd_config',
    FIELDS: {
      TEST_MODE: 'custrecord_mxplus_config_test_mode',
      NOTIFY_AT: 'custrecord_mxplus_timb_adv',
      INACTIVE: 'isinactive',
      ID: 'internalid',
      FOLDER: 'custrecord_mxplus_folder_xml'
    }
  }
  /* El fragmento de código `RECORDS.SUBSIDIARY` define un conjunto de campos para un registro
  subsidiario en NetSuite. A cada campo se le asigna una ID interna correspondiente en NetSuite.
  Esta configuración se utilizará en el script para realizar operaciones relacionadas con registros
  subsidiarios, como recuperar datos basados en estos campos. */
  const SUBSIDIARY = {
    FIELDS: {
      RFC: 'federalidnumber',
      REG_FIS: 'custrecord_mx_sat_industry_type',
      NAME: 'name',
      LEGAL_NAME: 'custrecord_mx_sat_registered_name',
      COUNTRY: 'country',
      EDITION: 'edition',
      EMAIL: 'custrecord_mxplus_pac_email',
      ELIMINATION: 'iselimination',
      INACTIVE: 'isinactive',
      ZIP: 'zip'
    }
  }
  /* El fragmento de código `RECORDS.COMPANY` define un conjunto de campos para el registro de una
  empresa en NetSuite. A cada campo se le asigna una ID interna correspondiente en NetSuite. Esta
  configuración se utilizará en el script para realizar operaciones relacionadas con los registros
  de la empresa, como recuperar datos basados en estos campos. */
  const COMPANY = {
    FIELDS: {
      RFC: 'employerid',
      REG_FIS: 'custrecord_mx_sat_industry_type',
      NAME: 'companyname',
      LEGAL_NAME: 'custrecord_mx_sat_registered_name',
      EMAIL: 'custrecord_mxplus_pac_email',
      MAIN_ADDR: 'mainaddress'
    }
  }

  /**
   * La función `checkOWAccount` intenta verificar si una característica específica llamada
   * 'SUBSIDIARIAS' está vigente y registra un error si hay una excepción.
   */
  const checkOWAccount = () => {
    try {
      return runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' })
    } catch (error) {
      log.error('Error on checkOWAccount', error)
    }
  }

  /**
   * La función `getConfig` recupera datos basados en filtros y columnas específicos de un objeto de
   * búsqueda de NetSuite.
   * @returns Se devuelve un objeto que contiene datos recuperados de una operación de búsqueda. Los
   * datos se completan en función de las columnas especificadas en el objeto `MX_PLUS_CONFIG.FIELDS`.
   */
  const getConfig = () => {
    const data = {}
    try {
      const filters = [[MX_PLUS_CONFIG.FIELDS.INACTIVE, search.Operator.IS, 'F']]
      const columns = Object.values(MX_PLUS_CONFIG.FIELDS).map(f => ({ name: f }))
      const objSearch = search.create({ type: MX_PLUS_CONFIG.ID, filters, columns })
      const countResults = objSearch.runPaged().count
      if (countResults) {
        const results = objSearch.run().getRange({ start: 0, end: 1 })
        columns.forEach(column => {
          data[column.name] = results[0].getValue(column)
        })
      }
    } catch (error) {
      log.error('Error on getConfig', error)
    }
    return data
  }

  /**
   * La función `getCompanyInformation` recupera información de la empresa de un registro dinámico y la
   * devuelve como un objeto.
   * @returns Se devuelve un objeto que contiene información de la empresa.
   */
  const getCompanyInformation = () => {
    const data = {}
    try {
      const objRecord = config.load({
        type: config.Type.COMPANY_INFORMATION,
        isDynamic: true
      })
      Object.values(COMPANY.FIELDS).forEach(fieldId => (data[fieldId] = objRecord.getValue({ fieldId })))
      if (data[COMPANY.FIELDS.REG_FIS]) {
        data[COMPANY.FIELDS.REG_FIS] = getRegFiscal(data[SUBSIDIARY.FIELDS.REG_FIS])
      }
      if (data[COMPANY.FIELDS.MAIN_ADDR]) {
        const columns = ['zip']
        const objSearch = search.lookupFields({
          type: 'address',
          id: data[COMPANY.FIELDS.MAIN_ADDR],
          columns
        })
        if (objSearch[columns[0]]) {
          delete data[COMPANY.FIELDS.MAIN_ADDR]
          data[columns[0]] = objSearch[columns[0]]
        }
      }
    } catch (error) {
      log.error('Error on getCompanyInformation', error)
    }
    return data
  }

  /**
   * La función `getSubsidiaryInformation` recupera información subsidiaria en función de una ID de
   * subsidiaria determinada.
   * @param subID - La función `getSubsidiaryInformation` toma un parámetro `subID`, que es el ID de la
   * subsidiaria de la que desea recuperar información. Esta función consulta una tabla de base de
   * datos llamada "subsidiaria" para obtener detalles como RFC, número de registro, nombre y nombre
   * legal.
   * @returns La función `getSubsidiaryInformation` devuelve un objeto que contiene información sobre
   * una subsidiaria según el `subID` proporcionado. El objeto incluye el RFC de la filial, número de
   * registro, denominación y denominación social. Si se produce un error durante el proceso, se
   * detecta, se registra y se devuelve un objeto vacío.
   */
  const getSubsidiaryInformation = subID => {
    const data = {}
    try {
      const strSQL = `SELECT Subsidiary.${SUBSIDIARY.FIELDS.RFC},
        Subsidiary.${SUBSIDIARY.FIELDS.REG_FIS},
        Subsidiary.${SUBSIDIARY.FIELDS.NAME},
        Subsidiary.${SUBSIDIARY.FIELDS.LEGAL_NAME},
        Subsidiary.${SUBSIDIARY.FIELDS.COUNTRY},
        Subsidiary.${SUBSIDIARY.FIELDS.EDITION},
        Subsidiary.${SUBSIDIARY.FIELDS.EMAIL},
        Subsidiary.${SUBSIDIARY.FIELDS.ELIMINATION},
        Subsidiary.${SUBSIDIARY.FIELDS.INACTIVE},
        SubsidiaryAdd.${SUBSIDIARY.FIELDS.ZIP},
      FROM subsidiary AS Subsidiary
        INNER JOIN subsidiarymainaddress AS SubsidiaryAdd ON SubsidiaryAdd.nkey = Subsidiary.mainaddress
      WHERE Subsidiary.id = ${subID}`
      const resultSet = query.runSuiteQL(strSQL)
      const { results } = resultSet
      if (results.length) {
        results.forEach(result => {
          Object.values(SUBSIDIARY.FIELDS).forEach((fieldId, index) => {
            data[fieldId] = result.values[index]
          })
        })
      }
      if (data[SUBSIDIARY.FIELDS.REG_FIS]) {
        data[SUBSIDIARY.FIELDS.REG_FIS] = getRegFiscal(data[SUBSIDIARY.FIELDS.REG_FIS])
      }
    } catch (error) {
      log.error('Error on getSubsidiaryInformation', error)
    }
    return data
  }

  /**
   * La función `getRegFiscal` recupera un valor de campo específico de un registro personalizado según
   * la ID proporcionada.
   * @returns La función `getRegFiscal` devuelve el valor del campo `custrecord_mx_sat_it_code` de un
   * registro personalizado de tipo `customrecord_mx_sat_industry_type` basado en el `id`
   * proporcionado.
   */
  const getRegFiscal = id => {
    try {
      const columns = ['custrecord_mx_sat_it_code']
      const objSearch = search.lookupFields({
        type: 'customrecord_mx_sat_industry_type',
        id,
        columns
      })
      return objSearch[columns[0]]
    } catch (error) {
      log.error('Error on getRegFiscal', error)
    }
  }

  /**
   * La función `getUsoCFDI` recupera el código CFDI para un ID de uso determinado de un registro
   * personalizado en NetSuite.
   * @returns La función `getUsoCFDI` devuelve el valor del campo `custrecord_mx_sat_cfdi_code` del
   * registro personalizado `customrecord_mx_sat_cfdi_usage` según el `id` proporcionado.
   */
  const getUsoCFDI = id => {
    try {
      const columns = ['custrecord_mx_sat_cfdi_code']
      const objSearch = search.lookupFields({
        type: 'customrecord_mx_sat_cfdi_usage',
        id,
        columns
      })
      return objSearch[columns[0]]
    } catch (error) {
      log.error('Error on getUsoCFDI', error)
    }
  }

  /**
   * La función `getPaymentTerm` recupera el código del término de pago para una ID determinada de un
   * registro personalizado en NetSuite.
   * @returns La función `getPaymentTerm` devuelve el valor del campo `custrecord_mx_sat_pt_code` del
   * registro personalizado `customrecord_mx_sat_paid_term` según el `id` proporcionado.
   */
  const getPaymentTerm = id => {
    try {
      const columns = ['custrecord_mx_sat_pt_code']
      const objSearch = search.lookupFields({
        type: 'customrecord_mx_sat_payment_term',
        id,
        columns
      })
      return objSearch[columns[0]]
    } catch (error) {
      log.error('Error on getPaymentTerm', error)
    }
  }

  /**
   * La función `getPaymentMethod` recupera un método de pago específico de un registro personalizado
   * en NetSuite utilizando la ID proporcionada.
   * @returns La función `getPaymentMethod` devuelve el valor del campo
   * `custrecord_mx_mapper_value_inreport` de un registro personalizado con el `id` especificado.
   */
  const getPaymentMethod = id => {
    try {
      const columns = ['custrecord_mx_mapper_value_inreport']
      const objSearch = search.lookupFields({
        type: 'customrecord_mx_mapper_values',
        id,
        columns
      })
      return objSearch[columns[0]]
    } catch (error) {
      log.error('Error on getPaymentMethod', error)
    }
  }

  const getGeneralPreferences = () => {
    try {
      const objRecord = config.load({
        type: config.Type.COMPANY_PREFERENCES,
        isDynamic: true
      })
      const fields = ['DATEFORMAT']
      const data = {}
      fields.forEach(field => {
        data[field] = objRecord.getValue({ fieldId: field })
      })
      return data
    } catch (error) {
      log.error('Error on getGeneralPreferences', error)
    }
  }

  const getFolderTimb = () => {
    try {
      let currenScript = runtime.getCurrentScript()
      let idFolder = currenScript.getParameter({
        name: 'custscript_efx_fe_folder_certify'
      })
      return idFolder
    } catch (err) {
      log.error({ title: 'Error occurred in getFolderTimb', details: err });
    }
  }
  return {
    checkOWAccount,
    getConfig,
    getCompanyInformation,
    getSubsidiaryInformation,
    MX_PLUS_CONFIG,
    COMPANY,
    SUBSIDIARY,
    getRegFiscal,
    getUsoCFDI,
    getPaymentTerm,
    getPaymentMethod,
    getGeneralPreferences,
    getFolderTimb
  }
})
