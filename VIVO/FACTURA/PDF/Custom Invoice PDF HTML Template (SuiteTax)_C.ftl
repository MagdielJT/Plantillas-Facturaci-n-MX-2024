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
        <macro id="nlheader" style='width: 100%'>
            <table class="header" height="70px" style="width: 100%;">
				<tr height="70px" >
					<td colspan="4" style='border-bottom:1px; border-top:1px;'>
						<#if record.custbody_efx_fe_logosub?has_content>
							<#assign "dominio" = "https://system.netsuite.com">
							<#assign "urldir" = "https://system.netsuite.com"+record.custbody_efx_fe_logosub>
							<img width="140" height="70" src="${urldir}"/>
						<#else>
							<div class='imagenClase' align='center' vertical-align='middle'>${subsidiary.logo}</div>
						</#if>
					</td>
					<td colspan="5" style='border-bottom:1px; border-top:1px;'>	
						<span style='font-size: 9pt;'>
							<#if dataXML?has_content>
								${dataXML.Emisor.atributos.Nombre}<br />
								${dataXML.Emisor.atributos.Rfc}
							<#else>
								${subsidiary.name}<br />
								BIL201127AK6
							</#if>
						</span>
						<br />
						<span style='font-size: 7pt;'>
							<b>REGIMEN FISCAL:</b><br />
							<#if dataXML?has_content>
								<#assign regFiscalXML = dataXML.Receptor.atributos.RegimenFiscalReceptor>
								<#assign regFiscal = ''>
								<#if regFiscalXML == '605'>
									<#assign regFiscal = '605	- Sueldos y Salarios e Ingresos Asimilados a Salarioslarios'>
								</#if>
								<#if regFiscalXML == '606'>
									<#assign regFiscal = '606	- Arrendamiento'>
								</#if>
								<#if regFiscalXML == '608'>
									<#assign regFiscal = '608	- Demás ingresos'>
								</#if>
								<#if regFiscalXML == '611'>
									<#assign regFiscal = '611	- Ingresos por Dividendos (socios y accionistas)'>
								</#if>
								<#if regFiscalXML == '612'>
									<#assign regFiscal = '612	- Personas Físicas con Actividades Empresariales y Profesionales'>
								</#if>
								<#if regFiscalXML == '614'>
									<#assign regFiscal = '614	- Ingresos por intereses'>
								</#if>
								<#if regFiscalXML == '616'>
									<#assign regFiscal = '616	- Sin obligaciones fiscales'>
								</#if>
								<#if regFiscalXML == '621'>
									<#assign regFiscal = '621	- Incorporación Fiscal'>
								</#if>
								<#if regFiscalXML == '622'>
									<#assign regFiscal = '622	- Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras'>
								</#if>
								<#if regFiscalXML == '629'>
									<#assign regFiscal = '629	- De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales'>
								</#if>
								<#if regFiscalXML == '630'>
									<#assign regFiscal = '630	- Enajenación de acciones en bolsa de valores'>
								</#if>
								<#if regFiscalXML == '615'>
									<#assign regFiscal = '615	- Régimen de los ingresos por obtención de premios'>
								</#if>
								<#if regFiscalXML == '601'>
									<#assign regFiscal = '601	- General de Ley Personas Morales'>
								</#if>
								<#if regFiscalXML == '603'>
									<#assign regFiscal = '603	- Personas Morales con Fines no Lucrativos'>
								</#if>
								<#if regFiscalXML == '609'>
									<#assign regFiscal = '609	- Consolidación'>
								</#if>
								<#if regFiscalXML == '620'>
									<#assign regFiscal = '620	- Sociedades Cooperativas de Producción que optan por diferir sus ingresos'>
								</#if>
								<#if regFiscalXML == '622'>
									<#assign regFiscal = '622	- Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras'>
								</#if>
								<#if regFiscalXML == '623'>
									<#assign regFiscal = '623	- Opcional para Grupos de Sociedades'>
								</#if>
								<#if regFiscalXML == '624'>
									<#assign regFiscal = '624	- Coordinados'>
								</#if>
								<#if regFiscalXML == '628'>
									<#assign regFiscal = '628	- Hidrocarburos'>
								</#if>
								<#if regFiscalXML == '607'>
									<#assign regFiscal = '607	- Régimen de Enajenación o Adquisición de Bienes'>
								</#if>
								<#if regFiscalXML == '610'>
									<#assign regFiscal = '610	- Residentes en el Extranjero sin Establecimiento Permanente en México'>
								</#if>
								${regFiscal}
								<#else>
								${subsidiary.custrecord_mx_sat_industry_type}
							</#if>
							<br /><br />
							<b>CONDICIONES DE PAGO: </b>${record.terms}	<br />
							<b>FORMA DE PAGO: </b>${record.custbody_mx_txn_sat_payment_method}	<br />
							<b>METODO DE PAGO: </b>${record.custbody_mx_txn_sat_payment_term}	<br />
						</span>
					</td>
					<td colspan="4" style='border-bottom:1px; border-top:1px;'>
						<span style='font-size: 6pt;'>
							<b>TIPO DE COMPROBANTE: </b>
							<#if dataXML?has_content>
								${dataXML.atributos.TipoDeComprobante}
								<#if dataXML.atributos.TipoDeComprobante =='E'>
								- Egreso
								</#if>
								<#if dataXML.atributos.TipoDeComprobante =='I'>
								- Ingreso
								</#if>
								<#if dataXML.atributos.TipoDeComprobante =='P'>
								- Pago
								</#if>
								<#if dataXML.atributos.TipoDeComprobante =='T'>
								- Traslados
								</#if>
							<#else>
								<#if record.custbody_mx_cfdi_uuid ==''>
									Pendiente de timbrado
								</#if>
							</#if><br />
							<b>FOLIO FISCAL: </b>${record.custbody_mx_cfdi_uuid}<br />
							<b>NUMERO DE SERIE DEL CERTIFICADO DEL SAT: </b>
							<#if dataXML?has_content>
								${dataXML.atributos.NoCertificado}
							<#else>
								<#if record.custbody_mx_cfdi_uuid ==''>
									Pendiente de timbrado
								</#if>
							</#if><br />
							<b>FECHA Y HORA DE CERTIFICACIÓN: </b>
							<#if dataXML?has_content>
								${dataXML.atributos.Fecha}
							<#else>
								${record.custbody_mx_cfdi_certify_timestamp}
							</#if>
							<br />
							<b>NUMERO DE SERIE DEL CSD DEL EMISOR: </b> 
								<#if record.custbody_mx_cfdi_uuid ==''>
									Pendiente de timbrado
								</#if> <br />
							<b>CLAVE CONFIRMACIÓN: </b>
								<#if record.custbody_mx_cfdi_uuid ==''>
									Pendiente de timbrado
								</#if> <br />
						</span>
					</td>
					<td colspan="2" style='border-bottom:1px; border-top:1px;'>
						<span style='font-size: 8pt;'>
							<b>FACTURA FOLIO: </b><br />
						</span>
						<span style='font-size: 8pt; color:red;'>
							${record.tranid} <br /><br />
						</span>
						<span style='font-size: 7pt;'>
							<b>FECHA: </b>${record.trandate}
							<br /><br />
							<b>LUGAR DE EXPEDICION: </b>
							<#if dataXML?has_content>
								${dataXML.atributos.LugarExpedicion}
							<#else>
								<#if record.custbody_mx_cfdi_uuid ==''>
									Pendiente de timbrado
								</#if>
							</#if><br />
						</span>
					</td>
				</tr>
			</table>  
            <table class="header" height="70px" style="width: 100%;">
				<tr height="70px">
					<td colspan="4" style='border-bottom:1px'>
						<barcode codetype="qrcode" showtext="false" height='70' width='70' value="${record.tranid}"/>
					</td>
					<td colspan="5" style='border-bottom:1px'>
						<span style='font-size: 7pt;'>
							<b>PARA: </b><br />
							${record.entity}<br />
							<b>RFC: </b>${record.custbody_mx_customer_rfc}<br />
							<b>Dirección: </b>${record.billaddress}<br />
							<b>NumRegIdTrib: </b><br />
							<b>USO CFDI: </b>${record.custbody_mx_cfdi_usage}<br />
						</span>
					</td>
					<td colspan="6" style='border-bottom:1px'>
						<span style='font-size: 7pt;'>
							<b>NOTAS: </b><br />
							${record.memo}<br /><br />${record.shipaddress}
						</span>
					</td>
				</tr>
			</table>  
        </macro>
        <macro id="nlfooter">
            <table class="footer" style="width: 100%;">
				<tr>
					<td><barcode codetype="code128" showtext="true" value="${record.tranid}"/></td>
					<td align="right"><pagenumber/> of <totalpages/></td>
				</tr>
			</table>
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
		.imagenClase img{
			height:85px;
			width:170px;
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
            color: #333333;
        }
        td {
            padding: 4px 6px;
        }
		td p { align:left }
        b {
            font-weight: bold;
            color: #333333;
        }
        table.header td {
            padding: 0px;
            padding-top: 10px;
            padding-bottom: 10px;
            font-size: 10pt;
        }
        table.footer td {
            padding: 0px;
            font-size: 8pt;
        }
        table.itemtable th {
			font-size: 8px;
            padding-bottom: 10px;
            padding-top: 10px;
			border: 1px;
			background-color: #c0c0c0;
        }
        table.itemtable td {
			font-size: 7px;
			border: 1px;
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
            color: #d3d3d3;
            background-color: #d3d3d3;
            height: 1px;
        }
