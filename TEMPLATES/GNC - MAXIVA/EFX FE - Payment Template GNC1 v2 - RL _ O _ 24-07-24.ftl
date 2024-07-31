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
<#if custom.multiCurrencyFeature == "true">
<#assign "currencyCode" = record.currencysymbol>
<#assign exchangeRate = record.exchangerate?string.number>
<#else>
<#assign "currencyCode" = "MXN">
<#assign exchangeRate = 1>
</#if>
<#assign "satCodes" = custom.satcodes>

<#if custom.oneWorldFeature == "true">
<#assign "customCompanyInfo" = record.subsidiary>
<#else>
<#assign "customCompanyInfo" = companyinformation>
</#if>
<#if customer.isperson == "T">
<#assign customerName = customer.firstname + ' ' + customer.lastname>
<#else>
<#assign "customerName" = customer.companyname>
</#if>
<#assign "summary" = custom.summary>
<#assign "totalAmount" = summary.subtotal - summary.totalDiscount>
<#assign "companyTaxRegNumber" = custom.companyInfo.rfc>
  <#assign fhemi = "">
  <#assign "CusZipcode" = subsidiary.companyname>


<#assign currencySymbolMap = {"USD":"$","CAD":"$","EUR":"€","AED":"د.إ.‏","AFN":"؋","ALL":"Lek","AMD":"դր.","ARS":"$","AUD":"$","AZN":"ман.","BAM":"KM","BDT":"৳","BGN":"лв.","BHD":"د.ب.‏","BIF":"FBu","BND":"$","BOB":"Bs","BRL":"R$","BWP":"P","BYR":"BYR","BZD":"$","CDF":"FrCD","CHF":"CHF","CLP":"$","CNY":"CN¥","COP":"$","CRC":"₡","CVE":"CV$","CZK":"Kč","DJF":"Fdj","DKK":"kr","DOP":"RD$","DZD":"د.ج.‏","EEK":"kr","EGP":"ج.م.‏","ERN":"Nfk","ETB":"Br","GBP":"£","GEL":"GEL","GHS":"GH₵","GNF":"FG","GTQ":"Q","HKD":"$","HNL":"L","HRK":"kn","HUF":"Ft","IDR":"Rp","ILS":"₪","INR":"টকা","IQD":"د.ع.‏","IRR":"﷼","ISK":"kr","JMD":"$","JOD":"د.أ.‏","JPY":"￥","KES":"Ksh","KHR":"៛","KMF":"FC","KRW":"₩","KWD":"د.ك.‏","KZT":"тңг.","LBP":"ل.ل.‏","LKR":"SL Re","LTL":"Lt","LVL":"Ls","LYD":"د.ل.‏","MAD":"د.م.‏","MDL":"MDL","MGA":"MGA","MKD":"MKD","MMK":"K","MOP":"MOP$","MUR":"MURs","MXN":"$","MYR":"RM","MZN":"MTn","NAD":"N$","NGN":"₦","NIO":"C$","NOK":"kr","NPR":"नेरू","NZD":"$","OMR":"ر.ع.‏","PAB":"B/.","PEN":"S/.","PHP":"₱","PKR":"₨","PLN":"zł","PYG":"₲","QAR":"ر.ق.‏","RON":"RON","RSD":"дин.","RUB":"руб.","RWF":"FR","SAR":"ر.س.‏","SDG":"SDG","SEK":"kr","SGD":"$","SOS":"Ssh","SYP":"ل.س.‏","THB":"฿","TND":"د.ت.‏","TOP":"T$","TRY":"TL","TTD":"$","TWD":"NT$","TZS":"TSh","UAH":"₴","UGX":"USh","UYU":"$","UZS":"UZS","VEF":"Bs.F.","VND":"₫","XAF":"FCFA","XOF":"CFA","YER":"ر.ي.‏","ZAR":"R","ZMK":"ZK"}>
<#function fmtc_NS value>
<#return currencySymbolMap[currencyCode] + value?string[",##0.00"]>
</#function>

