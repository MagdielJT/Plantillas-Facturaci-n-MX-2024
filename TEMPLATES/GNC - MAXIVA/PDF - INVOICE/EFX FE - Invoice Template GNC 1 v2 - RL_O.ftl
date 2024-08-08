<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
    <#setting locale = "en_US">
    <#setting time_zone= "America/Mexico_City">
      <#assign currencySymbolMap = {"USD":"$","CAD":"$","EUR":"€","AED":"د.إ.‏","AFN":"؋","ALL":"Lek","AMD":"դր.","ARS":"$","AUD":"$","AZN":"ман.","BAM":"KM","BDT":"৳","BGN":"лв.","BHD":"د.ب.‏","BIF":"FBu","BND":"$","BOB":"Bs","BRL":"R$","BWP":"P","BYR":"BYR","BZD":"$","CDF":"FrCD","CHF":"CHF","CLP":"$","CNY":"CN¥","COP":"$","CRC":"₡","CVE":"CV$","CZK":"Kč","DJF":"Fdj","DKK":"kr","DOP":"RD$","DZD":"د.ج.‏","EEK":"kr","EGP":"ج.م.‏","ERN":"Nfk","ETB":"Br","GBP":"£","GEL":"GEL","GHS":"GH₵","GNF":"FG","GTQ":"Q","HKD":"$","HNL":"L","HRK":"kn","HUF":"Ft","IDR":"Rp","ILS":"₪","INR":"টকা","IQD":"د.ع.‏","IRR":"﷼","ISK":"kr","JMD":"$","JOD":"د.أ.‏","JPY":"￥","KES":"Ksh","KHR":"៛","KMF":"FC","KRW":"₩","KWD":"د.ك.‏","KZT":"тңг.","LBP":"ل.ل.‏","LKR":"SL Re","LTL":"Lt","LVL":"Ls","LYD":"د.ل.‏","MAD":"د.م.‏","MDL":"MDL","MGA":"MGA","MKD":"MKD","MMK":"K","MOP":"MOP$","MUR":"MURs","MXN":"$","MYR":"RM","MZN":"MTn","NAD":"N$","NGN":"₦","NIO":"C$","NOK":"kr","NPR":"नेरू","NZD":"$","OMR":"ر.ع.‏","PAB":"B/.","PEN":"S/.","PHP":"₱","PKR":"₨","PLN":"zł","PYG":"₲","QAR":"ر.ق.‏","RON":"RON","RSD":"дин.","RUB":"руб.","RWF":"FR","SAR":"ر.س.‏","SDG":"SDG","SEK":"kr","SGD":"$","SOS":"Ssh","SYP":"ل.س.‏","THB":"฿","TND":"د.ت.‏","TOP":"T$","TRY":"TL","TTD":"$","TWD":"NT$","TZS":"TSh","UAH":"₴","UGX":"USh","UYU":"$","UZS":"UZS","VEF":"Bs.F.","VND":"₫","XAF":"FCFA","XOF":"CFA","YER":"ر.ي.‏","ZAR":"R","ZMK":"ZK"}>
<#assign currencyCode = record.currencysymbol>
<#assign testsymb =  currencySymbolMap[currencyCode]>




    <#if custom?has_content>

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




