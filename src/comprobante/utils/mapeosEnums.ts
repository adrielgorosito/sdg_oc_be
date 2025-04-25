import {
  RedDePago,
  TipoMedioDePagoEnum,
} from 'src/medio-de-pago/enum/medio-de-pago.enum';
import { CondicionIva } from '../enums/condicion-iva.enum';
import { TipoComprobante } from '../enums/tipo-comprobante.enum';

export const mapeoTipoComprobante = {
  1: 'FACTURA A',
  2: 'NOTA DE DÉBITO A',
  3: 'NOTA DE CRÉDITO A',
  6: 'FACTURA B',
  7: 'NOTA DE DÉBITO B',
  8: 'NOTA DE CRÉDITO B',
  11: 'FACTURA C',
  12: 'NOTA DE DÉBITO C',
  13: 'NOTA DE CRÉDITO C',
  51: 'FACTURA M',
  52: 'NOTA DE DÉBITO M',
  53: 'NOTA DE CRÉDITO M',
};

export const mapeoCondicionIVA = {
  1: 'Responsable Inscripto',
  4: 'Exento',
  5: 'Consumidor Final',
  6: 'Monotributista',
  7: 'Gravado',
  8: 'No Gravado',
};

export const mapeoTipoComprobanteSegunCondicionIvaCliente = {
  [CondicionIva.RESPONSABLE_INSCRIPTO]: [
    TipoComprobante.FACTURA_A,
    TipoComprobante.NOTA_CREDITO_A,
    TipoComprobante.NOTA_DEBITO_A,
  ],
  [CondicionIva.MONOTRIBUTISTA]: [
    TipoComprobante.FACTURA_A,
    TipoComprobante.NOTA_CREDITO_A,
    TipoComprobante.NOTA_DEBITO_A,
  ],
  [CondicionIva.CONSUMIDOR_FINAL]: [
    TipoComprobante.FACTURA_B,
    TipoComprobante.NOTA_CREDITO_B,
    TipoComprobante.NOTA_DEBITO_B,
  ],
  [CondicionIva.EXENTO]: [
    TipoComprobante.FACTURA_B,
    TipoComprobante.NOTA_CREDITO_B,
    TipoComprobante.NOTA_DEBITO_B,
  ],
};

export const mapeoTipoMedioDePago = {
  [TipoMedioDePagoEnum.EFECTIVO]: 'Efectivo',
  [TipoMedioDePagoEnum.CHEQUE]: 'Cheque',
  [TipoMedioDePagoEnum.TARJETA_DEBITO]: 'Tarjeta de Débito',
  [TipoMedioDePagoEnum.TARJETA_CREDITO]: 'Tarjeta de Crédito',
  [TipoMedioDePagoEnum.TRANSFERENCIA_BANCARIA]: 'Transferencia Bancaria',
  [TipoMedioDePagoEnum.CUENTA_CORRIENTE]: 'Cuenta Corriente',
  [TipoMedioDePagoEnum.OTRO]: 'Otro',
};
export const mapeoRedDePago = {
  [RedDePago.VISA]: 'VISA',
  [RedDePago.MASTERCARD]: 'MASTERCARD',
  [RedDePago.AMERICAN_EXPRESS]: 'AMERICAN EXPRESS',
  [RedDePago.NARANJA]: 'NARANJA',
  [RedDePago.MERCADOPAGO]: 'MERCADO PAGO',
};
