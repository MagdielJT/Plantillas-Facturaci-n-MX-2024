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
            <table class="header" style="width: 100%;">
              <tr>
	<td rowspan="3"><#if companyInformation.logoUrl?length != 0><img src="${companyInformation.logoUrl}" style="float: left; margin: 5px; width: 200px; height: 70px; padding-right: 10px"  /> </#if>  </td>
                <td>
      <span style="font-size: 20pt;"> Orden de compra  </span>
                </td>
                <td>
                <table style="font-size: 12pt;">
        <tr>
          <td>
            <span class="nameandaddress"> ${record.subsidiary} </span>
          </td>
        </tr>
        <tr>
          <td>
            <span class="nameandaddress"> Dirección Fiscal: ${subsidiary.mainaddress_text} </span>
          </td>
        </tr>
        <tr>
          <td>
            Fax: ${subsidiary.fax}
          </td>
        </tr>
        <tr>
          <td>
            RFC: ${subsidiary.federalidnumber}
          </td>
        </tr>
      </table>
                </td>
               
              </tr>
              </table>



<table width="100%" sryle="font-size: 9pt;">
  <tr>
    <td align="left">
      <table>
        <tr>
          <td>
            Orden de Compra No.
          </td>
          <td>
            ${record.tranid}
          </td>
        </tr>
        <tr>
          <td>
            Fecha:
          </td>
          <td >
            ${record.trandate}
          </td>
        </tr>
      </table>
    </td>
    <td>
      
    </td>
  </tr>

</table>



      </macro>
        <macro id="nlfooter">
            <table class="footer" style="width: 100%;"><tr>
	<td><barcode codetype="code128" showtext="true" value="${record.tranid}"/></td>
	<td align="right"><pagenumber/> of <totalpages/></td>
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
            padding-top: 0;
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
<body header="nlheader" header-height="16%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">

  <table width="100%" style="font-size: 9pt; margin-top: 5px;">
    <tr>
      <td width="50%">
        <table>
          <tr>
            <td>
              A: ${record.entity}
            </td>
          </tr>
          <tr>
            <td>
              ${record.billaddress}
            </td>
          </tr>
          <tr>
            <td>
              ${record.entity.custentity_mx_rfc}
            </td>
          </tr>
        </table>
      </td>
      <td width="50%">
      <table>
        <tr>
          <td>
            Tipo de compra:
          </td>
        </tr>
        <tr>
          <td>
           	Forma de envio
          </td>
        </tr>
        <tr>
          <td>
            Plazo de pago:
          </td>
        </tr>
        <tr>
          <td>
            Transporte:
          </td>
        </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td width="50%" align="right">
        Observaciones
      </td>
      <td width="50%">
        <table>
          <tr>
            <td>
              Fecha de entrega:
            </td>
            <td>
            ${record.duedate}
            </td>
          </tr>
          <tr>
            <td>
              Recepcion:
            </td>
          </tr>
          <tr>
            <td>
              Enviar archivos de factura antes de entregar
            </td>
          </tr>
          <tr>
            <td>
              No se recibira despues de la fecha indicada
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
  <#if record.item?has_content>

<table class="itemtable" style="width: 100%; font-size: 7pt;"><!-- start items --><#list record.item as item><#if item_index==0>
<thead>
	<tr>
	<th align="center" colspan="2">Cant </th>
      <th align="center" colspan="7"> ISBN</th>
	<th colspan="9">${item.item@label}</th>
	<th align="right" colspan="4">Costo Unitario</th>
	<th align="right" colspan="4">Importe</th>
	</tr>
</thead>
</#if><tr>
	<td align="center" colspan="2" line-height="150%">${item.quantity}</td>
  <td align="center" colspan="7"> ${item.custcol_tko_isbn} </td>
	<td colspan="9"><span class="itemname"> ${item.item} </span></td>
	<td align="right" colspan="4">${item.rate}</td>
	<td align="right" colspan="4">${item.amount}</td>
	</tr>
	</#list><!-- end items --></table>