</style>
</head>
<body header="nlheader" header-height="23%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
	<#--  <#assign url = record.custbody_psg_ei_certified_edoc>
	<#assign dataXMLVIVO = url?url("GET")>
	<#assign dataXMLVIVORes = dataXMLVIVO?xml?trim>
	${dataXMLVIVORes.Impuestos.TotalImpuestosTrasladados}  -->
	<#--  ${dataXMLVIVO}  -->

    <#--  <table style="width: 100%; margin-top: 100px;">
		<tr>
			<td class="addressheader" colspan="3"><b>${record.billaddress@label}</b></td>
			<td class="addressheader" colspan="3"><b>${record.shipaddress@label}</b></td>
			<td class="totalboxtop" colspan="5"><b>${record.total@label?upper_case}</b></td>
		</tr>
		<tr>
			<td class="address" colspan="3" rowspan="2">${record.billaddress}</td>
			<td class="address" colspan="3" rowspan="2">${record.shipaddress}</td>
			<td align="right" class="totalboxmid" colspan="5">${record.total}</td>
		</tr>
		<tr>
			<td align="right" class="totalboxbot" colspan="5"><b>${record.duedate@label}:</b> ${record.duedate}</td>
		</tr>
	</table>  -->

	<#--  <table class="body" style="width: 100%; margin-top: 10px;">
		<tr>
			<th>${record.terms@label}</th>
			<th>${record.duedate@label}</th>
			<th>${record.otherrefnum@label}</th>
			<th>${record.salesrep@label}</th>
			<th>${record.shipmethod@label}</th>
			<th>${record.partner@label}</th>
		</tr>
		<tr>
			<td>${record.terms}</td>
			<td>${record.duedate}</td>
			<td>${record.otherrefnum}</td>
			<td>${record.salesrep}</td>
			<td>${record.shipmethod}</td>
			<td>${record.partner}</td>
		</tr>
	</table>  -->
	
