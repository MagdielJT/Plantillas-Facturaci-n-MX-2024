<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
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
		<macro id="nlheader">
			<table class="header" style="width: 100%; font-size: 10pt;">
				<tr>
					<td rowspan="3" style="width: 452px;">
						<#if companyInformation.logoUrl?length != 0>
							<img src="${companyInformation.logoUrl}" style="float: left; margin: 7px; width: 125px; height: 45px;" /> 
						</#if> 
						<span style="font-size:11px;">
							<span class="nameandaddress">
								${companyInformation.companyName
							}</span>
						</span>
						<br />
						<span style="font-size:10px;">
							<span class="nameandaddress">
								${companyInformation.addressText}
							</span>
						</span>
					</td>
					<td align="right" style="width: 352px;"><span style="font-size:24px;">Documento de embalaje</span></td>
				</tr>
				<tr>
					<td align="right" style="width: 352px;"><span class="number">#${record.tranid}</span></td>
				</tr>
				<tr>
					<td align="right" style="width: 352px;">${record.trandate}</td>
				</tr>
				<tr>
					<td style="width: 452px;">&nbsp;</td>
					<td align="right" style="width: 352px;">&nbsp;<strong>Número de OT:</strong>&nbsp;${record.custbody14}</td>
				</tr>
			</table>
		</macro>
		<macro id="nlfooter">
			<table class="footer">
				<tr>
					<#if preferences.PRINT_BARCODES>
						<td><barcode codetype="code128" showtext="true" value="${record.tranid}"/></td>
					</#if>
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
			padding: 0;
			font-size: 10pt;
		}
		table.footer td {
			padding: 0;
			font-size: 8pt;
		}
		table.itemtable th {
			padding-bottom: 10px;
			padding-top: 10px;
		}
		table.body td {
			padding-top: 2px;
		}
		td.addressheader {
			font-size: 8pt;
			font-weight: bold;
			padding-top: 6px;
			padding-bottom: 2px;
		}
		td.address {
			padding-top: 0;
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
		div.returnform {
			width: 100%;
		    /* To ensure minimal height of return form */
			height: 200pt;
			page-break-inside: avoid;
			page-break-after: avoid;
		}
		hr {
			border-top: 1px dashed #d3d3d3;
			width: 100%;
			color: #ffffff;
			background-color: #ffffff;
			height: 1px;
		}
	</style>
</head>
<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
  <table style="width: 100%; margin-top: 10px;">
		<tr>
			<td class="addressheader">Domicilio de Entrega</td>
			<td class="addressheader">Domicilio de Facturaci&oacute;n</td>
		</tr>
		<tr>
			<#--  <td class="address">${salesorder.shipaddress} &nbsp;</td>  -->
			<td class="address">${records.results[0].values.shipaddress} &nbsp;</td>
			<td class="address">${records.results[0].values.billaddress}</td>
		</tr>
	</table>
	<table class="body" style="width: 100%; margin-top: 10px;">
		<tr>
			<th>${record.trandate@label}</th>
			<th>OC del Cliente</th>
			<th>Seguimiento n.º</th>
			<th>Vendedor</th>
			<th>Nombre del Contacto</th>
		</tr>
		<tr>
			<td>${record.trandate}</td>
			<td>${records.results[0].values.otherrefnum}</td>
			<td>${records.results[0].values.trackingnumbers}</td>
			<#--  <td>${salesorder.salesrep}</td>  -->
			<td>${records.results[0].values.salesrep[0].text}</td>
			<td>${records.results[0].values.custbody_hb_sfns_quote_contact_name}</td>
		</tr>
	</table>

	<#if record.item?has_content>
		<table class="itemtable" style="width: 100%; margin-top: 10px;">
			<thead>
				<tr>
				<th colspan="8" style="width: 292px;">${salesorder.item[0].item@label}</th>
				<th colspan="3">Cantidad</th>
				<th align="right" colspan="4">Código</th>
				<#--  <th align="right" colspan="4">${salesorder.item[0].quantityremaining@label}</th>  -->
				<th align="right" colspan="4">Serie</th>
				</tr>
			</thead>
			<#list record.item as tranline>
				<tr>
					<td colspan="8" style="width: 292px;"><span class="itemname">${tranline.item}</span><br />${tranline.description}</td>
					<td colspan="3">${tranline.quantity}</td>
					<td align="right" colspan="4"></td>
					<#--  <td align="right" colspan="4">${tranline.quantityremaining}</td>  -->
					<td align="right" colspan="4">${tranline.custcol_mx_txn_line_sat_item_code?keep_before("-")}</td>
				</tr>
			</#list>
		</table>
		<br /><strong>NOTA:</strong>&nbsp;${record.memo}<br /><br />
		<br /><strong>Nombre de quien recibe:</strong>&nbsp;${record.custbody49}
		<br /><strong>Método de Envió:</strong>&nbsp;${record.custbody_nso_enviadopor}
		<br /><strong>Paqueteria:</strong>&nbsp;${record.custbody55}
		<br /><strong>Transportista:</strong>&nbsp;${record.custbody56}
		<br /><strong>Puesto:</strong>&nbsp;
		<br /><strong>Firma:</strong>&nbsp;
		<br /><strong>Fecha:</strong>&nbsp;
		<br /><strong>Planta:</strong>&nbsp;
		<br /><strong>Número de entrada (si aplica):</strong>&nbsp;
		<br /><strong>Sello:</strong>&nbsp;
	</#if>
	<br/>
	<#if record.custbody_mx_plus_xml_certificado?has_content>
		<table style="width: 100%; margin-top: 10px;">
			<tr>
				<td colspan="2">
					<#if record.custbody_mx_cfdi_qr_code?has_content>
						<#assign qrcodeImage = "data:image/png;base64, " + record.custbody_mx_cfdi_qr_code >
						<img style="width: 100px;height:100px" src="${qrcodeImage}"/>
					</#if>
				</td>
				<td colspan="9">
					<table style="width: 100%;">
						<tr>
							<td><strong>SAT Serial Number :</strong></td>
						</tr>
						<tr>
							<td>${record.custbody_mx_cfdi_sat_serial}</td>
						</tr>
						<tr>
							<td><strong>Original String:</strong></td>
						</tr>
						<tr>
							<td>${record.custbody_mx_cfdi_cadena_original}</td>
						</tr>
						<tr>
							<td><strong>CFDI Signature:</strong></td>
						</tr>
						<tr>
							<td>${record.custbody_mx_cfdi_signature}</td>
						</tr>
						<tr>
							<td><strong>SAT Signature:</strong></td>
						</tr>
						<tr>
							<td>${record.custbody_mx_cfdi_sat_signature}</td>
						</tr>
					</table>
				</td>			
			</tr>
		</table>
	</#if>

	<#if preferences.RETURNFORM && returnForm??>
		<hr />&nbsp;
		<div class="returnform">
			<table style="width: 100%; margin-top: 10px;">
				<tr>
					<td style="width: 365px;"><span class="nameandaddress">${companyInformation.companyName}</span></td>
					<td align="right" style="width: 416px;"><span style="font-size:18px;"><span class="number">${returnForm@title}</span></span></td>
				</tr>
			</table>
			<table style="width: 100%; margin-top: 10px;">
				<tr>
					<td class="addressheader" colspan="4">${returnForm.returnAddress}</td>
					<th>${returnForm.rmaNum}</th>
					<th colspan="2">${returnForm.customerName}</th>
					<th>${salesorder.tranid@label}</th>
				</tr>
				<tr>
					<td class="address" colspan="4" rowspan="2">&nbsp;</td>
					<td>&nbsp;</td>
					<td colspan="2">${salesorder.entity}</td>
					<td>${salesorder.tranid}</td>
				</tr>
				<tr>
					<td colspan="4">&nbsp;</td>
				</tr>
			</table>
			<table class="itemtable" style="width: 100%; margin-top: 10px;">
				<thead>
					<tr>
					<th colspan="2">${returnForm.item}</th>
					<th colspan="1">${returnForm.quantity}</th>
					<th colspan="5">${returnForm.reason}</th>
					</tr>
				</thead>
				<tr>
					<td colspan="8">&nbsp;</td>
				</tr>
			</table>
		</div>
	</#if>
</body>
</pdf>