<#function fmtc value>
<#return currencySymbolMap[currencyCode] + value?number?string[",##0.00"]>
</#function>
</#if>
<head>
    <#setting locale="en_US">
        <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
        <#if .locale == "zh_CN">
        <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
        <#elseif .locale == "zh_TW">
        <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
        <#elseif .locale == "ja_JP">
        <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
        <#elseif .locale == "ko_KR">
        <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
        <#elseif .locale == "th_TH">
        <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />
    </#if>
    <macrolist>
        <macro id="nlheader">
            <table class="header" style="width: 100%;">
                <tr>
                    <td colspan="6" rowspan="3">
                        <#if certData?has_content>
                        <#if record.custbody_efx_fe_info_location_pdf == true>
                            <#if record.custbody_efx_fe_logoloc?has_content>
                                <img height="35%" src="${record.custbody_efx_fe_logoloc}" style="float: left; margin: 2px;" width="30%" />
                            </#if>
                        <#else>
                            <#if record.custbody_efx_fe_logosub?has_content>
                                <img height="35%" src="${record.custbody_efx_fe_logosub}" style="float: left; margin: 2px;" width="30%" />
                            </#if>
                        </#if>
                    <#else>
                        <#if record.custbody_efx_fe_info_location_pdf == true>
                            <#if record.custbody_efx_fe_logoloc?has_content>
                                <#assign "dominio" = "https://system.netsuite.com">
                                <#assign "urldir" = "https://system.netsuite.com"+record.custbody_efx_fe_logoloc>
                                <img height="35%" src="${urldir}" style="float: left; margin: 2px;" width="30%" />
                            </#if>
                        <#else>
                            <#if record.custbody_efx_fe_logosub?has_content>
                                <#assign "dominio" = "https://system.netsuite.com">
                                <#assign "urldir" = "https://system.netsuite.com"+record.custbody_efx_fe_logosub>
                                <img height="35%" src="${urldir}" style="float: left; margin: 2px;" width="30%" />
                            <#else>
                                <#if subsidiary.logo@url?length != 0>
                                    <img height="35%" src="${subsidiary.logo@url}" style="float: left; margin: 2px;" width="30%" />
                                <#elseif companyInformation.logoUrl?length != 0>
                                    <img height="35%" src="${companyInformation.logoUrl}" style="float: left; margin: 2px;" width="30%" />
                                </#if>
                            </#if>
                        </#if>
                    </#if>

        </td>
        <td colspan="6" rowspan="3">
           <!-- <span class="nameandaddress" style="font-size: 9px; width: 40%;" >${subsidiary.mainaddress_text?upper_case}</span>-->
        </td>
                    <td colspan="2" style="width: 21px;">&nbsp;</td>
                    <td colspan="4" style="font-size: 12px;" align="right">
                        <b>CFDI de Pago</b><br/>
                        <b>Folio: </b>${record.tranid}<br/>
                        <b>Serie: </b>${record.custbody_mx_cfdi_serie}<br/>
                        <b>Fecha y hora de expedición:</b><br/>
                        <#if certData?has_content>${certData.custbody_mx_cfdi_certify_timestamp}<br/></#if>
                        <b>Lugar de expedición: </b>${record.custbody_efx_lugarexpedicion}
                    </td>
                    <td align="right">
                        <span class="number"><!--#${record.tranid}--></span>
                    </td>
                </tr>
            </table>
        </macro>


        <macro id="nlfooter">
            <table class="footer" style="width: 100%;"><tr>
                <td><barcode codetype="code128" showtext="true" value="${record.tranid}"/></td>
              <td align="right">Este documento es una representación impresa de un CFDI</td>
                <td align="right"><pagenumber/> de <totalpages/></td>
            </tr></table>
        </macro>
    </macrolist>
    <style type="text/css">* {
            <#if .locale == "zh_CN">
            font-family: NotoSans, NotoSansCJKsc, sans-serif;
            <#elseif .locale == "zh_TW">
            font-family: NotoSans, NotoSansCJKtc, sans-serif;
            <#elseif .locale == "ja_JP">
            font-family: NotoSans, NotoSansCJKjp, sans-serif;
            <#elseif .locale == "ko_KR">
            font-family: NotoSans, NotoSansCJKkr, sans-serif;
            <#elseif .locale == "th_TH">
            font-family: NotoSans, NotoSansThai, sans-serif;
            <#else>
            font-family: NotoSans, sans-serif;
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
        td {
            padding: 4px 6px;
        }
        td p { align:left }
        b {
            font-weight: bold;
            color: #000000;
        }
        table.header td {
            padding: 0px;
            font-size: 9pt;
        }
        table.footer td {
            padding: 0px;
            font-size: 7pt;
        }
        table.itemtable th {
            padding-bottom: 10px;
            padding-top: 10px;
            font-size: 7pt;
        }table.itemtable td {
                font-size: 7pt;
        }
        table.body td {
            padding-top: 2px;
        }
        table.total {
            page-break-inside: avoid;
        }
        tr.totalrow {
            background-color: #e3e3e3;
            line-height: 200%;
        }
        td.totalboxtop {
            font-size: 9pt;
            background-color: #e3e3e3;
        }
        td.addressheader {
            font-size: 8pt;
            padding-top: 6px;
            padding-bottom: 2px;
        }
        td.subtotal{
            text-align: right;
        }
        td.address {
            padding-top: 0px;
        }
        td.totalboxmid {
            font-size: 10pt;
            padding-top: 20px;
            background-color: #e3e3e3;
        }
        td.totalboxbot {
            background-color: #e3e3e3;
            font-weight: bold;
        }
        span.title {
            font-size: 10pt;
        }
        span.number {
            font-size: 10pt;
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
    <!--<table class="header" style="width: 100%;"><tr>
    <td rowspan="3">
        <img src="${subsidiary.logo@url}" style="float: left; margin: 7px; width: 175;height: 50"/>
         <br />
    </td>
    <td align="right" colspan="2"><span class="title">Pago #${record.tranid}</span></td>
    </tr>
    </table>-->


    <table style="width:100%;">
        <tr>
            <td colspan= "1">
                <table>
                    <thead>
                    <tr>
                        <th>Emisor</th>
                    </tr>
                    </thead>
                    <tr>
                        <td>
                            <table style="width:100%;">
                                <tr>
                                    <td><b>Razón Social:</b>${record.subsidiary.custrecord_mx_sat_registered_name}</td>
                                </tr>
                                <#--  <#if record.custbody_efx_fe_info_location_pdf == true>
                                    <tr>
                                        <td>${record.custbody_efx_fe_dirloc}</td>
                                    </tr>
                                <#else>
                                    <tr>
                                        <td>${record.custbody_efx_fe_dirsubs}</td>
                                    </tr>
                                </#if>  -->
                                <tr>
                                    <td><b>RFC:</b> ${record.custbody_efx_rfc_emisorcuentaordenante}</td>
                                </tr>
                                <tr>
                                    <td><b>Régimen fiscal:</b> ${record.subsidiary.custrecord_mx_sat_industry_type}</td>
                                </tr>
                                <tr>
                                    <td><b>Número de Certificado Digital SAT</b><br/>
                                    <#if certData?has_content>
                                    ${certData.custbody_mx_cfdi_sat_serial}
                                    </#if>
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td>

                        </td>
                    </tr>
                </table>


            </td>
            <td colspan= "1">
                <table style="width:100%;">
                    <thead>
                        <tr>
                            <th>Receptor</th>
                        </tr>
                    </thead>
                        <tr>
                            <td><b>Razón Social:</b> ${record.customer.custentity_mx_sat_registered_name}</td>
                        </tr>
                        <tr>
                            <td><b>RFC:</b> ${record.customer.custentity_mx_rfc}</td>
                        </tr>
                        <tr>
                            <td>
                                <b>Domicilio Fiscal:</b>
                                <#if record.customer.shipzip?has_content>
                                    ${record.customer.shipzip}
                                <#else>
                                    ${record.customer.billzip}
                                </#if>
                            </td>
                        </tr>
                        <tr>
                            <td><b>Régimen fiscal:</b>  ${record.customer.custentity_mx_sat_industry_type}</td>
                        </tr>
                        <tr>
                            <td>
                            <b>Uso CFDI:</b>  
                                <#if record.custbody_mx_cfdi_usage?has_content>
                                    CP01 - Pagos
                                <#else>
                                    P01 - Por Definir
                                </#if>
                            </td>
                        </tr>
                </table>
            </td>

        </tr>
    </table>

<#if (record.currency=='Dólar EE.UU.')>
<#assign "moneda_sat" = 'USD DÓLAR EE.UU.'>
</#if>


<#if (record.custbody_efx_fe_moneda == 'Peso Mexicano' || record.currency=='Peso Mexicano')>
<#assign "moneda_sat" = 'MXN Peso Mexicano'>
</#if>

<#assign testsymb ='$'>

    <table class="itemtable" style="width: 100%; margin-top: 10px;">
        <thead>
        <tr>
            <th align="center" colspan="5" ><b>Fecha</b></th>
            <th align="center" colspan="5" ><b>Cantidad</b></th>
            <th align="center" colspan="6" ><b>Clave <br/> ProdServ</b></th>
            <th align="center" colspan="6" ><b>Clave <br/> Unidad</b></th>
            <th align="center" colspan="6" ><b>Descripcion</b></th>
            <th align="center" colspan="6" ><b>Referencia</b></th>
            <th align="center" colspan="5" ><b>Valor<br/>Unit</b></th>
            <th align="center" colspan="6" ><b>Importe</b></th>
            <th align="center" colspan="5" ><b>Objeto de impuesto</b></th>
            <th align="center" colspan="5" ><b>Pago</b></th>
        </tr>   
        </thead>
        <#if dataXML?has_content>
        <tr style="vertical-align:baseline">
            <td align="center" colspan="5" line-height="150%" style= "font-size: 8px">${record.trandate}</td>
            <td align="center" colspan="5" line-height="150%">${dataXML.Conceptos.Concepto.atributos.Cantidad}</td>
            <td align="center" colspan="6" line-height="150%">${dataXML.Conceptos.Concepto.atributos.ClaveProdServ}</td>
            <td align="center" colspan="6" line-height="150%">${dataXML.Conceptos.Concepto.atributos.ClaveUnidad}</td>
            <td align="center" colspan="6" line-height="150%">${dataXML.Conceptos.Concepto.atributos.Descripcion}</td>
            <td align="center" colspan="6" line-height="150%">${record.memo}</td>
            <td align="center" colspan="5" line-height="150%">${dataXML.Conceptos.Concepto.atributos.ValorUnitario?number?string[",##0.00"]}</td>
            <td align="center" colspan="6" line-height="150%">${dataXML.Conceptos.Concepto.atributos.Importe?number?string[",##0.00"]}</td>
            <td align="center" colspan="5" line-height="150%">${dataXML.Conceptos.Concepto.atributos.ObjetoImp}</td>
            <td align="center" colspan="5" line-height="150%">$0</td>
        </tr>   
        </#if>
        <tr>
            <td colspan="55">
                <table class="itemtable" style="width: 100%; margin-top: 10px;">
                    <tr>
                        <td align="right" colspan="42" style="width:80%"></td>
                        <td align="right" colspan="10" style="width:80%"><b>Subtotal</b></td>
                        <#if dataXML?has_content>
                            <td align="right" colspan="3" style="width:20%">${dataXML.atributos.SubTotal?number?string[",##0.00"]}</td>
                        </#if>
                    </tr>
                    <tr >
                        <td align="right" colspan="42" style="width:80%"></td>
                        <td align="right" colspan="10" style="width:80%"><b>Total</b></td>
                        <#if dataXML?has_content>
                            <td align="right" colspan="3" style="width:20%">${dataXML.atributos.Total?number?string[",##0.00"]}</td>
                        </#if>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <#assign "tipoCambio" = record.exchangerate>
    <#if dataXML.Complemento.Pagos.Pago.DoctoRelacionado?is_sequence>
        <table class="itemtable" style="width: 100%; margin-top: 10px;"><!-- start items -->
            <thead>
            <tr style=" border-bottom:2px">
                <td align="left" colspan="55"><b>Documentos Relacionados</b></td>
            </tr>
            </thead>
            <#list dataXML.Complemento.Pagos.Pago.DoctoRelacionado as linea>
                <tr>
                    <td align="left" colspan="10">ID documento:</td>
                    <td align="left" colspan="18" line-height="150%">${linea.atributos.IdDocumento}</td>
                    <td align="left" colspan="14">Parcialidad:</td>
                    <td align="right" colspan="13" line-height="150%">${linea.atributos.NumParcialidad?number?string[",##0.00"]}</td>
                </tr>
                <tr>
                    <td align="left" colspan="10">Serie/Folio:</td>
                    <td align="left" colspan="18" line-height="150%">${linea.atributos.Serie}/${dataXML.atributos.Folio}</td>
                    <td align="left" colspan="14">Importe del saldo anterior:</td>
                    <td align="right" colspan="13" line-height="150%">$${linea.atributos.ImpSaldoAnt?number?string[",##0.00"]}</td>
                </tr>
                <tr>
                    <td align="left" colspan="10">Moneda:</td>
                    <td align="left" colspan="18" line-height="150%">${linea.atributos.MonedaDR}</td>
                    <td align="left" colspan="14">Importe Pagado:</td>
                    <td align="right" colspan="13" line-height="150%">$${linea.atributos.ImpPagado?number?string[",##0.00"]}</td>
                </tr>
                <#assign "tipoCambioDR" = linea.atributos.EquivalenciaDR?number>
                <tr>
                    <td align="left" colspan="10">Tipo de cambio:</td>
                    <#if custom?has_content>
                        <#if custom.appliedTxns?has_content>
                            <#list custom.appliedTxns as appliedTxn>
                                <#if (appliedTxn.custbody_mx_cfdi_uuid == linea.atributos.IdDocumento)>
                                    <#assign tcFac = appliedTxn.exchangerate?number>
                                    <#assign tipoCambioPESO = 1/ tcFac>
                                    <td align="left" colspan="18" line-height="150%">${tipoCambioPESO?string["0.000000"]}</td>
                                </#if>    
                            </#list>
                        <#else>
                            <td align="left" colspan="18" line-height="150%">
                                <#--  <#assign TCambio = 1 / (record.exchangerate)?number>  -->
                                <#if (record.exchangerate?has_content) && (record.custbody_efx_fe_moneda?has_content)>
                                    ${record.custbody_efx_fe_tipo_cambio}
                                <#else>
                                    <#assign TCambio =(record.exchangerate)?number>
                                    ${TCambio?string["0.0000"]}
                                </#if>
                            </td>
                        </#if>
                    </#if>
                    <td align="left" colspan="14">Importe del saldo InSoluto:</td>
                    <td align="right" colspan="13" line-height="150%">$${linea.atributos.ImpSaldoInsoluto?number?string[",##0.00"]}</td>
                </tr>
                <tr style="border-bottom:2px;">
                    <td align="left" colspan="10">Objeto de impuestos:</td>
                    <td align="left" colspan="18" line-height="150%">
                    <#if linea.atributos.ObjetoImpDR == "01">
                            01 - No objeto de impuesto
                        </#if>
                        <#if linea.atributos.ObjetoImpDR == "02">
                            02 - Si objeto de impuesto
                        </#if>
                        <#if linea.atributos.ObjetoImpDR == "03">
                            03 - Si objeto de impuesto y no obligado al desglose
                        </#if>
                    </td>    
                    <td align="left" colspan="14"></td>
                    <td align="right" colspan="13" line-height="150%" ></td>
                </tr>
                                        <!--<td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_importe?number?string[",##0.00"]}</td>-->
            </#list>
        </table>
    <#else>
        <table class="itemtable" style="width: 100%; margin-top: 10px;"><!-- start items -->
            <thead>
            <tr style=" border-bottom:2px">
                <td align="left" colspan="55"><b>Documento Relacionado</b></td>
            </tr>
            </thead>
            <tr>
                <td align="left" colspan="10">ID documento:</td>
                <td align="left" colspan="18" line-height="150%">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.IdDocumento}</td>
                <td align="left" colspan="14">Parcialidad:</td>
                <td align="right" colspan="13" line-height="150%">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.NumParcialidad?number?string[",##0.00"]}</td>
            </tr>
            <tr>
                <td align="left" colspan="10">Serie/Folio:</td>
                <td align="left" colspan="18" line-height="150%">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.Serie}/${dataXML.atributos.Folio}</td>
                <td align="left" colspan="14">Importe del saldo anterior:</td>
                <td align="right" colspan="13" line-height="150%">$${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.ImpSaldoAnt?number?string[",##0.00"]}</td>
            </tr>
            <tr>
                <td align="left" colspan="10">Moneda:</td>
                <td align="left" colspan="18" line-height="150%">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.MonedaDR}</td>
                <td align="left" colspan="14">Importe Pagado:</td>
                <td align="right" colspan="13" line-height="150%">$${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.ImpPagado?number?string[",##0.00"]}</td>
            </tr>
            <#assign "tipoCambioDR" = linea.atributos.EquivalenciaDR?number>
            <tr>
                <td align="left" colspan="10">Tipo de cambio:</td>
                <#if custom?has_content>
                    <#if custom.appliedTxns?has_content>
                        <#if (custom.appliedTxns.custbody_mx_cfdi_uuid == dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.IdDocumento)>
                            <#assign tcFac = custom.appliedTxns.exchangerate?number>
                            <#assign tipoCambioPESO = 1/ tcFac>
                            <td align="left" colspan="18" line-height="150%">${tipoCambioPESO?string["0.000000"]}</td>
                        </#if>
                    <#else>
                        <td align="left" colspan="18" line-height="150%"></td>
                    </#if>
                </#if>  
                <td align="left" colspan="14">Importe del saldo InSoluto:</td>
                <td align="right" colspan="13" line-height="150%">$${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.ImpSaldoInsoluto?number?string[",##0.00"]}</td>
            </tr>
            <tr style="border-bottom:2px;">
                <td align="left" colspan="10">Objeto de impuestos:</td>
                <td align="left" colspan="18" line-height="150%">
                    <#if dataXML.Conceptos.Concepto.atributos.ObjetoImp == "01">
                        01 - No objeto de impuesto
                    </#if>
                    <#if dataXML.Conceptos.Concepto.atributos.ObjetoImp == "02">
                        02 - Si objeto de impuesto
                    </#if>
                    <#if dataXML.Conceptos.Concepto.atributos.ObjetoImp == "03">
                        03 - Si objeto de impuesto y no obligado al desglose
                    </#if>
                </td>    
                <td align="left" colspan="14"></td>
                <td align="right" colspan="13" line-height="150%"></td>
            </tr>
                                    <!--<td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_importe?number?string[",##0.00"]}</td>-->
        </table>
    </#if>