<#if record.item?has_content && !dataXML?has_content>
	<table class="itemtable" style="width: 100%; margin-top: 10px;"><!-- start items -->
		<#list record.item as item>
			<#if item_index==0>
				<thead>
					<tr>
						<th align="center" colspan="3">PARTIDA</th>
						<th align="center" colspan="3">CANTIDAD</th>
						<th colspan="4">SKU VIVO</th>
						<th colspan="4">CLAVE <br/>PROD/SERV</th>
						<th colspan="3">CLAVE <br/>UNIDAD</th>
						<th colspan="3">No. <br/>MATERIAL</th>
						<th align="center" colspan="10">DESCRIPCION</th>
						<th colspan="3">VALOR <br/>UNITARIO</th>
						<th colspan="3">IMPORTE</th>
					</tr>
				</thead>
			</#if>
			<tr>
				<#assign claveProdServAux = ''>
				<#if item.custcol_mx_txn_line_sat_item_code?has_content>
					<#assign claveProdServAux = item.custcol_mx_txn_line_sat_item_code>
				</#if>
				<#assign claveProdServ = claveProdServAux?split('-')>
				<td align="center" colspan="3" line-height="150%">${item.custcolvivo_partida}</td>
				<td align="center" colspan="3" line-height="150%">${item.quantity}</td>
				<td align="center" colspan="4">${item.item}</td>
				<td align="center" colspan="4">${claveProdServ[0]}</td>
				<td align="center" colspan="3">
					<#if record.custbody_mx_cfdi_uuid ==''>
						Pendiente de timbrado
					</#if>
				</td>
				<td align="center" colspan="3">${item.custcol_scm_customerpartnumber}</td>
				<td colspan="10">${item.description}</td>
				<td align="center" colspan="3">${item.rate}</td>
				<td align="center" colspan="3">${item.amount}</td>
			</tr>
		</#list><!-- end items -->
	</table>
