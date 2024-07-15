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
<#assign currencySymbolMap = {"USD":"$","CAD":"$","EUR":"€","AED":"د.إ.‏","AFN":"؋","ALL":"Lek","AMD":"դր.","ARS":"$","AUD":"$","AZN":"ман.","BAM":"KM","BDT":"৳","BGN":"лв.","BHD":"د.ب.‏","BIF":"FBu","BND":"$","BOB":"Bs","BRL":"R$","BWP":"P","BYR":"BYR","BZD":"$","CDF":"FrCD","CHF":"CHF","CLP":"$","CNY":"CN¥","COP":"$","CRC":"₡","CVE":"CV$","CZK":"Kč","DJF":"Fdj","DKK":"kr","DOP":"RD$","DZD":"د.ج.‏","EEK":"kr","EGP":"ج.م.‏","ERN":"Nfk","ETB":"Br","GBP":"£","GEL":"GEL","GHS":"GH₵","GNF":"FG","GTQ":"Q","HKD":"$","HNL":"L","HRK":"kn","HUF":"Ft","IDR":"Rp","ILS":"₪","INR":"টকা","IQD":"د.ع.‏","IRR":"﷼","ISK":"kr","JMD":"$","JOD":"د.أ.‏","JPY":"￥","KES":"Ksh","KHR":"៛","KMF":"FC","KRW":"₩","KWD":"د.ك.‏","KZT":"тңг.","LBP":"ل.ل.‏","LKR":"SL Re","LTL":"Lt","LVL":"Ls","LYD":"د.ل.‏","MAD":"د.م.‏","MDL":"MDL","MGA":"MGA","MKD":"MKD","MMK":"K","MOP":"MOP$","MUR":"MURs","MXN":"$","MYR":"RM","MZN":"MTn","NAD":"N$","NGN":"₦","NIO":"C$","NOK":"kr","NPR":"नेरू","NZD":"$","OMR":"ر.ع.‏","PAB":"B/.","PEN":"S/.","PHP":"₱","PKR":"₨","PLN":"zł","PYG":"₲","QAR":"ر.ق.‏","RON":"RON","RSD":"дин.","RUB":"руб.","RWF":"FR","SAR":"ر.س.‏","SDG":"SDG","SEK":"kr","SGD":"$","SOS":"Ssh","SYP":"ل.س.‏","THB":"฿","TND":"د.ت.‏","TOP":"T$","TRY":"TL","TTD":"$","TWD":"NT$","TZS":"TSh","UAH":"₴","UGX":"USh","UYU":"$","UZS":"UZS","VEF":"Bs.F.","VND":"₫","XAF":"FCFA","XOF":"CFA","YER":"ر.ي.‏","ZAR":"R","ZMK":"ZK"}>
<#function fmtc value>
<#assign dst =  currencySymbolMap[currencyCode] + value?number?string["0.00"]>
<#return dst>
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
                    <#if record.custbody_efx_fe_logosub?has_content>
                    <img height="35%" src="${record.custbody_efx_fe_logosub}" style="float: left; margin: 2px" width="30%" />
                </#if>
                <#else>
                <#if record.custbody_efx_fe_logosub?has_content>
                <#if subsidiary.logo@url?length != 0>
                <img height="35%" src="${subsidiary.logo@url}" style="float: left; margin: 2px" width="30%" />
                <#elseif companyInformation.logoUrl?length != 0>
                <img height="35%" src="${companyInformation.logoUrl}" style="float: left; margin: 2px" width="30%" />
            </#if>
        </#if>
    </#if>

    </td>
    <td colspan="6" rowspan="3">
        <span class="nameandaddress" style="font-size: 9px; width: 40%;" >${record.custbody_efx_fe_dirsubs} <br /> ${subsidiary.federalidnumber}</span>
    </td>
    <td colspan="2" style="width: 21px;">&nbsp;</td>
    <td colspan="4" style="font-size: 10px;" align="right"><span style="font-size: 12px;"><strong>Traslado</strong></span><br />
        <#if dataXML?has_content>
            <#assign folio_tran = dataXML.atributos.Serie +""+ dataXML.atributos.Folio>
            <span class="number" style="font-size: 18px;">${folio_tran}</span>
            <br/> <br/>Fecha y hora de emisi&oacute;n<br/>${dataXML.atributos.Fecha}<br/>
        <#else>
            <span class="number" style="font-size: 18px;">${record.tranid}</span>
            <br/> <br/>Fecha y hora de emisi&oacute;n<br/>${record.createdDate}<br/>
        </#if>
    </td>

    </tr>
    </table>
    </macro>


    <macro id="nlfooter">
        <table class="footer" style="width: 100%;"><tr>

            <#if record.custbody_efx_fe_gbl_folio?has_content>

            <td><barcode codetype="code128" showtext="true" value="${record.custbody_efx_fe_gbl_folio}"/></td>
            <#elseif record.custbody_efx_fe_kiosko_folio?has_content>

            <td><barcode codetype="code128" showtext="true" value="${record.custbody_efx_fe_kiosko_folio}"/></td>
            <#else>
            <td><barcode codetype="code128" showtext="true" value="${record.tranid}"/></td>
        </#if>

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
    td.cabecera, th.cabecera {
        color: #000000;
        font-size: 8pt;
        background-color: #e3e3e3;
        padding: 2px;
    }
    td.cuerposnoarticulos {
        padding: 2px;
        font-size: 7pt;
    }
