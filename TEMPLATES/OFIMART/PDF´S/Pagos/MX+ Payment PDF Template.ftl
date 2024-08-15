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
<#assign addressCancelado=''>
<#if record.custbody_efx_fe_cfdi_cancelled== true >
<#assign addressCancelado= 'PAGO CANCELADO'>
</#if>

<macrolist>
    <macro id="watermark">
        <p
                id="watermarkbody"
                rotate="-30"
                valign="middle"
                align="center"
                class="cancelada">
            ${addressCancelado}
        </p>
    </macro>
    <macro id="nlheader">
        <table class="header" height="70px" style="width: 100%;">
            <tr height="70px">

                <td colspan="6" height="70px">
                    <#if subsidiary?has_content>
                        <#if subsidiary.logo?has_content> 
                            <#assign "urldir" = subsidiary.logo@url>
                            <img width="100" height="65" src="${urldir}"/>
                        </#if>|
                    <#elseif companyInformation.formlogo?has_content>
                        <#assign "urldir" = companyInformation.logoUrl>
                         <img width="100" height="65" src="${urldir}"/>
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

                          <!-- style="font-size: 9px;"><#if record.custbody_efx_fe_gbl_diremisor?has_content>${record.custbody_efx_fe_gbl_diremisor}<#else><#if record.custbody_efx_fe_info_location_pdf == true>${record.custbody_efx_fe_dirloc}<#else>${record.custbody_efx_fe_dirsubs}</#if></#if></span> -->

                </td>
                <td colspan="1">&nbsp;</td>
                <td colspan="4" style="font-size: 10px;" align="right"><span style="font-size: 20px; color:#14B6C6"><strong>PAGO</strong></span><br/>
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
        <table class="footer" style="width: 100%;"><tr>
            <td style="width: 40%;"><barcode codetype="code128" showtext="true" value="${record.tranid}" height="30px"/></td>
            <#if uso_cfdi == "CP01">
            <td style="width: 40%;">Este documento es una representación impresa de un CFDI 4.0</td>
            <#else>
            <td style="width: 40%;">Este documento es una representación impresa de un CFDI 3.3</td>
            </#if>
            <td align="right" style="width: 20%;"><pagenumber/> de <totalpages/></td>
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

td.cabecera, th.cabecera{
    color: #000000;
    font-size: 8pt;
    background-color: #e3e3e3;
    padding: 2px;
}

td.cabecerapequenia, th.cabecerapequenia{
    color: #000000;
    font-size: 8pt;
    background-color: #e3e3e3;
    padding: 4px;
}

td.cuerposinfogeneral{
    border: 1px;
    border-color: #e3e3e3;
    padding:2px;
    font-size: 8pt;
}

td.cuerposnoarticulos{
    padding:2px;
    font-size: 7pt;
}

td.cuerposarticulos{
    border-right: 1px;
    border-color: #e3e3e3;
    font-size: 8px
}
td.cuerposarticulos:last-child{
    border-right: 0px;
}
table.tablascompletas{
    width: 100%;
    margin-top: 10px;
    border: 1px;
    border-color: #e3e3e3
}
td.cuerpotablaetiqueta{
    font-size: 8pt;
    padding:1px 3px 0px 1px;
}
td.cuerpotablainfo{
    font-size: 8pt;
    padding:1px 1px 0px 1px;
}
</style>
</head>
<body header="nlheader" header-height="8%" footer="nlfooter" footer-height="20pt" padding="0.2in 0.5in 0.25in 0.5in" size="Letter">
<!--<table class="header" style="width: 100%;"><tr>
<td rowspan="3">
<img src="${subsidiary.logo@url}" style="float: left; margin: 7px; width: 175;height: 50"/>
 <br />
</td>
<td align="right" colspan="2"><span class="title">Pago #${record.tranid}</span></td>
</tr>
</table>-->
<#assign serie_parteuno = "">
<#assign folio_transaction = "">
<#assign tranidd = record.tranid?length - 1>
<#assign traniddpos = record.tranid>
<#list 0..tranidd as x>
<#if traniddpos[x] != "-">
<#assign esnum = traniddpos[x]?matches("\\d+")>
<#if esnum>
<#assign folio_transaction = folio_transaction+traniddpos[x]>
<#else>
<#assign serie_parteuno = serie_parteuno+traniddpos[x]>
</#if>
</#if>
</#list>


<table style="width:100%;">
    <tr>
        <td colspan= "1">
            <table  style="width:100%;">
                <tr>
                    <th>Emisor</th>
                </tr>
        <#if dataXML?has_content>
        <tr>
            <td font-size="8pt"><b >Razón social:</b>${dataXML.Emisor.atributos.Nombre} </td>
            </tr>
            <tr>
                <td font-size="8pt"><b >RFC:</b>${dataXML.Emisor.atributos.Rfc}</td>
            </tr>
            <tr>
                <td font-size="8pt"><b >Domicilio fiscal:</b> ${record.custbody_efx_fe_dirsubs?replace(dataXML.Emisor.atributos.Nombre, "")?replace(dataXML.Emisor.atributos.Rfc, "")}
                </td>
        </tr>
        <#else>
                <#if customCompanyInfo?has_content>
                <#assign rfc = record.custbody_efx_fe_dirsubs?keep_after_last(" ")?replace("/>", "")>
                <tr>
                    <td font-size="8pt"><b >Razón social:</b>${customCompanyInfo.legalname} </td>
                </tr>
                <tr>
                    <td font-size="8pt"><b >RFC:</b>${rfc}</td>
                </tr>
                <tr>
                    <td font-size="8pt"><b >Domicilio fiscal:</b> ${record.custbody_efx_fe_dirsubs?replace(customCompanyInfo.legalname, "")?replace(rfc, "")}
                    </td>
                </tr>
            
            <#else>
                <tr>
                    <td font-size="8pt"><b >Razón social:</b> ${subsidiary.legalname}</td>
                </tr>
                <tr>
                    <td font-size="8pt"><b >RFC:</b> ${subsidiary.federalidnumber}</td>
                </tr>
                <tr>
                    <td font-size="8pt"><b >Domicilio fiscal:</b>
                        ${subsidiary.mainaddress_text?replace(subsidiary.legalname, "")}
                    </td>
                </tr>
            </#if>
        </#if>
            
