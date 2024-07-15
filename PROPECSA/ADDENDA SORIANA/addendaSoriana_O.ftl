<cfdi:Addenda>
  <DSCargaRemisionProv xmlns="http://tempuri.org/DSCargaRemisionProv.xsd">
    <#if transaction.custbody_efx_soriana_remision?has_content>
      <#assign idRemision=transaction.custbody_efx_soriana_remision>
    <#else>
      <#assign idRemision=transaction.tranid>
    </#if>
    <Remision Id="Remision1" RowOrder="0">
      <Proveedor>
        ${customer.custentity_efx_soriana_idproveedor}
      </Proveedor>
      <Remision>
        ${idRemision}
      </Remision>
      <Consecutivo>0</Consecutivo>
      <FechaRemision>
        ${transaction.trandate?string.iso_nz}
      </FechaRemision>
      <#if shipaddress.custrecord_efx_soriana_determinante?has_content>
        <Tienda>
          ${shipaddress.custrecord_efx_soriana_determinante}
        </Tienda>
      <#else>
        <Tienda>
          ${billaddress.custrecord_efx_soriana_determinante}
        </Tienda>
      </#if>
      <TipoMoneda>1</TipoMoneda>
      <TipoBulto>1</TipoBulto>
      <#if shipaddress.custrecord_efx_soriana_entregamercancia?has_content>
        <EntregaMercancia>
          ${shipaddress.custrecord_efx_soriana_entregamercancia}
        </EntregaMercancia>
      <#else>
        <EntregaMercancia>
          ${billaddress.custrecord_efx_soriana_entregamercancia}
        </EntregaMercancia>
      </#if>
      <CumpleReqFiscales>true</CumpleReqFiscales>
      <CantidadBultos>
        ${transaction.custbody_efx_soriana_numerocajas}
      </CantidadBultos>
      <Subtotal>
        ${transaction.subtotal?string.computer}
      </Subtotal>
      <Descuentos>
        ${transaction.discounttotal?keep_after("$")}
      </Descuentos>
      <#assign taxjsoncab=transaction.custbody_efx_fe_tax_json>
        <#if taxjsoncab?has_content>
          <#assign jsonCab=taxjsoncab?eval>
          <#if jsonCab.rates_ieps?has_content>
            <#list jsonCab.rates_ieps as rateIEPS, valueIEPS>
              <IEPS>
                ${valueIEPS?number}
              </IEPS>
            </#list>
          <#else>
            <IEPS>0</IEPS>
          </#if>
          <#if jsonCab.rates_iva_data?has_content>
            <#list jsonCab.rates_iva_data as rateIVA, valueIVA>
              <IVA>
                ${valueIVA?number}
              </IVA>
            </#list>
          <#else>
            <IVA>0</IVA>
          </#if>
        <#else>
          <ERROR> NO hay tax JSON en cabecera<ERROR>
        </#if>
        <OtrosImpuestos>0</OtrosImpuestos>
        <Total>
          ${transaction.total?string.computer}
        </Total>
        <CantidadPedidos>1</CantidadPedidos>
        <FechaEntregaMercancia>
          ${transaction.custbody_efx_soriana_fechacita?string.iso_nz}
        </FechaEntregaMercancia>
        <Cita>
          ${transaction.custbody_efx_soriana_numerocita}
        </Cita>
    </Remision>
    <Pedidos Id="Pedidos1" RowOrder="1">
      <Proveedor>
        ${customer.custentity_efx_soriana_idproveedor}
      </Proveedor>
      <Remision>
        ${idRemision}
      </Remision>
      <FolioPedido>
        ${transaction.otherrefnum}
      </FolioPedido>
      <#if shipaddress.custrecord_efx_soriana_determinante?has_content>
        <Tienda>
          ${shipaddress.custrecord_efx_soriana_determinante}
        </Tienda>
      <#else>
        <Tienda>
          ${billaddress.custrecord_efx_soriana_determinante}
        </Tienda>
      </#if>
      <#assign items=transaction.item?size>
      <CantidadArticulos>
        ${items}
      </CantidadArticulos>
    </Pedidos>
    <#list transaction.item as item>
      <Articulos RowOrder="${item_index+1}" Id="${idRemision}">
        <Proveedor>
          ${customer.custentity_efx_soriana_idproveedor}
        </Proveedor>
        <Remision>
          ${idRemision}
        </Remision>
        <FolioPedido>
          ${transaction.otherrefnum}
        </FolioPedido>
        <#if shipaddress.custrecord_efx_soriana_determinante?has_content>
          <Tienda>
            ${shipaddress.custrecord_efx_soriana_determinante}
          </Tienda>
        <#else>
          <Tienda>
            ${billaddress.custrecord_efx_soriana_determinante}
          </Tienda>
        </#if>
        <Codigo>
          ${item.custcol_efx_fe_upc_code}
        </Codigo>
        <CantidadUnidadCompra>
          ${item.quantity}
        </CantidadUnidadCompra>
        <#-- <#assign item_rate=item.rate?keep_after("$")> -->
          <CostoNetoUnidadCompra>
            ${item.rate?string.computer}
          </CostoNetoUnidadCompra>
          <#assign taxJSONline=item.custcol_efx_fe_tax_json>
            <#if taxJSONline?has_content>
              <#assign lineJSON=taxJSONline?eval>
                <#if lineJSON.ieps.name?has_content>
                  <#assign rateIEPS=lineJSON.ieps.rate>
                  <PorcentajeIEPS>
                    ${rateIEPS}
                  </PorcentajeIEPS>
                <#else>
                  <PorcentajeIEPS>0</PorcentajeIEPS>
                </#if>
                <#if lineJSON.iva.name?has_content>
                  <#assign rateIVA=lineJSON.iva.rate>
                  <PorcentajeIVA>
                    ${rateIVA}
                  </PorcentajeIVA>
                <#else>
                  <PorcentajeIVA></PorcentajeIVA>
                </#if>
            </#if>
      </Articulos>
    </#list>
  </DSCargaRemisionProv>
</cfdi:Addenda>