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
		td p { align:left }
</style>
</head>
<body padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
    <div style="position: relative;font-family: Helvetica,sans-serif;top= -11pt;height: 250pt;width: 612pt;page-break-inside: avoid;font-size: 8pt;">
<table style="position: absolute;overflow: hidden;left: 489pt;top: 8pt;height: 7pt;width: 85pt;font-size: 5pt;"><tr>
	<td align="center">${record.otherrefnum}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 466pt;top: 34pt;height: 18pt;width: 108pt;"><tr>
	<td>${record.trandate} Prueba</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 50pt;top: 69pt;height: 18pt;width: 393pt;"><tr>
	<td>${record.entity}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 463pt;top: 69pt;height: 18pt;width: 111pt;"><tr>
	<td>**<#if (record.usertotal?length > 0)>${record.usertotal}<#else>${record.total}</#if></td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 2pt;top: 93pt;height: 18pt;width: 572pt;"><tr>
	<td>${record.totalwords}*********************************************************************</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 37pt;top: 122pt;height: 80pt;width: 537pt;"><tr>
	<td>${record.address}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 2pt;top: 178pt;height: 18pt;width: 572pt;"><tr>
	<td>${record.memo}</td>
	</tr></table>
</div>

<div style="position: relative;font-family: Helvetica,sans-serif;height: 250pt;width: 612pt;page-break-before: avoid;font-size: 8pt;">
<table style="position: absolute;overflow: hidden;left: 403pt;top: -16pt;height: 7pt;width: 40pt;font-size: 5pt;"><tr>
	<td align="center">${record.otherrefnum}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 412pt;top: -2pt;height: 13pt;width: 70pt;"><tr>
	<td>${record.trandate}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 36pt;top: -2pt;height: 13pt;width: 157pt;"><tr>
	<td>${record.entity}</td>
	</tr></table>
<#if record.item?has_content || record.expense?has_content>

<table style="position: absolute;overflow: hidden;left: 36pt;top: 90pt;width: 436pt;"><#list record.expense as expense><tr>
	<td>${expense.account}</td>
	<td>${expense.date}</td>
	<td>${expense.description}</td>
	<td align="right">${expense.amount}</td>
	</tr>
	</#list><#list record.item as item>
	<tr>
	<td>&nbsp;</td>
	<td>${item.date}</td>
	<td>${item.item}, ${item.description}</td>
	<td align="right">${item.amount}</td>
	</tr>
	</#list></table>
</#if>

<table style="position: absolute;overflow: hidden;left: 473pt;top: 204pt;height: 13pt;width: 67pt;"><tr>
	<td>${record.account}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 148pt;top: 204pt;height: 13pt;width: 325pt;"><tr>
	<td>${record.memo}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 9pt;top: 204pt;height: 13pt;width: 134pt;"><tr>
	<td>${record.total}</td>
	</tr></table>
</div>

<div style="position: relative;font-family: Helvetica,sans-serif;height: 250pt;width: 612pt;page-break-before: avoid;font-size: 8pt;">
<table style="position: absolute;overflow: hidden;left: 403pt;top: -16pt;height: 7pt;width: 40pt;font-size: 5pt;"><tr>
	<td align="center">${record.otherrefnum}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 412pt;top: -2pt;height: 13pt;width: 70pt;"><tr>
	<td>${record.trandate}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 36pt;top: -2pt;height: 13pt;width: 157pt;"><tr>
	<td>${record.entity}</td>
	</tr></table>
<#if record.item?has_content || record.expense?has_content>

<table style="position: absolute;overflow: hidden;left: 36pt;top: 90pt;width: 436pt;"><#list record.expense as expense><tr>
	<td>${expense.account}</td>
	<td>${expense.date}</td>
	<td>${expense.description}</td>
	<td align="right">${expense.amount}</td>
	</tr>
	</#list><#list record.item as item>
	<tr>
	<td>&nbsp;</td>
	<td>${item.date}</td>
	<td>${item.item}, ${item.description}</td>
	<td align="right">${item.amount}</td>
	</tr>
	</#list></table>
</#if>

<table style="position: absolute;overflow: hidden;left: 473pt;top: 204pt;height: 13pt;width: 67pt;"><tr>
	<td>${record.account}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 148pt;top: 204pt;height: 13pt;width: 325pt;"><tr>
	<td>${record.memo}</td>
	</tr></table>

<table style="position: absolute;overflow: hidden;left: 9pt;top: 204pt;height: 13pt;width: 134pt;"><tr>
	<td>${record.total}</td>
	</tr></table>
</div>
</body>
</pdf>