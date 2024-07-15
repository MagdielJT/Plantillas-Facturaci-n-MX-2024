<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
    <#setting locale = "es_MX">
    <#setting time_zone= "America/Mexico_City">
    <#setting number_format=",##0.00">

    <#assign "dataXML" = "">
    <#if custom?has_content>
        <#if custom.dataXML?has_content>
            <#assign "dataXML" = custom.dataXML>

        </#if>
        <#setting locale=custom.locale>
        <#assign labels = custom.labels>
        <#if custom.certData?has_content>
            <#assign "certData" = custom.certData>
        <#else>
            <#assign "certData" = record>
        </#if>
        <#assign "satCodes" = custom.satcodes>

        <#if custom.multiCurrencyFeature == "true">
            <#assign "currencyCode" = record.currencysymbol>
            <#assign exchangeRate = record.exchangerate?string.number>
        <#else>
            <#assign "currencyCode" = "MXN">
            <#assign exchangeRate = 1>
        </#if>
        <#if custom.oneWorldFeature == "true">
            <#assign customCompanyInfo = record.subsidiary>
        <#else>
            <#assign "customCompanyInfo" = companyInformation>
        </#if>
        <#if customer.isperson == "T">
            <#assign customerName = customer.firstname + ' ' + customer.lastname>
        <#else>
            <#assign "customerName" = customer.companyname>
        </#if>
        <#assign "summary" = custom.summary>
        <#assign "totalAmount" = summary.subtotal - summary.totalDiscount>
        <#assign "companyTaxRegNumber" = custom.companyInfo.rfc>
        <#assign currencySymbolMap = {"USD":"$","CAD":"$","EUR":"€","AED":"د.إ.‏","AFN":"؋","ALL":"Lek","AMD":"դր.","ARS":"$","AUD":"$","AZN":"ман.","BAM":"KM","BDT":"৳","BGN":"лв.","BHD":"د.ب.‏","BIF":"FBu","BND":"$","BOB":"Bs","BRL":"R$","BWP":"P","BYR":"BYR","BZD":"$","CDF":"FrCD","CHF":"CHF","CLP":"$","CNY":"CN¥","COP":"$","CRC":"₡","CVE":"CV$","CZK":"Kč","DJF":"Fdj","DKK":"kr","DOP":"RD$","DZD":"د.ج.‏","EEK":"kr","EGP":"ج.م.‏","ERN":"Nfk","ETB":"Br","GBP":"£","GEL":"GEL","GHS":"GH₵","GNF":"FG","GTQ":"Q","HKD":"$","HNL":"L","HRK":"kn","HUF":"Ft","IDR":"Rp","ILS":"₪","INR":"টকা","IQD":"د.ع.‏","IRR":"﷼","ISK":"kr","JMD":"$","JOD":"د.أ.‏","JPY":"￥","KES":"Ksh","KHR":"៛","KMF":"FC","KRW":"₩","KWD":"د.ك.‏","KZT":"тңг.","LBP":"ل.ل.‏","LKR":"SL Re","LTL":"Lt","LVL":"Ls","LYD":"د.ل.‏","MAD":"د.م.‏","MDL":"MDL","MGA":"MGA","MKD":"MKD","MMK":"K","MOP":"MOP$","MUR":"MURs","MXN":"$","MYR":"RM","MZN":"MTn","NAD":"N$","NGN":"₦","NIO":"C$","NOK":"kr","NPR":"नेरू","NZD":"$","OMR":"ر.ع.‏","PAB":"B/.","PEN":"S/.","PHP":"₱","PKR":"₨","PLN":"zł","PYG":"₲","QAR":"ر.ق.‏","RON":"RON","RSD":"дин.","RUB":"руб.","RWF":"FR","SAR":"ر.س.‏","SDG":"SDG","SEK":"kr","SGD":"$","SOS":"Ssh","SYP":"ل.س.‏","THB":"฿","TND":"د.ت.‏","TOP":"T$","TRY":"TL","TTD":"$","TWD":"NT$","TZS":"TSh","UAH":"₴","UGX":"USh","UYU":"$","UZS":"UZS","VEF":"Bs.F.","VND":"₫","XAF":"FCFA","XOF":"CFA","YER":"ر.ي.‏","ZAR":"R","ZMK":"ZK"}>
        <#function fmtc value>
            <#assign dst =  currencySymbolMap[currencyCode] + value?number?string[",##0.00"]>
            <#return dst>
        </#function>
    <#else>
        <#assign "certData" = record>
    </#if>


    <#assign infoEmpresa = record.subsidiary>


    <head>
        <#assign "shipmentcost" = 0>
        <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}"
              src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}"
              src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2"/>
        <#if .locale == "zh_CN">
            <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}"
                  src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2"/>
        <#elseif .locale == "zh_TW">
            <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}"
                  src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2"/>
        <#elseif .locale == "ja_JP">
            <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}"
                  src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2"/>
        <#elseif .locale == "ko_KR">
            <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}"
                  src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2"/>
        <#elseif .locale == "th_TH">
            <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}"
                  src-bold="${nsfont.NotoSansThai_Bold}" bytes="2"/>
        </#if>
        <macrolist>
            <macro id="nlheader">
                <table class="header" height="70px" style="width: 100%;">
                    <tr height="70px">

                        <td colspan="6" height="70px">
                            <#if subsidiary?has_content>
                                <#if subsidiary.logo?has_content> 
                                    <#assign "urldir" = subsidiary.logo@url>
                                    <img width="140" height="70" src="${urldir}"/>
                                </#if>|
                            <#elseif companyInformation.formlogo?has_content>
                                <#assign "urldir" = companyInformation.logoUrl>
                                 <img width="140" height="70" src="${urldir}"/>
                            </#if>
                        </td>

                        <td colspan="1">&nbsp;</td>
                        <td colspan="6" align="center">

                            <span class="nameandaddress"
                            style="font-size: 9px;">
                            <#if record.custbody_efx_fe_gbl_diremisor?has_content>${record.custbody_efx_fe_gbl_diremisor}
                            <#else>
                                <#if record.custbody_efx_fe_dirloc?has_content>${record.custbody_efx_fe_dirloc}
                                <#else>
                                ${record.custbody_efx_fe_dirsubs}
                                </#if>
                            </#if></span>

                        </td>
                        <td colspan="1">&nbsp;</td>
                        <td colspan="4" style="font-size: 10px;" align="right"><span style="font-size: 20px; color:#14B6C6"><strong>FACTURA</strong></span><br/>
                            <#if dataXML?has_content>
                                <#assign folio_tran = "">
                              <#if dataXML.atributos.Serie?has_content>
                              <#assign folio_tran = folio_tran + "" +dataXML.atributos.Serie>
                                </#if>
                                <#if dataXML.atributos.Folio?has_content>
                                 <#assign folio_tran = folio_tran + "" + dataXML.atributos.Folio>
                                   </#if>
                                <span class="number" style="font-size: 18px;">${folio_tran}</span>
                                <br/> <br/>Fecha y hora de emisi&oacute;n<br/>${dataXML.atributos.Fecha}<br/>
                            <#else>
                                <span class="number" style="font-size: 18px;">${record.tranid}</span>
                                <br/> <br/>Fecha y hora de emisi&oacute;n<br/>${record.createdDate}<br/>
                            </#if>


                        </td>
                        <td align="right">
                            <span class="number"></span>
                        </td>
                    </tr>
                </table>
            </macro>


            <macro id="nlfooter">
                <table class="footer" style="width: 100%;">
                    <tr>

                            <td style="font-size: 6pt; text-align:left;">
                                        ESTE DOCUMENTO ES UNA REPRESENTACIÓN IMPRESA DE UN CFDI.
                                    </td>

                        <td align="right">
                            <pagenumber/>
                            de
                            <totalpages/>
                        </td>
                    </tr>
                </table>
            </macro>
        </macrolist>
        <style type="text/css">* {
            <#if .locale == "zh_CN"> font-family: NotoSans, NotoSansCJKsc, sans-serif;
            <#elseif .locale == "zh_TW"> font-family: NotoSans, NotoSansCJKtc, sans-serif;
            <#elseif .locale == "ja_JP"> font-family: NotoSans, NotoSansCJKjp, sans-serif;
            <#elseif .locale == "ko_KR"> font-family: NotoSans, NotoSansCJKkr, sans-serif;
            <#elseif .locale == "th_TH"> font-family: NotoSans, NotoSansThai, sans-serif;
            <#else> font-family: NotoSans, sans-serif;
            </#if>
            }

            table {
                font-size: 9pt;
                table-layout: fixed;
            }

            th {
                font-weight: bold;
                font-size: 8pt;
                vertical-align: middle;
                padding: 5px 6px 3px;
                background-color: #e3e3e3;
                color: #161616;
            }

            table.tablascompletas {
                width: 100%;
                margin-top: 10px;
                border: 1px;
                border-color: #e3e3e3
            }

            td.cuerposnoarticulos {
                padding: 2px;
                font-size: 7pt;
            }

            td.cabecera, th.cabecera {
                color: #000000;
                font-size: 8pt;
                background-color: #80BFFF;
                padding: 2px;
            }

            td {
                padding: 4px 6px;
            }

            td p {
                align: left
            }

            b {
                font-weight: bold;
                color: #000000;
            }

            table.header td {
                padding: 0px;
                font-size: 10pt;
            }

            table.footer td {
                padding: 0px;
                font-size: 8pt;
            }

            table.itemtable th {
                padding-bottom: 10px;
                padding-top: 10px;
            }

            table.desglose td {
                font-size: 4pt;
                padding-top: 0px;
                padding-bottom: 0px;
            }

            table.body td {
                padding-top: 2px;
            }

            table.total {
                page-break-inside: avoid;
            }

            table.infoFiscal td{
                font-size: 7px;
            }

            tr.totalrow {
                background-color: #e3e3e3;
                line-height: 200%;
            }

            td.totalboxtop {
                font-size: 12pt;
                background-color: #e3e3e3;
            }

            td.addressheader {
                font-size: 8pt;
                padding-top: 6px;
                padding-bottom: 2px;
            }

            td.subtotal {
                text-align: right;
            }

            td.address {
                padding-top: 0px;
            }

            td.totalboxmid {
                font-size: 28pt;
                padding-top: 20px;
                background-color: #e3e3e3;
            }

            td.totalboxbot {
                background-color: #e3e3e3;
                font-weight: bold;
            }

            span.title {
                font-size: 28pt;
            }

            span.number {
                font-size: 16pt;
            }

            span.itemname {
                font-weight: bold;
                line-height: 150%;
            }

            hr {
                width: 100%;
                color: #ffffff;
                background-color: #e3e3e3;
                height: 1px;
            }
        </style>
    </head>
    <body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">

    <#assign "desglosa_cliente" = record.entity.custentity_efx_cmp_registra_ieps>
    <#assign "tipoGBL" = record.custbody_efx_fe_gbl_type>

    <#assign "desglose_json_body" = record.custbody_efx_fe_tax_json>
    <#if desglose_json_body?has_content>
        <#assign "desglose_body" = desglose_json_body?eval>
        <#assign "desglose_ieps" = desglose_body.rates_ieps>
        <#assign "desglose_iva" = desglose_body.rates_iva>
        <#assign "desglose_exento" = desglose_body.rates_exento_data>
        <#assign "ieps_total" = desglose_body.ieps_total>
        <#assign "iva_total" = desglose_body.iva_total>
        <#assign "local_total" = desglose_body.local_total>
        <#assign "desglose_ret" = desglose_body.rates_retencion>
        <#assign "desglose_loc" = desglose_body.rates_local>
        <#assign "desglose_total_discount" = desglose_body.descuentoSinImpuesto>
        <#assign "cabecera_total" = desglose_body.total>
        <#assign "cabecera_subtotal" = desglose_body.subtotal>
        <#else>
            <#assign "desglose_body" = {}>
            <#assign "desglose_exento" = "">
            <#assign "desglose_ieps" = 0>
            <#assign "desglose_iva" = 0>
            <#assign "ieps_total" = 0>
            <#assign "iva_total" = 0>
            <#assign "local_total" = 0>
            <#assign "desglose_ret" = 0>
            <#assign "desglose_loc" = 0>
            <#assign "desglose_total_discount" = 0>
            <#assign "cabecera_total" = 0>
            <#assign "cabecera_subtotal" = 0>
    </#if>


    <#assign "obj_totales_imp"= {}>
    <#assign totaliepsGBL = 0/>
    <#assign totalivaGBL = 0/>
    <#assign totalretGBL = 0/>
    <#assign totallocGBL = 0/>
    <#assign totalivaimp = 0/>
    <#assign totaldiscount = 0/>
    <#assign totaliepsimp = 0/>

    <#if dataXML?has_content>
        <#if record.custbody_efx_fe_kiosko_customer?has_content>
            <table style="width: 100%; margin-top: 10px;">
                <tr>
                    <td class="body" colspan="14" style="background-color: #80BFFF; font-size:9px;"><b>Cliente</b></td>
                    <td></td>
                    <td class="body" colspan="14" style="background-color: #80BFFF; font-size:9px"><b>Emisor</b></td>
                </tr>
                <tr>
                    <td colspan="14" rowspan="2"
                        style="border: 1px; border-color: #e3e3e3; font-size:9px;">${dataXML.Receptor.atributos.Nombre}
                        <#if dataXML?has_content>
                            <#assign uso_cfdi = dataXML.Receptor.atributos.UsoCFDI>
                        <#else>
                            <#assign uso_cfdi = record.custbody_mx_cfdi_usage?keep_before(" ")>
                        </#if>
                        <br/><br/><b>RFC:</b> <#outputformat "XML">${dataXML.Receptor.atributos.Rfc}</#outputformat><br/>
                        <#if record.entity.custentity_mx_sat_industry_type?has_content>
                            <br /><b>Régimen Fiscalx:</b> ${record.entity.custentity_mx_sat_industry_type?upper_case}
                        </#if>
                        <br/><br/><b>Domicilio Fiscal:</b> ${record.billaddress?replace("<br />",  " ")?upper_case}
                        <br/><br/><b>Uso del CFDI:</b>
                            <#if uso_cfdi == "D01"> D01 - HONORARIOS MÉDICOS, DENTALES Y GASTOS HOSPITALARIOS
                            <#elseif uso_cfdi == "D02"> D02 - GASTOS MÉDICOS POR INCAPACIDAD O DISCAPACIDAD
                            <#elseif uso_cfdi == "D03"> D03 - GASTOS FUNERALES
                            <#elseif uso_cfdi == "D04"> D04 - DONATIVOS
                            <#elseif uso_cfdi == "D05"> D05 - INTERESES REALES EFECTIVAMENTE PAGADOS POR CRÉDITOS HIPOTECARIOS (CASA HABITACIÓN)
                            <#elseif uso_cfdi == "D06"> D06 - APORTACIONES VOLUNTARIAS AL SAR
                            <#elseif uso_cfdi == "D07"> D07 - PRIMAS POR SEGUROS DE GASTOS MÉDICOS
                            <#elseif uso_cfdi == "D08"> D08 - GASTOS DE TRANSPORTACIÓN ESCOLAR OBLIGATORIA
                            <#elseif uso_cfdi == "D09"> D09 - DEPÓSITOS EN CUENTAS PARA EL AHORRO, PRIMAS QUE TENGAN COMO BASE PLANES DE PENSIONES
                            <#elseif uso_cfdi == "D10"> D10 - PAGOS POR SERVICIOS EDUCATIVOS (COLEGIATURAS)
                            <#elseif uso_cfdi == "G01"> G01 - ADQUISICIÓN DE MERCANCÍAS
                            <#elseif uso_cfdi == "G02"> G02 - DEVOLUCIONES, DESCUENTOS O BONIFICACIONES
                            <#elseif uso_cfdi == "G03"> G03 - GASTOS EN GENERAL
                            <#elseif uso_cfdi == "I01"> 01 - CONSTRUCCIONES
                            <#elseif uso_cfdi == "I02"> I02 - MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES
                            <#elseif uso_cfdi == "I03"> I03 - EQUIPO DE TRANSPORTE
                            <#elseif uso_cfdi == "I04"> I04 - EQUIPO DE CÓMPUTO Y ACCESORIOS
                            <#elseif uso_cfdi == "I05"> I05 - DADOS, TROQUELES, MOLDES, MATRICES Y HERRAMENTAL
                            <#elseif uso_cfdi == "I06"> I06 - COMUNICACIONES TELEFÓNICAS
                            <#elseif uso_cfdi == "I07"> I07 - COMUNICACIONES SATELITALES
                            <#elseif uso_cfdi == "I08"> I08 - OTRA MAQUINARIA Y EQUIPO
                            <#elseif uso_cfdi == "P01"> P01 - POR DEFINIR
                            <#elseif uso_cfdi == "S01"> S01 - SIN EFECTOS FISCALES
                            <#elseif uso_cfdi == "CN01"> CN01 - NÓMINA
                            <#elseif uso_cfdi == "CP01"> CP01 - PAGOS
                            <#else>
                            </#if>
                        </td>
                    <td></td>

                    <td align="left" colspan="14"
                        style="border: 1px; border-color: #e3e3e3; font-size:9px;">${record.custbody_efx_fe_kiosko_address?upper_case} </td>
                </tr>
            </table>
        <#else>
            <table style="width: 100%; margin-top: 10px;">
                <tr>
                    <td class="body" colspan="14" style="background-color: #80BFFF; font-size:9px;"><b>Cliente</b></td>
                    <td></td>
                    <td class="body" colspan="14" style="background-color: #80BFFF; font-size:9px"><b>Emisor</b></td>
                </tr>
                <tr>
                    <td colspan="14" rowspan="2"
                        style="border: 1px; border-color: #e3e3e3; font-size:9px;">${dataXML.Receptor.atributos.Nombre}
                        <#if dataXML?has_content>
                            <#assign uso_cfdi = dataXML.Receptor.atributos.UsoCFDI>
                        <#else>
                            <#assign uso_cfdi = record.custbody_mx_cfdi_usage?keep_before(" ")>
                        </#if>
                        <br/><br/><b>RFC:</b> <#outputformat "XML">${dataXML.Receptor.atributos.Rfc}</#outputformat><br/>
                        <#if record.entity.custentity_mx_sat_industry_type?has_content>
                          <br /><b>Régimen Fiscal:</b> ${record.entity.custentity_mx_sat_industry_type?upper_case}
                        </#if>
                          <br/><br/><b>Domicilio Fiscal:</b> ${record.billaddress?replace("<br />",  " ")?upper_case}
                          <br/><br/><b>Uso del CFDI:</b>
                            <#if uso_cfdi == "D01"> D01 - HONORARIOS MÉDICOS, DENTALES Y GASTOS HOSPITALARIOS
                            <#elseif uso_cfdi == "D02"> D02 - GASTOS MÉDICOS POR INCAPACIDAD O DISCAPACIDAD
                            <#elseif uso_cfdi == "D03"> D03 - GASTOS FUNERALES
                            <#elseif uso_cfdi == "D04"> D04 - DONATIVOS
                            <#elseif uso_cfdi == "D05"> D05 - INTERESES REALES EFECTIVAMENTE PAGADOS POR CRÉDITOS HIPOTECARIOS (CASA HABITACIÓN)
                            <#elseif uso_cfdi == "D06"> D06 - APORTACIONES VOLUNTARIAS AL SAR
                            <#elseif uso_cfdi == "D07"> D07 - PRIMAS POR SEGUROS DE GASTOS MÉDICOS
                            <#elseif uso_cfdi == "D08"> D08 - GASTOS DE TRANSPORTACIÓN ESCOLAR OBLIGATORIA
                            <#elseif uso_cfdi == "D09"> D09 - DEPÓSITOS EN CUENTAS PARA EL AHORRO, PRIMAS QUE TENGAN COMO BASE PLANES DE PENSIONES
                            <#elseif uso_cfdi == "D10"> D10 - PAGOS POR SERVICIOS EDUCATIVOS (COLEGIATURAS)
                            <#elseif uso_cfdi == "G01"> G01 - ADQUISICIÓN DE MERCANCÍAS
                            <#elseif uso_cfdi == "G02"> G02 - DEVOLUCIONES, DESCUENTOS O BONIFICACIONES
                            <#elseif uso_cfdi == "G03"> G03 - GASTOS EN GENERAL
                            <#elseif uso_cfdi == "I01"> 01 - CONSTRUCCIONES
                            <#elseif uso_cfdi == "I02"> I02 - MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES
                            <#elseif uso_cfdi == "I03"> I03 - EQUIPO DE TRANSPORTE
                            <#elseif uso_cfdi == "I04"> I04 - EQUIPO DE CÓMPUTO Y ACCESORIOS
                            <#elseif uso_cfdi == "I05"> I05 - DADOS, TROQUELES, MOLDES, MATRICES Y HERRAMENTAL
                            <#elseif uso_cfdi == "I06"> I06 - COMUNICACIONES TELEFÓNICAS
                            <#elseif uso_cfdi == "I07"> I07 - COMUNICACIONES SATELITALES
                            <#elseif uso_cfdi == "I08"> I08 - OTRA MAQUINARIA Y EQUIPO
                            <#elseif uso_cfdi == "P01"> P01 - POR DEFINIR
                            <#elseif uso_cfdi == "S01"> S01 - SIN EFECTOS FISCALES
                            <#elseif uso_cfdi == "CN01"> CN01 - NÓMINA
                            <#elseif uso_cfdi == "CP01"> CP01 - PAGOS
                            <#else>
                            </#if>
                        </td>
                    <td></td>

                    <td colspan="14" rowspan="2" style="border: 1px; border-color: #e3e3e3; font-size:9px;">
                        <#if subsidiary?has_content>    
                            <#if subsidiary.custrecord_mx_sat_registered_name?has_content>
                                ${subsidiary.custrecord_mx_sat_registered_name?upper_case}
                                <br/><br/><b>RFC:</b> 
                                <#if dataXML?has_content>
                                  ${dataXML.Emisor.atributos.Rfc}
                                <#else>
                                  ${subsidiary.federalidnumber}
                                </#if>
                            </#if>
                        <#else>
                          ${companyInformation.legalname?upper_case?keep_before(",")}
                          <#if dataXML?has_content>
                            <br/><br/><b>RFC:</b> ${dataXML.Emisor.atributos.Rfc}
                          <#else>
                            <br/><br/><b>RFC:</b> ${companyInformation.employerid}
                          </#if>
                        </#if>
                        
                        <br/><br/><b>Régimen Fiscal:</b> ${infoEmpresa.custrecord_mx_sat_industry_type?upper_case}
                
                        </td>

                </tr>
            </table>
        </#if>
    <#else>
        <#if record.custbody_efx_fe_kiosko_customer?has_content>
            <table style="width: 100%; margin-top: 10px;">
                <tr>
                    <td class="body" colspan="14" style="background-color: #80BFFF; font-size:9px;"><b>Cliente</b></td>
                    <td></td>
                    <td class="body" colspan="14" style="background-color: #80BFFF; font-size:9px"><b>Emisor</b></td>
                </tr>
                <tr>
                    <td colspan="14" rowspan="2"
                        style="border: 1px; border-color: #e3e3e3; font-size:9px;">${record.custbody_efx_fe_kiosko_name}
                        <#if dataXML?has_content>
                            <#assign uso_cfdi = dataXML.Receptor.atributos.UsoCFDI>
                        <#else>
                            <#assign uso_cfdi = record.custbody_mx_cfdi_usage?keep_before(" ")>
                        </#if>
                        <br/><br/><b>RFC:</b> <#outputformat "XML">${record.custbody_efx_fe_kiosko_rfc?upper_case}</#outputformat>
                        <br/>
                        <#if record.entity.custentity_mx_sat_industry_type?has_content>
                                <br /><b>Régimen Fiscal:</b> ${record.entity.custentity_mx_sat_industry_type?upper_case}
                            </#if>
                          <br/><br/><b>Domicilio Fiscal:</b> ${record.billaddress?replace("<br />",  " ")?upper_case}
                          <br/><br/><b>Uso del CFDI:</b>
                            <#if uso_cfdi == "D01"> D01 - HONORARIOS MÉDICOS, DENTALES Y GASTOS HOSPITALARIOS
                            <#elseif uso_cfdi == "D02"> D02 - GASTOS MÉDICOS POR INCAPACIDAD O DISCAPACIDAD
                            <#elseif uso_cfdi == "D03"> D03 - GASTOS FUNERALES
                            <#elseif uso_cfdi == "D04"> D04 - DONATIVOS
                            <#elseif uso_cfdi == "D05"> D05 - INTERESES REALES EFECTIVAMENTE PAGADOS POR CRÉDITOS HIPOTECARIOS (CASA HABITACIÓN)
                            <#elseif uso_cfdi == "D06"> D06 - APORTACIONES VOLUNTARIAS AL SAR
                            <#elseif uso_cfdi == "D07"> D07 - PRIMAS POR SEGUROS DE GASTOS MÉDICOS
                            <#elseif uso_cfdi == "D08"> D08 - GASTOS DE TRANSPORTACIÓN ESCOLAR OBLIGATORIA
                            <#elseif uso_cfdi == "D09"> D09 - DEPÓSITOS EN CUENTAS PARA EL AHORRO, PRIMAS QUE TENGAN COMO BASE PLANES DE PENSIONES
                            <#elseif uso_cfdi == "D10"> D10 - PAGOS POR SERVICIOS EDUCATIVOS (COLEGIATURAS)
                            <#elseif uso_cfdi == "G01"> G01 - ADQUISICIÓN DE MERCANCÍAS
                            <#elseif uso_cfdi == "G02"> G02 - DEVOLUCIONES, DESCUENTOS O BONIFICACIONES
                            <#elseif uso_cfdi == "G03"> G03 - GASTOS EN GENERAL
                            <#elseif uso_cfdi == "I01"> 01 - CONSTRUCCIONES
                            <#elseif uso_cfdi == "I02"> I02 - MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES
                            <#elseif uso_cfdi == "I03"> I03 - EQUIPO DE TRANSPORTE
                            <#elseif uso_cfdi == "I04"> I04 - EQUIPO DE CÓMPUTO Y ACCESORIOS
                            <#elseif uso_cfdi == "I05"> I05 - DADOS, TROQUELES, MOLDES, MATRICES Y HERRAMENTAL
                            <#elseif uso_cfdi == "I06"> I06 - COMUNICACIONES TELEFÓNICAS
                            <#elseif uso_cfdi == "I07"> I07 - COMUNICACIONES SATELITALES
                            <#elseif uso_cfdi == "I08"> I08 - OTRA MAQUINARIA Y EQUIPO
                            <#elseif uso_cfdi == "P01"> P01 - POR DEFINIR
                            <#elseif uso_cfdi == "S01"> S01 - SIN EFECTOS FISCALES
                            <#elseif uso_cfdi == "CN01"> CN01 - NÓMINA
                            <#elseif uso_cfdi == "CP01"> CP01 - PAGOS
                            <#else>
                            </#if>
                        </td>
                    <td></td>
                          
                    <td colspan="14" rowspan="2" style="border: 1px; border-color: #e3e3e3; font-size:9px;">
                        <#if subsidiary?has_content>    
                            <#if subsidiary.custrecord_mx_sat_registered_name?has_content>
                                ${subsidiary.custrecord_mx_sat_registered_name?upper_case}
                                <br/><br/><b>RFC:</b> ${subsidiary.federalidnumber}
                            </#if>
                        <#else>
                            ${companyInformation.legalname?upper_case}
                            <br/><br/><b>RFC:</b> ${companyInformation.employerid}
                        </#if>
                        
                        <br/><br/><b>Régimen Fiscal Emisor:</b> ${infoEmpresa.custrecord_mx_sat_industry_type?upper_case}
                
                        </td>
                    <td></td>
                        
                    
                </tr>
            </table>
        <#else>
            <table style="width: 100%; margin-top: 10px;">
                <tr>
                    <td class="body" colspan="14" style="background-color: #80BFFF; font-size:9px;"><b>Cliente</b></td>
                    <td></td>
                    <td class="body" colspan="14" style="background-color: #80BFFF; font-size:9px"><b>Emisor</b></td>
                </tr>
                <tr>
                <#if record.entity.custentity_mx_sat_registered_name?has_content>
                    <td colspan="14" rowspan="2"
                        style="border: 1px; border-color: #e3e3e3; font-size:9px;">${record.entity.custentity_mx_sat_registered_name}<br/><br/><b>RFC:</b> <#outputformat "XML">${record.custbody_mx_customer_rfc?upper_case}</#outputformat>
                        <#if dataXML?has_content>
                            <#assign uso_cfdi = dataXML.Receptor.atributos.UsoCFDI>
                        <#else>
                            <#assign uso_cfdi = record.custbody_mx_cfdi_usage?keep_before(" ")>
                        </#if>
                        <br/>
                        <#if record.entity.custentity_mx_sat_industry_type?has_content>
                            <br /><b>Régimen Fiscal:</b> ${record.entity.custentity_mx_sat_industry_type?upper_case}
                        </#if>
                        <br/><br/><b>Domicilio Fiscal:</b> ${record.billaddress?replace("<br />",  " ")?upper_case}
                        <br/><br/><b>Uso del CFDI:</b>
                            <#if uso_cfdi == "D01"> D01 - HONORARIOS MÉDICOS, DENTALES Y GASTOS HOSPITALARIOS
                            <#elseif uso_cfdi == "D02"> D02 - GASTOS MÉDICOS POR INCAPACIDAD O DISCAPACIDAD
                            <#elseif uso_cfdi == "D03"> D03 - GASTOS FUNERALES
                            <#elseif uso_cfdi == "D04"> D04 - DONATIVOS
                            <#elseif uso_cfdi == "D05"> D05 - INTERESES REALES EFECTIVAMENTE PAGADOS POR CRÉDITOS HIPOTECARIOS (CASA HABITACIÓN)
                            <#elseif uso_cfdi == "D06"> D06 - APORTACIONES VOLUNTARIAS AL SAR
                            <#elseif uso_cfdi == "D07"> D07 - PRIMAS POR SEGUROS DE GASTOS MÉDICOS
                            <#elseif uso_cfdi == "D08"> D08 - GASTOS DE TRANSPORTACIÓN ESCOLAR OBLIGATORIA
                            <#elseif uso_cfdi == "D09"> D09 - DEPÓSITOS EN CUENTAS PARA EL AHORRO, PRIMAS QUE TENGAN COMO BASE PLANES DE PENSIONES
                            <#elseif uso_cfdi == "D10"> D10 - PAGOS POR SERVICIOS EDUCATIVOS (COLEGIATURAS)
                            <#elseif uso_cfdi == "G01"> G01 - ADQUISICIÓN DE MERCANCÍAS
                            <#elseif uso_cfdi == "G02"> G02 - DEVOLUCIONES, DESCUENTOS O BONIFICACIONES
                            <#elseif uso_cfdi == "G03"> G03 - GASTOS EN GENERAL
                            <#elseif uso_cfdi == "I01"> 01 - CONSTRUCCIONES
                            <#elseif uso_cfdi == "I02"> I02 - MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES
                            <#elseif uso_cfdi == "I03"> I03 - EQUIPO DE TRANSPORTE
                            <#elseif uso_cfdi == "I04"> I04 - EQUIPO DE CÓMPUTO Y ACCESORIOS
                            <#elseif uso_cfdi == "I05"> I05 - DADOS, TROQUELES, MOLDES, MATRICES Y HERRAMENTAL
                            <#elseif uso_cfdi == "I06"> I06 - COMUNICACIONES TELEFÓNICAS
                            <#elseif uso_cfdi == "I07"> I07 - COMUNICACIONES SATELITALES
                            <#elseif uso_cfdi == "I08"> I08 - OTRA MAQUINARIA Y EQUIPO
                            <#elseif uso_cfdi == "P01"> P01 - POR DEFINIR
                            <#elseif uso_cfdi == "S01"> S01 - SIN EFECTOS FISCALES
                            <#elseif uso_cfdi == "CN01"> CN01 - NÓMINA
                            <#elseif uso_cfdi == "CP01"> CP01 - PAGOS
                            <#else>
                            </#if>
                    </td>
                <#else>
                    <td colspan="14" rowspan="2" style="border: 1px; border-color: #e3e3e3; font-size:9px;"><#if record.entity.altname?has_content>${record.entity.altname}<#elseif record.entity.companyname?has_content><#else>${record.entity.firstname} ${record.entity.lastname}</#if><br/><br/><b>RFC:</b> <#outputformat "XML">${record.custbody_mx_customer_rfc?upper_case}</#outputformat>
                        <#if dataXML?has_content>
                            <#assign uso_cfdi = dataXML.Receptor.atributos.UsoCFDI>
                        <#else>
                            <#assign uso_cfdi = record.custbody_mx_cfdi_usage?keep_before(" ")>
                        </#if>
                        <br/>
                        <#if record.entity.custentity_mx_sat_industry_type?has_content>
                            <br /><b>Régimen Fiscal:</b> ${record.entity.custentity_mx_sat_industry_type?upper_case}
                        </#if>
                        <br/><br/><b>Domicilio Fiscal:</b> ${record.billaddress?replace("<br />",  " ")?upper_case}
                        <br/><br/><b>Uso del CFDI:</b>
                            <#if uso_cfdi == "D01"> D01 - HONORARIOS MÉDICOS, DENTALES Y GASTOS HOSPITALARIOS
                            <#elseif uso_cfdi == "D02"> D02 - GASTOS MÉDICOS POR INCAPACIDAD O DISCAPACIDAD
                            <#elseif uso_cfdi == "D03"> D03 - GASTOS FUNERALES
                            <#elseif uso_cfdi == "D04"> D04 - DONATIVOS
                            <#elseif uso_cfdi == "D05"> D05 - INTERESES REALES EFECTIVAMENTE PAGADOS POR CRÉDITOS HIPOTECARIOS (CASA HABITACIÓN)
                            <#elseif uso_cfdi == "D06"> D06 - APORTACIONES VOLUNTARIAS AL SAR
                            <#elseif uso_cfdi == "D07"> D07 - PRIMAS POR SEGUROS DE GASTOS MÉDICOS
                            <#elseif uso_cfdi == "D08"> D08 - GASTOS DE TRANSPORTACIÓN ESCOLAR OBLIGATORIA
                            <#elseif uso_cfdi == "D09"> D09 - DEPÓSITOS EN CUENTAS PARA EL AHORRO, PRIMAS QUE TENGAN COMO BASE PLANES DE PENSIONES
                            <#elseif uso_cfdi == "D10"> D10 - PAGOS POR SERVICIOS EDUCATIVOS (COLEGIATURAS)
                            <#elseif uso_cfdi == "G01"> G01 - ADQUISICIÓN DE MERCANCÍAS
                            <#elseif uso_cfdi == "G02"> G02 - DEVOLUCIONES, DESCUENTOS O BONIFICACIONES
                            <#elseif uso_cfdi == "G03"> G03 - GASTOS EN GENERAL
                            <#elseif uso_cfdi == "I01"> 01 - CONSTRUCCIONES
                            <#elseif uso_cfdi == "I02"> I02 - MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES
                            <#elseif uso_cfdi == "I03"> I03 - EQUIPO DE TRANSPORTE
                            <#elseif uso_cfdi == "I04"> I04 - EQUIPO DE CÓMPUTO Y ACCESORIOS
                            <#elseif uso_cfdi == "I05"> I05 - DADOS, TROQUELES, MOLDES, MATRICES Y HERRAMENTAL
                            <#elseif uso_cfdi == "I06"> I06 - COMUNICACIONES TELEFÓNICAS
                            <#elseif uso_cfdi == "I07"> I07 - COMUNICACIONES SATELITALES
                            <#elseif uso_cfdi == "I08"> I08 - OTRA MAQUINARIA Y EQUIPO
                            <#elseif uso_cfdi == "P01"> P01 - POR DEFINIR
                            <#elseif uso_cfdi == "S01"> S01 - SIN EFECTOS FISCALES
                            <#elseif uso_cfdi == "CN01"> CN01 - NÓMINA
                            <#elseif uso_cfdi == "CP01"> CP01 - PAGOS
                            <#else>
                            </#if>
                        </td>
                        </#if>
                    <td></td>

                    <td colspan="14" rowspan="2" style="border: 1px; border-color: #e3e3e3; font-size:9px;">
                        <#if subsidiary?has_content>
                            <#if subsidiary.custrecord_mx_sat_registered_name?has_content>
                                ${subsidiary.custrecord_mx_sat_registered_name?upper_case}
                                <br/><br/><b>RFC:</b> ${subsidiary.federalidnumber}
                            </#if>
                        <#else>
                            ${(companyInformation.legalname?upper_case)?keep_before(",")}
                            <br/><br/><b>RFC:</b> ${companyInformation.employerid}
                            <#--  <#list record.custbody_efx_fe_dirsubs?split(" ") as x>
                              <#assign quanti = x?length>
                              ${x[quanti]}
                            </#list>  -->
                            <#list subsidiary.taxregistration as subsy>
                              ${subsy.taxregistrationnumber}
                            </#list>
                        </#if>
                        
                        <br/><br/><b>Régimen Fiscal:</b> ${infoEmpresa.custrecord_mx_sat_industry_type?upper_case}
                    </td>

                </tr>
            </table>
        </#if>
    </#if>

    <table class="body" style="width: 100%; margin-top: 9px;">
        <tr>
          <#if record.entity.terms?has_content >
            <th colspan="3" style="background-color: #80BFFF;">Condiciones de Pago:</th>
          </#if>
          <th colspan="3" style="background-color: #80BFFF;">Orden de venta</th>
          <th colspan="3" style="background-color: #80BFFF;">Moneda</th>
          <#if record.otherrefnum?has_content >
            <th colspan="3" style="background-color: #80BFFF;">ODC</th>
          </#if>
        </tr>
        <tr>
          <#if record.entity.terms?has_content >
            <td colspan="3" style="font-size:9px;">${record.entity.terms}</td>
          </#if>
          <td colspan="3" style="font-size:9px;">${record.createdfrom}</td>
          <#--  <td colspan="3" style="font-size:9px;">${record.exchangerate?string["0.00"]}</td>  -->
          <td colspan="3" style="font-size:9px;">${record.currency.symbol}</td>
          <#if record.otherrefnum?has_content >
            <td colspan="3" style="font-size:9px;">${record.otherrefnum}</td>
          </#if>
        </tr>
        <!--<tr>
          <th colspan= "18" style="width: 100%;">Comentarios</th>
          </tr>
          <tr>
          <td colspan= "18" style="width: 100%; font-size:10px;">${record.memo}</td>
        </tr>-->
    </table>

    <#assign "line_discount"= 0>
    <#assign "importe_discount" = []>
    <#list record.item as item>
        <#assign "tipo_articulo" = item.item?keep_before(" ")>
        <#if tipo_articulo == "Descuento">
            <#assign "importe_discount" = importe_discount+ [item.grossamt]>
        <#else>
            <#assign "importe_discount" = importe_discount + [0]>
        </#if>
    </#list>
    <#assign "importe_discount" = importe_discount+ [0]>
    <#assign "descuento_total" = 0>


    <#if dataXML?has_content>
        <table class="itemtable" style="width: 100%; margin-top: 3px; border: 1px; border-color: #e3e3e3;">
            <#if dataXML.Conceptos.Concepto?is_sequence>
                <thead>
                <tr style="margin-top: 0px; padding-top: 0px; padding-bottom: 0px">
                    <th align="center" colspan="2"
                        style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">Partida
                    </th>
                    <#--  <th align="center" colspan="5"
                        style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">Código<br/>Clave
                    </th>  -->
                    <th align="center" colspan="4"
                        style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">Cantidad
                    </th>
                    <th align="center" colspan="18" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        <table style="width: 100%; margin-top: 0px; margin-bottom: 0px; border: 1px; border-color: #80BFFF; background-color: #80BFFF;">
                            <tr>
                              <th align="center" colspan="18" style="font-size: 5pt; padding-top: 0px; padding-bottom: 2px; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                                Descripción
                              </th>
                            </tr>
                            <#--  <tr>
                                <td colspan="18" style="border-left: 1px; border-color: #80BFFF; background-color: #80BFFF;">
                                    <table style="width: 100%; margin-top: 0px; margin-bottom: 0px;">
                                        <tr>
                                          <td align="left" colspan="4" style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">
                                            Base
                                          </td>
                                          <td align="left" colspan="3" style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">
                                            Factor
                                          </td>
                                          <td align="left" colspan="3" style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">
                                            Tasa
                                          </td>
                                          <td align="left" colspan="4" style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">
                                            Importe
                                          </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>  -->
                        </table>
                    </th>
                    <th align="center" colspan="5"
                        style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">UPC
                    </th>
                    <th align="center" colspan="2"
                        style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">Unidad
                    </th>
                    <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      Precio<br/>Unitario
                    </th>
                    <#--  <th align="center" colspan="4"
                        style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">Impuesto
                    </th>  -->
                    <th align="center" colspan="4"
                        style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">Descuento
                    </th>
                    <th align="center" colspan="4"
                        style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">Importe
                    </th>
                </tr>
                </thead>
                <#assign linexml = 0>
                <#list dataXML.Conceptos.Concepto as Conceptos>
                    <#assign linexml = linexml+1>
                    <tr>
                        <td align="center" colspan="2" line-height="150%"
                            style="border-left: 0px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${linexml?string["0"]}
                        </td>
                        <#--  <td align="center" colspan="5" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding:0;">
                          ${Conceptos.atributos.ClaveProdServ}
                        </td>  -->
                        <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">
                            ${Conceptos.atributos.Cantidad?number?string[",##0.00"]}
                        </td>
                        <td colspan="18" style="margin: 0; padding: 0;">
                            <table style="width: 100%">
                                <tr>
                                    <td colspan="18"
                                        style="border-left: 1px; border-color: #e3e3e3; font-size: 6pt; padding-right: 1px; padding-left: 1px; padding-top: 1px; padding-bottom: 0px;">${Conceptos.atributos.Descripcion}</td>
                                </tr>
                                <tr>
                                    <td colspan="18" style="border-left: 1px; border-color: #e3e3e3;">
                                        <table style="width: 100%; margin-top: 0px; margin-bottom: 0px;">
                                            <#--  <#if Conceptos.Impuestos.Traslados.Traslado?has_content>
                                                <#if Conceptos.Impuestos.Traslados.Traslado?is_sequence>
                                                    <#list Conceptos.Impuestos.Traslados.Traslado as traslado_imp>
                                                        <tr>
                                                            <td align="left" colspan="4"
                                                                style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${traslado_imp.atributos.Base?number?string[",##0.00"]}</td>
                                                            <td align="left" colspan="2"
                                                                style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${traslado_imp.atributos.Impuesto}</td>
                                                                <#assign tasa_line = traslado_imp.atributos.TasaOCuota?number * 100>                                              
                                                            <#if traslado_imp.atributos.TasaOCuota?has_content>
                                                            <td align="left" colspan="4"
                                                                style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${tasa_line?string[",##0.00"]}
                                                                %
                                                            </td>
                                                            <#else>
                                                            <td align="left" colspan="4"
                                                                style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">Exento</td>
                                                            </#if>
                                                            <td align="left" colspan="4"
                                                                style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${traslado_imp.atributos.Importe?number?string[",##0.00"]}</td>
                                                        </tr>
                                                    </#list>
                                                <#else>
                                                    <tr>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Traslados.Traslado.atributos.Base?number?string[",##0.00"]}</td>
                                                        <td align="left" colspan="2"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Traslados.Traslado.atributos.Impuesto}</td>
                                                        <#assign tasa_line = Conceptos.Impuestos.Traslados.Traslado.atributos.TasaOCuota?number * 100>
                                                        <#if Conceptos.Impuestos.Traslados.Traslado.atributos.TasaOCuota?has_content>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${tasa_line?string[",##0.00"]}
                                                            %
                                                        </td>
                                                        <#else>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">Exento</td>
                                                        </#if>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Traslados.Traslado.atributos.Importe?number?string[",##0.00"]}</td>
                                                    </tr>
                                                </#if>
                                            </#if>  -->

                                            <#if Conceptos.Impuestos.Retenciones.Retencion?has_content>
                                                <#if Conceptos.Impuestos.Retenciones.Retencion?is_sequence>
                                                    <#list Conceptos.Impuestos.Retenciones.Retencion as ret_imp>
                                                        <tr>
                                                            <td align="left" colspan="4"
                                                                style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${ret_imp.atributos.Base?number?string[",##0.00"]}</td>
                                                            <td align="left" colspan="2"
                                                                style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${ret_imp.atributos.Impuesto}</td>
                                                            <#assign tasa_line = ret_imp.atributos.TasaOCuota?number * 100>
                                                            <td align="left" colspan="4"
                                                                style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${tasa_line?string[",##0.00"]}%
                                                            </td>
                                                            <td align="left" colspan="4"
                                                                style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${ret_imp.atributos.Importe?number?string[",##0.00"]}</td>
                                                        </tr>
                                                    </#list>
                                                <#else>
                                                    <tr>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Retenciones.Retencion.atributos.Base?number?string[",##0.00"]}</td>
                                                        <td align="left" colspan="2"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Retenciones.Retencion.atributos.Impuesto}</td>
                                                        <#assign tasa_line = Conceptos.Impuestos.Retenciones.Retencion.atributos.TasaOCuota?number * 100>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${tasa_line?string[",##0.00"]}
                                                            %
                                                        </td>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Retenciones.Retencion.atributos.Importe?number?string[",##0.00"]}</td>
                                                    </tr>
                                                </#if>
                                            </#if>
                                        </table>
                                    </td>
                                </tr>
                                <#if Conceptos.InformacionAduanera.NumeroPedimento?has_content>
                                    <tr style="padding:0px 0px;">
                                        <td colspan="6" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">
                                            <b>Pedimento:</b></td>
                                        <td colspan="13"
                                            style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${Conceptos.InformacionAduanera.NumeroPedimento}</td>
                                    </tr>
                                </#if>
                                <#if record.entity.custentity_mx_sat_industry_type?has_content && Conceptos.atributos.ObjetoImp?has_content>
                                        <tr style="padding:0px 0px;" align="center">
                                            <td colspan="6"
                                                style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px; border-left: 1px; border-color: #e3e3e3;"><b>Objeto de impuesto:</b><br/>
                                            </td>
                                            <#--  <td colspan="13" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${custcol_mx_txn_line_sat_tax_object}</td>  -->
                                            <#if Conceptos.atributos.ObjetoImp?number == 1>
                                                <#assign objImpDesc = "NO OBJETO DE IMPUESTO.">
                                            <#elseif Conceptos.atributos.ObjetoImp?number == 2>
                                                <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO.">
                                            <#elseif Conceptos.atributos.ObjetoImp?number == 3>
                                                <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO Y NO OBLIGATORIO AL DESGLOSE.">
                                            </#if>
                                            <td colspan="17" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${Conceptos.atributos.ObjetoImp} - ${objImpDesc}</td>
                                        </tr>
                                    </#if>
                            </table>
                        </td>

                        <td align="center" colspan="5"
                            style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${Conceptos.atributos.NoIdentificacion}</td>
                        <td align="center" colspan="2"
                            style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${Conceptos.atributos.Unidad}</td>
                        <td align="center" colspan="4"
                            style="border-left: 1px; border-color: #e3e3e3; font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${Conceptos.atributos.ValorUnitario?number?string[",##0.00"]}</td>
                        <#assign impuestos_line_calc = 0>
                        <#if Conceptos.Impuestos.Traslados.Traslado?has_content>
                            <#if Conceptos.Impuestos.Traslados.Traslado?is_sequence>
                                <#list Conceptos.Impuestos.Traslados.Traslado as impuestos_linec>
                                    <#assign impuestos_line_calc = impuestos_line_calc + impuestos_linec.atributos.Importe?number>
                                </#list>
                            <#else>
                                <#assign impuestos_line_calc = impuestos_line_calc + Conceptos.Impuestos.Traslados.Traslado.atributos.Importe?number>
                            </#if>
                        </#if>
                        <#if Conceptos.Impuestos.Retenciones.Retencion?has_content>
                            <#if Conceptos.Impuestos.Retenciones.Retencion?is_sequence>
                                <#list Conceptos.Impuestos.Retenciones.Retencion as impuestos_linec>
                                    <#assign impuestos_line_calc = impuestos_line_calc - impuestos_linec.atributos.Importe?number>
                                </#list>
                            <#else>
                                <#assign impuestos_line_calc = impuestos_line_calc - Conceptos.Impuestos.Retenciones.Retencion.atributos.Importe?number>
                            </#if>
                        </#if>
                        <#--  <td align="center" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">
                          ${impuestos_line_calc?string[",##0.00"]}
                        </td>  -->
                        <td align="center" colspan="4"
                            style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${Conceptos.atributos.Descuento?number?string[",##0.00"]}</td>
                        <td align="center" colspan="4"
                            style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${Conceptos.atributos.Importe?number?string[",##0.00"]}</td>
                    </tr>
                    <#if record.custbody_efx_fe_complemento_educativo?has_content && record.custbody_efx_fe_complemento_educativo == true && Conceptos.ComplementoConcepto.instEducativas.atributos.nombreAlumno?has_content>
                        <tr>                
                            <td align="left" colspan="13"
                                style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>Nombre del Alumno</b><br/>${Conceptos.ComplementoConcepto.instEducativas.atributos.nombreAlumno}
                            </td>
                            <td align="left" colspan="13"
                                style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>Nivel Educativo</b><br/>${Conceptos.ComplementoConcepto.instEducativas.atributos.nivelEducativo}
                            </td>
                            <td align="left" colspan="13"
                                style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>CURP</b><br/>${Conceptos.ComplementoConcepto.instEducativas.atributos.CURP}
                            </td>
                            <td align="left" colspan="13"
                                style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>AUTRVOE</b><br/>${Conceptos.ComplementoConcepto.instEducativas.atributos.autRVOE}
                            </td>
                        </tr>                      
                    </#if>
                </#list>
            <#else>
                <thead>
                <tr style="margin-top: 0px; padding-top: 0px; padding-bottom: 0px">
                    <th align="center" colspan="2" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        Partida
                    </th>
                    <#--  <th align="center" colspan="5" style="font-size: 6pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      Código<br/>Clave
                    </th>  -->
                    <th align="center" colspan="4" style="font-size: 6pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        Cantidad
                    </th>
                    <th align="center" colspan="18" style="font-size: 6pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        <table style="width: 100%; margin-top: 0px; margin-bottom: 0px; border: 1px; border-color: #80BFFF; background-color: #80BFFF;">
                          <tr>
                            <th align="center" colspan="18" vertical-align="top" style="font-size: 6pt; padding-top: 0px; padding-bottom: 2px; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                              Descripción
                            </th>
                          </tr>
                          <#--  <tr>
                            <td colspan="18" style="border-left: 1px; border-color: #80BFFF; background-color: #80BFFF;">
                              <table style="width: 100%; margin-top: 0px; margin-bottom: 0px;">
                                <tr>
                                  <td align="left" colspan="4" style="font-size: 6pt; padding-top: 0px; padding-bottom: 0px;">
                                    Base
                                  </td>
                                  <td align="left" colspan="3" style="font-size: 6pt; padding-top: 0px; padding-bottom: 0px;">
                                    Factor
                                  </td>
                                  <td align="left" colspan="3" style="font-size: 6pt; padding-top: 0px; padding-bottom: 0px;">
                                    Tasa
                                  </td>
                                  <td align="left" colspan="4" style="font-size: 6pt; padding-top: 0px; padding-bottom: 0px;">
                                    Importe
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>  -->
                        </table>
                    </th>
                    <th align="center" colspan="5" style="font-size: 6pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      UPC
                    </th>
                    <th align="center" colspan="2" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        Unidad
                    </th>
                    <th align="center" colspan="4" style="font-size: 6pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      Precio<br/>Unitario
                    </th>
                    <#--  <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        Impuesto
                    </th>  -->
                    <th align="center" colspan="4" style="font-size: 6pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        Descuento
                    </th>
                    <th align="center" colspan="4" style="font-size: 6pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        Importe
                    </th>
                </tr>
                </thead>
                <tr>
                    <td align="center" colspan="2" line-height="150%"
                        style="border-left: 0px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">1
                    </td>
                    <#--  <td align="center" colspan="5" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding:0;">
                      ${dataXML.Conceptos.Concepto.atributos.ClaveProdServ}
                    </td>  -->
                    <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">
                      ${dataXML.Conceptos.Concepto.atributos.Cantidad?number?string[",##0.00"]}
                    </td>
                    <td colspan="18" style="margin: 0; padding: 0;">
                        <table style="width: 100%">
                            <tr>
                              <td colspan="18"
                                  style="border-left: 1px; border-color: #e3e3e3; font-size: 6pt; padding-right: 1px; padding-left: 1px; padding-top: 1px; padding-bottom: 0px;">${dataXML.Conceptos.Concepto.atributos.Descripcion}
                              </td>
                            </tr>
                            <tr>
                                <td colspan="18" style="border-left: 1px; border-color: #e3e3e3;">
                                    <table style="width: 100%; margin-top: 0px; margin-bottom: 0px;">
                                        <#--  <#if Conceptos.Impuestos.Traslados.Traslado?has_content>
                                            <#if Conceptos.Impuestos.Traslados.Traslado?is_sequence>
                                                <#list Conceptos.Impuestos.Traslados.Traslado as traslado_imp>
                                                    <tr>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${traslado_imp.atributos.Base?number?string[",##0.00"]}</td>
                                                        <td align="left" colspan="2"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${traslado_imp.atributos.Impuesto}</td>
                                                        <#assign tasa_line = traslado_imp.atributos.TasaOCuota?number * 100>
                                                        <#if traslado_imp.atributos.TasaOCuota?has_content>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${tasa_line?string[",##0.00"]}
                                                            %
                                                        </td>
                                                        <#else>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">Exento</td>
                                                        </#if>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${traslado_imp.atributos.Importe?number?string[",##0.00"]}</td>
                                                    </tr>
                                                </#list>
                                            <#else>
                                                <tr>
                                                    <td align="left" colspan="4"
                                                        style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Traslados.Traslado.atributos.Base?number?string[",##0.00"]}</td>
                                                    <td align="left" colspan="2"
                                                        style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Traslados.Traslado.atributos.Impuesto}</td>
                                                    <#assign tasa_line = Conceptos.Impuestos.Traslados.Traslado.atributos.TasaOCuota?number * 100>
                                                    <#if Conceptos.Impuestos.Traslados.Traslado.atributos.TasaOCuota?has_content>
                                                    <td align="left" colspan="4"
                                                        style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${tasa_line?string[",##0.00"]}
                                                        %
                                                    </td>
                                                    <#else>
                                                    <td align="left" colspan="4"
                                                        style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">Exento</td>
                                                    </#if>
                                                    <td align="left" colspan="4"
                                                        style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Traslados.Traslado.atributos.Importe?number?string[",##0.00"]}</td>
                                                </tr>
                                            </#if>
                                        </#if>  -->

                                        <#if Conceptos.Impuestos.Retenciones.Retencion?has_content>
                                            <#if Conceptos.Impuestos.Retenciones.Retencion?is_sequence>
                                                <#list Conceptos.Impuestos.Retenciones.Retencion as ret_imp>
                                                    <tr>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${ret_imp.atributos.Base?number?string[",##0.00"]}</td>
                                                        <td align="left" colspan="2"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${ret_imp.atributos.Impuesto}</td>
                                                        <#assign tasa_line = ret_imp.atributos.TasaOCuota?number * 100>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${tasa_line?string[",##0.00"]}
                                                            %
                                                        </td>
                                                        <td align="left" colspan="4"
                                                            style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${ret_imp.atributos.Importe?number?string[",##0.00"]}</td>
                                                    </tr>
                                                </#list>
                                            <#else>
                                                <tr>
                                                    <td align="left" colspan="4"
                                                        style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Retenciones.Retencion.atributos.Base?number?string[",##0.00"]}</td>
                                                    <td align="left" colspan="2"
                                                        style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Retenciones.Retencion.atributos.Impuesto}</td>
                                                    <#assign tasa_line = Conceptos.Impuestos.Retenciones.Retencion.atributos.TasaOCuota?number * 100>
                                                    <td align="left" colspan="4"
                                                        style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${tasa_line?string[",##0.00"]}
                                                        %
                                                    </td>
                                                    <td align="left" colspan="4"
                                                        style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${Conceptos.Impuestos.Retenciones.Retencion.atributos.Importe?number?string[",##0.00"]}</td>
                                                </tr>
                                            </#if>
                                        </#if>
                                    </table>
                                </td>
                            </tr>
                            <#if dataXML.Conceptos.Concepto.InformacionAduanera.NumeroPedimento?has_content>
                                <tr style="padding:0px 0px;">
                                    <td colspan="6" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;"><b>Pedimento:</b>
                                    </td>
                                    <td colspan="13"
                                        style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${dataXML.Conceptos.Concepto.InformacionAduanera.NumeroPedimento}</td>
                                </tr>
                            </#if>
                            <#if record.entity.custentity_mx_sat_industry_type?has_content && dataXML.Conceptos.Concepto.atributos.ObjetoImp?has_content>
                                <#if dataXML.Conceptos.Concepto.atributos.ObjetoImp?number == 1>
                                    <#assign objImpDesc = "NO OBJETO DE IMPUESTO.">
                                <#elseif dataXML.Conceptos.Concepto.atributos.ObjetoImp?number == 2>
                                    <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO.">
                                <#elseif dataXML.Conceptos.Concepto.atributos.ObjetoImp?number == 3>
                                    <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO Y NO OBLIGATORIO AL DESGLOSE.">
                                </#if>
                                <tr style="padding:0px 0px;">
                                    <td colspan="6"
                                        style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;"><b>Objeto de impuesto:</b><br/>
                                    </td>
                                    <td colspan="17" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${dataXML.Conceptos.Concepto.atributos.ObjetoImp} - ${objImpDesc}</td>
                                </tr>
                            </#if>
                        </table>
                    </td>
                    <td align="center" colspan="5"
                        style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${dataXML.Conceptos.Concepto.atributos.NoIdentificacion}</td>
                    <td align="center" colspan="2"
                        style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${dataXML.Conceptos.Concepto.atributos.Unidad}</td>
                    <td align="center" colspan="4"
                        style="border-left: 1px; border-color: #e3e3e3; font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${dataXML.Conceptos.Concepto.atributos.ValorUnitario?number?string[",##0.00"]}</td>
                    <#assign impuestos_line_calc = 0>
                    <#if Conceptos.Impuestos.Traslados.Traslado?has_content>
                        <#if Conceptos.Impuestos.Traslados.Traslado?is_sequence>
                            <#list Conceptos.Impuestos.Traslados.Traslado as impuestos_linec>
                                <#assign impuestos_line_calc = impuestos_line_calc + impuestos_linec.atributos.Importe?number>
                            </#list>
                        <#else>
                            <#assign impuestos_line_calc = impuestos_line_calc + Conceptos.Impuestos.Traslados.Traslado.atributos.Importe?number>
                        </#if>
                    </#if>
                    <#if Conceptos.Impuestos.Retenciones.Retencion?has_content>
                        <#if Conceptos.Impuestos.Retenciones.Retencion?is_sequence>
                            <#list Conceptos.Impuestos.Retenciones.Retencion as impuestos_linec>
                                <#assign impuestos_line_calc = impuestos_line_calc - impuestos_linec.atributos.Importe?number>
                            </#list>
                        <#else>
                            <#assign impuestos_line_calc = impuestos_line_calc - Conceptos.Impuestos.Retenciones.Retencion.atributos.Importe?number>
                        </#if>
                    </#if>
                    <#--  <td align="center" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">
                      ${impuestos_line_calc?string[",##0.00"]}
                    </td>  -->
                    <td align="center" colspan="4"
                        style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${dataXML.Conceptos.Concepto.atributos.Descuento?number?string[",##0.00"]}</td>
                    <td align="center" colspan="4"
                        style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${dataXML.Conceptos.Concepto.atributos.Importe?number?string[",##0.00"]}</td>
                </tr>
                <#if record.custbody_efx_fe_complemento_educativo?has_content && record.custbody_efx_fe_complemento_educativo == true && dataXML.Conceptos.Concepto.ComplementoConcepto.instEducativas.atributos.nombreAlumno?has_content>
                    <tr>                
                        <td align="left" colspan="13"
                            style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>Nombre del Alumno</b><br/>${dataXML.Conceptos.Concepto.ComplementoConcepto.instEducativas.atributos.nombreAlumno}
                        </td>
                        <td align="left" colspan="13"
                            style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>Nivel Educativo</b><br/>${dataXML.Conceptos.Concepto.ComplementoConcepto.instEducativas.atributos.nivelEducativo}
                        </td>
                        <td align="left" colspan="13"
                            style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>CURP</b><br/>${dataXML.Conceptos.Concepto.ComplementoConcepto.instEducativas.atributos.CURP}
                        </td>
                        <td align="left" colspan="13"
                            style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>AUTRVOE</b><br/>${dataXML.Conceptos.Concepto.ComplementoConcepto.instEducativas.atributos.autRVOE}
                        </td>
                    </tr> 
                </#if>
            </#if>
        </table>
    <#else>
        <table class="itemtable" style="width: 100%; margin-top: 3px; border: 1px; border-color: #e3e3e3;">
            <#list record.item as item><#if item_index==0>
                <thead>
                <tr style="margin-top: 0px; padding-top: 0px; padding-bottom: 0px">
                    <th align="center" colspan="2" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        Partida
                    </th>
                    <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                        Código
                    </th>
                    <#--  <th align="center" colspan="5" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      Código<br/>Clave
                    </th>  -->
                    <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      Cantidad
                    </th>
                    <th align="center" colspan="18" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      <table style="width: 100%; margin-top: 0px; margin-bottom: 0px; border: 1px; border-color: #80BFFF">
                        <tr>
                          <th align="center" colspan="18" style="font-size: 5pt; padding-top: 0px; padding-bottom: 2px; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                            Descripción
                          </th>
                        </tr>
                        <#--  <tr>
                          <td align="left" colspan="4"
                              style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">Base
                          </td>
                          <td align="left" colspan="4"
                              style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px; margin-top: 0px">
                              Impuesto
                          </td>
                          <td align="left" colspan="3"
                              style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">Factor
                          </td>
                          <td align="left" colspan="3"
                              style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">Tasa
                          </td>
                          <td align="left" colspan="4"
                              style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">Importe
                          </td>
                        </tr>  -->
                      </table>
                    </th>
                    <th align="center" colspan="5" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      UPC
                    </th>
                    <th align="center" colspan="2" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      Unidad
                    </th>
                    <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      Precio<br/>Unitario
                    </th>
                    <#--  <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      Impuesto
                    </th>  -->
                    <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      Descuento
                    </th>
                    <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px; background-color: #80BFFF;">
                      ${item.amount@label}
                    </th>
                </tr>
                </thead>
            </#if>
              <#assign "tipo_articulo" = item.item?keep_before(" ")>
              <#assign "line_number"= item_index + 1>
              <#if item.quantity?has_content==false>
                  <#assign "line_discount" = line_discount + 1>
              </#if>
              <#assign "line_number"= line_number - line_discount>
              <#if item.quantity?has_content>
                  <tr>
                      <#assign "desglose_json" = item.custcol_efx_fe_tax_json>
                      <#if desglose_json?has_content>
                          <#assign "desglose" = desglose_json?eval>
                          <td align="center" colspan="2" line-height="150%"
                              style="border-left: 0px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${line_number?string["0"]}</td>
                          <td align="center" colspan="4" line-height="150%"
                              style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${item.item?keep_before(" ")}</td>
                          <#--  <td align="center" colspan="5" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding:0;">
                            ${item.custcol_mx_txn_line_sat_item_code?keep_before(" ")}
                          </td>  -->
                          <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">
                            ${item.quantity}
                          </td>
                          <td colspan="18" style="margin: 0; padding: 0;">
                              <table style="width: 100%">
                                  <tr>
                                      <td colspan="18"
                                          style="border-left: 1px; border-color: #e3e3e3; font-size: 6pt; padding-right: 1px; padding-left: 1px; padding-top: 1px; padding-bottom: 0px;">${item.description}</td>
                                  </tr>
                                  <tr>
                                      <td colspan="18" style="border-left: 1px; border-color: #e3e3e3;">
                                          <table style="width: 100%; margin-top: 0px; margin-bottom: 0px;">
                                              <#if desglose.ieps.name?has_content>
                                                  <tr>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${desglose.ieps.base_importe?number?string[",##0.00"]}</td>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${desglose.ieps.name}</td>
                                                      <td align="left" colspan="2"
                                                          style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${desglose.ieps.factor}</td>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${desglose.ieps.rate}
                                                          %
                                                      </td>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${desglose.ieps.importe?number?string[",##0.00"]}</td>
                                                  </tr>
                                              </#if>
                                              <#--  <#if desglose.iva.name?has_content>
                                                  <tr>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${desglose.iva.base_importe?number?string[",##0.00"]}</td>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${desglose.iva.name}</td>
                                                      <td align="left" colspan="2"
                                                          style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${desglose.iva.factor}</td>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${desglose.iva.rate}
                                                          %
                                                      </td>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${desglose.iva.importe?number?string[",##0.00"]}</td>
                                                  </tr>
                                              </#if>  -->
                                              <#if desglose_exento?has_content>
                                                  <tr>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt; padding-top: 0px; padding-bottom: 0px;">${desglose.exento.base_importe?number?string[",##0.00"]}</td>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${desglose.exento.name}</td>
                                                      <td align="left" colspan="2"
                                                          style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">${desglose.exento.factor}</td>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;">
                                                      </td>
                                                      <td align="left" colspan="4"
                                                          style="font-size: 5pt;padding-top: 0px; padding-bottom: 0px;"></td>
                                                  </tr>
                                              
                                              </#if>
                                              
                                          </table>
                                      </td>
                                  </tr>
                                  <#if item.custcol_mx_txn_line_sat_cust_req_num?has_content>
                                      <tr style="padding:0px 0px;">
                                          <td colspan="6"
                                              style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;"><b>Pedimento:</b>
                                          </td>
                                          <td colspan="13"
                                              style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_mx_txn_line_sat_cust_req_num}</td>
                                      </tr>
                                  </#if>
                                  <#if record.entity.custentity_mx_sat_industry_type?has_content && item.custcol_mx_txn_line_sat_tax_object?has_content>
                                      <tr style="padding:0px 0px;" align="center">
                                          <td colspan="6"
                                              style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px; border-left: 1px; border-color: #e3e3e3;"><b>Objeto de impuesto:</b><br/>
                                          </td>
                                          <#--  <td colspan="13" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${custcol_mx_txn_line_sat_tax_object}</td>  -->
                                          
                                          <td colspan="17" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_mx_txn_line_sat_tax_object}</td>
                                      </tr>
                                  </#if>
                                  <#if record.entity.custentity_mx_sat_industry_type?has_content && dataXML?has_content>
                                  <#if dataXML.Conceptos.Concepto.atributos.ObjetoImp?has_content>
                                          <#if dataXML.Conceptos.Concepto.atributos.ObjetoImp?number == 1>
                                              <#assign objImpDesc = "NO OBJETO DE IMPUESTO.">
                                          <#elseif dataXML.Conceptos.Concepto.atributos.ObjetoImp?number == 2>
                                              <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO.">
                                          <#elseif dataXML.Conceptos.Concepto.atributos.ObjetoImp?number == 3>
                                              <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO Y NO OBLIGATORIO AL DESGLOSE.">
                                          </#if>
                                          <tr style="padding:0px 0px;">
                                              <td colspan="6"
                                                  style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;"><b>Objeto de impuesto:</b><br/>
                                              </td>
                                              <td colspan="17"
                                                  style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${dataXML.Conceptos.Concepto.atributos.ObjetoImp} - ${ObjetoImp}</td>
                                          </tr>
                                      </#if>
                                      </#if>
                              </table>
                          </td>
                          <td align="center" colspan="5"
                              style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.custcol_efx_fe_upc_code}</td>
                          <td align="center" colspan="2"
                              style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.units}</td>
                          <td align="center" colspan="4"
                              style="border-left: 1px; border-color: #e3e3e3; font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.rate?string[",##0.00"]}</td>
                          <#--  <td align="center" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">
                            ${item.tax1amt}
                          </td>  -->
                          <td align="center" colspan="4"
                              style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${importe_discount[item_index+1]?number?string[",##0.00"]}</td>
                          <#assign "descuento_total" = descuento_total + importe_discount[item_index+1]>
                          <td align="center" colspan="4"
                              style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.grossamt}</td>
                      </#if>
                  </tr>
                  <#if record.custbody_efx_fe_complemento_educativo?has_content && record.custbody_efx_fe_complemento_educativo == true && item.custcol_csc_nombrealumno?has_content>
                      <tr>                
                          <td align="left" colspan="14"
                              style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>Nombre del Alumno</b><br/>${item.custcol_csc_nombrealumno}
                          </td>
                          <td align="left" colspan="14"
                              style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>Nivel Educativo</b><br/>${item.custcol_csc_nivelacademico_venta}
                          </td>
                          <td align="left" colspan="14"
                              style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>CURP</b><br/>${item.custcol_csc_curp_venta}
                          </td>
                          <td align="left" colspan="14"
                              style="font-size: 5pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #161616;"><b>AUTRVOE</b><br/>${item.custcol_csc_rvoeitem}
                          </td>
                      </tr> 
                  </#if>
              </#if>
            </#list>
        </table>
    </#if>

    <#if record.custbody_efx_fe_detalle_imp_loc?has_content>
        <#assign listaLocales = record.custbody_efx_fe_detalle_imp_loc?eval>
        <table class="itemtable" style="width: 100%; margin-top: 3px; border: 1px; border-color: #e3e3e3;">
            <thead>
            <tr style="margin-top: 0px; padding-top: 0px; padding-bottom: 0px">
                <th align="center" colspan="2" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Impuesto Local</th>
                <th align="center" colspan="2" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Tasa</th>
                <th align="center" colspan="2" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Porcentaje</th>
                <th align="center" colspan="2" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Importe</th>
            </tr>
            </thead>
            <#list listaLocales as listadoLocales>
                <tr>
                    <td align="center" colspan="2" line-height="150%" style="border-left: 0px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${listadoLocales.impLocRetenido}</td>
                    <td align="center" colspan="2" line-height="150%" style="border-left: 0px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${listadoLocales.tasadeRetencion}</td>
                    <td align="center" colspan="2" line-height="150%" style="border-left: 0px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${listadoLocales.porcentaje}</td>
                    <td align="center" colspan="2" line-height="150%" style="border-left: 0px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${listadoLocales.importe}</td>
                </tr>
            </#list>
        </table>
    </#if>


    <#assign "desglose_json_body" = record.custbody_efx_fe_tax_json>
    <#if desglose_json_body?has_content>
        <#assign "desglose_body" = desglose_json_body?eval>
        <#assign "desglose_ieps" = desglose_body.rates_ieps>
        <#assign "desglose_iva" = desglose_body.rates_iva>
        <#assign "desglose_ret" = desglose_body.rates_retencion>
        <#assign "retencion_total" = desglose_body.retencion_total?number?string[",##0.00"]>
        <#assign "desglose_loc" = retencion_total>
    <#else>
        <#assign "desglose_ieps" = 0>
        <#assign "desglose_iva" = 0>
        <#assign "desglose_ret" = 0>
        <#assign "desglose_loc" = 0>
        <#assign "retencion_total" = 0>
    </#if>


    <table style="width: 100%; margin-top: 0px; padding: 0px; border: 1px; border-top: 0px; border-color: #e3e3e3;">
        <tr>
            <td colspan="6" style="margin: 0px; padding: 0px;">
                <table class="total" style="width: 100%; margin-top: 0px; border: 0px; border-color: #e3e3e3;">
                    <tr>
                        <td align="left" colspan="2"
                            style="border-top: 0px; border-bottom: 1px; border-color: #e3e3e3; font-size: 7pt;border-right: 0px;">
                            <strong>Cantidad con letra:</strong> ${record.custbody_efx_fe_total_text}</td>
                    </tr>
                    
                  <#if record.location?has_content>
                   <tr>
                        <td align="left" colspan="2"
                            style=" border-bottom: 1px; border-color: #e3e3e3; font-size: 7pt;">
                            <strong>Ubicación:</strong> ${record.location}</td>
                    </tr> 
                  </#if>
                        <!--<td align="left"
                            style="border-right: 1px; border-bottom: 1px; border-color: #e3e3e3; font-size: 7pt;">
                            <strong>Ubicacion:</strong> ${record.location}</td>
                        <td align="left"
                            style="font-size: 7pt; border-bottom: 1px; border-color: #e3e3e3; padding-left: 0px;border-right: 0px;">
                            <table style="margin-left: 0px; padding-left: 0px;margin-top: 0px; padding-top: 0px;">
                                  
                              <tr>
                                    <td align="left"
                                        style="font-size: 7pt; padding-left: 0px;margin-top: 0px; padding-top: 0px;">
                                        <strong>Test </strong></td>  
                                  <td style="font-size: 7pt;margin-top: 0px; padding-top: 0px;">
                                        
                                    </td>
                                </tr>
                            </table> 
                        </td>-->
                    <tr>
                        <td colspan="2" style="font-size: 7pt;border-color: #e3e3e3; border-right: 0px;">
                            <b>Comentarios: </b> ${record.memo?upper_case}</td>
                    </tr>
                </table>
            </td>
            <td colspan="2" style="margin: 0px; padding: 0;">
                <table style="width: 100%; margin-top: 0px; margin-left: 0px; border: 0px; border-color: #e3e3e3;">
                    <tr>
                      <td colspan="1" style="font-size: 7pt; border-color: #e3e3e3;border-left: 1px;">
                        <b>Subtotal</b>
                      </td>
                      <#if dataXML?has_content>
                        <td align="right" colspan="1" style="font-size: 7pt;">${dataXML.atributos.SubTotal?number?string[",##0.00"]}</td>
                      <#else>
                        <#if record.custbody_efx_fe_gbl_subtotal?has_content>
                          <td align="right" colspan="1" style="font-size: 7pt;">
                            ${record.custbody_efx_fe_gbl_subtotal?number?string[",##0.00"]}
                          </td>
                        <#else>
                          <td align="right" colspan="1" style="font-size: 7pt;">
                            ${record.subtotal?string[",##0.00"]}
                          </td>
                        </#if>
                      </#if>
                    </tr>
                    <tr>
                      <td colspan="1" style="font-size: 7pt;  border-color: #e3e3e3;border-left: 1px;">
                          <b>Descuento</b></td>
                      <#if dataXML?has_content>
                          <td align="right" colspan="1" style="font-size: 7pt;">${dataXML.atributos.Descuento?number?string[",##0.00"]}</td>
                      <#else>
                          <#if descuento_total != 0>
                              <td align="right" colspan="1"
                                  style="font-size: 7pt;"><#if desglose_total_discount?has_content>${desglose_total_discount?number?string[",##0.00"]}</#if></td>
                          <#else>
                              <#if record.discounttotal != 0>
                                  <td align="right" colspan="1" style="font-size: 7pt;">${record.discounttotal}</td>
                              <#else>
                                  <td align="right" colspan="1" style="font-size: 7pt;">0.00</td>
                              </#if>
                          </#if>
                      </#if>
                    </tr>
                    <tr>
                      <td colspan="1" style="font-size: 7pt;  border-color: #e3e3e3;border-left: 1px;">
                        <b>IVA</b>
                      </td>
                      <#if dataXML?has_content>
                        <td align="right" colspan="1" style="font-size: 7pt;">
                          ${dataXML.Impuestos.atributos.TotalImpuestosTrasladados?number?string[",##0.00"]}
                        </td>
                      <#else>
                        <#if desglose_json_body?has_content>
                            <#assign "desglose_body" = desglose_json_body?eval>
                            <#assign "iva_total" = desglose_body.iva_total>
                            <#assign totalivaGBL = iva_total/>
                        </#if>
                        <td align="right" colspan="1" style="font-size: 7pt;">
                          ${totalivaGBL?number?string[",##0.00"]}
                        </td>
                      </#if>
                    </tr>
                    <#if dataXML?has_content>
                        <#if dataXML.Impuestos.Traslados.Traslado?is_sequence>
                            <#list dataXML.Impuestos.Traslados.Traslado as traslados_lista>
                                <#assign iva_ratenum = traslados_lista.atributos.TasaOCuota?number * 100>
                                    <tr>
                                    <#if traslados_lista.atributos.TasaOCuota?has_content>
                                        <td colspan="2" style="font-size: 5pt;">
                                            ${iva_ratenum}%: ${traslados_lista.atributos.Importe?number?string[",##0.00"]}<br/>
                                        </td>
                                        <#else>
                                        <td colspan="2" style="font-size: 5pt;">Exento</td>
                                        </#if>
                                    </tr>
                            </#list>
                            <#else>
                                <#assign iva_ratenum = dataXML.Impuestos.Traslados.Traslado.atributos.TasaOCuota?number * 100>
                                <tr>
                                <#if dataXML.Impuestos.Traslados.Traslado.atributos.TasaOCuota?has_content>
                                    <td colspan="2" style="font-size: 5pt;">
                                        ${iva_ratenum}%: ${dataXML.Impuestos.Traslados.Traslado.atributos.Importe?number?string[",##0.00"]}<br/>
                                    </td>
                                    <#else>
                                    <td colspan="2" style="font-size: 5pt;">Exento</td>
                                    </#if>
                                </tr>
                        </#if>

                        <#else>
                            <#if desglose_json_body?has_content>
                                <#assign "desglose_body" = desglose_json_body?eval>
                                <#assign "iva_total_desgloses" = desglose_body.rates_iva_data>
                                <#assign obj_totales_imp = iva_total_desgloses/>
                            </#if>
                            <#list obj_totales_imp as Iva_rate, Iva_total>
                                <#assign iva_ratenum = Iva_rate?number>
                                <#assign iva_tasaocuota = iva_ratenum/100>
                                <#if Iva_rate == "16" || Iva_rate == "0">
                                    <tr>
                                        <td colspan="2" style="border-color: #e3e3e3; border-left: 1px; font-size: 5pt;">
                                            ${Iva_rate}%: ${Iva_total?number?string["0.00"]}<br/>
                                        </td>
                                    </tr>
                                </#if>
                            </#list>
                    </#if>

                    <#--  <tr>
                        <td colspan="1" style="font-size: 7pt;  border-color: #e3e3e3;border-left: 1px;"><b>Retenciones</b></td>
                        <#if dataXML?has_content>
                            <td align="right" colspan="1"
                                style="font-size: 7pt;">${dataXML.Impuestos.atributos.TotalImpuestosRetenidos?number?string[",##0.00"]}</td>
                        <#else>
                            <td align="right" colspan="1"
                                style="font-size: 7pt;">${retencion_total}</td>
                        </#if>
                    </tr>  -->

                    <tr>
                        <td colspan="1" style="font-size: 7pt;  border-color: #e3e3e3;border-left: 1px;"><b>Total</b>
                        </td>
                        <#if dataXML?has_content>
                            <td align="right" colspan="1" style="font-size: 7pt;">${dataXML.atributos.Total?number?string[",##0.00"]}</td>
                        <#else>
                            <td align="right" colspan="1"
                                style="font-size: 7pt;"><#if cabecera_total?has_content>${cabecera_total?number?string[",##0.00"]}</#if></td>
                        </#if>
                    </tr>
                </table>
            </td>


        </tr>
    </table>

    <table style="width: 100%; margin-top: 10px; padding: 0; border: 0px; border-color: #e3e3e3;">
        <tr>
            <th colspan="6" style="background-color: #80BFFF;">Detalles del comprobante</th>
        </tr>
        <tr>
            <td colspan="1" style="font-size: 7pt;"><b>Lugar de Expedición:</b></td>
            <#if dataXML?has_content>
            <#if dataXML.atributos.LugarExpedicion?has_content>
                    <td colspan="2" style="font-size: 7pt;">${dataXML.atributos.LugarExpedicion}</td>
                
                </#if>
                <#else>
                    <td colspan="2" style="font-size: 7pt;">${record.subsidiary.zip}</td>
                </#if>
                <#if dataXML?has_content>
                <#assign forma_pago = dataXML.atributos.FormaPago>
            <#else>
                <#assign forma_pago = record.custbody_mx_txn_sat_payment_method?keep_before(" ")>
            </#if>
            <td colspan="1" style="font-size: 7pt"><b>Forma de pago:</b></td>
            <#if forma_pago == "01">
                <td colspan="2" style="font-size: 7pt">01 - EFECTIVO</td>
            <#elseif forma_pago == "02">
                <td colspan="2" style="font-size: 7pt">02 - CHEQUE NOMINATIVO</td>
            <#elseif forma_pago == "03">
                <td colspan="2" style="font-size: 7pt">03 - TRANSFERENCIA ELECTRÓNICA DE FONDOS</td>
            <#elseif forma_pago == "04">
                <td colspan="2" style="font-size: 7pt">04 - TARJETA DE CRÉDITO</td>
            <#elseif forma_pago == "05">
                <td colspan="2" style="font-size: 7pt">05 - MONEDERO ELECTRÓNICO</td>
            <#elseif forma_pago == "06">
                <td colspan="2" style="font-size: 7pt">06 - DINERO ELECTRÓNICO</td>
            <#elseif forma_pago == "07">
                <td colspan="2" style="font-size: 7pt">07 - TARJETAS DIGITALES</td>
            <#elseif forma_pago == "08">
                <td colspan="2" style="font-size: 7pt">08 - VALES DE DESPENSA</td>
            <#elseif forma_pago == "09">
                <td colspan="2" style="font-size: 7pt">09 - BIENES</td>
            <#elseif forma_pago == "10">
                <td colspan="2" style="font-size: 7pt">10 - SERVICIO</td>
            <#elseif forma_pago == "11">
                <td colspan="2" style="font-size: 7pt">11 - POR CUENTA DE TERCERO</td>
            <#elseif forma_pago == "12">
                <td colspan="2" style="font-size: 7pt">12 - DACIÓN EN PAGO</td>
            <#elseif forma_pago == "13">
                <td colspan="2" style="font-size: 7pt">13 - PAGO POR SUBROGACIÓN</td>
            <#elseif forma_pago == "14">
                <td colspan="2" style="font-size: 7pt">14 - PAGO POR CONSIGNACIÓN</td>
            <#elseif forma_pago == "15">
                <td colspan="2" style="font-size: 7pt">15 - CONDONACIÓN</td>
            <#elseif forma_pago == "16">
                <td colspan="2" style="font-size: 7pt">16 - CANCELACIÓN</td>
            <#elseif forma_pago == "17">
                <td colspan="2" style="font-size: 7pt">17 - COMPENSACIÓN</td>
            <#elseif forma_pago == "23">
                <td colspan="2" style="font-size: 7pt">23 - NOVACIÓN</td>
            <#elseif forma_pago == "24">
                <td colspan="2" style="font-size: 7pt">24 - CONFUSIÓN</td>
            <#elseif forma_pago == "25">
                <td colspan="2" style="font-size: 7pt">25 - REMISIÓN DE DEUDA</td>
            <#elseif forma_pago == "26">
                <td colspan="2" style="font-size: 7pt">26 - PRESCRIPCIÓN O CADUCIDAD</td>
            <#elseif forma_pago == "27">
                <td colspan="2" style="font-size: 7pt">27 - A SATISFACCIÓN DEL ACREEDOR</td>
            <#elseif forma_pago == "28">
                <td colspan="2" style="font-size: 7pt">28 - TARJETA DE DÉBITO</td>
            <#elseif forma_pago == "29">
                <td colspan="2" style="font-size: 7pt">29 - TARJETA DE SERVICIOS</td>
            <#elseif forma_pago == "30">
                <td colspan="2" style="font-size: 7pt">30 - APLICACIÓN DE ANTICIPOS</td>
            <#elseif forma_pago == "31">
                <td colspan="2" style="font-size: 7pt">31 - INTERMEDIARIO PAGOS</td>
            <#elseif forma_pago == "98">
                <td colspan="2" style="font-size: 7pt">98 - N/A</td>
            <#elseif forma_pago == "99">
                <td colspan="2" style="font-size: 7pt">99 - POR DEFINIR</td>
            <#else>
                <td colspan="2" style="font-size: 7pt"></td>
            </#if>
        </tr>
        <tr>
            <td colspan="1" style="font-size: 7pt;"><b>Tipo de Comprobante:</b></td>
            <td colspan="2" style="font-size: 7pt;">I - Ingreso</td>
          
                      <td colspan="1" style="font-size: 7pt;"><b>Método de pago:</b></td>
            <#if dataXML?has_content>
                <#assign metodo_pago = dataXML.atributos.MetodoPago>
            <#else>
                <#assign metodo_pago = record.custbody_mx_txn_sat_payment_term?keep_before(" ")>
            </#if>

            <#if metodo_pago == "PUE">
                <td colspan="2" style="font-size: 7pt">PUE - PAGO EN UNA SOLA EXHIBICION</td>
            <#elseif metodo_pago == "PPD">
                <td colspan="2" style="font-size: 7pt">PPD - PAGO EN PARCIALIDADES O DIFERIDO</td>
            <#else>
                <td colspan="2" style="font-size: 7pt"></td>
            </#if>

        </tr>
        <tr>
         
        <#if record.entity.custentity_mx_sat_industry_type?has_content>
                    <td colspan="1" style="font-size: 7pt;"><b>Tipo de Exportación:</b></td>
                    <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_cfdi_sat_export_type}</td>
            </#if>
          
        </tr>

    </table>

    <#if record.custbody_efx_fe_ce_destinatario_name?has_content>
