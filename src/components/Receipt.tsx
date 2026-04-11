import { useState } from "react";
import { Printer, X } from "lucide-react";

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (receipt: ReceiptData) => void;
}

interface ReceiptData {
  customerName: string;
  customerPhone: string;
  service: string;
  price: number;
  paymentMethod: 'cash' | 'transfer' | 'card';
  observation?: string;
}

const Receipt = ({ isOpen, onClose, onSave }: ReceiptProps) => {
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    customerName: '',
    customerPhone: '',
    service: '',
    price: 0,
    paymentMethod: 'cash',
    observation: ''
  });

  const currentDate = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSave) {
      onSave(receiptData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Generar Boleta</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-6 bg-gray-50">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-inner">
            {/* Logo and Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="mr-4">
                  <h2 className="text-2xl font-bold text-primary">NeneStyle</h2>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">BOLETA</h1>
                  <p className="text-sm text-gray-500">{currentDate}</p>
                </div>
              </div>
            </div>

            {/* Customer Data */}
            <div className="mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-700 mb-2">Datos del Cliente</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nombre:</span> {receiptData.customerName || '________________'}</p>
                <p><span className="font-medium">Teléfono:</span> {receiptData.customerPhone || '________________'}</p>
              </div>
            </div>

            {/* Detail */}
            <div className="mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-700 mb-2">Detalle</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Servicio/Producto:</span> {receiptData.service || '________________'}</p>
                <p><span className="font-medium">Precio:</span> ${receiptData.price.toLocaleString('es-CL')}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-700 mb-2">Método de Pago</h3>
              <p className="text-sm">
                <span className="font-medium">
                  {receiptData.paymentMethod === 'cash' ? 'Efectivo' :
                   receiptData.paymentMethod === 'transfer' ? 'Transferencia' : 'Tarjeta'}
                </span>
              </p>
            </div>

            {/* Total */}
            <div className="mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-700 mb-2">Total</h3>
              <p className="text-2xl font-bold text-gray-900">${receiptData.price.toLocaleString('es-CL')}</p>
            </div>

            {/* Observation */}
            {receiptData.observation && (
              <div className="mb-2">
                <h3 className="font-semibold text-gray-700 mb-2">Observación</h3>
                <p className="text-sm text-gray-600">{receiptData.observation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cliente
            </label>
            <input
              type="text"
              value={receiptData.customerName}
              onChange={(e) => setReceiptData({ ...receiptData, customerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ingrese nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={receiptData.customerPhone}
              onChange={(e) => setReceiptData({ ...receiptData, customerPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+56 9 XXXX XXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicio / Producto
            </label>
            <input
              type="text"
              value={receiptData.service}
              onChange={(e) => setReceiptData({ ...receiptData, service: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Descripción del servicio o producto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio
            </label>
            <input
              type="number"
              value={receiptData.price}
              onChange={(e) => setReceiptData({ ...receiptData, price: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash"
                  checked={receiptData.paymentMethod === 'cash'}
                  onChange={(e) => setReceiptData({ ...receiptData, paymentMethod: e.target.value as any })}
                  className="mr-2"
                />
                <span className="text-sm">Efectivo</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="transfer"
                  checked={receiptData.paymentMethod === 'transfer'}
                  onChange={(e) => setReceiptData({ ...receiptData, paymentMethod: e.target.value as any })}
                  className="mr-2"
                />
                <span className="text-sm">Transferencia</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card"
                  checked={receiptData.paymentMethod === 'card'}
                  onChange={(e) => setReceiptData({ ...receiptData, paymentMethod: e.target.value as any })}
                  className="mr-2"
                />
                <span className="text-sm">Tarjeta</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observación (Opcional)
            </label>
            <textarea
              value={receiptData.observation}
              onChange={(e) => setReceiptData({ ...receiptData, observation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Observaciones adicionales..."
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
