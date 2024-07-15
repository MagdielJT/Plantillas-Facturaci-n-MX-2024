/**
 * @NApiVersion 2.1
 */
define(['N/https', 'N/log'], (https, log) => {
  const pwd = 'mQ*wP^e52K34'
  const prodURL = {
    services: 'https://services.sw.com.mx',
    apis: 'https://api.sw.com.mx'
  }
  const testURL = {
    services: 'https://services.test.sw.com.mx',
    apis: 'https://api.test.sw.com.mx'
  }
  const accessPoints = {
    authentication: '/security/authenticate',
    user_info: '/management/api/users/info',
    cancel_cfdi: '/cfdi33/cancel/',
    stamps: '/v3/cfdi33/issue/json/v4'
  }
  /**
   * La función resolveURL concatena una URL base con una URL de entrada.
   * @param base - El parámetro `base` en la función `resolveURL` es una cadena que representa la URL
   * base a la que se agregará el parámetro `entry`.
   * @param entry - El parámetro `entry` en la función `resolveURL` suele ser una cadena que representa
   * la ruta o el punto final que desea agregar a la URL `base`. Por ejemplo, si `base` es
   * `https://www.example.com` y `entry` es `/api/data`, la función
   * @returns La función `resolveURL` devuelve el resultado de concatenar los parámetros `base` y
   * `entry`.
   */
  const resolveURL = (base, entry) => {
    try {
      return base+entry
    } catch (error) {
      log.error('Error on resolveURL', error)
    }
  }
  /**
   * La función `getTokenAccess` envía una solicitud POST a un host específico con credenciales de
   * usuario y devuelve el cuerpo de la respuesta como JSON si está disponible.
   * @param host - El parámetro `host` suele ser la URL del servidor al que desea enviar la solicitud
   * para obtener el token de acceso. Debe ser una URL válida que comience con `http://` o `https://`.
   * @param email - El parámetro `email` en la función `getTokenAccess` se utiliza como identificador
   * de usuario que se incluirá en los encabezados de la solicitud al realizar una solicitud POST al
   * `host` especificado.
   * @returns La función `getTokenAccess` intenta realizar una solicitud POST al `host` especificado
   * con el `email` y la `pwd` (contraseña) proporcionados en los encabezados. Luego intenta analizar
   * el cuerpo de la respuesta como JSON y devolverlo, o devolver el cuerpo de la respuesta tal como
   * está si no se puede analizar. Si ocurre un error durante el proceso, registra el mensaje de error.
   */
  const getTokenAccess = (host, email) => {
    try {
      const req = https.request({
        method: https.Method.POST,
        url: host,
        body: {},
        headers: { user: email, password: pwd }
      })
      return req.body ? JSON.parse(req.body) : req.body
    } catch (error) {
      log.error('Error on getTokenAccess', error)
    }
  }
  return { testURL, prodURL, pwd, accessPoints, resolveURL, getTokenAccess }
})