<table style="width: 100%; margin-top: 10px; padding: 0; border: 0px; border-color: #e3e3e3;">
    <tr>
        <th colspan="6">Detalles del comprobante</th>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Tipo de comprobante:</b></td>
        <td colspan="2" style="font-size: 7pt;">PAGO</td>
        <td colspan="1" style="font-size: 7pt;"><b>Forma de pago:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_txn_sat_payment_method?upper_case}</td>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Moneda:</b></td>
          <!--Valdiación para indicar que la mayor ponderación la tiene el campo de Factura Electrónica vs el registro nativvo de Netsuite-->
            <#if record.custbody_efx_fe_tipo_cambio?has_content>
              	<#assign NativeRegisterMoneda = record.currency?upper_case>
        		<#assign FE_fieldMoneda = record.custbody_efx_fe_moneda?upper_case>
          			<#if FE_fieldMoneda==NativeRegisterMoneda>
              			<td colspan="2" style="font-size: 7pt;">${moneda_sat}</td>
            			<#else>
              			<td colspan="2" style="font-size: 7pt;">${moneda_sat}</td>
          			</#if>
                <#else>
                  <td colspan="2" style="font-size: 7pt;">${moneda_sat}</td>
            </#if>
        <td colspan="1" style="font-size: 7pt;"><b>Tipo de cambio:</b></td>
        <td colspan="2" style="font-size: 7pt;">$${tipoCambio?string["0.0000"]}</td>
    </tr>
    <tr>
      <td colspan="1" style="font-size: 7pt;"><b>Monto pagado:</b></td>
           <#if record.custbody_efx_fe_importe?has_content>
              <td colspan="2" style="font-size: 7pt;">$${record.custbody_efx_fe_importe?number?string[",##0.00"]}</td>
              <#else>
                <td colspan="2" style="font-size: 7pt;">$${record.payment}</td>
            </#if>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b> </b></td>
        <td colspan="2" style="font-size: 7pt;"> </td>
      <td colspan="1" style="font-size: 7pt;"><b>No. Certificado CFDI:</b></td>
  		<#if certData?has_content>
                    <td colspan="2" style="font-size: 7pt;">${certData.custbody_mx_cfdi_issuer_serial}</td>
                <#else>
                    <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_cfdi_issuer_serial}</td>
        </#if>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Nombre del banco ordenante:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_cfdi_issue_bank_name}</td>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>RFC Emisor cuenta ordenante:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_cfdi_issuer_entity_rfc}</td>
        <td colspan="1" style="font-size: 7pt;"><b>RFC Beneficiario: </b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_cfdi_recipient_entity_rfc}</td>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Cuenta ordenante: </b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_cfdi_payer_account}</td>
        <td colspan="1" style="font-size: 7pt;"><b>Cuenta Beneficiario: </b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_cfdi_recipient_account}</td>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Fecha y hora de pago: </b></td>
        <!--<td colspan="2" style="font-size: 7pt;">${record.trandate?iso_nz("GMT-05")}</td> -->
        <td colspan="2" style="font-size  3pt;">${record.trandate?iso_nz("GMT-05")}T${record.custbody_tko_horapago2?string["hh:mm:ss"]}</td>
        <td colspan="1" style="font-size: 7pt;"><b></b></td>
        <td colspan="2" style="font-size: 7pt;"></td>
     </tr>