table.itemtable th {
    padding-bottom: 10px;
    padding-top: 10px;
}
    table.tablascompletas {
        width: 100%;
        margin-top: 10px;
        border: 1px;
        border-color: #e3e3e3
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
        <table style="width: 100%; margin-top: 10px;">
            <tr>
                <td class="body" colspan="14" style="background-color: #e3e3e3; font-size:9px;"><b>Origen</b></td>
                <td></td>
                <td class="body" colspan="14" style="background-color: #e3e3e3; font-size:9px"><b>Destino</b></td>
            </tr>
            <tr>
                <#if record.custbody_efx_fe_comercio_exterior == true>
                    <#assign dirJsons = record.custbody_efx_fe_dirjson_emisor>
                    <#if dirJsons?has_content>
                        <#assign dir_obj = dirJsons?eval>
                        <td colspan="14" rowspan="2" style="border: 1px; border-color: #e3e3e3; font-size:9px;">
                            ${dir_obj.emisor.Nombre}<br/>
                            ${dir_obj.emisor.Calle?upper_case}<br/>
                            RFC: ${dir_obj.emisor.Rfc?upper_case}
                        </td>
                        <td></td>
                        <td align="left" colspan="14" style="border: 1px; border-color: #e3e3e3; font-size:9px;">
                            <#--  ${dir_obj.receptor.Nombre}<br/>  -->
                            ${dir_obj.receptor.Calle?upper_case}<br/>
                            RFC: ${dir_obj.receptor.Rfc?upper_case}
                        </td>
                    </#if>
                <#else>
                    <#if dataXML?has_content>
                        <#assign direccion_data = dataXML.Complemento.CartaPorte.Ubicaciones.Ubicacion>
                        <#assign direccion_origen_data = "">
                        <#assign direccion_destino_data = "">
                        <#list direccion_data as data_dir>
                            <#if data_dir.atributos.TipoUbicacion == "Origen">
                                <#assign direccion_origen_data = direccion_origen_data + data_dir.atributos.NombreRemitenteDestinatario + ", " +data_dir.atributos.IDUbicacion+ ", " +data_dir.atributos.TipoUbicacion+ ", " +data_dir.Domicilio.atributos.Calle+ ", " +data_dir.Domicilio.atributos.CodigoPostal+", "+data_dir.Domicilio.atributos.Pais+"">
                            <#else>
                                <#assign direccion_destino_data = direccion_destino_data + data_dir.atributos.NombreRemitenteDestinatario + ", " +data_dir.atributos.IDUbicacion+ ", " +data_dir.atributos.TipoUbicacion+ ", " +data_dir.Domicilio.atributos.Calle+ ", " +data_dir.Domicilio.atributos.CodigoPostal+", "+data_dir.Domicilio.atributos.Pais+"">
                            </#if>
                        </#list>
                        <td colspan="14" rowspan="2" style="border: 1px; border-color: #e3e3e3; font-size:9px;">
                            ${dataXML.Emisor.atributos.Nombre?upper_case}<br/>
                            ${direccion_origen_data?upper_case}<br/>
                            RFC: ${dataXML.Emisor.atributos.Rfc?upper_case}
                        </td>
                        <td></td>
                        <td align="left" colspan="14" style="border: 1px; border-color: #e3e3e3; font-size:9px;">
                            <#--  ${dataXML.Receptor.atributos.Nombre?upper_case}<br/>  -->
                            ${direccion_destino_data?upper_case}<br/>
                            RFC: ${dataXML.Receptor.atributos.Rfc?upper_case}
                        </td>
                    <#else>
                        <td colspan="14" rowspan="2" style="border: 1px; border-color: #e3e3e3; font-size:9px;">${record.entity.companyname?upper_case}<br/>${record.billaddress?upper_case}<br/>RFC: ${record.custbody_mx_customer_rfc?upper_case}<br/>No. de Cliente: ${record.entity.entityid?upper_case}</td>
                        <td></td>
                        <td align="left" colspan="14" style="border: 1px; border-color: #e3e3e3; font-size:9px;">${record.billaddress?keep_after(" />")?upper_case} </td>
                    </#if>
                </#if>
            </tr>
        </table>

    <#if dataXML?has_content>
        <#assign itemlista = dataXML.Conceptos.Concepto>
        <#if itemlista?is_sequence>
            <table class="itemtable" style="width: 100%; margin-top: 3px; border: 1px; border-color: #e3e3e3;">
                    <thead>
                    <tr style= "margin-top: 0px; padding-top: 0px; padding-bottom: 0px">
                        <th align="center" colspan="6" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Código</th>
                        <th align="center" colspan="7" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Código<br/>Clave</th>
                        <th align="center" colspan="10" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Descripción</th>
                        <th align="center" colspan="3" style="font-size: 4pt; padding-left: 0px; padding-right: 0px;">Unidad</th>
                        <th align="center" colspan="7" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">UPC</th>
                        <th align="center" colspan="5" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Cantidad</th>

                    </tr>
                    </thead>
                <#list itemlista as item>
                    <tr>

                        <td align="center" colspan="6" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${item.atributos.NoIdentificacion?keep_before(" ")}</td>
                        <td align="center" colspan="7" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding:0;">${item.atributos.ClaveProdServ?keep_before(" ")}</td>
                        <td colspan="10" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top:1px;">${item.atributos.Descripcion}</td>
                        <td align="center" colspan="3" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.atributos.ClaveUnidad}</td>
                        <td align="center" colspan="7" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.atributos.NoIdentificacion}</td>
                        <td align="center" colspan="5" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.atributos.Cantidad}</td>

                    </tr>

                </#list>
            </table>
        <#else>
            <table class="itemtable" style="width: 100%; margin-top: 3px; border: 1px; border-color: #e3e3e3;">
                    <thead>
                    <tr style= "margin-top: 0px; padding-top: 0px; padding-bottom: 0px">
                        <th align="center" colspan="6" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Código</th>
                        <th align="center" colspan="7" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Código<br/>Clave</th>
                        <th align="center" colspan="10" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Descripción</th>
                        <th align="center" colspan="3" style="font-size: 4pt; padding-left: 0px; padding-right: 0px;">Unidad</th>
                        <th align="center" colspan="7" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">UPC</th>
                        <th align="center" colspan="5" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Cantidad</th>

                    </tr>
                    </thead>


                    <tr>

                        <td align="center" colspan="6" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${itemlista.atributos.NoIdentificacion?keep_before(" ")}</td>
                        <td align="center" colspan="7" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding:0;">${itemlista.atributos.ClaveProdServ?keep_before(" ")}</td>
                        <td colspan="10" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top:1px;">${itemlista.atributos.Descripcion}</td>
                        <td align="center" colspan="3" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${itemlista.atributos.ClaveUnidad}</td>
                        <td align="center" colspan="7" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${itemlista.atributos.NoIdentificacion}</td>
                        <td align="center" colspan="5" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${itemlista.atributos.Cantidad}</td>

                    </tr>


            </table>
        </#if>
    <#else>
        <#if record.item?has_content>

            <table class="itemtable" style="width: 100%; margin-top: 3px; border: 1px; border-color: #e3e3e3;"><#list record.item as item><#if item_index==0>
                    <thead>
                    <tr style= "margin-top: 0px; padding-top: 0px; padding-bottom: 0px">
                        <th align="center" colspan="6" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Código</th>
                        <th align="center" colspan="7" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Código<br/>Clave</th>
                        <th align="center" colspan="10" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Descripción</th>
                        <th align="center" colspan="3" style="font-size: 4pt; padding-left: 0px; padding-right: 0px;">Unidad</th>
                        <th align="center" colspan="7" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">UPC</th>
                        <th align="center" colspan="5" style="font-size: 5pt; padding-left: 0px; padding-right: 0px;">Cantidad</th>

                    </tr>
                    </thead>
                </#if>

                    <tr>

                        <td align="center" colspan="6" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px;">${item.item?keep_before(" ")}</td>
                        <td align="center" colspan="7" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding:0;">${item.custcol_mx_txn_line_sat_item_code?keep_before(" ")}</td>
                        <td colspan="10" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top:1px;">${item.description}</td>
                        <td align="center" colspan="3" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.units}</td>
                        <td align="center" colspan="7" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.custcol_efx_fe_upc_code}</td>
                        <td align="center" colspan="5" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 5pt; padding-top: 1px; padding-left: 0px; padding-right: 0px;">${item.quantity}</td>

                    </tr>

                </#list></table>
        </#if>
