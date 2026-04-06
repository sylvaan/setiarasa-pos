import * as XLSX from 'xlsx';
import type { Order } from '../types';

/**
 * Export orders data to an Excel file (.xlsx)
 * Flattens orders so each item is a separate row for better accounting.
 */
export const exportOrdersToExcel = (orders: Order[], fileName = 'Laporan_SetiaRasa_POS.xlsx') => {
  if (!orders || orders.length === 0) {
    alert('Tidak ada data transaksi untuk diekspor.');
    return;
  }

  // 1. Flatten the data: One row per item in an order
  const flattenedData = orders.flatMap(order => {
    return order.items.map(item => ({
      'ID Transaksi': order.id.split('-').slice(-1)[0],
      'Tanggal': new Date(order.timestamp).toLocaleDateString('id-ID'),
      'Waktu': new Date(order.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      'Kategori': item.category === 'manis' ? 'Martabak Manis' : 'Martabak Telor',
      'Produk': item.name,
      'Adonan': item.category === 'manis' ? (item.selectedDough?.label || 'Original') : '-',
      'Toppings': item.selectedToppings?.map(t => t.label).join(', ') || '-',
      'Qty': item.quantity,
      'Harga Satuan': item.totalItemPrice,
      'Total Item': item.totalItemPrice * item.quantity,
      'Total Transaksi': order.totalAmount,
      'Timestamp Asli': order.timestamp
    }));
  });

  // 2. Create the worksheet
  const worksheet = XLSX.utils.json_to_sheet(flattenedData);

  // 3. Set column widths for better readability
  const colWidths = [
    { wch: 15 }, // ID
    { wch: 12 }, // Tanggal
    { wch: 10 }, // Waktu
    { wch: 15 }, // Kategori
    { wch: 25 }, // Produk
    { wch: 15 }, // Adonan
    { wch: 30 }, // Toppings
    { wch: 5 },  // Qty
    { wch: 15 }, // Harga Satuan
    { wch: 15 }, // Total Item
    { wch: 15 }, // Total Transaksi
    { wch: 25 }, // Timestamp Asli
  ];
  worksheet['!cols'] = colWidths;

  // 4. Create the workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');

  // 5. Trigger the download
  XLSX.writeFile(workbook, fileName);
};