<#function fmtc value>
<#assign dst =  currencySymbolMap[currencyCode]>
<#return dst>
</#function>
</#if>
<head>


    <#assign "shipmentcost" = 0>
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
                    <img height="90px" src="${record.custbody_efx_fe_logoloc}" style="float: left; margin: 0;" width="110px" />
                </#if>
                <#else>
                <#if record.custbody_efx_fe_logosub?has_content>
                <img height="90px" src="${record.custbody_efx_fe_logosub}" style="float: left; margin: 0;" width="110px" />
            </#if>
        </#if>

        <#else>
        <#if record.custbody_efx_fe_info_location_pdf == true>
        <#if record.custbody_efx_fe_logoloc?has_content>
        <#assign "dominio" = "https://system.netsuite.com">
        <#assign "urldir" = "https://system.netsuite.com"+record.custbody_efx_fe_logoloc>
        <img height="90px" src="${urldir}" style="float: left; margin: 0;" width="110px" />
    </#if>
    <#else>
    <#if record.custbody_efx_fe_logosub?has_content>
    <#assign "dominio" = "https://system.netsuite.com">
    <#assign "urldir" = "https://system.netsuite.com"+record.custbody_efx_fe_logosub>
    <img height="90px" src="${urldir}" style="float: left; margin: 0;" width="110px" />
    <#else>
    <#if subsidiary.logo@url?length != 0>
    <img height="90px" src="${subsidiary.logo@url}" style="float: left; margin: 0;" width="110px" />
    <#elseif companyInformation.logoUrl?length != 0>
    <img height="90px" src="${companyInformation.logoUrl}" style="float: left; margin: 0;" width="110px" />
</#if>
</#if>
</#if>
</#if>

</td>
<td colspan="6" rowspan="3">
    <!--<span class="nameandaddress" style="font-size: 9px; width: 40%;" > ${record.custbody_efx_nombrelegalsubsidiaria}  <br /> RFC: ${record.custbody_efx_rfc_emisorcuentaordenante}</span>-->
    <span class="nameandaddress" style="font-size: 9px; width: 40%;" > ${record.subsidiary.custrecord_mx_sat_registered_name} <br /> RFC:${record.custbody_efx_rfc_emisorcuentaordenante}<br />Régimen Fiscal: ${record.subsidiary.custrecord_mx_sat_industry_type}<br />Número de Certificado Digital SAT<br/>${certData.custbody_mx_cfdi_sat_serial}</span>
</td>
<td colspan="2" style="width: 21px;">&nbsp;</td>
<td colspan="4" style="font-size: 10px;" align="right"><span style="font-size: 12px;"><strong>Ingreso – Factura</strong></span><br /><strong style="font-size: 18px;">Folio:</strong>
    <#if record.custbody_efx_fe_gbl_folio?has_content>
    <span class="number" style="font-size: 18px;">${record.custbody_efx_fe_gbl_folio}</span>
    <#else>
    <span class="number" style="font-size: 18px;">${record.tranid}</span>
</#if>
<br/><span style="font-size: 15px;"><strong>Serie: </strong>${record.custbody_mx_cfdi_serie}</span>
<br/> <b>Lugar de Expedición:</b>
<br/> ${record.custbody_efx_lugarexpedicion}

 <#if certData?has_content>
<br /> <br />Fecha y hora de expedici&oacute;n<br />${certData.custbody_mx_cfdi_certify_timestamp}<br />
   </#if>
</td>
<td align="right">
    <span class="number"><!--#${record.tranid}--></span>
</td>
</tr>
</table>
</macro>


<macro id="nlfooter">
    <table class="footer" style="width: 100%;"><tr>

        <#if record.custbody_efx_fe_gbl_folio?has_content>

        <td><barcode codetype="code128" showtext="true" value="${record.custbody_efx_fe_gbl_folio}"/></td>

        <#else>

        <td><barcode codetype="code128" showtext="true" value="${record.tranid}"/></td>
    </#if>