</#if>


<table style="width: 100%; margin-top: 10px; padding: 0; border: 0px; border-color: #e3e3e3;">
    <tr>
        <th colspan="6">Detalles del comprobante</th>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Tipo de comprobante:</b></td>
        <td colspan="2" style="font-size: 7pt;">TRASLADO</td>
        <td colspan="1" style="font-size: 7pt;"></td>
        <td colspan="2" style="font-size: 7pt;"></td>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Moneda:</b></td>
        <#if dataXML?has_content>
            <td colspan="2" style="font-size: 7pt;">${dataXML.atributos.Moneda?upper_case}</td>
        <#else>
            <td colspan="2" style="font-size: 7pt;">${record.custbody_efx_fe_ce_currency?upper_case}</td>
        </#if>

        <td colspan="1" style="font-size: 7pt;"><b></b></td>
        <td colspan="2" style="font-size: 7pt;"></td>
    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Uso del CFDI:</b></td>
        <#if dataXML?has_content>
            <#assign uso_cfdi = dataXML.Receptor.atributos.UsoCFDI>
        <#else>
            <#assign uso_cfdi = record.custbody_mx_cfdi_usage?keep_before(" ")>
        </#if>
        <#if uso_cfdi == "D01">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D01 - HONORARIOS MÉDICOS, DENTALES Y GASTOS
                HOSPITALARIOS
            </td>
        <#elseif uso_cfdi == "D02">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D02 - GASTOS MÉDICOS POR INCAPACIDAD O
                DISCAPACIDAD
            </td>
        <#elseif uso_cfdi == "D03">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D03 - GASTOS FUNERALES</td>
        <#elseif uso_cfdi == "D04">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D04 - DONATIVOS</td>
        <#elseif uso_cfdi == "D05">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D05 - INTERESES REALES EFECTIVAMENTE PAGADOS POR
                CRÉDITOS HIPOTECARIOS (CASA HABITACIÓN)
            </td>
        <#elseif uso_cfdi == "D06">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D06 - APORTACIONES VOLUNTARIAS AL SAR</td>
        <#elseif uso_cfdi == "D07">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D07 - PRIMAS POR SEGUROS DE GASTOS MÉDICOS</td>
        <#elseif uso_cfdi == "D08">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D08 - GASTOS DE TRANSPORTACIÓN ESCOLAR
                OBLIGATORIA
            </td>
        <#elseif uso_cfdi == "D09">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D09 - DEPÓSITOS EN CUENTAS PARA EL AHORRO, PRIMAS
                QUE TENGAN COMO BASE PLANES DE PENSIONES
            </td>
        <#elseif uso_cfdi == "D10">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">D10 - PAGOS POR SERVICIOS EDUCATIVOS
                (COLEGIATURAS)
            </td>
        <#elseif uso_cfdi == "G01">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">G01 - ADQUISICIÓN DE MERCANCÍAS</td>
        <#elseif uso_cfdi == "G02">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">G02 - DEVOLUCIONES, DESCUENTOS O BONIFICACIONES
            </td>
        <#elseif uso_cfdi == "G03">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">G03 - GASTOS EN GENERAL</td>
        <#elseif uso_cfdi == "I01">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">I01 - CONSTRUCCIONES</td>
        <#elseif uso_cfdi == "I02">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">I02 - MOBILIARIO Y EQUIPO DE OFICINA POR
                INVERSIONES
            </td>
        <#elseif uso_cfdi == "I03">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">I03 - EQUIPO DE TRANSPORTE</td>
        <#elseif uso_cfdi == "I04">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">I04 - EQUIPO DE CÓMPUTO Y ACCESORIOS</td>
        <#elseif uso_cfdi == "I05">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">I05 - DADOS, TROQUELES, MOLDES, MATRICES Y
                HERRAMENTAL
            </td>
        <#elseif uso_cfdi == "I06">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">I06 - COMUNICACIONES TELEFÓNICAS</td>
        <#elseif uso_cfdi == "I07">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">I07 - COMUNICACIONES SATELITALES</td>
        <#elseif uso_cfdi == "I08">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">I08 - OTRA MAQUINARIA Y EQUIPO</td>
        <#elseif uso_cfdi == "P01">
            <td colspan="2" style="font-size: 7pt; padding: 2px;">P01 - POR DEFINIR</td>
        <#else>
            <td colspan="2" style="font-size: 7pt; padding: 2px;"></td>
        </#if>

    </tr>
    <tr>
        <td colspan="1" style="font-size: 7pt;"><b>Régimen fiscal:</b></td>
        <td colspan="2" style="font-size: 7pt;">${record.subsidiary.custrecord_mx_sat_industry_type?upper_case}</td>

    </tr>