</table>
</td>
<td colspan= "1">
    <table style="width:100%;">
        <thead>
        <tr>
            <th>Receptor</th>
        </tr>
        </thead>
        <#if record.custbody_efx_fe_chbx_factorage==true>
        <tr>

            <td font-size="8pt"><b>Razón social:</b> ${record.custbody_efx_fe_factoraje_receptor}</td>
        </tr>
        <tr>
            <td font-size="8pt"><b>RFC:</b> ${record.custbody_efx_fe_factoraje_rfc}</td>
        </tr>
        <#assign uso_cfdi = record.custbody_mx_cfdi_usage>
        <tr>
            <#if uso_cfdi == "P01">
                <td font-size="8pt"><b>Uso CFDI:</b> P01 - Por Definir</td>

            <#elseif uso_cfdi == "CP01">
                <td font-size="8pt"><b>Uso CFDI:</b> CP01 - PAGOS</td>

            <#else>
                <td font-size="8pt"></td>
            </#if>
        </tr>
        <tr>
            <td font-size="8pt"><b>Domicilio fiscal:</b> ${record.custbody_efx_fe_factoraje_dir?upper_case}</td>
        </tr>
        <#else>
        <tr>
            <#if record.customer.custentity_mx_sat_registered_name?has_content>
                <td font-size="8pt"><b>Razón social:</b> ${record.customer.custentity_mx_sat_registered_name}</td>
            <#else>
              <td font-size="8pt"><b>Razón social:</b> ${record.customer.companyname}</td>
            </#if>
        </tr>
        <tr>
            <td font-size="8pt"><b>RFC:</b> ${record.customer.custentity_mx_rfc}</td>
        </tr>
        <#if dataXML?has_content>
            <#assign uso_cfdi = dataXML.Receptor.atributos.UsoCFDI>
        <#else>
            <#assign uso_cfdi = record.custbody_mx_cfdi_usage?keep_before(" ")>
        </#if>
        <tr>
            <#if uso_cfdi == "P01">
                <td font-size="8pt"><b>Uso CFDI:</b> P01 - Por Definir</td>

            <#elseif uso_cfdi == "CP01">
                <td font-size="8pt"><b>Uso CFDI:</b> CP01 - PAGOS</td>

            <#else>
                <td font-size="8pt"></td>
            </#if>
        </tr>
        <tr>
            <td font-size="8pt"><b>Domicilio fiscal:</b> ${record.customer.billaddress?upper_case}</td>
        </tr>
        <#assign infoCliente = record.customer>
        <#if infoCliente.custentity_mx_sat_industry_type?has_content>
            <tr>
                <td font-size="8pt">
                    <b>Regimen Fiscal:</b> ${infoCliente.custentity_mx_sat_industry_type?upper_case}
                </td>
            </tr>
        </#if>
    </#if>
    </table>
</td>
<td colspan= "1">
    <table>
        <thead>
        <tr>
            <th align="left" scope="col">Datos fiscales</th>
            <th align="left" scope="col"><b>Recibo de pago</b></th>
        </tr>
        </thead>
        <tr>
            <td font-size="8pt"><b>Serie</b></td>
            <td font-size="8pt">${serie_parteuno}</td>
        </tr><tr>
        <td font-size="8pt"><b>Folio</b></td>
        <td font-size="8pt">${folio_transaction}</td>
    </tr><tr>
        <td font-size="8pt"><b>Tipo Comprobante</b></td>
        <td font-size="8pt">P Pago</td>
    </tr><tr>
        <td font-size="8pt"><b>Versión Comprobante</b></td>
        <#if uso_cfdi == "CP01">
        <td font-size="8pt">4.0</td>
        <#else>
        <td font-size="8pt">3.3</td>
        </#if>
    </tr><tr>
        <td font-size="8pt"><b>Moneda</b></td>
        <td font-size="8pt">XXX</td>
    </tr><tr>
        <td font-size="8pt"><b>No. Certificado CFDI</b></td>
        <#if certData?has_content>
        <td font-size="8pt">${certData.custbody_mx_cfdi_issuer_serial}</td>
        <#else>
        <td font-size="8pt">${record.custbody_mx_cfdi_issuer_serial}</td>
    </#if>

        </tr><tr>
        <#assign datearray = record.custbody_mx_cfdi_certify_timestamp?split("T")>
        <td font-size="8pt"><b>F. Certificación</b></td>
        <td font-size="8pt">
            <#if record.custbody_mx_cfdi_certify_timestamp?has_content>
            <#if datearray?size == 2 >
            <#assign dayarray = datearray[0]?split("-")>
            ${dayarray[2]}/${dayarray[1]}/${dayarray[0]} ${datearray[1]}
            <#else>
            ${record.custbody_mx_cfdi_certify_timestamp}
        </#if>
        <#else>
        <#if certData?has_content>
        ${certData.custbody_mx_cfdi_certify_timestamp}
    </#if>
    </#if>
</td>
</tr>
<tr>
            <td font-size="8pt"><b>Tipo de exportación:</b></td>
            <td font-size="8pt">01 - No aplica</td>
        </tr>

</table>
</td>
</tr>
</table>




<table class="body" style="width: 100%; margin-top: 10px;"><tr>
    <th align="left"><b>Régimen fiscal:</b></th>
    <th>UUID</th>