<td align="center">Este documento es una representación impresa de un CFDI</td>
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
td.subtotal{
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
<#assign "desglose_body" = desglose_json_body?eval>
<#assign "desglose_ieps" = desglose_body.rates_ieps>
<#assign "desglose_iva_data" = desglose_body.rates_iva_data>
<#assign "ieps_total" = desglose_body.ieps_total>
<#assign "iva_total" = desglose_body.iva_total>
<#assign "local_total" = desglose_body.local_total>
<#assign "desglose_ret" = desglose_body.rates_retencion>
<#assign "desglose_loc" = desglose_body.rates_local>
<#assign "desglose_total_discount" = desglose_body.descuentoSinImpuesto>
<#assign "cfdi_relacionados" = record.custbody_efx_fe_related_cfdi_json?eval>


<#assign "cabecera_total" = desglose_body.total>
<#assign "cabecera_subtotal" = desglose_body.subtotal>

<#assign "obj_totales_imp"= {}>
<#assign totaliepsGBL = 0/>
<#assign totalivaGBL = 0/>
<#assign totalretGBL = 0/>
<#assign totallocGBL = 0/>
<#assign totalivaimp = 0/>
<#assign totaldiscount = 0/>
<#assign totaliepsimp = 0/>

<#if record.currency == 'Peso Mexicano'>
<#assign "moneda_sat" = 'MXN Peso Mexicano'>
<#else>
<#assign "moneda_sat" = 'USD DOLAR EE.UU.'>
</#if>

<#if record.custbody_efx_fe_kiosko_customer?has_content>
<table style="width: 107%; margin-top: 10px;"><tr>
    <td class="body" colspan="14" style="background-color: #e3e3e3; font-size:9px;"><b>Cliente</b></td>
    <td></td>
   <!-- <td class="body" colspan="14" style="background-color: #e3e3e3; font-size:9px"><b>Lugar de entrega</b></td> -->
</tr>
    <tr>
        <td colspan="14" rowspan="2" style="border: 1px; border-color: #e3e3e3; font-size:9px;">${record.custbody_efx_fe_kiosko_name}<br/>${record.billaddress?upper_case}<br/>RFC: ${record.custbody_efx_fe_kiosko_rfc?upper_case}<br/></td>
        <td></td>


      <!--  <td align="left" colspan="14" style="border: 1px; border-color: #e3e3e3; font-size:9px;">${record.billaddress?keep_after(" />")?upper_case} </td> -->
    </tr>
</table>
<#else>
<table style="width: 107%; margin-top: 10px;"><tr>
    <td class="body" colspan="14" style="background-color: #e3e3e3; font-size:9px;"><b>Cliente</b></td>
    <td></td>
   <!-- <td class="body" colspan="14" style="background-color: #e3e3e3; font-size:9px"><b>Lugar de entrega</b></td> -->
</tr>
    <tr>
        <td colspan="14" rowspan="2" style="border: 1px; border-color: #e3e3e3; font-size:9px;">
            RFC: ${record.custbody_mx_customer_rfc?upper_case}<br/>
            ${record.entity.custentity_mx_sat_registered_name?upper_case}<br/>
            Régimen Fiscal: ${record.subsidiary.custrecord_mx_sat_industry_type}<br />
            Domicilio fiscal: ${record.billzip}<br />
            Uso de CFDI: ${record.custbody_mx_cfdi_usage?upper_case}
        </td>
        <td></td>


       <!-- <td align="left" colspan="14" style="border: 1px; border-color: #e3e3e3; font-size:9px;">${record.billaddress?keep_after(" />")?upper_case} </td> -->
    </tr>
</table>
</#if>

<table class="body" style="width: 100%; margin-top: 9px;"><tr>
    <th colspan="3">Condiciones de Pago</th>
    <th colspan="3">Referencia cliente</th>
    <th colspan="3">Orden de venta</th>

    <th colspan="3">No. de pedido</th>

</tr>
    <tr>
        <td colspan="3" style="font-size:9px;">${record.terms}</td>
        <td colspan="3" style="font-size:9px;">${record.entity.comments}</td>
        <td colspan="3" style="font-size:9px;">${record.createdfrom?keep_after("#")}</td>

        <td colspan="3" style="font-size:9px;">${record.otherrefnum}</td>

    </tr>
    <!--<tr>
<th colspan= "18" style="width: 100%;">Comentarios</th>
</tr>
<tr>
<td colspan= "18" style="width: 100%; font-size:10px;">${record.memo}</td>
</tr>-->
</table>

<#if record.item?has_content>
<#assign "line_discount"= 0>
<#assign "importe_discount" = []>
<#list record.item as item>
<#assign "tipo_articulo" = item.item?keep_before(" ")>
<#if tipo_articulo == "Descuento">
<#assign "importe_discount" = importe_discount+ [item.grossamt]>
<#else>
<#assign "importe_discount" = importe_discount+ [0]>
</#if>
</#list>
<#assign "importe_discount" = importe_discount+ [0]>
<#assign "descuento_total" = 0>

<#if tipoGBL=="" || tipoGBL=="Detalle de Articulo">
<table class="itemtable" style="width: 100%; margin-top: 3px; border: 1px; border-color: #e3e3e3;">
    <#list record.item as item><#if item_index==0>
    <thead>
    <tr style= "margin-top: 0px; padding-top: 0px; padding-bottom: 0px">
        <th align="center" colspan="2" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Partida</th>
        <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Código</th>
        <th align="center" colspan="3" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Clave<br/>SAT</th>
        <th align="center" colspan="18" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">
            <table style="width: 100%; margin-top: 0px; margin-bottom: 0px; border: 1px; border-color: #e3e3e3">
                <tr>
                    <th align="center" colspan="18" style="font-size: 5pt; padding-top: 0px; padding-bottom: 2px; padding-left: 0px; padding-right: 0px;">Descripción</th>
                </tr>
                <tr>
                    <td align= "left" colspan="5" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">Base:</td>
                    <td align= "left" colspan="4" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px; margin-top: 0px">Impuesto:</td>
                    <td align= "left" colspan="3" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">Tipo o Factor</td>
                    <td align= "left" colspan="4" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">Tasa o Cuota:</td>
                    <td align= "left" colspan="6" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">Importe:</td>
                </tr>
            </table>
        </th>
        <#--  <#if item.custcol_tko_serial_number?has_content && item.custcol_tko_expired_date?has_content && (record.entity.category = "MAYOREO" || record.entity.category = "Mayoreo")>
            <th align="center" colspan="4" style="font-size: 4pt; padding-left: 0px; padding-right: 0px;">Lote</th>
            <th align="center" colspan="4" style="font-size: 4pt; padding-left: 0px; padding-right: 0px;"><br/>Fecha<br/>caducidad</th>
        </#if>  -->
        <th align="center" colspan="2" style="font-size: 4pt; padding-left: 0px; padding-right: 0px;"><br/>Unidad SAT</th>
        <th align="center" colspan="2" style="font-size: 4pt; padding-left: 0px; padding-right: 0px;">Unidad</th>
        <th align="center" colspan="5" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">UPC</th>
        <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Cantidad</th>
        <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Valor unitario</th>
        <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Impuesto</th>
        <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Descuento</th>
        <th align="center" colspan="4" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">${item.amount@label}</th>
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
    <#assign "desglose" = desglose_json?eval>

    <td align="center" colspan="2" line-height="150%" style="border-left: 0px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${line_number}</td>
    <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${item.item?keep_before(" ")}</td>
    <td align="center" colspan="3" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding:0;">${item.custcol_mx_txn_line_sat_item_code?keep_before(" ")}</td>

    <td colspan="18" style="margin: 0; padding: 0;">
        <table style="width: 100%">
            <tr>
                <td colspan= "18" style="border-left: 1px; border-color: #e3e3e3; font-size: 6pt; padding-right: 1px; padding-left: 1px; padding-top: 1px; padding-bottom: 0px;">${item.description}</td>
            </tr>

            <tr>
                <td colspan="18" style= "border-left: 1px; border-color: #e3e3e3;">

                    <table  style="width: 100%; margin-top: 0px; margin-bottom: 0px;">

                        <#if desglose.ieps.name?has_content>
                        <tr>
                            <td align= "left" colspan="5" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${desglose.ieps.base_importe}</td>
                            <td align= "left" colspan="4" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${desglose.ieps.name}</td>
                            <td align= "left" colspan="3" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${desglose.ieps.factor} - IEPS</td>
                            <td align= "left" colspan="4" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${desglose.ieps.rate}%</td>
                            <td align= "left" colspan="6" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">$${desglose.ieps.importe}</td>
                        </tr>
                    </#if>

                    <#if desglose.iva.name?has_content>
                        <tr>
                            <#assign "iva1" = desglose.iva.rate / 100>
                            <td align= "left" colspan="5" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${testsymb}${desglose.iva.base_importe?number?string[",##0.00"]}</td>
                            <td align= "left" colspan="4" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${desglose.iva.factor} - IVA</td>
                            <td align= "left" colspan="3" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">Tasa</td>
                            <td align= "left" colspan="4" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${iva1?string[",##0.000000"]}</td>

                            <td align= "left" colspan="6" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${testsymb}${desglose.iva.importe}</td>
                        </tr>
                    </#if>

                    <#if desglose.retenciones.name != "">
                        <tr>
                            <td align= "left" colspan="5" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${testsymb}${desglose.retenciones.base_importe?number?string[",##0.00"]}</td>
                            <td align= "left" colspan="4" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${desglose.retenciones.factor} - IVA</td>
                            <td align= "left" colspan="3" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">Tasa</td>
                            <td align= "left" colspan="4" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${desglose.retenciones.rate_div?string[",##0.000000"]}</td>

                            <td align= "left" colspan="6" style="font-size: 4pt; padding-top: 0px; padding-bottom: 0px;">${testsymb}${desglose.retenciones.importe}</td>
                        </tr>
                    </#if>

        </table>

    </td>
</tr>
<#if item.custcol_mx_txn_line_sat_cust_req_num?has_content>
<tr style="padding:0px 0px;">
    <td colspan="6" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;"><b>Pedimento:</b> </td>
    <td colspan="13" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_mx_txn_line_sat_cust_req_num}</td>
