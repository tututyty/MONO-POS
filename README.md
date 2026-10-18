# MoNo POS — bản khởi tạo kiểm thử

Bản này gồm PWA bán hàng, lưu đơn cục bộ bằng IndexedDB, bộ nhớ đệm Service Worker, cấu trúc Google Sheets và phần đồng bộ qua Google Sheets API. **Chưa phải bản nghiệm thu dùng kinh doanh thật**: menu/giá vốn đang là DEMO, chưa kiểm thử trên điện thoại của bạn và cần cấu hình Google OAuth.

## Có gì trong bản này
- `index.html`, `styles.css`, `app.js`: giao diện tiếng Việt, chọn món, giỏ hàng, tăng/giảm số lượng, chọn phương thức thanh toán, lưu đơn, lịch sử và hủy đơn.
- `sw.js`, `manifest.webmanifest`: nền tảng PWA và cache app shell để mở lại khi offline sau lần tải online đầu tiên.
- `Code.gs`: chạy một lần để tạo các tab Google Sheets mẫu.
- Đơn được ghi vào IndexedDB trước khi thử đồng bộ. Mã đơn UUID; trước khi append, app đọc danh sách ID đã có để tránh gửi trùng khi retry thông thường.

## Cảnh báo quan trọng
1. Dữ liệu menu trong `app.js` và `Code.gs` là dữ liệu mẫu. Giá vốn mẫu hiện là một con số tổng/ly, chưa phải phép tính định lượng từ công thức nguyên liệu. Không dùng báo cáo lợi nhuận để quyết định kinh doanh cho đến khi nhập định lượng thật.
2. Đồng bộ hiện là phiên bản MVP, dùng Google Sheets API từ trình duyệt sau khi người dùng tự đăng nhập OAuth. Nếu nhiều thiết bị cùng tạo/đồng bộ đơn hoặc xảy ra lỗi đúng lúc máy chủ đã ghi nhưng phản hồi chưa về, kiểm tra ID trước khi ghi giúp giảm trùng nhưng chưa phải cơ chế giao dịch nguyên tử tuyệt đối. Muốn đảm bảo chống trùng ở máy chủ khi nhiều thiết bị hoạt động đồng thời, cần lớp backend có khóa/idempotency phía máy chủ.
3. App cần mạng để đăng nhập Google và đồng bộ. Offline chỉ áp dụng sau khi app đã được tải/cache và IndexedDB đã hoạt động. Service Worker không cache Google API hay thư viện Google Identity; các thao tác này cần mạng.
4. Trình duyệt có thể xóa dữ liệu website; IndexedDB không thay thế sao lưu. Đồng bộ thường xuyên và xuất bản sao bảng tính.
5. Đơn hủy được giữ trong lịch sử. Bản MVP đồng bộ trạng thái hủy sau khi tìm thấy dòng đơn trên Sheet; cần kiểm thử thực tế trước khi tin dùng.

## Cài đặt PWA miễn phí qua GitHub Pages
1. Tạo một repository GitHub mới, ví dụ `mono-pos`. Tải toàn bộ file trong thư mục này lên nhánh `main` ở thư mục gốc.
2. Vào **Settings → Pages**, chọn triển khai từ nhánh `main`, thư mục `/(root)`. Chờ GitHub cấp URL HTTPS.
3. Mở URL trên Chrome Android khi có mạng, chọn menu trình duyệt → **Thêm vào màn hình chính** hoặc **Cài đặt ứng dụng**.
4. Mở app online ít nhất một lần để tải giao diện. Sau đó bật chế độ máy bay và thử tạo đơn; tắt hẳn/mở lại app để kiểm tra đơn còn hay không.