</table>

<#if record.custbody_efx_fe_comercio_exterior==true>
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

<#if record.custbody_efx_fe_carta_porte==true>
<#if dataXML?has_content>
    <#assign listaUbicaciones = dataXML.Complemento.CartaPorte.Ubicaciones.Ubicacion>
    <#assign listaMercancias = dataXML.Complemento.CartaPorte.Mercancias.Mercancia>
    <#assign autotransporte = dataXML.Complemento.CartaPorte.Mercancias.Autotransporte>
    <#assign seguros = dataXML.Complemento.CartaPorte.Mercancias.Autotransporte.Seguros>
    <#assign listafiguratransporte = dataXML.Complemento.CartaPorte.FiguraTransporte.TiposFigura>
    <#assign listaremolques = dataXML.Complemento.CartaPorte.Mercancias.Autotransporte.Remolques.Remolque>
    <table class="tablascompletas" style="margin-top:5px;">
        <tr>
            <td colspan="9" class="cabecera"><b>Carta Porte</b></td>
        </tr>
        <tr>
            <td colspan="3" class="cabecera"><b>Version</b></td>
            <td colspan="3" class="cabecera"><b>Transporte Internacional</b></td>
            <td colspan="3" class="cabecera"><b>Distancia Recorrida Total</b></td>
        </tr>
        <tr>
            <td colspan="3" class="cuerposnoarticulos">${dataXML.Complemento.CartaPorte.atributos.Version}</td>
            <td colspan="3" class="cuerposnoarticulos">${dataXML.Complemento.CartaPorte.atributos.TranspInternac}</td>
            <td colspan="3" class="cuerposnoarticulos">${dataXML.Complemento.CartaPorte.atributos.TotalDistRec}</td>
        </tr>

        <tr>
            <td colspan="9" class="cabecera"><b>Ubicaciones</b></td>
        </tr>
        <#list listaUbicaciones as ubicaciones>
            <tr>
                <td colspan="2" style="font-size: 7pt;"><b>Tipo de Ubicacion:</b></td>
                <td colspan="2" style="font-size: 7pt;">${ubicaciones.atributos.TipoUbicacion}</td>
                <td colspan="2" style="font-size: 7pt;"><b>ID Ubicacion:</b></td>
                <td colspan="2" style="font-size: 7pt;">${ubicaciones.atributos.IDUbicacion}</td>
            </tr>
            <tr>
                <td colspan="2" style="font-size: 7pt;"><b>RFC Remitente Destinatario:</b></td>
                <td colspan="2" style="font-size: 7pt;">${ubicaciones.atributos.RFCRemitenteDestinatario}</td>
                <td colspan="2" style="font-size: 7pt;"><b>Nombre Remitente Destinatario:</b></td>
                <td colspan="2" style="font-size: 7pt;">${ubicaciones.atributos.NombreRemitenteDestinatario}</td>
            </tr>
            <tr style="border-bottom: 1px; border-color: #e3e3e3">
                <td colspan="2" style="font-size: 7pt;"><b>Fecha Hora Salida Llegada:</b></td>
                <td colspan="2" style="font-size: 7pt;">${ubicaciones.atributos.FechaHoraSalidaLlegada}</td>
                <#if ubicaciones.atributos.DistanciaRecorrida?has_content>
                    <td colspan="2" style="font-size: 7pt;"><b>Distancia Recorrida:</b></td>
                    <td colspan="2" style="font-size: 7pt;">${ubicaciones.atributos.DistanciaRecorrida}</td>
                </#if>
            </tr>
        </#list>


        <tr>
            <td colspan="9" class="cabecera"><b>Mercancias</b></td>
        </tr>
        <#list listaMercancias as mercancias>
            <tr>
                <td colspan="2" style="font-size: 7pt;"><b>Bienes Transportados:</b></td>
                <td colspan="2" style="font-size: 7pt;">${mercancias.atributos.BienesTransp}</td>
                <td colspan="2" style="font-size: 7pt;"><b>Descripcion:</b></td>
                <td colspan="2" style="font-size: 7pt;">${mercancias.atributos.Descripcion}</td>
            </tr>
            <tr>
                <td colspan="2" style="font-size: 7pt;"><b>Cantidad:</b></td>
                <td colspan="2" style="font-size: 7pt;">${mercancias.atributos.Cantidad}</td>
                <td colspan="2" style="font-size: 7pt;"><b>Clave Unidad:</b></td>
                <td colspan="2" style="font-size: 7pt;">${mercancias.atributos.ClaveUnidad}</td>
            </tr>
            <tr style="border-bottom: 1px; border-color: #e3e3e3">
                <td colspan="2" style="font-size: 7pt;"><b>Peso en KG:</b></td>
                <td colspan="2" style="font-size: 7pt;">${mercancias.atributos.PesoEnKg}</td>
                <td colspan="2" style="font-size: 7pt;"></td>
                <td colspan="2" style="font-size: 7pt;"></td>
            </tr>
        </#list>

        <tr>
            <td colspan="9" class="cabecera"><b>Autotransporte</b></td>
        </tr>
        <tr>
            <td colspan="2" style="font-size: 7pt;"><b>Permiso SCT:</b></td>
            <td colspan="2" style="font-size: 7pt;">${autotransporte.atributos.PermSCT}</td>
            <td colspan="2" style="font-size: 7pt;"><b>Numero Permiso SCT:</b></td>
            <td colspan="2" style="font-size: 7pt;">${autotransporte.atributos.NumPermisoSCT}</td>
        </tr>
        <tr>
            <td colspan="2" style="font-size: 7pt;"><b>Placa:</b></td>
            <td colspan="2" style="font-size: 7pt;">${autotransporte.IdentificacionVehicular.atributos.PlacaVM}</td>
            <td colspan="2" style="font-size: 7pt;"><b>Modelo:</b></td>
            <td colspan="2" style="font-size: 7pt;">${autotransporte.IdentificacionVehicular.atributos.AnioModeloVM}</td>
        </tr>

        <tr>
            <td colspan="9" class="cabecera"><b>Remolques</b></td>
        </tr>
        <#if itemlista?is_sequence>
            <#list listaremolques as remolques>
                <tr style="border-bottom: 1px; border-color: #e3e3e3">
                    <td colspan="2" style="font-size: 7pt;"><b>Subtipo de Remolque:</b></td>
                    <td colspan="2" style="font-size: 7pt;">${remolques.atributos.SubTipoRem}</td>
                    <td colspan="2" style="font-size: 7pt;"><b>Placa:</b></td>
                    <td colspan="2" style="font-size: 7pt;">${remolques.atributos.Placa}</td>
                </tr>
            </#list>
        <#else>
            <tr>
                <td colspan="2" style="font-size: 7pt;"><b>Subtipo de Remolque:</b></td>
                <td colspan="2" style="font-size: 7pt;">${listaremolques.atributos.SubTipoRem}</td>
                <td colspan="2" style="font-size: 7pt;"><b>Placa:</b></td>
                <td colspan="2" style="font-size: 7pt;">${listaremolques.atributos.Placa}</td>
            </tr>
        </#if>

        <tr>
            <td colspan="9" class="cabecera"><b>Seguros</b></td>
        </tr>

        <tr>
            <td colspan="2" style="font-size: 7pt;"><b>Responsabilidad Civil:</b></td>
            <td colspan="2" style="font-size: 7pt;">${seguros.atributos.AseguraRespCivil}</td>
            <td colspan="2" style="font-size: 7pt;"><b>Poliza:</b></td>
            <td colspan="2" style="font-size: 7pt;">${seguros.atributos.PolizaRespCivil}</td>
        </tr>
        <#if seguros.atributos.AseguraMedAmbiente?has_content>
        <tr>
            <td colspan="2" style="font-size: 7pt;"><b>Medio Ambiente:</b></td>
            <td colspan="2" style="font-size: 7pt;">${seguros.atributos.AseguraMedAmbiente}</td>
            <td colspan="2" style="font-size: 7pt;"><b>Poliza:</b></td>
            <td colspan="2" style="font-size: 7pt;">${seguros.atributos.PolizaMedAmbiente}</td>
        </tr>
        </#if>
        <#if seguros.atributos.AseguraCarga?has_content>
        <tr>
            <td colspan="2" style="font-size: 7pt;"><b>Carga:</b></td>
            <td colspan="2" style="font-size: 7pt;">${seguros.atributos.AseguraCarga}</td>
            <td colspan="2" style="font-size: 7pt;"><b>Poliza:</b></td>
            <td colspan="2" style="font-size: 7pt;">${seguros.atributos.PolizaCarga}</td>
        </tr>
        </#if>
        <#--  <tr>
            <td colspan="2" style="font-size: 7pt;"><b>Prima del Seguro:</b></td>
            <td colspan="2" style="font-size: 7pt;">${seguros.atributos.PrimaSeguro}</td>
            <td colspan="2" style="font-size: 7pt;"></td>
            <td colspan="2" style="font-size: 7pt;"></td>
        </tr>  -->

        <tr>
            <td colspan="9" class="cabecera"><b>Figura de Transporte</b></td>
        </tr>

        <#if listafiguratransporte?is_sequence>
            <#list listafiguratransporte as figuratransporte>
                <tr>
                    <td colspan="2" style="font-size: 7pt;"><b>Tipo de Figura:</b></td>
                    <#assign tipofigura = "">
                    <#if figuratransporte.atributos.TipoFigura == "01">
                        <#assign tipofigura = "Operador">
                    </#if>
                    <#if figuratransporte.atributos.TipoFigura == "02">
                        <#assign tipofigura = "Propietario">
                    </#if>
                    <#if figuratransporte.atributos.TipoFigura == "03">
                        <#assign tipofigura = "Arrendador">
                    </#if>
                    <#if figuratransporte.atributos.TipoFigura == "04">
                        <#assign tipofigura = "Notificado">
                    </#if>
                    <td colspan="2" style="font-size: 7pt;">${tipofigura}</td>
                    <td colspan="2" style="font-size: 7pt;"><b>RFC:</b></td>
                    <td colspan="2" style="font-size: 7pt;">${figuratransporte.atributos.RFCFigura}</td>
                </tr>
                <tr style="border-bottom: 1px; border-color: #e3e3e3">
                    <td colspan="2" style="font-size: 7pt;"><b>Numero de Licencia:</b></td>
                    <td colspan="2" style="font-size: 7pt;">${figuratransporte.atributos.NumLicencia}</td>
                    <td colspan="2" style="font-size: 7pt;"><b>Nombre:</b></td>
                    <td colspan="2" style="font-size: 7pt;">${figuratransporte.atributos.NombreFigura}</td>
                </tr>
            </#list>
        <#else>
            <tr>
                <td colspan="2" style="font-size: 7pt;"><b>Tipo de Figura:</b></td>
                <#assign tipofigura = "">
                <#if listafiguratransporte.atributos.TipoFigura == "01">
                    <#assign tipofigura = "Operador">
                </#if>
                <#if listafiguratransporte.atributos.TipoFigura == "02">
                    <#assign tipofigura = "Propietario">
                </#if>
                <#if listafiguratransporte.atributos.TipoFigura == "03">
                    <#assign tipofigura = "Arrendador">
                </#if>
                <#if listafiguratransporte.atributos.TipoFigura == "04">
                    <#assign tipofigura = "Notificado">
                </#if>
                <td colspan="2" style="font-size: 7pt;">${tipofigura}</td>
                <td colspan="2" style="font-size: 7pt;"><b>RFC:</b></td>
                <td colspan="2" style="font-size: 7pt;">${listafiguratransporte.atributos.RFCFigura}</td>
            </tr>
            <tr>
                <td colspan="2" style="font-size: 7pt;"><b>Numero de Licencia:</b></td>
                <td colspan="2" style="font-size: 7pt;">${listafiguratransporte.atributos.NumLicencia}</td>
                <td colspan="2" style="font-size: 7pt;"><b>Nombre:</b></td>
                <td colspan="2" style="font-size: 7pt;">${listafiguratransporte.atributos.NombreFigura}</td>
            </tr>
        </#if>

    </table>