</tr>
</#if>
<#if item.custcol_tko_serial_number?has_content && (record.entity.category = "MAYOREO" || record.entity.category = "Mayoreo")>
<tr>
    <td style="border-left: 1px; border-color: #e3e3e3; font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;"><b>Lote:</b> </td>
</tr>
<tr> <!-- colspan de 18 -->
    <td style="border-left: 1px; border-color: #e3e3e3; font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_tko_serial_number}</td>
</tr>
</#if>

<#if item.custcol_tko_expired_date?has_content && (record.entity.category = "MAYOREO" || record.entity.category = "Mayoreo")>
<tr>
    <td style="border-left: 1px; border-color: #e3e3e3; font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;"><b>Fecha<br/>caducidad:</b> </td>
</tr>
<tr>
    <td style="border-left: 1px; border-color: #e3e3e3; font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_tko_expired_date}</td>
</tr>
</#if>

<#if item.custcol_mx_txn_line_sat_tax_object?has_content>
<tr>
    <td style="border-left: 1px; border-color: #e3e3e3; font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;"><b>Objeto de impuestos</b> </td>
</tr>
<tr>
    <td style="border-left: 1px; border-color: #e3e3e3; font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_mx_txn_line_sat_tax_object}</td>
</tr>
</#if>
</table>
</td>