</tr>
    <tr>
        <#assign regfisc = record.subsidiary.custrecord_mx_sat_industry_type?keep_before(" ")>

        <#if regfisc == "601">
        <td>601 - General de Ley Personas Morales</td>
        <#elseif regfisc == "603">
        <td>603 - Personas Morales con Fines no Lucrativos</td>
        <#elseif regfisc == "605">
        <td>605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</td>
        <#elseif regfisc == "606">
        <td>606 - Arrendamiento</td>
        <#elseif regfisc == "607">
        <td>607 - Régimen de Enajenación o Adquisición de Bienes</td>
        <#elseif regfisc == "608">
        <td>608 - Demás ingresos</td>
        <#elseif regfisc == "609">
        <td>609 - Consolidación</td>
        <#elseif regfisc == "610">
        <td>610 - Residentes en el Extranjero sin Establecimiento Permanente en México</td>
        <#elseif regfisc == "611">
        <td>611 - Ingresos por Dividendos (socios y accionistas)</td>
        <#elseif regfisc == "612">
        <td>612 - Personas Físicas con Actividades Empresariales y Profesionales</td>
        <#elseif regfisc == "614">
        <td>614 - Ingresos por intereses</td>
        <#elseif regfisc == "615">
        <td>615 - Régimen de los ingresos por obtención de premios</td>
        <#elseif regfisc == "616">
        <td>616 - Sin obligaciones fiscales</td>
        <#elseif regfisc == "620">
        <td>620 - Sociedades Cooperativas de Producción que Optan por Diferir sus Ingresos</td>
        <#elseif regfisc == "621">
        <td>621 - Incorporación Fiscal</td>
        <#elseif regfisc == "622">
        <td>622 - Actividades Agrícolas, Ganaderas, Silvícolas Y Pesqueras</td>
        <#elseif regfisc == "623">
        <td>623 - Opcional para Grupos de Sociedades</td>
        <#elseif regfisc == "624">
        <td>624 - Coordinados</td>
        <#elseif regfisc == "628">
        <td>628 - Hidrocarburos</td>
        <#elseif regfisc == "629">
        <td>629 - De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales</td>
        <#elseif regfisc == "630">
        <td>630 - Enajenación de acciones en bolsa de valores</td>
        <#else>
        <td colspan="2" style="font-size: 7pt; padding: 2px;"></td>
    </#if>
    <td><#if record.custbody_mx_cfdi_uuid?has_content>${record.custbody_mx_cfdi_uuid}<#else><#if certData?has_content>${certData.custbody_mx_cfdi_uuid}</#if></#if></td>
</tr></table>


<#assign xml_datapay = record.custbody_efx_fe_xml_data_payment>
<#if xml_datapay?has_content>
<#assign xml_data_payment = xml_datapay?eval>
</#if>
<table class="itemtable" style="width: 100%; margin-top: 10px;">

    <tr>
        <td align="center" colspan="4" class="cabecera"><b>Cantidad</b></td>
        <td align="center" colspan="6" class="cabecera"><b>Clave <br/> ProdServ</b></td>
        <td align="center" colspan="6" class="cabecera"><b>Clave <br/> Unidad</b></td>
        <td align="center" colspan="7" class="cabecera"><b>Descripcion</b></td>
        <td align="center" colspan="6" class="cabecera"><b>Referencia</b></td>
        <td align="center" colspan="6" class="cabecera"><b>Pago</b></td>
        <td align="center" colspan="6" class="cabecera"><b>Valor<br/>Unitario</b></td>
        <td align="center" colspan="6" class="cabecera"><b>Importe</b></td>
        <td align="center" colspan="6" class="cabecera"><b>Objeto de impuestos</b></td>
    </tr>


    <tr style="vertical-align:baseline">

        <td align="center" colspan="4" line-height="150%">1</td>
        <td align="center" colspan="6" line-height="150%">84111506</td>
        <td align="center" colspan="6" line-height="150%">ACT</td>
        <td align="center" colspan="7" line-height="150%">Pago</td>
        <td align="center" colspan="6" line-height="150%">${record.memo}</td>
        <td align="right" colspan="6" line-height="150%">${record.total}</td>
        <td align="center" colspan="6" line-height="150%">0</td>
        <td align="center" colspan="6" line-height="150%">0</td>
        <td align="center" colspan="6" line-height="150%">01 - No aplica</td>
    </tr>



</table>

