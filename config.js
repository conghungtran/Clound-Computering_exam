// ====== THÔNG TIN CÁ NHÂN HÓA: sửa 2 dòng dưới cho đúng của bạn ======
const FULL_NAME = 'TRAN_CONG_HUNG';
const MSSV = '22IT123';
// ======================================================================

module.exports = {
  FULL_NAME,
  MSSV,
  DB_NAME: `DB_${MSSV}`,
  PREFIX: MSSV.slice(-3),                 // 3 số cuối MSSV -> tiền tố mã sách
  VAT: Number(MSSV.slice(-1)) + 5,        // VAT (%) = chữ số cuối + 5
};
