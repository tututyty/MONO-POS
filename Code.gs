/** MoNo POS - Google Apps Script: chạy setupMoNoSheets() một lần để tạo cấu trúc bảng. */
function setupMoNoSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const definitions = {
    'Products': [['product_id','name','category','size','selling_price','unit_cost','active','note'],
      ['cf-den','Cà phê đen','Cà phê','Mặc định',15000,5000,true,'DEMO - thay bằng giá thật'],
      ['cf-sua','Cà phê sữa','Cà phê','Mặc định',18000,7000,true,'DEMO - thay bằng giá thật'],
      ['bac-xiu','Bạc xỉu','Cà phê','Mặc định',22000,9000,true,'DEMO - thay bằng giá thật'],
      ['cf-caramel','Cà phê caramel','Cà phê','Mặc định',23000,10000,true,'DEMO - thay bằng giá thật'],
      ['matcha-sua','Matcha sữa','Matcha','Mặc định',25000,12000,true,'DEMO - thay bằng giá thật'],
      ['matcha-dua','Matcha dừa','Matcha','Mặc định',28000,14000,true,'DEMO - thay bằng giá thật'],
      ['cacao-deo','Cacao dẻo latte','Cacao','Mặc định',25000,11000,true,'DEMO - thay bằng giá thật'],
      ['tra-tac','Trà tắc','Trà','Mặc định',15000,5000,true,'DEMO - thay bằng giá thật'],
      ['tra-vai','Trà vải','Trà','Mặc định',23000,10000,true,'DEMO - thay bằng giá thật']],
    'Ingredients': [['ingredient_id','name','unit','purchase_cost','purchase_qty','unit_cost','supplier','note'], ['DEMO-01','Nguyên liệu mẫu','g',0,1,'=IFERROR(D2/E2,0)','','Thay bằng nguyên liệu thật']],
    'Recipes': [['product_id','ingredient_id','qty_per_serving','unit','ingredient_unit_cost','line_cost','note'], ['cf-den','DEMO-01',1,'g','=IFERROR(VLOOKUP(B2,Ingredients!A:F,6,FALSE),0)','=C2*E2','Mẫu; thay định lượng thật']],
    'Orders': [['order_id','created_at_utc','updated_at_utc','status','payment_method','total_revenue','total_cups','note','schema_version','total_drink_cogs','synced_at']],
    'OrderItems': [['order_id','line_no','product_id','product_name_snapshot','category_snapshot','size_snapshot','qty','unit_price_snapshot','unit_cost_snapshot','line_revenue']],
    'Expenses': [['expense_id','date','category','description','amount','payment_method','note'], ['EXP-DEMO-001',new Date(),'Đá','Dữ liệu ví dụ - xóa hoặc sửa trước khi dùng',0,'Tiền mặt','DEMO']],
    'DailyReport': [['date','revenue','cups_sold','drink_cogs','gross_profit_before_expenses','operating_expenses','profit_after_expenses'], ['=TODAY()','=SUMIFS(Orders!F:F,Orders!B:B,">="&A2,Orders!B:B,"<"&A2+1,Orders!D:D,"<>CANCELLED")','=SUMIFS(Orders!G:G,Orders!B:B,">="&A2,Orders!B:B,"<"&A2+1,Orders!D:D,"<>CANCELLED")','=SUMPRODUCT((LEFT(Orders!B2:B,10)=TEXT(A2,"yyyy-mm-dd"))*(Orders!D2:D<>"CANCELLED")*Orders!J2:J)','=B2-D2','=SUMIFS(Expenses!E:E,Expenses!B:B,">="&A2,Expenses!B:B,"<"&A2+1)','=E2-F2']]
  };
  Object.keys(definitions).forEach(name => {
    let sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.clearContents();
    const rows = definitions[name];
    sh.getRange(1,1,rows.length,rows[0].length).setValues(rows);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,rows[0].length).setFontWeight('bold').setBackground('#222222').setFontColor('#f5f2ea');
    sh.autoResizeColumns(1, rows[0].length);
  });
  ss.toast('Đã tạo cấu trúc MoNo POS. Nhớ thay dữ liệu DEMO trước khi bán thật.');
}
