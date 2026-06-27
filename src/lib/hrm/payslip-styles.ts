export const PAYSLIP_EMBEDDED_STYLES = `
.pslip { font-family: Inter, system-ui, -apple-system, sans-serif; color: #1e293b; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; position: relative; max-width: 760px; margin: 0 auto; }
.pslip-watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: 0.04; }
.pslip-watermark svg { width: 180px; height: 180px; }
.pslip-header { position: relative; display: flex; justify-content: space-between; gap: 16px; padding: 24px 28px; border-bottom: 1px solid #f1f5f9; }
.pslip-brand { display: flex; gap: 12px; align-items: flex-start; min-width: 0; }
.pslip-logo { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; overflow: hidden; }
.pslip-company { font-size: 17px; font-weight: 700; color: #334155; margin: 0; line-height: 1.3; }
.pslip-address { font-size: 11px; color: #64748b; margin: 4px 0 0; line-height: 1.5; max-width: 320px; }
.pslip-meta { text-align: right; flex-shrink: 0; }
.pslip-badge { display: inline-block; background: #166534; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 5px 12px; border-radius: 999px; }
.pslip-period { font-size: 14px; font-weight: 700; color: #0f172a; margin: 10px 0 2px; }
.pslip-paydate { font-size: 11px; color: #64748b; margin: 0; }
.pslip-employee { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 16px; padding: 20px 28px; border-bottom: 1px solid #f1f5f9; }
.pslip-field-label { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; margin: 0 0 4px; }
.pslip-field-value { font-size: 13px; font-weight: 600; color: #0f172a; margin: 0; }
.pslip-tables { position: relative; display: grid; grid-template-columns: 1fr 1fr; }
.pslip-table-col { border-right: 1px solid #f1f5f9; }
.pslip-table-col:last-child { border-right: none; }
.pslip-table-head { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 8px 20px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; }
.pslip-table-head span:last-child { text-align: right; }
.pslip-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 10px 20px; border-bottom: 1px solid #f8fafc; font-size: 13px; }
.pslip-row span:first-child { color: #475569; }
.pslip-row span:last-child { text-align: right; font-weight: 500; color: #0f172a; font-variant-numeric: tabular-nums; }
.pslip-row-ded span:last-child { color: #e11d48; }
.pslip-total-earn { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 12px 20px; background: #ecfdf5; font-size: 13px; font-weight: 700; color: #166534; }
.pslip-total-earn span:last-child { text-align: right; font-variant-numeric: tabular-nums; }
.pslip-total-ded { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 12px 20px; background: #fff1f2; font-size: 13px; font-weight: 700; color: #be123c; }
.pslip-total-ded span:last-child { text-align: right; font-variant-numeric: tabular-nums; }
.pslip-net { position: relative; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 28px; background: #166534; color: #fff; }
.pslip-net-left { min-width: 0; }
.pslip-net-label { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 6px; opacity: 0.9; }
.pslip-net-words { font-size: 12px; font-weight: 500; margin: 0; line-height: 1.45; opacity: 0.95; }
.pslip-net-amount { font-size: 28px; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pslip-footer { position: relative; padding: 10px 28px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
@media (max-width: 640px) {
  .pslip-employee { grid-template-columns: 1fr; }
  .pslip-tables { grid-template-columns: 1fr; }
  .pslip-table-col { border-right: none; border-bottom: 1px solid #f1f5f9; }
  .pslip-net { flex-direction: column; align-items: flex-start; }
}
@media print {
  .pslip { border: none; border-radius: 0; box-shadow: none; max-width: none; }
}
`;