<table>
    <thead>
    <tr>
        <th font-size= "10pt"> Recepción de Pagos</th>
    </tr>
    </thead>
    <tr>
    <#if uso_cfdi == "CP01">
        <td align="left" colspan="5" line-height="150%">Versión: 2.0</td>
        <#else>
        <td align="left" colspan="5" line-height="150%">Versión: 1.0</td>
        </#if>
    </tr>
    <tr>
        <td align="left" colspan="4" ><b>Fecha de pago: </b></td>
        <td align="left" colspan="4" >${record.custbody_efx_fe_fechadepago}</td>
        <#if record.custbody_mx_cfdi_issuer_entity_rfc?has_content>
        <td align="left" colspan="4" ><b>RFC Emisor cuenta ordenante: </b></td>
        <td align="left" colspan="4" >${record.custbody_mx_cfdi_issuer_entity_rfc}</td>
    </#if>
    </tr>
    <tr>
        <td align="left" colspan="4" ><b>Forma de pago: </b></td>
        <#assign forma_pago = record.custbody_mx_txn_sat_payment_method?keep_before(" ")>
        <#if forma_pago == "01">
        <td align="left" colspan="4" >01 - EFECTIVO</td>
        <#elseif forma_pago == "02">
        <td align="left" colspan="4" >02 - CHEQUE NOMINATIVO</td>
        <#elseif forma_pago == "03">
        <td align="left" colspan="4" >03 - TRANSFERENCIA ELECTRÓNICA DE FONDOS</td>
        <#elseif forma_pago == "04">
        <td align="left" colspan="4" >04 - TARJETA DE CRÉDITO</td>
        <#elseif forma_pago == "05">
        <td align="left" colspan="4" >05 - MONEDERO ELECTRÓNICO</td>
        <#elseif forma_pago == "06">
        <td align="left" colspan="4" >06 - DINERO ELECTRÓNICO</td>
        <#elseif forma_pago == "07">
        <td align="left" colspan="4" >07 - TARJETAS DIGITALES</td>
        <#elseif forma_pago == "08">
        <td align="left" colspan="4" >08 - VALES DE DESPENSA</td>
        <#elseif forma_pago == "09">
        <td align="left" colspan="4" >09 - BIENES</td>
        <#elseif forma_pago == "10">
        <td align="left" colspan="4" >10 - SERVICIO</td>
        <#elseif forma_pago == "11">
        <td align="left" colspan="4" >11 - POR CUENTA DE TERCERO</td>
        <#elseif forma_pago == "12">
        <td align="left" colspan="4" >12 - DACIÓN EN PAGO</td>
        <#elseif forma_pago == "13">
        <td align="left" colspan="4" >13 - PAGO POR SUBROGACIÓN</td>
        <#elseif forma_pago == "14">
        <td align="left" colspan="4" >14 - PAGO POR CONSIGNACIÓN</td>
        <#elseif forma_pago == "15">
        <td align="left" colspan="4" >15 - CONDONACIÓN</td>
        <#elseif forma_pago == "16">
        <td align="left" colspan="4" >16 - CANCELACIÓN</td>
        <#elseif forma_pago == "17">
        <td align="left" colspan="4" >17 - COMPENSACIÓN</td>
        <#elseif forma_pago == "23">
        <td align="left" colspan="4" >23 - NOVACIÓN</td>
        <#elseif forma_pago == "24">
        <td align="left" colspan="4" >24 - CONFUSIÓN</td>
        <#elseif forma_pago == "25">
        <td align="left" colspan="4" >25 - REMISIÓN DE DEUDA</td>
        <#elseif forma_pago == "26">
        <td align="left" colspan="4" >26 - PRESCRIPCIÓN O CADUCIDAD</td>
        <#elseif forma_pago == "27">
        <td align="left" colspan="4" >27 - A SATISFACCIÓN DEL ACREEDOR</td>
        <#elseif forma_pago == "28">
        <td align="left" colspan="4" >28 - TARJETA DE DÉBITO</td>
        <#elseif forma_pago == "29">
        <td align="left" colspan="4" >29 - TARJETA DE SERVICIOS</td>
        <#elseif forma_pago == "30">
        <td align="left" colspan="4" >30 - APLICACIÓN DE ANTICIPOS</td>
        <#elseif forma_pago == "31">
        <td align="left" colspan="4" >31 - INTERMEDIARIO PAGOS</td>
        <#elseif forma_pago == "98">
        <td align="left" colspan="4" >98 - N/A</td>
        <#elseif forma_pago == "99">
        <td align="left" colspan="4" >99 - POR DEFINIR</td>
        <#else>
        <td align="left" colspan="4" ></td>
    </#if>
    <#if record.custbody_mx_cfdi_issue_bank_name?has_content>
    <td align="left" colspan="4" ><b>Nombre del banco ordenante: </b></td>
    <td align="left" colspan="4" >${record.custbody_mx_cfdi_issue_bank_name}</td>
</#if>
</tr>
<tr>
    <td align="left" colspan="4" ><b>Moneda de pago: </b></td>
    <td align="left" colspan="4" >${record.currency}</td>
    <#if record.custbody_mx_cfdi_payer_account?has_content>
    <td align="left" colspan="4" ><b>Cuenta ordenante: </b></td>
    <td align="left" colspan="4" >${record.custbody_mx_cfdi_payer_account}</td>
</#if>
</tr>
<tr>
    <td align="left" colspan="4" ><b>Tipo de cambio: </b></td>
    <td align="left" colspan="4" >${record.exchangerate}</td>
    <#if record.custbody_mx_cfdi_recipient_entity_rfc?has_content>
    <td align="left" colspan="4" ><b>RFC Emisor cuenta beneficiario: </b></td>
    <td align="left" colspan="4" >${record.custbody_mx_cfdi_recipient_entity_rfc}</td>
</#if>
</tr>
<tr>
    <td align="left" colspan="4" ><b>Monto: </b></td>
    <td align="left" colspan="4" >${record.total}</td>
    <#if record.custbody_mx_cfdi_recipient_account?has_content>
    <td align="left" colspan="4" ><b>Cuenta del beneficiario: </b></td>
    <td align="left" colspan="4" >${record.custbody_mx_cfdi_recipient_account}</td>
</#if>
</tr>
<tr>
    <td align="left" colspan="4" ><b>Número de operación: </b></td>
    <td align="left" colspan="4" >${record.internalid}</td>
</tr>
<tr>
    <td align="left" colspan="4" ><b>Recepción de pago: </b></td>
    <td align="left" colspan="4" >${record.trandate}</td>
</tr>

</table>

