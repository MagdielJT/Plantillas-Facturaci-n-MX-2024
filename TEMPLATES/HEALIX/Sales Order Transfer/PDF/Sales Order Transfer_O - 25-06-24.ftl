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
					<#if records?has_content>
						<#assign dataMainShipFrom = records.dataFromSearch.dataFromTransaction.subsidiary>
						<td rowspan="3" tyle="padding: 0px; width: 66.66.33%;">
							<#assign urlLogo = dataMainShipFrom.custrecord_subnav_subsidiary_logo.text?html>
							<img src="${urlLogo}" style="float: left; margin: 7px" width="175" height="55"/> 
							<span class="nameandaddress" style="font-size: 8pt;">
										<#if dataMainShipFrom.namenohierarchy?length != 0>
											${dataMainShipFrom.namenohierarchy}<br/>
										</#if>
										<#if dataMainShipFrom.address1?length != 0>
											${dataMainShipFrom.address1}<br/>
										</#if>
										<#if dataMainShipFrom.address2?length != 0>
											${dataMainShipFrom.address2}<br/>
										</#if>
										<#if dataMainShipFrom.address3?length != 0>
											${dataMainShipFrom.address3}<br/>
										</#if>
										<#if dataMainShipFrom.city?length != 0>
											${dataMainShipFrom.city}
										</#if>
										<#if dataMainShipFrom.zip?length != 0>
											${dataMainShipFrom.zip}
										</#if>
										<#if dataMainShipFrom.county?length != 0>
											${dataMainShipFrom.country}
										</#if>
										
							</span>
						</td>
						<td align="right"><span class="title" style="width: 33.33%;">${"Transfer"}</span></td>
					</#if>
				</tr>
				<tr>
					<td align="right"><span class="number">#${record.tranid}</span></td>
				</tr>
				<tr>
					<td align="right">${record.trandate}</td>
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
            background-color: #2D5EA8;
            color: #ffffff;
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
            font-size: 10pt;
        }
        table.footer td {
            padding: 0px;
            font-size: 8pt;
        }
        table.itemtable th {
            padding-bottom: 5px;
            padding-top: 5px;
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
            font-size: 22pt;
            padding-top: 20px;
            background-color: #e3e3e3;
        }
        td.totalboxbot {
            background-color: #e3e3e3;
            font-weight: bold;
        }
        span.title {
            font-size: 22pt;
        }
        span.number {
            font-size: 14pt;
          color: #ce0000;
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
<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
    <table style="width: 100%; margin-top: 10px;">
		<tr>
			<td class="addressheader">Ship to</td>
			<td class="addressheader">Ship from</td>
		</tr>
		<tr>
			<td class="address">${record.shipaddress}</td>
			<td class="address">	
				<#if records?has_content>
					<#assign dataMainShipFrom = records.dataFromSearch.dataFromTransaction.location>
						<#if dataMainShipFrom.name?length != 0>
							${dataMainShipFrom.name}<br/>
						</#if>
						<#if dataMainShipFrom.address1?length != 0>
							${dataMainShipFrom.address1}<br/>
						</#if>
						<#if dataMainShipFrom.address2?length != 0>
							${dataMainShipFrom.address2}<br/>
						</#if>
						<#if dataMainShipFrom.address3?length != 0>
							${dataMainShipFrom.address3}<br/>
						</#if>
						<#if dataMainShipFrom.city?length != 0>
							${dataMainShipFrom.city}
						</#if>
						<#if dataMainShipFrom.zip?length != 0>
							${dataMainShipFrom.zip} 
						</#if>
						<#if dataMainShipFrom.county?length != 0>
							${dataMainShipFrom.country}
						</#if>
				</#if>
			</td>
		</tr>
	</table>

<table class="body" style="width: 100%; margin-top: 10px;">
	<tr>
		<th>Date</th>
		<th>Tracking #</th>
		<th>Fulfillment of</th>
		<th>Ship Via</th>
		<th>Phone</th>
	</tr>
	<#if records?has_content>
		<#assign dataMain = records.dataFromSearch>
		<tr>
			<td>${dataMain.trandate}</td>
			<td>${salesorder.linkedtrackingnumbers}</td>
			<td>${dataMain.createdFrom.type.text} #${dataMain.createdFrom.tranid}</td>
			<td>${record.shipmethod}</td>
			<td>${record.shipphone}</td>
		</tr>
	</#if>
</table>
<#if records?has_content>
	<table class="itemtable" style="width: 100%; margin-top: 10px;">
		<thead>
			<tr>
			<th colspan="12">Item label</th>
			<th colspan="4">Inventory detail</th>
			<th align="right" colspan="4">Expiration Date</th>
			<th align="right" colspan="4">Shipped</th>
			</tr>
		</thead>
		<#assign listItem = records.dataFromSearch.valuesLine>
		<#list listItem as tranline>
			<tr>
				<td colspan="12">
					<b>
						<span class="itemname">${tranline.inventoryDetail.item.text}</span>
						<br />${tranline.item.displayname}
					</b>
				</td>
				<td colspan="4">
					${tranline.inventoryDetail.inventorynumber.text}(${tranline.inventoryDetail.quantity})
				</td>
				<td align="right" colspan="4">${tranline.inventoryDetail.expirationdate} </td>
				<td align="right" colspan="4">${tranline.inventoryDetail.quantity}</td>
			</tr>
		</#list>
	</table>
</#if>
<pbr/>
<#if records?has_content>
	<table class="itemtable" style="width: 100%; margin-top: 10px;">
		<thead>
			<tr>
			<th align="center" colspan="4">Shipment date</th>
			<th align="center" colspan="4">Transaction ID</th>
			<th align="center" colspan="4">LOT/Serial</th>
			<th align="center" colspan="4">Sender</th>
			<th align="center" colspan="4">From location</th>
			<th align="center" colspan="4">Receiver</th>
			<th align="center" colspan="4">To location</th>
			</tr>
		</thead>
		<#assign listWeTrack = records.dataFromSearch.weTrack>
		<#list listWeTrack as lineWeTrack>
			<tr>
				<td align="center" colspan="4">${lineWeTrack.trandate}</td>
				<td align="center" colspan="4">${lineWeTrack.tranid}</td>
				<td align="center" colspan="4">${lineWeTrack.inventorynumber_inventorydetail}</td>
				<td align="center" colspan="4">${lineWeTrack.entity_id}</td>
				<td align="center" colspan="4">${lineWeTrack.location}</td>
				<td align="center" colspan="4">${lineWeTrack.subsidiary}</td>
				<td align="center" colspan="4"></td>
			</tr>
		</#list>
	</table>
</#if>
</body>
</pdf>