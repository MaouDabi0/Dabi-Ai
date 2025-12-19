# Dabi-Ai Bot WA - Interactive AI


[![Star History Chart](https://api.star-history.com/svg?repos=MaouDabi0/Dabi-Ai/README&type=Date)](https://star-history.com/#MaouDabi0/Dabi-Ai/README&Date)

---

Bot Dabi-Ai adalah **bot WhatsApp interaktif berbasis AI** yang dirancang untuk memberikan pengalaman berinteraksi yang lebih cerdas dan responsif kepada pengguna.  
Bot ini mampu menjalankan berbagai **perintah (command)** dengan menggunakan perintah utama **`ai`**, sehingga setiap instruksi dari pengguna dapat diproses secara dinamis tanpa perlu mengetikkan banyak perintah manual.  

Setiap kali pengguna menggunakan perintah `ai`, bot akan membaca input tersebut dan secara otomatis mengeksekusi menu atau perintah yang sesuai. Sistem ini membuat interaksi terasa **natural**, seolah sedang berbicara langsung dengan asisten virtual.  

Berbeda dari kebanyakan bot lain, **script ini tidak menggunakan sistem plugin atau switch-case** untuk menangani perintah.  
Sebaliknya, Dabi-Ai menggunakan pendekatan **multi command** yang terstruktur melalui **multi const**, sehingga setiap perintah dideklarasikan dan dikelola secara ringkas namun efisien.  

Selain itu, script ini juga menerapkan **notasi eksponensial** dalam beberapa bagian logika — notasi ini merupakan cara penulisan angka dalam bentuk pangkat 10 (misalnya `1e3` berarti `1000`).  
Penggunaan notasi eksponensial membuat kode lebih ringkas, mudah dibaca, dan efisien saat menangani nilai besar atau perhitungan tertentu dalam bot.

| Nilai Boolean | Ekspresi | Alasan                                                                 |
|---------------|----------|------------------------------------------------------------------------|
| `true`        | `!0`     | Karena `0` bernilai `false`, negasinya `!0` menghasilkan `true`.       |
| `false`       | `!1`     | Karena `1` bernilai `true`, negasinya `!1` menghasilkan `false`.       |

Gaya penulisan ini memang tidak langsung mudah dipahami bagi yang belum terbiasa, namun jika diperhatikan dan dibaca dengan teliti, logikanya sangat jelas dan dapat dipahami.  
Pendekatan ini membantu menjaga kode tetap ringkas tanpa mengorbankan fungsionalitas.

Struktur menu dan sistemnya masih berbasis **base script**, sehingga sangat fleksibel untuk dikembangkan lebih lanjut. Kamu dapat menambahkan fitur baru, memperluas logika multi command, atau mengintegrasikan API eksternal dengan mudah tanpa harus membangun sistem plugin yang kompleks.

Bot ini cocok digunakan untuk:
- [x] Otomatisasi grup WhatsApp
- [x] Asisten pribadi berbasis AI
- [x] Sistem informasi interaktif 
- [x] Eksperimen pengembangan chatbot berbasis JavaScript
- [x] Pengembangan bot dengan gaya coding minimalis dan efisien

---

## Fitur Utama

> Dapat dikustomisasi dan diperluas sesuai script dasar*
>> Menjalankan perintah melalui **command `ai`**
>>> Menu interaktif berbasis WhatsApp
>>>> Support multiple users sekaligus

---

[![MaouDabi GitHub](https://github-readme-stats.vercel.app/api?username=MaouDabi0\&show_icons=true\&theme=default#gh-light-mode-only)](https://github.com/MaouDabi0/Dabi-Ai#responsive-card-theme#gh-light-mode-only)

<p align="center">
 <a href="https://www.instagram.com/maoudabi?igsh=YzljYTk1ODg3Zg==" target="_blank">
  <img src="https://img.shields.io/badge/Instagram-fe4164?style=for-the-badge&logo=instagram&logoColor=white" alt="maoudabi" />
 </a>
<a href="mailto:maoudabioffc@gmail.com" target="_blank">
  <img src="https://img.shields.io/badge/Gmail-0?style=for-the-badge&logo=Gmail&logoColor=%23EA4335&labelColor=rgb(255%2C%20255%2C%20255)&color=255"
  alt="Gmail" />
</a>
 <a href="https://www.tiktok.com/@maoudabi0?_t=ZS-8ujMCbLiDpg&_r=1" target="_blank">
  <img src="https://img.shields.io/badge/Tiktok-0?style=for-the-badge&logo=Tiktok&logoColor=FFFFFF&logoSize=3&color=010101" alt="maoudabi0" />
  </a>
</p>

---

# Tutorial Install Dabi-Ai

Salin atau ketik promt seperti yang ada di bawah ini di termux

1. Update Package

  ```bash
     pkg upgrade -y && pkg update -y
  ```

2. Install NodeJs & Git

  ```bash
     pkg install nodejs -y && pkg install git -y
  ```

3. Install ffmpeg & clone repo

  ```bash
     pkg install ffmpeg -y && git https://github.com/MaouDabi0/Dabi-Ai
  ```

---

1. Change Directory

   Setelah menyalin repo dari github<br>
   `git clone https://github.com...`,<br>
   langkah selanjutnya anda perlu melakukan input promt pada termux dengan mengetik/menyalin ini

   ```bash
   cd Dabi-Ai
   ```

   jika tampilan termux sudah seperti ini<br>
   `~/Dabi-Ai $`,<br> maka langkah selanjutnya adalah

2. Node Package Meneger

   yaitu penginstalan node package, dengan cara menginput promt pada termux dengan mengetik/menyalin ini

   ```bash
   npm install
   ```

   tunggu hingga process selesai, jika process selesai atau berhasil maka langkah berikutnya adalah

  <details>
    <summary>Tip</summary>
      Jika `npm install` tidak bisa maka gunakan
  </details><br>

3. Yarn Package Meneger

   gunakan yarn untuk menginstall **Package** di dalam `~/node_module` pada Script Bot WhatsApp dengan cara mengetik/menyalin ini

   ```bash
   yarn install
   ```

4. Bot Running

   langkah selanjutnya adalah memasukan promt atau perintah pada termux, dengan mengetik/menyalin ini

   ```bash
   npm start
   ```

5. Connection Save

   jalankan dan masukan nomor/akun whatsapp yang akan dijadikan Bot WhatsApp, jika code pairing sudah muncul, masukan code pairing tersebut ke Perangkat tertaut.<br>
   Dan selamat Bot berhasil di jalankan. 

---

<details>
  <summary>Tip</summary>
    Jika masih ada kendala pemasangan klik link yang ada di sini
</details><br>

<p align="center">
 <a href="https://acesse.one/MaouDabi0" target="_blank">
 <img src="https://img.shields.io/badge/WhatsApp-0?style=social&logo=whatsapp&logoColor=255&labelColor=255&color=255" alt="WhatsApp" />
 </a>
</p>