/**
 * @NApiVersion 2.1
 */
define(['N/log', '../CFDI Traslado/Lib/_mxplus_itemfulfillment_functions'],
    /**
 * @param{log} log
 */
    (log,itemfulfillmentFunctions) => {

        const stampItemFulfillment = (idTransaction, recordType) => {
            var data_to_return = {
                success: true,
                msg: ''
            }

            try {
                let data_to_stamp={}

                data_to_stamp = itemfulfillmentFunctions.stampCFDIItemfulfillment(idTransaction, recordType);

                return data_to_stamp;
            } catch (err) {
                log.error({ title: 'Error occurred in stampItemFulfillment', details: err });
            }
            return data_to_return
        }

        return {stampItemFulfillment}

    });
