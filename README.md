# GiftList

Aplikasi pencatat ide hadiah. Simpan ide, pantau budget, dan dapatkan pengingat sebelum hari-H.

Dibuat dengan Expo SDK 58 (React Native) dan Expo Router. Semua data tersimpan di perangkat, tanpa server.

## Menjalankan

```bash
npm install
npx expo start
```

Tekan `i` untuk simulator iOS, `a` untuk emulator Android, `w` untuk web, atau scan QR dengan Expo Go (SDK 58).

## Fitur

### Sesuai desain

Home, Add Gift Idea, Gift Detail, Edit Gift Idea, dan hapus ide.

### Masukan dosen

| Masukan | Di aplikasi |
| --- | --- |
| Notifikasi seminggu sebelum | Notifikasi H-7 pukul 09.00 untuk hadiah yang belum dibeli. Bisa ditambah H-14, H-3, atau H-1, dan jamnya bisa diubah di Settings. Kalau acaranya kurang dari seminggu lagi, pengingat otomatis pindah ke H-1. |
| Simpan status sudah dibeli | Status Idea, Planned, Bought, Given. Tombol **Mark as Bought** menyimpan harga, tanggal beli, dan toko, lalu pengingat beli dibatalkan. |
| Ingatkan kembali | Setelah dibeli muncul **Remind me again**: hari-H, H-1, H-3, atau tanggal bebas, lengkap dengan jam dan catatan. Untuk acara tahunan ada juga **Remind me next year**. |

### Tambahan

- Tombol di notifikasi: **I bought it** dan **Remind me tomorrow**
- Halaman Reminders berisi hal yang perlu segera dilakukan dan semua jadwal
- Inspiration: ide hadiah menurut penerima dan budget, plus tombol **Surprise me**
- Budget: total terpakai, sisa belanja, penghematan, dan rincian per orang
- Halaman per orang berisi acara berikutnya dan riwayat hadiah
- Peringatan kalau hadiah yang sama sudah pernah diberikan
- Pencarian orang, hadiah, dan acara, dengan filter status dan urutan
- Foto hadiah, berbagi ide, dan link di catatan yang bisa dibuka
- Mode gelap, Undo setelah menghapus, dan konfirmasi sebelum membuang perubahan

## Demo notifikasi

1. Buka ikon lonceng di Home, lalu **Turn on notifications**.
2. Gulir ke **Try a reminder now** dan pilih **Time to buy** atau **Remind me again**. Notifikasi asli muncul dalam 5 detik.
3. Tahan notifikasinya (iOS) atau buka panel notifikasi (Android) untuk melihat tombol aksi.

Catatan:

- Web tidak mendukung notifikasi. Halaman Reminders tetap menampilkan jadwalnya.
- Expo Go Android 58.0.5 tertutup sendiri saat notifikasinya ditekan karena bug di Expo Go. Untuk demo menekan notifikasi di Android, pakai development build: `npx expo run:android`.

## Data dummy

| File | Isi |
| --- | --- |
| `src/data/gifts.json` | Hadiah contoh |
| `src/data/inspirations.json` | Ide untuk halaman Inspiration |
| `src/data/quotes.json` | Kutipan harian di Home |

Tanggal di `gifts.json` relatif terhadap hari pertama aplikasi dibuka. `"eventInDays": 6` berarti enam hari lagi, jadi demo selalu terlihat baru.

Perubahan di aplikasi disimpan dengan AsyncStorage. Untuk kembali ke data contoh: **Settings > Reset demo data**.

## Struktur

```
src/
  app/          layar dan navigasi (Expo Router)
  components/   form, gift, dan ui
  constants/    warna, font, pilihan status dan kategori
  data/         data dummy JSON
  hooks/        logika yang dipakai beberapa layar
  lib/          tanggal, rupiah, aturan pengingat, notifikasi, penyimpanan
  providers/    data hadiah, tema, notifikasi, toast, dialog
```

Aturan pengingat ada di `src/lib/reminders.ts`, terpisah dari tampilan.

## Cek kode

```bash
npm run typecheck
npm run lint
```

Ikon garis berasal dari [Lucide](https://lucide.dev) (lisensi ISC). Ilustrasi hadiah digambar khusus untuk aplikasi ini.