<#if item.units == 'PZ'>
<#assign "units_sat" = 'H87'>
<#else>
  <#if item.units == 'Servicio'>
<#assign "units_sat" = 'E48'>
<#else>
  <#assign "units_sat" = item.units>
</#if>
</#if>

<#if record.currency == 'Peso Mexicano'>
<#assign "total_moneda" = 'Total MXN $'>
<#else>
<#assign "total_moneda" = 'Total USD $'>
</#if>
<#--  <#if item.custcol_tko_serial_number?has_content && item.custcol_tko_expired_date?has_content && (record.entity.category = "MAYOREO" || record.entity.category = "Mayoreo")>
<td align="center" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.custcol_tko_serial_number}</td>
<td align="center" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.custcol_tko_expired_date}</td>
</#if>  -->
<td align="center" colspan="2" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${units_sat}</td>
<td align="center" colspan="2" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.units}</td>
<td align="center" colspan="5" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.custcol_efx_fe_upc_code}</td>
<td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.quantity}</td>

 <#assign "rate" = item.rate?string[",##0.00"]>
    <#assign "ItemRate" = rate?replace(",", ".")>
<td align="center" colspan="4" style="border-left: 1px; border-color: #e3e3e3; font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${testsymb}${rate}</td>


<td align="center" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.tax1amt}</td>