<table style="width: 100%; margin-top: 10px; padding: 0; border: 0px; border-color: #e3e3e3;">
    <tr>
        <th colspan="6">Comercio Exterior</th>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>No. Registro Receptor:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_recep_num_reg}</td>
        <td colspan="1" style="font-size: 7pt;"><b>Residencia Fiscal Receptor:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_rec_residenciaf}</td>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Tipo de Cambio:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_exchage}</td>
        <td colspan="1" style="font-size: 7pt;"><b>Clave de Incoterm:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_incoterm}</td>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Total en Dolares:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_totalusd}</td>
        <td colspan="1" style="font-size: 7pt;"><b>Clave de Pedimento:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_clavepedimento}</td>

    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>No. Registro Propietario:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_propietario_numreg}</td>
        <td colspan="1" style="font-size: 7pt;"><b>Residencia Fiscal Propietario:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_p_residenciafiscal}</td>

    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Motivo de Traslado:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_motivo_traslado}</td>
        <td colspan="1" style="font-size: 7pt;"><b>No. Certificado Origen:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_ncertificado_origen}</td>

    </tr>

</table>


<table class="itemtable" style="width: 100%; margin-top: 3px; border: 1px; border-color: #e3e3e3;"><#list record.item as item><#if item_index==0>
    <thead>
    <tr style= "margin-top: 0px; padding-top: 0px; padding-bottom: 0px">
        <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Código</th>
        <th align="center" colspan="5" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">No. Identificación</th>
        <th align="center" colspan="8" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Fracción Arancelaria</th>
        <th align="center" colspan="2" style="font-size: 4pt; padding-left: 0px; padding-right: 0px;">Cantidad Aduana</th>
        <th align="center" colspan="5" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Unidad Aduana</th>
        <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Valor Unitario Aduana</th>
        <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Valor en Dolares</th>

    </tr>
    </thead>