<#if custom?has_content>
    <#if custom.appliedTxns?has_content>
        <#assign documentTotal = 0>
        <#assign amountTotal = 0>
        <table class="itemtable" style="width: 100%; margin-top: 10px; margin-left: 10px; margin-right: 10px;">
                <#assign conteoPagos = 0>
                <#list custom.appliedTxns as appliedTxn>
                <#assign "txnitem" = record.apply[appliedTxn.line?number]>

                <#assign "invPaymentTerm" = satCodes.paymentTermInvMap["d"+appliedTxn.id]>
                <#if record.custbody_efx_fe_parcialidad?has_content>
                <#assign "parcialidad_f_eval" = record.custbody_efx_fe_parcialidad?eval>
                </#if>
                <#list parcialidad_f_eval as parcialidad_f>
                <#if txnitem.refnum == parcialidad_f.facturaRef>
                <#assign "nlineas" = conteoPagos>
                <tr style="margin-bottom:6px">
                    <td align="left" colspan="6" style="border-bottom:2px"><b>Documento Relacionado</b></td>
                </tr>
                <tr style="margin-top:6px">
                    <td align="left" colspan="1">ID del Documento:</td>
                    <td align="left" colspan="2">${appliedTxn.custbody_mx_cfdi_uuid}</td>
                    <td align="left" colspan="1">Parcialidad:</td>
                    <td align="right" colspan="2">
                        <#if record.custbody_efx_fe_parcialidad?has_content>
                        ${parcialidad_f.parcialidad}
                    </#if>
                    </td>

                </tr>
                <tr>
                    <td align="left" colspan="1">Serie/Folio:</td>
                    <td align="left" colspan="2">${parcialidad_f.facturaRef}</td>
                    <td align="left" colspan="1">Importe del Saldo Anterior:</td>

                    <#if record.custbody_efx_fe_chbx_factorage == true>
                    <#assign prevAmount = parcialidad_f.imp>
                    <#else>
                    <#assign prevAmount = parcialidad_f.imp>
                </#if>

            <td align="right" colspan="2">${fmtc(prevAmount)}</td>

            </tr>

            <tr>
                <td align="left" colspan="1" line-height="150%">Moneda:</td>
                <td align="left" colspan="2" line-height="150%">${appliedTxn.currencysymbol}</td>
                <td align="left" colspan="1" line-height="150%">Importe Pagado:</td>
                <td align="right" colspan="2" line-height="150%">${fmtc_NS(txnitem.amount)}</td>

            </tr>

            <tr>
                <td align="left" colspan="1">Tipo de Cambio:</td>
                <td align="left" colspan="2">${record.exchangerate}</td>
                <td align="left" colspan="1">Importe de Saldo Insoluto:</td>
                <#assign impinsoluto =  prevAmount - txnitem.amount>
                <td align="right" colspan="2">${fmtc(impinsoluto)}</td>

            </tr>
            <tr>
                <td align="left" colspan="1">Metodo de Pago:</td>
                <td align="left" colspan="2">
                    <#if invPaymentTerm == 'PPD'>PPD - PAGO EN PARCIALIDADES O DIFERIDO</#if>
                <#if invPaymentTerm == 'PUE'>PUE - PAGO EN UNA SOLA EXHIBICIÓN</#if>
            </td>
            <td align="left" colspan="1">Forma de pago:</td>
            <#assign forma_pago = record.custbody_mx_txn_sat_payment_method?keep_before(" ")>
            <#if forma_pago == "01">
            <td align="right" colspan="2">01 - EFECTIVO</td>
            <#elseif forma_pago == "02">
            <td align="right" colspan="2">02 - CHEQUE NOMINATIVO</td>
            <#elseif forma_pago == "03">
            <td align="right" colspan="2">03 - TRANSFERENCIA ELECTRÓNICA DE FONDOS</td>
            <#elseif forma_pago == "04">
            <td align="right" colspan="2">04 - TARJETA DE CRÉDITO</td>
            <#elseif forma_pago == "05">
            <td align="right" colspan="2">05 - MONEDERO ELECTRÓNICO</td>
            <#elseif forma_pago == "06">
            <td align="right" colspan="2">06 - DINERO ELECTRÓNICO</td>
            <#elseif forma_pago == "07">
            <td align="right" colspan="2">07 - TARJETAS DIGITALES</td>
            <#elseif forma_pago == "08">
            <td align="right" colspan="2">08 - VALES DE DESPENSA</td>
            <#elseif forma_pago == "09">
            <td align="right" colspan="2">09 - BIENES</td>
            <#elseif forma_pago == "10">
            <td align="right" colspan="2">10 - SERVICIO</td>
            <#elseif forma_pago == "11">
            <td align="right" colspan="2">11 - POR CUENTA DE TERCERO</td>
            <#elseif forma_pago == "12">
            <td align="right" colspan="2">12 - DACIÓN EN PAGO</td>
            <#elseif forma_pago == "13">
            <td align="right" colspan="2">13 - PAGO POR SUBROGACIÓN</td>
            <#elseif forma_pago == "14">
            <td align="right" colspan="2">14 - PAGO POR CONSIGNACIÓN</td>
            <#elseif forma_pago == "15">
            <td align="right" colspan="2">15 - CONDONACIÓN</td>
            <#elseif forma_pago == "16">
            <td align="right" colspan="2">16 - CANCELACIÓN</td>
            <#elseif forma_pago == "17">
            <td align="right" colspan="2">17 - COMPENSACIÓN</td>
            <#elseif forma_pago == "23">
            <td align="right" colspan="2">23 - NOVACIÓN</td>
            <#elseif forma_pago == "24">
            <td align="right" colspan="2">24 - CONFUSIÓN</td>
            <#elseif forma_pago == "25">
            <td align="right" colspan="2">25 - REMISIÓN DE DEUDA</td>
            <#elseif forma_pago == "26">
            <td align="right" colspan="2">26 - PRESCRIPCIÓN O CADUCIDAD</td>
            <#elseif forma_pago == "27">
            <td align="right" colspan="2">27 - A SATISFACCIÓN DEL ACREEDOR</td>
            <#elseif forma_pago == "28">
            <td align="right" colspan="2">28 - TARJETA DE DÉBITO</td>
            <#elseif forma_pago == "29">
            <td align="right" colspan="2">29 - TARJETA DE SERVICIOS</td>
            <#elseif forma_pago == "30">
            <td align="right" colspan="2">30 - APLICACIÓN DE ANTICIPOS</td>
            <#elseif forma_pago == "31">
            <td align="right" colspan="2">31 - INTERMEDIARIO PAGOS</td>
            <#elseif forma_pago == "98">
            <td align="right" colspan="2">98 - N/A</td>
            <#elseif forma_pago == "99">
            <td align="right" colspan="2">99 - POR DEFINIR</td>
            <#else>
            <td align="right" colspan="2"></td>
            </#if>
            </tr>
            <tr>
                <td align="left" colspan="1">Objeto de impuestos:</td>
                <td align="left" colspan="1">02 - SÍ OBJETO DE IMPUESTO.</td>
            </tr>
            
            <#assign conteoPagos = conteoPagos+1>

            </#if>
            </#list>
            </#list>
            <#if record.custbody_efx_fe_chbx_factorage == true>
            <!-- Factoraje -->
            <#list custom.appliedTxns as appliedTxn>

            <#assign "txnitem" = record.apply[appliedTxn.line?number]>
            <#if record.custbody_efx_fe_parcialidad?has_content>
            <#assign "parcialidad_f_eval" = record.custbody_efx_fe_parcialidad?eval>
            <#assign "parcialidad_f" = parcialidad_f_eval[nlineas]>
            </#if>
            <#assign "invPaymentTerm" = satCodes.paymentTermInvMap["d"+appliedTxn.id]>
            <tr style="margin-bottom:6px">
                <td align="left" colspan="6" style="border-bottom:2px"><b>Documento Relacionado</b></td>

            </tr>
            <tr style="margin-top:6px">
                <td align="left" colspan="1">ID del Documento:</td>
                <td align="left" colspan="2">${appliedTxn.custbody_mx_cfdi_uuid}</td>
                <td align="left" colspan="1">Parcialidad:</td>
                <td align="right" colspan="2">
                    <#if record.custbody_efx_fe_parcialidad?has_content>
                    ${parcialidad_f.parcialidad?number + 1}
                </#if>
                </td>

            </tr>
            <tr>
                <td align="left" colspan="1">Serie/Folio:</td>
                <td align="left" colspan="2">${parcialidad_f.facturaRef}</td>
                <td align="left" colspan="1">Importe del Saldo Anterior:</td>
                <td align="right" colspan="2">${fmtc_NS(txnitem.disc)}</td>

            </tr>

            <tr>
                <td align="left" colspan="1" line-height="150%">Moneda:</td>
                <td align="left" colspan="2" line-height="150%">${appliedTxn.currencysymbol}</td>
                <td align="left" colspan="1" line-height="150%">Importe Pagado:</td>
                <td align="right" colspan="2" line-height="150%">${fmtc_NS(txnitem.disc)}</td>

            </tr>

            <tr>
                <td align="left" colspan="1">Tipo de Cambio:</td>
                <td align="left" colspan="2">${record.exchangerate}</td>
                <td align="left" colspan="1">Importe de Saldo Insoluto:</td>
                <td align="right" colspan="2">0.00</td>

            </tr>
            <tr>
                <td align="left" colspan="1">Metodo de Pago:</td>
                <td align="left" colspan="2">
                    <#if invPaymentTerm == 'PPD'>PPD - PAGO EN PARCIALIDADES O DIFERIDO</#if>
                <#if invPaymentTerm == 'PUE'>PUE - PAGO EN UNA SOLA EXHIBICIÓN</#if>
            </td>
            <td align="left" colspan="1">Forma de pago:</td>
            <td align="right" colspan="2">17 - COMPENSACIÓN</td>

            </tr>
            </#list>
            </#if>

        </table>
        <table style="width:100%;">
            <tr style="border-top:2px;">
                <td align="right" colspan="10" style="width:80%"><b>Subtotal</b></td>
                <td align="right" colspan="3" style="width:20%">0.00</td>
            </tr>
            <tr >
                <td align="right" colspan="10" style="width:80%"><b>Total</b></td>
                <td align="right" colspan="3" style="width:20%">0.00</td>
            </tr>
        </table>
    <#else>
        <#if dataXML?has_content>
            <#assign documentTotal = 0>
            <#assign amountTotal = 0>
                <#if dataXML.Complemento.Pagos.Pago.DoctoRelacionado?is_sequence>
                    <table class="itemtable" style="width: 100%; margin-top: 10px; margin-left: 10px; margin-right: 10px;">
                            <#list dataXML.Complemento.Pagos.Pago.DoctoRelacionado as doctoRelacionado>
                            <tr style="margin-bottom:6px">
                                <td align="left" colspan="6" style="border-bottom:2px"><b>Documento Relacionado</b></td>
                            </tr>
                            
                                <tr style="margin-top:6px">
                                    <td align="left" colspan="1">ID del Documento:</td>
                                    <td align="left" colspan="2">${doctoRelacionado.atributos.IdDocumento}</td>
                                    <td align="left" colspan="1">Parcialidad:</td>
                                    <td align="right" colspan="2">${doctoRelacionado.atributos.NumParcialidad}            </td>
                                </tr>
                                <tr>
                                    <td align="left" colspan="1">Serie/Folio:</td>
                                    <td align="left" colspan="2">${doctoRelacionado.atributos.Serie}-${doctoRelacionado.atributos.Folio}</td>
                                    <td align="left" colspan="1">Importe del Saldo Anterior:</td>
                                    <td align="right" colspan="2">${doctoRelacionado.atributos.ImpSaldoAnt}</td>
                            </tr>

                            <tr>
                                <td align="left" colspan="1" line-height="150%">Moneda:</td>
                                <td align="left" colspan="2" line-height="150%">${doctoRelacionado.atributos.MonedaDR}</td>
                                <td align="left" colspan="1" line-height="150%">Importe Pagado:</td>
                                <td align="right" colspan="2" line-height="150%">${doctoRelacionado.atributos.ImpPagado}</td>

                            </tr>

                            <tr>
                                <td align="left" colspan="1">Tipo de Cambio:</td>
                                <td align="left" colspan="2">${record.exchangerate}</td>
                                <td align="left" colspan="1">Importe de Saldo Insoluto:</td>
                                <td align="right" colspan="2">${doctoRelacionado.atributos.ImpSaldoInsoluto}</td>

                            </tr>
                            <tr>
                                <#if doctoRelacionado.atributos.MetodoDePagoDR?has_content>
                                <td align="left" colspan="1">Metodo de Pago:</td>
                                <td align="left" colspan="2">
                                    <#if doctoRelacionado.atributos.MetodoDePagoDR == 'PPD'>PPD - PAGO EN PARCIALIDADES O DIFERIDO</#if>
                                <#if doctoRelacionado.atributos.MetodoDePagoDR == 'PUE'>PUE - PAGO EN UNA SOLA EXHIBICIÓN</#if>
                            
                            </td>
                                
                                <#else>
                                  <td align="left" colspan="1"></td>
                                <td align="left" colspan="2"></td>
                                </#if>
                            <td align="left" colspan="1">Forma de pago:</td>
                            <#assign forma_pago = record.custbody_mx_txn_sat_payment_method?keep_before(" ")>
                            <#if forma_pago == "01">
                            <td align="right" colspan="2">01 - EFECTIVO</td>
                            <#elseif forma_pago == "02">
                            <td align="right" colspan="2">02 - CHEQUE NOMINATIVO</td>
                            <#elseif forma_pago == "03">
                            <td align="right" colspan="2">03 - TRANSFERENCIA ELECTRÓNICA DE FONDOS</td>
                            <#elseif forma_pago == "04">
                            <td align="right" colspan="2">04 - TARJETA DE CRÉDITO</td>
                            <#elseif forma_pago == "05">
                            <td align="right" colspan="2">05 - MONEDERO ELECTRÓNICO</td>
                            <#elseif forma_pago == "06">
                            <td align="right" colspan="2">06 - DINERO ELECTRÓNICO</td>
                            <#elseif forma_pago == "07">
                            <td align="right" colspan="2">07 - TARJETAS DIGITALES</td>
                            <#elseif forma_pago == "08">
                            <td align="right" colspan="2">08 - VALES DE DESPENSA</td>
                            <#elseif forma_pago == "09">
                            <td align="right" colspan="2">09 - BIENES</td>
                            <#elseif forma_pago == "10">
                            <td align="right" colspan="2">10 - SERVICIO</td>
                            <#elseif forma_pago == "11">
                            <td align="right" colspan="2">11 - POR CUENTA DE TERCERO</td>
                            <#elseif forma_pago == "12">
                            <td align="right" colspan="2">12 - DACIÓN EN PAGO</td>
                            <#elseif forma_pago == "13">
                            <td align="right" colspan="2">13 - PAGO POR SUBROGACIÓN</td>
                            <#elseif forma_pago == "14">
                            <td align="right" colspan="2">14 - PAGO POR CONSIGNACIÓN</td>
                            <#elseif forma_pago == "15">
                            <td align="right" colspan="2">15 - CONDONACIÓN</td>
                            <#elseif forma_pago == "16">
                            <td align="right" colspan="2">16 - CANCELACIÓN</td>
                            <#elseif forma_pago == "17">
                            <td align="right" colspan="2">17 - COMPENSACIÓN</td>
                            <#elseif forma_pago == "23">
                            <td align="right" colspan="2">23 - NOVACIÓN</td>
                            <#elseif forma_pago == "24">
                            <td align="right" colspan="2">24 - CONFUSIÓN</td>
                            <#elseif forma_pago == "25">
                            <td align="right" colspan="2">25 - REMISIÓN DE DEUDA</td>
                            <#elseif forma_pago == "26">
                            <td align="right" colspan="2">26 - PRESCRIPCIÓN O CADUCIDAD</td>
                            <#elseif forma_pago == "27">
                            <td align="right" colspan="2">27 - A SATISFACCIÓN DEL ACREEDOR</td>
                            <#elseif forma_pago == "28">
                            <td align="right" colspan="2">28 - TARJETA DE DÉBITO</td>
                            <#elseif forma_pago == "29">
                            <td align="right" colspan="2">29 - TARJETA DE SERVICIOS</td>
                            <#elseif forma_pago == "30">
                            <td align="right" colspan="2">30 - APLICACIÓN DE ANTICIPOS</td>
                            <#elseif forma_pago == "31">
                            <td align="right" colspan="2">31 - INTERMEDIARIO PAGOS</td>
                            <#elseif forma_pago == "98">
                            <td align="right" colspan="2">98 - N/A</td>
                            <#elseif forma_pago == "99">
                            <td align="right" colspan="2">99 - POR DEFINIR</td>
                            <#else>
                            <td align="right" colspan="2"></td>
                            </#if>


                            </tr>
                        </#list>
                    </table>
                <#else>
                        <table class="itemtable" style="width: 100%; margin-top: 10px; margin-left: 10px; margin-right: 10px;">
                            
                            <tr style="margin-bottom:6px">
                                <td align="left" colspan="6" style="border-bottom:2px"><b>Documento Relacionado</b></td>
                            </tr>
                            <tr style="margin-top:6px">
                                <td align="left" colspan="1">ID del Documento:</td>
                                <td align="left" colspan="2">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.IdDocumento}</td>
                                <td align="left" colspan="1">Parcialidad:</td>
                                <td align="right" colspan="2">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.NumParcialidad}            </td>
                            </tr>
                            <tr>
                                <td align="left" colspan="1">Serie/Folio:</td>
                                <td align="left" colspan="2">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.Serie}-${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.Folio}</td>
                                <td align="left" colspan="1">Importe del Saldo Anterior:</td>
                                <td align="right" colspan="2">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.ImpSaldoAnt}</td>
                        </tr>

                        <tr>
                            <td align="left" colspan="1" line-height="150%">Moneda:</td>
                            <td align="left" colspan="2" line-height="150%">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.MonedaDR}</td>
                            <td align="left" colspan="1" line-height="150%">Importe Pagado:</td>
                            <td align="right" colspan="2" line-height="150%">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.ImpPagado}</td>

                        </tr>

                        <tr>
                            <td align="left" colspan="1">Tipo de Cambio:</td>
                            <td align="left" colspan="2">${record.exchangerate}</td>
                            <td align="left" colspan="1">Importe de Saldo Insoluto:</td>
                            <td align="right" colspan="2">${dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.ImpSaldoInsoluto}</td>

                        </tr>
                        <tr>
                            <#if dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.MetodoDePagoDR?has_content>
                            <td align="left" colspan="1">Metodo de Pago:</td>
                            <td align="left" colspan="2">
                                <#if dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.MetodoDePagoDR == 'PPD'>PPD - PAGO EN PARCIALIDADES O DIFERIDO</#if>
                            <#if dataXML.Complemento.Pagos.Pago.DoctoRelacionado.atributos.MetodoDePagoDR == 'PUE'>PUE - PAGO EN UNA SOLA EXHIBICIÓN</#if>
                            
                        </td>
                            <#else>
                              <td align="left" colspan="1"></td>
                            <td align="left" colspan="2"></td>
                            </#if>
                        <td align="left" colspan="1">Forma de pago:</td>
                        <#assign forma_pago = record.custbody_mx_txn_sat_payment_method?keep_before(" ")>
                        <#if forma_pago == "01">
                        <td align="right" colspan="2">01 - EFECTIVO</td>
                        <#elseif forma_pago == "02">
                        <td align="right" colspan="2">02 - CHEQUE NOMINATIVO</td>
                        <#elseif forma_pago == "03">
                        <td align="right" colspan="2">03 - TRANSFERENCIA ELECTRÓNICA DE FONDOS</td>
                        <#elseif forma_pago == "04">
                        <td align="right" colspan="2">04 - TARJETA DE CRÉDITO</td>
                        <#elseif forma_pago == "05">
                        <td align="right" colspan="2">05 - MONEDERO ELECTRÓNICO</td>
                        <#elseif forma_pago == "06">
                        <td align="right" colspan="2">06 - DINERO ELECTRÓNICO</td>
                        <#elseif forma_pago == "07">
                        <td align="right" colspan="2">07 - TARJETAS DIGITALES</td>
                        <#elseif forma_pago == "08">
                        <td align="right" colspan="2">08 - VALES DE DESPENSA</td>
                        <#elseif forma_pago == "09">
                        <td align="right" colspan="2">09 - BIENES</td>
                        <#elseif forma_pago == "10">
                        <td align="right" colspan="2">10 - SERVICIO</td>
                        <#elseif forma_pago == "11">
                        <td align="right" colspan="2">11 - POR CUENTA DE TERCERO</td>
                        <#elseif forma_pago == "12">
                        <td align="right" colspan="2">12 - DACIÓN EN PAGO</td>
                        <#elseif forma_pago == "13">
                        <td align="right" colspan="2">13 - PAGO POR SUBROGACIÓN</td>
                        <#elseif forma_pago == "14">
                        <td align="right" colspan="2">14 - PAGO POR CONSIGNACIÓN</td>
                        <#elseif forma_pago == "15">
                        <td align="right" colspan="2">15 - CONDONACIÓN</td>
                        <#elseif forma_pago == "16">
                        <td align="right" colspan="2">16 - CANCELACIÓN</td>
                        <#elseif forma_pago == "17">
                        <td align="right" colspan="2">17 - COMPENSACIÓN</td>
                        <#elseif forma_pago == "23">
                        <td align="right" colspan="2">23 - NOVACIÓN</td>
                        <#elseif forma_pago == "24">
                        <td align="right" colspan="2">24 - CONFUSIÓN</td>
                        <#elseif forma_pago == "25">
                        <td align="right" colspan="2">25 - REMISIÓN DE DEUDA</td>
                        <#elseif forma_pago == "26">
                        <td align="right" colspan="2">26 - PRESCRIPCIÓN O CADUCIDAD</td>
                        <#elseif forma_pago == "27">
                        <td align="right" colspan="2">27 - A SATISFACCIÓN DEL ACREEDOR</td>
                        <#elseif forma_pago == "28">
                        <td align="right" colspan="2">28 - TARJETA DE DÉBITO</td>
                        <#elseif forma_pago == "29">
                        <td align="right" colspan="2">29 - TARJETA DE SERVICIOS</td>
                        <#elseif forma_pago == "30">
                        <td align="right" colspan="2">30 - APLICACIÓN DE ANTICIPOS</td>
                        <#elseif forma_pago == "31">
                        <td align="right" colspan="2">31 - INTERMEDIARIO PAGOS</td>
                        <#elseif forma_pago == "98">
                        <td align="right" colspan="2">98 - N/A</td>
                        <#elseif forma_pago == "99">
                        <td align="right" colspan="2">99 - POR DEFINIR</td>
                        <#else>
                        <td align="right" colspan="2"></td>
                        </#if>


                        </tr>
                    </table>
                </#if>


            <table style="width:100%;">
                <tr style="border-top:2px;">
                    <td align="right" colspan="10" style="width:80%"><b>Subtotal</b></td>
                    <td align="right" colspan="3" style="width:20%">0.00</td>
                </tr>
                <tr >
                    <td align="right" colspan="10" style="width:80%"><b>Total</b></td>
                    <td align="right" colspan="3" style="width:20%">0.00</td>
                </tr>
            </table>
        </#if>
    </#if>