<td align="center" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${testsymb}${importe_discount[item_index+1]?number?string[",##0.00"]}</td>
<#assign "descuento_total" = descuento_total + importe_discount[item_index+1]>

 <#assign "itemGrossamtmoneda" = item.grossamt?replace("$", "")>
 <#assign "importe_total_documento" = itemGrossamtmoneda?replace(",", "")?number - item.tax1amt>

<td align="center" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">$${importe_total_documento?string[",##0.00"]}</td>

</tr>
</#if>

</#list></table>

<#elseif tipoGBL=="Articulo Global">

<#else>

</#if>

</#if>

<table>

    <#assign "desglose_json_body" = record.custbody_efx_fe_tax_json>
    <#assign "desglose_body" = desglose_json_body?eval>
    <#assign "desglose_iva_data" = desglose_body.rates_iva_data>
    <#assign "bases_iva" = desglose_body.bases_iva>
    <#assign "desglose_ieps" = desglose_body.rates_ieps>
    <#assign "desglose_ret" = desglose_body.rates_retencion>
    <#assign "desglose_loc" = desglose_body.rates_local>

    <#assign objRet = desglose_body.rates_retencion_data>
    <#if objRet?has_content>
        <#list objRet as rate, imp>
            <#assign rateRet = rate?number>
            <#assign rateRetDiv = rateRet/ 100>
        </#list>
    </#if>

    <!-- Default taxes amounts -->
    <#assign "bases_iva_zero" = 0>
    <#assign "bases_iva_eight" = 0>
    <#assign "bases_iva_sixteen" = 0>

    <!-- Taxes content -->
    <#if bases_iva?has_content>

    <!-- TAX 0 exists -->
    <#if bases_iva["0"]??>
        <#assign "bases_iva_zero" = bases_iva["0"]>
        <#assign "current_iva" = '0.00'>
    </#if>

        <!-- TAX 8 exists -->
    <#if bases_iva["8"]??>
        <#assign "bases_iva_eight" = bases_iva["8"]>
        <#assign "current_iva" = '0.08'>
        </#if>

        <!-- TAX 16 exists -->
    <#if bases_iva["16"]??>
        <#assign "bases_iva_sixteen" = bases_iva["16"]>
        <#assign "current_iva" = '0.16'>
        </#if>

    </#if>

</table>