</#if>
<#if dataXML?has_content>
	<table class="itemtable" style="width: 100%; margin-top: 10px;"><!-- start items -->
		<#list record.item as item>
      <#assign index = item?index>
			<#if item_index==0>
				<thead>
					<tr>
						<th align="center" colspan="3">PARTIDA</th>
						<th align="center" colspan="3">CANTIDAD</th>
						<th colspan="4">SKU VIVO</th>
						<th colspan="4">CLAVE <br/>PROD/SERV</th>
						<th colspan="3">CLAVE <br/>UNIDAD</th>
						<th colspan="3">No. <br/>MATERIAL</th>
						<th align="center" colspan="10">DESCRIPCION</th>
						<th colspan="3">VALOR <br/>UNITARIO</th>
						<th colspan="3">IMPORTE</th>
					</tr>
				</thead>
			</#if>
			<#assign claveProdServAux = ''>
			<#if item.custcol_mx_txn_line_sat_item_code?has_content>
				<#assign claveProdServAux = item.custcol_mx_txn_line_sat_item_code>
			</#if>
			<#assign claveProdServArr = claveProdServAux?split(' -')>
			<#assign claveProdServ = claveProdServArr[0]>
			<#if dataXML.Conceptos.Concepto?is_sequence>
				<#list dataXML.Conceptos.Concepto as itemXML>
          <#assign indeXml = itemXML?index>
					<#assign claveProdServDataXML = itemXML.atributos.ClaveProdServ>
					<#if claveProdServDataXML == claveProdServ && index == indeXml>
						<tr>
							<td align="center" colspan="3" line-height="150%">${item.custcolvivo_partida}</td>
							<td align="center" colspan="3" line-height="150%">${itemXML.atributos.Cantidad}</td>
							<td align="center" colspan="4">${item.item}</td>
							<td align="center" colspan="4">${itemXML.atributos.ClaveProdServ}</td>
							<td align="center" colspan="3">${itemXML.atributos.ClaveUnidad}</td>
							<td align="center" colspan="3">${item.custcol_scm_customerpartnumber}</td>
							<td colspan="10">${itemXML.atributos.Descripcion}</td>
							<td align="center" colspan="3">${itemXML.atributos.ValorUnitario}</td>
							<td align="center" colspan="3">${itemXML.atributos.Importe}</td>
						</tr>
					</#if>
				</#list>
			</#if>
		</#list>
	</table>
</#if>

