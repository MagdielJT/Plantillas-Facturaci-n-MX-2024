/**
 * @NModuleScope TargetAccount
 */
define(['N/xml', 'N/search', 'N/record', 'N/format', 'N/runtime', 'N/config', './xml_getfields'], function (xml, search, record, format, runtime, config, createAdd) {
  /**
   * split
   */
  function addenda_select(name_addenda, custparam_tranid, custparam_trantype, xmlplantilla) {
    log.audit({ title: 'name_addenda', details: JSON.stringify(name_addenda) })
    log.audit({ title: 'custparam_tranid', details: JSON.stringify(custparam_tranid) })
    log.audit({ title: 'custparam_trantype', details: JSON.stringify(custparam_trantype) })
    log.audit({ title: 'xmlplantilla', details: JSON.stringify(xmlplantilla) })

    var objReturn = {
      error: [],
      xml: '',
      schema: '',
      obj: {
        succes: false
      },
      input: {
        custparam_tranid: custparam_tranid,
        custparam_trantype: custparam_trantype,
        custparam_mode: name_addenda
      }
    }

    var xmlAddenda = ''
    var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' })
    log.audit({ title: 'SUBSIDIARIES', details: JSON.stringify(SUBSIDIARIES) })
    log.audit({ title: 'name_addenda', details: JSON.stringify(name_addenda) })

    if (xmlplantilla) {
      try {
        var objetoAddenda = obtenObjs(custparam_tranid, custparam_trantype)
        xmlAddenda = createAdd.createAdd(xmlplantilla, objetoAddenda)
        log.audit({ title: 'xmlAddenda', details: xmlAddenda })
      } catch (erroradd) {
        log.audit({ title: 'erroradd', details: erroradd })
      }
    } else {
      switch (name_addenda) {
        case 'Coppel': {
          objReturn.obj = getDataCoppel(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlCoppel(objReturn.obj.data)
          }
          break
        }

        case 'CoppelRopa': {
          objReturn.obj = getDataCoppelRopa(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlCoppelRopa(objReturn.obj.data)
          }
          break
        }

        case 'Soriana': {
          objReturn.obj = getDataSoriana(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlSoriana(objReturn.obj.data)
          }
          break
        }

        case 'Walmart': {
          objReturn.obj = getDataWalmartSamsClub(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlWalmartSamsClub(objReturn.obj.data)
          }
          break
        }

        case 'CityFresco': {
          objReturn.obj = getDataCityFresco(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlCityFresco(objReturn.obj.data)
          }
          break
        }
        case 'CityFrescoMySuite': {
          objReturn.obj = getDataComercialCityFresco(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlComercialCityFresco(objReturn.obj.data)
          }
          break
        }

        case 'Liverpool': {
          objReturn.obj = getDataLiverpool(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getxmlLiverpool(objReturn.obj.data)
          }
          break
        }

        case 'HEB': {
          objReturn.obj = getDataHeb(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlHeb(objReturn.obj.data)
          }
          break
        }

        case 'HEBMySuite': {
          objReturn.obj = getDataHeb(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlHeb(objReturn.obj.data, 'HEBamece')
          }
          break
        }

        case 'HomeDepot': {
          objReturn.obj = getDataHDepot(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlHDepot(objReturn.obj.data)
          }
          break
        }

        case 'Amazon': {
          objReturn.obj = getDataAmazon(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlAmazon(objReturn.obj.data)
          }

          break
        }

        case 'Nadro': {
          objReturn.obj = getDataNadro(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlNadro(objReturn.obj.data)
          }
          break
        }
        case 'Hemsa': {
          objReturn.obj = getDataHemsa(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlHemsa(objReturn.obj.data)
          }
          break
        }

        case 'Sabritas': {
          objReturn.obj = getDataSabritas(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getxmlSabritas(objReturn.obj.data)
          }
          break
        }

        case 'FCA': {
          objReturn.obj = getDataFCA(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlFCA(objReturn.obj.data)
          }
          break
        }

        case 'SuperNeto': {
          objReturn.obj = getDataSuperNeto(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlSuperNeto(objReturn.obj.data)
          }
          break
        }

        case 'Costco': {
          objReturn.obj = getDataCostco(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlCostco(objReturn.obj.data)
          }
          break
        }

        case 'WalmartDocumento': {
          objReturn.obj = getDataWalmartDoc(custparam_tranid, custparam_trantype, SUBSIDIARIES)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlWalmartDoc(objReturn.obj.data)
          }
          break
        }

        case 'WalmartMySuite': {
          objReturn.obj = getDataWalmartDoc(custparam_tranid, custparam_trantype, SUBSIDIARIES)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlWalmartMySuite(objReturn.obj.data)
          }
          break
        }

        case 'DSW': {
          objReturn.obj = getDataDSW(custparam_tranid, custparam_trantype, SUBSIDIARIES)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlDSW(objReturn.obj.data)
          }
          break
        }

        case 'Chedrahui': {
          objReturn.obj = getDataChedrahui(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlChedrahui(objReturn.obj.data)
          }
          break
        }

        case 'ChedrahuiMySuite': {
          objReturn.obj = getDataChedrahui(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getXmlChedrahui(objReturn.obj.data, 'ChedrahuiMySuite')
          }
          break
        }

        case 'AltosHornos': {
          objReturn.obj = getDataAltosHornos(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getxmlAltosHornos(objReturn.obj.data)
          }
          break
        }

        case 'MineraDelNorte': {
          objReturn.obj = getDataAltosHornos(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getxmlAltosHornos(objReturn.obj.data)
          }
          break
        }

        case 'BIOPapel': {
          objReturn.obj = getDataBioPapel(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getxmlBioPapel(objReturn.obj.data)
          }
          break
        }

        case 'TexasStandardLLC': {
          objReturn.obj = getDataTexasStandardLLC(custparam_tranid, custparam_trantype)
          if (objReturn.obj.succes) {
            xmlAddenda = getxmlTexasStandardLLC(objReturn.obj.data)
          }
          break
        }

        default:
          objReturn.error.push('Addenda invalida')
      }
    }

    log.audit({ title: 'xmlAddenda', details: xmlAddenda })

    return xmlAddenda
  }

  function obtenObjs(tranid, trantype) {
    var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' })
    var objetoData = {
      obj_cliente: {},
      obj_transaccion: {},
      obj_terminos: {},
      obj_subsidiaria: {},
      obj_subsidiaria_dir: {},
      obj_enviodir: {},
      obj_facturaciondir: {},
      obj_detalleinv: {},
      obj_pedimento: {}
    }
    var record_obj = record.load({
      type: trantype,
      id: tranid
    })
    var idcliente = record_obj.getValue({ fieldId: 'entity' })
    var iddirenvio = record_obj.getValue({ fieldId: 'shipaddresslist' })
    var iddirfacturacion = record_obj.getValue({ fieldId: 'billaddresslist' })
    var idterms = record_obj.getValue({ fieldId: 'terms' })
    var terms_obj = {}
    if (idterms) {
      terms_obj = record.load({
        type: record.Type.TERM,
        id: idterms
      })
    }
    var cliente_obj = record.load({
      type: 'customer',
      id: idcliente
    })

    if (SUBSIDIARIES) {
      var idsubsidiaria = record_obj.getValue({ fieldId: 'subsidiary' })
      var subsidiaria_obj = record.load({
        type: record.Type.SUBSIDIARY,
        id: idsubsidiaria
      })
    } else {
      var subsidiaria_obj = config.load({
        type: config.Type.COMPANY_INFORMATION
      })
    }

    var subrec_dir_sub = subsidiaria_obj.getSubrecord({
      fieldId: 'mainaddress'
    })

    var numLines = cliente_obj.getLineCount({
      sublistId: 'addressbook'
    })

    var enviodir_obj = {}
    var facturaciondir_obj = {}

    for (var i = 0; i < numLines; i++) {
      var iddir = cliente_obj.getSublistValue({
        sublistId: 'addressbook',
        fieldId: 'internalid',
        line: i
      })
      if (iddirenvio && iddirenvio > 0) {
        if (iddir == iddirenvio) {
          enviodir_obj = cliente_obj.getSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress',
            line: i
          })
        }
      }
      if (iddirfacturacion && iddirfacturacion > 0) {
        if (iddir == iddirenvio) {
          facturaciondir_obj = cliente_obj.getSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress',
            line: i
          })
        }
      }
    }

    //busca detalle inv
    /*
        try{
            var arrayDetalleInventario = new Array();
            var arrayInventario = new Array();
            var arrayNumerosdePedimento = new Array();
            var arrayPedimento = new Array();
            var objetoDetalleInventario = new Object();
            var arrayinventarioObj = new Array();

            var buscaFacdetalleinv = search.create({
                type: search.Type.INVOICE,
                filters: [
                    ['mainline', search.Operator.IS, 'F']
                    , 'AND',
                    ['internalid', search.Operator.ANYOF, tranid]
                    , 'AND',
                    ['cogs', search.Operator.IS, 'F']
                    , 'AND',
                    ['taxline', search.Operator.IS, 'F']
                ],
                columns: [
                    search.createColumn({
                        name: 'inventorynumber',
                        join: 'inventoryDetail',
                        label: ' Number'
                    })
                ]
            });

            buscaFacdetalleinv.run().each(function (result) {

                arrayInventario.push(result.getValue({
                    name: 'inventorynumber',
                    join: 'inventoryDetail'
                }));

                return true;
            });


            search.create({
                type: search.Type.INVENTORY_DETAIL,
                filters: [
                    ['inventorynumber', search.Operator.ANYOF, arrayInventario]
                ],
                columns: [
                    search.createColumn({
                        name: 'inventorynumber',
                        sort: search.Sort.ASC,
                        label: ' Number'
                    }),
                    search.createColumn({
                        name: 'custitemnumber_bit_pedimento',
                        join: 'inventoryNumber',
                        label: 'Pedimento Number'
                    })
                ]
            }).run().each(function (result) {
                var id = result.getValue({
                    name: 'custitemnumber_bit_pedimento',
                    join: 'inventoryNumber'
                });

                var serial = result.getText({name: 'inventorynumber'});

                if (!objetoDetalleInventario[serial]) {
                    objetoDetalleInventario[serial] = {
                        id          : id,
                        serial:'',
                        dueDate     : '',
                        color       : '',
                        cc          : '',
                        mark        : '',
                        year        : ''
                    }

                    if (arrayPedimento.indexOf(id) == -1) {
                        arrayPedimento.push(id);
                    }
                }

                return true;
            });

            if (arrayPedimento.length > 0) {
                search.create({
                    type: 'customrecord_bit_pedimento',
                    filters: [
                        ['internalid', 'anyof', arrayPedimento]
                    ],
                    columns: [
                        search.createColumn({name: 'name', label: 'Name'}),
                        search.createColumn({
                            name: 'custrecord_bit_fecha_entrega',
                            label: 'Fecha de Entrega'
                        }),
                        search.createColumn({name: 'custrecord_bit_color', label: 'Color'}),
                        search.createColumn({name: 'custrecord_bit_cilindraje', label: 'Cilindraje'}),
                        search.createColumn({name: 'custrecord_bit_marca', label: 'Marca'}),
                        search.createColumn({name: 'custrecord_bit_anio', label: 'Año'})
                    ]
                }).run().each(function (result) {

                    var id = result.id;

                    for (key in objetoDetalleInventario) {
                        if (objetoDetalleInventario[key].id == id) {
                            objetoDetalleInventario[key].serial = key;
                            objetoDetalleInventario[key].dueDate = result.getValue({name: 'custrecord_bit_fecha_entrega'});
                            objetoDetalleInventario[key].color = result.getText({name: 'custrecord_bit_color'});
                            objetoDetalleInventario[key].cc = result.getText({name: 'custrecord_bit_cilindraje'});
                            objetoDetalleInventario[key].mark = result.getText({name: 'custrecord_bit_marca'});
                            objetoDetalleInventario[key].year = result.getText({name: 'custrecord_bit_anio'});

                            arrayinventarioObj.push(objetoDetalleInventario[key]);
                            objetoDetalleInventario[key] = JSON.stringify(objetoDetalleInventario[key]);



                        }
                    }

                    return true;
                });
            }

            log.audit({title:'arrayinventarioObj',details:arrayinventarioObj});
            log.audit({title:'objetoDetalleInventario',details:objetoDetalleInventario});

        }catch(error_detalle_inventario){
            log.error({title:'error_detalle_inventario',details:error_detalle_inventario});
        }
        var objdetalle = {
            "DetalleInv":arrayinventarioObj
        }*/

    objetoData.obj_transaccion = record_obj
    objetoData.obj_terminos = terms_obj
    objetoData.obj_cliente = cliente_obj
    objetoData.obj_subsidiaria = subsidiaria_obj
    objetoData.obj_subsidiaria_dir = subrec_dir_sub
    objetoData.obj_enviodir = enviodir_obj
    objetoData.obj_facturaciondir = facturaciondir_obj
    //objetoData.obj_detalleinv = objdetalle;

    return objetoData
  }

  function getDataCoppelRopa(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        total: 0,
        subtotal: 0,
        iva: 0,
        ieps: 0,
        descuentototal: 0,
        catitdad_articulos: '',
        grossamount: '',
        trandate: '',
        duedate: '',
        transmisionfecha: '',
        serie: '',
        folio: '',
        otherrefnum: '',
        gln: '',
        numproveedor: '',
        shipname: '',
        shipcity: '',
        shipzip: '',
        shipstreet: '',
        shiptogln: '',
        warehouse: '',
        bodegareceptora: '',
        symbol: '',
        exchangerate: '',
        line: '',
        upc: '',
        codigodecliente: '',
        salesdescription: '',
        quantity: '',
        amount: '',
        netamount: '',
        netamountnotax: '',
        taxtotal: '',
        total: '',
        fecha_remision: '',
        fecha_cita: '',
        folio_num_cita: '',
        folio_pedido: '',
        orden_compra: '',
        id_remision: '',
        num_cajas: '',
        id_proveedor: '',
        tran_id: '',
        determinante: '',
        totalquantity: '',
        entrega_mercancia: '',
        item: []
      }
    }
    try {
      var rec_transaction = record.load({
        type: param_type,
        id: param_id,
        isDynamic: true
      })
      subtotal_transaction = rec_transaction.getValue('subtotal')

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: [
          'tranid',
          'duedate',
          'trandate',
          'otherrefnum',
          'customer.custentity_efx_fe_add_seller_coppel',
          'customer.custentity_efx_add_numprov_cop',
          'shipname',
          'shipcity',
          'shipzip',
          'shippingaddress.custrecord_efx_fe_add_cop_bdestino',
          'shippingaddress.custrecord_efx_fe_add_cop_breceptora',
          'shippingaddress.custrecord_efx_fe_add_shipgln_cop',
          'shippingaddress.custrecord_efx_fe_lugar_gln',
          'shippingaddress.custrecord_streetname',
          'Currency.symbol',
          'exchangerate',
          'line',
          'quantity',
          'amount',
          'netamount',
          'netamountnotax',
          'taxtotal',
          'total',
          'custbody_efx_fe_aff_cop_ftrans'
        ]
      })

      var foliofac = LookupField['tranid'] || ''
      var foliotran = ''
      var seritran = ''

      log.audit({ title: 'LookupField', details: LookupField })
      for (var i = 0; i < foliofac.length; i++) {
        if (foliofac[i] != '-') {
          var esnum = foliofac[i].match('\\d+')
          if (esnum) {
            foliotran = foliotran + foliofac[i]
          } else {
            seritran = seritran + foliofac[i]
          }
        }
      }

      respuesta.data.serie = seritran

      respuesta.data.folio = foliotran

      var otherrefnum = LookupField['otherrefnum']
      respuesta.data.otherrefnum = otherrefnum

      var gln = LookupField['customer.custentity_efx_fe_add_seller_coppel']
      var shiptogln = LookupField['shippingaddress.custrecord_efx_fe_lugar_gln'] || ''

      if (!shiptogln) {
        shiptogln = LookupField['shippingaddress.custrecord_efx_fe_add_shipgln_cop'] || ''
      }

      var calle = LookupField['shippingaddress.custrecord_streetname']
      respuesta.data.gln = gln
      respuesta.data.shiptogln = shiptogln
      respuesta.data.shipstreet = calle

      var numproveedor = LookupField['customer.custentity_efx_add_numprov_cop']
      respuesta.data.numproveedor = numproveedor
      var shipname = LookupField['shipname']
      respuesta.data.shipname = shipname
      var shipcity = LookupField['shipcity']
      respuesta.data.shipcity = shipcity
      var shipzip = LookupField['shipzip']
      respuesta.data.shipzip = shipzip

      var warehouse = LookupField['shippingaddress.custrecord_efx_fe_add_cop_bdestino']
      respuesta.data.warehouse = warehouse
      var bodegareceptora = LookupField['shippingaddress.custrecord_efx_fe_add_cop_breceptora']
      respuesta.data.bodegareceptora = bodegareceptora
      var symbol = LookupField['Currency.symbol']
      respuesta.data.symbol = symbol
      var exchangerate = LookupField['exchangerate']
      respuesta.data.exchangerate = exchangerate
      var line = LookupField['line']
      respuesta.data.line = line

      var quantity = LookupField['quantity']
      respuesta.data.quantity = quantity
      var amount = LookupField['amount']
      respuesta.data.amount = amount
      var netamount = LookupField['netamount']
      respuesta.data.netamount = netamount
      var netamountnotax = LookupField['netamountnotax']
      respuesta.data.netamountnotax = netamountnotax

      var taxtotal = LookupField['taxtotal']
      respuesta.data.taxtotal = taxtotal
      var total = LookupField['total']
      respuesta.data.total = total

      var horaMexico = horaActual()

      if (LookupField['trandate']) {
        var fechatrandate = fechaSplit(LookupField['trandate'], '/', '-', 0, 1, 2, 'T' + horaMexico)
        fechatrandate = fechatrandate.split('T')
        respuesta.data.trandate = fechatrandate[0]
      }

      if (LookupField['duedate']) {
        var fechaduedate = fechaSplit(LookupField['duedate'], '/', '-', 0, 1, 2, 'T' + horaMexico)
        fechaduedate = fechaduedate.split('T')
        respuesta.data.duedate = fechaduedate[0]
      }

      if (LookupField['custbody_efx_fe_aff_cop_ftrans']) {
        var fechatransmision = fechaSplit(LookupField['custbody_efx_fe_aff_cop_ftrans'], '/', '-', 2, 1, 0, 'T' + horaMexico)
        fechatransmision = fechatransmision.split('T')
        respuesta.data.transmisionfecha = fechatransmision[0]
      }

      var n_serie_fact_id = LookupField['tranid'] || ''

      respuesta.data.folio_pedido = LookupField['otherrefnum'] || ''

      respuesta.data.orden_compra = LookupField['otherrefnum'] || ''

      respuesta.data.total = LookupField['total'] || 0

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: ['discounttotal'],
        bodyFieldText: [],
        lineField: [
          'itemtype',
          'item',
          'itemTEXT',
          'quantity',
          'rate',
          'custcol_efx_fe_upc_code',
          'amount',
          'grossamt',
          'description',
          'custcol_efx_fe_add_talla_coppel',
          'custcol_efx_fe_add_cantidadp_coppel',
          'custcol_efx_fe_add_cop_cant_cajas'
        ]
      }

      var transactionField = getTransactionField(objParametro)

      if (transactionField.succes) {
        var descuento_total_lineas = 0

        var totalquantity = 0
        for (var ir in transactionField.data.lineField) {
          totalquantity = totalquantity + parseFloat(transactionField.data.lineField[ir].quantity)
          respuesta.data.item.push({
            itemTEXT: transactionField.data.lineField[ir].itemTEXT || '',
            quantity: transactionField.data.lineField[ir].quantity || '',
            rate: transactionField.data.lineField[ir].rate || '',
            amount: transactionField.data.lineField[ir].amount || '',
            grossamt: transactionField.data.lineField[ir].grossamt || '',
            upc: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
            talla: transactionField.data.lineField[ir].custcol_efx_fe_add_talla_coppel || '',
            pactquantity: transactionField.data.lineField[ir].custcol_efx_fe_add_cantidadp_coppel || '',
            cantCajas: transactionField.data.lineField[ir].custcol_efx_fe_add_cop_cant_cajas || '',
            // codigodecliente: codigodeclienteget[ir],
            salesdescription: transactionField.data.lineField[ir].description || ''
          })
        }
        respuesta.data.totalquantity = totalquantity

        if (transactionField.data.bodyFieldValue.discounttotal) {
          respuesta.data.descuentototal = transactionField.data.bodyFieldValue.discounttotal
        } else {
          respuesta.data.descuentototal = descuento_total_lineas.toFixed(2)
        }
      }

      respuesta.data.subtotal = subtotal_transaction.toFixed(2)
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getDataSorianaEfx', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataSorianaEfx', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlCoppelRopa(param_obj_CoppelEfx) {
    log.audit({ title: 'param_obj_CoppelEfx', details: param_obj_CoppelEfx })
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      log.audit({ title: 'param_obj_CoppelEfx.item', details: param_obj_CoppelEfx.item })
      respuesta.xmlns = ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" '
      respuesta.xmlns += ' xmlns:xs="http://www.w3.org/2001/XMLSchema" '
      respuesta.xmlns += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '

      var xmlCoppelEfx = ''
      xmlCoppelEfx += ' <cfdi:Addenda>  '
      xmlCoppelEfx +=
        '    <requestForPayment type="SimpleInvoiceType" contentVersion="1.0" documentStructureVersion="CPLR1.0" documentStatus="ORIGINAL" DeliveryDate="' +
        param_obj_CoppelEfx.duedate +
        '">' //'YYYY-MM-DD'
      xmlCoppelEfx += '        <requestForPaymentIdentification>'
      xmlCoppelEfx += '            <entityType>INVOICE</entityType>'

      xmlCoppelEfx += ' <uniqueCreatorIdentification>' + param_obj_CoppelEfx.serie + param_obj_CoppelEfx.folio + '</uniqueCreatorIdentification>'

      xmlCoppelEfx += '        </requestForPaymentIdentification>'
      xmlCoppelEfx += '        <orderIdentification>'
      xmlCoppelEfx += '            <referenceIdentification type="ON">' + param_obj_CoppelEfx.otherrefnum + '</referenceIdentification>'
      xmlCoppelEfx += '            <ReferenceDate>' + param_obj_CoppelEfx.transmisionfecha + '</ReferenceDate>' //'YYYY-MM-DD'
      //xmlCoppelEfx += '            <FechaPromesaEnt>'+param_obj_CoppelEfx.duedate+'</FechaPromesaEnt>'; //'YYYY-MM-DD'
      xmlCoppelEfx += '        </orderIdentification>'
      xmlCoppelEfx += '        <seller>'
      xmlCoppelEfx += '            <gln>' + param_obj_CoppelEfx.gln + '</gln>'
      xmlCoppelEfx +=
        '            <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' + param_obj_CoppelEfx.numproveedor + '</alternatePartyIdentification>'
      xmlCoppelEfx += '            <IndentificaTipoProv>2</IndentificaTipoProv>'
      xmlCoppelEfx += '        </seller>'
      xmlCoppelEfx += '        <shipTo>'
      xmlCoppelEfx += '            <gln>' + param_obj_CoppelEfx.shiptogln + '</gln>'
      xmlCoppelEfx += '            <nameAndAddress>'
      xmlCoppelEfx += '                <name>' + param_obj_CoppelEfx.shipname + '</name>'
      xmlCoppelEfx += '                <streetAddressOne>' + param_obj_CoppelEfx.shipstreet + '</streetAddressOne>'
      xmlCoppelEfx += '                <city>' + param_obj_CoppelEfx.shipcity + '</city>'
      xmlCoppelEfx += '                <postalCode>' + param_obj_CoppelEfx.shipzip + '</postalCode>'
      xmlCoppelEfx += '                <bodegaEnt>' + param_obj_CoppelEfx.warehouse + '</bodegaEnt>'
      xmlCoppelEfx += '            </nameAndAddress>'
      // xmlCoppelEfx += '            <BodegaDestino>'+param_obj_CoppelEfx.warehouse+'</BodegaDestino>';
      // xmlCoppelEfx += '            <BodegaReceptora>'+param_obj_CoppelEfx.bodegareceptora+'</BodegaReceptora>';
      xmlCoppelEfx += '        </shipTo>'
      xmlCoppelEfx += '        <currency currencyISOCode="' + param_obj_CoppelEfx.symbol + '">'
      xmlCoppelEfx += '            <currencyFunction>BILLING_CURRENCY</currencyFunction>'
      xmlCoppelEfx += '            <rateOfChange>' + param_obj_CoppelEfx.exchangerate + '</rateOfChange>'
      xmlCoppelEfx += '        </currency>'
      xmlCoppelEfx += '        <TotalLotes>'
      xmlCoppelEfx += '        <cantidad>' + param_obj_CoppelEfx.totalquantity + '</cantidad>'
      xmlCoppelEfx += '        </TotalLotes>'
      var itemNum = 0
      for (var lineitem in param_obj_CoppelEfx.item) {
        itemNum++
        xmlCoppelEfx += '        <lineItem type="SimpleInvoiceLineItemType" number="' + (parseInt(param_obj_CoppelEfx.line) + itemNum) + '">'
        xmlCoppelEfx += '            <tradeItemIdentification>'
        xmlCoppelEfx += '                <gtin>' + param_obj_CoppelEfx.item[lineitem].upc + '</gtin>'
        xmlCoppelEfx += '            </tradeItemIdentification>'
        xmlCoppelEfx += '            <alternateTradeItemIdentification type="BUYER_ASSIGNED">' + param_obj_CoppelEfx.item[lineitem].upc + '</alternateTradeItemIdentification>'
        xmlCoppelEfx += '            <codigoTallaInternoCop>'
        xmlCoppelEfx += '            <codigo>' + param_obj_CoppelEfx.item[lineitem].upc + '</codigo>'
        xmlCoppelEfx += '            <talla>' + param_obj_CoppelEfx.item[lineitem].talla + '</talla>'
        xmlCoppelEfx += '            </codigoTallaInternoCop>'
        xmlCoppelEfx += '            <tradeItemDescriptionInformation language="ES">'
        xmlCoppelEfx += '                <longText>' + param_obj_CoppelEfx.item[lineitem].salesdescription + '</longText>'
        xmlCoppelEfx += '            </tradeItemDescriptionInformation>'
        xmlCoppelEfx += '            <invoicedQuantity unitOfMeasure="PCE">' + param_obj_CoppelEfx.item[lineitem].pactquantity + '</invoicedQuantity>'
        var precioRopa = parseFloat(param_obj_CoppelEfx.item[lineitem].amount) / parseFloat(param_obj_CoppelEfx.item[lineitem].pactquantity)
        xmlCoppelEfx += '            <grossPrice>'
        xmlCoppelEfx += '                <Amount>' + precioRopa.toFixed(2) + '</Amount>'
        xmlCoppelEfx += '            </grossPrice>'
        xmlCoppelEfx += '            <netPrice>'
        xmlCoppelEfx += '                <Amount>' + precioRopa.toFixed(2) + '</Amount>'
        xmlCoppelEfx += '            </netPrice>'
        xmlCoppelEfx += '            <palletInformation>'
        xmlCoppelEfx += '            <palletQuantity>' + param_obj_CoppelEfx.item[lineitem].quantity + '</palletQuantity>'
        xmlCoppelEfx += '            <description type="BOX" />'
        xmlCoppelEfx += '            <transport>'
        xmlCoppelEfx += '            <methodOfPayment>PREPAID_BY_SELLER</methodOfPayment>'
        xmlCoppelEfx += '            </transport>'
        xmlCoppelEfx += '            <prepactCant>' + param_obj_CoppelEfx.item[lineitem].cantCajas + '</prepactCant>'
        xmlCoppelEfx += '            </palletInformation>'
        xmlCoppelEfx += '            <allowanceCharge allowanceChargeType="ALLOWANCE_GLOBAL">'
        xmlCoppelEfx += '                <specialServicesType>CAC</specialServicesType>'
        xmlCoppelEfx += '                <monetaryAmountOrPercentage>'
        xmlCoppelEfx += '                    <percentagePerUnit>0.00</percentagePerUnit>'
        xmlCoppelEfx += '                    <ratePerUnit>'
        xmlCoppelEfx += '                        <amountPerUnit>0.00</amountPerUnit>'
        xmlCoppelEfx += '                    </ratePerUnit>'
        xmlCoppelEfx += '                </monetaryAmountOrPercentage>'
        xmlCoppelEfx += '            </allowanceCharge>'
        xmlCoppelEfx += '            <totalLineAmount>'
        xmlCoppelEfx += '                <grossAmount>'
        xmlCoppelEfx += '                    <Amount>' + param_obj_CoppelEfx.item[lineitem].amount + '</Amount>'
        xmlCoppelEfx += '                </grossAmount>'
        xmlCoppelEfx += '                <netAmount>'
        xmlCoppelEfx += '                    <Amount>' + param_obj_CoppelEfx.item[lineitem].grossamt + '</Amount>'
        xmlCoppelEfx += '                </netAmount>'
        xmlCoppelEfx += '            </totalLineAmount>'
        xmlCoppelEfx += '        </lineItem>'
      }
      xmlCoppelEfx += '        <totalAmount>'
      xmlCoppelEfx += '            <Amount>' + param_obj_CoppelEfx.netamountnotax + '</Amount>'
      xmlCoppelEfx += '        </totalAmount>'
      xmlCoppelEfx += '        <TotalAllowanceCharge allowanceOrChargeType="ALLOWANCE">'
      xmlCoppelEfx += '            <specialServicesType>TD</specialServicesType>'
      xmlCoppelEfx += '            <Amount>0.00</Amount>'
      xmlCoppelEfx += '         </TotalAllowanceCharge>'
      xmlCoppelEfx += '         <baseAmount>'
      xmlCoppelEfx += '            <Amount>' + param_obj_CoppelEfx.netamountnotax + '</Amount>'
      xmlCoppelEfx += '        </baseAmount>'
      xmlCoppelEfx += '        <tax type="VAT">'
      xmlCoppelEfx += '            <taxPercentage>' + param_obj_CoppelEfx.netamountnotax + '</taxPercentage>'
      xmlCoppelEfx += '            <taxAmount>' + param_obj_CoppelEfx.taxtotal + '</taxAmount>'
      xmlCoppelEfx += '            <taxCategory>TRANSFERIDO</taxCategory>'
      xmlCoppelEfx += '        </tax>'
      xmlCoppelEfx += '        <payableAmount>'
      xmlCoppelEfx += '            <Amount>' + param_obj_CoppelEfx.total + '</Amount>'
      xmlCoppelEfx += '        </payableAmount>'
      xmlCoppelEfx += '        <cadenaOriginal>'
      xmlCoppelEfx += '            <Cadena/>'
      xmlCoppelEfx += '        </cadenaOriginal>'
      xmlCoppelEfx += '    </requestForPayment>'
      xmlCoppelEfx += '</cfdi:Addenda>'

      respuesta.data = xmlCoppelEfx
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlcoopel2', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlcoopel2', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataCoppel(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        total: 0,
        subtotal: 0,
        iva: 0,
        ieps: 0,
        descuentototal: 0,
        catitdad_articulos: '',
        grossamount: '',
        trandate: '',
        duedate: '',
        serie: '',
        folio: '',
        otherrefnum: '',
        gln: '',
        numproveedor: '',
        shipname: '',
        shipcity: '',
        shipzip: '',
        warehouse: '',
        bodegareceptora: '',
        symbol: '',
        exchangerate: '',
        line: '',
        upc: '',
        codigodecliente: '',
        salesdescription: '',
        quantity: '',
        amount: '',
        netamount: '',
        netamountnotax: '',
        tras: '',
        taxtotal: '',
        total: '',
        fecha_remision: '',
        fecha_cita: '',
        folio_num_cita: '',
        folio_pedido: '',
        orden_compra: '',
        id_remision: '',
        num_cajas: '',
        id_proveedor: '',
        tran_id: '',
        determinante: '',
        entrega_mercancia: '',
        item: []
      }
    }
    try {
      var rec_transaction = record.load({
        type: param_type,
        id: param_id,
        isDynamic: true
      })
      subtotal_transaction = rec_transaction.getValue('subtotal')

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: [
          'duedate',
          'custbody_bit_fact_e_serie',
          'custbody_bit_fact_e_folio',
          'otherrefnum',
          'subsidiary.custrecord_bit_ad_gln',
          'subsidiary.custrecord_bit_ad_numproveedor_coppel',
          'shipname',
          'shipcity',
          'shipzip',
          'shippingaddress.custrecord_bit_ad_warehouse',
          'shippingaddress.custrecord_bit_ad_bodegareceptora',
          'Currency.symbol',
          'exchangerate',
          'line',
          'item.custitem_bit_fact_e_upc',
          'item.custitem_bit_ad_codigodecliente',
          'item.salesdescription',
          'quantity',
          'amount',
          'netamount',
          'netamountnotax',
          'custbody_bit_fact_e_tasaocuota_tras',
          'taxtotal',
          'total'
        ]
      })

      var grossamount = LookupField['grossamount']
      respuesta.data.serie = grossamount
      var serie = LookupField['custbody_bit_fact_e_serie']
      respuesta.data.serie = serie
      var folio = LookupField['custbody_bit_fact_e_folio']
      respuesta.data.folio = folio
      var otherrefnum = LookupField['otherrefnum']
      respuesta.data.otherrefnum = otherrefnum
      var gln = LookupField['subsidiary.custrecord_bit_ad_gln']
      respuesta.data.gln = gln
      var numproveedor = LookupField['subsidiary.custrecord_bit_ad_numproveedor_coppel']
      respuesta.data.numproveedor = numproveedor
      var shipname = LookupField['shipname']
      respuesta.data.shipname = shipname
      var shipcity = LookupField['shipcity']
      respuesta.data.shipcity = shipcity
      var shipzip = LookupField['shipzip']
      respuesta.data.shipzip = shipzip
      var warehouse = LookupField['shippingaddress.custrecord_bit_ad_warehouse']
      respuesta.data.warehouse = warehouse
      var bodegareceptora = LookupField['shippingaddress.custrecord_bit_ad_bodegareceptora']
      respuesta.data.bodegareceptora = bodegareceptora
      var symbol = LookupField['Currency.symbol']
      respuesta.data.symbol = symbol
      var exchangerate = LookupField['exchangerate']
      respuesta.data.exchangerate = exchangerate
      var line = LookupField['line']
      respuesta.data.line = line
      //var upc = LookupField['item.custitem_bit_fact_e_upc'];
      //respuesta.data.upc = upc;
      //var codigodecliente = LookupField['item.custitem_bit_ad_codigodecliente'];
      //respuesta.data.codigodecliente = codigodecliente;
      //var salesdescription = LookupField['item.salesdescription'];
      //respuesta.data.salesdescription = salesdescription;
      var quantity = LookupField['quantity']
      respuesta.data.quantity = quantity
      var amount = LookupField['amount']
      respuesta.data.amount = amount
      var netamount = LookupField['netamount']
      respuesta.data.netamount = netamount
      var netamountnotax = LookupField['netamountnotax']
      respuesta.data.netamountnotax = netamountnotax
      var tras = LookupField['custbody_bit_fact_e_tasaocuota_tras']
      respuesta.data.tras = tras
      var taxtotal = LookupField['taxtotal']
      respuesta.data.taxtotal = taxtotal
      var total = LookupField['total']
      respuesta.data.total = total

      var extemporaneo = LookupField['custbody_efx_fe_add_pext'] || ''

      var horaMexico = horaActual()

      if (LookupField['trandate']) {
        var trandate = fechaSplit(LookupField['duedate'], '/', '-', 0, 1, 2, 'T' + horaMexico)
        fechaduedate = trandate.split('T')
        respuesta.data.trandate = trandate[0]
      }

      if (LookupField['duedate']) {
        var fechaduedate = fechaSplit(LookupField['duedate'], '/', '-', 0, 1, 2, 'T' + horaMexico)
        fechaduedate = fechaduedate.split('T')
        respuesta.data.duedate = fechaduedate[0]
      }

      var n_serie_fact_id = LookupField['tranid'] || ''

      log.audit({ title: 'n_serie_fact_id', details: JSON.stringify(n_serie_fact_id) })

      respuesta.data.folio_pedido = LookupField['otherrefnum'] || ''

      respuesta.data.orden_compra = LookupField['otherrefnum'] || ''

      respuesta.data.total = LookupField['total'] || 0

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: ['discounttotal'],
        bodyFieldText: [],
        lineField: [
          'itemtype',
          'item',
          'itemTEXT',
          'quantity',
          'rate',
          'item.custitem_bit_fact_e_upc',
          'amount',
          'grossamt',
          'item.custitem_bit_ad_codigodecliente',
          'item.salesdescription'
        ]
      }

      var transactionField = getTransactionField(objParametro)

      if (transactionField.succes) {
        var itemid = []
        var upcget = []
        var idget = []
        var codigodeclienteget = []
        var salesdescriptionget = []
        var descuento_total_lineas = 0

        for (var ir in transactionField.data.lineField) {
          itemid.push(transactionField.data.lineField[ir].item)

          var itemSearchObj = search.create({
            type: 'item',
            filters: [['internalidnumber', 'equalto', itemid[ir]]],
            columns: [
              search.createColumn({ name: 'custitem_bit_fact_e_upc', label: 'UPC' }),
              search.createColumn({ name: 'internalid', label: 'ID interno' }),
              search.createColumn({ name: 'custitem_bit_ad_codigodecliente', label: 'Código Producto Cliente' }),
              search.createColumn({ name: 'salesdescription', label: 'Descripción' })
            ]
          })

          itemSearchObj.run().each(function (result) {
            idget.push(result.getValue({ name: 'internalid' }))
            upcget.push(result.getValue({ name: 'custitem_bit_fact_e_upc' }))
            codigodeclienteget.push(result.getValue({ name: 'custitem_bit_ad_codigodecliente' }))
            salesdescriptionget.push(result.getValue({ name: 'salesdescription' }))
            return true
          })

          respuesta.data.item.push({
            itemTEXT: transactionField.data.lineField[ir].itemTEXT || '',
            quantity: transactionField.data.lineField[ir].quantity || '',
            rate: transactionField.data.lineField[ir].rate || '',
            amount: transactionField.data.lineField[ir].amount || '',
            grossamt: transactionField.data.lineField[ir].grossamt || '',
            upc: upcget[ir],
            codigodecliente: codigodeclienteget[ir],
            salesdescription: salesdescriptionget[ir]
          })
        }

        log.error({ title: 'transactionField.data.bodyFieldValue.discounttotal', details: JSON.stringify(transactionField.data.bodyFieldValue.discounttotal) })
        log.error({ title: 'descuento_total_lineas', details: JSON.stringify(descuento_total_lineas) })
        if (transactionField.data.bodyFieldValue.discounttotal) {
          respuesta.data.descuentototal = transactionField.data.bodyFieldValue.discounttotal
        } else {
          respuesta.data.descuentototal = descuento_total_lineas.toFixed(2)
        }
      }

      respuesta.data.subtotal = subtotal_transaction.toFixed(2)
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getDataSorianaEfx', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataSorianaEfx', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlCoppel(param_obj_CoppelEfx) {
    log.audit({ title: 'param_obj_CoppelEfx', details: param_obj_CoppelEfx })
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      log.audit({ title: 'param_obj_CoppelEfx.item', details: param_obj_CoppelEfx.item })
      respuesta.xmlns = ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" '
      respuesta.xmlns += ' xmlns:xs="http://www.w3.org/2001/XMLSchema" '
      respuesta.xmlns += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '

      var xmlCoppelEfx = ''
      xmlCoppelEfx += ' <cfdi:Addenda>  '
      xmlCoppelEfx +=
        '    <requestForPayment xmlns_xsi="http://www.w3.org/2001/XMLSchema-instance" type="SimpleInvoiceType" contentVersion="1.0" documentStructureVersion="CPLM1.0" documentStatus="ORIGINAL" DeliveryDate="' +
        param_obj_CoppelEfx.duedate +
        '">' //'YYYY-MM-DD'
      xmlCoppelEfx += '        <requestForPaymentIdentification>'
      xmlCoppelEfx += '            <entityType>INVOICE</entityType>'
      if (param_obj_CoppelEfx.serie != '') {
        xmlCoppelEfx += ' <uniqueCreatorIdentification>' + param_obj_CoppelEfx.serie + '</uniqueCreatorIdentification>'
      } else {
        xmlCoppelEfx += ' <uniqueCreatorIdentification>' + param_obj_CoppelEfx.folio + '</uniqueCreatorIdentification>'
      }

      xmlCoppelEfx += '        </requestForPaymentIdentification>'
      xmlCoppelEfx += '        <orderIdentification>'
      xmlCoppelEfx += '            <referenceIdentification type="ON">' + param_obj_CoppelEfx.otherrefnum + '</referenceIdentification>'
      xmlCoppelEfx += '            <ReferenceDate>' + param_obj_CoppelEfx.trandate + '</ReferenceDate>' //'YYYY-MM-DD'
      xmlCoppelEfx += '            <FechaPromesaEnt>' + param_obj_CoppelEfx.duedate + '</FechaPromesaEnt>' //'YYYY-MM-DD'
      xmlCoppelEfx += '        </orderIdentification>'
      xmlCoppelEfx += '        <seller>'
      xmlCoppelEfx += '            <gln>' + param_obj_CoppelEfx.gln + '</gln>'
      xmlCoppelEfx +=
        '            <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' + param_obj_CoppelEfx.numproveedor + '</alternatePartyIdentification>'
      xmlCoppelEfx += '            <IndentificaTipoProv>1</IndentificaTipoProv>'
      xmlCoppelEfx += '        </seller>'
      xmlCoppelEfx += '        <shipTo>'
      xmlCoppelEfx += '            <nameAndAddress>'
      xmlCoppelEfx += '                <name>' + param_obj_CoppelEfx.shipname + '</name>'
      xmlCoppelEfx += '                <city>' + param_obj_CoppelEfx.shipcity + '</city>'
      xmlCoppelEfx += '                <postalCode>' + param_obj_CoppelEfx.shipzip + '</postalCode>'
      xmlCoppelEfx += '            </nameAndAddress>'
      xmlCoppelEfx += '            <BodegaDestino>' + param_obj_CoppelEfx.warehouse + '</BodegaDestino>'
      xmlCoppelEfx += '            <BodegaReceptora>' + param_obj_CoppelEfx.bodegareceptora + '</BodegaReceptora>'
      xmlCoppelEfx += '        </shipTo>'
      xmlCoppelEfx += '        <currency currencyISOCode="' + param_obj_CoppelEfx.symbol + '">'
      xmlCoppelEfx += '            <currencyFunction>BILLING_CURRENCY</currencyFunction>'
      xmlCoppelEfx += '            <rateOfChange>' + param_obj_CoppelEfx.exchangerate + '</rateOfChange>'
      xmlCoppelEfx += '        </currency>'
      xmlCoppelEfx += '        <FleteCaja type="BUYER_PROVIDED">CAMIONETA</FleteCaja>'
      xmlCoppelEfx += '        <allowanceCharge settlementType="OFF_INVOICE" allowanceChargeType="ALLOWANCE_GLOBAL">'
      xmlCoppelEfx += '            <specialServicesType>AJ</specialServicesType>'
      xmlCoppelEfx += '            <monetaryAmountOrPercentage>'
      xmlCoppelEfx += '                <rate base="INVOICE_VALUE">'
      xmlCoppelEfx += '                    <percentage>0</percentage>'
      xmlCoppelEfx += '                </rate>'
      xmlCoppelEfx += '            </monetaryAmountOrPercentage>'
      xmlCoppelEfx += '        </allowanceCharge>'
      var itemNum = 0
      for (var lineitem in param_obj_CoppelEfx.item) {
        itemNum++
        xmlCoppelEfx += '        <lineItem type="SimpleInvoiceLineItemType" number="' + (parseInt(param_obj_CoppelEfx.line) + itemNum) + '">'
        xmlCoppelEfx += '            <tradeItemIdentification>'
        xmlCoppelEfx += '                <gtin>' + param_obj_CoppelEfx.item[lineitem].upc + '</gtin>'
        xmlCoppelEfx += '            </tradeItemIdentification>'
        xmlCoppelEfx +=
          '            <alternateTradeItemIdentification type="BUYER_ASSIGNED">' + param_obj_CoppelEfx.item[lineitem].codigodecliente + '</alternateTradeItemIdentification>'
        xmlCoppelEfx += '            <tradeItemDescriptionInformation language="ES">'
        xmlCoppelEfx += '                <longText>' + param_obj_CoppelEfx.item[lineitem].salesdescription + '</longText>'
        xmlCoppelEfx += '            </tradeItemDescriptionInformation>'
        xmlCoppelEfx += '            <invoicedQuantity unitOfMeasure="PCE">' + param_obj_CoppelEfx.item[lineitem].quantity + '</invoicedQuantity>'
        xmlCoppelEfx += '            <grossPrice>'
        xmlCoppelEfx += '                <Amount>' + param_obj_CoppelEfx.item[lineitem].amount + '</Amount>'
        xmlCoppelEfx += '            </grossPrice>'
        xmlCoppelEfx += '            <netPrice>'
        xmlCoppelEfx += '                <Amount>' + param_obj_CoppelEfx.item[lineitem].grossamt + '</Amount>'
        xmlCoppelEfx += '            </netPrice>'

        xmlCoppelEfx += '            <modeloInformation>'
        xmlCoppelEfx += '                <longText>' + param_obj_CoppelEfx.item[lineitem].codigodecliente + '</longText>'
        xmlCoppelEfx += '            </modeloInformation>'
        xmlCoppelEfx += '            <allowanceCharge allowanceChargeType="ALLOWANCE_GLOBAL">'
        xmlCoppelEfx += '                <specialServicesType>PAD</specialServicesType>'
        xmlCoppelEfx += '                <monetaryAmountOrPercentage>'
        xmlCoppelEfx += '                    <percentagePerUnit>0</percentagePerUnit>'
        xmlCoppelEfx += '                    <ratePerUnit>'
        xmlCoppelEfx += '                        <amountPerUnit>0</amountPerUnit>'
        xmlCoppelEfx += '                    </ratePerUnit>'
        xmlCoppelEfx += '                </monetaryAmountOrPercentage>'
        xmlCoppelEfx += '            </allowanceCharge>'
        xmlCoppelEfx += '            <totalLineAmount>'
        xmlCoppelEfx += '                <grossAmount>'
        xmlCoppelEfx += '                    <Amount>' + param_obj_CoppelEfx.item[lineitem].amount + '</Amount>'
        xmlCoppelEfx += '                </grossAmount>'
        xmlCoppelEfx += '                <netAmount>'
        xmlCoppelEfx += '                    <Amount>' + param_obj_CoppelEfx.item[lineitem].grossamt + '</Amount>'
        xmlCoppelEfx += '                </netAmount>'
        xmlCoppelEfx += '            </totalLineAmount>'
        xmlCoppelEfx += '        </lineItem>'
      }
      xmlCoppelEfx += '        <totalAmount>'
      xmlCoppelEfx += '            <Amount>' + param_obj_CoppelEfx.netamountnotax + '</Amount>'
      xmlCoppelEfx += '        </totalAmount>'
      xmlCoppelEfx += '        <TotalAllowanceCharge allowanceOrChargeType="ALLOWANCE">'
      xmlCoppelEfx += '            <specialServicesType>TD</specialServicesType>'
      xmlCoppelEfx += '            <Amount>0.00</Amount>'
      xmlCoppelEfx += '         <baseAmount>'
      xmlCoppelEfx += '            <Amount>' + param_obj_CoppelEfx.netamountnotax + '</Amount>'
      xmlCoppelEfx += '        </baseAmount>'
      xmlCoppelEfx += '        <tax type="VAT">'
      xmlCoppelEfx += '            <taxPercentage>' + param_obj_CoppelEfx.netamountnotax + '</taxPercentage>'
      xmlCoppelEfx += '            <taxAmount>' + param_obj_CoppelEfx.taxtotal + '</taxAmount>'
      xmlCoppelEfx += '            <taxCategory>TRANSFERIDO</taxCategory>'
      xmlCoppelEfx += '        </tax>'
      xmlCoppelEfx += '        <payableAmount>'
      xmlCoppelEfx += '            <Amount>' + param_obj_CoppelEfx.total + '</Amount>'
      xmlCoppelEfx += '        </payableAmount>'
      xmlCoppelEfx += '        <cadenaOriginal>'
      xmlCoppelEfx += '            <Cadena/>'
      xmlCoppelEfx += '        </cadenaOriginal>'
      xmlCoppelEfx += '    </requestForPayment>'
      xmlCoppelEfx += '</cfdi:Addenda>'

      respuesta.data = xmlCoppelEfx
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlcoopel2', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlcoopel2', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataSoriana(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        total: 0,
        subtotal: 0,
        iva: 0,
        ieps: 0,
        descuentototal: 0,
        catitdad_articulos: '',

        fecha_remision: '',
        fecha_cita: '',
        folio_num_cita: '',
        folio_pedido: '',
        orden_compra: '',
        id_remision: '',
        num_cajas: '',
        id_proveedor: '',
        tran_id: '',
        determinante: '',
        entrega_mercancia: '',
        determinante_envio: '',
        entrega_mercancia_envio: '',
        item: []
      }
    }
    try {
      var rec_transaction = record.load({
        type: param_type,
        id: param_id,
        isDynamic: true
      })
      subtotal_transaction = rec_transaction.getValue('subtotal')

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: [
          //'custbody_efx_soriana_fecharemision',
          'custbody_efx_soriana_fechacita',
          'custbody_efx_soriana_numerocita',
          'custbody_efx_soriana_foliopedido',
          'custbody_efx_soriana_remision',
          'custbody_efx_soriana_numerocajas',
          'custbody_efx_fe_tax_json',
          'otherrefnum',
          //'custbody_efx_fe_add_oc_soriana',
          'customer.custentity_efx_soriana_idproveedor',
          'tranid',
          'trandate',
          'billingaddress.custrecord_efx_soriana_determinante',
          'billingaddress.custrecord_efx_soriana_entregamercancia',
          'shippingaddress.custrecord_efx_soriana_determinante',
          'shippingaddress.custrecord_efx_soriana_entregamercancia',
          'total',
          'custbody_efx_fe_add_pext',
          'otherrefnum' //sustituis por el folio de pedido, sourcear idremision con id de factura
        ]
      })

      var extemporaneo = LookupField['custbody_efx_fe_add_pext'] || ''
      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      var horaMexico = horaActual()
      // if (LookupField['custbody_efx_soriana_fecharemision']) {
      //     respuesta.data.fecha_remision = fechaSplit(LookupField['custbody_efx_soriana_fecharemision'], '/', '-', 0, 1, 2, 'T' + horaMexico);
      // }
      if (LookupField['trandate']) {
        respuesta.data.fecha_remision = fechaSplit(LookupField['trandate'], '/', '-', 0, 1, 2, 'T' + horaMexico)
      }
      if (LookupField['custbody_efx_soriana_fechacita']) {
        respuesta.data.fecha_cita = fechaSplit(LookupField['custbody_efx_soriana_fechacita'], '/', '-', 0, 1, 2, 'T' + horaMexico)
      }

      //var n_serie_fact = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_serie_invoice'}) || '';
      var n_serie_fact_id = LookupField['tranid'] || ''

      //log.audit({title: 'n_serie_fact', details: JSON.stringify(n_serie_fact)});
      log.audit({ title: 'n_serie_fact_id', details: JSON.stringify(n_serie_fact_id) })
      log.audit({ title: 'custbody_efx_fe_tax_json', details: JSON.parse(LookupField['custbody_efx_fe_tax_json']) })
      var json_tax = JSON.parse(LookupField['custbody_efx_fe_tax_json'])

      respuesta.data.iva = json_tax.iva_total
      respuesta.data.ieps = json_tax.ieps_total
      respuesta.data.folio_pedido = LookupField['otherrefnum'] || ''
      //respuesta.data.orden_compra = LookupField['custbody_efx_fe_add_oc_soriana'] || '';
      respuesta.data.orden_compra = LookupField['otherrefnum'] || ''
      if (extemporaneo) {
        respuesta.data.numero_cita = ''
        respuesta.data.id_remision = LookupField['tranid'] || ''
      } else {
        respuesta.data.numero_cita = LookupField['custbody_efx_soriana_numerocita'] || ''
        respuesta.data.contra_recibo = LookupField['custbody_efx_soriana_foliopedido'] || ''
        respuesta.data.id_remision = LookupField['custbody_efx_soriana_remision'] || ''
        if (!LookupField['custbody_efx_soriana_remision']) {
          respuesta.data.id_remision = LookupField['tranid'] || ''
        }
      }

      respuesta.data.num_cajas = LookupField['custbody_efx_soriana_numerocajas'] || ''
      respuesta.data.id_proveedor = LookupField['customer.custentity_efx_soriana_idproveedor'] || ''
      respuesta.data.tran_id = /*n_serie_fact+*/ n_serie_fact_id
      respuesta.data.determinante = LookupField['billingaddress.custrecord_efx_soriana_determinante'] || ''
      respuesta.data.entrega_mercancia = LookupField['billingaddress.custrecord_efx_soriana_entregamercancia'] || ''
      respuesta.data.determinante_envio = LookupField['shippingaddress.custrecord_efx_soriana_determinante'] || ''
      respuesta.data.entrega_mercancia_envio = LookupField['shippingaddress.custrecord_efx_soriana_entregamercancia'] || ''

      respuesta.data.total = LookupField['total'] || 0

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: ['discounttotal'],
        bodyFieldText: [],
        lineField: ['itemtype', 'item', 'itemTEXT', 'quantity', 'rate', 'custcol_efx_fe_upc_code', 'amount']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        var array_items = []
        var descuento_total_lineas = 0
        for (var ir in transactionField.data.lineField) {
          //buscar descuentos
          var descuento_linea = 0
          var linea_disc = parseInt(ir) + 1
          var tamano_linefield = Object.keys(transactionField.data.lineField).length
          log.audit({ title: 'linea_disc', details: linea_disc })
          log.audit({ title: 'tamano_linefield', details: tamano_linefield })
          if (linea_disc < tamano_linefield) {
            if (transactionField.data.lineField[linea_disc].itemtype == 'Discount') {
              descuento_linea = transactionField.data.lineField[linea_disc].amount
              if (descuento_linea < 0) {
                descuento_linea = descuento_linea * -1
              }
            }
          }
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var json_col = rec_transaction.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_efx_fe_tax_json',
              line: ir
            })
            var json_tax_col = JSON.parse(json_col)

            descuento_total_lineas = descuento_total_lineas + descuento_linea
            var new_rate = 0
            log.audit({ title: 'descuento_linea', details: JSON.stringify(descuento_linea) })
            if (descuento_linea > 0) {
              log.audit({
                title: 'parseFloat(transactionField.data.lineField[ir].rate',
                details: JSON.stringify(parseFloat(transactionField.data.lineField[ir].rate.toFixed(2)))
              })
              log.audit({
                title: 'parseFloat(transactionField.data.lineField[ir].quantity',
                details: JSON.stringify(parseFloat(transactionField.data.lineField[ir].quantity))
              })
              log.audit({ title: 'descuento_linea', details: JSON.stringify(descuento_linea) })
              var opnew_rate = parseFloat(transactionField.data.lineField[ir].rate) * parseFloat(transactionField.data.lineField[ir].quantity) - parseFloat(descuento_linea)
              log.audit({ title: 'opnew_rate', details: JSON.stringify(opnew_rate) })
              new_rate = opnew_rate / parseFloat(transactionField.data.lineField[ir].quantity)
            } else {
              new_rate = transactionField.data.lineField[ir].rate || ''
            }
            respuesta.data.item.push({
              quantity: transactionField.data.lineField[ir].quantity || '',
              sku: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              rate: new_rate || '',
              discount: descuento_linea,
              iva_rate: json_tax_col.iva.rate.toFixed(4),
              ieps_rate: json_tax_col.ieps.rate.toFixed(4)
            })
          }
        }
        log.error({ title: 'transactionField.data.bodyFieldValue.discounttotal', details: JSON.stringify(transactionField.data.bodyFieldValue.discounttotal) })
        log.error({ title: 'descuento_total_lineas', details: JSON.stringify(descuento_total_lineas) })
        if (transactionField.data.bodyFieldValue.discounttotal) {
          respuesta.data.descuentototal = transactionField.data.bodyFieldValue.discounttotal
        } else {
          respuesta.data.descuentototal = descuento_total_lineas.toFixed(2)
        }
      }

      respuesta.data.subtotal = subtotal_transaction.toFixed(2)
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getDataSorianaEfx', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataSorianaEfx', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlSoriana(param_obj_SorianaEfx) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      respuesta.xmlns = ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" '
      respuesta.xmlns += ' xmlns:xs="http://www.w3.org/2001/XMLSchema" '
      respuesta.xmlns += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '

      var xmlSorianaEfx = ''
      xmlSorianaEfx += '<cfdi:Addenda>'
      xmlSorianaEfx += '    <DSCargaRemisionProv xmlns="http://tempuri.org/DSCargaRemisionProv.xsd">'
      xmlSorianaEfx += '        <Remision RowOrder="0" Id="' + param_obj_SorianaEfx.id_remision + '">'
      xmlSorianaEfx += '            <Proveedor>' + param_obj_SorianaEfx.id_proveedor + '</Proveedor>'
      xmlSorianaEfx += '            <Remision>' + param_obj_SorianaEfx.id_remision + '</Remision>'
      xmlSorianaEfx += '            <Consecutivo>0</Consecutivo>'
      xmlSorianaEfx += '            <FechaRemision>' + param_obj_SorianaEfx.fecha_remision + '</FechaRemision>'
      if (param_obj_SorianaEfx.determinante_envio) {
        xmlSorianaEfx += '            <Tienda>' + param_obj_SorianaEfx.determinante_envio + '</Tienda>'
      } else {
        xmlSorianaEfx += '            <Tienda>' + param_obj_SorianaEfx.determinante + '</Tienda>'
      }
      xmlSorianaEfx += '            <TipoMoneda>1</TipoMoneda>'
      xmlSorianaEfx += '            <TipoBulto>2</TipoBulto>'
      if (param_obj_SorianaEfx.entrega_mercancia_envio) {
        xmlSorianaEfx += '            <EntregaMercancia>' + param_obj_SorianaEfx.entrega_mercancia_envio + '</EntregaMercancia>'
      } else {
        xmlSorianaEfx += '            <EntregaMercancia>' + param_obj_SorianaEfx.entrega_mercancia + '</EntregaMercancia>'
      }
      xmlSorianaEfx += '            <CumpleReqFiscales>true</CumpleReqFiscales>'
      xmlSorianaEfx += '            <CantidadBultos>' + param_obj_SorianaEfx.num_cajas + '</CantidadBultos>'
      xmlSorianaEfx += '            <Subtotal>' + param_obj_SorianaEfx.subtotal + '</Subtotal>'
      xmlSorianaEfx += '            <Descuentos>' + param_obj_SorianaEfx.descuentototal + '</Descuentos>'
      xmlSorianaEfx += '            <IEPS>' + param_obj_SorianaEfx.ieps + '</IEPS>'
      xmlSorianaEfx += '            <IVA>' + param_obj_SorianaEfx.iva + '</IVA>'
      xmlSorianaEfx += '            <OtrosImpuestos>0</OtrosImpuestos>'
      xmlSorianaEfx += '            <Total>' + param_obj_SorianaEfx.total + '</Total>'
      xmlSorianaEfx += '            <CantidadPedidos>1</CantidadPedidos>'
      xmlSorianaEfx += '            <FechaEntregaMercancia>' + param_obj_SorianaEfx.fecha_cita + '</FechaEntregaMercancia>'
      if (param_obj_SorianaEfx.contra_recibo) {
        xmlSorianaEfx += '            <FolioNotaEntrada>' + param_obj_SorianaEfx.contra_recibo + '</FolioNotaEntrada>'
      } else {
        xmlSorianaEfx += '            <Cita>' + param_obj_SorianaEfx.numero_cita + '</Cita>'
      }
      xmlSorianaEfx += '        </Remision>'

      xmlSorianaEfx += '        <Pedidos RowOrder="1" Id="' + param_obj_SorianaEfx.orden_compra + '">'
      xmlSorianaEfx += '            <Proveedor>' + param_obj_SorianaEfx.id_proveedor + '</Proveedor>'
      xmlSorianaEfx += '            <Remision>' + param_obj_SorianaEfx.id_remision + '</Remision>'
      xmlSorianaEfx += '            <FolioPedido>' + param_obj_SorianaEfx.orden_compra + '</FolioPedido>'
      if (param_obj_SorianaEfx.determinante_envio) {
        xmlSorianaEfx += '            <Tienda>' + param_obj_SorianaEfx.determinante_envio + '</Tienda>'
      } else {
        xmlSorianaEfx += '            <Tienda>' + param_obj_SorianaEfx.determinante + '</Tienda>'
      }
      xmlSorianaEfx += '            <CantidadArticulos>' + param_obj_SorianaEfx.item.length + '</CantidadArticulos>'
      if (param_obj_SorianaEfx.contra_recibo) {
        xmlSorianaEfx += '            <PedidoEmitidoProveedor>SI</PedidoEmitidoProveedor>'
      }
      xmlSorianaEfx += '        </Pedidos>'
      var itemNum = 0
      for (var lineitem in param_obj_SorianaEfx.item) {
        itemNum++

        xmlSorianaEfx += '        <Articulos RowOrder="' + itemNum + '" Id="' + param_obj_SorianaEfx.id_remision + '">'
        xmlSorianaEfx += '            <Proveedor>' + param_obj_SorianaEfx.id_proveedor + '</Proveedor>'
        xmlSorianaEfx += '            <Remision>' + param_obj_SorianaEfx.id_remision + '</Remision>'
        xmlSorianaEfx += '            <FolioPedido>' + param_obj_SorianaEfx.folio_pedido + '</FolioPedido>'
        if (param_obj_SorianaEfx.determinante_envio) {
          xmlSorianaEfx += '            <Tienda>' + param_obj_SorianaEfx.determinante_envio + '</Tienda>'
        } else {
          xmlSorianaEfx += '            <Tienda>' + param_obj_SorianaEfx.determinante + '</Tienda>'
        }
        xmlSorianaEfx += '            <Codigo>' + param_obj_SorianaEfx.item[lineitem].sku + '</Codigo>'
        xmlSorianaEfx += '            <CantidadUnidadCompra>' + param_obj_SorianaEfx.item[lineitem].quantity + '</CantidadUnidadCompra>'
        xmlSorianaEfx += '            <CostoNetoUnidadCompra>' + param_obj_SorianaEfx.item[lineitem].rate.toFixed(2) + '</CostoNetoUnidadCompra>'

        xmlSorianaEfx += '            <PorcentajeIEPS>' + param_obj_SorianaEfx.item[lineitem].ieps_rate + '</PorcentajeIEPS>'
        xmlSorianaEfx += '            <PorcentajeIVA>' + param_obj_SorianaEfx.item[lineitem].iva_rate + '</PorcentajeIVA>'
        xmlSorianaEfx += '        </Articulos>'
      }

      xmlSorianaEfx += '        </DSCargaRemisionProv>'
      xmlSorianaEfx += '    </cfdi:Addenda>'

      respuesta.data = xmlSorianaEfx
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlSoriana2', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlSoriana2', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataWalmartSamsClub(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        Anio: '', // "2019",
        FolioRecibo: '', // "28-05030108",
        ordenCompra: '', // "2823840552",
        numeroProveedor: '', // "276139",
        unidadCEDIS: '', // "2384",
        unidadCEDIS_envio: '' // "2384",
      }
    }
    try {
      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: [
          'custbody_efx_walmart_folio_recibo',
          'otherrefnum',
          'billingaddress.custrecord_efx_walmart_cedis',
          'shippingaddress.custrecord_efx_walmart_cedis',
          'customer.custentity_efx_num_proveedor_walmar_sams',
          'trandate'
        ]
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })
      respuesta.data.FolioRecibo = LookupField['custbody_efx_walmart_folio_recibo'] || ''
      respuesta.data.ordenCompra = LookupField['otherrefnum'] || ''
      respuesta.data.unidadCEDIS = LookupField['billingaddress.custrecord_efx_walmart_cedis'] || ''
      respuesta.data.unidadCEDIS_envio = LookupField['shippingaddress.custrecord_efx_walmart_cedis'] || ''
      respuesta.data.numeroProveedor = LookupField['customer.custentity_efx_num_proveedor_walmar_sams'] || ''
      if (LookupField['trandate']) {
        var lookdate = format.parse({
          value: LookupField['trandate'],
          type: format.Type.DATE
        })

        var objDate = new Date(lookdate)

        respuesta.data.Anio = objDate.getFullYear()
      }
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getDataWalmartSamsClub', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataWalmartSamsClub', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlWalmartSamsClub(param_obj_WalmartSamsClub) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      respuesta.xmlns += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
      respuesta.xmlns += ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"'

      var xmlWalmartSamsClub = ''
      xmlWalmartSamsClub += '<cfdi:Addenda>'
      xmlWalmartSamsClub += '     <WM:AddendaWalmart'
      xmlWalmartSamsClub += '         xmlns:WM="http://www.pegasotecnologia.com/secfd/Schemas/Receptor/Walmart"'
      xmlWalmartSamsClub += '         Anio="' + param_obj_WalmartSamsClub.Anio + '"'
      if (param_obj_WalmartSamsClub.FolioRecibo) {
        xmlWalmartSamsClub += '         FolioRecibo="' + param_obj_WalmartSamsClub.FolioRecibo + '"'
      }
      xmlWalmartSamsClub += '         ordenCompra="' + param_obj_WalmartSamsClub.ordenCompra + '"'
      xmlWalmartSamsClub += '         numeroProveedor="' + param_obj_WalmartSamsClub.numeroProveedor + '"'
      if (param_obj_WalmartSamsClub.unidadCEDIS_envio) {
        xmlWalmartSamsClub += '         unidadCEDIS="' + param_obj_WalmartSamsClub.unidadCEDIS_envio + '"'
      } else {
        if (param_obj_WalmartSamsClub.unidadCEDIS) {
          xmlWalmartSamsClub += '         unidadCEDIS="' + param_obj_WalmartSamsClub.unidadCEDIS + '"'
        }
      }
      xmlWalmartSamsClub += '     />'
      xmlWalmartSamsClub += '</cfdi:Addenda>'

      respuesta.data = xmlWalmartSamsClub
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlWalmartSamsClub', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlWalmartSamsClub', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataCityFresco(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        serie: '',
        folio: '',
        DeliveryDate: '',
        ReferenceDate: '',
        orderIdentificationreferenceIdentification: '',
        specialInstruction: [],
        buyergln: '',
        sellergln: '',
        personOrDepartmentName: '',
        alternatePartyIdentification: '',
        glnShipTo: '',

        nameShipTo: '',
        streetAddressOneShipTo: '',
        cityShipTo: '',
        postalCodeShipTo: '',

        glnInvoiceCreator: '',

        alternatePartyIdentificationInvoiceCreator: '',
        nameInvoiceCreator: '',
        streetAddressOneInvoiceCreator: '',
        cityInvoiceCreator: '',
        postalCodeInvoiceCreator: '',

        item: [],

        tax: [],
        totalAmount: '',
        descuentototal: 0,
        baseAmount: '',
        payableAmount: '',

        currencyISOCode: 'MXN',
        rateOfChange: '1',
        monetaryAmountOrPercentage: '0.00'
      }
    }

    var arrayColumn = [
      'trandate',
      'custbody_efx_cf_fechaordencompra',
      'custbody_efx_fe_tax_json',
      'otherrefnum',
      'custbody_efx_fe_fecha_recibo',
      'tranid',
      'total',
      'terms',

      'customer.custentity_efx_cf_buyerperson',
      'customer.custentity_efx_cf_buyergln',
      'customer.custentity_efx_cf_idproveedor',
      'customer.custentity_efx_cf_sellergln',
      //'customer.custentity_efx_cf_tradeidentification',

      'custbody_efx_fe_total_text',
      'custbody_efx_fe_folio_cfresko',

      'billingaddress.address1',
      'billingaddress.addressee',
      'billingaddress.city',
      'billingaddress.zip',
      'billingaddress.custrecord_efx_fe_lugar_city',
      'billingaddress.custrecord_efx_fe_lugar_gln',
      'billingaddress.custrecord_efx_fe_cedis_cfresko',
      'billingaddress.custrecord_streetname',
      'billingaddress.custrecord_streetnum',

      'shippingaddress.address1',
      'shippingaddress.addressee',
      'shippingaddress.city',
      'shippingaddress.zip',
      'shippingaddress.custrecord_efx_fe_lugar_city',
      'shippingaddress.custrecord_efx_fe_lugar_gln',
      'shippingaddress.custrecord_efx_fe_buyer_gln',
      'shippingaddress.custrecord_efx_fe_cedis_cfresko',
      'shippingaddress.custrecord_streetname',
      'shippingaddress.custrecord_streetnum'
    ]

    var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' })
    var LOCATIONS = runtime.isFeatureInEffect({ feature: 'LOCATIONS' })

    if (SUBSIDIARIES) {
      arrayColumn.push('subsidiary')
    }
    if (LOCATIONS) {
      arrayColumn.push('location')
    }
    try {
      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })
      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      {
        //
        if (SUBSIDIARIES && LookupField.subsidiary) {
          var resultSub = record.load({
            type: search.Type.SUBSIDIARY,
            id: LookupField.subsidiary[0].value
          })

          respuesta.data.alternatePartyIdentificationInvoiceCreator = resultSub.getValue({ fieldId: 'federalidnumber' }) || '' // 'NFM0910317L6',
          respuesta.data.nameInvoiceCreator = resultSub.getValue({ fieldId: 'legalname' }) || '' // 'NUTRITION FACT DE MEXICO SA DE CV',
          var mainaddressOBJ = resultSub.getSubrecord({ fieldId: 'mainaddress' })
          respuesta.data.streetAddressOneInvoiceCreator =
            mainaddressOBJ.getValue({ fieldId: 'custrecord_streetname' }) || '' + mainaddressOBJ.getValue({ fieldId: 'custrecord_streetnum' }) || '' //
          respuesta.data.cityInvoiceCreator = mainaddressOBJ.getText({ fieldId: 'city' }) || '' // 'AZCAPOTZALCO',
          respuesta.data.postalCodeInvoiceCreator = mainaddressOBJ.getValue({ fieldId: 'zip' }) || '' // '02410',
        } else if (!SUBSIDIARIES) {
          var configRecObj = config.load({
            type: config.Type.COMPANY_INFORMATION
          })

          respuesta.data.alternatePartyIdentificationInvoiceCreator = configRecObj.getValue({ fieldId: 'employerid' }) || ''
          respuesta.data.nameInvoiceCreator = configRecObj.getValue({ fieldId: 'legalname' }) || ''
          var mainaddressOBJ = configRecObj.getSubrecord({ fieldId: 'mainaddress' })
          respuesta.data.streetAddressOneInvoiceCreator =
            mainaddressOBJ.getValue({ fieldId: 'custrecord_streetname' }) || '' + mainaddressOBJ.getValue({ fieldId: 'custrecord_streetnum' }) || '' //;
          respuesta.data.cityInvoiceCreator = mainaddressOBJ.getText({ fieldId: 'city' }) || ''
          respuesta.data.postalCodeInvoiceCreator = mainaddressOBJ.getValue({ fieldId: 'zip' }) || ''
        }
        //
      }
      var horaMexico = horaActual()

      if (LookupField['custbody_efx_fe_fecha_recibo']) {
        // respuesta.data.ReferenceDate = fechaSplit(LookupField['custbody_efx_cf_fechaordencompra'], '/', '-', 0, 1, 2, 'T' + horaMexico);
        respuesta.data.ReferenceDate = fechaSplit(LookupField['custbody_efx_fe_fecha_recibo'], '/', '-', 0, 1, 2, '')
      }

      if (LookupField['custbody_efx_cf_fechaordencompra']) {
        // respuesta.data.DeliveryDate = fechaSplit(LookupField['trandate'], '/', '-', 0, 1, 2, 'T' + horaMexico);
        respuesta.data.DeliveryDate = fechaSplit(LookupField['custbody_efx_cf_fechaordencompra'], '/', '-', 0, 1, 2, '')
      }

      respuesta.data.folio = LookupField['tranid'] || ''
      respuesta.data.cedis = LookupField['billingaddress.custrecord_efx_fe_cedis_cfresko'] || ''
      respuesta.data.cedis_envio = LookupField['shippingaddress.custrecord_efx_fe_cedis_cfresko'] || ''
      respuesta.data.terminos = LookupField['terms'] || ''
      respuesta.data.folio_recibo = LookupField['custbody_efx_fe_folio_cfresko'] || ''
      respuesta.data.serie = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_serie_invoice' }) || ''

      var json_tax = ''
      if (LookupField['custbody_efx_fe_tax_json']) {
        json_tax = JSON.parse(LookupField['custbody_efx_fe_tax_json'])
        respuesta.data.iva = json_tax.iva_total
        respuesta.data.ieps = json_tax.ieps_total
        if (json_tax.rates_ieps) {
        }
        if (json_tax.rates_iva) {
          var rate_iva_total = '0.00'
          var rate_iva_total_num = 0
          for (var i = 0; i < Object.keys(json_tax.rates_iva).length; i++) {
            var rates_obj_iva = Object.keys(json_tax.rates_iva)[i]
            var rate_split = rates_obj_iva.split(' ')
            var rate_num = rate_split[1].replace('%', '')
            var rate_iva = parseFloat(rate_num)
            rate_iva_total_num = rate_iva_total_num + rate_iva
          }
          rate_iva_total = rate_iva_total_num.toFixed(4)
        }
      }

      respuesta.data.specialInstruction.push({
        code: 'ZZZ',
        text: LookupField['custbody_efx_fe_total_text'] || ''
      })
      // respuesta.data.specialInstruction.push({code: 'AAB', text: 'PAGO A 45 DIAS'});
      // respuesta.data.specialInstruction.push({code: 'PUR', text: 'PAGO GENERA DESCUENTO'});

      respuesta.data.tax.push({
        type: 'GST',
        taxPercentage: '0.00',
        taxAmount: json_tax.ieps_total || 0,
        taxCategory: 'TRANSFERIDO'
      })
      respuesta.data.tax.push({
        type: 'VAT',
        taxPercentage: rate_iva_total,
        taxAmount: json_tax.iva_total || 0,
        taxCategory: 'TRANSFERIDO'
      })

      respuesta.data.totalAmount = LookupField['total'] || ''
      respuesta.data.baseAmount = LookupField['total'] || ''
      respuesta.data.payableAmount = LookupField['total'] || ''

      respuesta.data.alternatePartyIdentification = LookupField['customer.custentity_efx_cf_idproveedor'] || ''
      respuesta.data.sellergln = LookupField['customer.custentity_efx_cf_sellergln'] || ''
      respuesta.data.glnInvoiceCreator = LookupField['customer.custentity_efx_cf_sellergln'] || ''

      //respuesta.data.tradeIdentification = LookupField['customer.custentity_efx_cf_tradeidentification'] || '';

      respuesta.data.glnShipTo = LookupField['billingaddress.custrecord_efx_fe_lugar_gln'] || ''
      respuesta.data.glnShipTo_envio = LookupField['shippingaddress.custrecord_efx_fe_lugar_gln'] || ''

      if (LookupField['shippingaddress.custrecord_efx_fe_buyer_gln']) {
        respuesta.data.buyergln = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || ''
      } else {
        respuesta.data.buyergln = LookupField['customer.custentity_efx_cf_buyergln'] || ''
      }

      respuesta.data.orderIdentificationreferenceIdentification = LookupField['otherrefnum'] || ''
      respuesta.data.personOrDepartmentName = LookupField['customer.custentity_efx_cf_buyerperson'] || ''

      respuesta.data.nameShipTo = LookupField['billingaddress.custrecord_efx_fe_lugar_city'] || ''
      respuesta.data.streetAddressOneShipTo = LookupField['billingaddress.custrecord_streetname'] || '' + LookupField['billingaddress.custrecord_streetnum'] || ''
      respuesta.data.cityShipTo = LookupField['billingaddress.city'] || ''
      respuesta.data.postalCodeShipTo = LookupField['billingaddress.zip'] || ''

      respuesta.data.nameShipTo_envio = LookupField['shippingaddress.custrecord_efx_fe_lugar_city'] || ''
      respuesta.data.streetAddressOneShipTo_envio = LookupField['shippingaddress.custrecord_streetname'] || '' + LookupField['shippingaddress.custrecord_streetnum'] || ''
      respuesta.data.cityShipTo_envio = LookupField['shippingaddress.city'] || ''
      respuesta.data.postalCodeShipTo_envio = LookupField['shippingaddress.zip'] || ''

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: ['discounttotal'],
        bodyFieldText: [],
        lineField: ['itemtype', 'item', 'itemTEXT', 'quantity', 'rate', 'custcol_efx_fe_upc_code', 'amount', 'grossamt', 'custitem_efx_cf_tradeidentification']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        var descuento_total_lineas = 0
        for (var ir in transactionField.data.lineField) {
          //buscar descuentos
          var descuento_linea = 0
          var linea_disc = parseInt(ir) + 1
          var tamano_linefield = Object.keys(transactionField.data.lineField).length
          log.audit({ title: 'linea_disc', details: linea_disc })
          log.audit({ title: 'tamano_linefield', details: tamano_linefield })
          if (linea_disc < tamano_linefield) {
            if (transactionField.data.lineField[linea_disc].itemtype == 'Discount') {
              descuento_linea = transactionField.data.lineField[ir].amount
              if (descuento_linea < 0) {
                descuento_linea = descuento_linea * -1
              }
            }
          }
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var rec_transaction = record.load({
              type: param_type,
              id: param_id,
              isDynamic: true
            })

            var json_col = rec_transaction.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_efx_fe_tax_json',
              line: ir
            })

            var tradeidentification = rec_transaction.getSublistText({
              sublistId: 'item',
              fieldId: 'custitem_efx_cf_tradeidentification',
              line: ir
            })
            var json_tax_col = ''
            if (json_col) {
              json_tax_col = JSON.parse(json_col)
            }

            descuento_total_lineas = descuento_total_lineas + descuento_linea
            respuesta.data.item.push({
              name: transactionField.data.lineField[ir].itemTEXT || '',
              sku: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              tradeidentification: tradeidentification || '',
              rate: transactionField.data.lineField[ir].rate || '',
              quantity: transactionField.data.lineField[ir].quantity || '',
              netPrice: transactionField.data.lineField[ir].amount || '',
              discount: descuento_linea,
              taxPercentage: '0',
              taxAmount: '0',
              grossAmount: transactionField.data.lineField[ir].grossamt || '',
              netAmount: transactionField.data.lineField[ir].amount || '',
              iva_rate: json_tax_col.iva.rate.toFixed(4) || 0,
              iva_importe: json_tax_col.iva.importe || 0,
              ieps_rate: json_tax_col.ieps.rate.toFixed(4) || 0,
              ieps_importe: json_tax_col.ieps.importe || 0
            })
          }
        }
        if (transactionField.data.bodyFieldValue.discounttotal) {
          respuesta.data.descuentototal = transactionField.data.bodyFieldValue.discounttotal
        } else {
          respuesta.data.descuentototal = descuento_total_lineas.toFixed(2)
        }
      }

      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getDataCityFresco', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataCityFresco', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlCityFresco(param_obj_CityFresco) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      respuesta.xmlns = ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '

      respuesta.xmlns += ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" '

      var xmlCityFresco = ''
      xmlCityFresco += '<cfdi:Addenda>'
      xmlCityFresco += '    <requestForPayment'
      xmlCityFresco += '        DeliveryDate="' + param_obj_CityFresco.DeliveryDate + '"'
      xmlCityFresco += '        documentStatus="ORIGINAL"'
      xmlCityFresco += '        documentStructureVersion="AMC7.1"'
      xmlCityFresco += '        contentVersion="1.3.1"'
      xmlCityFresco += '        type="SimpleInvoiceType">'
      xmlCityFresco += '        <requestForPaymentIdentification>'
      xmlCityFresco += '            <entityType>INVOICE</entityType>'
      xmlCityFresco += '            <uniqueCreatorIdentification>' + param_obj_CityFresco.folio + '</uniqueCreatorIdentification>'
      xmlCityFresco += '        </requestForPaymentIdentification>'

      for (var i in param_obj_CityFresco.specialInstruction) {
        xmlCityFresco += '        <specialInstruction code="' + param_obj_CityFresco.specialInstruction[i].code + '">'
        xmlCityFresco += '            <text>' + param_obj_CityFresco.specialInstruction[i].text + '</text>'
        xmlCityFresco += '        </specialInstruction>'
      }

      xmlCityFresco += '        <orderIdentification>'
      xmlCityFresco += '            <referenceIdentification type="ON">' + param_obj_CityFresco.orderIdentificationreferenceIdentification + '</referenceIdentification>'
      xmlCityFresco += '            <ReferenceDate>' + param_obj_CityFresco.ReferenceDate + '</ReferenceDate>'
      xmlCityFresco += '        </orderIdentification>'

      xmlCityFresco += '        <AdditionalInformation>'
      xmlCityFresco += '            <referenceIdentification type="ACE">' + param_obj_CityFresco.orderIdentificationreferenceIdentification + '</referenceIdentification>'
      if (param_obj_CityFresco.cedis_envio) {
        xmlCityFresco += '            <referenceIdentification type="DQ">' + param_obj_CityFresco.folio_recibo + '</referenceIdentification>'
      } else {
        xmlCityFresco += '            <referenceIdentification type="DQ">' + param_obj_CityFresco.folio_recibo + '</referenceIdentification>'
      }
      xmlCityFresco += '            <referenceIdentification type="ON">' + param_obj_CityFresco.orderIdentificationreferenceIdentification + '</referenceIdentification>'
      xmlCityFresco += '            <referenceIdentification type="IV">' + param_obj_CityFresco.folio + '</referenceIdentification>'
      xmlCityFresco += '        </AdditionalInformation>'

      //comentar respecto a estos campos
      if (param_obj_CityFresco.folio_recibo && param_obj_CityFresco.ReferenceDate) {
        xmlCityFresco += '        <DeliveryNote>'
        xmlCityFresco += '            <referenceIdentification>' + param_obj_CityFresco.folio_recibo + '</referenceIdentification>'
        xmlCityFresco += '            <ReferenceDate>' + param_obj_CityFresco.ReferenceDate + '</ReferenceDate>'
        xmlCityFresco += '        </DeliveryNote>'
      }

      xmlCityFresco += '        <buyer>'
      xmlCityFresco += '            <gln>' + param_obj_CityFresco.buyergln + '</gln>'
      xmlCityFresco += '            <contactInformation>'
      xmlCityFresco += '                <personOrDepartmentName>'
      xmlCityFresco += '                    <text>' + param_obj_CityFresco.personOrDepartmentName + '</text>'
      xmlCityFresco += '                </personOrDepartmentName>'
      xmlCityFresco += '            </contactInformation>'
      xmlCityFresco += '        </buyer>'

      xmlCityFresco += '        <seller>'
      xmlCityFresco += '            <gln>' + param_obj_CityFresco.sellergln + '</gln>'
      xmlCityFresco +=
        '            <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' +
        param_obj_CityFresco.alternatePartyIdentification +
        '</alternatePartyIdentification>'
      xmlCityFresco += '        </seller>'

      xmlCityFresco += '        <shipTo>'
      if (param_obj_CityFresco.glnShipTo_envio) {
        xmlCityFresco += '            <gln>' + param_obj_CityFresco.glnShipTo_envio + '</gln>'
      } else {
        xmlCityFresco += '            <gln>' + param_obj_CityFresco.glnShipTo + '</gln>'
      }
      xmlCityFresco += '            <nameAndAddress>'
      if (param_obj_CityFresco.nameShipTo_envio) {
        xmlCityFresco += '                <name>' + param_obj_CityFresco.nameShipTo_envio + '</name>'
      } else {
        xmlCityFresco += '                <name>' + param_obj_CityFresco.nameShipTo + '</name>'
      }
      if (param_obj_CityFresco.streetAddressOneShipTo_envio) {
        xmlCityFresco += '                <streetAddressOne>' + param_obj_CityFresco.streetAddressOneShipTo_envio + '</streetAddressOne>'
      } else {
        xmlCityFresco += '                <streetAddressOne>' + param_obj_CityFresco.streetAddressOneShipTo + '</streetAddressOne>'
      }
      if (param_obj_CityFresco.cityShipTo_envio) {
        xmlCityFresco += '                <city>' + param_obj_CityFresco.cityShipTo_envio + '</city>'
      } else {
        xmlCityFresco += '                <city>' + param_obj_CityFresco.cityShipTo + '</city>'
      }
      if (param_obj_CityFresco.postalCodeShipTo_envio) {
        xmlCityFresco += '                <postalCode>' + param_obj_CityFresco.postalCodeShipTo_envio + '</postalCode>'
      } else {
        xmlCityFresco += '                <postalCode>' + param_obj_CityFresco.postalCodeShipTo + '</postalCode>'
      }
      xmlCityFresco += '            </nameAndAddress>'
      xmlCityFresco += '        </shipTo>'

      xmlCityFresco += '        <InvoiceCreator>'
      xmlCityFresco += '            <gln>' + param_obj_CityFresco.glnInvoiceCreator + '</gln>'
      xmlCityFresco +=
        '            <alternatePartyIdentification type="VA">' + param_obj_CityFresco.alternatePartyIdentificationInvoiceCreator + '</alternatePartyIdentification>'
      xmlCityFresco += '            <nameAndAddress>'
      xmlCityFresco += '                <name>' + param_obj_CityFresco.nameInvoiceCreator + '</name>'
      xmlCityFresco += '                <streetAddressOne>' + param_obj_CityFresco.streetAddressOneInvoiceCreator + '</streetAddressOne>'
      xmlCityFresco += '                <city>' + param_obj_CityFresco.cityInvoiceCreator + '</city>'
      xmlCityFresco += '                <postalCode>' + param_obj_CityFresco.postalCodeInvoiceCreator + '</postalCode>'
      xmlCityFresco += '            </nameAndAddress>'
      xmlCityFresco += '        </InvoiceCreator>'

      xmlCityFresco += '        <currency currencyISOCode="' + param_obj_CityFresco.currencyISOCode + '">'
      xmlCityFresco += '            <currencyFunction>BILLING_CURRENCY</currencyFunction>'
      xmlCityFresco += '            <rateOfChange>' + param_obj_CityFresco.rateOfChange + '</rateOfChange>'
      xmlCityFresco += '        </currency>'

      xmlCityFresco += '        <paymentTerms'
      xmlCityFresco += '            paymentTermsEvent="DATE_OF_INVOICE"'
      xmlCityFresco += '            PaymentTermsRelationTime="REFERENCE_AFTER">'
      xmlCityFresco += '            <netPayment netPaymentTermsType="BASIC_NET">'
      xmlCityFresco += '                <paymentTimePeriod>'
      xmlCityFresco += '                    <timePeriodDue timePeriod="DAYS">'
      if (param_obj_CityFresco.terminos) {
        var terminoscfk = param_obj_CityFresco.terminos[0].text.split(' ')
        xmlCityFresco += '                        <value>' + terminoscfk[0] + '</value>'
      } else {
        xmlCityFresco += '                        <value></value>'
      }

      xmlCityFresco += '                    </timePeriodDue>'
      xmlCityFresco += '                </paymentTimePeriod>'
      xmlCityFresco += '            </netPayment>'
      xmlCityFresco += '        </paymentTerms>'

      xmlCityFresco += '        <allowanceCharge'
      xmlCityFresco += '            settlementType="BILL_BACK"'
      xmlCityFresco += '            allowanceChargeType="ALLOWANCE_GLOBAL">'
      xmlCityFresco += '            <specialServicesType>AJ</specialServicesType>'
      xmlCityFresco += '            <monetaryAmountOrPercentage>'
      xmlCityFresco += '                <rate base="INVOICE_VALUE">'
      xmlCityFresco += '                    <percentage>' + param_obj_CityFresco.monetaryAmountOrPercentage + '</percentage>'
      xmlCityFresco += '                </rate>'
      xmlCityFresco += '            </monetaryAmountOrPercentage>'
      xmlCityFresco += '        </allowanceCharge>'

      var itemNum = 0
      for (var itemi in param_obj_CityFresco.item) {
        itemNum++
        xmlCityFresco += '        <lineItem type="SimpleInvoiceLineItemType" number="' + itemNum + '">'
        xmlCityFresco += '            <tradeItemIdentification>'
        xmlCityFresco += '                <gtin>' + param_obj_CityFresco.item[itemi].sku + '</gtin>'
        xmlCityFresco += '            </tradeItemIdentification>'
        xmlCityFresco +=
          '            <alternateTradeItemIdentification type="' +
          param_obj_CityFresco.item[itemi].tradeidentification +
          '">' +
          param_obj_CityFresco.item[itemi].sku +
          '</alternateTradeItemIdentification>'

        xmlCityFresco += '            <tradeItemDescriptionInformation language="ES">'
        xmlCityFresco += '                <longText>' + xml.escape({ xmlText: param_obj_CityFresco.item[itemi].name }) + '</longText>'
        xmlCityFresco += '            </tradeItemDescriptionInformation>'
        if (param_obj_CityFresco.item[itemi].tradeidentification == 'BUYER_ASSIGNED') {
          xmlCityFresco += '            <invoicedQuantity unitOfMeasure="PZA">' + param_obj_CityFresco.item[itemi].quantity + '.000</invoicedQuantity>'
        } else {
          xmlCityFresco += '            <invoicedQuantity unitOfMeasure="CA">' + param_obj_CityFresco.item[itemi].quantity + '.000</invoicedQuantity>'
          xmlCityFresco += '            <aditionalQuantity QuantityType="NUM_CONSUMER_UNITS">' + param_obj_CityFresco.item[itemi].quantity + '</aditionalQuantity>'
        }

        xmlCityFresco += '            <grossPrice>'
        xmlCityFresco += '                <Amount>' + param_obj_CityFresco.item[itemi].rate + '</Amount>'
        xmlCityFresco += '            </grossPrice>'
        xmlCityFresco += '            <netPrice>'
        xmlCityFresco += '                <Amount>' + param_obj_CityFresco.item[itemi].rate + '</Amount>'
        xmlCityFresco += '            </netPrice>'
        xmlCityFresco += '            <AdditionalInformation>'
        xmlCityFresco += '                <referenceIdentification type="ON">' + param_obj_CityFresco.orderIdentificationreferenceIdentification + '</referenceIdentification>'
        xmlCityFresco += '            </AdditionalInformation>'
        xmlCityFresco += '            <tradeItemTaxInformation>'
        xmlCityFresco += '                <taxTypeDescription>VAT</taxTypeDescription>'
        xmlCityFresco += '                <referenceNumber>IVA</referenceNumber>'
        xmlCityFresco += '                <tradeItemTaxAmount>'
        xmlCityFresco += '                    <taxPercentage>' + param_obj_CityFresco.item[itemi].iva_rate + '</taxPercentage>'
        xmlCityFresco += '                    <taxAmount>' + param_obj_CityFresco.item[itemi].iva_importe + '</taxAmount>'
        xmlCityFresco += '                </tradeItemTaxAmount>'
        xmlCityFresco += '                <taxCategory>TRANSFERIDO</taxCategory>'
        xmlCityFresco += '            </tradeItemTaxInformation>'
        xmlCityFresco += '            <tradeItemTaxInformation>'
        xmlCityFresco += '                <taxTypeDescription>GST</taxTypeDescription>'
        xmlCityFresco += '                <referenceNumber>IEPS</referenceNumber>'
        xmlCityFresco += '                <tradeItemTaxAmount>'
        xmlCityFresco += '                    <taxPercentage>' + param_obj_CityFresco.item[itemi].ieps_rate + '</taxPercentage>'
        xmlCityFresco += '                    <taxAmount>' + param_obj_CityFresco.item[itemi].ieps_importe + '</taxAmount>'
        xmlCityFresco += '                </tradeItemTaxAmount>'
        xmlCityFresco += '                <taxCategory>TRANSFERIDO</taxCategory>'
        xmlCityFresco += '            </tradeItemTaxInformation>'
        xmlCityFresco += '            <totalLineAmount>'
        xmlCityFresco += '                <grossAmount>'
        xmlCityFresco += '                    <Amount>' + param_obj_CityFresco.item[itemi].grossAmount + '</Amount>'
        xmlCityFresco += '                </grossAmount>'
        xmlCityFresco += '                <netAmount>'
        xmlCityFresco += '                    <Amount>' + param_obj_CityFresco.item[itemi].netAmount + '</Amount>'
        xmlCityFresco += '                </netAmount>'
        xmlCityFresco += '            </totalLineAmount>'
        xmlCityFresco += '        </lineItem>'
      }

      xmlCityFresco += '        <totalAmount>'
      xmlCityFresco += '            <Amount>' + param_obj_CityFresco.totalAmount + '</Amount>'
      xmlCityFresco += '        </totalAmount>'
      if (param_obj_CityFresco.item[itemi].tradeidentification == 'BUYER_ASSIGNED') {
        xmlCityFresco += '        <TotalAllowanceCharge allowanceOrChargeType="ALLOWANCE">'
        xmlCityFresco += '            <Amount>' + 0.0 + '</Amount>'
        xmlCityFresco += '        </TotalAllowanceCharge>'
      } else {
      }
      xmlCityFresco += '        <baseAmount>'
      xmlCityFresco += '            <Amount>' + param_obj_CityFresco.baseAmount + '</Amount>'
      xmlCityFresco += '        </baseAmount>'

      for (var taxi in param_obj_CityFresco.tax) {
        xmlCityFresco += '        <tax type="' + param_obj_CityFresco.tax[taxi].type + '">'
        xmlCityFresco += '            <taxPercentage>' + param_obj_CityFresco.tax[taxi].taxPercentage + '</taxPercentage>'
        xmlCityFresco += '            <taxAmount>' + param_obj_CityFresco.tax[taxi].taxAmount + '</taxAmount>'
        xmlCityFresco += '            <taxCategory>' + param_obj_CityFresco.tax[taxi].taxCategory + '</taxCategory>'
        xmlCityFresco += '        </tax>'
      }

      xmlCityFresco += '        <payableAmount>'
      xmlCityFresco += '            <Amount>' + param_obj_CityFresco.payableAmount + '</Amount>'
      xmlCityFresco += '        </payableAmount>'

      xmlCityFresco += '    </requestForPayment>'
      xmlCityFresco += '</cfdi:Addenda>'
      respuesta.data = xmlCityFresco
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlCityFresco', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlCityFresco', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataComercialCityFresco(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        serie: '',
        folio: '',
        DeliveryDate: '',
        ReferenceDate: '',
        orderIdentificationreferenceIdentification: '',
        specialInstruction: [],
        buyergln: '',
        sellergln: '',
        personOrDepartmentName: '',
        alternatePartyIdentification: '',
        glnShipTo: '',

        nameShipTo: '',
        streetAddressOneShipTo: '',
        cityShipTo: '',
        postalCodeShipTo: '',
        ColoniaShipTo: '',

        glnInvoiceCreator: '',

        alternatePartyIdentificationInvoiceCreator: '',
        nameInvoiceCreator: '',
        streetAddressOneInvoiceCreator: '',
        cityInvoiceCreator: '',
        postalCodeInvoiceCreator: '',

        item: [],

        tax: [],
        totalAmount: '',
        descuentototal: 0,
        baseAmount: '',
        payableAmount: '',

        currencyISOCode: 'MXN',
        rateOfChange: '1',
        monetaryAmountOrPercentage: '0.00'
      }
    }

    var arrayColumn = [
      'trandate',
      'custbody_efx_cf_fechaordencompra',
      'custbody_efx_fe_tax_json',
      'otherrefnum',
      'custbody_efx_fe_fecha_recibo',
      'tranid',
      'total',
      'terms',

      'customer.custentity_efx_cf_buyerperson',
      'customer.custentity_efx_cf_buyergln',
      'customer.custentity_efx_cf_idproveedor',
      'customer.custentity_efx_cf_sellergln',
      //'customer.custentity_efx_cf_tradeidentification',

      'custbody_efx_fe_total_text',
      'custbody_efx_fe_folio_cfresko',

      'billingaddress.address1',
      'billingaddress.addressee',
      'billingaddress.city',
      'billingaddress.zip',
      'billingaddress.custrecord_efx_fe_lugar_city',
      'billingaddress.custrecord_efx_fe_lugar_gln',
      'billingaddress.custrecord_efx_fe_cedis_cfresko',
      'billingaddress.custrecord_streetname',
      'billingaddress.custrecord_streetnum',
      'billingaddress.custrecord_colonia',
      'billingaddress.custrecord_village',
      'billingaddress.state',
      'billingaddress.country',

      'shippingaddress.address1',
      'shippingaddress.addressee',
      'shippingaddress.city',
      'shippingaddress.zip',
      'shippingaddress.custrecord_efx_fe_lugar_city',
      'shippingaddress.custrecord_efx_fe_lugar_gln',
      'shippingaddress.custrecord_efx_fe_cedis_cfresko',
      'shippingaddress.custrecord_streetname',
      'shippingaddress.custrecord_streetnum',
      'shippingaddress.custrecord_colonia',
      'shippingaddress.custrecord_village',
      'shippingaddress.state',
      'shippingaddress.country',
      'shippingaddress.custrecord_efx_fe_buyer_gln'
    ]

    var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' })
    var LOCATIONS = runtime.isFeatureInEffect({ feature: 'LOCATIONS' })

    if (SUBSIDIARIES) {
      arrayColumn.push('subsidiary')
    }
    if (LOCATIONS) {
      arrayColumn.push('location')
    }
    try {
      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })
      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      {
        //
        if (SUBSIDIARIES && LookupField.subsidiary) {
          var resultSub = record.load({
            type: search.Type.SUBSIDIARY,
            id: LookupField.subsidiary[0].value
          })

          respuesta.data.alternatePartyIdentificationInvoiceCreator = resultSub.getValue({ fieldId: 'federalidnumber' }) || '' // 'NFM0910317L6',
          respuesta.data.nameInvoiceCreator = resultSub.getValue({ fieldId: 'legalname' }) || '' // 'NUTRITION FACT DE MEXICO SA DE CV',
          var mainaddressOBJ = resultSub.getSubrecord({ fieldId: 'mainaddress' })
          respuesta.data.streetAddressOneInvoiceCreator =
            mainaddressOBJ.getValue({ fieldId: 'custrecord_streetname' }) || '' + mainaddressOBJ.getValue({ fieldId: 'custrecord_streetnum' }) || '' //
          respuesta.data.cityInvoiceCreator = mainaddressOBJ.getText({ fieldId: 'city' }) || '' // 'AZCAPOTZALCO',
          respuesta.data.postalCodeInvoiceCreator = mainaddressOBJ.getValue({ fieldId: 'zip' }) || '' // '02410',
        } else if (!SUBSIDIARIES) {
          var configRecObj = config.load({
            type: config.Type.COMPANY_INFORMATION
          })

          respuesta.data.alternatePartyIdentificationInvoiceCreator = configRecObj.getValue({ fieldId: 'employerid' }) || ''
          respuesta.data.nameInvoiceCreator = configRecObj.getValue({ fieldId: 'legalname' }) || ''
          var mainaddressOBJ = configRecObj.getSubrecord({ fieldId: 'mainaddress' })
          respuesta.data.streetAddressOneInvoiceCreator =
            mainaddressOBJ.getValue({ fieldId: 'custrecord_streetname' }) || '' + mainaddressOBJ.getValue({ fieldId: 'custrecord_streetnum' }) || '' //;
          respuesta.data.cityInvoiceCreator = mainaddressOBJ.getText({ fieldId: 'city' }) || ''
          respuesta.data.postalCodeInvoiceCreator = mainaddressOBJ.getValue({ fieldId: 'zip' }) || ''
        }
        //
      }
      var horaMexico = horaActual()

      if (LookupField['custbody_efx_fe_fecha_recibo']) {
        // respuesta.data.ReferenceDate = fechaSplit(LookupField['custbody_efx_cf_fechaordencompra'], '/', '-', 0, 1, 2, 'T' + horaMexico);
        respuesta.data.ReferenceDate = fechaSplit(LookupField['custbody_efx_fe_fecha_recibo'], '/', '-', 0, 1, 2, '')
      }

      if (LookupField['custbody_efx_cf_fechaordencompra']) {
        // respuesta.data.DeliveryDate = fechaSplit(LookupField['trandate'], '/', '-', 0, 1, 2, 'T' + horaMexico);
        respuesta.data.DeliveryDate = fechaSplit(LookupField['custbody_efx_cf_fechaordencompra'], '/', '-', 0, 1, 2, '')
      }

      respuesta.data.folio = LookupField['tranid'] || ''
      respuesta.data.cedis = LookupField['billingaddress.custrecord_efx_fe_cedis_cfresko'] || ''
      respuesta.data.cedis_envio = LookupField['shippingaddress.custrecord_efx_fe_cedis_cfresko'] || ''
      respuesta.data.terminos = LookupField['terms'] || ''
      respuesta.data.folio_recibo = LookupField['custbody_efx_fe_folio_cfresko'] || ''
      respuesta.data.serie = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_serie_invoice' }) || ''

      var json_tax = ''
      if (LookupField['custbody_efx_fe_tax_json']) {
        json_tax = JSON.parse(LookupField['custbody_efx_fe_tax_json'])
        respuesta.data.iva = json_tax.iva_total
        respuesta.data.ieps = json_tax.ieps_total
        if (json_tax.rates_ieps) {
        }
        if (json_tax.rates_iva) {
          var rate_iva_total = '0.00'
          var rate_iva_total_num = 0
          for (var i = 0; i < Object.keys(json_tax.rates_iva).length; i++) {
            var rates_obj_iva = Object.keys(json_tax.rates_iva)[i]
            var rate_split = rates_obj_iva.split(' ')
            var rate_num = rate_split[1].replace('%', '')
            var rate_iva = parseFloat(rate_num)
            rate_iva_total_num = rate_iva_total_num + rate_iva
          }
          rate_iva_total = rate_iva_total_num.toFixed(4)
        }
      }

      respuesta.data.specialInstruction.push({
        code: 'ZZZ',
        text: LookupField['custbody_efx_fe_total_text'] || ''
      })
      // respuesta.data.specialInstruction.push({code: 'AAB', text: 'PAGO A 45 DIAS'});
      // respuesta.data.specialInstruction.push({code: 'PUR', text: 'PAGO GENERA DESCUENTO'});

      respuesta.data.tax.push({
        type: 'GST',
        taxPercentage: '0.00',
        taxAmount: json_tax.ieps_total || 0,
        taxCategory: 'TRANSFERIDO'
      })
      respuesta.data.tax.push({
        type: 'VAT',
        taxPercentage: rate_iva_total,
        taxAmount: json_tax.iva_total || 0,
        taxCategory: 'TRANSFERIDO'
      })

      respuesta.data.totalAmount = LookupField['total'] || ''
      respuesta.data.baseAmount = LookupField['total'] || ''
      respuesta.data.payableAmount = LookupField['total'] || ''

      respuesta.data.alternatePartyIdentification = LookupField['customer.custentity_efx_cf_idproveedor'] || ''
      respuesta.data.sellergln = LookupField['customer.custentity_efx_cf_sellergln'] || ''
      respuesta.data.glnInvoiceCreator = LookupField['customer.custentity_efx_cf_sellergln'] || ''

      //respuesta.data.tradeIdentification = LookupField['customer.custentity_efx_cf_tradeidentification'] || '';

      respuesta.data.glnShipTo = LookupField['billingaddress.custrecord_efx_fe_lugar_gln'] || ''
      respuesta.data.glnShipTo_envio = LookupField['shippingaddress.custrecord_efx_fe_lugar_gln'] || ''

      if (LookupField['shippingaddress.custrecord_efx_fe_buyer_gln']) {
        respuesta.data.buyergln = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || ''
      } else {
        respuesta.data.buyergln = LookupField['customer.custentity_efx_cf_buyergln'] || ''
      }

      respuesta.data.orderIdentificationreferenceIdentification = LookupField['otherrefnum'] || ''
      respuesta.data.personOrDepartmentName = LookupField['customer.custentity_efx_cf_buyerperson'] || ''

      respuesta.data.nameShipTo = LookupField['billingaddress.addressee'] || ''
      respuesta.data.streetAddressOneShipTo = LookupField['billingaddress.custrecord_streetname'] || '' + LookupField['billingaddress.custrecord_streetnum'] || ''
      respuesta.data.cityShipTo = LookupField['billingaddress.city'] || ''
      respuesta.data.postalCodeShipTo = LookupField['billingaddress.zip'] || ''
      respuesta.data.colonia = LookupField['billingaddress.custrecord_colonia'] || ''
      respuesta.data.municipio = LookupField['billingaddress.custrecord_village'] || ''
      respuesta.data.estado = LookupField['billingaddress.state'] || ''
      if (LookupField['billingaddress.country']) {
        respuesta.data.pais = LookupField['billingaddress.country'][0].text || ''
      }

      respuesta.data.nameShipTo_envio = LookupField['shippingaddress.custrecord_efx_fe_lugar_city'] || ''
      respuesta.data.streetAddressOneShipTo_envio = LookupField['shippingaddress.custrecord_streetname'] || '' + LookupField['shippingaddress.custrecord_streetnum'] || ''
      respuesta.data.cityShipTo_envio = LookupField['shippingaddress.city'] || ''
      respuesta.data.postalCodeShipTo_envio = LookupField['shippingaddress.zip'] || ''
      respuesta.data.colonia_envio = LookupField['shippingaddress.custrecord_colonia'] || ''
      respuesta.data.municipio_envio = LookupField['shippingaddress.custrecord_village'] || ''
      respuesta.data.estado_envio = LookupField['shippingaddress.state'] || ''
      if (LookupField['billingaddress.country']) {
        respuesta.data.pais_envio = LookupField['shippingaddress.country'][0].text || ''
      }

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: ['discounttotal'],
        bodyFieldText: [],
        lineField: ['itemtype', 'item', 'itemTEXT', 'quantity', 'rate', 'custcol_efx_fe_upc_code', 'amount', 'grossamt', 'custitem_efx_cf_tradeidentification']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        var descuento_total_lineas = 0
        for (var ir in transactionField.data.lineField) {
          //buscar descuentos
          var descuento_linea = 0
          var linea_disc = parseInt(ir) + 1
          var tamano_linefield = Object.keys(transactionField.data.lineField).length
          log.audit({ title: 'linea_disc', details: linea_disc })
          log.audit({ title: 'tamano_linefield', details: tamano_linefield })
          if (linea_disc < tamano_linefield) {
            if (transactionField.data.lineField[linea_disc].itemtype == 'Discount') {
              descuento_linea = transactionField.data.lineField[ir].amount
              if (descuento_linea < 0) {
                descuento_linea = descuento_linea * -1
              }
            }
          }
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var rec_transaction = record.load({
              type: param_type,
              id: param_id,
              isDynamic: true
            })

            var json_col = rec_transaction.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_efx_fe_tax_json',
              line: ir
            })

            var tradeidentification = rec_transaction.getSublistText({
              sublistId: 'item',
              fieldId: 'custitem_efx_cf_tradeidentification',
              line: ir
            })
            var json_tax_col = ''
            if (json_col) {
              json_tax_col = JSON.parse(json_col)
            }

            descuento_total_lineas = descuento_total_lineas + descuento_linea
            respuesta.data.item.push({
              name: transactionField.data.lineField[ir].itemTEXT || '',
              sku: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              tradeidentification: tradeidentification || '',
              rate: transactionField.data.lineField[ir].rate || '',
              quantity: transactionField.data.lineField[ir].quantity || '',
              netPrice: transactionField.data.lineField[ir].amount || '',
              discount: descuento_linea,
              taxPercentage: '0',
              taxAmount: '0',
              grossAmount: transactionField.data.lineField[ir].grossamt || '',
              netAmount: transactionField.data.lineField[ir].amount || '',
              iva_rate: json_tax_col.iva.rate.toFixed(4) || 0,
              iva_importe: json_tax_col.iva.importe || 0,
              ieps_rate: json_tax_col.ieps.rate.toFixed(4) || 0,
              ieps_importe: json_tax_col.ieps.importe || 0
            })
          }
        }
        if (transactionField.data.bodyFieldValue.discounttotal) {
          respuesta.data.descuentototal = transactionField.data.bodyFieldValue.discounttotal
        } else {
          respuesta.data.descuentototal = descuento_total_lineas.toFixed(2)
        }
      }

      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getDataCityFresco', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataCityFresco', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlComercialCityFresco(param_obj_CityFresco) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      respuesta.xmlns = ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '

      respuesta.xmlns += ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" '

      var xmlCityFresco = ''
      xmlCityFresco += '<cfdi:Addenda>'
      xmlCityFresco += '    <requestForPayment'
      xmlCityFresco += '        DeliveryDate="' + param_obj_CityFresco.DeliveryDate + '"'
      xmlCityFresco += '        documentStatus="ORIGINAL"'
      xmlCityFresco += '        documentStructureVersion="AMC7.1"'
      xmlCityFresco += '        contentVersion="1.3.1"'
      xmlCityFresco += '        type="SimpleInvoiceType">'
      xmlCityFresco += '        <requestForPaymentIdentification>'
      xmlCityFresco += '            <entityType>INVOICE</entityType>'
      xmlCityFresco += '            <uniqueCreatorIdentification>' + param_obj_CityFresco.folio + '</uniqueCreatorIdentification>'
      xmlCityFresco += '        </requestForPaymentIdentification>'

      for (var i in param_obj_CityFresco.specialInstruction) {
        xmlCityFresco += '        <specialInstruction code="' + param_obj_CityFresco.specialInstruction[i].code + '">'
        xmlCityFresco += '            <text>' + param_obj_CityFresco.specialInstruction[i].text + '</text>'
        xmlCityFresco += '        </specialInstruction>'
      }

      xmlCityFresco += '        <orderIdentification>'
      xmlCityFresco += '            <referenceIdentification type="ON">' + param_obj_CityFresco.orderIdentificationreferenceIdentification + '</referenceIdentification>'
      xmlCityFresco += '            <ReferenceDate>' + param_obj_CityFresco.ReferenceDate + '</ReferenceDate>'
      xmlCityFresco += '        </orderIdentification>'

      xmlCityFresco += '        <AdditionalInformation>'
      xmlCityFresco += '            <referenceIdentification type="ACE">' + param_obj_CityFresco.orderIdentificationreferenceIdentification + '</referenceIdentification>'
      if (param_obj_CityFresco.cedis_envio) {
        xmlCityFresco += '            <referenceIdentification type="DQ">' + param_obj_CityFresco.folio_recibo + '</referenceIdentification>'
      } else {
        xmlCityFresco += '            <referenceIdentification type="DQ">' + param_obj_CityFresco.folio_recibo + '</referenceIdentification>'
      }
      xmlCityFresco += '            <referenceIdentification type="ON">' + param_obj_CityFresco.orderIdentificationreferenceIdentification + '</referenceIdentification>'
      xmlCityFresco += '            <referenceIdentification type="IV">' + param_obj_CityFresco.folio + '</referenceIdentification>'
      xmlCityFresco += '        </AdditionalInformation>'

      //comentar respecto a estos campos
      if (param_obj_CityFresco.folio_recibo && param_obj_CityFresco.ReferenceDate) {
        xmlCityFresco += '        <DeliveryNote>'
        xmlCityFresco += '            <referenceIdentification>' + param_obj_CityFresco.folio_recibo + '</referenceIdentification>'
        xmlCityFresco += '            <ReferenceDate>' + param_obj_CityFresco.ReferenceDate + '</ReferenceDate>'
        xmlCityFresco += '        </DeliveryNote>'
      }

      xmlCityFresco += '        <buyer>'
      xmlCityFresco += '            <gln>' + param_obj_CityFresco.buyergln + '</gln>'
      xmlCityFresco += '            <contactInformation>'
      xmlCityFresco += '                <personOrDepartmentName>'
      xmlCityFresco += '                    <text>' + param_obj_CityFresco.personOrDepartmentName + '</text>'
      xmlCityFresco += '                </personOrDepartmentName>'
      xmlCityFresco += '            </contactInformation>'
      xmlCityFresco += '        </buyer>'

      xmlCityFresco += '        <seller>'
      xmlCityFresco += '            <gln>' + param_obj_CityFresco.sellergln + '</gln>'
      xmlCityFresco +=
        '            <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' +
        param_obj_CityFresco.alternatePartyIdentification +
        '</alternatePartyIdentification>'
      xmlCityFresco += '        </seller>'

      xmlCityFresco += '        <shipTo>'
      if (param_obj_CityFresco.glnShipTo_envio) {
        xmlCityFresco += '            <gln>' + param_obj_CityFresco.glnShipTo_envio + '</gln>'
      } else {
        xmlCityFresco += '            <gln>' + param_obj_CityFresco.glnShipTo + '</gln>'
      }
      xmlCityFresco += '            <nameAndAddress>'
      if (param_obj_CityFresco.nameShipTo_envio) {
        xmlCityFresco += '                <name>' + param_obj_CityFresco.nameShipTo_envio + '</name>'
      } else {
        xmlCityFresco += '                <name>' + param_obj_CityFresco.nameShipTo + '</name>'
      }
      if (param_obj_CityFresco.streetAddressOneShipTo_envio) {
        xmlCityFresco += '                <streetAddressOne>' + param_obj_CityFresco.streetAddressOneShipTo_envio + '</streetAddressOne>'
      } else {
        xmlCityFresco += '                <streetAddressOne>' + param_obj_CityFresco.streetAddressOneShipTo + '</streetAddressOne>'
      }
      if (param_obj_CityFresco.cityShipTo_envio) {
        xmlCityFresco += '                <city>' + param_obj_CityFresco.cityShipTo_envio + '</city>'
      } else {
        xmlCityFresco += '                <city>' + param_obj_CityFresco.cityShipTo + '</city>'
      }
      if (param_obj_CityFresco.postalCodeShipTo_envio) {
        xmlCityFresco += '                <postalCode>' + param_obj_CityFresco.postalCodeShipTo_envio + '</postalCode>'
      } else {
        xmlCityFresco += '                <postalCode>' + param_obj_CityFresco.postalCodeShipTo + '</postalCode>'
      }
      xmlCityFresco += '            </nameAndAddress>'
      xmlCityFresco += '        </shipTo>'

      xmlCityFresco += '        <InvoiceCreator>'
      xmlCityFresco += '            <gln>' + param_obj_CityFresco.glnInvoiceCreator + '</gln>'
      xmlCityFresco +=
        '            <alternatePartyIdentification type="VA">' + param_obj_CityFresco.alternatePartyIdentificationInvoiceCreator + '</alternatePartyIdentification>'
      xmlCityFresco += '            <nameAndAddress>'
      xmlCityFresco += '                <name>' + param_obj_CityFresco.nameInvoiceCreator + '</name>'
      xmlCityFresco += '                <streetAddressOne>' + param_obj_CityFresco.streetAddressOneInvoiceCreator + '</streetAddressOne>'
      xmlCityFresco += '                <city>' + param_obj_CityFresco.cityInvoiceCreator + '</city>'
      xmlCityFresco += '                <postalCode>' + param_obj_CityFresco.postalCodeInvoiceCreator + '</postalCode>'
      xmlCityFresco += '            </nameAndAddress>'
      xmlCityFresco += '        </InvoiceCreator>'

      xmlCityFresco += '        <currency currencyISOCode="' + param_obj_CityFresco.currencyISOCode + '">'
      xmlCityFresco += '            <currencyFunction>BILLING_CURRENCY</currencyFunction>'
      xmlCityFresco += '            <rateOfChange>' + param_obj_CityFresco.rateOfChange + '</rateOfChange>'
      xmlCityFresco += '        </currency>'

      xmlCityFresco += '        <paymentTerms'
      xmlCityFresco += '            paymentTermsEvent="DATE_OF_INVOICE"'
      xmlCityFresco += '            PaymentTermsRelationTime="REFERENCE_AFTER">'
      xmlCityFresco += '            <netPayment netPaymentTermsType="BASIC_NET">'
      xmlCityFresco += '                <paymentTimePeriod>'
      xmlCityFresco += '                    <timePeriodDue timePeriod="DAYS">'
      if (param_obj_CityFresco.terminos) {
        var terminoscfk = param_obj_CityFresco.terminos[0].text.split(' ')
        xmlCityFresco += '                        <value>' + terminoscfk[0] + '</value>'
      } else {
        xmlCityFresco += '                        <value></value>'
      }

      xmlCityFresco += '                    </timePeriodDue>'
      xmlCityFresco += '                </paymentTimePeriod>'
      xmlCityFresco += '            </netPayment>'
      xmlCityFresco += '        </paymentTerms>'

      xmlCityFresco += '        <allowanceCharge'
      xmlCityFresco += '            settlementType="BILL_BACK"'
      xmlCityFresco += '            allowanceChargeType="ALLOWANCE_GLOBAL">'
      xmlCityFresco += '            <specialServicesType>AJ</specialServicesType>'
      xmlCityFresco += '            <monetaryAmountOrPercentage>'
      xmlCityFresco += '                <rate base="INVOICE_VALUE">'
      xmlCityFresco += '                    <percentage>' + param_obj_CityFresco.monetaryAmountOrPercentage + '</percentage>'
      xmlCityFresco += '                </rate>'
      xmlCityFresco += '            </monetaryAmountOrPercentage>'
      xmlCityFresco += '        </allowanceCharge>'

      var itemNum = 0
      for (var itemi in param_obj_CityFresco.item) {
        itemNum++
        xmlCityFresco += '        <lineItem type="SimpleInvoiceLineItemType" number="' + itemNum + '">'
        xmlCityFresco += '            <tradeItemIdentification>'
        xmlCityFresco += '                <gtin>' + param_obj_CityFresco.item[itemi].sku + '</gtin>'
        xmlCityFresco += '            </tradeItemIdentification>'
        xmlCityFresco +=
          '            <alternateTradeItemIdentification type="' +
          param_obj_CityFresco.item[itemi].tradeidentification +
          '">' +
          param_obj_CityFresco.item[itemi].sku +
          '</alternateTradeItemIdentification>'

        xmlCityFresco += '            <tradeItemDescriptionInformation language="ES">'
        xmlCityFresco += '                <longText>' + xml.escape({ xmlText: param_obj_CityFresco.item[itemi].name }) + '</longText>'
        xmlCityFresco += '            </tradeItemDescriptionInformation>'
        if (param_obj_CityFresco.item[itemi].tradeidentification == 'BUYER_ASSIGNED') {
          xmlCityFresco += '            <invoicedQuantity unitOfMeasure="PZA">' + param_obj_CityFresco.item[itemi].quantity + '.000</invoicedQuantity>'
        } else {
          xmlCityFresco += '            <invoicedQuantity unitOfMeasure="CA">' + param_obj_CityFresco.item[itemi].quantity + '.000</invoicedQuantity>'
          xmlCityFresco += '            <aditionalQuantity QuantityType="NUM_CONSUMER_UNITS">' + param_obj_CityFresco.item[itemi].quantity + '</aditionalQuantity>'
        }

        xmlCityFresco += '            <grossPrice>'
        xmlCityFresco += '                <Amount>' + param_obj_CityFresco.item[itemi].rate + '</Amount>'
        xmlCityFresco += '            </grossPrice>'
        xmlCityFresco += '            <netPrice>'
        xmlCityFresco += '                <Amount>' + param_obj_CityFresco.item[itemi].rate + '</Amount>'
        xmlCityFresco += '            </netPrice>'
        xmlCityFresco += '            <AdditionalInformation>'
        xmlCityFresco += '                <referenceIdentification type="ON">' + param_obj_CityFresco.orderIdentificationreferenceIdentification + '</referenceIdentification>'
        xmlCityFresco += '            </AdditionalInformation>'
        xmlCityFresco += '            <tradeItemTaxInformation>'
        xmlCityFresco += '                <taxTypeDescription>VAT</taxTypeDescription>'
        xmlCityFresco += '                <referenceNumber>IVA</referenceNumber>'
        xmlCityFresco += '                <tradeItemTaxAmount>'
        xmlCityFresco += '                    <taxPercentage>' + param_obj_CityFresco.item[itemi].iva_rate + '</taxPercentage>'
        xmlCityFresco += '                    <taxAmount>' + param_obj_CityFresco.item[itemi].iva_importe + '</taxAmount>'
        xmlCityFresco += '                </tradeItemTaxAmount>'
        xmlCityFresco += '                <taxCategory>TRANSFERIDO</taxCategory>'
        xmlCityFresco += '            </tradeItemTaxInformation>'
        xmlCityFresco += '            <tradeItemTaxInformation>'
        xmlCityFresco += '                <taxTypeDescription>GST</taxTypeDescription>'
        xmlCityFresco += '                <referenceNumber>IEPS</referenceNumber>'
        xmlCityFresco += '                <tradeItemTaxAmount>'
        xmlCityFresco += '                    <taxPercentage>' + param_obj_CityFresco.item[itemi].ieps_rate + '</taxPercentage>'
        xmlCityFresco += '                    <taxAmount>' + param_obj_CityFresco.item[itemi].ieps_importe + '</taxAmount>'
        xmlCityFresco += '                </tradeItemTaxAmount>'
        xmlCityFresco += '                <taxCategory>TRANSFERIDO</taxCategory>'
        xmlCityFresco += '            </tradeItemTaxInformation>'
        xmlCityFresco += '            <totalLineAmount>'
        xmlCityFresco += '                <grossAmount>'
        xmlCityFresco += '                    <Amount>' + param_obj_CityFresco.item[itemi].grossAmount + '</Amount>'
        xmlCityFresco += '                </grossAmount>'
        xmlCityFresco += '                <netAmount>'
        xmlCityFresco += '                    <Amount>' + param_obj_CityFresco.item[itemi].netAmount + '</Amount>'
        xmlCityFresco += '                </netAmount>'
        xmlCityFresco += '            </totalLineAmount>'
        xmlCityFresco += '        </lineItem>'
      }

      xmlCityFresco += '        <totalAmount>'
      xmlCityFresco += '            <Amount>' + param_obj_CityFresco.totalAmount + '</Amount>'
      xmlCityFresco += '        </totalAmount>'
      if (param_obj_CityFresco.item[itemi].tradeidentification == 'BUYER_ASSIGNED') {
        xmlCityFresco += '        <TotalAllowanceCharge allowanceOrChargeType="ALLOWANCE">'
        xmlCityFresco += '            <Amount>' + 0.0 + '</Amount>'
        xmlCityFresco += '        </TotalAllowanceCharge>'
      } else {
      }
      xmlCityFresco += '        <baseAmount>'
      xmlCityFresco += '            <Amount>' + param_obj_CityFresco.baseAmount + '</Amount>'
      xmlCityFresco += '        </baseAmount>'

      for (var taxi in param_obj_CityFresco.tax) {
        xmlCityFresco += '        <tax type="' + param_obj_CityFresco.tax[taxi].type + '">'
        xmlCityFresco += '            <taxPercentage>' + param_obj_CityFresco.tax[taxi].taxPercentage + '</taxPercentage>'
        xmlCityFresco += '            <taxAmount>' + param_obj_CityFresco.tax[taxi].taxAmount + '</taxAmount>'
        xmlCityFresco += '            <taxCategory>' + param_obj_CityFresco.tax[taxi].taxCategory + '</taxCategory>'
        xmlCityFresco += '        </tax>'
      }

      xmlCityFresco += '        <payableAmount>'
      xmlCityFresco += '            <Amount>' + param_obj_CityFresco.payableAmount + '</Amount>'
      xmlCityFresco += '        </payableAmount>'

      xmlCityFresco += '    </requestForPayment>'
      xmlCityFresco += '</cfdi:Addenda>'
      respuesta.data = JSON.stringify(param_obj_CityFresco)
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlCityFresco', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlCityFresco', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataLiverpool(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        currencyISOCode: 'MXN',
        terminosLiver: '',
        glnshipToLiver_envio: '',
        glnshipToLiver: '',

        nameshipToLiver_envio: '',
        nameshipToLiver: '',

        streetshipToLiver_envio: '',
        streetshipToLiver: '',

        cityshipToLiver_envio: '',
        cityshipToLiver: '',

        postalCodeshipToLiver_envio: '',
        postalCodeshipToLiver: '',

        invoiceCreator: '', //gln
        idInvoiceCreator: '',
        nameInvoiceCreator: '',
        cityOfInvoiceCreator: '',
        streetAddInvoiceCreator: '',
        postalCodeOfInvoiceCreator: '',
        specialInstruction: {
          code: '',
          text: ''
        },
        orderIdentification: {
          referenceIdentification: '', //PUR
          ReferenceDate: ''
        },
        AdditionalInformation: [
          /* {
                        type: '',
                        value: '',
                    } */
        ],
        DeliveryNote: {
          referenceIdentification: '',
          ReferenceDate: ''
        },
        buyer: {
          gln: '',
          text: ''
        },
        seller: {
          gln: '',
          alternatePartyIdentification: ''
        },
        /* shipTo: {
                    gln: '',//lo mismo que buyer
                    streetAddressOne: '',
                    city: '',
                    postalCode: '',
                }, */
        settlementType: '',
        totalAmount: '',
        specialServicesType: '',
        Amount: '',
        item: [
          /*  {
                         sku: '',
                         name: '',
                         unitOfMeasure: 'PCE',
                         rate: '',
                         discount: '',
                         Amount: '',
                         taxTypeDescription: '',
                         taxPercentage: '',
                         taxAmount: '',

                     } */
        ]
      }
    }
    try {
      var arrayColumn = [
        'tranid',
        'total',
        'trandate',
        'exchangerate',
        'custbody_efx_fe_total_text',

        'customer.custentity_efx_liverpool_sellergln',
        'customer.custentity_efx_liverpool_persondepartmen',
        'customer.custentity_efx_liverpool_buyergln',
        'customer.custentity_efx_liverpool_provnum',
        'customer.custentity_efx_liverpool_allowancecharge',

        'shippingaddress.custrecord_efx_fe_buyer_gln',

        'shippingaddress.custrecord_efx_fe_lugar_gln',
        'billingaddress.custrecord_efx_fe_lugar_gln',

        'shippingaddress.custrecord_efx_fe_lugar_city',
        'billingaddress.custrecord_efx_fe_lugar_city',

        'shippingaddress.city',
        'billingaddress.city',

        'shippingaddress.custrecord_streetname',
        'billingaddress.custrecord_streetname',

        'shippingaddress.zip',
        'billingaddress.zip',

        'custbody_efx_liverpool_folio_recibo',
        'custbody_efx_liverpool_fecha_recibo',
        'custbody_efx_liverpool_fecha_ordencomp',
        'otherrefnum',
        'terms',
        'billaddressee',
        'shipcity',
        'shipzip'
      ]

      var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' })
      var LOCATIONS = runtime.isFeatureInEffect({ feature: 'LOCATIONS' })

      if (SUBSIDIARIES) {
        arrayColumn.push('subsidiary')
      }
      if (LOCATIONS) {
        arrayColumn.push('location')
      }
      try {
        var LookupField = search.lookupFields({
          type: search.Type.TRANSACTION,
          id: param_id,
          columns: arrayColumn
        })

        log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

        if (SUBSIDIARIES && LookupField.subsidiary) {
          var resSub = record.load({
            type: search.Type.SUBSIDIARY,
            id: LookupField.subsidiary[0].value
          })

          respuesta.data.idInvoiceCreator = resSub.getValue({ fieldId: 'federalidnumber' })
          respuesta.data.nameInvoiceCreator = resSub.getValue({ fieldId: 'legalname' })

          addressObj = resSub.getSubrecord({ fieldId: 'mainaddress' })

          respuesta.data.streetAddInvoiceCreator = addressObj.getValue({ fieldId: 'custrecord_streetname' }) + addressObj.getValue({ fieldId: 'custrecord_streetnum' })
          respuesta.data.cityOfInvoiceCreator = addressObj.getText({ fieldId: 'city' })
          respuesta.data.postalCodeOfInvoiceCreator = addressObj.getValue({ fieldId: 'zip' })
        } else {
          var RecObj = config.load({
            type: config.Type.COMPANY_INFORMATION
          })

          respuesta.data.idInvoiceCreator = RecObj.getValue({ fieldId: 'employerid' })
          respuesta.data.nameInvoiceCreator = RecObj.getValue({ fieldId: 'legalname' })

          addressObj = RecObj.getSubrecord({ fieldId: 'mainaddress' })

          respuesta.data.streetAddInvoiceCreator = addressObj.getValue({ fieldId: 'custrecord_streetname' }) + addressObj.getValue({ fieldId: 'custrecord_streetnum' })
          respuesta.data.cityOfInvoiceCreator = addressObj.getText({ fieldId: 'city' })
          respuesta.data.postalCodeOfInvoiceCreator = addressObj.getValue({ fieldId: 'zip' })
        }

        respuesta.data.folio = LookupField['tranid'] || ''

        respuesta.data.specialInstruction.code = 'ZZZ'
        respuesta.data.specialInstruction.text = LookupField['custbody_efx_fe_total_text'] || ''

        respuesta.data.glnshipToLiver_envio = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] //'shippingaddress.custrecord_efx_fe_lugar_gln'
        respuesta.data.glnshipToLiver = LookupField['customer.custentity_efx_liverpool_buyergln'] //'billingaddress.custrecord_efx_fe_lugar_gln'

        respuesta.data.nameshipToLiver_envio = LookupField['shipaddressee'] //'shippingaddress.custrecord_efx_fe_lugar_city'
        respuesta.data.nameshipToLiver = LookupField['billaddressee'] //'billingaddress.custrecord_efx_fe_lugar_city'

        respuesta.data.streetshipToLiver_envio = LookupField['shippingaddress.custrecord_streetname']
        respuesta.data.streetshipToLiver = LookupField['billingaddress.custrecord_streetname']

        respuesta.data.cityshipToLiver_envio = LookupField['shippingaddress.city']
        respuesta.data.cityshipToLiver = LookupField['billingaddress.city']

        respuesta.data.postalCodeshipToLiver_envio = LookupField['shippingaddress.zip']
        respuesta.data.postalCodeshipToLiver = LookupField['billingaddress.zip']

        respuesta.data.invoiceCreator = LookupField['customer.custentity_efx_liverpool_sellergln']

        respuesta.data.orderIdentification.referenceIdentification = LookupField['otherrefnum'] || ''

        if (LookupField['custbody_efx_liverpool_fecha_ordencomp']) {
          var trandateFormato = fechaSplit(LookupField['custbody_efx_liverpool_fecha_ordencomp'], '.', '-', 0, 1, 2, '')
          respuesta.data.orderIdentification.ReferenceDate = trandateFormato
        }

        // respuesta.data.AdditionalInformation.push({
        //     type: 'ON',
        //     value: LookupField['tranid'] || '',
        // });
        respuesta.data.AdditionalInformation.push({
          type: 'ACE',
          value: LookupField['tranid'] || ''
        })

        respuesta.data.DeliveryNote.referenceIdentification = LookupField['custbody_efx_liverpool_folio_recibo'] || ''
        if (LookupField['custbody_efx_liverpool_fecha_recibo']) {
          var fechaReciboFormato = fechaSplit(LookupField['custbody_efx_liverpool_fecha_recibo'], '.', '-', 0, 1, 2, '')
          respuesta.data.DeliveryNote.ReferenceDate = fechaReciboFormato
        }

        if (LookupField['shippingaddress.custrecord_efx_fe_buyer_gln']) {
          respuesta.data.buyer.gln = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || ''
          //respuesta.data.shipTo.gln = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'];
        } else {
          respuesta.data.buyer.gln = LookupField['customer.custentity_efx_liverpool_buyergln'] || ''
          //respuesta.data.shipTo.gln = LookupField['customer.custentity_efx_liverpool_buyergln'];
        }

        respuesta.data.buyer.text = LookupField['customer.custentity_efx_liverpool_persondepartmen'] || ''

        respuesta.data.seller.gln = LookupField['customer.custentity_efx_liverpool_sellergln'] || ''
        respuesta.data.seller.alternatePartyIdentification = LookupField['customer.custentity_efx_liverpool_provnum'] || ''

        if (LookupField['customer.custentity_efx_liverpool_allowancecharge'].length > 0) {
          respuesta.data.settlementType = LookupField['customer.custentity_efx_liverpool_allowancecharge'][0].text
        }

        respuesta.data.totalAmount = LookupField['total']
        if (LookupField['customer.custentity_efx_liverpool_allowancecharge'].length > 0) {
          if (LookupField['customer.custentity_efx_liverpool_allowancecharge'][0].value == 1) {
            respuesta.data.specialServicesType = 'AJ'
          } else {
            respuesta.data.specialServicesType = 'DI'
          }
        } else {
          respuesta.data.specialServicesType = 'AJ'
        }

        respuesta.data.Amount = '0.00'
        respuesta.data.exhrate = LookupField['exchangerate']

        respuesta.data.terminosLiver = LookupField['terms']

        var objParametro = {
          id: param_id,
          type: param_type,
          sublist: 'item',
          bodyFieldValue: [],
          bodyFieldText: [],
          lineField: [
            'itemtype',
            'item',
            // 'itemTEXT',
            'quantity',
            'rate',
            'custcol_efx_fe_upc_code',
            'amount',
            'tax1amt',
            'grossamt'
          ]
        }
        var idNameItemTex = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_id_name_item' }) || ''
        log.audit({ title: 'idNameItemTex', details: JSON.stringify(idNameItemTex) })
        var idName = ''
        if (idNameItemTex) {
          idName = idNameItemTex
        } else {
          idName = 'itemTEXT'
        }
        log.audit({ title: 'idName', details: JSON.stringify(idName) })
        objParametro.lineField.push(idName)

        var transactionField = getTransactionField(objParametro)
        if (transactionField.succes) {
          var descuento_total_lineas = 0
          for (var ir in transactionField.data.lineField) {
            //buscar descuentos
            var descuento_linea = 0
            var linea_disc = parseInt(ir) + 1
            var tamano_linefield = Object.keys(transactionField.data.lineField).length
            log.audit({ title: 'linea_disc', details: linea_disc })
            log.audit({ title: 'tamano_linefield', details: tamano_linefield })
            if (linea_disc < tamano_linefield) {
              if (transactionField.data.lineField[linea_disc].itemtype == 'Discount') {
                descuento_linea = transactionField.data.lineField[ir].amount
                if (descuento_linea < 0) {
                  descuento_linea = descuento_linea * -1
                }
              }
            }
            //fin de buscar descuentos
            if (
              transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
              transactionField.data.lineField[ir].itemtype == 'Service' ||
              transactionField.data.lineField[ir].itemtype == 'Kit' ||
              transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
              transactionField.data.lineField[ir].itemtype == 'Assembly' ||
              transactionField.data.lineField[ir].itemtype == 'Markup'
            ) {
              var rec_transaction = record.load({
                type: param_type,
                id: param_id,
                isDynamic: true
              })

              var json_col = rec_transaction.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_efx_fe_tax_json',
                line: ir
              })
              var json_tax_col = JSON.parse(json_col)

              var quantity = transactionField.data.lineField[ir].quantity || 0
              var quantityType = parseFloat(quantity).toFixed(2) || 0
              descuento_total_lineas = descuento_total_lineas + descuento_linea
              var unitmeasur = ''
              if (LookupField['customer.custentity_efx_liverpool_allowancecharge'].length > 0) {
                if (LookupField['customer.custentity_efx_liverpool_allowancecharge'][0].value == 1) {
                  unitmeasur = 'H87'
                } else {
                  unitmeasur = 'CA'
                }
              } else {
                unitmeasur = 'CA'
              }

              respuesta.data.item.push({
                sku: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
                name: transactionField.data.lineField[ir][idName] || '',
                unitOfMeasure: unitmeasur,
                rate: transactionField.data.lineField[ir].rate || '',
                amount: transactionField.data.lineField[ir].amount || '',
                grossamt: transactionField.data.lineField[ir].grossamt || '',
                quantity: quantityType,
                Amount: transactionField.data.lineField[ir].amount || '',
                iva_rate: json_tax_col.iva.rate.toFixed(4),
                iva_importe: json_tax_col.iva.importe,
                ieps_rate: json_tax_col.ieps.rate.toFixed(4),
                ieps_importe: json_tax_col.ieps.importe,
                discount: descuento_linea,
                taxTypeDescription: 'VAT',
                taxPercentage: '0.0000',
                taxAmount: '0.0000'
              })
            }
          }
          if (transactionField.data.bodyFieldValue.discounttotal) {
            respuesta.data.descuentototal = transactionField.data.bodyFieldValue.discounttotal
          } else {
            respuesta.data.descuentototal = descuento_total_lineas.toFixed(2)
          }
          respuesta.succes = true
        }
      } catch (errores) {
        log.audit({ title: 'error getDataLiverpool2', details: JSON.stringify(errores) })
      }
    } catch (error) {
      log.audit({ title: 'error getDataLiverpool', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataLiverpool', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getxmlLiverpool(param_obj_liverpool2) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: '',
      message: []
    }
    var bandera = false
    try {
      var xmlLiverpool2 = ''
      xmlLiverpool2 += '<cfdi:Complemento>'
      xmlLiverpool2 += '    <detallista:detallista'
      xmlLiverpool2 += '        xmlns:detallista="http://www.sat.gob.mx/detallista"'
      xmlLiverpool2 += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
      xmlLiverpool2 += '        xsi:schemaLocation="http://www.sat.gob.mx/detallista http://www.sat.gob.mx/sitio_internet/cfd/detallista/detallista.xsd"'
      xmlLiverpool2 += '        type="SimpleInvoiceType"'
      xmlLiverpool2 += '        documentStructureVersion="AMC8.1"'
      xmlLiverpool2 += '        documentStatus="ORIGINAL"'
      xmlLiverpool2 += '        contentVersion="1.3.1"'
      xmlLiverpool2 += '        >'
      xmlLiverpool2 += '     <detallista:requestForPaymentIdentification> '
      xmlLiverpool2 += '         <detallista:entityType>INVOICE</detallista:entityType> '
      xmlLiverpool2 += '     </detallista:requestForPaymentIdentification> '

      xmlLiverpool2 += '     <detallista:specialInstruction code="AAB">' //AAB
      if (param_obj_liverpool2.terminosLiver) {
        var terminosLP = param_obj_liverpool2.terminosLiver[0].text.split(' ')
        xmlLiverpool2 += '          <detallista:text>' + terminosLP[0] + ' dias netos' + '</detallista:text>' //dias netos
      } else {
        xmlLiverpool2 += '          <detallista:text></detallista:text>' //dias netos
      }
      xmlLiverpool2 += '     </detallista:specialInstruction>'

      xmlLiverpool2 += '     <detallista:specialInstruction code="DUT">' //DUT
      if (param_obj_liverpool2.iva_importe == '') {
        bandera = true
        if (bandera && param_obj_liverpool2.iva_importe == '') {
          xmlLiverpool2 += '          <detallista:text></detallista:text>' //Impuesto
        }
        if (param_obj_liverpool2.ieps_importe == '') {
          xmlLiverpool2 += '          <detallista:text></detallista:text>' //Impuesto
        } else {
          xmlLiverpool2 += '          <detallista:text>IEPS</detallista:text>' //Impuesto
        }
      } else {
        xmlLiverpool2 += '          <detallista:text>IVA</detallista:text>' //Impuesto
      }
      xmlLiverpool2 += '     </detallista:specialInstruction>'

      xmlLiverpool2 += '     <detallista:specialInstruction code="PUR">' //PUR
      xmlLiverpool2 += '          <detallista:text>' + param_obj_liverpool2.orderIdentification.referenceIdentification + '</detallista:text>' //numero?
      xmlLiverpool2 += '     </detallista:specialInstruction>'

      xmlLiverpool2 += '     <detallista:specialInstruction code="' + param_obj_liverpool2.specialInstruction.code + '"> ' //ZZZ
      xmlLiverpool2 += '         <detallista:text>' + param_obj_liverpool2.specialInstruction.text + '</detallista:text> ' //monto en letra
      xmlLiverpool2 += '     </detallista:specialInstruction> '

      xmlLiverpool2 += '     <detallista:orderIdentification> '
      xmlLiverpool2 +=
        '         <detallista:referenceIdentification type="ON">' + param_obj_liverpool2.orderIdentification.referenceIdentification + '</detallista:referenceIdentification> '
      xmlLiverpool2 += '         <detallista:ReferenceDate>' + param_obj_liverpool2.orderIdentification.ReferenceDate + '</detallista:ReferenceDate> '
      xmlLiverpool2 += '     </detallista:orderIdentification> '

      xmlLiverpool2 += '     <detallista:AdditionalInformation> '
      for (var infoi in param_obj_liverpool2.AdditionalInformation) {
        xmlLiverpool2 +=
          '         <detallista:referenceIdentification type="' +
          param_obj_liverpool2.AdditionalInformation[infoi].type +
          '">' +
          param_obj_liverpool2.AdditionalInformation[infoi].value +
          '</detallista:referenceIdentification> '
      }
      xmlLiverpool2 += '     </detallista:AdditionalInformation> '

      xmlLiverpool2 += '     <detallista:DeliveryNote> '
      xmlLiverpool2 += '         <detallista:referenceIdentification>' + param_obj_liverpool2.DeliveryNote.referenceIdentification + '</detallista:referenceIdentification> '
      xmlLiverpool2 += '         <detallista:ReferenceDate>' + param_obj_liverpool2.DeliveryNote.ReferenceDate + '</detallista:ReferenceDate> '
      xmlLiverpool2 += '     </detallista:DeliveryNote> '

      xmlLiverpool2 += '     <detallista:buyer> '
      xmlLiverpool2 += '         <detallista:gln>' + param_obj_liverpool2.buyer.gln + '</detallista:gln> '
      xmlLiverpool2 += '         <detallista:contactInformation> '
      xmlLiverpool2 += '             <detallista:personOrDepartmentName> '
      xmlLiverpool2 += '                 <detallista:text>' + param_obj_liverpool2.buyer.text + '</detallista:text> '
      xmlLiverpool2 += '             </detallista:personOrDepartmentName> '
      xmlLiverpool2 += '         </detallista:contactInformation> '
      xmlLiverpool2 += '     </detallista:buyer> '

      xmlLiverpool2 += '     <detallista:seller> '
      xmlLiverpool2 += '         <detallista:gln>' + param_obj_liverpool2.seller.gln + '</detallista:gln> '
      xmlLiverpool2 += '         <detallista:alternatePartyIdentification '
      xmlLiverpool2 +=
        '             type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' +
        param_obj_liverpool2.seller.alternatePartyIdentification +
        '</detallista:alternatePartyIdentification> '
      xmlLiverpool2 += '     </detallista:seller> '

      xmlLiverpool2 += '     <detallista:shipTo> '
      if (param_obj_liverpool2.glnshipToLiver_envio) {
        xmlLiverpool2 += '     <detallista:gln>' + param_obj_liverpool2.glnshipToLiver_envio + '</detallista:gln>'
      } else {
        xmlLiverpool2 += '     <detallista:gln>' + param_obj_liverpool2.glnshipToLiver + '</detallista:gln>'
      }
      xmlLiverpool2 += '          <detallista:nameAndAddress>'
      if (param_obj_liverpool2.nameshipToLiver_envio) {
        xmlLiverpool2 += '     <detallista:name>' + param_obj_liverpool2.nameshipToLiver_envio + '</detallista:name>'
      } else {
        xmlLiverpool2 += '     <detallista:name>' + param_obj_liverpool2.nameshipToLiver + '</detallista:name>'
      }
      if (param_obj_liverpool2.streetshipToLiver_envio) {
        xmlLiverpool2 += '     <detallista:streetAddressOne>' + param_obj_liverpool2.streetshipToLiver_envio + '</detallista:streetAddressOne>'
      } else {
        xmlLiverpool2 += '     <detallista:streetAddressOne>' + param_obj_liverpool2.streetshipToLiver + '</detallista:streetAddressOne>'
      }
      if (param_obj_liverpool2.cityshipToLiver_envio) {
        xmlLiverpool2 += '     <detallista:city>' + param_obj_liverpool2.cityshipToLiver_envio + '</detallista:city>'
      } else {
        xmlLiverpool2 += '     <detallista:city>' + param_obj_liverpool2.cityshipToLiver + '</detallista:city>'
      }
      if (param_obj_liverpool2.postalCodeshipToLiver_envio) {
        xmlLiverpool2 += '     <detallista:postalCode>' + param_obj_liverpool2.postalCodeshipToLiver_envio + '</detallista:postalCode>'
      } else {
        xmlLiverpool2 += '     <detallista:postalCode>' + param_obj_liverpool2.postalCodeshipToLiver_envio + '</detallista:postalCode>'
      }
      xmlLiverpool2 += '          </detallista:nameAndAddress> '
      xmlLiverpool2 += '     </detallista:shipTo> '

      xmlLiverpool2 += '     <detallista:InvoiceCreator>'
      xmlLiverpool2 += '          <detallista:gln>' + param_obj_liverpool2.invoiceCreator + '</detallista:gln>'
      xmlLiverpool2 += '          <detallista:alternatePartyIdentification type="VA">' + param_obj_liverpool2.idInvoiceCreator + '</detallista:alternatePartyIdentification>'
      xmlLiverpool2 += '          <detallista:nameAndAddress>'
      xmlLiverpool2 += '              <detallista:name>' + param_obj_liverpool2.nameInvoiceCreator + '</detallista:name>'
      xmlLiverpool2 += '              <detallista:streetAddressOne>' + param_obj_liverpool2.streetAddInvoiceCreator + '</detallista:streetAddressOne>'
      xmlLiverpool2 += '              <detallista:city>' + param_obj_liverpool2.cityOfInvoiceCreator + '</detallista:city>'
      xmlLiverpool2 += '              <detallista:postalCode>' + param_obj_liverpool2.postalCodeOfInvoiceCreator + '</detallista:postalCode>'
      xmlLiverpool2 += '          </detallista:nameAndAddress>'
      xmlLiverpool2 += '     </detallista:InvoiceCreator>'

      xmlLiverpool2 += '     <detallista:Customs>'
      xmlLiverpool2 += '          <detallista:gln>' + param_obj_liverpool2.invoiceCreator + '</detallista:gln>'
      xmlLiverpool2 += '     </detallista:Customs>'

      xmlLiverpool2 += '     <detallista:currency currencyISOCode="' + param_obj_liverpool2.currencyISOCode + '"> '
      xmlLiverpool2 += '         <detallista:currencyFunction>BILLING_CURRENCY</detallista:currencyFunction> '
      xmlLiverpool2 += '         <detallista:rateOfChange>' + param_obj_liverpool2.exhrate + '</detallista:rateOfChange> '
      xmlLiverpool2 += '     </detallista:currency> '

      xmlLiverpool2 += '    <detallista:allowanceCharge'
      xmlLiverpool2 += '        allowanceChargeType="ALLOWANCE_GLOBAL"'
      xmlLiverpool2 += '        settlementType="' + param_obj_liverpool2.settlementType + '">'
      xmlLiverpool2 += '        <detallista:specialServicesType>AJ</detallista:specialServicesType>'
      xmlLiverpool2 += '        <detallista:monetaryAmountOrPercentage>'
      xmlLiverpool2 += '            <detallista:rate base="INVOICE_VALUE">'
      xmlLiverpool2 += '                <detallista:percentage>0.00</detallista:percentage>'
      xmlLiverpool2 += '            </detallista:rate>'
      xmlLiverpool2 += '        </detallista:monetaryAmountOrPercentage>'
      xmlLiverpool2 += '    </detallista:allowanceCharge>'

      var lineItem = 0

      for (var itemLine in param_obj_liverpool2.item) {
        lineItem++
        xmlLiverpool2 += '         <detallista:lineItem type="SimpleInvoiceLineItemType" number="' + lineItem + '"> '
        xmlLiverpool2 += '             <detallista:tradeItemIdentification> '
        var sku = param_obj_liverpool2.item[itemLine].sku || ''
        if (sku) {
          if (sku.length > 14) {
            sku = sku.substring(0, 14)
            respuesta.message.push('El campo detallista:gtin debe ser menor de 14 caracteres no de ' + sku.length + ' corregir el valor ' + sku)
          }
        } else {
          respuesta.message.push('Falta el campo detallista:gtin')
        }
        log.audit({ title: 'sku', details: JSON.stringify(sku) })
        xmlLiverpool2 += '                 <detallista:gtin>' + sku + '</detallista:gtin> '
        xmlLiverpool2 += '             </detallista:tradeItemIdentification> '
        xmlLiverpool2 += '             <detallista:alternateTradeItemIdentification type="BUYER_ASSIGNED">' + sku + '</detallista:alternateTradeItemIdentification> '
        xmlLiverpool2 += '             <detallista:tradeItemDescriptionInformation language="ES"> '
        var longtext = xml.escape({ xmlText: param_obj_liverpool2.item[itemLine].name }) || ''
        if (longtext) {
          if (longtext.length > 35) {
            longtext = longtext.substring(0, 35)
            respuesta.message.push('El campo detallista:longText debe ser menor a 35 caracteres no de ' + longtext.length + ' corregir el valor ' + longtext)
          }
        } else {
          respuesta.message.push('Falta el campo detallista:longText')
        }
        log.audit({ title: 'longtext', details: JSON.stringify(longtext) })
        xmlLiverpool2 += '                 <detallista:longText>' + longtext + '</detallista:longText> '
        xmlLiverpool2 += '             </detallista:tradeItemDescriptionInformation> '
        xmlLiverpool2 +=
          '             <detallista:invoicedQuantity unitOfMeasure="' +
          param_obj_liverpool2.item[itemLine].unitOfMeasure +
          '">' +
          param_obj_liverpool2.item[itemLine].quantity +
          '</detallista:invoicedQuantity> '
        xmlLiverpool2 += '             <detallista:grossPrice> '
        xmlLiverpool2 += '                 <detallista:Amount>' + param_obj_liverpool2.item[itemLine].grossamt + '</detallista:Amount> '
        xmlLiverpool2 += '             </detallista:grossPrice> '
        xmlLiverpool2 += '             <detallista:netPrice> '
        xmlLiverpool2 += '                 <detallista:Amount>' + param_obj_liverpool2.item[itemLine].rate + '</detallista:Amount> '
        xmlLiverpool2 += '             </detallista:netPrice> '

        xmlLiverpool2 += '             <detallista:allowanceCharge settlementType="OFF_INVOICE" allowanceChargeType="ALLOWANCE_GLOBAL" sequenceNumber="0"> '
        xmlLiverpool2 += '             <detallista:specialServicesType>' + param_obj_liverpool2.specialServicesType + '</detallista:specialServicesType> '
        xmlLiverpool2 += '             <detallista:monetaryAmountOrPercentage> '
        xmlLiverpool2 += '                  <detallista:percentagePerUnit>0</detallista:percentagePerUnit>'
        xmlLiverpool2 += '                  <detallista:ratePerUnit>'
        xmlLiverpool2 += '                      <detallista:amountPerUnit>0</detallista:amountPerUnit>'
        xmlLiverpool2 += '                  </detallista:ratePerUnit>'
        xmlLiverpool2 += '             </detallista:monetaryAmountOrPercentage> '
        xmlLiverpool2 += '             </detallista:allowanceCharge> '

        xmlLiverpool2 += '             <detallista:totalLineAmount> '
        xmlLiverpool2 += '                 <detallista:grossAmount> '
        xmlLiverpool2 += '                     <detallista:Amount>' + param_obj_liverpool2.item[itemLine].grossamt + '</detallista:Amount> '
        xmlLiverpool2 += '                 </detallista:grossAmount> '
        xmlLiverpool2 += '                 <detallista:netAmount>'
        xmlLiverpool2 += '                     <detallista:Amount>' + param_obj_liverpool2.item[itemLine].amount + '</detallista:Amount> '
        xmlLiverpool2 += '                 </detallista:netAmount> '
        xmlLiverpool2 += '             </detallista:totalLineAmount> '
        xmlLiverpool2 += '         </detallista:lineItem> '
      }

      xmlLiverpool2 += '     <detallista:totalAmount> '
      xmlLiverpool2 += '         <detallista:Amount>' + param_obj_liverpool2.totalAmount + '</detallista:Amount> '
      xmlLiverpool2 += '     </detallista:totalAmount> '

      xmlLiverpool2 += '     <detallista:TotalAllowanceCharge allowanceOrChargeType="ALLOWANCE"> '
      xmlLiverpool2 += '         <detallista:specialServicesType>' + param_obj_liverpool2.specialServicesType + '</detallista:specialServicesType> '
      xmlLiverpool2 += '         <detallista:Amount>' + param_obj_liverpool2.Amount + '</detallista:Amount> '
      xmlLiverpool2 += '     </detallista:TotalAllowanceCharge> '
      xmlLiverpool2 += ' </detallista:detallista> '
      xmlLiverpool2 += ' </cfdi:Complemento> '

      respuesta.data = xmlLiverpool2
      respuesta.succes = respuesta.message.length == 0
    } catch (error) {
      log.error({ title: 'error getxmlLiverpool2', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getxmlLiverpool2', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataHeb(param_id, param_type) {
    var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' })
    var respuesta = {
      succes: false,
      data: {
        currencyISOCode: 'MXN',
        specialInstruction: {
          code: '',
          text: ''
        },
        orderIdentification: {
          referenceIdentification: '',
          ReferenceDate: ''
        },
        AdditionalInformation: [
          /* {
                        type: '',
                        value: '',
                    } */
        ],
        DeliveryNote: {
          referenceIdentification: '',
          ReferenceDate: ''
        },
        buyer: {
          gln: '',
          text: ''
        },
        seller: {
          gln: '',
          alternatePartyIdentification: ''
        },
        shipTo: {
          gln: '',
          streetAddressOne: '',
          city: '',
          postalCode: '',
          gln_envio: '',
          streetAddressOne_envio: '',
          city_envio: '',
          postalCode_envio: ''
        },
        totalAmount: '',
        rateDiscount: '',
        specialServicesType: '',
        Amount: '',
        item: []
      }
    }
    try {
      var arrayColumn = [
        'tranid',
        'total',
        'trandate',
        'exchangerate',
        'terms',
        'subsidiary',
        'entity',
        'customer.custentity_efx_heb_proveedor',
        'customer.custentity_efx_fe_heb_seller',
        'customer.custentity_efx_heb_buyergln',
        'customer.custentity_efx_heb_buyerperson',
        'otherrefnum',
        'custbody_efx_heb_folio_recibo',
        'custbody_efx_fe_total_text',
        'billingaddress.address1',
        'billingaddress.custrecord_efx_fe_heb_shipto',
        'billingaddress.city',
        'billingaddress.zip',
        'billingaddress.addressee',
        'billingaddress.custrecord_streetname',
        'billingaddress.custrecord_colonia',
        'billingaddress.custrecord_village',
        'billingaddress.state',
        'billingaddress.country',
        'shippingaddress.address1',
        'shippingaddress.custrecord_efx_fe_heb_shipto',
        'shippingaddress.city',
        'shippingaddress.zip',
        'shippingaddress.addressee',
        'shippingaddress.custrecord_streetname',
        'shippingaddress.custrecord_colonia',
        'shippingaddress.custrecord_village',
        'shippingaddress.state',
        'shippingaddress.country',
        'shippingaddress.custrecord_efx_fe_buyer_gln',
        'shippingaddress.custrecord_efx_fe_lugar_gln'
      ]

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      respuesta.data.folio = LookupField['tranid'] || ''

      respuesta.data.specialInstruction.code = 'AAB'
      respuesta.data.specialInstruction.text = LookupField['custbody_efx_fe_total_text']
      //respuesta.data.specialInstruction.text = LookupField['custbody_efx_fe_total_text'] || '';

      respuesta.data.orderIdentification.referenceIdentification = LookupField['otherrefnum'] || ''
      var cliente_id = LookupField['entity'] || ''

      var trandateFormato = fechaSplit(LookupField['trandate'], '/', '-', 0, 1, 2, '')

      if (LookupField['trandate']) {
        respuesta.data.orderIdentification.ReferenceDate = trandateFormato
      }

      respuesta.data.AdditionalInformation.push({
        type: 'ON',
        value: LookupField['otherrefnum'] || ''
      })
      respuesta.data.AdditionalInformation.push({
        type: 'IV',
        value: LookupField['tranid'] || ''
      })
      respuesta.data.AdditionalInformation.push({
        type: 'ATZ',
        value: LookupField['tranid'] || ''
      })

      var sub_calle = ''
      var sub_vat = ''
      if (SUBSIDIARIES) {
        var arrayColumn_sub = ['taxidnum', 'address.custrecord_streetname', 'address.addressee', 'address.city', 'address.state', 'address.country', 'address.zip']
        var subsidiary_id = LookupField['subsidiary']
        var LookupField_sub = search.lookupFields({
          type: search.Type.SUBSIDIARY,
          id: subsidiary_id[0].value,
          columns: arrayColumn_sub
        })

        respuesta.data.seller.calle = LookupField_sub['address.custrecord_streetname'] || ''
        respuesta.data.seller.name = LookupField_sub['address.addressee'] || ''
        respuesta.data.seller.city = LookupField_sub['address.city'] || ''
        respuesta.data.seller.state = LookupField_sub['address.state'] || ''
        respuesta.data.seller.country = LookupField_sub['address.country'][0].text || ''
        respuesta.data.seller.zip = LookupField_sub['address.zip'] || ''
        respuesta.data.seller.vat = LookupField_sub['taxidnum'] || ''
      } else {
      }

      respuesta.data.DeliveryNote.referenceIdentification = LookupField['custbody_efx_heb_folio_recibo'] || ''
      respuesta.data.DeliveryNote.ReferenceDate = trandateFormato

      if (LookupField['shippingaddress.custrecord_efx_fe_buyer_gln']) {
        respuesta.data.buyer.gln = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || ''
      } else {
        respuesta.data.buyer.gln = LookupField['customer.custentity_efx_heb_buyergln'] || ''
      }

      respuesta.data.buyer.text = '99'
      respuesta.data.buyer.buyer = LookupField['customer.custentity_efx_heb_buyerperson'] || ''

      respuesta.data.seller.gln = LookupField['customer.custentity_efx_fe_heb_seller'] || ''
      respuesta.data.seller.alternatePartyIdentification = LookupField['customer.custentity_efx_heb_proveedor'] || ''

      respuesta.data.shipTo.gln = LookupField['billingaddress.custrecord_efx_fe_heb_shipto']
      log.audit({ title: "LookupField['billingaddress.custrecord_efx_fe_heb_shipto']", details: LookupField['billingaddress.custrecord_efx_fe_heb_shipto'] })
      respuesta.data.shipTo.streetAddressOne = LookupField['billingaddress.custrecord_streetname']
      respuesta.data.shipTo.colonia = LookupField['billingaddress.custrecord_colonia']
      respuesta.data.shipTo.municipio = LookupField['billingaddress.custrecord_village']
      respuesta.data.shipTo.estado = LookupField['billingaddress.state']
      respuesta.data.shipTo.pais = LookupField['billingaddress.country']
      respuesta.data.shipTo.city = LookupField['billingaddress.city']
      respuesta.data.shipTo.postalCode = LookupField['billingaddress.zip']
      respuesta.data.shipTo.nombre_dir = LookupField['billingaddress.addressee']

      respuesta.data.shipTo.gln_envio = LookupField['shippingaddress.custrecord_efx_fe_heb_shipto']
      log.audit({ title: "LookupField['shippingaddress.custrecord_efx_fe_heb_shipto']", details: LookupField['shippingaddress.custrecord_efx_fe_heb_shipto'] })
      respuesta.data.shipTo.streetAddressOne_envio = LookupField['shippingaddress.custrecord_streetname']
      respuesta.data.shipTo.colonia_envio = LookupField['shippingaddress.custrecord_colonia']
      respuesta.data.shipTo.municipio_envio = LookupField['shippingaddress.custrecord_village']
      respuesta.data.shipTo.estado_envio = LookupField['shippingaddress.state']
      respuesta.data.shipTo.pais_envio = LookupField['shippingaddress.country']
      respuesta.data.shipTo.city_envio = LookupField['shippingaddress.city']
      respuesta.data.shipTo.postalCode_envio = LookupField['shippingaddress.zip']
      respuesta.data.shipTo.nombre_dir_envio = LookupField['shippingaddress.addressee'] //addressee

      respuesta.data.totalAmount = LookupField['total']
      var total_transaccion = LookupField['total']

      respuesta.data.specialServicesType = 'AJ'
      respuesta.data.Amount = '0.0'
      respuesta.data.exhrate = LookupField['exchangerate']
      respuesta.data.terminos = LookupField['terms']
      log.audit({ title: 'respuesta.data.terminos', details: JSON.stringify(respuesta.data.terminos) })
      log.audit({ title: 'respuesta.data.terminos', details: JSON.stringify(respuesta.data.terminos[0].value) })
      try {
        if (respuesta.data.terminos) {
          var terminos_obj = record.load({
            type: record.Type.TERM,
            id: respuesta.data.terminos[0].value
          })
          respuesta.data.terminos = terminos_obj.getValue({ fieldId: 'daysuntilnetdue' })
        }
      } catch (error_terms) {
        respuesta.data.terminos = ''
      }

      log.audit({ title: 'respuesta.data.terminos', details: JSON.stringify(respuesta.data.terminos) })

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['itemtype', 'item', 'itemTEXT', 'description', 'quantity', 'rate', 'custcol_efx_fe_upc_code', 'amount', 'tax1amt', 'grossamt']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        var array_items = []
        var descuento_total_lineas = 0
        for (var ir in transactionField.data.lineField) {
          //buscar descuentos
          var descuento_linea = 0
          var linea_disc = parseInt(ir) + 1
          var tamano_linefield = Object.keys(transactionField.data.lineField).length
          log.audit({ title: 'linea_disc', details: linea_disc })
          log.audit({ title: 'tamano_linefield', details: tamano_linefield })
          if (linea_disc < tamano_linefield) {
            if (transactionField.data.lineField[linea_disc].itemtype == 'Discount') {
              descuento_linea = transactionField.data.lineField[linea_disc].amount
              if (descuento_linea < 0) {
                descuento_linea = descuento_linea * -1
              }
            }
          }
          //fin de buscar descuentos

          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var rec_transaction = record.load({
              type: param_type,
              id: param_id,
              isDynamic: true
            })

            var json_col = rec_transaction.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_efx_fe_tax_json',
              line: ir
            })
            var json_tax_col = JSON.parse(json_col)

            var quantity = transactionField.data.lineField[ir].quantity || 0
            var quantityType = parseFloat(quantity).toFixed(3) || 0
            descuento_total_lineas = descuento_total_lineas + descuento_linea
            array_items.push(transactionField.data.lineField[ir].item || '')
            respuesta.data.item.push({
              item: transactionField.data.lineField[ir].item || '',
              num_p_cliente: '',
              sku: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              name: transactionField.data.lineField[ir].description || '',
              unitOfMeasure: 'CAJ',
              rate: transactionField.data.lineField[ir].rate || '',
              amount: transactionField.data.lineField[ir].amount || '',
              grossamt: transactionField.data.lineField[ir].grossamt || '',
              quantity: quantityType,
              // Amount: transactionField.data.lineField[ir].amount || '',
              iva_rate: json_tax_col.iva.rate.toFixed(4),
              iva_importe: json_tax_col.iva.importe,
              ieps_rate: json_tax_col.ieps.rate.toFixed(4),
              ieps_importe: json_tax_col.ieps.importe,
              discount: descuento_linea,

              //discount: 0,
              taxTypeDescription: 'VAT',
              taxPercentage: '0.0000',
              taxAmount: '0.0000'
            })
          }
        }
        var descuento_rate = 0
        log.audit({ title: 'transactionField.data.bodyFieldValue.discounttotal', details: transactionField.data.bodyFieldValue.discounttotal })
        log.audit({ title: 'descuento_total_lineas', details: descuento_total_lineas })
        if (transactionField.data.bodyFieldValue.discounttotal) {
          if (total_transaccion == '.00') {
            total_transaccion = 0
          }
          if (total_transaccion == 0) {
            descuento_rate = 100
          } else {
            descuento_total_lineas = parseFloat(transactionField.data.bodyFieldValue.discounttotal)
            respuesta.data.descuentototal = transactionField.data.bodyFieldValue.discounttotal
            descuento_rate = (descuento_total_lineas * 100) / parseFloat(total_transaccion)
          }
        } else {
          if (total_transaccion == '.00') {
            total_transaccion = 0
          }
          if (total_transaccion == 0) {
            descuento_rate = 100
          } else {
            respuesta.data.descuentototal = descuento_total_lineas.toFixed(2)
            descuento_rate = (parseFloat(descuento_total_lineas) * 100) / parseFloat(total_transaccion)
            log.audit({ title: 'descuento_rate', details: descuento_rate })
          }
        }
        respuesta.data.rateDiscount = descuento_rate.toFixed(2)
        log.audit({ title: 'respuesta.data.rateDiscount', details: respuesta.data.rateDiscount })
        try {
          log.audit({ title: 'array_items', details: array_items })
          log.audit({ title: 'cliente_id', details: cliente_id })
          var search_num_client = search.create({
            type: 'customrecord_scm_customerpartnumber',
            filters: [
              ['isinactive', search.Operator.IS, 'F'],
              'and',
              ['custrecord_scm_cpn_item', search.Operator.ANYOF, array_items],
              'and',
              ['custrecord_scm_cpn_customer', search.Operator.IS, cliente_id[0].value]
            ],
            columns: [
              search.createColumn({ name: 'name' }),
              search.createColumn({ name: 'custrecord_scm_cpn_item' }),
              search.createColumn({ name: 'custrecord_scm_cpn_customer' })
            ]
          })

          var ejecutar = search_num_client.run()
          var resultado = ejecutar.getRange(0, 100)
          log.audit({ title: 'resultado.length', details: resultado.length })
          for (var itemLine in respuesta.data.item) {
            for (var x = 0; x < resultado.length; x++) {
              var articulo_cliente = resultado[x].getValue({ name: 'custrecord_scm_cpn_item' }) || ''
              if (articulo_cliente == respuesta.data.item[itemLine].item) {
                respuesta.data.item[itemLine].num_p_cliente = resultado[x].getValue({ name: 'name' }) || ''
              }
            }
          }
        } catch (error_buscar) {
          log.audit({ title: 'error_buscar_num_cliente', details: error_buscar })
        }
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataHeb', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataHeb', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlHeb(param_obj_Heb, HEBamece) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      respuesta.xmlns = ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
      respuesta.xmlns += ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd '
      respuesta.xmlns += ' http://www.sat.gob.mx/detallista http://www.sat.gob.mx/sitio_internet/cfd/detallista/detallista.xsd '
      respuesta.xmlns += '"'

      var xmlHeb = ''

      xmlHeb += '<cfdi:Complemento>'
      xmlHeb += '    <detallista:detallista'
      xmlHeb += '        contentVersion="1.3.1"'
      xmlHeb += '        documentStatus="ORIGINAL"'
      xmlHeb += '        documentStructureVersion="AMC8.1"'
      xmlHeb += '        type="SimpleInvoiceType"'
      xmlHeb += '        xmlns:detallista="http://www.sat.gob.mx/detallista">'

      xmlHeb += '     <detallista:requestForPaymentIdentification> '
      xmlHeb += '         <detallista:entityType>INVOICE</detallista:entityType> '
      xmlHeb += '     </detallista:requestForPaymentIdentification> '

      xmlHeb += '     <detallista:specialInstruction code="' + param_obj_Heb.specialInstruction.code + '"> '
      xmlHeb += '         <detallista:text>' + param_obj_Heb.specialInstruction.text + '</detallista:text> '
      xmlHeb += '     </detallista:specialInstruction> '

      xmlHeb += '     <detallista:orderIdentification> '
      xmlHeb +=
        '         <detallista:referenceIdentification type="ON">' + param_obj_Heb.orderIdentification.referenceIdentification + '</detallista:referenceIdentification> '
      xmlHeb += '         <detallista:ReferenceDate>' + param_obj_Heb.orderIdentification.ReferenceDate + '</detallista:ReferenceDate> '
      xmlHeb += '     </detallista:orderIdentification> '

      xmlHeb += '     <detallista:AdditionalInformation> '
      for (var infoi in param_obj_Heb.AdditionalInformation) {
        xmlHeb +=
          '         <detallista:referenceIdentification type="' +
          param_obj_Heb.AdditionalInformation[infoi].type +
          '">' +
          param_obj_Heb.AdditionalInformation[infoi].value +
          '</detallista:referenceIdentification> '
      }
      xmlHeb += '     </detallista:AdditionalInformation> '

      if (param_obj_Heb.DeliveryNote.referenceIdentification) {
        xmlHeb += '     <detallista:DeliveryNote> '
        xmlHeb += '         <detallista:referenceIdentification>' + param_obj_Heb.DeliveryNote.referenceIdentification + '</detallista:referenceIdentification> '
        xmlHeb += '         <detallista:ReferenceDate>' + param_obj_Heb.DeliveryNote.ReferenceDate + '</detallista:ReferenceDate> '
        xmlHeb += '     </detallista:DeliveryNote> '
      }

      xmlHeb += '     <detallista:buyer> '
      xmlHeb += '         <detallista:gln>' + param_obj_Heb.buyer.gln + '</detallista:gln> '
      xmlHeb += '         <detallista:contactInformation> '
      xmlHeb += '             <detallista:personOrDepartmentName> '
      xmlHeb += '                 <detallista:text>' + param_obj_Heb.buyer.text + '</detallista:text> '
      xmlHeb += '             </detallista:personOrDepartmentName> '
      xmlHeb += '         </detallista:contactInformation> '
      xmlHeb += '     </detallista:buyer> '

      xmlHeb += '     <detallista:seller> '
      xmlHeb += '         <detallista:gln>' + param_obj_Heb.seller.gln + '</detallista:gln> '
      xmlHeb += '         <detallista:alternatePartyIdentification '
      xmlHeb +=
        '             type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' + param_obj_Heb.seller.alternatePartyIdentification + '</detallista:alternatePartyIdentification> '
      xmlHeb += '     </detallista:seller> '

      xmlHeb += '     <detallista:shipTo> '
      if (param_obj_Heb.shipTo.gln_envio) {
        xmlHeb += '         <detallista:gln>' + param_obj_Heb.shipTo.gln_envio + '</detallista:gln> '
      } else {
        xmlHeb += '         <detallista:gln>' + param_obj_Heb.shipTo.gln + '</detallista:gln> '
      }
      xmlHeb += '         <detallista:nameAndAddress> '
      if (param_obj_Heb.shipTo.nombre_dir_envio) {
        xmlHeb += '             <detallista:name>' + param_obj_Heb.shipTo.nombre_dir_envio + '</detallista:name> '
      } else {
        xmlHeb += '             <detallista:name>' + param_obj_Heb.shipTo.nombre_dir + '</detallista:name> '
      }

      if (param_obj_Heb.shipTo.streetAddressOne_envio) {
        xmlHeb += '             <detallista:streetAddressOne>' + param_obj_Heb.shipTo.streetAddressOne_envio + '</detallista:streetAddressOne> '
      } else {
        xmlHeb += '             <detallista:streetAddressOne>' + param_obj_Heb.shipTo.streetAddressOne + '</detallista:streetAddressOne> '
      }

      if (param_obj_Heb.shipTo.city_envio) {
        xmlHeb += '             <detallista:city>' + param_obj_Heb.shipTo.city_envio + '</detallista:city> '
      } else {
        xmlHeb += '             <detallista:city>' + param_obj_Heb.shipTo.city + '</detallista:city> '
      }
      if (param_obj_Heb.shipTo.postalCode_envio) {
        xmlHeb += '             <detallista:postalCode>' + param_obj_Heb.shipTo.postalCode_envio + '</detallista:postalCode> '
      } else {
        xmlHeb += '             <detallista:postalCode>' + param_obj_Heb.shipTo.postalCode + '</detallista:postalCode> '
      }

      xmlHeb += '         </detallista:nameAndAddress> '
      xmlHeb += '     </detallista:shipTo> '

      xmlHeb += '     <detallista:currency currencyISOCode="' + param_obj_Heb.currencyISOCode + '"> '
      xmlHeb += '         <detallista:currencyFunction>BILLING_CURRENCY</detallista:currencyFunction> '
      xmlHeb += '         <detallista:rateOfChange>' + param_obj_Heb.exhrate + '</detallista:rateOfChange> '
      xmlHeb += '     </detallista:currency> '

      // xmlHeb += '     <detallista:InvoiceCreator> ';
      // xmlHeb += '     <detallista:gln>' + param_obj_Heb.seller.gln + '</detallista:gln> ';
      // xmlHeb += '     <detallista:alternatePartyIdentification type="VA">' + param_obj_Heb.seller.vat + '</detallista:alternatePartyIdentification> ';
      // xmlHeb += '     <detallista:nameAndAddress><detallista:name>' + param_obj_Heb.seller.name + '</detallista:name> ';
      // xmlHeb += '     <detallista:streetAddressOne>' + param_obj_Heb.seller.calle + '</detallista:streetAddressOne> ';
      // xmlHeb += '     <detallista:city>' + param_obj_Heb.seller.city + '</detallista:city> ';
      // xmlHeb += '     <detallista:postalCode>' + param_obj_Heb.seller.zip + '</detallista:postalCode></detallista:nameAndAddress> ';
      // xmlHeb += '     </detallista:InvoiceCreator> ';

      xmlHeb += '     <detallista:paymentTerms '
      xmlHeb += '         paymentTermsEvent="DATE_OF_INVOICE" '
      xmlHeb += '         PaymentTermsRelationTime="REFERENCE_AFTER"> '
      xmlHeb += '         <detallista:netPayment netPaymentTermsType="BASIC_NET"> '
      xmlHeb += '             <detallista:paymentTimePeriod> '
      xmlHeb += '                 <detallista:timePeriodDue timePeriod="DAYS"> '
      if (param_obj_Heb.terminos) {
        xmlHeb += '                     <detallista:value>' + param_obj_Heb.terminos + '</detallista:value> '
      } else {
        xmlHeb += '                     <detallista:value></detallista:value> '
      }

      xmlHeb += '                 </detallista:timePeriodDue> '
      xmlHeb += '             </detallista:paymentTimePeriod> '
      xmlHeb += '         </detallista:netPayment> '
      xmlHeb += '         <detallista:discountPayment discountType="ALLOWANCE_BY_PAYMENT_ON_TIME"> '
      xmlHeb += '         <detallista:percentage>' + param_obj_Heb.rateDiscount + '</detallista:percentage></detallista:discountPayment> '
      xmlHeb += '     </detallista:paymentTerms> '

      xmlHeb += '     <detallista:allowanceCharge  allowanceChargeType="CHARGE_GLOBAL" settlementType="OFF_INVOICE" sequenceNumber="TX"> '
      xmlHeb += '     <detallista:specialServicesType>TX</detallista:specialServicesType> '
      xmlHeb += '     <detallista:monetaryAmountOrPercentage> '
      xmlHeb += '     <detallista:rate base="INVOICE_VALUE"><detallista:percentage>0.00</detallista:percentage></detallista:rate> '
      xmlHeb += '     </detallista:monetaryAmountOrPercentage></detallista:allowanceCharge> '

      var lineItem = 0
      for (var itemLine in param_obj_Heb.item) {
        lineItem++
        xmlHeb += '         <detallista:lineItem type="SimpleInvoiceLineItemType" number="' + lineItem + '"> '
        xmlHeb += '             <detallista:tradeItemIdentification> '
        xmlHeb += '                 <detallista:gtin>' + param_obj_Heb.item[itemLine].sku + '</detallista:gtin> '
        xmlHeb += '             </detallista:tradeItemIdentification> '
        if (param_obj_Heb.item[itemLine].num_p_cliente) {
          xmlHeb +=
            '             <detallista:alternateTradeItemIdentification type="BUYER_ASSIGNED">' +
            param_obj_Heb.item[itemLine].num_p_cliente +
            '</detallista:alternateTradeItemIdentification> '
        } else {
          xmlHeb +=
            '             <detallista:alternateTradeItemIdentification type="BUYER_ASSIGNED">' +
            param_obj_Heb.item[itemLine].sku +
            '</detallista:alternateTradeItemIdentification> '
        }
        xmlHeb += '             <detallista:tradeItemDescriptionInformation language="ES"> '
        xmlHeb += '                 <detallista:longText>' + xml.escape({ xmlText: param_obj_Heb.item[itemLine].name }).substr(0, 34) + '</detallista:longText> '
        xmlHeb += '             </detallista:tradeItemDescriptionInformation> '
        xmlHeb +=
          '             <detallista:invoicedQuantity unitOfMeasure="' +
          param_obj_Heb.item[itemLine].unitOfMeasure +
          '">' +
          param_obj_Heb.item[itemLine].quantity +
          '</detallista:invoicedQuantity> '
        xmlHeb += '             <detallista:aditionalQuantity QuantityType="NUM_CONSUMER_UNITS">' + param_obj_Heb.item[itemLine].quantity + '</detallista:aditionalQuantity> '
        xmlHeb += '             <detallista:grossPrice> '
        xmlHeb += '                 <detallista:Amount>' + param_obj_Heb.item[itemLine].grossamt + '</detallista:Amount> '
        xmlHeb += '             </detallista:grossPrice> '
        xmlHeb += '             <detallista:netPrice> '
        xmlHeb += '                 <detallista:Amount>' + param_obj_Heb.item[itemLine].rate + '</detallista:Amount> '
        xmlHeb += '             </detallista:netPrice> '

        xmlHeb += '             <detallista:AdditionalInformation> '
        xmlHeb +=
          '             <detallista:referenceIdentification type="ON">' +
          param_obj_Heb.orderIdentification.referenceIdentification +
          '</detallista:referenceIdentification></detallista:AdditionalInformation> '
        xmlHeb += '             <detallista:LogisticUnits> '
        xmlHeb += '             <detallista:serialShippingContainerCode type="SRV">' + param_obj_Heb.item[itemLine].sku + '</detallista:serialShippingContainerCode> '
        xmlHeb += '             </detallista:LogisticUnits> '

        xmlHeb += '             <detallista:palletInformation> '
        xmlHeb += '                 <detallista:description type="BOX">CAJA</detallista:description> '
        xmlHeb += '                 <detallista:palletQuantity>' + param_obj_Heb.item[itemLine].quantity + '</detallista:palletQuantity> '
        xmlHeb += '                 <detallista:transport> '
        xmlHeb += '                     <detallista:methodOfPayment>PREPAID_BY_SELLER</detallista:methodOfPayment> '
        xmlHeb += '                 </detallista:transport> '
        xmlHeb += '             </detallista:palletInformation> '

        xmlHeb += '             <detallista:allowanceCharge settlementType="OFF_INVOICE" allowanceChargeType="CHARGE_GLOBAL"> '
        xmlHeb += '             <detallista:specialServicesType>ZZZ</detallista:specialServicesType> '
        xmlHeb += '             <detallista:monetaryAmountOrPercentage><detallista:percentagePerUnit>0</detallista:percentagePerUnit> '
        //                xmlHeb += '             <detallista:ratePerUnit><detallista:amountPerUnit>' + parseFloat(param_obj_Heb.item[itemLine].rate).toFixed(2) + '</detallista:amountPerUnit> ';
        xmlHeb += '             <detallista:ratePerUnit><detallista:amountPerUnit>' + 0.0 + '</detallista:amountPerUnit> '
        xmlHeb += '             </detallista:ratePerUnit></detallista:monetaryAmountOrPercentage></detallista:allowanceCharge> '

        xmlHeb += '             <detallista:tradeItemTaxInformation> '
        xmlHeb += '                 <detallista:taxTypeDescription>' + param_obj_Heb.item[itemLine].taxTypeDescription + '</detallista:taxTypeDescription> '
        xmlHeb += '                 <detallista:tradeItemTaxAmount> '
        xmlHeb += '                     <detallista:taxPercentage>' + param_obj_Heb.item[itemLine].iva_rate + '</detallista:taxPercentage> '
        xmlHeb += '                     <detallista:taxAmount>' + param_obj_Heb.item[itemLine].iva_importe + '</detallista:taxAmount> '
        xmlHeb += '                 </detallista:tradeItemTaxAmount> '
        xmlHeb += '                 <detallista:taxCategory>TRANSFERIDO</detallista:taxCategory> '
        xmlHeb += '             </detallista:tradeItemTaxInformation> '
        var amount_discount = param_obj_Heb.item[itemLine].Amount - param_obj_Heb.item[itemLine].discount
        xmlHeb += '             <detallista:totalLineAmount> '
        xmlHeb += '                 <detallista:grossAmount> '
        xmlHeb += '                     <detallista:Amount>' + param_obj_Heb.item[itemLine].grossamt + '</detallista:Amount> '
        xmlHeb += '                 </detallista:grossAmount> '
        xmlHeb += '                 <detallista:netAmount>'
        xmlHeb += '                     <detallista:Amount>' + param_obj_Heb.item[itemLine].amount + '</detallista:Amount> '
        xmlHeb += '                 </detallista:netAmount> '
        xmlHeb += '             </detallista:totalLineAmount> '
        xmlHeb += '         </detallista:lineItem> '
      }

      xmlHeb += '     <detallista:totalAmount> '
      xmlHeb += '         <detallista:Amount>' + param_obj_Heb.totalAmount + '</detallista:Amount> '
      xmlHeb += '     </detallista:totalAmount> '

      xmlHeb += '     <detallista:TotalAllowanceCharge allowanceOrChargeType="CHARGE"> '
      xmlHeb += '         <detallista:specialServicesType>' + param_obj_Heb.specialServicesType + '</detallista:specialServicesType> '
      xmlHeb += '         <detallista:Amount>' + param_obj_Heb.Amount + '</detallista:Amount> '
      xmlHeb += '     </detallista:TotalAllowanceCharge> '
      xmlHeb += ' </detallista:detallista> '
      xmlHeb += ' </cfdi:Complemento> '

      if (HEBamece) {
        respuesta.data = JSON.stringify(param_obj_Heb)
      } else {
        respuesta.data = xmlHeb
      }
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlHeb', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlHeb', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataHDepot(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        currency: {
          currencyISOCode: '',
          rateOfChange: ''
        },
        specialInstruction: {
          code: '',
          text: ''
        },
        headerInformation: {
          DeliveryDate: ''
        },
        requestForPaymentIdentification: {
          uniqueCreatorIdentification: ''
        },
        orderIdentification: {
          referenceIdentification: '',
          ReferenceDate: ''
        },
        AdditionalInformation: {
          referenceIdentification: ''
        },
        buyer: {
          gln: '',
          text: ''
        },
        seller: {
          gln: '',
          alternatePartyIdentification: ''
        },
        DeliveryNote: {
          referenceIdentification: '',
          ReferenceDate: ''
        },

        shipTo: {
          gln: '',
          streetAddressOne: '',
          city: '',
          postalCode: ''
        },
        totalAmount: '',
        discount: '',
        subtotal: '',
        specialServicesType: '',
        Amount: '',
        Tax_total: '',
        Tax_percent: '',
        item: [
          /*  {
                         sku: '',
                         name: '',
                         unitOfMeasure: 'PCE',
                         rate: '',
                         discount: '',
                         Amount: '',
                         taxTypeDescription: '',
                         taxPercentage: '',
                         taxAmount: '',

                     } */
        ]
      }
    }
    try {
      var arrayColumn = [
        'tranid',
        'total',
        'netamountnotax',
        'trandate',
        'taxtotal',
        'discountamount',
        'currency',
        'exchangerate',
        'custbody_efx_fe_total_text',
        'custbody_efx_fe_add_num_pedido',
        'custbody_efx_fe_add_ref_ad',
        'custbody_efx_fe_add_hd_seller',

        'customer.custentity_efx_fe_add_bgln_hd',
        'customer.custentity_efx_fe_add_sgln_hd',
        'customer.custentity_efx_fe_add_intnum_hd',
        'custbody_efx_fe_tax_json'
        // 'shippingaddress.custrecord_efx_fe_buyer_gln',
      ]

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      //Estructura por nodos

      //requestForPayment
      if (LookupField['trandate']) {
        var DeliveryDate = fechaSplit(LookupField['trandate'], '.', '-', 0, 1, 2, '')
        respuesta.data.headerInformation.DeliveryDate = DeliveryDate
      }
      //requestForPaymentIdentification
      respuesta.data.requestForPaymentIdentification.uniqueCreatorIdentification = LookupField['tranid'] || ''
      //orderIdentification Type=ON
      respuesta.data.orderIdentification.referenceIdentification = LookupField['custbody_efx_fe_add_num_pedido'] || ''
      //AdditionalInformation Type=ON
      respuesta.data.AdditionalInformation.referenceIdentification = LookupField['custbody_efx_fe_add_ref_ad'] || ''
      //buyer

      if (LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || '') {
        respuesta.data.buyer.gln = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || ''
      } else {
        respuesta.data.buyer.gln = LookupField['customer.custentity_efx_fe_add_bgln_hd'] || ''
      }

      //seller
      var sellerglnHD = LookupField['custbody_efx_fe_add_hd_seller'] || ''
      if (sellerglnHD) {
        respuesta.data.seller.gln = sellerglnHD[0].text
      } else {
        var sellerCustomer = LookupField['customer.custentity_efx_fe_add_sgln_hd'] || ''
        respuesta.data.seller.gln = sellerCustomer[0].text
      }
      respuesta.data.seller.alternatePartyIdentification = LookupField['customer.custentity_efx_fe_add_intnum_hd'] || ''
      //currency
      var idMoneda = LookupField['currency'] || ''
      var symbol_currency = search.lookupFields({
        type: search.Type.CURRENCY,
        id: idMoneda[0].value,
        columns: ['symbol']
      })
      respuesta.data.currency.rateOfChange = LookupField['exchangerate'] || ''
      respuesta.data.currency.currencyISOCode = symbol_currency['symbol']
      //TotalAllowanceCharge
      respuesta.data.discount = LookupField['discountamount']
      //baseAmount
      respuesta.data.subtotal = LookupField['netamountnotax']
      //payableAmount
      respuesta.data.totalAmount = LookupField['total']
      //Tax
      var tax_total = LookupField['custbody_efx_fe_tax_json']
      var json_tax_head = JSON.parse(tax_total)
      respuesta.data.Tax_total = json_tax_head.iva_total
      try {
        log.audit({ title: 'tax_total', details: tax_total })
        log.audit({ title: 'respuesta.data.subtotal', details: respuesta.data.subtotal })
        var porcentajeTax = (parseFloat(json_tax_head.iva_total) * 100) / parseFloat(respuesta.data.subtotal)
        log.audit({ title: 'porcentajeTax', details: porcentajeTax })
        respuesta.data.Tax_percent = porcentajeTax.toFixed(2)
      } catch (e) {
        respuesta.data.Tax_percent = '16.00'
      }

      respuesta.data.specialServicesType = 'DI'
      respuesta.data.Amount = '0.00'
      respuesta.data.exhrate = LookupField['exchangerate']

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: [
          'itemtype',
          'item',
          'quantity',
          'rate',
          'custcol_efx_fe_upc_code',
          'custcol_efx_descripcionempaquetado',
          'custcol_efx_empaquetado',
          'amount',
          'tax1amt',
          'grossamt',
          'unitsTEXT'
        ]
      }
      var idNameItemTex = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_id_name_item' }) || ''
      log.audit({ title: 'idNameItemTex', details: JSON.stringify(idNameItemTex) })
      var idName = ''
      if (idNameItemTex) {
        idName = idNameItemTex
      } else {
        idName = 'itemTEXT'
      }
      log.audit({ title: 'idName', details: JSON.stringify(idName) })
      objParametro.lineField.push(idName)

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        var descuento_total_lineas = 0
        for (var ir in transactionField.data.lineField) {
          //buscar descuentos
          var descuento_linea = 0
          var linea_disc = parseInt(ir) + 1
          var tamano_linefield = Object.keys(transactionField.data.lineField).length
          log.audit({ title: 'linea_disc', details: linea_disc })
          log.audit({ title: 'tamano_linefield', details: tamano_linefield })
          if (linea_disc < tamano_linefield) {
            if (transactionField.data.lineField[linea_disc].itemtype == 'Discount') {
              descuento_linea = transactionField.data.lineField[ir].amount
              if (descuento_linea < 0) {
                descuento_linea = descuento_linea * -1
              }
            }
          }
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var rec_transaction = record.load({
              type: param_type,
              id: param_id,
              isDynamic: true
            })

            var json_col = rec_transaction.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_efx_fe_tax_json',
              line: ir
            })
            var json_tax_col = JSON.parse(json_col)

            var quantity = transactionField.data.lineField[ir].quantity || 0
            var quantityType = parseFloat(quantity).toFixed(2) || 0
            descuento_total_lineas = descuento_total_lineas + descuento_linea
            respuesta.data.item.push({
              //tradeItemIdentification.gtin//sku code
              gtin: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              //tradeItemDescriptionInformation.longText
              longText: transactionField.data.lineField[ir][idName] || '',
              //invoicedQuantity
              unitOfMeasure: transactionField.data.lineField[ir].unitsTEXT || '',
              invoicedQuantity: quantityType,
              //palletInformation - en espera de la info
              palletdescription: transactionField.data.lineField[ir].custcol_efx_descripcionempaquetado || '',
              palletQuantity: transactionField.data.lineField[ir].custcol_efx_empaquetado || '',
              //tradeItemTaxInformation
              taxTypeDescription: 'VAT',
              //tradeItemTaxAmount
              iva_rate: json_tax_col.iva.rate.toFixed(2),
              iva_importe: json_tax_col.iva.importe,
              //totalLineAmount
              rate: transactionField.data.lineField[ir].rate || '',
              amount: transactionField.data.lineField[ir].amount || '',
              grossamt: transactionField.data.lineField[ir].grossamt || '',
              Amount: transactionField.data.lineField[ir].amount || '',
              ieps_rate: json_tax_col.ieps.rate.toFixed(4),
              ieps_importe: json_tax_col.ieps.importe,
              discount: descuento_linea
            })
          }
        }
        if (transactionField.data.bodyFieldValue.discounttotal) {
          respuesta.data.descuentototal = transactionField.data.bodyFieldValue.discounttotal
        } else {
          respuesta.data.descuentototal = descuento_total_lineas.toFixed(2)
        }
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataHDepot', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataHdepot', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlHDepot(param_obj_HDepot) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      var xmlHDepot = ''

      xmlHDepot += '<cfdi:Addenda>'
      xmlHDepot += '    <requestForPayment'
      xmlHDepot += '        type = "SimpleInvoiceType"'
      xmlHDepot += '        contentVersion = "1.3.1"'
      xmlHDepot += '        documentStructureVersion = "AMC7.1"'
      xmlHDepot += '        documentStatus = "ORIGINAL"'
      xmlHDepot += '        DeliveryDate = "' + param_obj_HDepot.headerInformation.DeliveryDate + '">'
      xmlHDepot += '        <requestForPaymentIdentification>'
      xmlHDepot += '            <entityType>INVOICE</entityType>'
      xmlHDepot +=
        '            <uniqueCreatorIdentification>' + param_obj_HDepot.requestForPaymentIdentification.uniqueCreatorIdentification + '</uniqueCreatorIdentification>'
      xmlHDepot += '        </requestForPaymentIdentification>'
      xmlHDepot += '        <orderIdentification>'
      xmlHDepot += '            <referenceIdentification type = "ON">' + param_obj_HDepot.orderIdentification.referenceIdentification + '</referenceIdentification>'
      xmlHDepot += '        </orderIdentification>'
      xmlHDepot += '        <AdditionalInformation>'
      if (param_obj_HDepot.AdditionalInformation.referenceIdentification) {
        xmlHDepot += '            <referenceIdentification type = "IV">' + param_obj_HDepot.AdditionalInformation.referenceIdentification + '</referenceIdentification>'
      } else {
        xmlHDepot += '            <referenceIdentification type = "IV">' + param_obj_HDepot.orderIdentification.referenceIdentification + '</referenceIdentification>'
      }
      xmlHDepot += '        </AdditionalInformation>'
      xmlHDepot += '        <buyer>'
      xmlHDepot += '            <gln>' + param_obj_HDepot.buyer.gln + '</gln>'
      xmlHDepot += '        </buyer>'
      xmlHDepot += '        <seller>'
      xmlHDepot += '            <gln>' + param_obj_HDepot.seller.gln + '</gln>'
      xmlHDepot +=
        '            <alternatePartyIdentification type = "SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' +
        param_obj_HDepot.seller.alternatePartyIdentification +
        '</alternatePartyIdentification>'
      xmlHDepot += '        </seller>'
      xmlHDepot += '        <currency currencyISOCode = "' + param_obj_HDepot.currency.currencyISOCode + '">'
      xmlHDepot += '            <currencyFunction>BILLING_CURRENCY</currencyFunction>'
      xmlHDepot += '            <rateOfChange>' + param_obj_HDepot.currency.rateOfChange + '</rateOfChange>'
      xmlHDepot += '        </currency>'
      var lineItem = 0
      for (var itemLine in param_obj_HDepot.item) {
        lineItem++
        xmlHDepot += '        <lineItem number = "' + lineItem + '" type = "SimpleInvoiceLineItemType">'
        xmlHDepot += '            <tradeItemIdentification>'
        xmlHDepot += '                <gtin>' + param_obj_HDepot.item[itemLine].gtin + '</gtin>'
        xmlHDepot += '            </tradeItemIdentification>'
        xmlHDepot += '            <alternateTradeItemIdentification type = "BUYER_ASSIGNED">' + param_obj_HDepot.item[itemLine].gtin + '</alternateTradeItemIdentification>'
        xmlHDepot += '            <tradeItemDescriptionInformation language = "ES">'
        xmlHDepot += '                <longText>' + param_obj_HDepot.item[itemLine].longText + '</longText>'
        xmlHDepot += '            </tradeItemDescriptionInformation>'
        xmlHDepot +=
          '            <invoicedQuantity unitOfMeasure = "' +
          param_obj_HDepot.item[itemLine].unitOfMeasure +
          '">' +
          param_obj_HDepot.item[itemLine].invoicedQuantity +
          '</invoicedQuantity>'
        xmlHDepot += '            <grossPrice>'
        xmlHDepot += '                <Amount>' + param_obj_HDepot.item[itemLine].rate.toFixed(2) + '</Amount>'
        xmlHDepot += '            </grossPrice>'
        xmlHDepot += '            <palletInformation>'
        xmlHDepot += '                <palletQuantity>' + param_obj_HDepot.item[itemLine].palletQuantity + '</palletQuantity>'
        xmlHDepot += '                <description type = "EXCHANGE_PALLETS">' + param_obj_HDepot.item[itemLine].palletdescription + '</description>'
        xmlHDepot += '                <transport>'
        xmlHDepot += '                    <methodOfPayment>PREPAID_BY_SELLER</methodOfPayment>'
        xmlHDepot += '                </transport>'
        xmlHDepot += '            </palletInformation>'
        xmlHDepot += '            <tradeItemTaxInformation>'
        xmlHDepot += '                <taxTypeDescription>' + param_obj_HDepot.item[itemLine].taxTypeDescription + '</taxTypeDescription>'
        xmlHDepot += '                <tradeItemTaxAmount>'
        xmlHDepot += '                    <taxPercentage>' + param_obj_HDepot.item[itemLine].iva_rate + '</taxPercentage>'
        xmlHDepot += '                    <taxAmount>' + param_obj_HDepot.item[itemLine].iva_importe + '</taxAmount>'
        xmlHDepot += '                </tradeItemTaxAmount>'
        xmlHDepot += '            </tradeItemTaxInformation>'
        xmlHDepot += '            <totalLineAmount>'
        xmlHDepot += '                <netAmount>'
        xmlHDepot += '                    <Amount>' + param_obj_HDepot.item[itemLine].amount.toFixed(2) + '</Amount>'
        xmlHDepot += '                </netAmount>'
        xmlHDepot += '            </totalLineAmount>'
        xmlHDepot += '        </lineItem>'
      }
      xmlHDepot += '        <totalAmount><Amount>' + param_obj_HDepot.subtotal + '</Amount></totalAmount>'
      xmlHDepot += '        <TotalAllowanceCharge allowanceOrChargeType = "ALLOWANCE">'
      xmlHDepot += '            <Amount>' + param_obj_HDepot.descuentototal + '</Amount>'
      xmlHDepot += '        </TotalAllowanceCharge>'
      xmlHDepot += '        <baseAmount>'
      xmlHDepot += '            <Amount>' + param_obj_HDepot.subtotal + '</Amount>'
      xmlHDepot += '        </baseAmount>'
      xmlHDepot += '        <tax type = "VAT">'
      xmlHDepot += '            <taxPercentage>' + param_obj_HDepot.Tax_percent + '</taxPercentage>'
      xmlHDepot += '            <taxAmount>' + param_obj_HDepot.Tax_total + '</taxAmount>'
      xmlHDepot += '            <taxCategory>TRANSFERIDO</taxCategory>'
      xmlHDepot += '        </tax>'
      xmlHDepot += '        <payableAmount>'
      xmlHDepot += '            <Amount>' + param_obj_HDepot.totalAmount + '</Amount>'
      xmlHDepot += '        </payableAmount>'
      xmlHDepot += '    </requestForPayment>'
      xmlHDepot += '</cfdi:Addenda>'

      respuesta.data = xmlHDepot
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlHeb', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlHeb', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataAmazon(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        TextoLibre: '',
        valorDelAtributo: '',
        nombreDelAtributo: '',
        identificacionUnica: ''
      }
    }
    try {
      var arrayColumn = ['custbody_efx_fe_add_amazon_txt', 'custbody_efx_fe_add_amazon_id', 'custbody_efx_fe_add_amazon_name', 'custbody_efx_fe_add_amazon_value']

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      //Estructura por nodos

      //requestForPayment

      //requestForPaymentIdentification
      respuesta.data.TextoLibre = LookupField['custbody_efx_fe_add_amazon_txt'] || ''
      respuesta.data.valorDelAtributo = LookupField['custbody_efx_fe_add_amazon_value'] || ''
      respuesta.data.nombreDelAtributo = LookupField['custbody_efx_fe_add_amazon_name'] || ''
      respuesta.data.identificacionUnica = LookupField['custbody_efx_fe_add_amazon_id'] || ''
      if (respuesta.data.TextoLibre || respuesta.data.valorDelAtributo || respuesta.data.nombreDelAtributo || respuesta.data.identificacionUnica) {
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataAmazon', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataAmazon', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlAmazon(param_obj_Amazon) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      var xmlAmazon = ''

      xmlAmazon += '<cfdi:Addenda>'
      xmlAmazon +=
        '    <amazon:ElementosAmazon xsi:schemaLocation="http://www.amazon.com.mx/AmazonAddenda http://repository.edicomnet.com/schemas/mx/cfd/addenda/AmazonAddenda.xsd"'
      xmlAmazon += '        xmlns:amazon="http://www.amazon.com.mx/AmazonAddenda">'
      xmlAmazon += '        <amazon:TextoLibre>' + param_obj_Amazon.TextoLibre + '</amazon:TextoLibre>'
      xmlAmazon +=
        '        <amazon:LosAtributos identificacionUnica="' +
        param_obj_Amazon.identificacionUnica +
        '" nombreDelAtributo="' +
        param_obj_Amazon.nombreDelAtributo +
        '" valorDelAtributo="' +
        param_obj_Amazon.valorDelAtributo +
        '"/>'
      xmlAmazon += '    </amazon:ElementosAmazon>'
      xmlAmazon += '</cfdi:Addenda>'

      respuesta.data = xmlAmazon
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlAmazon', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlAmazon', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataNadro(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        Orden: '',
        EntregaEntrante: '',
        terminos: '',
        item: []
      }
    }
    try {
      var arrayColumn = ['createdfrom', 'terms', 'custbody_efx_fe_add_nadro_eentrante']

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      //Estructura por nodos

      //requestForPayment

      //requestForPaymentIdentification
      var noOrden = LookupField['createdfrom'][0].text || ''
      noOrden = noOrden.split('Sales Order #').join('')
      noOrden = noOrden.split('Orden de venta #').join('')
      respuesta.data.Orden = noOrden
      respuesta.data.EntregaEntrante = LookupField['custbody_efx_fe_add_nadro_eentrante'] || '0'
      respuesta.data.terminos = LookupField['terms'] || ''
      if (respuesta.data.Orden && respuesta.data.EntregaEntrante && respuesta.data.terminos) {
        respuesta.succes = true
      }

      try {
        if (respuesta.data.terminos) {
          var terminos_obj = record.load({
            type: record.Type.TERM,
            id: respuesta.data.terminos[0].value
          })
          var dias = terminos_obj.getValue({ fieldId: 'daysuntilnetdue' }) || ''
          respuesta.data.terminos = dias
        }
      } catch (error_terms) {
        respuesta.data.terminos = ''
      }

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['itemtype', 'item', 'custcol_efx_fe_upc_code', 'amount', 'quantity']
      }
      var idNameItemTex = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_id_name_item' }) || ''
      log.audit({ title: 'idNameItemTex', details: JSON.stringify(idNameItemTex) })
      var idName = ''
      if (idNameItemTex) {
        idName = idNameItemTex
      } else {
        idName = 'itemTEXT'
      }
      log.audit({ title: 'idName', details: JSON.stringify(idName) })
      objParametro.lineField.push(idName)

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        for (var ir in transactionField.data.lineField) {
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            respuesta.data.item.push({
              CodEAN: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              TotalOC: transactionField.data.lineField[ir].amount || '',
              Piezas: transactionField.data.lineField[ir].quantity || ''
            })
          }
        }
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataAmazon', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataAmazon', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlNadro(param_obj_Nadro) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      var xmlNadro = ''

      xmlNadro += '<cfdi:Addenda>'
      var lineItem = 0
      for (var itemLine in param_obj_Nadro.item) {
        lineItem++
        xmlNadro += '    <DatosNadro>'
        xmlNadro += '        <Orden>' + param_obj_Nadro.Orden + '</Orden>'
        xmlNadro += '        <Plazo>' + param_obj_Nadro.terminos + '</Plazo>'
        xmlNadro += '        <EntregaEntrante>' + param_obj_Nadro.EntregaEntrante + '</EntregaEntrante>'
        xmlNadro += '    <PosicionOC>' + lineItem + '</PosicionOC>'
        xmlNadro += '    <TotalOC>' + param_obj_Nadro.item[itemLine].TotalOC.toFixed(2) + '</TotalOC>'
        xmlNadro += '    <CodEAN>' + param_obj_Nadro.item[itemLine].CodEAN + '</CodEAN>'
        xmlNadro += '    <Piezas>' + param_obj_Nadro.item[itemLine].Piezas + '</Piezas>'
        xmlNadro += '    </DatosNadro>'
      }
      xmlNadro += '</cfdi:Addenda>'

      respuesta.data = xmlNadro
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlxmlNadro', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlxmlNadro', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataHemsa(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        Orden: '',
        terminos: '',
        folio: '',
        serie: '',
        moneda: '',
        fecha: '',
        nombre_prov: '',
        correo_prov: '',
        rfc_prov: '',
        telefono_prov: '',
        tipo_prov: '',
        codigo_comp: '',
        codigo_prov: '',
        norec: '',
        ferec: '',
        item: []
      }
    }
    try {
      var arrayColumn = [
        'otherrefnum',
        'terms',
        'tranid',
        'currency',
        'trandate',
        'subsidiary.legalname',
        'subsidiary.custrecord_efx_fe_add_mail',
        'subsidiary.taxidnum',
        'subsidiary.custrecord_efx_fe_add_phone',
        'custbody_efx_fe_add_hemsa_tprov',
        'customer.custentity_efx_fe_add_hemsa_codcomp',
        'customer.custentity_efx_fe_add_hemsa_codprov',
        'custbody_efx_fe_add_hemsa_norec',
        'custbody_efx_fe_add_hemsa_ferec',
        'custbody_efx_fe_tax_json'
      ]

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      //Estructura por nodos

      //requestForPayment

      var foliofac = LookupField['tranid'] || ''
      var foliotran = ''
      var seritran = ''

      for (var i = 0; i < foliofac.length; i++) {
        if (foliofac[i] != '-') {
          var esnum = foliofac[i].match('\\d+')
          if (esnum) {
            foliotran = foliotran + foliofac[i]
          } else {
            seritran = seritran + foliofac[i]
          }
        }
      }

      //requestForPaymentIdentification
      var tipo_prov_obj = LookupField['custbody_efx_fe_add_hemsa_tprov']
      var tipo_prove = ''
      if (tipo_prov_obj) {
        var t_prov = tipo_prov_obj[0].text.split('-')
        tipo_prove = t_prov[0]
      } else {
        tipo_prove = ''
      }
      respuesta.data.Orden = LookupField['otherrefnum'] || ''
      respuesta.data.folio = foliotran || ''
      respuesta.data.serie = seritran || ''
      respuesta.data.moneda = LookupField['currency'] || ''
      log.audit({ title: 'respuesta.data.moneda', details: JSON.stringify(respuesta.data.moneda) })
      respuesta.data.fecha = LookupField['trandate'] || ''
      respuesta.data.nombre_prov = LookupField['subsidiary.legalname'] || ''
      respuesta.data.correo_prov = LookupField['subsidiary.custrecord_efx_fe_add_mail'] || ''
      respuesta.data.rfc_prov = LookupField['subsidiary.taxidnum'] || ''
      respuesta.data.telefono_prov = LookupField['subsidiary.custrecord_efx_fe_add_phone'] || ''
      respuesta.data.tipo_prov = tipo_prove || ''
      respuesta.data.codigo_comp = LookupField['customer.custentity_efx_fe_add_hemsa_codcomp'] || ''
      respuesta.data.codigo_prov = LookupField['customer.custentity_efx_fe_add_hemsa_codprov'] || ''
      respuesta.data.norec = LookupField['custbody_efx_fe_add_hemsa_norec'] || ''
      respuesta.data.ferec = LookupField['custbody_efx_fe_add_hemsa_ferec'] || ''
      respuesta.data.terminos = LookupField['terms'] || ''
      if (respuesta.data.Orden && respuesta.data.EntregaEntrante && respuesta.data.terminos) {
        respuesta.succes = true
      }

      try {
        if (respuesta.data.terminos) {
          var terminos_obj = record.load({
            type: record.Type.TERM,
            id: respuesta.data.terminos[0].value
          })
          respuesta.data.terminos = terminos_obj.getValue({ fieldId: 'daysuntilnetdue' })
        }
      } catch (error_terms) {
        respuesta.data.terminos = ''
      }

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['itemtype', 'item', 'custcol_efx_fe_upc_code', 'amount', 'quantity', 'rate', 'grossamt']
      }
      var idNameItemTex = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_id_name_item' }) || ''
      log.audit({ title: 'idNameItemTex', details: JSON.stringify(idNameItemTex) })
      var idName = ''
      if (idNameItemTex) {
        idName = idNameItemTex
      } else {
        idName = 'itemTEXT'
      }
      log.audit({ title: 'idName', details: JSON.stringify(idName) })
      objParametro.lineField.push(idName)

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        for (var ir in transactionField.data.lineField) {
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            respuesta.data.item.push({
              COD_EXT: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              COD_INT: transactionField.data.lineField[ir].item || '',
              CANT_FACT: transactionField.data.lineField[ir].quantity || '',
              PRECIO_U: transactionField.data.lineField[ir].rate || '',
              TOTAL_LIN_OUT: transactionField.data.lineField[ir].amount || '',
              TOTAL_LIN_IMP: transactionField.data.lineField[ir].grossamt || ''
            })
          }
        }
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataAmazon', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataAmazon', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlHemsa(param_obj_Hemsa) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      var xmlHemsa = ''

      xmlHemsa += '<cfdi:Addenda>'
      xmlHemsa += '   <HEMSA xmlns="http://www.facturaelectronica.mobi/CFD/HEMSA" '
      xmlHemsa += '       schemaLocation="http://www.facturaelectronica.mobi/CFD/HEMSA http://www.facturaelectronica.mobi/CFD/HEMSA/HEMSAv1.0.xsd">'
      xmlHemsa += '    <VERSION>'
      xmlHemsa += '        <TIPO>B2B</TIPO>'
      xmlHemsa += '        <NUMERO>2.0</NUMERO>'
      xmlHemsa += '    </VERSION>'
      xmlHemsa += '    <FISCAL>'
      xmlHemsa += '        <TIPO_DOCUMENTO>Factura</TIPO_DOCUMENTO>'
      xmlHemsa += '        <SERIE>' + param_obj_Hemsa.serie + '</SERIE>'
      xmlHemsa += '        <FOLIO>' + param_obj_Hemsa.folio + '</FOLIO>'
      xmlHemsa += '        <MONEDA>' + param_obj_Hemsa.moneda[0].text + '</MONEDA>'
      xmlHemsa += '        <TC>1</TC>'

      xmlHemsa += '    </FISCAL>'
      xmlHemsa += '    <NEGOCIO>'
      xmlHemsa += '        <DIVISION>HEMSA</DIVISION>'
      xmlHemsa += '        <TIPO>' + param_obj_Hemsa.tipo_prov + '</TIPO>'
      xmlHemsa += '        <INST_ESP></INST_ESP>'
      xmlHemsa += '        <GASTO></GASTO>'
      xmlHemsa += '        <PRESUPESTO></PRESUPESTO>'
      xmlHemsa += '    </NEGOCIO>'
      xmlHemsa += '    <COMERCIAL>'
      xmlHemsa += '        <OC>' + param_obj_Hemsa.Orden + '</OC>'
      xmlHemsa += '        <FOC>' + param_obj_Hemsa.fecha + '</FOC>'
      xmlHemsa += '        <CC>' + param_obj_Hemsa.codigo_comp + '</CC>'
      xmlHemsa += '    </COMERCIAL>'
      xmlHemsa += '    <PROVEEDOR>'
      xmlHemsa += '        <NOM_PROV>' + param_obj_Hemsa.nombre_prov + '</NOM_PROV>'
      xmlHemsa += '        <CORREO_CONT>' + param_obj_Hemsa.correo_prov + '</CORREO_CONT>'
      xmlHemsa += '        <VERIFICACION_RFC>' + param_obj_Hemsa.rfc_prov + '</VERIFICACION_RFC>'
      xmlHemsa += '        <TELEFONO>' + param_obj_Hemsa.telefono_prov + '</TELEFONO>'
      xmlHemsa += '        <VENDOR>' + param_obj_Hemsa.codigo_prov + '</VENDOR>'
      xmlHemsa += '    </PROVEEDOR>'

      xmlHemsa += '    <ALMACEN>'
      xmlHemsa += '       <ENTREGA></ENTREGA>'
      xmlHemsa += '       <ENTREGA_GLN></ENTREGA_GLN>'
      xmlHemsa += '       <NOMBRE_ALM></NOMBRE_ALM>'
      xmlHemsa += '       <DIR_ALM></DIR_ALM>'
      xmlHemsa += '       <CD_ALM></CD_ALM>'
      xmlHemsa += '    </ALMACEN>'

      xmlHemsa += '    <DETALLE>'
      var lineItem = 0
      for (var itemLine in param_obj_Hemsa.item) {
        lineItem++
        xmlHemsa += '        <LINEA>'
        xmlHemsa += '            <NUM_LIN>' + lineItem + '</NUM_LIN>'
        xmlHemsa += '            <COD_INT>' + param_obj_Hemsa.item[itemLine].COD_EXT + '</COD_INT>'
        xmlHemsa += '            <COD_EXT></COD_EXT>'
        xmlHemsa += '            <CANT_FACT>' + param_obj_Hemsa.item[itemLine].CANT_FACT + '</CANT_FACT>'
        xmlHemsa += '            <PRECIO_U>' + param_obj_Hemsa.item[itemLine].PRECIO_U + '</PRECIO_U>'
        xmlHemsa += '            <TOTAL_LIN_OUT>' + param_obj_Hemsa.item[itemLine].TOTAL_LIN_OUT + '</TOTAL_LIN_OUT>'
        xmlHemsa += '            <TOTAL_LIN_IMP>' + param_obj_Hemsa.item[itemLine].TOTAL_LIN_IMP + '</TOTAL_LIN_IMP>'
        xmlHemsa += '            <RA>' + param_obj_Hemsa.norec + '</RA>'
        xmlHemsa += '            <FE>' + param_obj_Hemsa.ferec + '</FE>'
        xmlHemsa += '        </LINEA>'
      }
      xmlHemsa += '    </DETALLE>'
      // xmlHemsa += '    <TOTAL>';
      // xmlHemsa += '        <SUM_SUBTOTAL>[SUBTOTAL(#0.00)]</SUM_SUBTOTAL>';
      // xmlHemsa += '        <IVA_16>[MONTOIMPUESTO4(#0.00)]</IVA_16>';
      // xmlHemsa += '        <IVA_11>0</IVA_11>';
      // xmlHemsa += '        <RET_IVA>0</RET_IVA>';
      // xmlHemsa += '        <RET_ISR>0</RET_ISR>';
      // xmlHemsa += '        <GRAN_TOTAL>[IMPORTE(#0.00)]</GRAN_TOTAL>';
      // xmlHemsa += '    </TOTAL>';
      xmlHemsa += '</HEMSA>'
      xmlHemsa += '</cfdi:Addenda>'

      respuesta.data = xmlHemsa
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlHemsa', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlHemsa', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataSabritas(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        tipo: '',
        idPedido: '',
        tipoDoc: '1',
        idProveedor: '',
        recepcion: []
      }
    }
    try {
      var arrayColumn = ['custbody_efx_sabritas_tipo', 'custbody_efx_sabritas_pedido', 'customer.custentity_efx_sabritas_proveedor', 'custbody_efx_sabritas_recepcion']

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      respuesta.data.tipo = LookupField['custbody_efx_sabritas_tipo'] || ''
      respuesta.data.idPedido = LookupField['custbody_efx_sabritas_pedido'] || ''
      respuesta.data.idProveedor = LookupField['customer.custentity_efx_sabritas_proveedor'] || ''

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: [
          'itemtype',
          'item',
          'units',
          // 'itemTEXT',
          'quantity',
          'rate',
          'amount',
          'grossamt',
          'description',
          'custcol_efx_fe_unidad_medida_sat'
        ]
      }
      var idNameItemTex = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_id_name_item' }) || ''
      log.audit({ title: 'idNameItemTex', details: JSON.stringify(idNameItemTex) })
      var idName = ''
      if (idNameItemTex) {
        idName = idNameItemTex
      } else {
        idName = 'itemTEXT'
      }
      log.audit({ title: 'idName', details: JSON.stringify(idName) })
      objParametro.lineField.push(idName)

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        var unidadesMed = new Array()

        for (var ir in transactionField.data.lineField) {
          if (transactionField.data.lineField[ir].units) {
            unidadesMed.push(transactionField.data.lineField[ir].units)
          }
        }

        if (unidadesMed.length > 0) {
          var filtrounits = new Array()
          var arrayunitsat = new Array()
          var arrayLinea = new Array()
          var clavesprod = new Array()

          var count = 0
          for (var i = 0; i < unidadesMed.length; i++) {
            count++
            filtrounits.push(['custrecord_mx_mapper_keyvalue_subkey', search.Operator.IS, unidadesMed[i]])
            if (count < unidadesMed.length) {
              filtrounits.push('OR')
            }
          }
          log.audit({ title: 'filtrounits', details: filtrounits })

          log.audit({ title: 'unidadesMed', details: unidadesMed })

          for (var ir in transactionField.data.lineField) {
            if (transactionField.data.lineField[ir].units) {
              var unitsLine = transactionField.data.lineField[ir].units
              var objitems = {
                claveprodserv: '',
                claveunidad: '',
                claveunidadNetsuite: ''
              }
              objitems.claveunidadNetsuite = unitsLine
              arrayLinea.push(objitems)
            }
          }

          log.audit({ title: 'arrayLinea', details: arrayLinea })
          log.audit({ title: 'unidadesMed', details: unidadesMed })

          log.audit({ title: 'filtrounits', details: filtrounits })
          var buscamapeo = search.create({
            type: 'customrecord_mx_mapper_keyvalue',
            filters: [['isinactive', search.Operator.IS, 'F'], 'AND', ['custrecord_mx_mapper_keyvalue_category', search.Operator.ANYOF, 10], 'AND', filtrounits],
            columns: [
              search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_category' }),
              search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_value' }),
              search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_key' }),
              search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_inputvalue' }),
              search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_rectype' }),
              search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_subkey' }),
              search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_subrectype' }),
              search.createColumn({ name: 'custrecord_mx_mapper_keyvalue_sublst_id' })
            ]
          })

          buscamapeo.run().each(function (result) {
            var unidadesobj = {
              idnetsuite: '',
              idmex: '',
              text: ''
            }
            unidadesobj.idnetsuite = result.getValue({ name: 'custrecord_mx_mapper_keyvalue_subkey' })
            unidadesobj.idmex = result.getValue({ name: 'custrecord_mx_mapper_keyvalue_value' })
            arrayunitsat.push(unidadesobj)
            return true
          })
          log.audit({ title: 'arrayunitsat', details: arrayunitsat })

          var buscaUnits = search.create({
            type: 'customrecord_mx_mapper_values',
            filters: [['isinactive', search.Operator.IS, 'F'], 'AND', ['custrecord_mx_mapper_value_category', search.Operator.ANYOF, 10]],
            columns: [
              search.createColumn({ name: 'custrecord_mx_mapper_value_category' }),
              search.createColumn({ name: 'custrecord_mx_mapper_value_inreport' }),
              search.createColumn({ name: 'custrecord_mx_mapper_value_isdefault' }),
              search.createColumn({ name: 'internalid' })
            ]
          })

          for (var x = 0; x < arrayunitsat.length; x++) {
            buscaUnits.run().each(function (result) {
              var idmapeo = result.getValue({ name: 'internalid' })
              if (idmapeo == arrayunitsat[x].idmex) {
                arrayunitsat[x].text = result.getValue({ name: 'custrecord_mx_mapper_value_inreport' })
              }
              return true
            })
          }

          for (var i = 0; i < arrayLinea.length; i++) {
            for (var x = 0; x < arrayunitsat.length; x++) {
              if (arrayLinea[i].claveunidadNetsuite == arrayunitsat[x].idnetsuite) {
                arrayLinea[i].claveunidad = arrayunitsat[x].text
              }
            }
          }

          log.audit({ title: 'arrayunitsat', details: arrayunitsat })
          log.audit({ title: 'arrayLinea', details: arrayLinea })
        }

        for (var ir in transactionField.data.lineField) {
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var quantity = transactionField.data.lineField[ir].quantity || 0
            var quantityType = parseFloat(quantity).toFixed(2) || 0

            log.audit({ title: 'ir', details: ir })

            respuesta.data.recepcion.push({
              idRecepcion: LookupField['custbody_efx_sabritas_recepcion'] || '',
              importe: transactionField.data.lineField[ir].amount || '',
              valorUnitario: transactionField.data.lineField[ir].rate || '',
              cantidad: quantityType,
              descripcion: transactionField.data.lineField[ir].description || '',
              unidad: arrayLinea[ir].claveunidad || ''
            })
          }
        }
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataSabritas', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataSabritas', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getxmlSabritas(param_obj_sabritas) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: '',
      message: []
    }
    try {
      respuesta.xmlns = ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
      respuesta.xmlns += 'xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd '
      respuesta.xmlns += 'http://www.sat.gob.mx/detallista http://www.sat.gob.mx/sitio_internet/cfd/detallista/detallista.xsd'
      respuesta.xmlns += '"'

      respuesta.xmlns += ' xmlns:xs="http://www.w3.org/2001/XMLSchema" '
      respuesta.xmlns += ' xmlns:detallista="http://www.sat.gob.mx/detallista" '

      var xmlSabritas = ''

      xmlSabritas += ' <cfdi:Addenda>'
      xmlSabritas +=
        ' <RequestCFD tipo="' +
        param_obj_sabritas.tipo +
        '" version="2.0" idPedido="' +
        param_obj_sabritas.idPedido +
        '"><Documento tipoDoc="' +
        param_obj_sabritas.tipoDoc +
        '"/><Proveedor idProveedor="' +
        param_obj_sabritas.idProveedor +
        '"/>'
      xmlSabritas += ' <Recepciones>'

      for (var i in param_obj_sabritas.recepcion) {
        xmlSabritas += ' <Recepcion idRecepcion="' + param_obj_sabritas.recepcion[i].idRecepcion + '"><Concepto'
        xmlSabritas += ' importe="' + param_obj_sabritas.recepcion[i].importe + '"'
        xmlSabritas += ' valorUnitario="' + param_obj_sabritas.recepcion[i].valorUnitario + '"'
        xmlSabritas += ' cantidad="' + param_obj_sabritas.recepcion[i].cantidad + '"'
        xmlSabritas += ' descripcion="' + param_obj_sabritas.recepcion[i].descripcion + '"'
        xmlSabritas += ' unidad="' + param_obj_sabritas.recepcion[i].unidad + '"/></Recepcion>'
      }

      xmlSabritas += ' </Recepciones>'
      xmlSabritas += ' </RequestCFD>'
      xmlSabritas += ' </cfdi:Addenda>'

      respuesta.data = xmlSabritas
      respuesta.succes = respuesta.message.length == 0
    } catch (error) {
      log.error({ title: 'error getxmlSabritas', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getxmlSabritas', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataFCA(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        tipoDocumento: '',
        notaCabecera: '',
        serie: '',
        folioFiscal: '',
        fecha: '',
        montoTotal: '',
        tipoCambio: '',
        tipoMoneda: '',
        proveedornombre: '',
        proveedorcodigo: '',
        destinonombre: '',
        destinocodigo: '',
        otrosCargoscodigo: '',
        monto: '',
        montoImpuesto: '',
        nombreImpuesto: '',
        items: []
      }
    }
    try {
      var arrayColumn = [
        'custbody_efx_fe_fca_tdoc',
        'tranid',
        'otherrefnum',
        'trandate',
        'total',
        'currency',
        'exchangerate',
        'taxtotal',
        'memo',
        'currency.symbol',
        'customer.custentity_efx_fe_fca_codprov',
        'customer.companyname',
        'shippingaddress.addressee',
        'shippingaddress.custrecord_efx_fe_fca_code'
      ]
      var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' })
      if (!existeSuiteTax) {
        arrayColumn.push('customer.taxitem')
      }

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      //Estructura por nodos

      respuesta.data.tipoDocumento = LookupField['custbody_efx_fe_fca_tdoc'][0].text || ''
      var foliofac = LookupField['tranid'] || ''
      var foliotran = ''
      var seritran = ''

      for (var i = 0; i < foliofac.length; i++) {
        if (foliofac[i] != '-') {
          var esnum = foliofac[i].match('\\d+')
          if (esnum) {
            foliotran = foliotran + foliofac[i]
          } else {
            seritran = seritran + foliofac[i]
          }
        }
      }
      respuesta.data.serie = seritran
      respuesta.data.folioFiscal = foliotran
      if (LookupField['trandate']) {
        var fechaTran = fechaSplit(LookupField['trandate'], '/', '-', 0, 1, 2, '')
        respuesta.data.fecha = fechaTran
      }

      respuesta.data.montoTotal = LookupField['total'] || ''
      respuesta.data.tipoCambio = LookupField['exchangerate'] || ''
      respuesta.data.notaCabecera = LookupField['memo'] || ''
      respuesta.data.ordenCompra = LookupField['otherrefnum'] || ''
      if (!existeSuiteTax) {
        respuesta.data.nombreImpuesto = LookupField['customer.taxitem'] || ''
      } else {
        respuesta.data.nombreImpuesto = 'VAT'
      }
      respuesta.data.montoImpuesto = LookupField['taxtotal'] || ''
      respuesta.data.tipoMoneda = LookupField['currency.symbol'] || ''
      respuesta.data.proveedornombre = LookupField['customer.companyname'] || ''
      respuesta.data.proveedorcodigo = LookupField['customer.custentity_efx_fe_fca_codprov'] || ''
      respuesta.data.destinonombre = LookupField['shippingaddress.addressee'] || ''
      respuesta.data.destinocodigo = LookupField['shippingaddress.custrecord_efx_fe_fca_code'] || ''
      respuesta.data.otrosCargoscodigo = ''
      respuesta.data.monto = ''

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['itemtype', 'quantity', 'unitsTEXT', 'rate', 'amount', 'custcol_efx_fe_fca_parte']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        for (var ir in transactionField.data.lineField) {
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            respuesta.data.items.push({
              quantity: transactionField.data.lineField[ir].quantity || 0,
              units: transactionField.data.lineField[ir].unitsTEXT || '',
              rate: transactionField.data.lineField[ir].rate || '',
              amount: transactionField.data.lineField[ir].amount || '',
              numeroparte: transactionField.data.lineField[ir].custcol_efx_fe_fca_parte || ''
            })
          }
        }

        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataFCA', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataFCA', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlFCA(param_obj_FCA) {
    log.audit({ title: 'param_obj_FCA', details: JSON.stringify(param_obj_FCA) })
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      var xmlFCA = ''

      xmlFCA += '<cfdi:Addenda>'
      xmlFCA +=
        '    <factura tipoDocumento="' +
        param_obj_FCA.tipoDocumento +
        '" TipoDocumentoFiscal="FA" version="1.0" serie="' +
        param_obj_FCA.serie +
        '" folioFiscal="' +
        param_obj_FCA.folioFiscal +
        '" fecha="' +
        param_obj_FCA.fecha +
        '" montoTotal="' +
        param_obj_FCA.montoTotal +
        '">'
      xmlFCA += '        <moneda tipoCambio="' + param_obj_FCA.tipoCambio + '" tipoMoneda="' + param_obj_FCA.tipoMoneda + '"/>'
      xmlFCA += '        <proveedor nombre="' + param_obj_FCA.proveedornombre + '" codigo="' + param_obj_FCA.proveedorcodigo + '"/>'
      xmlFCA += '        <destino nombre="' + param_obj_FCA.destinonombre + '" codigo="' + param_obj_FCA.destinocodigo + '"/>'
      if (param_obj_FCA.notaCabecera) {
        xmlFCA += '        <nota>' + param_obj_FCA.notaCabecera + '</nota>'
      }
      if (param_obj_FCA.nombreImpuesto[0]) {
        xmlFCA += '        <otrosCargos codigo="' + param_obj_FCA.nombreImpuesto[0].text + '" '
      } else {
        xmlFCA += '        <otrosCargos codigo="V6" '
      }
      xmlFCA += '        monto="' + param_obj_FCA.montoImpuesto + '"/>'
      xmlFCA += '        <partes>'
      var numeroLinea = 0
      var ammendment = ''
      var width = 5
      for (var i in param_obj_FCA.items) {
        numeroLinea = i + 1
        var numberOutput = Math.abs(numeroLinea)
        var length = numeroLinea.toString().length
        var zero = '0'

        if (width <= length) {
          numberOutput.toString()
        } else {
          for (var z = 0; z <= width - length; z++) {
            ammendment = ammendment + zero
          }
          ammendment = ammendment + numberOutput.toString()
        }

        xmlFCA +=
          '          <part cantidad="' +
          param_obj_FCA.items[i].quantity +
          '" unidadDeMedida="' +
          param_obj_FCA.items[i].units +
          '" precioUnitario="' +
          param_obj_FCA.items[i].rate.toFixed(2) +
          '" montoDeLinea="' +
          param_obj_FCA.items[i].amount.toFixed(2) +
          '"'
        if (param_obj_FCA.items[i].numeroparte) {
          xmlFCA += '           numero="' + param_obj_FCA.items[i].numeroparte + '">'
        } else {
          xmlFCA += '           numero="">'
        }

        xmlFCA +=
          '              <references ordenCompra="' + param_obj_FCA.ordenCompra + '" releaseRequisicion="' + param_obj_FCA.ordenCompra + '" ammendment="' + ammendment + '"/>'
        xmlFCA += '          </part>'
      }
      xmlFCA += '        </partes>'
      xmlFCA += '    </factura>'
      xmlFCA += '</cfdi:Addenda>'

      respuesta.data = xmlFCA
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlFCA', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlFCA', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataSuperNeto(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        tipoComprobante: '',
        plazoPago: '',
        observaciones: '',
        folio: '',
        items: []
      }
    }
    try {
      var arrayColumn = ['type', 'terms', 'memo', 'otherrefnum']

      var rec_transaction = record.load({
        type: param_type,
        id: param_id,
        isDynamic: true
      })

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      //Estructura por nodos
      if (LookupField['type'][0].value == 'CustInvc') {
        respuesta.data.tipoComprobante = 'FE'
      } else if (LookupField['type'][0].value == 'CustCred') {
        respuesta.data.tipoComprobante = 'NC'
      }

      if (LookupField['terms']) {
        respuesta.data.plazoPago = LookupField['terms'][0].text || ''
      }

      respuesta.data.observaciones = LookupField['memo'] || 'NINGUNA'
      respuesta.data.folio = LookupField['otherrefnum'] || ''

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['itemtype', 'quantity', 'unitsTEXT', 'rate', 'amount', 'custcol_efx_fe_upc_code', 'custcol_efx_fe_add_sn_cajas', 'custcol_efx_fe_add_sn_preciocaja']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        for (var ir in transactionField.data.lineField) {
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var json_col = rec_transaction.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_efx_fe_tax_json',
              line: ir
            })
            var json_tax_col = JSON.parse(json_col)

            var totalimptraslados = parseFloat(json_tax_col.iva.importe || 0) + parseFloat(json_tax_col.ieps.importe || 0)
            respuesta.data.items.push({
              codigoBarras: transactionField.data.lineField[ir].custcol_efx_fe_upc_code,
              cajasEntregadas: transactionField.data.lineField[ir].custcol_efx_fe_add_sn_cajas || '',
              precioUnitarioCaja: transactionField.data.lineField[ir].custcol_efx_fe_add_sn_preciocaja || '',
              piezasEntregadas: transactionField.data.lineField[ir].quantity || '',
              precioUnitarioPieza: transactionField.data.lineField[ir].rate || '',
              totalImpuestosTrasladados: totalimptraslados.toFixed(2),
              impuestoIVA: 'IVA',
              importeIVA: json_tax_col.iva.importe,
              tasaIVA: json_tax_col.iva.rate,
              impuestoIEPS: 'IEPS',
              importeIEPS: json_tax_col.ieps.importe,
              tasaIEPS: json_tax_col.ieps.rate
            })
          }
        }

        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataFCA', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataFCA', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlSuperNeto(param_obj_SuperNeto) {
    log.audit({ title: 'param_obj_SuperNeto', details: JSON.stringify(param_obj_SuperNeto) })
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      var xmlSuperNeto = ''

      xmlSuperNeto += '<cfdi:Addenda>'
      xmlSuperNeto +=
        '    <ap:ap tipoComprobante="' +
        param_obj_SuperNeto.tipoComprobante +
        '" plazoPago="' +
        param_obj_SuperNeto.plazoPago +
        '" observaciones="' +
        param_obj_SuperNeto.observaciones +
        '">'
      xmlSuperNeto += '        <ap:Detalle folio="' + param_obj_SuperNeto.folio + '">'
      for (var i in param_obj_SuperNeto.items) {
        xmlSuperNeto +=
          '            <ap:Producto codigoBarras="' +
          param_obj_SuperNeto.items[i].codigoBarras +
          '" cajasEntregadas="' +
          param_obj_SuperNeto.items[i].cajasEntregadas +
          '" precioUnitarioCaja="' +
          param_obj_SuperNeto.items[i].precioUnitarioCaja +
          '" piezasEntregadas="' +
          param_obj_SuperNeto.items[i].piezasEntregadas +
          '" precioUnitarioPieza="' +
          param_obj_SuperNeto.items[i].precioUnitarioPieza +
          '">'
        xmlSuperNeto += '                <ap:Impuestos totalImpuestosTrasladados="' + param_obj_SuperNeto.items[i].totalImpuestosTrasladados + '">'
        xmlSuperNeto += '                    <ap:Traslados>'
        if (param_obj_SuperNeto.items[i].importeIVA) {
          xmlSuperNeto +=
            '                        <ap:Traslado impuesto="' +
            param_obj_SuperNeto.items[i].impuestoIVA +
            '" importe="' +
            param_obj_SuperNeto.items[i].importeIVA +
            '" tasa="' +
            param_obj_SuperNeto.items[i].tasaIVA +
            '"/>'
        }
        if (param_obj_SuperNeto.items[i].importeIEPS) {
          xmlSuperNeto +=
            '                        <ap:Traslado impuesto="' +
            param_obj_SuperNeto.items[i].impuestoIEPS +
            '" importe="' +
            param_obj_SuperNeto.items[i].importeIEPS +
            '" tasa="' +
            param_obj_SuperNeto.items[i].tasaIEPS +
            '"/>'
        }
        xmlSuperNeto += '                    </ap:Traslados>'
        xmlSuperNeto += '                </ap:Impuestos>'
        xmlSuperNeto += '            </ap:Producto>'
      }
      xmlSuperNeto += '        </ap:Detalle>'
      xmlSuperNeto += '    </ap:ap>'
      xmlSuperNeto += '</cfdi:Addenda>'

      respuesta.data = xmlSuperNeto
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getxmlSuperNeto', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getxmlSuperNeto', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataCostco(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        TipoProveedor: '',
        NoProveedor: '',
        SufijoProveedor: '',
        NoOc: '',
        Moneda: ''
      }
    }
    try {
      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: [
          'customer.custentity_efx_fe_add_c_tipprov',
          'customer.custentity_efx_fe_add_c_noprov',
          'customer.custentity_efx_fe_add_c_sufijoprov',
          'custbody_efx_fe_add_c_contrare',
          'otherrefnum',
          'currency.symbol'
        ]
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })
      respuesta.data.TipoProveedor = LookupField['customer.custentity_efx_fe_add_c_tipprov'] || ''
      respuesta.data.NoProveedor = LookupField['customer.custentity_efx_fe_add_c_noprov'] || ''
      respuesta.data.SufijoProveedor = LookupField['custbody_efx_fe_add_c_contrare'] || ''

      respuesta.data.NoOc = LookupField['otherrefnum'] || ''
      respuesta.data.Moneda = LookupField['currency.symbol'] || ''
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getDataCosco', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataCosco', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlCostco(param_obj_Cosco) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      respuesta.xmlns += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
      respuesta.xmlns += ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" '

      var xmlCosco = ''
      xmlCosco += '<cfdi:Addenda>'
      xmlCosco += '    <Addenda_Costco_Detecno>'
      xmlCosco += '        <Version>1.0</Version>'
      xmlCosco += '        <TipoProveedor>' + param_obj_Cosco.TipoProveedor + '</TipoProveedor>'
      xmlCosco += '        <NoProveedor>' + param_obj_Cosco.NoProveedor + '</NoProveedor>'
      xmlCosco += '        <SufijoProveedor>' + param_obj_Cosco.SufijoProveedor + '</SufijoProveedor>'
      xmlCosco += '        <NoOc>' + param_obj_Cosco.NoOc + '</NoOc>'
      xmlCosco += '        <Moneda>' + param_obj_Cosco.Moneda + '</Moneda>'
      xmlCosco += '    </Addenda_Costco_Detecno>'
      xmlCosco += '</cfdi:Addenda>'
      respuesta.data = xmlCosco
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlCosco', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlCosco', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataWalmartDoc(param_id, param_type, SUBSIDIARIES) {
    var respuesta = {
      succes: false,
      data: {
        NumeroControl: '',
        NumeroSegmento: '',
        Folio: '',
        Serie: '',
        FechaFactura: '',
        OrdenDeCompra: '',
        FechaOrdenDeCompra: '',
        NumeroHacienda: '',
        DatosComprador: '',
        DatosCompradorNombre: '',
        RfcComprador: '',
        BuyerGln: '',
        BuyerGlnFacturacion: '',
        DatosProveedor: '',
        DatosProveedorCalle: '',
        DatosProveedorNuExt: '',
        DatosProveedorColonia: '',
        DatosProveedorMunicipio: '',
        DatosProveedorEstado: '',
        DatosProveedorPais: '',
        DatosProveedorCodigoPostal: '',
        DatosProveedorNombre: '',
        RfcProveedor: '',
        SellerGln: '',
        NumeroProveedor: '',
        LugarEntrega: '',
        LugarEntregaCalle: '',
        LugarEntregaNuExt: '',
        LugarEntregaColonia: '',
        LugarEntregaMunicipio: '',
        LugarEntregaEstado: '',
        LugarEntregaPais: '',
        LugarEntregaCodigoPostal: '',
        LugarEntregaNombre: '',
        Moneda: '',
        TipoCambio: '',
        DiasVencimiento: '',
        Total: '',
        Subtotal: '',
        Taxtotal: '',
        Ratetax: '',
        MontoLetra: '',
        items: []
      }
    }
    try {
      var array_columnas = new Array()
      array_columnas.push('tranid')
      array_columnas.push('trandate')
      array_columnas.push('otherrefnum')
      array_columnas.push('terms')
      array_columnas.push('exchangerate')
      array_columnas.push('total')
      array_columnas.push('taxtotal')
      array_columnas.push('custbody_efx_fe_total_text')
      array_columnas.push('customer.custentity_efx_fe_add_wd_nhacienda')
      array_columnas.push('customer.custentity_efx_fe_add_wd_nproveedor')
      array_columnas.push('customer.custentity_mx_rfc')
      array_columnas.push('customer.custentity_efx_fe_add_wd_bgln')
      array_columnas.push('customer.custentity_efx_fe_add_wd_sgln')
      array_columnas.push('custbody_efx_fe_add_wd_ncontrol')
      array_columnas.push('custbody_efx_fe_add_wd_nsegmento')
      array_columnas.push('custbody_efx_fe_add_wd_fechaoc')
      array_columnas.push('currency.symbol')
      array_columnas.push('billingaddress.addressee')
      array_columnas.push('billingaddress.custrecord_streetname')
      array_columnas.push('billingaddress.custrecord_streetnum')
      array_columnas.push('billingaddress.custrecord_colonia')
      array_columnas.push('billingaddress.custrecord_village')
      array_columnas.push('billingaddress.state')
      array_columnas.push('billingaddress.zip')
      array_columnas.push('billingaddress.country')
      array_columnas.push('billingaddress.custrecord_efx_fe_buyer_gln' || '')
      array_columnas.push('shippingaddress.addressee')
      array_columnas.push('shippingaddress.custrecord_streetname')
      array_columnas.push('shippingaddress.custrecord_streetnum')
      array_columnas.push('shippingaddress.custrecord_colonia')
      array_columnas.push('shippingaddress.custrecord_village')
      array_columnas.push('shippingaddress.state')
      array_columnas.push('shippingaddress.zip')
      array_columnas.push('shippingaddress.country')
      array_columnas.push('shippingaddress.custrecord_efx_fe_buyer_gln' || '')
      if (SUBSIDIARIES) {
        array_columnas.push('subsidiary')
      }

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: array_columnas
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })
      var direccionsubsidiaria = ''
      var rfcsubsidiaria = ''
      var direccioncliente = ''
      var direccionclienteFacturacion = ''

      direccioncliente =
        LookupField['shippingaddress.addressee'] +
        '+' +
        LookupField['shippingaddress.custrecord_streetname'] +
        '+' +
        LookupField['shippingaddress.custrecord_streetnum'] +
        '+' +
        LookupField['shippingaddress.custrecord_colonia'] +
        '+' +
        LookupField['shippingaddress.custrecord_village'] +
        '+' +
        LookupField['shippingaddress.state'] +
        '+' +
        LookupField['shippingaddress.zip']
      respuesta.data.DatosCompradorNombre = LookupField['shippingaddress.addressee'] || ''
      respuesta.data.LugarEntregaNombre = LookupField['shippingaddress.addressee'] || ''
      respuesta.data.LugarEntregaCalle = LookupField['shippingaddress.custrecord_streetname'] || ''
      respuesta.data.LugarEntregaNuExt = LookupField['shippingaddress.custrecord_streetnum'] || ''
      respuesta.data.LugarEntregaColonia = LookupField['shippingaddress.custrecord_colonia'] || ''
      respuesta.data.LugarEntregaMunicipio = LookupField['shippingaddress.custrecord_village'] || ''
      respuesta.data.LugarEntregaEstado = LookupField['shippingaddress.state'] || ''
      respuesta.data.LugarEntregaCodigoPostal = LookupField['shippingaddress.zip'] || ''
      respuesta.data.LugarEntregaPais = LookupField['shippingaddress.country'][0].text || ''

      direccionclienteFacturacion =
        LookupField['billingaddress.addressee'] +
        '+' +
        LookupField['billingaddress.custrecord_streetname'] +
        '+' +
        LookupField['billingaddress.custrecord_streetnum'] +
        '+' +
        LookupField['billingaddress.custrecord_colonia'] +
        '+' +
        LookupField['billingaddress.custrecord_village'] +
        '+' +
        LookupField['billingaddress.state'] +
        '+' +
        LookupField['billingaddress.zip']
      respuesta.data.DatosCompradorNombreFacturacion = LookupField['billingaddress.addressee'] || ''
      respuesta.data.LugarEntregaNombreFacturacion = LookupField['billingaddress.addressee'] || ''
      respuesta.data.LugarEntregaCalleFacturacion = LookupField['billingaddress.custrecord_streetname'] || ''
      respuesta.data.LugarEntregaNuExtFacturacion = LookupField['billingaddress.custrecord_streetnum'] || ''
      respuesta.data.LugarEntregaColoniaFacturacion = LookupField['billingaddress.custrecord_colonia'] || ''
      respuesta.data.LugarEntregaMunicipioFacturacion = LookupField['billingaddress.custrecord_village'] || ''
      respuesta.data.LugarEntregaEstadoFacturacion = LookupField['billingaddress.state'] || ''
      respuesta.data.LugarEntregaCodigoPostalFacturacion = LookupField['billingaddress.zip'] || ''
      respuesta.data.LugarEntregaPaisFacturacion = LookupField['billingaddress.country'][0].text || ''

      if (SUBSIDIARIES) {
        var idsubsidiaria = LookupField['subsidiary'][0].value
        if (idsubsidiaria) {
          var array_sub = new Array()
          array_sub.push('address.addressee')
          array_sub.push('address.custrecord_streetname')
          array_sub.push('address.custrecord_streetnum')
          array_sub.push('address.custrecord_colonia')
          array_sub.push('address.custrecord_village')
          array_sub.push('address.state')
          array_sub.push('address.zip')
          array_sub.push('address.country')
          array_sub.push('taxidnum')
          var LookupFieldSubsidiary = search.lookupFields({
            type: search.Type.SUBSIDIARY,
            id: idsubsidiaria,
            columns: array_sub
          })
          direccionsubsidiaria =
            LookupFieldSubsidiary['address.addressee'] +
            '+' +
            LookupFieldSubsidiary['address.custrecord_streetname'] +
            '+' +
            LookupFieldSubsidiary['address.custrecord_streetnum'] +
            '+' +
            LookupFieldSubsidiary['address.custrecord_colonia'] +
            '+' +
            LookupFieldSubsidiary['address.custrecord_village'] +
            '+' +
            LookupFieldSubsidiary['address.state'] +
            '+' +
            LookupFieldSubsidiary['address.zip']
          rfcsubsidiaria = LookupFieldSubsidiary['taxidnum'] || ''
          respuesta.data.DatosProveedorNombre = LookupFieldSubsidiary['address.addressee'] || ''
          respuesta.data.DatosProveedorCalle = LookupFieldSubsidiary['address.custrecord_streetname'] || ''
          respuesta.data.DatosProveedorNuExt = LookupFieldSubsidiary['address.custrecord_streetnum'] || ''
          respuesta.data.DatosProveedorColonia = LookupFieldSubsidiary['address.custrecord_colonia'] || ''
          respuesta.data.DatosProveedorMunicipio = LookupFieldSubsidiary['address.custrecord_village'] || ''
          respuesta.data.DatosProveedorEstado = LookupFieldSubsidiary['address.state'] || ''
          respuesta.data.DatosProveedorPais = LookupFieldSubsidiary['address.country'][0].text || ''
          respuesta.data.DatosProveedorCodigoPostal = LookupFieldSubsidiary['address.zip'] || ''
        }
      } else {
        var LookupFieldSubsidiary = config.load({
          type: config.Type.COMPANY_INFORMATION
        })
        var subrec_dir_sub = LookupFieldSubsidiary.getSubrecord({
          fieldId: 'mainaddress'
        })
        direccionsubsidiaria =
          subrec_dir_sub.getValue({ fieldId: 'addressee' }) +
          '+' +
          subrec_dir_sub.getValue({ fieldId: 'custrecord_streetname' }) +
          '+' +
          subrec_dir_sub.getValue({ fieldId: 'custrecord_streetnum' }) +
          '+' +
          subrec_dir_sub.getValue({ fieldId: 'custrecord_colonia' }) +
          '+' +
          subrec_dir_sub.getValue({ fieldId: 'custrecord_village' }) +
          '+' +
          subrec_dir_sub.getValue({ fieldId: 'state' }) +
          '+' +
          subrec_dir_sub.getValue({ fieldId: 'zip' })
        rfcsubsidiaria = LookupFieldSubsidiary.getValue({ fieldId: 'employerid' }) || ''
        respuesta.data.DatosProveedorNombre = subrec_dir_sub.getValue({ fieldId: 'addressee' }) || ''
        respuesta.data.DatosProveedorCalle = subrec_dir_sub.getValue({ fieldId: 'custrecord_streetname' }) || ''
        respuesta.data.DatosProveedorNuExt = subrec_dir_sub.getValue({ fieldId: 'custrecord_streetnum' }) || ''
        respuesta.data.DatosProveedorColonia = subrec_dir_sub.getValue({ fieldId: 'custrecord_colonia' }) || ''
        respuesta.data.DatosProveedorMunicipio = subrec_dir_sub.getValue({ fieldId: 'custrecord_village' }) || ''
        respuesta.data.DatosProveedorEstado = subrec_dir_sub.getValue({ fieldId: 'state' }) || ''
        respuesta.data.DatosProveedorPais = subrec_dir_sub.getValue({ fieldId: 'country' }) || ''
        respuesta.data.DatosProveedorCodigoPostal = subrec_dir_sub.getValue({ fieldId: 'zip' }) || ''
      }

      log.audit({ title: 'direccionsubsidiaria', details: JSON.stringify(direccionsubsidiaria) })

      var DiasVencimiento = ''
      try {
        if (LookupField['terms']) {
          var terminos_obj = record.load({
            type: record.Type.TERM,
            id: LookupField['terms'][0].value
          })
          DiasVencimiento = terminos_obj.getValue({ fieldId: 'daysuntilnetdue' })
        }
      } catch (error_terms) {
        DiasVencimiento = ''
      }
      var foliofac = LookupField['tranid'] || ''
      var foliotran = ''
      var seritran = ''

      for (var i = 0; i < foliofac.length; i++) {
        if (foliofac[i] != '-') {
          var esnum = foliofac[i].match('\\d+')
          if (esnum) {
            foliotran = foliotran + foliofac[i]
          } else {
            seritran = seritran + foliofac[i]
          }
        }
      }

      respuesta.data.NumeroControl = LookupField['custbody_efx_fe_add_wd_ncontrol'] || ''
      respuesta.data.NumeroSegmento = LookupField['custbody_efx_fe_add_wd_nsegmento'] || ''
      respuesta.data.Folio = foliotran || ''
      respuesta.data.Serie = seritran || ''
      respuesta.data.FechaFactura = LookupField['trandate'] || ''
      respuesta.data.OrdenDeCompra = LookupField['otherrefnum'] || ''
      respuesta.data.FechaOrdenDeCompra = LookupField['custbody_efx_fe_add_wd_fechaoc'] || ''
      respuesta.data.NumeroHacienda = LookupField['customer.custentity_efx_fe_add_wd_nhacienda'] || ''

      if (LookupField['shippingaddress.custrecord_efx_fe_buyer_gln']) {
        respuesta.data.BuyerGln = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || ''
      } else {
        respuesta.data.BuyerGln = LookupField['customer.custentity_efx_fe_add_wd_bgln'] || ''
      }

      if (LookupField['billingaddress.custrecord_efx_fe_buyer_gln']) {
        respuesta.data.BuyerGlnFacturacion = LookupField['billingaddress.custrecord_efx_fe_buyer_gln'] || ''
      }

      respuesta.data.DatosComprador = direccioncliente
      respuesta.data.DatosCompradorFacturacion = direccionclienteFacturacion

      respuesta.data.RfcComprador = LookupField['customer.custentity_mx_rfc'] || ''
      respuesta.data.DatosProveedor = direccionsubsidiaria || ''
      respuesta.data.RfcProveedor = rfcsubsidiaria || ''
      respuesta.data.NumeroProveedor = LookupField['customer.custentity_efx_fe_add_wd_nproveedor'] || ''
      respuesta.data.SellerGln = LookupField['customer.custentity_efx_fe_add_wd_sgln'] || ''
      respuesta.data.LugarEntrega = direccioncliente || ''
      respuesta.data.LugarEntregaFacturacion = direccionclienteFacturacion || ''

      respuesta.data.Moneda = LookupField['currency.symbol'] || ''
      respuesta.data.TipoCambio = LookupField['exchangerate'] || ''
      respuesta.data.DiasVencimiento = DiasVencimiento || 0
      respuesta.data.Total = LookupField['total'] || ''
      respuesta.data.Taxtotal = LookupField['taxtotal'] || ''
      if (parseFloat(LookupField['taxtotal']) > 0) {
        respuesta.data.Ratetax = 16
      } else {
        respuesta.data.Ratetax = 0
      }
      respuesta.data.Subtotal = parseFloat(LookupField['total']) - parseFloat(LookupField['taxtotal'])
      respuesta.data.MontoLetra = LookupField['custbody_efx_fe_total_text'] || ''

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['itemtype', 'quantity', 'rate', 'amount', 'custcol_efx_fe_add_wd_upc', 'description', 'tax1amt', 'taxrate1']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        for (var ir in transactionField.data.lineField) {
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            respuesta.data.items.push({
              cantidad: transactionField.data.lineField[ir].quantity || '',
              preciounitario: transactionField.data.lineField[ir].rate || '',
              monto: transactionField.data.lineField[ir].amount || '',
              upc: transactionField.data.lineField[ir].custcol_efx_fe_add_wd_upc || '',
              descripcion: transactionField.data.lineField[ir].description || '',
              montoImpuesto: transactionField.data.lineField[ir].tax1amt || '',
              rateImpuesto: transactionField.data.lineField[ir].taxrate1 || ''
            })
          }
        }
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataWalmartDoc', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataWalmartDoc', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlWalmartDoc(param_obj_DocWalmart) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      var documentoWalmart = ''
      documentoWalmart += 'UNB+UNOB:1+276139:ZZ+925485MX00:8+190208:072542+' + param_obj_DocWalmart.NumeroControl + "' "
      documentoWalmart += "UNH+5391+INVOIC:D:01B:UN:AMC002' "
      documentoWalmart += 'BGM+380+' + param_obj_DocWalmart.Folio + "+9' "
      documentoWalmart += 'DTM+137:' + param_obj_DocWalmart.FechaFactura + ":204' "
      documentoWalmart += 'FTX+ZZZ+++' + param_obj_DocWalmart.MontoLetra + "' "
      documentoWalmart += 'RFF+ON:' + param_obj_DocWalmart.OrdenDeCompra + "' "
      documentoWalmart += 'DTM+171:' + param_obj_DocWalmart.FechaOrdenDeCompra + ":102' "
      documentoWalmart += 'RFF+BT:' + param_obj_DocWalmart.Serie + "' "
      documentoWalmart += 'RFF+ATZ:' + param_obj_DocWalmart.NumeroHacienda + "' "
      documentoWalmart += 'NAD+BY+7507003100001::9++' + param_obj_DocWalmart.DatosComprador + "' "
      documentoWalmart += 'RFF+GN:' + param_obj_DocWalmart.RfcComprador + "' "
      documentoWalmart += 'NAD+SU+7504023351::9++' + param_obj_DocWalmart.DatosProveedor + "' "
      documentoWalmart += 'RFF+GN:' + param_obj_DocWalmart.RfcProveedor + "' "
      documentoWalmart += 'RFF+IA:' + param_obj_DocWalmart.NumeroProveedor + "' "
      documentoWalmart += 'NAD+ST+::9++' + param_obj_DocWalmart.LugarEntrega + "' "
      documentoWalmart += 'CUX+2:' + param_obj_DocWalmart.Moneda + ":4' "
      documentoWalmart += 'PAT+1++5:3:D:' + param_obj_DocWalmart.DiasVencimiento + "' "
      var lineas = 0
      for (var i in param_obj_DocWalmart.items) {
        lineas++
        documentoWalmart += 'LIN+' + lineas + '++' + param_obj_DocWalmart.items[i].upc + ":SRV::9' "
        documentoWalmart += 'IMD+F++:::' + param_obj_DocWalmart.items[i].descripcion + "' "
        documentoWalmart += 'QTY+47:' + param_obj_DocWalmart.items[i].cantidad + ":EA' "
        documentoWalmart += 'MOA+203:' + param_obj_DocWalmart.items[i].monto + "' "
        documentoWalmart += 'PRI+AAA:' + param_obj_DocWalmart.items[i].preciounitario + "::::EA' "
        documentoWalmart += 'TAX+7+VAT+++:::' + param_obj_DocWalmart.items[i].rateImpuesto + "+B' "
        documentoWalmart += 'MOA+124:' + param_obj_DocWalmart.items[i].montoImpuesto + "' "
      }
      documentoWalmart += "UNS+S' "
      documentoWalmart += 'CNT+2:' + lineas + "' "
      documentoWalmart += 'MOA+9:' + param_obj_DocWalmart.Total + "' "
      documentoWalmart += 'MOA+79:' + param_obj_DocWalmart.Subtotal + "' "
      documentoWalmart += 'MOA+125:' + param_obj_DocWalmart.Subtotal + "' "
      documentoWalmart += 'TAX+7+VAT+++:::' + param_obj_DocWalmart.Ratetax + "+B' "
      documentoWalmart += 'MOA+124:' + param_obj_DocWalmart.Taxtotal + "' "
      documentoWalmart += 'UNT+' + param_obj_DocWalmart.NumeroSegmento + '+' + param_obj_DocWalmart.NumeroControl + "' "
      documentoWalmart += 'UNZ+1+' + param_obj_DocWalmart.NumeroControl + "'"

      var xmlWalmartDoc = ''
      xmlWalmartDoc += '<cfdi:Addenda>'
      xmlWalmartDoc += '    <Documento>'
      xmlWalmartDoc += documentoWalmart
      xmlWalmartDoc += '    </Documento>'
      xmlWalmartDoc += '</cfdi:Addenda>'
      respuesta.data = xmlWalmartDoc
      //respuesta.data = JSON.stringify(param_obj_DocWalmart);
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getWalmartDoc', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getWalmartDoc', details: JSON.stringify(respuesta) })
    return respuesta
  }
  function getXmlWalmartMySuite(param_obj_DocWalmart) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      var documentoWalmart = ''
      documentoWalmart += 'UNB+UNOB:1+276139:ZZ+925485MX00:8+190208:072542+' + param_obj_DocWalmart.NumeroControl + "' "
      documentoWalmart += "UNH+5391+INVOIC:D:01B:UN:AMC002' "
      documentoWalmart += 'BGM+380+' + param_obj_DocWalmart.Folio + "+9' "
      documentoWalmart += 'DTM+137:' + param_obj_DocWalmart.FechaFactura + ":204' "
      documentoWalmart += 'FTX+ZZZ+++' + param_obj_DocWalmart.MontoLetra + "' "
      documentoWalmart += 'RFF+ON:' + param_obj_DocWalmart.OrdenDeCompra + "' "
      documentoWalmart += 'DTM+171:' + param_obj_DocWalmart.FechaOrdenDeCompra + ":102' "
      documentoWalmart += 'RFF+BT:' + param_obj_DocWalmart.Serie + "' "
      documentoWalmart += 'RFF+ATZ:' + param_obj_DocWalmart.NumeroHacienda + "' "
      documentoWalmart += 'NAD+BY+7507003100001::9++' + param_obj_DocWalmart.DatosComprador + "' "
      documentoWalmart += 'RFF+GN:' + param_obj_DocWalmart.RfcComprador + "' "
      documentoWalmart += 'NAD+SU+7504023351::9++' + param_obj_DocWalmart.DatosProveedor + "' "
      documentoWalmart += 'RFF+GN:' + param_obj_DocWalmart.RfcProveedor + "' "
      documentoWalmart += 'RFF+IA:' + param_obj_DocWalmart.NumeroProveedor + "' "
      documentoWalmart += 'NAD+ST+::9++' + param_obj_DocWalmart.LugarEntrega + "' "
      documentoWalmart += 'CUX+2:' + param_obj_DocWalmart.Moneda + ":4' "
      documentoWalmart += 'PAT+1++5:3:D:' + param_obj_DocWalmart.DiasVencimiento + "' "
      var lineas = 0
      for (var i in param_obj_DocWalmart.items) {
        lineas++
        documentoWalmart += 'LIN+' + lineas + '++' + param_obj_DocWalmart.items[i].upc + ":SRV::9' "
        documentoWalmart += 'IMD+F++:::' + param_obj_DocWalmart.items[i].descripcion + "' "
        documentoWalmart += 'QTY+47:' + param_obj_DocWalmart.items[i].cantidad + ":EA' "
        documentoWalmart += 'MOA+203:' + param_obj_DocWalmart.items[i].monto + "' "
        documentoWalmart += 'PRI+AAA:' + param_obj_DocWalmart.items[i].preciounitario + "::::EA' "
        documentoWalmart += 'TAX+7+VAT+++:::' + param_obj_DocWalmart.items[i].rateImpuesto + "+B' "
        documentoWalmart += 'MOA+124:' + param_obj_DocWalmart.items[i].montoImpuesto + "' "
      }
      documentoWalmart += "UNS+S' "
      documentoWalmart += 'CNT+2:' + lineas + "' "
      documentoWalmart += 'MOA+9:' + param_obj_DocWalmart.Total + "' "
      documentoWalmart += 'MOA+79:' + param_obj_DocWalmart.Subtotal + "' "
      documentoWalmart += 'MOA+125:' + param_obj_DocWalmart.Subtotal + "' "
      documentoWalmart += 'TAX+7+VAT+++:::' + param_obj_DocWalmart.Ratetax + "+B' "
      documentoWalmart += 'MOA+124:' + param_obj_DocWalmart.Taxtotal + "' "
      documentoWalmart += 'UNT+' + param_obj_DocWalmart.NumeroSegmento + '+' + param_obj_DocWalmart.NumeroControl + "' "
      documentoWalmart += 'UNZ+1+' + param_obj_DocWalmart.NumeroControl + "'"

      var xmlWalmartDoc = ''
      xmlWalmartDoc += '<cfdi:Addenda>'
      xmlWalmartDoc += '    <Documento>'
      xmlWalmartDoc += documentoWalmart
      xmlWalmartDoc += '    </Documento>'
      xmlWalmartDoc += '</cfdi:Addenda>'
      //respuesta.data = xmlWalmartDoc;
      respuesta.data = JSON.stringify(param_obj_DocWalmart)
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getWalmartDoc', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getWalmartDoc', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataDSW(param_id, param_type) {
    log.audit({ title: 'param_type', details: JSON.stringify(param_type) })
    try {
      var tipodoc = ''
      if (param_type == 'invoice') {
        tipodoc = 'INVOICE'
      } else if (param_type == 'creditmemo') {
        tipodoc = 'CREDIT_NOTE'
      }

      var respuesta = {
        succes: false,
        data: {
          TIPODOCTO: tipodoc,
          FECHADOCTO: '',
          FOLIO: '',
          IMPORTELETRAS: '',
          PEDIDO: '',
          NORECEP: '',
          FECHARECEP: '',
          numeroproveedor: '',
          buyergln: '',
          sellergln: '',
          shipTogln: '',
          personOrDepartmentName: '',
          shipToAname: '',
          shipToAstreet: '',
          shipToAcity: '',
          shipToAcp: '',
          currency: '',
          TIPOCAMBIO: '',
          DIASCREDITO: '',
          PORCENTAJEDESCF: '',
          specialInstruction: [],
          //items

          item: [],
          //finitem
          SUBTOTAL: '',
          IMPORTEANTESIMPUESTOS: 0,
          PORCENIMPUESTO: '',
          MONTOIMPUESTO: '',
          TRANSFERIDO: '',
          IMPORTE: ''
        }
      }

      var arrayColumn = [
        'tranid',
        'trandate',
        'custbody_efx_fe_total_text',
        'otherrefnum',
        'custbody_efx_fe_add_dsw_numrec', //numero de recepcion
        'custbody_efx_fe_add_dsw_fecrec', //fecha recepcion
        'customer.custentity_efx_fe_add_dsw_buygln', //buyergln
        'customer.custentity_efx_fe_add_dsw_numprov', //buyergln
        'customer.custentity_efx_fe_add_dsw_selgln', //sellergln
        'customer.custentity_efx_fe_add_dsw_perdep', //personOrDepartmentName
        'billingaddress.custrecord_efx_fe_add_dsw_shipgln', //shipTogln
        'billingaddress.attention', //shipToAname
        'billingaddress.addressee', //shipToAname
        'billingaddress.custrecord_streetname', //shipToAstreet
        'billingaddress.city', //shipToAcity
        'billingaddress.zip', //shipToAcp
        'shippingaddress.custrecord_efx_fe_add_dsw_shipgln', //shipTogln
        'shippingaddress.attention', //shipToAname
        'shippingaddress.addressee', //shipToAname
        'shippingaddress.custrecord_streetname', //shipToAstreet
        'shippingaddress.city', //shipToAcity
        'shippingaddress.zip', //shipToAcp
        'currency',
        'exchangerate',
        'terms',
        'custbody_efx_fe_tax_json',
        'total',
        'taxtotal'
      ]

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      // try{
      //     arrayColumn.push('discounttotal');
      //     var LookupField = search.lookupFields({
      //         type: search.Type.TRANSACTION,
      //         id: param_id,
      //         columns: arrayColumn
      //     });
      //
      // }catch (errordisc){
      //     var tamarraycolum = arrayColumn.length - 1;
      //     arrayColumn.splice(tamarraycolum,1);
      //
      //     var LookupField = search.lookupFields({
      //         type: search.Type.TRANSACTION,
      //         id: param_id,
      //         columns: arrayColumn
      //     });
      // }

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      var horaMexico = horaActual()

      if (LookupField['trandate']) {
        // respuesta.data.ReferenceDate = fechaSplit(LookupField['custbody_efx_cf_fechaordencompra'], '/', '-', 0, 1, 2, 'T' + horaMexico);
        respuesta.data.FECHADOCTO = fechaSplit(LookupField['trandate'], '/', '', 0, 1, 2, '')
      }

      if (LookupField['custbody_efx_fe_add_dsw_fecrec']) {
        // respuesta.data.DeliveryDate = fechaSplit(LookupField['trandate'], '/', '-', 0, 1, 2, 'T' + horaMexico);
        respuesta.data.FECHARECEP = fechaSplit(LookupField['custbody_efx_fe_add_dsw_fecrec'], '/', '', 0, 1, 2, '')
      }

      respuesta.data.FOLIO = LookupField['tranid'] || ''
      respuesta.data.IMPORTELETRAS = LookupField['custbody_efx_fe_total_text'] || ''
      respuesta.data.PEDIDO = LookupField['otherrefnum'] || ''
      respuesta.data.NORECEP = LookupField['custbody_efx_fe_add_dsw_numrec'] || ''
      respuesta.data.buyergln = LookupField['customer.custentity_efx_fe_add_dsw_buygln'] || ''
      respuesta.data.numeroproveedor = LookupField['customer.custentity_efx_fe_add_dsw_numprov'] || ''
      respuesta.data.sellergln = LookupField['customer.custentity_efx_fe_add_dsw_selgln'] || ''
      respuesta.data.personOrDepartmentName = LookupField['customer.custentity_efx_fe_add_dsw_perdep'] || ''

      respuesta.data.shipTogln = LookupField['shippingaddress.custrecord_efx_fe_add_dsw_shipgln'] || ''
      respuesta.data.shipToAname = LookupField['shippingaddress.addressee'] || ''
      if (!LookupField['shippingaddress.addressee']) {
        respuesta.data.shipToAname = LookupField['shippingaddress.attention'] || ''
      }
      respuesta.data.shipToAstreet = LookupField['shippingaddress.custrecord_streetname'] || ''
      respuesta.data.shipToAcity = LookupField['shippingaddress.city'] || ''
      respuesta.data.shipToAcp = LookupField['shippingaddress.zip'] || ''
      respuesta.data.currency = LookupField['currency'] || ''
      respuesta.data.TIPOCAMBIO = LookupField['exchangerate'] || ''
      respuesta.data.DIASCREDITO = LookupField['terms'] || ''
      try {
        if (respuesta.data.DIASCREDITO) {
          var terminos_obj = record.load({
            type: record.Type.TERM,
            id: respuesta.data.DIASCREDITO[0].value
          })
          respuesta.data.DIASCREDITO = terminos_obj.getValue({ fieldId: 'daysuntilnetdue' })
        }
      } catch (error_terms) {
        respuesta.data.DIASCREDITO = ''
      }

      var json_tax = ''
      if (LookupField['custbody_efx_fe_tax_json']) {
        json_tax = JSON.parse(LookupField['custbody_efx_fe_tax_json'])
        var percdisc = (parseFloat(json_tax.descuentoSinImpuesto) * 100) / parseFloat(json_tax.subtotal)
        respuesta.data.PORCENTAJEDESCF = percdisc.toFixed(2)
        respuesta.data.SUBTOTAL = parseFloat(json_tax.subtotal)
        respuesta.data.IMPORTEANTESIMPUESTOS = parseFloat(json_tax.subtotal)
        respuesta.data.MONTOIMPUESTO = parseFloat(json_tax.totalImpuestos)
        respuesta.data.TRANSFERIDO = parseFloat(json_tax.iva_total) + parseFloat(json_tax.ieps_total)
        respuesta.data.IMPORTE = parseFloat(json_tax.total)
      }

      var textoespinstructions = ''
      if (LookupField['terms']) {
        textoespinstructions = LookupField['terms']
      }
      log.audit({ title: 'textoespinstructions', details: textoespinstructions })
      if (textoespinstructions) {
        respuesta.data.specialInstruction = new Array()
        respuesta.data.specialInstruction.push({
          code: 'AAB',
          text: textoespinstructions[0].text
        })
      }

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['custcol_efx_fe_upc_code', 'description', 'quantity', 'amount', 'grossamt', 'itemtype', 'item', 'itemTEXT', 'rate', 'custcol_efx_fe_tax_json']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        var descuento_total_lineas = 0
        var rec_transaction = record.load({
          type: param_type,
          id: param_id,
          isDynamic: true
        })

        for (var ir in transactionField.data.lineField) {
          //buscar descuentos
          var descuento_linea = 0
          var linea_disc = parseInt(ir) + 1
          var tamano_linefield = Object.keys(transactionField.data.lineField).length
          log.audit({ title: 'linea_disc', details: linea_disc })
          log.audit({ title: 'tamano_linefield', details: tamano_linefield })
          if (linea_disc < tamano_linefield) {
            if (transactionField.data.lineField[linea_disc].itemtype == 'Discount') {
              descuento_linea = transactionField.data.lineField[ir].amount
              if (descuento_linea < 0) {
                descuento_linea = descuento_linea * -1
              }
            }
          }
          //fin de buscar descuentos
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var json_col = rec_transaction.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_efx_fe_tax_json',
              line: ir
            })

            var json_tax_col = ''
            if (json_col) {
              json_tax_col = JSON.parse(json_col)
            }

            descuento_total_lineas = descuento_total_lineas + descuento_linea
            respuesta.data.item.push({
              ItemGtin: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              PRODDESCRIP: transactionField.data.lineField[ir].description || '',
              CANTIDAD: transactionField.data.lineField[ir].quantity || '',
              PRODPRECIO: transactionField.data.lineField[ir].amount || '',
              PRODPRECIOBRUTO: transactionField.data.lineField[ir].grossamt || '',
              PRODSUBTOTMENOSDESC: transactionField.data.lineField[ir].amount || '',
              PRODSUBTOTAL: transactionField.data.lineField[ir].amount || ''
            })
          }
        }
      }

      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getDataDSW', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataDSW', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlDSW(param_obj_DSW) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      var foliofac = param_obj_DSW.FOLIO || ''
      var foliotran = ''
      var seritran = ''

      for (var i = 0; i < foliofac.length; i++) {
        if (foliofac[i] != '-') {
          var esnum = foliofac[i].match('\\d+')
          if (esnum) {
            foliotran = foliotran + foliofac[i]
          } else {
            seritran = seritran + foliofac[i]
          }
        }
      }

      var xmlDSW = ''

      xmlDSW += '<cfdi:Addenda>'
      xmlDSW +=
        '    <requestForPayment type="SimpleInvoiceType" contentVersion="1.3.1" documentStructureVersion="AMC7.1" documentStatus="ORIGINAL" DeliveryDate="' +
        param_obj_DSW.FECHADOCTO +
        '">'
      xmlDSW += '        <requestForPaymentIdentification>'
      xmlDSW += '            <entityType>' + param_obj_DSW.TIPODOCTO + '</entityType>'
      xmlDSW += '            <uniqueCreatorIdentification>' + param_obj_DSW.FOLIO + '</uniqueCreatorIdentification>'
      xmlDSW += '        </requestForPaymentIdentification>'

      for (var i in param_obj_DSW.specialInstruction) {
        xmlDSW += '        <specialInstruction code ="' + param_obj_DSW.specialInstruction[i].code + '">'
        xmlDSW += '             <text>' + param_obj_DSW.specialInstruction[i].text + '</text>'
        xmlDSW += '        </specialInstruction>'
      }

      xmlDSW += '        <specialInstruction code="ZZZ">'
      xmlDSW += '            <text>' + param_obj_DSW.IMPORTELETRAS + '</text>'
      xmlDSW += '        </specialInstruction>'
      xmlDSW += '        <orderIdentification>'
      xmlDSW += '            <referenceIdentification type="ON">' + param_obj_DSW.PEDIDO + '</referenceIdentification>'
      xmlDSW += '            <ReferenceDate>' + param_obj_DSW.FECHARECEP + '</ReferenceDate>'
      xmlDSW += '        </orderIdentification>'
      xmlDSW += '        <AdditionalInformation>'
      xmlDSW += '            <referenceIdentification type="ATZ">' + param_obj_DSW.PEDIDO + '</referenceIdentification>'
      xmlDSW += '            <referenceIdentification type="ON">' + param_obj_DSW.PEDIDO + '</referenceIdentification>'
      xmlDSW += '            <referenceIdentification type="AWR">' + param_obj_DSW.NORECEP + '</referenceIdentification>'
      xmlDSW += '        </AdditionalInformation>'
      xmlDSW += '        <DeliveryNote>'
      xmlDSW += '            <referenceIdentification>' + foliotran + '</referenceIdentification>'
      xmlDSW += '            <ReferenceDate>' + param_obj_DSW.FECHADOCTO + '</ReferenceDate>'
      xmlDSW += '        </DeliveryNote>'
      xmlDSW += '        <buyer>'
      xmlDSW += '            <gln>' + param_obj_DSW.buyergln + '</gln>'
      xmlDSW += '            <contactInformation>'
      xmlDSW += '                <personOrDepartmentName>'
      xmlDSW += '                    <text>' + param_obj_DSW.personOrDepartmentName + '</text>'
      xmlDSW += '                </personOrDepartmentName>'
      xmlDSW += '            </contactInformation>'
      xmlDSW += '        </buyer>'
      xmlDSW += '        <seller>'
      xmlDSW += '            <gln>' + param_obj_DSW.sellergln + '</gln>'
      xmlDSW += '            <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' + param_obj_DSW.numeroproveedor + '</alternatePartyIdentification>'
      xmlDSW += '        </seller>'
      xmlDSW += '        <shipTo>'
      xmlDSW += '            <gln>' + param_obj_DSW.shipTogln + '</gln>'
      xmlDSW += '            <nameAndAddress>'
      xmlDSW += '                <name>' + param_obj_DSW.shipToAname + '</name>'
      xmlDSW += '                <streetAddressOne>' + param_obj_DSW.shipToAstreet + '</streetAddressOne>'
      xmlDSW += '                <city>' + param_obj_DSW.shipToAcity + '</city>'
      xmlDSW += '                <postalCode>' + param_obj_DSW.shipToAcp + '</postalCode>'
      xmlDSW += '            </nameAndAddress>'
      xmlDSW += '        </shipTo>'
      xmlDSW += '        <currency currencyISOCode="MXN">'
      xmlDSW += '            <currencyFunction>BILLING_CURRENCY</currencyFunction>'
      xmlDSW += '            <rateOfChange>' + parseInt(param_obj_DSW.TIPOCAMBIO) + '</rateOfChange>'
      xmlDSW += '        </currency>'
      xmlDSW += '        <paymentTerms paymentTermsEvent="DATE_OF_INVOICE" PaymentTermsRelationTime="REFERENCE_AFTER">'
      xmlDSW += '            <netPayment netPaymentTermsType="BASIC_NET">'
      xmlDSW += '                <paymentTimePeriod>'
      xmlDSW += '                    <timePeriodDue timePeriod="DAYS">'
      xmlDSW += '                        <value>' + param_obj_DSW.DIASCREDITO + '</value>'
      xmlDSW += '                    </timePeriodDue>'
      xmlDSW += '                </paymentTimePeriod>'
      xmlDSW += '            </netPayment>'
      xmlDSW += '        </paymentTerms>'
      xmlDSW += '        <shipmentDetail />'
      xmlDSW += '        <allowanceCharge settlementType="BILL_BACK" allowanceChargeType="ALLOWANCE_GLOBAL" sequeenceNumber="">'
      xmlDSW += '            <specialServicesType>CAC</specialServicesType>'
      xmlDSW += '            <monetaryAmountOrPercentage>'
      xmlDSW += '                <rate base="INVOICE_VALUE">'
      xmlDSW += '                    <percentage>' + param_obj_DSW.PORCENTAJEDESCF + '</percentage>'
      xmlDSW += '                </rate>'
      xmlDSW += '            </monetaryAmountOrPercentage>'
      xmlDSW += '        </allowanceCharge>'
      //xmlDSW += '        <INILISTAPROD>';
      var lineas = 0
      for (var i in param_obj_DSW.item) {
        lineas++
        xmlDSW += '            <lineItem type="SimpleInvoiceLineItemType" number="' + lineas + '">'
        xmlDSW += '                <tradeItemIdentification>'
        xmlDSW += '                    <gtin>' + param_obj_DSW.item[i].ItemGtin + '</gtin>'
        xmlDSW += '                </tradeItemIdentification>'
        xmlDSW += '                <alternateTradeItemIdentification type="BUYER_ASSIGNED" />'
        xmlDSW += '                <tradeItemDescriptionInformation language="ES">'
        xmlDSW += '                    <longText>' + param_obj_DSW.item[i].PRODDESCRIP + '</longText>'
        xmlDSW += '                </tradeItemDescriptionInformation>'
        xmlDSW += '                <invoicedQuantity unitOfMeasure="EA">' + param_obj_DSW.item[i].CANTIDAD + '</invoicedQuantity>'
        xmlDSW += '                <aditionalQuantity QuantityType="NUM_CONSUMER_UNITS">1</adicionalQuantity>'
        xmlDSW += '                <grossPrice>'
        xmlDSW += '                    <Amount>' + param_obj_DSW.item[i].PRODPRECIO.toFixed(2) + '</Amount>'
        xmlDSW += '                </grossPrice>'
        xmlDSW += '                <netPrice>'
        xmlDSW += '                    <Amount>' + param_obj_DSW.item[i].PRODPRECIOBRUTO.toFixed(2) + '</Amount>'
        xmlDSW += '                </netPrice>'
        if (param_obj_DSW.item[i].PEDIDO) {
          xmlDSW += '                <AdditionalInformation>'
          xmlDSW += '                    <referenceIdentification  type="ON">' + param_obj_DSW.item[i].PEDIDO + '</referenceIdentification>'
          xmlDSW += '                </AdditionalInformation>'
        }
        xmlDSW += '                <totalLineAmount>'
        xmlDSW += '                    <grossAmount>'
        xmlDSW += '                        <Amount>' + param_obj_DSW.item[i].PRODSUBTOTMENOSDESC.toFixed(2) + '</Amount>'
        xmlDSW += '                    </grossAmount>'
        xmlDSW += '                    <netAmount>'
        xmlDSW += '                        <Amount>' + param_obj_DSW.item[i].PRODSUBTOTAL.toFixed(2) + '</Amount>'
        xmlDSW += '                    </netAmount>'
        xmlDSW += '                </totalLineAmount>'
        xmlDSW += '            </lineItem>'
      }
      //xmlDSW += '        </INILISTAPROD>';
      xmlDSW += '        <totalAmount>'
      xmlDSW += '            <Amount>' + param_obj_DSW.SUBTOTAL.toFixed(2) + '</Amount>'
      xmlDSW += '        </totalAmount>'
      xmlDSW += '        <TotalAllowanceCharge allowanceOrChargeType="ALLOWANCE">'
      xmlDSW += '        <Amount>0</Amount>'
      xmlDSW += '        </TotalAllowanceCharge>'
      xmlDSW += '        <baseAmount>'
      xmlDSW += '            <Amount>' + param_obj_DSW.IMPORTEANTESIMPUESTOS.toFixed(2) + '</Amount>'
      xmlDSW += '        </baseAmount>'
      xmlDSW += '        <tax type="VAT">'
      var porcentajeimpuesto = (parseFloat(param_obj_DSW.MONTOIMPUESTO) * 100) / parseFloat(param_obj_DSW.IMPORTEANTESIMPUESTOS)
      xmlDSW += '            <taxPercentage>' + porcentajeimpuesto + '</taxPercentage>'
      xmlDSW += '            <taxAmount>' + param_obj_DSW.MONTOIMPUESTO.toFixed(2) + '</taxAmount>'
      xmlDSW += '            <taxCategory>TRANSFERIDO</taxCategory>'
      xmlDSW += '        </tax>'
      xmlDSW += '        <payableAmount>'
      xmlDSW += '            <Amount>' + param_obj_DSW.IMPORTE.toFixed(2) + '</Amount>'
      xmlDSW += '        </payableAmount>'
      xmlDSW += '    </requestForPayment>'
      xmlDSW += '</cfdi:Addenda>'

      respuesta.data = xmlDSW
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlDSW', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlDSW', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataChedrahui(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        serie: '',
        folio: '',
        date: '',
        montoTexto: '',
        specialInstructioncode: 'ZZZ',
        orderIdentification: '',
        ReferenceDate: '',
        id_proveedor: '',
        identificador_chedrahui: '',
        vatregnumber: '',
        name: '',
        addres1: '',
        city: '',
        zipcode: '',
        currencyISOCode: 'MXN',
        rateOfChange: '1.000000',
        item: [],
        total: '',
        subtotal: '',
        taxPercentage: '0.00',
        taxtotal: '',
        refId: '',
        refDate: ''
      }
    }
    try {
      var arrayColumn = [
        'tranid',
        'trandate',
        'total',
        'taxtotal',
        'custbody_efx_fe_total_text',
        'otherrefnum',
        'custbody_efx_fe_add_ched_foc',
        'billingaddress.addressee',
        'billingaddress.custrecord_streetname',
        'billingaddress.custrecord_streetnum',
        'billingaddress.custrecord_colonia',
        'billingaddress.custrecord_village',
        'billingaddress.state',
        'billingaddress.zip',
        'billingaddress.country',
        'shippingaddress.addressee',
        'shippingaddress.custrecord_streetname',
        'shippingaddress.custrecord_streetnum',
        'shippingaddress.custrecord_colonia',
        'shippingaddress.custrecord_village',
        'shippingaddress.state',
        'shippingaddress.zip',
        'shippingaddress.country',
        'shippingaddress.custrecord_efx_fe_lugar_gln',
        'billingaddress.custrecord_efx_fe_lugar_gln',
        'shippingaddress.custrecord_efx_fe_buyer_gln',
        'terms',
        //'custbody_efx_fe_reference_id',
        // 'custbody_efx_fe_reference_date',

        'customer.custentity_efx_fe_add_ched_exgln',
        'customer.custentity_efx_fe_add_ched_entgln'
      ]
      var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' })
      if (SUBSIDIARIES) {
        arrayColumn.push('subsidiary')
      }
      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })
      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })
      {
        if (SUBSIDIARIES && LookupField.subsidiary) {
          var resultSub = record.load({
            type: search.Type.SUBSIDIARY,
            id: LookupField.subsidiary[0].value
          })
          respuesta.data.vatregnumber = resultSub.getValue({ fieldId: 'federalidnumber' }) || '' // 'NFM0910317L6',
          respuesta.data.name = resultSub.getValue({ fieldId: 'legalname' }) || '' // 'NUTRITION FACT DE MEXICO SA DE CV',
          var mainaddressOBJ = resultSub.getSubrecord({ fieldId: 'mainaddress' })
          respuesta.data.addres1 = mainaddressOBJ.getValue({ fieldId: 'custrecord_streetname' }) || '' // 'HACIENDA DEL ROSARIO 195 PRADOS DEL ROSARIO',
          respuesta.data.city = mainaddressOBJ.getText({ fieldId: 'city' }) || '' // 'AZCAPOTZALCO',
          respuesta.data.zipcode = mainaddressOBJ.getValue({ fieldId: 'zip' }) || '' // '02410',
          respuesta.data.state = mainaddressOBJ.getValue({ fieldId: 'state' }) || '' // '02410',
          respuesta.data.country = mainaddressOBJ.getValue({ fieldId: 'country' }) || '' // '02410',
          respuesta.data.numextsub = mainaddressOBJ.getValue({ fieldId: 'custrecord_streetnum' }) || '' // '02410',
          respuesta.data.coloniasub = mainaddressOBJ.getValue({ fieldId: 'custrecord_colonia' }) || '' // '02410',
        } else if (!SUBSIDIARIES) {
          var configRecObj = config.load({
            type: config.Type.COMPANY_INFORMATION
          })
          respuesta.data.vatregnumber = configRecObj.getValue({ fieldId: 'employerid' }) || ''
          respuesta.data.name = configRecObj.getValue({ fieldId: 'legalname' }) || ''
          var mainaddressOBJ = configRecObj.getSubrecord({ fieldId: 'mainaddress' })
          respuesta.data.addres1 = mainaddressOBJ.getValue({ fieldId: 'custrecord_streetname' }) || ''
          respuesta.data.city = mainaddressOBJ.getText({ fieldId: 'city' }) || ''
          respuesta.data.zipcode = mainaddressOBJ.getValue({ fieldId: 'zip' }) || ''
          respuesta.data.state = mainaddressOBJ.getValue({ fieldId: 'state' }) || '' // '02410',
          respuesta.data.country = mainaddressOBJ.getValue({ fieldId: 'country' }) || '' // '02410',
          respuesta.data.numextsub = mainaddressOBJ.getValue({ fieldId: 'custrecord_streetnum' }) || '' // '02410',
          respuesta.data.coloniasub = mainaddressOBJ.getValue({ fieldId: 'custrecord_colonia' }) || '' // '02410',
        }
      }
      respuesta.data.serie = LookupField['tranid'] || ''
      respuesta.data.folio = LookupField['tranid'] || ''
      var Date = LookupField['trandate'] || ''
      var formatDate = formatFecha(Date)
      log.audit({ title: 'formatDate ☠️', details: formatDate })
      respuesta.data.date = formatDate
      // respuesta.data.date = LookupField['trandate'] || '';

      // try {
      //     respuesta.data.refId = LookupField['custbody_efx_fe_reference_id'] || '';
      //     if (LookupField['custbody_efx_fe_reference_date']) {
      //         respuesta.data.refDate = fechaSplit(LookupField['custbody_efx_fe_reference_date'], '/', '-', 0, 1, 2, '');
      //     }
      // } catch (error_MV) {
      //     respuesta.data.ReferenceDate = '0000000';
      //     respuesta.data.refId = '1';
      // }
      respuesta.data.Nombre = LookupField['billingaddress.addressee'] || ''
      respuesta.data.Calle = LookupField['billingaddress.custrecord_streetname'] || ''
      respuesta.data.NumeroExt = LookupField['billingaddress.custrecord_streetnum'] || ''
      respuesta.data.Colonia = LookupField['billingaddress.custrecord_colonia'] || ''
      respuesta.data.Municipio = LookupField['billingaddress.custrecord_village'] || ''
      respuesta.data.Estado = LookupField['billingaddress.state'] || ''
      respuesta.data.CodigoPostal = LookupField['billingaddress.zip'] || ''
      respuesta.data.Pais = LookupField['billingaddress.country'] || ''
      respuesta.data.Nombre_envio = LookupField['shippingaddress.addressee'] || ''
      respuesta.data.Calle_envio = LookupField['shippingaddress.custrecord_streetname'] || ''
      respuesta.data.NumeroExt_envio = LookupField['shippingaddress.custrecord_streetnum'] || ''
      respuesta.data.Colonia_envio = LookupField['shippingaddress.custrecord_colonia'] || ''
      respuesta.data.Municipio_envio = LookupField['shippingaddress.custrecord_village'] || ''
      respuesta.data.Estado_envio = LookupField['shippingaddress.state'] || ''
      respuesta.data.CodigoPostal_envio = LookupField['shippingaddress.zip'] || ''
      respuesta.data.Pais_envio = LookupField['shippingaddress.country'] || ''
      respuesta.data.terminos = LookupField['terms'] || ''
      try {
        if (respuesta.data.terminos) {
          var terminos_obj = record.load({
            type: record.Type.TERM,
            id: respuesta.data.terminos[0].value
          })
          respuesta.data.terminos = terminos_obj.getValue({ fieldId: 'daysuntilnetdue' })
        }
      } catch (error_terms) {
        respuesta.data.terminos = ''
      }

      if (LookupField['custbody_efx_fe_add_ched_foc']) {
        var horaMexico = horaActual()
        respuesta.data.ReferenceDate = fechaSplit(LookupField['custbody_efx_fe_add_ched_foc'], '/', '-', 0, 1, 2, 'T' + horaMexico)
      }

      respuesta.data.montoTexto = LookupField['custbody_efx_fe_total_text'] || ''
      respuesta.data.orderIdentification = LookupField['otherrefnum'] || ''

      if (LookupField['shippingaddress.custrecord_efx_fe_buyer_gln']) {
        respuesta.data.id_proveedor = LookupField['shippingaddress.custrecord_efx_fe_buyer_gln'] || ''
      } else {
        respuesta.data.id_proveedor = LookupField['customer.custentity_efx_fe_add_ched_exgln'] || ''
      }

      if (LookupField['shippingaddress.custrecord_efx_fe_lugar_gln']) {
        respuesta.data.identificador_chedrahui = LookupField['shippingaddress.custrecord_efx_fe_lugar_gln'] || ''
      } else if (LookupField['billingaddress.custrecord_efx_fe_lugar_gln']) {
        respuesta.data.identificador_chedrahui = LookupField['billingaddress.custrecord_efx_fe_lugar_gln'] || ''
      } else {
        respuesta.data.identificador_chedrahui = LookupField['customer.custentity_efx_fe_add_ched_entgln'] || ''
      }

      respuesta.data.total = LookupField['total'] || 0
      respuesta.data.subtotal = LookupField['total'] || 0
      respuesta.data.taxtotal = LookupField['taxtotal'] || 0
      respuesta.data.taxPercentage = '0.00'

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['itemtype', 'item', 'itemTEXT', 'quantity', 'rate', 'custcol_efx_fe_upc_code', 'amount', 'tax1amt', 'grossamt']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        for (var ir in transactionField.data.lineField) {
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Markup' ||
            transactionField.data.lineField[ir].itemtype == 'Assembly'
          ) {
            var quantity = transactionField.data.lineField[ir].quantity || 0
            var quantityType = parseFloat(quantity).toFixed(2) || 0

            respuesta.data.item.push({
              sku: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              quantity: quantity,
              QuantityType: quantityType || '',
              name: transactionField.data.lineField[ir].itemTEXT || '',
              rate: transactionField.data.lineField[ir].rate || '',
              unitOfMeasure: 'CA',
              amount: transactionField.data.lineField[ir].amount || '',
              taxAmount: parseFloat(transactionField.data.lineField[ir].tax1amt).toFixed(2) || '0.00',
              grossAmount: transactionField.data.lineField[ir].grossamt || '',
              netAmount: transactionField.data.lineField[ir].grossamt || '',
              taxPercentage: '0.00'
            })
          }
        }
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataChedrahui', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataChedrahui', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getXmlChedrahui(param_obj_Chedrahui, ChedrahuiMySuite) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      respuesta.xmlns = ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" '
      respuesta.xmlns += ' xmlns:xs="http://www.w3.org/2001/XMLSchema" '
      respuesta.xmlns += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '

      var xmlChedrahui = ''
      xmlChedrahui += '   <cfdi:Addenda>'
      xmlChedrahui += '       <requestForPayment'
      xmlChedrahui += '           type="SimpleInvoiceType"'
      xmlChedrahui += '           contentVersion="1.3.1"'
      xmlChedrahui += '           documentStructureVersion="AMC7.1"'
      xmlChedrahui += '           documentStatus="ORIGINAL"'
      xmlChedrahui += '           DeliveryDate="' + param_obj_Chedrahui.date + '">'
      xmlChedrahui += '           <requestForPaymentIdentification>'
      xmlChedrahui += '               <entityType>INVOICE</entityType>'
      xmlChedrahui += '               <uniqueCreatorIdentification>"' + param_obj_Chedrahui.serie + '"</uniqueCreatorIdentification>'
      xmlChedrahui += '           </requestForPaymentIdentification>'

      xmlChedrahui += '           <specialInstruction code="' + param_obj_Chedrahui.specialInstructioncode + '">'
      xmlChedrahui += '               <text>' + param_obj_Chedrahui.montoTexto + '</text>'
      xmlChedrahui += '           </specialInstruction>'
      xmlChedrahui += '           <orderIdentification>'
      xmlChedrahui += '               <referenceIdentification type="ON">' + param_obj_Chedrahui.orderIdentification + '</referenceIdentification>'
      xmlChedrahui += '               <ReferenceDate>' + param_obj_Chedrahui.ReferenceDate + '</ReferenceDate>'
      xmlChedrahui += '           </orderIdentification>'
      xmlChedrahui += '           <AdditionalInformation>'
      xmlChedrahui += '               <referenceIdentification type="ATZ"/>'
      xmlChedrahui += '           </AdditionalInformation>'

      xmlChedrahui += '           <DeliveryNote>'
      xmlChedrahui += '               <referenceIdentification>' + param_obj_Chedrahui.refId + '</referenceIdentification>'
      xmlChedrahui += '               <ReferenceDate>' + param_obj_Chedrahui.refDate + '</ReferenceDate>'
      xmlChedrahui += '           </DeliveryNote>'
      if (param_obj_Chedrahui.refId && param_obj_Chedrahui.refDate) {
        xmlChedrahui += '           <DeliveryNote>'
        xmlChedrahui += '               <referenceIdentification>' + param_obj_Chedrahui.refId + '</referenceIdentification>'
        xmlChedrahui += '               <ReferenceDate>' + param_obj_Chedrahui.refDate + '</ReferenceDate>'
        xmlChedrahui += '           </DeliveryNote>'
      }

      xmlChedrahui += '           <buyer>'
      xmlChedrahui += '               <gln>' + param_obj_Chedrahui.id_proveedor + '</gln>'
      xmlChedrahui += '               <contactInformation>'
      xmlChedrahui += '                   <personOrDepartmentName>'
      xmlChedrahui += '                       <text>0</text>'
      xmlChedrahui += '                   </personOrDepartmentName>'
      xmlChedrahui += '               </contactInformation>'
      xmlChedrahui += '           </buyer>'
      xmlChedrahui += '           <seller>'
      xmlChedrahui += '               <gln>' + param_obj_Chedrahui.id_proveedor + '</gln>'
      xmlChedrahui += '               <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">' + param_obj_Chedrahui.identificador_chedrahui + '</alternatePartyIdentification>'
      xmlChedrahui += '           </seller>'
      xmlChedrahui += '           <shipTo>'
      xmlChedrahui += '               <gln>' + param_obj_Chedrahui.id_proveedor + '</gln>'
      xmlChedrahui += '               <nameAndAddress>'
      xmlChedrahui += '                   <name>' + param_obj_Chedrahui.Nombre_envio + '</name>'
      xmlChedrahui += '                   <streetAddressOne>' + param_obj_Chedrahui.Calle_envio + '</streetAddressOne>'
      xmlChedrahui += '                   <city>' + param_obj_Chedrahui.Estado_envio + '</city>'
      xmlChedrahui += '                   <postalCode>' + param_obj_Chedrahui.CodigoPostal_envio + '</postalCode>'
      xmlChedrahui += '               </nameAndAddress>'
      xmlChedrahui += '           </shipTo>'
      xmlChedrahui += '           <InvoiceCreator>'
      xmlChedrahui += '               <gln>' + param_obj_Chedrahui.id_proveedor + '</gln>'
      xmlChedrahui += '               <alternatePartyIdentification type="VA">' + param_obj_Chedrahui.vatregnumber + '</alternatePartyIdentification>'
      xmlChedrahui += '               <nameAndAddress>'
      xmlChedrahui += '                   <name>' + param_obj_Chedrahui.name + '</name>'
      xmlChedrahui += '                   <streetAddressOne>' + param_obj_Chedrahui.addres1 + '</streetAddressOne>'
      xmlChedrahui += '                   <city>C' + param_obj_Chedrahui.city + '</city>'
      xmlChedrahui += '                   <postalCode>' + param_obj_Chedrahui.zipcode + '</postalCode>'
      xmlChedrahui += '               </nameAndAddress>'
      xmlChedrahui += '           </InvoiceCreator>'
      xmlChedrahui += '           <currency currencyISOCode="' + param_obj_Chedrahui.currencyISOCode + '">'
      xmlChedrahui += '               <currencyFunction>BILLING_CURRENCY</currencyFunction>'
      xmlChedrahui += '               <rateOfChange>' + param_obj_Chedrahui.rateOfChange + '</rateOfChange>'
      xmlChedrahui += '           </currency>'
      xmlChedrahui += '           <paymentTerms'
      xmlChedrahui += '               paymentTermsEvent="DATE_OF_INVOICE"'
      xmlChedrahui += '               PaymentTermsRelationTime="REFERENCE_AFTER">'
      xmlChedrahui += '               <netPayment netPaymentTermsType="BASIC_NET">'
      xmlChedrahui += '                   <paymentTimePeriod>'
      xmlChedrahui += '                       <timePeriodDue timePeriod="DAYS">'
      xmlChedrahui += '                           <value>65</value>'
      xmlChedrahui += '                       </timePeriodDue>'
      xmlChedrahui += '                   </paymentTimePeriod>'
      xmlChedrahui += '               </netPayment>'
      xmlChedrahui += '           </paymentTerms>'
      for (var lineitem in param_obj_Chedrahui.item) {
        xmlChedrahui += '           <lineItem type="SimpleInvoiceLineItemType" number="' + (parseFloat(lineitem) + 1) + '">'
        xmlChedrahui += '               <tradeItemIdentification>'
        xmlChedrahui += '                   <gtin>' + param_obj_Chedrahui.item[lineitem].sku + '</gtin>'
        xmlChedrahui += '               </tradeItemIdentification>'
        xmlChedrahui +=
          '               <alternateTradeItemIdentification type="BUYER_ASSIGNED">' + param_obj_Chedrahui.item[lineitem].sku + '</alternateTradeItemIdentification>'
        xmlChedrahui += '               <tradeItemDescriptionInformation language="ES">'
        xmlChedrahui += '                   <longText>' + xml.escape({ xmlText: param_obj_Chedrahui.item[lineitem].name }) + '</longText>'
        xmlChedrahui += '               </tradeItemDescriptionInformation>'
        xmlChedrahui += '               <invoicedQuantity unitOfMeasure="CA">' + param_obj_Chedrahui.item[lineitem].QuantityType + '</invoicedQuantity>'
        xmlChedrahui += '               <aditionalQuantity QuantityType="NUM_CONSUMER_UNITS">' + param_obj_Chedrahui.item[lineitem].quantity + '</aditionalQuantity>'
        xmlChedrahui += '               <grossPrice>'
        xmlChedrahui += '                   <Amount>' + param_obj_Chedrahui.item[lineitem].rate + '</Amount>'
        xmlChedrahui += '               </grossPrice>'
        xmlChedrahui += '               <netPrice>'
        xmlChedrahui += '                   <Amount>' + param_obj_Chedrahui.item[lineitem].amount + '</Amount>'
        xmlChedrahui += '               </netPrice>'
        xmlChedrahui += '               <AdditionalInformation>'
        xmlChedrahui += '                   <referenceIdentification type="ON"></referenceIdentification>'
        xmlChedrahui += '               </AdditionalInformation>'

        xmlChedrahui += '               <tradeItemTaxInformation>'
        xmlChedrahui += '                   <taxTypeDescription>VAT</taxTypeDescription>'
        xmlChedrahui += '                   <tradeItemTaxAmount>'
        xmlChedrahui += '                       <taxPercentage>' + param_obj_Chedrahui.item[lineitem].taxPercentage + '</taxPercentage>'
        xmlChedrahui += '                       <taxAmount>' + param_obj_Chedrahui.item[lineitem].taxAmount + '</taxAmount>'
        xmlChedrahui += '                   </tradeItemTaxAmount>'
        xmlChedrahui += '               </tradeItemTaxInformation>'

        xmlChedrahui += '               <totalLineAmount>'
        xmlChedrahui += '                   <grossAmount>'
        xmlChedrahui += '                       <Amount>' + param_obj_Chedrahui.item[lineitem].grossAmount + '</Amount>'
        xmlChedrahui += '                   </grossAmount>'
        xmlChedrahui += '                   <netAmount>'
        xmlChedrahui += '                       <Amount>' + param_obj_Chedrahui.item[lineitem].netAmount + '</Amount>'
        xmlChedrahui += '                   </netAmount>'
        xmlChedrahui += '               </totalLineAmount>'
        xmlChedrahui += '           </lineItem>'
      }

      xmlChedrahui += '           <totalAmount>'
      xmlChedrahui += '               <Amount>' + param_obj_Chedrahui.total + '</Amount>'
      xmlChedrahui += '           </totalAmount>'
      xmlChedrahui += '           <baseAmount>'
      xmlChedrahui += '               <Amount>' + param_obj_Chedrahui.subtotal + '</Amount>'
      xmlChedrahui += '           </baseAmount>'
      xmlChedrahui += '           <tax type="VAT">'
      xmlChedrahui += '               <taxPercentage>' + param_obj_Chedrahui.taxPercentage + '</taxPercentage>'
      xmlChedrahui += '               <taxAmount>' + param_obj_Chedrahui.taxtotal + '</taxAmount>'
      xmlChedrahui += '               <taxCategory>TRANSFERIDO</taxCategory>'
      xmlChedrahui += '           </tax>'
      xmlChedrahui += '           <payableAmount>'
      xmlChedrahui += '               <Amount>' + param_obj_Chedrahui.total + '</Amount>'
      xmlChedrahui += '           </payableAmount>'
      xmlChedrahui += '       </requestForPayment>'
      xmlChedrahui += '   </cfdi:Addenda>'
      if (ChedrahuiMySuite) {
        respuesta.data = JSON.stringify(param_obj_Chedrahui)
      } else {
        respuesta.data = xmlChedrahui
      }

      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlChedrahui', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlChedrahui', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataAltosHornos(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        Tipo: '',
        Clase: '',
        NumSociedad: '',
        NumDivision: '',
        NumProveedor: '',
        Correo: '',
        Moneda: '',
        pedidoNum: '',
        HojaServicioNum: '',
        Anexo: '',
        Recepcion: ''
      }
    }
    try {
      var arrayColumn = [
        'custbody_efx_ah_tipo',
        'custbody_efx_ah_clase',
        'customer.custentity_efx_ah_numsociedad',
        'customer.custentity_efx_ah_numdivision',
        'customer.custentity_efx_ah_numproveedor',
        'custbody_efx_ah_mail',
        'currency.symbol',
        'custbody_efx_ah_numpedido',
        'custbody_efx_ah_numhojaservicio',
        'custbody_efx_ah_anexo',
        'custbody_efx_ah_recepcion'
      ]

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      respuesta.data.Tipo = LookupField['custbody_efx_ah_tipo'] || ''
      respuesta.data.Clase = LookupField['custbody_efx_ah_clase'] || ''
      respuesta.data.NumSociedad = LookupField['customer.custentity_efx_ah_numsociedad'] || ''
      respuesta.data.NumDivision = LookupField['customer.custentity_efx_ah_numdivision'] || ''
      respuesta.data.NumProveedor = LookupField['customer.custentity_efx_ah_numproveedor'] || ''
      respuesta.data.Correo = LookupField['custbody_efx_ah_mail'] || ''
      respuesta.data.Moneda = LookupField['currency.symbol'] || ''
      respuesta.data.pedidoNum = LookupField['custbody_efx_ah_numpedido'] || ''
      respuesta.data.HojaServicioNum = LookupField['custbody_efx_ah_numhojaservicio'] || ''
      respuesta.data.Recepcion = LookupField['custbody_efx_ah_recepcion'] || ''
      try {
        respuesta.data.Anexo = LookupField['custbody_efx_ah_anexo'][0].text || ''
      } catch (e) {
        respuesta.data.Anexo = ''
      }

      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getDataAltosHornos', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataAltosHornos', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getxmlAltosHornos(param_obj_AltosHornos) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: '',
      message: []
    }
    try {
      //respuesta.xmlns = ' xmlns:cfdi="http://www.sat.gob.mx/cfd/3"';
      respuesta.xmlns += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
      respuesta.xmlns += '    xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"'

      var xmlAltosHornos = ''

      xmlAltosHornos += '<cfdi:Addenda'
      xmlAltosHornos += '    xmlns:ahmsa="http://www.ahmsa.com/xsd/AddendaAHM1"'
      xmlAltosHornos += '    xsi:schemaLocation="http://www.ahmsa.com/xsd/AddendaAHM1 http://www.ahmsa.com/xsd/AddendaAHM1/AddendaAHM.xsd">'
      xmlAltosHornos += '        <ahmsa:AddendaAHM Version="1.0">'
      xmlAltosHornos += '        <ahmsa:Documento Tipo="' + param_obj_AltosHornos.Tipo + '" Clase="' + param_obj_AltosHornos.Clase + '">'
      xmlAltosHornos += '        <ahmsa:Encabezado'
      xmlAltosHornos += '    NumSociedad="' + param_obj_AltosHornos.NumSociedad + '"'
      xmlAltosHornos += '    NumDivision="' + param_obj_AltosHornos.NumDivision + '"'
      xmlAltosHornos += '    NumProveedor="' + param_obj_AltosHornos.NumProveedor + '"'
      xmlAltosHornos += '    Correo="' + param_obj_AltosHornos.Correo + '"'
      xmlAltosHornos += '    Moneda="' + param_obj_AltosHornos.Moneda + '"/>'
      xmlAltosHornos += '        <ahmsa:Detalle>'
      xmlAltosHornos += '    <ahmsa:Pedido Num="' + param_obj_AltosHornos.pedidoNum + '">'
      xmlAltosHornos += '        <ahmsa:Recepcion>' + param_obj_AltosHornos.Recepcion + '</ahmsa:Recepcion>'
      xmlAltosHornos += '    </ahmsa:Pedido>'
      xmlAltosHornos += '    <ahmsa:HojaServicio Num="' + param_obj_AltosHornos.HojaServicioNum + '"/>'
      xmlAltosHornos += '        <ahmsa:Transporte Num=""/>'
      xmlAltosHornos += '        <ahmsa:CtaxPag Num="" Ejercicio=""/>'
      xmlAltosHornos += '        <ahmsa:Liquidacion FechaInicio="" FechaFin=""/>'
      xmlAltosHornos += '        </ahmsa:Detalle>'
      xmlAltosHornos += '        <ahmsa:Anexos>'
      xmlAltosHornos += '    <ahmsa:Anexo>' + param_obj_AltosHornos.Anexo + '</ahmsa:Anexo>'
      xmlAltosHornos += '    </ahmsa:Anexos>'
      xmlAltosHornos += '    </ahmsa:Documento>'
      xmlAltosHornos += '    </ahmsa:AddendaAHM>'
      xmlAltosHornos += '    </cfdi:Addenda>'

      respuesta.data = xmlAltosHornos
      respuesta.succes = respuesta.message.length == 0
    } catch (error) {
      log.error({ title: 'error getxmlAltosHornos', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getxmlAltosHornos', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataBioPapel(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        custentity_efx_fe_add_bp_idprov: '',
        otherrefnum: '',
        custbody_efx_fe_add_bp_idrec: '',
        custbody_efx_fe_add_bp_nrem: '',
        item: []
      }
    }
    try {
      var arrayColumn = ['customer.custentity_efx_fe_add_bp_idprov', 'otherrefnum', 'custbody_efx_fe_add_bp_idrec', 'custbody_efx_fe_add_bp_nrem']

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      respuesta.data.custentity_efx_fe_add_bp_idprov = LookupField['customer.custentity_efx_fe_add_bp_idprov'] || ''
      respuesta.data.otherrefnum = LookupField['otherrefnum'] || ''
      respuesta.data.custbody_efx_fe_add_bp_idrec = LookupField['custbody_efx_fe_add_bp_idrec'] || ''
      respuesta.data.custbody_efx_fe_add_bp_nrem = LookupField['custbody_efx_fe_add_bp_nrem'] || ''

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['itemtype', 'item', 'rate', 'custcol_efx_fe_upc_code', 'amount', 'quantity', 'grossamt', 'description', 'custcol_efx_fe_add_bp_poc']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        for (var ir in transactionField.data.lineField) {
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var quantity = transactionField.data.lineField[ir].quantity || 0

            respuesta.data.item.push({
              sku: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              quantity: quantity,
              name: transactionField.data.lineField[ir].itemTEXT || '',
              rate: transactionField.data.lineField[ir].rate || '',
              amount: transactionField.data.lineField[ir].amount || '',
              grossAmount: transactionField.data.lineField[ir].grossamt || '',
              description: transactionField.data.lineField[ir].description || '',
              custcol_efx_fe_add_bp_poc: transactionField.data.lineField[ir].custcol_efx_fe_add_bp_poc || ''
            })
          }
        }
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataChedrahui', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataChedrahui', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getxmlBioPapel(param_obj_BioPapel) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      {
      }

      var xmlBioPapel = ''
      xmlBioPapel += '   <cfdi:Addenda>'
      xmlBioPapel += '       <BioPappel'
      xmlBioPapel += '           Version="1.0"'
      xmlBioPapel += '           IdProveedor="' + param_obj_BioPapel.custentity_efx_fe_add_bp_idprov + '">'
      xmlBioPapel += '           <OrdenCompra NumeroOC="' + param_obj_BioPapel.otherrefnum + '">'
      xmlBioPapel += '               <Recepciones>'
      xmlBioPapel +=
        '               <Recepcion IdRecepcion="' + param_obj_BioPapel.custbody_efx_fe_add_bp_idrec + '" NoRemision="' + param_obj_BioPapel.custbody_efx_fe_add_bp_nrem + '">'
      for (var lineitem in param_obj_BioPapel.item) {
        xmlBioPapel +=
          '                   <Concepto ValorUnitario="' +
          param_obj_BioPapel.item[lineitem].rate.toFixed(2) +
          '" NoIdentificacion="' +
          param_obj_BioPapel.item[lineitem].sku +
          '" PosOC="' +
          param_obj_BioPapel.item[lineitem].custcol_efx_fe_add_bp_poc +
          '" Importe="' +
          param_obj_BioPapel.item[lineitem].amount.toFixed(2) +
          '" Cantidad="' +
          param_obj_BioPapel.item[lineitem].quantity +
          '" Descripcion="' +
          param_obj_BioPapel.item[lineitem].description +
          '"/>'
      }

      xmlBioPapel += '   </Recepcion>'
      xmlBioPapel += '   </Recepciones>'
      xmlBioPapel += '   </OrdenCompra>'
      xmlBioPapel += '   </BioPappel>'
      xmlBioPapel += '   </cfdi:Addenda>'

      respuesta.data = xmlBioPapel

      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlChedrahui', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlChedrahui', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getDataTexasStandardLLC(param_id, param_type) {
    var respuesta = {
      succes: false,
      data: {
        custentity_efx_fe_add_bp_idprov: '',
        otherrefnum: '',
        custbody_efx_fe_add_bp_idrec: '',
        custbody_efx_fe_add_bp_nrem: '',
        item: []
      }
    }
    try {
      var arrayColumn = ['customer.custentity_efx_fe_add_bp_idprov', 'otherrefnum', 'custbody_efx_fe_add_bp_idrec', 'custbody_efx_fe_add_bp_nrem']

      var LookupField = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: param_id,
        columns: arrayColumn
      })

      log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) })

      respuesta.data.custentity_efx_fe_add_bp_idprov = LookupField['customer.custentity_efx_fe_add_bp_idprov'] || ''
      respuesta.data.otherrefnum = LookupField['otherrefnum'] || ''
      respuesta.data.custbody_efx_fe_add_bp_idrec = LookupField['custbody_efx_fe_add_bp_idrec'] || ''
      respuesta.data.custbody_efx_fe_add_bp_nrem = LookupField['custbody_efx_fe_add_bp_nrem'] || ''

      var objParametro = {
        id: param_id,
        type: param_type,
        sublist: 'item',
        bodyFieldValue: [],
        bodyFieldText: [],
        lineField: ['itemtype', 'item', 'rate', 'custcol_efx_fe_upc_code', 'amount', 'quantity', 'grossamt', 'description', 'custcol_efx_fe_add_bp_poc']
      }

      var transactionField = getTransactionField(objParametro)
      if (transactionField.succes) {
        for (var ir in transactionField.data.lineField) {
          if (
            transactionField.data.lineField[ir].itemtype == 'InvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Service' ||
            transactionField.data.lineField[ir].itemtype == 'Kit' ||
            transactionField.data.lineField[ir].itemtype == 'NonInvtPart' ||
            transactionField.data.lineField[ir].itemtype == 'Markup'
          ) {
            var quantity = transactionField.data.lineField[ir].quantity || 0

            respuesta.data.item.push({
              sku: transactionField.data.lineField[ir].custcol_efx_fe_upc_code || '',
              quantity: quantity,
              name: transactionField.data.lineField[ir].itemTEXT || '',
              rate: transactionField.data.lineField[ir].rate || '',
              amount: transactionField.data.lineField[ir].amount || '',
              grossAmount: transactionField.data.lineField[ir].grossamt || '',
              description: transactionField.data.lineField[ir].description || '',
              custcol_efx_fe_add_bp_poc: transactionField.data.lineField[ir].custcol_efx_fe_add_bp_poc || ''
            })
          }
        }
        respuesta.succes = true
      }
    } catch (error) {
      log.error({ title: 'error getDataChedrahui', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getDataChedrahui', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getxmlTexasStandardLLC(param_obj_BioPapel) {
    var respuesta = {
      succes: false,
      data: '',
      xmlns: ''
    }
    try {
      {
      }

      var xmlBioPapel = ''
      xmlBioPapel += '   <cfdi:Addenda>'
      xmlBioPapel += '       <BioPappel'
      xmlBioPapel += '           Version="1.0"'
      xmlBioPapel += '           IdProveedor="' + param_obj_BioPapel.custentity_efx_fe_add_bp_idprov + '">'
      xmlBioPapel += '           <OrdenCompra NumeroOC="' + param_obj_BioPapel.otherrefnum + '">'
      xmlBioPapel += '               <Recepciones>'
      xmlBioPapel +=
        '               <Recepcion IdRecepcion="' + param_obj_BioPapel.custbody_efx_fe_add_bp_idrec + '" NoRemision="' + param_obj_BioPapel.custbody_efx_fe_add_bp_nrem + '">'
      for (var lineitem in param_obj_BioPapel.item) {
        xmlBioPapel +=
          '                   <Concepto ValorUnitario="' +
          param_obj_BioPapel.item[lineitem].rate.toFixed(2) +
          '" NoIdentificacion="' +
          param_obj_BioPapel.item[lineitem].sku +
          '" PosOC="' +
          param_obj_BioPapel.item[lineitem].custcol_efx_fe_add_bp_poc +
          '" Importe="' +
          param_obj_BioPapel.item[lineitem].amount.toFixed(2) +
          '" Cantidad="' +
          param_obj_BioPapel.item[lineitem].quantity +
          '" Descripcion="' +
          param_obj_BioPapel.item[lineitem].description +
          '"/>'
      }

      xmlBioPapel += '   </Recepcion>'
      xmlBioPapel += '   </Recepciones>'
      xmlBioPapel += '   </OrdenCompra>'
      xmlBioPapel += '   </BioPappel>'
      xmlBioPapel += '   </cfdi:Addenda>'

      respuesta.data = xmlBioPapel

      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getXmlChedrahui', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getXmlChedrahui', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function getTransactionField(objTransaction) {
    var respuesta = {
      succes: false,
      data: {
        bodyFieldValue: {},
        bodyFieldText: {},
        lineField: {}
      }
    }
    log.audit({ title: 'objTransaction', details: JSON.stringify(objTransaction) })
    try {
      var transactionLoad = record.load({
        id: objTransaction.id,
        type: objTransaction.type
      })
      var objValueField = {}
      var objTextField = {}
      var objLineField = {}

      if (objTransaction.bodyFieldValue) {
        for (var bfv = 0; bfv < objTransaction.bodyFieldValue.length; bfv++) {
          log.audit({
            title: 'objTransaction.bodyFieldValue[bfv]',
            details: JSON.stringify(objTransaction.bodyFieldValue[bfv])
          })
          objValueField[objTransaction.bodyFieldValue[bfv]] = transactionLoad.getValue({ fieldId: objTransaction.bodyFieldValue[bfv] }) || ''
        }
      }

      if (objTransaction.bodyFieldText) {
        for (var vft = 0; vft < objTransaction.bodyFieldText.length; vft++) {
          log.audit({
            title: 'objTransaction.bodyFieldText[vft]',
            details: JSON.stringify(objTransaction.bodyFieldText[vft])
          })
          objTextField[objTransaction.bodyFieldText[vft]] = transactionLoad.getText({ fieldId: objTransaction.bodyFieldText[vft] }) || ''
        }
      }

      if (objTransaction.sublist && objTransaction.lineField) {
        var numeroLineas = transactionLoad.getLineCount({ sublistId: objTransaction.sublist })
        for (var renglon = 0; renglon < numeroLineas; renglon++) {
          var objRenglonAux = {}
          for (var slf = 0; slf < objTransaction.lineField.length; slf++) {
            log.audit({
              title: 'sublista ' + objTransaction.sublist,
              details: 'renglon: ' + renglon + ' campo: ' + objTransaction.lineField[slf]
            })
            var isText = false
            var dValue = objTransaction.lineField[slf]
            if (dValue.indexOf('TEXT') != -1) {
              isText = true
              dValue = dValue.replace(/TEXT/g, '')
            }

            var currentValue = ''
            if (isText) {
              currentValue =
                transactionLoad.getSublistText({
                  sublistId: objTransaction.sublist,
                  fieldId: dValue,
                  line: renglon
                }) || ''
            } else {
              currentValue =
                transactionLoad.getSublistValue({
                  sublistId: objTransaction.sublist,
                  fieldId: dValue,
                  line: renglon
                }) || ''
            }
            log.audit({ title: 'currentValue', details: JSON.stringify(currentValue) })
            objRenglonAux[objTransaction.lineField[slf]] = currentValue
          }
          objLineField[renglon] = objRenglonAux
        }
      }
      respuesta.data.bodyFieldValue = objValueField
      respuesta.data.bodyFieldText = objTextField
      respuesta.data.lineField = objLineField
      respuesta.succes = true
    } catch (error) {
      log.error({ title: 'error getTransactionField', details: JSON.stringify(error) })
      respuesta.succes = false
    }
    log.audit({ title: 'respuesta getTransactionField', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function fechaSplit(param_fecha, separador_origen, separador_destino, lugar_año, luigar_mes, lugar_dia, hora) {
    var respuesta = ''
    try {
      /*
            var objDate = param_fecha.split(separador_origen);
            var año = objDate[2];
            var mes = objDate[1] < 10 ? '0' + objDate[1] : objDate[1];
            var dia = objDate[0] < 10 ? '0' + objDate[0] : objDate[0];
            */
      var objDate = format.parse({
        value: param_fecha,
        type: format.Type.DATE
      })

      var año = objDate.getFullYear() || ''
      var mes = objDate.getMonth() || ''
      var dia = objDate.getDate() || ''
      var arrayFecha = ['', '', '']
      arrayFecha[lugar_año] = año
      arrayFecha[luigar_mes] = mes * 1 + 1 < 10 ? '0' + (mes * 1 + 1) : mes * 1 + 1
      arrayFecha[lugar_dia] = dia < 10 ? '0' + dia : dia

      log.audit({
        title: 'fecha1',
        details: ' objDate ' + objDate + ' año ' + año + ' mes ' + mes + ' dia ' + dia
      })
      respuesta = arrayFecha[0] + separador_destino + arrayFecha[1] + separador_destino + arrayFecha[2] + hora
    } catch (error) {
      log.error({ title: 'error fechaSplit', details: JSON.stringify(error) })
      respuesta = ''
    }
    log.audit({ title: 'respuesta fechaSplit', details: JSON.stringify(respuesta) })
    return respuesta
  }

  function formatFecha(date) {
    try {
      var objDate = format.parse({
        value: date,
        type: format.Type.DATE
      })
      var anio = objDate.getFullYear() || ''
      var mes = objDate.getMonth() || ''
      var dia = objDate.getDate() || ''
      var arrayFecha = []
      var lugar_anio = anio
      var lugar_mes = mes * 1 + 1 < 10 ? '0' + (mes * 1 + 1) : mes * 1 + 1
      var lugar_dia = dia < 10 ? '0' + dia : dia
      arrayFecha.push(lugar_anio)
      arrayFecha.push(lugar_mes)
      arrayFecha.push(lugar_dia)
      var dateFormat = arrayFecha[0] + '-' + arrayFecha[1] + '-' + arrayFecha[2]
      return dateFormat
    } catch (err) {
      log.error({ title: 'Error occurred in formatDate', details: err })
    }
  }

  function horaActual() {
    var respuesta = ''

    try {
      var d = new Date()
      var offset = '-5'

      var utc = d.getTime() + d.getTimezoneOffset() * 60000
      var nd = new Date(utc + 3600000 * offset)

      var Hours = nd.getHours() < 10 ? '0' + nd.getHours() : nd.getHours()
      var Minutes = nd.getMinutes() < 10 ? '0' + nd.getMinutes() : nd.getMinutes()
      var Seconds = nd.getSeconds() < 10 ? '0' + nd.getSeconds() : nd.getSeconds()

      respuesta = Hours + ':' + Minutes + ':' + Seconds
    } catch (error) {
      log.error({ title: 'error horaActual', details: JSON.stringify(error) })
      respuesta = '00:00:00'
    }
    log.audit({ title: 'respuesta horaActual', details: JSON.stringify(respuesta) })
    return respuesta
  }

  return {
    addenda_select: addenda_select
  }
})