<table style="width: 100%; margin-top: 5px; padding: 0px; border: 1px; border-color: #e3e3e3;">
    <tr>
        <td colspan="6" style="margin: 0px; padding: 0px;">
            <table class="total" style="width: 100%; margin-top: 0px; border: 0px; border-color: #e3e3e3;">
                <tr>
                    <td align="left" colspan="2" style="border-top: 0px; border-bottom: 1px; border-color: #e3e3e3; font-size: 7pt;border-right: 0px;"><strong>Cantidad con letra:</strong> ${record.custbody_efx_fe_total_text}</td>
                </tr>
                <tr>
                    <td align="left" style="border-right: 1px; border-bottom: 1px; border-color: #e3e3e3; font-size: 7pt;"><strong>Elaboró:</strong>${record.salesrep}</td>
                </tr>
                <tr>
                    <td align="left" style="border-right: 1px; border-bottom: 1px; border-color: #e3e3e3; font-size: 7pt;"><strong></strong></td>
                    <td align="left" style="font-size: 7pt; border-bottom: 1px; border-color: #e3e3e3; padding-left: 0px;border-right: 0px;">
                        <table style="margin-left: 0px; padding-left: 0px;margin-top: 0px; padding-top: 0px;">
                            <tr>
                                <td align="left" style= "font-size: 7pt; padding-left: 0px;margin-top: 0px; padding-top: 0px;"><strong> </strong></td>
                                <td style= "font-size: 7pt;margin-top: 0px; padding-top: 0px;">
                                    <table style="margin-top: 0px; padding-top: 0px;">
                                        <tr><td align="left" style= "font-size: 7pt;margin-top: 0px; padding-top: 0px;border-right: 0px;" colspan="2"><strong></strong></td></tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colspan= "2" style= "font-size: 7pt;border-color: #e3e3e3; border-right: 0px;"> <b>Comentarios: </b> ${record.memo?upper_case}</td>
                </tr>
            </table>
        </td>
        <td colspan="4" style="margin: 0px; padding: 0;">
            <table style="width: 100%; margin-top: 0px; margin-left: 0px; border: 0px; border-color: #e3e3e3;">
                <tr>
                    <td colspan="3" align="right" style="font-size: 7pt; border-color: #e3e3e3;border-left: 1px;"><b>Subtotal IVA 0% ${testsymb}</b></td>
                    <td align="right" colspan="2" style="font-size: 7pt;">${bases_iva_zero?number?string[",##0.00"]}</td>
                </tr>
                <tr>
                    <td colspan="3" align="right" style="font-size: 7pt; border-color: #e3e3e3;border-left: 1px;"><b>Subtotal IVA 8% ${testsymb}</b></td>
                    <td align="right" colspan="2" style="font-size: 7pt;">${bases_iva_eight?number?string[",##0.00"]}</td>
                </tr>
                <tr>
                    <td colspan="3" align="right" style="font-size: 7pt; border-color: #e3e3e3;border-left: 1px;"><b>Subtotal IVA 16% ${testsymb}</b></td>
                    <td align="right" colspan="2" style="font-size: 7pt;">${bases_iva_sixteen?number?string[",##0.00"]}</td>
                </tr>
                <tr>
                    <td colspan="3" align="right" style="font-size: 7pt; border-color: #e3e3e3;border-left: 1px;"><b>IVA Traslado (${current_iva}0000) ${testsymb} </b></td>
                    <td align="right" colspan="2" style="font-size: 7pt;">${desglose_body.totalTraslados?number?string[",##0.00"]}</td>
                </tr>
                <tr>
                    <td colspan="3" align="right" style="font-size: 7pt; border-color: #e3e3e3;border-left: 1px;"><b>IVA Retención ${rateRet}% (${rateRetDiv?string[",##0.000000"]}) ${testsymb}</b></td>
                    <td align="right" colspan="2" style="font-size: 7pt;">${desglose_body.retencion_total?number?string[",##0.00"]}</td>
                </tr>

                <tr>
                    <td colspan="3" align="right" style="font-size: 7pt;  border-color: #e3e3e3;border-left: 1px;"><b>${total_moneda}</b></td>
                    <td align="right" colspan="2" style="font-size: 7pt;"><#if cabecera_total?has_content>${testsymb}${cabecera_total?number?string[",##0.00"]}</#if></td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<table style="width: 100%; margin-top: 10px; padding: 0; border: 0px; border-color: #e3e3e3;">
    <tr>
        <th colspan="6">Detalles del comprobante</th>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Tipo de comprobante:</b></td>
        <td colspan="2" style="font-size: 7pt;">INGRESO</td>
        <td colspan="1" style="font-size: 7pt;"><b>Forma de pago:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_txn_sat_payment_method?upper_case}</td>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Moneda:</b></td>
        <!--<td colspan="2" style="font-size: 7pt;">${record.currency?upper_case}</td>-->
        <td colspan="2" style="font-size: 7pt;">${moneda_sat}</td>
      <td colspan="1" style="font-size: 7pt;"><b>Tipo de cambio:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.exchangerate?string[",##0.0000"]}</td>

    </tr>
    <tr>
		<td colspan="1" style="font-size: 7pt;"><b>Método de pago:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_txn_sat_payment_term?upper_case}</td>
    </tr>
