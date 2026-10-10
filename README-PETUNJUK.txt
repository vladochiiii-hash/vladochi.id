VLA DOCHI — WEBSITE DENGAN PESANAN EMAIL OTOMATIS
=================================================

FUNGSI
- Pembeli memilih donat dan mengisi detail pesanan di website.
- Saat menekan tombol KIRIM PESANAN, website mengirim data ke Netlify Function.
- Backend mengirim email pesanan melalui Resend ke: vladochiiii@gmail.com
- API key email disimpan di Environment Variables Netlify, bukan di HTML publik.

PENTING
Kode sudah disiapkan, tetapi email otomatis tidak akan aktif sampai Anda melakukan konfigurasi Resend dan Netlify berikut. Saya tidak dapat masuk atau mengubah akun Netlify/Resend Anda dari sini.

LANGKAH PENGAKTIFAN
1. Ekstrak ZIP ini ke komputer.
2. Login ke Netlify: https://app.netlify.com/
3. Deploy folder hasil ekstrak yang berisi index.html, netlify.toml, dan folder netlify/ (bukan hanya index.html).
4. Buat/login akun Resend: https://resend.com/
5. Di Resend, tambahkan dan verifikasi domain pengirim yang Anda miliki. Ikuti instruksi DNS dari Resend. Pengirim harus menggunakan domain yang sudah diverifikasi; jangan memakai Gmail pembeli sebagai alamat From.
6. Buat API key di Resend. Simpan rahasia ini dan jangan bagikan.
7. Di Netlify, buka Site configuration / Project configuration → Environment variables, lalu tambahkan:
   RESEND_API_KEY = API key Resend Anda
   RESEND_FROM_EMAIL = VLA DOCHI <pesanan@domain-anda-yang-terverifikasi>
   Ganti alamat contoh tersebut dengan alamat pengirim dari domain yang sudah diverifikasi di Resend.
8. Simpan, lalu jalankan redeploy: Deploys → Trigger deploy → Deploy site.
9. Buka URL website Netlify, lakukan pesanan percobaan, lalu cek Inbox dan Spam/Junk email vladochiiii@gmail.com.

TUJUAN EMAIL
Email tujuan saat ini disetel ke vladochiiii@gmail.com pada file netlify/functions/order.js.
Jika alamat ini bukan email yang ingin menerima pesanan, ubah nilai EMAIL_TO di file tersebut sebelum deploy.

CATATAN
- Situs perlu di-deploy di Netlify agar fungsi /.netlify/functions/order dapat berjalan.
- Membuka index.html langsung dari komputer tidak akan mengirim email otomatis.
- Tidak ada pembayaran online di website ini.
- Harga dihitung ulang di backend: Rp11.000 per donat tanpa crunch dan Rp14.000 dengan crunch.
- Jangan pernah menaruh RESEND_API_KEY di index.html atau membagikannya kepada pembeli.
- Jika email gagal terkirim, website menampilkan pesan gagal dan pesanan tidak dihapus dari keranjang.
