<?xml version="1.0" encoding="utf-8"?>
<#setting locale="es_MX">
<cfdi:Addenda>
    <requestForPayment
            type = "SimpleInvoiceType"
            contentVersion = "1.3.1"
            documentStructureVersion = "AMC7.1"
            documentStatus = "ORIGINAL"
            DeliveryDate = "${transaction.trandate?string.iso_nz}">
        <requestForPaymentIdentification>
            <entityType>INVOICE</entityType>
            <uniqueCreatorIdentification>${transaction.tranid}</uniqueCreatorIdentification>
        </requestForPaymentIdentification>
        <orderIdentification>
            <referenceIdentification type = "ON">${transaction.custbody_efx_fe_add_num_pedido}</referenceIdentification>
        </orderIdentification>
        <AdditionalInformation>
            <referenceIdentification type = "ON">${transaction.custbody_efx_fe_add_num_pedido}</referenceIdentification>
        </AdditionalInformation>
        <buyer>
            <gln>${customer.custentity_efx_fe_add_bgln_hd}</gln>
            <#--  <gln>${shipaddress.custrecord_efx_fe_buyer_gln}</gln>  -->
        </buyer>
        <seller>
            <#--  <#if transaction.custbody_efx_fe_add_hd_seller>
                <gln>${transaction.custbody_efx_fe_add_hd_seller}</gln>
                <#else>  -->
                    <gln>${customer.custentity_efx_fe_add_sgln_hd}</gln>
            <#--  </#if>  -->
            <alternatePartyIdentification type = "SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">${customer.custentity_efx_fe_add_intnum_hd}</alternatePartyIdentification>
        </seller>
        <currency currencyISOCode = "${transaction.currencysymbol}">
            <currencyFunction>BILLING_CURRENCY</currencyFunction>
            <rateOfChange>${transaction.exchangerate?keep_after("$")}</rateOfChange>
        </currency>
        <#assign linea = 0>
        <#list transaction.item as item>
            <#assign linea = linea+1>
        <lineItem number = "${linea}" type = "SimpleInvoiceLineItemType">
            <tradeItemIdentification>
                <gtin>${item.custcol_efx_fe_upc_code}</gtin>
            </tradeItemIdentification>
            <alternateTradeItemIdentification type = "GLOBAL_TRADE_ITEM_IDENTIFICATION">${item.custcol_efx_fe_upc_code}</alternateTradeItemIdentification>
            <tradeItemDescriptionInformation language = "ES">
                <longText>${item.item}</longText>
            </tradeItemDescriptionInformation>
            <invoicedQuantity unitOfMeasure = "${item.units}">${nsformat_rate(item.quantity)?keep_after("$")}</invoicedQuantity>
            <grossPrice>
                <Amount>${item.rate?keep_after("$")}</Amount>
            </grossPrice>
            <palletInformation>
                <palletQuantity>${item.custcol_efx_empaquetado}</palletQuantity>
                <description type = "EXCHANGE_PALLETS">${item.custcol_efx_descripcionempaquetado}</description>
                <transport>
                    <methodOfPayment>PREPAID_BY_SELLER</methodOfPayment>
                </transport>
            </palletInformation>
            <#assign taxjsonnoev = item.custcol_efx_fe_tax_json>
            <#assign taxjson = taxjsonnoev?eval>
            <#assign tipoImp = "">
            <#if taxjson.iva.name?has_content>
                <#assign tipoImp = "VAT">
            <tradeItemTaxInformation>
                <taxTypeDescription>${tipoImp}</taxTypeDescription>
                <tradeItemTaxAmount>
                    <taxPercentage>${taxjson.iva.rate?number?string["0.00"]}</taxPercentage>
                    <taxAmount>${taxjson.iva.importe}</taxAmount>
                </tradeItemTaxAmount>
            </tradeItemTaxInformation>
            </#if>
            <totalLineAmount>
                <netAmount>
                    <Amount>${item.amount?keep_after("$")?number?string["0.00"]}</Amount>
                </netAmount>
            </totalLineAmount>
        </lineItem>
        </#list>
        <#assign jsontotalnoev = transaction.custbody_efx_fe_tax_json>
            <#if jsontotalnoev?has_content>
            <#assign jsontotal = jsontotalnoev?eval>
            <#assign json_ivas = jsontotal.rates_iva_data>
        </#if>
        <totalAmount><Amount>${jsontotal.subtotal}</Amount></totalAmount>
        <TotalAllowanceCharge allowanceOrChargeType = "ALLOWANCE">
            <Amount>${jsontotal.descuentoSinImpuesto}</Amount>
        </TotalAllowanceCharge>
        <baseAmount>
            <Amount>${jsontotal.subtotal}</Amount>
        </baseAmount>
        <#list json_ivas as Iva_rate, Iva_total>
            <tax type = "VAT">
                <#--  <taxPercentage>${nsformat_rate(Iva_rate?number / 100)?keep_after("$")}</taxPercentage>  -->
                <taxPercentage>${nsformat_rate(Iva_rate?number)?keep_after("$")}</taxPercentage>
                <taxAmount>${Iva_total}</taxAmount>
                <taxCategory>TRANSFERIDO</taxCategory>
            </tax>
        </#list>
        <payableAmount>
            <Amount>${transaction.total?keep_after("$")}</Amount>
        </payableAmount>
    </requestForPayment>
</cfdi:Addenda>