<tr>
		<td colspan="1" style="font-size: 7pt;"><b>No. Certificado CFDI:</b></td>
  		<#if certData?has_content>
            <td colspan="2" style="font-size: 7pt;">${certData.custbody_mx_cfdi_issuer_serial}</td>
        <#else>
            <td colspan="2" style="font-size: 7pt;">${record.custbody_mx_cfdi_issuer_serial}</td>
        </#if>
    </tr>
</table>

<!--<table style="width: 100%; margin-top: 10px; padding: 0; border: 0px; border-color: #e3e3e3;">
    <tr>
        <th>Politicas de devolución</th>
    </tr>
    <tr>
        <td style="font-size: 7pt;"></td>
    </tr>

</table>-->
<table style="border-collapse: collapse; width: 100%; margin-top: 10px; padding: 0; border: 0px; border-color: #e3e3e3;">
    <tr>
        <th colspan="6" style="text-align: center;">Información CFDI</th>
    </tr>
    <tr>
        <td colspan="6" style="border:1px;border-color: #e3e3e3; padding: 8px; text-align: center;">Documentos relacionados:</td>
    </tr>

    <tr>
        <td colspan="1" style=" border: 1px ; padding: 8px; text-align: left;border-color: #e3e3e3; ">Folio</td>
        <td colspan="2" style=" border: 1px ; padding: 8px; text-align: left;border-color: #e3e3e3; ">Tipo</td>
        <td colspan="3" style=" border: 1px ; padding: 8px; text-align: left;border-color: #e3e3e3; ">UUID</td>
    </tr>
    <#list cfdi_relacionados as item>
    <tr>
        <td colspan="1" style=" border: 1px ; padding: 8px; text-align: left;border-color: #e3e3e3;">${record.custbody_mx_cfdi_folio}</td>
        <td colspan="2" style=" border: 1px ; padding: 8px; text-align: left;border-color: #e3e3e3;">${item.type}</td>
        <td colspan="3" style=" border: 1px ; padding: 8px; text-align: left;border-color: #e3e3e3;">${item.uuid}</td>
    </tr>
    </#list>
</table>


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
      </td></tr>
                                            <#else>

                                              <tr>
                                             <td valign="top" align="left" width="25%">
                                                    <#if record.custbody_mx_cfdi_qr_code != ''>
                                                      <#assign qrcodeImage = "data:image/png;base64, " + record.custbody_mx_cfdi_qr_code >
                                                         <img style="width: 65%;height:65%;margin-top: 10px" src="${qrcodeImage}" />
                                                    </#if>
                                                </td>

                                              <td>
  <table >

<tr>
    <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Folio Fiscal</b><br/>${record.custbody_mx_cfdi_uuid}</td>
</tr>
<tr>
    <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Fecha y hora de certificación</b><br/>${record.custbody_mx_cfdi_certify_timestamp}</td>
</tr>
<tr>
    <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Cadena Original</b><br/>${record.custbody_mx_cfdi_cadena_original}</td>
</tr>
<tr>
    <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Firma del CFDI</b><br/>${record.custbody_mx_cfdi_signature}</td>
</tr>
<tr>
    <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Firma del SAT</b><br/>${record.custbody_mx_cfdi_sat_signature}</td>

</tr>
  <tr>
    <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>RFC proveedor de certificación</b><br/>ABCD</td>

</tr>
  <tr>
    <td style="border-left: 1px;border-right: 1px; border-color: #e3e3e3;font-size:7px;"><b>Certificado Digital SAT</b><br/>${record.custbody_mx_cfdi_sat_serial}</td>

</tr>

</table>
      </td></tr>
                                            </#if></table>







</body>
</pdf>