</table>
<table style="width: 100%; margin-top: 10px; padding: 0; border: 0px; border-color: #e3e3e3;">
    <#if dataXML?has_content>
        
        <#if dataXML.Complemento.Pagos.Pago.DoctoRelacionado.ImpuestosDR.TrasladosDR.TrasladoDR?is_sequence>
            <tr>
                <th colspan="24">Nodo Traslado DR</th>
            </tr>
        </#if>
        <#if dataXML.Complemento.Pagos.Pago.DoctoRelacionado.ImpuestosDR.TrasladosDR.TrasladoDR?is_sequence>
            <#list dataXML.Complemento.Pagos.Pago.DoctoRelacionado.ImpuestosDR.TrasladosDR.TrasladoDR as trasladodr>
                <tr>
                    <td colspan="4" style="font-size: 7pt;"><b>Importe DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">$${trasladodr.atributos.ImporteDR?number?string[",##0.00"]}</td>
                    <td colspan="4" style="font-size: 7pt;"><b>Tasa o cuota DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">${trasladodr.atributos.TasaOCuotaDR}</td>
                    <td colspan="4" style="font-size: 7pt;"><b>Tipo de factor DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">${trasladodr.atributos.TipoFactorDR}</td>
                </tr>
                <tr  style="border-bottom:2px;">
                    <td colspan="4" style="font-size: 7pt;"><b>Impuesto DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">${trasladodr.atributos.ImpuestoDR}</td>
                    <td colspan="4" style="font-size: 7pt;"><b>Base DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">$${trasladodr.atributos.BaseDR?number?string[",##0.00"]}</td>
                    <td colspan="4" style="font-size: 7pt;"><b></b></td>
                    <td colspan="4" style="font-size: 7pt;"></td>
                </tr>
            </#list>
        <#else >
            <#assign trasladodr = dataXML.Complemento.Pagos.Pago.DoctoRelacionado.ImpuestosDR.TrasladosDR.TrasladoDR>
            <tr>
                <td colspan="4" style="font-size: 7pt;"><b>Importe DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">$${trasladodr.atributos.ImporteDR?number?string[",##0.00"]}</td>
                <td colspan="4" style="font-size: 7pt;"><b>Tasa o cuota DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">${trasladodr.atributos.TasaOCuotaDR}</td>
                <td colspan="4" style="font-size: 7pt;"><b>Tipo de factor DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">${trasladodr.atributos.TipoFactorDR}</td>
            </tr>
            <tr  style="border-bottom:2px;">
                <td colspan="4" style="font-size: 7pt;"><b>Impuesto DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">${trasladodr.atributos.ImpuestoDR}</td>
                <td colspan="4" style="font-size: 7pt;"><b>Base DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">$${trasladodr.atributos.BaseDR?number?string[",##0.00"]}</td>
                <td colspan="4" style="font-size: 7pt;"><b></b></td>
                <td colspan="4" style="font-size: 7pt;"></td>
            </tr>
        </#if>
        
        <#if dataXML.Complemento.Pagos.Pago.DoctoRelacionado.ImpuestosDR.RetencionesDR.RetencionDR?has_content>
            <tr>
                <th colspan="24">Nodo Retención DR</th>
            </tr>
        </#if>
        <#if dataXML.Complemento.Pagos.Pago.DoctoRelacionado.ImpuestosDR.RetencionesDR.RetencionDR?is_sequence>
            <#list dataXML.Complemento.Pagos.Pago.DoctoRelacionado.ImpuestosDR.RetencionesDR.RetencionDR as retenciondr>
                <tr>
                    <td colspan="4" style="font-size: 7pt;"><b>Importe DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">$${retenciondr.atributos.ImporteDR?number?string[",##0.00"]}</td>
                    <td colspan="4" style="font-size: 7pt;"><b>Tasa o cuota DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">${retenciondr.atributos.TasaOCuotaDR}</td>
                    <td colspan="4" style="font-size: 7pt;"><b>Tipo de factor DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">${retenciondr.atributos.TipoFactorDR}</td>
                </tr>
                <tr  style="border-bottom:2px;">
                    <td colspan="4" style="font-size: 7pt;"><b>Impuesto DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">${retenciondr.atributos.ImpuestoDR}</td>
                    <td colspan="4" style="font-size: 7pt;"><b>Base DR:</b></td>
                    <td colspan="4" style="font-size: 7pt;">$${retenciondr.atributos.BaseDR?number?string[",##0.00"]}</td>
                    <td colspan="4" style="font-size: 7pt;"><b></b></td>
                    <td colspan="4" style="font-size: 7pt;"></td>
                </tr>
            </#list>
        <#else>
            <#assign retenciondr = dataXML.Complemento.Pagos.Pago.DoctoRelacionado.ImpuestosDR.RetencionesDR.RetencionDR>
            <tr>
                <td colspan="4" style="font-size: 7pt;"><b>Importe DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">$${retenciondr.atributos.ImporteDR?number?string[",##0.00"]}</td>
                <td colspan="4" style="font-size: 7pt;"><b>Tasa o cuota DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">${retenciondr.atributos.TasaOCuotaDR}</td>
                <td colspan="4" style="font-size: 7pt;"><b>Tipo de factor DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">${retenciondr.atributos.TipoFactorDR}</td>
            </tr>
            <tr  style="border-bottom:2px;">
                <td colspan="4" style="font-size: 7pt;"><b>Impuesto DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">${retenciondr.atributos.ImpuestoDR}</td>
                <td colspan="4" style="font-size: 7pt;"><b>Base DR:</b></td>
                <td colspan="4" style="font-size: 7pt;">$${retenciondr.atributos.BaseDR?number?string[",##0.00"]}</td>
                <td colspan="4" style="font-size: 7pt;"><b></b></td>
                <td colspan="4" style="font-size: 7pt;"></td>
            </tr>
        </#if>

        <#if dataXML.Complemento.Pagos.Pago.ImpuestosP.TrasladosP.TrasladoP?has_content>
            <tr>
                <th colspan="24">Nodo Traslado P</th>
            </tr>
        </#if>
        <#if dataXML.Complemento.Pagos.Pago.ImpuestosP.TrasladosP.TrasladoP?is_sequence>
            <#list dataXML.Complemento.Pagos.Pago.ImpuestosP.TrasladosP.TrasladoP as trasladop>
                <tr>
                    <td colspan="4" style="font-size: 7pt;"><b>Importe P:</b></td>
                    <td colspan="4" style="font-size: 7pt;">$${trasladop.atributos.ImporteP?number?string[",##0.00"]}</td>
                    <td colspan="4" style="font-size: 7pt;"><b>Tasa o cuota P:</b></td>
                    <td colspan="4" style="font-size: 7pt;">${trasladop.atributos.TasaOCuotaP}</td>
                    <td colspan="4" style="font-size: 7pt;"><b>Tipo de factor P:</b></td>
                    <td colspan="4" style="font-size: 7pt;">${trasladop.atributos.TipoFactorP}</td>
                </tr>
                <tr  style="border-bottom:2px;">
                    <td colspan="4" style="font-size: 7pt;"><b>Impuesto P:</b></td>
                    <td colspan="4" style="font-size: 7pt;">${trasladop.atributos.ImpuestoP}</td>
                    <td colspan="4" style="font-size: 7pt;"><b>Base P:</b></td>
                    <td colspan="4" style="font-size: 7pt;">$${trasladop.atributos.BaseP?number?string[",##0.00"]}</td>
                    <td colspan="4" style="font-size: 7pt;"><b></b></td>
                    <td colspan="4" style="font-size: 7pt;"></td>
                </tr>
            </#list>
        <#else>
            <#assign trasladop = dataXML.Complemento.Pagos.Pago.ImpuestosP.TrasladosP.TrasladoP>
            <tr>
                <td colspan="4" style="font-size: 7pt;"><b>Importe P:</b></td>
                <td colspan="4" style="font-size: 7pt;">$${trasladop.atributos.ImporteP?number?string[",##0.00"]}</td>
                <td colspan="4" style="font-size: 7pt;"><b>Tasa o cuota P:</b></td>
                <td colspan="4" style="font-size: 7pt;">${trasladop.atributos.TasaOCuotaP}</td>
                <td colspan="4" style="font-size: 7pt;"><b>Tipo de factor P:</b></td>
                <td colspan="4" style="font-size: 7pt;">${trasladop.atributos.TipoFactorP}</td>
            </tr>
            <tr  style="border-bottom:2px;">
                <td colspan="4" style="font-size: 7pt;"><b>Impuesto P:</b></td>
                <td colspan="4" style="font-size: 7pt;">${trasladop.atributos.ImpuestoP}</td>
                <td colspan="4" style="font-size: 7pt;"><b>Base P:</b></td>
                <td colspan="4" style="font-size: 7pt;">$${trasladop.atributos.BaseP?number?string[",##0.00"]}</td>
                <td colspan="4" style="font-size: 7pt;"><b></b></td>
                <td colspan="4" style="font-size: 7pt;"></td>
            </tr>
        </#if>    
    </#if>