</#if>





<#if certData?has_content>
<#if record.recmachcustrecord_mx_rcs_orig_trans?has_content>
<table style="width:100%; margin-top:5px; border: 1px;border-color:#e3e3e3;">
    <tr>
        <td align="center" colspan="2" class="cabecera"><b>Pago Relacionado</b></td>
        <td align="center" colspan="2" class="cabecera"><b>UUID</b></td>
        <td align="center" colspan="2" class="cabecera"><b>Tipo de relación</b></td>
    </tr>
    <#list record.recmachcustrecord_mx_rcs_orig_trans as cfdiRel>
    <tr>
        <td align="center" colspan="2" style="padding:2px">${cfdiRel.custrecord_mx_rcs_rel_cfdi?keep_after("#")}</td>
        <td align="center" colspan="2" style="padding:2px">${cfdiRel.custrecord_mx_rcs_uuid}</td>
        <td align="center" colspan="2" style="padding:2px">${cfdiRel.custrecord_mx_rcs_rel_type}</td>
    </tr>

</#list>

</table>
</#if>
<table class="tablascompletas" style="margin-top:5px;"><tr>
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
            <img style="width: 70px;height:70px" src="${qrcodeImage}" />
        </td>
    </tr>
    <tr>
        <td style="font-size:5px;" rowspan="3" width=" 72px" colspan="7">
            <p style="font-size:7pt;" ><b>UUID: </b>${certData.custbody_mx_cfdi_uuid}</p>
            <p style="font-size:5px;" ><b>Cadena original</b><br/>${certData.custbody_mx_cfdi_cadena_original}</p>
            <p style="font-size:5px;"  ><b>Firma del CFDI</b><br/>${certData.custbody_mx_cfdi_signature}</p>
            <p style="font-size:5px;" rowspan="1" ><b>Firma del SAT</b><br/>${certData.custbody_mx_cfdi_sat_signature}</p>
        </td>
    </tr>
</table>
</#if>

</body>
</pdf>