<table class="total" style="width: 100%; margin-top: 10px;">
	<tr>
		<td colspan="5">
			<span style='font-size:8px; font-weight:bold;'>TIPO <br/>RELACIÓN:</span>
		</td>
		<td colspan="2">&nbsp;</td>
		<td colspan="2" align="right"><b>SUBTOTAL:</b></td>S
		<td colspan="2" align="right">${record.subtotal}</td>
	</tr>
	<tr>
		<td colspan="5">
			<span style='font-size:8px; font-weight:bold;'>CFDI <br/>RELACIONADO:</span>
		</td>
		<td colspan="2">&nbsp;</td>
		<td colspan="2" align="right"><b>DESCUENTO:</b></td>
		<td colspan="2" align="right">${record.discountitem}</td>
	</tr>
	<#if dataXML?has_content>
		<#assign impuestosTraslados = dataXML.Impuestos.atributos.TotalImpuestosTrasladados>
		<tr>
			<td colspan="5"></td>
			<td colspan="2">&nbsp;</td>
			<td colspan="2" align="right"><b>IMPUESTOS <br/>TRASLADADOS:</b></td>
			<td colspan="2" align="right">${impuestosTraslados}</td>
		</tr>
		<tr>
			<td colspan="5"></td>
			<td colspan="2">&nbsp;</td>
			<td colspan="2" align="right"><b>IMPUESTOS <br/>RETENIDOS:</b></td>
			<td colspan="2" align="right">0.00</td>
		</tr>
	</#if>
	<tr style='margin-top:5px; margin-bottom:5px;'>
		<td colspan="5"></td>
		<td colspan="2">&nbsp;</td>
		<td colspan="2" align="right" style='border-top:1px; font-weight:bold;'><b>TOTAL</b></td>
		<td colspan="2" align="right" style='border-top:1px; font-weight:bold;'>${record.total}</td>
	</tr>
	<tr>
		<td colspan="6"></td>
		<td colspan="5" align="right" >
			<span style='font-size:9px;'>${record.custbody_efx_fe_total_text}</span>
		</td>
	</tr>
	<tr>
		<td colspan="6"></td>
		<td colspan="5" align="right" >
			<#assign moneda = ''>
			<#if record.currency == 'MXN'>
				<#assign moneda = 'Peso mexicano'>
			<#elseif record.currency == 'USD'>
				<#assign moneda = 'DOLAR'>
			<#else>
				<#assign moneda = record.currency>
			</#if>
			<span style='font-size:9px;'>MONEDA: ${moneda} TIPO DE CAMBIO: ${record.exchangerate}</span>
		</td>
	</tr>
</table>

<table style='width:100%'>
	<tr>
		<td colspan='1' style='border:1px; font-size:7px; font-weight:bold;' align='center' >RETENCIONES LOCALES</td>
		<td colspan='1' style='border:1px; font-size:7px; font-weight:bold;' align='center' >TRASLADOS LOCALES</td>
		<td colspan='1' style='border:1px; font-size:7px; font-weight:bold;' align='center' >RETENCIONES FEDERALES</td>
		<td colspan='1' style='border:1px; font-size:7px; font-weight:bold;' align='center' >TRASLADOS FEDERALES</td>
	</tr>
	<tr>
		<td colspan='1' style='border:1px; font-size:7px;'>ninguna</td>
		<td colspan='1' style='border:1px; font-size:7px;'>ninguno</td>
		<td colspan='1' style='border:1px; font-size:7px;'>0.00</td>
		<td colspan='1' style='border:1px; font-size:7px;'>IVA: ${record.taxtotal}</td>
	</tr>
</table>

<table style='width:100%; margin-top:10px;'>
	<tr>
		<td colspan='1' style='font-size:7px; font-weight:bold;' >SELLO DIGITAL DEL SAT:</td>
	</tr>
	<tr>
		<td colspan='1' style='border-bottom:1px; font-size:7px;'>${record.custbody_mx_cfdi_sat_signature}</td>
	</tr>
	<tr>
		<td colspan='1' style='font-size:7px; font-weight:bold;' >SELLO DIGITAL DEL CFDI:</td>
	</tr>
	<tr>
		<td colspan='1' style='border-bottom:1px; font-size:7px;'>${record.custbody_mx_cfdi_signature}</td>
	</tr>
	<tr>
		<td colspan='1' style='font-size:7px; font-weight:bold;' >CADENA ORIGINAL DEL COMPLEMENTO DE CERTIFICACIÓN DIGITAL DEL SAT:</td>
	</tr>
	<tr>
		<td colspan='1' style='border-bottom:1px; font-size:7px;'>${record.custbody_mx_cfdi_cadena_original}</td>
	</tr>
</table>
</body>
</pdf>