</table>

                                <!-- <table style="width: 100%; margin-top: 10px;">
                                        <tr>

                                                <th colspan="3">Factura de origen</th>
                                           <th align="center" colspan="3">Fecha</th>
                                        <th colspan="4">tipo</th>
                                        <th colspan="3">No.</th>
                                        <th align="right" colspan="4">Total</th>
                                        <th align="right" colspan="4">Monto Adeudado</th>
                                        <th align="right" colspan="3">Comisión</th>
                                        <th align="right" colspan="4">Monto</th>
                                        </tr>
                                        <tr>

                                               <#list record.apply as apply>
													<#if apply.apply == true >
														<td colspan="3">${apply.refnum}</td>
                                                       <td align="center" colspan="3" line-height="150%">${apply.applydate}</td>
                                                        <td colspan="4">${apply.type}</td>
                                                        <td colspan="3">${apply.refnum}</td>
                                                        <td align="right" colspan="4">${apply.total}</td>
                                                        <td align="right" colspan="4">${apply.due}</td>
                                                        <td align="right" colspan="3">${apply.disc}</td>
                                                        <td align="right" colspan="4">${apply.amount}</td>
													</#if>
    									    </#list>


                                        </tr>
                                </table> -->

    <table style="width: 100%; margin-top: 10px;">
        <#if certData?has_content>
            <tr>
                <td valign="top" align="left" width="25%">
                    <#if certData.custbody_mx_cfdi_qr_code != ''>
                        <#assign qrcodeImage = "data:image/png;base64, " + certData.custbody_mx_cfdi_qr_code >
                        <img style="width: 65%;height:65%;margin-top: 10px" src="${qrcodeImage}" />
                    </#if>
                </td>

                <td>
                    <table >
                        <tr>
                            <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Folio Fiscal</b><br/>${certData.custbody_mx_cfdi_uuid}</td>
                        </tr>
                        <tr>
                            <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Fecha y hora de certificación</b><br/>${certData.custbody_mx_cfdi_certify_timestamp}</td>
                        </tr>
                        <tr>
                            <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Cadena Original</b><br/>${certData.custbody_mx_cfdi_cadena_original}</td>
                        </tr>
                        <tr>
                            <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Firma del CFDI</b><br/>${certData.custbody_mx_cfdi_signature}</td>
                        </tr>
                        <tr>
                            <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Firma del SAT</b><br/>${certData.custbody_mx_cfdi_sat_signature}</td>
                        </tr>
                        <tr>
                            <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>RFC proveedor de certificación</b><br/>PFE140312IW8</td>
                        </tr>
                        <tr>
                            <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Número de Certificado Digital SAT</b><br/>${certData.custbody_mx_cfdi_sat_serial}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </#if>
    </table>

    </body>
</pdf> 