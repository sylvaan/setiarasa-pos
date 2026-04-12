import * as XLSX from "xlsx";
import type { Order, Expense } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Exports a comprehensive business report with 3 sheets:
 * 1. Ringkasan (Overall summary and net profit)
 * 2. Pendapatan (Detailed order/item breakdown)
 * 3. Pengeluaran (Detailed expense tracking)
 */
export const exportBusinessReportToExcel = (orders: Order[], expenses: Expense[]) => {
  // 1. Data Sheet: Ringkasan (Overall)
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  const summaryData = [
    ["LAPORAN RINGKASAN BISNIS - MARTABAK SETIARASA"],
    ["Tanggal Laporan:", format(new Date(), "eeee, d MMMM yyyy", { locale: id })],
    [],
    ["METRIK KEUANGAN", "JUMLAH (IDR)"],
    ["Total Pendapatan (Revenue)", totalRevenue],
    ["Total Pengeluaran (Expense)", totalExpense],
    ["Laba Bersih (Net Profit)", netProfit],
    [],
    ["Status:", netProfit >= 0 ? "UNTUNG ✅" : "RUGI ⚠️"],
  ];

  // 2. Data Sheet: Pendapatan (Revenue)
  const revenueData = orders.flatMap((order) =>
    order.items.map((item) => ({
      Tanggal: format(new Date(order.timestamp), "yyyy-MM-dd HH:mm"),
      ID_Transaksi: order.id.slice(0, 8),
      Kategori: item.category === "manis" ? "Martabak Manis" : "Martabak Telor",
      Produk: item.name,
      Adonan: item.category === "manis" ? (item.selectedDough?.label || "Original") : "-",
      Topping: item.selectedToppings?.map((t) => t.label).join(", ") || "-",
      Tipe_Telur: item.eggType || "-",
      Level: item.level || "-",
      Qty: item.quantity,
      Harga_Satuan: item.totalItemPrice / item.quantity,
      Subtotal: item.totalItemPrice,
    }))
  );

  // 3. Data Sheet: Pengeluaran (Expenses)
  const expenseData = expenses.map((exp) => ({
    Tanggal: format(new Date(exp.timestamp), "yyyy-MM-dd HH:mm"),
    Kategori: exp.category,
    Keterangan: exp.title,
    Jumlah: exp.amount,
  }));

  // Create Worksheets
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  const wsRevenue = XLSX.utils.json_to_sheet(revenueData);
  const wsExpenses = XLSX.utils.json_to_sheet(expenseData);

  // Styling Column Widths
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 25 }];
  wsRevenue["!cols"] = [
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, 
    { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 10 }, 
    { wch: 5 }, { wch: 15 }, { wch: 15 }
  ];
  wsExpenses["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 35 }, { wch: 15 }];

  // Create Workbook and Append Sheets
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");
  XLSX.utils.book_append_sheet(wb, wsRevenue, "Pendapatan");
  XLSX.utils.book_append_sheet(wb, wsExpenses, "Pengeluaran");

  // Output File
  const fileName = `SetiaRasa_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