## Tạo bảng Google Sheets
1. Tạo một Google Spreadsheet mới trong tài khoản của bạn, để quyền riêng tư mặc định (không bật “Anyone with the link”).
2. Mở **Extensions → Apps Script**, dán nội dung `Code.gs`, lưu, chọn hàm `setupMoNoSheets` và chạy. Xác nhận quyền Google khi được hỏi. Hàm này tạo tab: `Products`, `Ingredients`, `Recipes`, `Orders`, `OrderItems`, `Expenses`, `DailyReport`.
3. Lưu Spreadsheet ID trong URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
4. Bật Google Sheets API trong Google Cloud project của bạn.
5. Tạo OAuth Client ID loại **Web application**. Thêm đúng URL GitHub Pages của app vào **Authorized JavaScript origins**. Chỉ cần Client ID; không đặt client secret trong app.
6. Trên app, nhập Client ID và Spreadsheet ID, bấm **Lưu cấu hình**, sau đó **Đăng nhập Google** và cấp quyền xem/sửa Google Sheets theo màn hình của Google.
7. Tạo thử đơn khi có mạng rồi kiểm tra tab `Orders` và `OrderItems`.

## Cấu trúc dữ liệu
- `Orders`: một dòng cho mỗi đơn; giữ doanh thu và tổng giá vốn snapshot tại thời điểm bán.
- `OrderItems`: một dòng cho mỗi món trong đơn; lưu tên, size, số lượng, giá bán snapshot, giá vốn snapshot và doanh thu dòng.
- `Products`: menu và giá bán/giá vốn hiện hành.
- `Ingredients`, `Recipes`: nền tảng nhập nguyên liệu và định lượng.
- `Expenses`: chi phí kinh doanh phát sinh (ví dụ tiền đá), tách khỏi giá vốn đồ uống để tránh tính trùng.
- `DailyReport`: báo cáo ngày mẫu; doanh thu, số ly, giá vốn và chi phí được tổng hợp theo ngày. Cần xác minh công thức trên bảng thật và thêm báo cáo tuần/tháng trước khi nghiệm thu.

## Quy tắc tính tiền
- Doanh thu thuần đơn hợp lệ = tổng `qty × unit_price_snapshot` của đơn không bị hủy.
- Giá vốn đồ uống = tổng `qty × unit_cost_snapshot` của đơn không bị hủy.
- Lãi gộp = doanh thu − giá vốn đồ uống.
- Lợi nhuận sau chi phí ghi nhận = lãi gộp − chi phí vận hành trong `Expenses`.
- Không nhập tiền mua đá vào cả định lượng cost từng ly lẫn chi phí vận hành nếu cùng một khoản chi; chọn một cách hạch toán nhất quán.

## Kiểm thử cần làm trước khi dùng thật
- Tạo đơn có nhiều món, kiểm tra tổng và chi tiết.
- Tắt mạng, tạo đơn, đóng/mở app, xác nhận đơn còn và bộ đếm chờ đồng bộ tăng.
- Bật mạng, đăng nhập và đồng bộ; kiểm tra đơn chỉ có một ID.
- Bấm đồng bộ lại nhiều lần; kiểm tra không phát sinh ID đơn trùng.
- Thử hủy đơn đã đồng bộ và đơn chưa đồng bộ; kiểm tra trạng thái trên máy và Sheet.
- Đổi giá sản phẩm sau một đơn; xác nhận snapshot cũ không đổi.
- Xuất bản sao Google Sheets và thử mở file sao lưu.

## Trạng thái nghiệm thu hiện tại
- Đã tạo bộ mã nguồn ban đầu.
- Đã có giao diện bán hàng và lưu cục bộ bằng IndexedDB trong mã.
- Chưa thực thi kiểm thử offline trên thiết bị Android thực tế.
- Chưa xác thực OAuth hoặc kết nối bảng tính của bạn.
- Chưa xác nhận chống trùng tuyệt đối khi đồng bộ đồng thời từ nhiều thiết bị.
- Chưa hoàn tất công thức báo cáo giá vốn theo định lượng nguyên liệu; không xem bản này là sổ kế toán chính thức.