</#if>
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
    <#assign qrcodeImage = "data:image/png;base64, " + certData.custbody_mx_cfdi_qr_code >
    <table class="total" style="width: 100%; margin-top: 10px; border: 1px; border-color: #e3e3e3;">
        <tr>
            <td class="cabecera" colspan="8"><b>Información CFDI</b></td>
        </tr>
        <tr>
            <td style="font-size:7px;" rowspan="3" width=" 72px" colspan="1">
                <img style="width: 70px;height:70px" src="${qrcodeImage}"/>
            </td>
        </tr>
        <tr>
            <td style="font-size:5px;" rowspan="3" width=" 72px" colspan="7">
                <p style="font-size:5px;"><b>UUID: </b>${certData.custbody_mx_cfdi_uuid}</p>
                <p style="font-size:5px;"><b>Cadena original</b><br/>${certData.custbody_mx_cfdi_cadena_original}
                </p>
                <p style="font-size:5px;"><b>Firma del CFDI</b><br/>${certData.custbody_mx_cfdi_signature}</p>
                <p style="font-size:5px;" rowspan="1"><b>Firma del
                        SAT</b><br/>${certData.custbody_mx_cfdi_sat_signature}</p>
            </td>
        </tr>
    </table>
</#if>



</body>
</pdf>