</#if>

<tr>


    <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${item.item?keep_before(" ")}</td>
    <td align="center" colspan="5" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding:0;">${item.custcol_efx_fe_upc_code}</td>
    <td colspan="8" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top:1px;">${item.custcol_efx_fe_ce_farancel_code}</td>
    <td align="center" colspan="2" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.custcol_efx_fe_ce_cant_aduana}</td>
    <td align="center" colspan="5" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.custcol_efx_fe_unit_code_ce}</td>
    <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.custcol_efx_fe_ce_val_uni_aduana}</td>
    <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.custcol_efx_fe_ce_val_dolares}</td>

</tr>

</#list></table>

</#if>

    <#if record.custbody_efx_fe_leyendafiscal == true>
        <#if record.custbody_efx_fe_leyendafiscal_detail?has_content>
            <#assign leyendaFiscal = record.custbody_efx_fe_leyendafiscal_detail>
            <table style="width: 100%; margin-top: 10px; padding: 0; border: 0px; border-color: #e3e3e3;">
                <tr>
                    <th>Leyenda Fiscal</th>
                </tr>
                <#if leyendaFiscal.custrecord_efx_fe_leyf_disposicionfiscal?has_content>
                    <tr>
                        <td style="font-size: 7pt;"><b>Disposicion
                                Fiscal:</b> ${leyendaFiscal.custrecord_efx_fe_leyf_disposicionfiscal}</td>
                    </tr>
                </#if>

                <#if leyendaFiscal.custrecord_efx_fe_leyf_norma?has_content>
                    <tr>
                        <td style="font-size: 7pt;"><b>Norma:</b> ${leyendaFiscal.custrecord_efx_fe_leyf_norma}</td>
                    </tr>
                </#if>

                <tr>
                    <td style="font-size: 7pt;"><b>Texto
                            Leyenda:</b> ${leyendaFiscal.custrecord_efx_fe_leyf_textoleyenda}</td>
                </tr>

            </table>
        </#if>
    </#if>