</#if>
  
 
  
  

  <table style="width: 100%; margin-top: 5px;">
<tr>
   <td></td>
   <td></td>
      <td>
      <table>
        <tr>
          <td>
            ${record.subtotal@label}	   ${record.subtotal}
          </td>
        </tr>
        <tr>
          <td>
            	 ${record.taxtotal@label}  ${record.taxtotal}
          </td>
        </tr>
        <tr><td>
         <b> ${record.total@label} </b>${record.total}
          </td>
        </tr>

      </table>
      </td>
</tr>
    
<tr>
<td> <table>
  <tr>
  <td>
    _______________________________
    </td>
  </tr>
  <tr>
  <td>
    Supervisor de Proveeduria
    </td>
  </tr>
  </table>
  </td>
  
  <td>
  <table>
    <tr>
    <td>
      ___________________________
      </td>
    </tr>
    <tr>
    <td>
      Director de Finanzas
      </td>
    </tr>
    </table>
  
  </td>
  
  <td></td>

  
     
</tr>
</table>


    <p style="page-break-after: always;">&nbsp;</p>
  <#if record.entity.custentity_efx_impresor>
    <table style="height: 100%">

    <tr>


      <td>

      FORMATO DE INSPECCION DE ESPECIFICACIONES EN RECEPCIÓN
      </td>


    </tr>

  </table>

  <table>
    
    <tr>
      
      <td>
        
        Título:_____________________________
      </td>
      <td>
      ${record.entity.custentity_efx_impresor}
      </td>
      
    </tr>
    
    <tr>
      <td>
        Imprenta:___________________________ 
      </td>
      <td>
        Tiraje:____________
      </td>
    </tr>
    <tr>
      <td>
        Fecha envío de archivo:_____/ _____/ _____/
      </td>
      <td>
        Fecha entrada al almacén:_____/ _____/ _____
      </td>
    </tr>
    <tr>
      <td>
        Entrega de prueba de color:_____/ _____/ _____/
      </td>
      <td>
        Visto bueno:_____/ _____/ _____
      </td>
    </tr>
  </table>
  
  <table>
    <tr>
      <td>
        <strong>Interiores:</strong>
      </td>
    </tr>
    <tr>
      <td>
        Tamaño Final:_________X_________cm
      </td>
      <td>
					Es correcto:	Sí			No
      </td>
    </tr>
    <tr>
      <td>
       <strong>Papel:</strong> 	Couché _____ grs.
      </td>
      <td>
      bond _____ grs.
      </td>
      <td>
      Cultural ahuesdo _____ grs.
      </td>
    </tr>
    <tr>
      <td>
      Otro: __________
      </td>
      <td>
      Tintas:_____x_____
      </td>
    </tr>
  </table>
  <table>
    <tr>
      <td>
        <strong>Portada</strong>
      </td>
      <td>
      Es correcto el color		Si		No
      </td>
      <td>
      Tintas: _____x
      </td>
    </tr>
    <tr>
      <td>
        Terminado
      </td>
      <td>
        Cartoné
      </td>
      <td>
        Hotmelt
      </td>
      <td>
        Wire-o
      </td>
      <td>
        Grapa
      </td>
    </tr>
    <tr>
      Otro:_______________
    </tr>
    <tr>
      <td>
      Laminado:
      </td>
      <td>
      Mate
      </td>
      <td>
      Brillante
      </td>
     <td>
     Barniz UV
     </td>
     <td>
     Otro:_______________
     </td>
    </tr>
  </table>
  <table>
    <tr>
      <td>
      <strong> Verificación previa de imprenta</strong>
      </td>
    </tr>
    <tr>
      <td>
      Muestreo realizado:__________
      </td>
      <td>Ejemplares</td>
    </tr>
    <tr>
      <td>
      Secuencia de paginación
      </td>
      <td>
	  Alineación folios y cornisas
      </td>
      <td>
      Calidad encuadernado
      </td>
    </tr>
    <tr>
      <td>
        Calidad del refine
      </td>
    </tr>
  </table>
  </#if>
  

</body>
</pdf>