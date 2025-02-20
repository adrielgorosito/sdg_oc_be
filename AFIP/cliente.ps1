#
# Ejemplo de cliente del WSAA (webservice de autenticacion y autorizacion). 
# Consume el metodo LoginCms ejecutando desde la Powershell de Windows. 
# Muestra en stdout el login ticket response.
#
# REQUISITOS: openssl
#
# Parametros de linea de comandos:
#
#   $Certificado: Archivo del certificado firmante a usar
#   $ClavePrivada: Archivo de clave privada a usar
#   $ServicioId: ID de servicio a acceder
#   $OutXml: Archivo TRA a crear
#   $OutCms: Archivo CMS a crear
#   $WsaaWsdl: URL del WSDL del WSAA
#
[CmdletBinding()]
Param(
   [Parameter(Mandatory=$False)]
   [string]$Certificado="certificado.crt",
	
   [Parameter(Mandatory=$False)]
   [string]$ClavePrivada="ClavePrivada.key",
   
   [Parameter(Mandatory=$False)]
   [string]$ServicioId="wsfe",
   
   [Parameter(Mandatory=$False)]
   [string]$OutXml="LoginTicketRequest.xml",   
   
   [Parameter(Mandatory=$False)]
   [string]$OutCms="LoginTicketRequest.xml.cms",   

   [Parameter(Mandatory=$False)]
   [string]$WsaaWsdl = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL"    
)

$ErrorActionPreference = "Stop"

# PASO 1: ARMAR EL XML DEL TICKET DE ACCESO
$dtNow = Get-Date 
$xmlTA = New-Object System.XML.XMLDocument
$xmlTA.LoadXml('<loginTicketRequest><header><uniqueId></uniqueId><generationTime></generationTime><expirationTime></expirationTime></header><service></service></loginTicketRequest>')
$xmlUniqueId = $xmlTA.SelectSingleNode("//uniqueId")
$xmlGenTime = $xmlTA.SelectSingleNode("//generationTime")
$xmlExpTime = $xmlTA.SelectSingleNode("//expirationTime")
$xmlService = $xmlTA.SelectSingleNode("//service")
$xmlGenTime.InnerText = $dtNow.AddMinutes(-10).ToString("s")
$xmlExpTime.InnerText = $dtNow.AddMinutes(+100).ToString("s")
$xmlUniqueId.InnerText = $dtNow.ToString("yyMMddHHMM")
$xmlService.InnerText = $ServicioId
$seqNr = Get-Date -UFormat "%Y%m%d%H%S"
$xmlTA.InnerXml | Out-File $seqNr-$OutXml -Encoding ASCII

# PASO 2: FIRMAR CMS
openssl cms -sign -in $seqNr-$OutXml -signer $Certificado -inkey $ClavePrivada -nodetach -outform der -out $seqNr-$OutCms-DER

# PASO 3: ENCODEAR EL CMS EN BASE 64
openssl base64 -in $seqNr-$OutCms-DER -e -out $seqNr-$OutCms-DER-b64

# PASO 3: INVOCAR AL WSAA
try
{
   $cms = Get-Content $seqNr-$OutCms-DER-b64 -Raw
$cms > "content.txt"
   $wsaa = New-WebServiceProxy -Uri $WsaaWsdl -ErrorAction Stop
   $wsaaResponse = $wsaa.loginCms($cms) 
   $wsaaResponse > $seqNr-loginTicketResponse.xml 
   $wsaaResponse
}
catch
{
   $errMsg = $_.Exception.Message
   $errMsg > $seqNr-loginTicketResponse-ERROR.xml 
   $errMsg
}