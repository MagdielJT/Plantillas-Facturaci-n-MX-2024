/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/xml'], function (xml) {


            function createPDF(contenidoXML,borraPrefijo) {

                log.audit({title:'borraPrefijo1',details:borraPrefijo});
                log.audit({title:'contenidoXML',details:contenidoXML});


                try {
                        var obj = Object.create(null);

                        if (contenidoXML.nodeType == xml.NodeType.ELEMENT_NODE) { // elemento
                            if (contenidoXML.hasAttributes()) {
                                obj['atributos'] = Object.create(null);
                                for (var j in contenidoXML.attributes) {
                                    if(contenidoXML.hasAttribute({name : j})){
                                        obj['atributos'][j] = contenidoXML.getAttribute({
                                            name : j
                                        });
                                    }
                                }
                            }
                        } else if (contenidoXML.nodeType == xml.NodeType.TEXT_NODE) { // Nodo
                            if(borraPrefijo){
                                var prefijo = contenidoXML.prefix;
                                    obj = (contenidoXML.nodeValue).replace(prefijo,'');
                            }else{
                                    obj = (contenidoXML.nodeValue);
                            }

                        }

                        // hijos
                        if (contenidoXML.hasChildNodes()) {
                            for (var i = 0, childLen = contenidoXML.childNodes.length; i < childLen; i++) {
                                var childItem = contenidoXML.childNodes[i];
                                if(borraPrefijo){
                                    log.audit({title:'borraPrefijo',details:borraPrefijo});
                                    var prefijo = childItem.prefix + ':';
                                    log.audit({title:'prefijo',details:prefijo});
                                    var nodeName = childItem.nodeName.replace(prefijo,'');
                                }else{
                                    var nodeName = childItem.nodeName;
                                }

                                if (nodeName in obj) {
                                    if (!Array.isArray(obj[nodeName])) {
                                        obj[nodeName] = [
                                            obj[nodeName]
                                        ];
                                    }
                                    obj[nodeName].push(createPDF(childItem,borraPrefijo));
                                } else {
                                    obj[nodeName] = createPDF(childItem,borraPrefijo);
                                }
                            }
                        }
                        return obj;


                } catch (e) {
                    log.audit({title:'e',details:e});
                }
    }

    return {
        createPDF: createPDF
    };
});