<#if record.custbody_efx_fe_donativo == true>
<table class="tablascompletas" style="margin-top:5px;">
            <tr>
                <td colspan="9" class="cabecera"><b>Complemento Donativo</b></td>                
            </tr>
            <tr>            
                <td colspan="9" class="cuerposnoarticulos">
                <b>Número de Autorización: </b>${record.custbody_efx_fe_cd_no_autorizacion}<br/>
                <b>Fecha de Autorización: </b>${record.custbody_efx_fe_cd_fecha_autorizacion}<br/>
                <b>Leyenda: </b>${record.custbody_efx_fe_cd_fe_leyenda}
                </td>            
            </tr>
        </table>
        </#if>

    <#if certData?has_content>
        <table class="tablascompletas" style="margin-top:5px;">
            <tr>
                <td colspan="3" class="cabecera"><b>Folio Fiscal</b></td>
                <td colspan="3" class="cabecera"><b>Certificado Digital SAT</b></td>
                <td colspan="3" class="cabecera"><b>Fecha de certificación</b></td>
            </tr>
            <tr>
                <#assign datearray = certData.custbody_mx_cfdi_certify_timestamp?split("T")>
                <td colspan="3" class="cuerposnoarticulos">${certData.custbody_mx_cfdi_uuid}</td>
                <td colspan="3" class="cuerposnoarticulos">${certData.custbody_mx_cfdi_sat_serial}</td>
                <td colspan="3" class="cuerposnoarticulos">

                    <#if datearray?size == 2 >
                        <#assign dayarray = datearray[0]?split("-")>
                        ${dayarray[2]}/${dayarray[1]}/${dayarray[0]} ${datearray[1]}
                    <#else>
                        ${certData.custbody_mx_cfdi_certify_timestamp}
                    </#if>
                </td>
            </tr>
        </table>

        <#if record.custbody_efx_fe_related_cfdi_json?has_content>
        <#assign jsonRelacionados=record.custbody_efx_fe_related_cfdi_json?eval>
            <#if jsonRelacionados?size != 0>
                <table class="total" style="width: 100%; margin-top: 10px; border: 1px; border-bottom: 0px; border-color: #e3e3e3;">
                    <tr>
                        <td class="cabecera" colspan="8"><b>Documentos Relacionados</b></td>  
                    </tr>
                    <tr>
                        <td align="left" colspan="2" style="font-size: 8pt; font-weight: bold;border-top:1px;border-bottom:1px;border-right:0px;border-color: #e3e3e3;">Folio</td>
                        <td align="left" colspan="3" style="font-size: 8pt; font-weight: bold;border-top:1px;border-bottom:1px;border-right:0px;border-color: #e3e3e3;">Tipo</td>
                        <td align="left" colspan="3" style="font-size: 8pt; font-weight: bold;border-top:1px;border-bottom:1px;border-color: #e3e3e3;">UUID</td>
                    </tr>
                    <#assign jsonRelacionados=record.custbody_efx_fe_related_cfdi_json?eval>
                    <#list jsonRelacionados as cfdiRel>
                        <tr style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:90%; padding-left: 12px;font-size: 6pt;">
                            <td colspan="2" style="border-bottom:1px;border-right:0px;border-color: #e3e3e3;">
                                ${cfdiRel.fol}
                            </td>
                        
                        
                            <td colspan="3" style="border-bottom:1px;border-right:0px;border-color: #e3e3e3;">
                                ${cfdiRel.type}
                            </td>
                        
                        
                            <td colspan="3" style="bold;border-bottom:1px;border-color: #e3e3e3;">
                                ${cfdiRel.uuid}
                            </td>
                        </tr>        
                    </#list>
                </table>
            </#if>
        </#if>

        <table class="total" style="width: 100%; margin-top: 10px; border: 1px; border-color: #e3e3e3;">
            <tr>
                <td class="cabecera" colspan="8"><b>Información CFDI</b></td>
            </tr>
            <!--<#if record.recmachcustrecord_mx_rcs_orig_trans?has_content>
                <tr>
                    <td colspan="8" style="border-color: #e3e3e3;font-size:90%;"><b>Documentos Relacionados:</b></td>
                </tr>
                    <#assign obj = relatedOBJ?eval>
                    <tr style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:90%; padding-left: 12px;font-size: 6pt;">
                    <td colspan="2" style="font-weight: bold;border-top:1px;border-bottom:1px;border-right:1px;border-color: #e3e3e3;">Folio</td>
                    <td colspan="3" style="font-weight: bold;border-top:1px;border-bottom:1px;border-right:1px;border-color: #e3e3e3;">Tipo</td>
                    <td colspan="3" style="font-weight: bold;border-top:1px;border-bottom:1px;border-color: #e3e3e3;">UUID</td>
                    </tr>
                    <#list record.recmachcustrecord_mx_rcs_orig_trans as cfdiRelType>
                    
                        <tr style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:90%; padding-left: 12px;font-size: 6pt;">
                            <td colspan="2" style="font-weight: bold;border-bottom:1px;border-right:1px;border-color: #e3e3e3;">
                                ${cfdiRelType.custrecord_mx_rcs_rel_cfdi}
                            </td>
                        
                        
                            <td colspan="3" style="font-weight: bold;border-bottom:1px;border-right:1px;border-color: #e3e3e3;">
                                ${cfdiRelType.custrecord_mx_rcs_rel_type}
                            </td>
                        
                        
                            <td colspan="3" style="font-weight: bold;border-bottom:1px;border-color: #e3e3e3;">
                                ${cfdiRelType.custrecord_mx_rcs_uuid}
                            </td>
                        </tr>
                    </#list>
            </#if>-->
            <tr>
                <#if certData.custbody_mx_cfdi_qr_code?has_content>
                    <#assign qrcodeImage = "data:image/png;base64, " + certData.custbody_mx_cfdi_qr_code >
                </#if>
                <td style="font-size:7px;" rowspan="3" width=" 72px" colspan="1">
                <#if certData.custbody_mx_cfdi_qr_code?has_content>
                    <img style="width: 70px;height:70px" src="${qrcodeImage}"/>
                </#if>
                </td>
            </tr>
            <tr>
                <td style="font-size:5px;" rowspan="3" width=" 72px" colspan="7">
                    <p style="font-size:5px;"><b>UUID: </b>${certData.custbody_mx_cfdi_uuid}</p>
                    <p style="font-size:5px;"><b>Cadena original</b><br/>${certData.custbody_mx_cfdi_cadena_original}
                    </p>
                    <p style="font-size:5px;"><b>Firma del CFDI</b><br/>${certData.custbody_mx_cfdi_signature}</p>
                    <p style="font-size:5px;" rowspan="1">
                        <b>Firma del SAT</b><br/>
                        ${certData.custbody_mx_cfdi_sat_signature}
                    </p>
                </td>
            </tr>
        </table>
    <#else>
        <table class="tablascompletas" style="margin-top:5px;">
            <tr>
                <td colspan="3" class="cabecera"><b>Folio Fiscal</b></td>
                <td colspan="3" class="cabecera"><b>Certificado Digital SAT</b></td>
                <td colspan="3" class="cabecera"><b>Fecha de certificación</b></td>
            </tr>
            <tr>
                <#assign datearray = certData.custbody_mx_cfdi_certify_timestamp?split("T")>
                <td colspan="3" class="cuerposnoarticulos">${record.custbody_mx_cfdi_uuid}</td>
                <td colspan="3" class="cuerposnoarticulos">${record.custbody_mx_cfdi_sat_serial}</td>
                <td colspan="3" class="cuerposnoarticulos">

                    <#if datearray?size == 2 >
                        <#assign dayarray = datearray[0]?split("-")>
                        ${dayarray[2]}/${dayarray[1]}/${dayarray[0]} ${datearray[1]}
                    <#else>
                        ${record.custbody_mx_cfdi_certify_timestamp}
                    </#if>
                </td>
            </tr>
        </table>

        <#if record.custbody_efx_fe_related_cfdi_json?has_content>
            <#assign jsonRelacionados=record.custbody_efx_fe_related_cfdi_json?eval>
            <#if jsonRelacionados?size != 0>
                <table class="total" style="width: 100%; margin-top: 10px; border: 1px; border-bottom: 0px; border-color: #e3e3e3;">
                    <tr>
                        <td class="cabecera" colspan="8"><b>Documentos Relacionados</b></td>  
                    </tr>
                    <tr>
                        <td align="left" colspan="2" style="font-size: 8pt; font-weight: bold;border-top:1px;border-bottom:1px;border-right:0px;border-color: #e3e3e3;">Folio</td>
                        <td align="left" colspan="3" style="font-size: 8pt; font-weight: bold;border-top:1px;border-bottom:1px;border-right:0px;border-color: #e3e3e3;">Tipo</td>
                        <td align="left" colspan="3" style="font-size: 8pt; font-weight: bold;border-top:1px;border-bottom:1px;border-color: #e3e3e3;">UUID</td>
                    </tr>
                    <#assign jsonRelacionados=record.custbody_efx_fe_related_cfdi_json?eval>
                    <#list jsonRelacionados as cfdiRel>
                        <tr style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:90%; padding-left: 12px;font-size: 6pt;">
                            <td colspan="2" style="border-bottom:1px;border-right:0px;border-color: #e3e3e3;">
                                ${cfdiRel.fol}
                            </td>
                        
                        
                            <td colspan="3" style="border-bottom:1px;border-right:0px;border-color: #e3e3e3;">
                                ${cfdiRel.type}
                            </td>
                        
                        
                            <td colspan="3" style="border-bottom:1px;border-color: #e3e3e3;">
                                ${cfdiRel.uuid}
                            </td>
                        </tr>        
                    </#list>
                </table>
            </#if>
        </#if>
        
        <table class="total" style="width: 100%; margin-top: 10px; border: 0px; border-color: #e3e3e3;">
            <tr>
                <td class="cabecera" colspan="8"><b>Información CFDI</b></td>
            </tr>
            <#--  <#if record.recmachcustrecord_mx_rcs_orig_trans?has_content>
                <tr>
                    <td colspan="8" style="border-color: #e3e3e3;font-size:90%;"><b>Documentos Relacionados:</b></td>
                </tr>
                    <#assign obj = relatedOBJ?eval>
                    <tr style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:90%; padding-left: 12px;font-size: 6pt;">
                    <td colspan="2" style="font-weight: bold;border-top:1px;border-bottom:1px;border-right:1px;border-color: #e3e3e3;">Folio</td>
                    <td colspan="3" style="font-weight: bold;border-top:1px;border-bottom:1px;border-right:1px;border-color: #e3e3e3;">Tipo</td>
                    <td colspan="3" style="font-weight: bold;border-top:1px;border-bottom:1px;border-color: #e3e3e3;">UUID</td>
                    </tr>
                    <#list record.recmachcustrecord_mx_rcs_orig_trans as cfdiRelType>
                    
                        <tr style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:90%; padding-left: 12px;font-size: 6pt;">
                            <td colspan="2" style="font-weight: bold;border-bottom:1px;border-right:1px;border-color: #e3e3e3;">
                                ${cfdiRelType.custrecord_mx_rcs_rel_cfdi}
                            </td>
                        
                        
                            <td colspan="3" style="font-weight: bold;border-bottom:1px;border-right:1px;border-color: #e3e3e3;">
                                ${cfdiRelType.custrecord_mx_rcs_rel_type}
                            </td>
                        
                        
                            <td colspan="3" style="font-weight: bold;border-bottom:1px;border-color: #e3e3e3;">
                                ${cfdiRelType.custrecord_mx_rcs_uuid}
                            </td>
                        </tr>
                    </#list>
            </#if>  -->
            <#if certData.custbody_mx_cfdi_qr_code?has_content>
                <tr>
                    <td style="font-size:7px;" rowspan="3" width=" 72px" colspan="1">
                    <#assign qrcodeImage = "data:image/png;base64, " + record.custbody_mx_cfdi_qr_code >
                    <#if record.custbody_mx_cfdi_qr_code?has_content>
                        <img style="width: 70px;height:70px" src="${qrcodeImage}"/>
                    </#if>
                    </td>
                </tr>
            </#if>
            <tr>
                <td style="font-size:8px;" rowspan="3" width=" 72px" colspan="7">
                    <p style="font-size:8px;"><b>UUID: </b>${record.custbody_mx_cfdi_uuid}</p>
                    <p style="font-size:8px;"><b>Cadena original</b><br/>${record.custbody_mx_cfdi_cadena_original}</p>
                    <p style="font-size:8px;"><b>Firma del CFDI</b><br/>${record.custbody_mx_cfdi_signature}</p>
                    <p style="font-size:8px;" rowspan="1">
                        <b>Firma del SAT</b><br/>
                        ${record.custbody_mx_cfdi_sat_signature}
                    </p>
                </td>
            </tr>
        </table>
    </#if>

    </body>
</pdf>